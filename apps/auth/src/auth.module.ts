import { forwardRef, Module } from '@nestjs/common';
import { Attendance, AttendanceRepository, AttendanceSchema, BitlyService, DatabaseModule, HealthModule, LoggerModule, Notification, NotificationRepository, NotificationSchema, NotificationTemplate, NotificationTemplateRepository, NotificationTemplateSchema, RedisCaching, RedisClient, Setting, SettingRepository, SettingSchema, User, UserLog, UserLogRepository, UserLogSchema, UserSchema, UsersRepository } from '@app/common';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GrpcServerExceptionFilter } from 'nestjs-grpc-exceptions';
import { NotifyClientModule } from '@app/common/grpc-clients/notify';
import { instanceKeys } from '@app/common/config';
import { UserFollowModule } from './userFollow/userFollow.module';
import { UserManagementModule } from './userManagement/userManagement.module';
import { MessageCenter } from '@app/common/components/messageCenter';

const settingEntity = { name: Setting.name, schema:SettingSchema};
const userLogEntity = { name: UserLog.name, schema: UserLogSchema};
const userEntity = { name: User.name, schema: UserSchema };
const notificationEntity = { name: Notification.name, schema: NotificationSchema };
const notificationTemplateEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema };
const attendanceEntity = { name: Attendance.name, schema: AttendanceSchema };

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => UsersModule),
    ...createDatabaseModules([settingEntity, 
      userLogEntity, 
      userEntity, 
      notificationEntity,
      notificationTemplateEntity,
      attendanceEntity,
    ], instanceKeys),
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
      }),
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
        },
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    NotifyClientModule,
    UserFollowModule,
    UserManagementModule
  ],
  controllers: [AuthController],
  providers: [AuthService,
    SettingRepository,
    UserLogRepository,
    UsersRepository,
    NotificationRepository,
    RedisCaching,
    RedisClient,
    BitlyService,
    MessageCenter,
    NotificationTemplateRepository,
    AttendanceRepository,
    {
      provide: APP_FILTER,
      useClass: GrpcServerExceptionFilter,
    }],
  exports: [AuthService]
})
export class AuthModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}