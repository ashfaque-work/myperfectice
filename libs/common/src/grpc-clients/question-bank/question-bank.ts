import { ApproveStudentExplanationRequest, ApproveStudentExplanationResponse, CountByPracticeRequest, CountByPracticeResponse, CreateExplanationRequest, CreateExplanationResponse, CreateQuestionRequest, CreateQuestionResponse, CreateTestFormPoolRequest, CreateTestFormPoolResponse, DeleteQuestionRequest, DeleteQuestionResponse, ExecuteCodeRequest, ExecuteCodeResponse, FeedbackQuestionCountRequest, FeedbackQuestionCountResponse, FeedbackQuestionRequest, FeedbackQuestionResponse, GenerateRandomTestRequest, GenerateRandomTestResponse, GetAllQuestionRequest, GetAllQuestionResponse, GetByAttemptRequest, GetByAttemptResponse, GetLastInPracticeRequest, GetLastInPracticeResponse, GetLastRequest, GetLastResponse, GetQuestionForOnlineTestRequest, GetQuestionForOnlineTestResponse, GetQuestionRequest, GetQuestionResponse, GetQuestionTagsResponse, GetQuestionTagsResquest, GetRandomQuestionsRequest, GetRandomQuestionsResponse, GetReusedCountRequest, GetReusedCountResponse, InternalSearchRequest, InternalSearchResponse, PersonalTopicAnalysisRequest, PersonalTopicAnalysisResponse, PracticeQuestionsResponse, PracticeSummaryBySubjectResponse, QuestionComplexityByTopicRequest, QuestionComplexityByTopicResponse, QuestionDistributionCategoryResponse, QuestionDistributionMarksResponse, QuestionDistributionRequest, QuestionDistributionResponse, QuestionIsAttemptRequest, QuestionIsAttemptResponse, QuestionPerformanceRequest, QuestionPerformanceResponse, QuestionSummaryTopicRequest, QuestionSummaryTopicResponse, QuestionUsedCountResponse, SummarySubjectPracticeRequest, SummarySubjectPracticeResponse, SummaryTopicOfPracticeBySubjectRequest, SummaryTopicOfPracticeBySubjectResponse, SummaryTopicPracticeRequest, SummaryTopicPracticeResponse, TestSeriesSummaryBySubjectRequest, TestSeriesSummaryBySubjectResponse, UpdateQuestionRequest, UpdateQuestionResponse, UpdateStudentQuestionRequest, UpdateStudentQuestionResponse, UpdateTagsRequest, UpdateTagsResponse } from '@app/common/dto/question-bank.dto';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufQuestionBankPackage = 'questionbank';
export const protobufQuestionBankService = 'QuestionBankGrpcService';

export interface QuestionBankGrpcInterface {
  CreateQuestion(request: CreateQuestionRequest): Promise<CreateQuestionResponse>;
  GetAllQuestion(request: GetAllQuestionRequest): Promise<GetAllQuestionResponse>;
  GetQuestion(request: GetQuestionRequest): Promise<GetQuestionResponse>;
  UpdateQuestion(request: UpdateQuestionRequest): Promise<UpdateQuestionResponse>;
  DeleteQuestion(request: DeleteQuestionRequest): Promise<DeleteQuestionResponse>;
  UpdateStudentQuestion(request: UpdateStudentQuestionRequest): Promise<UpdateStudentQuestionResponse>;
  CreateExplanation(request: CreateExplanationRequest): Promise<CreateExplanationResponse>;
  ApproveStudentExplanation(request: ApproveStudentExplanationRequest): Promise<ApproveStudentExplanationResponse>;
  QuestionDistributionByCategory(request: { _id: string, instancekey: string }): Promise<QuestionDistributionCategoryResponse>;
  QuestionDistributionByMarks(request: { _id: string, instancekey: string }): Promise<QuestionDistributionMarksResponse>;
  PracticeSummaryBySubject(request: { practice: string, instancekey: string }): Promise<PracticeSummaryBySubjectResponse>;
  GetByPractice(request: { practiceId: string, instancekey: string }): Promise<PracticeQuestionsResponse>;
  QuestionUsedCount(request): Promise<QuestionUsedCountResponse>;
  QuestionIsAttempt(request: QuestionIsAttemptRequest): Promise<QuestionIsAttemptResponse>;
  QuestionPerformance(request: QuestionPerformanceRequest): Promise<QuestionPerformanceResponse>;
  GetLast(request: GetLastRequest): Promise<GetLastResponse>;
  GetLastInPractice(request: GetLastInPracticeRequest): Promise<GetLastInPracticeResponse>;
  Search(request: InternalSearchRequest): Promise<InternalSearchResponse>;
  CountByPractice(request: CountByPracticeRequest): Promise<CountByPracticeResponse>;
  GetQuestionTags(request: GetQuestionTagsResquest): Promise<GetQuestionTagsResponse>;
  UpdateTags(request: UpdateTagsRequest): Promise<UpdateTagsResponse>;
  QuestionSummaryTopic(request: QuestionSummaryTopicRequest): Promise<QuestionSummaryTopicResponse>;
  GetQuestionForOnlineTest(request: GetQuestionForOnlineTestRequest): Promise<GetQuestionForOnlineTestResponse>;
  PersonalTopicAnalysis(request: PersonalTopicAnalysisRequest): Promise<PersonalTopicAnalysisResponse>;
  SummaryTopicOfPracticeBySubject(request: SummaryTopicOfPracticeBySubjectRequest): Promise<SummaryTopicOfPracticeBySubjectResponse>;
  SummaryTopicPractice(request: SummaryTopicPracticeRequest): Promise<SummaryTopicPracticeResponse>;
  SummarySubjectPractice(request: SummarySubjectPracticeRequest): Promise<SummarySubjectPracticeResponse>;
  TestSeriesSummaryBySubject(request: TestSeriesSummaryBySubjectRequest): Promise<TestSeriesSummaryBySubjectResponse>;
  GetByAttempt(request: GetByAttemptRequest): Promise<GetByAttemptResponse>;
  GetReusedCount(request: GetReusedCountRequest): Promise<GetReusedCountResponse>;
  FeedbackQuestion(request: FeedbackQuestionRequest): Promise<FeedbackQuestionResponse>;
  FeedbackQuestionCount(request: FeedbackQuestionCountRequest): Promise<FeedbackQuestionCountResponse>;
  QuestionDistribution(request: QuestionDistributionRequest): Promise<QuestionDistributionResponse>;
  QuestionComplexityByTopic(request: QuestionComplexityByTopicRequest): Promise<QuestionComplexityByTopicResponse>;
  GenerateRandomTest(request: GenerateRandomTestRequest): Promise<GenerateRandomTestResponse>;
  GetRandomQuestions(request: GetRandomQuestionsRequest): Promise<GetRandomQuestionsResponse>;
  CreateTestFormPool(request: CreateTestFormPoolRequest): Promise<CreateTestFormPoolResponse>
  ExecuteCode(request: ExecuteCodeRequest): Promise<ExecuteCodeResponse>
}

@Injectable()
export class QuestionBankGrpcServiceClientImpl implements QuestionBankGrpcInterface {
  private questionBankGrpcServiceClient: QuestionBankGrpcInterface;
  constructor(
    @Inject('questionBankGrpcService') private questionBankGrpcClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.questionBankGrpcServiceClient =
      this.questionBankGrpcClient.getService<QuestionBankGrpcInterface>(
        protobufQuestionBankService,
      );
  }

  async CreateQuestion(request: CreateQuestionRequest): Promise<CreateQuestionResponse> {
    return await this.questionBankGrpcServiceClient.CreateQuestion(request);
  }

  async GetAllQuestion(request: GetAllQuestionRequest): Promise<GetAllQuestionResponse> {
    return await this.questionBankGrpcServiceClient.GetAllQuestion(request);
  }

  async GetQuestion(request: GetQuestionRequest): Promise<GetQuestionResponse> {
    return await this.questionBankGrpcServiceClient.GetQuestion(request);
  }

  async UpdateQuestion(request: UpdateQuestionRequest): Promise<UpdateQuestionResponse> {
    return await this.questionBankGrpcServiceClient.UpdateQuestion(request);
  }

  async DeleteQuestion(request: DeleteQuestionRequest): Promise<DeleteQuestionResponse> {
    return await this.questionBankGrpcServiceClient.DeleteQuestion(request);
  }

  async UpdateStudentQuestion(request: UpdateStudentQuestionRequest): Promise<UpdateStudentQuestionResponse> {
    return await this.questionBankGrpcServiceClient.UpdateStudentQuestion(request);
  }

  async CreateExplanation(request: CreateExplanationRequest): Promise<CreateExplanationResponse> {
    return await this.questionBankGrpcServiceClient.CreateExplanation(request);
  }

  async ApproveStudentExplanation(request: ApproveStudentExplanationRequest): Promise<ApproveStudentExplanationResponse> {
    return await this.questionBankGrpcServiceClient.ApproveStudentExplanation(request);
  }

  async QuestionDistributionByCategory(request: { _id: string, instancekey: string }): Promise<QuestionDistributionCategoryResponse> {
    return await this.questionBankGrpcServiceClient.QuestionDistributionByCategory(request);
  }

  async QuestionDistributionByMarks(request: { _id: string, instancekey: string }): Promise<QuestionDistributionMarksResponse> {
    return await this.questionBankGrpcServiceClient.QuestionDistributionByMarks(request);
  }

  async PracticeSummaryBySubject(request: { practice: string, instancekey: string }): Promise<PracticeSummaryBySubjectResponse> {
    return await this.questionBankGrpcServiceClient.PracticeSummaryBySubject(request);
  }

  async GetByPractice(request: { practiceId: string, instancekey: string }): Promise<PracticeQuestionsResponse> {
    return await this.questionBankGrpcServiceClient.GetByPractice(request);
  }

  async QuestionUsedCount(request): Promise<QuestionUsedCountResponse> {
    return await this.questionBankGrpcServiceClient.QuestionUsedCount(request);
  }

  async QuestionIsAttempt(request: QuestionIsAttemptRequest): Promise<QuestionIsAttemptResponse> {
    return await this.questionBankGrpcServiceClient.QuestionIsAttempt(request);
  }

  async QuestionPerformance(request: QuestionPerformanceRequest): Promise<QuestionPerformanceResponse> {
    return await this.questionBankGrpcServiceClient.QuestionPerformance(request);
  }

  async GetLast(request: GetLastRequest): Promise<GetLastResponse> {
    return await this.questionBankGrpcServiceClient.GetLast(request);
  }

  async GetLastInPractice(request: GetLastInPracticeRequest): Promise<GetLastInPracticeResponse> {
    return await this.questionBankGrpcServiceClient.GetLastInPractice(request);
  }

  async Search(request: InternalSearchRequest): Promise<InternalSearchResponse> {
    return await this.questionBankGrpcServiceClient.Search(request);
  }

  async CountByPractice(request: CountByPracticeRequest): Promise<CountByPracticeResponse> {
    return await this.questionBankGrpcServiceClient.CountByPractice(request);
  }

  async GetQuestionTags(request: GetQuestionTagsResquest): Promise<GetQuestionTagsResponse> {
    return await this.questionBankGrpcServiceClient.GetQuestionTags(request);
  }

  async UpdateTags(request: UpdateTagsRequest): Promise<UpdateTagsResponse> {
    return await this.questionBankGrpcServiceClient.UpdateTags(request);
  }

  async QuestionSummaryTopic(request: QuestionSummaryTopicRequest): Promise<QuestionSummaryTopicResponse> {
    return await this.questionBankGrpcServiceClient.QuestionSummaryTopic(request);
  }

  async GetQuestionForOnlineTest(request: GetQuestionForOnlineTestRequest): Promise<GetQuestionForOnlineTestResponse> {
    return await this.questionBankGrpcServiceClient.GetQuestionForOnlineTest(request);
  }

  async PersonalTopicAnalysis(request: PersonalTopicAnalysisRequest): Promise<PersonalTopicAnalysisResponse> {
    return await this.questionBankGrpcServiceClient.PersonalTopicAnalysis(request);
  }

  async SummaryTopicOfPracticeBySubject(request: SummaryTopicOfPracticeBySubjectRequest): Promise<SummaryTopicOfPracticeBySubjectResponse> {
    return await this.questionBankGrpcServiceClient.SummaryTopicOfPracticeBySubject(request);
  }

  async SummaryTopicPractice(request: SummaryTopicPracticeRequest): Promise<SummaryTopicPracticeResponse> {
    return await this.questionBankGrpcServiceClient.SummaryTopicPractice(request);
  }

  async SummarySubjectPractice(request: SummarySubjectPracticeRequest): Promise<SummarySubjectPracticeResponse> {
    return await this.questionBankGrpcServiceClient.SummarySubjectPractice(request);
  }

  async TestSeriesSummaryBySubject(request: TestSeriesSummaryBySubjectRequest): Promise<TestSeriesSummaryBySubjectResponse> {
    return await this.questionBankGrpcServiceClient.TestSeriesSummaryBySubject(request);
  }

  async GetByAttempt(request: GetByAttemptRequest): Promise<GetByAttemptResponse> {
    return await this.questionBankGrpcServiceClient.GetByAttempt(request);
  }

  async GetReusedCount(request: GetReusedCountRequest): Promise<GetReusedCountResponse> {
    return await this.questionBankGrpcServiceClient.GetReusedCount(request);
  }

  async FeedbackQuestion(request: FeedbackQuestionRequest): Promise<FeedbackQuestionResponse> {
    return await this.questionBankGrpcServiceClient.FeedbackQuestion(request);
  }

  async FeedbackQuestionCount(request: FeedbackQuestionCountRequest): Promise<FeedbackQuestionCountResponse> {
    return await this.questionBankGrpcServiceClient.FeedbackQuestionCount(request);
  }

  async QuestionDistribution(request: QuestionDistributionRequest): Promise<QuestionDistributionResponse> {
    return await this.questionBankGrpcServiceClient.QuestionDistribution(request);
  }

  async QuestionComplexityByTopic(request: QuestionComplexityByTopicRequest): Promise<QuestionComplexityByTopicResponse> {
    return await this.questionBankGrpcServiceClient.QuestionComplexityByTopic(request);
  }

  async GenerateRandomTest(request: GenerateRandomTestRequest): Promise<GenerateRandomTestResponse> {
    return await this.questionBankGrpcServiceClient.GenerateRandomTest(request);
  }

  async GetRandomQuestions(request: GetRandomQuestionsRequest): Promise<GetRandomQuestionsResponse> {
    return await this.questionBankGrpcServiceClient.GetRandomQuestions(request);
  }

  async CreateTestFormPool(request: CreateTestFormPoolRequest): Promise<CreateTestFormPoolResponse> {
    return await this.questionBankGrpcServiceClient.CreateTestFormPool(request);
  }
  
  async ExecuteCode(request: ExecuteCodeRequest): Promise<ExecuteCodeResponse> {
    return await this.questionBankGrpcServiceClient.ExecuteCode(request);
  }
}