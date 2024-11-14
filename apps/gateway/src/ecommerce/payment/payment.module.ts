import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { EcommerceClientModule } from '@app/common/grpc-clients/eCommerce';
import { AuthenticationGuard } from '@app/common/auth';
import { AuthCommonModule } from '@app/common/auth/auth.module';

@Module({
    imports: [EcommerceClientModule, AuthCommonModule],
    controllers: [PaymentController],
    providers: [PaymentService, AuthenticationGuard],
})
export class PaymentModule { }
