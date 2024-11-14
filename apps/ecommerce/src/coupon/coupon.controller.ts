import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CouponService } from './coupon.service';
import {
  CreateCouponsReq, FindAvailableCouponsReq, FindByItemReq, FindOneCouponReq,
  GetAmbassadorCodeReq, UpdateCouponsReq
} from '@app/common/dto/eCommerce';
import { protobufCouponService } from '@app/common/grpc-clients/eCommerce';

@Controller()
export class CouponController {
  constructor(private readonly couponService: CouponService) { }

  @GrpcMethod(protobufCouponService, 'FindOneCoupon')
  findOneCoupon(request: FindOneCouponReq) {
    return this.couponService.findOneCoupon(request);
  }

  @GrpcMethod(protobufCouponService, 'GetAmbassadorCode')
  getAmbassadorCode(request: GetAmbassadorCodeReq) {
    return this.couponService.getAmbassadorCode(request);
  }

  @GrpcMethod(protobufCouponService, 'FindByItem')
  findByItem(request: FindByItemReq) {
    return this.couponService.findByItem(request);
  }

  @GrpcMethod(protobufCouponService, 'FindAvailableCoupons')
  findAvailableCoupons(request: FindAvailableCouponsReq) {
    return this.couponService.findAvailableCoupons(request);
  }

  @GrpcMethod(protobufCouponService, 'CreateCoupon')
  createCoupon(request: CreateCouponsReq) {
    return this.couponService.createCoupon(request);
  }

  @GrpcMethod(protobufCouponService, 'UpdateCoupon')
  updateCoupon(request: UpdateCouponsReq) {
    return this.couponService.updateCoupon(request);
  }
}
