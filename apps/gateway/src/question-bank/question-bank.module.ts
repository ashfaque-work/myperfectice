import { QuestionBankClientModule } from '@app/common/grpc-clients/question-bank';
import { Module } from '@nestjs/common';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';
import { AdaptiveTestController } from './adaptiveTest/adaptiveTest.controller';
import { AdaptiveTestService } from './adaptiveTest/adaptiveTest.service';
import { AnsyncController } from './ansync/ansync.controller';
import { AnsyncService } from './ansync/ansync.service';
import { CertificateController } from './certificates/certificate.controller';
import { CertificateService } from './certificates/certificate.service';
import { EvaluationController } from './evaluation/evaluation.controller';
import { EvaluationService } from './evaluation/evaluation.service';
import { FavoriteController } from './favorite/favorite.controller';
import { FavoriteService } from './favorite/favorite.service';
import { FeedbackService } from './feedback/feedback.service';
import { FeedbackController } from './feedback/feedback.controller';
import { LearningTestController } from './learningTest/learningTest.controller';
import { LearningTestService } from './learningTest/learningTest.service';
import { AuthCommonModule } from '@app/common/auth/auth.module';
import { AuthenticationGuard } from '@app/common/auth';
import { SessionController } from './manage/session/session.controller';
import { SessionService } from './manage/session/session.service';
import { MappingController } from './mapping/mapping.controller';
import { MappingService } from './mapping/mapping.service';
import { TestSeriesController } from './testSeries/testSeries.controller';
import { TestSeriesService } from './testSeries/testSeries.service';


@Module({
  imports: [QuestionBankClientModule, AuthCommonModule],
  controllers: [QuestionBankController, AdaptiveTestController, AnsyncController, CertificateController, EvaluationController, FavoriteController, FeedbackController, LearningTestController, SessionController, MappingController, TestSeriesController],
  providers: [AuthenticationGuard, QuestionBankService, AdaptiveTestService, AnsyncService, CertificateService, EvaluationService, FavoriteService, FeedbackService, LearningTestService, SessionService, MappingService, TestSeriesService],
})
export class QuestionBankModule {}