import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufAssessmentPackage } from '@app/common/grpc-clients/assessment';
import { AssessmentModule } from './assessment.module';

async function bootstrap() {
  const app = await NestFactory.create(AssessmentModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: protobufAssessmentPackage,
      protoPath: join(__dirname, '../../../proto/assessment.proto'),
      url: configService.getOrThrow('ASSESSMENT_GRPC_URL'),
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.startAllMicroservices();
  console.log('Assessment microservice connected');
}
bootstrap();