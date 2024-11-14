import {
    Body, Controller, Param, Get, Post, Put, Delete, UseGuards, Req, Headers, Query,
    UseInterceptors, UploadedFile
} from '@nestjs/common';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SubjectService } from './subject.service';
import { GetAllSubjectQuery, SubjectRequest, UpdateSubjectRequest, UpdateSubStatusReq } from '@app/common/dto/administration/subject.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Subject')
@Controller('subjects')
export class SubjectController {
    constructor(private subjectService: SubjectService) { }

    @Get('/')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getSubject(@Req() req: any, @Headers('instancekey') instancekey: string, @Query() query: GetAllSubjectQuery) {
        const newRequest = { user: req.user, query, instancekey }
        return this.subjectService.getSubject(newRequest);
    }

    @Get('/getSubjectsInAllExams')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getSubjectsInAllExams(@Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.subjectService.getSubjectsInAllExams({ user: req.user, instancekey });
    }

    @Get('/getTeachersBySubjects')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getTeachersBySubjects(@Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.subjectService.getTeachersBySubjects({ user: req.user, instancekey });
    }

    @Get('/getByTest/:testId')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: 'testDetails', required: false })
    getSubjectsByTest(
        @Headers('instancekey') instancekey: string,
        @Param('testId') testId: string,
        @Req() req: any,
        @Query('testDetails') testDetails?: string
    ) {
        return this.subjectService.getSubjectsByTest({ testId, user: req.user, testDetails, instancekey });
    }

    @Get('/adaptive')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['student'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getAdaptiveSubjects(@Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.subjectService.getAdaptiveSubjects({ user: req.user, instancekey });
    }

    @Get('/mine')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: 'user', required: false, description: 'Filter subject by user', type: String })
    @ApiQuery({ name: 'unit', required: false, description: 'Filter subject by unit', type: String })
    @ApiQuery({ name: 'topic', required: false, description: 'Filter subject by topic', type: String })
    getMySubjects(
        @Req() req: any,
        @Query('user') queryUser: string,
        @Query('unit') unit: string,
        @Query('topic') topic: string,
        @Headers('instancekey') instancekey: string
    ) {
        const newRequest = { user: req.user, unit, queryUser, topic, instancekey };
        return this.subjectService.getMySubjects(newRequest);
    }

    @Get('/institute')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'searchText', required: false })
    @UseGuards(AuthenticationGuard)
    getInstituteSubjects(
        @Headers('instancekey') instancekey: string,
        @Req() req: any,
        @Query('activeOnly') activeOnly?: boolean,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('searchText') searchText?: string
    ) {
        return this.subjectService.getInstituteSubjects({ instancekey, user: req.user, activeOnly, page, limit, searchText });
    }

    @Get('/publisher')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'searchText', required: false })
    @UseGuards(AuthenticationGuard)
    getPublisherSubjects(
        @Headers('instancekey') instancekey: string,
        @Req() req: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('searchText') searchText?: string
    ) {
        return this.subjectService.getPublisherSubjects({ instancekey, user: req.user, page, limit, searchText });
    }

    @Get('/getSubjectList')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'searchText', required: false })
    @UseGuards(AuthenticationGuard)
    getSubjectList(
        @Headers('instancekey') instancekey: string,
        @Req() req: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('searchText') searchText?: string
    ) {
        return this.subjectService.getSubjectList({ instancekey, user: req.user, page, limit, searchText });
    }

    @Get('/getAttemptTrendByGrade')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'value', required: true })
    @ApiQuery({ name: 'grade', required: true })
    @UseGuards(AuthenticationGuard)
    getAttemptTrend(@Headers('instancekey') instancekey: string, @Query('value') value: number, @Query('grade') grade: string) {
        return this.subjectService.getAttemptTrend({ instancekey, query: { value, grade } });
    }

    @Get('/getSignUpTrendByGrade')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'value', required: true })
    @ApiQuery({ name: 'grade', required: true })
    @UseGuards(AuthenticationGuard)
    getSignUpTrend(@Headers('instancekey') instancekey: string, @Query('value') value: number, @Query('grade') grade: string) {
        return this.subjectService.getSignUpTrend({ instancekey, query: { value, grade } });
    }

    @Get('/slugfly')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'subjectName', required: false, description: 'Filter subject by name', type: String })
    @ApiQuery({ name: 'program', required: false, description: 'Filter subject by program', type: String })
    @UseGuards(AuthenticationGuard)
    getSubjectBySlug(@Query('subjectName') subjectName: string, @Query('program') program: string, @Headers('instancekey') instancekey: string) {
        return this.subjectService.getSubjectBySlug({ subjectName, program, instancekey });
    }

    @Get('/analysis/attemptTrend')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'day', required: false })
    @ApiQuery({ name: 'classroom', required: false })
    @ApiQuery({ name: 'locations', required: false })
    @UseGuards(AuthenticationGuard)
    attemptTrend(
        @Headers('instancekey') instancekey: string, @Req() req: any, @Query('day') day: number,
        @Query('classroom') classroom?: string, @Query('locations') locations?: string
    ) {
        return this.subjectService.attemptTrend({ user: req.user, query: { day, classroom, locations }, instancekey });
    }

    @Get('/analysis/signUpTrend')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'day', required: false })
    @UseGuards(AuthenticationGuard)
    signUpTrend(@Headers('instancekey') instancekey: string, @Req() req: any, @Query('day') day: number) {
        return this.subjectService.signUpTrend({ user: req.user, query: { day }, instancekey });
    }

    @Get('/analysis/questionAddedTrend')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'day', required: false })
    @UseGuards(AuthenticationGuard)
    questionAddedTrend(@Headers('instancekey') instancekey: string, @Req() req: any, @Query('day') day: number) {
        return this.subjectService.questionAddedTrend({ user: req.user, query: { day }, instancekey });
    }

    @Get('/analysis/loginTrend')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'day', required: false })
    @UseGuards(AuthenticationGuard)
    loginTrend(@Headers('instancekey') instancekey: string, @Query('day') day: number) {
        return this.subjectService.loginTrend({ query: { day }, instancekey });
    }

    @Get('/analysis/highestAttemptedStudent')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'day', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'classroom', required: false })
    @ApiQuery({ name: 'locations', required: false })
    @UseGuards(AuthenticationGuard)
    highestAttemptedStudent(
        @Headers('instancekey') instancekey: string, @Req() req: any,
        @Query('day') day: number, @Query('limit') limit?: number,
        @Query('classroom') classroom?: string, @Query('locations') locations?: string
    ) {
        return this.subjectService.highestAttemptedStudent({ user: req.user, query: { day, limit, classroom, locations }, instancekey });
    }

    @Get('/analysis/mostAbandonedStudent')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'day', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'classroom', required: false })
    @ApiQuery({ name: 'locations', required: false })
    @UseGuards(AuthenticationGuard)
    mostAbandonedStudent(
        @Headers('instancekey') instancekey: string, @Req() req: any,
        @Query('day') day: number, @Query('limit') limit?: number,
        @Query('classroom') classroom?: string, @Query('locations') locations?: string
    ) {
        return this.subjectService.mostAbandonedStudent({ user: req.user, query: { day, limit, classroom, locations }, instancekey });
    }

    @Get('/analysis/mostAbandonedTest')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'day', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'classroom', required: false })
    @ApiQuery({ name: 'locations', required: false })
    @UseGuards(AuthenticationGuard)
    mostAbandonedTest(
        @Headers('instancekey') instancekey: string, @Req() req: any,
        @Query('day') day: number, @Query('limit') limit?: number,
        @Query('classroom') classroom?: string, @Query('locations') locations?: string
    ) {
        return this.subjectService.mostAbandonedTest({ user: req.user, query: { day, limit, classroom, locations }, instancekey });
    }




    @Post('create')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiHeader({ name: 'instancekey' })
    @Roles(['admin', 'support', 'teacher', 'director', 'operator', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    createSubject(@Body() request: SubjectRequest, @Req() req: any) {
        const instancekey = req.headers['instancekey'];
        const newRequest = { ...request, user: req.user, instancekey }
        return this.subjectService.createSubject(newRequest);
    }

    @Delete('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support', 'teacher', 'director', 'operator', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    deleteSubject(@Req() req: any, @Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.subjectService.deleteSubject({ user: req.user, _id: id, instancekey });
    }

    @Put('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support', 'teacher', 'director', 'operator', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateSubject(@Req() req: any, @Param('id') id: string, @Body() request: UpdateSubjectRequest, @Headers('instancekey') instancekey: string) {
        return this.subjectService.updateSubject({ ...request, _id: id, user: req.user, instancekey });
    }

    @Get('/getUnitsBySubject')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'subjects', required: false, description: 'Filter by subjects separated by commas', type: String })
    @UseGuards(AuthenticationGuard)
    getUnitsBySubject(@Query('subjects') subjects: string, @Headers('instancekey') instancekey: string) {
        return this.subjectService.getUnitsBySubject({ subjects, instancekey });
    }

    @Get('/getTopicsByUnits')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'units', required: false, description: 'Filter by units separated by commas', type: String })
    @UseGuards(AuthenticationGuard)
    getTopicsByUnits(@Query('units') units: string, @Headers('instancekey') instancekey: string) {
        return this.subjectService.getTopicsByUnits({ units, instancekey });
    }

    @Put('/updateStatus/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    updateSubjectStatus(@Req() req: any, @Param('id') id: string, @Body() request: UpdateSubStatusReq, @Headers('instancekey') instancekey: string) {
        return this.subjectService.updateSubjectStatus({ ...request, _id: id, user: req.user, instancekey });
    }

    @Post('/import')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' }
            },
        },
    })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    @UseInterceptors(FileInterceptor('file'))
    async importSubjects(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
        @Headers('instancekey') instancekey: string
    ) {
        return this.subjectService.importSubjects({ file, instancekey, user: req.user, });
    }

    @Get('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getOneSubject(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.subjectService.getOneSubject({ _id: id, instancekey });
    }
}
