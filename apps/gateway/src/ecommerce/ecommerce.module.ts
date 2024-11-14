import { Module } from '@nestjs/common';
import { EcommerceClientModule } from '@app/common/grpc-clients/eCommerce';
import { CouponModule } from './coupon/coupon.module';
import { PaymentModule } from './payment/payment.module';

@Module({
    imports: [EcommerceClientModule, CouponModule, PaymentModule],
    controllers: [],
    providers: [],
})
export class EcommerceModule { }
