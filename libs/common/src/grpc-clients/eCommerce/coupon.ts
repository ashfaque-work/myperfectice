import {
    Coupon, CreateCouponsReq, FindAvailableCouponsReq, FindAvailableCouponsRes, FindByItemReq,
    FindByItemRes, FindOneCouponReq, GetAmbassadorCodeReq, UpdateCouponsReq
} from '@app/common/dto/eCommerce';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufEcommercePackage = 'ecommerce';
export const protobufCouponService = 'EcommerceGrpcService';

export interface CouponGrpcInterface {
    FindOneCoupon(request: FindOneCouponReq): Promise<Coupon>;
    GetAmbassadorCode(request: GetAmbassadorCodeReq): Promise<Coupon>;
    FindByItem(request: FindByItemReq): Promise<FindByItemRes>;
    FindAvailableCoupons(request: FindAvailableCouponsReq): Promise<FindAvailableCouponsRes>;
    CreateCoupon(request: CreateCouponsReq): Promise<Coupon>;
    UpdateCoupon(request: UpdateCouponsReq): Promise<Coupon>;
}

@Injectable()
export class CouponGrpcServiceClientImpl implements CouponGrpcInterface {
    private couponGrpcServiceClient: CouponGrpcInterface;
    private readonly logger = new Logger(CouponGrpcServiceClientImpl.name);

    constructor(
        @Inject('eCommerceGrpcService') private couponGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.couponGrpcServiceClient =
            this.couponGrpcClient.getService<CouponGrpcInterface>(
                protobufCouponService,
            );
        this.logger.debug('gRPC client initialized.');
    }

    async FindOneCoupon(request: FindOneCouponReq): Promise<Coupon> {
        return await this.couponGrpcServiceClient.FindOneCoupon(request);
    }

    async GetAmbassadorCode(request: GetAmbassadorCodeReq): Promise<Coupon> {
        return await this.couponGrpcServiceClient.GetAmbassadorCode(request);
    }

    async FindByItem(request: FindByItemReq): Promise<FindByItemRes> {
        return await this.couponGrpcServiceClient.FindByItem(request);
    }

    async FindAvailableCoupons(request: FindAvailableCouponsReq): Promise<FindAvailableCouponsRes> {
        return await this.couponGrpcServiceClient.FindAvailableCoupons(request);
    }

    async CreateCoupon(request: CreateCouponsReq): Promise<Coupon> {
        return await this.couponGrpcServiceClient.CreateCoupon(request);
    }

    async UpdateCoupon(request: UpdateCouponsReq): Promise<Coupon> {
        return await this.couponGrpcServiceClient.UpdateCoupon(request);
    }
}
