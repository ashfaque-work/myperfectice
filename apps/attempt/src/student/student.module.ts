import {
    Attempt, AttemptRepository, AttemptSchema, AttemptSubmission, AttemptSubmissionRepository, AttemptSubmissionSchema,
    Attendance, AttendanceRepository, AttendanceSchema, AwsS3Module, Classroom, ClassroomRepository, ClassroomSchema,
    DatabaseModule, Discussion, DiscussionRepository, DiscussionSchema, EventBus, Favorite, FavoriteRepository, FavoriteSchema,
    KhanAcademy, KhanAcademyRepository, KhanAcademySchema, Mapping, MappingRepository, MappingSchema, Notification,
    NotificationRepository, NotificationSchema, NotificationTemplate, NotificationTemplateRepository, NotificationTemplateSchema,
    PracticeSet, PracticeSetRepository, PracticeSetSchema, PsychoResult, PsychoResultRepository, PsychoResultSchema, RedisModule,
    Setting, SettingRepository, Settings, SettingSchema, SocketClientModule, TestSeries, TestSeriesRepository, TestSeriesSchema,
    User, UserCourse, UserCourseRepository, UserCourseSchema, UserEnrollment, UserEnrollmentRepository, UserEnrollmentSchema,
    UserSchema, UsersRepository, WhiteboardModule
} from "@app/common";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { StudentController } from "./student.controller";
import { StudentService } from "./student.service";
import { instanceKeys } from "@app/common/config";
import { MessageCenter } from "@app/common/components/messageCenter";
import { HttpModule } from "@nestjs/axios";

const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema }
const practicesetEntity = { name: PracticeSet.name, schema: PracticeSetSchema }
const attendanceEntity = { name: Attendance.name, schema: AttendanceSchema }
const favoriteEntity = { name: Favorite.name, schema: FavoriteSchema }
const userEntity = { name: User.name, schema: UserSchema }
const userCourseEntity = { name: UserCourse.name, schema: UserCourseSchema }
const discussionEntity = { name: Discussion.name, schema: DiscussionSchema }
const psychoResultEntity = { name: PsychoResult.name, schema: PsychoResultSchema }
const attemptSubmissionEntity = { name: AttemptSubmission.name, schema: AttemptSubmissionSchema }
const notificationTemplateEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema }
const settingEntity = { name: Setting.name, schema: SettingSchema }
const notificationEntity = { name: Notification.name, schema: NotificationSchema }
const userEnrollmentEntity = { name: UserEnrollment.name, schema: UserEnrollmentSchema }
const testSeriesEntity = { name: TestSeries.name, schema: TestSeriesSchema }
const mappingEntity = { name: Mapping.name, schema: MappingSchema }
const khanAcademyEntity = { name: KhanAcademy.name, schema: KhanAcademySchema }

@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true,
    }), DatabaseModule, RedisModule, AwsS3Module, SocketClientModule, WhiteboardModule, HttpModule,
    ...createDatabaseModules([
        attemptEntity, classroomEntity, practicesetEntity, attendanceEntity, favoriteEntity, userEntity,
        userCourseEntity, discussionEntity, psychoResultEntity, attemptSubmissionEntity, settingEntity,
        notificationTemplateEntity, notificationEntity, userEnrollmentEntity, testSeriesEntity, mappingEntity,
        khanAcademyEntity
    ], instanceKeys)],
    controllers: [StudentController],
    providers: [
        StudentService, MessageCenter, EventBus, Settings,
        AttemptRepository, ClassroomRepository, PracticeSetRepository, AttendanceRepository,
        FavoriteRepository, UsersRepository, UserCourseRepository, DiscussionRepository,
        PsychoResultRepository, AttemptSubmissionRepository, NotificationTemplateRepository,
        SettingRepository, NotificationRepository, UserEnrollmentRepository, TestSeriesRepository,
        MappingRepository, KhanAcademyRepository
    ],
})
export class StudentModule { }


function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
    return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}