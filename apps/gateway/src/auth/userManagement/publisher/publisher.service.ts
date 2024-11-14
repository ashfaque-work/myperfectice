import { GetAssessmetSubjectDistributionReq, GetCourseSubjectDistributionReq, GetQuestionSubjectDistributionReq, GetSoldDataReq, GetTestseriesSubjectDistributionReq, IndexPublisherReq, TestSeriesTrendReq, CourseTrendReq, AsessmentTrendReq, GetTransactionLogsReq } from "@app/common/dto/userManagement/publisher.dto";
import { PublisherGrpcServiceClientImpl } from "@app/common/grpc-clients/auth/publisher";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PublisherService {
    constructor(private publisherGrpcServiceClientImpl: PublisherGrpcServiceClientImpl) {}

    async indexPublisher(request: IndexPublisherReq) {
        return this.publisherGrpcServiceClientImpl.IndexPublisher(request);
    }

    async getSoldData(request: GetSoldDataReq) {
        return this.publisherGrpcServiceClientImpl.GetSoldData(request);
    }

    async getCourseSubjectDistribution(request: GetCourseSubjectDistributionReq) {
        return this.publisherGrpcServiceClientImpl.GetCourseSubjectDistribution(request);
    }

    async getTestseriesSubjectDistribution(request: GetTestseriesSubjectDistributionReq) {
        return this.publisherGrpcServiceClientImpl.GetTestseriesSubjectDistribution(request);
    }

    async getAssessmetSubjectDistribution(request: GetAssessmetSubjectDistributionReq) {
        return this.publisherGrpcServiceClientImpl.GetAssessmetSubjectDistribution(request);
    }

    async getQuestionSubjectDistribution(request: GetQuestionSubjectDistributionReq) {
        return this.publisherGrpcServiceClientImpl.GetQuestionSubjectDistribution(request);
    }

    async testSeriesTrend(request: TestSeriesTrendReq) {
        return this.publisherGrpcServiceClientImpl.TestSeriesTrend(request);
    }

    async courseTrend(request: CourseTrendReq) {
        return this.publisherGrpcServiceClientImpl.CourseTrend(request);
    }

    async asessmentTrend(request: AsessmentTrendReq) {
        return this.publisherGrpcServiceClientImpl.AsessmentTrend(request);
    }

    async getTransactionLogs(request: GetTransactionLogsReq) {
        return this.publisherGrpcServiceClientImpl.GetTransactionLogs(request);
    }
}