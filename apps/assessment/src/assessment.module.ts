import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { DatabaseModule, Location, LocationRepository, LocationSchema, User, UserSchema, UsersRepository, PracticeSet, PracticeSetSchema, PracticeSetRepository, UnitSchema, Unit, Classroom, ClassroomSchema, SubjectSchema, Subject, UnitRepository, ClassroomRepository, SubjectRepository, RedisCaching, Setting, SettingSchema, SettingRepository, RedisClient, UserLogRepository, UserLog, UserLogSchema, TopicSchema, Topic, TopicRepository, Question, QuestionSchema, QuestionRepository, AttemptSchema, Attempt, AttemptRepository, EventBus, BitlyService, Attendance, AttendanceSchema, QuestionFeedbackRepository, QuestionFeedback, QuestionFeedbackSchema, FeedbackRepository, FeedbackSchema, Feedback, UserEnrollmentRepository, FavoriteRepository, UserEnrollment, UserEnrollmentSchema, FavoriteSchema, Favorite, Settings, AttemptDetailRepository, AttemptDetailSchema, AttemptDetail, TestSeries, TestSeriesSchema, TestSeriesRepository, CourseRepository, Course, CourseSchema, NotificationRepository, Notification, NotificationSchema, NotificationTemplateRepository, NotificationTemplate, NotificationTemplateSchema, PsychoResultRepository, PsychoResult, PsychoResultSchema, GameAttempt, GameAttemptSchema, GameAttemptRepository, QuestionTagRepository, QuestionTag, QuestionTagSchema, PushService, DeviceRepository, Device, DeviceSchema, AwsS3Module, SocketClientModule, CompetenciesRepository, Competencies, CompetenciesSchema, UserCourseRepository, UserCourse, UserCourseSchema } from '@app/common';
import { APP_FILTER } from '@nestjs/core';
import { GrpcServerExceptionFilter } from 'nestjs-grpc-exceptions';
import { instanceKeys } from '@app/common/config';
import { AttendanceRepository } from '@app/common/database/repositories/attendance.repository';
import { MessageCenter } from '@app/common/components/messageCenter';
import { QuestionBus } from '@app/common/bus';
import { HttpModule } from '@nestjs/axios';
import { PracticeSetExcelService } from './practiceSetExcelService';
import { AttemptProcessor } from '@app/common/components/AttemptProcessor';

const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const userEntity = { name: User.name, schema: UserSchema };
const locationEntity = { name: Location.name, schema: LocationSchema };
const unitEntity = { name: Unit.name, schema: UnitSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const subjectEntity = { name: Subject.name, schema: SubjectSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };
const userLogEntity = { name: UserLog.name, schema: UserLogSchema };
const topicEntity = { name: Topic.name, schema: TopicSchema };
const questionEntity = { name: Question.name, schema: QuestionSchema };
const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const attemptDetailEntity = { name: AttemptDetail.name, schema: AttemptDetailSchema };
const attendanceEntity = { name: Attendance.name, schema: AttendanceSchema };
const questionFeedbackEntity = { name: QuestionFeedback.name, schema: QuestionFeedbackSchema };
const feedbackEntity = { name: Feedback.name, schema: FeedbackSchema };
const userEnrollmentEntity = { name: UserEnrollment.name, schema: UserEnrollmentSchema };
const favoriteEntity = { name: Favorite.name, schema: FavoriteSchema };
const testSeriesEntity = { name: TestSeries.name, schema: TestSeriesSchema };
const courseEntity = { name: Course.name, schema: CourseSchema };
const notificationEntity = { name: Notification.name, schema: NotificationSchema };
const notificationTemplateEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema };
const psychoResultEntity = { name: PsychoResult.name, schema: PsychoResultSchema };
const gameAttemptEntity = { name: GameAttempt.name, schema: GameAttemptSchema };
const questionTagEntity = { name: QuestionTag.name, schema: QuestionTagSchema };
const deviceEntity = { name: Device.name, schema: DeviceSchema };
const competenciesEntity = { name: Competencies.name, schema: CompetenciesSchema };
const userCourseEntity = { name: UserCourse.name, schema: UserCourseSchema };

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ...createDatabaseModules([practiceSetEntity,
      userEntity,
      unitEntity,
      classroomEntity,
      subjectEntity, 
      settingEntity,
      userLogEntity,
      topicEntity,
      questionEntity,
      attemptEntity,
      attemptDetailEntity,
      attendanceEntity,
      questionFeedbackEntity,
      feedbackEntity,
      userEnrollmentEntity,
      favoriteEntity,
      locationEntity,
      testSeriesEntity,
      courseEntity,
      notificationEntity,
      notificationTemplateEntity,
      psychoResultEntity,
      gameAttemptEntity,
      questionTagEntity,
      deviceEntity,
      competenciesEntity,
      userCourseEntity], instanceKeys),
    AwsS3Module, HttpModule, SocketClientModule
  ],
  controllers: [AssessmentController],
  providers: [
    AssessmentService, 
    PracticeSetExcelService,
    PracticeSetRepository,
    UsersRepository, 
    LocationRepository,
    UnitRepository,
    ClassroomRepository,
    SubjectRepository,
    SettingRepository,
    UserLogRepository,
    TopicRepository,
    QuestionRepository,
    AttemptRepository,
    AttemptDetailRepository,
    AttendanceRepository,
    QuestionFeedbackRepository,
    FeedbackRepository,
    UserEnrollmentRepository,
    FavoriteRepository,
    TestSeriesRepository,
    CourseRepository,
    NotificationRepository,
    NotificationTemplateRepository,
    PsychoResultRepository,
    GameAttemptRepository,
    QuestionTagRepository,
    DeviceRepository,
    PushService,
    QuestionBus,
    MessageCenter,
    EventBus,
    Settings,
    BitlyService,
    RedisCaching,
    RedisClient,
    AttemptProcessor,
    CompetenciesRepository,
    UserCourseRepository,
    {
    provide: APP_FILTER,
    useClass: GrpcServerExceptionFilter,
  }],
})
export class AssessmentModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
