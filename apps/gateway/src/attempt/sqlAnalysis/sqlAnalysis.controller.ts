import { Controller, Get, Headers, Query } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { SqlAnalysisService } from "./sqlAnalysis.service";

@ApiTags("sqlAnalysis")
@Controller("sqlAnalysis")
export class SqlAnalysisController {
    constructor(private readonly sqlAnalysisService: SqlAnalysisService) { }

    @Get('/studentLevelTest')
    @ApiQuery({ name: "practice", required: true, type: String })
    getStudentLevelTest(@Headers('instancekey') instancekey: string, @Query('practice') practice: string) {
        return this.sqlAnalysisService.getStudentLevelTest({ instancekey, query: { practice } })
    }

    @Get('/subjectPerformersTest')
    @ApiQuery({ name: "practice", required: true, type: String })
    getSubjectPerformersTest(@Headers('instancekey') instancekey: string, @Query('practice') practice: string) {
        return this.sqlAnalysisService.getSubjectPerformersTest({ instancekey, query: { practice } })
    }

    @Get('/subjectNonPerformersTest')
    @ApiQuery({ name: "practice", required: true, type: String })
    getSubjectNonPerformersTest(@Headers('instancekey') instancekey: string, @Query('practice') practice: string) {
        return this.sqlAnalysisService.getSubjectNonPerformersTest({ instancekey, query: { practice } })
    }

    @Get('/poorTopicsTest')
    @ApiQuery({ name: "practice", required: true, type: String })
    getPoorTopicsTest(@Headers('instancekey') instancekey: string, @Query('practice') practice: string) {
        return this.sqlAnalysisService.getPoorTopicsTest({ instancekey, query: { practice } })
    }

    @Get('/absenteeListTest')
    getAbsenteeListTest(@Headers('instancekey') instancekey: string) {
        return this.sqlAnalysisService.getAbsenteeListTest({ instancekey })
    }

    @Get('/percentAbsentTest')
    getPercentAbsentTest(@Headers('instancekey') instancekey: string) {
        return this.sqlAnalysisService.getPercentAbsentTest({ instancekey })
    }

    @Get('/abandoned1stTest')
    @ApiQuery({ name: "practice", required: true, type: String })
    getAbandoned1stTest(@Headers('instancekey') instancekey: string, @Query('practice') practice: string) {
        return this.sqlAnalysisService.getAbandoned1stTest({ instancekey, query: { practice } })
    }

    @Get('/percentAbandonedTest')
    @ApiQuery({ name: "practice", required: true, type: String })
    getPercentAbandonedTest(@Headers('instancekey') instancekey: string, @Query('practice') practice: string) {
        return this.sqlAnalysisService.getPercentAbandonedTest({ instancekey, query: { practice } })
    }

    @Get('/studentLevelGrade')
    @ApiQuery({ name: "subject", required: true, type: String })
    getStudentLevelGrade(@Headers('instancekey') instancekey: string, @Query('subject') subject: string) {
        return this.sqlAnalysisService.getStudentLevelGrade({ instancekey, query: { subject } })
    }

    @Get('/subjectPerformersGrade')
    @ApiQuery({ name: "subject", required: true, type: String })
    getSubjectPerformersGrade(@Headers('instancekey') instancekey: string, @Query('subject') subject: string) {
        return this.sqlAnalysisService.getSubjectPerformersGrade({ instancekey, query: { subject } })
    }

    @Get('/subjectNonPerformersGrade')
    @ApiQuery({ name: "subject", required: true, type: String })
    getSubjectNonPerformersGrade(@Headers('instancekey') instancekey: string, @Query('subject') subject: string) {
        return this.sqlAnalysisService.getSubjectNonPerformersGrade({ instancekey, query: { subject } })
    }

    @Get('/poorTopicsGrade')
    @ApiQuery({ name: "subject", required: true, type: String })
    getPoorTopicsGrade(@Headers('instancekey') instancekey: string, @Query('subject') subject: string) {
        return this.sqlAnalysisService.getPoorTopicsGrade({ instancekey, query: { subject } })
    }

    @Get('/marksSummaryGrade')
    @ApiQuery({ name: "subject", required: true, type: String })
    getMarksSummaryGrade(@Headers('instancekey') instancekey: string, @Query('subject') subject: string) {
        return this.sqlAnalysisService.getMarksSummaryGrade({ instancekey, query: { subject } })
    }

    @Get('/studentLevelSummaryGrade')
    @ApiQuery({ name: "subject", required: true, type: String })
    getStudentLevelSummaryGrade(@Headers('instancekey') instancekey: string, @Query('subject') subject: string) {
        return this.sqlAnalysisService.getStudentLevelSummaryGrade({ instancekey, query: { subject } })
    }

    @Get('/studentByComplexityGrade')
    getStudentByComplexityGrade(@Headers('instancekey') instancekey: string) {
        return this.sqlAnalysisService.getStudentByComplexityGrade({ instancekey })
    }
}