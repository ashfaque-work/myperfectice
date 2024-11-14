import { Injectable } from '@nestjs/common';
import {
  ChangeOwnershipRequest,
  CheckSectionQuestionRequest,
  CreateAssessmentRequest,
  CreateAssessmentResponse,
  EndTestSessionRequest,
  EnrollTestRequest,
  EnrollTestResponse,
  FindPracticeSetsRequest,
  FindProctorTestRequest,
  FindTestBySessionRequest,
  GetAllAssessmentResponse,
  GetAssessmentRequest,
  GetAssessmentResponse,
  GetAttendanceStatusRequest,
  GetAttendantsRequest,
  GetAvgRatingByAssessmentRequest,
  GetfeedbackRatingByAssessmentRequest,
  GetMaximumTestMarksRequest,
  GetPracticesetClassroomsRequest,
  GetPublicTestsRequest,
  GetQuestionFeedbackRequest,
  GetQuestionListRequest,
  GetTestLimitRequest,
  OngoingTestByUserRequest,
  PublisherAssessmentRequest,
  PublisherAssessmentResponse,
  ResetIpRestrictionRequest,
  StartTestSessionRequest,
  UpcomingTestsRequest,
  UpdateAllQuestionSectionRequest,
  UpdateAllQuestionSectionResponse,
  UpdateAssessmentRequest,
  UpdateAssessmentResponse,
  UpdateAttendanceLimitRequest,
  UpdateQuestionSectionRequest,
  FindByAttemptRequest,
  CountByAttemptRequest,
  CountPracticeRequest,
  FindOneSharedRequest,
  GetLastTestMeRequest,
  FindOneWithQuestionsRequest,
  ListPublisherRequest,
  ListUnitRequest,
  CountByExamIdRequest,
  FindByExamIdRequest,
  ProcessingDocmRequest,
  SearchOneRequest,
  CheckQuestionsBeforePublishRequest,
  FindQuestionTemporaryRequest,
  ImportQuestionRequest,
  RemoveQuestionRequest,
  TestBySubjectRequest,
  TestByTopicRequest,
  TopicQuestionDistributionByCategoryRequest,
  RecommendedTestsBySubjectRequest,
  RecentTestByUserRequest,
  SearchTestsRequest,
  SearchUnitsRequest,
  ArchiveRequest,
  CompletedTestByClassRequest,
  CompletedTestStudentsByClassRequest,
  UpcomingTestByClassRequest,
  SaveAsRequest,
  FindOneForSessionRequest,
  FindForMentorRequest,
  GetBuyModeTestForTeacherRequest,
  UpdateAttendanceRequest,
  ResetTerminatedAttemptRequest,
  UpdateQuestionOrderRequest,
  DestroyPracticeRequest,
  DestroyPracticeResponse,
  TestDetailsRequest,
  TestDetailsResponse,
  FindAllResponse,
  FindAllRequest,
  GetOpeningGamesRequest,
  GetOpeningGamesResponse,
  GetGameHistoryRequest,
  GetGameHistoryResponse,
  GetGameRequest,
  GetGameResponse,
  NewGameResponse,
  NewGameRequest,
  GetFeedbacksRequest,
  GetByTestSeriesRequest,
  FindTestByTestCodeRequest,
  OngoingTestByClassRequest,
  OngoingAttemptsRequest,
  TodayProctoredTestsRequest,
  GetSessionTimesRequest,
  ShareLinkRequest,
  CheckTestCodeRequest,
  ExportPDFRequest,
  FraudCheckRequest,
  GetStudentTakingTestRequest,
  ImportFileReq,
  ExportTestReq,
  PlayGameRequest,
  FindForTeacherRequest
} from '@app/common/dto/assessment.dto';
import { AssessmentGrpcServiceClientImpl } from '@app/common/grpc-clients/assessment/assessment';

@Injectable()
export class AssessmentService {
  constructor(
    private assessmentGrpcServiceClientImpl: AssessmentGrpcServiceClientImpl,
  ) { }

  async createAssessment(request: CreateAssessmentRequest): Promise<CreateAssessmentResponse> {
    return await this.assessmentGrpcServiceClientImpl.CreateAssessment(request);
  }

  async getAllAssessment({ }): Promise<GetAllAssessmentResponse> {
    return await this.assessmentGrpcServiceClientImpl.GetAllAssessment({});
  }

  async getAssessment(request: GetAssessmentRequest): Promise<GetAssessmentResponse> {
    return await this.assessmentGrpcServiceClientImpl.GetAssessment(request);
  }

  async updateAssessment(request: UpdateAssessmentRequest): Promise<UpdateAssessmentResponse> {
    return await this.assessmentGrpcServiceClientImpl.UpdateAssessment(request);
  }


  async enrollTest(request: EnrollTestRequest): Promise<EnrollTestResponse> {
    return await this.assessmentGrpcServiceClientImpl.EnrollTest(request);
  }
  async getPublisherAssessments(request: PublisherAssessmentRequest): Promise<PublisherAssessmentResponse> {
    return await this.assessmentGrpcServiceClientImpl.GetPublisherAssessments(request);
  }

  async updateAllQuestionSection(request: UpdateAllQuestionSectionRequest): Promise<UpdateAllQuestionSectionResponse> {
    return await this.assessmentGrpcServiceClientImpl.UpdateAllQuestionSection(request);
  }

  async getPublicTest(request: GetPublicTestsRequest) {    
    return await this.assessmentGrpcServiceClientImpl.GetPublicTest(request);
  }

  async getMaximumTestMarks(request: GetMaximumTestMarksRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetMaximumTestMarks(request);
  }

  async getQuestionFeedback(request: GetQuestionFeedbackRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetQuestionFeedback(request);
  }

  async startTestSession(request: StartTestSessionRequest) {
    return await this.assessmentGrpcServiceClientImpl.StartTestSession(request);
  }

  async endTestSession(request: EndTestSessionRequest) {
    return await this.assessmentGrpcServiceClientImpl.EndTestSession(request);
  }

  async getAttendants(request: GetAttendantsRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetAttendants(request);
  }

  async resetIpRestriction(request: ResetIpRestrictionRequest) {
    return await this.assessmentGrpcServiceClientImpl.ResetIpRestriction(request);
  }

  async updateAttendanceLimit(request: UpdateAttendanceLimitRequest) {
    return await this.assessmentGrpcServiceClientImpl.UpdateAttendanceLimit(request);
  }

  async findPracticeSets(request: FindPracticeSetsRequest) {
    return await this.assessmentGrpcServiceClientImpl.FindPracticeSets(request);
  }

  async getAttendanceStatus(request: GetAttendanceStatusRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetAttendanceStatus(request);
  }

  async changeOwnership(request: ChangeOwnershipRequest) {
    return await this.assessmentGrpcServiceClientImpl.ChangeOwnership(request);
  }

  async getTestLimit(request: GetTestLimitRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetTestLimit(request);
  }

  async findProctorTest(request: FindProctorTestRequest) {
    return await this.assessmentGrpcServiceClientImpl.FindProctorTest(request);
  }

  async ongoingTestByUser(request: OngoingTestByUserRequest) {
    return await this.assessmentGrpcServiceClientImpl.OngoingTestByUser(request);
  }

  async findTestBySession(request: FindTestBySessionRequest) {
    return await this.assessmentGrpcServiceClientImpl.FindTestBySession(request);
  }

  async upcomingTests(request: UpcomingTestsRequest) {
    return await this.assessmentGrpcServiceClientImpl.UpcomingTests(request);
  }
  
  async getAvgRatingByAssessment(request: GetAvgRatingByAssessmentRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetAvgRatingByAssessment(request);
  }

  async getfeedbackRatingByAssessment(request: GetfeedbackRatingByAssessmentRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetfeedbackRatingByAssessment(request);
  }

  async getQuestionList(request: GetQuestionListRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetQuestionList(request);
  }

  async updateQuestionSection(request: UpdateQuestionSectionRequest) {
    return await this.assessmentGrpcServiceClientImpl.UpdateQuestionSection(request);
  }

  async getPracticesetClassrooms(request: GetPracticesetClassroomsRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetPracticesetClassrooms(request);
  }

  async checkSectionQuestion(request: CheckSectionQuestionRequest) {
    return await this.assessmentGrpcServiceClientImpl.CheckSectionQuestion(request);
  }
  
  async findPracticeAttempted(request: FindByAttemptRequest) {
    return await this.assessmentGrpcServiceClientImpl.FindPracticeAttempted(request);
  }

  async countPracticeAttempted(request: CountByAttemptRequest) {
    return await this.assessmentGrpcServiceClientImpl.CountPracticeAttempted(request);
  }

  async countPractice(request: CountPracticeRequest) {
    return await this.assessmentGrpcServiceClientImpl.CountPractice(request);
  }
  
  async getLastTest(request: GetLastTestMeRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetLastTest(request);
  }

  async listPublisher(request: ListPublisherRequest) {
    return await this.assessmentGrpcServiceClientImpl.ListPublisher(request);
  }

  async listUnit(request: ListUnitRequest) {
    return await this.assessmentGrpcServiceClientImpl.ListUnit(request);
  }
  
  async testBySubject(request: TestBySubjectRequest) {
    return await this.assessmentGrpcServiceClientImpl.TestBySubject(request);
  }

  async testByTopic(request: TestByTopicRequest) {
    return await this.assessmentGrpcServiceClientImpl.TestByTopic(request);
  }

  async topicQuestionDistributionByCategory(request: TopicQuestionDistributionByCategoryRequest) {
    return await this.assessmentGrpcServiceClientImpl.TopicQuestionDistributionByCategory(request);
  }

  async findOneWithTotalQuestion(request: FindOneSharedRequest) {
    return await this.assessmentGrpcServiceClientImpl.FindOneWithTotalQuestion(request);
  }
  
  async countByExamId(request: CountByExamIdRequest) {
    return await this.assessmentGrpcServiceClientImpl.CountByExamId(request);
  }

  async findByExamId(request: FindByExamIdRequest) {
    return await this.assessmentGrpcServiceClientImpl.FindByExamId(request);
  }

  async processingDocm(request: ProcessingDocmRequest) {
    return await this.assessmentGrpcServiceClientImpl.ProcessingDocm(request);
  }
  
  async updateAttendance(request: UpdateAttendanceRequest) {
    return await this.assessmentGrpcServiceClientImpl.UpdateAttendance(request);
  }
  
  async resetTerminatedAttempt(request: ResetTerminatedAttemptRequest) {
    return await this.assessmentGrpcServiceClientImpl.ResetTerminatedAttempt(request);
  }
  
  async updateQuestionOrder(request: UpdateQuestionOrderRequest) {
    return await this.assessmentGrpcServiceClientImpl.UpdateQuestionOrder(request);
  }

  async destroy(request: DestroyPracticeRequest): Promise<DestroyPracticeResponse> {
    return await this.assessmentGrpcServiceClientImpl.Destroy(request);
  }
  
  async testDetails(request: TestDetailsRequest): Promise<TestDetailsResponse> {
    return await this.assessmentGrpcServiceClientImpl.TestDetails(request);
  }
  
  async index(request: FindAllRequest): Promise<FindAllResponse> {
    return await this.assessmentGrpcServiceClientImpl.Index(request);
  }
  
  async getOpeningGames(request: GetOpeningGamesRequest): Promise<GetOpeningGamesResponse> {
    return await this.assessmentGrpcServiceClientImpl.GetOpeningGames(request);
  }
  
  async getGameHistory(request: GetGameHistoryRequest): Promise<GetGameHistoryResponse> {
    return await this.assessmentGrpcServiceClientImpl.GetGameHistory(request);
  }
  
  async getGame(request: GetGameRequest): Promise<GetGameResponse> {
    return await this.assessmentGrpcServiceClientImpl.GetGame(request);
  }
  
  async newGame(request: NewGameRequest): Promise<NewGameResponse> {
    return await this.assessmentGrpcServiceClientImpl.NewGame(request);
  }
  
  async checkQuestionsBeforePublish(request: CheckQuestionsBeforePublishRequest) {
    return await this.assessmentGrpcServiceClientImpl.CheckQuestionsBeforePublish(request);
  }
  
  async getFeedbacks(request: GetFeedbacksRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetFeedbacks(request);
  }

  async searchOne(request: SearchOneRequest) {
    return await this.assessmentGrpcServiceClientImpl.SearchOne(request);
  }

  async findQuestionTemporary(request: FindQuestionTemporaryRequest) {
    return await this.assessmentGrpcServiceClientImpl.FindQuestionTemporary(request);
  }
  
  async getByTestSeries(request: GetByTestSeriesRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetByTestSeries(request);
  }

  async supportedProfiles() {
    return await this.assessmentGrpcServiceClientImpl.SupportedProfiles();
  }

  async findTestByTestCode(request: FindTestByTestCodeRequest) {
    return await this.assessmentGrpcServiceClientImpl.FindTestByTestCode(request);
  }

  async findForMentor(request: FindForMentorRequest) {
    return await this.assessmentGrpcServiceClientImpl.FindForMentor(request);
  }

  async getBuyModeTestForTeacher(request: GetBuyModeTestForTeacherRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetBuyModeTestForTeacher(request);
  }

  async removeQuestion(request: RemoveQuestionRequest) {
    return await this.assessmentGrpcServiceClientImpl.RemoveQuestion(request);
  }

  async completedTestStudentsByClass(request: CompletedTestStudentsByClassRequest) {
    return await this.assessmentGrpcServiceClientImpl.CompletedTestStudentsByClass(request);
  }

  async completedTestByClass(request: CompletedTestByClassRequest) {
    return await this.assessmentGrpcServiceClientImpl.CompletedTestByClass(request);
  }
  
  async ongoingTestByClass(request: OngoingTestByClassRequest) {
    return await this.assessmentGrpcServiceClientImpl.OngoingTestByClass(request);
  }
  
  async ongoingAttempts(request: OngoingAttemptsRequest) {
    return await this.assessmentGrpcServiceClientImpl.OngoingAttempts(request);
  }
  
  async todayProctoredTests(request: TodayProctoredTestsRequest) {
    return await this.assessmentGrpcServiceClientImpl.TodayProctoredTests(request);
  }

  async upcomingTestByClass(request: UpcomingTestByClassRequest) {
    return await this.assessmentGrpcServiceClientImpl.UpcomingTestByClass(request);
  }
  
  async getSessionTimes(request: GetSessionTimesRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetSessionTimes(request);
  }

  async recommendedTestsBySubject(request: RecommendedTestsBySubjectRequest) {
    return await this.assessmentGrpcServiceClientImpl.RecommendedTestsBySubject(request);
  }

  async recentTestByUser(request: RecentTestByUserRequest) {
    return await this.assessmentGrpcServiceClientImpl.RecentTestByUser(request);
  }

  async searchTests(request: SearchTestsRequest) {
    return await this.assessmentGrpcServiceClientImpl.SearchTests(request);
  }

  async searchUnits(request: SearchUnitsRequest) {
    return await this.assessmentGrpcServiceClientImpl.SearchUnits(request);
  }

  async getArchiveAssessments(request: ArchiveRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetArchiveAssessments(request);
  }

  async saveAs(request: SaveAsRequest) {
    return await this.assessmentGrpcServiceClientImpl.SaveAs(request);
  }

  async findOneForSession(request: FindOneForSessionRequest) {
    return await this.assessmentGrpcServiceClientImpl.FindOneForSession(request);
  }

  async findOneWithQuestions(request: FindOneWithQuestionsRequest) {
    return await this.assessmentGrpcServiceClientImpl.FindOneWithQuestions(request);
  }
  
  async shareLink(request: ShareLinkRequest) {
    return await this.assessmentGrpcServiceClientImpl.ShareLink(request);
  }
  
  async checkTestCode(request: CheckTestCodeRequest) {
    return await this.assessmentGrpcServiceClientImpl.CheckTestCode(request);
  }
  
  async exportPDF(request: ExportPDFRequest) {
    return await this.assessmentGrpcServiceClientImpl.ExportPDF(request);
  }
  
  async fraudCheck(request: FraudCheckRequest) {
    return await this.assessmentGrpcServiceClientImpl.FraudCheck(request);
  }
  
  async importFile(request: ImportFileReq) {
    return await this.assessmentGrpcServiceClientImpl.ImportFile(request);
  }

  async getStudentTakingTest(request: GetStudentTakingTestRequest) {
    return await this.assessmentGrpcServiceClientImpl.GetStudentTakingTest(request);
  }

  async importQuestion(request: ImportQuestionRequest) {
    return await this.assessmentGrpcServiceClientImpl.ImportQuestion(request);
  }

  async exportTest(request: ExportTestReq) {
    return await this.assessmentGrpcServiceClientImpl.ExportTest(request);
  }

  async playGame(request: PlayGameRequest) {
    return await this.assessmentGrpcServiceClientImpl.PlayGame(request);
  }

  async findForTeacher(request: FindForTeacherRequest) {
    return await this.assessmentGrpcServiceClientImpl.FindForTeacher(request);
  }
}
