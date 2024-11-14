import {
    Coupon, CreateCouponsReq, FindAvailableCouponsReq, FindAvailableCouponsRes, FindByItemReq,
    FindByItemRes, FindOneCouponReq, GetAmbassadorCodeReq, UpdateCouponsReq
} from '@app/common/dto/eCommerce';
import { CouponGrpcServiceClientImpl } from '@app/common/grpc-clients/eCommerce/coupon';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CouponService {
    constructor(private couponGrpcServiceClientImpl: CouponGrpcServiceClientImpl) { }

    async findOneCoupon(request: FindOneCouponReq): Promise<Coupon> {
        return await this.couponGrpcServiceClientImpl.FindOneCoupon(request);
    }

    async getAmbassadorCode(request: GetAmbassadorCodeReq): Promise<Coupon> {
        return await this.couponGrpcServiceClientImpl.GetAmbassadorCode(request);
    }

    async findByItem(request: FindByItemReq): Promise<FindByItemRes> {
        return await this.couponGrpcServiceClientImpl.FindByItem(request);
    }

    async findAvailableCoupons(request: FindAvailableCouponsReq): Promise<FindAvailableCouponsRes> {
        return await this.couponGrpcServiceClientImpl.FindAvailableCoupons(request);
    }

    async createCoupon(request: CreateCouponsReq): Promise<Coupon> {
        return await this.couponGrpcServiceClientImpl.CreateCoupon(request);
    }

    async updateCoupon(request: UpdateCouponsReq): Promise<Coupon> {
        return await this.couponGrpcServiceClientImpl.UpdateCoupon(request);
    }

}
