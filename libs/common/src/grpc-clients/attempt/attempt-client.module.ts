import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AttemptGrpcServiceClientImpl, protobufAttemptPackage } from './attempt';
import { StudentGrpcServiceClientImpl } from './student';
import { AnalysisGrpcServiceClientImpl } from './analysis';
import { SqlAnalysisGrpcServiceClientImpl } from './sqlAnalysis';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'attemptGrpcService',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: protobufAttemptPackage,
                        protoPath: join(__dirname, '../../../proto/attempt.proto'),
                        url: configService.getOrThrow('ATTEMPT_GRPC_URL'),
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
    providers: [
        AttemptGrpcServiceClientImpl,
        StudentGrpcServiceClientImpl,
        AnalysisGrpcServiceClientImpl,
        SqlAnalysisGrpcServiceClientImpl
    ],
    exports: [
        AttemptGrpcServiceClientImpl,
        StudentGrpcServiceClientImpl,
        AnalysisGrpcServiceClientImpl,
        SqlAnalysisGrpcServiceClientImpl
    ]
})
export class AttemptClientModule { }