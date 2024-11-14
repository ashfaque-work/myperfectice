import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule, LoggerModule, Notification, NotificationRepository, NotificationSchema, RedisModule, SocketClientModule } from '@app/common';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';
import { instanceKeys } from '@app/common/config';


const notificationEntity = { name: Notification.name, schema: NotificationSchema };


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        GOOGLE_OAUTH_CLIENT_ID: Joi.string().required(),
        GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_OAUTH_REFRESH_TOKEN: Joi.string().required(),
        SMTP_USER: Joi.string().required(),
        MAILTRAP_USER: Joi.string().required(),
        MAILTRAP_PASSWORD:Joi.string().required(),
      }),
    }),
    DatabaseModule,
    ...createDatabaseModules([
      notificationEntity, 
    ], instanceKeys),
    LoggerModule, RedisModule, SocketClientModule
  ],
  controllers: [NotifyController],
  providers: [NotifyService, NotificationRepository],
})
export class NotifyModule {}

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}