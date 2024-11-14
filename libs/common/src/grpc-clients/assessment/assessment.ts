import {
  ChangeOwnershipRequest,
  ChangeOwnershipResponse,
  CheckSectionQuestionRequest,
  CheckSectionQuestionResponse,
  CreateAssessmentRequest,
  CreateAssessmentResponse,
  EndTestSessionRequest,
  EndTestSessionResponse,
  EnrollTestRequest,
  EnrollTestResponse,
  FindPracticeSetsRequest,
  FindPracticeSetsResponse,
  FindProctorTestRequest,
  FindProctorTestResponse,
  FindTestBySessionRequest,
  FindTestBySessionResponse,
  GetAllAssessmentResponse,
  GetAssessmentRequest,
  GetAssessmentResponse,
  GetAttendanceStatusRequest,
  GetAttendanceStatusResponse,
  GetAttendantsRequest,
  GetAttendantsResponse,
  GetAvgRatingByAssessmentRequest,
  GetAvgRatingByAssessmentResponse,
  GetfeedbackRatingByAssessmentRequest,
  GetfeedbackRatingByAssessmentResponse,
  GetMaximumTestMarksRequest,
  GetMaximumTestMarksResponse,
  GetPracticesetClassroomsRequest,
  GetPracticesetClassroomsResponse,
  GetPublicTestsRequest,
  GetQuestionFeedbackRequest,
  GetQuestionFeedbackResponse,
  GetQuestionListRequest,
  GetQuestionListResponse,
  GetTestLimitRequest,
  GetTestLimitResponse,
  OngoingTestByUserRequest,
  OngoingTestByUserResponse,
  PublicTestsResponse,
  PublisherAssessmentRequest,
  PublisherAssessmentResponse,
  ResetIpRestrictionRequest,
  ResetIpRestrictionResponse,
  StartTestSessionRequest,
  StartTestSessionResponse,
  UpcomingTestsRequest,
  UpcomingTestsResponse,
  UpdateAllQuestionSectionRequest,
  UpdateAllQuestionSectionResponse,
  UpdateAssessmentRequest,
  UpdateAssessmentResponse,
  UpdateAttendanceLimitRequest,
  UpdateAttendanceLimitResponse,
  UpdateQuestionSectionRequest,
  UpdateQuestionSectionResponse,
  FindByAttemptRequest,
  FindByAttemptResponse,
  CountByAttemptRequest,
  CountByAttemptResponse,
  CountPracticeRequest,
  CountPracticeResponse,
  FindOneSharedRequest,
  FindOneSharedResponse,
  GetLastTestMeRequest,
  GetLastTestMeResponse,
  FindOneWithQuestionsRequest,
  FindOneWithQuestionsResponse,
  ListPublisherRequest,
  ListPublisherResponse,
  ListUnitRequest,
  ListUnitResponse,
  CountByExamIdRequest,
  CountByExamIdResponse,
  FindByExamIdRequest,
  FindByExamIdResponse,
  SupportedProfilesRequest,
  SupportedProfilesResponse,
  ProcessingDocmRequest,
  ProcessingDocmResponse,
  SearchOneRequest,
  SearchOneResponse,
  CheckQuestionsBeforePublishRequest,
  CheckQuestionsBeforePublishResponse,
  FindQuestionTemporaryRequest,
  FindQuestionTemporaryResponse,
  ImportQuestionRequest,
  ImportQuestionResponse,
  RemoveQuestionRequest,
  RemoveQuestionResponse,
  TestBySubjectRequest,
  TestBySubjectResponse,
  TestByTopicRequest,
  TestByTopicResponse,
  TopicQuestionDistributionByCategoryRequest,
  TopicQuestionDistributionByCategoryResponse,
  RecommendedTestsBySubjectRequest,
  RecommendedTestsBySubjectResponse,
  RecentTestByUserRequest,
  RecentTestByUserResponse,
  SearchTestsRequest,
  SearchTestsResponse,
  SearchUnitsRequest,
  SearchUnitsResponse,
  ArchiveRequest,
  ArchiveResponse,
  CompletedTestByClassRequest,
  CompletedTestByClassResponse,
  CompletedTestStudentsByClassRequest,
  CompletedTestStudentsByClassResponse,
  UpcomingTestByClassRequest,
  UpcomingTestByClassResponse,
  SaveAsRequest,
  SaveAsResponse,
  FindOneForSessionRequest,
  FindOneForSessionResponse,
  FindForMentorRequest,
  FindForMentorResponse,
  GetBuyModeTestForTeacherRequest,
  GetBuyModeTestForTeacherResponse,
  UpdateAttendanceRequest,
  UpdateAttendanceResponse,
  ResetTerminatedAttemptRequest,
  ResetTerminatedAttemptResponse,
  UpdateQuestionOrderRequest,
  UpdateQuestionOrderResponse,
  DestroyPracticeRequest,
  DestroyPracticeResponse,
  TestDetailsRequest,
  TestDetailsResponse,
  FindAllRequest,
  FindAllResponse,
  GetOpeningGamesRequest,
  GetOpeningGamesResponse,
  GetGameHistoryRequest,
  GetGameHistoryResponse,
  GetGameRequest,
  GetGameResponse,
  NewGameRequest,
  NewGameResponse,
  GetFeedbacksRequest,
  GetFeedbacksResponse,
  GetByTestSeriesRequest,
  GetByTestSeriesResponse,
  FindTestByTestCodeRequest,
  FindTestByTestCodeResponse,
  OngoingTestByClassRequest,
  OngoingTestByClassResponse,
  OngoingAttemptsRequest,
  OngoingAttemptsResponse,
  TodayProctoredTestsRequest,
  TodayProctoredTestsResponse,
  GetSessionTimesRequest,
  GetSessionTimesResponse,
  ShareLinkRequest,
  ShareLinkResponse,
  CheckTestCodeRequest,
  CheckTestCodeResponse,
  ExportPDFRequest,
  ExportPDFResponse,
  FraudCheckRequest,
  FraudCheckResponse,
  GetStudentTakingTestRequest,
  GetStudentTakingTestResponse,
  Empty,
  ImportFileReq,
  ExportTestReq,
  PlayGameRequest,
  PlayGameResponse,
  PracticeSetDto,
  FindPracticeSets,
  FindForTeacherRequest,
  FindForTeacherResponse,
} from '@app/common/dto/assessment.dto';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const protobufAssessmentPackage = 'assessment';
export const protobufAssessmentService = 'AssessmentGrpcService';

export interface AssessmentGrpcInterface {
  CreateAssessment(request: CreateAssessmentRequest): Promise<CreateAssessmentResponse>;
  GetAllAssessment({ }): Promise<GetAllAssessmentResponse>;
  GetAssessment(request: GetAssessmentRequest): Promise<GetAssessmentResponse>;
  UpdateAssessment(request: UpdateAssessmentRequest): Promise<UpdateAssessmentResponse>;
  EnrollTest(request: EnrollTestRequest): Promise<EnrollTestResponse>;
  GetPublisherAssessments(request: PublisherAssessmentRequest): Promise<PublisherAssessmentResponse>;
  UpdateAllQuestionSection(request: UpdateAllQuestionSectionRequest): Promise<UpdateAllQuestionSectionResponse>;
  GetPublicTest(request: GetPublicTestsRequest): Promise<PublicTestsResponse>;
  GetMaximumTestMarks(request: GetMaximumTestMarksRequest): Promise<GetMaximumTestMarksResponse>;
  GetQuestionFeedback(request: GetQuestionFeedbackRequest): Promise<GetQuestionFeedbackResponse>;
  StartTestSession(request: StartTestSessionRequest): Promise<StartTestSessionResponse>;
  EndTestSession(request: EndTestSessionRequest): Promise<EndTestSessionResponse>;
  GetAttendants(request: GetAttendantsRequest): Promise<GetAttendantsResponse>;
  ResetIpRestriction(request: ResetIpRestrictionRequest): Promise<ResetIpRestrictionResponse>;
  UpdateAttendanceLimit(request: UpdateAttendanceLimitRequest): Promise<UpdateAttendanceLimitResponse>;
  FindPracticeSets(request: FindPracticeSetsRequest): Observable<FindPracticeSetsResponse>;
  GetAttendanceStatus(request: GetAttendanceStatusRequest): Promise<GetAttendanceStatusResponse>;
  ChangeOwnership(request: ChangeOwnershipRequest): Promise<ChangeOwnershipResponse>;
  GetTestLimit(request: GetTestLimitRequest): Promise<GetTestLimitResponse>;
  FindProctorTest(request: FindProctorTestRequest): Promise<FindProctorTestResponse>;
  OngoingTestByUser(request: OngoingTestByUserRequest): Promise<OngoingTestByUserResponse>;
  FindTestBySession(request: FindTestBySessionRequest): Promise<FindTestBySessionResponse>;
  UpcomingTests(request: UpcomingTestsRequest): Promise<UpcomingTestsResponse>;
  GetAvgRatingByAssessment(request: GetAvgRatingByAssessmentRequest): Promise<GetAvgRatingByAssessmentResponse>;
  GetfeedbackRatingByAssessment(request: GetfeedbackRatingByAssessmentRequest): Promise<GetfeedbackRatingByAssessmentResponse>;
  GetQuestionList(request: GetQuestionListRequest): Promise<GetQuestionListResponse>;
  UpdateQuestionSection(request: UpdateQuestionSectionRequest): Promise<UpdateQuestionSectionResponse>;
  GetPracticesetClassrooms(request: GetPracticesetClassroomsRequest): Promise<GetPracticesetClassroomsResponse>;
  CheckSectionQuestion(request: CheckSectionQuestionRequest): Promise<CheckSectionQuestionResponse>;
  FindPracticeAttempted(request: FindByAttemptRequest): Promise<FindByAttemptResponse>;
  CountPracticeAttempted(request: CountByAttemptRequest): Promise<CountByAttemptResponse>;
  CountPractice(request: CountPracticeRequest): Promise<CountPracticeResponse>;
  GetLastTest(request: GetLastTestMeRequest): Promise<GetLastTestMeResponse>;
  ListPublisher(request: ListPublisherRequest): Promise<ListPublisherResponse>;
  ListUnit(request: ListUnitRequest): Promise<ListUnitResponse>;
  TestBySubject(request: TestBySubjectRequest): Promise<TestBySubjectResponse>;
  TestByTopic(request: TestByTopicRequest): Promise<TestByTopicResponse>;
  TopicQuestionDistributionByCategory(request: TopicQuestionDistributionByCategoryRequest): Promise<TopicQuestionDistributionByCategoryResponse>;
  FindOneWithTotalQuestion(request: FindOneSharedRequest): Promise<FindOneSharedResponse>;
  CountByExamId(request: CountByExamIdRequest): Promise<CountByExamIdResponse>;
  FindByExamId(request: FindByExamIdRequest): Promise<FindByExamIdResponse>;
  ProcessingDocm(request: ProcessingDocmRequest): Promise<ProcessingDocmResponse>;
  UpdateAttendance(request: UpdateAttendanceRequest): Promise<UpdateAttendanceResponse>;
  ResetTerminatedAttempt(request: ResetTerminatedAttemptRequest): Promise<ResetTerminatedAttemptResponse>;
  UpdateQuestionOrder(request: UpdateQuestionOrderRequest): Promise<UpdateQuestionOrderResponse>;
  Destroy(request: DestroyPracticeRequest): Promise<DestroyPracticeResponse>;
  TestDetails(request: TestDetailsRequest): Promise<TestDetailsResponse>;
  Index(request: FindAllRequest): Promise<FindAllResponse>;
  GetOpeningGames(request: GetOpeningGamesRequest): Promise<GetOpeningGamesResponse>;
  GetGameHistory(request: GetGameHistoryRequest): Promise<GetGameHistoryResponse>;
  GetGame(request: GetGameRequest): Promise<GetGameResponse>;
  NewGame(request: NewGameRequest): Promise<NewGameResponse>;
  CheckQuestionsBeforePublish(request: CheckQuestionsBeforePublishRequest): Promise<CheckQuestionsBeforePublishResponse>;
  GetFeedbacks(request: GetFeedbacksRequest): Promise<GetFeedbacksResponse>;
  SearchOne(request: SearchOneRequest): Promise<SearchOneResponse>;
  FindQuestionTemporary(request: FindQuestionTemporaryRequest): Promise<FindQuestionTemporaryResponse>;
  GetByTestSeries(request: GetByTestSeriesRequest): Promise<GetByTestSeriesResponse>;
  SupportedProfiles({}): Promise<SupportedProfilesResponse>;
  FindTestByTestCode(request: FindTestByTestCodeRequest): Promise<FindTestByTestCodeResponse>;
  FindForMentor(request: FindForMentorRequest): Promise<FindForMentorResponse>;
  GetBuyModeTestForTeacher(request: GetBuyModeTestForTeacherRequest): Promise<GetBuyModeTestForTeacherResponse>;
  RemoveQuestion(request: RemoveQuestionRequest): Promise<RemoveQuestionResponse>;
  CompletedTestStudentsByClass(request: CompletedTestStudentsByClassRequest): Promise<CompletedTestStudentsByClassResponse>;
  CompletedTestByClass(request: CompletedTestByClassRequest): Promise<CompletedTestByClassResponse>;
  OngoingTestByClass(request: OngoingTestByClassRequest): Promise<OngoingTestByClassResponse>;
  OngoingAttempts(request: OngoingAttemptsRequest): Promise<OngoingAttemptsResponse>;
  TodayProctoredTests(request: TodayProctoredTestsRequest): Promise<TodayProctoredTestsResponse>;
  UpcomingTestByClass(request: UpcomingTestByClassRequest): Promise<UpcomingTestByClassResponse>;
  GetSessionTimes(request: GetSessionTimesRequest): Promise<GetSessionTimesResponse>;
  RecommendedTestsBySubject(request: RecommendedTestsBySubjectRequest): Promise<RecommendedTestsBySubjectResponse>;
  RecentTestByUser(request: RecentTestByUserRequest): Promise<RecentTestByUserResponse>;
  SearchTests(request: SearchTestsRequest): Promise<SearchTestsResponse>;
  SearchUnits(request: SearchUnitsRequest): Promise<SearchUnitsResponse>;
  GetArchiveAssessments(request: ArchiveRequest): Promise<ArchiveResponse>;
  SaveAs(request: SaveAsRequest): Promise<SaveAsResponse>;
  FindOneForSession(request: FindOneForSessionRequest): Promise<FindOneForSessionResponse>;
  FindOneWithQuestions(request: FindOneWithQuestionsRequest): Promise<FindOneWithQuestionsResponse>;
  ShareLink(request: ShareLinkRequest): Promise<ShareLinkResponse>;
  CheckTestCode(request: CheckTestCodeRequest): Promise<CheckTestCodeResponse>;
  ExportPDF(request: ExportPDFRequest): Promise<ExportPDFResponse>;
  FraudCheck(request: FraudCheckRequest): Promise<FraudCheckResponse>;
  ImportFile(request: ImportFileReq): Promise<Empty>;
  GetStudentTakingTest(request: GetStudentTakingTestRequest): Promise<GetStudentTakingTestResponse>;
  ImportQuestion(request: ImportQuestionRequest): Promise<ImportQuestionResponse>;
  ExportTest(request: ExportTestReq): Promise<Empty>;
  PlayGame(request: PlayGameRequest): Promise<PlayGameResponse>;
  FindForTeacher(request: FindForTeacherRequest): Promise<FindForTeacherResponse>;
}

@Injectable()
export class AssessmentGrpcServiceClientImpl {
  private assessmentGrpcServiceClient: AssessmentGrpcInterface;
  constructor(
    @Inject('assessmentGrpcService') private assessmentGrpcClient: ClientGrpc,
  ) { }

  async onModuleInit() {
    this.assessmentGrpcServiceClient =
      await this.assessmentGrpcClient.getService<AssessmentGrpcInterface>(
        protobufAssessmentService,
      );
  }
  async CreateAssessment(request: CreateAssessmentRequest): Promise<CreateAssessmentResponse> {
    return await this.assessmentGrpcServiceClient.CreateAssessment(request);
  }

  async GetAllAssessment({ }): Promise<GetAllAssessmentResponse> {
    return await this.assessmentGrpcServiceClient.GetAllAssessment({});
  }

  async GetAssessment(request: GetAssessmentRequest): Promise<GetAssessmentResponse> {
    return await this.assessmentGrpcServiceClient.GetAssessment(request);
  }

  async UpdateAssessment(request: UpdateAssessmentRequest): Promise<UpdateAssessmentResponse> {
    return await this.assessmentGrpcServiceClient.UpdateAssessment(request);
  }


  async EnrollTest(request: EnrollTestRequest): Promise<EnrollTestResponse> {
    return await this.assessmentGrpcServiceClient.EnrollTest(request);
  }

  async GetPublisherAssessments(request: PublisherAssessmentRequest): Promise<PublisherAssessmentResponse> {
    return await this.assessmentGrpcServiceClient.GetPublisherAssessments(request);
  }

  async UpdateAllQuestionSection(request: UpdateAllQuestionSectionRequest): Promise<UpdateAllQuestionSectionResponse> {
    return await this.assessmentGrpcServiceClient.UpdateAllQuestionSection(request);
  }

  async GetPublicTest(request: GetPublicTestsRequest): Promise<PublicTestsResponse> {
    return await this.assessmentGrpcServiceClient.GetPublicTest(request);
  }

  async GetMaximumTestMarks(request: GetMaximumTestMarksRequest): Promise<GetMaximumTestMarksResponse> {
    return await this.assessmentGrpcServiceClient.GetMaximumTestMarks(request);
  }

  async GetQuestionFeedback(request: GetQuestionFeedbackRequest): Promise<GetQuestionFeedbackResponse> {
    return await this.assessmentGrpcServiceClient.GetQuestionFeedback(request);
  }

  async StartTestSession(request: StartTestSessionRequest): Promise<StartTestSessionResponse> {
    return await this.assessmentGrpcServiceClient.StartTestSession(request);
  }

  async EndTestSession(request: EndTestSessionRequest): Promise<EndTestSessionResponse> {
    return await this.assessmentGrpcServiceClient.EndTestSession(request);
  }

  async GetAttendants(request: GetAttendantsRequest): Promise<GetAttendantsResponse> {
    return await this.assessmentGrpcServiceClient.GetAttendants(request);
  }

  async ResetIpRestriction(request: ResetIpRestrictionRequest): Promise<ResetIpRestrictionResponse> {
    return await this.assessmentGrpcServiceClient.ResetIpRestriction(request);
  }

  async UpdateAttendanceLimit(request: UpdateAttendanceLimitRequest): Promise<UpdateAttendanceLimitResponse> {
    return await this.assessmentGrpcServiceClient.UpdateAttendanceLimit(request);
  }

  async FindPracticeSets(request: FindPracticeSetsRequest): Promise<FindPracticeSets[]> {
    return new Promise((resolve, reject) => {
      this.assessmentGrpcServiceClient.FindPracticeSets(request).subscribe({
        next: (result: FindPracticeSetsResponse) => {
          resolve(result.response);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
    // return await this.assessmentGrpcServiceClient.FindPracticeSets(request);
  }

  async GetAttendanceStatus(request: GetAttendanceStatusRequest): Promise<GetAttendanceStatusResponse> {
    return await this.assessmentGrpcServiceClient.GetAttendanceStatus(request);
  }

  async ChangeOwnership(request: ChangeOwnershipRequest): Promise<ChangeOwnershipResponse> {
    return await this.assessmentGrpcServiceClient.ChangeOwnership(request);
  }

  async GetTestLimit(request: GetTestLimitRequest): Promise<GetTestLimitResponse> {
    return await this.assessmentGrpcServiceClient.GetTestLimit(request);
  }

  async FindProctorTest(request: FindProctorTestRequest): Promise<FindProctorTestResponse> {
    return await this.assessmentGrpcServiceClient.FindProctorTest(request);
  }

  async OngoingTestByUser(request: OngoingTestByUserRequest): Promise<OngoingTestByUserResponse> {
    return await this.assessmentGrpcServiceClient.OngoingTestByUser(request);
  }

  async FindTestBySession(request: FindTestBySessionRequest): Promise<FindTestBySessionResponse> {
    return await this.assessmentGrpcServiceClient.FindTestBySession(request);
  }

  async UpcomingTests(request: UpcomingTestsRequest): Promise<UpcomingTestsResponse> {
    return await this.assessmentGrpcServiceClient.UpcomingTests(request);
  }

  async GetAvgRatingByAssessment(request: GetAvgRatingByAssessmentRequest): Promise<GetAvgRatingByAssessmentResponse> {
    return await this.assessmentGrpcServiceClient.GetAvgRatingByAssessment(request);
  }

  async GetfeedbackRatingByAssessment(request: GetfeedbackRatingByAssessmentRequest): Promise<GetfeedbackRatingByAssessmentResponse> {
    return await this.assessmentGrpcServiceClient.GetfeedbackRatingByAssessment(request);
  }

  async GetQuestionList(request: GetQuestionListRequest): Promise<GetQuestionListResponse> {
    return await this.assessmentGrpcServiceClient.GetQuestionList(request);
  }

  async UpdateQuestionSection(request: UpdateQuestionSectionRequest): Promise<UpdateQuestionSectionResponse> {
    return await this.assessmentGrpcServiceClient.UpdateQuestionSection(request);
  }

  async GetPracticesetClassrooms(request: GetPracticesetClassroomsRequest): Promise<GetPracticesetClassroomsResponse> {
    return await this.assessmentGrpcServiceClient.GetPracticesetClassrooms(request);
  }

  async CheckSectionQuestion(request: CheckSectionQuestionRequest): Promise<CheckSectionQuestionResponse> {
    return await this.assessmentGrpcServiceClient.CheckSectionQuestion(request);
  }

  async FindPracticeAttempted(request: FindByAttemptRequest): Promise<FindByAttemptResponse> {
    return await this.assessmentGrpcServiceClient.FindPracticeAttempted(request);
  }

  async CountPracticeAttempted(request: CountByAttemptRequest): Promise<CountByAttemptResponse> {
    return await this.assessmentGrpcServiceClient.CountPracticeAttempted(request);
  }

  async CountPractice(request: CountPracticeRequest): Promise<CountPracticeResponse> {
    return await this.assessmentGrpcServiceClient.CountPractice(request);
  }

  async GetLastTest(request: GetLastTestMeRequest): Promise<GetLastTestMeResponse> {
    return await this.assessmentGrpcServiceClient.GetLastTest(request);
  }

  async ListPublisher(request: ListPublisherRequest): Promise<ListPublisherResponse> {
    return await this.assessmentGrpcServiceClient.ListPublisher(request);
  }

  async ListUnit(request: ListUnitRequest): Promise<ListUnitResponse> {
    return await this.assessmentGrpcServiceClient.ListUnit(request);
  }

  async TestBySubject(request: TestBySubjectRequest): Promise<TestBySubjectResponse> {
    return await this.assessmentGrpcServiceClient.TestBySubject(request);
  }

  async TestByTopic(request: TestByTopicRequest): Promise<TestByTopicResponse> {
    return await this.assessmentGrpcServiceClient.TestByTopic(request);
  }

  async TopicQuestionDistributionByCategory(request: TopicQuestionDistributionByCategoryRequest): Promise<TopicQuestionDistributionByCategoryResponse> {
    return await this.assessmentGrpcServiceClient.TopicQuestionDistributionByCategory(request);
  }

  async FindOneWithTotalQuestion(request: FindOneSharedRequest): Promise<FindOneSharedResponse> {
    return await this.assessmentGrpcServiceClient.FindOneWithTotalQuestion(request);
  }

  async CountByExamId(request: CountByExamIdRequest): Promise<CountByExamIdResponse> {
    return await this.assessmentGrpcServiceClient.CountByExamId(request);
  }

  async FindByExamId(request: FindByExamIdRequest): Promise<FindByExamIdResponse> {
    return await this.assessmentGrpcServiceClient.FindByExamId(request);
  }

  async ProcessingDocm(request: ProcessingDocmRequest): Promise<ProcessingDocmResponse> {
    return await this.assessmentGrpcServiceClient.ProcessingDocm(request);
  }

  async UpdateAttendance(request: UpdateAttendanceRequest): Promise<UpdateAttendanceResponse> {
    return await this.assessmentGrpcServiceClient.UpdateAttendance(request);
  }

  async ResetTerminatedAttempt(request: ResetTerminatedAttemptRequest): Promise<ResetTerminatedAttemptResponse> {
    return await this.assessmentGrpcServiceClient.ResetTerminatedAttempt(request);
  }

  async UpdateQuestionOrder(request: UpdateQuestionOrderRequest): Promise<UpdateQuestionOrderResponse> {
    return await this.assessmentGrpcServiceClient.UpdateQuestionOrder(request);
  }

  async Destroy(request: DestroyPracticeRequest): Promise<DestroyPracticeResponse> {
    return await this.assessmentGrpcServiceClient.Destroy(request);
  }

  async TestDetails(request: TestDetailsRequest): Promise<TestDetailsResponse> {
    return await this.assessmentGrpcServiceClient.TestDetails(request);
  }

  async Index(request: FindAllRequest): Promise<FindAllResponse> {
    return await this.assessmentGrpcServiceClient.Index(request);
  }

  async GetOpeningGames(request: GetOpeningGamesRequest): Promise<GetOpeningGamesResponse> {
    return await this.assessmentGrpcServiceClient.GetOpeningGames(request);
  }

  async GetGameHistory(request: GetGameHistoryRequest): Promise<GetGameHistoryResponse> {
    return await this.assessmentGrpcServiceClient.GetGameHistory(request);
  }
  
  async GetGame(request: GetGameRequest): Promise<GetGameResponse> {
    return await this.assessmentGrpcServiceClient.GetGame(request);
  }
  
  async NewGame(request: NewGameRequest): Promise<NewGameResponse> {
    return await this.assessmentGrpcServiceClient.NewGame(request);
  }
  
  async CheckQuestionsBeforePublish(request: CheckQuestionsBeforePublishRequest): Promise<CheckQuestionsBeforePublishResponse> {
    return await this.assessmentGrpcServiceClient.CheckQuestionsBeforePublish(request);
  }
  
  async GetFeedbacks(request: GetFeedbacksRequest): Promise<GetFeedbacksResponse> {
    return await this.assessmentGrpcServiceClient.GetFeedbacks(request);
  }

  async SearchOne(request: SearchOneRequest): Promise<SearchOneResponse> {
    return await this.assessmentGrpcServiceClient.SearchOne(request);
  }

  async FindQuestionTemporary(request: FindQuestionTemporaryRequest): Promise<FindQuestionTemporaryResponse> {
    return await this.assessmentGrpcServiceClient.FindQuestionTemporary(request);
  }
  
  async GetByTestSeries(request: GetByTestSeriesRequest): Promise<GetByTestSeriesResponse> {
    return await this.assessmentGrpcServiceClient.GetByTestSeries(request);
  }
  
  async SupportedProfiles(): Promise<SupportedProfilesResponse> {
    return await this.assessmentGrpcServiceClient.SupportedProfiles({});
  }
  
  async FindTestByTestCode(request: FindTestByTestCodeRequest): Promise<FindTestByTestCodeResponse> {
    return await this.assessmentGrpcServiceClient.FindTestByTestCode(request);
  }

  async FindForMentor(request: FindForMentorRequest): Promise<FindForMentorResponse> {
    return await this.assessmentGrpcServiceClient.FindForMentor(request);
  }

  async GetBuyModeTestForTeacher(request: GetBuyModeTestForTeacherRequest): Promise<GetBuyModeTestForTeacherResponse> {
    return await this.assessmentGrpcServiceClient.GetBuyModeTestForTeacher(request);
  }

  async RemoveQuestion(request: RemoveQuestionRequest): Promise<RemoveQuestionResponse> {
    return await this.assessmentGrpcServiceClient.RemoveQuestion(request);
  }

  async CompletedTestStudentsByClass(request: CompletedTestStudentsByClassRequest): Promise<CompletedTestStudentsByClassResponse> {
    return await this.assessmentGrpcServiceClient.CompletedTestStudentsByClass(request);
  }

  async CompletedTestByClass(request: CompletedTestByClassRequest): Promise<CompletedTestByClassResponse> {
    return await this.assessmentGrpcServiceClient.CompletedTestByClass(request);
  }

  async OngoingTestByClass(request: OngoingTestByClassRequest): Promise<OngoingTestByClassResponse> {
    return await this.assessmentGrpcServiceClient.OngoingTestByClass(request);
  }
  
  async OngoingAttempts(request: OngoingAttemptsRequest): Promise<OngoingAttemptsResponse> {
    return await this.assessmentGrpcServiceClient.OngoingAttempts(request);
  }
  
  async TodayProctoredTests(request: TodayProctoredTestsRequest): Promise<TodayProctoredTestsResponse> {
    return await this.assessmentGrpcServiceClient.TodayProctoredTests(request);
  }

  async UpcomingTestByClass(request: UpcomingTestByClassRequest): Promise<UpcomingTestByClassResponse> {
    return await this.assessmentGrpcServiceClient.UpcomingTestByClass(request);
  }
  
  async GetSessionTimes(request: GetSessionTimesRequest): Promise<GetSessionTimesResponse> {
    return await this.assessmentGrpcServiceClient.GetSessionTimes(request);
  }

  async RecommendedTestsBySubject(request: RecommendedTestsBySubjectRequest): Promise<RecommendedTestsBySubjectResponse> {
    return await this.assessmentGrpcServiceClient.RecommendedTestsBySubject(request);
  }

  async RecentTestByUser(request: RecentTestByUserRequest): Promise<RecentTestByUserResponse> {
    return await this.assessmentGrpcServiceClient.RecentTestByUser(request);
  }

  async SearchTests(request: SearchTestsRequest): Promise<SearchTestsResponse> {
    return await this.assessmentGrpcServiceClient.SearchTests(request);
  }

  async SearchUnits(request: SearchUnitsRequest): Promise<SearchUnitsResponse> {
    return await this.assessmentGrpcServiceClient.SearchUnits(request);
  }

  async GetArchiveAssessments(request: ArchiveRequest): Promise<ArchiveResponse> {
    return await this.assessmentGrpcServiceClient.GetArchiveAssessments(request);
  }

  async SaveAs(request: SaveAsRequest): Promise<SaveAsResponse> {
    return await this.assessmentGrpcServiceClient.SaveAs(request);
  }

  async FindOneForSession(request: FindOneForSessionRequest): Promise<FindOneForSessionResponse> {
    return await this.assessmentGrpcServiceClient.FindOneForSession(request);
  }

  async FindOneWithQuestions(request: FindOneWithQuestionsRequest): Promise<FindOneWithQuestionsResponse> {
    return await this.assessmentGrpcServiceClient.FindOneWithQuestions(request);
  }
  
  async ShareLink(request: ShareLinkRequest): Promise<ShareLinkResponse> {
    return await this.assessmentGrpcServiceClient.ShareLink(request);
  }
  
  async CheckTestCode(request: CheckTestCodeRequest): Promise<CheckTestCodeResponse> {
    return await this.assessmentGrpcServiceClient.CheckTestCode(request);
  }
  
  async ExportPDF(request: ExportPDFRequest): Promise<ExportPDFResponse> {
    return await this.assessmentGrpcServiceClient.ExportPDF(request);
  }
  
  async FraudCheck(request: FraudCheckRequest): Promise<FraudCheckResponse> {
    return await this.assessmentGrpcServiceClient.FraudCheck(request);
  }

  async ImportFile(request: ImportFileReq): Promise<Empty> {
    return await this.assessmentGrpcServiceClient.ImportFile(request);
  }

  async GetStudentTakingTest(request: GetStudentTakingTestRequest): Promise<GetStudentTakingTestResponse> {
    return await this.assessmentGrpcServiceClient.GetStudentTakingTest(request);
  }

  async ImportQuestion(request: ImportQuestionRequest): Promise<ImportQuestionResponse> {
    return await this.assessmentGrpcServiceClient.ImportQuestion(request);
  }

  async ExportTest(request: ExportTestReq): Promise<Empty> {
    return await this.assessmentGrpcServiceClient.ExportTest(request);
  }

  async PlayGame(request: PlayGameRequest): Promise<PlayGameResponse> {
    return await this.assessmentGrpcServiceClient.PlayGame(request);
  }
  
  async FindForTeacher(request: FindForTeacherRequest): Promise<FindForTeacherResponse> {
    return await this.assessmentGrpcServiceClient.FindForTeacher(request);
  }
}
