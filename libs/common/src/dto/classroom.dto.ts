import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    ArrayNotEmpty, IsArray, IsBoolean, IsDateString, IsMongoId, IsNotEmpty, IsNumber,
    IsNumberString, IsObject, IsOptional, IsString, ValidateNested
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { Location, Subject } from './administration';

export interface Empty { }

export class Classroom {
    _id: string;
    name?: string;
    user?: User;
    userRole?: string;
    location?: Types.ObjectId;
    owners?: Types.ObjectId[];
    imageUrl?: string;
    showAnalysis?: boolean;
    joinByCode?: boolean;
    active?: boolean;
    seqCode?: string;
    students?: Student[];
    totalStudents?: number;
    sessionStarted?: boolean;
    sessionJoined?: boolean;
    colorCode?: string;
    allowDelete: boolean;
    stream: boolean;
    practiceIds?: string[];
    assignments?: string[];
    createdAt: Date;
    updatedAt: Date;
}

class Task {
    @ApiProperty()
    assignDate: Date;
    @ApiProperty()
    practiceId: string;
}

class Attachment {
    @ApiProperty()
    @IsString()
    url?: string;
    @ApiProperty()
    @IsString()
    name?: string;
    @ApiProperty()
    @IsString()
    type?: string;
}

class Feedback {
    @ApiProperty()
    user: string;
    @ApiProperty()
    text: string;
}

class Assignment {
    @ApiProperty()
    assignment: string;
    @ApiProperty()
    title: string;
    @ApiProperty()
    ansTitle: string;
    @ApiProperty()
    answerText: string;
    @ApiProperty()
    submittedOn: Date;
    @ApiProperty({ type: () => Attachment })
    attachments: Attachment[];
    @ApiProperty()
    evaluated: boolean;
    @ApiProperty()
    maximumMarks: number;
    @ApiProperty()
    dueDate: Date;
    @ApiProperty()
    totalMark: number;
    @ApiProperty({ type: () => Feedback })
    feedback: Feedback;
}

class Student {
    @ApiProperty()
    studentId: string;
    @ApiProperty()
    status: boolean;
    @ApiProperty()
    autoAdd: boolean;
    @ApiProperty()
    studentUserId: string;
    @ApiProperty()
    registeredAt: Date;
    // @ApiProperty({ type: () => Task })
    // tasks: Task[];
    // @ApiProperty({ type: () => Assignment })
    // assignments: Assignment[];
    name?: string;
    avatar?: string;
    provider?: string;
    facebook?: string;
    google?: string;
}

class Country {
    @ApiProperty()
    code: string;
    @ApiProperty()
    name: string;
}
class User {
    _id: string;
    roles: string[];
    activeLocation: Types.ObjectId;
    @ApiProperty({ type: [Country] })
    country?: Country[];
    subjects?: Types.ObjectId[];
    locations?: Types.ObjectId[];
    createdAt?: Date;
    userId?: string;
    email?: string;
    phoneNumber?: string;
    blockedUsers?: any[];
}

export class CreateClassroomReq {
    @ApiProperty()
    @IsString()
    name: string;
    @ApiProperty({ type: String })
    @IsMongoId()
    @IsOptional()
    location?: Types.ObjectId;
    @ApiProperty({ type: [String] })
    owners: string[];
    @ApiProperty()
    imageUrl?: string;
    @ApiProperty()
    showAnalysis: boolean;
    @ApiProperty()
    @IsBoolean()
    joinByCode: boolean;
    user?: User;
    instancekey?: string;
}

export class CreateClassroomRes {
    _id: string;
    name: string;
}

export class FindAllReq {
    location?: string;
    user?: User;
    instancekey?: string;
}

export class FindAllRes {
    @ApiProperty({ type: [Classroom] })
    response: Classroom[];
}

class Query {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    assignment?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    classroomSetting?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    includeUser?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    owners?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    includeStudentInfo?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    studentNotCount?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    checkSession?: boolean;

    @IsOptional()
    @IsNumberString()
    page?: number;

    @IsOptional()
    @IsNumberString()
    limit?: number;

    @IsOptional()
    @IsBoolean()
    home?: boolean;

    @IsOptional()
    @IsString()
    searchText?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    locations?: string;

    @IsOptional()
    @IsBoolean()
    all?: boolean;

    @IsOptional()
    @IsString()
    sort?: string;

    @IsOptional()
    @IsString()
    neClassRoom?: string;

    @IsOptional()
    @IsBoolean()
    count?: boolean;

    @IsOptional()
    @IsBoolean()
    isExport?: boolean;

    @IsOptional()
    @IsString()
    classroom?: string;

    @IsOptional()
    @IsBoolean()
    inactive?: boolean;

    @IsOptional()
    @IsBoolean()
    chatSupport?: boolean;

    @IsOptional()
    @IsString()
    interval?: string;

    @IsOptional()
    @IsString()
    practice?: string;

    @IsOptional()
    @IsBoolean()
    mymentee?: boolean;

    @IsOptional()
    @IsString()
    lastDay?: string;

    @IsOptional()
    @IsString()
    subjects?: string;

    @IsOptional()
    @IsString()
    multiStatus?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsBoolean()
    notCheckExpiresOn?: boolean;

    @IsOptional()
    @IsString()
    expired?: string;

    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @IsString()
    testMode?: string;

    @IsOptional()
    @IsString()
    levels?: string;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsString()
    topic?: string;

    @IsOptional()
    @IsString()
    locationsIds?: string;

    @IsOptional()
    @IsBoolean()
    course?: boolean;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    ongoingTest?: string;

    @IsOptional()
    @IsBoolean()
    includeCount?: boolean;

    @IsOptional()
    @IsBoolean()
    isMentee?: boolean;

    @IsOptional()
    @IsBoolean()
    isMyCircle?: boolean;
}

class ApiQuery {
    @IsOptional()
    @IsString()
    classroom?: string;
    @IsOptional()
    @IsString()
    assignment?: string;
    @IsOptional()
    @IsString()
    student?: string;
}

export class FindByIdReq {
    @ApiProperty()
    @IsString()
    _id: string;

    @ApiProperty()
    @IsString()
    instancekey: string;

    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;

    @ApiProperty({ type: User })
    user?: User;
    token?: string;
}

export class FindByIdRes {
    @ApiProperty({ type: Classroom })
    response: Classroom;
}

export class FindStudentsRes {
    @ApiProperty({ type: Classroom })
    response: Classroom;
}

export class CountStudentsRes {
    count: string;
}

export class FindTeachersRes {
    count: string;
}

export class FindClassroomStudentsRes {
    count: string;
}

export class CRSumAtptAllClassroomsRes {
    count: string;
}

export class FindByClassRoomRes {
    count: string;
}

export class ListSubjectStudentDoRes {
    count: string;
}

export class SummaryQuestionBySubjectRes {
    count: string;
}

export class ListTopicStudentDoRes {
    count: string;
}

export class CRSummaryQuestionByTopicRes {
    count: string;
}

export class ClassroomSummaryCorrectReq {
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    instancekey?: string;
}
export class ClassroomSummaryCorrectRes {
    name?: string;
}

export class GetClassroomLeaderBoardRes {
    name?: string;
}

export class CRSummaryCorrectByDateRes {
    count: string;
}

export class GetClassRoomByLocationRes {
    response: Classroom[];
}


export class GetFilesRes {
    response: string[];
}

export class GetClassroomByUserLocationRes {
    response: Classroom[];
}

export class GetStudentsReq {
    @ApiProperty()
    @IsString()
    _id: string;
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    timezoneoffset?: string;
    instancekey?: string;
    user?: User;
}
export class GetStudentsRes {
    students: Student[];
    total: number;
    message: string;
}


class SubAccuracyAndSpeed {
    subject: Subject;
    avgTimeDoQuestion: number;
    accuracyPercent: number;
    message: string;
}
export class FindSubAccuracyAndSpeedRes {
    subjects: SubAccuracyAndSpeed[];
    message: string;
}

class StreamingUrlAndStatus {
    stream: boolean;
    streamUrl: string;
}
export class GetStreamingUrlAndStatusRes {
    results: StreamingUrlAndStatus[];
}

export class GetAttendantsRes {
    students: Student[];
    message: string;
}

export class CountAttendantsRes {
    count: string;
}

export class FindStudentRes {
    count: string;
}

export class GetAllAssignmentsRes {
    count: string;
}

export class RecentEvaluatedAssignmentRes {
    count: string;
}

export class GetAllAssignmentByCountReq {
    classroom?: string;
    assignment?: string;
    teacher?: boolean;
    instancekey?: string;
    user?: User;
}

export class GetAllAssignmentByCountRes {
    error: string;
}
export class GetAssignmentByIdRes {
    status: string;
    error: string;
}

export class UpdateStudentAssignmentReq {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    classroom?: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    assignment: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    answerText: string;
    @ApiProperty({ type: [Attachment] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Attachment)
    attachments: Attachment[];
    instancekey?: string;
    user?: User;
}
export class UpdateStudentAssignmentRes {
    response: Classroom;
}

export class GetUserAssignmentReq {
    @ApiProperty({ type: ApiQuery })
    @IsOptional()
    query?: ApiQuery;
    instancekey?: string;
}
export class GetUserAssignmentRes {
    status: number;
    error: string;
}

class AssgnFeedback {
    @ApiProperty()
    user: string;
    @ApiProperty()
    text: string;
}
export class AssignAssignmentMarksReq {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    classroom?: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    assignment: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    student: string;
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    totalMark: number;
    @ApiProperty({ type: AssgnFeedback })
    @IsObject()
    @ValidateNested()
    @Type(() => AssgnFeedback)
    feedback: AssgnFeedback;
    instancekey?: string;
}
export class AssignAssignmentMarksRes {
    _id: string;
    status: number;
    error: string;
}

export class GetAllUserAssignmentRes {
    _id: string;
    status: number;
    error: string;
}

class AssignmentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;
    @ApiProperty()
    @IsString()
    @IsOptional()
    ansTitle?: string;
    @ApiProperty()
    @IsString()
    @IsOptional()
    answerText?: string;
    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;
    @ApiProperty()
    @IsString()
    @IsOptional()
    status?: 'draft' | 'published' | 'revoked';
    @ApiProperty({ type: [Attachment] })
    @IsArray()
    @Type(() => Attachment)
    attachments: Attachment[];
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    maximumMarks?: number;
    @ApiProperty()
    @Type(() => Date)
    @IsOptional()
    dueDate?: Date;
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    totalMark?: number;
}

export class CreateAssignmentReq {
    _id: string;
    @ApiProperty({ type: AssignmentDto })
    @Type(() => AssignmentDto)
    @IsNotEmpty()
    assignment: AssignmentDto;
    instancekey: string;
}
export class CreateAssignmentRes {
    status: number;
    error: string;
}

export class GetTeacherAssignmentsReq {
    _id: string;
    status?: string;
    instancekey?: string;
}
export class GetTeacherAssignmentsRes {
    status: number;
    error: string;
}

export class UpdateTeacherAssignmentsStatusReq {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    classroom: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    assignment?: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    status?: string;
    instancekey?: string;
}
export class UpdateTeacherAssignmentsStatusRes {
    _id: string;
    status: number;
    error: string;
}

export class DeleteTeacherAssignmentReq {
    classroom: string;
    assignment: string;
    instancekey: string;
}

export class EditTeacherAssignmentReq {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;
    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;
    @ApiProperty()
    @IsString()
    @IsOptional()
    status?: 'draft' | 'published' | 'revoked';
    @ApiProperty({ type: [Attachment] })
    @IsArray()
    @Type(() => Attachment)
    attachments: Attachment[];
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    maximumMarks?: number;
    @ApiProperty()
    @Type(() => Date)
    @IsOptional()
    dueDate?: Date;
    classroom: string;
    assignment: string;
    instancekey: string;
}

export class GetWbSessionsRes {
    status: number;
    error: string;
}

export class FolderItem {
    @ApiProperty()
    @IsString()
    fileName: string;
    @ApiProperty()
    @IsString()
    originalname: string;
    @ApiProperty()
    @IsString()
    fileUrl: string;
    @ApiProperty()
    @IsString()
    path: string;
    @ApiProperty()
    @IsBoolean()
    isActive: boolean;
    @ApiProperty()
    @IsString()
    type: string;
    @ApiProperty()
    @IsString()
    ownerId: string;
    @ApiProperty()
    @IsNumber()
    size: number;
    @ApiProperty()
    @IsString()
    mimeType: string;
    @ApiProperty()
    @IsString()
    thumbType: string;
}

export class AddFolderItemReq {
    @ApiProperty()
    _id: string;
    @ApiProperty({ type: FolderItem })
    @Type(() => FolderItem)
    @IsNotEmpty()
    item: FolderItem;
    instancekey: string;
}
export class AddFolderItemRes {
    fileId?: string;
    status?: number;
    error?: string;
}

export class UpdateClassroomReq extends CreateClassroomReq {
    _id: string;
}

export class UpdateClassroomRes {
    @ApiProperty()
    response: Classroom[];
}

export class ResetWbSessionRes {
    message: string;
    status: number;
}

export class UpdateAttendantReq {
    _id: string;
    @ApiProperty()
    @IsString()
    @IsOptional()
    classId?: string;
    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    admitted?: boolean;
    timezoneoffset: string;
    instancekey: string;
    user: User;
}
export class UpdateAttendantRes {
    admitted: boolean;
    status: string;
    updatedAt: string;
    message: string;
    statusCode: number;
}

export class UpdateSteamingStatusReq {
    _id: string;
    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    stream?: boolean;
    instancekey: string;
}
export class UpdateSteamingStatusRes {
    classroom: Classroom;
    message: string;
    statusCode: number;
}

export class UpdateStudentStatusReq {
    _id: string;
    @ApiProperty()
    @IsString()
    studentId: string;
    instancekey: string;
}
export class UpdateStudentStatusRes {
    message: string;
    status: number;
}

export class SaveAsReq {
    _id: string;
    @ApiProperty()
    @IsString()
    name: string;
    instancekey: string;
    user: User;
}
export class SaveAsRes {
    classroom: Classroom;
    message: string;
    status: number;
}

export class StartWbSessionReq {
    @ApiProperty()
    @IsString()
    room: string;
    @ApiProperty()
    @IsString()
    subject: string;
    @ApiProperty()
    @IsString()
    teacher: string;
    instancekey: string;
    token: string;
    ip: string;
    user: User;
}
export class StartWbSessionRes {
    message: string;
    status: number;
}

class LocationReq {
    @ApiProperty()
    @IsString()
    @IsOptional()
    _id: string;
}
export class AddStudentsReq {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    classRoom: string;

    @ApiProperty()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    studentUserId: string[];

    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => LocationReq)
    @IsOptional()
    location?: LocationReq;

    isMentee?: boolean;
    isMyCircle?: boolean;
    user?: User;
    instancekey?: string;
    token?: string;
}
export class StudentToAdd {
    @ApiProperty()
    @IsString()
    studentId?: string;

    @ApiProperty()
    @IsBoolean()
    status?: boolean;

    @ApiProperty()
    @IsBoolean()
    autoAdd?: boolean;

    @ApiProperty()
    @IsString()
    studentUserId?: string;

    @ApiProperty()
    @IsDateString()
    registeredAt?: Date;

    @ApiProperty()
    @IsBoolean()
    iRequested?: boolean;

    @ApiProperty()
    @IsOptional()
    @IsDateString()
    createdAt?: Date;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isWatchList?: boolean;

    @ApiProperty()
    @IsOptional()
    dailyGoal?: number;

    @ApiProperty()
    @IsOptional()
    tasks?: any[];

    @ApiProperty()
    @IsOptional()
    assignments?: any[];
}
export class AddStudentsRes {
    @ApiProperty({ type: [StudentToAdd] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StudentToAdd)
    students?: StudentToAdd[];

    @ApiProperty()
    @IsOptional()
    @IsString()
    classRoom?: string;

    @ApiProperty()
    @IsString()
    classroomCode: string;

    @ApiProperty()
    @IsObject()
    @IsOptional()
    institute?: object;
}

export class RemoveStudentReq {
    @ApiProperty()
    classRoomId: string;
    @ApiProperty()
    studentId: string;
    user?: User;
    instancekey?: string;
    token?: string;
}

export class RemoveStudentRes {
    message: string;
}

export class GetClassroomStudentsReq {
    @ApiProperty()
    @IsString()
    _id: string;
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    instancekey?: string;
}

export class GetClassroomStudentsRes {
    @ApiProperty({ type: [Classroom] })
    response: Classroom[];
    count?: number;
}

export class GetAllStudentsReq {
    @ApiProperty()
    _id: string;
    instancekey?: string;
}

export class GetAllStudentsRes {
    @ApiProperty({ type: [Classroom] })
    response: Classroom[]
}

export class FindMeReq {
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    user?: User;
    instancekey?: string;
    token?: string;
}

export class FindMeRes {
    @ApiProperty({ type: [Classroom] })
    response: Classroom[]
}

export class CountMeRes {
    count: number
}

export class GetLocationByMeRes {
    @ApiProperty({ type: [Location] })
    response: Location[]
}

export class UpdateClassStatusReq {
    _id: string;
    @ApiProperty()
    @IsBoolean()
    active: boolean
    instancekey?: string;
}

export class UpdateClassStatusRes {
    response: Classroom;
    statusCode?: number;
    message?: string;
}

export class DeleteClassroomReq {
    @ApiProperty()
    _id: string;
    user?: User;
    instancekey?: string;
}

export class DeleteClassroomRes {
    statusCode: string;
    message: string;
}

export class DeleteFolderItemReq {
    _id: string;
    itemId: string;
    instancekey?: string;
}

export class DeleteFolderItemRes {
    statusCode: string;
    message: string;
    result: string;
}

export class GetRequestStudentsReq {
    @ApiProperty()
    _id: string

    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    page?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    limit?: number;

    @IsOptional()
    @IsString()
    sort?: string;
    instancekey?: string;
}

export class GetRequestStudentsRes {
    @ApiProperty({ type: () => { Student } })
    response: Student[]
}

export class GetMentorStudentsRes {
    @ApiProperty({ type: () => { Student } })
    response: Student[]
}

export class GetMentoringTimeReq {
    instancekey?: string;
    user: User;
}

export class GetMentoringTimeRes {
    status?: number;
    message?: string;
}

export class GetPracticeTimeReq {
    _id: string;
    studentId?: string;
    limit?: boolean;
    instancekey: string;
}

export class GetPracticeTimeRes {
    status?: number;
    message?: string;
}

export class GetLearningTimeRes {
    status?: number;
    message?: string;
}

export class GetLeastPracticeTimeRes {
    status?: number;
    message?: string;
}

export class GetMentorStudentRes {
    status?: number;
    message?: string;
}

export class TodayAttemptQuestionsRes {
    status?: number;
    message?: string;
}

export class GetClassroomStudentRes {
    status?: number;
    message?: string;
}

export class FindReviewStudentsRes {
    status?: number;
    message?: string;
}

export class GetAssignedTasksRes {
    status?: number;
    message?: string;
}

export class AssignMentorTasksReq {
    _id: string;
    @ApiProperty({ type: [Task] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Task)
    tasks: Task[];
    @ApiProperty()
    @IsString()
    studentId: string;
    instancekey: string;
}

export class AssignMentorTasksRes {
    status?: number;
    message?: string;
}

export class GetStudentAssignedTasksRes {
    status?: number;
    message?: string;
}

export class AddToClsWatchListReq {
    _id: string;
    @ApiProperty()
    @IsString()
    studentId: string;
    @ApiProperty()
    @IsBoolean()
    status: boolean;
    instancekey: string;
}

export class GetWatchListStatusRes {
    status?: number;
    message?: string;
}

export class SetDailyGoalsReq {
    _id: string;
    @ApiProperty()
    @IsString()
    studentId: string;
    @ApiProperty()
    @IsNumber()
    goal: number;
    instancekey: string;
}

export class GetSessionInfoRes {
    status?: number;
    message?: string;
}

export class JoinSessionRes {
    status?: number;
    message?: string;
}

export class GetRecordingsRes {
    status?: number;
    message?: string;
}

export class GetPublicMentorStudentsRes {
    status?: number;
    total?: number;
}

export class CheckAllowAddReq {
    @ApiProperty()
    studentId: string;
    @ApiProperty()
    classroom: string;
    instancekey: string;
    user: User;
}
export class CheckAllowAddRes {
    msg?: string;
    allowed?: boolean;
    studentId?: string;
}

export class ImportStudentReq {
    @ApiProperty({ type: 'string', format: 'binary' })
    file?: Express.Multer.File;
    user?: User;
    instancekey?: string;
    @ApiProperty({ type: String })
    @IsNotEmpty({ message: 'classRoom is required' })
    @IsString({ message: 'classRoom must be a string' })
    classRoom: string;
    @ApiProperty({ type: String })
    @IsNotEmpty({ message: 'mentorEmail is required' })
    @IsString({ message: 'mentorEmail must be a string' })
    mentorEmail: string;
}

export class ImportMentorReq {
    @ApiProperty({ type: 'string', format: 'binary' })
    file?: Express.Multer.File;
    user?: User;
    instancekey?: string;
    @ApiProperty({ type: String })
    @IsNotEmpty({ message: 'mentorEmail is required' })
    @IsString({ message: 'mentorEmail must be a string' })
    mentorEmail: string;
}

export class ImportStudentAdminReq {
    @ApiProperty({ type: 'string', format: 'binary' })
    file?: Express.Multer.File;
    user?: User;
    instancekey?: string;
    token?: string;
    timezoneoffset?: string;
    @ApiProperty({ type: String })
    @IsNotEmpty({ message: 'resetPass is required' })
    resetPass: string;
}