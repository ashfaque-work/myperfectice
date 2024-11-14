import { Controller } from "@nestjs/common";
import { PublisherService } from "./publisher.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufPublisherService } from "@app/common/grpc-clients/auth/publisher";
import { AsessmentTrendReq, CourseTrendReq, GetAssessmetSubjectDistributionReq, GetCourseSubjectDistributionReq, GetQuestionSubjectDistributionReq, GetSoldDataReq, GetTestseriesSubjectDistributionReq, GetTransactionLogsReq, IndexPublisherReq, TestSeriesTrendReq } from "@app/common/dto/userManagement/publisher.dto";

@Controller()
export class PublisherController {
    constructor(private readonly publisherService: PublisherService) {}

    @GrpcMethod(protobufPublisherService, 'IndexPublisher')
    async indexPublisher(request: IndexPublisherReq) {
        return this.publisherService.indexPublisher(request);
    }

    @GrpcMethod(protobufPublisherService, 'GetSoldData')
    async getSoldData(request: GetSoldDataReq) {
        return this.publisherService.getSoldData(request);
    }

    @GrpcMethod(protobufPublisherService, 'GetCourseSubjectDistribution')
    async getCourseSubjectDistribution(request: GetCourseSubjectDistributionReq) {
        return this.publisherService.getCourseSubjectDistribution(request);
    }

    @GrpcMethod(protobufPublisherService, 'GetTestseriesSubjectDistribution')
    async getTestseriesSubjectDistribution(request: GetTestseriesSubjectDistributionReq) {
        return this.publisherService.getTestseriesSubjectDistribution(request);
    }

    @GrpcMethod(protobufPublisherService, 'GetAssessmetSubjectDistribution')
    async getAssessmetSubjectDistribution(request: GetAssessmetSubjectDistributionReq) {
        return this.publisherService.getAssessmetSubjectDistribution(request);
    }

    @GrpcMethod(protobufPublisherService, 'GetQuestionSubjectDistribution')
    async getQuestionSubjectDistribution(request: GetQuestionSubjectDistributionReq) {
        return this.publisherService.getQuestionSubjectDistribution(request);
    }

    @GrpcMethod(protobufPublisherService, 'TestSeriesTrend')
    async testSeriesTrend(request: TestSeriesTrendReq) {
        return this.publisherService.testSeriesTrend(request);
    }

    @GrpcMethod(protobufPublisherService, 'CourseTrend')
    async courseTrend(request: CourseTrendReq) {
        return this.publisherService.courseTrend(request);
    }

    @GrpcMethod(protobufPublisherService, 'AsessmentTrend')
    async asessmentTrend(request: AsessmentTrendReq) {
        return this.publisherService.asessmentTrend(request);
    }

    @GrpcMethod(protobufPublisherService, 'GetTransactionLogs')
    async getTransactionLogs(request: GetTransactionLogsReq) {
        return this.publisherService.getTransactionLogs(request);
    }
}