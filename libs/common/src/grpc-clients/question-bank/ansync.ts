import { AnsyncAllRequest, AnsyncAllResponse } from '@app/common/dto/question-bank.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufAnsyncService = 'QuestionBankGrpcService';
export interface AnsyncGrpcInterface {
    AnsyncAll(request: AnsyncAllRequest): Promise<AnsyncAllResponse>;
    
}
@Injectable()
export class AnsyncGrpcServiceClientImpl implements AnsyncGrpcInterface {
    private ansyncGrpcServiceClient: AnsyncGrpcInterface;
    private readonly logger = new Logger(AnsyncGrpcServiceClientImpl.name)
    constructor(
        @Inject('questionBankGrpcService') private ansyncGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.ansyncGrpcServiceClient = this.ansyncGrpcClient.getService<AnsyncGrpcInterface>(
            protobufAnsyncService
        );
        this.logger.debug('gRPC client initalized.');
    }

    async AnsyncAll(request: AnsyncAllRequest): Promise<AnsyncAllResponse> {
        return await this.ansyncGrpcServiceClient.AnsyncAll(request)
    }
    
    
}