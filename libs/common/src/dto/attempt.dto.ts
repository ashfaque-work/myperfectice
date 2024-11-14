import { ApiProperty } from "@nestjs/swagger";
import { bool } from "aws-sdk/clients/signer";
import { Types } from "mongoose";

export interface Empty { }

class Common {
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
    terminated: boolean;
    resumeCount: number;
    ongoing: boolean;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    studentName: string;
    idOffline: string;
    totalQuestions: number;
    userId: string;
}
class FilterRequest {
    @ApiProperty({ required: false })
    lastDay?: number;
    @ApiProperty({ required: false })
    onlyDay?: number;
    @ApiProperty({ required: false })
    keyword?: string;
    @ApiProperty({ required: false })
    publisher?: string;
    @ApiProperty({ required: false })
    practice?: string;
    @ApiProperty({ required: false })
    subject?: string
    userSubjects: string;
}

class Subject {
    @ApiProperty()
    _id: string;
    @ApiProperty()
    name: string;
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

export class Subjects {
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

export class PracticeSetInfo {
    title: string;
    subjects: Subjects[]
    classRooms: Types.ObjectId[]
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
    @ApiProperty()
    url: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    type: string;
}

export class TestCaseQA {
    @ApiProperty()
    args: string;
    @ApiProperty()
    input: string;
    @ApiProperty()
    output: string;
    @ApiProperty()
    status: boolean;
    @ApiProperty()
    runTime: number;
    error: string;
}

export class AnswerQA {
    @ApiProperty()
    answerId: Types.ObjectId;
    @ApiProperty()
    answerText: string;
    @ApiProperty()
    userText: string;
    @ApiProperty()
    codeLanguage: string;
    @ApiProperty()
    code: string;
    @ApiProperty({ type: [TestCaseQA] })
    testcases: TestCaseQA[];
    @ApiProperty()
    userArgs: string;
    @ApiProperty()
    userInput: string;
    @ApiProperty()
    output: string;
    @ApiProperty()
    compileMessage: string;
    @ApiProperty()
    compileTime: number;
    @ApiProperty()
    mathData: string;
    @ApiProperty()
    timeElapse: number;
    @ApiProperty({ type: [AttachmentQA] })
    attachments: AttachmentQA[];
}

class Question {
    @ApiProperty()
    question: Types.ObjectId
    @ApiProperty()
    section: string
    @ApiProperty()
    minusMark: number
    @ApiProperty()
    plusMark: number
    @ApiProperty()
    createdAt: Date
    @ApiProperty()
    order: number
}

export class QA {
    @ApiProperty({ type: [Question] })
    question: Question[];
    @ApiProperty()
    timeEslapse: number;
    @ApiProperty()
    timeLeft?: number;
    @ApiProperty()
    stdTime?: number;
    @ApiProperty()
    index?: number;
    @ApiProperty()
    answerChanged?: number;
    @ApiProperty()
    status?: number;
    @ApiProperty()
    category?: string;
    @ApiProperty()
    offscreen?: number[];
    @ApiProperty()
    feedback?: boolean;
    @ApiProperty()
    createdAt?: Date;
    @ApiProperty()
    isMissed?: boolean;
    @ApiProperty()
    hasMarked?: boolean;
    @ApiProperty()
    actualMarks?: number;
    @ApiProperty()
    obtainMarks?: number;
    @ApiProperty()
    topic?: Topic;
    @ApiProperty()
    unit?: Unit;
    @ApiProperty()
    subject?: Subject;
    @ApiProperty()
    answers?: AnswerQA[];
    @ApiProperty()
    teacherComment?: string;
    @ApiProperty()
    reviewTimes?: number;
    @ApiProperty()
    reviewTimeSpent?: number;
    @ApiProperty()
    tComplexity?: number;
    @ApiProperty()
    answerOrder?: Types.ObjectId[];
    @ApiProperty()
    scratchPad?: string[];
    @ApiProperty()
    evaluatorAssigned?: boolean;
}

export class FindAllByMeRequest extends FilterRequest {
    @ApiProperty({ required: false })
    page?: number;
    @ApiProperty({ required: false })
    limit?: number;
    @ApiProperty({ required: false })
    sort?: string;
    userId: string;
    instancekey: string;
}

class FaceDetectionDto {
    capture: Date
    headCount: Date
    candidate: boolean
    image: string
}

class FaceDetection {
    frames: FaceDetectionDto[]
    fraud: boolean
}

class IdentityInfo {
    imageUrl: string;
    fileUrl: string;
    matchedPercentage: number;
}

class UserInfo {
    _id: Types.ObjectId;
    name: string;
}

class Country {
    code: string;
    name: string;
    currency: string;
    price: number;
    marketPlacePrice: number;
    discountValue: number;
}

class Field {
    label: string
    value: boolean
}

export class DemographicData {
    city: boolean;
    state: boolean;
    dob: boolean;
    gender: boolean;
    rollNumber: boolean;
    identificationNumber: boolean;
    passingYear: boolean;
    coreBranch: boolean;
    collegeName: boolean;
    identityVerification: boolean;
    field1: Field
    field2: Field
}

class RandomTestDetail {
    topic: Types.ObjectId
    questions: number
    quesMarks: number
}


class Section {
    name: string
    time: number
    showCalculator: boolean
    optionalQuestions: number
}

class Buyer {
    item: Types.ObjectId
    user: Types.ObjectId
}

class PracticeSetId {
    user: Types.ObjectId | User
    lastModifiesBy: Types.ObjectId
    lastModifiedDate: Date;
    active: bool;
    userInfo: UserInfo;
    units: Subject[];
    subjects: Subject[];
    level: number;
    countries: Country[]
    title: string;
    titleLower: string;
    courses: Types.ObjectId[]
    testseries: Types.ObjectId[]
    tags: string[]
    demographicData: DemographicData
    description: string;
    inviteeEmalis: string[]
    inviteePhones: string[]
    classRooms: Types.ObjectId[]
    studentEmails: string[]
    isMarksLevel: boolean;
    enableMarks: boolean
    randomQuestions: boolean;
    randomizeAnswerOptions: boolean;
    sectionJump: boolean;
    sectionTimeLimit: boolean;
    minusMark: number;
    plusMark: number;
    notes: string;
    attemptAllowed: number;
    status: string;
    statusChangedAt: Date;
    expiresOn: Date;
    startDate: Date;
    startTimeAllowance: number;
    requireAttendance: bool;
    totalJoinedStudent: number;
    createdAt: Date;
    updatedAt: Date;
    rating: number;
    totalQuestion: number;
    questionsToDisplay: number;
    isPartnerExam: boolean;
    totalTime: number;
    questionPerTopic: number;
    totalAttempt: number;
    isShowResult: boolean;
    allowTeacher: boolean;
    locations: Types.ObjectId[]
    allowStudent: boolean;
    isShowAttempt: boolean;
    createMode: string;
    testCode: string;
    dirPath: string;
    isAdaptive: boolean;
    adaptiveTest: Types.ObjectId;
    randomTestDetails: RandomTestDetail[]
    showCalculator: boolean;
    showFeedback: boolean;
    peerVisibility: boolean;
    initiator: string;
    testType: string;
    questions: Question[]
    sections: Section[]
    enableCodeLang: string[]
    camera: boolean;
    fraudDetect: boolean;
    pinTop: boolean;
    autoEvaluation: boolean;
    fullLength: boolean;
    imageUrl: string;
    offscreenLimit: number;
    buyers: Buyer[]
    instructors: Types.ObjectId[]
    randomSection: boolean;
    uid: string;
    synced: boolean;
    owner: Types.ObjectId;
    origin: string;
}

export class Attempt extends Common {
    createdBy: CreatedBy;
    practiceSetInfo: PracticeSetInfo;
    face_detection: FaceDetection;
    identityInfo: IdentityInfo;
    fraudDetected: Date[];
    user: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    subjects: Subjects[]
    attemptdetails: Types.ObjectId | AttemptDetail;
    location: Types.ObjectId;
    QA?: QA[];
    practicesetId?: PracticeSetId | string
}

export class FindAllByMeResponse {
    res: Attempt[];
}

export class GetFirstAttemptRequest {
    userId: string;
    instancekey: string;
}
export class GetFirstAttemptResponse {
    attempt: Attempt;
}

export class FindQuestionFeedbackRequest {
    instancekey: string;
    attemptId: string;
}

export class FindQuestionFeedbackDto {
    studentId: Types.ObjectId;
    teacherId: Types.ObjectId;
    attemptId: Types.ObjectId;
    questionId: Types.ObjectId;
    comment: string;
    updatedAt: Date;
    createdAt: Date;
    responded: boolean;
    feedbacks: string[]
}

export class FindQuestionFeedbackResponse {
    qFeedback: FindQuestionFeedbackDto[];
}

export class FindOneAttemptByMeRequest {
    instancekey: string;
    userId: string;
    attemptId: string;
}

class EntranceExam {
    year: string;
    rank: number;
    name: string;
}

export class AcademicProjects {
    name: string;
    groupSize: string;
    description: string;
    startDate: Date;
    endDate: Date;
    document: string;
    url: string;
    sysgen: boolean;
};

export class industryCertificates {
    name: string;
    provider: string;
    certificateDate: Date;
    expiredDate: Date;
    certificate: string;
    url: string;
    sysgen: boolean;
};

export class ExternalAssessment {
    name: string;
    mostRecentScore: number;
    yearOfAssessment: number;
    maximumScore: number;
}

export class AwardsAndRecognition {
    awardDetails: string;
    date: Date;
}

export class ExtraCurricularActivities {
    activityDetails: string;
    startDate: Date;
    endDate: Date;
}

export class PackageSchedules {
    package: Types.ObjectId;
    code: string;
}

export class Experiences {
    title: string;
    employmentType: string;
    company: string;
    location: string;
    currentlyWorking: boolean;
    startDate: Date;
    endDate: Date;
    description: string;
}

export class LevelHistory {
    subjectId: string;
    level: number;
    updateDate: Date;
}

export class User {
    email: string;
    roles: string[];
    name: string;
    isActive: bool;
    emailVerifyExpired: Date;
    managerPractice: boolean;
    practiceView: Types.ObjectId[];
    userId: string;
    emailStudents: string[];
    state: string;
    lastLogin: Date;
    onboarding: boolean;
    birthdate: Date;
    subjects: Types.ObjectId[];
    country: Country;
    practiceAttempted: Types.ObjectId[];
    follwing: Types.ObjectId[];
    managerStudent: boolean;
    followers: Types.ObjectId[];
    isPublic: boolean;
    emailVerifyToken: string;
    locations: Types.ObjectId[];
    provider: string;
    status: boolean;
    emailVerified: boolean;
    allowOnlineClass: boolean;
    profileCompleted: number;
    district: string;
    interest: string;
    knowAboutUs: string;
    interestedSubject: Types.ObjectId[];
    trainingCertifications: Types.ObjectId[];
    specialization: Types.ObjectId[];
    whiteboard: boolean;
    liveboard: boolean;
    isVerified: boolean;
    isMentor: boolean;
    blockedUsers: Types.ObjectId[];
    optoutDate: Date;
    ambassador: boolean;
    streamUrl: string;
    createdAt: Date;
    updatedAt: Date;
    programmingLang: string[];
    educationDetails: string[];
    entranceExam: EntranceExam[];
    academicProjects: AcademicProjects[]
    industryCertificates: industryCertificates[]
    externalAssessment: ExternalAssessment[]
    awardsAndRecognition: AwardsAndRecognition[]
    extraCurricularActivities: ExtraCurricularActivities[]
    packageSchedules: PackageSchedules[]
    experiences: Experiences[]
    levelHistory: LevelHistory[]
    activeLocation: Types.ObjectId;
}

export class FindOneAttemptByMeDto extends Common {
    createdBy: CreatedBy;
    practiceSetInfo: PracticeSetInfo;
    face_detection: FaceDetection;
    identityInfo: IdentityInfo;
    fraudDetected: Date[];
    practicesetId: Types.ObjectId;
    user: User
    createdAt: Date;
    updatedAt: Date;
    subjects: Subjects[]
    location: Types.ObjectId
    practiceset: PracticeSetId;
    QA: QA[]
}

export class FindOneAttemptByMeResponse {
    attemptObj: FindOneAttemptByMeDto;
}

export class IsAllowDoTestRequest {
    practiceId: string;
    instancekey: string;
    userId: string;
}

export class IsAllowDoTestResponse {
    allowed: boolean;
}


export class FindAllByTeacherRequest extends FilterRequest {
    @ApiProperty({ required: false })
    page?: number;
    @ApiProperty({ required: false })
    limit?: number;
    @ApiProperty({ required: false })
    sort?: string;
    user: string;
    instancekey: string;
    userId: string;
}

export class FindAllByTeacherResponse {
    docs: Attempt[];
}

export class GetCurrentDateResponse {
    date: Date
}

export class CountAllByTeacherRequest extends FilterRequest {
    userId: string;
    @ApiProperty({ required: false })
    user: string;
    instancekey: string;
}

export class CountAllByTeacherResponse {
    count: number;
}

export class CountMeRequest extends FilterRequest {
    userId: string;
    @ApiProperty({ required: false })
    allowAbandoned?: boolean;
    instancekey: string;
}

export class CountMeResponse {
    count: number;
}

export class CountAllRequest {
    @ApiProperty({ required: false })
    practice?: string;
    instancekey: string;
}

export class CountAllResponse {
    count: number;
}

export class FindAllByPracticeRequest {
    instancekey: string;
    practicesetId: string;

}

export class FindAllByPracticeDto extends Common {
    createdBy: CreatedBy;
    practiceSetInfo: PracticeSetInfo;
    face_detection: FaceDetection;
    identityInfo: IdentityInfo;
    practicesetId: string;
    location: string;
    totalQuestion: number;
    fraudDetected: Date[];
    user: User
    subjects: Subjects
    QA: QA[]
    perCentCorrect: string;
    totalTimeElapse: number;
    averageTime: string;
}

export class FindAllByPracticeResponse {
    result: FindAllByPracticeDto[]
}

export class GetResultPracticeRequest {
    practicesetId: string;
    @ApiProperty({ required: false })
    attemptId?: string;
    instancekey: string;
}

export class GetResultPracticeResponse {
    attempt: Attempt;
}

export class GetLastByMeRequest {
    userId: string;
    instancekey: string;
    @ApiProperty({ required: false })
    practicesetId: string;
}

class Analysis {
    isAbandoned: boolean;
    practicesetId: string;
    user: string;
    attempt: string;
    QA: QA[]
    createdAt: string;
    updatedAt: string;
}

export class GetLastDto extends Common {
    createdBy: CreatedBy;
    practiceSetInfo: PracticeSetInfo;
    face_detection: FaceDetection;
    identityInfo: IdentityInfo;
    practicesetId: string;
    user: User;
    subjects: Subjects;
    attemptdetails: string;
    analysis: Analysis
}

export class GetLastByMeResponse {
    attempt: GetLastDto
}

export class GetLastByStudentRequest {
    instancekey: string;
    userId: string;
}

export class GetLastByStudentResponse {
    attempt: GetLastDto
}

export class GetListAvgSpeedByPracticeRequest {
    practicesetId: string;
    @ApiProperty({ required: false })
    subject?: string;
    instancekey: string;
}

export class GetListAvgSpeedByPracticeDto {
    user: string;
    totalQuestions: number;
    realTime: number;
    totalTime: number;
    avgSpeed: number;
}

export class GetListAvgSpeedByPracticeResponse {
    result: GetListAvgSpeedByPracticeDto[];
}

export class GetListPercentCorrectByPracticeRequest {
    practicesetId: string;
    @ApiProperty({ required: false })
    subject?: string;
    instancekey: string;
}

export class GetListPercentCorrectByPracticeDto {
    user: string;
    totalQuestion: number;
    totalCorrects: number;
    accuracyPercent: number;
}

export class GetListPercentCorrectByPracticeResponse {
    result: GetListPercentCorrectByPracticeDto[];
}

export class GetPsychoClassroomRequest {
    userRole: string;
    userId: string;
    instancekey: string;
    practiceset: string;
    locations: string[];
}

export class GetPsychoClassroomResponse {
    classes: string[];
}

export class GetAllProvidersRequest {
    instancekey: string;
}

export class GetAllProvidersDto {
    contentProviders: string[]
}

export class GetAllProvidersResponse {
    contents: GetAllProvidersDto;
}

export class FindOneByMeRequest {
    instancekey: string;
    attemptId: string;
}


export class FindOneByMeDto extends Common {
    createdBy: CreatedBy;
    practiceSetInfo: PracticeSetInfo;
    face_detection: FaceDetection
    identityInfo: IdentityInfo;
    practicesetId: string;
    user: string;
    subjects: Subjects[];
    attemptType: string;
    location: string;
    QA: QA[]
    practiceset: PracticeSetDto
}

export class FindOneByMeResponse {
    attemptObj: FindOneByMeDto;
}

export class InvitationDto extends Common {
    createdBy: CreatedBy;
    practiceSetInfo: PracticeSetInfo;
    face_detection: FaceDetection;
    identityInfo: IdentityInfo;
    fraudDetected: string[];
    practicesetId: string;
    user: User;
    subjects: Subjects[]
    attemptType: string;
    location: string;
    QA: QA[]
    practiceset: PracticeSetDto
}
export class InvitationRequest {
    attemptId: string;
    @ApiProperty({ required: false })
    isTeacher?: boolean;
    @ApiProperty({ required: false })
    feedbackPage?: string;
    userId: string;
    instancekey: string
}


export class InvitationResponse {
    attemptObj: InvitationDto;
}

export class FindAllNotCreatedByRequest {
    instancekey: string;
}

export class FindAllNotCreatedByResponse {
    attempts: Attempt[];
}

export class GetListSubjectsMeRequest {
    @ApiProperty({ required: false })
    subjects?: string;
    @ApiProperty({ required: false })
    user?: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    instancekey: string;
    userId: string;
    userSubjects: string[];
}

export class GetListSubjectsMeResponse {
    results: Subject[];
}

export class GetTotalQuestionTopicMeRequest {
    userId: string;
    @ApiProperty({ required: false })
    lastDay?: number;
    @ApiProperty({ required: false })
    subjects: string;
    instancekey: string;
}

export class GetTotalQuestionTopicMeDto {
    total: number;
    name: string;
    lowerCase: string;
}

export class GetTotalQuestionTopicMeResponse {
    result: GetTotalQuestionTopicMeDto[];
}

export class GetTotalQuestionBySubjectMeRequest {
    userId: string;
    instancekey: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
}

export class GetTotalQuestionBySubjectMeDto {
    tota: number;
    totalVitrual: number;
    timeEslapseVitrual: number;
    name: string;
    timeEslapse: number;
}

export class GetTotalQuestionBySubjectMeResponse {
    result: GetTotalQuestionBySubjectMeDto[];
}

export class GetListTopicsMeRequest {
    instancekey: string;
    userId: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
}

export class GetListTopicsMeDto {
    name: string;
    subject: string;
}
export class GetListTopicsMeResponse {
    result: GetListTopicsMeDto[];
}

export class SummaryTopicCorrectMeRequest {
    instancekey: string;
    userId: string;
    @ApiProperty({ required: false })
    limit?: number;
    @ApiProperty({ required: false })
    subjects?: string;
    @ApiProperty({ required: false })
    lastDay?: string;
}

export class SummaryTopicCorrectMeDto {
    name: string;
    total: number;
    timeEslapse: number;
}

export class SummaryTopicCorrectMeResponse {
    result: SummaryTopicCorrectMeDto[];
}

export class SummaryTopicSpeedMeRequest {
    userId: string;
    instancekey: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
    @ApiProperty({ required: false })
    limit?: number;
}

export class SummaryTopicSpeedMeDto {
    name: string;
    total: number;
    timeEslapse: number;
}

export class SummaryTopicSpeedMeResponse {
    result: SummaryTopicSpeedMeDto[];
}

export class SummarySubjectCorrectMeRequest {
    instancekey: string;
    userId: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
    @ApiProperty({ required: false })
    limit?: number;
}

export class SummarySubjectCorrectMeDto {
    name: string;
    total: number;
    timeEslapse: number;
    totalQuestionsDo: number;
}

export class SummarySubjectCorrectMeResponse {
    result: SummarySubjectCorrectMeDto[];
}

export class SummarySubjectCorrectByDateMeRequest {
    @ApiProperty({ required: false })
    user?: string;
    userId: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
    instancekey: string;
    userSubjects: string[]
    timezoneoffset: number;
}

class Day {
    year: number;
    month: number;
    day: number;
    subjectId: string;
    topicId: string;
    user: string;
}

export class SummarySubjectCorrectByDateMeDto {
    day: Day;
    correct: number;
    subjectId: string;
    totalQuestion: number;
    totalQuestionDo: number;
    timeEslapse: number;
    pecentCorrects: number;
    name: string;
}

export class SummarySubjectCorrectByDateMeResponse {
    results: SummarySubjectCorrectByDateMeDto[];
}

export class SummaryCorrectByDateMeRequest {
    userId: string;
    @ApiProperty({ required: false })
    lastDay: string;
    @ApiProperty({ required: false })
    subjects: string;
    @ApiProperty({ required: false })
    topic?: string;
    timezoneoffset: number;
    instancekey: string;
}

export class SummaryCorrectByDateMeDto {
    day: Day;
    topicCorrect: number;
    topic: string;
    totalQuestion: number;
    pecentCorrects: number;
}

export class SummaryCorrectByDateMeResponse {
    results: SummaryCorrectByDateMeDto[];
}

export class SummarySubjectSpeedByDateMeRequest {
    @ApiProperty({ required: false })
    lastDay: string;
    @ApiProperty({ required: false })
    subjects: string;
    userId: string;
    instancekey: string;
    timezoneoffset: number;
}

export class SummarySubjectSpeedByDateMeDto {
    day: Day;
    timeEslapse: number;
    totalQuestions: number;
    subjectId: string;
}

export class SummarySubjectSpeedByDateMeResponse {
    results: SummarySubjectSpeedByDateMeDto[];
}

export class SummaryAttemptedBySubjectMeRequest {
    userId: string;
    instancekey: string;
    @ApiProperty({ required: false })
    lastDay: string;
    @ApiProperty({ required: false })
    subjects: string;
}

export class SummaryAttemptedBySubjectMeDto {
    totalMark: number;
    totalTestMark: number;
    doTime: number;
    doQuestion: number;
    totalMissed: number;
    totalCorrects: number;
    totalQuestions: number;
    avgTimeDoQuestion: number;
    avgTimeQuestion: number;
}

export class SummaryAttemptedBySubjectMeResponse {
    results: SummaryAttemptedBySubjectMeDto[];
}

export class SummarySubjectSpeedMeRequest {
    instancekey: string;
    userId: string;
    @ApiProperty({ required: false })
    lastDay: string;
    @ApiProperty({ required: false })
    subjects: string;
    @ApiProperty({ required: false })
    limit: number
}

export class SummarySubjectSpeedMeDto {
    name: string;
    total: number;
    timeEslapse: number;
}

export class SummarySubjectSpeedByMeResponse {
    results: SummarySubjectSpeedMeDto[];
}

export class SummaryQuestionByTopicMeRequest {
    userId: string;
    instancekey: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
}

class SummaryQuestionByTopicMeDto {
    _id: string;
    total: number;
}

export class SummaryQuestionByTopicMeResponse {
    results: SummaryQuestionByTopicMeDto[];
}

export class SummaryAbondonedMeRequest {
    userId: string;
    instancekey: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
}

export class SummaryAbondonedMeResponse {
    results: number;
}

export class SummaryPracticeMeRequest {
    instancekey: string;
    userId: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
}

export class SummaryPracticeMeResponse {
    results: number;
}

export class SummaryQuestionBySubjectMeRequest {
    instancekey: string;
    userId: string;
    @ApiProperty({ required: false })
    lastDay?: string;
}

export class SummaryQuestionBySubjectMeDto {
    total: number;
    subject: Subject
}

export class SummaryQuestionBySubjectMeResponse {
    results: SummaryQuestionBySubjectMeDto[];
}

export class SummaryDoPracticeRequest {
    user?: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
    userId?: string;
    instancekey: string;
}

export class SummaryDoPracticeResponse {
    results: number;
}

export class QuestionByConfidenceRequest {
    @ApiProperty({ required: false, description: "UserId" })
    user?: string;
    @ApiProperty({ required: false })
    limit?: number;
    instancekey: string;
}
class SubjectDto {
    subject: string;
    answerChanged: number;
    hasMarked: number;
}

class TopicDto {
    topic: string;
    answerChanged: number;
    hasMarked: number;
}

class ResultsDto {
    Subject: SubjectDto[];
    Topic: TopicDto[];
}

export class QuestionByConfidenceResponse {
    results: ResultsDto;
}

export class SummarySpeedTopicByDateMeRequest {
    userId: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
    @ApiProperty({ required: false })
    topic?: string;
    timezoneoffset: number;
    instancekey: string;
}

class SummarySpeedTopicByDateMeDto {
    day: Day;
    topic: string;
    avgSpeed: number
}

export class SummarySpeedTopicByDateMeResponse {
    results: SummarySpeedTopicByDateMeDto[];
}

export class GetSpeedRankRequest {
    instancekey: string;
    practicesetId: string;
    @ApiProperty({ required: false, description: "subject" })
    subject?: string;
    user?: string;
    userId?: string;
}

export class GetSpeedRankResponse {
    rank: number;
}

export class GetAccuracyRankRequest {
    instancekey: string;
    practicesetId: string;
    @ApiProperty({ required: false, description: "SubjectId" })
    subject: string;
    user?: string;
    userId?: string;
}

export class GetAccuracyRankResponse {
    rank: number;
}

export class GetAccuracyPercentileRequest {
    instancekey: string;
    attemptId: string;
    @ApiProperty({ required: false })
    subject?: string;
}

class GetAccuracyPercentileDto {
    percentlite: number;
    accuracys: number[];
    temp: number[];
    current: number;
    fixed: number[]
}

export class GetAccuracyPercentileResponse {
    result: GetAccuracyPercentileDto;
}

export class ClassroomListSubjectStudentDoRequest {
    instancekey: string;
    classroomId: string;
    userId: string;
    @ApiProperty({ required: false })
    lastDay: string;
    @ApiProperty({ required: false })
    subjects: string;
}

export class ClassroomListSubjectStudentDoResponse {
    result: Subject[];
}

export class GetListSubjectsStudentRequest {
    user: string;
    instancekey: string;
    @ApiProperty({ required: false })
    lastDay: string;
}

export class GetListSubjectsStudentResponse {
    result: Subject[];
}

export class GetTotalQuestionTopicStudentRequest {
    @ApiProperty({ required: false })
    lastDay: string;
    @ApiProperty({ required: false })
    subjects: string;
    user: string;
    instancekey: string;
}

export class GetTotalQuestionTopicStudentResponse {
    results: GetTotalQuestionTopicMeDto[]
}

export class GetTotalQuestionBySubjectStudentRequest {
    instancekey: string;
    user: string;
    @ApiProperty({ required: false })
    lastDay: string;
    @ApiProperty({ required: false })
    subjects: string;
}

export class GetTotalQuestionBySubjectStudentResponse {
    results: GetTotalQuestionBySubjectMeDto[]
}

export class GetListTopicsStudentRequest {
    instancekey: string;
    user: string;
    @ApiProperty({ required: false })
    lastDay: string;
    @ApiProperty({ required: false })
    subjects: string;
}

export class GetListTopicsStudentResponse {
    results: GetListTopicsMeDto[]
}

export class SummaryTopicSpeedStudentRequest {
    user: string;
    instancekey: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
    @ApiProperty({ required: false })
    limit?: number;
}

export class SummaryTopicSpeedStudentResponse {
    results: SummaryTopicSpeedMeDto[]
}

export class SummaryTopicCorrectStudentRequest {
    user: string;
    instancekey: string;
    @ApiProperty({ required: false })
    limit?: number;
    @ApiProperty({ required: false })
    subjects?: string;
    @ApiProperty({ required: false })
    lastDay?: string;
}

export class SummaryTopicCorrectStudentResponse {
    results: SummaryTopicCorrectMeDto[]
}

export class SummarySubjectCorrectStudentRequest {
    instancekey: string;
    user: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
    @ApiProperty({ required: false })
    limit?: number;
}

export class SummarySubjectCorrectStudentResponse {
    results: SummarySubjectCorrectMeDto[]
}

export class SummarySubjectCorrectByDateStudentRequest {
    user?: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
    instancekey: string;
    userSubjects: string[]
    timezoneoffset: number;
}

export class SummarySubjectCorrectByDateStudentResponse {
    results: SummarySubjectCorrectByDateMeDto[]
}

export class SummarySubjectSpeedByDateStudentRequest {
    @ApiProperty({ required: false })
    lastDay: string;
    @ApiProperty({ required: false })
    subjects: string;
    user: string;
    instancekey: string;
    timezoneoffset: number;
}

export class SummarySubjectSpeedByDateStudentResponse {
    results: SummarySubjectSpeedByDateMeDto[]
}

export class SummaryCorrectByDateStudentRequest {
    user: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
    @ApiProperty({ required: false })
    topic?: string;
    timezoneoffset: number;
    instancekey: string;
}

export class SummaryCorrectByDateStudentResponse {
    results: SummaryCorrectByDateMeDto[]
}

export class SummaryAttemptedBySubjectStudentRequest {
    user: string;
    instancekey: string;
    @ApiProperty({ required: false })
    lastDay: string;
    @ApiProperty({ required: false })
    subjects: string;
}

export class SummaryAttemptedBySubjectStudentResponse {
    results: SummaryAttemptedBySubjectMeDto[]
}

export class SummarySubjectSpeedStudentRequest {
    instancekey: string;
    user: string;
    @ApiProperty({ required: false })
    lastDay: string;
    @ApiProperty({ required: false })
    subjects: string;
    @ApiProperty({ required: false })
    limit: number
}

export class SummarySubjectSpeedStudentResponse {
    results: SummarySubjectSpeedMeDto[]
}

export class SummaryAbondonedStudentRequest {
    user: string;
    instancekey: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
}

export class SummaryAbondonedStudentResponse {
    results: number;
}

export class SummaryPracticeStudentRequest {
    instancekey: string;
    user: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
}

export class SummaryPracticeStudentResponse {
    results: number;
}

export class SummaryAttemptedStudentRequest {
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string
    user: string;
    instancekey: string;
}

class SummaryAttemptedStudentDto {
    totalQuestion: number;
    doQuestion: number;
    totalMissed: number;
    totalCorrect: number;
    totalTimeTaken: number;
    totalAttempt: number;
    totalMark: number;
    totamTestMark: number;
    totalTest: number;
}
export class SummaryAttemptedStudentResponse {
    results: SummaryAttemptedStudentDto[];
}

export class SummaryQuestionBySubjectStudentRequest {
    instancekey: string;
    user: string;
    @ApiProperty({ required: false })
    lastDay?: string;
}

export class SummaryQuestionBySubjectStudentResponse {
    results: SummaryQuestionBySubjectMeDto[]
}

export class SummarySpeedTopicByDateStudentRequest {
    user: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
    @ApiProperty({ required: false })
    topic?: string;
    timezoneoffset: number;
    instancekey: string;
}

export class SummarySpeedTopicByDateStudentResponse {
    results: SummarySpeedTopicByDateMeDto[]
}

export class SummaryQuestionByTopicStudentRequest {
    user: string;
    instancekey: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    subjects?: string;
}

export class SummaryQuestionByTopicStudentResponse {
    results: SummaryQuestionByTopicMeDto[]
}

export class QuestionByComplexityRequest {
    instancekey: string;
    attemptId: string;
}

class QuestionByComplexityDto {
    marks: number;
    obtainMarks: number;
    subject: string;
    _id: string;
    name: string;
    complexity: string;
}

export class QuestionByComplexityResponse {
    topic: QuestionByComplexityDto[];
}

export class GetProctoringAttemptRequest {
    @ApiProperty({ required: false })
    attemptId?: string;
    @ApiProperty({ required: false })
    classId: string;
    userId: string;
    instancekey: string;
}

export class AttemptDetail {
    practicesetId: Types.ObjectId;
    user: string
    attempt: string;
    isAbandoned: boolean;
    archiveQA: any[];
    QA: QA[];

}

export class Student {
    _id: string;
    name: string;
    userId: string;
    lastLogin: string;
    country: Country;
    provider: string;
    role: string;
}

export class GetProctoringAttemptResponse {
    student: Student;
    attempts: Attempt;
    attempt: string;
}

export class SummaryOnePracticeSetRequest {
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    lastMonth?: string;
    practicesetId: string;
    instancekey: string;
}

export class SummaryOnePracticeSetDto {
    _id: string;
    day: Day;
    number: number;
}

export class SummaryOnePracticeSetResponse {
    results: SummaryOnePracticeSetDto[];
}

export class SummaryAttemptedPracticeRequest {
    practicesetId: string;
    instancekey: string;
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
}

class SummaryAttemptedPracticeAttempt {
    totalCorrects: number;
    totalMissed: number;
    totalErrors: number;
    practiceSetInfo: PracticeSetInfo[];
    totalTimeTaken: number;
    questionPractice: number;
    _id: Types.ObjectId;
    totalTimeTakenMi: number;
    totalQuestion: number;
    avgTime: number;
    accessMode: string;
    classroom: Types.ObjectId;
    pecentCorrects: number;
    createdBy: CreatedBy;
    createdAt: Date;
    createdAtFormat: string;
    updatedAtFormat: string;
    user: Types.ObjectId;
    totalMark: number;
    offscreenTime: number;
    fraud: number;
    screenSwitched: number;
    userInfo: UserInfo[];
}
class SummaryAttemptedPracticeFalse {
    totalCorrects: number;
    totalMissed: number;
    totalErrors: number;
    totalTimeTaken: number;
    _id: string; // Using string for ObjectId
    avgTime: number;
    accessMode: string;
    classroom: string; // Using string for ObjectId
    pecentCorrects: number;
    user: string; // Using string for ObjectId
    totalMark: number;
    offscreenTime: number;
    fraud: number;
    screenSwitched: number;
    totalTimeTakenMi: number;
    totalQuestions: number;
    practiceSetInfo: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

class SummaryAttemptedPracticeDto {
    attempts: SummaryAttemptedPracticeAttempt
}

export class SummaryAttemptedPracticeResponse {
    result: SummaryAttemptedPracticeDto;
    results: SummaryAttemptedPracticeFalse

}

export class CountStudentAttemptedRequest {
    userId: string;
    instancekey: string;
}

export class CountStudentAttemptedResponse {
    count: number;
}

export class CountSummaryAttemptedPracticeRequest {
    practicesetId: string;
    instancekey: string;
}

export class CountSummaryAttemptedPracticeDto {
    _id: string;
}
export class CountSummaryAttemptedPracticeResponse {
    result: CountSummaryAttemptedPracticeDto[];
}

export class CountByUserRequest {
    userId: string;
    instancekey: string;
}

export class CountByUserResponse {
    count: number;
}

export class UpdateTimeLimitExhaustedCountRequest {
    instancekey: string;
    attemptId: string;
}

export class UpdateTimeLimitExhaustedCountResponse {
    status: string;
}

export class UpdateSuspiciousRequest {
    instancekey: string;
    attemptId: string;
    @ApiProperty({ default: false })
    markedSuspicious: boolean
}

export class UpdateSuspiciousResponse {
    markedSuspicious: boolean
}

export class StartRequest {
    instancekey: string;
    activeLocation: string;
    userId: string;
    userName: string;
    userEmail: string;
    token: string;
    @ApiProperty()
    testId: string;
    @ApiProperty()
    referenceType: string;
    @ApiProperty()
    referenceId: string;
    @ApiProperty()
    referenceData: string;
    ip: string;
}

export class StartResponse {
    attempt: string
}

class PsychoAnswers {
    @ApiProperty()
    answerId: string;
}
class AnswersOfUser {
    @ApiProperty()
    question: string;
    @ApiProperty({ type: [PsychoAnswers] })
    answers: PsychoAnswers[];
}

export class FinishPsychoTestRequest {
    @ApiProperty()
    practicesetId: string;
    @ApiProperty({ type: [AnswersOfUser] })
    answersOfUser: AnswersOfUser[];
    userId: string;
    instancekey: string;
    activeLocation: string;
}

export class PsychoResultAnswerDto {
    @ApiProperty()
    domain: string;

    @ApiProperty()
    facet: number;

    @ApiProperty()
    score: number;
}

export class PsychoResultDto {
    @ApiProperty()
    user: string;

    @ApiProperty()
    practiceset: string;

    @ApiProperty()
    created_at: string;

    @ApiProperty({ type: [PsychoResultAnswerDto] })
    answers: PsychoResultAnswerDto[];

    @ApiProperty()
    analysis: string;

    @ApiProperty()
    classrooms: string;
}
export class FinishPsychoTestResponse {
    psychoAttempt: PsychoResultDto;
}

class UnitDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    name: string;
}


export class QuestionDataDto {
    @ApiProperty()
    timeLeft: number;

    @ApiProperty()
    stdTime: number;

    @ApiProperty()
    index: number;

    @ApiProperty({ type: [Number] })
    offscreen: number[];

    @ApiProperty()
    feedback: boolean;

    @ApiProperty()
    isMissed: boolean;

    @ApiProperty()
    hasMarked: boolean;

    @ApiProperty()
    actualMarks: number;

    @ApiProperty()
    obtainMarks: number;

    @ApiProperty({ type: [String] })
    answerOrder: string[];

    @ApiProperty({ type: [String] })
    scratchPad: string[];

    @ApiProperty()
    _id: string;

    @ApiProperty()
    question: string;

    @ApiProperty({ type: [String] })
    answers: string[];

    @ApiProperty()
    timeEslapse: number;

    @ApiProperty({ type: SubjectDto })
    subject: SubjectDto;

    @ApiProperty({ type: UnitDto })
    unit: UnitDto;

    @ApiProperty()
    answerChanged: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty({ type: TopicDto })
    topic: TopicDto;
}

export class PartialSubmitAttemptRequest {
    attemptId: string;
    instancekey: string;
    @ApiProperty()
    practicesetId: string;
    userId: string;
    activeLocation: string;
    @ApiProperty({ type: QuestionDataDto })
    answerOfUser: QuestionDataDto
}

export class PartialSubmitAttemptResponse {
    attemptId: string;
}

class AnswersData {
    @ApiProperty()
    answerId: string;
    @ApiProperty()
    answerText: string;
    @ApiProperty()
    userText: string;
}

class QuestionOrder {
    @ApiProperty()
    q: string;
    @ApiProperty()
    countNumber: number;
    @ApiProperty()
    answers: string[]
}

class AnswersOfUserData {
    @ApiProperty()
    question: string;
    @ApiProperty()
    timeEslapse: number;
    @ApiProperty()
    isMissed: boolean;
    @ApiProperty()
    answerChanged: number;
    @ApiProperty({ type: () => [AnswersData] })
    answers: AnswersData[]
    @ApiProperty()
    createdAt: string;
    @ApiProperty()
    offscreen: number[];
}

export class SubmitToQueueRequestBody {
    @ApiProperty()
    practiceId: string;
    @ApiProperty()
    attemptId: string;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    try: number;
    @ApiProperty({ type: () => [AnswersOfUserData] })
    answersOfUser: AnswersOfUserData[];
    @ApiProperty({ type: [QuestionOrder] })
    questionOrder: QuestionOrder[];
}

export class SubmitToQueueRequest {
    @ApiProperty()
    body: SubmitToQueueRequestBody;
    instancekey: string;
    userId: string;
    token: string;
    ip: string;
    email: string;
}

export class SubmitToQueueResponse {
    status: string;
}

export class ResetItemInQueueRequest {
    @ApiProperty()
    submitIds: string;
    instancekey: string;
}

export class ResetItemInQueueResponse {
    status: string;
}

class UserAnswers {
    @ApiProperty()
    question: string;
    @ApiProperty({ type: [AnswersData] })
    answers: AnswersData[]
    @ApiProperty()
    timeEslapse: number;
    @ApiProperty({ type: Subject })
    topic: Subject;
    @ApiProperty({ type: Subject })
    subject: Subject;
    @ApiProperty({ type: Subject })
    unit: Subject
    @ApiProperty()
    isMissed: boolean;
    @ApiProperty()
    answerChanged: number;
    @ApiProperty({ type: Date })
    createdAt: Date
}
export class QuestionSubmitRequest {
    attemptId: string;
    instancekey: string;
    @ApiProperty({ type: [UserAnswers] })
    question: UserAnswers
    @ApiProperty()
    practicesetId: string;
    userId: string;
    activeLocation: string;
}

export class QuestionSubmitResponse {
    attemptId: string;
}

export class SaveCamCaptureRequest {
    @ApiProperty()
    filePath: string;
    attemptId: string;
    instancekey: string;
    user: User;
}

export class SaveCamCaptureResponse {
    status: string;
}

export class SaveScreenRecordingRequest {
    @ApiProperty()
    filePath: string;
    attemptId: string;
    instancekey: string;
}

export class SaveScreenRecordingResponse {
    status: string;
}

export class SaveQrUploadRequest {
    @ApiProperty()
    filePath: string;
    attemptId: string;
    instancekey: string;
}

export class SaveQrUploadResponse {
    status: string;
}

export class RecordQuestionReviewRequest {
    @ApiProperty()
    state: string;
    @ApiProperty()
    time: string;
    attemptId: string;
    questionId: string;
    instancekey: string;
}

export class RecordQuestionReviewResponse {
    res?: string;
}

export class UpdateAbandonStatusRequest {
    attemptId: string;
    instancekey: string;
    @ApiProperty()
    liveboard: boolean
    @ApiProperty()
    markedSuspicious: boolean
}

export class UpdateAbandonStatusResponse {
    attempt: Attempt;
}

export class FindPsychoResultByTestRequest {
    userId: string;
    instancekey: string;
    practicesetId: string;
}

export class FindPsychoResultByTestResponse {
    result: PsychoResultDto;
}

export class GetPsychoResultRequest {
    psychoResultId: string;
    instancekey: string;
}

class FacetsDto {
    facet: number;
    title: string;
    text: string;
    score: number;
    count: number;
    scoreText: string;
}
class B5ResultDto {
    domain: string;
    title: string;
    shortDescription: string;
    description: string;
    scoreText: string;
    count: number;
    score: number;
    facets: FacetsDto[]
    text: string;
}

export class GetPsychoResultResponse {
    user: string;
    practiceset: PracticeSetInfo;
    createdAt: string;
    b5Result: B5ResultDto[];
}

export class FindOneAttemptRequest {
    instancekey: string;
    attemptId: string;
}


class FindOneAttemptDto {
    practiceset: PracticeSetDto
    QA: QA[]
}

export class FindOneAttemptResponse {
    attemptObj: FindOneAttemptDto;
}

export class GetClassroomByTestRequest {
    practicesetId: string;
    userRole: string;
    userId: string;
    location: string[];
    instancekey: string
}
class Classroom {
    _id: string;
    name: string;
}
export class GetClassroomByTestResponse {
    classrooms?: Classroom[];
}

export class GetCareerScoreRequest {
    attemptId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhoneNumber: string;
    userGender: string;
    userInterest: string;
    userCity: string;
    userState: string;
    userDistrict: string;
    userBirthDate: string;
    userKnowAboutUs: string;
    instancekey: string;
}

export class StudentRecommendationDto {
    name: string;
    email: string;
    phoneNumber: string;
    gender: 'male' | 'female';
    user: Types.ObjectId;
    attempt: Types.ObjectId;
    interest: string;
    city: string;
    district: string;
    state: string;
    birthdate: Date;
    recommendation: any[];
    knowAboutUs: string;
    createdAt: Date;
    updatedAt: Date;
}

export class GetCareerScoreResponse {
    res: StudentRecommendationDto;
}

export class GetAttemptRequest {
    attemptId: string;
    instancekey: string;
}

export class PracticeSetDto {
    _id: Types.ObjectId;
    user: User;
    lastModifiedBy: Types.ObjectId;
    lastModifiedDate: Date;
    active: boolean;
    userInfo: Subject;
    units: any[];
    subjects: any[];
    level: number;
    testMode: string;
    accessMode: string;
    countries: any[];
    title: string;
    titleLower: string;
    courses: string[];
    testseries: string[];
    tags: string[];
    demographicData: DemographicData;
    description: string;
    inviteeEmails: string[];
    inviteePhones: string[];
    classRooms: Types.ObjectId[];
    studentEmails: string[];
    instructions: string;
    isMarksLevel: boolean;
    enableMarks: boolean;
    randomQuestions: boolean;
    randomizeAnswerOptions: boolean;
    sectionJump: boolean;
    sectionTimeLimit: boolean;
    minusMark: number;
    plusMark: number;
    notes: string;
    attemptAllowed: number;
    status: string;
    statusChangedAt: Date;
    expiresOn: Date;
    startDate: Date;
    startTimeAllowance: number;
    requireAttendance: boolean;
    totalJoinedStudent: number;
    createdAt: Date;
    updatedAt: Date;
    rating: number;
    totalQuestion: number;
    questionsToDisplay: number;
    isPartnerExam: boolean;
    totalTime: number;
    questionsPerTopic: number;
    totalAttempt: number;
    isShowResult: boolean;
    allowTeacher: boolean;
    locations: Types.ObjectId[];
    allowStudent: boolean;
    isShowAttempt: boolean;
    createMode: string;
    testCode: string;
    dirPath: string;
    isAdaptive: boolean;
    adaptiveTest: Types.ObjectId;
    randomTestDetails: any[];
    showCalculator: boolean;
    showFeedback: boolean;
    peerVisibility: boolean;
    initiator: string;
    testType: string;
    questions: any[];
    sections: any[];
    enabledCodeLang: string[];
    enableSection: boolean;
    camera: boolean;
    fraudDetect: boolean;
    pinTop: boolean;
    autoEvaluation: boolean;
    fullLength: boolean;
    imageUrl: string;
    offscreenLimit: number;
    buyers: any[];
    instructors: Types.ObjectId[];
    randomSection: boolean;
    uid: string;
    synced: boolean;
    owner: Types.ObjectId;
    origin: string;
    __v: number;
}
class GetAttempDTO extends Attempt {
    practiceSet: string;
}
export class GetAttemptResponse {
    attempt: GetAttempDTO;
}

export class FinishRequest {
    @ApiProperty()
    attemptId: string;
    instancekey: string;
    @ApiProperty({ type: [QuestionDataDto] })
    answersOfUser: QuestionDataDto[];
    @ApiProperty()
    practiceId: string
    @ApiProperty()
    questionOrder: string[];
    @ApiProperty()
    isAbandoned: string;
}

export class FinishResponse {
    attempt: Attempt;
}

class CreateBody {
    @ApiProperty()
    fraudDetected: string;
    @ApiProperty()
    isFraudlent: boolean;
    @ApiProperty()
    attemptId: string;
    @ApiProperty()
    terminated: boolean;
    @ApiProperty()
    referenceId: string;
    @ApiProperty()
    referenceType: string;
    @ApiProperty()
    _id: string;
    @ApiProperty()
    user: string;
    @ApiProperty()
    studentName: string;
    @ApiProperty()
    isEvaluated: boolean;
    @ApiProperty()
    isAbandoned: boolean;
    @ApiProperty()
    practicesetId: string;
    @ApiProperty()
    testId: string;
}

export class CreateRequest {
    @ApiProperty({ type: CreateBody })
    body: CreateBody;
    userEmail: string;
    userId: string;
    ip: string;
    instancekey: string;
    token: string;
    // user: UserRequest;
}

export class CreateResponse {
    newAttempt: string;
}

export class GetCareerAttemptsRequest {
    @ApiProperty({ required: false })
    page?: number;
    @ApiProperty({ required: false })
    limit?: number;
    instancekey: string;
}

export class GetCareerAttemptsResponse {
    results: [StudentRecommendationDto];
}

export class GetCareerSumReq {
    instancekey: string;
}

export class FindOneRequest {
    instancekey: string;
    attemptId: string;
    @ApiProperty({ required: false })
    onlyTimeAndScore?: boolean;
}

export class FindOneDto extends GetAttempDTO {
    pending: number;
    maximumMarks: number;
    totalMissed: number;
    totalTime: number;
    practicesetId?: string | PracticeSetId;
    totalQuestions: number;
    showScore: true
}

export class FindOneResponse {
    atm: FindOneDto;
}

export class Query {
    @ApiProperty({ required: false })
    subjects?: string;
    @ApiProperty({ required: false })
    lastDay?: string;
    @ApiProperty({ required: false })
    topic?: string;
    @ApiProperty({ required: false })
    classroom?: string;
    @ApiProperty({ required: false })
    locations?: string;
    @ApiProperty({ required: false })
    name?: string;
}
export class UserRequest {
    _id: string;
    roles: string[];
    activeLocation: Types.ObjectId;
    @ApiProperty({ type: [Country] })
    country?: Country[];
    subjects?: Types.ObjectId[];
    locations?: Types.ObjectId[];
    createdAt?: Date;
    userId?: string;
    blockedUsers?: any[];

}
export class ClassroomSummarySpeedRequest {
    instancekey: string;
    classroom: string;
    @ApiProperty({ required: false })
    query?: Query
    user: UserRequest
}


export class ClassroomSummarySpeedDto {
    _id: string;
    totalQuestions: number;
    totalTimeTaken: number;
    accuracyPercent: number;
    avgTimeDoQuestion: number;
    name: string;
}

export class ClassroomSummarySpeedResponse {
    results: ClassroomSummarySpeedDto[];
}

export class ClassroomSummarySpeedByDateRequest {
    instancekey: string;
    @ApiProperty({ required: false })
    query?: Query;
    user?: UserRequest;
    classroom: string;
}

class ClassroomSummarySpeedByDateDto {
    day: Day;
    totalQuestions: number;
    timeEslapse: number;
    user: string;
    created: string;
    avgTimeDoQuestion: number;
    name: string;
}
export class ClassroomSummarySpeedByDateResponse {
    results: ClassroomSummarySpeedByDateDto[];
}

export class CalculateSatTotalScoreReq {
    instancekey: string;
    attempt: string;
}

class GetAttemptByUserQuery {
    @ApiProperty({ required: false })
    type?: string;
    @ApiProperty({ required: false })
    practicesetId?: string;
    @ApiProperty({ required: false })
    id?: string;
    @ApiProperty({ required: false })
    subjects?: string;
}
export class GetAttemptByUserReq {
    query?: GetAttemptByUserQuery;
    instancekey: string;
}

export class TopperSummaryReq {
    testId?: string;
    instancekey: string;
}

export class AccuracyBySubjectReq {
    query?: GetAttemptByUserQuery;
    instancekey: string;
    userId: string;
}

export class ClassroomListTopicStudentDoReq {
    instancekey: string;
    @ApiProperty({ required: false })
    query?: Query
    user: UserRequest
}