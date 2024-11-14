import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  Attempt, AttemptRepository, AttemptSchema, Attendance, AttendanceRepository, WhiteboardModule,
  AttendanceSchema, Course, CourseRepository, CourseSchema, DatabaseModule, Discussion, DiscussionRepository, DiscussionSchema,
  File, FileRepository, FileSchema, Location, LocationRepository, LocationSchema, PracticeSet, PracticeSetRepository,
  PracticeSetSchema, Setting, SettingRepository, SettingSchema, Subject, SubjectRepository, SubjectSchema,
  Topic, TopicRepository, TopicSchema, User, UserSchema, UsersRepository, WhiteboardLog, WhiteboardLogRepository, WhiteboardLogSchema,
  wbTeacherInfo, wbTeacherInfoSchema, wbTeacherInfoRepository, UserLog, UserLogSchema, UserLogRepository,
  AttemptDetail, AttemptDetailSchema, AttemptDetailRepository, SocketModule, PushService,
  NotificationTemplate, NotificationTemplateSchema, NotificationTemplateRepository, Notification, NotificationSchema,
  NotificationRepository, Device, DeviceSchema, DeviceRepository, TestSeries, TestSeriesSchema, TestSeriesRepository,
  SocketClientModule
} from '@app/common';
import { Classroom, ClassroomSchema, ClassroomRepository } from '@app/common';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';
import { instanceKeys } from '@app/common/config';
import { RedisModule } from '@app/common/modules/redis.modules';
import { StudentBus } from '@app/common/bus';
import { HttpModule } from '@nestjs/axios';
import { MessageCenter } from '@app/common/components/messageCenter';

const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };
const userEntity = { name: User.name, schema: UserSchema };
const discussionEntity = { name: Discussion.name, schema: DiscussionSchema };
const locationEntity = { name: Location.name, schema: LocationSchema };
const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const attendanceEntity = { name: Attendance.name, schema: AttendanceSchema };
const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const subjectEntity = { name: Subject.name, schema: SubjectSchema };
const topicEntity = { name: Topic.name, schema: TopicSchema };
const fileEntity = { name: File.name, schema: FileSchema };
const courseEntity = { name: Course.name, schema: CourseSchema };
const whiteboardLogEntity = { name: WhiteboardLog.name, schema: WhiteboardLogSchema };
const wbTeacherInfoEntity = { name: wbTeacherInfo.name, schema: wbTeacherInfoSchema };
const userLogEntity = { name: UserLog.name, schema: UserLogSchema };
const attemptDetailEntity = { name: AttemptDetail.name, schema: AttemptDetailSchema };
const notificationTemplateEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema };
const notificationEntity = { name: Notification.name, schema: NotificationSchema };
const deviceEntity = { name: Device.name, schema: DeviceSchema };
const testSeriesEntity = { name: TestSeries.name, schema: TestSeriesSchema };

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SocketClientModule,
    DatabaseModule,
    ...createDatabaseModules([
      classroomEntity, settingEntity, userEntity, discussionEntity, locationEntity, attemptEntity,
      attendanceEntity, practiceSetEntity, subjectEntity, topicEntity, fileEntity, courseEntity,
      whiteboardLogEntity, wbTeacherInfoEntity, userLogEntity, attemptDetailEntity, notificationTemplateEntity,
      notificationEntity, deviceEntity, testSeriesEntity
    ], instanceKeys),
    RedisModule, WhiteboardModule, HttpModule, 
  ],
  controllers: [ClassroomController],
  providers: [
    StudentBus, ClassroomService, ClassroomRepository, SettingRepository, UsersRepository,
    DiscussionRepository, LocationRepository, AttemptRepository, AttendanceRepository, TestSeriesRepository,
    PracticeSetRepository, SubjectRepository, TopicRepository, FileRepository, CourseRepository,
    WhiteboardLogRepository, wbTeacherInfoRepository, UserLogRepository, AttemptDetailRepository,
    PushService, MessageCenter, NotificationTemplateRepository, NotificationRepository, DeviceRepository
  ],
})
export class ClassroomModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}