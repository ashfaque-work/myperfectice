import { Injectable, NotFoundException } from '@nestjs/common';
import { GrpcInternalException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { Types } from 'mongoose';
import {
  Coupon, CreateCouponsReq, FindAvailableCouponsReq, FindAvailableCouponsRes, FindByItemReq,
  FindByItemRes, FindOneCouponReq, GetAmbassadorCodeReq, UpdateCouponsReq
} from '@app/common/dto/eCommerce';
import { CouponRepository, PaymentRepository, RedisCaching } from '@app/common';


@Injectable()
export class CouponService {
  constructor(
    private readonly redisCache: RedisCaching,
    private readonly couponRepository: CouponRepository,
    private readonly paymentRepository: PaymentRepository,
  ) { }

  async findOneCoupon(request: FindOneCouponReq): Promise<Coupon> {
    try {
      const { code, user, instancekey } = request;
      const filter = [
        { code, status: true },
        {
          $or: [
            { endDate: { $gte: new Date() } },
            { endDate: null }
          ]
        }
      ];

      this.couponRepository.setInstanceKey(instancekey);
      const coupon = await this.couponRepository.findOne({ $and: filter });
      if (!coupon) {
        return { statusCode: 404 };
      }

      if (coupon.isReferral && coupon.code === user._id) {
        return { statusCode: 400 };
      }
      const settings = await this.redisCache.getSetting(request);
      if (!settings.features.ambassadorProgram && coupon.isReferral) {
        return { statusCode: 400 };
      }

      return coupon;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getAmbassadorCode(request: GetAmbassadorCodeReq): Promise<Coupon> {
    try {
      const { user, instancekey } = request;
      const filter = { code: user.userId, isReferral: true };

      this.couponRepository.setInstanceKey(instancekey);
      const coupon = await this.couponRepository.findOne(filter);
      if (!coupon) {
        throw new NotFoundException()
      }

      return coupon;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException('Not Found')
      }
      throw new GrpcInternalException(error);
    }
  }

  async findByItem(request: FindByItemReq): Promise<FindByItemRes> {
    try {
      const { _id, instancekey } = request;
      const filter = {
        itemIds: Types.ObjectId.isValid(_id) ? new Types.ObjectId(_id) : _id,
        status: true,
        endDate: { $gt: new Date() }
      };

      const couponList = await this.couponRepository.find(filter);
      if (!couponList.length) {
        throw new NotFoundException()
      }

      this.paymentRepository.setInstanceKey(instancekey);
      const results: FindByItemRes[] = await Promise.all(couponList.map(async (coupon: FindByItemRes) => {
        const usedCount = await this.paymentRepository.countDocuments({
          couponIds: new Types.ObjectId(coupon._id)
        });
        return { ...coupon, totalUsed: usedCount };
      }));

      return { couponList: results };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException('Not Found')
      }
      throw new GrpcInternalException(error);
    }
  }

  async findAvailableCoupons(request: FindAvailableCouponsReq): Promise<FindAvailableCouponsRes> {
    try {
      const { query, user, instancekey } = request;

      let skip = Number(query.skip || 0)
      let limit = Number(query.limit || 10)

      const orQuery: any = [{ isReferral: true, code: { $ne: user.userId } }];
      if (query.items) {
        const itemArray = query.items.split(',').map(item => Types.ObjectId.isValid(item) ? new Types.ObjectId(item) : item);
        orQuery.push({
          itemIds: { $elemMatch: { $in: itemArray } }
        });
      }

      const filter = {
        status: true,
        showMe: true,
        $or: orQuery,
        $and: [{ $or: [{ endDate: { $gt: new Date() } }, { endDate: null }] }]
      };

      this.couponRepository.setInstanceKey(instancekey);
      const couponList = await this.couponRepository.find(
        filter, null,
        { limit: limit, skip: skip, sort: { isReferral: 1, updatedAt: -1 } },
      )

      return { couponList: couponList };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async createCoupon(request: CreateCouponsReq): Promise<Coupon> {
    try {
      const { body, user, instancekey } = request;

      this.couponRepository.setInstanceKey(instancekey);
      const existingCoupon = await this.couponRepository.findOne({ code: body.code });
      if (existingCoupon) {
        return {
          statusCode: 204,
          error: 'Warning, a coupon with this code already exists. Please enter another code.',
        };
      }
      const newCoupon = { ...body, lastModifiedBy: new Types.ObjectId(user._id) };
      const createdCoupon = await this.couponRepository.create(newCoupon);
      if (!createdCoupon) {
        return { statusCode: 422, error: 'Failed to create Coupon.' };
      }

      return { statusCode: 200, ...createdCoupon };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async updateCoupon(request: UpdateCouponsReq): Promise<Coupon> {
    try {
      const { _id, body, user, instancekey } = request;

      this.couponRepository.setInstanceKey(instancekey);
      if (user.roles.includes('student')) {
        const studentCoupon = await this.couponRepository.findById(_id);
        if (!studentCoupon) {
          return { statusCode: 404, error: 'Coupon not found' };
        }
        if (!studentCoupon.isReferral || studentCoupon.code !== user.userId) {
          return { statusCode: 400, error: 'Unauthorized to update this coupon' };
        }
      }

      const updatedCoupon = await this.couponRepository.findByIdAndUpdate(
        _id, { ...body, lastModifiedBy: new Types.ObjectId(user._id) }, { new: true, lean: true }
      );

      if (!updatedCoupon) {
        return { statusCode: 403, error: 'Coupon not updated' };
      }

      return { statusCode: 200, ...updatedCoupon };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }
}
