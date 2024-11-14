import { CourseTrendRes, GetAssessmetSubjectDistributionReq, GetAssessmetSubjectDistributionRes, GetCourseSubjectDistributionReq, GetCourseSubjectDistributionRes, GetQuestionSubjectDistributionReq, GetQuestionSubjectDistributionRes, GetSoldDataReq, GetSoldDataRes, GetTestseriesSubjectDistributionReq, GetTestseriesSubjectDistributionRes, IndexPublisherReq, IndexPublisherRes, TestSeriesTrendReq, TestSeriesTrendRes, CourseTrendReq, AsessmentTrendReq, AsessmentTrendRes, GetTransactionLogsReq, GetTransactionLogsRes } from "@app/common/dto/userManagement/publisher.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufPublisherService = 'AuthGrpcService';

export interface PublisherGrpcInterface {
    IndexPublisher(request: IndexPublisherReq): Promise<IndexPublisherRes>;
    GetSoldData(request: GetSoldDataReq): Promise<GetSoldDataRes>;
    GetCourseSubjectDistribution(request: GetCourseSubjectDistributionReq): Promise<GetCourseSubjectDistributionRes>;
    GetTestseriesSubjectDistribution(request: GetTestseriesSubjectDistributionReq): Promise<GetTestseriesSubjectDistributionRes>;
    GetAssessmetSubjectDistribution(request: GetAssessmetSubjectDistributionReq): Promise<GetAssessmetSubjectDistributionRes>;
    GetQuestionSubjectDistribution(request: GetQuestionSubjectDistributionReq): Promise<GetQuestionSubjectDistributionRes>;
    TestSeriesTrend(request: TestSeriesTrendReq): Promise<TestSeriesTrendRes>;
    CourseTrend(request: CourseTrendReq): Promise<CourseTrendRes>;
    AsessmentTrend(request: AsessmentTrendReq): Promise<AsessmentTrendRes>;
    GetTransactionLogs(request: GetTransactionLogsReq): Promise<GetTransactionLogsRes>;
}

@Injectable()
export class PublisherGrpcServiceClientImpl implements PublisherGrpcInterface {
    private publisherGrpcServiceClient: PublisherGrpcInterface;
    private readonly logger = new Logger(PublisherGrpcServiceClientImpl.name);

    constructor(
        @Inject('authGrpcService') private publisherGrpcClient: ClientGrpc
    ) {}

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.publisherGrpcServiceClient = this.publisherGrpcClient.getService<PublisherGrpcInterface>(protobufPublisherService)
        this.logger.debug('gRPC client initialized');
    }

    async IndexPublisher(request: IndexPublisherReq): Promise<IndexPublisherRes> {
        return await this.publisherGrpcServiceClient.IndexPublisher(request);
    }

    async GetSoldData(request: GetSoldDataReq): Promise<GetSoldDataRes> {
        return await this.publisherGrpcServiceClient.GetSoldData(request);
    }

    async GetCourseSubjectDistribution(request: GetCourseSubjectDistributionReq): Promise<GetCourseSubjectDistributionRes> {
        return await this.publisherGrpcServiceClient.GetCourseSubjectDistribution(request);
    }

    async GetTestseriesSubjectDistribution(request: GetTestseriesSubjectDistributionReq): Promise<GetTestseriesSubjectDistributionRes> {
        return await this.publisherGrpcServiceClient.GetTestseriesSubjectDistribution(request);
    }

    async GetAssessmetSubjectDistribution(request: GetAssessmetSubjectDistributionReq): Promise<GetAssessmetSubjectDistributionRes> {
        return await this.publisherGrpcServiceClient.GetAssessmetSubjectDistribution(request);
    }

    async GetQuestionSubjectDistribution(request: GetQuestionSubjectDistributionReq): Promise<GetQuestionSubjectDistributionRes> {
        return await this.publisherGrpcServiceClient.GetQuestionSubjectDistribution(request);
    }

    async TestSeriesTrend(request: TestSeriesTrendReq): Promise<TestSeriesTrendRes> {
        return await this.publisherGrpcServiceClient.TestSeriesTrend(request);
    }

    async CourseTrend(request: CourseTrendReq): Promise<CourseTrendRes> {
        return await this.publisherGrpcServiceClient.CourseTrend(request);
    }

    async AsessmentTrend(request: AsessmentTrendReq): Promise<AsessmentTrendRes> {
        return await this.publisherGrpcServiceClient.AsessmentTrend(request);
    }

    async GetTransactionLogs(request: GetTransactionLogsReq): Promise<GetTransactionLogsRes> {
        return await this.publisherGrpcServiceClient.GetTransactionLogs(request);
    }
}