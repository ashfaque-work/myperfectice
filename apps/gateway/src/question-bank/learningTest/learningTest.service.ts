import { GetNextQuestionLearningTestRequest, GetPracticeSetRequest } from '@app/common/dto/question-bank.dto';
import { LearningTestGrpcServiceClientImpl } from '@app/common/grpc-clients/question-bank';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LearningTestService {
    constructor(private learningTestGrpcServiceClientImpl: LearningTestGrpcServiceClientImpl ) {}
    
    async getPracticeSet(request: GetPracticeSetRequest) {
        return this.learningTestGrpcServiceClientImpl.GetPracticeSet(request);
    }
    
    async getNextQuestionLearningTest(request: GetNextQuestionLearningTestRequest) {
        return this.learningTestGrpcServiceClientImpl.GetNextQuestionLearningTest(request);
    }
    
}