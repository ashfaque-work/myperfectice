import {
    AccuracyBySubjectReq, CalculateSatTotalScoreReq, ClassroomListSubjectStudentDoRequest, ClassroomListSubjectStudentDoResponse,
    ClassroomListTopicStudentDoReq,
    ClassroomSummarySpeedByDateRequest, ClassroomSummarySpeedByDateResponse, ClassroomSummarySpeedRequest, ClassroomSummarySpeedResponse,
    CountAllByTeacherRequest, CountAllByTeacherResponse, CountAllRequest, CountAllResponse, CountByUserRequest, CountByUserResponse,
    CountMeRequest, CountMeResponse, CountStudentAttemptedRequest, CountStudentAttemptedResponse, CountSummaryAttemptedPracticeRequest,
    CountSummaryAttemptedPracticeResponse, CreateRequest, CreateResponse, Empty, FindAllByMeRequest, FindAllByMeResponse,
    FindAllByPracticeRequest, FindAllByPracticeResponse, FindAllByTeacherRequest, FindAllByTeacherResponse, FindAllNotCreatedByRequest,
    FindAllNotCreatedByResponse, FindOneAttemptByMeRequest, FindOneAttemptByMeResponse, FindOneAttemptRequest,
    FindOneAttemptResponse, FindOneByMeRequest, FindOneByMeResponse, FindOneRequest, FindOneResponse, FindPsychoResultByTestRequest,
    FindPsychoResultByTestResponse, FindQuestionFeedbackRequest, FindQuestionFeedbackResponse, FinishPsychoTestRequest,
    FinishPsychoTestResponse, FinishRequest, FinishResponse, GetAccuracyPercentileRequest, GetAccuracyPercentileResponse,
    GetAccuracyRankRequest, GetAccuracyRankResponse, GetAllProvidersRequest, GetAllProvidersResponse, GetAttemptByUserReq,
    GetAttemptRequest, GetAttemptResponse, GetCareerAttemptsRequest, GetCareerAttemptsResponse, GetCareerScoreRequest,
    GetCareerScoreResponse, GetCareerSumReq, GetClassroomByTestRequest, GetClassroomByTestResponse, GetCurrentDateResponse,
    GetFirstAttemptRequest, GetFirstAttemptResponse, GetLastByMeRequest, GetLastByMeResponse, GetLastByStudentRequest,
    GetLastByStudentResponse, GetListAvgSpeedByPracticeRequest, GetListAvgSpeedByPracticeResponse, GetListPercentCorrectByPracticeRequest,
    GetListSubjectsMeRequest, GetListSubjectsMeResponse, GetListSubjectsStudentRequest, GetListSubjectsStudentResponse,
    GetListTopicsMeRequest, GetListTopicsMeResponse, GetListTopicsStudentRequest, GetListTopicsStudentResponse, GetProctoringAttemptRequest,
    GetProctoringAttemptResponse, GetPsychoClassroomRequest, GetPsychoClassroomResponse, GetPsychoResultRequest, GetPsychoResultResponse,
    GetResultPracticeRequest, GetResultPracticeResponse, GetSpeedRankRequest, GetSpeedRankResponse, GetTotalQuestionBySubjectMeRequest,
    GetTotalQuestionBySubjectMeResponse, GetTotalQuestionBySubjectStudentRequest, GetTotalQuestionBySubjectStudentResponse,
    GetTotalQuestionTopicMeRequest, GetTotalQuestionTopicMeResponse, GetTotalQuestionTopicStudentRequest,
    GetTotalQuestionTopicStudentResponse, InvitationRequest, InvitationResponse, IsAllowDoTestRequest, IsAllowDoTestResponse,
    PartialSubmitAttemptRequest, PartialSubmitAttemptResponse, QuestionByComplexityRequest, QuestionByComplexityResponse,
    QuestionByConfidenceRequest, QuestionByConfidenceResponse, QuestionSubmitRequest, QuestionSubmitResponse,
    RecordQuestionReviewRequest, RecordQuestionReviewResponse, ResetItemInQueueRequest, ResetItemInQueueResponse,
    SaveCamCaptureRequest, SaveCamCaptureResponse, SaveQrUploadRequest, SaveQrUploadResponse, SaveScreenRecordingRequest, SaveScreenRecordingResponse, StartRequest, StartResponse, SubmitToQueueRequest, SubmitToQueueResponse,
    SummaryAbondonedMeRequest, SummaryAbondonedMeResponse, SummaryAbondonedStudentRequest, SummaryAbondonedStudentResponse,
    SummaryAttemptedBySubjectMeRequest, SummaryAttemptedBySubjectMeResponse, SummaryAttemptedBySubjectStudentRequest,
    SummaryAttemptedBySubjectStudentResponse, SummaryAttemptedPracticeRequest, SummaryAttemptedPracticeResponse,
    SummaryAttemptedStudentRequest, SummaryAttemptedStudentResponse, SummaryCorrectByDateMeRequest, SummaryCorrectByDateMeResponse,
    SummaryCorrectByDateStudentRequest, SummaryCorrectByDateStudentResponse, SummaryDoPracticeRequest, SummaryDoPracticeResponse,
    SummaryOnePracticeSetRequest, SummaryOnePracticeSetResponse, SummaryPracticeMeRequest, SummaryPracticeMeResponse,
    SummaryPracticeStudentRequest, SummaryPracticeStudentResponse, SummaryQuestionBySubjectMeRequest, SummaryQuestionBySubjectMeResponse,
    SummaryQuestionBySubjectStudentRequest, SummaryQuestionBySubjectStudentResponse, SummaryQuestionByTopicMeRequest,
    SummaryQuestionByTopicMeResponse, SummaryQuestionByTopicStudentRequest, SummaryQuestionByTopicStudentResponse,
    SummarySpeedTopicByDateMeRequest, SummarySpeedTopicByDateMeResponse, SummarySpeedTopicByDateStudentRequest,
    SummarySubjectCorrectByDateMeRequest, SummarySubjectCorrectByDateMeResponse, SummarySubjectCorrectByDateStudentRequest,
    SummarySubjectCorrectByDateStudentResponse, SummarySubjectCorrectMeRequest, SummarySubjectCorrectMeResponse,
    SummarySubjectCorrectStudentRequest, SummarySubjectCorrectStudentResponse, SummarySubjectSpeedByDateMeRequest,
    SummarySubjectSpeedByDateMeResponse, SummarySubjectSpeedByDateStudentRequest, SummarySubjectSpeedByDateStudentResponse,
    SummarySubjectSpeedByMeResponse, SummarySubjectSpeedMeRequest, SummarySubjectSpeedStudentRequest, SummarySubjectSpeedStudentResponse,
    SummaryTopicCorrectMeRequest, SummaryTopicCorrectMeResponse, SummaryTopicCorrectStudentRequest, SummaryTopicCorrectStudentResponse,
    SummaryTopicSpeedMeRequest, SummaryTopicSpeedMeResponse, SummaryTopicSpeedStudentRequest, SummaryTopicSpeedStudentResponse,
    TopperSummaryReq, UpdateAbandonStatusRequest, UpdateAbandonStatusResponse, UpdateSuspiciousRequest, UpdateSuspiciousResponse,
    UpdateTimeLimitExhaustedCountRequest, UpdateTimeLimitExhaustedCountResponse
} from "@app/common/dto/attempt.dto";
import { AttemptGrpcServiceClientImpl } from "@app/common/grpc-clients/attempt";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AttemptService {
    constructor(private attemptGrpcServiceClientImpl: AttemptGrpcServiceClientImpl) { }

    async findAllByMe(request: FindAllByMeRequest): Promise<FindAllByMeResponse> {
        return await this.attemptGrpcServiceClientImpl.FindAllByMe(request)
    }

    async getFirstAttempt(request: GetFirstAttemptRequest): Promise<GetFirstAttemptResponse> {
        return await this.attemptGrpcServiceClientImpl.GetFirstAttempt(request)
    }

    async findQuestionFeedback(request: FindQuestionFeedbackRequest): Promise<FindQuestionFeedbackResponse> {
        return await this.attemptGrpcServiceClientImpl.FindQuestionFeedback(request)
    }

    async findOneAttemptByMe(request: FindOneAttemptByMeRequest): Promise<FindOneAttemptByMeResponse> {
        return await this.attemptGrpcServiceClientImpl.FindOneAttemptByMe(request)
    }

    async isAllowDoTest(request: IsAllowDoTestRequest): Promise<IsAllowDoTestResponse> {
        return await this.attemptGrpcServiceClientImpl.IsAllowDoTest(request)
    }

    async findAllByTeacher(request: FindAllByTeacherRequest): Promise<FindAllByTeacherResponse> {
        return await this.attemptGrpcServiceClientImpl.FindAllByTeacher(request)
    }

    async getCurrentDate(): Promise<GetCurrentDateResponse> {
        return await this.attemptGrpcServiceClientImpl.GetCurrentDate({})
    }

    async countAllByTeacher(request: CountAllByTeacherRequest): Promise<CountAllByTeacherResponse> {
        return await this.attemptGrpcServiceClientImpl.CountAllByTeacher(request)
    }

    async countMe(request: CountMeRequest): Promise<CountMeResponse> {
        return await this.attemptGrpcServiceClientImpl.CountMe(request)
    }

    async countAll(request: CountAllRequest): Promise<CountAllResponse> {
        return await this.attemptGrpcServiceClientImpl.CountAll(request)
    }

    async findAllByPractice(request: FindAllByPracticeRequest): Promise<FindAllByPracticeResponse> {
        return await this.attemptGrpcServiceClientImpl.FindAllByPractice(request)
    }

    async getResultPractice(request: GetResultPracticeRequest): Promise<GetResultPracticeResponse> {
        return await this.attemptGrpcServiceClientImpl.GetResultPractice(request)
    }

    async getLastByMe(request: GetLastByMeRequest): Promise<GetLastByMeResponse> {
        return await this.attemptGrpcServiceClientImpl.GetLastByMe(request)
    }

    async getLastByStudent(request: GetLastByStudentRequest): Promise<GetLastByStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.GetLastByStudent(request)
    }

    async getListAvgSpeedByPractice(request: GetListAvgSpeedByPracticeRequest): Promise<GetListAvgSpeedByPracticeResponse> {
        return await this.attemptGrpcServiceClientImpl.GetListAvgSpeedByPractice(request)
    }

    async getListPercentCorrectByPractice(request: GetListPercentCorrectByPracticeRequest) {
        return await this.attemptGrpcServiceClientImpl.GetListPercentCorrectByPractice(request);
    }

    async getPsychoClassroom(request: GetPsychoClassroomRequest): Promise<GetPsychoClassroomResponse> {
        return await this.attemptGrpcServiceClientImpl.GetPsychoClassroom(request)
    }

    async getAllProviders(request: GetAllProvidersRequest): Promise<GetAllProvidersResponse> {
        return await this.attemptGrpcServiceClientImpl.GetAllProviders(request)
    }

    async findOneByMe(request: FindOneByMeRequest): Promise<FindOneByMeResponse> {
        return await this.attemptGrpcServiceClientImpl.FindOneByMe(request)
    }

    async invitation(request: InvitationRequest): Promise<InvitationResponse> {
        return await this.attemptGrpcServiceClientImpl.Invitation(request)
    }

    async findAllNotCreatedBy(request: FindAllNotCreatedByRequest): Promise<FindAllNotCreatedByResponse> {
        return await this.attemptGrpcServiceClientImpl.FindAllNotCreatedBy(request)
    }

    async getListSubjectsMe(request: GetListSubjectsMeRequest): Promise<GetListSubjectsMeResponse> {
        return await this.attemptGrpcServiceClientImpl.GetListSubjectsMe(request)
    }

    async getTotalQuestionTopicMe(request: GetTotalQuestionTopicMeRequest): Promise<GetTotalQuestionTopicMeResponse> {
        return await this.attemptGrpcServiceClientImpl.GetTotalQuestionTopicMe(request)
    }

    async getTotalQuestionBySubjectMe(request: GetTotalQuestionBySubjectMeRequest): Promise<GetTotalQuestionBySubjectMeResponse> {
        return await this.attemptGrpcServiceClientImpl.GetTotalQuestionBySubjectMe(request)
    }

    async getListTopicsMe(request: GetListTopicsMeRequest): Promise<GetListTopicsMeResponse> {
        return await this.attemptGrpcServiceClientImpl.GetListTopicsMe(request)
    }

    async summaryTopicCorrectMe(request: SummaryTopicCorrectMeRequest): Promise<SummaryTopicCorrectMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryTopicCorrectMe(request)
    }

    async summaryTopicSpeedMe(request: SummaryTopicSpeedMeRequest): Promise<SummaryTopicSpeedMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryTopicSpeedMe(request)
    }

    async summarySubjectCorrectMe(request: SummarySubjectCorrectMeRequest): Promise<SummarySubjectCorrectMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummarySubjectCorrectMe(request)
    }

    async summarySubjectCorrectByDateMe(request: SummarySubjectCorrectByDateMeRequest): Promise<SummarySubjectCorrectByDateMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummarySubjectCorrectByDateMe(request)
    }

    async summaryCorrectByDateMe(request: SummaryCorrectByDateMeRequest): Promise<SummaryCorrectByDateMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryCorrectByDateMe(request)
    }

    async summarySubjectSpeedByDateMe(request: SummarySubjectSpeedByDateMeRequest): Promise<SummarySubjectSpeedByDateMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummarySubjectSpeedByDateMe(request)
    }

    async summaryAttemptedBySubjectMe(request: SummaryAttemptedBySubjectMeRequest): Promise<SummaryAttemptedBySubjectMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryAttemptedBySubjectMe(request)
    }

    async summarySubjectSpeedMe(request: SummarySubjectSpeedMeRequest): Promise<SummarySubjectSpeedByMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummarySubjectSpeedMe(request)
    }

    async summaryQuestionByTopicMe(request: SummaryQuestionByTopicMeRequest): Promise<SummaryQuestionByTopicMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryQuestionByTopicMe(request)
    }

    async summaryAbondonedMe(request: SummaryAbondonedMeRequest): Promise<SummaryAbondonedMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryAbondonedMe(request)
    }

    async summaryPracticeMe(request: SummaryPracticeMeRequest): Promise<SummaryPracticeMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryPracticeMe(request)
    }

    async summaryQuestionBySubjectMe(request: SummaryQuestionBySubjectMeRequest): Promise<SummaryQuestionBySubjectMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryQuestionBySubjectMe(request)
    }

    async summaryDoPractice(request: SummaryDoPracticeRequest): Promise<SummaryDoPracticeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryDoPractice(request)
    }

    async questionByConfidence(request: QuestionByConfidenceRequest): Promise<QuestionByConfidenceResponse> {
        return await this.attemptGrpcServiceClientImpl.QuestionByConfidence(request)
    }

    async summarySpeedTopicByDateMe(request: SummarySpeedTopicByDateMeRequest): Promise<SummarySpeedTopicByDateMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummarySpeedTopicByDateMe(request)
    }

    async getSpeedRank(request: GetSpeedRankRequest): Promise<GetSpeedRankResponse> {
        return await this.attemptGrpcServiceClientImpl.GetSpeedRank(request)
    }

    async getAccuracyRank(request: GetAccuracyRankRequest): Promise<GetAccuracyRankResponse> {
        return await this.attemptGrpcServiceClientImpl.GetAccuracyRank(request)
    }

    async getAccuracyPercentile(request: GetAccuracyPercentileRequest): Promise<GetAccuracyPercentileResponse> {
        return await this.attemptGrpcServiceClientImpl.GetAccuracyPercentile(request)
    }

    async classroomListSubjectStudentDo(request: ClassroomListSubjectStudentDoRequest): Promise<ClassroomListSubjectStudentDoResponse> {
        return await this.attemptGrpcServiceClientImpl.ClassroomListSubjectStudentDo(request)
    }

    async classroomListTopicStudentDo(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.ClassroomListTopicStudentDo(request)
    }

    async classroomSummaryQuestionBySubject(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.ClassroomSummaryQuestionBySubject(request)
    }

    async classroomSummaryAttempted(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.ClassroomSummaryAttempted(request)
    }

    async classroomSummaryAttemptedAllClassrooms(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.ClassroomSummaryAttemptedAllClassrooms(request)
    }

    async classroomSummaryQuestionByTopic(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.ClassroomSummaryQuestionByTopic(request)
    }

    async classroomSummaryCorrect(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.ClassroomSummaryCorrect(request)
    }

    async classroomSummaryCorrectByDate(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.ClassroomSummaryCorrectByDate(request)
    }




    async getListSubjectsStudent(request: GetListSubjectsStudentRequest): Promise<GetListSubjectsStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.GetListSubjectsStudent(request)
    }

    async getTotalQuestionTopicStudent(request: GetTotalQuestionTopicStudentRequest): Promise<GetTotalQuestionTopicStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.GetTotalQuestionTopicStudent(request)
    }

    async getTotalQuestionBySubjectStudent(request: GetTotalQuestionBySubjectStudentRequest): Promise<GetTotalQuestionBySubjectStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.GetTotalQuestionBySubjectStudent(request)
    }

    async getListTopicsStudent(request: GetListTopicsStudentRequest): Promise<GetListTopicsStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.GetListTopicsStudent(request)
    }

    async summaryTopicSpeedStudent(request: SummaryTopicSpeedStudentRequest): Promise<SummaryTopicSpeedStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryTopicSpeedStudent(request)
    }

    async summaryTopicCorrectStudent(request: SummaryTopicCorrectStudentRequest): Promise<SummaryTopicCorrectStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryTopicCorrectStudent(request)
    }

    async summarySubjectCorrectStudent(request: SummarySubjectCorrectStudentRequest): Promise<SummarySubjectCorrectStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummarySubjectCorrectStudent(request)
    }

    async summarySubjectCorrectByDateStudent(request: SummarySubjectCorrectByDateStudentRequest): Promise<SummarySubjectCorrectByDateStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummarySubjectCorrectByDateStudent(request)
    }

    async summarySubjectSpeedByDateStudent(request: SummarySubjectSpeedByDateStudentRequest): Promise<SummarySubjectSpeedByDateStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummarySubjectSpeedByDateStudent(request)
    }

    async summaryCorrectByDateStudent(request: SummaryCorrectByDateStudentRequest): Promise<SummaryCorrectByDateStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryCorrectByDateStudent(request)
    }

    async summaryAttemptedBySubjectStudent(request: SummaryAttemptedBySubjectStudentRequest): Promise<SummaryAttemptedBySubjectStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryAttemptedBySubjectStudent(request)
    }

    async summarySubjectSpeedStudent(request: SummarySubjectSpeedStudentRequest): Promise<SummarySubjectSpeedStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummarySubjectSpeedStudent(request)
    }

    async summaryAbondonedStudent(request: SummaryAbondonedStudentRequest): Promise<SummaryAbondonedStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryAbondonedStudent(request)
    }

    async summaryPracticeStudent(request: SummaryPracticeStudentRequest): Promise<SummaryPracticeStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryPracticeStudent(request)
    }

    async summaryAttemptedStudent(request: SummaryAttemptedStudentRequest): Promise<SummaryAttemptedStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryAttemptedStudent(request)
    }

    async summaryQuestionBySubjectStudent(request: SummaryQuestionBySubjectStudentRequest): Promise<SummaryQuestionBySubjectStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryQuestionBySubjectStudent(request)
    }

    async summarySpeedTopicByDateStudent(request: SummarySpeedTopicByDateStudentRequest) {
        return await this.attemptGrpcServiceClientImpl.SummarySpeedTopicByDateStudent(request)
    }

    async summaryQuestionByTopicStudent(request: SummaryQuestionByTopicStudentRequest): Promise<SummaryQuestionByTopicStudentResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryQuestionByTopicStudent(request)
    }

    async questionByComplexity(request: QuestionByComplexityRequest): Promise<QuestionByComplexityResponse> {
        return await this.attemptGrpcServiceClientImpl.QuestionByComplexity(request)
    }

    async getProctoringAttempt(request: GetProctoringAttemptRequest): Promise<GetProctoringAttemptResponse> {
        return await this.attemptGrpcServiceClientImpl.GetProctoringAttempt(request)
    }

    async summaryOnePracticeSet(request: SummaryOnePracticeSetRequest): Promise<SummaryOnePracticeSetResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryOnePracticeSet(request)
    }

    async summaryAttemptedPractice(request: SummaryAttemptedPracticeRequest): Promise<SummaryAttemptedPracticeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryAttemptedPractice(request)
    }

    async countStudentAttempted(request: CountStudentAttemptedRequest): Promise<CountStudentAttemptedResponse> {
        return await this.attemptGrpcServiceClientImpl.CountStudentAttempted(request)
    }

    async countSummaryAttemptedPractice(request: CountSummaryAttemptedPracticeRequest): Promise<CountSummaryAttemptedPracticeResponse> {
        return await this.attemptGrpcServiceClientImpl.CountSummaryAttemptedPractice(request)
    }

    async countByUser(request: CountByUserRequest): Promise<CountByUserResponse> {
        return await this.attemptGrpcServiceClientImpl.CountByUser(request)
    }

    async updateTimeLimitExhaustedCount(request: UpdateTimeLimitExhaustedCountRequest): Promise<UpdateTimeLimitExhaustedCountResponse> {
        return await this.attemptGrpcServiceClientImpl.UpdateTimeLimitExhaustedCount(request)
    }

    async updateSuspicious(request: UpdateSuspiciousRequest): Promise<UpdateSuspiciousResponse> {
        return await this.attemptGrpcServiceClientImpl.UpdateSuspicious(request)
    }

    async start(request: StartRequest): Promise<StartResponse> {
        return await this.attemptGrpcServiceClientImpl.Start(request)
    }

    async finishPsychoTest(request: FinishPsychoTestRequest): Promise<FinishPsychoTestResponse> {
        return await this.attemptGrpcServiceClientImpl.FinishPsychoTest(request);
    }

    async partialSubmitAttempt(request: PartialSubmitAttemptRequest): Promise<PartialSubmitAttemptResponse> {
        return await this.attemptGrpcServiceClientImpl.PartialSubmitAttempt(request)
    }

    async submitToQueue(request: SubmitToQueueRequest): Promise<SubmitToQueueResponse> {
        return await this.attemptGrpcServiceClientImpl.SubmitToQueue(request)
    }

    async resetItemInQueue(request: ResetItemInQueueRequest): Promise<ResetItemInQueueResponse> {
        return await this.attemptGrpcServiceClientImpl.ResetItemInQueue(request)
    }

    async questionSubmit(request: QuestionSubmitRequest): Promise<QuestionSubmitResponse> {
        return await this.attemptGrpcServiceClientImpl.QuestionSubmit(request)
    }

    async saveCamCapture(request: SaveCamCaptureRequest): Promise<SaveCamCaptureResponse> {
        return await this.attemptGrpcServiceClientImpl.SaveCamCapture(request)
    }

    async recordQuestionReview(request: RecordQuestionReviewRequest): Promise<RecordQuestionReviewResponse> {
        return await this.attemptGrpcServiceClientImpl.RecordQuestionReview(request)
    }

    async updateAbandonStatus(request: UpdateAbandonStatusRequest): Promise<UpdateAbandonStatusResponse> {
        return await this.attemptGrpcServiceClientImpl.UpdateAbandonStatus(request)
    }

    async findPsychoResultByTest(request: FindPsychoResultByTestRequest): Promise<FindPsychoResultByTestResponse> {
        return await this.attemptGrpcServiceClientImpl.FindPsychoResultByTest(request)
    }

    async getPsychoResult(request: GetPsychoResultRequest): Promise<GetPsychoResultResponse> {
        return await this.attemptGrpcServiceClientImpl.GetPsychoResult(request)
    }

    async findOneAttempt(request: FindOneAttemptRequest): Promise<FindOneAttemptResponse> {
        return await this.attemptGrpcServiceClientImpl.FindOneAttempt(request)
    }

    async getClassroomByTest(request: GetClassroomByTestRequest): Promise<GetClassroomByTestResponse> {
        return await this.attemptGrpcServiceClientImpl.GetClassroomByTest(request)
    }

    async getCareerScore(request: GetCareerScoreRequest): Promise<GetCareerScoreResponse> {
        return await this.attemptGrpcServiceClientImpl.GetCareerScore(request)
    }

    async getAttempt(request: GetAttemptRequest): Promise<GetAttemptResponse> {
        return await this.attemptGrpcServiceClientImpl.GetAttempt(request)
    }

    async finish(request: FinishRequest): Promise<FinishResponse> {
        return await this.attemptGrpcServiceClientImpl.Finish(request)
    }

    async create(request: CreateRequest): Promise<CreateResponse> {
        return await this.attemptGrpcServiceClientImpl.Create(request)
    }

    async getCareerAttempts(request: GetCareerAttemptsRequest): Promise<GetCareerAttemptsResponse> {
        return await this.attemptGrpcServiceClientImpl.GetCareerAttempts(request)
    }

    async getCareerSum(request: GetCareerSumReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.GetCareerSum(request)
    }

    async findOne(request: FindOneRequest): Promise<FindOneResponse> {
        return await this.attemptGrpcServiceClientImpl.FindOne(request)
    }

    async classroomSummarySpeed(request: ClassroomSummarySpeedRequest): Promise<ClassroomSummarySpeedResponse> {
        return await this.attemptGrpcServiceClientImpl.ClassroomSummarySpeed(request)
    }

    async classroomSummarySpeedByDate(request: ClassroomSummarySpeedByDateRequest): Promise<ClassroomSummarySpeedByDateResponse> {
        return await this.attemptGrpcServiceClientImpl.ClassroomSummarySpeedByDate(request)
    }

    async test(request: ClassroomListTopicStudentDoReq): Promise<any> {
        return await this.attemptGrpcServiceClientImpl.Test(request)
    }

    async summaryAllSubjectCorrectByDateMe(request: SummarySubjectCorrectByDateMeRequest): Promise<SummarySubjectCorrectByDateMeResponse> {
        return await this.attemptGrpcServiceClientImpl.SummaryAllSubjectCorrectByDateMe(request)
    }

    async calculateSatTotalScore(request: CalculateSatTotalScoreReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.CalculateSatTotalScore(request)
    }

    async getAttemptByUser(request: GetAttemptByUserReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.GetAttemptByUser(request)
    }

    async topperSummary(request: TopperSummaryReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.TopperSummary(request)
    }

    async accuracyBySubject(request: AccuracyBySubjectReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.AccuracyBySubject(request)
    }

    async getUserResponse(request: CalculateSatTotalScoreReq): Promise<Empty> {
        return await this.attemptGrpcServiceClientImpl.GetUserResponse(request)
    }

    async saveScreenRecording(request: SaveScreenRecordingRequest): Promise<SaveScreenRecordingResponse> {
        return await this.attemptGrpcServiceClientImpl.SaveScreenRecording(request)
    }

    async saveQrUpload(request: SaveQrUploadRequest): Promise<SaveQrUploadResponse> {
        return await this.attemptGrpcServiceClientImpl.SaveQrUpload(request)
    }
}