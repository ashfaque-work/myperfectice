import { Empty, GetStudentLevelTestReq } from "@app/common/dto/sqlAnalysis.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufSqlAnalysisService = 'AttemptGrpcService'

export interface SqlAnalysisGrpcInterface {
    GetStudentLevelTest(request: GetStudentLevelTestReq): Promise<Empty>;
    GetSubjectPerformersTest(request: GetStudentLevelTestReq): Promise<Empty>;
    GetSubjectNonPerformersTest(request: GetStudentLevelTestReq): Promise<Empty>;
    GetPoorTopicsTest(request: GetStudentLevelTestReq): Promise<Empty>;
    GetAbsenteeListTest(request: GetStudentLevelTestReq): Promise<Empty>;
    GetPercentAbsentTest(request: GetStudentLevelTestReq): Promise<Empty>;
    GetAbandoned1stTest(request: GetStudentLevelTestReq): Promise<Empty>;
    GetPercentAbandonedTest(request: GetStudentLevelTestReq): Promise<Empty>;
    GetStudentLevelGrade(request: GetStudentLevelTestReq): Promise<Empty>;
    GetSubjectPerformersGrade(request: GetStudentLevelTestReq): Promise<Empty>;
    GetSubjectNonPerformersGrade(request: GetStudentLevelTestReq): Promise<Empty>;
    GetPoorTopicsGrade(request: GetStudentLevelTestReq): Promise<Empty>;
    GetMarksSummaryGrade(request: GetStudentLevelTestReq): Promise<Empty>;
    GetStudentLevelSummaryGrade(request: GetStudentLevelTestReq): Promise<Empty>;
    GetStudentByComplexityGrade(request: GetStudentLevelTestReq): Promise<Empty>;
}

@Injectable()
export class SqlAnalysisGrpcServiceClientImpl implements SqlAnalysisGrpcInterface {
    private sqlAnalysisGrpcServiceClient: SqlAnalysisGrpcInterface;
    private readonly logger = new Logger(SqlAnalysisGrpcServiceClientImpl.name);

    constructor(
        @Inject('attemptGrpcService') private sqlAnalysisGrpcClient: ClientGrpc
    ) { }
    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.sqlAnalysisGrpcServiceClient =
            this.sqlAnalysisGrpcClient.getService<SqlAnalysisGrpcInterface>(
                protobufSqlAnalysisService,
            );
        this.logger.debug('gRPC client initialized.');
    }

    async GetStudentLevelTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetStudentLevelTest(request)
    }

    async GetSubjectPerformersTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetSubjectPerformersTest(request)
    }

    async GetSubjectNonPerformersTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetSubjectNonPerformersTest(request)
    }

    async GetPoorTopicsTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetPoorTopicsTest(request)
    }

    async GetAbsenteeListTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetAbsenteeListTest(request)
    }

    async GetPercentAbsentTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetPercentAbsentTest(request)
    }

    async GetAbandoned1stTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetAbandoned1stTest(request)
    }

    async GetPercentAbandonedTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetPercentAbandonedTest(request)
    }

    async GetStudentLevelGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetStudentLevelGrade(request)
    }

    async GetSubjectPerformersGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetSubjectPerformersGrade(request)
    }

    async GetSubjectNonPerformersGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetSubjectNonPerformersGrade(request)
    }

    async GetPoorTopicsGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetPoorTopicsGrade(request)
    }

    async GetMarksSummaryGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetMarksSummaryGrade(request)
    }

    async GetStudentLevelSummaryGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetStudentLevelSummaryGrade(request)
    }

    async GetStudentByComplexityGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClient.GetStudentByComplexityGrade(request)
    }
}