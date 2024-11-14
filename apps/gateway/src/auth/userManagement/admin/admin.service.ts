import { AdminGrpcServiceClientImpl } from "@app/common";
import {
    CreateCourseReq, CreateEvaluationReq, CreateNewsReq, CreateProgramOutcomeReq, DeleteCourseReq, DeleteEvaluationReq, DeleteProgramOutcomeReq,
    ExportExamDataWordTemplateReq,
    GetAccAttReq, GetAccreditationSettingsReq, GetAccReportReq, GetMailTemplatesReq, GetNewsReq, GetPowerBIEmbedTokenReq, GetProgramOutcomesReq, GetReportDataReq,
    GetReportReq, GetReportsReq, MapTestToClassroomReq, RunBulkMailDataSourceReq, SendBulkMailReq, TestBulkMailReq, TestMailByKeyReq, UpdateAccSettingReq,
    UpdateBulkMailReq, UpdateCourseReq, UpdateEvaluationReq, UpdateNewsReq, UpdateProgramOutcomeReq,
    UploadCampaignMailSourceReq
} from "@app/common/dto/userManagement/admin.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AdminService {
    constructor(private adminGrpcServiceClientImpl: AdminGrpcServiceClientImpl) { }

    async exportExamDataWordTemplate(request: ExportExamDataWordTemplateReq) {
        return await this.adminGrpcServiceClientImpl.ExportExamDataWordTemplate(request)
    }

    async getReportData(request: GetReportDataReq) {
        return await this.adminGrpcServiceClientImpl.GetReportData(request)
    }

    async getReports(request: GetReportsReq) {
        return await this.adminGrpcServiceClientImpl.GetReports(request)
    }

    async getReport(request: GetReportReq) {
        return await this.adminGrpcServiceClientImpl.GetReport(request)
    }

    async getPowerBIEmbedToken(request: GetPowerBIEmbedTokenReq) {
        return await this.adminGrpcServiceClientImpl.GetPowerBIEmbedToken(request)
    }

    async downloadReport(request: GetPowerBIEmbedTokenReq) {
        return await this.adminGrpcServiceClientImpl.DownloadReport(request)
    }

    async downloadPsychoReport(request: GetPowerBIEmbedTokenReq) {
        return await this.adminGrpcServiceClientImpl.DownloadPsychoReport(request)
    }

    async getMailTemplates(request: GetMailTemplatesReq) {
        return await this.adminGrpcServiceClientImpl.GetMailTemplates(request)
    }

    async sendBulkMail(request: SendBulkMailReq) {
        return await this.adminGrpcServiceClientImpl.SendBulkMail(request)
    }

    async runBulkMailDataSource(request: RunBulkMailDataSourceReq) {
        return await this.adminGrpcServiceClientImpl.RunBulkMailDataSource(request)
    }

    async updateBulkMail(request: UpdateBulkMailReq) {
        return await this.adminGrpcServiceClientImpl.UpdateBulkMail(request)
    }

    async testBulkMail(request: TestBulkMailReq) {
        return await this.adminGrpcServiceClientImpl.TestBulkMail(request)
    }

    async testMailByKey(request: TestMailByKeyReq) {
        return await this.adminGrpcServiceClientImpl.TestMailByKey(request)
    }

    async sendRemindProctoredTestMail(request: TestMailByKeyReq) {
        return await this.adminGrpcServiceClientImpl.SendRemindProctoredTestMail(request)
    }

    async uploadCampaignMailSource(request: UploadCampaignMailSourceReq) {
        return await this.adminGrpcServiceClientImpl.UploadCampaignMailSource(request)
    }

    async removeCampaignMailUploadedSource(request: GetReportReq) {
        return await this.adminGrpcServiceClientImpl.RemoveCampaignMailUploadedSource(request)
    }

    async getProgramOutcomes(request: GetProgramOutcomesReq) {
        return await this.adminGrpcServiceClientImpl.GetProgramOutcomes(request)
    }

    async createProgramOutcome(request: CreateProgramOutcomeReq) {
        return await this.adminGrpcServiceClientImpl.CreateProgramOutcome(request)
    }

    async updateProgramOutcome(request: UpdateProgramOutcomeReq) {
        return await this.adminGrpcServiceClientImpl.UpdateProgramOutcome(request)
    }

    async deleteProgramOutcome(request: DeleteProgramOutcomeReq) {
        return await this.adminGrpcServiceClientImpl.DeleteProgramOutcome(request)
    }

    async getCourses(request: GetProgramOutcomesReq) {
        return await this.adminGrpcServiceClientImpl.GetCourses(request)
    }

    async createCourse(request: CreateCourseReq) {
        return await this.adminGrpcServiceClientImpl.CreateCourse(request)
    }

    async updateCourse(request: UpdateCourseReq) {
        return await this.adminGrpcServiceClientImpl.UpdateCourse(request)
    }

    async deleteCourse(request: DeleteCourseReq) {
        return await this.adminGrpcServiceClientImpl.DeleteCourse(request)
    }

    async getEvaluations(request: GetProgramOutcomesReq) {
        return await this.adminGrpcServiceClientImpl.GetEvaluations(request)
    }

    async createEvaluation(request: CreateEvaluationReq) {
        return await this.adminGrpcServiceClientImpl.CreateEvaluation(request)
    }

    async updateEvaluation(request: UpdateEvaluationReq) {
        return await this.adminGrpcServiceClientImpl.UpdateEvaluation(request)
    }

    async deleteEvaluation(request: DeleteEvaluationReq) {
        return await this.adminGrpcServiceClientImpl.DeleteEvaluation(request)
    }

    async getAccreditationSettings(request: GetAccreditationSettingsReq) {
        return await this.adminGrpcServiceClientImpl.GetAccreditationSettings(request)
    }

    async updateAccreditationSetting(request: UpdateAccSettingReq) {
        return await this.adminGrpcServiceClientImpl.UpdateAccreditationSetting(request)
    }

    async getAccreditationReports(request: GetAccReportReq) {
        return await this.adminGrpcServiceClientImpl.GetAccreditationReports(request)
    }

    async getAccreditationAttainments(request: GetAccAttReq) {
        return await this.adminGrpcServiceClientImpl.GetAccreditationAttainments(request)
    }

    async teacherByExam(request: GetReportReq) {
        return await this.adminGrpcServiceClientImpl.TeacherByExam(request)
    }

    async mapTestToClassroom(request: MapTestToClassroomReq) {
        return await this.adminGrpcServiceClientImpl.MapTestToClassroom(request)
    }

    async getNews(request: GetNewsReq) {
        return await this.adminGrpcServiceClientImpl.GetNews(request)
    }

    async createNews(request: CreateNewsReq) {
        return await this.adminGrpcServiceClientImpl.CreateNews(request)
    }

    async updateNews(request: UpdateNewsReq) {
        return await this.adminGrpcServiceClientImpl.UpdateNews(request)
    }

}