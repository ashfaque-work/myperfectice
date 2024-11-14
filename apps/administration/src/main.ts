import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AdministrationModule } from './administration.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufAdministrationPackage } from '@app/common/grpc-clients/administration';

async function bootstrap() {
  const app = await NestFactory.create(AdministrationModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: protobufAdministrationPackage,
      protoPath: join(__dirname, '../../../proto/administration.proto'),
      url: configService.getOrThrow('ADMINISTRATION_GRPC_URL')
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.startAllMicroservices();
  console.log('Administration Microservice connected');
}
bootstrap();
