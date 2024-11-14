import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  Attempt, AttemptDetail, AttemptDetailRepository, AttemptDetailSchema, AttemptRepository, AttemptSchema, Attendance, AttendanceRepository, AttendanceSchema, AwsS3Module, Classroom, ClassroomRepository, ClassroomSchema, Competencies, CompetenciesRepository, CompetenciesSchema, Course, CourseRepository, CourseSchema, DatabaseModule, Notification, NotificationRepository, NotificationSchema, NotificationTemplate, NotificationTemplateRepository, NotificationTemplateSchema, PracticeSet, PracticeSetRepository, PracticeSetSchema, Question, QuestionRepository, QuestionSchema, RedisCaching, RedisClient, Setting, SettingRepository, SettingSchema, SocketClientModule, Subject, SubjectRepository, SubjectSchema, TestSeries, TestSeriesRepository, TestSeriesSchema, Unit, UnitRepository, UnitSchema, User, UserCourse, UserCourseRepository, UserCourseSchema, UserSchema, UsersRepository
} from '@app/common';
import { instanceKeys } from '@app/common/config';
import { LearningTestController } from './learningTest.controller';
import { LearningTestService } from './learningTest.service';
import { AttemptProcessor } from '@app/common/components/AttemptProcessor';
import { MessageCenter } from '@app/common/components/messageCenter';

const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const questionEntity = { name: Question.name, schema: QuestionSchema };
const attemptDetailEntity = { name: AttemptDetail.name, schema: AttemptDetailSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };
const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const subjectEntity = { name: Subject.name, schema: SubjectSchema };
const unitEntity = { name: Unit.name, schema: UnitSchema };
const attendanceEntity = { name: Attendance.name, schema: AttendanceSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const userEntity = { name: User.name, schema: UserSchema };
const competenciesEntity = { name: Competencies.name, schema: CompetenciesSchema };
const userCourseEntity = { name: UserCourse.name, schema: UserCourseSchema };
const courseEntity = { name: Course.name, schema: CourseSchema };
const testSeriesEntity = { name: TestSeries.name, schema: TestSeriesSchema };
const notificationEntity = { name: Notification.name, schema: NotificationSchema };
const notificationTemplateEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema };


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AwsS3Module,
    SocketClientModule,
    ...createDatabaseModules([practiceSetEntity,
      questionEntity,
      attemptDetailEntity,
      settingEntity,
      attemptEntity,
      subjectEntity,
      unitEntity,
      attendanceEntity,
      classroomEntity,
      userEntity,
      competenciesEntity,
      userCourseEntity,
      courseEntity,
      testSeriesEntity,
      notificationEntity,
      notificationTemplateEntity], instanceKeys),
  ],
  controllers: [LearningTestController],
  providers: [LearningTestService,
    QuestionRepository,
    AttemptDetailRepository,
    AttemptRepository,
    PracticeSetRepository,
    SubjectRepository,
    UnitRepository,
    SettingRepository,
    AttendanceRepository,
    ClassroomRepository,
    UsersRepository,
    CompetenciesRepository,
    UserCourseRepository,
    CourseRepository,
    TestSeriesRepository,
    NotificationRepository,
    NotificationTemplateRepository,
    AttemptProcessor,
    MessageCenter,
    RedisCaching,
    RedisClient],
})
export class LearningTestModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
