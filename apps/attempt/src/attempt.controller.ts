import { Controller } from '@nestjs/common';
import { AttemptService } from './attempt.service';
import { GrpcMethod } from '@nestjs/microservices';
import { protobufAttemptService } from '@app/common/grpc-clients/attempt';
import {
  AccuracyBySubjectReq, CalculateSatTotalScoreReq, ClassroomListSubjectStudentDoRequest, ClassroomListTopicStudentDoReq, ClassroomSummarySpeedByDateRequest,
  ClassroomSummarySpeedRequest, CountAllByTeacherRequest, CountAllRequest, CountByUserRequest, CountMeRequest,
  CountStudentAttemptedRequest, CountSummaryAttemptedPracticeRequest, CreateRequest, FindAllByMeRequest, FindAllByPracticeRequest,
  FindAllByTeacherRequest, FindAllNotCreatedByRequest, FindOneAttemptByMeRequest, FindOneAttemptRequest, FindOneByMeRequest,
  FindOneRequest, FindPsychoResultByTestRequest, FindQuestionFeedbackRequest, FinishPsychoTestRequest, FinishRequest,
  GetAccuracyPercentileRequest, GetAccuracyRankRequest, GetAllProvidersRequest, GetAttemptByUserReq, GetAttemptRequest,
  GetCareerAttemptsRequest, GetCareerScoreRequest, GetCareerSumReq, GetClassroomByTestRequest, GetFirstAttemptRequest,
  GetLastByMeRequest, GetLastByStudentRequest, GetListAvgSpeedByPracticeRequest, GetListPercentCorrectByPracticeRequest,
  GetListSubjectsMeRequest, GetListSubjectsStudentRequest, GetListTopicsMeRequest, GetListTopicsStudentRequest,
  GetProctoringAttemptRequest, GetPsychoClassroomRequest, GetPsychoResultRequest, GetResultPracticeRequest, GetSpeedRankRequest,
  GetTotalQuestionBySubjectMeRequest, GetTotalQuestionBySubjectStudentRequest, GetTotalQuestionTopicMeRequest,
  GetTotalQuestionTopicStudentRequest, InvitationRequest, IsAllowDoTestRequest, PartialSubmitAttemptRequest,
  QuestionByComplexityRequest, QuestionByConfidenceRequest, QuestionSubmitRequest, RecordQuestionReviewRequest, ResetItemInQueueRequest,
  SaveCamCaptureRequest, SaveQrUploadRequest, SaveScreenRecordingRequest, StartRequest, SubmitToQueueRequest, SummaryAbondonedMeRequest, SummaryAbondonedStudentRequest,
  SummaryAttemptedBySubjectMeRequest, SummaryAttemptedBySubjectStudentRequest, SummaryAttemptedPracticeRequest,
  SummaryAttemptedStudentRequest, SummaryCorrectByDateMeRequest, SummaryCorrectByDateStudentRequest, SummaryDoPracticeRequest,
  SummaryOnePracticeSetRequest, SummaryPracticeMeRequest, SummaryPracticeStudentRequest, SummaryQuestionBySubjectMeRequest,
  SummaryQuestionBySubjectStudentRequest, SummaryQuestionByTopicMeRequest, SummaryQuestionByTopicStudentRequest,
  SummarySpeedTopicByDateMeRequest, SummarySpeedTopicByDateStudentRequest, SummarySubjectCorrectByDateMeRequest,
  SummarySubjectCorrectByDateStudentRequest, SummarySubjectCorrectMeRequest, SummarySubjectCorrectStudentRequest,
  SummarySubjectSpeedByDateMeRequest, SummarySubjectSpeedByDateStudentRequest, SummarySubjectSpeedMeRequest,
  SummarySubjectSpeedStudentRequest, SummaryTopicCorrectMeRequest, SummaryTopicCorrectStudentRequest, SummaryTopicSpeedMeRequest,
  SummaryTopicSpeedStudentRequest, TopperSummaryReq, UpdateAbandonStatusRequest, UpdateSuspiciousRequest,
  UpdateTimeLimitExhaustedCountRequest
} from '@app/common/dto/attempt.dto';
import { Types } from 'mongoose';

@Controller()
export class AttemptController {

  constructor(private readonly attemptService: AttemptService) { }

  @GrpcMethod(protobufAttemptService, 'FindAllByMe')
  findAllByMe(request: FindAllByMeRequest) {
    return this.attemptService.findAllByMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetFirstAttempt')
  getFirstAttempt(request: GetFirstAttemptRequest) {
    return this.attemptService.getFirstAttempt(request)
  }

  @GrpcMethod(protobufAttemptService, 'FindQuestionFeedback')
  findQuestionFeedback(request: FindQuestionFeedbackRequest) {
    return this.attemptService.findQuestionFeedback(request)
  }

  @GrpcMethod(protobufAttemptService, 'FindOneAttemptByMe')
  findOneAttemptByMe(request: FindOneAttemptByMeRequest) {
    return this.attemptService.findOneAttemptByMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'IsAllowDoTest')
  isAllowDoTest(request: IsAllowDoTestRequest) {
    return this.attemptService.isAllowDoTest(request)
  }

  @GrpcMethod(protobufAttemptService, 'FindAllByTeacher')
  findAllByTeacher(request: FindAllByTeacherRequest) {
    return this.attemptService.findAllByTeacher(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetCurrentDate')
  getCurrentDate() {
    return this.attemptService.getCurrentDate()
  }

  @GrpcMethod(protobufAttemptService, 'CountAllByTeacher')
  countAllByTeacher(request: CountAllByTeacherRequest) {
    return this.attemptService.countAllByTeacher(request)
  }

  @GrpcMethod(protobufAttemptService, 'CountMe')
  countMe(request: CountMeRequest) {
    return this.attemptService.countMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'CountAll')
  countAll(request: CountAllRequest) {
    return this.attemptService.countAll(request)
  }

  @GrpcMethod(protobufAttemptService, 'FindAllByPractice')
  findAllByPractice(request: FindAllByPracticeRequest) {
    return this.attemptService.findAllByPractice(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetResultPractice')
  getResultPractice(request: GetResultPracticeRequest) {
    return this.attemptService.getResultPractice(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetLastByMe')
  getLastByMe(request: GetLastByMeRequest) {
    return this.attemptService.getLastByMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetLastByStudent')
  async getLastByStudent(request: GetLastByStudentRequest) {
    let condition = {
      user: new Types.ObjectId(request.userId),
      isAbandoned: false
    }
    let attempt = await this.attemptService.getLastByStudent(request, condition)
    return { attempt }
  }

  @GrpcMethod(protobufAttemptService, 'GetListAvgSpeedByPractice')
  getListAvgSpeedByPractice(request: GetListAvgSpeedByPracticeRequest) {
    return this.attemptService.getListAvgSpeedByPractice(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetListPercentCorrectByPractice')
  getListPercentCorrectByPractice(request: GetListPercentCorrectByPracticeRequest) {
    return this.attemptService.getListPercentCorrectByPractice(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetPsychoClassroom')
  getPsychoClassroom(request: GetPsychoClassroomRequest) {
    return this.attemptService.getPsychoClassroom(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetAllProviders')
  getAllProviders(request: GetAllProvidersRequest) {
    return this.attemptService.getAllProviders(request)
  }

  @GrpcMethod(protobufAttemptService, 'FindOneByMe')
  findOneByMe(request: FindOneByMeRequest) {
    return this.attemptService.findOneByMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'Invitation')
  invitation(request: InvitationRequest) {
    return this.attemptService.invitation(request)
  }

  @GrpcMethod(protobufAttemptService, 'FindAllNotCreatedBy')
  findAllNotCreatedBy(request: FindAllNotCreatedByRequest) {
    return this.attemptService.findAllNotCreatedBy(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetListSubjectsMe')
  getListSubjectsMe(request: GetListSubjectsMeRequest) {
    return this.attemptService.getListSubjectsMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetTotalQuestionTopicMe')
  getTotalQuestionTopicMe(request: GetTotalQuestionTopicMeRequest) {
    return this.attemptService.getTotalQuestionTopicMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetTotalQuestionBySubjectMe')
  getTotalQuestionBySubjectMe(request: GetTotalQuestionBySubjectMeRequest) {
    return this.attemptService.getTotalQuestionBySubjectMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetListTopicsMe')
  getListTopicsMe(request: GetListTopicsMeRequest) {
    return this.attemptService.getListTopicsMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryTopicCorrectMe')
  summaryTopicCorrectMe(request: SummaryTopicCorrectMeRequest) {
    return this.attemptService.summaryTopicCorrectMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryTopicSpeedMe')
  summaryTopicSpeedMe(request: SummaryTopicSpeedMeRequest) {
    return this.attemptService.summaryTopicSpeedMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummarySubjectCorrectMe')
  summarySubjectCorrectMe(request: SummarySubjectCorrectMeRequest) {
    return this.attemptService.summarySubjectCorrectMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummarySubjectCorrectByDateMe')
  summarySubjectCorrectByDateMe(request: SummarySubjectCorrectByDateMeRequest) {
    return this.attemptService.summarySubjectCorrectByDateMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryCorrectByDateMe')
  summaryCorrectByDateMe(request: SummaryCorrectByDateMeRequest) {
    return this.attemptService.summaryCorrectByDateMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummarySubjectSpeedByDateMe')
  summarySubjectSpeedByDateMe(request: SummarySubjectSpeedByDateMeRequest) {
    return this.attemptService.summarySubjectSpeedByDateMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryAttemptedBySubjectMe')
  summaryAttemptedBySubjectMe(request: SummaryAttemptedBySubjectMeRequest) {
    return this.attemptService.summaryAttemptedBySubjectMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummarySubjectSpeedMe')
  summarySubjectSpeedMe(request: SummarySubjectSpeedMeRequest) {
    return this.attemptService.summarySubjectSpeedMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryQuestionByTopicMe')
  summaryQuestionByTopicMe(request: SummaryQuestionByTopicMeRequest) {
    return this.attemptService.summaryQuestionByTopicMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryAbondonedMe')
  summaryAbondonedMe(request: SummaryAbondonedMeRequest) {
    return this.attemptService.summaryAbondonedMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryPracticeMe')
  summaryPracticeMe(request: SummaryPracticeMeRequest) {
    return this.attemptService.summaryPracticeMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryQuestionBySubjectMe')
  summaryQuestionBySubject(request: SummaryQuestionBySubjectMeRequest) {
    return this.attemptService.summaryQuestionBySubjectMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryDoPractice')
  summaryDoPractice(request: SummaryDoPracticeRequest) {
    return this.attemptService.summaryDoPracticeRoute(request)
  }

  @GrpcMethod(protobufAttemptService, 'QuestionByConfidence')
  questionByConfidence(request: QuestionByConfidenceRequest) {
    return this.attemptService.questionByConfidence(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummarySpeedTopicByDateMe')
  summarySpeedTopicByDateMe(request: SummarySpeedTopicByDateMeRequest) {
    return this.attemptService.summarySpeedTopicByDateMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetSpeedRank')
  getSpeedRank(request: GetSpeedRankRequest) {
    return this.attemptService.getSpeedRank(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetAccuracyRank')
  getAccuracyRank(request: GetAccuracyRankRequest) {
    return this.attemptService.getAccuracyRank(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetAccuracyPercentile')
  getAccuracyPercentile(request: GetAccuracyPercentileRequest) {
    return this.attemptService.getAccuracyPercentile(request)
  }

  @GrpcMethod(protobufAttemptService, 'ClassroomListSubjectStudentDo')
  classroomListSubjectStudentDo(request: ClassroomListSubjectStudentDoRequest) {
    return this.attemptService.classroomListSubjectStudentDo(request)
  }

  @GrpcMethod(protobufAttemptService, 'ClassroomListTopicStudentDo')
  classroomListTopicStudentDo(request: ClassroomListTopicStudentDoReq) {
    return this.attemptService.classroomListTopicStudentDo(request)
  }

  @GrpcMethod(protobufAttemptService, 'ClassroomSummaryQuestionBySubject')
  classroomSummaryQuestionBySubject(request: ClassroomListTopicStudentDoReq) {
    return this.attemptService.classroomSummaryQuestionBySubject(request)
  }

  @GrpcMethod(protobufAttemptService, 'ClassroomSummaryAttempted')
  classroomSummaryAttempted(request: ClassroomListTopicStudentDoReq) {
    return this.attemptService.classroomSummaryAttempted(request)
  }

  @GrpcMethod(protobufAttemptService, 'ClassroomSummaryAttemptedAllClassrooms')
  classroomSummaryAttemptedAllClassrooms(request: ClassroomListTopicStudentDoReq) {
    return this.attemptService.classroomSummaryAttemptedAllClassrooms(request)
  }

  @GrpcMethod(protobufAttemptService, 'ClassroomSummaryQuestionByTopic')
  classroomSummaryQuestionByTopic(request: ClassroomListTopicStudentDoReq) {
    return this.attemptService.classroomSummaryQuestionByTopic(request)
  }

  @GrpcMethod(protobufAttemptService, 'ClassroomSummaryCorrect')
  classroomSummaryCorrect(request: ClassroomListTopicStudentDoReq) {
    return this.attemptService.classroomSummaryCorrect(request)
  }

  @GrpcMethod(protobufAttemptService, 'ClassroomSummaryCorrectByDate')
  classroomSummaryCorrectByDate(request: ClassroomListTopicStudentDoReq) {
    return this.attemptService.classroomSummaryCorrectByDate(request)
  }

  @GrpcMethod(protobufAttemptService, 'Test')
  test(request: ClassroomListTopicStudentDoReq) {
    return this.attemptService.test(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetListSubjectsStudent')
  getListSubjectsStudent(request: GetListSubjectsStudentRequest) {
    return this.attemptService.getListSubjectsStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetTotalQuestionTopicStudent')
  getTotalQuestionTopicStudent(request: GetTotalQuestionTopicStudentRequest) {
    return this.attemptService.getTotalQuestionTopicStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetTotalQuestionBySubjectStudent')
  getTotalQuestionBySubjectStudent(request: GetTotalQuestionBySubjectStudentRequest) {
    return this.attemptService.getTotalQuestionBySubjectStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetListTopicsStudent')
  getListTopicsStudent(request: GetListTopicsStudentRequest) {
    return this.attemptService.getListTopicsStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryTopicSpeedStudent')
  summaryTopicSpeedStudent(request: SummaryTopicSpeedStudentRequest) {
    return this.attemptService.summaryTopicSpeedStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryTopicCorrectStudent')
  summaryTopicCorrectStudent(request: SummaryTopicCorrectStudentRequest) {
    return this.attemptService.summaryTopicCorrectStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummarySubjectCorrectStudent')
  summarySubjectCorrectStudent(request: SummarySubjectCorrectStudentRequest) {
    return this.attemptService.summarySubjectCorrectStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummarySubjectCorrectByDateStudent')
  summarySubjectCorrectByDateStudent(request: SummarySubjectCorrectByDateStudentRequest) {
    return this.attemptService.summarySubjectCorrectByDateStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummarySubjectSpeedByDateStudent')
  summarySubjectSpeedByDateStudent(request: SummarySubjectSpeedByDateStudentRequest) {
    return this.attemptService.summarySubjectSpeedByDateStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryCorrectByDateStudent')
  summaryCorrectByDateStudent(request: SummaryCorrectByDateStudentRequest) {
    return this.attemptService.summaryCorrectByDateStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryAttemptedBySubjectStudent')
  summaryAttemptedBySubjectStudent(request: SummaryAttemptedBySubjectStudentRequest) {
    return this.attemptService.summaryAttemptedBySubjectStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummarySubjectSpeedStudent')
  summarySubjectSpeedStudent(request: SummarySubjectSpeedStudentRequest) {
    return this.attemptService.summarySubjectSpeedStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryAbondonedStudent')
  summaryAbondonedStudent(request: SummaryAbondonedStudentRequest) {
    return this.attemptService.summaryAbondonedStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryPracticeStudent')
  summaryPracticeStudent(request: SummaryPracticeStudentRequest) {
    return this.attemptService.summaryPracticeStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryAttemptedStudent')
  summaryAttemptedStudent(request: SummaryAttemptedStudentRequest) {
    return this.attemptService.summaryAttemptedStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryQuestionBySubjectStudent')
  summaryQuestionBySubjectStudent(request: SummaryQuestionBySubjectStudentRequest) {
    return this.attemptService.summaryQuestionBySubjectStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummarySpeedTopicByDateStudent')
  summarySpeedTopicbyDateStudent(request: SummarySpeedTopicByDateStudentRequest) {
    return this.attemptService.summarySpeedTopicByDateStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryQuestionByTopicStudent')
  summaryQuestionByTopicStudent(request: SummaryQuestionByTopicStudentRequest) {
    return this.attemptService.summaryQuestionByTopicStudent(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryDoPracticeStudent')
  summaryDoPracticeStudent(request: SummaryDoPracticeRequest) {
    return this.attemptService.summaryDoPracticeRoute(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetSpeedRankStudent')
  getSpeedRankStudent(request: GetSpeedRankRequest) {
    return this.attemptService.getSpeedRank(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetAccuracyRankStudent')
  getAccuracyRankStudent(request: GetAccuracyRankRequest) {
    return this.attemptService.getAccuracyRank(request)
  }

  @GrpcMethod(protobufAttemptService, 'QuestionByComplexity')
  questionByComplexity(request: QuestionByComplexityRequest) {
    return this.attemptService.questionByComplexity(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetProctoringAttempt')
  getProctoringAttempt(request: GetProctoringAttemptRequest) {
    return this.attemptService.getProctoringAttempt(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryOnePracticeSet')
  summaryOnePracticeSet(request: SummaryOnePracticeSetRequest) {
    return this.attemptService.summaryOnePracticeSet(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryAttemptedPractice')
  summaryAttemptedPractice(request: SummaryAttemptedPracticeRequest) {
    return this.attemptService.summaryAttemptedPractice(request)
  }

  @GrpcMethod(protobufAttemptService, 'CountStudentAttempted')
  countStudentAttempted(request: CountStudentAttemptedRequest) {
    return this.attemptService.countStudentAttempted(request)
  }

  @GrpcMethod(protobufAttemptService, 'CountSummaryAttemptedPractice')
  countAttemptedPractice(request: CountSummaryAttemptedPracticeRequest) {
    return this.attemptService.countSummaryAttemptedPractice(request)
  }

  @GrpcMethod(protobufAttemptService, 'CountByUser')
  countByUser(request: CountByUserRequest) {
    return this.attemptService.countByUser(request)
  }

  @GrpcMethod(protobufAttemptService, 'UpdateTimeLimitExhaustedCount')
  updateTimeLimitExhaustedCount(request: UpdateTimeLimitExhaustedCountRequest) {
    return this.attemptService.updateTimeLimitExhaustedCount(request);
  }

  @GrpcMethod(protobufAttemptService, 'UpdateSuspicious')
  updateSuspicious(request: UpdateSuspiciousRequest) {
    return this.attemptService.updateSuspicious(request)
  }

  @GrpcMethod(protobufAttemptService, 'Start')
  start(request: StartRequest) {
    return this.attemptService.start(request)
  }

  @GrpcMethod(protobufAttemptService, 'FinishPsychoTest')
  finishPsychoTest(request: FinishPsychoTestRequest) {
    return this.attemptService.finishPsychoTest(request)
  }

  @GrpcMethod(protobufAttemptService, 'PartialSubmitAttempt')
  partialSubmitAttempt(request: PartialSubmitAttemptRequest) {
    return this.attemptService.partialSubmitAttempt(request)
  }

  @GrpcMethod(protobufAttemptService, 'SubmitToQueue')
  submitToQueue(request: SubmitToQueueRequest) {
    return this.attemptService.submitToQueue(request)
  }

  @GrpcMethod(protobufAttemptService, 'ResetItemInQueue')
  resetItemInQueue(request: ResetItemInQueueRequest) {
    return this.attemptService.resetItemInQueue(request)
  }

  @GrpcMethod(protobufAttemptService, 'QuestionSubmit')
  questionSubmit(request: QuestionSubmitRequest) {
    return this.attemptService.questionSubmit(request)
  }

  @GrpcMethod(protobufAttemptService, 'SaveCamCapture')
  saveCamCapture(request: SaveCamCaptureRequest) {
    return this.attemptService.saveCamCapture(request)
  }

  @GrpcMethod(protobufAttemptService, 'SaveScreenRecording')
  saveScreenRecording(request: SaveScreenRecordingRequest) {
    return this.attemptService.saveScreenRecording(request)
  }

  @GrpcMethod(protobufAttemptService, 'SaveQrUpload')
  saveQrUpload(request: SaveQrUploadRequest) {
    return this.attemptService.saveQrUpload(request)
  }

  @GrpcMethod(protobufAttemptService, 'RecordQuestionReview')
  recordQuestionReview(request: RecordQuestionReviewRequest) {
    return this.attemptService.recordQuestionReview(request)
  }

  @GrpcMethod(protobufAttemptService, 'UpdateAbandonStatus')
  updateAbandonStatus(request: UpdateAbandonStatusRequest) {
    return this.attemptService.updateAbandonStatus(request)
  }

  @GrpcMethod(protobufAttemptService, 'FindPsychoResultByTest')
  findPsychoResultByTest(request: FindPsychoResultByTestRequest) {
    return this.attemptService.findPsychoResultByTest(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetPsychoResult')
  getPsychoResult(request: GetPsychoResultRequest) {
    return this.attemptService.getPsychoResult(request)
  }

  @GrpcMethod(protobufAttemptService, "FindOneAttempt")
  findOneAttempt(request: FindOneAttemptRequest) {
    return this.attemptService.findOneAttempt(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetClassroomByTest')
  getClassroomByTest(request: GetClassroomByTestRequest) {
    return this.attemptService.getClassroomByTest(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetCareerScore')
  getCareerScore(request: GetCareerScoreRequest) {
    return this.attemptService.getCareerScore(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetAttempt')
  getAttempt(request: GetAttemptRequest) {
    return this.attemptService.getAttempt(request)
  }

  @GrpcMethod(protobufAttemptService, 'Create')
  create(request: CreateRequest) {
    return this.attemptService.create(request)
  }

  @GrpcMethod(protobufAttemptService, 'Finish')
  finish(request: FinishRequest) {
    return this.attemptService.finish(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetCareerAttempts')
  getCareerAttempts(request: GetCareerAttemptsRequest) {
    return this.attemptService.getCareerAttempts(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetCareerSum')
  getCareerSum(request: GetCareerSumReq) {
    return this.attemptService.getCareerSum(request)
  }

  @GrpcMethod(protobufAttemptService, 'FindOne')
  findOne(request: FindOneRequest) {
    return this.attemptService.findOne(request)
  }

  @GrpcMethod(protobufAttemptService, 'ClassroomSummarySpeed')
  classroomSummarySpeed(request: ClassroomSummarySpeedRequest) {
    return this.attemptService.classroomSummarySpeed(request)
  }

  @GrpcMethod(protobufAttemptService, 'ClassroomSummarySpeedByDate')
  classroomSummarySpeedByDate(request: ClassroomSummarySpeedByDateRequest) {
    return this.attemptService.classroomSummarySpeedByDate(request)
  }

  @GrpcMethod(protobufAttemptService, 'SummaryAllSubjectCorrectByDateMe')
  summaryAllSubjectCorrectByDateMe(request: SummarySubjectCorrectByDateMeRequest) {
    return this.attemptService.summaryAllSubjectCorrectByDateMe(request)
  }

  @GrpcMethod(protobufAttemptService, 'CalculateSatTotalScore')
  calculateSatTotalScore(request: CalculateSatTotalScoreReq) {
    return this.attemptService.calculateSatTotalScore(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetAttemptByUser')
  getAttemptByUser(request: GetAttemptByUserReq) {
    return this.attemptService.getAttemptByUser(request)
  }

  @GrpcMethod(protobufAttemptService, 'TopperSummary')
  topperSummary(request: TopperSummaryReq) {
    return this.attemptService.topperSummary(request)
  }

  @GrpcMethod(protobufAttemptService, 'AccuracyBySubject')
  accuracyBySubject(request: AccuracyBySubjectReq) {
    return this.attemptService.accuracyBySubject(request)
  }

  @GrpcMethod(protobufAttemptService, 'GetUserResponse')
  getUserResponse(request: CalculateSatTotalScoreReq) {
    return this.attemptService.getUserResponse(request)
  }
}
