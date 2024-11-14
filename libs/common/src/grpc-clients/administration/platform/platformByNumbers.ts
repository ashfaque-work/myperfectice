import { Empty, TestSendMailReq } from '@app/common/dto/administration';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufPlatformByNumbersService = 'AdministrationGrpcService';

export interface PlatformByNumbersGrpcInterface {
    GetplatformByNumbers(request: TestSendMailReq): Promise<Empty>;
}

@Injectable()
export class PlatformByNumbersGrpcServiceClientImpl implements PlatformByNumbersGrpcInterface {
    private platformByNumbersGrpcServiceClient: PlatformByNumbersGrpcInterface;
    private readonly logger = new Logger(PlatformByNumbersGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private platformByNumbersGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.platformByNumbersGrpcServiceClient =
            this.platformByNumbersGrpcClient.getService<PlatformByNumbersGrpcInterface>(
                protobufPlatformByNumbersService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async GetplatformByNumbers(request: TestSendMailReq): Promise<Empty> {
        return await this.platformByNumbersGrpcServiceClient.GetplatformByNumbers(request);
    }
}
