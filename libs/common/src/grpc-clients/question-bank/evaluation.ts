import { AssignEvaluatorsRequest, AssignEvaluatorsResponse, FindEvaluatorsRequest, FindEvaluatorsResponse, GetAssignedTestsRequest, GetAssignedTestsResponse, GetPendingTestsRequest, GetPendingTestsResponse, GetQuestionEvaluationsByTestRequest, GetQuestionEvaluationsByTestResponse, GetQuestionsForEvaluationRequest, GetQuestionsForEvaluationResponse, GetStudentsForEvaluationByTestRequest, GetStudentsForEvaluationByTestResponse, GetTestEvaluationStatRequest, GetTestEvaluationStatResponse, GetUnassignedTestsRequest, GetUnassignedTestsResponse, QuestionEvaluationRequest, QuestionEvaluationResponse, RemoveEvaluatorsRequest, RemoveEvaluatorsResponse, StartTestEvaluationRequest, StartTestEvaluationResponse } from '@app/common/dto/question-bank.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufEvaluationService = 'QuestionBankGrpcService';
export interface EvaluationGrpcInterface {
    GetAssignedTests(request: GetAssignedTestsRequest): Promise<GetAssignedTestsResponse>;
    GetUnassignedTests(request: GetUnassignedTestsRequest): Promise<GetUnassignedTestsResponse>;
    FindEvaluators(request: FindEvaluatorsRequest): Promise<FindEvaluatorsResponse>;
    GetQuestionsForEvaluation(request: GetQuestionsForEvaluationRequest): Promise<GetQuestionsForEvaluationResponse>;
    GetPendingTests(request: GetPendingTestsRequest): Promise<GetPendingTestsResponse>;
    GetQuestionEvaluationsByTest(request: GetQuestionEvaluationsByTestRequest): Promise<GetQuestionEvaluationsByTestResponse>;
    GetStudentsForEvaluationByTest(request: GetStudentsForEvaluationByTestRequest): Promise<GetStudentsForEvaluationByTestResponse>;
    StartTestEvaluation(request: StartTestEvaluationRequest): Promise<StartTestEvaluationResponse>;
    GetTestEvaluationStat(request: GetTestEvaluationStatRequest): Promise<GetTestEvaluationStatResponse>;
    QuestionEvaluation(request: QuestionEvaluationRequest): Promise<QuestionEvaluationResponse>;
    AssignEvaluators(request: AssignEvaluatorsRequest): Promise<AssignEvaluatorsResponse>;
    RemoveEvaluators(request: RemoveEvaluatorsRequest): Promise<RemoveEvaluatorsResponse>;
}
@Injectable()
export class EvaluationGrpcServiceClientImpl implements EvaluationGrpcInterface {
    private evaluationGrpcServiceClient: EvaluationGrpcInterface;
    private readonly logger = new Logger(EvaluationGrpcServiceClientImpl.name)
    constructor(
        @Inject('questionBankGrpcService') private evaluationGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.evaluationGrpcServiceClient = this.evaluationGrpcClient.getService<EvaluationGrpcInterface>(
            protobufEvaluationService
        );
        this.logger.debug('gRPC client initalized.');
    }

    async GetAssignedTests(request: GetAssignedTestsRequest): Promise<GetAssignedTestsResponse> {
        return await this.evaluationGrpcServiceClient.GetAssignedTests(request)
    }
    
    async GetUnassignedTests(request: GetUnassignedTestsRequest): Promise<GetUnassignedTestsResponse> {
        return await this.evaluationGrpcServiceClient.GetUnassignedTests(request)
    }
    
    async FindEvaluators(request: FindEvaluatorsRequest): Promise<FindEvaluatorsResponse> {
        return await this.evaluationGrpcServiceClient.FindEvaluators(request)
    }
    
    async GetQuestionsForEvaluation(request: GetQuestionsForEvaluationRequest): Promise<GetQuestionsForEvaluationResponse> {
        return await this.evaluationGrpcServiceClient.GetQuestionsForEvaluation(request)
    }
    
    async GetPendingTests(request: GetPendingTestsRequest): Promise<GetPendingTestsResponse> {
        return await this.evaluationGrpcServiceClient.GetPendingTests(request)
    }
    
    async GetQuestionEvaluationsByTest(request: GetQuestionEvaluationsByTestRequest): Promise<GetQuestionEvaluationsByTestResponse> {
        return await this.evaluationGrpcServiceClient.GetQuestionEvaluationsByTest(request)
    }

    async GetStudentsForEvaluationByTest(request: GetStudentsForEvaluationByTestRequest): Promise<GetStudentsForEvaluationByTestResponse> {
        return await this.evaluationGrpcServiceClient.GetStudentsForEvaluationByTest(request)
    }
    
    async StartTestEvaluation(request: StartTestEvaluationRequest): Promise<StartTestEvaluationResponse> {
        return await this.evaluationGrpcServiceClient.StartTestEvaluation(request)
    }
    
    async GetTestEvaluationStat(request: GetTestEvaluationStatRequest): Promise<GetTestEvaluationStatResponse> {
        return await this.evaluationGrpcServiceClient.GetTestEvaluationStat(request)
    }
    
    async QuestionEvaluation(request: QuestionEvaluationRequest): Promise<QuestionEvaluationResponse> {
        return await this.evaluationGrpcServiceClient.QuestionEvaluation(request)
    }
    
    async AssignEvaluators(request: AssignEvaluatorsRequest): Promise<AssignEvaluatorsResponse> {
        return await this.evaluationGrpcServiceClient.AssignEvaluators(request)
    }
    
    async RemoveEvaluators(request: RemoveEvaluatorsRequest): Promise<RemoveEvaluatorsResponse> {
        return await this.evaluationGrpcServiceClient.RemoveEvaluators(request)
    }    
}