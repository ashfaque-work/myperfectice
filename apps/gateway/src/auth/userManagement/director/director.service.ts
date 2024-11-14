import { GetAbandonedAttemptTrendReq, GetAttemptTrendReq, GetAvgTimeSpendByCourseReq, GetDashboardSummaryReq, GetLoginTrendByClassroomReq, GetMostAttemptedStudentReq, GetPostTrendByLocationReq, GetQuestionAddedTrendReq, GetStudentOnboardingDistributionReq, GetTestSeriesAttemptTrendBySubjectReq } from "@app/common/dto/userManagement/director.dto";
import { DirectorGrpcServiceClientImpl } from "@app/common/grpc-clients/auth/director";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DirectorService {
    constructor(private directorGrpcServiceClientImpl: DirectorGrpcServiceClientImpl) {}

    async getDashboardSummary(request: GetDashboardSummaryReq) {
        return this.directorGrpcServiceClientImpl.GetDashboardSummary(request);
    }

    async getLoginTrendByClassroom(request: GetLoginTrendByClassroomReq) {
        return this.directorGrpcServiceClientImpl.GetLoginTrendByClassroom(request);
    }

    async getPostTrendByLocation(request: GetPostTrendByLocationReq) {
        return this.directorGrpcServiceClientImpl.GetPostTrendByLocation(request);
    }

    async getMostAttemptedStudent(request: GetMostAttemptedStudentReq) {
        return this.directorGrpcServiceClientImpl.GetMostAttemptedStudent(request);
    }

    async getQuestionAddedTrend(request: GetQuestionAddedTrendReq) {
        return this.directorGrpcServiceClientImpl.GetQuestionAddedTrend(request);
    }

    async getAttemptTrend(request: GetAttemptTrendReq) {
        return this.directorGrpcServiceClientImpl.GetAttemptTrend(request);
    }

    async getAbandonedAttemptTrend(request: GetAbandonedAttemptTrendReq) {
        return this.directorGrpcServiceClientImpl.GetAbandonedAttemptTrend(request);
    }

    async getAvgTimeSpendByCourse(request: GetAvgTimeSpendByCourseReq) {
        return this.directorGrpcServiceClientImpl.GetAvgTimeSpendByCourse(request);
    }

    async getStudentOnboardingDistribution(request: GetStudentOnboardingDistributionReq) {
        return this.directorGrpcServiceClientImpl.GetStudentOnboardingDistribution(request);
    }

    async getTestSeriesAttemptTrendBySubject(request: GetTestSeriesAttemptTrendBySubjectReq) {
        return this.directorGrpcServiceClientImpl.GetTestSeriesAttemptTrendBySubject(request);
    }
}