import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ClassroomModule } from './classroom.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufClassroomPackage } from '@app/common/grpc-clients/classroom';
import { RedisIoAdapter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(ClassroomModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: protobufClassroomPackage,
      protoPath: join(__dirname, '../../../proto/classroom.proto'),
      url: configService.getOrThrow('CLASSROOM_GRPC_URL')
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.startAllMicroservices();
  console.log('Classroom Microservice connected');
}
bootstrap();
