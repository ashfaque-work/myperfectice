import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, Length, Matches, Max, Min, ValidateNested, isNotEmpty } from "class-validator";
import { IsEmailOrPhoneNumber, IsNotDisposableEmail, IsOfAge } from "../decorators";
import { GetUserResponse, ReqUser, UserDto } from "./user.dto";
import { Types } from "mongoose";

class SelectedCountry {
    @ApiProperty()
    @Length(2, 3)
    dialCode: string;

    @ApiProperty()
    @Length(2, 3)
    iso2Code: string;

    @ApiProperty()
    name: string;
}

// export class ReqUser{
//     _id: string;
//     name: string;
//     email: string;
//     emailVerified?: boolean;
//     status?: boolean;
//     isActive?: boolean;
//     roles: string[];
//     dossier?: Dossier;
//     userId?: string;
//     avatar?: Avatar;
//     avatarSM?: Avatar;
//     avatarMD?: Avatar;
//     phoneNumber?: string;
//     phoneNumberFull?: string;
//     isPublic?: boolean;
//     allowOnlineClass?: boolean;
//     profileCompleted?: number;
//     trainingProfileCompleted?: number;
//     country?: Country;
//     city?: string;
//     ref?: Types.ObjectId;
//     gender?: string;
//     state?: string;
//     programs?: string[];
//     subjects?: string[];
//     locations?: string[];
//     managerStudent?: boolean;
//     managerPractice?: boolean;
//     practiceViews?: string[];
//     practiceAttempted?: string[];
//     emailStudents?: string[];
//     lastLogin?: Date;
//     lastAttempt?: Date;
//     theme?: string;
//     birthdate?: Date;
//     streamUrl?: string;
//     instagram?: string;
//     studentExclusive?: boolean;
//     activeLocation?: Types.ObjectId;
//     registrationNo?: string;
//     expertise?: string;
//     forcePasswordReset?: boolean;
//     institute?: string;
//     district?: string;
//     pin?: number;
//     street?: string;
//     interest?: string;
//     knowAboutUs?: string;
//     about?: string;
//     openAI?: string;
//     interestedSubject?: string[];
//     specialization?: string[];
//     preferences?: Preference;
//     experiences?: Experience[];
//     whiteboard?: boolean;
//     liveboard?: boolean;
//     canCreateMultiLocations?: boolean;
//     isVerified?: boolean;
//     isMentor?: boolean;
//     blockedUsers?: any[];
//     optoutDate?: Date;
//     ambassador?: boolean;
//     onboarding?: boolean;
//     optoutReason?: string;
//     optoutEmail?: boolean;
//     createdBy?: Types.ObjectId;
//     createdAt?: Date;
//     updatedAt?: Date;
//     programmingLang?: ProgrammingLang[];
//     educationDetails?: EducationDetail;
//     entranceExam?: EntranceExam;
//     academicProjects?: AcademicProject[];
//     trainingCertifications?: TrainingCertification[];
//     industryCertificates?: IndustryCertificate[];
//     externalAssessment?: ExternalAssessment[];
//     awardsAndRecognition?: AwardAndRecognition[];
//     extraCurricularActivities?: ExtraCurricularActivity[];
//     packageSchedules?: PackageSchedule[];
//     identityInfo?: IdentityInfo;
//     codingExperience?: string;
//     levelHistory?: LevelHistory[];
//     passingYear?: number;
//     provider?: string;
//     emailVerifyToken?: string;
//     emailVerifyExpired?: Date;
//     rollNumber?: string;
//     loginCount?: number;
//     designation?: string;
//     followings?: string[];
//     passwordResetToken?: string;
//     followers?: string[];
//     instituteUrl?: string;
//     placementStatus?: string;
//     videoResume?: string;
//     coreBranch?: string;
//     mentorInfo?: MentorInfo;
//     token?: string;
//   }

class LoginHeaders {
    instancekey: string;
    userAgent: string;
}

export class LoginReqDto {
    headers: LoginHeaders;
    ip: string;
    @ApiProperty()
    @IsEmailOrPhoneNumber()
    userId: string;
    @ApiProperty()
    password: string;
    // @ApiProperty()
    @IsOptional()
    instituteId?: string;
}

export class LoginResDto {
    token: string;
    // expiresAt: string;
}

export class ConfirmEmailReq {
    @ApiProperty()
    @Length(10)
    token?: string;
    userid?: string;
    instancekey: string;
}

export class ConfirmEmailRes {
    response: string;
}

export class RecoverPasswordReq {
    instancekey: string;
    @ApiProperty()
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty()
    @IsPhoneNumber()
    @IsOptional()
    phone?: string;

    @ApiProperty()
    selectedCountry: SelectedCountry;

    @ApiProperty()
    @IsEnum(['email', 'phone'], { message: 'Provide a valid type: email or phone' })
    type: string;
}

export class RecoverPasswordRes {
    response: string;
}

export class ResetPasswordReq {
    @ApiProperty()
    token: string;
    userid?: string;
}

export class ResetPasswordRes {
    status: boolean;
    user: GetUserResponse;
}

export class ConfirmPasswordResetTokenRequest {
    instancekey: string;
    token: string;
}

export class ConfirmPasswordResetTokenResponse { }

class VoiceServiceHeaders {
    userAgent: string;
}

export class VoiceServiceRequest {
    @ApiProperty()
    @IsEmail()
    email: string;
    ip: string;
    headers: VoiceServiceHeaders;
}

export class VoiceServiceResponse { }

export class ExportUsersReq {
    @ApiProperty({ required: false })
    searchText: string;

    @ApiProperty({ required: false })
    roles: string;

    @ApiProperty({ required: false })
    lastAttempt: boolean;
}

class ExportUsers {
    @ApiProperty()
    name: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    roles: string[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    lastLogin: Date;
}

export class ExportUsersRes {
    @ApiProperty()
    response: ExportUsers;
}

export class ExportLevelReportRes {
    @ApiProperty({ type: [ReqUser] })
    response: ReqUser;
}

export class GetCertificationReq {
    @ApiProperty()
    code: string;
}

export class GetCertificationRes {
    @ApiProperty()
    certPath: string;
}

export class GetUserPublicProfileReq {
    @ApiProperty()
    @IsNotEmpty()
    userId: string;
}

export class GetUserPublicProfileRes {
    @ApiProperty()
    response: ReqUser;
}

export class GetNewRollNumberRes {
    @ApiProperty()
    response: string;
}

export class GetMeReq {
    @ApiProperty()
    user: ReqUser;

    @ApiProperty()
    isTempt: boolean;

    @ApiProperty()
    instancekey: string;
}

export class GetMeRes {
    @ApiProperty()
    response: ReqUser;
}

class Location {
    user: Types.ObjectId;
    name: string;
    slugfly: string;
    active: boolean;
    isDefault: boolean;
    programs: string[];
    subjects: string[];
    specialization: string[];
    teachers: string[];
    type: string;
    preferences: Types.ObjectId;
    invitees: string[];
    createdAt: string;
    updatedAt: string;
}

export class GetUpdateLocationStatusReq {
    @ApiProperty()
    _id: string;
}

export class GetUpdateLocationStatusRes {
    @ApiProperty()
    response: Location;
}

export class RemoveAdditionalInfoReq {
    @ApiProperty()
    updatedField: string;

    @ApiProperty()
    _id: string;

    // @ApiProperty()
    user: ReqUser;
}

export class LinkPreviewReq {
    @ApiProperty()
    url: string;

    @ApiProperty()
    _id: string;
}

class LinkPreview {
    @ApiProperty()
    url: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    image: string;

    @ApiProperty()
    source: string;

    @ApiProperty()
    type: string;
}

export class LinkPreviewRes {
    @ApiProperty()
    response: LinkPreview
}

export class RemoveAdditionalInfoRes {
    @ApiProperty()
    response: string;
}

export class GetPracticeSummaryReq {
    @ApiProperty()
    user: ReqUser;
}

export class GetPracticeSummaryRes {
    _id?: string;
    totalQuestion?: number;
    totalAnsweredQuestion?: number;
    totalTest?: number;
    overallAccuracy?: number;
    avgTime?: number;
}

export class UserRecentActivityReq {
    @ApiProperty()
    @IsMongoId()
    studentId: string;
}

class UserLog {
    @ApiProperty()
    @IsMongoId()
    _id?: string;

    @ApiProperty()
    studentName?: string;

    @ApiProperty()
    createdAt?: Date;

    @ApiProperty()
    connectionInfo?: object;

    @ApiProperty()
    ip?: string;

    @ApiProperty()
    totalTime?: number;

    @ApiProperty()
    totalQuestions?: number;
}

class UserLogAttempt {
    @ApiProperty()
    @IsMongoId()
    _id?: string;

    @ApiProperty()
    studentName?: string;

    @ApiProperty()
    createdAt?: Date;

    @ApiProperty()
    practiceSetInfoTitle?: string;

    @ApiProperty()
    ongoing?: boolean;

    @ApiProperty()
    isAbandoned?: boolean;

    @ApiProperty()
    totalTime?: number;

    @ApiProperty()
    totalQuestions?: number;

    @ApiProperty()
    userQues?: number;
}

export class UserRecentActivityRes {
    @ApiProperty({ type: [UserLog] })
    logs: UserLog[];

    @ApiProperty({ type: [UserLogAttempt] })
    attempts: UserLogAttempt[];
}

export class AddExperienceReq {
    @ApiProperty()
    startDate: Date;

    @ApiProperty()
    endDate: Date;

    _id: string;
}

export class AddExperienceRes {
    response: ReqUser;
}

class Experience {
    @ApiProperty()
    // @IsMongoId()
    _id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    employmentType: string;

    @ApiProperty()
    company: string;

    @ApiProperty()
    location: string;

    @ApiProperty()
    currentlyWorking: boolean;

    @ApiProperty()
    startDate: Date;

    @ApiProperty()
    endDate: Date;

    @ApiProperty()
    description: string;
}

export class UpdateExperienceReq {
    // @IsMongoId()
    _id: string;

    @ApiProperty()
    body: Experience;
}

export class UpdateExperienceRes {
    response: ReqUser;
}

class Preference {
    @ApiProperty()
    publicProfile: boolean;
    @ApiProperty()
    myWatchList: boolean;
    @ApiProperty()
    leastPracticeDaily: boolean;
    @ApiProperty()
    resumesRequests: boolean;
    @ApiProperty()
    mentoringRequests: boolean;
    @ApiProperty()
    addingStudents: boolean;
    @ApiProperty()
    createAndPublishTest: boolean;
    @ApiProperty()
    viewExistingAssessment: boolean;
}

export class UpdateMentorPreferencesReq {
    _id: string;

    @ApiProperty()
    isPublic: boolean;

    @ApiProperty()
    preferences: Preference;
}

export class UpdateMentorPreferencesRes {
    response: string;
}

class Events {
    @ApiProperty()
    startDate?: Date;

    @ApiProperty()
    endDate?: Date;

    @ApiProperty()
    title?: string;

    @ApiProperty()
    allDays?: boolean;

    @ApiProperty()
    allStudents?: boolean;

    @ApiProperty({ default: 'event' })
    type?: string;

    @ApiProperty()
    @IsMongoId()
    classroom?: string;

    @ApiProperty()
    students?: string;

    @ApiProperty()
    active?: boolean;

    @ApiProperty()
    summary?: string;

    @ApiProperty()
    schedule?: string;

    @ApiProperty()
    createdAt?: Date;

    @ApiProperty()
    updatedAt?: Date;

    @ApiProperty()
    @IsMongoId()
    location?: string
}

export class AddEventsReq {
    user: ReqUser;

    @ApiProperty()
    body: Events
}

export class AddEventsRes {
    @ApiProperty()
    response: Events;
}

class Supercoin {
    @ApiProperty()
    title?: string;
    @ApiProperty()
    status?: boolean;
    @ApiProperty()
    summary?: string;
    @ApiProperty()
    value?: number;
    @ApiProperty({ enum: ['rule', 'offer'] })
    type?: string;
    @ApiProperty({ enum: ['course', 'testseries', 'practice'] })
    tags?: string;
    @ApiProperty({ enum: ['assessment', 'course', 'testseries', 'comment', 'like', 'question'] })
    mode?: string;
    @ApiProperty()
    lastModifiedBy?: string;
    @ApiProperty()
    createdBy?: string;

}

export class GetSuperCoinsActivitiesReq {
    @ApiProperty()
    tags: string;

    @ApiProperty()
    @IsMongoId()
    userId: string;
}

export class GetSuperCoinsActivitiesRes {
    response: Supercoin;
}

export class GetUserSuperCoinActivitiesReq {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    user: ReqUser;

    @ApiProperty()
    startDate: string;

    @ApiProperty()
    endDate: string;

    @ApiProperty()
    timezoneoffset: string;
}

class UserSuperCoin {
    @ApiProperty()
    _id: string;
    @ApiProperty()
    @IsMongoId()
    activityId: string;
    @ApiProperty()
    @IsMongoId()
    user: string;
    @ApiProperty()
    activityType: string;
    @ApiProperty()
    count: number;
    @ApiProperty()
    coins: number;
    @ApiProperty()
    studentMsg: string;
    @ApiProperty()
    teacherMsg: string;
    @ApiProperty()
    justification: string;
    @ApiProperty()
    byAdmin: string;
    @ApiProperty()
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class GetUserSuperCoinActivitiesRes {
    @ApiProperty()
    response: UserSuperCoin;
}

export class GetTotalCoinsReq {
    @ApiProperty()
    user: ReqUser;

    @ApiProperty()
    @IsMongoId()
    userId: string;
}

export class GetTotalCoinsRes {
    response: UserSuperCoin[];
}

export class RedeemCoinsReq {
    @ApiProperty()
    body: UserSuperCoin;

    userId: string;

    user: ReqUser;
}

export class RedeemCoinsRes {
    response: UserSuperCoin;
}

export class UpdateEventReq {
    @ApiProperty()
    body: Events;

    user: ReqUser;
    id: string;
}

export class UpdateEventRes {
    response: Events;
}

export class DeleteEventReq {
    @ApiProperty()
    user: ReqUser;

    id: string;
}

export class DeleteEventRes {
    response: Events;
}

class Educoins {
    @ApiProperty()
    reason: string;

    @ApiProperty()
    educoins: number;

    @ApiProperty()
    @IsMongoId()
    studentId: string;
}

export class EducoinsReq {
    @ApiProperty()
    body: Educoins;
    user: ReqUser;
}

export class EducoinsRes {
    response: UserSuperCoin;
}

export class TotalUserQuery {
    @ApiProperty({required: false})
    role: string;
    @ApiProperty({required: false})
    user: string;
}

export class CountTotalUsersReq {
    @ApiProperty()
    query: TotalUserQuery;
    user: ReqUser;
    instancekey: string;
}

export class CountTotalUsersRes {
    count: number;
}

export class UnsubscribeReq {
    @ApiProperty()
    reason: string;

    user: ReqUser;
}

export class UnsubscribeRes {
    response: string;
}

export class UpdateAmbassadorReq {
    @ApiProperty()
    isEnroll: boolean;
    user: ReqUser;
    instancekey: string;
}

export class UpdateAmbassadorRes {
    response: string;
}

export class CloseUserAccountReq {
    user: ReqUser;
}

export class CloseUserAccountRes {
    response: string;
}

export class GetUserLevelInfoReq {
    @ApiProperty()
    id: string;
    user: ReqUser;
    instancekey: string;
}

export class GetUserLevelInfoRes {
    maxLevel: number;
}

export class GetLiveBoardClassroomsReq {
    @ApiProperty()
    status: string;
    user: ReqUser;
    timezoneoffset: string;
    @ApiProperty({ required: false })
    keywords: string
}

export class GetLiveBoardClassroomsRes {
    response: string;
}

export class GetTurnAuthReq {
    @ApiProperty()
    user: ReqUser;
}

export class GetTurnAuthRes {
    server: string;
    user: string;
    pass: string;
}

export class GetTurnConfigReq {
    @ApiProperty()
    instancekey: string;
    user: ReqUser
}

class TurnConfig {
    urls: string;
    username: string;
    credential: string;
}

export class GetTurnConfigRes {
    @ApiProperty({ type: [TurnConfig] })
    servers: TurnConfig[];
}

export class RequestEmailCodeReq {
    @ApiProperty()
    id: string
}

export class RequestEmailCodeRes {

}


export class GetEventsQuery {
    @ApiProperty({ required: false })
    startDate: string;
    @ApiProperty({ required: false })
    endDate: string;
    @ApiProperty({ required: false })
    excludeCourse: boolean;
}

export class GetEventsHeaders {
    timezoneoffset: string;
}

export class GetEventsRequest {
    instancekey: string;
    user: UserDto;
    query: GetEventsQuery;
    headers: GetEventsHeaders;
}

export class GetEventsResponse { }

export class GetStudentEventsHeaders {
    timezoneoffset: string;
}

export class GetStudentEventsQuery {
    @ApiProperty({ required: false })
    startDate: string;
    @ApiProperty({ required: false })
    endDate: string;
    @ApiProperty({ required: false })
    excludeCourse: boolean;
}

export class GetStudentEventsRequest {
    instancekey: string;
    studentId: string;
    user: UserDto;
    query: GetStudentEventsQuery;
    headers: GetEventsHeaders;
}

export class GetStudentEventsResponse { }

export class FindOnlineUsersQuery {
    @ApiProperty({ required: false })
    roles: string;
    @ApiProperty({ required: false })
    page: number;
    @ApiProperty({ required: false })
    limit: number;
}

export class FindOnlineUsersRequest {
    instancekey: string;
    token: string;
    query: FindOnlineUsersQuery;
}

export class FindOnlineUsersResponse { }

export class StartOneOnOneWbSessionQuery {
    @ApiProperty({ required: false })
    studentId: string;
}

export class StartOneOnOneWbSessionRequest {
    instancekey: string;
    token: string;
    user: UserDto;
    query: StartOneOnOneWbSessionQuery;
}

export class StartOneOnOneWbSessionResponse { }

export class JoinOneOnOneWbSessionQuery {
    @ApiProperty({ required: false })
    meetingID: string;
}

export class JoinOneOnOneWbSessionRequest {
    user: UserDto;
    query: JoinOneOnOneWbSessionQuery;
    instancekey: string;
}

export class JoinOneOnOneWbSessionResponse { }

export class UpdateOptionsDataBody {
    @ApiProperty()
    practiceViews: string;
}

export class UpdateOptionsDataRequest {
    instancekey: string;
    body: UpdateOptionsDataBody;
    user: UserDto;
}

export class UpdateOptionsDataResponse { }

export class UpdateRoleBody {
    @ApiProperty()
    userRoles: string[];
}

export class UpdateRoleRequest {
    user: ReqUser;
    instancekey: string;
    body: UpdateRoleBody;
}

export class UpdateRoleResponse { }

class Avatar {
    _id: Types.ObjectId;
    @ApiProperty()
    mimeType: string;
    @ApiProperty()
    size: number;
    @ApiProperty()
    fileUrl: string;
    @ApiProperty()
    fileName: string;
    @ApiProperty()
    path: string;
}


export class UpdateTempUserBody {
    @ApiProperty()
    @IsEmail()
    email: string;
    @ApiProperty()
    tempPassword: string;
    @ApiProperty()
    seqCode: string;
    @ApiProperty()
    id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    rollNumber: string;
    @ApiProperty()
    registrationNo: string;
    @ApiProperty()
    avatar: Avatar;
    @ApiProperty()
    avatarUrl: string;
    @ApiProperty()
    avatarUrlSM: string;
    @ApiProperty()
    passingYear: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsEmailOrPhoneNumber()
    @IsNotDisposableEmail()
    userId: string;
    @ApiProperty()
    @IsOptional()
    phoneNumber: string;
    @ApiProperty()
    @IsNotEmpty()
    country: string;
    @ApiProperty()
    @IsString()
    @Length(8, 20)
    password: string;
    @ApiProperty()
    subjects: string;
    @ApiProperty()
    @IsNotEmpty()
    roles: string[];
    @ApiProperty()
    ref: string;
    @ApiProperty()
    @IsDateString()
    @IsOfAge()
    @IsOptional()
    birthdate: string;
    @ApiProperty()
    gender: string;
    @ApiProperty()
    district: string;
    @ApiProperty()
    interest: string;
    @ApiProperty()
    knowAboutUs: string;
    @ApiProperty()
    city: string;
    @ApiProperty()
    state: string;
    @ApiProperty()
    isVerified: boolean;
    @ApiProperty()
    whiteboard: boolean;
    @ApiProperty()
    provider: string;
    @ApiProperty()
    liveboard: boolean;
}

export class UpdateTempUserRequest {
    instancekey: string;
    body: UpdateTempUserBody;
    user: any;
}

export class UpdateTempUserResponse { }

export class ToUpdateData {
    @ApiProperty()
    @IsOptional()
    awardDetails: string;
    @ApiProperty()
    @IsOptional()
    date: Date;
    @ApiProperty()
    @IsOptional()
    activityDetails: string;
    @ApiProperty()
    @IsOptional()
    startDate: Date;
    @ApiProperty()
    @IsOptional()
    endDate: Date;
    @ApiProperty()
    @IsOptional()
    educationType: string;
    @ApiProperty()
    @IsOptional()
    board: string;
    @ApiProperty()
    @IsOptional()
    marksType: string
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Min(1, { message: 'Marks must be at least 1' })
    @Max(100, { message: 'Marks must be at most 100' })
    marks: number;
    @ApiProperty()
    @IsOptional()
    passingYear: number;
    @ApiProperty()
    @IsOptional()
    stream: string;
    @ApiProperty()
    @IsOptional()
    year: string;
    @ApiProperty()
    @IsOptional()
    rank: number;
    @ApiProperty()
    @IsOptional()
    name: string;
    @ApiProperty()
    @IsOptional()
    mostRecentScore: number;
    @ApiProperty()
    @IsOptional()
    yearOfAssessment: number;
    @ApiProperty()
    @IsOptional()
    maximumScore: number;
    @ApiProperty()
    @IsOptional()
    provider: string;
    @ApiProperty()
    @IsOptional()
    certificateDate: Date;
    @ApiProperty()
    @IsOptional()
    expiredDate: Date;
    @ApiProperty()
    @IsOptional()
    certificate: string;
    @ApiProperty()
    @IsOptional()
    url?: string;
    @ApiProperty()
    @IsOptional()
    sysgen: boolean;
    @ApiProperty()
    @IsOptional()
    type: string;
    @ApiProperty()
    @IsOptional()
    city: string;
    @ApiProperty()
    @IsOptional()
    state: string;
    @ApiProperty()
    @IsOptional()
    description: string;
    @ApiProperty()
    @IsOptional()
    groupSize: string;
    @ApiProperty()
    @IsOptional()
    document: string;
    @ApiProperty()
    @IsOptional()
    rating: number;
}

export class UpdateAdditionalDataBody {
    @ApiProperty()
    updatedField: string;
    @ApiProperty()
    toUpdateData: ToUpdateData;
}

export class UpdateAdditionalDataRequest {
    instancekey: string;
    body: UpdateAdditionalDataBody;
    user: UserDto;
}

export class UpdateAdditionalDataResponse {
}

export class UserLiveBoardQuery {
    @ApiProperty({required: false})
    searchText: string;
    @ApiProperty({required: false})
    _id: string;
}

export class UserLiveBoardRequest {
    instancekey: string;
    query: UserLiveBoardQuery;
}

export class UserLiveBoardResponse {

}

export class RefreshTokenReq {
    accesstoken: string;
    remember: boolean;
    authtoken: string;
    instancekey: string;
}