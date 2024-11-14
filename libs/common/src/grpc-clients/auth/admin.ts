import {
    CreateProgramOutcomeReq, DownloadReportRes, GetMailTemplatesReq, GetMailTemplatesRes, GetPowerBIEmbedTokenReq,
    GetPowerBIEmbedTokenRes, GetProgramOutcomesReq, ProgramOutcomesRes, GetReportDataReq, GetReportDataRes, EvaluationRes,
    GetReportReq, GetReportsReq, GetReportsRes, Report, RunBulkMailDataSourceReq, RunBulkMailDataSourceRes, GetAccSettingRes,
    SendBulkMailReq, SendBulkMailRes, TestBulkMailReq, TestBulkMailRes, TestMailByKeyReq, TestMailByKeyRes, UpdateBulkMailReq,
    UpdateBulkMailRes, CreateProgramOutcomeRes, UpdateProgramOutcomeReq, DeleteProgramOutcomeReq, GetCoursesRes, CreateCourseReq,
    CourseRes, DeleteCourseReq, UpdateCourseReq, GetEvaluationsRes, CreateEvaluationReq, UpdateEvaluationReq, DeleteEvaluationReq,
    GetAccReportReq, GetAccReportRes, UpdateAccSettingReq, UpdateAccSettingRes, GetAccAttReq, GetAccAttRes,
    TeacherByExamRes, GetNewsReq, CreateNewsReq, UpdateNewsReq, GetNewsRes, NewsRes,
    MapTestToClassroomReq,
    Empty,
    UploadCampaignMailSourceReq,
    ExportExamDataWordTemplateReq,
    GetAccreditationSettingsReq
} from "@app/common/dto/userManagement/admin.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufAdminService = 'AuthGrpcService';

export interface AdminGrpcInterface {
    ExportExamDataWordTemplate(request: ExportExamDataWordTemplateReq): Promise<Empty>;
    GetReportData(request: GetReportDataReq): Promise<GetReportDataRes>;
    GetReports(request: GetReportsReq): Promise<GetReportsRes>;
    GetReport(request: GetReportReq): Promise<Report>;
    GetPowerBIEmbedToken(request: GetPowerBIEmbedTokenReq): Promise<GetPowerBIEmbedTokenRes>;
    DownloadReport(request: GetPowerBIEmbedTokenReq): Promise<DownloadReportRes>;
    DownloadPsychoReport(request: GetPowerBIEmbedTokenReq): Promise<DownloadReportRes>;
    GetMailTemplates(request: GetMailTemplatesReq): Promise<GetMailTemplatesRes>;
    SendBulkMail(request: SendBulkMailReq): Promise<SendBulkMailRes>;
    RunBulkMailDataSource(request: RunBulkMailDataSourceReq): Promise<RunBulkMailDataSourceRes>;
    UpdateBulkMail(request: UpdateBulkMailReq): Promise<UpdateBulkMailRes>;
    TestBulkMail(request: TestBulkMailReq): Promise<TestBulkMailRes>;
    TestMailByKey(request: TestMailByKeyReq): Promise<TestMailByKeyRes>;
    SendRemindProctoredTestMail(request: TestMailByKeyReq): Promise<TestMailByKeyRes>;
    UploadCampaignMailSource(request: UploadCampaignMailSourceReq): Promise<Empty>;
    RemoveCampaignMailUploadedSource(request: GetReportReq): Promise<TestMailByKeyRes>;
    GetProgramOutcomes(request: GetProgramOutcomesReq): Promise<ProgramOutcomesRes>;
    CreateProgramOutcome(request: CreateProgramOutcomeReq): Promise<CreateProgramOutcomeRes>;
    UpdateProgramOutcome(request: UpdateProgramOutcomeReq): Promise<CreateProgramOutcomeRes>;
    DeleteProgramOutcome(request: DeleteProgramOutcomeReq): Promise<CreateProgramOutcomeRes>;
    GetCourses(request: GetProgramOutcomesReq): Promise<GetCoursesRes>;
    CreateCourse(request: CreateCourseReq): Promise<CourseRes>;
    UpdateCourse(request: UpdateCourseReq): Promise<CourseRes>;
    DeleteCourse(request: DeleteCourseReq): Promise<CourseRes>;
    GetEvaluations(request: GetProgramOutcomesReq): Promise<GetEvaluationsRes>;
    CreateEvaluation(request: CreateEvaluationReq): Promise<EvaluationRes>;
    UpdateEvaluation(request: UpdateEvaluationReq): Promise<EvaluationRes>;
    DeleteEvaluation(request: DeleteEvaluationReq): Promise<EvaluationRes>;
    GetAccreditationSettings(request: GetProgramOutcomesReq): Promise<GetAccSettingRes>;
    UpdateAccreditationSetting(request: UpdateAccSettingReq): Promise<UpdateAccSettingRes>;
    GetAccreditationReports(request: GetAccReportReq): Promise<GetAccReportRes>;
    GetAccreditationAttainments(request: GetAccAttReq): Promise<GetAccAttRes>;
    TeacherByExam(request: GetReportReq): Promise<TeacherByExamRes>;
    MapTestToClassroom(request: MapTestToClassroomReq): Promise<Empty>;
    GetNews(request: GetNewsReq): Promise<GetNewsRes>;
    CreateNews(request: CreateNewsReq): Promise<NewsRes>;
    UpdateNews(request: UpdateNewsReq): Promise<NewsRes>;
}

@Injectable()
export class AdminGrpcServiceClientImpl implements AdminGrpcInterface {
    private adminGrpcServiceClient: AdminGrpcInterface;
    private readonly logger = new Logger(AdminGrpcServiceClientImpl.name);

    constructor(
        @Inject('authGrpcService') private adminGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.adminGrpcServiceClient = this.adminGrpcClient.getService<AdminGrpcInterface>(
            protobufAdminService
        )
        this.logger.debug('gRPC client initialized');
    }

    async ExportExamDataWordTemplate(request: ExportExamDataWordTemplateReq): Promise<Empty> {
        return await this.adminGrpcServiceClient.ExportExamDataWordTemplate(request);
    }

    async GetReportData(request: GetReportDataReq): Promise<GetReportDataRes> {
        return await this.adminGrpcServiceClient.GetReportData(request);
    }

    async GetReports(request: GetReportsReq): Promise<GetReportsRes> {
        return await this.adminGrpcServiceClient.GetReports(request);
    }

    async GetReport(request: GetReportReq): Promise<Report> {
        return await this.adminGrpcServiceClient.GetReport(request);
    }

    async GetPowerBIEmbedToken(request: GetPowerBIEmbedTokenReq): Promise<GetPowerBIEmbedTokenRes> {
        return await this.adminGrpcServiceClient.GetPowerBIEmbedToken(request);
    }

    async DownloadReport(request: GetPowerBIEmbedTokenReq): Promise<DownloadReportRes> {
        return await this.adminGrpcServiceClient.DownloadReport(request);
    }

    async DownloadPsychoReport(request: GetPowerBIEmbedTokenReq): Promise<DownloadReportRes> {
        return await this.adminGrpcServiceClient.DownloadPsychoReport(request);
    }

    async GetMailTemplates(request: GetMailTemplatesReq): Promise<GetMailTemplatesRes> {
        return await this.adminGrpcServiceClient.GetMailTemplates(request);
    }

    async SendBulkMail(request: SendBulkMailReq): Promise<SendBulkMailRes> {
        return await this.adminGrpcServiceClient.SendBulkMail(request);
    }

    async RunBulkMailDataSource(request: RunBulkMailDataSourceReq): Promise<RunBulkMailDataSourceRes> {
        return await this.adminGrpcServiceClient.RunBulkMailDataSource(request);
    }

    async UpdateBulkMail(request: UpdateBulkMailReq): Promise<UpdateBulkMailRes> {
        return await this.adminGrpcServiceClient.UpdateBulkMail(request);
    }

    async TestBulkMail(request: TestBulkMailReq): Promise<TestBulkMailRes> {
        return await this.adminGrpcServiceClient.TestBulkMail(request);
    }

    async TestMailByKey(request: TestMailByKeyReq): Promise<TestMailByKeyRes> {
        return await this.adminGrpcServiceClient.TestMailByKey(request);
    }

    async SendRemindProctoredTestMail(request: TestMailByKeyReq): Promise<TestMailByKeyRes> {
        return await this.adminGrpcServiceClient.SendRemindProctoredTestMail(request);
    }

    async UploadCampaignMailSource(request: UploadCampaignMailSourceReq): Promise<Empty> {
        return await this.adminGrpcServiceClient.UploadCampaignMailSource(request);
    }

    async RemoveCampaignMailUploadedSource(request: GetReportReq): Promise<TestMailByKeyRes> {
        return await this.adminGrpcServiceClient.RemoveCampaignMailUploadedSource(request);
    }

    async GetProgramOutcomes(request: GetProgramOutcomesReq): Promise<ProgramOutcomesRes> {
        return await this.adminGrpcServiceClient.GetProgramOutcomes(request);
    }

    async CreateProgramOutcome(request: CreateProgramOutcomeReq): Promise<CreateProgramOutcomeRes> {
        return await this.adminGrpcServiceClient.CreateProgramOutcome(request);
    }

    async UpdateProgramOutcome(request: UpdateProgramOutcomeReq): Promise<CreateProgramOutcomeRes> {
        return await this.adminGrpcServiceClient.UpdateProgramOutcome(request);
    }

    async DeleteProgramOutcome(request: DeleteProgramOutcomeReq): Promise<CreateProgramOutcomeRes> {
        return await this.adminGrpcServiceClient.DeleteProgramOutcome(request);
    }

    async GetCourses(request: GetProgramOutcomesReq): Promise<GetCoursesRes> {
        return await this.adminGrpcServiceClient.GetCourses(request);
    }

    async CreateCourse(request: CreateCourseReq): Promise<CourseRes> {
        return await this.adminGrpcServiceClient.CreateCourse(request);
    }

    async UpdateCourse(request: UpdateCourseReq): Promise<CourseRes> {
        return await this.adminGrpcServiceClient.UpdateCourse(request);
    }

    async DeleteCourse(request: DeleteCourseReq): Promise<CourseRes> {
        return await this.adminGrpcServiceClient.DeleteCourse(request);
    }

    async GetEvaluations(request: GetProgramOutcomesReq): Promise<GetEvaluationsRes> {
        return await this.adminGrpcServiceClient.GetEvaluations(request);
    }

    async CreateEvaluation(request: CreateEvaluationReq): Promise<EvaluationRes> {
        return await this.adminGrpcServiceClient.CreateEvaluation(request);
    }

    async UpdateEvaluation(request: UpdateEvaluationReq): Promise<EvaluationRes> {
        return await this.adminGrpcServiceClient.UpdateEvaluation(request);
    }

    async DeleteEvaluation(request: DeleteEvaluationReq): Promise<EvaluationRes> {
        return await this.adminGrpcServiceClient.DeleteEvaluation(request);
    }

    async GetAccreditationSettings(request: GetAccreditationSettingsReq): Promise<GetAccSettingRes> {
        return await this.adminGrpcServiceClient.GetAccreditationSettings(request);
    }

    async UpdateAccreditationSetting(request: UpdateAccSettingReq): Promise<UpdateAccSettingRes> {
        return await this.adminGrpcServiceClient.UpdateAccreditationSetting(request);
    }

    async GetAccreditationReports(request: GetAccReportReq): Promise<GetAccReportRes> {
        return await this.adminGrpcServiceClient.GetAccreditationReports(request);
    }

    async GetAccreditationAttainments(request: GetAccAttReq): Promise<GetAccAttRes> {
        return await this.adminGrpcServiceClient.GetAccreditationAttainments(request);
    }

    async TeacherByExam(request: GetReportReq): Promise<TeacherByExamRes> {
        return await this.adminGrpcServiceClient.TeacherByExam(request);
    }

    async MapTestToClassroom(request: MapTestToClassroomReq): Promise<Empty> {
        return await this.adminGrpcServiceClient.MapTestToClassroom(request);
    }

    async GetNews(request: GetNewsReq): Promise<GetNewsRes> {
        return await this.adminGrpcServiceClient.GetNews(request);
    }

    async CreateNews(request: CreateNewsReq): Promise<NewsRes> {
        return await this.adminGrpcServiceClient.CreateNews(request);
    }

    async UpdateNews(request: UpdateNewsReq): Promise<NewsRes> {
        return await this.adminGrpcServiceClient.UpdateNews(request);
    }
}