import { Controller, Get } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { GrpcMethod } from '@nestjs/microservices';
import { protobufQuestionBankService } from '@app/common/grpc-clients/question-bank';
import { ApproveStudentExplanationRequest, CountByPracticeRequest, CreateExplanationRequest, CreateQuestionRequest, CreateTestFormPoolRequest, DeleteQuestionRequest, ExecuteCodeRequest, FeedbackQuestionCountRequest, FeedbackQuestionRequest, GenerateRandomTestRequest, GetAllQuestionRequest, GetByAttemptRequest, GetLastInPracticeRequest, GetLastRequest, GetQuestionForOnlineTestRequest, GetQuestionRequest, GetQuestionTagsResquest, GetRandomQuestionsRequest, GetReusedCountRequest, InternalSearchRequest, PersonalTopicAnalysisRequest, QuestionComplexityByTopicRequest, QuestionDistributionRequest, QuestionIsAttemptRequest, QuestionPerformanceRequest, QuestionSummaryTopicRequest, SummarySubjectPracticeRequest, SummaryTopicOfPracticeBySubjectRequest, SummaryTopicPracticeRequest, TestSeriesSummaryBySubjectRequest, UpdateQuestionRequest, UpdateStudentQuestionRequest, UpdateTagsRequest } from '@app/common/dto/question-bank.dto';

@Controller()
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}
  
  @GrpcMethod(protobufQuestionBankService, 'CreateQuestion')
  createQuestion(request: CreateQuestionRequest){
    return this.questionBankService.createQuestion(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'GetAllQuestion')
  getAllQuestion(request: GetAllQuestionRequest){
    return this.questionBankService.getAllQuestion(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'GetQuestion')
  getQuestion(request: GetQuestionRequest) {
    return this.questionBankService.getQuestion(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'UpdateQuestion')
  updateQuestion(request: UpdateQuestionRequest) {
    return this.questionBankService.updateQuestion(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'DeleteQuestion')
  deleteQuestion(request: DeleteQuestionRequest) {
    return this.questionBankService.deleteQuestion(request);
  }
  
  @GrpcMethod(protobufQuestionBankService, 'UpdateStudentQuestion')
  updateStudentQuestion(request: UpdateStudentQuestionRequest) {
    return this.questionBankService.updateStudentQuestion(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'CreateExplanation')
  createExplanation(request: CreateExplanationRequest) {
    return this.questionBankService.createExplanation(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'ApproveStudentExplanation')
  approveStudentExplanation(request: ApproveStudentExplanationRequest){
    return this.questionBankService.approveStudentExplanation(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'QuestionDistributionByCategory')
  questionDistributionByCategory(request: {_id: string}){
    return this.questionBankService.questionDistributionByCategory(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'QuestionDistributionByMarks')
  questionDistributionByMarks(request: {_id: string}){
    return this.questionBankService.questionDistributionByMarks(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'PracticeSummaryBySubject')
  practiceSummaryBySubject(request: {practice: string}){
    return this.questionBankService.practiceSummaryBySubject(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'GetByPractice')
  getByPractice(request: {practiceId: string}){
    return this.questionBankService.getByPractice(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'QuestionUsedCount')
  questionUsedCount(){
    return this.questionBankService.questionUsedCount();
  }

  @GrpcMethod(protobufQuestionBankService, 'QuestionIsAttempt')
  questionIsAttempt(request: QuestionIsAttemptRequest){
    return this.questionBankService.questionIsAttempt(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'QuestionPerformance')
  questionPerformance(request: QuestionPerformanceRequest){
    return this.questionBankService.questionPerformance(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'GetLast')
  getLast(request: GetLastRequest){
    return this.questionBankService.getLast(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'GetLastInPractice')
  getLastInPractice(request: GetLastInPracticeRequest){
    return this.questionBankService.getLastInPractice(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'Search')
  search(request: InternalSearchRequest){
    return this.questionBankService.search(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'CountByPractice')
  countByPractice(request: CountByPracticeRequest){
    return this.questionBankService.countByPractice(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'GetQuestionTags')
  getQuestionTags(request: GetQuestionTagsResquest){
    return this.questionBankService.getQuestionTags(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'UpdateTags')
  updateTags(request: UpdateTagsRequest){
    return this.questionBankService.updateTags(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'QuestionSummaryTopic')
  questionSummaryTopic(request: QuestionSummaryTopicRequest){
    return this.questionBankService.questionSummaryTopic(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'GetQuestionForOnlineTest')
  GetQuestionForOnlineTest(request: GetQuestionForOnlineTestRequest){
    return this.questionBankService.getQuestionForOnlineTest(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'PersonalTopicAnalysis')
  PersonalTopicAnalysis(request: PersonalTopicAnalysisRequest){
    return this.questionBankService.personalTopicAnalysis(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'SummaryTopicOfPracticeBySubject')
  SummaryTopicOfPracticeBySubject(request: SummaryTopicOfPracticeBySubjectRequest){
    return this.questionBankService.summaryTopicOfPracticeBySubject(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'SummaryTopicPractice')
  summaryTopicPractice(request: SummaryTopicPracticeRequest){
    return this.questionBankService.summaryTopicPractice(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'SummarySubjectPractice')
  summarySubjectPractice(request: SummarySubjectPracticeRequest){
    return this.questionBankService.summarySubjectPractice(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'TestSeriesSummaryBySubject')
  testSeriesSummaryBySubject(request: TestSeriesSummaryBySubjectRequest){
    return this.questionBankService.testSeriesSummaryBySubject(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'GetByAttempt')
  getByAttempt(request: GetByAttemptRequest){
    return this.questionBankService.getByAttempt(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'GetReusedCount')
  getReusedCount(request: GetReusedCountRequest){
    return this.questionBankService.getReusedCount(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'FeedbackQuestion')
  feedbackQuestion(request: FeedbackQuestionRequest){
    return this.questionBankService.feedbackQuestion(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'FeedbackQuestionCount')
  feedbackQuestionCount(request: FeedbackQuestionCountRequest){
    return this.questionBankService.feedbackQuestionCount(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'QuestionDistribution')
  questionDistribution(request: QuestionDistributionRequest){
    return this.questionBankService.questionDistribution(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'QuestionComplexityByTopic')
  questionComplexityByTopic(request: QuestionComplexityByTopicRequest){
    return this.questionBankService.questionComplexityByTopic(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'GenerateRandomTest')
  generateRandomTest(request: GenerateRandomTestRequest){
    return this.questionBankService.generateRandomTest(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'GetRandomQuestions')
  getRandomQuestions(request: GetRandomQuestionsRequest){
    return this.questionBankService.getRandomQuestions(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'CreateTestFormPool')
  createTestFormPool(request: CreateTestFormPoolRequest){
    return this.questionBankService.createTestFormPool(request);
  }

  @GrpcMethod(protobufQuestionBankService, 'ExecuteCode')
  executeCode(request: ExecuteCodeRequest){
    return this.questionBankService.executeCode(request);
  }
}

