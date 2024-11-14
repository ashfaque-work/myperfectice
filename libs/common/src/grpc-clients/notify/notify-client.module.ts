import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NotifyGrpcClientService, protobufNotifyPackage } from './notify';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'notifyGrpcService',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: protobufNotifyPackage,
            protoPath: join(__dirname, '../../../proto/notify.proto'),
            url: configService.getOrThrow('NOTIFY_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [],
  providers: [NotifyGrpcClientService],
  exports: [NotifyGrpcClientService],
})
export class NotifyClientModule {}
