import { CheckQuestionCountInAdaptiveTestRequest, CheckQuestionCountInAdaptiveTestResponse, GenerateAdaptiveLearningTestRequest, GenerateAdaptiveLearningTestResponse, GenerateAdaptiveTestRequest, GenerateAdaptiveTestResponse, GetAdaptiveTestRequest, GetAdaptiveTestResponse, GetFirstQuestionRequest, GetFirstQuestionResponse, GetNextQuestionRequest, GetNextQuestionResponse } from '@app/common/dto/question-bank.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufAdaptiveTestService = 'QuestionBankGrpcService';
export interface AdaptiveTestGrpcInterface {
    GenerateAdaptiveTest(request: GenerateAdaptiveTestRequest): Promise<GenerateAdaptiveTestResponse>;
    CheckQuestionCountInAdaptiveTest(request: CheckQuestionCountInAdaptiveTestRequest): Promise<CheckQuestionCountInAdaptiveTestResponse>;
    GenerateAdaptiveLearningTest(request: GenerateAdaptiveLearningTestRequest): Promise<GenerateAdaptiveLearningTestResponse>;
    GetFirstQuestion(request: GetFirstQuestionRequest): Promise<GetFirstQuestionResponse>;
    GetNextQuestion(request: GetNextQuestionRequest): Promise<GetNextQuestionResponse>;
    GetAdaptiveTest(request: GetAdaptiveTestRequest): Promise<GetAdaptiveTestResponse>;
}
@Injectable()
export class AdaptiveTestGrpcServiceClientImpl implements AdaptiveTestGrpcInterface {
    private adaptiveTestGrpcServiceClient: AdaptiveTestGrpcInterface;
    private readonly logger = new Logger(AdaptiveTestGrpcServiceClientImpl.name)
    constructor(
        @Inject('questionBankGrpcService') private adaptiveTestGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.adaptiveTestGrpcServiceClient = this.adaptiveTestGrpcClient.getService<AdaptiveTestGrpcInterface>(
            protobufAdaptiveTestService
        );
        this.logger.debug('gRPC client initalized.');
    }

    async GenerateAdaptiveTest(request: GenerateAdaptiveTestRequest): Promise<GenerateAdaptiveTestResponse> {
        return await this.adaptiveTestGrpcServiceClient.GenerateAdaptiveTest(request)
    }
    
    async CheckQuestionCountInAdaptiveTest(request: CheckQuestionCountInAdaptiveTestRequest): Promise<CheckQuestionCountInAdaptiveTestResponse> {
        return await this.adaptiveTestGrpcServiceClient.CheckQuestionCountInAdaptiveTest(request)
    }
    
    async GenerateAdaptiveLearningTest(request: GenerateAdaptiveLearningTestRequest): Promise<GenerateAdaptiveLearningTestResponse> {
        return await this.adaptiveTestGrpcServiceClient.GenerateAdaptiveLearningTest(request)
    }

    async GetFirstQuestion(request: GetFirstQuestionRequest): Promise<GetFirstQuestionResponse> {
        return await this.adaptiveTestGrpcServiceClient.GetFirstQuestion(request)
    }

    async GetNextQuestion(request: GetNextQuestionRequest): Promise<GetNextQuestionResponse> {
        return await this.adaptiveTestGrpcServiceClient.GetNextQuestion(request)
    }

    async GetAdaptiveTest(request: GetAdaptiveTestRequest): Promise<GetAdaptiveTestResponse> {
        return await this.adaptiveTestGrpcServiceClient.GetAdaptiveTest(request)
    }
}