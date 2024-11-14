import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { EcommerceClientModule } from '@app/common/grpc-clients/eCommerce';
import { AuthenticationGuard } from '@app/common/auth';
import { AuthCommonModule } from '@app/common/auth/auth.module';

@Module({
    imports: [EcommerceClientModule, AuthCommonModule],
    controllers: [CouponController],
    providers: [CouponService, AuthenticationGuard],
})
export class CouponModule { }
