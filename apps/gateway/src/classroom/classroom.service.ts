import {
    CreateClassroomReq, CreateClassroomRes, FindAllReq, FindAllRes, FindByIdReq, FindByIdRes, UpdateClassroomReq,
    UpdateClassroomRes, DeleteClassroomReq, DeleteClassroomRes, AddStudentsReq, AddStudentsRes, GetAllStudentsReq,
    GetAllStudentsRes, UpdateClassStatusReq, UpdateClassStatusRes, RemoveStudentReq, RemoveStudentRes, GetRequestStudentsReq,
    GetRequestStudentsRes, FindMeReq, FindMeRes, CountMeRes, GetLocationByMeRes, Classroom, GetClassroomStudentsReq,
    GetClassroomStudentsRes, FindStudentsRes, CountStudentsRes, FindTeachersRes, FindClassroomStudentsRes, CRSumAtptAllClassroomsRes,
    FindByClassRoomRes, ListSubjectStudentDoRes, SummaryQuestionBySubjectRes, ListTopicStudentDoRes, CRSummaryQuestionByTopicRes,
    CRSummaryCorrectByDateRes, ClassroomSummaryCorrectReq, ClassroomSummaryCorrectRes, GetClassRoomByLocationRes, GetFilesRes,
    GetClassroomByUserLocationRes, GetStudentsReq, GetStudentsRes, FindSubAccuracyAndSpeedRes, GetStreamingUrlAndStatusRes,
    GetAttendantsRes, CountAttendantsRes, GetAllAssignmentsRes, FindStudentRes, RecentEvaluatedAssignmentRes, GetAllAssignmentByCountRes,
    GetAllAssignmentByCountReq, GetAssignmentByIdRes, UpdateStudentAssignmentReq, UpdateStudentAssignmentRes, GetUserAssignmentReq,
    GetUserAssignmentRes, AssignAssignmentMarksReq, AssignAssignmentMarksRes, GetAllUserAssignmentRes, CreateAssignmentReq,
    CreateAssignmentRes, GetTeacherAssignmentsReq, GetTeacherAssignmentsRes, UpdateTeacherAssignmentsStatusReq, UpdateTeacherAssignmentsStatusRes,
    DeleteTeacherAssignmentReq, EditTeacherAssignmentReq, GetWbSessionsRes, AddFolderItemReq, AddFolderItemRes, ResetWbSessionRes,
    UpdateAttendantReq, UpdateAttendantRes, UpdateSteamingStatusReq, UpdateSteamingStatusRes, UpdateStudentStatusReq, UpdateStudentStatusRes,
    SaveAsReq, SaveAsRes, StartWbSessionReq, StartWbSessionRes, DeleteFolderItemReq, DeleteFolderItemRes, GetMentorStudentsRes,
    GetMentoringTimeReq, GetMentoringTimeRes, GetPracticeTimeReq, GetPracticeTimeRes, GetLearningTimeRes, GetLeastPracticeTimeRes,
    GetMentorStudentRes, TodayAttemptQuestionsRes, GetClassroomStudentRes, FindReviewStudentsRes, GetAssignedTasksRes,
    AssignMentorTasksReq, GetStudentAssignedTasksRes, AddToClsWatchListReq, AssignMentorTasksRes, GetWatchListStatusRes, SetDailyGoalsReq,
    GetSessionInfoRes, JoinSessionRes, GetRecordingsRes, GetClassroomLeaderBoardRes, GetPublicMentorStudentsRes, CheckAllowAddReq,
    CheckAllowAddRes, ImportStudentReq, Empty, ImportMentorReq, ImportStudentAdminReq,
} from '@app/common/dto/classroom.dto';
import { ClassroomGrpcServiceClientImpl } from '@app/common/grpc-clients/classroom';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClassroomService {
    constructor(private classroomGrpcServiceClientImpl: ClassroomGrpcServiceClientImpl) { }

    async findAll(request: FindAllReq): Promise<FindAllRes> {
        return await this.classroomGrpcServiceClientImpl.FindAll(request);
    }

    async findMe(request: FindMeReq): Promise<FindMeRes> {
        return await this.classroomGrpcServiceClientImpl.FindMe(request);
    }

    async countMe(request: FindMeReq): Promise<CountMeRes> {
        return await this.classroomGrpcServiceClientImpl.CountMe(request);
    }

    async getLocationByMe(request: FindMeReq): Promise<GetLocationByMeRes> {
        return await this.classroomGrpcServiceClientImpl.GetLocationByMe(request);
    }

    async findMentorClassroom(request: FindMeReq): Promise<Classroom> {
        return await this.classroomGrpcServiceClientImpl.FindMentorClassroom(request);
    }

    async findMeOneById(request: FindByIdReq): Promise<FindByIdRes> {
        return await this.classroomGrpcServiceClientImpl.FindMeOneById(request);
    }

    async findMeOne(request: FindMeReq): Promise<FindByIdRes> {
        return await this.classroomGrpcServiceClientImpl.FindMeOne(request);
    }

    async findById(request: FindByIdReq): Promise<FindByIdRes> {
        return await this.classroomGrpcServiceClientImpl.FindById(request);
    }

    async findStudents(request: FindMeReq): Promise<FindStudentsRes> {
        return await this.classroomGrpcServiceClientImpl.FindStudents(request);
    }

    async countStudents(request: FindMeReq): Promise<CountStudentsRes> {
        return await this.classroomGrpcServiceClientImpl.CountStudents(request);
    }

    async findTeachers(request: FindByIdReq): Promise<FindTeachersRes> {
        return await this.classroomGrpcServiceClientImpl.FindTeachers(request);
    }

    async findClassroomStudents(request: FindByIdReq): Promise<FindClassroomStudentsRes> {
        return await this.classroomGrpcServiceClientImpl.FindClassroomStudents(request);
    }

    async classroomSummaryAttemptedAllClassrooms(request: FindMeReq): Promise<CRSumAtptAllClassroomsRes> {
        return await this.classroomGrpcServiceClientImpl.ClassroomSummaryAttemptedAllClassrooms(request);
    }

    async findByClassRoom(request: FindMeReq): Promise<FindByClassRoomRes> {
        return await this.classroomGrpcServiceClientImpl.FindByClassRoom(request);
    }

    async countByClassRoom(request: FindMeReq): Promise<FindByClassRoomRes> {
        return await this.classroomGrpcServiceClientImpl.CountByClassRoom(request);
    }

    async listSubjectStudentDo(request: FindMeReq): Promise<ListSubjectStudentDoRes> {
        return await this.classroomGrpcServiceClientImpl.ListSubjectStudentDo(request);
    }

    async classroomSummaryQuestionBySubject(request: FindMeReq): Promise<SummaryQuestionBySubjectRes> {
        return await this.classroomGrpcServiceClientImpl.ClassroomSummaryQuestionBySubject(request);
    }

    async classroomListTopicStudentDo(request: FindMeReq): Promise<ListTopicStudentDoRes> {
        return await this.classroomGrpcServiceClientImpl.ClassroomListTopicStudentDo(request);
    }

    async classroomSummaryQuestionByTopic(request: FindMeReq): Promise<CRSummaryQuestionByTopicRes> {
        return await this.classroomGrpcServiceClientImpl.ClassroomSummaryQuestionByTopic(request);
    }

    async classroomSummaryCorrectByDate(request: FindMeReq): Promise<CRSummaryCorrectByDateRes> {
        return await this.classroomGrpcServiceClientImpl.ClassroomSummaryCorrectByDate(request);
    }

    async classroomSummaryCorrect(request: ClassroomSummaryCorrectReq): Promise<ClassroomSummaryCorrectRes> {
        return await this.classroomGrpcServiceClientImpl.ClassroomSummaryCorrect(request);
    }

    async getClassRoomByLocation(request: FindMeReq): Promise<GetClassRoomByLocationRes> {
        return await this.classroomGrpcServiceClientImpl.GetClassRoomByLocation(request);
    }

    async getClassroomLeaderBoard(request: ClassroomSummaryCorrectReq): Promise<GetClassroomLeaderBoardRes> {
        return await this.classroomGrpcServiceClientImpl.GetClassroomLeaderBoard(request);
    }

    async getFiles(request: GetAllStudentsReq): Promise<GetFilesRes> {
        return await this.classroomGrpcServiceClientImpl.GetFiles(request);
    }

    async getClassroomByUserLocation(request: FindMeReq): Promise<GetClassroomByUserLocationRes> {
        return await this.classroomGrpcServiceClientImpl.GetClassroomByUserLocation(request);
    }

    async getStudents(request: GetStudentsReq): Promise<GetStudentsRes> {
        return await this.classroomGrpcServiceClientImpl.GetStudents(request);
    }

    async findSubjectAccuracyAndSpeed(request: FindMeReq): Promise<FindSubAccuracyAndSpeedRes> {
        return await this.classroomGrpcServiceClientImpl.FindSubjectAccuracyAndSpeed(request);
    }

    async getStreamingUrlAndStatus(request: GetAllStudentsReq): Promise<GetStreamingUrlAndStatusRes> {
        return await this.classroomGrpcServiceClientImpl.GetStreamingUrlAndStatus(request);
    }

    async getAttendants(request: GetStudentsReq): Promise<GetAttendantsRes> {
        return await this.classroomGrpcServiceClientImpl.GetAttendants(request);
    }

    async countAttendants(request: GetClassroomStudentsReq): Promise<CountAttendantsRes> {
        return await this.classroomGrpcServiceClientImpl.CountAttendants(request);
    }

    async findStudent(request: FindByIdReq): Promise<FindStudentRes> {
        return await this.classroomGrpcServiceClientImpl.FindStudent(request);
    }

    async getAllAssignments(request: GetAllStudentsReq): Promise<GetAllAssignmentsRes> {
        return await this.classroomGrpcServiceClientImpl.GetAllAssignments(request);
    }

    async recentEvaluatedAssignment(request: FindMeReq): Promise<RecentEvaluatedAssignmentRes> {
        return await this.classroomGrpcServiceClientImpl.RecentEvaluatedAssignment(request);
    }

    async getAllAssignmentByCount(request: GetAllAssignmentByCountReq): Promise<GetAllAssignmentByCountRes> {
        return await this.classroomGrpcServiceClientImpl.GetAllAssignmentByCount(request);
    }

    async getAssignmentById(request: GetAllAssignmentByCountReq): Promise<GetAssignmentByIdRes> {
        return await this.classroomGrpcServiceClientImpl.GetAssignmentById(request);
    }

    async updateStudentAssignment(request: UpdateStudentAssignmentReq): Promise<UpdateStudentAssignmentRes> {
        return await this.classroomGrpcServiceClientImpl.UpdateStudentAssignment(request);
    }

    async getUserAssignment(request: GetUserAssignmentReq): Promise<GetUserAssignmentRes> {
        return await this.classroomGrpcServiceClientImpl.GetUserAssignment(request);
    }

    async assignAssignmentMarks(request: AssignAssignmentMarksReq): Promise<AssignAssignmentMarksRes> {
        return await this.classroomGrpcServiceClientImpl.AssignAssignmentMarks(request);
    }

    async getAllUserAssignment(request: DeleteClassroomReq): Promise<GetAllUserAssignmentRes> {
        return await this.classroomGrpcServiceClientImpl.GetAllUserAssignment(request);
    }

    async createAssignment(request: CreateAssignmentReq): Promise<CreateAssignmentRes> {
        return await this.classroomGrpcServiceClientImpl.CreateAssignment(request);
    }

    async getTeacherAssignments(request: GetTeacherAssignmentsReq): Promise<GetTeacherAssignmentsRes> {
        return await this.classroomGrpcServiceClientImpl.GetTeacherAssignments(request);
    }

    async updateTeacherAssignmentsStatus(request: UpdateTeacherAssignmentsStatusReq): Promise<UpdateTeacherAssignmentsStatusRes> {
        return await this.classroomGrpcServiceClientImpl.UpdateTeacherAssignmentsStatus(request);
    }

    async deleteTeacherAssignment(request: DeleteTeacherAssignmentReq): Promise<UpdateTeacherAssignmentsStatusRes> {
        return await this.classroomGrpcServiceClientImpl.DeleteTeacherAssignment(request);
    }

    async editTeacherAssignment(request: EditTeacherAssignmentReq): Promise<CreateAssignmentRes> {
        return await this.classroomGrpcServiceClientImpl.EditTeacherAssignment(request);
    }

    async getWbSessions(request: FindMeReq): Promise<GetWbSessionsRes> {
        return await this.classroomGrpcServiceClientImpl.GetWbSessions(request);
    }

    async addFolderItem(request: AddFolderItemReq): Promise<AddFolderItemRes> {
        return await this.classroomGrpcServiceClientImpl.AddFolderItem(request);
    }

    async updateClassroom(request: UpdateClassroomReq): Promise<UpdateClassroomRes> {
        return await this.classroomGrpcServiceClientImpl.UpdateClassroom(request);
    }

    async resetWbSession(request: GetAllStudentsReq): Promise<ResetWbSessionRes> {
        return await this.classroomGrpcServiceClientImpl.ResetWbSession(request);
    }

    async updateAttendant(request: UpdateAttendantReq): Promise<UpdateAttendantRes> {
        return await this.classroomGrpcServiceClientImpl.UpdateAttendant(request);
    }

    async updateSteamingStatus(request: UpdateSteamingStatusReq): Promise<UpdateSteamingStatusRes> {
        return await this.classroomGrpcServiceClientImpl.UpdateSteamingStatus(request);
    }

    async updateStudentStatus(request: UpdateStudentStatusReq): Promise<UpdateStudentStatusRes> {
        return await this.classroomGrpcServiceClientImpl.UpdateStudentStatus(request);
    }

    async saveAs(request: SaveAsReq): Promise<SaveAsRes> {
        return await this.classroomGrpcServiceClientImpl.SaveAs(request);
    }

    async createClassroom(request: CreateClassroomReq): Promise<CreateClassroomRes> {
        return await this.classroomGrpcServiceClientImpl.CreateClassroom(request);
    }

    async startWbSession(request: StartWbSessionReq): Promise<StartWbSessionRes> {
        return await this.classroomGrpcServiceClientImpl.StartWbSession(request);
    }

    async addStudents(request: AddStudentsReq): Promise<AddStudentsRes> {
        return await this.classroomGrpcServiceClientImpl.AddStudents(request);
    }

    async removeStudent(request: RemoveStudentReq): Promise<RemoveStudentRes> {
        return await this.classroomGrpcServiceClientImpl.RemoveStudent(request);
    }

    async checkAllowAdd(request: CheckAllowAddReq): Promise<CheckAllowAddRes> {
        return await this.classroomGrpcServiceClientImpl.CheckAllowAdd(request);
    }

    async importStudent(request: ImportStudentReq): Promise<Empty> {
        return await this.classroomGrpcServiceClientImpl.ImportStudent(request);
    }

    async importMentor(request: ImportMentorReq): Promise<Empty> {
        return await this.classroomGrpcServiceClientImpl.ImportMentor(request);
    }

    async importStudentAdmin(request: ImportStudentAdminReq): Promise<Empty> {
        return await this.classroomGrpcServiceClientImpl.ImportStudentAdmin(request);
    }

    async getClassroomStudents(request: GetClassroomStudentsReq): Promise<GetClassroomStudentsRes> {
        return await this.classroomGrpcServiceClientImpl.GetClassroomStudents(request);
    }

    async getAllStudents(request: GetAllStudentsReq): Promise<GetAllStudentsRes> {
        return await this.classroomGrpcServiceClientImpl.GetAllStudents(request);
    }

    async updateClassStatus(request: UpdateClassStatusReq): Promise<UpdateClassStatusRes> {
        return await this.classroomGrpcServiceClientImpl.UpdateClassStatus(request);
    }

    async deleteClassroom(request: DeleteClassroomReq): Promise<DeleteClassroomRes> {
        return await this.classroomGrpcServiceClientImpl.DeleteClassroom(request);
    }

    async deleteFolderItem(request: DeleteFolderItemReq): Promise<DeleteFolderItemRes> {
        return await this.classroomGrpcServiceClientImpl.DeleteFolderItem(request);
    }

    async getRequestStudents(request: GetRequestStudentsReq): Promise<GetRequestStudentsRes> {
        return await this.classroomGrpcServiceClientImpl.GetRequestStudent(request);
    }

    async getMentorStudents(request: FindByIdReq): Promise<GetMentorStudentsRes> {
        return await this.classroomGrpcServiceClientImpl.GetMentorStudents(request);
    }

    async getMentoringTime(request: GetMentoringTimeReq): Promise<GetMentoringTimeRes> {
        return await this.classroomGrpcServiceClientImpl.GetMentoringTime(request);
    }

    async getPracticeTime(request: GetPracticeTimeReq): Promise<GetPracticeTimeRes> {
        return await this.classroomGrpcServiceClientImpl.GetPracticeTime(request);
    }

    async getLearningTime(request: GetPracticeTimeReq): Promise<GetLearningTimeRes> {
        return await this.classroomGrpcServiceClientImpl.GetLearningTime(request);
    }

    async getLeastPracticeTime(request: GetAllStudentsReq): Promise<GetLeastPracticeTimeRes> {
        return await this.classroomGrpcServiceClientImpl.GetLeastPracticeTime(request);
    }

    async getMentorStudentData(request: GetAllStudentsReq): Promise<GetMentorStudentRes> {
        return await this.classroomGrpcServiceClientImpl.GetMentorStudentData(request);
    }

    async todayAttemptQuestions(request: GetAllStudentsReq): Promise<TodayAttemptQuestionsRes> {
        return await this.classroomGrpcServiceClientImpl.TodayAttemptQuestions(request);
    }

    async getClassroomStudent(request: GetPracticeTimeReq): Promise<GetClassroomStudentRes> {
        return await this.classroomGrpcServiceClientImpl.GetClassroomStudent(request);
    }

    async findReviewStudents(request: GetAllStudentsReq): Promise<FindReviewStudentsRes> {
        return await this.classroomGrpcServiceClientImpl.FindReviewStudents(request);
    }

    async getAssignedTasks(request: GetPracticeTimeReq): Promise<GetAssignedTasksRes> {
        return await this.classroomGrpcServiceClientImpl.GetAssignedTasks(request);
    }

    async assignMentorTasks(request: AssignMentorTasksReq): Promise<AssignMentorTasksRes> {
        return await this.classroomGrpcServiceClientImpl.AssignMentorTasks(request);
    }

    async getStudentAssignedTasks(request: GetAllStudentsReq): Promise<GetStudentAssignedTasksRes> {
        return await this.classroomGrpcServiceClientImpl.GetStudentAssignedTasks(request);
    }

    async addToClsWatchList(request: AddToClsWatchListReq): Promise<AssignMentorTasksRes> {
        return await this.classroomGrpcServiceClientImpl.AddToClsWatchList(request);
    }

    async getWatchListStatus(request: GetPracticeTimeReq): Promise<GetWatchListStatusRes> {
        return await this.classroomGrpcServiceClientImpl.GetWatchListStatus(request);
    }

    async setDailyGoals(request: SetDailyGoalsReq): Promise<AssignMentorTasksRes> {
        return await this.classroomGrpcServiceClientImpl.SetDailyGoals(request);
    }

    async getSessionInfo(request: GetAllStudentsReq): Promise<GetSessionInfoRes> {
        return await this.classroomGrpcServiceClientImpl.GetSessionInfo(request);
    }

    async joinSession(request: DeleteClassroomReq): Promise<JoinSessionRes> {
        return await this.classroomGrpcServiceClientImpl.JoinSession(request);
    }

    async getRecordings(request: GetAllStudentsReq): Promise<GetRecordingsRes> {
        return await this.classroomGrpcServiceClientImpl.GetRecordings(request);
    }

    async getPublicMentorStudents(request: GetAllStudentsReq): Promise<GetPublicMentorStudentsRes> {
        return await this.classroomGrpcServiceClientImpl.GetPublicMentorStudents(request);
    }
}
