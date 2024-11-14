import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Coupon, CouponRepository, CouponSchema, DatabaseModule, Settings } from '@app/common';
import { Setting, SettingSchema, SettingRepository } from '@app/common';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { instanceKeys } from '@app/common/config';
import { RedisModule } from '@app/common/modules/redis.modules';
import { NotificationTemplate, NotificationTemplateSchema } from '@app/common/database/models/notificationTemplate.schema';
import { NotificationTemplateRepository } from '@app/common/database/repositories/notificationTemplate.repository';

const settingEntity = { name: Setting.name, schema: SettingSchema };
const notificationEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema };
const couponEntity = { name: Coupon.name, schema: CouponSchema }

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ...createDatabaseModules([settingEntity, notificationEntity, couponEntity], instanceKeys),
    RedisModule

  ],
  controllers: [SettingController],
  providers: [SettingService, SettingRepository, NotificationTemplateRepository, CouponRepository, Settings],
})
export class SettingModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}