import { Controller } from "@nestjs/common";
import { SqlAnalysisService } from "./sqlAnalysis.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufSqlAnalysisService } from "@app/common/grpc-clients/attempt";
import { GetStudentLevelTestReq } from "@app/common/dto/sqlAnalysis.dto";

@Controller()
export class SqlAnalysisController {
    constructor(private readonly sqlAnalysisService: SqlAnalysisService) { }

    @GrpcMethod(protobufSqlAnalysisService, 'GetStudentLevelTest')
    getStudentLevelTest(request: GetStudentLevelTestReq) {
        return this.sqlAnalysisService.getStudentLevelTest(request)
    }

    @GrpcMethod(protobufSqlAnalysisService, 'GetSubjectPerformersTest')
    getSubjectPerformersTest(request: GetStudentLevelTestReq) {
        return this.sqlAnalysisService.getSubjectPerformersTest(request)
    }

    @GrpcMethod(protobufSqlAnalysisService, 'GetSubjectNonPerformersTest')
    getSubjectNonPerformersTest(request: GetStudentLevelTestReq) {
        return this.sqlAnalysisService.getSubjectNonPerformersTest(request)
    }

    @GrpcMethod(protobufSqlAnalysisService, 'GetPoorTopicsTest')
    getPoorTopicsTest(request: GetStudentLevelTestReq) {
        return this.sqlAnalysisService.getPoorTopicsTest(request)
    }

    @GrpcMethod(protobufSqlAnalysisService, 'GetAbsenteeListTest')
    getAbsenteeListTest() {
        return this.sqlAnalysisService.getAbsenteeListTest()
    }

    @GrpcMethod(protobufSqlAnalysisService, 'GetPercentAbsentTest')
    getPercentAbsentTest() {
        return this.sqlAnalysisService.getPercentAbsentTest()
    }
    
    @GrpcMethod(protobufSqlAnalysisService, 'GetAbandoned1stTest')
    getAbandoned1stTest(request: GetStudentLevelTestReq) {
        return this.sqlAnalysisService.getAbandoned1stTest(request)
    }
    
    @GrpcMethod(protobufSqlAnalysisService, 'GetPercentAbandonedTest')
    getPercentAbandonedTest(request: GetStudentLevelTestReq) {
        return this.sqlAnalysisService.getPercentAbandonedTest(request)
    }
    
    @GrpcMethod(protobufSqlAnalysisService, 'GetStudentLevelGrade')
    getStudentLevelGrade(request: GetStudentLevelTestReq) {
        return this.sqlAnalysisService.getStudentLevelGrade(request)
    }
    
    @GrpcMethod(protobufSqlAnalysisService, 'GetSubjectPerformersGrade')
    getSubjectPerformersGrade(request: GetStudentLevelTestReq) {
        return this.sqlAnalysisService.getSubjectPerformersGrade(request)
    }
    
    @GrpcMethod(protobufSqlAnalysisService, 'GetSubjectNonPerformersGrade')
    getSubjectNonPerformersGrade(request: GetStudentLevelTestReq) {
        return this.sqlAnalysisService.getSubjectNonPerformersGrade(request)
    }
    
    @GrpcMethod(protobufSqlAnalysisService, 'GetPoorTopicsGrade')
    getPoorTopicsGrade(request: GetStudentLevelTestReq) {
        return this.sqlAnalysisService.getPoorTopicsGrade(request)
    }
    
    @GrpcMethod(protobufSqlAnalysisService, 'GetMarksSummaryGrade')
    getMarksSummaryGrade(request: GetStudentLevelTestReq) {
        return this.sqlAnalysisService.getMarksSummaryGrade(request)
    }
    
    @GrpcMethod(protobufSqlAnalysisService, 'getStudentLevelSummaryGrade')
    getStudentLevelSummaryGrade(request: GetStudentLevelTestReq) {
        return this.sqlAnalysisService.getStudentLevelSummaryGrade(request)
    }

    @GrpcMethod(protobufSqlAnalysisService, 'GetStudentByComplexityGrade')
    getStudentByComplexityGrade() {
        return this.sqlAnalysisService.getStudentByComplexityGrade()
    }
}