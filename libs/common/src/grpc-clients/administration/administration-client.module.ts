import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufAdministrationPackage, AdministrationGrpcServiceClientImpl } from './administration';
import { ProgramGrpcServiceClientImpl } from './program';
import { SettingGrpcServiceClientImpl } from './setting';
import { SubjectGrpcServiceClientImpl } from './subject';
import { TopicGrpcServiceClientImpl } from './topic';
import { UnitGrpcServiceClientImpl } from './unit';
import { ContentGrpcServiceClientImpl } from './content';
import { FileGrpcServiceClientImpl } from './file';
import { CountryGrpcServiceClientImpl } from './country';
import { ServiceGrpcServiceClientImpl } from './service';
import { BackpackGrpcServiceClientImpl } from './backpack';
import { CodesnippetGrpcServiceClientImpl } from './codesnippet';
import { HostRateGrpcServiceClientImpl } from './platform/hostRate';
import { PlatformByNumbersGrpcServiceClientImpl } from './platform/platformByNumbers';
import { ToolGrpcServiceClientImpl } from './platform/tool';
import { BoardInfinityGrpcServiceClientImpl } from './provider/boardInfinity';
import { NiitGrpcServiceClientImpl } from './provider/niit';
import { RecruitmentGrpcServiceClientImpl } from './recruitment';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'administrationGrpcService',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: protobufAdministrationPackage,
                        protoPath: join(__dirname, '../../../proto/administration.proto'),
                        url: configService.getOrThrow('ADMINISTRATION_GRPC_URL'),
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
    providers: [
        AdministrationGrpcServiceClientImpl, ProgramGrpcServiceClientImpl, SettingGrpcServiceClientImpl,
        SubjectGrpcServiceClientImpl, TopicGrpcServiceClientImpl, UnitGrpcServiceClientImpl,
        ContentGrpcServiceClientImpl, FileGrpcServiceClientImpl, CountryGrpcServiceClientImpl,
        ServiceGrpcServiceClientImpl, BackpackGrpcServiceClientImpl, CodesnippetGrpcServiceClientImpl,
        HostRateGrpcServiceClientImpl, PlatformByNumbersGrpcServiceClientImpl, ToolGrpcServiceClientImpl,
        BoardInfinityGrpcServiceClientImpl, NiitGrpcServiceClientImpl, RecruitmentGrpcServiceClientImpl
    ],
    exports: [
        AdministrationGrpcServiceClientImpl, ProgramGrpcServiceClientImpl, SettingGrpcServiceClientImpl,
        SubjectGrpcServiceClientImpl, TopicGrpcServiceClientImpl, UnitGrpcServiceClientImpl,
        ContentGrpcServiceClientImpl, FileGrpcServiceClientImpl, CountryGrpcServiceClientImpl,
        ServiceGrpcServiceClientImpl, BackpackGrpcServiceClientImpl, CodesnippetGrpcServiceClientImpl,
        HostRateGrpcServiceClientImpl, PlatformByNumbersGrpcServiceClientImpl, ToolGrpcServiceClientImpl,
        BoardInfinityGrpcServiceClientImpl, NiitGrpcServiceClientImpl, RecruitmentGrpcServiceClientImpl
    ]
})
export class AdministrationClientModule { }