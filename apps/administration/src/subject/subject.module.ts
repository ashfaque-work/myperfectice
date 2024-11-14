import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseModule, Subject, SubjectSchema, SubjectRepository, Location, LocationRepository, LocationSchema,
  Program, ProgramSchema, ProgramRepository, PracticeSet, PracticeSetSchema, PracticeSetRepository,
  Attempt, AttemptSchema, AttemptRepository, AttemptDetailSchema, AttemptDetail, AttemptDetailRepository,
  Question, QuestionSchema, QuestionRepository, User, UserSchema, UsersRepository, Unit, UnitSchema,
  UnitRepository, TopicSchema, Topic, TopicRepository, RedisModule, Classroom, ClassroomSchema, SocketClientModule,
  ClassroomRepository, Notification, NotificationSchema, NotificationRepository, Setting, SettingSchema,
  SettingRepository, NotificationTemplate, NotificationTemplateSchema, NotificationTemplateRepository,
} from '@app/common';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import { instanceKeys } from '@app/common/config';
import { StudentBus } from '@app/common/bus';
import { MessageCenter } from '@app/common/components/messageCenter';

const subjectEntity = { name: Subject.name, schema: SubjectSchema };
const locationEntity = { name: Location.name, schema: LocationSchema };
const programEntity = { name: Program.name, schema: ProgramSchema };
const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const questionEntity = { name: Question.name, schema: QuestionSchema };
const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const attemptDetailsEntity = { name: AttemptDetail.name, schema: AttemptDetailSchema };
const userEntity = { name: User.name, schema: UserSchema };
const unitEntity = { name: Unit.name, schema: UnitSchema };
const topicEntity = { name: Topic.name, schema: TopicSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const notificationEntity = { name: Notification.name, schema: NotificationSchema };
const notificationTemplateEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ...createDatabaseModules([
      subjectEntity, locationEntity, programEntity, practiceSetEntity, questionEntity, attemptEntity,
      attemptDetailsEntity, userEntity, unitEntity, topicEntity, classroomEntity, notificationEntity,
      settingEntity, notificationTemplateEntity
    ], instanceKeys),
    RedisModule, SocketClientModule
  ],
  controllers: [SubjectController],
  providers: [
    SubjectService, SubjectRepository, LocationRepository, ProgramRepository, PracticeSetRepository,
    QuestionRepository, AttemptRepository, StudentBus, AttemptDetailRepository, UsersRepository,
    UnitRepository, TopicRepository, ClassroomRepository, MessageCenter, NotificationRepository,
    SettingRepository, NotificationTemplateRepository
  ],
})
export class SubjectModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}