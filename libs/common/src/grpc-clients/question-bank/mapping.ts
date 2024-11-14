import { VideoForPracticeSetRequest, VideoForPracticeSetResponse } from '@app/common/dto/question-bank.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufMappingService = 'QuestionBankGrpcService';
export interface MappingGrpcInterface {
    VideoForPracticeSet(request: VideoForPracticeSetRequest): Promise<VideoForPracticeSetResponse>;
}
@Injectable()
export class MappingGrpcServiceClientImpl implements MappingGrpcInterface {
    private mappingGrpcServiceClient: MappingGrpcInterface;
    private readonly logger = new Logger(MappingGrpcServiceClientImpl.name)
    constructor(
        @Inject('questionBankGrpcService') private mappingGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.mappingGrpcServiceClient = this.mappingGrpcClient.getService<MappingGrpcInterface>(
            protobufMappingService
        );
        this.logger.debug('gRPC client initalized.');
    }

    async VideoForPracticeSet(request: VideoForPracticeSetRequest): Promise<VideoForPracticeSetResponse> {
        return await this.mappingGrpcServiceClient.VideoForPracticeSet(request);
    }

}