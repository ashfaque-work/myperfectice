import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiHeader, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { Roles } from "@app/common/decorators";
import { AuthenticationGuard, RolesGuard } from "@app/common/auth";
import { TimeoutInterceptor } from "@app/common/auth/interceptors/timeout.interceptor";
import {
    CreateCourseReq, CreateEvaluationReq, CreateNewsReq, CreateProgramOutcomeReq, MapTestToClassroomReq, RunBulkMailDataSourceReq, SendBulkMailReq, TestBulkMailReq,
    TestMailByKeyReq, UpdateAccSettingReq, UpdateBulkMailReq, UpdateCourseReq, UpdateEvaluationReq, UpdateNewsReq, UpdateProgramOutcomeReq,
    UploadCampaignMailSourceReq
} from "@app/common/dto/userManagement/admin.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('/exportExamDataWordTemplate/:id')
    @ApiQuery({ name: 'deleteUrl', required: false, type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async exportExamDataWordTemplate(
        @Param('id') id: string, @Headers('instancekey') instancekey: string,
        @Query('deleteUrl') deleteUrl: string,
    ) {
        return await this.adminService.exportExamDataWordTemplate({ _id: id, query: { deleteUrl }, instancekey })
    }

    @Get('/reportData/:api')
    @ApiQuery({ name: 'directDownload', required: false, type: Boolean })
    @ApiQuery({ name: 'download', required: false, type: Boolean })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'director', 'support', 'centerHead', 'student', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getReportData(
        @Param('api') api: string, @Headers('instancekey') instancekey: string,
        @Query('directDownload') directDownload: string, @Query('download') download: string,
    ) {
        return await this.adminService.getReportData({ api, query: { directDownload: directDownload === 'true', download: download === 'true' }, instancekey })
    }

    @Get('/reports')
    @ApiQuery({ name: 'subject', required: false, type: String })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'text', required: false, type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'director', 'support', 'centerHead'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getReports(
        @Headers('instancekey') instancekey: string, @Req() req,
        @Query('subject') subject: string, @Query('classroom') classroom: string, @Query('text') text: string,
    ) {
        return await this.adminService.getReports(
            { query: { subject, classroom, text }, user: req.user, instancekey }
        )
    }

    @Get('/reports/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'director', 'support', 'centerHead', 'student', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getReport(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return await this.adminService.getReport({ _id: id, instancekey })
    }

    @UseInterceptors(TimeoutInterceptor)
    @Get('/powerBIEmbeded/:id')
    @ApiQuery({ name: 'period', required: false, type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'director', 'support', 'centerHead'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getPowerBIEmbedToken(@Param('id') id: string, @Headers('instancekey') instancekey: string, @Query('period') period: string) {
        return await this.adminService.getPowerBIEmbedToken({ _id: id, instancekey, query: { period } })
    }

    @UseInterceptors(TimeoutInterceptor)
    @Get('/downloadReport/:id')
    @ApiQuery({ name: 'directDownload', required: false, type: Boolean })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'director', 'support', 'centerHead'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async downloadReport(@Param('id') id: string, @Headers('instancekey') instancekey: string, @Query('directDownload') directDownload: string) {
        return await this.adminService.downloadReport({ _id: id, instancekey, query: { directDownload: directDownload === 'true' } })
    }

    @UseInterceptors(TimeoutInterceptor)
    @Get('/downloadPsychoReport/:testId')
    @ApiQuery({ name: 'directDownload', required: false, type: Boolean })
    @ApiQuery({ name: 'classrooms', required: false, type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'director', 'support', 'centerHead'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async downloadPsychoReport(
        @Param('testId') testId: string, @Headers('instancekey') instancekey: string,
        @Query('directDownload') directDownload: string, @Query('classrooms') classrooms: string
    ) {
        return await this.adminService.downloadPsychoReport({ _id: testId, instancekey, query: { directDownload: directDownload === 'true', classrooms } })
    }


    @Get('/mailTemplates')
    @ApiQuery({ name: 'type', required: false, type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getMailTemplates(@Headers('instancekey') instancekey: string, @Query('type') type: string) {
        return await this.adminService.getMailTemplates({ instancekey, query: { type } })
    }

    @Post('/sendBulkMail')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async sendBulkMail(@Headers('instancekey') instancekey: string, @Body() request: SendBulkMailReq) {
        return await this.adminService.sendBulkMail({ ...request, instancekey })
    }

    @Post('/runBulkMailDataSource')
    @ApiQuery({ name: 'statistic', required: false, type: Boolean })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async runBulkMailDataSource(
        @Headers('instancekey') instancekey: string, @Body() request: RunBulkMailDataSourceReq,
        @Query('statistic') statistic: string, @Req() req,
    ) {
        return await this.adminService.runBulkMailDataSource({ ...request, instancekey, user: req.user, query: { statistic: statistic === 'true' } })
    }

    @Put('/updateBulkMail/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async updateBulkMail(
        @Param('id') id: string, @Headers('instancekey') instancekey: string, @Body() request: UpdateBulkMailReq
    ) {
        return await this.adminService.updateBulkMail({ ...request, _id: id, instancekey })
    }

    @Post('/testBulkMail')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async testBulkMail(@Headers('instancekey') instancekey: string, @Body() request: TestBulkMailReq, @Req() req) {
        return await this.adminService.testBulkMail({ ...request, instancekey, user: req.user })
    }

    @Post('/testMailByKey/:key')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async testMailByKey(
        @Param('key') key: string, @Headers('instancekey') instancekey: string,
        @Body() request: TestMailByKeyReq, @Req() req
    ) {
        return await this.adminService.testMailByKey({ ...request, _id: key, instancekey, user: req.user })
    }

    @Post('/sendRemindProctoredTestMail/:classId')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async sendRemindProctoredTestMail(
        @Param('classId') classId: string, @Headers('instancekey') instancekey: string,
        @Body() request: TestMailByKeyReq, @Req() req
    ) {
        return await this.adminService.sendRemindProctoredTestMail({ ...request, _id: classId, instancekey, user: req.user })
    }

    @Post('/uploadCampaignMailSource/:id')
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
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadCampaignMailSource(
        @Param('id') id: string,
        @Body() request: UploadCampaignMailSourceReq, @UploadedFile() file: Express.Multer.File,
        @Headers('instancekey') instancekey: string
    ) {
        return this.adminService.uploadCampaignMailSource({ ...request, _id: id, file, instancekey });
    }

    @Delete('/removeCampaignMailUploadedSource/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async removeCampaignMailUploadedSource(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return await this.adminService.removeCampaignMailUploadedSource({ _id: id, instancekey })
    }

    @Get('/program-outcomes')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getProgramOutcomes(@Headers('instancekey') instancekey: string) {
        return await this.adminService.getProgramOutcomes({ instancekey })
    }

    @Post('/program-outcome')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async createProgramOutcome(@Body() request: CreateProgramOutcomeReq, @Headers('instancekey') instancekey: string) {
        return await this.adminService.createProgramOutcome({ ...request, instancekey })
    }

    @Put('/program-outcome/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async updateProgramOutcome(@Param('id') id: string, @Body() request: UpdateProgramOutcomeReq, @Headers('instancekey') instancekey: string) {
        return await this.adminService.updateProgramOutcome({ ...request, _id: id, instancekey })
    }

    @Delete('/program-outcome/:id')
    @ApiQuery({ name: 'active', required: false, type: Boolean })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async deleteProgramOutcome(@Param('id') id: string, @Headers('instancekey') instancekey: string, @Query('active') active: string) {
        return await this.adminService.deleteProgramOutcome({ _id: id, instancekey, query: { active: active === 'true' } })
    }

    @Get('/accreditation/courses')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getCourses(@Headers('instancekey') instancekey: string) {
        return await this.adminService.getCourses({ instancekey })
    }

    @Post('/accreditation/course')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async createCourse(@Body() request: CreateCourseReq, @Headers('instancekey') instancekey: string) {
        return await this.adminService.createCourse({ ...request, instancekey })
    }

    @Put('/accreditation/course/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async updateCourse(@Param('id') id: string, @Body() request: UpdateCourseReq, @Headers('instancekey') instancekey: string) {
        return await this.adminService.updateCourse({ ...request, _id: id, instancekey })
    }

    @Delete('/accreditation/course/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async deleteCourse(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return await this.adminService.deleteCourse({ _id: id, instancekey })
    }

    @Get('/accreditation/evaluations')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getEvaluations(@Headers('instancekey') instancekey: string) {
        return await this.adminService.getEvaluations({ instancekey })
    }

    @Post('/accreditation/evaluation')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async createEvaluation(@Body() request: CreateEvaluationReq, @Headers('instancekey') instancekey: string) {
        return await this.adminService.createEvaluation({ ...request, instancekey })
    }

    @Put('/accreditation/evaluation/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async updateEvaluation(@Param('id') id: string, @Body() request: UpdateEvaluationReq, @Headers('instancekey') instancekey: string) {
        return await this.adminService.updateEvaluation({ ...request, _id: id, instancekey })
    }

    @Delete('/accreditation/evaluation/:id')
    @ApiQuery({ name: 'active', required: false, type: Boolean })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async deleteEvaluation(@Param('id') id: string, @Headers('instancekey') instancekey: string, @Query('active') active: string) {
        return await this.adminService.deleteEvaluation({ _id: id, instancekey, query: { active: active === 'true' } })
    }

    @Get('/accreditation/settings')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getAccreditationSettings(@Headers('instancekey') instancekey: string) {
        return await this.adminService.getAccreditationSettings({ instancekey })
    }

    @Put('/accreditation/setting/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async updateAccreditationSetting(@Param('id') id: string, @Body() request: UpdateAccSettingReq, @Headers('instancekey') instancekey: string) {
        return await this.adminService.updateAccreditationSetting({ ...request, _id: id, instancekey })
    }

    @Get('/accreditation/reports')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getAccreditationReports(@Headers('instancekey') instancekey: string, @Req() req) {
        return await this.adminService.getAccreditationReports({ instancekey, user: req.user })
    }

    @Get('/accreditation/accreditationattainment/:code')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getAccreditationAttainments(@Param('code') code: string, @Headers('instancekey') instancekey: string) {
        return await this.adminService.getAccreditationAttainments({ code, instancekey })
    }

    @Get('/getTeacherByExam/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    async teacherByExam(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return await this.adminService.teacherByExam({ _id: id, instancekey })
    }

    @Post('/mapTestToClassroom')
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
    @Roles(['admin', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('file'))
    async mapTestToClassroom(
        @Body() request: MapTestToClassroomReq, @UploadedFile() file: Express.Multer.File,
        @Headers('instancekey') instancekey: string
    ) {
        return this.adminService.mapTestToClassroom({ ...request, file, instancekey });
    }

    @Get('/news')
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'skip', required: false, type: Number })
    @ApiQuery({ name: 'searchText', required: false, type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    async getNews(
        @Query('limit') limit: number, @Query('skip') skip: number, @Req() req,
        @Query('searchText') searchText: string, @Headers('instancekey') instancekey: string,
    ) {
        return await this.adminService.getNews({
            instancekey, user: req.user, query: { limit, skip, searchText },
        })
    }

    @Post('/news')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async createNews(@Body() request: CreateNewsReq, @Headers('instancekey') instancekey: string, @Req() req) {
        return await this.adminService.createNews({ ...request, user: req.user, instancekey })
    }

    @Put('/news/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async updateNews(@Param('id') id: string, @Body() request: UpdateNewsReq, @Headers('instancekey') instancekey: string) {
        return await this.adminService.updateNews({ ...request, _id: id, instancekey })
    }
}