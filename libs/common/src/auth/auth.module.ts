import { Module } from '@nestjs/common';
import { AuthCommonService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthClientModule } from '../grpc-clients';
import { AuthenticationGuard } from './interceptors/auth.interceptor';

@Module({
  imports: [
    AuthClientModule,
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],
  controllers: [],
  providers: [
    AuthCommonService,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthenticationGuard,
    // },
  ],
  exports: [AuthCommonService],
})
export class AuthCommonModule {}
