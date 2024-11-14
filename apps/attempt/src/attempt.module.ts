import { Module } from '@nestjs/common';
import { AttemptController } from './attempt.controller';
import { AttemptService } from './attempt.service';
import { ConfigModule } from '@nestjs/config';
import {
  Attempt, AttemptDetail, AttemptDetailRepository, AttemptDetailSchema, AttemptRepository,
  AttemptSchema, AttemptSubmission, AttemptSubmissionRepository, AttemptSubmissionSchema,
  Attendance, AttendanceRepository, AttendanceSchema, AwsS3Module, Classroom, ClassroomRepository, ClassroomSchema,
  Competencies, CompetenciesRepository, CompetenciesSchema, Course, CourseRepository, CourseSchema,
  DatabaseModule, KhanAcademy, KhanAcademyRepository, KhanAcademySchema, Mapping, MappingRepository,
  MappingSchema, Notification, NotificationRepository, NotificationSchema, NotificationTemplate,
  NotificationTemplateRepository, NotificationTemplateSchema, PracticeSet, PracticeSetRepository,
  PracticeSetSchema, PsychoResult, PsychoResultRepository, PsychoResultSchema, Question,
  QuestionFeedback, QuestionFeedbackRepository, QuestionFeedbackSchema, QuestionRepository,
  QuestionSchema, QuestionTag, QuestionTagRepository, QuestionTagSchema, RedisModule, Setting,
  SettingRepository, SettingSchema, SocketClientModule, StudentRecommendation, StudentRecommendationRepository,
  StudentRecommendationSchema, Subject, SubjectRepository, SubjectSchema, Topic, TopicRepository,
  TopicSchema, User, UserCourse, UserCourseRepository, UserCourseSchema, UserLog, UserLogRepository,
  UserLogSchema, UserSchema, UsersRepository
} from '@app/common';
import { config, instanceKeys } from '@app/common/config';
import { QuestionBus } from '@app/common/bus/question.bus';
import { MessageCenter } from '@app/common/components/messageCenter';
import { AttemptProcessor } from '@app/common/components/AttemptProcessor';
import { StudentBus } from '@app/common/bus';
import { StudentModule } from './student/student.module';
import { AnalysisModule } from './analysis/analysis.module';
import { SqlAnalysisModule } from './sqlAnalysis/sqlAnalysis.module';
import { S3Service } from '@app/common/components/aws/s3.service';
import { BullModule } from '@nestjs/bull';

const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const attemptDetailsEntity = { name: AttemptDetail.name, schema: AttemptDetailSchema };
const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema }
const questionEntity = { name: Question.name, schema: QuestionSchema }
const userEntity = { name: User.name, schema: UserSchema }
const questionFeedbackEntity = { name: QuestionFeedback.name, schema: QuestionFeedbackSchema }
const attendanceEntity = { name: Attendance.name, schema: AttendanceSchema }
const psychoResultEntity = { name: PsychoResult.name, schema: PsychoResultSchema }
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema }
const settingEntity = { name: Setting.name, schema: SettingSchema }
const mappingEntity = { name: Mapping.name, schema: MappingSchema }
const questionTagEntity = { name: QuestionTag.name, schema: QuestionTagSchema };
const khanAcademyEntity = { name: KhanAcademy.name, schema: KhanAcademySchema }
const topicEntity = { name: Topic.name, schema: TopicSchema }
const subjectEntity = { name: Subject.name, schema: SubjectSchema }
const studentRecommendationEntity = { name: StudentRecommendation.name, schema: StudentRecommendationSchema }
const userLogEntity = { name: UserLog.name, schema: UserLogSchema }
const attemptSubmissionEntity = { name: AttemptSubmission.name, schema: AttemptSubmissionSchema }
const notificationTemplateEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema }
const notificationEntity = { name: Notification.name, schema: NotificationSchema }
const competenciesEntity = { name: Competencies.name, schema: CompetenciesSchema }
const userCourseEntity = { name: UserCourse.name, schema: UserCourseSchema }
const courseEntity = { name: Course.name, schema: CourseSchema }

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule, RedisModule, StudentModule, SocketClientModule,
    AnalysisModule, SqlAnalysisModule, AwsS3Module,
    BullModule.forRoot({
      redis: {
        host: '3.7.95.4',
        port: 6379,
        password: 'Winter@wiz#24' 
      },
    }),
    // BullModule.forRootAsync({
    //   useFactory: async () => ({          
    //     connection: {
    //       host: '172.31.42.39',
    //       port: 6379,
    //       password: 'Winter%40wiz%2324' 
    //     },
    //   })
    // }),
    BullModule.registerQueue({
      name: 'attempt-submission',
      defaultJobOptions: {
        attempts: 2
      }
    }),
    ...createDatabaseModules(
      [
        attemptEntity, attemptDetailsEntity, practiceSetEntity, questionEntity, userEntity,
        questionFeedbackEntity, attendanceEntity, psychoResultEntity, classroomEntity, settingEntity,
        mappingEntity, questionTagEntity, khanAcademyEntity, topicEntity, subjectEntity,
        studentRecommendationEntity, userLogEntity, attemptSubmissionEntity, notificationTemplateEntity,
        notificationEntity, competenciesEntity, userCourseEntity, courseEntity
      ], instanceKeys
    )
  ],
  controllers: [AttemptController],
  providers: [
    AttemptService, AttemptRepository, AttemptDetailRepository, PracticeSetRepository, QuestionRepository,
    UsersRepository, QuestionFeedbackRepository, AttendanceRepository, PsychoResultRepository,
    ClassroomRepository, SettingRepository, MappingRepository, QuestionTagRepository, QuestionBus,
    KhanAcademyRepository, TopicRepository, SubjectRepository, StudentRecommendationRepository,
    UserLogRepository, AttemptSubmissionRepository, MessageCenter, AttemptProcessor,
    NotificationTemplateRepository, NotificationRepository, CompetenciesRepository,
    UserCourseRepository, CourseRepository, StudentBus, S3Service
  ]
})

export class AttemptModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}