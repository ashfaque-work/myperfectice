import {
    AccuracyBySubjectReq, CalculateSatTotalScoreReq, ClassroomListSubjectStudentDoRequest, ClassroomListSubjectStudentDoResponse,
    ClassroomListTopicStudentDoReq,
    ClassroomSummarySpeedByDateRequest, ClassroomSummarySpeedByDateResponse, ClassroomSummarySpeedRequest, ClassroomSummarySpeedResponse,
    CountAllByTeacherRequest, CountAllByTeacherResponse, CountAllRequest, CountAllResponse, CountByUserRequest, CountByUserResponse,
    CountMeRequest, CountMeResponse, CountStudentAttemptedRequest, CountStudentAttemptedResponse, CountSummaryAttemptedPracticeRequest,
    CountSummaryAttemptedPracticeResponse, CreateRequest, CreateResponse, Empty, FindAllByMeRequest, FindAllByMeResponse,
    FindAllByPracticeRequest, FindAllByPracticeResponse, FindAllByTeacherRequest, FindAllByTeacherResponse, FindAllNotCreatedByRequest,
    FindAllNotCreatedByResponse, FindOneAttemptByMeRequest, FindOneAttemptByMeResponse, FindOneAttemptRequest, FindOneAttemptResponse,
    FindOneByMeRequest, FindOneByMeResponse, FindOneRequest, FindOneResponse, FindPsychoResultByTestRequest, FindPsychoResultByTestResponse,
    FindQuestionFeedbackRequest, FindQuestionFeedbackResponse, FinishPsychoTestRequest, FinishPsychoTestResponse, FinishRequest,
    FinishResponse, GetAccuracyPercentileRequest, GetAccuracyPercentileResponse, GetAccuracyRankRequest, GetAccuracyRankResponse,
    GetAllProvidersRequest, GetAllProvidersResponse, GetAttemptByUserReq, GetAttemptRequest, GetAttemptResponse, GetCareerAttemptsRequest,
    GetCareerAttemptsResponse, GetCareerScoreRequest, GetCareerScoreResponse, GetCareerSumReq, GetClassroomByTestRequest,
    GetClassroomByTestResponse, GetCurrentDateResponse, GetFirstAttemptRequest, GetFirstAttemptResponse, GetLastByMeRequest,
    GetLastByMeResponse, GetLastByStudentRequest, GetLastByStudentResponse, GetListAvgSpeedByPracticeRequest,
    GetListAvgSpeedByPracticeResponse, GetListPercentCorrectByPracticeRequest, GetListPercentCorrectByPracticeResponse,
    GetListSubjectsMeRequest, GetListSubjectsMeResponse, GetListSubjectsStudentRequest, GetListSubjectsStudentResponse,
    GetListTopicsMeRequest, GetListTopicsMeResponse, GetListTopicsStudentRequest, GetListTopicsStudentResponse,
    GetProctoringAttemptRequest, GetProctoringAttemptResponse, GetPsychoClassroomRequest, GetPsychoClassroomResponse,
    GetPsychoResultRequest, GetPsychoResultResponse, GetResultPracticeRequest, GetResultPracticeResponse, GetSpeedRankRequest,
    GetSpeedRankResponse, GetTotalQuestionBySubjectMeRequest, GetTotalQuestionBySubjectMeResponse, GetTotalQuestionBySubjectStudentRequest,
    GetTotalQuestionBySubjectStudentResponse, GetTotalQuestionTopicMeRequest, GetTotalQuestionTopicMeResponse,
    GetTotalQuestionTopicStudentRequest, GetTotalQuestionTopicStudentResponse, InvitationRequest, InvitationResponse,
    IsAllowDoTestRequest, IsAllowDoTestResponse, PartialSubmitAttemptRequest, PartialSubmitAttemptResponse,
    QuestionByComplexityRequest, QuestionByComplexityResponse, QuestionByConfidenceRequest, QuestionByConfidenceResponse,
    QuestionSubmitRequest, QuestionSubmitResponse, RecordQuestionReviewRequest, RecordQuestionReviewResponse,
    ResetItemInQueueRequest, ResetItemInQueueResponse, SaveCamCaptureRequest, SaveCamCaptureResponse, SaveQrUploadRequest, SaveQrUploadResponse, SaveScreenRecordingRequest, SaveScreenRecordingResponse, StartRequest, StartResponse,
    SubmitToQueueRequest, SubmitToQueueResponse, SummaryAbondonedMeRequest, SummaryAbondonedMeResponse, SummaryAbondonedStudentRequest,
    SummaryAbondonedStudentResponse, SummaryAttemptedBySubjectMeRequest, SummaryAttemptedBySubjectMeResponse,
    SummaryAttemptedBySubjectStudentRequest, SummaryAttemptedBySubjectStudentResponse, SummaryAttemptedPracticeRequest,
    SummaryAttemptedPracticeResponse, SummaryAttemptedStudentRequest, SummaryAttemptedStudentResponse, SummaryCorrectByDateMeRequest,
    SummaryCorrectByDateMeResponse, SummaryCorrectByDateStudentRequest, SummaryCorrectByDateStudentResponse,
    SummaryDoPracticeRequest, SummaryDoPracticeResponse, SummaryOnePracticeSetRequest, SummaryOnePracticeSetResponse,
    SummaryPracticeMeRequest, SummaryPracticeMeResponse, SummaryPracticeStudentRequest, SummaryPracticeStudentResponse,
    SummaryQuestionBySubjectMeRequest, SummaryQuestionBySubjectMeResponse, SummaryQuestionBySubjectStudentRequest,
    SummaryQuestionBySubjectStudentResponse, SummaryQuestionByTopicMeRequest, SummaryQuestionByTopicMeResponse,
    SummaryQuestionByTopicStudentRequest, SummaryQuestionByTopicStudentResponse, SummarySpeedTopicByDateMeRequest,
    SummarySpeedTopicByDateMeResponse, SummarySpeedTopicByDateStudentRequest, SummarySpeedTopicByDateStudentResponse,
    SummarySubjectCorrectByDateMeRequest, SummarySubjectCorrectByDateMeResponse, SummarySubjectCorrectByDateStudentRequest,
    SummarySubjectCorrectByDateStudentResponse, SummarySubjectCorrectMeRequest, SummarySubjectCorrectMeResponse,
    SummarySubjectCorrectStudentRequest, SummarySubjectCorrectStudentResponse, SummarySubjectSpeedByDateMeRequest,
    SummarySubjectSpeedByDateMeResponse, SummarySubjectSpeedByDateStudentRequest, SummarySubjectSpeedByDateStudentResponse,
    SummarySubjectSpeedByMeResponse, SummarySubjectSpeedMeRequest, SummarySubjectSpeedStudentRequest, SummarySubjectSpeedStudentResponse,
    SummaryTopicCorrectMeRequest, SummaryTopicCorrectMeResponse, SummaryTopicCorrectStudentRequest, SummaryTopicCorrectStudentResponse,
    SummaryTopicSpeedMeRequest, SummaryTopicSpeedMeResponse, SummaryTopicSpeedStudentRequest, SummaryTopicSpeedStudentResponse,
    TopperSummaryReq, UpdateAbandonStatusRequest, UpdateAbandonStatusResponse, UpdateSuspiciousRequest, UpdateSuspiciousResponse,
    UpdateTimeLimitExhaustedCountRequest, UpdateTimeLimitExhaustedCountResponse
} from '@app/common/dto/attempt.dto';
import { Inject, Injectable, Logger, RequestTimeoutException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

export const protobufAttemptPackage = 'attempt';
export const protobufAttemptService = 'AttemptGrpcService'

export interface AttemptGrpcInterface {
    FindAllByMe(request: FindAllByMeRequest): Promise<FindAllByMeResponse>;
    GetFirstAttempt(request: GetFirstAttemptRequest): Promise<GetFirstAttemptResponse>;
    FindQuestionFeedback(request: FindQuestionFeedbackRequest): Promise<FindQuestionFeedbackResponse>;
    FindOneAttemptByMe(request: FindOneAttemptByMeRequest): Promise<FindOneAttemptByMeResponse>;
    IsAllowDoTest(request: IsAllowDoTestRequest): Promise<IsAllowDoTestResponse>;
    FindAllByTeacher(request: FindAllByTeacherRequest): Promise<FindAllByTeacherResponse>;
    GetCurrentDate({ }): Promise<GetCurrentDateResponse>;
    CountAllByTeacher(request: CountAllByTeacherRequest): Promise<CountAllByTeacherResponse>;
    CountMe(request: CountMeRequest): Promise<CountMeResponse>;
    CountAll(request: CountAllRequest): Promise<CountAllResponse>
    FindAllByPractice(request: FindAllByPracticeRequest): Promise<FindAllByPracticeResponse>
    GetResultPractice(request: GetResultPracticeRequest): Promise<GetResultPracticeResponse>;
    GetLastByMe(request: GetLastByMeRequest): Promise<GetLastByMeResponse>;
    GetLastByStudent(request: GetLastByStudentRequest): Promise<GetLastByStudentResponse>
    GetListAvgSpeedByPractice(request: GetListAvgSpeedByPracticeRequest): Promise<GetListAvgSpeedByPracticeResponse>;
    GetListPercentCorrectByPractice(request: GetListPercentCorrectByPracticeRequest): Promise<GetListPercentCorrectByPracticeResponse>;
    GetPsychoClassroom(request: GetPsychoClassroomRequest): Promise<GetPsychoClassroomResponse>;
    GetAllProviders(request: GetAllProvidersRequest): Promise<GetAllProvidersResponse>;
    FindOneByMe(request: FindOneByMeRequest): Promise<FindOneByMeResponse>;
    Invitation(request: InvitationRequest): Promise<InvitationResponse>;
    FindAllNotCreatedBy(request: FindAllNotCreatedByRequest): Promise<FindAllNotCreatedByResponse>;
    GetListSubjectsMe(request: GetListSubjectsMeRequest): Promise<GetListSubjectsMeResponse>;
    GetTotalQuestionTopicMe(request: GetTotalQuestionTopicMeRequest): Promise<GetTotalQuestionTopicMeResponse>;
    GetTotalQuestionBySubjectMe(request: GetTotalQuestionBySubjectMeRequest): Promise<GetTotalQuestionBySubjectMeResponse>;
    GetListTopicsMe(request: GetListTopicsMeRequest): Promise<GetListTopicsMeResponse>;
    SummaryTopicCorrectMe(request: SummaryTopicCorrectMeRequest): Promise<SummaryTopicCorrectMeResponse>;
    SummaryTopicSpeedMe(request: SummaryTopicSpeedMeRequest): Promise<SummaryTopicSpeedMeResponse>
    SummarySubjectCorrectMe(request: SummarySubjectCorrectMeRequest): Promise<SummarySubjectCorrectMeResponse>;
    SummarySubjectCorrectByDateMe(request: SummarySubjectCorrectByDateMeRequest): Promise<SummarySubjectCorrectByDateMeResponse>;
    SummaryCorrectByDateMe(request: SummaryCorrectByDateMeRequest): Promise<SummaryCorrectByDateMeResponse>;
    SummarySubjectSpeedByDateMe(request: SummarySubjectSpeedByDateMeRequest): Promise<SummarySubjectSpeedByDateMeResponse>;
    SummaryAttemptedBySubjectMe(request: SummaryAttemptedBySubjectMeRequest): Promise<SummaryAttemptedBySubjectMeResponse>;
    SummarySubjectSpeedMe(request: SummarySubjectSpeedMeRequest): Promise<SummarySubjectSpeedByMeResponse>;
    SummaryQuestionByTopicMe(request: SummaryQuestionByTopicMeRequest): Promise<SummaryQuestionByTopicMeResponse>;
    SummaryAbondonedMe(request: SummaryAbondonedMeRequest): Promise<SummaryAbondonedMeResponse>;
    SummaryPracticeMe(request: SummaryPracticeMeRequest): Promise<SummaryPracticeMeResponse>;
    SummaryQuestionBySubjectMe(request: SummaryQuestionBySubjectMeRequest): Promise<SummaryQuestionBySubjectMeResponse>;
    SummaryDoPractice(request: SummaryDoPracticeRequest): Promise<SummaryDoPracticeResponse>;
    QuestionByConfidence(request: QuestionByConfidenceRequest): Promise<QuestionByConfidenceResponse>;
    SummarySpeedTopicByDateMe(request: SummarySpeedTopicByDateMeRequest): Promise<SummarySpeedTopicByDateMeResponse>;
    GetSpeedRank(request: GetSpeedRankRequest): Promise<GetSpeedRankResponse>;
    GetAccuracyRank(request: GetAccuracyRankRequest): Promise<GetAccuracyRankResponse>;
    GetAccuracyPercentile(request: GetAccuracyPercentileRequest): Promise<GetAccuracyPercentileResponse>;
    ClassroomListSubjectStudentDo(request: ClassroomListSubjectStudentDoRequest): Promise<ClassroomListSubjectStudentDoResponse>;
    ClassroomListTopicStudentDo(request: ClassroomListTopicStudentDoReq): Promise<Empty>;
    ClassroomSummaryQuestionBySubject(request: ClassroomListTopicStudentDoReq): Promise<Empty>;
    ClassroomSummaryAttempted(request: ClassroomListTopicStudentDoReq): Promise<Empty>;
    ClassroomSummaryAttemptedAllClassrooms(request: ClassroomListTopicStudentDoReq): Promise<Empty>;
    ClassroomSummaryQuestionByTopic(request: ClassroomListTopicStudentDoReq): Observable<any>;
    ClassroomSummaryCorrect(request: ClassroomListTopicStudentDoReq): Promise<Empty>;
    ClassroomSummaryCorrectByDate(request: ClassroomListTopicStudentDoReq): Promise<Empty>;
    GetListSubjectsStudent(request: GetListSubjectsStudentRequest): Promise<GetListSubjectsStudentResponse>
    GetTotalQuestionTopicStudent(request: GetTotalQuestionTopicStudentRequest): Promise<GetTotalQuestionTopicStudentResponse>;
    GetTotalQuestionBySubjectStudent(request: GetTotalQuestionBySubjectStudentRequest): Promise<GetTotalQuestionBySubjectStudentResponse>;
    GetListTopicsStudent(request: GetListTopicsStudentRequest): Promise<GetListTopicsStudentResponse>;
    SummaryTopicSpeedStudent(request: SummaryTopicSpeedStudentRequest): Promise<SummaryTopicSpeedStudentResponse>;
    SummaryTopicCorrectStudent(request: SummaryTopicCorrectStudentRequest): Promise<SummaryTopicCorrectStudentResponse>;
    SummarySubjectCorrectStudent(request: SummarySubjectCorrectStudentRequest): Promise<SummarySubjectCorrectStudentResponse>;
    SummarySubjectCorrectByDateStudent(request: SummarySubjectCorrectByDateStudentRequest): Promise<SummarySubjectCorrectByDateStudentResponse>;
    SummarySubjectSpeedByDateStudent(request: SummarySubjectSpeedByDateStudentRequest): Promise<SummarySubjectSpeedByDateStudentResponse>;
    SummaryCorrectByDateStudent(request: SummaryCorrectByDateStudentRequest): Promise<SummaryCorrectByDateStudentResponse>;
    SummaryAttemptedBySubjectStudent(request: SummaryAttemptedBySubjectStudentRequest): Promise<SummaryAttemptedBySubjectStudentResponse>;
    SummarySubjectSpeedStudent(request: SummarySubjectSpeedStudentRequest): Promise<SummarySubjectSpeedStudentResponse>;
    SummaryAbondonedStudent(request: SummaryAbondonedStudentRequest): Promise<SummaryAbondonedStudentResponse>;
    SummaryPracticeStudent(request: SummaryPracticeStudentRequest): Promise<SummaryPracticeStudentResponse>;
    SummaryAttemptedStudent(request: SummaryAttemptedStudentRequest): Promise<SummaryAttemptedStudentResponse>;
    SummaryQuestionBySubjectStudent(request: SummaryQuestionBySubjectStudentRequest): Promise<SummaryQuestionBySubjectStudentResponse>;
    SummarySpeedTopicByDateStudent(request: SummarySpeedTopicByDateStudentRequest): Promise<SummarySpeedTopicByDateStudentResponse>;
    SummaryQuestionByTopicStudent(request: SummaryQuestionByTopicStudentRequest): Promise<SummaryQuestionByTopicStudentResponse>;
    QuestionByComplexity(request: QuestionByComplexityRequest): Promise<QuestionByComplexityResponse>;
    GetProctoringAttempt(request: GetProctoringAttemptRequest): Promise<GetProctoringAttemptResponse>;
    SummaryOnePracticeSet(request: SummaryOnePracticeSetRequest): Promise<SummaryOnePracticeSetResponse>;
    SummaryAttemptedPractice(request: SummaryAttemptedPracticeRequest): Promise<SummaryAttemptedPracticeResponse>;
    CountStudentAttempted(request: CountStudentAttemptedRequest): Promise<CountStudentAttemptedResponse>;
    CountSummaryAttemptedPractice(request: CountSummaryAttemptedPracticeRequest): Promise<CountSummaryAttemptedPracticeResponse>;
    CountByUser(request: CountByUserRequest): Promise<CountByUserResponse>;
    UpdateTimeLimitExhaustedCount(request: UpdateTimeLimitExhaustedCountRequest): Promise<UpdateTimeLimitExhaustedCountResponse>;
    UpdateSuspicious(request: UpdateSuspiciousRequest): Promise<UpdateSuspiciousResponse>;
    Start(request: StartRequest): Promise<StartResponse>;
    FinishPsychoTest(request: FinishPsychoTestRequest): Promise<FinishPsychoTestResponse>;
    PartialSubmitAttempt(request: PartialSubmitAttemptRequest): Promise<PartialSubmitAttemptResponse>;
    SubmitToQueue(request: SubmitToQueueRequest): Promise<SubmitToQueueResponse>;
    ResetItemInQueue(request: ResetItemInQueueRequest): Promise<ResetItemInQueueResponse>;
    QuestionSubmit(request: QuestionSubmitRequest): Promise<QuestionSubmitResponse>;
    SaveCamCapture(request: SaveCamCaptureRequest): Promise<SaveCamCaptureResponse>;
    RecordQuestionReview(request: RecordQuestionReviewRequest): Promise<RecordQuestionReviewResponse>;
    UpdateAbandonStatus(request: UpdateAbandonStatusRequest): Promise<UpdateAbandonStatusResponse>;
    FindPsychoResultByTest(request: FindPsychoResultByTestRequest): Promise<FindPsychoResultByTestResponse>;
    GetPsychoResult(request: GetPsychoResultRequest): Promise<GetPsychoResultResponse>;
    FindOneAttempt(request: FindOneAttemptRequest): Promise<FindOneAttemptResponse>;
    GetClassroomByTest(request: GetClassroomByTestRequest): Promise<GetClassroomByTestResponse>;
    GetCareerScore(request: GetCareerScoreRequest): Promise<GetCareerScoreResponse>;
    GetAttempt(request: GetAttemptRequest): Promise<GetAttemptResponse>;
    Finish(request: FinishRequest): Promise<FinishResponse>;
    Create(request: CreateRequest): Promise<CreateResponse>;
    GetCareerAttempts(request: GetCareerAttemptsRequest): Promise<GetCareerAttemptsResponse>;
    GetCareerSum(request: GetCareerSumReq): Promise<Empty>;
    FindOne(request: FindOneRequest): Promise<FindOneResponse>;
    ClassroomSummarySpeed(request: ClassroomSummarySpeedRequest): Promise<ClassroomSummarySpeedResponse>;
    ClassroomSummarySpeedByDate(request: ClassroomSummarySpeedByDateRequest): Promise<ClassroomSummarySpeedByDateResponse>;
    Test(request: ClassroomListTopicStudentDoReq): Promise<any>;
    SummaryAllSubjectCorrectByDateMe(request: SummarySubjectCorrectByDateMeRequest): Promise<SummarySubjectCorrectByDateMeResponse>;
    CalculateSatTotalScore(request: CalculateSatTotalScoreReq): Promise<Empty>;
    GetAttemptByUser(request: GetAttemptByUserReq): Promise<Empty>;
    TopperSummary(request: TopperSummaryReq): Promise<Empty>;
    AccuracyBySubject(request: AccuracyBySubjectReq): Promise<Empty>;
    GetUserResponse(request: CalculateSatTotalScoreReq): Promise<Empty>;
    SaveScreenRecording(request: SaveScreenRecordingRequest): Promise<SaveScreenRecordingResponse>
    SaveQrUpload(request: SaveQrUploadRequest): Promise<SaveQrUploadResponse>
}

@Injectable()
export class AttemptGrpcServiceClientImpl {
    private attemptGrpcServiceClient: AttemptGrpcInterface;
    private readonly logger = new Logger(AttemptGrpcServiceClientImpl.name);

    constructor(@Inject('attemptGrpcService') private attemptGrpcClient: ClientGrpc) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.attemptGrpcServiceClient =
            this.attemptGrpcClient.getService<AttemptGrpcInterface>(
                protobufAttemptService,
            );
        this.logger.debug('gRPC client initialized.');
    }
    async FindAllByMe(request: FindAllByMeRequest): Promise<FindAllByMeResponse> {
        return await this.attemptGrpcServiceClient.FindAllByMe(request)
    }

    async GetFirstAttempt(request: GetFirstAttemptRequest): Promise<GetFirstAttemptResponse> {
        return await this.attemptGrpcServiceClient.GetFirstAttempt(request)
    }

    async FindQuestionFeedback(request: FindQuestionFeedbackRequest): Promise<FindQuestionFeedbackResponse> {
        return await this.attemptGrpcServiceClient.FindQuestionFeedback(request)
    }

    async FindOneAttemptByMe(request: FindOneAttemptByMeRequest): Promise<FindOneAttemptByMeResponse> {
        return await this.attemptGrpcServiceClient.FindOneAttemptByMe(request)
    }

    async IsAllowDoTest(request: IsAllowDoTestRequest): Promise<IsAllowDoTestResponse> {
        return await this.attemptGrpcServiceClient.IsAllowDoTest(request)
    }

    async FindAllByTeacher(request: FindAllByTeacherRequest): Promise<FindAllByTeacherResponse> {
        return await this.attemptGrpcServiceClient.FindAllByTeacher(request)
    }

    async GetCurrentDate({ }): Promise<GetCurrentDateResponse> {
        return await this.attemptGrpcServiceClient.GetCurrentDate({})
    }

    async CountAllByTeacher(request: CountAllByTeacherRequest): Promise<CountAllByTeacherResponse> {
        return await this.attemptGrpcServiceClient.CountAllByTeacher(request)
    }

    async CountMe(request: CountMeRequest): Promise<CountMeResponse> {
        return await this.attemptGrpcServiceClient.CountMe(request)
    }

    async CountAll(request: CountAllRequest): Promise<CountAllResponse> {
        return await this.attemptGrpcServiceClient.CountAll(request)
    }

    async FindAllByPractice(request: FindAllByPracticeRequest): Promise<FindAllByPracticeResponse> {
        return await this.attemptGrpcServiceClient.FindAllByPractice(request)
    }

    async GetResultPractice(request: GetResultPracticeRequest): Promise<GetResultPracticeResponse> {
        return await this.attemptGrpcServiceClient.GetResultPractice(request)
    }

    async GetLastByMe(request: GetLastByMeRequest): Promise<GetLastByMeResponse> {
        return await this.attemptGrpcServiceClient.GetLastByMe(request)
    }

    async GetLastByStudent(request: GetLastByStudentRequest): Promise<GetLastByStudentResponse> {
        return await this.attemptGrpcServiceClient.GetLastByStudent(request)
    }

    async GetListAvgSpeedByPractice(request: GetListAvgSpeedByPracticeRequest): Promise<GetListAvgSpeedByPracticeResponse> {
        return await this.attemptGrpcServiceClient.GetListAvgSpeedByPractice(request)
    }

    async GetListPercentCorrectByPractice(request: GetListPercentCorrectByPracticeRequest): Promise<GetListPercentCorrectByPracticeResponse> {
        return await this.attemptGrpcServiceClient.GetListPercentCorrectByPractice(request)
    }

    async GetPsychoClassroom(request: GetPsychoClassroomRequest): Promise<GetPsychoClassroomResponse> {
        return await this.attemptGrpcServiceClient.GetPsychoClassroom(request)
    }

    async GetAllProviders(request: GetAllProvidersRequest): Promise<GetAllProvidersResponse> {
        return await this.attemptGrpcServiceClient.GetAllProviders(request)
    }

    async FindOneByMe(request: FindOneByMeRequest): Promise<FindOneByMeResponse> {
        return await this.attemptGrpcServiceClient.FindOneByMe(request)
    }

    async Invitation(request: InvitationRequest): Promise<InvitationResponse> {
        return await this.attemptGrpcServiceClient.Invitation(request)
    }

    async FindAllNotCreatedBy(request: FindAllNotCreatedByRequest): Promise<FindAllNotCreatedByResponse> {
        return await this.attemptGrpcServiceClient.FindAllNotCreatedBy(request)
    }

    async GetListSubjectsMe(request: GetListSubjectsMeRequest): Promise<GetListSubjectsMeResponse> {
        return await this.attemptGrpcServiceClient.GetListSubjectsMe(request)
    }

    async GetTotalQuestionTopicMe(request: GetTotalQuestionTopicMeRequest): Promise<GetTotalQuestionTopicMeResponse> {
        return await this.attemptGrpcServiceClient.GetTotalQuestionTopicMe(request)
    }

    async GetTotalQuestionBySubjectMe(request: GetTotalQuestionBySubjectMeRequest): Promise<GetTotalQuestionBySubjectMeResponse> {
        return await this.attemptGrpcServiceClient.GetTotalQuestionBySubjectMe(request)
    }

    async GetListTopicsMe(request: GetListTopicsMeRequest): Promise<GetListTopicsMeResponse> {
        return await this.attemptGrpcServiceClient.GetListTopicsMe(request)
    }

    async SummaryTopicCorrectMe(request: SummaryTopicCorrectMeRequest): Promise<SummaryTopicCorrectMeResponse> {
        return await this.attemptGrpcServiceClient.SummaryTopicCorrectMe(request)
    }

    async SummaryTopicSpeedMe(request: SummaryTopicSpeedMeRequest): Promise<SummaryTopicSpeedMeResponse> {
        return await this.attemptGrpcServiceClient.SummaryTopicSpeedMe(request)
    }

    async SummarySubjectCorrectMe(request: SummarySubjectCorrectMeRequest): Promise<SummarySubjectCorrectMeResponse> {
        return await this.attemptGrpcServiceClient.SummarySubjectCorrectMe(request)
    }

    async SummarySubjectCorrectByDateMe(request: SummarySubjectCorrectByDateMeRequest): Promise<SummarySubjectCorrectByDateMeResponse> {
        return await this.attemptGrpcServiceClient.SummarySubjectCorrectByDateMe(request)
    }

    async SummaryCorrectByDateMe(request: SummaryCorrectByDateMeRequest): Promise<SummaryCorrectByDateMeResponse> {
        return await this.attemptGrpcServiceClient.SummaryCorrectByDateMe(request)
    }

    async SummarySubjectSpeedByDateMe(request: SummarySubjectSpeedByDateMeRequest): Promise<SummarySubjectSpeedByDateMeResponse> {
        return await this.attemptGrpcServiceClient.SummarySubjectSpeedByDateMe(request)
    }

    async SummaryAttemptedBySubjectMe(request: SummaryAttemptedBySubjectMeRequest): Promise<SummaryAttemptedBySubjectMeResponse> {
        return await this.attemptGrpcServiceClient.SummaryAttemptedBySubjectMe(request)
    }

    async SummarySubjectSpeedMe(request: SummarySubjectSpeedMeRequest): Promise<SummarySubjectSpeedByMeResponse> {
        return await this.attemptGrpcServiceClient.SummarySubjectSpeedMe(request)
    }

    async SummaryQuestionByTopicMe(request: SummaryQuestionByTopicMeRequest): Promise<SummaryQuestionByTopicMeResponse> {
        return await this.attemptGrpcServiceClient.SummaryQuestionByTopicMe(request)
    }

    async SummaryAbondonedMe(request: SummaryAbondonedMeRequest): Promise<SummaryAbondonedMeResponse> {
        return await this.attemptGrpcServiceClient.SummaryAbondonedMe(request)
    }

    async SummaryPracticeMe(request: SummaryPracticeMeRequest): Promise<SummaryPracticeMeResponse> {
        return await this.attemptGrpcServiceClient.SummaryPracticeMe(request)
    }

    async SummaryQuestionBySubjectMe(request: SummaryQuestionBySubjectMeRequest): Promise<SummaryQuestionBySubjectMeResponse> {
        return await this.attemptGrpcServiceClient.SummaryQuestionBySubjectMe(request)
    }

    async SummaryDoPractice(request: SummaryDoPracticeRequest): Promise<SummaryDoPracticeResponse> {
        return await this.attemptGrpcServiceClient.SummaryDoPractice(request)
    }

    async QuestionByConfidence(request: QuestionByConfidenceRequest): Promise<QuestionByConfidenceResponse> {
        return await this.attemptGrpcServiceClient.QuestionByConfidence(request)
    }

    async SummarySpeedTopicByDateMe(request: SummarySpeedTopicByDateMeRequest): Promise<SummarySpeedTopicByDateMeResponse> {
        return await this.attemptGrpcServiceClient.SummarySpeedTopicByDateMe(request)
    }

    async GetSpeedRank(request: GetSpeedRankRequest): Promise<GetSpeedRankResponse> {
        return await this.attemptGrpcServiceClient.GetSpeedRank(request)
    }

    async GetAccuracyRank(request: GetAccuracyRankRequest): Promise<GetAccuracyRankResponse> {
        return await this.attemptGrpcServiceClient.GetAccuracyRank(request)
    }

    async GetAccuracyPercentile(request: GetAccuracyPercentileRequest): Promise<GetAccuracyPercentileResponse> {
        return await this.attemptGrpcServiceClient.GetAccuracyPercentile(request)
    }

    async ClassroomListSubjectStudentDo(request: ClassroomListSubjectStudentDoRequest): Promise<ClassroomListSubjectStudentDoResponse> {
        return await this.attemptGrpcServiceClient.ClassroomListSubjectStudentDo(request)
    }

    async ClassroomListTopicStudentDo(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClient.ClassroomListTopicStudentDo(request)
    }

    async ClassroomSummaryQuestionBySubject(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClient.ClassroomSummaryQuestionBySubject(request)
    }

    async ClassroomSummaryAttempted(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClient.ClassroomSummaryAttempted(request)
    }

    async ClassroomSummaryAttemptedAllClassrooms(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClient.ClassroomSummaryAttemptedAllClassrooms(request)
    }

    async ClassroomSummaryQuestionByTopic(request: ClassroomListTopicStudentDoReq) {
        const response = await firstValueFrom(this.attemptGrpcServiceClient.ClassroomSummaryQuestionByTopic(request));
        return response.results;
    }

    async ClassroomSummaryCorrect(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClient.ClassroomSummaryCorrect(request)
    }

    async ClassroomSummaryCorrectByDate(request: ClassroomListTopicStudentDoReq): Promise<Empty> {
        return await this.attemptGrpcServiceClient.ClassroomSummaryCorrectByDate(request)
    }

    async GetListSubjectsStudent(request: GetListSubjectsStudentRequest): Promise<GetListSubjectsStudentResponse> {
        return await this.attemptGrpcServiceClient.GetListSubjectsStudent(request)
    }

    async GetTotalQuestionTopicStudent(request: GetTotalQuestionTopicStudentRequest): Promise<GetTotalQuestionTopicStudentResponse> {
        return await this.attemptGrpcServiceClient.GetTotalQuestionTopicStudent(request)
    }

    async GetTotalQuestionBySubjectStudent(request: GetTotalQuestionBySubjectStudentRequest): Promise<GetTotalQuestionBySubjectStudentResponse> {
        return await this.attemptGrpcServiceClient.GetTotalQuestionBySubjectStudent(request)
    }

    async GetListTopicsStudent(request: GetListTopicsStudentRequest): Promise<GetListTopicsStudentResponse> {
        return await this.attemptGrpcServiceClient.GetListTopicsStudent(request)
    }

    async SummaryTopicSpeedStudent(request: SummaryTopicSpeedStudentRequest): Promise<SummaryTopicSpeedStudentResponse> {
        return await this.attemptGrpcServiceClient.SummaryTopicSpeedStudent(request)
    }

    async SummaryTopicCorrectStudent(request: SummaryTopicCorrectStudentRequest): Promise<SummaryTopicCorrectStudentResponse> {
        return await this.attemptGrpcServiceClient.SummaryTopicCorrectStudent(request)
    }

    async SummarySubjectCorrectStudent(request: SummarySubjectCorrectStudentRequest): Promise<SummarySubjectCorrectStudentResponse> {
        return await this.attemptGrpcServiceClient.SummarySubjectCorrectStudent(request)
    }

    async SummarySubjectCorrectByDateStudent(request: SummarySubjectCorrectByDateStudentRequest): Promise<SummarySubjectCorrectByDateStudentResponse> {
        return await this.attemptGrpcServiceClient.SummarySubjectCorrectByDateStudent(request)
    }

    async SummarySubjectSpeedByDateStudent(request: SummarySubjectSpeedByDateStudentRequest): Promise<SummarySubjectSpeedByDateStudentResponse> {
        return await this.attemptGrpcServiceClient.SummarySubjectSpeedByDateStudent(request)
    }

    async SummaryCorrectByDateStudent(request: SummaryCorrectByDateStudentRequest): Promise<SummaryCorrectByDateStudentResponse> {
        return await this.attemptGrpcServiceClient.SummaryCorrectByDateStudent(request)
    }

    async SummaryAttemptedBySubjectStudent(request: SummaryAttemptedBySubjectStudentRequest): Promise<SummaryAttemptedBySubjectStudentResponse> {
        return await this.attemptGrpcServiceClient.SummaryAttemptedBySubjectStudent(request)
    }

    async SummarySubjectSpeedStudent(request: SummarySubjectSpeedStudentRequest): Promise<SummarySubjectSpeedStudentResponse> {
        return await this.attemptGrpcServiceClient.SummarySubjectSpeedStudent(request)
    }

    async SummaryAbondonedStudent(request: SummaryAbondonedStudentRequest): Promise<SummaryAbondonedStudentResponse> {
        return await this.attemptGrpcServiceClient.SummaryAbondonedStudent(request)
    }

    async SummaryPracticeStudent(request: SummaryPracticeStudentRequest): Promise<SummaryPracticeStudentResponse> {
        return await this.attemptGrpcServiceClient.SummaryPracticeStudent(request)
    }

    async SummaryAttemptedStudent(request: SummaryAttemptedStudentRequest): Promise<SummaryAttemptedStudentResponse> {
        return await this.attemptGrpcServiceClient.SummaryAttemptedStudent(request)
    }

    async SummaryQuestionBySubjectStudent(request: SummaryQuestionBySubjectStudentRequest): Promise<SummaryQuestionBySubjectStudentResponse> {
        return await this.attemptGrpcServiceClient.SummaryQuestionBySubjectStudent(request)
    }

    async SummarySpeedTopicByDateStudent(request: SummarySpeedTopicByDateStudentRequest): Promise<SummarySpeedTopicByDateStudentResponse> {
        return await this.attemptGrpcServiceClient.SummarySpeedTopicByDateStudent(request)
    }

    async SummaryQuestionByTopicStudent(request: SummaryQuestionByTopicStudentRequest): Promise<SummaryQuestionByTopicStudentResponse> {
        return await this.attemptGrpcServiceClient.SummaryQuestionByTopicStudent(request)
    }

    async QuestionByComplexity(request: QuestionByComplexityRequest): Promise<QuestionByComplexityResponse> {
        return await this.attemptGrpcServiceClient.QuestionByComplexity(request)
    }

    async GetProctoringAttempt(request: GetProctoringAttemptRequest): Promise<GetProctoringAttemptResponse> {
        return await this.attemptGrpcServiceClient.GetProctoringAttempt(request)
    }

    async SummaryOnePracticeSet(request: SummaryOnePracticeSetRequest): Promise<SummaryOnePracticeSetResponse> {
        return await this.attemptGrpcServiceClient.SummaryOnePracticeSet(request)
    }

    async SummaryAttemptedPractice(request: SummaryAttemptedPracticeRequest): Promise<SummaryAttemptedPracticeResponse> {
        return await this.attemptGrpcServiceClient.SummaryAttemptedPractice(request)
    }

    async CountStudentAttempted(request: CountStudentAttemptedRequest): Promise<CountStudentAttemptedResponse> {
        return await this.attemptGrpcServiceClient.CountStudentAttempted(request)
    }

    async CountSummaryAttemptedPractice(request: CountSummaryAttemptedPracticeRequest): Promise<CountSummaryAttemptedPracticeResponse> {
        return await this.attemptGrpcServiceClient.CountSummaryAttemptedPractice(request)
    }

    async CountByUser(request: CountByUserRequest): Promise<CountByUserResponse> {
        return await this.attemptGrpcServiceClient.CountByUser(request)
    }

    async UpdateTimeLimitExhaustedCount(request: UpdateTimeLimitExhaustedCountRequest): Promise<UpdateTimeLimitExhaustedCountResponse> {
        return await this.attemptGrpcServiceClient.UpdateTimeLimitExhaustedCount(request)
    }

    async UpdateSuspicious(request: UpdateSuspiciousRequest): Promise<UpdateSuspiciousResponse> {
        return await this.attemptGrpcServiceClient.UpdateSuspicious(request)
    }

    async Start(request: StartRequest): Promise<StartResponse> {
        return await this.attemptGrpcServiceClient.Start(request)
    }

    async FinishPsychoTest(request: FinishPsychoTestRequest): Promise<FinishPsychoTestResponse> {
        return await this.attemptGrpcServiceClient.FinishPsychoTest(request)
    }

    async PartialSubmitAttempt(request: PartialSubmitAttemptRequest): Promise<PartialSubmitAttemptResponse> {
        return await this.attemptGrpcServiceClient.PartialSubmitAttempt(request)
    }

    async SubmitToQueue(request: SubmitToQueueRequest): Promise<SubmitToQueueResponse> {
        return await this.attemptGrpcServiceClient.SubmitToQueue(request)
    }

    async ResetItemInQueue(request: ResetItemInQueueRequest): Promise<ResetItemInQueueResponse> {
        return await this.attemptGrpcServiceClient.ResetItemInQueue(request)
    }

    async QuestionSubmit(request: QuestionSubmitRequest): Promise<QuestionSubmitResponse> {
        return await this.attemptGrpcServiceClient.QuestionSubmit(request)
    }

    async SaveCamCapture(request: SaveCamCaptureRequest): Promise<SaveCamCaptureResponse> {
        return await this.attemptGrpcServiceClient.SaveCamCapture(request)
    }

    async RecordQuestionReview(request: RecordQuestionReviewRequest): Promise<RecordQuestionReviewResponse> {
        return await this.attemptGrpcServiceClient.RecordQuestionReview(request)
    }

    async UpdateAbandonStatus(request: UpdateAbandonStatusRequest): Promise<UpdateAbandonStatusResponse> {
        return await this.attemptGrpcServiceClient.UpdateAbandonStatus(request)
    }

    async FindPsychoResultByTest(request: FindPsychoResultByTestRequest): Promise<FindPsychoResultByTestResponse> {
        return await this.attemptGrpcServiceClient.FindPsychoResultByTest(request)
    }

    async GetPsychoResult(request: GetPsychoResultRequest): Promise<GetPsychoResultResponse> {
        return await this.attemptGrpcServiceClient.GetPsychoResult(request)
    }

    async FindOneAttempt(request: FindOneAttemptRequest): Promise<FindOneAttemptResponse> {
        return await this.attemptGrpcServiceClient.FindOneAttempt(request)
    }

    async GetClassroomByTest(request: GetClassroomByTestRequest): Promise<GetClassroomByTestResponse> {
        return await this.attemptGrpcServiceClient.GetClassroomByTest(request)
    }

    async GetCareerScore(request: GetCareerScoreRequest): Promise<GetCareerScoreResponse> {
        return await this.attemptGrpcServiceClient.GetCareerScore(request)
    }

    async GetAttempt(request: GetAttemptRequest): Promise<GetAttemptResponse> {
        return await this.attemptGrpcServiceClient.GetAttempt(request)
    }

    async Finish(request: FinishRequest): Promise<FinishResponse> {
        return await this.attemptGrpcServiceClient.Finish(request)
    }

    async Create(request: CreateRequest): Promise<CreateResponse> {
        return await this.attemptGrpcServiceClient.Create(request)
    }

    async GetCareerAttempts(request: GetCareerAttemptsRequest): Promise<GetCareerAttemptsResponse> {
        return await this.attemptGrpcServiceClient.GetCareerAttempts(request)
    }

    async GetCareerSum(request: GetCareerSumReq): Promise<Empty> {
        return await this.attemptGrpcServiceClient.GetCareerSum(request)
    }

    async FindOne(request: FindOneRequest): Promise<FindOneResponse> {
        return await this.attemptGrpcServiceClient.FindOne(request)
    }

    async ClassroomSummarySpeed(request: ClassroomSummarySpeedRequest): Promise<ClassroomSummarySpeedResponse> {
        return await this.attemptGrpcServiceClient.ClassroomSummarySpeed(request)
    }

    async ClassroomSummarySpeedByDate(request: ClassroomSummarySpeedByDateRequest): Promise<ClassroomSummarySpeedByDateResponse> {
        return await this.attemptGrpcServiceClient.ClassroomSummarySpeedByDate(request)
    }

    async Test(request: ClassroomListTopicStudentDoReq): Promise<any> {
        return await this.attemptGrpcServiceClient.Test(request)
    }

    async SummaryAllSubjectCorrectByDateMe(request: SummarySubjectCorrectByDateMeRequest): Promise<SummarySubjectCorrectByDateMeResponse> {
        return await this.attemptGrpcServiceClient.SummaryAllSubjectCorrectByDateMe(request)
    }

    async CalculateSatTotalScore(request: CalculateSatTotalScoreReq): Promise<Empty> {
        return await this.attemptGrpcServiceClient.CalculateSatTotalScore(request)
    }

    async GetAttemptByUser(request: GetAttemptByUserReq): Promise<Empty> {
        return await this.attemptGrpcServiceClient.GetAttemptByUser(request)
    }

    async TopperSummary(request: TopperSummaryReq): Promise<Empty> {
        return await this.attemptGrpcServiceClient.TopperSummary(request)
    }

    async AccuracyBySubject(request: AccuracyBySubjectReq): Promise<Empty> {
        return await this.attemptGrpcServiceClient.AccuracyBySubject(request)
    }

    async GetUserResponse(request: CalculateSatTotalScoreReq): Promise<Empty> {
        return await this.attemptGrpcServiceClient.GetUserResponse(request)
    }

    async SaveScreenRecording(request: SaveScreenRecordingRequest): Promise<SaveScreenRecordingResponse> {
        return await this.attemptGrpcServiceClient.SaveScreenRecording(request)
    }

    async SaveQrUpload(request: SaveQrUploadRequest): Promise<SaveQrUploadResponse> {
        return await this.attemptGrpcServiceClient.SaveQrUpload(request)
    }
}
