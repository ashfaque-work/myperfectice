import { GetNextQuestionLearningTestRequest, GetNextQuestionLearningTestResponse, GetPracticeSetRequest, GetPracticeSetResponse } from '@app/common/dto/question-bank.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufLearningTestService = 'QuestionBankGrpcService';
export interface LearningTestGrpcInterface {
    GetPracticeSet(request: GetPracticeSetRequest): Promise<GetPracticeSetResponse>;
    GetNextQuestionLearningTest(request: GetNextQuestionLearningTestRequest): Promise<GetNextQuestionLearningTestResponse>;
}
@Injectable()
export class LearningTestGrpcServiceClientImpl implements LearningTestGrpcInterface {
    private learningTestGrpcServiceClient: LearningTestGrpcInterface;
    private readonly logger = new Logger(LearningTestGrpcServiceClientImpl.name)
    constructor(
        @Inject('questionBankGrpcService') private learningTestGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.learningTestGrpcServiceClient = this.learningTestGrpcClient.getService<LearningTestGrpcInterface>(
            protobufLearningTestService
        );
        this.logger.debug('gRPC client initalized.');
    }

    async GetPracticeSet(request: GetPracticeSetRequest): Promise<GetPracticeSetResponse> {
        return await this.learningTestGrpcServiceClient.GetPracticeSet(request);
    }
    
    async GetNextQuestionLearningTest(request: GetNextQuestionLearningTestRequest): Promise<GetNextQuestionLearningTestResponse> {
        return await this.learningTestGrpcServiceClient.GetNextQuestionLearningTest(request);
    }
    
}