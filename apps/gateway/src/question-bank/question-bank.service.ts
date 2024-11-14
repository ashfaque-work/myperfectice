import { Injectable } from '@nestjs/common';

import { QuestionBankGrpcServiceClientImpl } from '@app/common/grpc-clients/question-bank/question-bank';
import { ApproveStudentExplanationRequest, ApproveStudentExplanationResponse, CountByPracticeRequest, CreateExplanationRequest, CreateExplanationResponse, CreateQuestionRequest, CreateQuestionResponse, CreateTestFormPoolRequest, DeleteQuestionRequest, DeleteQuestionResponse, ExecuteCodeRequest, FeedbackQuestionCountRequest, FeedbackQuestionRequest, GenerateRandomTestRequest, GetAllQuestionRequest, GetAllQuestionResponse, GetByAttemptRequest, GetLastResponse, GetQuestionRequest, GetQuestionResponse, GetQuestionTagsResquest, GetRandomQuestionsRequest, GetReusedCountRequest, InternalSearchDto, InternalSearchRequest, PracticeQuestionsResponse, PracticeSummaryBySubjectResponse, QuestionComplexityByTopicRequest, QuestionDistributionCategoryResponse, QuestionDistributionMarksResponse, QuestionDistributionRequest, QuestionIsAttemptResponse, QuestionPerformanceResponse, QuestionUsedCountResponse, UpdateQuestionRequest, UpdateQuestionResponse, UpdateStudentQuestionRequest, UpdateStudentQuestionResponse, UpdateTagsRequest, UserDto } from '@app/common/dto/question-bank.dto';

@Injectable()
export class QuestionBankService {
  constructor(
    private questionBankGrpcServiceClientImpl: QuestionBankGrpcServiceClientImpl,
  ) { }

  async createQuestion(instancekey: string, request: CreateQuestionRequest, user: UserDto): Promise<CreateQuestionResponse> {
    const combindData = {
      instancekey,
      ...request,
      userData: user,
    }
    return await this.questionBankGrpcServiceClientImpl.CreateQuestion(combindData);
  }

  async getAllQuestion(request: GetAllQuestionRequest): Promise<GetAllQuestionResponse> {
    return await this.questionBankGrpcServiceClientImpl.GetAllQuestion(request);
  }

  async getQuestion(instancekey: string, id: string, relatedTopic?: boolean): Promise<GetQuestionResponse> {
    const combinedData = {
      instancekey,
      _id: id,
      relatedTopic
    }
    return await this.questionBankGrpcServiceClientImpl.GetQuestion(combinedData);
  }

  async updateQuestion(instancekey: string, id: string, request: UpdateQuestionRequest, userId: string): Promise<UpdateQuestionResponse> {
    const combinedData = {
      ...{ _id: id },
      ...request,
      instancekey,
      userId,
    };
    return await this.questionBankGrpcServiceClientImpl.UpdateQuestion(combinedData);
  }

  async deleteQuestion(request: DeleteQuestionRequest): Promise<DeleteQuestionResponse> {
    return await this.questionBankGrpcServiceClientImpl.DeleteQuestion(request);
  }

  async updateStudentQuestion(request: UpdateStudentQuestionRequest): Promise<UpdateStudentQuestionResponse> {
    return await this.questionBankGrpcServiceClientImpl.UpdateStudentQuestion(request);
  }

  async createExplanation(request: CreateExplanationRequest): Promise<CreateExplanationResponse> {
    return await this.questionBankGrpcServiceClientImpl.CreateExplanation(request);
  }

  async approveStudentExplanation(request: ApproveStudentExplanationRequest): Promise<ApproveStudentExplanationResponse> {
    return await this.questionBankGrpcServiceClientImpl.ApproveStudentExplanation(request);
  }

  async questionDistributionByCategory(request: { _id: string, instancekey: string }): Promise<QuestionDistributionCategoryResponse> {
    return await this.questionBankGrpcServiceClientImpl.QuestionDistributionByCategory(request);
  }

  async questionDistributionByMarks(request: { _id: string, instancekey: string }): Promise<QuestionDistributionMarksResponse> {
    return await this.questionBankGrpcServiceClientImpl.QuestionDistributionByMarks(request);
  }

  async practiceSummaryBySubject(request: { practice: string, instancekey: string }): Promise<PracticeSummaryBySubjectResponse> {
    return await this.questionBankGrpcServiceClientImpl.PracticeSummaryBySubject(request);
  }

  async getByPractice(request: { practiceId: string, instancekey: string }): Promise<PracticeQuestionsResponse> {
    return await this.questionBankGrpcServiceClientImpl.GetByPractice(request);
  }

  async questionUsedCount(request): Promise<QuestionUsedCountResponse> {
    return await this.questionBankGrpcServiceClientImpl.QuestionUsedCount(request);
  }

  async questionIsAttempt(instancekey: string, id: string): Promise<QuestionIsAttemptResponse> {
    const combinedData = {
      instancekey,
      id,
    };
    return await this.questionBankGrpcServiceClientImpl.QuestionIsAttempt(combinedData);
  }

  async questionPerformance(instancekey: string, id: string): Promise<QuestionPerformanceResponse> {
    const combinedData = {
      instancekey,
      id,
    };
    return await this.questionBankGrpcServiceClientImpl.QuestionPerformance(combinedData);
  }

  async getLast(instancekey: string, user: string): Promise<GetLastResponse> {
    const combinedData = {
      instancekey,
      user,
    };
    return await this.questionBankGrpcServiceClientImpl.GetLast(combinedData);
  }

  async getLastInPractice(instancekey: string, practice: string, preDate: Date) {
    const combinedData = {
      instancekey,
      practice,
      preDate
    };
    return await this.questionBankGrpcServiceClientImpl.GetLastInPractice(combinedData);
  }

  async search(instancekey: string, params: InternalSearchDto, user: UserDto) {
    const combinedData = {
      instancekey,
      params: params,
      user: user
    }
    return await this.questionBankGrpcServiceClientImpl.Search(combinedData);
  }

  async countByPractice(instancekey: string, practiceId: string, params: CountByPracticeRequest) {
    const combinedData = {
      instancekey,
      practiceId,
      keyword: params.keyword,
      topics: params.topics
    }

    return await this.questionBankGrpcServiceClientImpl.CountByPractice(combinedData);
  }

  async getQuestionTags(request: GetQuestionTagsResquest) {
    return await this.questionBankGrpcServiceClientImpl.GetQuestionTags(request);
  }

  async updateTags(instancekey: string, request: UpdateTagsRequest, userId: string) {
    const combinedData = {
      instancekey,
      ...request,
      userId
    }
    return await this.questionBankGrpcServiceClientImpl.UpdateTags(combinedData);
  }

  async questionSummaryTopic(instancekey: string, id: string, isAllowReuse: string, userId: string) {
    const combinedData = {
      instancekey,
      id,
      isAllowReuse,
      userId
    }
    return await this.questionBankGrpcServiceClientImpl.QuestionSummaryTopic(combinedData);
  }

  async getQuestionForOnlineTest(instancekey: string, id: string) {
    const combinedData = {
      instancekey,
      id,
    }
    return await this.questionBankGrpcServiceClientImpl.GetQuestionForOnlineTest(combinedData);
  }

  async personalTopicAnalysis(instancekey: string, id: string, userId: string) {
    const combinedData = {
      instancekey,
      id,
      userId
    }
    return await this.questionBankGrpcServiceClientImpl.PersonalTopicAnalysis(combinedData);
  }

  async summaryTopicOfPracticeBySubject(instancekey: string, practiceIds: string, unit: string) {
    const combinedData = {
      instancekey,
      practiceIds,
      unit,
    }
    return await this.questionBankGrpcServiceClientImpl.SummaryTopicOfPracticeBySubject(combinedData);
  }

  async summaryTopicPractice(instancekey: string, practice: string, unit: string) {
    const combinedData = {
      instancekey,
      practice,
      unit,
    }
    return await this.questionBankGrpcServiceClientImpl.SummaryTopicPractice(combinedData);
  }

  async summarySubjectPractice(instancekey: string, practice: string) {
    const combinedData = {
      instancekey,
      practice,
    }
    return await this.questionBankGrpcServiceClientImpl.SummarySubjectPractice(combinedData);
  }

  async testSeriesSummaryBySubject(instancekey: string, practice: string) {
    const combinedData = {
      instancekey,
      practice,
    }
    return await this.questionBankGrpcServiceClientImpl.TestSeriesSummaryBySubject(combinedData);
  }

  async getByAttempt(request: GetByAttemptRequest) {
    return await this.questionBankGrpcServiceClientImpl.GetByAttempt(request);
  }

  async getReusedCount(request: GetReusedCountRequest) {
    return await this.questionBankGrpcServiceClientImpl.GetReusedCount(request);
  }

  async feedbackQuestion(request: FeedbackQuestionRequest) {
    return await this.questionBankGrpcServiceClientImpl.FeedbackQuestion(request);
  }

  async feedbackQuestionCount(request: FeedbackQuestionCountRequest) {
    return await this.questionBankGrpcServiceClientImpl.FeedbackQuestionCount(request);
  }

  async questionDistribution(request: QuestionDistributionRequest) {
    return await this.questionBankGrpcServiceClientImpl.QuestionDistribution(request);
  }

  async questionComplexityByTopic(request: QuestionComplexityByTopicRequest) {
    return await this.questionBankGrpcServiceClientImpl.QuestionComplexityByTopic(request);
  }

  async generateRandomTest(request: GenerateRandomTestRequest) {
    return await this.questionBankGrpcServiceClientImpl.GenerateRandomTest(request);
  }

  async getRandomQuestions(request: GetRandomQuestionsRequest) {
    return await this.questionBankGrpcServiceClientImpl.GetRandomQuestions(request);
  }

  async createTestFormPool(request: CreateTestFormPoolRequest) {
    return await this.questionBankGrpcServiceClientImpl.CreateTestFormPool(request);
  }

  async executeCode(request: ExecuteCodeRequest) {
    return await this.questionBankGrpcServiceClientImpl.ExecuteCode(request);
  }
}

