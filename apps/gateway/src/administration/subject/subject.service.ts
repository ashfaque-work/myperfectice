import { } from '@app/common/dto/administration';
import {
    SubjectRequest, Subject, GetSubjectResponse, GetOneSubjectRequest, GetOneSubjectResponse, UpdateSubStatusReq,
    UpdateSubjectRequest, UpdateSubjectResponse, DeleteSubjectRequest, DeleteSubjectResponse, GetUnitsBySubReq,
    GetAllSubjectRequest, GetMySubjectsRequest, GetSubjectBySlugReq, GetTeachersBySubjectsReq, GetUnitsBySubRes,
    GetTeachersBySubjectsRes, GetTopicsByUnitReq, GetTopicsByUnitRes, GetInstSubReq, GetPubSubReq,Empty,
    GetSubByTestReq, GetSubByTestRes, GetAttemptTrendByGradeReq, GetAttemptTrendByGradeRes, AttemptTrendReq,
    AttemptTrendRes, SignUpTrendRes, QuestionAddedTrendRes, HighestAttemptedStudentRes, MostAbandonedTestRes,
    ImportSubjectsReq, 
} from '@app/common/dto/administration';
import { SubjectGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SubjectService {
    constructor(private subjectGrpcServiceClientImpl: SubjectGrpcServiceClientImpl) { }

    async createSubject(request: SubjectRequest): Promise<Subject> {
        return await this.subjectGrpcServiceClientImpl.CreateSubject(request);
    }

    async getSubject(request: GetAllSubjectRequest): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClientImpl.GetSubject(request);
    }

    async getOneSubject(request: GetOneSubjectRequest): Promise<GetOneSubjectResponse> {
        return await this.subjectGrpcServiceClientImpl.GetOneSubject(request);
    }

    async updateSubject(request: UpdateSubjectRequest): Promise<UpdateSubjectResponse> {
        return await this.subjectGrpcServiceClientImpl.UpdateSubject(request);
    }

    async deleteSubject(request: DeleteSubjectRequest): Promise<DeleteSubjectResponse> {
        return await this.subjectGrpcServiceClientImpl.DeleteSubject(request);
    }

    async getMySubjects(request: GetMySubjectsRequest): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClientImpl.GetMySubjects(request);
    }

    async getSubjectBySlug(request: GetSubjectBySlugReq): Promise<GetOneSubjectResponse> {
        return await this.subjectGrpcServiceClientImpl.GetSubjectBySlug(request);
    }

    async getTeachersBySubjects(request: GetTeachersBySubjectsReq): Promise<GetTeachersBySubjectsRes> {
        return await this.subjectGrpcServiceClientImpl.GetTeachersBySubjects(request);
    }

    async getAdaptiveSubjects(request: GetTeachersBySubjectsReq): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClientImpl.GetAdaptiveSubjects(request);
    }

    async updateSubjectStatus(request: UpdateSubStatusReq): Promise<UpdateSubjectResponse> {
        return await this.subjectGrpcServiceClientImpl.UpdateSubjectStatus(request);
    }

    async getUnitsBySubject(request: GetUnitsBySubReq): Promise<GetUnitsBySubRes> {
        return await this.subjectGrpcServiceClientImpl.GetUnitsBySub(request);
    }
    async getTopicsByUnits(request: GetTopicsByUnitReq): Promise<GetTopicsByUnitRes> {
        return await this.subjectGrpcServiceClientImpl.GetTopicsByUnits(request);
    }

    async getInstituteSubjects(request: GetInstSubReq): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClientImpl.GetInstituteSubjects(request);
    }

    async getPublisherSubjects(request: GetPubSubReq): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClientImpl.GetPublisherSubjects(request);
    }

    async getSubjectList(request: GetPubSubReq): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClientImpl.GetSubjectList(request);
    }

    async getSubjectsInAllExams(request: GetAllSubjectRequest): Promise<GetSubjectResponse> {
        return await this.subjectGrpcServiceClientImpl.GetSubjectsInAllExams(request);
    }

    async getSubjectsByTest(request: GetSubByTestReq): Promise<GetSubByTestRes> {
        return await this.subjectGrpcServiceClientImpl.GetSubjectsByTest(request);
    }

    async getAttemptTrend(request: GetAttemptTrendByGradeReq): Promise<GetAttemptTrendByGradeRes> {
        return await this.subjectGrpcServiceClientImpl.GetAttemptTrend(request);
    }

    async getSignUpTrend(request: GetAttemptTrendByGradeReq): Promise<GetAttemptTrendByGradeRes> {
        return await this.subjectGrpcServiceClientImpl.GetSignUpTrend(request);
    }

    async attemptTrend(request: AttemptTrendReq): Promise<AttemptTrendRes> {
        return await this.subjectGrpcServiceClientImpl.AttemptTrend(request);
    }

    async signUpTrend(request: AttemptTrendReq): Promise<SignUpTrendRes> {
        return await this.subjectGrpcServiceClientImpl.SignUpTrend(request);
    }

    async questionAddedTrend(request: AttemptTrendReq): Promise<QuestionAddedTrendRes> {
        return await this.subjectGrpcServiceClientImpl.QuestionAddedTrend(request);
    }

    async loginTrend(request: GetAttemptTrendByGradeReq): Promise<QuestionAddedTrendRes> {
        return await this.subjectGrpcServiceClientImpl.LoginTrend(request);
    }

    async highestAttemptedStudent(request: AttemptTrendReq): Promise<HighestAttemptedStudentRes> {
        return await this.subjectGrpcServiceClientImpl.HighestAttemptedStudent(request);
    }

    async mostAbandonedStudent(request: AttemptTrendReq): Promise<HighestAttemptedStudentRes> {
        return await this.subjectGrpcServiceClientImpl.MostAbandonedStudent(request);
    }

    async mostAbandonedTest(request: AttemptTrendReq): Promise<MostAbandonedTestRes> {
        return await this.subjectGrpcServiceClientImpl.MostAbandonedTest(request);
    }

    async importSubjects(request: ImportSubjectsReq): Promise<Empty> {
        return await this.subjectGrpcServiceClientImpl.ImportSubjects(request);
    }
}
