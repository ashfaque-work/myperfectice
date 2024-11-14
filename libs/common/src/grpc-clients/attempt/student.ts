import {
    AddMentorReq, AverageAttemptRequest, AveragetAttemptResponse, CountAttemptsRequest, CountAttemptsResponse,
    CountStudentAttemptsRequest, CountStudentAttemptsResponse, Empty, ExportProfileReq, FindAllRequest, FindAllResponse,

    GetAccuracyAndSpeedByTopicResponse, GetAccuracyAndSpeedRequest, GetAccuracyAndSpeedResponse, GetAttemptRequest,
    GetAttemptResponse, GetAttemptsRequest, GetAttemptsResponse, GetAverageTimeOnPlatformRequest, GetAverageTimeOnPlatformResponse,
    GetAwsFaceRegSignedUrlRequest, GetAwsFaceRegSignedUrlResponse, GetBestAttemptRequest, GetBestAttemptResponse, GetClassroomsReq,
    GetEffortTrendAttemptCountRequest, GetEffortTrendAttemptCountResponse, GetEffortTrendAttemptTotalTimeRequest,
    GetEffortTrendAttemptTotalTimeResponse, GetEffortTrendCourseTimeSpentRequest, GetEffortTrendCourseTimeSpentResponse,
    GetGroupParticipationRequest, GetGroupParticipationResponse, GetLastStudentAttemptRequest, GetLastStudentAttemptResponse,
    GetLearningEffortsDistributionRequest, GetLearningEffortsDistributionResponse, GetMarkRankingReq, GetMentorsReq,
    GetPersistanceDataRequest, GetPersistanceDataResponse, GetRecommendedTestsRequest, GetRecommendedTestsResponse,
    GetRecommendedVideosReq, GetRecommendedVideosRes, GetResultPracticeRequest, GetResultPracticeResponse,
    GetStudentAttemptRequest, GetStudentAttemptResponse, GetAccuracyAndSpeedByTopicRequest,
    GetStudentAttemptsRequest, GetStudentAttemptsResponse, GetSubjectQuestionComplexityRequest, GetSubjectQuestionComplexityResponse,
    GetSubjectwiseRankingReq, GetSubjectWiseSpeedAndAccuracyRequest, GetSubjectWiseSpeedAndAccuracyResponse, GetSummaryByNumberRequest,
    GetSummaryByNumberResponse, GetTakeTestsAgainRequest, GetTakeTestsAgainResponse, GetTextualAnalysisRequest,
    GetTextualAnalysisResponse, GetTopperSummaryByNumberRequest, GetTopperSummaryByNumberResponse, GetTotalQuestionSolvedRequest,
    GetTotalQuestionSolvedResponse, GetUniqueQuestionsCountRequest, GetUniqueQuestionsCountResponse,
    GetUserAssetsSignedUrlRequest, GetUserAssetsSignedUrlResponse, QuestionCategoryDistributionRequest,
    QuestionCategoryDistributionResponse, RemoveMentorReq, SendInvitationReq, SummaryAttemptedPracticeRequest,
    SummaryAttemptedPracticeResponse, SummaryAttemptedTestSeriesReq, SummaryAttemptedTestSeriesRes, SummaryOnePracticeSetRequest,
    SummaryOnePracticeSetResponse, SummaryPsychoPracticeRequest, SummaryPsychoPracticeResponse,
    GetRecordingsSignedUrlRequest, GetQrUploadSignedUrlRequest, GetQrUploadSignedUrlResponse, GetRecordingsSignedUrlResponse
} from "@app/common/dto/student.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufStudentService = 'AttemptGrpcService'

export interface StudentGrpcInterface {
    GetRecommendedTests(request: GetRecommendedTestsRequest): Promise<GetRecommendedTestsResponse>;
    GetTakeTestsAgain(request: GetTakeTestsAgainRequest): Promise<GetTakeTestsAgainResponse>
    GetRecommendedVideos(request: GetRecommendedVideosReq): Promise<GetRecommendedVideosRes>
    GetAttemptSummary(request: GetTextualAnalysisRequest): Promise<GetTextualAnalysisResponse>
    GetTextualAnalysis(request: GetTextualAnalysisRequest): Promise<GetTextualAnalysisResponse>
    GetSummaryByNumber(request: GetSummaryByNumberRequest): Promise<GetSummaryByNumberResponse>
    GetTopperSummaryByNumber(request: GetTopperSummaryByNumberRequest): Promise<GetTopperSummaryByNumberResponse>
    GetAverageTimeOnPlatform(request: GetAverageTimeOnPlatformRequest): Promise<GetAverageTimeOnPlatformResponse>
    GetEffortTrendAttemptCount(request: GetEffortTrendAttemptCountRequest): Promise<GetEffortTrendAttemptCountResponse>;
    GetLearningEffortDistribution(request: GetLearningEffortsDistributionRequest): Promise<GetLearningEffortsDistributionResponse>;
    GetSubjectQuestionComplexity(request: GetSubjectQuestionComplexityRequest): Promise<GetSubjectQuestionComplexityResponse>;
    QuestionCategoryDistribution(request: QuestionCategoryDistributionRequest): Promise<QuestionCategoryDistributionResponse>;
    GetGroupParticipation(request: GetGroupParticipationRequest): Promise<GetGroupParticipationResponse>;
    GetPersistanceData(request: GetPersistanceDataRequest): Promise<GetPersistanceDataResponse>;
    GetEffortTrendAttemptTotalTime(request: GetEffortTrendAttemptTotalTimeRequest): Promise<GetEffortTrendAttemptTotalTimeResponse>;
    GetEffortTrendCourseTimeSpent(request: GetEffortTrendCourseTimeSpentRequest): Promise<GetEffortTrendCourseTimeSpentResponse>;
    GetUniqueQuestionsCount(request: GetUniqueQuestionsCountRequest): Promise<GetUniqueQuestionsCountResponse>;
    GetAccuracyAndSpeed(request: GetAccuracyAndSpeedRequest): Promise<GetAccuracyAndSpeedResponse>;
    GetAccuracyAndSpeedByTopic(request: GetAccuracyAndSpeedByTopicRequest): Promise<GetAccuracyAndSpeedByTopicResponse>;
    SummaryAttemptedPracticeStudent(request: SummaryAttemptedPracticeRequest): Promise<SummaryAttemptedPracticeResponse>;
    SummaryAttemptedTestSeries(request: SummaryAttemptedTestSeriesReq): Promise<SummaryAttemptedTestSeriesRes>;
    SummaryPsychoPractice(request: SummaryPsychoPracticeRequest): Promise<SummaryPsychoPracticeResponse>;
    SummaryOnePracticeSet(request: SummaryOnePracticeSetRequest): Promise<SummaryOnePracticeSetResponse>;
    GetResultPractice(request: GetResultPracticeRequest): Promise<GetResultPracticeResponse>;
    GetAvailableTests(request: FindAllRequest): Promise<FindAllResponse>;
    GetAttempts(request: GetAttemptsRequest): Promise<GetAttemptsResponse>;
    CountAttempts(request: CountAttemptsRequest): Promise<CountAttemptsResponse>;
    GetAttempt(request: GetAttemptRequest): Promise<GetAttemptResponse>;
    GetAwsFaceRegSignedUrl(request: GetAwsFaceRegSignedUrlRequest): Promise<GetAwsFaceRegSignedUrlResponse>;
    GetUserAssetsSignedUrl(request: GetUserAssetsSignedUrlRequest): Promise<GetUserAssetsSignedUrlResponse>;
    GetBestAttempt(request: GetBestAttemptRequest): Promise<GetBestAttemptResponse>;
    GetAverageAttempt(request: AverageAttemptRequest): Promise<AveragetAttemptResponse>;
    GetSubjectWiseSpeedAndAccuracy(request: GetSubjectWiseSpeedAndAccuracyRequest): Promise<GetSubjectWiseSpeedAndAccuracyResponse>;
    GetTotalQuestionSolved(request: GetTotalQuestionSolvedRequest): Promise<GetTotalQuestionSolvedResponse>;
    GetStudentAttempts(request: GetStudentAttemptsRequest): Promise<GetStudentAttemptsResponse>;
    CountStudentAttempts(request: CountStudentAttemptsRequest): Promise<CountStudentAttemptsResponse>;
    GetLastAttempt(request: GetMentorsReq): Promise<GetLastStudentAttemptResponse>;
    GetLastStudentAttempt(request: GetLastStudentAttemptRequest): Promise<GetLastStudentAttemptResponse>;
    GetStudentAttempt(request: GetStudentAttemptRequest): Promise<GetStudentAttemptResponse>;
    GetClassrooms(request: GetClassroomsReq): Promise<Empty>;
    GetMentors(request: GetMentorsReq): Promise<Empty>;
    FindOneMentor(request: GetMentorsReq): Promise<Empty>;
    SendInvitation(request: SendInvitationReq): Promise<Empty>;
    ExportProfile(request: ExportProfileReq): Promise<Empty>;
    GetSatScore(request: ExportProfileReq): Promise<Empty>;
    GetSubjectwiseRanking(request: GetSubjectwiseRankingReq): Promise<Empty>;
    GetMarkRanking(request: GetMarkRankingReq): Promise<Empty>;
    AddMentor(request: AddMentorReq): Promise<Empty>;
    RemoveMentor(request: RemoveMentorReq): Promise<Empty>;
    GetRecordingsSignedUrl(request: GetRecordingsSignedUrlRequest): Promise<GetRecordingsSignedUrlResponse>;
    GetQrUploadSignedUrl(request: GetQrUploadSignedUrlRequest): Promise<GetQrUploadSignedUrlResponse>;
}

@Injectable()
export class StudentGrpcServiceClientImpl implements StudentGrpcInterface {
    private studentGrpcServiceClient: StudentGrpcInterface;
    private readonly logger = new Logger(StudentGrpcServiceClientImpl.name);

    constructor(
        @Inject('attemptGrpcService') private studentGrpcClient: ClientGrpc
    ) { }
    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.studentGrpcServiceClient =
            this.studentGrpcClient.getService<StudentGrpcInterface>(
                protobufStudentService,
            );
        this.logger.debug('gRPC client initialized.');
    }

    async GetRecommendedTests(request: GetRecommendedTestsRequest): Promise<GetRecommendedTestsResponse> {
        return await this.studentGrpcServiceClient.GetRecommendedTests(request)
    }

    async GetTakeTestsAgain(request: GetTakeTestsAgainRequest): Promise<GetTakeTestsAgainResponse> {
        return await this.studentGrpcServiceClient.GetTakeTestsAgain(request)
    }

    async GetRecommendedVideos(request: GetRecommendedVideosReq): Promise<GetRecommendedVideosRes> {
        return await this.studentGrpcServiceClient.GetRecommendedVideos(request)
    }

    async GetAttemptSummary(request: GetTextualAnalysisRequest): Promise<GetTextualAnalysisResponse> {
        return await this.studentGrpcServiceClient.GetAttemptSummary(request)
    }

    async GetTextualAnalysis(request: GetTextualAnalysisRequest): Promise<GetTextualAnalysisResponse> {
        return await this.studentGrpcServiceClient.GetTextualAnalysis(request)
    }

    async GetSummaryByNumber(request: GetSummaryByNumberRequest): Promise<GetSummaryByNumberResponse> {
        return await this.studentGrpcServiceClient.GetSummaryByNumber(request)
    }

    async GetTopperSummaryByNumber(request: GetTopperSummaryByNumberRequest): Promise<GetTopperSummaryByNumberResponse> {
        return await this.studentGrpcServiceClient.GetTopperSummaryByNumber(request)
    }

    async GetAverageTimeOnPlatform(request: GetAverageTimeOnPlatformRequest): Promise<GetAverageTimeOnPlatformResponse> {
        return await this.studentGrpcServiceClient.GetAverageTimeOnPlatform(request)
    }

    async GetEffortTrendAttemptCount(request: GetEffortTrendAttemptCountRequest): Promise<GetEffortTrendAttemptCountResponse> {
        return await this.studentGrpcServiceClient.GetEffortTrendAttemptCount(request)
    }

    async GetLearningEffortDistribution(request: GetLearningEffortsDistributionRequest): Promise<GetLearningEffortsDistributionResponse> {
        return await this.studentGrpcServiceClient.GetLearningEffortDistribution(request)
    }

    async GetSubjectQuestionComplexity(request: GetSubjectQuestionComplexityRequest): Promise<GetSubjectQuestionComplexityResponse> {
        return await this.studentGrpcServiceClient.GetSubjectQuestionComplexity(request)
    }

    async QuestionCategoryDistribution(request: QuestionCategoryDistributionRequest): Promise<QuestionCategoryDistributionResponse> {
        return await this.studentGrpcServiceClient.QuestionCategoryDistribution(request)
    }

    async GetGroupParticipation(request: GetGroupParticipationRequest): Promise<GetGroupParticipationResponse> {
        return await this.studentGrpcServiceClient.GetGroupParticipation(request)
    }

    async GetPersistanceData(request: GetPersistanceDataRequest): Promise<GetPersistanceDataResponse> {
        return await this.studentGrpcServiceClient.GetPersistanceData(request)
    }

    async GetEffortTrendAttemptTotalTime(request: GetEffortTrendAttemptTotalTimeRequest): Promise<GetEffortTrendAttemptTotalTimeResponse> {
        return await this.studentGrpcServiceClient.GetEffortTrendAttemptTotalTime(request)
    }

    async GetEffortTrendCourseTimeSpent(request: GetEffortTrendCourseTimeSpentRequest): Promise<GetEffortTrendCourseTimeSpentResponse> {
        return await this.studentGrpcServiceClient.GetEffortTrendCourseTimeSpent(request)
    }

    async GetUniqueQuestionsCount(request: GetUniqueQuestionsCountRequest): Promise<GetUniqueQuestionsCountResponse> {
        return await this.studentGrpcServiceClient.GetUniqueQuestionsCount(request)
    }

    async GetAccuracyAndSpeed(request: GetAccuracyAndSpeedRequest): Promise<GetAccuracyAndSpeedResponse> {
        return await this.studentGrpcServiceClient.GetAccuracyAndSpeed(request)
    }

    async GetAccuracyAndSpeedByTopic(request: GetAccuracyAndSpeedByTopicRequest): Promise<GetAccuracyAndSpeedByTopicResponse> {
        return await this.studentGrpcServiceClient.GetAccuracyAndSpeedByTopic(request)
    }

    async SummaryAttemptedPracticeStudent(request: SummaryAttemptedPracticeRequest): Promise<SummaryAttemptedPracticeResponse> {
        return await this.studentGrpcServiceClient.SummaryAttemptedPracticeStudent(request)
    }

    async SummaryAttemptedTestSeries(request: SummaryAttemptedTestSeriesReq): Promise<SummaryAttemptedTestSeriesRes> {
        return await this.studentGrpcServiceClient.SummaryAttemptedTestSeries(request)
    }

    async SummaryPsychoPractice(request: SummaryPsychoPracticeRequest): Promise<SummaryPsychoPracticeResponse> {
        return await this.studentGrpcServiceClient.SummaryPsychoPractice(request)
    }

    async SummaryOnePracticeSet(request: SummaryOnePracticeSetRequest): Promise<SummaryOnePracticeSetResponse> {
        return await this.studentGrpcServiceClient.SummaryOnePracticeSet(request)
    }

    async GetResultPractice(request: GetResultPracticeRequest): Promise<GetResultPracticeResponse> {
        return await this.studentGrpcServiceClient.GetResultPractice(request)
    }

    async GetAvailableTests(request: FindAllRequest): Promise<FindAllResponse> {
        return await this.studentGrpcServiceClient.GetAvailableTests(request)
    }

    async GetAttempts(request: GetAttemptsRequest): Promise<GetAttemptsResponse> {
        return await this.studentGrpcServiceClient.GetAttempts(request)
    }

    async CountAttempts(request: CountAttemptsRequest): Promise<CountAttemptsResponse> {
        return await this.studentGrpcServiceClient.CountAttempts(request)
    }

    async GetAttempt(request: GetAttemptRequest): Promise<GetAttemptResponse> {
        return await this.studentGrpcServiceClient.GetAttempt(request)
    }

    async GetAwsFaceRegSignedUrl(request: GetAwsFaceRegSignedUrlRequest): Promise<GetAwsFaceRegSignedUrlResponse> {
        return await this.studentGrpcServiceClient.GetAwsFaceRegSignedUrl(request)
    }

    async GetUserAssetsSignedUrl(request: GetUserAssetsSignedUrlRequest): Promise<GetUserAssetsSignedUrlResponse> {
        return await this.studentGrpcServiceClient.GetUserAssetsSignedUrl(request)
    }

    async GetBestAttempt(request: GetBestAttemptRequest): Promise<GetBestAttemptResponse> {
        return await this.studentGrpcServiceClient.GetBestAttempt(request)
    }

    async GetAverageAttempt(request: AverageAttemptRequest): Promise<AveragetAttemptResponse> {
        return await this.studentGrpcServiceClient.GetAverageAttempt(request)
    }

    async GetSubjectWiseSpeedAndAccuracy(request: GetSubjectWiseSpeedAndAccuracyRequest): Promise<GetSubjectWiseSpeedAndAccuracyResponse> {
        return await this.studentGrpcServiceClient.GetSubjectWiseSpeedAndAccuracy(request)
    }

    async GetTotalQuestionSolved(request: GetTotalQuestionSolvedRequest): Promise<GetTotalQuestionSolvedResponse> {
        return await this.studentGrpcServiceClient.GetTotalQuestionSolved(request)
    }

    async GetStudentAttempts(request: GetStudentAttemptsRequest): Promise<GetStudentAttemptsResponse> {
        return await this.studentGrpcServiceClient.GetStudentAttempts(request)
    }

    async CountStudentAttempts(request: CountStudentAttemptsRequest): Promise<CountStudentAttemptsResponse> {
        return await this.studentGrpcServiceClient.CountStudentAttempts(request)
    }

    async GetLastAttempt(request: GetMentorsReq): Promise<GetLastStudentAttemptResponse> {
        return await this.studentGrpcServiceClient.GetLastAttempt(request)
    }

    async GetLastStudentAttempt(request: GetLastStudentAttemptRequest): Promise<GetLastStudentAttemptResponse> {
        return await this.studentGrpcServiceClient.GetLastStudentAttempt(request)
    }

    async GetStudentAttempt(request: GetStudentAttemptRequest): Promise<GetStudentAttemptResponse> {
        return await this.studentGrpcServiceClient.GetStudentAttempt(request)
    }

    async GetClassrooms(request: GetClassroomsReq): Promise<Empty> {
        return await this.studentGrpcServiceClient.GetClassrooms(request)
    }

    async GetMentors(request: GetMentorsReq): Promise<Empty> {
        return await this.studentGrpcServiceClient.GetMentors(request)
    }

    async FindOneMentor(request: GetMentorsReq): Promise<Empty> {
        return await this.studentGrpcServiceClient.FindOneMentor(request)
    }

    async SendInvitation(request: SendInvitationReq): Promise<Empty> {
        return await this.studentGrpcServiceClient.SendInvitation(request)
    }

    async ExportProfile(request: ExportProfileReq): Promise<Empty> {
        return await this.studentGrpcServiceClient.ExportProfile(request)
    }

    async GetSatScore(request: ExportProfileReq): Promise<Empty> {
        return await this.studentGrpcServiceClient.GetSatScore(request)
    }

    async GetSubjectwiseRanking(request: GetSubjectwiseRankingReq): Promise<Empty> {
        return await this.studentGrpcServiceClient.GetSubjectwiseRanking(request)
    }

    async GetMarkRanking(request: GetMarkRankingReq): Promise<Empty> {
        return await this.studentGrpcServiceClient.GetMarkRanking(request)
    }

    async AddMentor(request: AddMentorReq): Promise<Empty> {
        return await this.studentGrpcServiceClient.AddMentor(request)
    }

    async RemoveMentor(request: RemoveMentorReq): Promise<Empty> {
        return await this.studentGrpcServiceClient.RemoveMentor(request)
    }

    async GetRecordingsSignedUrl(request: GetRecordingsSignedUrlRequest): Promise<GetRecordingsSignedUrlResponse> {
        return await this.studentGrpcServiceClient.GetRecordingsSignedUrl(request)
    }

    async GetQrUploadSignedUrl(request: GetQrUploadSignedUrlRequest): Promise<GetQrUploadSignedUrlResponse> {
        return await this.studentGrpcServiceClient.GetQrUploadSignedUrl(request)
    }
}