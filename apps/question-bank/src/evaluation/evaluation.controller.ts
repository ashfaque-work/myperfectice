import { Controller } from "@nestjs/common";
import { EvaluationService } from "./evaluation.service";
import { protobufEvaluationService } from "@app/common/grpc-clients/question-bank";
import { GrpcMethod } from "@nestjs/microservices";
import { AssignEvaluatorsRequest, FindEvaluatorsRequest, GetAssignedTestsRequest, GetPendingTestsRequest, GetQuestionEvaluationsByTestRequest, GetQuestionsForEvaluationRequest, GetStudentsForEvaluationByTestRequest, GetTestEvaluationStatRequest, GetUnassignedTestsRequest, QuestionEvaluationRequest, RemoveEvaluatorsRequest, StartTestEvaluationRequest } from "@app/common/dto/question-bank.dto";

@Controller()
export class EvaluationController {
    constructor(private readonly evaluationService: EvaluationService) { }

    @GrpcMethod(protobufEvaluationService, 'GetAssignedTests')
    getAssignedTests(request: GetAssignedTestsRequest) {
        return this.evaluationService.getAssignedTests(request);
    }
    
    @GrpcMethod(protobufEvaluationService, 'GetUnassignedTests')
    getUnassignedTests(request: GetUnassignedTestsRequest) {
        return this.evaluationService.getUnassignedTests(request);
    }
    
    @GrpcMethod(protobufEvaluationService, 'FindEvaluators')
    findEvaluators(request: FindEvaluatorsRequest) {
        return this.evaluationService.findEvaluators(request);
    }
    
    @GrpcMethod(protobufEvaluationService, 'GetQuestionsForEvaluation')
    getQuestionsForEvaluation(request: GetQuestionsForEvaluationRequest) {
        return this.evaluationService.getQuestionsForEvaluation(request);
    }
    
    @GrpcMethod(protobufEvaluationService, 'GetPendingTests')
    getPendingTests(request: GetPendingTestsRequest) {
        return this.evaluationService.getPendingTests(request);
    }
    
    @GrpcMethod(protobufEvaluationService, 'GetQuestionEvaluationsByTest')
    getQuestionEvaluationsByTest(request: GetQuestionEvaluationsByTestRequest) {
        return this.evaluationService.getQuestionEvaluationsByTest(request);
    }
    
    @GrpcMethod(protobufEvaluationService, 'GetStudentsForEvaluationByTest')
    getStudentsForEvaluationByTest(request: GetStudentsForEvaluationByTestRequest) {
        return this.evaluationService.getStudentsForEvaluationByTest(request);
    }
    
    @GrpcMethod(protobufEvaluationService, 'StartTestEvaluation')
    startTestEvaluation(request: StartTestEvaluationRequest) {
        return this.evaluationService.startTestEvaluation(request);
    }
    
    @GrpcMethod(protobufEvaluationService, 'GetTestEvaluationStat')
    getTestEvaluationStat(request: GetTestEvaluationStatRequest) {
        return this.evaluationService.getTestEvaluationStat(request);
    }
    
    @GrpcMethod(protobufEvaluationService, 'QuestionEvaluation')
    questionEvaluation(request: QuestionEvaluationRequest) {
        return this.evaluationService.questionEvaluation(request);
    }
    
    @GrpcMethod(protobufEvaluationService, 'AssignEvaluators')
    assignEvaluators(request: AssignEvaluatorsRequest) {
        return this.evaluationService.assignEvaluators(request);
    }
    
    @GrpcMethod(protobufEvaluationService, 'RemoveEvaluators')
    removeEvaluators(request: RemoveEvaluatorsRequest) {
        return this.evaluationService.removeEvaluators(request);
    }
}