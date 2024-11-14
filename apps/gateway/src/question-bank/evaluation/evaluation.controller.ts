import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { ObjectIdPipe } from '@app/common';
import { AssignEvaluatorsBody, FindEvaluatorsQuery, GetAssignedTestsQuery, GetPendingTestsQuery, GetQuestionEvaluationsByTestQuery, GetQuestionsForEvaluationQuery, GetStudentsForEvaluationByTestQuery, GetTestEvaluationStatQuery, GetUnassignedTestsQuery, QuestionEvaluationBody, RemoveEvaluatorsBody, StartTestEvaluationQuery } from '@app/common/dto/question-bank.dto';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';

@ApiTags('Evaluation')
@Controller('evaluation')
export class EvaluationController {
    constructor(private readonly evaluationService: EvaluationService) { }

    @Get('/assignedTests')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getAssignedTests(@Headers('instancekey') instancekey: string, @Query() query: GetAssignedTestsQuery, @Req() req: any) {
        return this.evaluationService.getAssignedTests({ instancekey, query, user: req.user })
    }

    @Get('/unassignedTests')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getUnassignedTests(@Headers('instancekey') instancekey: string, @Query() query: GetUnassignedTestsQuery, @Req() req: any) {
        return this.evaluationService.getUnassignedTests({ instancekey, query, user: req.user })
    }

    @Get('/evaluators')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    findEvaluators(@Headers('instancekey') instancekey: string, @Query() query: FindEvaluatorsQuery, @Req() req: any) {
        return this.evaluationService.findEvaluators({ instancekey, query, user: req.user })
    }

    @Get('/questions')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'admin', 'operator', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getQuestionsForEvaluation(@Headers('instancekey') instancekey: string, @Query() query: GetQuestionsForEvaluationQuery, @Req() req: any) {
        return this.evaluationService.getQuestionsForEvaluation({ instancekey, query, user: req.user })
    }

    @Get('/pendingTests')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'admin', 'operator', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getPendingTests(@Headers('instancekey') instancekey: string, @Query() query: GetPendingTestsQuery, @Req() req: any) {
        return this.evaluationService.getPendingTests({ instancekey, query, user: req.user })
    }

    @Get('/questionsByTest/:testId')
    @ApiParam({ name: 'testId' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'admin', 'operator', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getQuestionEvaluationsByTest(@Headers('instancekey') instancekey: string, @Param('testId', ObjectIdPipe) testId: string, @Query() query: GetQuestionEvaluationsByTestQuery, @Req() req: any) {
        return this.evaluationService.getQuestionEvaluationsByTest({ instancekey, query, testId, user: req.user })
    }

    @Get('/studentsByTest/:testId')
    @ApiParam({ name: 'testId' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'admin', 'operator', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getStudentsForEvaluationByTest(@Headers('instancekey') instancekey: string, @Param('testId', ObjectIdPipe) testId: string, @Query() query: GetStudentsForEvaluationByTestQuery, @Req() req: any) {
        return this.evaluationService.getStudentsForEvaluationByTest({ instancekey, query, testId, user: req.user })
    }

    @Get('/startTestEvaluation/:testId')
    @ApiParam({ name: 'testId' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'admin', 'operator', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    startTestEvaluation(@Headers('instancekey') instancekey: string, @Param('testId', ObjectIdPipe) testId: string, @Query() query: StartTestEvaluationQuery, @Req() req: any) {
        return this.evaluationService.startTestEvaluation({ instancekey, query, testId, user: req.user })
    }

    @Get('/testEvaluationStats/:testId')
    @ApiParam({ name: 'testId' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'admin', 'operator', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getTestEvaluationStat(@Headers('instancekey') instancekey: string, @Param('testId', ObjectIdPipe) testId: string, @Query() query: GetTestEvaluationStatQuery, @Req() req: any) {
        return this.evaluationService.getTestEvaluationStat({ instancekey, query, testId, user: req.user })
    }

    @Post('/question/:id')
    @ApiParam({ name: 'id', description: 'Attempt ID' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'admin', 'operator', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    questionEvaluation(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Body() body: QuestionEvaluationBody) {
        return this.evaluationService.questionEvaluation({ instancekey, body, id })
    }

    @Post('/assignEvaluators/:testId')
    @ApiParam({ name: 'testId' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    assignEvaluators(@Headers('instancekey') instancekey: string, @Param('testId', ObjectIdPipe) testId: string, @Body() body: AssignEvaluatorsBody, @Req() req: any) {
        return this.evaluationService.assignEvaluators({ instancekey, body, testId, user: req.user })
    }

    @Post('/removeEvaluators/:testId')
    @ApiParam({ name: 'testId' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    removeEvaluators(@Headers('instancekey') instancekey: string, @Param('testId', ObjectIdPipe) testId: string, @Body() body: RemoveEvaluatorsBody, @Req() req: any) {
        return this.evaluationService.removeEvaluators({ instancekey, body, testId, user: req.user })
    }

}