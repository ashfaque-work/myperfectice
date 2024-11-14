import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  ArchiveRequest,
  ChangeOwnershipRequest,
  CheckQuestionsBeforePublishRequest,
  CheckSectionQuestionRequest,
  CheckTestCodeRequest,
  CompletedTestByClassRequest,
  CompletedTestStudentsByClassRequest,
  CountByAttemptRequest,
  CountByExamIdRequest,
  CountPracticeRequest,
  CreateAssessmentRequest,
  DestroyPracticeRequest,
  EndTestSessionRequest,
  EnrollTestRequest,
  ExportPDFRequest,
  ExportTestReq,
  FindAllRequest,
  FindByAttemptRequest,
  FindByExamIdRequest,
  FindForMentorRequest,
  FindForTeacherRequest,
  FindOneForSessionRequest,
  FindOneSharedRequest,
  FindOneWithQuestionsRequest,
  FindPracticeSetsRequest,
  FindProctorTestRequest,
  FindQuestionTemporaryRequest,
  FindTestBySessionRequest,
  FindTestByTestCodeRequest,
  FraudCheckRequest,
  GetAssessmentRequest,
  GetAssessmentResponse,
  GetAttendanceStatusRequest,
  GetAttendantsRequest,
  GetAvgRatingByAssessmentRequest,
  GetBuyModeTestForTeacherRequest,
  GetByTestSeriesRequest,
  GetfeedbackRatingByAssessmentRequest,
  GetFeedbacksRequest,
  GetGameHistoryRequest,
  GetGameRequest,
  GetLastTestMeRequest,
  GetMaximumTestMarksRequest,
  GetOpeningGamesRequest,
  GetPracticesetClassroomsRequest,
  GetPublicTestsRequest,
  GetQuestionFeedbackRequest,
  GetQuestionListRequest,
  GetSessionTimesRequest,
  GetStudentTakingTestRequest,
  GetTestLimitRequest,
  ImportFileReq,
  ImportQuestionRequest,
  ListPublisherRequest,
  ListUnitRequest,
  NewGameRequest,
  OngoingAttemptsRequest,
  OngoingTestByClassRequest,
  OngoingTestByUserRequest,
  PlayGameRequest,
  ProcessingDocmRequest,
  PublisherAssessmentRequest,
  RecentTestByUserRequest,
  RecommendedTestsBySubjectRequest,
  RemoveQuestionRequest,
  ResetIpRestrictionRequest,
  ResetTerminatedAttemptRequest,
  SaveAsRequest,
  SearchOneRequest,
  SearchTestsRequest,
  SearchUnitsRequest,
  ShareLinkRequest,
  StartTestSessionRequest,
  SupportedProfilesRequest,
  TestBySubjectRequest,
  TestByTopicRequest,
  TestDetailsRequest,
  TodayProctoredTestsRequest,
  TopicQuestionDistributionByCategoryRequest,
  UpcomingTestByClassRequest,
  UpcomingTestsRequest,
  UpdateAllQuestionSectionRequest,
  UpdateAssessmentRequest,
  UpdateAttendanceLimitRequest,
  UpdateAttendanceRequest,
  UpdateQuestionOrderRequest,
  UpdateQuestionSectionRequest
} from '@app/common/dto/assessment.dto';
import { AssessmentService } from './assessment.service';
import { protobufAssessmentService } from '@app/common/grpc-clients/assessment/assessment';

@Controller()
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) { }

  @GrpcMethod(protobufAssessmentService, 'CreateAssessment')
  createAssessment(request: CreateAssessmentRequest) {
    return this.assessmentService.createAssessment(request);
  }

  @GrpcMethod(protobufAssessmentService, 'GetAllAssessment')
  getAllAssessment() {    
    return this.assessmentService.getAllAssessment();
  }

  @GrpcMethod(protobufAssessmentService, 'GetAssessment')
  getAssessment(request: GetAssessmentRequest): Promise<GetAssessmentResponse> {    
    return this.assessmentService.getAssessment(request);
  }

  @GrpcMethod(protobufAssessmentService, 'UpdateAssessment')
  updateAssessment(request: UpdateAssessmentRequest) {
    return this.assessmentService.updateAssessment(request);
  }


  @GrpcMethod(protobufAssessmentService, 'EnrollTest')
  enrollTest(request: EnrollTestRequest) {
    return this.assessmentService.enrollTest(request);
  }

  @GrpcMethod(protobufAssessmentService, 'GetPublisherAssessments')
  getPublisherAssessments(request: PublisherAssessmentRequest) {
    return this.assessmentService.getPublisherAssessments(request);
  }

  @GrpcMethod(protobufAssessmentService, 'UpdateAllQuestionSection')
  updateAllQuestionSection(request: UpdateAllQuestionSectionRequest) {
    return this.assessmentService.updateAllQuestionSection(request);
  }

  @GrpcMethod(protobufAssessmentService, 'GetPublicTest')
  getPublicTest(request: GetPublicTestsRequest){  
    return this.assessmentService.getPublicTest(request);
  }

  @GrpcMethod(protobufAssessmentService, 'GetMaximumTestMarks')
  getMaximumTestMarks(request: GetMaximumTestMarksRequest){  
    return this.assessmentService.getMaximumTestMarks(request);
  }

  @GrpcMethod(protobufAssessmentService, 'GetQuestionFeedback')
  getQuestionFeedback(request: GetQuestionFeedbackRequest){  
    return this.assessmentService.getQuestionFeedback(request);
  }

  @GrpcMethod(protobufAssessmentService, 'StartTestSession')
  startTestSession(request: StartTestSessionRequest){  
    return this.assessmentService.startTestSession(request);
  }

  @GrpcMethod(protobufAssessmentService, 'EndTestSession')
  endTestSession(request: EndTestSessionRequest){  
    return this.assessmentService.endTestSession(request);
  }

  @GrpcMethod(protobufAssessmentService, 'GetAttendants')
  getAttendants(request: GetAttendantsRequest){  
    return this.assessmentService.getAttendants(request);
  }

  @GrpcMethod(protobufAssessmentService, 'ResetIpRestriction')
  resetIpRestriction(request: ResetIpRestrictionRequest){  
    return this.assessmentService.resetIpRestriction(request);
  }

  @GrpcMethod(protobufAssessmentService, 'UpdateAttendanceLimit')
  updateAttendanceLimit(request: UpdateAttendanceLimitRequest){  
    return this.assessmentService.updateAttendanceLimit(request);
  }

  @GrpcMethod(protobufAssessmentService, 'FindPracticeSets')
  findPracticeSets(request: FindPracticeSetsRequest){  
    return this.assessmentService.findPracticeSets(request);
  }

  @GrpcMethod(protobufAssessmentService, 'GetAttendanceStatus')
  getAttendanceStatus(request: GetAttendanceStatusRequest){  
    return this.assessmentService.getAttendanceStatus(request);
  }

  @GrpcMethod(protobufAssessmentService, 'ChangeOwnership')
  changeOwnership(request: ChangeOwnershipRequest){  
    return this.assessmentService.changeOwnership(request);
  }

  @GrpcMethod(protobufAssessmentService, 'GetTestLimit')
  getTestLimit(request: GetTestLimitRequest){  
    return this.assessmentService.getTestLimit(request);
  }

  @GrpcMethod(protobufAssessmentService, 'FindProctorTest')
  findProctorTest(request: FindProctorTestRequest){  
    return this.assessmentService.findProctorTest(request);
  }

  @GrpcMethod(protobufAssessmentService, 'OngoingTestByUser')
  ongoingTestByUser(request: OngoingTestByUserRequest){  
    return this.assessmentService.ongoingTestByUser(request);
  }

  @GrpcMethod(protobufAssessmentService, 'FindTestBySession')
  findTestBySession(request: FindTestBySessionRequest){  
    return this.assessmentService.findTestBySession(request);
  }

  @GrpcMethod(protobufAssessmentService, 'UpcomingTests')
  upcomingTests(request: UpcomingTestsRequest){  
    return this.assessmentService.upcomingTests(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'GetAvgRatingByAssessment')
  getAvgRatingByAssessment(request: GetAvgRatingByAssessmentRequest){  
    return this.assessmentService.getAvgRatingByAssessment(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'GetfeedbackRatingByAssessment')
  getfeedbackRatingByAssessment(request: GetfeedbackRatingByAssessmentRequest){  
    return this.assessmentService.getfeedbackRatingByAssessment(request);
  }

  @GrpcMethod(protobufAssessmentService, 'GetQuestionList')
  getQuestionList(request: GetQuestionListRequest){  
    return this.assessmentService.getQuestionList(request);
  }

  @GrpcMethod(protobufAssessmentService, 'UpdateQuestionSection')
  updateQuestionSection(request: UpdateQuestionSectionRequest){  
    return this.assessmentService.updateQuestionSection(request);
  }

  @GrpcMethod(protobufAssessmentService, 'GetPracticesetClassrooms')
  getPracticesetClassrooms(request: GetPracticesetClassroomsRequest){  
    return this.assessmentService.getPracticesetClassrooms(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'CheckSectionQuestion')
  checkSectionQuestion(request: CheckSectionQuestionRequest){  
    return this.assessmentService.checkSectionQuestion(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'FindPracticeAttempted')
  findPracticeAttempted(request: FindByAttemptRequest){  
    return this.assessmentService.findPracticeAttempted(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'CountPracticeAttempted')
  countPracticeAttempted(request: CountByAttemptRequest){  
    return this.assessmentService.countPracticeAttempted(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'CountPractice')
  countPractice(request: CountPracticeRequest){  
    return this.assessmentService.countPractice(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'GetLastTest')
  getLastTest(request: GetLastTestMeRequest){  
    return this.assessmentService.getLastTest(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'ListPublisher')
  listPublisher(request: ListPublisherRequest){  
    return this.assessmentService.listPublisher(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'ListUnit')
  listUnit(request: ListUnitRequest){  
    return this.assessmentService.listUnit(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'TestBySubject')
  testBySubject(request: TestBySubjectRequest){  
    return this.assessmentService.testBySubject(request);
  }

  @GrpcMethod(protobufAssessmentService, 'TestByTopic')
  testByTopic(request: TestByTopicRequest){  
    return this.assessmentService.testByTopic(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'TopicQuestionDistributionByCategory')
  topicQuestionDistributionByCategory(request: TopicQuestionDistributionByCategoryRequest){  
    return this.assessmentService.topicQuestionDistributionByCategory(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'FindOneWithTotalQuestion')
  findOneWithTotalQuestion(request: FindOneSharedRequest){  
    return this.assessmentService.findOneWithTotalQuestion(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'CountByExamId')
  countByExamId(request: CountByExamIdRequest){  
    return this.assessmentService.countByExamId(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'ProcessingDocm')
  processingDocm(request: ProcessingDocmRequest){  
    return this.assessmentService.getProcessingDocm(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'UpdateAttendance')
  updateAttendance(request: UpdateAttendanceRequest){  
    return this.assessmentService.updateAttendance(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'ResetTerminatedAttempt')
  resetTerminatedAttempt(request: ResetTerminatedAttemptRequest){  
    return this.assessmentService.resetTerminatedAttempt(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'UpdateQuestionOrder')
  updateQuestionOrder(request: UpdateQuestionOrderRequest){  
    return this.assessmentService.updateQuestionOrder(request);
  }

  @GrpcMethod(protobufAssessmentService, 'Destroy')
  destroy(request: DestroyPracticeRequest) {
    return this.assessmentService.destroy(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'TestDetails')
  testDetails(request: TestDetailsRequest) {
    return this.assessmentService.testDetails(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'Index')
  index(request: FindAllRequest) {
    return this.assessmentService.index(request);
  }

  @GrpcMethod(protobufAssessmentService, 'GetOpeningGames')
  getOpeningGames(request: GetOpeningGamesRequest) {
    return this.assessmentService.getOpeningGames(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'GetGameHistory')
  getGameHistory(request: GetGameHistoryRequest) {
    return this.assessmentService.getGameHistory(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'GetGame')
  getGame(request: GetGameRequest) {
    return this.assessmentService.getGame(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'NewGame')
  newGame(request: NewGameRequest) {
    return this.assessmentService.newGame(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'CheckQuestionsBeforePublish')
  checkQuestionsBeforePublish(request: CheckQuestionsBeforePublishRequest) {
    return this.assessmentService.checkQuestionsBeforePublish(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'GetFeedbacks')
  getFeedbacks(request: GetFeedbacksRequest) {
    return this.assessmentService.getFeedbacks(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'SearchOne')
  searchOne(request: SearchOneRequest) {
    return this.assessmentService.searchOne(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'FindQuestionTemporary')
  findQuestionTemporary(request: FindQuestionTemporaryRequest) {
    return this.assessmentService.findQuestionTemporary(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'GetByTestSeries')
  getByTestSeries(request: GetByTestSeriesRequest) {
    return this.assessmentService.getByTestSeries(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'SupportedProfiles')
  supportedProfiles() {
    return this.assessmentService.getSupportedProfile();
  }
  
  @GrpcMethod(protobufAssessmentService, 'FindTestByTestCode')
  findTestByTestCode(request: FindTestByTestCodeRequest) {
    return this.assessmentService.findTestByTestCode(request);
  }

  @GrpcMethod(protobufAssessmentService, 'FindForMentor')
  findForMentor(request: FindForMentorRequest) {
    return this.assessmentService.findForMentor(request);
  }

  @GrpcMethod(protobufAssessmentService, 'GetBuyModeTestForTeacher')
  getBuyModeTestForTeacher(request: GetBuyModeTestForTeacherRequest) {
    return this.assessmentService.getBuyModeTestForTeacher(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'RemoveQuestion')
  removeQuestion(request: RemoveQuestionRequest) {
    return this.assessmentService.removeQuestion(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'CompletedTestStudentsByClass')
  completedTestStudentsByClass(request: CompletedTestStudentsByClassRequest) {
    return this.assessmentService.completedTestStudentsByClass(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'CompletedTestByClass')
  completedTestByClass (request: CompletedTestByClassRequest) {
    return this.assessmentService.completedTestByClass(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'OngoingTestByClass')
  ongoingTestByClass (request: OngoingTestByClassRequest) {
    return this.assessmentService.ongoingTestByClass(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'OngoingAttempts')
  ongoingAttempts (request: OngoingAttemptsRequest) {
    return this.assessmentService.ongoingAttempts(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'TodayProctoredTests')
  todayProctoredTests (request: TodayProctoredTestsRequest) {
    return this.assessmentService.todayProctoredTests(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'UpcomingTestByClass')
  upcomingTestByClass (request: UpcomingTestByClassRequest) {
    return this.assessmentService.upcomingTestByClass(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'GetSessionTimes')
  getSessionTimes (request: GetSessionTimesRequest) {
    return this.assessmentService.getSessionTimes(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'RecommendedTestsBySubject')
  recommendedTestsBySubject (request: RecommendedTestsBySubjectRequest) {
    return this.assessmentService.recommendedTestsBySubject(request);
  }
    
  @GrpcMethod(protobufAssessmentService, 'RecentTestByUser')
  recentTestByUser (request: RecentTestByUserRequest) {
    return this.assessmentService.recentTestByUser(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'SearchTests')
  searchTests (request: SearchTestsRequest) {
    return this.assessmentService.searchTests(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'SearchUnits')
  searchUnits (request: SearchUnitsRequest) {
    return this.assessmentService.searchUnits(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'GetArchiveAssessments')
  getArchiveAssessments (request: ArchiveRequest) {
    return this.assessmentService.getArchiveAssessments(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'SaveAs')
  saveAs (request: SaveAsRequest) {
    return this.assessmentService.saveAs(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'FindOneForSession')
  findOneForSession (request: FindOneForSessionRequest) {
    return this.assessmentService.findOneForSession(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'FindOneWithQuestions')
  findOneWithQuestions (request: FindOneWithQuestionsRequest) {
    return this.assessmentService.findOneWithQuestions(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'ShareLink')
  shareLink (request: ShareLinkRequest) {
    return this.assessmentService.shareLink(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'CheckTestCode')
  checkTestCode (request: CheckTestCodeRequest) {
    return this.assessmentService.checkTestCode(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'ExportPDF')
  exportPDF (request: ExportPDFRequest) {
    return this.assessmentService.exportPDF(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'FraudCheck')
  fraudCheck (request: FraudCheckRequest) {
    return this.assessmentService.fraudCheck(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'ImportFile')
  importFile (request: ImportFileReq) {
    return this.assessmentService.importFile(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'GetStudentTakingTest')
  getStudentTakingTest (request: GetStudentTakingTestRequest) {
    return this.assessmentService.getStudentTakingTest(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'ImportQuestion')
  importQuestion (request: ImportQuestionRequest) {
    return this.assessmentService.importQuestion(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'ExportTest')
  exportTest (request: ExportTestReq) {
    return this.assessmentService.exportTest(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'PlayGame')
  playGame (request: PlayGameRequest) {
    return this.assessmentService.playGame(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'FindForTeacher')
  findForTeacher (request: FindForTeacherRequest) {
    return this.assessmentService.findForTeacher(request);
  }
  
  @GrpcMethod(protobufAssessmentService, 'FindByExamId')
  findByExamId (request: FindByExamIdRequest) {
    return this.assessmentService.findByExamId(request);
  }
}

