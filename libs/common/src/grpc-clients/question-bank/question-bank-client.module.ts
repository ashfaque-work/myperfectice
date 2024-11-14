import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { QuestionBankGrpcServiceClientImpl, protobufQuestionBankPackage } from './question-bank';
import { AdaptiveTestGrpcServiceClientImpl } from './adaptiveTest';
import { AnsyncGrpcServiceClientImpl } from './ansync';
import { CertificateGrpcServiceClientImpl } from './certificate';
import { EvaluationGrpcServiceClientImpl } from './evaluation';
import { FavoriteGrpcServiceClientImpl } from './favorite';
import { FeedbackGrpcServiceClientImpl } from './feedback';
import { LearningTestGrpcServiceClientImpl } from './learningTest';
import { SessionGrpcServiceClientImpl } from './session';
import { MappingGrpcServiceClientImpl } from './mapping';
import { TestSeriesGrpcServiceClientImpl } from './testSeries';


@Module({
  imports: [
    ClientsModule.registerAsync([
        {
          name: 'questionBankGrpcService',
          useFactory: (configService: ConfigService) => ({
            transport: Transport.GRPC,
            options: {
              package: protobufQuestionBankPackage,
              protoPath: join(__dirname, '../../../proto/question-bank.proto'),
              url: configService.getOrThrow('QUESTION_BANK_GRPC_URL'),
              loader: {
                arrays: true,
              },
            },
          }),
          inject: [ConfigService],
        }
      ])
  ],
  controllers: [],
  providers: [QuestionBankGrpcServiceClientImpl, AdaptiveTestGrpcServiceClientImpl, AnsyncGrpcServiceClientImpl, CertificateGrpcServiceClientImpl, EvaluationGrpcServiceClientImpl, FavoriteGrpcServiceClientImpl, FeedbackGrpcServiceClientImpl, LearningTestGrpcServiceClientImpl, SessionGrpcServiceClientImpl, MappingGrpcServiceClientImpl, TestSeriesGrpcServiceClientImpl],
  exports:[QuestionBankGrpcServiceClientImpl, AdaptiveTestGrpcServiceClientImpl, AnsyncGrpcServiceClientImpl, CertificateGrpcServiceClientImpl, EvaluationGrpcServiceClientImpl, FavoriteGrpcServiceClientImpl, FeedbackGrpcServiceClientImpl, LearningTestGrpcServiceClientImpl, SessionGrpcServiceClientImpl, MappingGrpcServiceClientImpl, TestSeriesGrpcServiceClientImpl]
})
export class QuestionBankClientModule {}





