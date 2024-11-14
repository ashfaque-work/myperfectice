import { AccreditationAttainments, AccreditationAttainmentsRepository, AccreditationAttainmentsSchema, AccreditationCourses, AccreditationCoursesRepository, AccreditationCoursesSchema, AccreditationEvaluations, AccreditationEvaluationsRepository, AccreditationEvaluationsSchema, AccreditationReports, AccreditationReportsRepository, AccreditationReportsSchema, AccreditationSettings, AccreditationSettingsRepository, AccreditationSettingsSchema, Articles, ArticlesRepository, ArticlesSchema, Attempt, AttemptRepository, AttemptSchema, Classroom, ClassroomRepository, ClassroomSchema, Course, CourseRepository, CourseSchema, DatabaseModule, Device, DeviceRepository, DeviceSchema, Discussion, DiscussionRepository, DiscussionSchema, Location, LocationRepository, LocationSchema, News, NewsRepository, NewsSchema, Notification, NotificationRepository, NotificationSchema, NotificationTemplate, NotificationTemplateRepository, NotificationTemplateSchema, PracticeSet, PracticeSetRepository, PracticeSetSchema, Program, ProgramOutcome, ProgramOutcomeRepository, ProgramOutcomeSchema, ProgramRepository, ProgramSchema, PushService, Question, QuestionFeedback, QuestionFeedbackRepository, QuestionFeedbackSchema, QuestionRepository, QuestionSchema, RedisModule, Report, ReportRepository, ReportSchema, Setting, SettingRepository, SettingSchema, SocketClientModule, Subject, SubjectRepository, SubjectSchema, SuperCoins, SuperCoinsRepository, SuperCoinsSchema, TestSeries, TestSeriesRepository, TestSeriesSchema, User, UserEnrollment, UserEnrollmentRepository, UserEnrollmentSchema, UserSchema, UserSuperCoins, UserSuperCoinsRepository, UserSuperCoinsSchema, UsersRepository } from "@app/common";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ArticleController } from "./article/article.controller";
import { ArticleService } from "./article/article.service";
import { instanceKeys } from "@app/common/config";
import { CaptchaController } from "./captcha/captcha.controller";
import { CaptchaService } from "./captcha/captcha.service";
import { DeviceController } from "./device/device.controller";
import { DeviceService } from "./device/device.service";
import { DirectorController } from "./director/director.controller";
import { DirectorService } from "./director/director.service";
import { DiscussionsController } from "./discussions/discussions.controller";
import { DiscussionsService } from "./discussions/discussions.service";
import { InstituteController } from "./institute/institute.controller";
import { InstituteService } from "./institute/institute.service";
import { MessageCenter } from "@app/common/components/messageCenter";
import { OperatorController } from "./operator/operator.controller";
import { OperatorService } from "./operator/operator.service";
import { PublisherController } from "./publisher/publisher.controller";
import { PublisherService } from "./publisher/publisher.service";
import { SupercoinsController } from "./supercoins/supercoins.controller";
import { SupercoinsService } from "./supercoins/supercoins.service";
import { AdminController } from "./admin/admin.controller";
import { AdminService } from "./admin/admin.service";
import { HttpModule } from "@nestjs/axios";

const articleEntity = { name: Articles.name, schema: ArticlesSchema }
const deviceEntity = { name: Device.name, schema: DeviceSchema }
const usersEntity = { name: User.name, schema: UserSchema }
const attemptEntity = { name: Attempt.name, schema: AttemptSchema }
const courseEntity = { name: Course.name, schema: CourseSchema }
const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema }
const discussionEntity = { name: Discussion.name, schema: DiscussionSchema }
const questionEntity = { name: Question.name, schema: QuestionSchema }
const testSeriesEntity = { name: TestSeries.name, schema: TestSeriesSchema }
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema }
const notificationEntity = { name: Notification.name, schema: NotificationSchema }
const questionFeedbackEntity = { name: QuestionFeedback.name, schema: QuestionFeedbackSchema }
const locationEntity = { name: Location.name, schema: LocationSchema }
const programEntity = { name: Program.name, schema: ProgramSchema }
const notificationTemplateEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema }
const settingEntity = { name: Setting.name, schema: SettingSchema }
const supercoinsEntity = { name: SuperCoins.name, schema: SuperCoinsSchema }
const userSupercoinsEntity = { name: UserSuperCoins.name, schema: UserSuperCoinsSchema }
const userenrollmentsEntity = { name: UserEnrollment.name, schema: UserEnrollmentSchema }
const reportEntity = { name: Report.name, schema: ReportSchema }
const programOutcomeEntity = { name: ProgramOutcome.name, schema: ProgramOutcomeSchema }
const accreditationCoursesEntity = { name: AccreditationCourses.name, schema: AccreditationCoursesSchema }
const accreditationEvaluationsEntity = { name: AccreditationEvaluations.name, schema: AccreditationEvaluationsSchema }
const accreditationSettingsEntity = { name: AccreditationSettings.name, schema: AccreditationSettingsSchema }
const accreditationReportsEntity = { name: AccreditationReports.name, schema: AccreditationReportsSchema }
const accreditationAttainmentsEntity = { name: AccreditationAttainments.name, schema: AccreditationAttainmentsSchema }
const newsEntity = { name: News.name, schema: NewsSchema }
const subjectEntity = { name: Subject.name, schema: SubjectSchema }

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        DatabaseModule,
        ...createDatabaseModules([
            articleEntity, deviceEntity, usersEntity, attemptEntity, courseEntity, practiceSetEntity,
            discussionEntity, questionEntity, testSeriesEntity, classroomEntity, notificationEntity,
            questionFeedbackEntity, locationEntity, programEntity, notificationTemplateEntity,
            settingEntity, supercoinsEntity, userSupercoinsEntity, userenrollmentsEntity, reportEntity,
            programOutcomeEntity, accreditationCoursesEntity, accreditationEvaluationsEntity, accreditationSettingsEntity,
            accreditationReportsEntity, accreditationAttainmentsEntity, newsEntity, subjectEntity
        ], instanceKeys),
        RedisModule, HttpModule, SocketClientModule
    ],
    controllers: [
        ArticleController, CaptchaController, DeviceController, DirectorController,
        DiscussionsController, InstituteController, OperatorController, PublisherController,
        SupercoinsController, AdminController
    ],
    providers: [
        ArticleService, ArticlesRepository, CaptchaService, DeviceService, DeviceRepository,
        DirectorService, UsersRepository, AttemptRepository, CourseRepository, PracticeSetRepository,
        DiscussionRepository, QuestionRepository, TestSeriesRepository, DiscussionsService,
        ClassroomRepository, NotificationRepository, PushService, QuestionFeedbackRepository,
        InstituteService, LocationRepository, ProgramRepository, MessageCenter, NotificationTemplateRepository,
        SettingRepository, OperatorService, PublisherService, SupercoinsService, SuperCoinsRepository,
        UserSuperCoinsRepository, UserEnrollmentRepository, AdminService, ReportRepository, ProgramOutcomeRepository,
        AccreditationCoursesRepository, AccreditationEvaluationsRepository, AccreditationSettingsRepository,
        AccreditationReportsRepository, AccreditationAttainmentsRepository, NewsRepository, SubjectRepository
    ]
})
export class UserManagementModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
    return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}