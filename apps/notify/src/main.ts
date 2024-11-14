import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { NotifyModule } from './notify.module';
import { join } from 'path';
import { protobufNotifyPackage } from '@app/common/grpc-clients/notify';

async function bootstrap() {
  const app = await NestFactory.create(NotifyModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      protoPath: join(__dirname, '../../../proto/notify.proto'),
      package: protobufNotifyPackage,
      url: configService.getOrThrow('NOTIFY_GRPC_URL'),
    },
  });

  app.useLogger(app.get(Logger));
  await app.startAllMicroservices();
}
bootstrap();
