import { Controller } from "@nestjs/common";
import { LearningTestService } from "./learningTest.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufLearningTestService } from "@app/common/grpc-clients/question-bank";
import { GetNextQuestionLearningTestRequest, GetNextQuestionLearningTestResponse, GetPracticeSetRequest, GetPracticeSetResponse } from "@app/common/dto/question-bank.dto";

@Controller()
export class LearningTestController {
    constructor(private readonly learningTestService: LearningTestService) { }

    @GrpcMethod(protobufLearningTestService, 'GetPracticeSet')
    getPracticeSet(request: GetPracticeSetRequest): Promise<GetPracticeSetResponse> {
        return this.learningTestService.getPracticeSet(request);
    }
    
    @GrpcMethod(protobufLearningTestService, 'GetNextQuestionLearningTest')
    getNextQuestionLearningTest(request: GetNextQuestionLearningTestRequest): Promise<GetNextQuestionLearningTestResponse> {
        return this.learningTestService.getNextQuestionLearningTest(request);
    }
    
    
}