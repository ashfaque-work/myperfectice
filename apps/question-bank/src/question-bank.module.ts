import { Module } from '@nestjs/common';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';
import { ConfigModule } from '@nestjs/config';
import { Attempt, AttemptDetail, AttemptDetailRepository, AttemptDetailSchema, AttemptRepository, AttemptSchema, AwsS3Module, Classroom, ClassroomRepository, ClassroomSchema, DatabaseModule, ExamSchedule, ExamScheduleRepository, ExamScheduleSchema, PracticeSet, PracticeSetRepository, PracticeSetSchema, Question, QuestionFeedback, QuestionFeedbackSchema, QuestionRepository, QuestionSchema, QuestionTag, QuestionTagRepository, QuestionTagSchema, RedisModule, Subject, SubjectRepository, SubjectSchema, TestSeries, TestSeriesRepository, TestSeriesSchema, Topic, TopicRepository, TopicSchema, Unit, UnitRepository, UnitSchema, User, UserSchema, UsersRepository } from '@app/common';
import { instanceKeys } from '@app/common/config';
import { QuestionBus } from '@app/common/bus/question.bus';
import { EventBus } from '@app/common/components/eventBus';
import { AdaptiveTestModule } from './adaptiveTest/adaptiveTest.module';
import { AnsyncModule } from './ansync/ansync.module';
import { CertificateModule } from './certificates/certificate.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { FavoriteModule } from './favorite/favorite.module';
import { FeedbackModule } from './feedback/feedback.module';
import { LearningTestModule } from './learningTest/learningTest.module';
import { SessionModule } from './manage/session/session.module';
import { MappingModule } from './mapping/mapping.module';
import { TestSeriesModule } from './testSeries/testSeries.module';

const userEntity = { name: User.name, schema: UserSchema };
const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const questionEntity = { name: Question.name, schema: QuestionSchema };
const attemptDetail = { name: AttemptDetail.name, schema: AttemptDetailSchema };
const questionTagEntity = { name: QuestionTag.name, schema: QuestionTagSchema };
const subjectEntity = { name: Subject.name, schema: SubjectSchema };
const unitEntity = { name: Unit.name, schema: UnitSchema };
const topicEntity = { name: Topic.name, schema: TopicSchema };
const testSeriesEntity = { name: TestSeries.name, schema: TestSeriesSchema };
const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const examScheduleEntity = { name: ExamSchedule.name, schema: ExamScheduleSchema };

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ...createDatabaseModules([userEntity,
      questionEntity,
      practiceSetEntity,
      attemptDetail,
      questionTagEntity,
      subjectEntity,
      unitEntity,
      topicEntity,
      testSeriesEntity,
      classroomEntity,
      attemptEntity,
      examScheduleEntity], instanceKeys),
    RedisModule,
    AdaptiveTestModule,
    AnsyncModule,
    CertificateModule,
    EvaluationModule,
    FavoriteModule,
    FeedbackModule,
    LearningTestModule,
    SessionModule,
    MappingModule,
    TestSeriesModule,
    AwsS3Module,
  ],
  controllers: [QuestionBankController],
  providers: [QuestionBankService,
    UsersRepository,
    QuestionRepository,
    PracticeSetRepository,
    AttemptDetailRepository,
    QuestionTagRepository,
    SubjectRepository,
    UnitRepository,
    TopicRepository,
    ClassroomRepository,
    QuestionBus,
    EventBus,
    TestSeriesRepository,
    ExamScheduleRepository,
    AttemptRepository],
})
export class QuestionBankModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}