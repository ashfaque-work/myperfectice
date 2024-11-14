import { } from '@app/common/dto/administration';
import {
    SubjectRequest, Subject, DeleteSubjectRequest, DeleteSubjectResponse, GetSubjectResponse,
    GetOneSubjectRequest, GetOneSubjectResponse, UpdateSubjectRequest, UpdateSubjectResponse,
    GetAllSubjectRequest, GetMySubjectsRequest, GetSubjectBySlugReq, GetTeachersBySubjectsReq,
    GetTeachersBySubjectsRes, UpdateSubStatusReq, GetUnitsBySubReq, GetUnitsBySubRes, MostAbandonedTestRes,
    GetTopicsByUnitReq, Empty, GetTopicsByUnitRes, GetInstSubReq, GetPubSubReq, GetSubByTestReq,
    GetSubByTestRes, GetAttemptTrendByGradeReq, GetAttemptTrendByGradeRes, AttemptTrendReq,
    AttemptTrendRes, SignUpTrendRes, QuestionAddedTrendRes, HighestAttemptedStudentRes, ImportSubjectsReq
} from '@app/common/dto/administration';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufSubjectService = 'AdministrationGrpcService';

export interface SubjectGrpcInterface {
    CreateSubject(request: SubjectRequest): Promise<Subject>;
    GetSubject(request: GetAllSubjectRequest): Promise<GetSubjectResponse>;
    GetOneSubject(request: GetOneSubjectRequest): Promise<GetOneSubjectResponse>;
    UpdateSubject(request: UpdateSubjectRequest): Promise<UpdateSubjectResponse>;
    DeleteSubject(request: DeleteSubjectRequest): Promise<DeleteSubjectResponse>;
    GetMySubjects(request: GetMySubjectsRequest): Promise<GetSubjectResponse>;
    GetSubjectBySlug(request: GetSubjectBySlugReq): Promise<GetOneSubjectResponse>;
    GetTeachersBySubjects(request: GetTeachersBySubjectsReq): Promise<GetTeachersBySubjectsRes>;
    GetAdaptiveSubjects(request: GetTeachersBySubjectsReq): Promise<GetSubjectResponse>;
    UpdateSubjectStatus(request: UpdateSubStatusReq): Promise<UpdateSubjectResponse>;
    GetUnitsBySub(request: GetUnitsBySubReq): Promise<GetUnitsBySubRes>;
    GetTopicsByUnits(request: GetTopicsByUnitReq): Promise<GetTopicsByUnitRes>;
    GetInstituteSubjects(request: GetInstSubReq): Promise<GetSubjectResponse>;
    GetPublisherSubjects(request: GetPubSubReq): Promise<GetSubjectResponse>;
    GetSubjectList(request: GetPubSubReq): Promise<GetSubjectResponse>;
    GetSubjectsInAllExams(request: GetAllSubjectRequest): Promise<GetSubjectResponse>;
    GetSubjectsByTest(request: GetSubByTestReq): Promise<GetSubByTestRes>;
    GetAttemptTrend(request: GetAttemptTrendByGradeReq): Promise<GetAttemptTrendByGradeRes>;
    GetSignUpTrend(request: GetAttemptTrendByGradeReq): Promise<GetAttemptTrendByGradeRes>;
    AttemptTrend(request: AttemptTrendReq): Promise<AttemptTrendRes>;
    SignUpTrend(request: AttemptTrendReq): Promise<SignUpTrendRes>;
    QuestionAddedTrend(request: AttemptTrendReq): Promise<QuestionAddedTrendRes>;
    LoginTrend(request: GetAttemptTrendByGradeReq): Promise<QuestionAddedTrendRes>;
    HighestAttemptedStudent(request: AttemptTrendReq): Promise<HighestAttemptedStudentRes>;
    MostAbandonedStudent(request: AttemptTrendReq): Promise<HighestAttemptedStudentRes>;
    MostAbandonedTest(request: AttemptTrendReq): Promise<MostAbandonedTestRes>;
    ImportSubjects(request: ImportSubjectsReq): Promise<Empty>;
}

@Injectable()
export class SubjectGrpcServiceClientImpl implements SubjectGrpcInterface {
    private subjectGrpcServiceClient: SubjectGrpcInterface;
    private readonly logger = new Logger(SubjectGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private subjectGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.subjectGrpcServiceClient =
            this.subjectGrpcClient.getService<SubjectGrpcInterface>(
                protobufSubjectService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async CreateSubject(request: SubjectRequest): Promise<Subject> {
        this.logger.debug('Calling CreateSubject function...');
        return await this.subjectGrpcServiceClient.CreateSubject(request);
    }

    async GetSubject(request: GetAllSubjectRequest): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClient.GetSubject(request);
    }

    async GetOneSubject(request: GetOneSubjectRequest): Promise<GetOneSubjectResponse> {
        return await this.subjectGrpcServiceClient.GetOneSubject(request);
    }

    async UpdateSubject(request: UpdateSubjectRequest): Promise<UpdateSubjectResponse> {
        return await this.subjectGrpcServiceClient.UpdateSubject(request);
    }

    async DeleteSubject(request: DeleteSubjectRequest): Promise<DeleteSubjectResponse> {
        return await this.subjectGrpcServiceClient.DeleteSubject(request);
    }

    async GetMySubjects(request: GetMySubjectsRequest): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClient.GetMySubjects(request);
    }

    async GetSubjectBySlug(request: GetSubjectBySlugReq): Promise<GetOneSubjectResponse> {
        return await this.subjectGrpcServiceClient.GetSubjectBySlug(request);
    }

    async GetTeachersBySubjects(request: GetTeachersBySubjectsReq): Promise<GetTeachersBySubjectsRes> {
        return await this.subjectGrpcServiceClient.GetTeachersBySubjects(request);
    }

    async GetAdaptiveSubjects(request: GetTeachersBySubjectsReq): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClient.GetAdaptiveSubjects(request);
    }

    async UpdateSubjectStatus(request: UpdateSubStatusReq): Promise<UpdateSubjectResponse> {
        return await this.subjectGrpcServiceClient.UpdateSubjectStatus(request);
    }

    async GetUnitsBySub(request: GetUnitsBySubReq): Promise<GetUnitsBySubRes> {
        return await this.subjectGrpcServiceClient.GetUnitsBySub(request);
    }

    async GetTopicsByUnits(request: GetTopicsByUnitReq): Promise<GetTopicsByUnitRes> {
        return await this.subjectGrpcServiceClient.GetTopicsByUnits(request);
    }

    async GetInstituteSubjects(request: GetInstSubReq): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClient.GetInstituteSubjects(request);
    }

    async GetPublisherSubjects(request: GetPubSubReq): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClient.GetPublisherSubjects(request);
    }

    async GetSubjectList(request: GetPubSubReq): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClient.GetSubjectList(request);
    }

    async GetSubjectsInAllExams(request: GetAllSubjectRequest): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClient.GetSubjectsInAllExams(request);
    }

    async GetSubjectsByTest(request: GetSubByTestReq): Promise<GetSubByTestRes> {
        return await this.subjectGrpcServiceClient.GetSubjectsByTest(request);
    }

    async GetAttemptTrend(request: GetAttemptTrendByGradeReq): Promise<GetAttemptTrendByGradeRes> {
        return await this.subjectGrpcServiceClient.GetAttemptTrend(request);
    }

    async GetSignUpTrend(request: GetAttemptTrendByGradeReq): Promise<GetAttemptTrendByGradeRes> {
        return await this.subjectGrpcServiceClient.GetSignUpTrend(request);
    }

    async AttemptTrend(request: AttemptTrendReq): Promise<AttemptTrendRes> {
        return await this.subjectGrpcServiceClient.AttemptTrend(request);
    }

    async SignUpTrend(request: AttemptTrendReq): Promise<SignUpTrendRes> {
        return await this.subjectGrpcServiceClient.SignUpTrend(request);
    }

    async QuestionAddedTrend(request: AttemptTrendReq): Promise<QuestionAddedTrendRes> {
        return await this.subjectGrpcServiceClient.QuestionAddedTrend(request);
    }

    async LoginTrend(request: GetAttemptTrendByGradeReq): Promise<QuestionAddedTrendRes> {
        return await this.subjectGrpcServiceClient.LoginTrend(request);
    }

    async HighestAttemptedStudent(request: AttemptTrendReq): Promise<HighestAttemptedStudentRes> {
        return await this.subjectGrpcServiceClient.HighestAttemptedStudent(request);
    }

    async MostAbandonedStudent(request: AttemptTrendReq): Promise<HighestAttemptedStudentRes> {
        return await this.subjectGrpcServiceClient.MostAbandonedStudent(request);
    }

    async MostAbandonedTest(request: AttemptTrendReq): Promise<MostAbandonedTestRes> {
        return await this.subjectGrpcServiceClient.MostAbandonedTest(request);
    }

    async ImportSubjects(request: ImportSubjectsReq): Promise<Empty> {
        return await this.subjectGrpcServiceClient.ImportSubjects(request);
    }
}
