import { Empty, CreateHostRateReq, ShareLinkReq, FeedbackReq, TestSendMailReq } from '@app/common/dto/administration';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufHostRateService = 'AdministrationGrpcService';

export interface HostRateGrpcInterface {
    CreateHostRate(request: CreateHostRateReq): Promise<Empty>;
    ShareLink(request: ShareLinkReq): Promise<Empty>;
    Feedback(request: FeedbackReq): Promise<Empty>;
    TestSendMail(request: TestSendMailReq): Promise<Empty>;
}

@Injectable()
export class HostRateGrpcServiceClientImpl implements HostRateGrpcInterface {
    private hostRateGrpcServiceClient: HostRateGrpcInterface;
    private readonly logger = new Logger(HostRateGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private hostRateGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.hostRateGrpcServiceClient =
            this.hostRateGrpcClient.getService<HostRateGrpcInterface>(
                protobufHostRateService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async CreateHostRate(request: CreateHostRateReq): Promise<Empty> {
        return await this.hostRateGrpcServiceClient.CreateHostRate(request);
    }

    async ShareLink(request: ShareLinkReq): Promise<Empty> {
        return await this.hostRateGrpcServiceClient.ShareLink(request);
    }

    async Feedback(request: FeedbackReq): Promise<Empty> {
        return await this.hostRateGrpcServiceClient.Feedback(request);
    }

    async TestSendMail(request: TestSendMailReq): Promise<Empty> {
        return await this.hostRateGrpcServiceClient.TestSendMail(request);
    }
}
