import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ArrayNotEmpty, ValidateNested, IsOptional, IsUrl, IsNumber, IsEnum, isBoolean, IsBoolean, IsDate, isMongoId, IsMongoId } from 'class-validator';
import { number } from 'joi';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { Attempt } from '../database';

class CourseCountry {
    @ApiProperty()
    code: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    price: number;

    @ApiProperty()
    marketPlacePrice: number;

    @ApiProperty()
    discountValue: number;
}
class CourseContentNote {
    @ApiProperty({ enum: ['text', 'code'], default: 'text' })
    type: string;

    @ApiProperty()
    data: any;
}
class CourseContent {
    @ApiProperty({ required: false })
    summary: string;

    @ApiProperty({ required: false })
    title: string;

    @ApiProperty({ required: false, enum: ['video', 'ebook', 'note', 'quiz', 'assessment', 'onlineSession'], default: 'ebook' })
    type: string;

    @ApiProperty({ required: false })
    source: Types.ObjectId;

    @ApiProperty({ required: false })
    startDate: Date;

    @ApiProperty({ required: false, type: [CourseContentNote] })
    note: CourseContentNote[];

    @ApiProperty({ required: false })
    active: boolean;

    @ApiProperty({ required: false })
    optional: boolean;
}
export class CourseSection {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: false })
    title: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ required: false })
    summary: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ required: false })
    name: string;

    @IsNotEmpty()
    @IsString()
    @IsEnum(['draft', 'published'])
    @ApiProperty({ enum: ['draft', 'published'], default: 'draft', required: false })
    status: string;

    @IsBoolean()
    @ApiProperty({ required: false })
    optional: boolean;

    @IsBoolean()
    @ApiProperty({ required: false })
    locked: boolean;

    @IsBoolean()
    @ApiProperty({ required: false })
    active: boolean;

    @IsBoolean()
    @ApiProperty({ required: false })
    isDemo: boolean;

    @ApiProperty({ type: [CourseContent], required: false })
    contents: CourseContent[];
}
class Buyer {
    @ApiProperty()
    item: string;

    @ApiProperty()
    user: string;
}
class User {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    name: string;
    activeLocation?: string;
}

export class UserCountry {
    code: string;
    name: string;
    currency: string;
}

class Preference {
    publicProfile: boolean;
    myWatchList: boolean;
    leastPracticeDaily: boolean;
    resumesRequests: boolean;
    mentoringRequests: boolean;
    addingStudents: boolean;
    createAndPublishTest: boolean;
    viewExistingAssessment: boolean;
}

export class LevelHistory {
    _id: string;
    subjectId: string;
    level: number;
    updateDate: Date;
    gradeName: string;
    gradeId: string;
}

export class UserDto {
    _id: string;
    name: string;
    roles: string[];
    country: UserCountry;
    activeLocation: string;
    isVerified: boolean;
    userId: string;
    subjects: string[];
    phoneNumberFull: string;
    practiceViews: string[];
    locations: string[];
    preferences: Preference;
    isActive: boolean;
    email: string;
    phoneNumber: string;
    levelHistory: LevelHistory[];
    createdAt: string;
}

class Subject {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    name: string;
}
class CourseOfferedBy {
    @ApiProperty()
    providerId: string;

    @ApiProperty()
    imageUrl: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;
}

export class CourseRequest {
    instancekey: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ type: [Subject] })
    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    subjects: Subject[];

    @ApiProperty()
    @IsOptional()
    @IsString()
    summary?: string;

    @ApiProperty()
    @IsOptional()
    imageUrl?: string;

    user?: User;
    countries?: CourseCountry[];
    origin?: string;
    locations?: ObjectId[];
    lastModifiedBy?: ObjectId;
    userid?: string;
}

export class CourseResponse {
    _id: string;
    title: string;
    summary: string;
    subjects: string[];
    imageUrl: string;
}

export class Course {
    @ApiProperty()
    _id: string;
    @ApiProperty()
    title: string;
    @ApiProperty()
    startDate?: Date;
    @ApiProperty()
    expiresOn?: Date;
    @ApiProperty({ enum: ['tempt', 'draft', 'published', 'revoked', 'expired'], default: 'draft' })
    status?: string;
    @ApiProperty({ enum: ['semester', 'other'], default: 'other' })
    type?: string;
    @ApiProperty()
    statusChangedAt?: Date;
    @ApiProperty()
    certificate?: boolean;
    @ApiProperty({ type: CourseOfferedBy })
    offeredBy: CourseOfferedBy;
    @ApiProperty({ type: User })
    user: User;
    @ApiProperty({ type: [User] })
    instructors: User[];
    @ApiProperty({ type: [Subject] })
    subjects: Subject[];
    @ApiProperty({ enum: ['public', 'invitation', 'buy'], default: 'public' })
    accessMode?: string;
    @ApiProperty({ type: [CourseCountry] })
    countries?: CourseCountry[];
    @ApiProperty()
    summary: string;
    @ApiProperty({ type: [String] })
    classrooms?: ObjectId[];
    @ApiProperty()
    duration?: string;
    @ApiProperty()
    credits?: number;
    @ApiProperty({ type: [CourseSection] })
    sections: CourseSection[];
    @ApiProperty({ enum: ['school', 'bachelors', 'masters', 'open'], default: 'open' })
    level?: string;
    @ApiProperty()
    courseCode?: string;
    @ApiProperty()
    colorCode?: string;
    @ApiProperty()
    imageUrl?: string;
    @ApiProperty()
    description?: string;
    @ApiProperty()
    requirements?: string;
    @ApiProperty()
    includes?: string;
    @ApiProperty()
    learningIncludes?: string;
    @ApiProperty()
    notificationMsg?: string;
    @ApiProperty()
    active?: boolean;
    @ApiProperty({ type: String })
    lastModifiedBy?: ObjectId;
    @ApiProperty()
    rating?: number;
    @ApiProperty()
    totalRatings?: number;
    @ApiProperty()
    videoUrl?: string;
    @ApiProperty({ type: () => [Buyer] })
    buyers: Buyer[];
    @ApiProperty()
    uid?: string;
    @ApiProperty()
    synced?: boolean;
    @ApiProperty({ type: [String] })
    locations?: ObjectId[];
    @ApiProperty()
    enableOrdering?: boolean;
    @ApiProperty({ type: String })
    owner?: ObjectId;
    @ApiProperty({ enum: ['publisher', 'institute'], default: 'publisher' })
    origin?: string;
}
export class GetCourseRequest {
    instancekey: string;
}

export class GetCourseResponse {
    @ApiProperty()
    response: Course[];
}

export class GetCourseByIdRequest {
    instancekey: string;
    @ApiProperty()
    _id: string;
}

export class GetCourseByIdResponse {
    @ApiProperty()
    response: Course;
}

export class UpdateCourseRequest {
    instancekey: string;
    _id: string;
    @ApiProperty()
    title: string;
    @ApiProperty()
    startDate?: Date;
    @ApiProperty()
    expiresOn?: Date;
    @ApiProperty({ enum: ['tempt', 'draft', 'published', 'revoked', 'expired'], default: 'draft' })
    status?: string;
    @ApiProperty({ enum: ['semester', 'other'], default: 'other' })
    type?: string;
    @ApiProperty()
    statusChangedAt?: Date;
    @ApiProperty()
    certificate?: boolean;
    @ApiProperty({ type: CourseOfferedBy })
    offeredBy: CourseOfferedBy;
    @ApiProperty({ type: User })
    user: User;
    @ApiProperty({ type: [User] })
    instructors: User[];
    @ApiProperty({ type: [Subject] })
    subjects: Subject[];
    @ApiProperty({ enum: ['public', 'invitation', 'buy'], default: 'public' })
    accessMode?: string;
    @ApiProperty({ type: [CourseCountry] })
    countries?: CourseCountry[];
    @ApiProperty()
    summary: string;
    @ApiProperty({ type: [String] })
    classrooms?: ObjectId[];
    @ApiProperty()
    duration?: string;
    @ApiProperty()
    credits?: number;
    @ApiProperty({ type: [CourseSection] })
    sections: CourseSection[];
    @ApiProperty({ enum: ['school', 'bachelors', 'masters', 'open'], default: 'open' })
    level?: string;
    @ApiProperty()
    courseCode?: string;
    @ApiProperty()
    colorCode?: string;
    @ApiProperty()
    imageUrl?: string;
    @ApiProperty()
    description?: string;
    @ApiProperty()
    requirements?: string;
    @ApiProperty()
    includes?: string;
    @ApiProperty()
    learningIncludes?: string;
    @ApiProperty()
    notificationMsg?: string;
    @ApiProperty()
    active?: boolean;
    @ApiProperty({ type: String })
    lastModifiedBy?: ObjectId;
    @ApiProperty()
    rating?: number;
    @ApiProperty()
    totalRatings?: number;
    @ApiProperty()
    videoUrl?: string;
    @ApiProperty({ type: () => [Buyer] })
    buyers: Buyer[];
    @ApiProperty()
    uid?: string;
    @ApiProperty()
    synced?: boolean;
    @ApiProperty({ type: [String] })
    locations?: ObjectId[];
    @ApiProperty()
    enableOrdering?: boolean;
    @ApiProperty({ type: String })
    owner?: ObjectId;
    @ApiProperty({ enum: ['publisher', 'institute'], default: 'publisher' })
    origin?: string;
}

export class UpdateCourseResponse {
    @ApiProperty()
    response: Course[];
}

export class DeleteCourseRequest {
    instancekey: string;
    @ApiProperty()
    _id: string;
}

export class DeleteCourseResponse {
    _id: string;
    title: string;
    type: string;
    summary: string;
}

export class GetCourseByClassroomRequest {
    instancekey: string;
    @ApiProperty()
    _id: string;
}

export class GetCourseByClassroomResponse {
    @ApiProperty()
    response: Course;
}

export class AddClassToCourseRequest {
    instancekey: string;
    _id: string;
    @ApiProperty({ type: [String] })
    itemIds: string[];
}
export class AddClassToCourseResponse {
    classrooms: string[];
}

export class RemoveClassFromCourseRequest {
    instancekey: string;
    _id: string;
    itemId: string;
}

export class RemoveClassFromCourseResponse {
    removedItemId: string;
}
export class GetAvgRatingByCourseRequest {
    instancekey: string;
    @IsString()
    @ApiProperty()
    _id: string;
}
class Query {
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    page?: number;
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    limit?: number;
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    rating?: number;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    keywords?: string;
}

export class GetRatingByCourseReq {
    @IsMongoId()
    _id: string;
    query?: Query;
    instancekey: string;
}

export class Ratings {
    rating: number;
    count: number;
    avgRating: number;
}
export class GetAvgRatingByCourseResponse {
    @ApiProperty({ type: [Ratings] })
    rating?: Ratings[];
    totalRatings?: number;
    count?: number;
    avgRatings?: number;
}
export class AddToFavoriteRequest {
    instancekey: string;
    _id: string;
    userId: string;
    activeLocation: string;
}
export class AddToFavoriteResponse {
    _id: string;
}
export class RemoveFavoriteRequest {
    instancekey: string;
    userId: string;
    _id: string;
}
export class RemoveFavoriteResponse {
    status: string;
}
export class AddFeedbackRequest {
    instancekey: string;
    user: string;
    courseId: string;
    @ApiProperty({ required: false })
    rating: number;
    @ApiProperty({ required: false })
    feedback: string;
}
export class AddFeedbackResponse {
    courseRating: Number;
}
export class GetRatingCountByCourseRequest {
    instancekey: string;
    id: string;
    keywords: string;
    rating: number;
}
export class GetRatingCountByCourseResponse {
    count: number;
}

export class AddSectionBody {
    @ApiProperty({ required: false })
    title: string
    @ApiProperty({ required: false })
    summary: string
    @ApiProperty({ required: false })
    name: string
    @ApiProperty({ required: false })
    locked: boolean
    @ApiProperty({ type: [CourseContent], required: false })
    contents: CourseContent[]
}

export class AddSectionRequest {
    _id: string;
    instancekey: string;
    userId: string;
    body: AddSectionBody;
}

export class AddSectionResponse {
    section: CourseSection
}
export class UpdateSectionsOrderRequest {
    instancekey: string;
    _id: string;
    userId: string;
    @ApiProperty({ type: () => CourseSection })
    sectionToAdd: CourseSection;
}

export class UpdateSectionsOrderResponse {
    _id: string
}
export class UpdateCourseContentRequest {
    courseId: string;
    instancekey: string;
    @ApiProperty({ type: Types.ObjectId })
    _id: Types.ObjectId;
    @ApiProperty()
    title: string;
    @ApiProperty()
    summary: string;
    @ApiProperty({ enum: ['video', 'ebook', 'note', 'quiz', 'assessment', 'onlineSession'], default: 'ebook' })
    type: string;
    @ApiProperty({ type: [CourseContentNote] })
    note: CourseContentNote[];
    @ApiProperty({ type: Types.ObjectId })
    source: Types.ObjectId;
}
export class UpdateCourseContentResponse {
    response: string;
}
export class DeleteContentRequest {
    instancekey: string;
    courseId: string;
    contentId: string;
}
export class DeleteContentResponse {
    id: string;
}
export class DeleteSectionRequest {
    courseId: string;
    sectionId: string;
    userId: string;
    instancekey: string;
}
export class DeleteSectionResponse {
    id: string;
}
export class AddContentFavoriteRequest {
    id: string;
    contentId: string;
    userId: string;
    instancekey: string;
    activeLocation: string;
}
export class AddContentFavoriteResponse {
    id: string;
}
export class RemoveContentFavoriteRequest {
    id: string;
    contentId: string;
    userId: string;
    instancekey: string;
}
export class RemoveContentFavoriteResponse {
    status: string;
}
export class GetFavoriteCourseRequest {
    instancekey: string;
    userId: string;
    activeLocation: string;
}
export class GetFavoriteCourseDto {
    _id: string;
    title: string;
}
export class GetFavoriteCourseResponse {
    @ApiProperty({ type: [GetFavoriteCourseDto] })
    response: [GetFavoriteCourseDto]
}


export class GetOngoingClassesRequest {
    instancekey: string;
    courseId: string;
    userId: string;
    role: string;
    activeLocation: string;
}
export class GetOngoingClassesDto {
    _id: Types.ObjectId;
    classroomId: Types.ObjectId;
    title: string;
    seqCode: string;
    students: number;
    colorCode: string;
}
export class GetOngoingClassesResponse {
    @ApiProperty({ type: [GetOngoingClassesDto] })
    response: [GetOngoingClassesDto];
}
export class GetCourseProgressRequest {
    instancekey: string;
    userId: string;
    courseId?: string;
}
export class GetCourseProgressDto {
    progress: number;
    totalContent: number;
    completedContents: number;
}
export class GetCourseProgressResponse {
    response: GetCourseProgressDto;
}

export class GetUserCourseRequest {
    id: string;
    userId: string;
    activeLocation: string;
    userRole: string;
    demoSection: string;
    instancekey: string;
}
export class UserCourseContentDto {
    _id: Types.ObjectId;
    section: Types.ObjectId;
    source: Types.ObjectId;
    type: string;
    title: string;
    end: Date;
    timeSpent: number;
    completed: boolean;
    updatedAt: string;
    attempt: Types.ObjectId;
}
export class UserCourseAnalytics {
    quiz: number;
    test: number;
    attempt: number;
    accuracy: number;
    mark: number;
    maxMark: number;
}
export class UserCourseSectionDto {
    _id: Types.ObjectId;
    title: string;
    completed: boolean;
    analytics: UserCourseAnalytics[]
}
export class GetUserCourseResponse {
    course: string;
    user: string;
    @ApiProperty({ type: [UserCourseContentDto] })
    contents: UserCourseContentDto[];
    active: boolean;
    completed: boolean;
    issuedCertificate: boolean;
    @ApiProperty({ type: [UserCourseSectionDto] })
    sections: UserCourseSectionDto[];
}
export class FetchTeacherAssessmentRequest {
    id: string;
    status: string;
    testMode: string;
    instancekey: string;
}

export class FetchTeacherAssessmentDto {
    @ApiProperty({ type: User })
    userInfo: User;
    @ApiProperty({ type: [User] })
    units: [User];
    @ApiProperty({ type: [User] })
    subjects: [User];
    @ApiProperty()
    testMode: string;
    @ApiProperty()
    status: string;
    @ApiProperty({ type: Date })
    statusChangedAt: Date;
    @ApiProperty()
    totalQuestion: number;
    @ApiProperty()
    totalTime: number;
    @ApiProperty()
    id: string;
}

export class FetchTeacherAssessmentResponse {
    @ApiProperty({ type: () => [FetchTeacherAssessmentDto] })
    result: FetchTeacherAssessmentDto[];
}
export class GetClassesTimeSpentRequest {
    id: string;
    instancekey: string;
}
export class CourseAndClassroom {
    course: string;
    classroom: string;
}
export class GetClassesTimeSpentDto {
    _id: CourseAndClassroom;
    time: number;
}
export class GetClassesTimeSpentResponse {
    @ApiProperty({ type: [GetClassesTimeSpentDto] })
    response: GetClassesTimeSpentDto[]
}
export class GetCourseSectionsReportRequest {
    instancekey: string;
    courseId: string;
    studentId: string;
    section: string;
}
export class GetCourseSectionsReportDto {
    _id: string;
    total: number;
    partial: number;
    skipped: number;
    incorrect: number;
    pending: number;
}
export class GetCourseSectionsReportResponse {
    response: GetCourseSectionsReportDto;
}
export class GetStudentCourseOverviewRequest {
    studentId: string;
    courseId: string;
    instancekey: string;
}
export class GetStudentCourseOverviewDto {
    @ApiProperty({ type: User })
    user: User;
    @ApiProperty({ type: [CourseSection] })
    sections: CourseSection[]
    title: string;
    @ApiProperty({ type: [Subject] })
    subjects: Subject[]
    accessMode: string;
    timeSpent: number;
    totalContents: number;
    completedContents: number;
}
export class GetStudentCourseOverviewResponse {
    response: GetStudentCourseOverviewDto;
}
export class GetCourseSectionByStatusRequest {
    courseId: string;
    studentId: string;
    status: string;
    instancekey: string;
}
export class GetCourseSectionByStatusDto {
    _id: string;
    @ApiProperty({ type: [CourseContent] })
    contents: CourseContent[];
}
export class GetCourseSectionByStatusResponse {
    @ApiProperty({ type: [GetCourseSectionByStatusDto] })
    response: GetCourseSectionByStatusDto[]
}
export class VerifyCourseUserProgressRequest {
    instancekey: string;
    courseId: string;
    userId: string;
}
export class VerifyCourseUserProgressResponse {
    response: string;
}
export class PublicEnrolledCourseRequest {
    instancekey: string;
    studentId: string;
}
export class PublicEnrolledCourseCourse {
    title: string;
    subjects: Subject[];
}
export class PublicEnrolledCourseDto {
    course: PublicEnrolledCourseCourse
    user: Types.ObjectId;
    userRole: string;
    active: boolean;
    completed: boolean;
    issuedCertificate: boolean;
    location: Types.ObjectId;
    sections: CourseSection[];
    createdBy: Types.ObjectId;
}
export class PublicEnrolledCourseResponse {
    @ApiProperty({ type: () => [PublicEnrolledCourseDto] })
    response: PublicEnrolledCourseDto;
}
export class GetCourseContentAnalyticsRequest {
    id: string;
    userId: string;
    instancekey: string;
}
export class GetCourseContentAnalyticsCourseDto {
    title: string;
    @ApiProperty({ type: [Subject] })
    subjects: Subject[]
    @ApiProperty({ type: [CourseSection] })
    sections: CourseSection[]
}
export class GetCourseContentAnalyticsUserCourseDto {
    @ApiProperty({ type: [UserCourseContentDto] })
    contents: UserCourseContentDto[]
    @ApiProperty({ type: [UserCourseContentDto] })
    sections: UserCourseSectionDto[]
}
export class GetCourseContentAnalyticsResponse {
    course: GetCourseContentAnalyticsCourseDto;
    userCourse: GetCourseContentAnalyticsUserCourseDto
}
export class GetCourseSubjectRequest {
    instancekey: string;
    userId: string;
    userRole: string[];
    activeLocation: string;
    excludeEnrolled: boolean;
}
export class GetCourseSubjectResponse {
    @ApiProperty({ type: [Subject] })
    response: Subject[]
}
export class GetStudentCoursesRequest {
    instancekey: string;
    userId: string;
    userRole: string;
    page: number;
    limit: number;
    id: string;
}
export class GetStudentCoursesDto {
    _id: string;
    title: string;
    progress: number;
    subject: Subject[];
    imageUrl: string;
    colorCode: string;
}
export class GetStudentCoursesResponse {
    reponse: GetStudentCoursesDto[]
}
export class GetTeacherHighestPaidCoursesRequest {
    instancekey: string;
    page: number;
    limit: number;
    userId: string;
    userRole: string;
    title: string;
    activeLocation: string;
}
export class GetTeacherHghestPaidCoursesDto {
    title: string;
    status: string;
    totalRatings: number;
    imageUrl: string;
    instructors: User[];
    type: string;
    rating: number;
    subjects: Subject[];
    accessMode: string;
    price: number;
    discountValues: number;
    countries: CourseCountry[]
}
export class GetTeacherHighestPaidCoursesResponse {
    response: [GetTeacherHghestPaidCoursesDto];
}
export class GetTopCategoriesCourseRequest {
    page: number;
    limit: number;
    instancekey: string;
    activeLocation: string;
}
export class GetTopCategoriesCourseResponse {
    @ApiProperty({ type: () => [Course] })
    response: Course[];
}
export class GetPublisherCourseRequest {
    limit: number;
    page: number;
    title: string;
    activeLocation: string;
    count: number;
    userId: string;
    skip: number;
    instancekey: string;
}
export class GetPublisheCourseDto {
    count: number[]
}
export class GetPublisherCourseResponse {
    @ApiProperty({ type: [Course] })
    response: Course[];
    count?: number
}
export class UserWithoutEnrollRequest {
    instancekey: string;
    userId: string;

}
export class UserWithoutEnrollDto {
    _id: Types.ObjectId;
    title: string;
}
export class UserWithoutEnrollResponse {
    @ApiProperty({ type: [UserWithoutEnrollDto] })
    response: UserWithoutEnrollDto[];
}
export class GetCourseMembersRequest {
    instancekey: string;
    page: number;
    limit: number;
    courseId: string;
    searchText: string;
}
export class UserInfo {
    avatar: string;
    email: string;
    userId: string;
    name: string;
    role: string;
}
export class GetCourseMembersDto {
    progress: number
    totlaContent: number;
    completedContents: number;
    student: UserInfo;
    lastActive: Date;
    isCerti: boolean;
}
export class GetCourseMembersResponse {
    @ApiProperty({ type: () => [GetCourseMembersDto] })
    result: GetCourseMembersDto[]
    totalCount: number
}
export class GetTeacherCourseRequest {
    instancekey: string;
    courseId: string;
}
export class GetTeacherCourseResponse {
    response: Course;
}
export class GetOngoingCourseRequest {
    limit: number;
    home: boolean;
    userId: string;
    instancekey: string;
    activeLocation?: string
}
export class GetOngoingCourseDto {
    active?: boolean;
    completed?: boolean;
    issuedCertificate?: boolean;
    user: string;
    userRole?: string;
    course: Course[];
    location?: string;
    sections?: CourseSection;
    contents: CourseContent;
}
export class GetOngoingCourseResponse {
    @ApiProperty({ type: () => [GetOngoingCourseDto] })
    response: GetOngoingCourseDto[];
}
export class GetOngoingCourseContentReq {
    courseId: string;
    userId: string;
    instancekey: string;
}
export class GetAuthorsReq {
    instancekey: string;
}
export class Empty { }

export class EditContentInSectionRequest {
    instancekey: string;
    courseId: string;
    sectionId: string;
    @ApiProperty()
    title: string;
    @ApiProperty()
    summary: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    locked: boolean;
    @ApiProperty()
    optional: boolean;
    @ApiProperty({ type: () => [CourseContent] })
    contents: [CourseContent];
    userId: string;
}
export class EditContentInSectionResponse {
    @ApiProperty({ type: () => Course })
    response: Course;
}
export class GetAllMyCourseProgressRequest {
    userId: string;
    status: string;
    userRole: string;
    instancekey: string;
    activeLocation: string;
}
export class GetAllMyCourseProgressDto {
    title: string;
    progress: number;
    type: string;
    @ApiProperty({ type: () => [Subject] })
    subjects: Subject[];
    colorCode?: string;
    imageUrl: string;
    status: string;
}
export class GetAllMyCourseProgressResponse {
    @ApiProperty({ type: () => [GetAllMyCourseProgressDto] })
    response: GetAllMyCourseProgressDto[]
}
export class GetCoursePublicReq {
    instancekey: string;
    courseId: string;
    userId: string;
}
export class GetCoursePublicRes {
    @ApiProperty({ type: () => [Course] })
    response: Course[];
}
export class GetTeacherCourseDetailRequest {
    instancekey: string;
    courseId: string;
}
export class GetTeacherCourseDetailResponse {
    @ApiProperty({ type: () => Course })
    response: Course;
}
export class UpdateContentTimeSpentRequest {
    instancekey: string;
    userId: string;
    courseId: string;
    @ApiProperty()
    contentId: string;
    @ApiProperty()
    timeSpent: number;
}
export class UpdateContentTimeSpentResponse {
    timeSpent: number;
}
export class CompleteContentRequest {
    userId: string;
    courseId: string;
    instancekey: string;
    @ApiProperty()
    timeSpent: number;
    @ApiProperty()
    contentId: string
}
export class CompleteContentResponse {
    completedContents: number;
}
export class StartContentRequest {
    courseId: string;
    @ApiProperty({ required: false })
    section: string;
    @ApiProperty({ required: false })
    content: string;
    instancekey: string;
    course?: Course;
    user: UserDto;
}

export class StartContentDto {
    content: string;
    start: string;
    section: string;
    completed: string;
    favorite: boolean
}
export class StartContentResponse {
    response: StartContentDto;
}
export class GetCoursesRequest {
    type: string;
    page: number;
    limit: number;
    userId: string;
    keyword: string;
    userRole: string[];
    accessMode: string;
    instancekey: string;
    ownLocation: boolean;
    activeLocation?: string;
    userData?: User;
}
export class GetCoursesResponse {
    @ApiProperty({ type: () => [Course] })
    allCourses: Course[];
    totalCount: number
}
export class GetCoursesPublicReq {
    @IsMongoId()
    userId: string;
    query?: Query;
    instancekey: string;
}

export class GetTeacherArchivedCoursesRequest {
    page: number;
    limit: number;
    userId: string;
    userRole: string[];
    instancekey: string;
    ownLocation?: boolean;
    activeLocation?: string;
}
export class GetTeacherArchivedCoursesResponse {
    @ApiProperty({ type: () => Course })
    response: Course[];
}
export class GetTeacherMostPopularCoursesRequest {
    page: number;
    limit: number;
    title: string;
    userRole: string[];
    accessMode: string;
    activeLocation?: string;
    instancekey: string;
    userId: string;
}
export class GetTeacherMostPopularCoursesResponse {
    courses: Course[];
}
export class GetAllTeacherCoursesRequest {
    @ApiProperty({ required: false })
    page?: number;
    @ApiProperty({ required: false })
    limit?: number;
    @ApiProperty({ required: false })
    status?: string;
    @ApiProperty({ required: false })
    home?: boolean
    instancekey: string;
    user: UserDto;
}
export class GetAllTeacherCoursesResponse {
    courses: Course[]
}
export class GetPublicListingRequest {
    limit: number;
    page: number;
    skip: number;
    instancekey: string;
    count: boolean;
}
export class GetPublicListingResponse {
    courses: Course[]
    total?: number;
}
export class GetBestSellerCourseRequest {
    page: number;
    limit: number;
    instancekey: string;
    activeLocation?: string;
    userRole: string;
    userId: string;
}
export class GetBestSellerCourseResponse {
    courses: Course[]
}
export class GetPopularCourseRequest {
    page: number;
    limit: number;
    activeLocation?: string;
    userId: string;
    userLocation: string;
    instancekey: string;
}
export class GetPopularCourseResponse {
    courses: Course[]
}
export class GetArchiveCoursesRequest {
    page: number;
    limit: number;
    userId: string;
    activeLocation: string;
    instancekey: string;
}
export class GetArchiveCoursesResponse {
    result: Course[]
}
export class GetQuestionDistributionAnalyticsRequest {
    createdAt: Date;
    referenceId: string;
    instancekey: string;
}
export class Distribution {
    status: number;
    count: number;
}
export class GetQuestionDistributionAnalyticsDto {
    distribution: Distribution[]
}
export class GetQuestionDistributionAnalyticsResponse {
    dis: GetQuestionDistributionAnalyticsDto[]
}
export class GetRankingAnalyticsRequest {
    referenceId: string;
    userId: string;
    createdAt: Date;
    instancekey: string;
}
export class UserAvatar {
    mimeType: string;
    size: number;
    fileUrl: string;
    fileName: string;
    path: string;
}
export class GetRankingAnalyticsDto {
    score: number;
    speed: number;
    studentName: string;
    userId: string;
    avatar: UserAvatar;
    google: string;
    facebook: string;
}
export class GetRankingAnalyticsResponse {
    top: GetRankingAnalyticsDto[];
    student: GetRankingAnalyticsDto[]
}
export class GetCourseContentAttemptByStudentRequest {
    userId: string;
    practiceSetId: string;
    userRole: string;
    instancekey: string;
}
export class CreatedBy {
    user: string;
    name: string;
    _id: string
}
export class AttemptTopics {
    name: string;
    correct: number;
    missed: number;
    incorrect: number;
    pending: number;
    partial: number;
    mark: number;
    speed: number;
    accuracy: number;
    maxMarks: number;
}
export class AttemptUnits {
    name: string;
    correct: number;
    missed: number;
    incorrect: number;
    pending: number;
    partial: number;
    mark: number;
    speed: number;
    accuracy: number;
    maxMarks: number;
    topics: AttemptTopics[]
}
export class AttemptSubject {
    name: string;
    correct: number;
    missed: number;
    incorrect: number;
    pending: number;
    partial: number;
    mark: number;
    speed: number;
    accuracy: number;
    maxMarks: number;
    offscreenTime: number;
    units: AttemptUnits[]
}
export class AttemptClassroom {
    id: Types.ObjectId;
}
export class PracticeSetInfo {
    title: string;
    subjects: AttemptSubject[]
    classRooms: AttemptClassroom[]
    units: AttemptUnits[]
    titleLower: string;
    accessMode: string;
    createdBy: Types.ObjectId;
    level: number;
}
export class Topic {
    @ApiProperty()
    _id: string;
    @ApiProperty()
    name: string;
}

export class Unit {
    @ApiProperty()
    _id: string;
    @ApiProperty()
    name: string;
};
export class AttachmentQA {
    url: string;
    name: string;
    type: string;
}

export class TestCaseQA {
    args: string;
    input: string;
    output: string;
    status: boolean;
    runTime: number;
    error: string;
}
export class AnswerQA {
    answerId: Types.ObjectId;
    answerText: string;
    userText: string;
    codeLanguage: string;
    code: string;
    testcases: TestCaseQA[];
    userArgs: string;
    userInput: string;
    output: string;
    compileMessage: string;
    compileTime: number;
    mathData: string;
    timeElapse: number;
    attachments: AttachmentQA[];
}
export class QA {
    question: Types.ObjectId;
    timeEslapse: number;
    timeLeft?: number;
    stdTime?: number;
    index?: number;
    answerChanged?: number;
    status?: number;
    category?: string;
    offscreen?: number[];
    feedback?: boolean;
    createdAt?: Date;
    isMissed?: boolean;
    hasMarked?: boolean;
    actualMarks?: number;
    obtainMarks?: number;
    topic?: Topic;
    unit?: Unit;
    subject?: Subject;
    answers?: AnswerQA[];
    teacherComment?: string;
    reviewTimes?: number;
    reviewTimeSpent?: number;
    tComplexity?: number;
    answerOrder?: Types.ObjectId[];
    scratchPad?: string[];
    evaluatorAssigned?: boolean;
}
export class GetCourseContentAttemptByStudentDto {
    timeLimitExhaustedCount: number;
    createdBy: CreatedBy;
    practiceSetInfo: PracticeSetInfo;
    identityInfo: AttemptClassroom;
    lastIndex: number;
    isEvaluated: boolean;
    partial: number;
    partiallyAttempted: boolean;
    isLevelReset: boolean;
    pending: number;
    maximumMarks: number;
    isShowAttempt: boolean;
    isFraudlent: boolean;
    markedSuspicious: boolean;
    isAnsync: boolean;
    isCratedOffline: boolean
    totalMark: number;
    plusMark: number;
    minusMark: number;
    totalMissed: number;
    totalErrors: number;
    totalTime: number;
    totalCorrects: number;
    isAbandoned: boolean;
    totalMarkeds: number;
    offscreenTime: number;
    fraudDetected: [];
    terminated: boolean;
    resumeContent: number;
    ongoing: number;
    practiceSetId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    subjects: AttemptSubject[];
    attempdetails: Types.ObjectId;
    attemptType: Types.ObjectId;
    email: string;
    idOffline: Types.ObjectId;
    studentName: string;
    totalQuestions: number;
    userId: string;
    location: Types.ObjectId;
    id: string;
    QA: QA[]
}
export class GetCourseContentAttemptByStudentResponse {
    response: GetCourseContentAttemptByStudentDto;
}
export class GetPracticeTimeAnalyticsRequest {
    courseId: string;
    createdAt: Date;
    userId: string;
    instancekey: string;
    timezoneOffset: string;
    @ApiProperty({ required: false })
    lastDays?: number
}
export class LastDaysData {
    top: number;
    average: number;
    student: number
}
export class GetPracticeTimeAnalyticsResponse {
    top: number;
    average: number;
    student: number
    lastDaysData?: LastDaysData
}
export class GetLearningTimeAnalyticsRequest {
    instancekey: string;
    createdAt: Date;
    courseId: string;
    userId: string;
    @ApiProperty({ required: false })
    lastDays?: number;
    timezoneOffset: number;
}
export class GetLearningTimeAnalyticsResponse {
    top: number;
    average: number;
    student: number
    lastDaysData?: LastDaysData
}
export class GetCompletionAnalyticsRequest {
    instancekey: string;
    courseId: string;
    userId: string;
    @ApiProperty({ required: false })
    lastDays?: number
    timezoneOffset: number;
    createdAt: Date;
}
export class GetCompletionAnalyticsResponse {
    top: number;
    average: number;
    student: number
    lastDaysData?: LastDaysData
}
export class GetAccuracyAnalyticsRequest {
    instancekey: string;
    referenceId: string;
    activeLocation: string;
    createdAt: string;
    userId: string;
    @ApiProperty({ required: false })
    lastDays?: number;
    timezoneOffset: number;
}
export class GetAccuracyAnalyticsResponse {
    top: number;
    average: number;
    student: number
    lastDaysData?: LastDaysData
}
export class GetMyFavoriteRequest {
    @ApiProperty({ required: false })
    page: number;
    @ApiProperty({ required: false })
    limit: number;
    @ApiProperty({ required: false })
    name: string;
    @ApiProperty({ required: false })
    subject: string;
    @ApiProperty({ required: false })
    course: string;
    userId: string;
    activeLocation: string;
    @ApiProperty({ required: false })
    includeCourse: string;
    @ApiProperty({ required: false })
    count: number;
    instancekey: string;
}
export class ContentCourse {
    _id: string;
    title: string;
}
export class GetMyFavoriteCourseDto {
    type: string;
    itemId: string;
    title: string;
}
export class GetMyFavoriteContentDto {
    course: ContentCourse;
    type: string;
    itemId: string;
    title: string;
    contentType: string;
    courses: GetMyFavoriteCourseDto
}

export class GetMyFavoriteResponse {
    response?: GetMyFavoriteContentDto[];
    totalCount?: number
}
export class GetFavoriteSubjectsRequest {
    instancekey: string;
    userId: string;
    activeLocation: string;
}
export class GetFavoriteSubjectsResponse {
    response: Subject[];
}
export class CountRequest {
    userRole: string[];
    activeLocation: string;
    instancekey: string;
    userId: string;
    @ApiProperty({ required: false })
    accessMode: string;
    @ApiProperty({ required: false })
    keywords: string;
    @ApiProperty({ required: false })
    subject: string;
    @ApiProperty({ required: false })
    level: string;
    @ApiProperty({ required: false })
    price: string;
    @ApiProperty({ required: false })
    duration: string;
    @ApiProperty({ required: false })
    author: string;
}
export class CountResponse {
    total: number;
}
export class NotifyStudentsAfterWithdrawalRequest {
    courseId: string;
    instancekey: string;
    @IsString()
    @ApiProperty()
    notificationMsg: string;
}
export class NotifyStudentsAfterWithdrawalResponse {
    msg: string;
}
export class FindRequest {
    @ApiProperty({ required: false })
    page: number;
    @ApiProperty({ required: false })
    limit: number;
    userRole: string[];
    activeLocation: string;
    userId: string;
    @ApiProperty({ required: false })
    accessMode: string;
    @ApiProperty({ required: false })
    keywords: string;
    @ApiProperty({ required: false })
    subject: string;
    @ApiProperty({ required: false })
    level: number;
    @ApiProperty({ required: false })
    price: string;
    @ApiProperty({ required: false })
    duration: string;
    @ApiProperty({ required: false })
    author: string;
    @ApiProperty({ required: false })
    count: boolean;
    @ApiProperty({ required: false })
    isCheckEnroll: boolean;
    instancekey: string;
}
export class FindResponse {
    courses?: Course[];
    total?: number;
}

export class PublishSectionReq {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    _id: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    status?: string;
    courseId: string;
    instancekey: string;
}
/* AddSection, UpdateSectionsOrder, UpdateCourseContent, DeleteContent, DeleteSection, AddContentFavorite, RemoveContentFavorite, GetFavoriteCourse, GetOngoingClasses, GetCourseProgress, GetUserCourse, FetchTeacherAssessment, GetClassesTimeSpent, GetCourseSectionsReport, GetStudentCourseOverview, GetCourseSectionByStatus, VerifyCourseUserProgress, PublicEnrolledCourse, GetCourseContentAnalytics, GetCourseSubject, GetStudentCourses, GetTeacherHighestPaidCourses, GetTopCategoriesCourse, GetPublisherCourse, UserWithoutEnroll, GetCourseMembers, GetTeacherCourse, GetOngoingCourse, EditContentInSection, GetAllMyCourseProgress, GetCoursesPublic, GetTeacherCourseDetail, UpdateContentTimeSpent, */