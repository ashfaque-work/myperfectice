import { Controller, Get, Headers, Param, Query, Req, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AnalysisService } from "./analysis.service";
import { AuthenticationGuard, RolesGuard } from "@app/common/auth";
import { Roles } from "@app/common/decorators";

@ApiTags("Analysis")
@Controller("analysis")
export class AnalysisController {
    constructor(private readonly analysisService: AnalysisService) { }

    @Get('/getPeakTime')
    @ApiQuery({ name: "attemptId", required: true, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    peakTimeAndDuration(@Headers('instancekey') instancekey: string, @Query('attemptId') attemptId: string) {
        return this.analysisService.peakTimeAndDuration({ instancekey, query: { attemptId } })
    }

    @Get('/getAllFirstQuestionsDetail')
    @ApiQuery({ name: "user", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    allFirstQuestionsDetail(@Headers('instancekey') instancekey: string, @Query('user') user: string, @Req() req) {
        return this.analysisService.allFirstQuestionsDetail({ instancekey, query: { user }, user: req.user })
    }

    @Get('/getAveragePeakTime')
    @ApiQuery({ name: "user", required: false, type: String })
    @ApiQuery({ name: "subject", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    averagePeakTimeAndDuration(@Headers('instancekey') instancekey: string, @Query('user') user: string, @Query('subject') subject: string, @Req() req) {
        return this.analysisService.averagePeakTimeAndDuration({ instancekey, query: { user, subject }, user: req.user })
    }

    @Get('/getCountQuestionsExceedAvgTime')
    @ApiQuery({ name: "attemptId", required: true, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @Roles(['student'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    questionsExceedAvgTime(@Headers('instancekey') instancekey: string, @Query('attemptId') attemptId: string, @Req() req) {
        return this.analysisService.questionsExceedAvgTime({ instancekey, query: { attemptId }, user: req.user })
    }

    @Get('/getFirstQuestionAttempted')
    @ApiQuery({ name: "attemptId", required: true, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    firstQuestionDetail(@Headers('instancekey') instancekey: string, @Query('attemptId') attemptId: string, @Req() req) {
        return this.analysisService.firstQuestionDetail({ instancekey, query: { attemptId }, user: req.user })
    }

    @Get('/getQuestionsWithExceedTimeFlag')
    @ApiQuery({ name: "attemptId", required: true, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    questionsWithExceedTimeFlag(@Headers('instancekey') instancekey: string, @Query('attemptId') attemptId: string) {
        return this.analysisService.questionsWithExceedTimeFlag({ instancekey, query: { attemptId } })
    }

    @Get('/getTopicsUserExceedAvgTime')
    @ApiQuery({ name: "user", required: false, type: String })
    @ApiQuery({ name: "subject", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    topicsUserExceedAvgTime(@Headers('instancekey') instancekey: string, @Query('user') user: string, @Query('subject') subject: string, @Req() req) {
        return this.analysisService.topicsUserExceedAvgTime({ instancekey, query: { user, subject }, user: req.user })
    }

    @Get('/getUnitsUserExceedAvgTime')
    @ApiQuery({ name: "subject", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    unitUserExceedAvgTime(@Headers('instancekey') instancekey: string, @Query('subject') subject: string, @Req() req) {
        return this.analysisService.unitUserExceedAvgTime({ instancekey, query: { subject }, user: req.user })
    }

    @Get('/get-avoid-unit-details')
    @ApiQuery({ name: "subject", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    avoidUnitsOfUser(@Headers('instancekey') instancekey: string, @Query('subject') subject: string, @Req() req) {
        return this.analysisService.avoidUnitsOfUser({ instancekey, query: { subject }, user: req.user })
    }

    @Get('/getAvoidTopicsOfUser')
    @ApiQuery({ name: "user", required: false, type: String })
    @ApiQuery({ name: "subject", required: false, type: String })
    @ApiQuery({ name: "attemptId", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    avoidTopicsOfUser(
        @Headers('instancekey') instancekey: string, @Query('user') user: string,
        @Query('subject') subject: string, @Query('attemptId') attemptId: string, @Req() req
    ) {
        return this.analysisService.avoidTopicsOfUser({ instancekey, query: { user, subject, attemptId }, user: req.user })
    }

    @Get('/getMissedQuesAndPossibleMarks')
    @ApiQuery({ name: "attemptId", required: true, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    missedQuesAndPossibleMarks(@Headers('instancekey') instancekey: string, @Query('attemptId') attemptId: string, @Req() req) {
        return this.analysisService.missedQuesAndPossibleMarks({ instancekey, query: { attemptId }, user: req.user })
    }

    @Get('/timeWasted/:subjectId')
    @ApiQuery({ name: "user", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getTimeWasted(@Param("subjectId") subjectId: string, @Headers('instancekey') instancekey: string, @Query('user') user: string, @Req() req) {
        return this.analysisService.getTimeWasted({ subjectId, instancekey, query: { user }, user: req.user })
    }

    @Get('/strengthAndWeekness/:subjectId')
    @ApiQuery({ name: "user", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getStrengthAndWeekness(@Param("subjectId") subjectId: string, @Headers('instancekey') instancekey: string, @Query('user') user: string, @Req() req) {
        return this.analysisService.getStrengthAndWeekness({ subjectId, instancekey, query: { user }, user: req.user })
    }

    @Get('/topStrengthAndWeakness')
    @ApiQuery({ name: "user", required: false, type: String })
    @ApiQuery({ name: "weakness", required: false, type: Boolean })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getTopStrengthAndWeakness(@Headers('instancekey') instancekey: string, @Query('user') user: string, @Query('weakness') weakness: string, @Req() req) {
        return this.analysisService.getTopStrengthAndWeakness({ instancekey, query: { user, weakness: weakness === 'true' }, user: req.user })
    }

    @Get('/courseProgress')
    @ApiQuery({ name: "user", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getCourseProgress(@Headers('instancekey') instancekey: string, @Query('user') user: string, @Req() req) {
        return this.analysisService.getCourseProgress({ instancekey, query: { user }, user: req.user })
    }

    @Get('/testseriesProgress')
    @ApiQuery({ name: "user", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getTestseriesProgress(@Headers('instancekey') instancekey: string, @Query('user') user: string, @Req() req) {
        return this.analysisService.getTestseriesProgress({ instancekey, query: { user }, user: req.user })
    }

    @Get('/get-practice-effort')
    @ApiQuery({ name: "user", required: false, type: String })
    @ApiQuery({ name: "subject", required: false, type: String })
    @ApiHeader({ name: "authtoken", required: true })
    @UseGuards(AuthenticationGuard)
    getPracticeEffort(
        @Headers('instancekey') instancekey: string, @Req() req,
        @Query('user') user: string, @Query('subject') subject: string,
    ) {
        return this.analysisService.getPracticeEffort({ instancekey, query: { user, subject }, user: req.user })
    }

}