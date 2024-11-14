import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CourseModule } from './course.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufCoursePackage } from '@app/common/grpc-clients/course';

async function bootstrap() {
  const app = await NestFactory.create(CourseModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: protobufCoursePackage,
      protoPath: join(__dirname, '../../../proto/course.proto'),
      url: configService.getOrThrow('COURSE_GRPC_URL')
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.startAllMicroservices();
  console.log('Course Microservice connected');
}
bootstrap();
