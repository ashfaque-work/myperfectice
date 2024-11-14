import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SubjectService } from './subject.service';
import { protobufSubjectService } from '@app/common/grpc-clients/administration';
import {
  SubjectRequest, DeleteSubjectRequest, GetOneSubjectRequest, UpdateSubjectRequest, GetAllSubjectRequest,
  GetSubjectBySlugReq, GetTeachersBySubjectsReq, UpdateSubStatusReq, GetUnitsBySubReq, GetTopicsByUnitReq,
  GetPubSubReq, GetSubByTestReq, GetAttemptTrendByGradeReq, AttemptTrendReq, ImportSubjectsReq
} from '@app/common/dto/administration';

@Controller()
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) { }

  @GrpcMethod(protobufSubjectService, 'CreateSubject')
  createSubject(request: SubjectRequest) {
    return this.subjectService.createSubject(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetSubject')
  getSubject(request: GetAllSubjectRequest) {
    return this.subjectService.getSubject(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetOneSubject')
  getOneSubject(request: GetOneSubjectRequest) {
    return this.subjectService.getOneSubject(request);
  }

  @GrpcMethod(protobufSubjectService, 'UpdateSubject')
  updateSubject(request: UpdateSubjectRequest) {
    return this.subjectService.updateSubject(request);
  }

  @GrpcMethod(protobufSubjectService, 'DeleteSubject')
  deleteSubject(request: DeleteSubjectRequest) {
    return this.subjectService.deleteSubject(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetMySubjects')
  getMySubjects(request: GetAllSubjectRequest) {
    return this.subjectService.getMySubjects(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetSubjectBySlug')
  getSubjectBySlug(request: GetSubjectBySlugReq) {
    return this.subjectService.getSubjectBySlug(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetTeachersBySubjects')
  getTeachersBySubjects(request: GetTeachersBySubjectsReq) {
    return this.subjectService.getTeachersBySubjects(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetAdaptiveSubjects')
  getAdaptiveSubjects(request: GetTeachersBySubjectsReq) {
    return this.subjectService.getAdaptiveSubjects(request);
  }

  @GrpcMethod(protobufSubjectService, 'UpdateSubjectStatus')
  updateSubjectStatus(request: UpdateSubStatusReq) {
    return this.subjectService.updateSubjectStatus(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetUnitsBySub')
  getUnitsBySubject(request: GetUnitsBySubReq) {
    return this.subjectService.getUnitsBySubject(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetTopicsByUnits')
  getTopicsByUnit(request: GetTopicsByUnitReq) {
    return this.subjectService.getTopicsByUnit(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetInstituteSubjects')
  getInstituteSubjects(request: GetTopicsByUnitReq) {
    return this.subjectService.getInstituteSubjects(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetPublisherSubjects')
  getPublisherSubjects(request: GetPubSubReq) {
    return this.subjectService.getPublisherSubjects(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetSubjectList')
  getSubjectList(request: GetPubSubReq) {
    return this.subjectService.getSubjectList(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetSubjectsInAllExams')
  getSubjectsInAllExams(request: GetAllSubjectRequest) {
    return this.subjectService.getSubjectsInAllExams(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetSubjectsByTest')
  getSubjectsByTest(request: GetSubByTestReq) {
    return this.subjectService.getSubjectsByTest(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetAttemptTrend')
  getAttemptTrend(request: GetAttemptTrendByGradeReq) {
    return this.subjectService.getAttemptTrend(request);
  }

  @GrpcMethod(protobufSubjectService, 'GetSignUpTrend')
  getSignUpTrend(request: GetAttemptTrendByGradeReq) {
    return this.subjectService.getSignUpTrend(request);
  }

  @GrpcMethod(protobufSubjectService, 'AttemptTrend')
  attemptTrend(request: AttemptTrendReq) {
    return this.subjectService.attemptTrend(request);
  }

  @GrpcMethod(protobufSubjectService, 'SignUpTrend')
  signUpTrend(request: AttemptTrendReq) {
    return this.subjectService.signUpTrend(request);
  }

  @GrpcMethod(protobufSubjectService, 'QuestionAddedTrend')
  questionAddedTrend(request: AttemptTrendReq) {
    return this.subjectService.questionAddedTrend(request);
  }

  @GrpcMethod(protobufSubjectService, 'LoginTrend')
  loginTrend(request: GetAttemptTrendByGradeReq) {
    return this.subjectService.loginTrend(request);
  }

  @GrpcMethod(protobufSubjectService, 'HighestAttemptedStudent')
  highestAttemptedStudent(request: AttemptTrendReq) {
    return this.subjectService.highestAttemptedStudent(request);
  }

  @GrpcMethod(protobufSubjectService, 'MostAbandonedStudent')
  mostAbandonedStudent(request: AttemptTrendReq) {
    return this.subjectService.mostAbandonedStudent(request);
  }

  @GrpcMethod(protobufSubjectService, 'MostAbandonedTest')
  mostAbandonedTest(request: AttemptTrendReq) {
    return this.subjectService.mostAbandonedTest(request);
  }

  @GrpcMethod(protobufSubjectService, 'ImportSubjects')
  importSubjects(request: ImportSubjectsReq) {
    return this.subjectService.importSubjects(request);
  }
}
