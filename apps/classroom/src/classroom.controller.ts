import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ClassroomService } from './classroom.service';
import { protobufClassroomService } from '@app/common/grpc-clients/classroom';
import {
  AddStudentsReq, CreateClassroomReq, DeleteClassroomReq, GetAllStudentsReq, FindAllReq, FindByIdReq, GetRequestStudentsReq,
  RemoveStudentReq, UpdateClassStatusReq, UpdateClassroomReq, FindMeReq, GetClassroomStudentsReq, ClassroomSummaryCorrectReq,
  GetStudentsReq, GetAllAssignmentByCountReq, UpdateStudentAssignmentReq, GetUserAssignmentReq, AssignAssignmentMarksReq, SaveAsReq,
  GetTeacherAssignmentsReq, UpdateTeacherAssignmentsStatusReq, DeleteTeacherAssignmentReq, EditTeacherAssignmentReq, CreateAssignmentReq,
  AddFolderItemReq, UpdateAttendantReq, UpdateSteamingStatusReq, UpdateStudentStatusReq, StartWbSessionReq, DeleteFolderItemReq,
  GetMentoringTimeReq, GetPracticeTimeReq, AssignMentorTasksReq, AddToClsWatchListReq, SetDailyGoalsReq, CheckAllowAddReq,
  ImportStudentReq, ImportMentorReq, ImportStudentAdminReq
} from '@app/common/dto/classroom.dto';

@Controller()
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) { }

  @GrpcMethod(protobufClassroomService, 'FindAll')
  findAll(request: FindAllReq) {
    return this.classroomService.findAll(request);
  }

  @GrpcMethod(protobufClassroomService, 'FindMe')
  findMe(request: FindMeReq) {
    return this.classroomService.findMe(request);
  }

  @GrpcMethod(protobufClassroomService, 'CountMe')
  countMe(request: FindMeReq) {
    return this.classroomService.countMe(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetLocationByMe')
  getLocationByMe(request: FindMeReq) {
    return this.classroomService.getLocationByMe(request);
  }

  @GrpcMethod(protobufClassroomService, 'FindMentorClassroom')
  findMentorClassroom(request: FindMeReq) {
    return this.classroomService.findMentorClassroom(request);
  }

  @GrpcMethod(protobufClassroomService, 'FindMeOneById')
  findMeOneById(request: FindByIdReq) {
    return this.classroomService.findMeOneById(request);
  }

  @GrpcMethod(protobufClassroomService, 'FindMeOne')
  findMeOne(request: FindByIdReq) {
    return this.classroomService.findMeOne(request);
  }

  @GrpcMethod(protobufClassroomService, 'FindById')
  findById(request: FindByIdReq) {
    return this.classroomService.findById(request);
  }

  @GrpcMethod(protobufClassroomService, 'FindStudents')
  findStudents(request: FindMeReq) {
    return this.classroomService.findStudents(request);
  }

  @GrpcMethod(protobufClassroomService, 'CountStudents')
  countStudents(request: FindMeReq) {
    return this.classroomService.countStudents(request);
  }

  @GrpcMethod(protobufClassroomService, 'FindTeachers')
  findTeachers(request: FindByIdReq) {
    return this.classroomService.findTeachers(request);
  }

  @GrpcMethod(protobufClassroomService, 'FindClassroomStudents')
  findClassroomStudents(request: FindByIdReq) {
    // await this.websocketClientService.initializeSocketConnection(request.instancekey, request.token);
    // await this.websocketClientService.sendMessage(request.query.name);

    // const toUser = await this.websocketClientService.toUser(request.instancekey, request.user._id, 'account.deactivate', { reason: 'Password Changed' })
    // console.log('toUser', toUser);

    // const roles = [ 'admin', 'student' ];
    // const getOnlineUsers = await this.websocketClientService.getOnlineUsers(request.instancekey, roles)
    // console.log('getOnlineUsers', getOnlineUsers);

    // const isOnline = await this.websocketClientService.isOnline(request.instancekey, request.user._id);
    // console.log('isOnline>>>>', isOnline);

    // const isJoined = await this.websocketClientService.joinRoom(request.instancekey, request.user._id, 'class_' + request.user._id);
    // console.log('isJoined>>>>', isJoined);

    // const isLeft = await this.websocketClientService.leaveRoom(request.instancekey, request.user._id, 'class_' + request.user._id);
    // console.log('isLeft>>>>', isLeft);

    // const isNotified = await this.websocketClientService.notifyRoom(request.instancekey, 'class_' + request.user._id, 'account.deactivate', { reason: 'Password Changed' });
    // console.log('isNotified>>>>', isNotified);

    // const isNotifiedMod = await this.websocketClientService.notifyMod(request.instancekey, 'account.deactivate', { reason: 'Password Changed' });
    // console.log('isNotifiedMod>>>>', isNotifiedMod);

    // const isTestJoined = await this.websocketClientService.joinTest(request.instancekey, request.user._id, '5f681ae471adeccb23f26e61');
    // console.log('isTestJoined>>>>', isTestJoined);

    // const toTestRoom = await this.websocketClientService.toTestRoom(request.instancekey, '5f681ae471adeccb23f26e61', 'account.deactivate', { reason: 'Password Changed' });
    // console.log('toTestRoom>>>>', toTestRoom);

    // const enableChat = await this.websocketClientService.enableChat(request.instancekey, '5adadb2bef463b000dc3aac6', '668d3425817ea550ba00a3ce');
    // console.log('enableChat>>>>', enableChat);
    
    // const disableChat = await this.websocketClientService.disableChat(request.instancekey, '5adadb2bef463b000dc3aac6', '668d3425817ea550ba00a3ce');
    // console.log('disableChat>>>>', disableChat);
    return this.classroomService.findClassroomStudents(request);
  }

  @GrpcMethod(protobufClassroomService, 'ClassroomSummaryAttemptedAllClassrooms')
  classroomSummaryAttemptedAllClassrooms(request: FindMeReq) {
    return this.classroomService.classroomSummaryAttemptedAllClassrooms(request);
  }

  @GrpcMethod(protobufClassroomService, 'FindByClassRoom')
  findByClassRoom(request: FindMeReq) {
    return this.classroomService.findByClassRoom(request);
  }

  @GrpcMethod(protobufClassroomService, 'CountByClassRoom')
  countByClassRoom(request: FindMeReq) {
    return this.classroomService.countByClassRoom(request);
  }

  @GrpcMethod(protobufClassroomService, 'ListSubjectStudentDo')
  listSubjectStudentDo(request: FindMeReq) {
    return this.classroomService.listSubjectStudentDo(request);
  }

  @GrpcMethod(protobufClassroomService, 'ClassroomSummaryQuestionBySubject')
  classroomSummaryQuestionBySubject(request: FindMeReq) {
    return this.classroomService.classroomSummaryQuestionBySubject(request);
  }

  @GrpcMethod(protobufClassroomService, 'ClassroomListTopicStudentDo')
  classroomListTopicStudentDo(request: FindMeReq) {
    return this.classroomService.classroomListTopicStudentDo(request);
  }

  @GrpcMethod(protobufClassroomService, 'ClassroomSummaryQuestionByTopic')
  classroomSummaryQuestionByTopic(request: FindMeReq) {
    return this.classroomService.classroomSummaryQuestionByTopic(request);
  }

  @GrpcMethod(protobufClassroomService, 'ClassroomSummaryCorrectByDate')
  classroomSummaryCorrectByDate(request: FindMeReq) {
    return this.classroomService.classroomSummaryCorrectByDate(request);
  }

  @GrpcMethod(protobufClassroomService, 'ClassroomSummaryCorrect')
  classroomSummaryCorrect(request: ClassroomSummaryCorrectReq) {
    return this.classroomService.classroomSummaryCorrect(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetClassRoomByLocation')
  getClassRoomByLocation(request: FindMeReq) {
    return this.classroomService.getClassRoomByLocation(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetClassroomLeaderBoard')
  getClassroomLeaderBoard(request: ClassroomSummaryCorrectReq) {
    return this.classroomService.getClassroomLeaderBoard(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetFiles')
  getFiles(request: GetAllStudentsReq) {
    return this.classroomService.getFiles(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetClassroomByUserLocation')
  getClassroomByUserLocation(request: FindMeReq) {
    return this.classroomService.getClassroomByUserLocation(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetStudents')
  getStudents(request: GetStudentsReq) {
    return this.classroomService.getStudents(request);
  }

  @GrpcMethod(protobufClassroomService, 'FindSubjectAccuracyAndSpeed')
  findSubjectAccuracyAndSpeed(request: FindMeReq) {
    return this.classroomService.findSubjectAccuracyAndSpeed(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetStreamingUrlAndStatus')
  getStreamingUrlAndStatus(request: GetAllStudentsReq) {
    return this.classroomService.getStreamingUrlAndStatus(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetAttendants')
  getAttendants(request: GetStudentsReq) {
    return this.classroomService.getAttendants(request);
  }

  @GrpcMethod(protobufClassroomService, 'CountAttendants')
  countAttendants(request: GetClassroomStudentsReq) {
    return this.classroomService.countAttendants(request);
  }

  @GrpcMethod(protobufClassroomService, 'FindStudent')
  findStudent(request: FindByIdReq) {
    return this.classroomService.findStudent(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetAllAssignments')
  getAllAssignments(request: GetAllStudentsReq) {
    return this.classroomService.getAllAssignments(request);
  }

  @GrpcMethod(protobufClassroomService, 'RecentEvaluatedAssignment')
  recentEvaluatedAssignment(request: FindMeReq) {
    return this.classroomService.recentEvaluatedAssignment(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetAllAssignmentByCount')
  getAllAssignmentByCount(request: GetAllAssignmentByCountReq) {
    return this.classroomService.getAllAssignmentByCount(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetAssignmentById')
  getAssignmentById(request: GetAllAssignmentByCountReq) {
    return this.classroomService.getAssignmentById(request);
  }

  @GrpcMethod(protobufClassroomService, 'UpdateStudentAssignment')
  updateStudentAssignment(request: UpdateStudentAssignmentReq) {
    return this.classroomService.updateStudentAssignment(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetUserAssignment')
  getUserAssignment(request: GetUserAssignmentReq) {
    return this.classroomService.getUserAssignment(request);
  }

  @GrpcMethod(protobufClassroomService, 'AssignAssignmentMarks')
  assignAssignmentMarks(request: AssignAssignmentMarksReq) {
    return this.classroomService.assignAssignmentMarks(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetAllUserAssignment')
  getAllUserAssignment(request: DeleteClassroomReq) {
    return this.classroomService.getAllUserAssignment(request);
  }

  @GrpcMethod(protobufClassroomService, 'CreateAssignment')
  createAssignment(request: CreateAssignmentReq) {
    return this.classroomService.createAssignment(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetTeacherAssignments')
  getTeacherAssignments(request: GetTeacherAssignmentsReq) {
    return this.classroomService.getTeacherAssignments(request);
  }

  @GrpcMethod(protobufClassroomService, 'UpdateTeacherAssignmentsStatus')
  updateTeacherAssignmentsStatus(request: UpdateTeacherAssignmentsStatusReq) {
    return this.classroomService.updateTeacherAssignmentsStatus(request);
  }

  @GrpcMethod(protobufClassroomService, 'DeleteTeacherAssignment')
  deleteTeacherAssignment(request: DeleteTeacherAssignmentReq) {
    return this.classroomService.deleteTeacherAssignment(request);
  }

  @GrpcMethod(protobufClassroomService, 'EditTeacherAssignment')
  editTeacherAssignment(request: EditTeacherAssignmentReq) {
    return this.classroomService.editTeacherAssignment(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetWbSessions')
  getWbSessions(request: FindMeReq) {
    return this.classroomService.getWbSessions(request);
  }

  @GrpcMethod(protobufClassroomService, 'AddFolderItem')
  addFolderItem(request: AddFolderItemReq) {
    return this.classroomService.addFolderItem(request);
  }

  @GrpcMethod(protobufClassroomService, 'UpdateClassroom')
  updateClassroom(request: UpdateClassroomReq) {
    return this.classroomService.updateClassroom(request);
  }

  @GrpcMethod(protobufClassroomService, 'ResetWbSession')
  resetWbSession(request: GetAllStudentsReq) {
    return this.classroomService.resetWbSession(request);
  }

  @GrpcMethod(protobufClassroomService, 'UpdateAttendant')
  updateAttendant(request: UpdateAttendantReq) {
    return this.classroomService.updateAttendant(request);
  }

  @GrpcMethod(protobufClassroomService, 'UpdateSteamingStatus')
  updateSteamingStatus(request: UpdateSteamingStatusReq) {
    return this.classroomService.updateSteamingStatus(request);
  }

  @GrpcMethod(protobufClassroomService, 'UpdateStudentStatus')
  updateStudentStatus(request: UpdateStudentStatusReq) {
    return this.classroomService.updateStudentStatus(request);
  }

  @GrpcMethod(protobufClassroomService, 'SaveAs')
  saveAs(request: SaveAsReq) {
    return this.classroomService.saveAs(request);
  }

  @GrpcMethod(protobufClassroomService, 'CreateClassroom')
  createClassroom(request: CreateClassroomReq) {
    return this.classroomService.createClassroom(request);
  }

  @GrpcMethod(protobufClassroomService, 'StartWbSession')
  startWbSession(request: StartWbSessionReq) {
    return this.classroomService.startWbSession(request);
  }

  @GrpcMethod(protobufClassroomService, 'AddStudents')
  addStudents(request: AddStudentsReq) {
    return this.classroomService.addStudents(request);
  }

  @GrpcMethod(protobufClassroomService, 'RemoveStudent')
  removeStudent(request: RemoveStudentReq) {
    return this.classroomService.removeStudent(request);
  }

  @GrpcMethod(protobufClassroomService, 'CheckAllowAdd')
  checkAllowAdd(request: CheckAllowAddReq) {
    return this.classroomService.checkAllowAdd(request);
  }

  @GrpcMethod(protobufClassroomService, 'ImportStudent')
  importStudent(request: ImportStudentReq) {
    return this.classroomService.importStudent(request);
  }

  @GrpcMethod(protobufClassroomService, 'ImportMentor')
  importMentor(request: ImportMentorReq) {
    return this.classroomService.importMentor(request);
  }

  @GrpcMethod(protobufClassroomService, 'ImportStudentAdmin')
  importStudentAdmin(request: ImportStudentAdminReq) {
    return this.classroomService.importStudentAdmin(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetClassroomStudents')
  getClassroomStudents(request: GetClassroomStudentsReq) {
    return this.classroomService.getClassroomStudents(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetAllStudents')
  getAllStudents(request: GetAllStudentsReq) {
    return this.classroomService.getAllStudents(request);
  }

  @GrpcMethod(protobufClassroomService, 'UpdateClassStatus')
  updateClassStatus(request: UpdateClassStatusReq) {
    return this.classroomService.updateClassStatus(request);
  }

  @GrpcMethod(protobufClassroomService, 'DeleteClassroom')
  deleteClassroom(request: DeleteClassroomReq) {
    return this.classroomService.deleteClassroom(request);
  }

  @GrpcMethod(protobufClassroomService, 'DeleteFolderItem')
  deleteFolderItem(request: DeleteFolderItemReq) {
    return this.classroomService.deleteFolderItem(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetRequestStudent')
  getRequestStudent(request: GetRequestStudentsReq) {
    return this.classroomService.getRequestStudent(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetMentorStudents')
  getMentorStudents(request: FindByIdReq) {
    return this.classroomService.getMentorStudents(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetMentoringTime')
  getMentoringTime(request: GetMentoringTimeReq) {
    return this.classroomService.getMentoringTime(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetPracticeTime')
  getPracticeTime(request: GetPracticeTimeReq) {
    return this.classroomService.getPracticeTime(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetLearningTime')
  getLearningTime(request: GetPracticeTimeReq) {
    return this.classroomService.getLearningTime(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetLeastPracticeTime')
  getLeastPracticeTime(request: GetAllStudentsReq) {
    return this.classroomService.getLeastPracticeTime(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetMentorStudentData')
  getMentorStudentData(request: GetAllStudentsReq) {
    return this.classroomService.getMentorStudentData(request);
  }

  @GrpcMethod(protobufClassroomService, 'TodayAttemptQuestions')
  todayAttemptQuestions(request: GetAllStudentsReq) {
    return this.classroomService.todayAttemptQuestions(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetClassroomStudent')
  getClassroomStudent(request: GetPracticeTimeReq) {
    return this.classroomService.getClassroomStudent(request);
  }

  @GrpcMethod(protobufClassroomService, 'FindReviewStudents')
  findReviewStudents(request: GetAllStudentsReq) {
    return this.classroomService.findReviewStudents(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetAssignedTasks')
  getAssignedTasks(request: GetPracticeTimeReq) {
    return this.classroomService.getAssignedTasks(request);
  }

  @GrpcMethod(protobufClassroomService, 'AssignMentorTasks')
  assignMentorTasks(request: AssignMentorTasksReq) {
    return this.classroomService.assignMentorTasks(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetStudentAssignedTasks')
  getStudentAssignedTasks(request: GetAllStudentsReq) {
    return this.classroomService.getStudentAssignedTasks(request);
  }

  @GrpcMethod(protobufClassroomService, 'AddToClsWatchList')
  addToClsWatchList(request: AddToClsWatchListReq) {
    return this.classroomService.addToClsWatchList(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetWatchListStatus')
  getWatchListStatus(request: GetPracticeTimeReq) {
    return this.classroomService.getWatchListStatus(request);
  }

  @GrpcMethod(protobufClassroomService, 'SetDailyGoals')
  setDailyGoals(request: SetDailyGoalsReq) {
    return this.classroomService.setDailyGoals(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetSessionInfo')
  getSessionInfo(request: GetAllStudentsReq) {
    return this.classroomService.getSessionInfo(request);
  }

  @GrpcMethod(protobufClassroomService, 'JoinSession')
  joinSession(request: DeleteClassroomReq) {
    return this.classroomService.joinSession(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetRecordings')
  getRecordings(request: GetAllStudentsReq) {
    return this.classroomService.getRecordings(request);
  }

  @GrpcMethod(protobufClassroomService, 'GetPublicMentorStudents')
  getPublicMentorStudents(request: GetAllStudentsReq) {
    return this.classroomService.getPublicMentorStudents(request);
  }
}
