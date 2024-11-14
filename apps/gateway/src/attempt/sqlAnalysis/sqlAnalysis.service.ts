import { Empty, GetStudentLevelTestReq } from "@app/common/dto/sqlAnalysis.dto";
import { SqlAnalysisGrpcServiceClientImpl } from "@app/common/grpc-clients/attempt";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SqlAnalysisService {
    constructor(private sqlAnalysisGrpcServiceClientImpl: SqlAnalysisGrpcServiceClientImpl) { }

    async getStudentLevelTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetStudentLevelTest(request)
    }

    async getSubjectPerformersTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetSubjectPerformersTest(request)
    }

    async getSubjectNonPerformersTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetSubjectNonPerformersTest(request)
    }

    async getPoorTopicsTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetPoorTopicsTest(request)
    }

    async getAbsenteeListTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetAbsenteeListTest(request)
    }

    async getPercentAbsentTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetPercentAbsentTest(request)
    }

    async getAbandoned1stTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetAbandoned1stTest(request)
    }

    async getPercentAbandonedTest(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetPercentAbandonedTest(request)
    }

    async getStudentLevelGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetStudentLevelGrade(request)
    }

    async getSubjectPerformersGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetSubjectPerformersGrade(request)
    }

    async getSubjectNonPerformersGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetSubjectNonPerformersGrade(request)
    }

    async getPoorTopicsGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetPoorTopicsGrade(request)
    }

    async getMarksSummaryGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetMarksSummaryGrade(request)
    }

    async getStudentLevelSummaryGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetStudentLevelSummaryGrade(request)
    }

    async getStudentByComplexityGrade(request: GetStudentLevelTestReq): Promise<Empty> {
        return await this.sqlAnalysisGrpcServiceClientImpl.GetStudentByComplexityGrade(request)
    }  
}