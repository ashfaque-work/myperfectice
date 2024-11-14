import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufCoursePackage, CourseGrpcServiceClientImpl } from './course';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'courseGrpcService',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: protobufCoursePackage,
                        protoPath: join(__dirname, '../../../proto/course.proto'),
                        url: configService.getOrThrow('COURSE_GRPC_URL'),
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
    providers: [CourseGrpcServiceClientImpl],
    exports: [CourseGrpcServiceClientImpl]
})
export class CourseClientModule { }