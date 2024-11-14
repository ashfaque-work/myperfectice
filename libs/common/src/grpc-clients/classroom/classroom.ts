import {
    AddStudentsReq, AddStudentsRes, CreateClassroomReq, CreateClassroomRes, DeleteClassroomReq, DeleteClassroomRes,
    GetAllStudentsReq, GetAllStudentsRes, FindAllReq, FindAllRes, FindByIdReq, FindByIdRes, GetRequestStudentsReq,
    GetRequestStudentsRes, RemoveStudentReq, RemoveStudentRes, UpdateClassStatusReq, UpdateClassStatusRes, UpdateClassroomReq,
    UpdateClassroomRes, FindMeReq, FindMeRes, CountMeRes, GetLocationByMeRes, Classroom, GetClassroomStudentsReq,
    GetClassroomStudentsRes, FindStudentsRes, CountStudentsRes, FindTeachersRes, FindClassroomStudentsRes, CRSumAtptAllClassroomsRes,
    FindByClassRoomRes, ListSubjectStudentDoRes, SummaryQuestionBySubjectRes, ListTopicStudentDoRes, CRSummaryQuestionByTopicRes,
    CRSummaryCorrectByDateRes, ClassroomSummaryCorrectReq, ClassroomSummaryCorrectRes, GetClassRoomByLocationRes, GetFilesRes,
    GetClassroomByUserLocationRes, GetStudentsReq, GetStudentsRes, FindSubAccuracyAndSpeedRes, GetStreamingUrlAndStatusRes,
    GetAttendantsRes, CountAttendantsRes, GetAllAssignmentsRes, FindStudentRes, RecentEvaluatedAssignmentRes, GetAllAssignmentByCountRes,
    GetAllAssignmentByCountReq, GetAssignmentByIdRes, UpdateStudentAssignmentReq, UpdateStudentAssignmentRes, GetUserAssignmentReq,
    GetUserAssignmentRes, AssignAssignmentMarksReq, AssignAssignmentMarksRes, GetAllUserAssignmentRes, CreateAssignmentReq,
    CreateAssignmentRes, GetTeacherAssignmentsReq, GetTeacherAssignmentsRes, UpdateTeacherAssignmentsStatusReq, UpdateTeacherAssignmentsStatusRes,
    DeleteTeacherAssignmentReq, EditTeacherAssignmentReq, GetWbSessionsRes, AddFolderItemReq, AddFolderItemRes, ResetWbSessionRes,
    UpdateAttendantReq, UpdateAttendantRes, UpdateSteamingStatusReq, UpdateSteamingStatusRes, UpdateStudentStatusReq,
    UpdateStudentStatusRes, SaveAsReq, SaveAsRes, StartWbSessionReq, StartWbSessionRes, DeleteFolderItemRes, DeleteFolderItemReq,
    GetMentorStudentsRes, GetMentoringTimeReq, GetMentoringTimeRes, GetPracticeTimeReq, GetPracticeTimeRes, GetLearningTimeRes,
    GetLeastPracticeTimeRes, GetMentorStudentRes, TodayAttemptQuestionsRes, GetClassroomStudentRes, FindReviewStudentsRes, GetAssignedTasksRes,
    AssignMentorTasksReq, AssignMentorTasksRes, GetStudentAssignedTasksRes, AddToClsWatchListReq, GetWatchListStatusRes, SetDailyGoalsReq,
    GetSessionInfoRes, JoinSessionRes, GetRecordingsRes, GetClassroomLeaderBoardRes, GetPublicMentorStudentsRes, CheckAllowAddReq,
    CheckAllowAddRes, ImportStudentReq, Empty, ImportMentorReq, ImportStudentAdminReq
} from '@app/common/dto/classroom.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufClassroomPackage = 'classroom';
export const protobufClassroomService = 'ClassroomGrpcService';

export interface ClassroomGrpcInterface {
    FindAll(request: FindAllReq): Promise<FindAllRes>;
    FindMe(request: FindMeReq): Promise<FindMeRes>;
    CountMe(request: FindMeReq): Promise<CountMeRes>;
    GetLocationByMe(request: FindMeReq): Promise<GetLocationByMeRes>;
    FindMentorClassroom(request: FindMeReq): Promise<Classroom>;
    FindMeOneById(request: FindByIdReq): Promise<FindByIdRes>;
    FindMeOne(request: FindMeReq): Promise<FindByIdRes>;
    FindById(request: FindByIdReq): Promise<FindByIdRes>;
    FindStudents(request: FindMeReq): Promise<FindStudentsRes>;
    CountStudents(request: FindMeReq): Promise<CountStudentsRes>;
    FindTeachers(request: FindByIdReq): Promise<FindTeachersRes>;
    FindClassroomStudents(request: FindByIdReq): Promise<FindClassroomStudentsRes>;
    ClassroomSummaryAttemptedAllClassrooms(request: FindMeReq): Promise<CRSumAtptAllClassroomsRes>;
    FindByClassRoom(request: FindMeReq): Promise<FindByClassRoomRes>;
    CountByClassRoom(request: FindMeReq): Promise<FindByClassRoomRes>;
    ListSubjectStudentDo(request: FindMeReq): Promise<ListSubjectStudentDoRes>;
    ClassroomSummaryQuestionBySubject(request: FindMeReq): Promise<SummaryQuestionBySubjectRes>;
    ClassroomListTopicStudentDo(request: FindMeReq): Promise<ListTopicStudentDoRes>;
    ClassroomSummaryQuestionByTopic(request: FindMeReq): Promise<CRSummaryQuestionByTopicRes>;
    ClassroomSummaryCorrectByDate(request: FindMeReq): Promise<CRSummaryCorrectByDateRes>;
    ClassroomSummaryCorrect(request: ClassroomSummaryCorrectReq): Promise<ClassroomSummaryCorrectRes>;
    GetClassRoomByLocation(request: FindMeReq): Promise<GetClassRoomByLocationRes>;
    GetClassroomLeaderBoard(request: ClassroomSummaryCorrectReq): Promise<GetClassroomLeaderBoardRes>;
    GetFiles(request: GetAllStudentsReq): Promise<GetFilesRes>;
    GetClassroomByUserLocation(request: FindMeReq): Promise<GetClassroomByUserLocationRes>;
    GetStudents(request: GetStudentsReq): Promise<GetStudentsRes>;
    FindSubjectAccuracyAndSpeed(request: FindMeReq): Promise<FindSubAccuracyAndSpeedRes>;
    GetStreamingUrlAndStatus(request: GetAllStudentsReq): Promise<GetStreamingUrlAndStatusRes>;
    GetAttendants(request: GetStudentsReq): Promise<GetAttendantsRes>;
    CountAttendants(request: GetClassroomStudentsReq): Promise<CountAttendantsRes>;
    FindStudent(request: FindByIdReq): Promise<FindStudentRes>;
    GetAllAssignments(request: GetAllStudentsReq): Promise<GetAllAssignmentsRes>;
    RecentEvaluatedAssignment(request: FindMeReq): Promise<RecentEvaluatedAssignmentRes>;
    GetAllAssignmentByCount(request: GetAllAssignmentByCountReq): Promise<GetAllAssignmentByCountRes>;
    GetAssignmentById(request: GetAllAssignmentByCountReq): Promise<GetAssignmentByIdRes>;
    UpdateStudentAssignment(request: UpdateStudentAssignmentReq): Promise<UpdateStudentAssignmentRes>;
    GetUserAssignment(request: GetUserAssignmentReq): Promise<GetUserAssignmentRes>;
    AssignAssignmentMarks(request: AssignAssignmentMarksReq): Promise<AssignAssignmentMarksRes>;
    GetAllUserAssignment(request: DeleteClassroomReq): Promise<GetAllUserAssignmentRes>;
    CreateAssignment(request: CreateAssignmentReq): Promise<CreateAssignmentRes>;
    GetTeacherAssignments(request: GetTeacherAssignmentsReq): Promise<GetTeacherAssignmentsRes>;
    UpdateTeacherAssignmentsStatus(request: UpdateTeacherAssignmentsStatusReq): Promise<UpdateTeacherAssignmentsStatusRes>;
    DeleteTeacherAssignment(request: DeleteTeacherAssignmentReq): Promise<UpdateTeacherAssignmentsStatusRes>;
    EditTeacherAssignment(request: EditTeacherAssignmentReq): Promise<CreateAssignmentRes>;
    GetWbSessions(request: FindMeReq): Promise<GetWbSessionsRes>;
    AddFolderItem(request: AddFolderItemReq): Promise<AddFolderItemRes>;
    UpdateClassroom(request: UpdateClassroomReq): Promise<UpdateClassroomRes>;
    ResetWbSession(request: GetAllStudentsReq): Promise<ResetWbSessionRes>;
    UpdateAttendant(request: UpdateAttendantReq): Promise<UpdateAttendantRes>;
    UpdateSteamingStatus(request: UpdateSteamingStatusReq): Promise<UpdateSteamingStatusRes>;
    UpdateStudentStatus(request: UpdateStudentStatusReq): Promise<UpdateStudentStatusRes>;
    SaveAs(request: SaveAsReq): Promise<SaveAsRes>;
    CreateClassroom(request: CreateClassroomReq): Promise<CreateClassroomRes>;
    StartWbSession(request: StartWbSessionReq): Promise<StartWbSessionRes>;
    AddStudents(request: AddStudentsReq): Promise<AddStudentsRes>;
    GetClassroomStudents(request: GetClassroomStudentsReq): Promise<GetClassroomStudentsRes>;
    GetAllStudents(request: GetAllStudentsReq): Promise<GetAllStudentsRes>;
    UpdateClassStatus(request: UpdateClassStatusReq): Promise<UpdateClassStatusRes>;
    DeleteClassroom(request: DeleteClassroomReq): Promise<DeleteClassroomRes>;
    DeleteFolderItem(request: DeleteFolderItemReq): Promise<DeleteFolderItemRes>;
    RemoveStudent(request: RemoveStudentReq): Promise<RemoveStudentRes>;
    CheckAllowAdd(request: CheckAllowAddReq): Promise<CheckAllowAddRes>;
    ImportStudent(request: ImportStudentReq): Promise<Empty>;
    ImportMentor(request: ImportMentorReq): Promise<Empty>;
    ImportStudentAdmin(request: ImportStudentAdminReq): Promise<Empty>;

    GetRequestStudent(request: GetRequestStudentsReq): Promise<GetRequestStudentsRes>;
    GetMentorStudents(request: FindByIdReq): Promise<GetMentorStudentsRes>;
    GetMentoringTime(request: GetMentoringTimeReq): Promise<GetMentoringTimeRes>;
    GetPracticeTime(request: GetPracticeTimeReq): Promise<GetPracticeTimeRes>;
    GetLearningTime(request: GetPracticeTimeReq): Promise<GetLearningTimeRes>;
    GetLeastPracticeTime(request: GetAllStudentsReq): Promise<GetLeastPracticeTimeRes>;
    GetMentorStudentData(request: GetAllStudentsReq): Promise<GetMentorStudentRes>;
    TodayAttemptQuestions(request: GetAllStudentsReq): Promise<TodayAttemptQuestionsRes>;
    GetClassroomStudent(request: GetPracticeTimeReq): Promise<GetClassroomStudentRes>;
    FindReviewStudents(request: GetAllStudentsReq): Promise<FindReviewStudentsRes>;
    GetAssignedTasks(request: GetPracticeTimeReq): Promise<GetAssignedTasksRes>;
    AssignMentorTasks(request: AssignMentorTasksReq): Promise<AssignMentorTasksRes>;
    GetStudentAssignedTasks(request: GetAllStudentsReq): Promise<GetStudentAssignedTasksRes>;
    AddToClsWatchList(request: AddToClsWatchListReq): Promise<AssignMentorTasksRes>;
    GetWatchListStatus(request: GetPracticeTimeReq): Promise<GetWatchListStatusRes>;
    SetDailyGoals(request: SetDailyGoalsReq): Promise<AssignMentorTasksRes>;
    GetSessionInfo(request: GetAllStudentsReq): Promise<GetSessionInfoRes>;
    JoinSession(request: DeleteClassroomReq): Promise<JoinSessionRes>;
    GetRecordings(request: GetAllStudentsReq): Promise<GetRecordingsRes>;
    GetPublicMentorStudents(request: GetAllStudentsReq): Promise<GetPublicMentorStudentsRes>;
}

@Injectable()
export class ClassroomGrpcServiceClientImpl implements ClassroomGrpcInterface {
    private classroomGrpcServiceClient: ClassroomGrpcInterface;
    private readonly logger = new Logger(ClassroomGrpcServiceClientImpl.name);

    constructor(
        @Inject('classroomGrpcService') private classroomGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.classroomGrpcServiceClient =
            this.classroomGrpcClient.getService<ClassroomGrpcInterface>(
                protobufClassroomService,
            );
        this.logger.debug('gRPC client initialized.');
    }

    async FindAll(request: FindAllReq): Promise<FindAllRes> {
        return await this.classroomGrpcServiceClient.FindAll(request);
    }

    async FindMe(request: FindMeReq): Promise<FindMeRes> {
        return await this.classroomGrpcServiceClient.FindMe(request);
    }

    async CountMe(request: FindMeReq): Promise<CountMeRes> {
        return await this.classroomGrpcServiceClient.CountMe(request);
    }

    async GetLocationByMe(request: FindMeReq): Promise<GetLocationByMeRes> {
        return await this.classroomGrpcServiceClient.GetLocationByMe(request);
    }

    async FindMentorClassroom(request: FindMeReq): Promise<Classroom> {
        return await this.classroomGrpcServiceClient.FindMentorClassroom(request);
    }

    async FindMeOneById(request: FindByIdReq): Promise<FindByIdRes> {
        return await this.classroomGrpcServiceClient.FindMeOneById(request);
    }

    async FindMeOne(request: FindMeReq): Promise<FindByIdRes> {
        return await this.classroomGrpcServiceClient.FindMeOne(request);
    }

    async FindById(request: FindByIdReq): Promise<FindByIdRes> {
        return await this.classroomGrpcServiceClient.FindById(request);
    }

    async FindStudents(request: FindMeReq): Promise<FindStudentsRes> {
        return await this.classroomGrpcServiceClient.FindStudents(request);
    }

    async CountStudents(request: FindMeReq): Promise<CountStudentsRes> {
        return await this.classroomGrpcServiceClient.CountStudents(request);
    }

    async FindTeachers(request: FindByIdReq): Promise<FindTeachersRes> {
        return await this.classroomGrpcServiceClient.FindTeachers(request);
    }

    async FindClassroomStudents(request: FindByIdReq): Promise<FindClassroomStudentsRes> {
        return await this.classroomGrpcServiceClient.FindClassroomStudents(request);
    }

    async ClassroomSummaryAttemptedAllClassrooms(request: FindMeReq): Promise<CRSumAtptAllClassroomsRes> {
        return await this.classroomGrpcServiceClient.ClassroomSummaryAttemptedAllClassrooms(request);
    }

    async FindByClassRoom(request: FindMeReq): Promise<FindByClassRoomRes> {
        return await this.classroomGrpcServiceClient.FindByClassRoom(request);
    }

    async CountByClassRoom(request: FindMeReq): Promise<FindByClassRoomRes> {
        return await this.classroomGrpcServiceClient.CountByClassRoom(request);
    }

    async ListSubjectStudentDo(request: FindMeReq): Promise<ListSubjectStudentDoRes> {
        return await this.classroomGrpcServiceClient.ListSubjectStudentDo(request);
    }

    async ClassroomSummaryQuestionBySubject(request: FindMeReq): Promise<SummaryQuestionBySubjectRes> {
        return await this.classroomGrpcServiceClient.ClassroomSummaryQuestionBySubject(request);
    }

    async ClassroomListTopicStudentDo(request: FindMeReq): Promise<ListTopicStudentDoRes> {
        return await this.classroomGrpcServiceClient.ClassroomListTopicStudentDo(request);
    }

    async ClassroomSummaryQuestionByTopic(request: FindMeReq): Promise<CRSummaryQuestionByTopicRes> {
        return await this.classroomGrpcServiceClient.ClassroomSummaryQuestionByTopic(request);
    }

    async ClassroomSummaryCorrectByDate(request: FindMeReq): Promise<CRSummaryCorrectByDateRes> {
        return await this.classroomGrpcServiceClient.ClassroomSummaryCorrectByDate(request);
    }

    async ClassroomSummaryCorrect(request: ClassroomSummaryCorrectReq): Promise<ClassroomSummaryCorrectRes> {
        return await this.classroomGrpcServiceClient.ClassroomSummaryCorrect(request);
    }

    async GetClassRoomByLocation(request: FindMeReq): Promise<GetClassRoomByLocationRes> {
        return await this.classroomGrpcServiceClient.GetClassRoomByLocation(request);
    }

    async GetClassroomLeaderBoard(request: ClassroomSummaryCorrectReq): Promise<GetClassroomLeaderBoardRes> {
        return await this.classroomGrpcServiceClient.GetClassroomLeaderBoard(request);
    }

    async GetFiles(request: GetAllStudentsReq): Promise<GetFilesRes> {
        return await this.classroomGrpcServiceClient.GetFiles(request);
    }

    async GetClassroomByUserLocation(request: FindMeReq): Promise<GetClassroomByUserLocationRes> {
        return await this.classroomGrpcServiceClient.GetClassroomByUserLocation(request);
    }

    async GetStudents(request: GetStudentsReq): Promise<GetStudentsRes> {
        return await this.classroomGrpcServiceClient.GetStudents(request);
    }

    async FindSubjectAccuracyAndSpeed(request: FindMeReq): Promise<FindSubAccuracyAndSpeedRes> {
        return await this.classroomGrpcServiceClient.FindSubjectAccuracyAndSpeed(request);
    }

    async GetStreamingUrlAndStatus(request: GetAllStudentsReq): Promise<GetStreamingUrlAndStatusRes> {
        return await this.classroomGrpcServiceClient.GetStreamingUrlAndStatus(request);
    }

    async GetAttendants(request: GetStudentsReq): Promise<GetAttendantsRes> {
        return await this.classroomGrpcServiceClient.GetAttendants(request);
    }

    async CountAttendants(request: GetClassroomStudentsReq): Promise<CountAttendantsRes> {
        return await this.classroomGrpcServiceClient.CountAttendants(request);
    }

    async FindStudent(request: FindByIdReq): Promise<FindStudentRes> {
        return await this.classroomGrpcServiceClient.FindStudent(request);
    }

    async GetAllAssignments(request: GetAllStudentsReq): Promise<GetAllAssignmentsRes> {
        return await this.classroomGrpcServiceClient.GetAllAssignments(request);
    }

    async RecentEvaluatedAssignment(request: FindMeReq): Promise<RecentEvaluatedAssignmentRes> {
        return await this.classroomGrpcServiceClient.RecentEvaluatedAssignment(request);
    }

    async GetAllAssignmentByCount(request: GetAllAssignmentByCountReq): Promise<GetAllAssignmentByCountRes> {
        return await this.classroomGrpcServiceClient.GetAllAssignmentByCount(request);
    }

    async GetAssignmentById(request: GetAllAssignmentByCountReq): Promise<GetAssignmentByIdRes> {
        return await this.classroomGrpcServiceClient.GetAssignmentById(request);
    }

    async UpdateStudentAssignment(request: UpdateStudentAssignmentReq): Promise<UpdateStudentAssignmentRes> {
        return await this.classroomGrpcServiceClient.UpdateStudentAssignment(request);
    }

    async GetUserAssignment(request: GetUserAssignmentReq): Promise<GetUserAssignmentRes> {
        return await this.classroomGrpcServiceClient.GetUserAssignment(request);
    }

    async AssignAssignmentMarks(request: AssignAssignmentMarksReq): Promise<AssignAssignmentMarksRes> {
        return await this.classroomGrpcServiceClient.AssignAssignmentMarks(request);
    }

    async GetAllUserAssignment(request: DeleteClassroomReq): Promise<GetAllUserAssignmentRes> {
        return await this.classroomGrpcServiceClient.GetAllUserAssignment(request);
    }

    async CreateAssignment(request: CreateAssignmentReq): Promise<CreateAssignmentRes> {
        return await this.classroomGrpcServiceClient.CreateAssignment(request);
    }

    async GetTeacherAssignments(request: GetTeacherAssignmentsReq): Promise<GetTeacherAssignmentsRes> {
        return await this.classroomGrpcServiceClient.GetTeacherAssignments(request);
    }

    async UpdateTeacherAssignmentsStatus(request: UpdateTeacherAssignmentsStatusReq): Promise<UpdateTeacherAssignmentsStatusRes> {
        return await this.classroomGrpcServiceClient.UpdateTeacherAssignmentsStatus(request);
    }

    async DeleteTeacherAssignment(request: DeleteTeacherAssignmentReq): Promise<UpdateTeacherAssignmentsStatusRes> {
        return await this.classroomGrpcServiceClient.DeleteTeacherAssignment(request);
    }

    async EditTeacherAssignment(request: EditTeacherAssignmentReq): Promise<CreateAssignmentRes> {
        return await this.classroomGrpcServiceClient.EditTeacherAssignment(request);
    }

    async GetWbSessions(request: FindMeReq): Promise<GetWbSessionsRes> {
        return await this.classroomGrpcServiceClient.GetWbSessions(request);
    }

    async AddFolderItem(request: AddFolderItemReq): Promise<AddFolderItemRes> {
        return await this.classroomGrpcServiceClient.AddFolderItem(request);
    }

    async UpdateClassroom(request: UpdateClassroomReq): Promise<UpdateClassroomRes> {
        return await this.classroomGrpcServiceClient.UpdateClassroom(request);
    }

    async ResetWbSession(request: GetAllStudentsReq): Promise<ResetWbSessionRes> {
        return await this.classroomGrpcServiceClient.ResetWbSession(request);
    }

    async UpdateAttendant(request: UpdateAttendantReq): Promise<UpdateAttendantRes> {
        return await this.classroomGrpcServiceClient.UpdateAttendant(request);
    }

    async UpdateSteamingStatus(request: UpdateSteamingStatusReq): Promise<UpdateSteamingStatusRes> {
        return await this.classroomGrpcServiceClient.UpdateSteamingStatus(request);
    }

    async UpdateStudentStatus(request: UpdateStudentStatusReq): Promise<UpdateStudentStatusRes> {
        return await this.classroomGrpcServiceClient.UpdateStudentStatus(request);
    }

    async SaveAs(request: SaveAsReq): Promise<SaveAsRes> {
        return await this.classroomGrpcServiceClient.SaveAs(request);
    }

    async CreateClassroom(request: CreateClassroomReq): Promise<CreateClassroomRes> {
        return await this.classroomGrpcServiceClient.CreateClassroom(request);
    }

    async StartWbSession(request: StartWbSessionReq): Promise<StartWbSessionRes> {
        return await this.classroomGrpcServiceClient.StartWbSession(request);
    }

    async AddStudents(request: AddStudentsReq): Promise<AddStudentsRes> {
        return await this.classroomGrpcServiceClient.AddStudents(request);
    }

    async GetClassroomStudents(request: GetClassroomStudentsReq): Promise<GetClassroomStudentsRes> {
        return await this.classroomGrpcServiceClient.GetClassroomStudents(request)
    }

    async GetAllStudents(request: GetAllStudentsReq): Promise<GetAllStudentsRes> {
        return await this.classroomGrpcServiceClient.GetAllStudents(request)
    }

    async UpdateClassStatus(request: UpdateClassStatusReq): Promise<UpdateClassStatusRes> {
        return await this.classroomGrpcServiceClient.UpdateClassStatus(request);
    }

    async DeleteClassroom(request: DeleteClassroomReq): Promise<DeleteClassroomRes> {
        return await this.classroomGrpcServiceClient.DeleteClassroom(request);
    }

    async DeleteFolderItem(request: DeleteFolderItemReq): Promise<DeleteFolderItemRes> {
        return await this.classroomGrpcServiceClient.DeleteFolderItem(request);
    }

    async RemoveStudent(request: RemoveStudentReq): Promise<RemoveStudentRes> {
        return await this.classroomGrpcServiceClient.RemoveStudent(request);
    }

    async CheckAllowAdd(request: CheckAllowAddReq): Promise<CheckAllowAddRes> {
        return await this.classroomGrpcServiceClient.CheckAllowAdd(request);
    }

    async ImportStudent(request: ImportStudentReq): Promise<Empty> {
        return await this.classroomGrpcServiceClient.ImportStudent(request);
    }

    async ImportMentor(request: ImportMentorReq): Promise<Empty> {
        return await this.classroomGrpcServiceClient.ImportMentor(request);
    }

    async ImportStudentAdmin(request: ImportStudentAdminReq): Promise<Empty> {
        return await this.classroomGrpcServiceClient.ImportStudentAdmin(request);
    }

    async GetRequestStudent(request: GetRequestStudentsReq): Promise<GetRequestStudentsRes> {
        return await this.classroomGrpcServiceClient.GetRequestStudent(request);
    }

    async GetMentorStudents(request: FindByIdReq): Promise<GetMentorStudentsRes> {
        return await this.classroomGrpcServiceClient.GetMentorStudents(request);
    }

    async GetMentoringTime(request: GetMentoringTimeReq): Promise<GetMentoringTimeRes> {
        return await this.classroomGrpcServiceClient.GetMentoringTime(request);
    }

    async GetPracticeTime(request: GetPracticeTimeReq): Promise<GetPracticeTimeRes> {
        return await this.classroomGrpcServiceClient.GetPracticeTime(request);
    }

    async GetLearningTime(request: GetPracticeTimeReq): Promise<GetLearningTimeRes> {
        return await this.classroomGrpcServiceClient.GetLearningTime(request);
    }

    async GetLeastPracticeTime(request: GetAllStudentsReq): Promise<GetLeastPracticeTimeRes> {
        return await this.classroomGrpcServiceClient.GetLeastPracticeTime(request);
    }

    async GetMentorStudentData(request: GetAllStudentsReq): Promise<GetMentorStudentRes> {
        return await this.classroomGrpcServiceClient.GetMentorStudentData(request);
    }

    async TodayAttemptQuestions(request: GetAllStudentsReq): Promise<TodayAttemptQuestionsRes> {
        return await this.classroomGrpcServiceClient.TodayAttemptQuestions(request);
    }

    async GetClassroomStudent(request: GetPracticeTimeReq): Promise<GetClassroomStudentRes> {
        return await this.classroomGrpcServiceClient.GetClassroomStudent(request);
    }

    async FindReviewStudents(request: GetAllStudentsReq): Promise<FindReviewStudentsRes> {
        return await this.classroomGrpcServiceClient.FindReviewStudents(request);
    }

    async GetAssignedTasks(request: GetPracticeTimeReq): Promise<GetAssignedTasksRes> {
        return await this.classroomGrpcServiceClient.GetAssignedTasks(request);
    }

    async AssignMentorTasks(request: AssignMentorTasksReq): Promise<AssignMentorTasksRes> {
        return await this.classroomGrpcServiceClient.AssignMentorTasks(request);
    }

    async GetStudentAssignedTasks(request: GetAllStudentsReq): Promise<GetStudentAssignedTasksRes> {
        return await this.classroomGrpcServiceClient.GetStudentAssignedTasks(request);
    }

    async AddToClsWatchList(request: AddToClsWatchListReq): Promise<AssignMentorTasksRes> {
        return await this.classroomGrpcServiceClient.AddToClsWatchList(request);
    }

    async GetWatchListStatus(request: GetPracticeTimeReq): Promise<GetWatchListStatusRes> {
        return await this.classroomGrpcServiceClient.GetWatchListStatus(request);
    }

    async SetDailyGoals(request: SetDailyGoalsReq): Promise<AssignMentorTasksRes> {
        return await this.classroomGrpcServiceClient.SetDailyGoals(request);
    }

    async GetSessionInfo(request: GetAllStudentsReq): Promise<GetSessionInfoRes> {
        return await this.classroomGrpcServiceClient.GetSessionInfo(request);
    }

    async JoinSession(request: DeleteClassroomReq): Promise<JoinSessionRes> {
        return await this.classroomGrpcServiceClient.JoinSession(request);
    }

    async GetRecordings(request: GetAllStudentsReq): Promise<GetRecordingsRes> {
        return await this.classroomGrpcServiceClient.GetRecordings(request);
    }

    async GetPublicMentorStudents(request: GetAllStudentsReq): Promise<GetPublicMentorStudentsRes> {
        return await this.classroomGrpcServiceClient.GetPublicMentorStudents(request);
    }
}
