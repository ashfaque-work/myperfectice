import { Module } from '@nestjs/common';
import { CourseClientModule } from '@app/common/grpc-clients/course';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { AuthCommonModule } from '@app/common/auth/auth.module';
import { AuthenticationGuard } from '@app/common/auth';

@Module({
    imports: [CourseClientModule, AuthCommonModule],
    controllers: [CourseController],
    providers: [CourseService, AuthenticationGuard],
})
export class CourseModule { }
