import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { instanceKeys } from '@app/common/config';
import { Attempt, AttemptDetail, AttemptDetailRepository, AttemptDetailSchema, AttemptRepository, AttemptSchema, AwsS3Module, BitlyService, Classroom, ClassroomRepository, ClassroomSchema, Competencies, CompetenciesRepository, CompetenciesSchema, Course, CourseRepository, CourseSchema, DatabaseModule, Evaluation, EvaluationRepository, EvaluationSchema, EventBus, Feedback, FeedbackRepository, FeedbackSchema, Notification, NotificationRepository, NotificationSchema, NotificationTemplate, NotificationTemplateRepository, NotificationTemplateSchema, PracticeSet, PracticeSetRepository, PracticeSetSchema, Question, QuestionRepository, QuestionSchema, RedisCaching, RedisClient, Setting, SettingRepository, SettingSchema, Subject, SubjectRepository, SubjectSchema, User, UserCourse, UserCourseRepository, UserCourseSchema, UserSchema, UsersRepository } from '@app/common';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import { AttemptProcessor } from '@app/common/components/AttemptProcessor';
import { FeedbackBus } from '@app/common/bus/feedback.bus';
import { MessageCenter } from '@app/common/components/messageCenter';

const userEntity = { name: User.name, schema: UserSchema };
const evaluationEntity = { name: Evaluation.name, schema: EvaluationSchema };
const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };
const feedbackEntity = { name: Feedback.name, schema: FeedbackSchema };
const notificationEntity = { name: Notification.name, schema: NotificationSchema };
const notificationTemplateEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema };
const attemptDetailEntity = { name: AttemptDetail.name, schema: AttemptDetailSchema };


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AwsS3Module,
    ...createDatabaseModules([practiceSetEntity,
      userEntity,
      evaluationEntity,
      attemptEntity,
      classroomEntity,
      settingEntity,
      attemptDetailEntity,
      feedbackEntity,
      notificationEntity,
      notificationTemplateEntity,
    ], instanceKeys),
  ],
  controllers: [EvaluationController],
  providers: [EvaluationService,
    EvaluationRepository,
    UsersRepository,
    AttemptRepository,
    PracticeSetRepository,
    ClassroomRepository,
    AttemptDetailRepository,
    SettingRepository,
    NotificationRepository,
    NotificationTemplateRepository,
    RedisCaching,
    RedisClient,
    BitlyService,
    MessageCenter,
  ],
})
export class EvaluationModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
