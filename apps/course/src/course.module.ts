import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseModule,
  Course, CourseSchema, CourseRepository,
  User, UserSchema, UsersRepository,
  Subject, SubjectSchema, SubjectRepository,
  Setting, SettingSchema, SettingRepository,
  Location, LocationSchema, LocationRepository,
  FeedbackSchema,
  Feedback,
  FeedbackRepository,
  Favorite,
  FavoriteSchema,
  FavoriteRepository,
  PracticeSet,
  PracticeSetSchema,
  PracticeSetRepository,
  UserCourse,
  UserCourseSchema,
  UserCourseRepository,
  Classroom,
  ClassroomSchema,
  ClassroomRepository,
  UserEnrollment,
  UserEnrollmentSchema,
  UserEnrollmentRepository,
  CertificateSchema,
  Attempt,
  AttemptSchema,
  AttemptRepository,
  AttemptDetail,
  AttemptDetailSchema,
  AttemptDetailRepository,
  RedisModule,
  NotificationSchema,
  Notification,
  Attendance,
  AttendanceSchema,
  Settings
} from '@app/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { APP_FILTER } from '@nestjs/core';
import { GrpcServerExceptionFilter } from 'nestjs-grpc-exceptions';
import { instanceKeys } from '@app/common/config';
import { Certificate } from 'crypto';
import { CertificateRepository } from '@app/common/database/repositories/certificate.repository';
import { NotificationRepository } from '@app/common/database/repositories/notification.repository';
import { AttendanceRepository } from '@app/common/database/repositories/attendance.repository';

const courseEntity = { name: Course.name, schema: CourseSchema };
const userEntity = { name: User.name, schema: UserSchema };
const subjectEntity = { name: Subject.name, schema: SubjectSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };
const locationEntity = { name: Location.name, schema: LocationSchema };
const favoriteEntity = { name: Favorite.name, schema: FavoriteSchema };
const feedbackEnitiy = { name: Feedback.name, schema: FeedbackSchema };
const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const userCourseEntity = { name: UserCourse.name, schema: UserCourseSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const userEnrollmentEntity = { name: UserEnrollment.name, schema: UserEnrollmentSchema };
const certificateEntity = { name: Certificate.name, schema: CertificateSchema };
const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const attemptdetailsEntity = { name: AttemptDetail.name, schema: AttemptDetailSchema };
const notificationEntity = { name: Notification.name, schema: NotificationSchema };
const attendanceEntity = { name: Attendance.name, schema: AttendanceSchema };
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule, RedisModule,
    ...createDatabaseModules([courseEntity, userEntity, subjectEntity,
      settingEntity, locationEntity, favoriteEntity, feedbackEnitiy,
      practiceSetEntity, userCourseEntity, classroomEntity, userEnrollmentEntity, certificateEntity, attemptEntity, attemptdetailsEntity, notificationEntity, attendanceEntity], instanceKeys),

  ],
  controllers: [CourseController],
  providers: [
    Settings,
    CourseService, CourseRepository,
    UsersRepository, FeedbackRepository, FavoriteRepository,
    SubjectRepository, SettingRepository, LocationRepository,
    FavoriteRepository, FeedbackRepository, PracticeSetRepository,
    UserCourseRepository, ClassroomRepository, UserEnrollmentRepository,
    CertificateRepository, AttemptRepository, AttemptDetailRepository, NotificationRepository, AttendanceRepository,
    {
      provide: APP_FILTER,
      useClass: GrpcServerExceptionFilter,
    }
  ],
})
export class CourseModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}