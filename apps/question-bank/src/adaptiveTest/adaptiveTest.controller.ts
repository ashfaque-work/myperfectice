import { Controller } from "@nestjs/common";
import { AdaptiveTestService } from "./adaptiveTest.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufAdaptiveTestService } from "@app/common/grpc-clients/question-bank";
import { CheckQuestionCountInAdaptiveTestRequest, CheckQuestionCountInAdaptiveTestResponse, GenerateAdaptiveLearningTestRequest, GenerateAdaptiveLearningTestResponse, GenerateAdaptiveTestRequest, GenerateAdaptiveTestResponse, GetAdaptiveTestRequest, GetFirstQuestionRequest, GetNextQuestionRequest } from "@app/common/dto/question-bank.dto";

@Controller()
export class AdaptiveTestController {
    constructor(private readonly adaptiveTestService: AdaptiveTestService) { }

    @GrpcMethod(protobufAdaptiveTestService, 'GenerateAdaptiveTest')
    generateAdaptiveTest(request: GenerateAdaptiveTestRequest): Promise<GenerateAdaptiveTestResponse> {
        return this.adaptiveTestService.generateAdaptiveTest(request);
    }

    @GrpcMethod(protobufAdaptiveTestService, 'CheckQuestionCountInAdaptiveTest')
    checkQuestionCountInAdaptiveTest(request: CheckQuestionCountInAdaptiveTestRequest) {
        return this.adaptiveTestService.checkQuestionCountInAdaptiveTest(request);
    }

    @GrpcMethod(protobufAdaptiveTestService, 'GenerateAdaptiveLearningTest')
    generateAdaptiveLearningTest(request: GenerateAdaptiveLearningTestRequest) {
        return this.adaptiveTestService.generateAdaptiveLearningTest(request);
    }

    @GrpcMethod(protobufAdaptiveTestService, 'GetFirstQuestion')
    getFirstQuestion(request: GetFirstQuestionRequest) {
        return this.adaptiveTestService.getFirstQuestion(request);
    }
    
    @GrpcMethod(protobufAdaptiveTestService, 'GetNextQuestion')
    getNextQuestion(request: GetNextQuestionRequest) {
        return this.adaptiveTestService.getNextQuestion(request);
    }

    @GrpcMethod(protobufAdaptiveTestService, 'GetAdaptiveTest')
    getAdaptiveTest(request: GetAdaptiveTestRequest) {
        return this.adaptiveTestService.getAdaptiveTest(request);
    }
}