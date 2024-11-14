import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { instanceKeys } from '@app/common/config';
import { Attempt, AttemptDetail, AttemptDetailRepository, AttemptDetailSchema, AttemptRepository, AttemptSchema, AwsS3Module, BitlyService, Classroom, ClassroomRepository, ClassroomSchema, Competencies, CompetenciesRepository, CompetenciesSchema, Course, CourseRepository, CourseSchema, DatabaseModule, EventBus, Feedback, FeedbackRepository, FeedbackSchema, Notification, NotificationRepository, NotificationSchema, NotificationTemplate, NotificationTemplateRepository, NotificationTemplateSchema, PracticeSet, PracticeSetRepository, PracticeSetSchema, Question, QuestionRepository, QuestionSchema, RedisCaching, RedisClient, Setting, SettingRepository, SettingSchema, SocketClientModule, Subject, SubjectRepository, SubjectSchema, User, UserCourse, UserCourseRepository, UserCourseSchema, UserSchema, UsersRepository } from '@app/common';
import { AnsyncController } from './ansync.controller';
import { AnsyncService } from './ansync.service';
import { AttemptProcessor } from '@app/common/components/AttemptProcessor';
import { FeedbackBus } from '@app/common/bus/feedback.bus';
import { MessageCenter } from '@app/common/components/messageCenter';

const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const userEntity = { name: User.name, schema: UserSchema };
const questionEntity = { name: Question.name, schema: QuestionSchema };
const attemptDetailEntity = { name: AttemptDetail.name, schema: AttemptDetailSchema };
const subjectEntity = { name: Subject.name, schema: SubjectSchema };
const competenciesEntity = { name: Competencies.name, schema: CompetenciesSchema };
const userCourseEntity = { name: UserCourse.name, schema: UserCourseSchema };
const courseEntity = { name: Course.name, schema: CourseSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };
const feedbackEntity = { name: Feedback.name, schema: FeedbackSchema };
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
      settingEntity,
      attemptEntity,
      classroomEntity,
      userEntity,
      questionEntity,
      attemptDetailEntity,
      subjectEntity,
      competenciesEntity,
      userCourseEntity,
      courseEntity,
      feedbackEntity,
      notificationEntity,
      notificationTemplateEntity,
    ], instanceKeys),
  ],
  controllers: [AnsyncController],
  providers: [AnsyncService,
    AttemptRepository,
    PracticeSetRepository,
    UsersRepository,
    ClassroomRepository,
    QuestionRepository,
    AttemptDetailRepository,
    SubjectRepository,
    CompetenciesRepository,
    UserCourseRepository,
    CourseRepository,
    SettingRepository,
    FeedbackRepository,
    NotificationRepository,
    NotificationTemplateRepository,
    AttemptProcessor,
    RedisCaching,
    RedisClient,
    FeedbackBus,
    EventBus,
    BitlyService,
    MessageCenter,
  ],
})
export class AnsyncModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
