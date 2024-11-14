import { Controller } from "@nestjs/common";
import { DirectorService } from "./director.service";
import { protobufDirectorService } from "@app/common/grpc-clients/auth/director";
import { GetAbandonedAttemptTrendReq, GetAttemptTrendReq, GetAvgTimeSpendByCourseReq, GetDashboardSummaryReq, GetLoginTrendByClassroomReq, GetMostAttemptedStudentReq, GetPostTrendByLocationReq, GetQuestionAddedTrendReq, GetStudentOnboardingDistributionReq, GetTestSeriesAttemptTrendBySubjectReq } from "@app/common/dto/userManagement/director.dto";
import { GrpcMethod } from "@nestjs/microservices";

@Controller()
export class DirectorController {
    constructor(
        private readonly directorService: DirectorService
    ) {}

    @GrpcMethod(protobufDirectorService, 'GetDashboardSummary')
    async getDashboardSummary(request: GetDashboardSummaryReq) {
        return await this.directorService.getDashboardSummary(request);
    }

    @GrpcMethod(protobufDirectorService, 'GetLoginTrendByClassroom')
    async getLoginTrendByClassroom(request: GetLoginTrendByClassroomReq) {
        return await this.directorService.getLoginTrendByClassroom(request);
    }

    @GrpcMethod(protobufDirectorService, 'GetPostTrendByLocation')
    async getPostTrendByLocation(request: GetPostTrendByLocationReq) {
        return await this.directorService.getPostTrendByLocation(request);
    }

    @GrpcMethod(protobufDirectorService, 'GetMostAttemptedStudent')
    async getMostAttemptedStudent(request: GetMostAttemptedStudentReq) {
        return await this.directorService.getMostAttemptedStudent(request);
    }

    @GrpcMethod(protobufDirectorService, 'GetQuestionAddedTrend')
    async getQuestionAddedTrend(request: GetQuestionAddedTrendReq) {
        return await this.directorService.getQuestionAddedTrend(request);
    }

    @GrpcMethod(protobufDirectorService, 'GetAttemptTrend')
    async getAttemptTrend(request: GetAttemptTrendReq) {
        return await this.directorService.getAttemptTrend(request);
    }

    @GrpcMethod(protobufDirectorService, 'GetAbandonedAttemptTrend')
    async getAbandonedAttemptTrend(request: GetAbandonedAttemptTrendReq) {
        return await this.directorService.getAbandonedAttemptTrend(request);
    }

    @GrpcMethod(protobufDirectorService, 'GetAvgTimeSpendByCourse')
    async getAvgTimeSpendByCourse(request: GetAvgTimeSpendByCourseReq) {
        return await this.directorService.getAvgTimeSpendByCourse(request);
    }

    @GrpcMethod(protobufDirectorService, 'GetStudentOnboardingDistribution')
    async getStudentOnboardingDistribution(request: GetStudentOnboardingDistributionReq) {
        return await this.directorService.getStudentOnboardingDistribution(request);
    }

    @GrpcMethod(protobufDirectorService, 'GetTestSeriesAttemptTrendBySubject')
    async getTestSeriesAttemptTrendBySubject(request: GetTestSeriesAttemptTrendBySubjectReq) {
        return await this.directorService.getTestSeriesAttemptTrendBySubject(request);
    }
}