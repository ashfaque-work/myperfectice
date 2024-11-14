import { Body, Controller, Delete, Get, Headers, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { StudentService } from "./student.service";
import { AuthenticationGuard, RolesGuard } from "@app/common/auth";
import { Roles } from "@app/common/decorators";
import { AddMentorReq, GetAttemptsQuery, SummaryAttemptedPracticeQuery } from "@app/common/dto/student.dto";
import { AttemptService } from "../attempt.service";
import { GetAccuracyPercentileRequest, GetListSubjectsMeRequest, GetListTopicsMeRequest } from "@app/common/dto/attempt.dto";
import { FindAllQuery } from "@app/common/dto/assessment.dto";

@ApiTags("Student")
@Controller("student")
export class StudentController {
    constructor(private readonly studentService: StudentService, private attemptService: AttemptService) { }

    @Get('/recommendedTests')
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "page", required: false })
    @ApiQuery({ name: "limit", required: false })
    @ApiQuery({ name: "recommended", required: false })
    @ApiQuery({ name: "sort", required: false })
    @ApiQuery({ name: "home", required: false })
    @ApiQuery({ name: "testOnly", required: false })
    getRecommendedTests(@Headers('instancekey') instancekey: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('recommended') recommended: string,
        @Query('sort') sort: string,
        @Query('home') home: boolean,
        @Query('testOnly') testOnly: boolean,
        @Req() req
    ) {
        return this.studentService.getRecommendedTests({ instancekey, query: { page, limit, recommended, sort, home, testOnly }, user: req.user })
    }

    @Get('/takeTestsAgain')
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "page", required: false })
    @ApiQuery({ name: "limit", required: false })
    @ApiQuery({ name: "recommended", required: false })
    @ApiQuery({ name: "sort", required: false })
    @ApiQuery({ name: "home", required: false })
    @ApiQuery({ name: "testOnly", required: false })
    getTakeTestsAgain(@Headers('instancekey') instancekey: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('recommended') recommended: string,
        @Query('sort') sort: string,
        @Query('home') home: boolean,
        @Query('testOnly') testOnly: boolean,
        @Req() req
    ) {
        return this.studentService.getTakeTestsAgain({ instancekey, query: { page, limit, recommended, sort, home, testOnly }, user: req.user })
    }

    @Get('/recommendedVideos')
    @ApiQuery({ name: "topics", required: true, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getRecommendedVideos(@Headers('instancekey') instancekey: string, @Query('topics') topics: string) {
        return this.studentService.getRecommendedVideos({ instancekey, query: { topics } })
    }

    @Get('/attemptSummary')
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: "sort", required: false, type: String })
    @ApiQuery({ name: "lastDay", required: false })
    @ApiQuery({ name: "onlyDay", required: false })
    @ApiQuery({ name: "keyword", required: false })
    @ApiQuery({ name: "publisher", required: false })
    @ApiQuery({ name: "subjects", required: false })
    @ApiQuery({ name: "unit", required: false })
    @ApiQuery({ name: "practice", required: false })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getAttemptSummary(
        @Headers('instancekey') instancekey: string, @Req() req,
        @Query("page") page: number, @Query("limit") limit: number,
        @Query("sort") sort: string, @Query("lastDay") lastDay: string,
        @Query("onlyDay") onlyDay: string, @Query("publisher") publisher: string,
        @Query("keyword") keyword: string, @Query("unit") unit: string,
        @Query("practice") practice: string

    ) {
        return this.studentService.getAttemptSummary(
            { instancekey, user: req.user, query: { page, limit, sort, lastDay, onlyDay, publisher, keyword, unit, practice } }
        )
    }

    @Get('/attemptSubjects')
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getAttemptSubjects(@Headers('instancekey') instancekey: string, @Query() query: GetListSubjectsMeRequest, @Req() req) {
        return this.attemptService.getListSubjectsMe({ instancekey, ...query, userId: req.user._id, userSubjects: req.user.subjects })
    }

    @Get("/attemptTopics")
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    getAttemptTopics(@Headers('instancekey') instancekey: string, @Req() req, @Query() query: GetListTopicsMeRequest) {
        return this.attemptService.getListTopicsMe({ instancekey, userId: req.user._id, ...query })
    }

    @Get('/textualAnalysis')
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "lastDay", required: false })
    @ApiQuery({ name: "subjects", required: false })
    @ApiQuery({ name: "user", required: false })
    @ApiQuery({ name: "limit", required: false })
    getTextualAnalysis(@Headers("instancekey") instancekey: string,
        @Query("lastDay") lastDay: string,
        @Query("subjects") subjects: string,
        @Query("user") user: string,
        @Query("limit") limit: number,
        @Req() req) {
        return this.studentService.getTextualAnalysis({
            instancekey, query: {
                lastDay, subjects,
                user, limit
            }, user: req.user
        })
    }

    @Get('/summaryByNumber')
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "studentId", required: false })
    @ApiQuery({ name: "limit", required: false })
    @ApiQuery({ name: "lastDay", required: false })
    @ApiQuery({ name: "subjects", required: false })
    getSummaryByNumber(@Headers('instancekey') instancekey: string,
        @Query('studentId') studentId: string,
        @Query('limit') limit: string,
        @Query('lastDay') lastDay: string,
        @Query('subjects') subjects: string,
        @Req() req) {
        return this.studentService.getSummaryByNumber({
            instancekey, query: {
                studentId, limit, lastDay, subjects,
            }, user: req.user
        })
    }

    @Get('/topperSummaryByNumber')
    @ApiQuery({ name: 'lastDay', required: false })
    @ApiQuery({ name: 'subjects', required: false })
    @ApiQuery({ name: 'studentId', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getTopperSummaryByNumber(
        @Headers('instancekey') instancekey: string, @Req() req, @Query('lastDay') lastDay: string,
        @Query('subjects') subjects: string, @Query('studentId') studentId: string, @Query('limit') limit: string
    ) {
        return this.studentService.getTopperSummaryByNumber({
            instancekey, query: { lastDay, subjects, studentId, limit }, user: req.user
        })
    }

    @Get('/getAverageTimeOnPlatform')
    @ApiQuery({ name: "studentId", required: false })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getAverageTimeOnPlatform(@Headers('instancekey') instancekey: string,
        @Query("studentId") studentId: string, @Req() req) {
        return this.studentService.getAverageTimeOnPlatform({
            instancekey, query: { studentId }, user: req.user
        })
    }

    @Get('/getEffortTrendAttemptCount')
    @ApiQuery({ name: "studentId", required: false })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getEffortTrendAttemptCount(@Headers('instancekey') instancekey: string, @Query("studentId") studentId: string, @Req() req) {
        return this.studentService.getEffortTrendAttemptCount({
            instancekey, query: { studentId, }, user: req.user
        })
    }

    @Get("/getLearningEffortDistribution")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "studentId", required: false })
    @ApiQuery({ name: "limit", required: false })
    getLearningEffortDistribution(@Headers('instancekey') instancekey: string,
        @Query("studentId") studentId: string,
        @Query("limit") limit: number,
        @Req() req) {
        return this.studentService.getLearningEffortDistribution({ instancekey, query: { studentId, limit }, user: req.user })
    }

    @Get("/getSubjectQuestionComplexity")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "studentId", required: false })
    getSubjectQuestionComplexity(@Headers("instancekey") instancekey: string, @Query("studentId") studentId: string, @Req() req) {
        return this.studentService.getSubjectQuestionComplexity({
            instancekey, query: { studentId }, user: req.user
        })
    }

    @Get("/questionCategoryDistribution")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "studentId", required: false })
    questionCategoryDistribution(@Headers("instancekey") instancekey: string, @Query("studentId") studentId: string,
        @Req() req) {
        return this.studentService.questionCategoryDistribution({ instancekey, query: { studentId }, user: req.user })
    }

    @Get("/getGroupParticipation")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "limit", required: false })
    @ApiQuery({ name: "studentId", required: false })
    getGroupParticipation(@Headers("instancekey") instancekey: string, @Query("limit") limit: number, @Query("studentId") studentId: string, @Req() req) {
        return this.studentService.getGroupParticipation({ instancekey, query: { limit, studentId }, user: req.user })
    }

    @Get("/getPersistanceData")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "studentId", required: false })
    getPersistanceData(@Headers("instancekey") instancekey: string, @Query("studentId") studentId: string, @Req() req) {
        return this.studentService.getPersistanceData({ instancekey, query: { studentId }, user: req.user })
    }

    @Get("/getEffortTrendAttemptTotalTime")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "studentId", required: false })
    getEffortTrendAttemptTotalTime(@Headers("instancekey") instancekey: string, @Query("studentId") studentId: string, @Req() req) {
        return this.studentService.getEffortTrendAttemptTotalTime({ instancekey, query: { studentId }, user: req.user })
    }

    @Get("/getEffortTrendCourseTimeSpent")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "studentId", required: false })
    getEffortTrendCourseTimeSpent(@Headers("instancekey") instancekey: string, @Query("studentId") studentId: string, @Req() req) {
        return this.studentService.getEffortTrendCourseTimeSpent({ instancekey, query: { studentId }, user: req.user })
    }

    @Get("/getUniqueQuestionsCount")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "studentId", required: false })
    @ApiQuery({ name: "limit", required: false })
    getUniqueQuestionsCount(@Headers("instancekey") instancekey: string, @Query("studentId") studentId: string, @Query("limit") limit: number, @Req() req) {
        return this.studentService.getUniqueQuestionsCount({ instancekey, query: { studentId, limit }, user: req.user })
    }

    @Get("/accuracyAndSpeed")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "user", required: false })
    @ApiQuery({ name: "subjects", required: false })
    getAccuracyAndSpeed(@Headers("instancekey") instancekey: string, @Query("user") user: string, @Query("subjects") subjects: string, @Req() req) {
        return this.studentService.getAccuracyAndSpeed({ instancekey, query: { user, subjects }, user: req.user })
    }

    @Get("/accuracyAndSpeedByTopic")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "user", required: false })
    @ApiQuery({ name: "subjects", required: false })
    getAccuracyAndSpeedByTopic(@Headers("instancekey") instancekey: string, @Query("user") user: string, @Query("subjects") subjects: string, @Req() req) {
        return this.studentService.getAccuracyAndSpeedByTopic({ instancekey, query: { user, subjects }, user: req.user })
    }

    @Get("/summaryAttemptedPractice/:id")
    @ApiParam({ name: "id", description: "practiceSetId" })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    summaryAttemptedPractice(@Headers("instancekey") instancekey: string,
        @Param("id") practicesetId: string,
        @Query() query: SummaryAttemptedPracticeQuery,
        @Req() req) {
        return this.studentService.summaryAttemptedPractice({
            instancekey, practicesetId, query, user: req.user
        })
    }

    @Get("/summaryAttemptedTestSeries/:id")
    @ApiQuery({ name: "topPerformers", required: false, type: Boolean })
    @ApiQuery({ name: "classroom", required: false, type: String })
    @ApiQuery({ name: "searchText", required: false, type: String })
    @ApiQuery({ name: "sort", required: false, type: String })
    @ApiQuery({ name: "page", required: false, type: Number })
    @ApiQuery({ name: "limit", required: false, type: Number })
    @ApiQuery({ name: "includeCount", required: false, type: Boolean })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    summaryAttemptedTestSeries(
        @Param("id") id: string, @Headers("instancekey") instancekey: string,
        @Query("topPerformers") topPerformers: string, @Query("classroom") classroom: string,
        @Query("searchText") searchText: string, @Query("sort") sort: string,
        @Query("page") page: number, @Query("limit") limit: number,
        @Query("includeCount") includeCount: string, @Req() req
    ) {
        return this.studentService.summaryAttemptedTestSeries({
            _id: id, instancekey, user: req.user,
            query: {
                classroom, searchText, sort, page, limit,
                topPerformers: topPerformers === 'true',
                includeCount: includeCount === 'true',
            }
        })
    }

    @Get("/summaryPsychoPractice/:id")
    @ApiHeader({ name: "authtoken", required: false })
    @ApiQuery({ name: "classroom", required: false })
    @ApiQuery({ name: "searchText", required: false })
    @ApiQuery({ name: "page", required: false })
    @ApiQuery({ name: "limit", required: false })
    @ApiQuery({ name: "includeCount", required: false })
    @ApiParam({ name: "id", description: "practiceSetId" })
    summaryPsychoPractice(@Headers("instancekey") instancekey: string,
        @Param('id') practicesetId: string,
        @Query("classroom") classroom: string,
        @Query("searchText") searchText: string,
        @Query("page") page: number,
        @Query("limit") limit: number,
        @Query("includeCount") includeCount: boolean, @Req() req) {
        return this.studentService.summaryPsychoPractice({ instancekey, practicesetId, query: { classroom, searchText, page, limit, includeCount }, user: req.user })
    }

    @Get("/summaryOnePracticeSet/:id")
    @ApiQuery({ name: "lastDay", required: false })
    @ApiQuery({ name: "lastMonth", required: false })
    @ApiParam({ name: "id", description: "practiceSetId" })
    @ApiHeader({ name: "authtoken", required: true })
    @Roles(['teacher', 'publisher', 'support', 'admin', 'operator', 'centerHead', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    summaryOnePractice(@Headers("instancekey") instancekey: string, @Param("id") practicesetId: string, @Query("lastDay") lastDay: string, @Query("lastMonth") lastMonth: string) {
        return this.studentService.summaryOnePracticeSet({ instancekey, query: { lastDay, lastMonth }, practicesetId })
    }

    @Get("/getResultPractice/:id")
    @ApiParam({ name: "id", description: "practiceSetId" })
    @ApiQuery({ name: "attemptId", required: false })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getResultPractice(@Headers("instancekey") instancekey: string, @Query("attemptId") attemptId: string, @Param("id") practicesetId: string) {
        return this.studentService.getResultPractice({ instancekey, query: { attemptId }, practicesetId })
    }

    @Get("/tests")
    @ApiHeader({ required: true, name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    getAvailableTests(@Headers('instancekey') instancekey: string, @Query() query: FindAllQuery, @Req() req: any) {
        return this.studentService.getAvailableTests({ instancekey, query, user: req.user })
    }

    @Get("/attempts")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getAttempts(@Headers("instancekey") instancekey: string,
        @Query() query: GetAttemptsQuery,
        @Req() req) {
        return this.studentService.getAttempts({ instancekey, query, user: req.user });
    }

    @Get("/countAttempts")
    @ApiQuery({ name: "lastDay", required: false })
    @ApiQuery({ name: "onlyDay", required: false })
    @ApiQuery({ name: "keyword", required: false })
    @ApiQuery({ name: "publisher", required: false })
    @ApiQuery({ name: "subjects", required: false })
    @ApiQuery({ name: "unit", required: false })
    @ApiQuery({ name: "practice", required: false })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    countAttempts(@Headers("instancekey") instancekey: string,
        @Query("lastDay") lastDay: string,
        @Query("onlyDay") onlyDay: string,
        @Query("keyword") keyword: string,
        @Query("subjects") subjects: string,
        @Query("unit") unit: string,
        @Query("practice") practice: string,
        @Req() req
    ) {
        return this.studentService.countAttempts({ instancekey, query: { lastDay, onlyDay, keyword, subjects, unit, practice }, user: req.user })
    }

    @Get("/attempts/:id/summary")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getAttempt(@Headers("instancekey") instancekey: string, @Param("id") attemptId: string, @Req() req) {
        return this.studentService.getAttempt({ instancekey, attemptId, user: req.user })
    }

    @Get("/awsFaceRegSignedUrl/:attemptId")
    @ApiQuery({ name: "fileName", required: false })
    @ApiQuery({ name: "baseImage", required: false })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getAwsFaceRegSignedUrl(@Headers("instancekey") instancekey: string, @Param("attemptId") attemptId: string, @Query("fileName") fileName: string, @Query("baseImage") baseImage: string, @Req() req) {
        return this.studentService.getAwsFaceRegSignedUrl({ instancekey, attemptId, query: { fileName, baseImage }, user: req.user })
    }

    @Get("/userAssetsSignedUrl/:attemptId")
    @ApiQuery({ name: "fileName", required: false })
    @ApiParam({ name: "attemptId", description: "attemptId" })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getUserAssetsSignedUrl(@Headers("instancekey") instancekey: string, @Param("attemptId") attemptId: string, @Query("fileName") fileName: string) {
        return this.studentService.getUserAssetsSignedUrl({ instancekey, query: { fileName }, attemptId })
    }

    @Get("/recordingsSignedUrl/:attemptId")
    @ApiHeader({ name: "auth_token" })
    @ApiQuery({ name: "fileName", required: false })
    @ApiParam({ name: "attemptId", description: "attemptId" })
    getRecordingsSignedUrl(@Headers("instancekey") instanceKey: string, @Param("attemptId") attemptId: string, @Query("fileName") fileName: string) {
        return this.studentService.getRecordingsSignedUrl({ instanceKey, query: { fileName }, attemptId })
    }

    @Get("/getQrUploadSignedUrl/:attemptId")
    @ApiHeader({ name: "auth_token" })
    @ApiQuery({ name: "fileName", required: false })
    @ApiParam({ name: "attemptId", description: "attemptId" })
    getQrUploadSignedUrl(@Headers("instancekey") instanceKey: string, @Param("attemptId") attemptId: string, @Query("fileName") fileName: string) {
        return this.studentService.getQrUploadSignedUrl({ instanceKey, query: { fileName }, attemptId })
    }

    @Get("/bestAttempt/:id/summary")
    @ApiParam({ name: "id", description: "practicesetId" })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getBestAttempt(@Headers("instancekey") instancekey: string, @Param("id") practicesetId: string, @Req() req) {
        return this.studentService.getBestAttempt({ instancekey, practicesetId, user: req.user })
    }

    @Get("/averageAttempt/:id/summary")
    @ApiParam({ name: "id", description: "practicesetId" })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getAverageAttempt(@Headers("instancekey") instancekey: string, @Param("id") practicesetId: string) {
        return this.studentService.getAverageAttempt({ instancekey, practicesetId })
    }

    @Get("/getSubjectWiseSpeedAndAccuracy")
    @ApiHeader({ name: "authtoken", required: true })
    @Roles(["student"])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getSubjectWiseSpeedAndAccuracy(@Headers("instancekey") instancekey: string, @Req() req) {
        return this.studentService.getSubjectWiseSpeedAndAccuracy({ instancekey, user: req.user })
    }

    @Get("/getTotalQuestionSolved")
    @ApiQuery({ name: "lastDay", required: false })
    @ApiQuery({ name: "user", required: false })
    @ApiQuery({ name: "subjects", required: false })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getTotalQuestionSolved(@Headers("instancekey") instancekey: string,
        @Query("lastDay") lastDay: string,
        @Query("user") user: string,
        @Query("subjects") subjects: string, @Req() req) {
        return this.studentService.getTotalQuestionSolved({
            instancekey, query: {
                lastDay, user, subjects
            }, user: req.user
        })
    }

    @Get("/attempts/:attempt/percentile")
    @ApiQuery({ name: "subject", required: false })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getAccuracyPercentile(@Headers('instancekey') instancekey: string, @Param('attempt') attemptId: string, @Query() query: GetAccuracyPercentileRequest) {
        return this.attemptService.getAccuracyPercentile({ instancekey, ...query, attemptId });
    }

    @Get("/countAttempts/:user")
    @ApiHeader({ name: "authtoken", required: true })
    @Roles(['teacher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiQuery({ name: "page", required: false })
    @ApiQuery({ name: "limit", required: false })
    @ApiQuery({ name: "lastDay", required: false })
    @ApiQuery({ name: "onlyDay", required: false })
    @ApiQuery({ name: "keyword", required: false })
    @ApiQuery({ name: "publisher", required: false })
    @ApiQuery({ name: "subjects", required: false })
    @ApiQuery({ name: "unit", required: false })
    @ApiQuery({ name: "practice", required: false })
    countStudentAttempts(@Headers("instancekey") instancekey: string,
        @Param("user") userId: string, @Query("page") page: number,
        @Query("limit") limit: number,
        @Query("lastDay") lastDay: string,
        @Query("onlyDay") onlyDay: string,
        @Query("publisher") publisher: string,
        @Query("keyword") keyword: string,
        @Query("unit") unit: string,
        @Query("practice") practice: string, @Req() req
    ) {
        return this.studentService.countStudentAttempts({
            instancekey, userId, query: {
                page, limit, lastDay, onlyDay, publisher, keyword, unit, practice
            }, user: req.User
        })
    }

    @Get("/attempts/:student/:attempt/summary")
    @ApiHeader({ name: "authtoken", required: true })
    @Roles(["teacher"])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getStudentAttempt(
        @Param("attempt") attempt: string, @Param("student") student: string,
        @Headers("instancekey") instancekey: string, @Req() req,
    ) {
        return this.studentService.getStudentAttempt({ instancekey, attemptId: attempt, studentId: student, user: req.user })
    }

    @Get("/attempts/:user")
    @ApiQuery({ name: "page", required: false })
    @ApiQuery({ name: "limit", required: false })
    @ApiQuery({ name: "lastDay", required: false })
    @ApiQuery({ name: "onlyDay", required: false })
    @ApiQuery({ name: "keyword", required: false })
    @ApiQuery({ name: "publisher", required: false })
    @ApiQuery({ name: "subjects", required: false })
    @ApiQuery({ name: "unit", required: false })
    @ApiQuery({ name: "practice", required: false })
    @ApiHeader({ name: "authtoken", required: true })
    @Roles(['teacher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getStudentAttempts(@Headers("instancekey") instancekey: string,
        @Param("user") userId: string, @Query("page") page: number,
        @Query("limit") limit: number,
        @Query("lastDay") lastDay: string,
        @Query("onlyDay") onlyDay: string,
        @Query("publisher") publisher: string,
        @Query("keyword") keyword: string,
        @Query("unit") unit: string,
        @Query("practice") practice: string, @Req() req
    ) {
        return this.studentService.getStudentAttempts({
            instancekey, userId, query: {
                page, limit, lastDay, onlyDay, publisher, keyword, unit, practice
            }, user: req.User
        })
    }

    @Get("/lastAttempt")
    @ApiQuery({ name: "practice", required: false })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getLastAttempt(@Headers("instancekey") instancekey: string, @Query("practice") practice: string, @Req() req) {
        return this.studentService.getLastAttempt(
            { instancekey, query: { practice }, user: req.user }
        )
    }

    @Get("/lastAttempt/:studentId")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: "isMentee", required: false })
    getLastStudentAttempt(@Headers("instancekey") instancekey: string, @Param("studentId") studentId: string, @Query("isMentee") isMentee: boolean, @Req() req) {
        return this.studentService.getLastStudentAttempt(
            { instancekey, studentId, query: { isMentee }, user: req.user }
        )
    }

    @Get("/joinAttempt/:id/summary")
    @ApiHeader({ name: "authtoken", required: true })
    @Roles(['teacher', 'operator', 'mentor', 'support', 'admin', 'centerHead', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getJoinAttempt(@Headers("instancekey") instancekey: string, @Param("id") attemptId: string, @Req() req) {
        return this.studentService.getAttempt({ instancekey, attemptId, user: req.user })
    }

    @Get("/shareAttempt/:id/summary")
    getShareAttempt(@Headers("instancekey") instancekey: string, @Param("id") attemptId: string, @Req() req) {
        return this.studentService.getAttempt({ instancekey, attemptId, user: req.user })
    }

    @Get("/classrooms")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getClassrooms(@Headers("instancekey") instancekey: string, @Req() req) {
        return this.studentService.getClassrooms({ instancekey, user: req.user })
    }

    @Get("/mentors")
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: "sort", required: false, type: String })
    @ApiQuery({ name: "keyword", required: false, type: String })
    @ApiQuery({ name: "myMentor", required: false, type: Boolean })
    @ApiQuery({ name: "pendingRequest", required: false, type: Boolean })
    @ApiQuery({ name: 'checkSession', required: false, type: Boolean })
    @ApiQuery({ name: 'chatSupport', required: false, type: Boolean })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getMentors(
        @Headers("instancekey") instancekey: string, @Req() req,
        @Query("page") page: number,
        @Query("limit") limit: number,
        @Query("sort") sort: string,
        @Query("keyword") keyword: string,
        @Query("myMentor") myMentor: string,
        @Query("pendingRequest") pendingRequest: string,
        @Query('checkSession') checkSession: string,
        @Query('chatSupport') chatSupport: string
    ) {
        return this.studentService.getMentors({
            instancekey, user: req.user, token: req.headers['authtoken'],
            query: {
                page, limit, sort, keyword,
                myMentor: myMentor === 'true',
                pendingRequest: pendingRequest === 'true',
                checkSession: checkSession === 'true',
                chatSupport: chatSupport === 'true'
            }
        })
    }

    @Get("/mentors/findOne")
    @ApiQuery({ name: "mentorId", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    findOneMentor(@Headers("instancekey") instancekey: string, @Req() req, @Query('mentorId') mentorId: string) {
        return this.studentService.findOneMentor({ instancekey, user: req.user, query: { mentorId } })
    }

    @Get("/sendInvitation/:userId")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    sendInvitation(@Param("userId") userId: string, @Headers("instancekey") instancekey: string, @Req() req) {
        return this.studentService.sendInvitation({ instancekey, userId, user: req.user })
    }

    @Get("/exportProfile/:id")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    exportProfile(@Param("id") id: string, @Headers("instancekey") instancekey: string) {
        return this.studentService.exportProfile({ instancekey, _id: id })
    }

    @Get("/satScore/:attemptId")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getSatScore(@Param("attemptId") attemptId: string, @Headers("instancekey") instancekey: string) {
        return this.studentService.getSatScore({ instancekey, _id: attemptId })
    }

    @Get("/subjectwiseRanking/:subjectId")
    @ApiQuery({ name: "user", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getSubjectwiseRanking(
        @Param("subjectId") subjectId: string, @Req() req,
        @Headers("instancekey") instancekey: string, @Query("user") user: string
    ) {
        return this.studentService.getSubjectwiseRanking({ instancekey, user: req.user, subjectId, query: { user } })
    }

    @Get("/markRanking")
    @ApiQuery({ name: "user", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getMarkRanking(@Headers("instancekey") instancekey: string, @Query("user") user: string, @Req() req) {
        return this.studentService.getMarkRanking({ instancekey, user: req.user, query: { user } })
    }

    @Post("/mentors/add")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    addMentor(@Body() request: AddMentorReq, @Headers("instancekey") instancekey: string, @Req() req) {
        return this.studentService.addMentor({ ...request, instancekey, user: req.user })
    }

    @Delete("/mentors/:mentorId")
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    removeMentor(@Param("mentorId") mentorId: string, @Headers("instancekey") instancekey: string, @Req() req) {
        return this.studentService.removeMentor({ mentorId, instancekey, user: req.user, token: req.headers['authtoken'] })
    }


}