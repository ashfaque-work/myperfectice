import { Controller } from "@nestjs/common";
import { StudentService } from "./student.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufStudentService } from "@app/common/grpc-clients/attempt";
import { AddMentorReq, AverageAttemptRequest, CountAttemptsRequest, CountStudentAttemptsRequest, ExportProfileReq, FindAllRequest, GetAccuracyAndSpeedByTopicRequest, GetAccuracyAndSpeedRequest, GetAttemptRequest, GetAttemptsRequest, GetAverageTimeOnPlatformRequest, GetAwsFaceRegSignedUrlRequest, GetBestAttemptRequest, GetClassroomsReq, GetEffortTrendAttemptCountRequest, GetEffortTrendAttemptTotalTimeRequest, GetEffortTrendCourseTimeSpentRequest, GetGroupParticipationRequest, GetLastStudentAttemptRequest, GetLearningEffortsDistributionRequest, GetMarkRankingReq, GetMentorsReq, GetPersistanceDataRequest, GetQrUploadSignedUrlRequest, GetRecommendedTestsRequest, GetRecommendedVideosReq, GetRecordingsSignedUrlRequest, GetResultPracticeRequest, GetStudentAttemptRequest, GetStudentAttemptsRequest, GetSubjectQuestionComplexityRequest, GetSubjectwiseRankingReq, GetSubjectWiseSpeedAndAccuracyRequest, GetSummaryByNumberRequest, GetTakeTestsAgainRequest, GetTextualAnalysisRequest, GetTopperSummaryByNumberRequest, GetTotalQuestionSolvedRequest, GetUniqueQuestionsCountRequest, GetUserAssetsSignedUrlRequest, QuestionCategoryDistributionRequest, RemoveMentorReq, SendInvitationReq, SummaryAttemptedPracticeRequest, SummaryAttemptedTestSeriesReq, SummaryOnePracticeSetRequest, SummaryPsychoPracticeRequest } from "@app/common/dto/student.dto";

@Controller()
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @GrpcMethod(protobufStudentService, 'GetRecommendedTests')
    getRecommendedTests(request: GetRecommendedTestsRequest) {
        return this.studentService.getRecommendedTests(request)
    }

    @GrpcMethod(protobufStudentService, 'GetTakeTestsAgain')
    getTakeTestsAgain(request: GetTakeTestsAgainRequest) {
        return this.studentService.getTakeTestsAgain(request)
    }

    @GrpcMethod(protobufStudentService, 'GetRecommendedVideos')
    getRecommendedVideos(request: GetRecommendedVideosReq) {
        return this.studentService.getRecommendedVideos(request)
    }

    @GrpcMethod(protobufStudentService, 'GetAttemptSummary')
    getAttemptSummary(request: GetTextualAnalysisRequest) {
        return this.studentService.getAttemptSummary(request)
    }

    @GrpcMethod(protobufStudentService, 'GetTextualAnalysis')
    getTextualAnalysis(request: GetTextualAnalysisRequest) {
        return this.studentService.getTextualAnalysis(request)
    }

    @GrpcMethod(protobufStudentService, 'GetSummaryByNumber')
    getSummaryByNumber(request: GetSummaryByNumberRequest) {
        return this.studentService.getSummaryByNumber(request)
    }

    @GrpcMethod(protobufStudentService, 'GetTopperSummaryByNumber')
    getTopperSummaryByNumber(request: GetTopperSummaryByNumberRequest) {
        return this.studentService.getTopperSummaryByNumber(request)
    }

    @GrpcMethod(protobufStudentService, 'GetAverageTimeOnPlatform')
    getAverageTimeOnPlatform(request: GetAverageTimeOnPlatformRequest) {
        return this.studentService.getAverageTimeOnPlatform(request)
    }

    @GrpcMethod(protobufStudentService, 'GetEffortTrendAttemptCount')
    getEffortTrendAttemptCount(request: GetEffortTrendAttemptCountRequest) {
        return this.studentService.getEffortTrendAttemptCount(request)
    }

    @GrpcMethod(protobufStudentService, 'GetLearningEffortDistribution')
    getLearningEffortDistribution(request: GetLearningEffortsDistributionRequest) {
        return this.studentService.getLearningEffortDistribution(request)
    }

    @GrpcMethod(protobufStudentService, 'GetSubjectQuestionComplexity')
    getSubjectQuestionComplexity(request: GetSubjectQuestionComplexityRequest) {
        return this.studentService.getSubjectQuestionComplexity(request)
    }

    @GrpcMethod(protobufStudentService, 'QuestionCategoryDistribution')
    questionCategoryDistribution(request: QuestionCategoryDistributionRequest) {
        return this.studentService.questionCategoryDistribution(request)
    }

    @GrpcMethod(protobufStudentService, 'GetGroupParticipation')
    getGroupParticipation(request: GetGroupParticipationRequest) {
        return this.studentService.getGroupParticipation(request)
    }

    @GrpcMethod(protobufStudentService, 'GetPersistanceData')
    getPersistanceData(request: GetPersistanceDataRequest) {
        return this.studentService.getPersistanceData(request)
    }

    @GrpcMethod(protobufStudentService, 'GetEffortTrendAttemptTotalTime')
    getEffortTrendAttemptTotalTime(request: GetEffortTrendAttemptTotalTimeRequest) {
        return this.studentService.getEffortTrendAttemptTotalTime(request)
    }

    @GrpcMethod(protobufStudentService, 'GetEffortTrendCourseTimeSpent')
    getEffortTrendCourseTimeSpent(request: GetEffortTrendCourseTimeSpentRequest) {
        return this.studentService.getEffortTrendCourseTimeSpent(request)
    }

    @GrpcMethod(protobufStudentService, 'GetUniqueQuestionsCount')
    getUniqueQuestionsCount(request: GetUniqueQuestionsCountRequest) {
        return this.studentService.getUniqueQuestionsCount(request)
    }

    @GrpcMethod(protobufStudentService, 'GetAccuracyAndSpeed')
    getAccuracyAndSpeed(request: GetAccuracyAndSpeedRequest) {
        return this.studentService.getAccuracyAndSpeed(request)
    }

    @GrpcMethod(protobufStudentService, 'GetAccuracyAndSpeedByTopic')
    getAccuracyAndSpeedByTopic(request: GetAccuracyAndSpeedByTopicRequest) {
        return this.studentService.getAccuracyAndSpeedByTopic(request)
    }

    @GrpcMethod(protobufStudentService, 'SummaryAttemptedPracticeStudent')
    summaryAttemptedPractice(request: SummaryAttemptedPracticeRequest) {
        return this.studentService.summaryAttemptedPractice(request)
    }

    @GrpcMethod(protobufStudentService, 'SummaryAttemptedTestSeries')
    summaryAttemptedTestSeries(request: SummaryAttemptedTestSeriesReq) {
        return this.studentService.summaryAttemptedTestSeries(request)
    }

    @GrpcMethod(protobufStudentService, 'SummaryPsychoPractice')
    summaryPsychoPractice(request: SummaryPsychoPracticeRequest) {
        return this.studentService.summaryPsychoPractice(request)
    }

    @GrpcMethod(protobufStudentService, 'SummaryOnePracticeSetInStu')
    summaryOnePracticeSet(request: SummaryOnePracticeSetRequest) {
        return this.studentService.summaryOnePracticeSet(request)
    }

    @GrpcMethod(protobufStudentService, 'GetResultPractice')
    getResultPractice(request: GetResultPracticeRequest) {
        return this.studentService.getResultPractice(request)
    }

    @GrpcMethod(protobufStudentService, 'GetAvailableTests')
    getAvailableTests(request: FindAllRequest) {
        return this.studentService.getAvailableTests(request)
    }

    @GrpcMethod(protobufStudentService, 'GetAttempts')
    getAttempts(request: GetAttemptsRequest) {
        return this.studentService.getAttempts(request)
    }

    @GrpcMethod(protobufStudentService, 'CountAttempts')
    countAttempts(request: CountAttemptsRequest) {
        return this.studentService.countAttempts(request)
    }

    @GrpcMethod(protobufStudentService, 'GetAttempt')
    getAttempt(request: GetAttemptRequest) {
        return this.studentService.getAttempt(request)
    }

    @GrpcMethod(protobufStudentService, 'GetAwsFaceRegSignedUrl')
    getAwsFaceRegSignedUrl(request: GetAwsFaceRegSignedUrlRequest) {
        return this.studentService.getAwsFaceRegSignedUrl(request)
    }

    @GrpcMethod(protobufStudentService, 'GetUserAssetsSignedUrl')
    getUserAssetsSignedUrl(request: GetUserAssetsSignedUrlRequest) {
        return this.studentService.getUserAssetsSignedUrl(request)
    }

    @GrpcMethod(protobufStudentService, 'GetRecordingsSignedUrl')
    getRecordingsSignedUrl(request: GetRecordingsSignedUrlRequest) {
        return this.studentService.getRecordingsSignedUrl(request)
    }

    @GrpcMethod(protobufStudentService, 'GetQrUploadSignedUrl')
    getQrUploadSignedUrl(request: GetQrUploadSignedUrlRequest) {
        return this.studentService.getQrUploadSignedUrl(request)
    }

    @GrpcMethod(protobufStudentService, 'GetBestAttempt')
    getBestAttempt(request: GetBestAttemptRequest) {
        return this.studentService.getBestAttempt(request)
    }

    @GrpcMethod(protobufStudentService, 'GetAverageAttempt')
    getAverageAttempt(request: AverageAttemptRequest) {
        return this.studentService.getAverageAttempt(request)
    }

    @GrpcMethod(protobufStudentService, 'GetSubjectWiseSpeedAndAccuracy')
    getSubjectWiseSpeedAndAccuracy(request: GetSubjectWiseSpeedAndAccuracyRequest) {
        return this.studentService.getSubjectWiseSpeedAndAccuracy(request)
    }

    @GrpcMethod(protobufStudentService, 'GetTotalQuestionSolved')
    getTotalQuestionSolvec(request: GetTotalQuestionSolvedRequest) {
        return this.studentService.getTotalQuestionSolved(request)
    }

    @GrpcMethod(protobufStudentService, 'GetStudentAttempts')
    getStudentAttempts(request: GetStudentAttemptsRequest) {
        return this.studentService.getStudentAttempts(request)
    }

    @GrpcMethod(protobufStudentService, 'CountStudentAttempts')
    countStudentAttempts(request: CountStudentAttemptsRequest) {
        return this.studentService.countStudentAttempts(request)
    }

    @GrpcMethod(protobufStudentService, 'GetLastAttempt')
    getLastAttempt(request: GetMentorsReq) {
        return this.studentService.getLastAttempt(request)
    }

    @GrpcMethod(protobufStudentService, 'GetLastStudentAttempt')
    getLastStudentAttempt(request: GetLastStudentAttemptRequest) {
        return this.studentService.getLastStudentAttempt(request)
    }

    @GrpcMethod(protobufStudentService, 'GetStudentAttempt')
    getStudentAttempt(request: GetStudentAttemptRequest) {
        return this.studentService.getStudentAttempt(request)
    }

    @GrpcMethod(protobufStudentService, 'GetClassrooms')
    getClassrooms(request: GetClassroomsReq) {
        return this.studentService.getClassrooms(request)
    }

    @GrpcMethod(protobufStudentService, 'GetMentors')
    getMentors(request: GetMentorsReq) {
        return this.studentService.getMentors(request)
    }

    @GrpcMethod(protobufStudentService, 'FindOneMentor')
    findOneMentor(request: GetMentorsReq) {
        return this.studentService.findOneMentor(request)
    }

    @GrpcMethod(protobufStudentService, 'SendInvitation')
    sendInvitation(request: SendInvitationReq) {
        return this.studentService.sendInvitation(request)
    }

    @GrpcMethod(protobufStudentService, 'ExportProfile')
    exportProfile(request: ExportProfileReq) {
        return this.studentService.exportProfile(request)
    }

    @GrpcMethod(protobufStudentService, 'GetSatScore')
    getSatScore(request: ExportProfileReq) {
        return this.studentService.getSatScore(request)
    }

    @GrpcMethod(protobufStudentService, 'GetSubjectwiseRanking')
    getSubjectwiseRanking(request: GetSubjectwiseRankingReq) {
        return this.studentService.getSubjectwiseRanking(request)
    }

    @GrpcMethod(protobufStudentService, 'GetMarkRanking')
    getMarkRanking(request: GetMarkRankingReq) {
        return this.studentService.getMarkRanking(request)
    }

    @GrpcMethod(protobufStudentService, 'AddMentor')
    addMentor(request: AddMentorReq) {
        return this.studentService.addMentor(request)
    }

    @GrpcMethod(protobufStudentService, 'RemoveMentor')
    removeMentor(request: RemoveMentorReq) {
        return this.studentService.removeMentor(request)
    }
}