import { Empty, TestSendMailReq } from '@app/common/dto/administration';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufNiitService = 'AdministrationGrpcService';

export interface NiitGrpcInterface {
    NiitUserAttemptDetails(request: TestSendMailReq): Promise<Empty>;
}

@Injectable()
export class NiitGrpcServiceClientImpl implements NiitGrpcInterface {
    private niitGrpcServiceClient: NiitGrpcInterface;
    private readonly logger = new Logger(NiitGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private niitGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.niitGrpcServiceClient =
            this.niitGrpcClient.getService<NiitGrpcInterface>(
                protobufNiitService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async NiitUserAttemptDetails(request: TestSendMailReq): Promise<Empty> {
        return await this.niitGrpcServiceClient.NiitUserAttemptDetails(request);
    }
}
