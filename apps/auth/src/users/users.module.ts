import {
  DatabaseModule,
  LocationRepository,
  SubjectRepository,
  User,
  UserSchema,
  UsersRepository,
  Subject,
  SubjectSchema,
  LocationSchema,
  Location,
  SettingSchema,
  SettingRepository,
  Classroom,
  ClassroomSchema,
  ClassroomRepository,
  Setting,
  Attempt,
  AttemptSchema,
  AttemptRepository,
  UserLog,
  UserLogSchema,
  UserLogRepository,
  EventsSchema,
  Events,
  EventsRepository,
  SuperCoins,
  SuperCoinsRepository,
  SuperCoinsSchema,
  UserSuperCoins,
  UserSuperCoinsSchema,
  UserSuperCoinsRepository,
  Coupon,
  CouponSchema,
  CouponRepository,
  Competencies,
  CompetenciesRepository,
  CompetenciesSchema,
  PracticeSet,
  PracticeSetSchema,
  PracticeSetRepository,
  AttemptDetail,
  AttemptDetailRepository,
  NotificationTemplate,
  NotificationTemplateSchema,
  NotificationTemplateRepository,
  ReportedUser,
  ReportedUserSchema,
  ReportedUserRepository,
  MarketingUtm,
  MarketingUtmSchema,
  MarketingUtmRepository,
  NotificationSchema,
  NotificationRepository,
  Notification,
  AttendanceRepository,
  AttendanceSchema,
  UserCourseRepository,
  UserCourseSchema,
  CourseRepository,
  CourseSchema,
  Attendance,
  UserCourse,
  Course,
  WhiteboardLogRepository,
  WhiteboardLog,
  WhiteboardLogSchema,
  ChatRoomRepository,
  ChatRoom,
  ChatRoomSchema,
  ChatUser,
  ChatUserSchema,
  ChatUserRepository,
  EventBus,
  SocketClientModule,
  WhiteboardModule
} from '@app/common';
import { NotifyClientModule } from '@app/common/grpc-clients/notify';
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { APP_FILTER } from '@nestjs/core';
import { GrpcServerExceptionFilter } from 'nestjs-grpc-exceptions';
import { instanceKeys } from '@app/common/config';
import { AuthModule } from '../auth.module';
import { RedisModule } from '@app/common/modules/redis.modules';
import { MessageCenter } from '@app/common/components/messageCenter';
import { HttpModule } from '@nestjs/axios';
import { S3Service } from '@app/common/components/aws/s3.service';

// all schema here
const userEntity = { name: User.name, schema: UserSchema };
const locationEntity = { name: Location.name, schema: LocationSchema };
const subjectEntity = { name: Subject.name, schema: SubjectSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };
const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const userLogEntity = { name: UserLog.name, schema: UserLogSchema };
const eventsEntity = { name: Events.name, schema: EventsSchema };
const supercoinsEntity = { name: SuperCoins.name, schema: SuperCoinsSchema };
const userSuperCoinEntity = { name: UserSuperCoins.name, schema: UserSuperCoinsSchema };
const couponEntity = { name: Coupon.name, schema: CouponSchema };
const competenciesEntity = { name: Competencies.name, schema: CompetenciesSchema };
const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const attemptDetailEntity = { name: AttemptDetail.name, schema: AttemptSchema };
const notificationTemplateEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema };
const reportedUserEntity = { name: ReportedUser.name, schema: ReportedUserSchema };
const marketingUtmEntity = { name: MarketingUtm.name, schema: MarketingUtmSchema };
const notificationEntity = { name: Notification.name, schema: NotificationSchema };
const attendanceEntity = { name: Attendance.name, schema: AttendanceSchema };
const userCourseEntity = { name: UserCourse.name, schema: UserCourseSchema };
const courseEntity = { name: Course.name, schema: CourseSchema };
const whiteboardLogEntity = { name: WhiteboardLog.name, schema: WhiteboardLogSchema };
const chatRoomEntity = { name: ChatRoom.name, schema: ChatRoomSchema };
const chatUserEntity = { name: ChatUser.name, schema: ChatUserSchema };

@Module({
  imports: [
    DatabaseModule,
    HttpModule,
    forwardRef(() => AuthModule),
    ...createDatabaseModules([userEntity,
      locationEntity,
      subjectEntity,
      classroomEntity,
      settingEntity,
      attemptEntity,
      userLogEntity,
      eventsEntity,
      supercoinsEntity,
      userSuperCoinEntity,
      couponEntity,
      competenciesEntity,
      practiceSetEntity,
      attemptDetailEntity,
      notificationTemplateEntity,
      reportedUserEntity,
      marketingUtmEntity,
      notificationEntity,
      attendanceEntity,
      userCourseEntity,
      courseEntity,
      whiteboardLogEntity,
      chatRoomEntity,
      chatUserEntity,
    ], instanceKeys),
    NotifyClientModule,
    RedisModule,
    SocketClientModule, WhiteboardModule
  ],
  controllers: [UsersController],
  providers: [UsersService,
    UsersRepository,
    LocationRepository,
    SubjectRepository,
    ClassroomRepository,
    SettingRepository,
    AttemptRepository,
    UserLogRepository,
    EventsRepository,
    SuperCoinsRepository,
    UserSuperCoinsRepository,
    CouponRepository,
    CompetenciesRepository,
    PracticeSetRepository,
    AttemptDetailRepository,
    NotificationTemplateRepository,
    ReportedUserRepository,
    MarketingUtmRepository,
    NotificationRepository,
    AttendanceRepository,
    UserCourseRepository,
    CourseRepository,
    WhiteboardLogRepository,
    ChatRoomRepository,
    ChatUserRepository,
    MessageCenter,
    EventBus,
    S3Service,
    {
      provide: APP_FILTER,
      useClass: GrpcServerExceptionFilter,
    }
  ],
  exports: [UsersService],
})
export class UsersModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
