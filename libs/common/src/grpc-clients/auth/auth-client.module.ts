import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthGrpcService, AUTH_PACKAGE_NAME } from '@app/common/grpc-clients/auth/auth';
import { UserFollowGrpcServiceClientImpl } from './userFollow';
import { ArticleGrpcServiceClientImpl } from './article';
import { CaptchaGrpcServiceClientImpl } from './captcha';
import { DeviceGrpcServiceClientImpl } from './device';
import { DirectorGrpcServiceClientImpl } from './director';
import { DiscussionsGrpcServiceClientImpl } from './discussions';
import { InstituteGrpcServiceClientImpl } from './institute';
import { OperatorGrpcServiceClientImpl } from './operator';
import { PublisherGrpcServiceClientImpl } from './publisher';
import { SupercoinsGrpcServiceClientImpl } from './supercoins';
import { AdminGrpcServiceClientImpl } from './admin';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'authGrpcService',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, '../../../proto/auth.proto'),
            url: configService.getOrThrow('AUTH_GRPC_URL'),
            loader: {
              arrays: true
            },
          },
        }),
        inject: [ConfigService],
      }
    ])
  ],
  controllers: [],
  providers: [
    AuthGrpcService, UserFollowGrpcServiceClientImpl, ArticleGrpcServiceClientImpl, CaptchaGrpcServiceClientImpl,
    DeviceGrpcServiceClientImpl, DirectorGrpcServiceClientImpl, DiscussionsGrpcServiceClientImpl,
    InstituteGrpcServiceClientImpl, OperatorGrpcServiceClientImpl, PublisherGrpcServiceClientImpl,
    SupercoinsGrpcServiceClientImpl, AdminGrpcServiceClientImpl
  ],
  exports: [AuthGrpcService, UserFollowGrpcServiceClientImpl, ArticleGrpcServiceClientImpl,
    CaptchaGrpcServiceClientImpl, DeviceGrpcServiceClientImpl, DirectorGrpcServiceClientImpl,
    DiscussionsGrpcServiceClientImpl, InstituteGrpcServiceClientImpl, OperatorGrpcServiceClientImpl,
    PublisherGrpcServiceClientImpl, SupercoinsGrpcServiceClientImpl, AdminGrpcServiceClientImpl
  ]
})
export class AuthClientModule { }
