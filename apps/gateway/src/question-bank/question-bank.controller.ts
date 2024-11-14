import {
  Body,
  Param,
  Controller,
  Get,
  Post,
  UseGuards,
  Put,
  Delete,
  Headers,
  Req,
  Query,
} from '@nestjs/common';


import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';

import { ApiHeader, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { QuestionBankService } from './question-bank.service';
import { ApproveStudentExplanationRequest, CountByPracticeRequest, CreateExplanationRequest, CreateQuestionRequest, CreateTestFormPoolRequest, ExecuteCodeBody, ExecuteCodeQuery, FeedbackQuestionRequest, GenerateRandomTestRequest, GetAllQuestionRequest, InternalSearchDto, QuestionComplexityByTopicRequest, QuestionDistributionRequest, UpdateQuestionRequest, UpdateTagsRequest } from '@app/common/dto/question-bank.dto';
import { ObjectIdPipe } from '@app/common';

@ApiTags('QuestionBank')
@Controller('question')
export class QuestionBankController {
  constructor(private questionBankService: QuestionBankService) { }

  // create question bank
  @Post()
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  createQuestion(@Headers('instancekey') instancekey: string, @Body() request: CreateQuestionRequest, @Req() req: any) {
    return this.questionBankService.createQuestion(instancekey, request, req.user);
  }

  // get all question
  @Get()
  getAllQuestion(@Headers('instancekey') instancekey: string, @Query() request: GetAllQuestionRequest) {
    return this.questionBankService.getAllQuestion({ ...request, instancekey });
  }

  // update question
  @Put('/:id')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  updateQuestion(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Body() request: UpdateQuestionRequest, @Req() req: any) {
    const userId = req.user._id;
    return this.questionBankService.updateQuestion(instancekey, id, request, userId)
  }

  // delete question
  @Delete('/:id')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['student', 'teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  deleteQuestion(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req: any) {
    const userRoles = req.user.roles;
    const userId = req.user._id;

    return this.questionBankService.deleteQuestion({ _id: id, instancekey, userId, userRoles })
  }

  // update question approve status
  @Put(':id/:status')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async updateStudentQuestion(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Param('status') status: string) {
    return this.questionBankService.updateStudentQuestion({ _id: id, instancekey, status: status })
  }

  /*
  ? * Check with the website-> functionality
  */
  // update question explanation
  @Post(':id/explanation')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async createExplanation(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Body() request: CreateExplanationRequest) {
    return this.questionBankService.createExplanation({ _id: id, instancekey, ...request })
  }

  /*
  TODO: Roles array must be updated
  ? User is taken as request, which I don't think is required
  * * '/test' is added in endpoint because it conflicts with updateStudentQuestion api ':id/:status' 
  */
  // approve explanation
  @Put(':id/test/explanations')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async approveStudentExplanation(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Body() request: ApproveStudentExplanationRequest) {
    return this.questionBankService.approveStudentExplanation({ _id: id, instancekey, ...request })
  }

  // question distribution by category
  @Get('/questionDistributionByCategory/:id')
  questionDistributionByCategory(@Headers('instancekey') instancekey: string, @Param('id') id: string) {
    return this.questionBankService.questionDistributionByCategory({ _id: id, instancekey });
  }

  // question distribution by marks
  @Get('/questionDistributionByMarks/:id')
  questionDistributionByMarks(@Headers('instancekey') instancekey: string, @Param('id') id: string) {
    return this.questionBankService.questionDistributionByMarks({ _id: id, instancekey });
  }

  /* 
  TODO: StringHelper
   */
  @Get('/practiceSummaryBySubject/:practice')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  practiceSummaryBySubject(@Headers('instancekey') instancekey: string, @Param('practice') practice: string) {
    return this.questionBankService.practiceSummaryBySubject({ practice: practice, instancekey })
  }

  // get quetions by practiceSet id
  @Get('/getByPractice/:practiceId')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async getByPractice(@Headers('instancekey') instancekey: string, @Param('practiceId', ObjectIdPipe) practiceId: string) {
    return this.questionBankService.getByPractice({ practiceId: practiceId, instancekey })
  }

  // question used count
  @Get('/questions/tests_count')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['teacher', 'admin', 'operator', 'publisher', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async questionUsedCount(@Headers('instancekey') instancekey: string,) {
    return this.questionBankService.questionUsedCount({ instancekey })
  }

  @Get('/questionIsAttempt/:id')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async questionIsAttempt(@Headers('instancekey') instancekey: string, @Param('id') id: string) {
    return this.questionBankService.questionIsAttempt(instancekey, id)
  }

  @Get('/:id/performance')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async questionPerformance(@Headers('instancekey') instancekey: string, @Param('id') id: string) {
    return this.questionBankService.questionPerformance(instancekey, id);
  }

  // get last question
  @Get('/last')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['student', 'teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async getLast(@Headers('instancekey') instancekey: string, @Req() req: any) {
    return this.questionBankService.getLast(instancekey, req.user._id);
  }

  // get last question in practice set
  @Get('/last/:practice')
  @ApiQuery({ name: 'preDate', required: false })
  @ApiHeader({ name: 'authtoken' })
  @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async getLastInPractice(@Headers('instancekey') instancekey: string,
    @Param('practice') practice: string,
    @Query('preDate') preDate?: Date,) {
    return this.questionBankService.getLastInPractice(instancekey, practice, preDate);
  }

  // serach 
  @Post('/search')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async search(@Headers('instancekey') instancekey: string,
    @Body() params: InternalSearchDto, @Req() req: any) {

    return this.questionBankService.search(instancekey, params, req.user);
  }

  @Get('/countByPractice/:practiceId')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async countByPractice(@Headers('instancekey') instancekey: string, @Param('practiceId', ObjectIdPipe) practiceId: string, @Query() params: CountByPracticeRequest) {
    return this.questionBankService.countByPractice(instancekey, practiceId, params);
  }

  @Get('/questionTags')
  async getQuestionTags(@Headers('instancekey') instancekey: string) {
    return this.questionBankService.getQuestionTags({ instancekey })
  }

  @Post('/tags')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async updateTags(@Headers('instancekey') instancekey: string, @Body() request: UpdateTagsRequest, @Req() req: any) {
    const userId = req.user._id;
    return this.questionBankService.updateTags(instancekey, request, userId)
  }

  @Get('/questionSummaryTopic/:id')
  @ApiParam({ name: 'id', description: 'unit id' })
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async questionSummaryTopic(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Query('isAllowReuse') isAllowReuse: string, @Req() req: any) {
    const userId = req.user._id;
    return this.questionBankService.questionSummaryTopic(instancekey, id, isAllowReuse, userId)
  }

  // get online test questin with encryption
  @Get('/:id/onlineTest')
  @ApiParam({ name: 'id', description: 'question id' })
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async getQuestionForOnlineTest(@Headers('instancekey') instancekey: string, @Param('id') id: string) {
    return this.questionBankService.getQuestionForOnlineTest(instancekey, id)
  }

  @Get('/:id/personalTopicAnalysis')
  @ApiParam({ name: 'id', description: 'question id' })
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async personalTopicAnalysis(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req: any) {
    const userId = req.user._id;
    return this.questionBankService.personalTopicAnalysis(instancekey, id, userId)
  }

  @Get('/summaryTopicOfPracticeBySubject/:practiceIds')
  @ApiParam({ name: 'practiceIds', description: 'comma seperated practice ids' })
  @ApiQuery({ name: 'unit', description: 'Unit id' })
  async summaryTopicOfPracticeBySubject(@Headers('instancekey') instancekey: string, @Param('practiceIds') practiceIds: string, @Query('unit') unit: string) {
    return this.questionBankService.summaryTopicOfPracticeBySubject(instancekey, practiceIds, unit)
  }

  @Get('/summaryTopicPractice/:practice')
  @ApiQuery({ name: 'unit', description: 'Unit id' })
  async summaryTopicPractice(@Headers('instancekey') instancekey: string, @Param('practice') practice: string, @Query('unit') unit: string) {
    return this.questionBankService.summaryTopicPractice(instancekey, practice, unit)
  }

  @Get('/summarySubjectPractice/:practice')
  async summarySubjectPractice(@Headers('instancekey') instancekey: string, @Param('practice') practice: string) {
    return this.questionBankService.summarySubjectPractice(instancekey, practice)
  }


  @Get('/testSeriesSummaryBySubject')
  async testSeriesSummaryBySubject(@Headers('instancekey') instancekey: string, @Query('practice') practice: string) {
    return this.questionBankService.testSeriesSummaryBySubject(instancekey, practice)
  }

  // get all attempted question of practice set
  @Get('/byAttempt/:attempt')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async getByAttempt(@Headers('instancekey') instancekey: string, @Param('attempt') attempt: string, @Req() req: any) {
    const userRoles = req.user.roles;
    return this.questionBankService.getByAttempt({ instancekey, attempt, userRoles })
  }

  // how many times a particular question used in practice set
  @Get('/:id/reusedCount')
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiQuery({ name: 'notAllowDelete', required: false })
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async getReusedCount(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Query('notAllowDelete') notAllowDelete?: boolean) {
    return this.questionBankService.getReusedCount({ instancekey, id, notAllowDelete })
  }

  // get feedback of questions in a practice_set with question details
  @Get('/feedbackQuestion/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  async feedbackQuestion(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Query() query: FeedbackQuestionRequest) {
    return this.questionBankService.feedbackQuestion({ instancekey, id, ...query })
  }

  // how much practice question got feedback
  @Get('/feedbackQuestionCount/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  async feedbackQuestionCount(@Headers('instancekey') instancekey: string, @Param('id') id: string) {
    return this.questionBankService.feedbackQuestionCount({ instancekey, id })
  }

  @Get('/questionDistribution')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async questionDistribution(@Headers('instancekey') instancekey: string, @Query() query: QuestionDistributionRequest, @Req() req: any) {
    const user = req.user;
    return this.questionBankService.questionDistribution({ instancekey, ...query, user })
  }

  @Get('/questionComplexityByTopic')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async questionComplexityByTopic(@Headers('instancekey') instancekey: string, @Query() query: QuestionComplexityByTopicRequest, @Req() req: any) {
    const user = req.user;
    return this.questionBankService.questionComplexityByTopic({ instancekey, ...query, user })
  }

  /* 
  * * examSchedule collection doesn't exist in db's but used
  */
  @Post('/generateRandomTest')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async generateRandomTest(@Headers('instancekey') instancekey: string, @Body() body: GenerateRandomTestRequest, @Req() req: any) {
    const user = req.user;
    return this.questionBankService.generateRandomTest({ instancekey, ...body, user })
  }

  /* 
   * * error: a variable(todaySchedule) used without declaration in old code
  */
  @Get('/getRandomQuestions/:id')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async getRandomQuestions(@Headers('instancekey') instancekey: string, @Param('id') id: string) {
    return this.questionBankService.getRandomQuestions({ instancekey, id })
  }

  /* 
   * * error: a variable(sort) used without declaration in old code
  */
  @Post('/createTestFormPool')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async createTestFormPool(@Headers('instancekey') instancekey: string, @Body() body: CreateTestFormPoolRequest, @Req() req: any) {
    const user = req.user;
    return this.questionBankService.createTestFormPool({ instancekey, ...body, user })
  }
  
  @Post('/executeCode')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async executeCode(@Headers('instancekey') instancekey: string, @Body() body: ExecuteCodeBody, @Query() query: ExecuteCodeQuery, @Req() req: any) {
    return this.questionBankService.executeCode({ instancekey, query, body, user: req.user })
  }

  // get question by-> id
  @Get('/:id/show')
  @ApiQuery({ name: 'relatedTopic', required: false })
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getQuestion(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Query('relatedTopic') relatedTopic?: boolean) {
    return this.questionBankService.getQuestion(instancekey, id, relatedTopic);
  }
}
