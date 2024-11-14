import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Attempt, AttemptRepository, AttemptSchema, Classroom, ClassroomRepository, ClassroomSchema, DatabaseModule, HostRate, HostRateRepository, HostRateSchema, Notification, NotificationRepository, NotificationSchema, NotificationTemplate, NotificationTemplateRepository, NotificationTemplateSchema, PracticeSet, PracticeSetRepository, PracticeSetSchema, RedisModule, Setting, SettingRepository, SettingSchema, UserLog, UserLogRepository, UserLogSchema } from '@app/common';
import {
  Location, LocationSchema, LocationRepository,
  User, UserSchema, UsersRepository,
} from '@app/common';
import { AdministrationController } from './administration.controller';
import { AdministrationService } from './administration.service';
import { SubjectModule } from './subject/subject.module';
import { SettingModule } from './setting/setting.module';
import { APP_FILTER } from '@nestjs/core';
import { GrpcServerExceptionFilter } from 'nestjs-grpc-exceptions';
import { ProgramModule } from './program/program.module';
import { TopicModule } from './topic/topic.module';
import { UnitModule } from './unit/unit.module';
import { instanceKeys } from '@app/common/config';
import { ContentModule } from './content/content.module';
import { FileModule } from './file/file.module';
import { CountryModule } from './country/country.module';
import { ServiceModule } from './service/service.module';
import { BackpackModule } from './backpack/backpack.module';
import { CodesnippetModule } from './codesnippet/codesnippet.module';
import { HostRateController } from './platform/hostRate/hostRate.controller';
import { HostRateService } from './platform/hostRate/hostRate.service';
import { SMSBus } from '@app/common/bus/sms.bus';
import { MessageCenter } from '@app/common/components/messageCenter';
import { PlatformByNumbersController } from './platform/platformByNumbers/platformByNumbers.controller';
import { PlatformByNumbersService } from './platform/platformByNumbers/platformByNumbers.service';
import { ToolService } from './platform/tool/tool.service';
import { ToolController } from './platform/tool/tool.controller';
import { BoardInfinityController } from './provider/boardInfinity/boardInfinity.controller';
import { BoardInfinityService } from './provider/boardInfinity/boardInfinity.service';
import { NiitController } from './provider/niit/niit.controller';
import { NiitService } from './provider/niit/niit.service';
import { RecruitmentModule } from './recruitment/recruitment.module';

const userEntity = { name: User.name, schema: UserSchema };
const locationEntity = { name: Location.name, schema: LocationSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const hostRateEntity = { name: HostRate.name, schema: HostRateSchema };
const notificationEntity = { name: Notification.name, schema: NotificationSchema };
const notificationTemplateEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };
const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const userLogEntity = { name: UserLog.name, schema: UserLogSchema };


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ...createDatabaseModules([
      userEntity, locationEntity, classroomEntity, hostRateEntity, notificationEntity,
      notificationTemplateEntity, settingEntity, attemptEntity, practiceSetEntity,
      userLogEntity
    ], instanceKeys),
    ProgramModule, SettingModule, SubjectModule, TopicModule, UnitModule, ContentModule,
    FileModule, CountryModule, ServiceModule, BackpackModule, CodesnippetModule, RedisModule, RecruitmentModule
  ],
  controllers: [
    AdministrationController, HostRateController, PlatformByNumbersController, ToolController,
    BoardInfinityController, NiitController

  ],
  providers:
    [
      { provide: APP_FILTER, useClass: GrpcServerExceptionFilter },
      AdministrationService, HostRateService, PlatformByNumbersService, ToolService,
      BoardInfinityService, NiitService, SMSBus, MessageCenter,
      LocationRepository, UsersRepository, ClassroomRepository, HostRateRepository,
      NotificationRepository, NotificationTemplateRepository, SettingRepository,
      AttemptRepository, PracticeSetRepository, UserLogRepository
    ],
})
export class AdministrationModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}