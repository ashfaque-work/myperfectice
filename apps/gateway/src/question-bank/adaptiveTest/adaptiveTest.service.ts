import { CheckQuestionCountInAdaptiveTestRequest, GenerateAdaptiveLearningTestRequest, GenerateAdaptiveTestRequest, GetAdaptiveTestRequest, GetFirstQuestionRequest, GetNextQuestionRequest } from '@app/common/dto/question-bank.dto';
import { AdaptiveTestGrpcServiceClientImpl } from '@app/common/grpc-clients/question-bank';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdaptiveTestService {
    constructor(private adaptiveTestGrpcServiceClientImpl: AdaptiveTestGrpcServiceClientImpl ) {}
    
    async generateAdaptiveTest(request: GenerateAdaptiveTestRequest) {
        return this.adaptiveTestGrpcServiceClientImpl.GenerateAdaptiveTest(request);
    }
    
    async checkQuestionCountInAdaptiveTest(request: CheckQuestionCountInAdaptiveTestRequest) {
        return this.adaptiveTestGrpcServiceClientImpl.CheckQuestionCountInAdaptiveTest(request);
    }
    
    async generateAdaptiveLearningTest(request: GenerateAdaptiveLearningTestRequest) {
        return this.adaptiveTestGrpcServiceClientImpl.GenerateAdaptiveLearningTest(request);
    }
    
    async getFirstQuestion(request: GetFirstQuestionRequest) {
        return this.adaptiveTestGrpcServiceClientImpl.GetFirstQuestion(request);
    }
    async getNextQuestion(request: GetNextQuestionRequest) {
        return this.adaptiveTestGrpcServiceClientImpl.GetNextQuestion(request);
    }
    
    async getAdaptiveTest(request: GetAdaptiveTestRequest) {
        return this.adaptiveTestGrpcServiceClientImpl.GetAdaptiveTest(request);
    }
}