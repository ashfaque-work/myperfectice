import {
  Body,
  Param,
  Controller,
  Get,
  Post,
  UseGuards,
  Put,
  Delete,
  Query,
  Patch,
  Headers,
  Req,
  Ip,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import {
  ArchiveQuery,
  ChangeOwnershipRequest,
  CommonQuery,
  CompletedTestStudentsByClassQuery,
  CountByExamIdQuery,
  CountPracticeQuery,
  CreateAssessmentRequest,
  ExportPDFQuery,
  ExportTestQuery,
  FindAllQuery,
  FindByAttemptQuery,
  FindByExamIdQuery,
  FindForMentorQuery,
  FindForTeacherBody,
  FindOnePracticeQuery,
  FindOneWithQuestionsQuery,
  FindPracticeSetsRequest,
  FindTestBySessionRequest,
  GetAttendantsRequest,
  GetBuyModeTestForTeacherQuery,
  GetFeedbacksQuery,
  GetLastTestMeQuery,
  GetSessionTimesBody,
  GetStudentTakingTestQuery,
  ImportFileBody,
  ImportQuestionRequest,
  NewGameBody,
  PlayGameBody,
  PublisherAssessmentRequest,
  RecentTestByUserQuery,
  RecommendedTestsBySubjectQuery,
  RemoveQuestionBody,
  ResetTerminatedAttemptRequest,
  SaveAsRequest,
  SearchTestsQuery,
  SearchUnitsQuery,
  ShareLinkBody,
  TestBySubjectRequest,
  TestByTopicRequest,
  TestDetailsQuery,
  TodayProctoredTestsQuery,
  UpdateAllQuestionSectionRequest,
  UpdateAssessmentBody,
  UpdateAttendanceLimitRequest,
  UpdateAttendanceRequest,
  UpdateQuestionOrderRequest,
  UpdateQuestionSectionRequest,
  UserInfo,
} from '@app/common/dto/assessment.dto';
import { AssessmentService } from './assessment.service';

import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';

import { ApiBody, ApiConsumes, ApiHeader, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ObjectIdPipe } from '@app/common';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Assessment')
@Controller('assessment')
export class AssessmentController {
  constructor(private assessmentService: AssessmentService) { }

  // Create assessment 
  @Post()
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  createAssessment(@Headers('instancekey') instancekey: string, @Body() request: CreateAssessmentRequest, @Req() req: any) {
    return this.assessmentService.createAssessment({ instancekey, ...request, user: req.user });
  }

  // update assessment
  @Put("/:id")
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'support', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  updateAssessment(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Body() body: UpdateAssessmentBody, @Req() req: any) {
    const user = req.user;
    return this.assessmentService.updateAssessment({ instancekey, id, body, user: user, headers: { authorization: req.headers.authtoken } });
  }

  // subject enrollment 
  @Patch('/enroll/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  enrollTest(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query('location') location: string, @Body() user: UserInfo) {

    return this.assessmentService.enrollTest({ _id: id, instancekey, location, user });
  }

  @Get('getPublisherAssessments')
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'director', 'publisher', 'student', 'operator'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  getPublisherAssessments(@Headers('instancekey') instancekey: string, @Req() req: any, @Query() query: PublisherAssessmentRequest, @Ip() ip: string) {

    return this.assessmentService.getPublisherAssessments({ instancekey, ...query, user: req.user, ip });
  }

  @Put('/:id/allSection')
  @ApiParam({ name: 'id', required: true, description: "PracticeSet ID" })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  updateAllQuestionSection(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Body() body: UpdateAllQuestionSectionRequest, @Req() req: any) {
    return this.assessmentService.updateAllQuestionSection({ _id: id, instancekey, ...body, user: req.user });
  }

  @Get('/public')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'count', required: false })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getPublicTest(
    @Headers('instancekey') instancekey: string,
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('count') count?: boolean,) {
    return this.assessmentService.getPublicTest({ instancekey, page, limit, count, user: req.user });
  }

  @Get('/getMaximumTestMarks/:id')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getMaximumTestMarks(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
    return this.assessmentService.getMaximumTestMarks({ instancekey, id });
  }

  @Get('/getQuestionFeedback/:qId')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'count', required: false })
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'admin', 'operator', 'centerHead', 'support', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  getQuestionFeedback(@Headers('instancekey') instancekey: string,
    @Param('qId') qId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('count') count?: boolean,) {
    return this.assessmentService.getQuestionFeedback({ instancekey, qId, page, limit, count });
  }

  @Get('/:id/start')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'publisher', 'admin', 'operator', 'centerHead', 'support', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  startTestSession(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
    const user = req.user;
    return this.assessmentService.startTestSession({ instancekey, id, user })
  }

  @Get('/:id/end')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'publisher', 'admin', 'operator', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  endTestSession(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
    return this.assessmentService.endTestSession({ instancekey, id })
  }

  @Get('/:id/attendants')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'publisher', 'admin', 'operator', 'centerHead', 'support', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  getAttendants(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: GetAttendantsRequest, @Req() req: any) {
    const user = req.user;
    return this.assessmentService.getAttendants({ instancekey, id, ...query, user, token: req.headers['authtoken'] })
  }

  @Get('/:id/resetIpRestriction/:studentId')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'admin', 'support', 'director', 'operator'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  resetIpRestriction(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Param('studentId') studentId: string) {
    return this.assessmentService.resetIpRestriction({ instancekey, id, studentId })
  }

  @Put('/updateAttendanceLimit/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'admin', 'operator', 'centerHead', 'director', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  updateAttendanceLimit(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Body() body: UpdateAttendanceLimitRequest) {
    return this.assessmentService.updateAttendanceLimit({ instancekey, id, ...body })
  }

  @Get('/findPracticeSets')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  findPracticeSets(@Headers('instancekey') instancekey: string, @Query() query: FindPracticeSetsRequest) {
    return this.assessmentService.findPracticeSets({ instancekey, ...query })
  }

  @Get('/attendanceStatus/:id/:user')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiParam({ name: 'user', description: 'Student ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getAttendanceStatus(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Param('user', ObjectIdPipe) user: string) {
    return this.assessmentService.getAttendanceStatus({ instancekey, id, user })
  }

  @Put('/changeOwnership/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  changeOwnership(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Body() body: ChangeOwnershipRequest) {
    return this.assessmentService.changeOwnership({ instancekey, id, ...body })
  }

  @Get('/limit/:id/:studentId')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getTestLimit(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Param('studentId', ObjectIdPipe) studentId: string) {
    return this.assessmentService.getTestLimit({ instancekey, id, studentId })
  }

  @Get('/proctor/:id')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  findProctorTest(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req: any) {
    return this.assessmentService.findProctorTest({ instancekey, user: req.user })
  }

  @Get('/exportTest/:id')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  exportTest(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Query() query: ExportTestQuery, @Req() req: any) {
    return this.assessmentService.exportTest({ instancekey, id, query, user: req.user })
  }

  @Get('/ongoingTestByUser/:id')
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  ongoingTestByUser(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
    return this.assessmentService.ongoingTestByUser({ instancekey, id, user: req.user })
  }

  @Post('/findTestBySession')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  findTestBySession(@Headers('instancekey') instancekey: string, @Body() body: FindTestBySessionRequest, @Req() req: any) {
    return this.assessmentService.findTestBySession({ instancekey, ...body, user: req.user })
  }

  @Get('/upcomingTests/:id')
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  upcomingTests(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
    return this.assessmentService.upcomingTests({ instancekey, id, user: req.user })
  }

  @Get('/avg-rating/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getAvgRatingByAssessment(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
    return this.assessmentService.getAvgRatingByAssessment({ instancekey, id })
  }

  @Get('/feedback-rating/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getfeedbackRatingByAssessment(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
    return this.assessmentService.getfeedbackRatingByAssessment({ instancekey, id })
  }

  @Get('/questionList/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getQuestionList(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
    return this.assessmentService.getQuestionList({ instancekey, id })
  }

  @Put('/:id/:questionId/section')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  updateQuestionSection(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Param('questionId', ObjectIdPipe) questionId: string, @Body() body: UpdateQuestionSectionRequest) {
    return this.assessmentService.updateQuestionSection({ instancekey, id, questionId, ...body })
  }

  @Get('/getPracticesetClassrooms/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getPracticesetClassrooms(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
    return this.assessmentService.getPracticesetClassrooms({ instancekey, id, user: req.user })
  }

  // check section before delete 
  @Get('/checkSectionQuestion/:testId')
  @ApiParam({ name: 'testId', description: 'Practice ID' })
  @ApiQuery({ name: 'sectionName', required: false })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  checkSectionQuestion(@Headers('instancekey') instancekey: string, @Param('testId', ObjectIdPipe) testId: string, @Query('sectionName') sectionName?: string) {
    return this.assessmentService.checkSectionQuestion({ instancekey, testId, sectionName })
  }

  @Get('/findByAttempt')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  findPracticeAttempted(@Headers('instancekey') instancekey: string, @Query() query: FindByAttemptQuery, @Req() req: any) {
    return this.assessmentService.findPracticeAttempted({ instancekey, query, user: req.user })
  }

  @Get('/countByAttempt')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  countPracticeAttempted(@Headers('instancekey') instancekey: string, @Query() query: CommonQuery, @Req() req: any) {
    return this.assessmentService.countPracticeAttempted({ instancekey, query, user: req.user })
  }

  @Get('/countPractice')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  countPractice(@Headers('instancekey') instancekey: string, @Query() query: CountPracticeQuery, @Req() req: any) {
    return this.assessmentService.countPractice({ instancekey, query, user: req.user })
  }

  @Get('/getLastTestMe')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getLastTest(@Headers('instancekey') instancekey: string, @Query() query: GetLastTestMeQuery, @Req() req: any) {
    return this.assessmentService.getLastTest({ instancekey, query, user: req.user })
  }

  @Get('/listPublisher')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  listPublisher(@Headers('instancekey') instancekey: string, @Query() query: CommonQuery, @Req() req: any) {
    return this.assessmentService.listPublisher({ instancekey, query, user: req.user })
  }

  @Get('/listUnit')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  listUnit(@Headers('instancekey') instancekey: string, @Query() query: CommonQuery, @Req() req: any) {
    return this.assessmentService.listUnit({ instancekey, query, user: req.user })
  }

  @Get('/testBySubject/:id')
  @ApiParam({ name: 'id', description: 'Comma seperated Subject IDs' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  testBySubject(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: TestBySubjectRequest, @Req() req: any) {
    return this.assessmentService.testBySubject({ instancekey, id, ...query, user: req.user })
  }

  @Get('/testByTopic/:id')
  @ApiParam({ name: 'id', description: 'Topic ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  testByTopic(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: TestByTopicRequest, @Req() req: any) {
    return this.assessmentService.testByTopic({ instancekey, id, ...query, user: req.user })
  }

  @Get('/topicQuestionDistributionByCategory/:id')
  @ApiParam({ name: 'id', description: 'Topic ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  topicQuestionDistributionByCategory(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
    return this.assessmentService.topicQuestionDistributionByCategory({ instancekey, id })
  }

  @Get('/findOneShared/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  findOneShared(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: FindOnePracticeQuery, @Req() req: any, @Ip() ip: string) {
    return this.assessmentService.findOneWithTotalQuestion({ instancekey, id, query, user: req.user, ip })
  }

  @Get('/findOneWithTotalQuestion/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  findOneWithTotalQuestion(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: FindOnePracticeQuery, @Req() req: any, @Ip() ip: string) {
    return this.assessmentService.findOneWithTotalQuestion({ instancekey, id, query, user: req.user, ip })
  }

  @Get('/countByExamId')
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'operator', 'publisher', 'admin', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  countByExamId(@Headers('instancekey') instancekey: string, @Query() query: CountByExamIdQuery, @Req() req: any) {
    return this.assessmentService.countByExamId({ instancekey, query, user: req.user })
  }

  @Get('/findByExamId')
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'operator', 'publisher', 'admin', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  findByExamId(@Headers('instancekey') instancekey: string, @Query() query: FindByExamIdQuery, @Req() req: any) {
    return this.assessmentService.findByExamId({ instancekey, query, user: req.user })
  }

  @Get('/processingDocm')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getProcessingDocm(@Headers('instancekey') instancekey: string, @Req() req: any) {
    return this.assessmentService.processingDocm({ instancekey, user: req.user })
  }

  @Put('/attendance')
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  updateAttendance(@Headers('instancekey') instancekey: string, @Req() req: any, @Body() body: UpdateAttendanceRequest) {
    return this.assessmentService.updateAttendance({ instancekey, token: req.headers['authtoken'], user: req.user, ...body })
  }

  @Put('/resetTerminatedAttempt')
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  resetTerminatedAttempt(@Headers('instancekey') instancekey: string, @Body() body: ResetTerminatedAttemptRequest) {
    return this.assessmentService.resetTerminatedAttempt({ instancekey, ...body })
  }

  @Put('/:id/questionOrder')
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['support', 'teacher', 'publisher', 'admin', 'operator', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  updateQuestionOrder(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Body() body: UpdateQuestionOrderRequest) {
    return this.assessmentService.updateQuestionOrder({ instancekey, id, ...body })
  }

  // delete assessment by-> id
  @Delete('/:id')
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'publisher', 'admin', 'operator', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  destroy(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
    return this.assessmentService.destroy({ instancekey, id, user: req.user });
  }

  @Get('/testDetails/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  testDetails(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: TestDetailsQuery, @Req() req: any) {
    return this.assessmentService.testDetails({ instancekey, id, query, user: req.user })
  }

  @Post('/findAll')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  index(@Headers('instancekey') instancekey: string, @Body() query: FindAllQuery, @Req() req: any) {
    return this.assessmentService.index({ instancekey, query, user: req.user })
  }

  @Get('/game/open')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getOpeningGames(@Headers('instancekey') instancekey: string, @Req() req: any) {
    return this.assessmentService.getOpeningGames({ instancekey, user: req.user, token: req.headers['authtoken'] })
  }

  @Get('/game/history')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getGameHistory(@Headers('instancekey') instancekey: string, @Req() req: any) {
    return this.assessmentService.getGameHistory({ instancekey, user: req.user })
  }

  @Get('/game/:id')
  @ApiParam({ name: 'id' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getGame(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
    return this.assessmentService.getGame({ instancekey, id, user: req.user })
  }

  @Post('/newGame')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  newGame(@Headers('instancekey') instancekey: string, @Body() body: NewGameBody, @Req() req: any) {
    return this.assessmentService.newGame({ instancekey, body, user: req.user, token: req.headers['authtoken'] })
  }

  @Get('/checkQuestionsBeforePublish/:id')
  @ApiParam({ name: 'id' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'support', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  checkQuestionsBeforePublish(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
    return this.assessmentService.checkQuestionsBeforePublish({ instancekey, id })
  }

  @Get('/:id/feedbacks')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getFeedbacks(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: GetFeedbacksQuery) {
    return this.assessmentService.getFeedbacks({ instancekey, query, id })
  }

  @Get('/searchOne/:id')
  @ApiQuery({ name: 'status', required: false })
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  searchOne(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req: any, @Query('status') status?: string,) {
    return this.assessmentService.searchOne({ instancekey, user: req.user, status, id })
  }

  @Get('/findQuestionTemporary/:quesId')
  @ApiParam({ name: 'quesId' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  findQuestionTemporary(@Headers('instancekey') instancekey: string, @Param('quesId', ObjectIdPipe) quesId: string, @Req() req: any) {
    return this.assessmentService.findQuestionTemporary({ instancekey, quesId, user: req.user })
  }

  @Get('/getByTestSeries')
  @ApiQuery({ name: 'id' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getByTestSeries(@Headers('instancekey') instancekey: string, @Query('id', ObjectIdPipe) id: string) {
    return this.assessmentService.getByTestSeries({ instancekey, id })
  }

  //no auth required
  @Get('/supportedProfiles')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  supportedProfiles() {
    return this.assessmentService.supportedProfiles();
  }

  //no auth required
  @Get('/findTestByTestCode/:id')
  @ApiParam({ name: 'id' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  findTestByTestCode(@Headers('instancekey') instancekey: string, @Param('id') id: string) {
    return this.assessmentService.findTestByTestCode({ instancekey, id })
  }

  @Get('/findForMentor')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  findForMentor(@Headers('instancekey') instancekey: string, @Query() query: FindForMentorQuery, @Req() req: any) {
    return this.assessmentService.findForMentor({ instancekey, query, user: req.user })
  }

  @Get('/getBuyModeTestForTeacher')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getBuyModeTestForTeacher(@Headers('instancekey') instancekey: string, @Query() query: GetBuyModeTestForTeacherQuery, @Req() req: any) {
    return this.assessmentService.getBuyModeTestForTeacher({ instancekey, query, user: req.user })
  }

  @Post('/importQuestion')
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  importQuestion(@Headers('instancekey') instancekey: string, @Body() request: ImportQuestionRequest, @Req() req: any) {
    return this.assessmentService.importQuestion({ ...request, instancekey, user: req.user })
  }

  @Post('/removeQuestion')
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  removeQuestion(@Headers('instancekey') instancekey: string, @Body() body: RemoveQuestionBody) {
    return this.assessmentService.removeQuestion({ instancekey, body })
  }


  @Get('/completedTestStudentsByClass/:id')
  @ApiParam({ name: 'id', description: 'classroom id' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  @ApiHeader({ required: false, name: 'timezoneoffset' })
  completedTestStudentsByClass(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Headers('timezoneoffset') timezoneoffset: string, @Query() query: CompletedTestStudentsByClassQuery) {
    return this.assessmentService.completedTestStudentsByClass({ instancekey, id, timezoneoffset, query })
  }

  @Get('/completedTestByClass/:classId')
  @ApiParam({ name: 'classId', description: 'classroom id' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  @ApiHeader({ required: false, name: 'timezoneoffset' })
  completedTestByClass(@Headers('instancekey') instancekey: string, @Param('classId') classId: string, @Headers('timezoneoffset') timezoneoffset: string) {
    return this.assessmentService.completedTestByClass({ instancekey, classId, timezoneoffset })
  }

  @Get('/ongoingTestByClass/:classId')
  @ApiParam({ name: 'classId', description: 'classroom id' })
  @ApiQuery({ name: 'testOnly', required: false })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  @ApiHeader({ required: false, name: 'timezoneoffset' })
  ongoingTestByClass(@Headers('instancekey') instancekey: string, @Param('classId') classId: string, @Headers('timezoneoffset') timezoneoffset: string, @Query('testOnly') testOnly?: boolean) {
    return this.assessmentService.ongoingTestByClass({ instancekey, classId, timezoneoffset, testOnly })
  }

  @Get('/ongoingAttempts/:id')
  @ApiParam({ name: 'id', description: 'classroom id' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  ongoingAttempts(@Headers('instancekey') instancekey: string, @Param('id') id: string) {
    return this.assessmentService.ongoingAttempts({ instancekey, id })
  }

  @Get('/todayProctoredTests/:id')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  @ApiHeader({ required: false, name: 'timezoneoffset' })
  todayProctoredTests(@Headers('instancekey') instancekey: string, @Headers('timezoneoffset') timezoneoffset: string, @Query() query: TodayProctoredTestsQuery, @Req() req: any) {
    return this.assessmentService.todayProctoredTests({ instancekey, query, timezoneoffset, user: req.user })
  }

  @Get('/upcomingTestByClass/:id')
  @ApiParam({ name: 'id', description: 'classroom id' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  @ApiHeader({ required: false, name: 'timezoneoffset' })
  upcomingTestByClass(@Headers('instancekey') instancekey: string, @Headers('timezoneoffset') timezoneoffset: string, @Param('id') id: string) {
    return this.assessmentService.upcomingTestByClass({ instancekey, timezoneoffset, id })
  }

  @Post('/sessionTimes')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getSessionTimes(@Headers('instancekey') instancekey: string, @Body() body: GetSessionTimesBody, @Req() req: any) {
    return this.assessmentService.getSessionTimes({ instancekey, body, user: req.user })
  }

  @Get('/recommendedTestsBySubject/:id')
  @ApiParam({ name: 'id', description: 'subject id' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  recommendedTestsBySubject(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Query() query: RecommendedTestsBySubjectQuery, @Req() req: any) {
    return this.assessmentService.recommendedTestsBySubject({ instancekey, id, query, user: req.user })
  }

  @Get('/recentTests/:id')
  @ApiParam({ name: 'id', description: 'user id' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  recentTestByUser(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Query() query: RecentTestByUserQuery, @Req() req: any) {
    return this.assessmentService.recentTestByUser({ instancekey, id, query, user: req.user })
  }

  @Get('/searchTests/:searchText')
  @ApiParam({ name: 'searchText' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  searchTests(@Headers('instancekey') instancekey: string, @Param('searchText') searchText: string, tags: string, @Query() query: SearchTestsQuery, @Req() req: any) {
    return this.assessmentService.searchTests({ instancekey, searchText, query, tags, user: req.user })
  }

  @Get('/searchUnits')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  searchUnits(@Headers('instancekey') instancekey: string, @Query() query: SearchUnitsQuery) {
    return this.assessmentService.searchUnits({ instancekey, query })
  }

  @Get('/archive/:id')
  @ApiParam({ name: 'id', description: 'user id' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  getArchiveAssessments(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: ArchiveQuery, @Req() req: any) {
    return this.assessmentService.getArchiveAssessments({ instancekey, id, query, user: req.user })
  }

  @Put('/saveAs/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  saveAs(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Body() body: SaveAsRequest, @Req() req: any) {
    return this.assessmentService.saveAs({ instancekey, id, ...body, user: req.user })
  }

  @Get('/findOneForSession/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  findOneForSession(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
    return this.assessmentService.findOneForSession({ instancekey, id })
  }

  @Get('/findOneWithQuestions/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  findOneWithQuestions(@Headers('instancekey') instancekey: string, @Headers('authtoken') authorization: string, @Param('id', ObjectIdPipe) id: string, @Query() query: FindOneWithQuestionsQuery, @Ip() ip: string, @Req() req: any) {
    return this.assessmentService.findOneWithQuestions({ instancekey, id, authorization, query, ip, user: req.user, token: req.headers['authtoken'] })
  }

  @Put('/shareLink')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  shareLink(@Headers('instancekey') instancekey: string, @Body() body: ShareLinkBody, @Req() req: any) {
    return this.assessmentService.shareLink({ instancekey, body, user: req.user })
  }

  @Get('/checkTestCode/:code')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  checkTestCode(@Headers('instancekey') instancekey: string, @Param('code') code: string, @Req() req: any) {
    return this.assessmentService.checkTestCode({ instancekey, code, user: req.user })
  }

  @Get('/exportPDF/:id')
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  exportPDF(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: ExportPDFQuery) {
    return this.assessmentService.exportPDF({ instancekey, id, query })
  }

  @Post('/import')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object', properties: {
        file: { type: 'string', format: 'binary' },
        QB: { type: 'boolean' },
        testId: { type: 'string' },
        notifyUser: { type: 'boolean' },
        tags: { type: 'string' },
        isAllowReuse: { type: 'string' },
      }
    }
  })
  @ApiHeader({ name: 'authtoken', required: true })
  @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importFile(
    @UploadedFile() file: Express.Multer.File, @Body() body: ImportFileBody,
    @Req() req: any, @Headers('instancekey') instancekey: string
  ) {
    return this.assessmentService.importFile({ body, file, instancekey, user: req.user });
  }

  @Get('/fraudCheck/:id')
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'admin', 'operator', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  fraudCheck(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
    return this.assessmentService.fraudCheck({ instancekey, id })
  }

  @Get('/:id/studentTakingTest')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['admin', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  getStudentTakingTest(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: GetStudentTakingTestQuery, @Req() req) {
    return this.assessmentService.getStudentTakingTest({ instancekey, id, query, user: req.user, token: req.headers['authtoken'] })
  }

  @Put("/playGame/:id")
  @UseGuards(AuthenticationGuard)
  @ApiParam({name: 'id', description: 'Practice ID'})
  playGame(@Headers('authtoken') authtoken: string, @Headers('instancekey') instancekey: string, @Param('id') id: string, @Body() body: PlayGameBody, @Req() req: any) {
    return this.assessmentService.playGame({ token: authtoken, instancekey, id, body, user: req.user });
  }
  
  @Post("/teacher/find")
  @UseGuards(AuthenticationGuard)
  @ApiHeader({ required: true, name: 'authtoken' })
  @Roles(['teacher', 'mentor', 'publisher', 'support', 'admin', 'operator', 'centerHead', 'director'])
  findForTeacher(@Headers('instancekey') instancekey: string, @Body() body: FindForTeacherBody, @Req() req: any) {
    return this.assessmentService.findForTeacher({ instancekey, query: body, user: req.user });
  }

  // get assessment by-> id
  @Get('/:id')
  @ApiParam({ name: 'id', description: 'Practice ID' })
  @ApiHeader({ required: true, name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  show(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: FindOnePracticeQuery, @Req() req: any, @Ip() ip: string) {
    return this.assessmentService.findOneWithTotalQuestion({ instancekey, id, query, user: req.user, ip })
  }
}
