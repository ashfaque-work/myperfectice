import { Module } from '@nestjs/common';
import { NotifyClientModule } from '@app/common/grpc-clients/notify';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';
import { AuthCommonModule } from '@app/common/auth/auth.module';
import { AuthenticationGuard } from '@app/common/auth';

@Module({
    imports: [NotifyClientModule, AuthCommonModule],
    controllers: [NotifyController],
    providers: [NotifyService, AuthenticationGuard],
})
export class NotifyModule { }
