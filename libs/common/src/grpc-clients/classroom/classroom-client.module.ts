import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufClassroomPackage, ClassroomGrpcServiceClientImpl } from './classroom';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'classroomGrpcService',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: protobufClassroomPackage,
                        protoPath: join(__dirname, '../../../proto/classroom.proto'),
                        url: configService.getOrThrow('CLASSROOM_GRPC_URL'),
                        loader: {
                            arrays: true
                        },
                    },
                }),
                inject: [ConfigService],
            }
        ])
    ],
    controllers: [],
    providers: [ClassroomGrpcServiceClientImpl],
    exports: [ClassroomGrpcServiceClientImpl]
})
export class ClassroomClientModule { }