import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { Attempt, CreatedBy, PracticeSetInfo, Subjects } from "./attempt.dto";

export interface Empty { }

class Query {
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    page?: number;
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    limit?: number;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    recommended?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    sort?: string;
    @IsBoolean()
    @IsOptional()
    @ApiProperty({ required: false })
    home?: boolean;
    @IsBoolean()
    @IsOptional()
    @ApiProperty({ required: false })
    testOnly?: boolean;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    user?: string
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    subjects?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    lastDay?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    studentId?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    classroom?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    searchText?: string;
    @IsBoolean()
    @IsOptional()
    @ApiProperty({ required: false })
    topPerformers?: boolean
    @IsBoolean()
    @IsOptional()
    @ApiProperty({ required: false })
    includeCount?: boolean
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    lastMonth?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    attemptId?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    onlyDay?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    keyword?: string;
    @IsString()
    @IsOptional()
    @ApiProperty()
    publisher?: string;
    @IsString()
    @IsOptional()
    @ApiProperty()
    unit?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    practice?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    fileName?: string;
    @IsString()
    @IsOptional()
    baseImage?: string;
    @IsBoolean()
    @IsOptional()
    isMentee?: boolean
    @IsBoolean()
    @IsOptional()
    myMentor?: boolean
    @IsBoolean()
    @IsOptional()
    pendingRequest?: boolean
    @IsBoolean()
    @IsOptional()
    checkSession?: boolean
    @IsBoolean()
    @IsOptional()
    chatSupport?: boolean
    @IsString()
    @IsOptional()
    mentorId?: string;
    @IsString()
    @IsOptional()
    subject?: string;
    @IsString()
    @IsOptional()
    topics?: string;
}
export class UserCountry {
    name?: string;
    code?: string;
    confirmed?: boolean;
    callingCodes?: string[];
    currency?: string;
}
export class User {
    _id?: string;
    subjects?: string[];
    createdAt: Date;
    role: string;
    activeLocation: string;
    name: string;
    email: string;
    locations: string[];
    roles: string[];
    country?: UserCountry;
    userId: string;
}

export class GetRecommendedTestsQuery {
    page: number;
    limit: number;
    recommended: string;
    sort: string;
    home: boolean;
    testOnly: boolean;
}

export class GetRecommendedTestsRequest {
    @ApiProperty({ required: false })
    query?: GetRecommendedTestsQuery;
    user: User;
    instancekey: string;
}

export class Buyer {
    @ApiProperty()
    item: string;
    @ApiProperty()
    user: string;
}

export class UserInfo {
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
}

export class Subject {
    @ApiProperty()
    _id: string;
    @ApiProperty()
    name: string;
}

export class Country {
    @ApiProperty({ default: 'IN' })
    code: string;
    @ApiProperty({ default: 'India' })
    name: string;
    @ApiProperty({ default: 'INR' })
    currency: string;
    @ApiProperty({ default: 0 })
    price: number;
    @ApiProperty({ default: 0 })
    marketPlacePrice: number;
    @ApiProperty({ default: 0 })
    discountValue: number;
}


export class Field {
    @ApiProperty()
    label: string;
    @ApiProperty()
    value: boolean;
}

export class DemographicData {
    @ApiProperty({ default: false })
    city: boolean;
    @ApiProperty({ default: false })
    state: boolean;
    @ApiProperty({ default: false })
    dob: boolean;
    @ApiProperty({ default: false })
    gender: boolean;
    @ApiProperty({ default: false })
    rollNumber: boolean;
    @ApiProperty({ default: false })
    identificationNumber: boolean;
    @ApiProperty({ default: false })
    passingYear: boolean;
    @ApiProperty({ default: false })
    coreBranch: boolean;
    @ApiProperty({ default: false })
    collegeName: boolean;
    @ApiProperty({ default: false })
    identityVerification: boolean;
    @ApiProperty()
    field1: Field;
    @ApiProperty()
    field2: Field;
}

export class RandomTestDetail {
    @ApiProperty()
    topic: string;
    @ApiProperty()
    questions: number;
    @ApiProperty()
    quesMarks: number;
}

export class Question {
    @ApiProperty()
    question: string;
    @ApiProperty()
    section: string;
    @ApiProperty({ default: 0 })
    minusMark: number;
    @ApiProperty({ default: 0 })
    plusMark: number;
    @ApiProperty({ default: Date.now() })
    createdAt: Date;
    @ApiProperty()
    order: number;
}

export class Section {
    @ApiProperty({ default: false })
    name: string;
    @ApiProperty()
    time: number;
    @ApiProperty({ default: false })
    showCalculator: boolean;
    @ApiProperty({ default: 0 })
    optionalQuestions: number;
}


export class PracticeSetDto {
    _id: string;

    user: string;

    lastModifiedBy: string;

    @ApiProperty()
    lastModifiedDate: Date;

    @ApiProperty()
    active: boolean;

    @ApiProperty()
    userInfo: UserInfo;

    @ApiProperty({ type: () => [Unit] })
    units: Unit[];

    @ApiProperty({ type: () => [Subject] })
    subjects: Subject[];

    @ApiProperty()
    level: number;

    @ApiProperty({ enum: ['practice', 'proctored', 'learning'], default: 'practice' })
    testMode: string;

    @ApiProperty({ enum: ['public', 'invitation', 'buy', 'internal'], default: 'public' })
    accessMode: string;

    @ApiProperty({ type: () => [Country] })
    countries: Country[];

    @ApiProperty({ default: '', required: true })
    title: string;

    @ApiProperty({ default: '' })
    titleLower: string;

    @ApiProperty()
    courses: string[];

    @ApiProperty()
    testseries: string[];

    @ApiProperty()
    tags: string[];

    @ApiProperty()
    demographicData: DemographicData;

    @ApiProperty({ default: '' })
    description: string;

    @ApiProperty()
    inviteeEmails: string[];

    @ApiProperty()
    inviteePhones: string[];

    @ApiProperty()
    classRooms: string[];

    @ApiProperty()
    studentEmails: string[];

    @ApiProperty({ default: '' })
    instructions: string;

    @ApiProperty({ default: true })
    isMarksLevel: boolean;

    @ApiProperty({ default: true })
    enableMarks: boolean;

    @ApiProperty({ default: true })
    randomQuestions: boolean;

    @ApiProperty({ default: true })
    randomizeAnswerOptions: boolean;

    @ApiProperty({ default: true })
    sectionJump: boolean;

    @ApiProperty({ default: false })
    sectionTimeLimit: boolean;

    @ApiProperty({ default: 0 })
    minusMark: number;

    @ApiProperty({ default: 1 })
    plusMark: number;

    @ApiProperty({ default: '' })
    notes: string;

    @ApiProperty({ default: null })
    attemptAllowed: number;

    @ApiProperty({ enum: ['tempt', 'draft', 'published', 'revoked', 'expired'], default: 'draft', })
    status: string;

    @ApiProperty({ default: Date.now() })
    statusChangedAt: Date;

    @ApiProperty({ default: null })
    expiresOn: Date;

    @ApiProperty({ default: null })
    startDate: Date;

    @ApiProperty({ default: 0 })
    startTimeAllowance: number;

    @ApiProperty({ default: false })
    requireAttendance: boolean;

    @ApiProperty({ default: 0 })
    totalJoinedStudent: number;

    @ApiProperty({ default: Date.now() })
    createdAt: Date;

    @ApiProperty({ default: Date.now() })
    updatedAt: Date;

    @ApiProperty({ default: 0 })
    rating: number;

    @ApiProperty({ default: 0 })
    totalQuestion: number;

    @ApiProperty()
    questionsToDisplay: number;

    @ApiProperty({ default: false })
    isPartnerExam: boolean;

    @ApiProperty({ default: 30 })
    totalTime: number;

    @ApiProperty()
    questionsPerTopic: number;

    @ApiProperty({ default: 0 })
    totalAttempt: number;

    @ApiProperty({ default: true })
    isShowResult: boolean;

    @ApiProperty({ default: true })
    allowTeacher: boolean;

    @ApiProperty()
    locations: string[];

    @ApiProperty({ default: true })
    allowStudent: boolean;

    @ApiProperty({ default: true })
    isShowAttempt: boolean;

    @ApiProperty({ default: '' })
    createMode: string;

    @ApiProperty({ default: '' })
    testCode: string;

    @ApiProperty({ default: '' })
    dirPath: string;

    @ApiProperty({ default: false })
    isAdaptive: boolean;

    @ApiProperty()
    adaptiveTest: string;

    @ApiProperty({ type: () => [RandomTestDetail] })
    randomTestDetails: RandomTestDetail[];

    @ApiProperty({ default: false })
    showCalculator: boolean;

    @ApiProperty({ default: true })
    showFeedback: boolean;

    @ApiProperty({ default: false })
    peerVisibility: boolean;

    @ApiProperty({
        enum: ['student', 'teacher'],
        default: 'teacher'
    })
    initiator: string;

    @ApiProperty({
        enum: ['standard', 'adaptive', 'random'],
        default: 'standard'
    })
    testType: string;

    @ApiProperty({ type: () => [Question] })
    questions: Question[];

    @ApiProperty({ type: () => [Section] })
    sections: Section[];

    @ApiProperty()
    enabledCodeLang: string[];

    @ApiProperty({ default: false })
    enableSection: boolean;

    @ApiProperty({ default: false })
    camera: boolean;

    @ApiProperty({ default: true })
    fraudDetect: boolean;

    @ApiProperty({ default: false })
    pinTop: boolean;

    @ApiProperty({ default: true })
    autoEvaluation: boolean;

    @ApiProperty({ default: false })
    fullLength: boolean;

    @ApiProperty()
    imageUrl: string;

    @ApiProperty({ default: 0 })
    offscreenLimit: number;

    @ApiProperty({ type: () => [Buyer] })
    buyers: Buyer[];

    @ApiProperty()
    instructors: string[];

    @ApiProperty({ default: false })
    randomSection: boolean;

    @ApiProperty()
    uid: string;

    @ApiProperty({ default: false })
    synced: boolean;

    @ApiProperty()
    owner: string;

    @ApiProperty()
    origin: string;
}

export class GetRecommendedTestsResponse {
    results: PracticeSetDto[];
}

export class GetTakeTestsAgainRequest {
    @ApiProperty({ required: false })
    query?: Query;
    user?: User
    instancekey: string;
}

export class GetTakeTestsAgainResponse {
    results: PracticeSetDto[]
}

export class GetRecommendedVideosReq {
    query?: Query;
    instancekey: string;
}
export class GetRecommendedVideosRes {
    message?: string;
}

export class GetTextualAnalysisRequest {
    @ApiProperty({ required: false })
    query?: Query
    user?: User
    instancekey: string;
}

export class GetTextualAnalysisDto {
    _id: string;
    name: string;
    total: number;
}

export class GetTextualAnalysisResponse {
    results: GetTextualAnalysisDto[];
}

export class GetSummaryByNumberQuery {
    studentId: string;
    limit: string;
    lastDay: string;
    subjects: string;
}

export class GetSummaryByNumberRequest {
    query?: GetSummaryByNumberQuery;
    user?: User;
    instancekey: string;
}

class GetSummaryByNumberId {
    user: string;
    isAbandoned: boolean;
}
export class GetSummaryByNumberDto {
    totalQuestion: number;
    doQuestion: number;
    totalMissed: number;
    totalCorrect: number;
    totalTimeTaken: number;
    totalMark: number;
    totalTestMar: number;
    totalTest: number;
    _id: GetSummaryByNumberId;
}

export class GetSummaryByNumberResponse {
    results: GetSummaryByNumberDto[];
}

export class GetTopperSummaryByNumberQuery {
    studentId: string;
    limit: string;
    lastDay: string;
    subjects: string;
}

export class GetTopperSummaryByNumberRequest {
    query?: GetTopperSummaryByNumberQuery;
    user?: User;
    instancekey: string
}

class Topper {
    totalMark: number;
    totalAttempt: number;
    totalQuestion: number;
    totalTest: number;
}

class Average {
    totalMark: number;
    totalAttempt: number;
    totalQuestion: number;
    totalTest: number;
}

export class GetTopperSummaryByNumberResponse {
    topper: Topper;
    average: Average;
}

export class GetAverageTimeOnPlatformRequest {
    query?: Query
    user?: User
    instancekey: string;
}

export class GetAverageTimeOnPlatformResponse {
    user?: number;
    topper: number;
    average: number
}

export class GetEffortTrendAttemptCountRequest {
    query?: Query;
    user?: User;
    instancekey: string;
}

class GetEffortTrendAttemptCountId {
    year: number;
    month: number;
    day: number;
}

class GetEffortTrendAttemptCountAttemptCount {
    _id: GetEffortTrendAttemptCountId;
    attemptCount: number;
}

class GetEffortTrendAttemptCountAverageAttemptCount {
    _id: GetEffortTrendAttemptCountId;
    averageAttemptCount: number;
}

class GetEffortTrendAttemptCountTopperAttemptCount {
    _id: GetEffortTrendAttemptCountId;
    user: string[];
    topperAttemptCount: number;
}

export class GetEffortTrendAttemptCountResponse {
    user: GetEffortTrendAttemptCountAttemptCount[];
    average: GetEffortTrendAttemptCountAverageAttemptCount[];
    topper: GetEffortTrendAttemptCountTopperAttemptCount[];
}

export class GetLearningEffortsDistributionRequest {
    query?: Query;
    user?: User;
    instancekey: string
}

export class GetLearningEffortsDistributionId {
    subjectId: string;
}

export class LearningCount {
    _id: GetLearningEffortsDistributionId;
    subjectName: string;
    timeSpent: number;
}
export class GetLearningEffortsDistributionResponse {
    learningCount: LearningCount[];
}

export class GetSubjectQuestionComplexityRequest {
    query?: Query;
    user?: User;
    instancekey: string;
}

class Id {
    year: number;
    month: number;
    day: number;
    subject: string;
    complexity: string;
    category: string;
    user: string;
}

class SubComplexity {
    _id: string;
    partial: number;
    missed: number;
    correct: number;
    incorrect: number;
    skipped: number;
    subjectName: string;
    totaAttempt: number;
}


export class GetSubjectQuestionComplexityResponse {
    subComplexity: SubComplexity[];
}

export class QuestionCategoryDistributionRequest {
    query?: Query;
    user?: User;
    instancekey: string;
}

export class QuestionCategoryDistributionResponse {
    quesDistribution: SubComplexity[];
}

export class GetGroupParticipationRequest {
    query?: Query;
    user?: User;
    instancekey: string;
}

export class GroupParticipationDto {
    _id: Id;
    comments: number;
    posts: number;
    totaAttempt: number;
}

export class GetGroupParticipationResponse {
    groupParticipation: string;
}

export class GetPersistanceDataRequest {
    query?: Query;
    user?: User;
    instancekey: string;
}

class PersistDto {
    _id: Id;
    abandoned: number;
    success: number;
    totalAttempt: number;
}

export class GetPersistanceDataResponse {
    persist: PersistDto[];
}

export class GetEffortTrendAttemptTotalTimeRequest {
    query?: Query;
    user?: User;
    instancekey: string;
}

export class AverageTmeSpent {
    _id: Id;
    averageTimeSpent: number;
}

export class TopperTimeSpent {
    _id: Id;
    user: string;
    topperTimeSpent: number;
}

export class GetEffortTrendAttemptTotalTimeResponse {
    average: AverageTmeSpent;
    topper: TopperTimeSpent;
    user: any;
}

export class GetEffortTrendCourseTimeSpentRequest {
    query?: Query;
    user?: User;
    instancekey: string;
}

export class GetEffortTrendCourseTimeSpentResponse {
    user: any;
    average: AverageTmeSpent;
    topper: TopperTimeSpent;
}

export class GetUniqueQuestionsCountRequest {
    query?: Query;
    user?: User;
    instancekey: string;
}

class GetUniqueQuestionCountTopper {
    _id: string;
    doQuestion: number;
    practicesetId: string[]
    user: string;
}

class GetUniqueQuestionCountAverage {
    _id: string;
    average: number;
}

export class GetUniqueQuestionsCountDto {
    topper: GetUniqueQuestionCountTopper[];
    average: GetUniqueQuestionCountAverage[];
}

export class GetUniqueQuestionsCountResponse {
    data: GetUniqueQuestionsCountDto
}

export class GetAccuracyAndSpeedRequest {
    query?: Query;
    user?: User;
    instancekey: string;
}

export class GetAccuracyAndSpeedDto {
    _id: string;
    name: string;
    accuracy: number;
    speed: number;
}

export class GetAccuracyAndSpeedResponse {
    subjects: GetAccuracyAndSpeedDto[];
}

export class GetAccuracyAndSpeedByTopicRequest {
    query?: Query;
    user?: User;
    instancekey: string;
}

export class GetAccuracyAndSpeedByTopicResponse {
    topics: GetAccuracyAndSpeedDto[];
}

export class SummaryAttemptedPracticeQuery {
    @ApiProperty({ required: false })
    sort: string;
    @ApiProperty({ required: false })
    type: string;
    @ApiProperty({ required: false })
    limit: number;
    @ApiProperty({ required: false })
    page: number;
    @ApiProperty({ required: false })
    includeCount: boolean
    @ApiProperty({ required: false })
    searchText: string
    @ApiProperty({ required: false })
    topPerformers: boolean
    @ApiProperty({ required: false, description: 'comma seperated classroom Id' })
    classroom: string;
}

export class SummaryAttemptedPracticeRequest {
    query?: SummaryAttemptedPracticeQuery
    user?: User
    instancekey: string;
    practicesetId: string;
}

export class SubjectMark {
    name: string;
    marks: number;
}

export class Frame {
    captured: string;  // Assuming this is an ISO date string
    image: string;
}

export class FaceDetection {
    frames: Frame[];
    fraud: boolean;
}

export class StudentRecordDTO {
    subjectMarks: SubjectMark[];
    studentName: string;
    isEvaluated: boolean;
    isAbandoned: boolean;
    totalCorrects: number;
    totalMissed: number;
    totalErrors: number;
    totalPartial: number;
    totalMark: number;
    totalTimeTaken: number;
    user: string;  // Assuming this is an ObjectId stored as a string
    totalTestMark: number;
    offscreenTime: number;
    screenSwitched: number;
    fraudPenalty: number;
    face_detection: FaceDetection;
    _id: string;  // Assuming this is an ObjectId stored as a string
    totalTimeTakenMi: number;
    avgTime: number;
    accessMode: string;
    classroom: string[];  // Assuming these are ObjectIds stored as strings
    pecentCorrects: number;
    fraud: number;
    fullName: string | null;
    userId: string;
    rollNumber: string;
    state: string;
    passingYear: number;
    totalQuestions: number;
    practiceSetInfo: string;
    createdBy: string;
    createdAt: string;  // Assuming this is an ISO date string
    startTime: string;  // Assuming this is an ISO date string
    owner: string;  // Assuming this is an ObjectId stored as a string
    updatedAt: string;  // Assuming this is an ISO date string
    endTime: string;  // Assuming this is an ISO date string
    avatar: any;  // You might want to replace 'any' with the actual type of avatar if known
    classroomName: string;
}
export class SummaryAttemptedPracticeDto {
    attempts: StudentRecordDTO[]
}

export class SummaryAttemptedPracticeResponse {
    result: SummaryAttemptedPracticeDto[];
}

export class SummaryAttemptedTestSeriesReq {
    _id: string;
    query?: Query
    user?: User
    instancekey: string;
}
export class SummaryAttemptedTestSeriesRes {
    result: SummaryAttemptedPracticeDto[];
}

export class SummaryPsychoPracticeRequest {
    query?: Query;
    user?: User;
    instancekey: string;
    practicesetId: string;
}

class SummaryPsychoPracticeUser {
    _id: string;
    name: string;
    userId: string;
}

class SummaryPsychoPracticeAttempts {
    _id: string;
    user: SummaryPsychoPracticeUser;
    createdAt: string;
    neuroticism: number;
    extraversion: number;
    agreeableness: number;
    conscientiousness: number;
}

class SummaryPsychoPracticeDto {
    attempts: SummaryPsychoPracticeAttempts[];
    total: number;
}

export class SummaryPsychoPracticeResponse {
    result: SummaryPsychoPracticeDto;
}

export class SummaryOnePracticeSetRequest {
    query?: Query;
    instancekey: string;
    practicesetId: string;
}

export class SummaryOnePracticeSetResponse {
    result: string;
}

export class GetResultPracticeRequest {
    query: Query;
    practicesetId: string;
    instancekey: string;
}

export class GetResultPracticeResponse {
    attempt: Attempt;
}

export class GetAttemptsQuery {
    @ApiProperty({ required: false })
    page: number;
    @ApiProperty({ required: false })
    limit: number;
    @ApiProperty({ required: false })
    sort: string;
    @ApiProperty({ required: false })
    home: string;
    @ApiProperty({ required: false })
    practice: string
    @ApiProperty({ required: false })
    lastDay: string
    @ApiProperty({ required: false })
    onlyDay: string
    @ApiProperty({ required: false })
    keyword: string
    @ApiProperty({ required: false })
    publiser: string
    @ApiProperty({ required: false })
    subjects: string
    @ApiProperty({ required: false })
    unit: string
}

export class GetAttemptsRequest {
    query?: GetAttemptsQuery;
    user?: User;
    instancekey: string;
}

class IdentityInfo {
    imageUrl: string;
    fileUrl: string;
    matchedPercentage: number;
}

export class GetAttemptsDto {
    _id: string;
    practiceSetInfo: PracticeSetInfo;
    face_detection: FaceDetection;
    identityInfo: IdentityInfo;
    lastIndex: number;
    isEvaluated: boolean;
    partial: number;
    partiallyAttempted: boolean;
    isLevelReset: boolean;
    pending: number;
    maximumMarks: number;
    isShowAttempt: boolean;
    isFraudulent: boolean;
    markedSuspicious: boolean;
    isAnsync: boolean;
    isCratedOffline: boolean;
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
    fraudDetected: Date[]
    terminated: boolean;
    resumeCount: number;
    ongoing: boolean;
    user: string;
    studentName: string;
    practicesetId: string;
    createdBy: CreatedBy;
    totalQuestions: number;
    email: string;
    subjects: Subjects[]
    createdAt: string;
    updatedAt: string;
    attemptdetails: string;
    location: string;
    averageTime: number;
}

export class GetAttemptsResponse {
    attempts: GetAttemptsDto[];
}

export class CountAttemptsRequest {
    user?: User;
    query?: Query;
    instancekey: string;
}

export class CountAttemptsResponse {
    count: number;
}

export class GetAttemptRequest {
    user: User;
    attemptId: string;
    instancekey: string;
}

export class GetAttemptResponse {
    attempt: Attempt
}

export class GetAwsFaceRegSignedUrlRequest {
    instancekey: string;
    query?: Query;
    attemptId: string;
    user?: User
}

class GetAwsFaceRegSignedUrlDto {
    filePath: string;
    url: string;
}

export class GetAwsFaceRegSignedUrlResponse {
    signedObj: GetAwsFaceRegSignedUrlDto;
}

export class GetUserAssetsSignedUrlRequest {
    instancekey: string;
    query?: Query;
    attemptId: string;
}

export class GetUserAssetsSignedUrlResponse {
    signedUrl: string;
    fileUrl: string;
}

export class GetRecordingsSignedUrlRequest {
    instanceKey: string;
    query?: Query;
    attemptId: string;
}

export class GetRecordingsSignedUrlResponse {
    filePath: string;
    url: string;
}

export class GetQrUploadSignedUrlRequest {
    instanceKey: string;
    query?: Query;
    attemptId: string;
}

export class GetQrUploadSignedUrlResponse {
    filePath: string;
    url: string;
}

export class GetBestAttemptRequest {
    practicesetId: string;
    instancekey: string;
    user: User
}

export class GetBestAttemptResponse {
    attempt: Attempt
}

export class AverageAttemptRequest {
    practicesetId: string;
    instancekey: string;
}

export class AverageAttemptDto {
    _id: string;
    name: string;
    accuracy: number;
    speed: number;
}

export class AveragetAttemptResponse {
    subjects: AverageAttemptDto[];
}

export class GetSubjectWiseSpeedAndAccuracyRequest {
    user: User;
    instancekey: string;
}

class GetSubjectWiseSpeedAndAccuracyDto {
    _id: string;
    subject: string;
    averageSpeed: number;
    averageAccuracy: number;
}

export class GetSubjectWiseSpeedAndAccuracyResponse {
    data: GetSubjectWiseSpeedAndAccuracyDto;
}

export class GetTotalQuestionSolvedRequest {
    query: Query;
    user: User;
    instancekey: string;
}

export class GetTotalQuestionSolvedDto {
    _id: string;
    name: string;
    doQuestion: number;
}

export class GetTotalQuestionSolvedResponse {
    subjects: GetTotalQuestionSolvedDto[];
}

export class GetStudentAttemptsRequest {
    user: User;
    query: Query;
    userId: string;
    instancekey: string;
}

export class GetStudentAttemptsResponse {
    attempt: Attempt[];
}

export class CountStudentAttemptsRequest {
    user: User;
    query?: Query;
    userId: string;
    instancekey: string;
}

export class CountStudentAttemptsResponse {
    count: number;
}

export class GetStudentAttemptRequest {
    user: User;
    attemptId: string;
    studentId: string;
    instancekey: string;
}

export class GetStudentAttemptResponse {
    attempt: Attempt;
}

export class GetLastStudentAttemptRequest {
    instancekey: string;
    studentId: string;
    user: User;
    query?: Query
}
export class GetLastStudentAttemptResponse {
    attempt: Attempt
}

export class GetClassroomsReq {
    instancekey: string;
    user: User;
}

export class GetMentorsReq {
    instancekey: string;
    token?: string;
    user: User;
    query: Query;
}

export class SendInvitationReq {
    userId: string;
    instancekey: string;
    user: User;
}

export class ExportProfileReq {
    _id: string;
    instancekey: string;
}

export class GetSubjectwiseRankingReq {
    user: User;
    subjectId: string;
    query: Query;
    instancekey: string;
}

export class GetMarkRankingReq {
    user: User;
    query: Query;
    instancekey: string;
}

export class AddMentorReq {
    user: User;
    instancekey: string;
    @ApiProperty()
    @IsString()
    email: string;
    @ApiProperty()
    @IsString()
    mentorId: string;
    @ApiProperty()
    @IsString()
    name: string;
}

export class RemoveMentorReq {
    user: User;
    instancekey: string;
    token: string;
    mentorId: string;
}

class FindAllQuery {
    @ApiProperty({ required: false })
    page?: number;
    @ApiProperty({ required: false })
    limit?: number;
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    sort?: string;
    @ApiProperty({ required: false })
    tags?: string;
    @ApiProperty({ required: false })
    upcoming?: boolean;
    @ApiProperty({ required: false })
    adaptive?: boolean;
    @ApiProperty({ required: false })
    home?: boolean;
    @ApiProperty({ required: false })
    includeLastAttempt?: boolean;
    @ApiProperty({ required: false })
    attempted: boolean;
    @ApiProperty({ required: false })
    invitation: boolean;
    @ApiProperty({ required: false })
    buy: boolean;
    @ApiProperty({ required: false })
    purchase: boolean;
    @ApiProperty({ required: false })
    nonPaid: boolean;
    @ApiProperty({ required: false })
    unattempted: boolean;
    @ApiProperty({ required: false })
    multi: boolean;
    @ApiProperty({ required: false, description: 'comma seperated publisher ids' })
    publiser: string;
    @ApiProperty({ required: false })
    new: boolean;
    @ApiProperty({ required: false, description: 'comma seperated unit ids' })
    units: string;
    @ApiProperty({ required: false })
    rejectBuy: string;
    @ApiProperty({ required: false })
    showFavoriteOnly: boolean;
    @ApiProperty({ required: false })
    title: string;
    @ApiProperty({ required: false, description: 'comma seperated subject ids' })
    subjects: string;
}
export class FindAllRequest {
    instancekey: string;
    user: User;
    query: FindAllQuery;
}
export class FindAllResponse {
    response: PracticeSetDto[];
}