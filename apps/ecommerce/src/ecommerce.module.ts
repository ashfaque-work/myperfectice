import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/common';
import { CouponModule } from './coupon/coupon.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule, CouponModule, PaymentModule],
  controllers: [],
  providers: [],
})
export class EcommerceModule { }
