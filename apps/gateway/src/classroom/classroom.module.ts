import { Module } from '@nestjs/common';
import { ClassroomClientModule } from '@app/common/grpc-clients/classroom';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';
import { AuthCommonModule } from '@app/common/auth/auth.module';
import { AuthenticationGuard } from '@app/common/auth';

@Module({
    imports: [ClassroomClientModule, AuthCommonModule],
    controllers: [ClassroomController],
    providers: [ClassroomService, AuthenticationGuard],
})
export class ClassroomModule { }
