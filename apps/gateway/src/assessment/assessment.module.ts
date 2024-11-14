import { AssessmentClientModule } from '@app/common/grpc-clients/assessment/assessment-client.module';
import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { AuthCommonModule } from '@app/common/auth/auth.module';
import { AuthenticationGuard } from '@app/common/auth';

@Module({
  imports: [AssessmentClientModule, AuthCommonModule],
  controllers: [AssessmentController],
  providers: [AssessmentService, AuthenticationGuard],
})
export class AssessmentModule {}