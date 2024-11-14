import { SaveScreenRecordingRequest, SaveScreenRecordingResponse } from "@app/common/dto/attempt.dto";
import {
    AddMentorReq, AverageAttemptRequest, AveragetAttemptResponse, CountAttemptsRequest, CountAttemptsResponse,
    CountStudentAttemptsRequest, CountStudentAttemptsResponse, Empty, ExportProfileReq, FindAllRequest, FindAllResponse,
    GetAccuracyAndSpeedByTopicResponse, GetAccuracyAndSpeedRequest, GetAccuracyAndSpeedResponse, GetAttemptRequest,
    GetAttemptsRequest, GetAttemptsResponse, GetAverageTimeOnPlatformRequest, GetAverageTimeOnPlatformResponse,
    GetAwsFaceRegSignedUrlRequest, GetAwsFaceRegSignedUrlResponse, GetBestAttemptRequest, GetBestAttemptResponse,
    GetClassroomsReq, GetEffortTrendAttemptCountRequest, GetEffortTrendAttemptCountResponse, GetEffortTrendAttemptTotalTimeRequest,
    GetEffortTrendAttemptTotalTimeResponse, GetEffortTrendCourseTimeSpentRequest, GetEffortTrendCourseTimeSpentResponse,
    GetGroupParticipationRequest, GetGroupParticipationResponse, GetLastStudentAttemptRequest, GetLastStudentAttemptResponse,
    GetLearningEffortsDistributionRequest, GetLearningEffortsDistributionResponse, GetMarkRankingReq, GetMentorsReq,
    GetPersistanceDataRequest, GetPersistanceDataResponse, GetRecommendedTestsRequest, GetRecommendedTestsResponse,
    GetRecommendedVideosReq, GetRecommendedVideosRes, GetResultPracticeRequest, GetResultPracticeResponse,
    GetStudentAttemptRequest, GetStudentAttemptResponse, SummaryPsychoPracticeRequest, SummaryPsychoPracticeResponse,
    GetStudentAttemptsRequest, GetStudentAttemptsResponse, GetSubjectQuestionComplexityRequest, GetSubjectQuestionComplexityResponse,
    GetSubjectwiseRankingReq, GetSubjectWiseSpeedAndAccuracyRequest, GetSubjectWiseSpeedAndAccuracyResponse,
    GetSummaryByNumberRequest, GetSummaryByNumberResponse, GetTakeTestsAgainRequest, GetTakeTestsAgainResponse,
    GetTextualAnalysisRequest, GetTextualAnalysisResponse, GetTopperSummaryByNumberRequest, GetTopperSummaryByNumberResponse,
    GetTotalQuestionSolvedRequest, GetTotalQuestionSolvedResponse, GetUniqueQuestionsCountRequest,
    GetUniqueQuestionsCountResponse, GetUserAssetsSignedUrlRequest, GetUserAssetsSignedUrlResponse,
    QuestionCategoryDistributionRequest, QuestionCategoryDistributionResponse, RemoveMentorReq, SendInvitationReq,
    SummaryAttemptedPracticeRequest, SummaryAttemptedPracticeResponse, SummaryAttemptedTestSeriesReq, SummaryAttemptedTestSeriesRes,
    SummaryOnePracticeSetRequest, SummaryOnePracticeSetResponse, GetAccuracyAndSpeedByTopicRequest,
    GetRecordingsSignedUrlRequest,
    GetRecordingsSignedUrlResponse,
    GetQrUploadSignedUrlRequest,
    GetQrUploadSignedUrlResponse,

} from "@app/common/dto/student.dto";
import { StudentGrpcServiceClientImpl } from "@app/common/grpc-clients/attempt";
import { Injectable } from "@nestjs/common";

@Injectable()
export class StudentService {
    constructor(private studentGrpcServiceClientImpl: StudentGrpcServiceClientImpl) { }

    async getRecommendedTests(request: GetRecommendedTestsRequest): Promise<GetRecommendedTestsResponse> {
        return await this.studentGrpcServiceClientImpl.GetRecommendedTests(request)
    }

    async getTakeTestsAgain(request: GetTakeTestsAgainRequest): Promise<GetTakeTestsAgainResponse> {
        return await this.studentGrpcServiceClientImpl.GetTakeTestsAgain(request)
    }

    async getRecommendedVideos(request: GetRecommendedVideosReq): Promise<GetRecommendedVideosRes> {
        return await this.studentGrpcServiceClientImpl.GetRecommendedVideos(request)
    }

    async getAttemptSummary(request: GetTextualAnalysisRequest): Promise<GetTextualAnalysisResponse> {
        return await this.studentGrpcServiceClientImpl.GetAttemptSummary(request)
    }

    async getTextualAnalysis(request: GetTextualAnalysisRequest): Promise<GetTextualAnalysisResponse> {
        return await this.studentGrpcServiceClientImpl.GetTextualAnalysis(request)
    }

    async getSummaryByNumber(request: GetSummaryByNumberRequest): Promise<GetSummaryByNumberResponse> {
        return await this.studentGrpcServiceClientImpl.GetSummaryByNumber(request)
    }

    async getTopperSummaryByNumber(request: GetTopperSummaryByNumberRequest): Promise<GetTopperSummaryByNumberResponse> {
        return await this.studentGrpcServiceClientImpl.GetTopperSummaryByNumber(request)
    }

    async getAverageTimeOnPlatform(request: GetAverageTimeOnPlatformRequest): Promise<GetAverageTimeOnPlatformResponse> {
        return await this.studentGrpcServiceClientImpl.GetAverageTimeOnPlatform(request)
    }

    async getEffortTrendAttemptCount(request: GetEffortTrendAttemptCountRequest): Promise<GetEffortTrendAttemptCountResponse> {
        return await this.studentGrpcServiceClientImpl.GetEffortTrendAttemptCount(request)
    }

    async getLearningEffortDistribution(request: GetLearningEffortsDistributionRequest): Promise<GetLearningEffortsDistributionResponse> {
        return await this.studentGrpcServiceClientImpl.GetLearningEffortDistribution(request)
    }

    async getSubjectQuestionComplexity(request: GetSubjectQuestionComplexityRequest): Promise<GetSubjectQuestionComplexityResponse> {
        return await this.studentGrpcServiceClientImpl.GetSubjectQuestionComplexity(request)
    }

    async questionCategoryDistribution(request: QuestionCategoryDistributionRequest): Promise<QuestionCategoryDistributionResponse> {
        return await this.studentGrpcServiceClientImpl.QuestionCategoryDistribution(request)
    }

    async getGroupParticipation(request: GetGroupParticipationRequest): Promise<GetGroupParticipationResponse> {
        return await this.studentGrpcServiceClientImpl.GetGroupParticipation(request)
    }

    async getPersistanceData(request: GetPersistanceDataRequest): Promise<GetPersistanceDataResponse> {
        return await this.studentGrpcServiceClientImpl.GetPersistanceData(request)
    }

    async getEffortTrendAttemptTotalTime(request: GetEffortTrendAttemptTotalTimeRequest): Promise<GetEffortTrendAttemptTotalTimeResponse> {
        return await this.studentGrpcServiceClientImpl.GetEffortTrendAttemptTotalTime(request)
    }

    async getEffortTrendCourseTimeSpent(request: GetEffortTrendCourseTimeSpentRequest): Promise<GetEffortTrendCourseTimeSpentResponse> {
        return await this.studentGrpcServiceClientImpl.GetEffortTrendCourseTimeSpent(request)
    }

    async getUniqueQuestionsCount(request: GetUniqueQuestionsCountRequest): Promise<GetUniqueQuestionsCountResponse> {
        return await this.studentGrpcServiceClientImpl.GetUniqueQuestionsCount(request)
    }

    async getAccuracyAndSpeed(request: GetAccuracyAndSpeedRequest): Promise<GetAccuracyAndSpeedResponse> {
        return await this.studentGrpcServiceClientImpl.GetAccuracyAndSpeed(request)
    }

    async getAccuracyAndSpeedByTopic(request: GetAccuracyAndSpeedByTopicRequest): Promise<GetAccuracyAndSpeedByTopicResponse> {
        return await this.studentGrpcServiceClientImpl.GetAccuracyAndSpeedByTopic(request)
    }

    async summaryAttemptedPractice(request: SummaryAttemptedPracticeRequest): Promise<SummaryAttemptedPracticeResponse> {
        return await this.studentGrpcServiceClientImpl.SummaryAttemptedPracticeStudent(request)
    }

    async summaryAttemptedTestSeries(request: SummaryAttemptedTestSeriesReq): Promise<SummaryAttemptedTestSeriesRes> {
        return await this.studentGrpcServiceClientImpl.SummaryAttemptedTestSeries(request)
    }

    async summaryPsychoPractice(request: SummaryPsychoPracticeRequest): Promise<SummaryPsychoPracticeResponse> {
        return await this.studentGrpcServiceClientImpl.SummaryPsychoPractice(request)
    }

    async summaryOnePracticeSet(request: SummaryOnePracticeSetRequest): Promise<SummaryOnePracticeSetResponse> {
        return await this.studentGrpcServiceClientImpl.SummaryOnePracticeSet(request)
    }

    async getResultPractice(request: GetResultPracticeRequest): Promise<GetResultPracticeResponse> {
        return await this.studentGrpcServiceClientImpl.GetResultPractice(request)
    }

    async getAvailableTests(request: FindAllRequest): Promise<FindAllResponse> {
        return await this.studentGrpcServiceClientImpl.GetAvailableTests(request)
    }

    async getAttempts(request: GetAttemptsRequest): Promise<GetAttemptsResponse> {
        return await this.studentGrpcServiceClientImpl.GetAttempts(request)
    }

    async countAttempts(request: CountAttemptsRequest): Promise<CountAttemptsResponse> {
        return await this.studentGrpcServiceClientImpl.CountAttempts(request)
    }

    async getAttempt(request: GetAttemptRequest) {
        return await this.studentGrpcServiceClientImpl.GetAttempt(request)
    }

    async getAwsFaceRegSignedUrl(request: GetAwsFaceRegSignedUrlRequest): Promise<GetAwsFaceRegSignedUrlResponse> {
        return await this.studentGrpcServiceClientImpl.GetAwsFaceRegSignedUrl(request)
    }

    async getUserAssetsSignedUrl(request: GetUserAssetsSignedUrlRequest): Promise<GetUserAssetsSignedUrlResponse> {
        return await this.studentGrpcServiceClientImpl.GetUserAssetsSignedUrl(request)
    }

    async getRecordingsSignedUrl(request: GetRecordingsSignedUrlRequest): Promise<GetRecordingsSignedUrlResponse> {
        return await this.studentGrpcServiceClientImpl.GetRecordingsSignedUrl(request)
    }

    async getQrUploadSignedUrl(request: GetQrUploadSignedUrlRequest): Promise<GetQrUploadSignedUrlResponse> {
        return await this.studentGrpcServiceClientImpl.GetQrUploadSignedUrl(request)
    }

    async getBestAttempt(request: GetBestAttemptRequest): Promise<GetBestAttemptResponse> {
        return await this.studentGrpcServiceClientImpl.GetBestAttempt(request)
    }

    async getAverageAttempt(request: AverageAttemptRequest): Promise<AveragetAttemptResponse> {
        return await this.studentGrpcServiceClientImpl.GetAverageAttempt(request)
    }

    async getSubjectWiseSpeedAndAccuracy(request: GetSubjectWiseSpeedAndAccuracyRequest): Promise<GetSubjectWiseSpeedAndAccuracyResponse> {
        return await this.studentGrpcServiceClientImpl.GetSubjectWiseSpeedAndAccuracy(request)
    }

    async getTotalQuestionSolved(request: GetTotalQuestionSolvedRequest): Promise<GetTotalQuestionSolvedResponse> {
        return await this.studentGrpcServiceClientImpl.GetTotalQuestionSolved(request)
    }

    async getStudentAttempts(request: GetStudentAttemptsRequest): Promise<GetStudentAttemptsResponse> {
        return await this.studentGrpcServiceClientImpl.GetStudentAttempts(request)
    }

    async countStudentAttempts(request: CountStudentAttemptsRequest): Promise<CountStudentAttemptsResponse> {
        return await this.studentGrpcServiceClientImpl.CountStudentAttempts(request)
    }

    async getLastAttempt(request: GetMentorsReq): Promise<GetLastStudentAttemptResponse> {
        return await this.studentGrpcServiceClientImpl.GetLastAttempt(request)
    }

    async getLastStudentAttempt(request: GetLastStudentAttemptRequest): Promise<GetLastStudentAttemptResponse> {
        return await this.studentGrpcServiceClientImpl.GetLastStudentAttempt(request)
    }

    async getStudentAttempt(request: GetStudentAttemptRequest): Promise<GetStudentAttemptResponse> {
        return await this.studentGrpcServiceClientImpl.GetStudentAttempt(request)
    }

    async getClassrooms(request: GetClassroomsReq): Promise<Empty> {
        return await this.studentGrpcServiceClientImpl.GetClassrooms(request)
    }

    async getMentors(request: GetMentorsReq): Promise<Empty> {
        return await this.studentGrpcServiceClientImpl.GetMentors(request)
    }

    async findOneMentor(request: GetMentorsReq): Promise<Empty> {
        return await this.studentGrpcServiceClientImpl.FindOneMentor(request)
    }

    async sendInvitation(request: SendInvitationReq): Promise<Empty> {
        return await this.studentGrpcServiceClientImpl.SendInvitation(request)
    }

    async exportProfile(request: ExportProfileReq): Promise<Empty> {
        return await this.studentGrpcServiceClientImpl.ExportProfile(request)
    }

    async getSatScore(request: ExportProfileReq): Promise<Empty> {
        return await this.studentGrpcServiceClientImpl.GetSatScore(request)
    }

    async getSubjectwiseRanking(request: GetSubjectwiseRankingReq): Promise<Empty> {
        return await this.studentGrpcServiceClientImpl.GetSubjectwiseRanking(request)
    }

    async getMarkRanking(request: GetMarkRankingReq): Promise<Empty> {
        return await this.studentGrpcServiceClientImpl.GetMarkRanking(request)
    }

    async addMentor(request: AddMentorReq): Promise<Empty> {
        return await this.studentGrpcServiceClientImpl.AddMentor(request)
    }

    async removeMentor(request: RemoveMentorReq): Promise<Empty> {
        return await this.studentGrpcServiceClientImpl.RemoveMentor(request)
    }



}