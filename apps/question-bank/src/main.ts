import { NestFactory } from '@nestjs/core';
import { QuestionBankModule } from './question-bank.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufQuestionBankPackage } from '@app/common/grpc-clients/question-bank';

async function bootstrap() {
  const app = await NestFactory.create(QuestionBankModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: protobufQuestionBankPackage,
      protoPath: join(__dirname, '../../../proto/question-bank.proto'),
      url: configService.getOrThrow('QUESTION_BANK_GRPC_URL')
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.startAllMicroservices();
  console.log('Question Bank Microservice connected');
}
bootstrap();