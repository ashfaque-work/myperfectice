import { GetAbandonedAttemptTrendReq, GetAbandonedAttemptTrendRes, GetAttemptTrendReq, GetAttemptTrendRes, GetAvgTimeSpendByCourseReq, GetAvgTimeSpendByCourseRes, GetDashboardSummaryReq, GetDashboardSummaryRes, GetLoginTrendByClassroomReq, GetLoginTrendByClassroomRes, GetMostAttemptedStudentReq, GetMostAttemptedStudentRes, GetPostTrendByLocationReq, GetPostTrendByLocationRes, GetQuestionAddedTrendReq, GetQuestionAddedTrendRes, GetStudentOnboardingDistributionReq, GetStudentOnboardingDistributionRes, GetTestSeriesAttemptTrendBySubjectReq, GetTestSeriesAttemptTrendBySubjectRes } from "@app/common/dto/userManagement/director.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufDirectorService = 'AuthGrpcService';

export interface DirectorGrpcInterface {
    GetDashboardSummary(request: GetDashboardSummaryReq): Promise<GetDashboardSummaryRes>;
    GetLoginTrendByClassroom(request: GetLoginTrendByClassroomReq): Promise<GetLoginTrendByClassroomRes>;
    GetPostTrendByLocation(request: GetPostTrendByLocationReq): Promise<GetPostTrendByLocationRes>;
    GetMostAttemptedStudent(request: GetMostAttemptedStudentReq): Promise<GetMostAttemptedStudentRes>;
    GetQuestionAddedTrend(request: GetQuestionAddedTrendReq): Promise<GetQuestionAddedTrendRes>;
    GetAttemptTrend(request: GetAttemptTrendReq): Promise<GetAttemptTrendRes>;
    GetAbandonedAttemptTrend(request: GetAbandonedAttemptTrendReq): Promise<GetAbandonedAttemptTrendRes>;
    GetAvgTimeSpendByCourse(request: GetAvgTimeSpendByCourseReq): Promise<GetAvgTimeSpendByCourseRes>;
    GetStudentOnboardingDistribution(request: GetStudentOnboardingDistributionReq): Promise<GetStudentOnboardingDistributionRes>;
    GetTestSeriesAttemptTrendBySubject(request: GetTestSeriesAttemptTrendBySubjectReq): Promise<GetTestSeriesAttemptTrendBySubjectRes>;
}

@Injectable()
export class DirectorGrpcServiceClientImpl implements DirectorGrpcInterface {
    private directorGrpcServiceClient: DirectorGrpcInterface;
    private readonly logger = new Logger(DirectorGrpcServiceClientImpl.name);

    constructor(
        @Inject('authGrpcService') private directorGrpcClient: ClientGrpc,
    ) {}

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.directorGrpcServiceClient = this.directorGrpcClient.getService<DirectorGrpcInterface>(protobufDirectorService)
        this.logger.debug('gRPC client initialized');
    }

    async GetDashboardSummary(request: GetDashboardSummaryReq): Promise<GetDashboardSummaryRes> {
        return await this.directorGrpcServiceClient.GetDashboardSummary(request);
    }

    async GetLoginTrendByClassroom(request: GetLoginTrendByClassroomReq): Promise<GetLoginTrendByClassroomRes> {
        return await this.directorGrpcServiceClient.GetLoginTrendByClassroom(request);
    }

    async GetPostTrendByLocation(request: GetPostTrendByLocationReq): Promise<GetPostTrendByLocationRes> {
        return await this.directorGrpcServiceClient.GetPostTrendByLocation(request);
    }

    async GetMostAttemptedStudent(request: GetMostAttemptedStudentReq): Promise<GetMostAttemptedStudentRes> {
        return await this.directorGrpcServiceClient.GetMostAttemptedStudent(request);
    }

    async GetQuestionAddedTrend(request: GetQuestionAddedTrendReq): Promise<GetQuestionAddedTrendRes> {
        return await this.directorGrpcServiceClient.GetQuestionAddedTrend(request);
    }

    async GetAttemptTrend(request: GetAttemptTrendReq): Promise<GetAttemptTrendRes> {
        return await this.directorGrpcServiceClient.GetAttemptTrend(request);
    }

    async GetAbandonedAttemptTrend(request: GetAbandonedAttemptTrendReq): Promise<GetAbandonedAttemptTrendRes> {
        return await this.directorGrpcServiceClient.GetAbandonedAttemptTrend(request);
    }

    async GetAvgTimeSpendByCourse(request: GetAvgTimeSpendByCourseReq): Promise<GetAvgTimeSpendByCourseRes> {
        return await this.directorGrpcServiceClient.GetAvgTimeSpendByCourse(request);
    }
    
    async GetStudentOnboardingDistribution(request: GetStudentOnboardingDistributionReq): Promise<GetStudentOnboardingDistributionRes> {
        return await this.directorGrpcServiceClient.GetStudentOnboardingDistribution(request);
    }

    async GetTestSeriesAttemptTrendBySubject(request: GetTestSeriesAttemptTrendBySubjectReq): Promise<GetTestSeriesAttemptTrendBySubjectRes> {
        return await this.directorGrpcServiceClient.GetTestSeriesAttemptTrendBySubject(request);
    }
}