import { AssignEvaluatorsRequest, FindEvaluatorsRequest, GetAssignedTestsRequest, GetPendingTestsRequest, GetQuestionEvaluationsByTestRequest, GetQuestionsForEvaluationRequest, GetStudentsForEvaluationByTestRequest, GetTestEvaluationStatRequest, GetUnassignedTestsRequest, QuestionEvaluationRequest, RemoveEvaluatorsRequest, StartTestEvaluationRequest } from '@app/common/dto/question-bank.dto';
import { EvaluationGrpcServiceClientImpl } from '@app/common/grpc-clients/question-bank';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EvaluationService {
    constructor(private evaluationGrpcServiceClientImpl: EvaluationGrpcServiceClientImpl ) {}
    
    async getAssignedTests(request: GetAssignedTestsRequest) {
        return this.evaluationGrpcServiceClientImpl.GetAssignedTests(request);
    }    
    
    async getUnassignedTests(request: GetUnassignedTestsRequest) {
        return this.evaluationGrpcServiceClientImpl.GetUnassignedTests(request);
    }    
    
    async findEvaluators(request: FindEvaluatorsRequest) {
        return this.evaluationGrpcServiceClientImpl.FindEvaluators(request);
    }    
    
    async getQuestionsForEvaluation(request: GetQuestionsForEvaluationRequest) {
        return this.evaluationGrpcServiceClientImpl.GetQuestionsForEvaluation(request);
    }    
    
    async getPendingTests(request: GetPendingTestsRequest) {
        return this.evaluationGrpcServiceClientImpl.GetPendingTests(request);
    }    
    
    async getQuestionEvaluationsByTest(request: GetQuestionEvaluationsByTestRequest) {
        return this.evaluationGrpcServiceClientImpl.GetQuestionEvaluationsByTest(request);
    }    
    
    async getStudentsForEvaluationByTest(request: GetStudentsForEvaluationByTestRequest) {
        return this.evaluationGrpcServiceClientImpl.GetStudentsForEvaluationByTest(request);
    }    
    
    async startTestEvaluation(request: StartTestEvaluationRequest) {
        return this.evaluationGrpcServiceClientImpl.StartTestEvaluation(request);
    }    
    
    async getTestEvaluationStat(request: GetTestEvaluationStatRequest) {
        return this.evaluationGrpcServiceClientImpl.GetTestEvaluationStat(request);
    }    
    
    async questionEvaluation(request: QuestionEvaluationRequest) {
        return this.evaluationGrpcServiceClientImpl.QuestionEvaluation(request);
    }    
    
    async assignEvaluators(request: AssignEvaluatorsRequest) {
        return this.evaluationGrpcServiceClientImpl.AssignEvaluators(request);
    }    
    
    async removeEvaluators(request: RemoveEvaluatorsRequest) {
        return this.evaluationGrpcServiceClientImpl.RemoveEvaluators(request);
    }    
    
}