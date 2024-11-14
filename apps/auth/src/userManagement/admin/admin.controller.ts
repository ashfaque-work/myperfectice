import { Controller } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufAdminService } from "@app/common";
import {
    CreateCourseReq, CreateEvaluationReq, CreateNewsReq, CreateProgramOutcomeReq, DeleteCourseReq, DeleteEvaluationReq, DeleteProgramOutcomeReq,
    ExportExamDataWordTemplateReq,
    GetAccAttReq, GetAccReportReq, GetMailTemplatesReq, GetNewsReq, GetPowerBIEmbedTokenReq, GetProgramOutcomesReq, GetReportDataReq, GetReportReq,
    GetReportsReq, MapTestToClassroomReq, RunBulkMailDataSourceReq, SendBulkMailReq, TestBulkMailReq, TestMailByKeyReq, UpdateAccSettingReq, UpdateBulkMailReq,
    UpdateCourseReq, UpdateEvaluationReq, UpdateNewsReq, UpdateProgramOutcomeReq,
    UploadCampaignMailSourceReq
} from "@app/common/dto/userManagement/admin.dto";

@Controller()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @GrpcMethod(protobufAdminService, 'ExportExamDataWordTemplate')
    async exportExamDataWordTemplate(request: ExportExamDataWordTemplateReq) {
        return await this.adminService.exportExamDataWordTemplate(request);
    }

    @GrpcMethod(protobufAdminService, 'GetReportData')
    async getReportData(request: GetReportDataReq) {
        return await this.adminService.getReportData(request);
    }

    @GrpcMethod(protobufAdminService, 'GetReports')
    async getReports(request: GetReportsReq) {
        return await this.adminService.getReports(request);
    }

    @GrpcMethod(protobufAdminService, 'GetReport')
    async getReport(request: GetReportReq) {
        return await this.adminService.getReport(request);
    }

    @GrpcMethod(protobufAdminService, 'GetPowerBIEmbedToken')
    async getPowerBIEmbedToken(request: GetPowerBIEmbedTokenReq) {
        return await this.adminService.getPowerBIEmbedToken(request);
    }

    @GrpcMethod(protobufAdminService, 'DownloadReport')
    async downloadReport(request: GetPowerBIEmbedTokenReq) {
        return await this.adminService.downloadReport(request);
    }

    @GrpcMethod(protobufAdminService, 'DownloadPsychoReport')
    async downloadPsychoReport(request: GetPowerBIEmbedTokenReq) {
        return await this.adminService.downloadPsychoReport(request);
    }

    @GrpcMethod(protobufAdminService, 'GetMailTemplates')
    async getMailTemplates(request: GetMailTemplatesReq) {
        return await this.adminService.getMailTemplates(request);
    }

    @GrpcMethod(protobufAdminService, 'SendBulkMail')
    async sendBulkMail(request: SendBulkMailReq) {
        return await this.adminService.sendBulkMail(request);
    }

    @GrpcMethod(protobufAdminService, 'RunBulkMailDataSource')
    async runBulkMailDataSource(request: RunBulkMailDataSourceReq) {
        return await this.adminService.runBulkMailDataSource(request);
    }

    @GrpcMethod(protobufAdminService, 'UpdateBulkMail')
    async updateBulkMail(request: UpdateBulkMailReq) {
        return await this.adminService.updateBulkMail(request);
    }

    @GrpcMethod(protobufAdminService, 'TestBulkMail')
    async testBulkMail(request: TestBulkMailReq) {
        return await this.adminService.testBulkMail(request);
    }

    @GrpcMethod(protobufAdminService, 'TestMailByKey')
    async testMailByKey(request: TestMailByKeyReq) {
        return await this.adminService.testMailByKey(request);
    }

    @GrpcMethod(protobufAdminService, 'SendRemindProctoredTestMail')
    async sendRemindProctoredTestMail(request: TestMailByKeyReq) {
        return await this.adminService.sendRemindProctoredTestMail(request);
    }

    @GrpcMethod(protobufAdminService, 'UploadCampaignMailSource')
    async uploadCampaignMailSource(request: UploadCampaignMailSourceReq) {
        return await this.adminService.uploadCampaignMailSource(request);
    }

    @GrpcMethod(protobufAdminService, 'RemoveCampaignMailUploadedSource')
    async removeCampaignMailUploadedSource(request: GetReportReq) {
        return await this.adminService.removeCampaignMailUploadedSource(request);
    }

    @GrpcMethod(protobufAdminService, 'GetProgramOutcomes')
    async getProgramOutcomes(request: GetProgramOutcomesReq) {
        return await this.adminService.getProgramOutcomes(request);
    }

    @GrpcMethod(protobufAdminService, 'CreateProgramOutcome')
    async createProgramOutcome(request: CreateProgramOutcomeReq) {
        return await this.adminService.createProgramOutcome(request);
    }

    @GrpcMethod(protobufAdminService, 'UpdateProgramOutcome')
    async updateProgramOutcome(request: UpdateProgramOutcomeReq) {
        return await this.adminService.updateProgramOutcome(request);
    }

    @GrpcMethod(protobufAdminService, 'DeleteProgramOutcome')
    async deleteProgramOutcome(request: DeleteProgramOutcomeReq) {
        return await this.adminService.deleteProgramOutcome(request);
    }

    @GrpcMethod(protobufAdminService, 'GetCourses')
    async getCourses(request: GetProgramOutcomesReq) {
        return await this.adminService.getCourses(request);
    }

    @GrpcMethod(protobufAdminService, 'CreateCourse')
    async createCourse(request: CreateCourseReq) {
        return await this.adminService.createCourse(request);
    }

    @GrpcMethod(protobufAdminService, 'UpdateCourse')
    async updateCourse(request: UpdateCourseReq) {
        return await this.adminService.updateCourse(request);
    }

    @GrpcMethod(protobufAdminService, 'DeleteCourse')
    async deleteCourse(request: DeleteCourseReq) {
        return await this.adminService.deleteCourse(request);
    }

    @GrpcMethod(protobufAdminService, 'GetEvaluations')
    async getEvaluations(request: GetProgramOutcomesReq) {
        return await this.adminService.getEvaluations(request);
    }

    @GrpcMethod(protobufAdminService, 'CreateEvaluation')
    async createEvaluation(request: CreateEvaluationReq) {
        return await this.adminService.createEvaluation(request);
    }

    @GrpcMethod(protobufAdminService, 'UpdateEvaluation')
    async updateEvaluation(request: UpdateEvaluationReq) {
        return await this.adminService.updateEvaluation(request);
    }

    @GrpcMethod(protobufAdminService, 'DeleteEvaluation')
    async deleteEvaluation(request: DeleteEvaluationReq) {
        return await this.adminService.deleteEvaluation(request);
    }

    @GrpcMethod(protobufAdminService, 'GetAccreditationSettings')
    async getAccreditationSettings(request: GetProgramOutcomesReq) {
        return await this.adminService.getAccreditationSettings(request);
    }

    @GrpcMethod(protobufAdminService, 'UpdateAccreditationSetting')
    async updateAccreditationSetting(request: UpdateAccSettingReq) {
        return await this.adminService.updateAccreditationSetting(request);
    }

    @GrpcMethod(protobufAdminService, 'GetAccreditationReports')
    async getAccreditationReports(request: GetAccReportReq) {
        return await this.adminService.getAccreditationReports(request);
    }

    @GrpcMethod(protobufAdminService, 'GetAccreditationAttainments')
    async getAccreditationAttainments(request: GetAccAttReq) {
        return await this.adminService.getAccreditationAttainments(request);
    }

    @GrpcMethod(protobufAdminService, 'TeacherByExam')
    async teacherByExam(request: GetReportReq) {
        return await this.adminService.teacherByExam(request);
    }

    @GrpcMethod(protobufAdminService, 'MapTestToClassroom')
    async mapTestToClassroom(request: MapTestToClassroomReq) {
        return await this.adminService.mapTestToClassroom(request);
    }

    @GrpcMethod(protobufAdminService, 'GetNews')
    async getNews(request: GetNewsReq) {
        return await this.adminService.getNews(request);
    }

    @GrpcMethod(protobufAdminService, 'CreateNews')
    async createNews(request: CreateNewsReq) {
        return await this.adminService.createNews(request);
    }

    @GrpcMethod(protobufAdminService, 'UpdateNews')
    async updateNews(request: UpdateNewsReq) {
        return await this.adminService.updateNews(request);
    }
}