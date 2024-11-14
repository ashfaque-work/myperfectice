import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGatewayService } from './auth.service';
import { AuthClientModule } from '@app/common/grpc-clients/auth';
import { ConfigModule } from '@nestjs/config';
import { UserFollowController } from './userFollow/userFollow.controller';
import { UserFollowService } from './userFollow/userFollow.service';
import { ArticleController } from './userManagement/article/article.controller';
import { ArticleService } from './userManagement/article/article.service';
import { CaptchaController } from './userManagement/captcha/captcha.controller';
import { CaptchaService } from './userManagement/captcha/captcha.service';
import { DeviceController } from './userManagement/device/device.controller';
import { DeviceService } from './userManagement/device/device.service';
import { DirectorController } from './userManagement/director/director.controller';
import { DirectorService } from './userManagement/director/director.service';
import { DiscussionsController } from './userManagement/discussions/discussions.controller';
import { DiscussionsService } from './userManagement/discussions/discussions.service';
import { InstituteController } from './userManagement/institute/institute.controller';
import { InstituteService } from './userManagement/institute/institute.service';
import { OperatorController } from './userManagement/operator/operator.controller';
import { OperatorService } from './userManagement/operator/operator.service';
import { PublisherController } from './userManagement/publisher/publisher.controller';
import { PublisherService } from './userManagement/publisher/publisher.service';
import { SupercoinsController } from './userManagement/supercoins/supercoins.controller';
import { SupercoinsService } from './userManagement/supercoins/supercoins.service';
import { AdminController } from './userManagement/admin/admin.controller';
import { AdminService } from './userManagement/admin/admin.service';
import { AuthCommonModule } from '@app/common/auth/auth.module';
import { AuthenticationGuard } from '@app/common/auth';
import { DatabaseModule, RedisCaching, RedisClient, Setting, SettingRepository, SettingSchema } from '@app/common';
import { instanceKeys } from '@app/common/config';
import { JwtService } from '@nestjs/jwt';

const settingEntity = { name: Setting.name, schema: SettingSchema };

@Module({
  imports: [
    AuthClientModule, AuthCommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ...createDatabaseModules([settingEntity], instanceKeys)

  ],
  controllers: [
    AuthController, UserFollowController, ArticleController, CaptchaController, DeviceController,
    DirectorController, DiscussionsController, InstituteController, OperatorController, PublisherController,
    SupercoinsController, AdminController
  ],
  providers: [AuthGatewayService, UserFollowService, ArticleService, CaptchaService, DeviceService,
    DirectorService, DiscussionsService, InstituteService, OperatorService, PublisherService,
    SupercoinsService, AdminService, AuthenticationGuard, RedisCaching, SettingRepository, RedisClient, JwtService,
  ],
  exports: [AuthGatewayService],
})
export class AuthModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}