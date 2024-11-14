import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufAssessmentPackage, AssessmentGrpcServiceClientImpl } from './assessment';

@Module({
  imports: [
    ClientsModule.registerAsync([
        {
          name: 'assessmentGrpcService',
          useFactory: (configService: ConfigService) => ({
            transport: Transport.GRPC,
            options: {
              package: protobufAssessmentPackage,
              protoPath: join(__dirname, '../../../proto/assessment.proto'),
              url: configService.getOrThrow('ASSESSMENT_GRPC_URL'),
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
  providers: [AssessmentGrpcServiceClientImpl],
  exports:[AssessmentGrpcServiceClientImpl]
})
export class AssessmentClientModule {}





