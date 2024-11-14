import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsBoolean, IsEmail, isMongoId, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, Max, MaxLength, Min } from 'class-validator';
import { ObjectId } from 'mongodb';
import { GetUserResponse } from './user.dto';
import { Transform } from 'class-transformer';

export class AssessmentDto {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  score: number;
}

export class UserInfo {
  @ApiProperty()
  @IsMongoId()
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
  @IsOptional()
  @IsMongoId()
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
  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  _id: string;
}

export class Buyer {
  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  item: string;
  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  user: string;
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

export class User {
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

export class CreateAssessmentRequest {
  instancekey: string;
  user: User;
  @ApiProperty()
  title: string;
  @ApiProperty({ type: () => [Subject] })
  subjects: Subject[];
  @ApiProperty({ type: () => [Unit] })
  units: Unit[];
  @ApiProperty({ required: false })
  imageUrl?: string;
}

export class CreateAssessmentResponse {
  response: PracticeSetDto;
}
export class GetAssessmentRequest { _id: string }
export class GetAllAssessmentResponse { _id: string }
export class GetAssessmentResponse {
  response: PracticeSetDto;
}

export class ReqHeaders {
  authorization: string;
}

export class UpdateAssessmentBody {
  lastModifiedBy: string;
  lastModifiedDate: Date;
  @ApiProperty()
  active: boolean;
  @ApiProperty()
  userInfo: UserInfo;
  @ApiProperty({ type: () => [Unit] })
  @IsNotEmpty()
  units: Unit[];
  @ApiProperty({ type: () => [Subject] })
  @IsNotEmpty()
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
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
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
  @IsOptional()
  @IsNumber({}, { message: 'minusMark must be a number' })
  @Max(0, { message: 'minusMark must be at most 0' })
  minusMark: number;
  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsNumber({}, { message: 'plusMark must be a number' })
  @Min(0, { message: 'plusMark must be at least 0' })
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

export class UpdateAssessmentRequest {
  instancekey: string;
  id: string;
  user: User;
  headers: ReqHeaders;
  body: UpdateAssessmentBody;
}

export class UpdateAssessmentResponse {
  response: PracticeSetDto;
}

export class EnrollTestRequest {
  _id: string;
  instancekey: string;
  location: string;
  user: UserInfo;
}

export class EnrollTestResponse {
  message: string;
}

// getPublisherAssessments
export class PublisherAssessmentRequest {
  instancekey: string;
  @ApiProperty({ name: 'limit', required: false })
  limit: number;
  @ApiProperty({ name: 'page', required: false })
  page: number;
  @ApiProperty({ name: 'skip', required: false })
  skip: number;
  @ApiProperty({ name: 'title', required: false })
  title: string;
  @ApiProperty({ name: 'count', required: false })
  count: boolean;
  user: User;
  ip: string;
}

export class PublisherAssessmentDto {
  title: string;
  colorCode: string;
  imageUrl: string;
  countries: Country[];
  accessMode: string;
  subjects: Subject[];
  instructors: string[];
  userName: string;
  user: string;
  statusChangedAt: Date;
  type: string;
  status: string;
  startDate: Date;
  expiresOn: Date;
  testMode: string;
  enrolled: boolean;
}
export class PublisherAssessmentCount {
  total: number;
}
export class PublisherAssessmentResponse {
  response: PublisherAssessmentDto[];
  count: PublisherAssessmentCount[];
}

// updateAllQuestionSection
export class UpdateAllQuestionSectionRequest {
  _id: string;

  @ApiProperty()
  @IsMongoId({ each: true })
  questionIds: string[];

  @ApiProperty()
  section: string[];
  instancekey: string;
  user: User;
}

export class UpdateAllQuestionSectionResponse {
  @ApiProperty()
  _id: string;
}

export class GetPublicTestsRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  count?: boolean;

  instancekey: string;
  user: User;
}

export class PublicTest {
  title: string;
  countries: Country[];
  accessMode: string;
  subjects: Subject[];
  user: string;
  userInfo: UserInfo;
  expiresOn: Date;
  imageUrl: string;
  colorCode: string;
}

export class PublicTestsResponse {
  tests: PublicTest[];
  total?: number;
}

export class GetMaximumTestMarksRequest {
  id: string;
  instancekey: string;
}

export class GetMaximumTestMarksResponse {
  maximumMarks: number;
}

export class GetQuestionFeedbackRequest {
  instancekey: string;
  page?: number;
  limit?: number;
  count?: boolean;
  qId: string;
}

class StudentId {
  _id: string;
  name: string;
}

class GetQuestionFeedback {
  _id: string;
  studentId: StudentId;
  teacherId: string;
  attemptId: string;
  questionId: string;
  comment: string;
  updatedAt: string;
  createdAt: string;
  responded: boolean;
  feedbacks: string[];
}

export class GetQuestionFeedbackResponse {
  response: GetQuestionFeedback[];
  count?: number;
}

export class StartTestSessionRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class AttendantDto {
  practicesetId: string;
  teacherId: string;
  className: string;
  classId: string;
  name: string;
  studentUserId: string;
  status: string;
  admitted: boolean;
  createdAt: string;
  type: string;
  attemptLimit: number;
  offscreenLimit: number;
  updatedAt: string;
  notes: string[];
}

export class StartTestSessionResponse {
  total: number;
  attendants: AttendantDto[];
}

export class EndTestSessionRequest {
  instancekey: string;
  id: string;
}

export class EndTestSessionResponse {
  status: string;
}

export class GetAttendantsRequest {
  instancekey: string;
  token: string;
  id: string;
  user: User;
  @ApiProperty({ required: false, description: '' })
  admit?: boolean;
  @ApiProperty({ required: false, description: '' })
  reject?: boolean;
  @ApiProperty({ required: false, description: '' })
  absent?: boolean;
  @ApiProperty({ required: false, description: '' })
  ready?: boolean;
  @ApiProperty({ required: false, description: '' })
  started?: boolean;
  @ApiProperty({ required: false, description: '' })
  finished?: boolean;
  @ApiProperty({ required: false, description: 'Text for searching by name, student ID, or roll number' })
  searchText?: string;
  @ApiProperty({ required: false, description: 'Comma-separated list of class IDs' })
  classes?: string;
  @ApiProperty({ required: false, description: '' })
  count?: boolean;
  @ApiProperty({ required: false, description: '' })
  page?: number;
  @ApiProperty({ required: false, description: '' })
  limit?: number;
}

export class GetAttendantsResponse {
}

export class ResetIpRestrictionRequest {
  instancekey: string;
  id: string;
  studentId: string;
}

export class ResetIpRestrictionResponse {
  status: string;
}

export class ValidateID {
  @IsMongoId()
  id: string;
}

export class NoteDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  user: string;
  @ApiProperty()
  remark: string;
}

export class UpdateAttendanceLimitRequest {
  instancekey: string;
  id: string;
  @IsMongoId()
  @ApiProperty()
  user: string;
  @ApiProperty({ required: false })
  note?: NoteDto;
  @ApiProperty()
  attemptLimit: number;
  @ApiProperty()
  offscreenLimit: number;
}

export class UpdateAttendanceLimitResponse {
  data: string;
}

export class FindPracticeSetsRequest {
  instancekey: string;
  @ApiProperty({ required: false })
  grade?: string;
  @ApiProperty({ required: false, description: 'Subject ID' })
  subject?: string;
  @ApiProperty({ required: false })
  page?: number;
  @ApiProperty({ required: false })
  limit?: number;
  @ApiProperty({ required: false })
  skip?: number;
}

export class FindPracticeSets {
  _id: string;
  title: string;
}

export class FindPracticeSetsResponse {
  response: FindPracticeSets[];
}

export class GetAttendanceStatusRequest {
  user: string;
  id: string;
  instancekey: string;
}

export class GetAttendanceStatusResponse {
  status: string;
}

export class ChangeOwnershipRequest {
  id: string;
  instancekey: string;
  @ApiProperty()
  name: string;
  @IsMongoId()
  @ApiProperty()
  userId: string;
}

export class ChangeOwnershipResponse {
  response: PracticeSetDto;
}

export class GetTestLimitRequest {
  instancekey: string;
  id: string;
  studentId: string;
}

export class GetTestLimitResponse {
  attemptLimit: string;
  offscreenLimit: string;
  notes: NoteDto[];
}

export class FindProctorTestRequest {
  instancekey: string;
  user: User;
}

export class FindProctorTestResponse {
  title: string;
  startDate: Date;
}

export class OngoingTestByUserRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class StudentDTO {
  studentId: string;
  studentUserId: string;
  registeredAt: Date;
  _id: string;
  iRequested: boolean;
  createdAt: Date;
  autoAdd: boolean;
  status: boolean;
}

export class Classroom {
  _id: string;
  name: string;
  students: StudentDTO[];
}

export class OngoingTestByUserResponse {
  classRooms: Classroom[];
  testMode: string;
  title: string;
  startDate: Date;
  attemptAllowed: number;
  offscreenLimit: number;
  totalQuestion: number;
  camera: boolean;
  attemptLimit: number;
  notes: NoteDto[];
}

export class FindTestBySessionRequest {
  instancekey: string;
  @ApiProperty()
  selectedSlot: Date;
  user: User;
}

export class FindTestBySession {
  classRooms: string[];
  title: string;
  testMode: string;
  status: string;
  startDate: Date;
  attemptAllowed: number;
  offscreenLimit: number;
}

export class FindTestBySessionResponse {
  response: FindTestBySession[]
}

export class UpcomingTestsRequest {
  @ApiProperty({ required: false })
  page?: number;
  @ApiProperty({ required: false })
  limit?: number;
  @ApiProperty({ required: false })
  skip?: number;
  id: string;
  user: User;
  instancekey: string;
}

export class UpcomingTests {
  _id: string;
  testMode: string;
  title: string;
  description: string;
  totalQuestion: number;
  questionsToDisplay: number;
  totalTime: number;
  startDate: Date;
}

export class UpcomingTestsResponse {
  response: UpcomingTests[]
}

export class GetAvgRatingByAssessmentRequest {
  instancekey: string;
  id: string;
}

export class Rating {
  rating: number;
  count: number;
  avgRating: number;
}

export class GetAvgRatingByAssessmentResponse {
  ratings: Rating[];
  totalRatings: number;
  count: number;
  avgRating: number;
}

export class GetfeedbackRatingByAssessmentRequest {
  id: string;
  instancekey: string;
}

export class FeedbackSummary {
  name: string;
  reviewCount: number;
  count: number;
}

export class GetfeedbackRatingByAssessmentResponse {
  response: FeedbackSummary[];
}

export class GetQuestionListRequest {
  id: string;
  instancekey: string;
}

export class QuestionList {
  _id: string;
  order: number;
}

export class GetQuestionListResponse {
  response: QuestionList[];
}

export class UpdateQuestionSectionRequest {
  instancekey: string;
  id: string;
  questionId: string;
  @ApiProperty()
  section: string;
}

export class UpdateQuestionSectionResponse {
  name: string;
  time: number;
  showCalculator: boolean;
  status: string
}

export class GetPracticesetClassroomsRequest {
  instancekey: string;
  user: User;
  id: string;
}

export class ClassroomId {
  classroomId: string;
}

export class GetPracticesetClassroom {
  _id: ClassroomId;
  name: string;
  seqCode: string;
  imageUrl: string;
  colorCode: string;
  studentsCount: number;
  attemptsCount: number;
}

export class GetPracticesetClassroomsResponse {
  response: GetPracticesetClassroom[]
}

export class CheckSectionQuestionRequest {
  instancekey: string;
  testId: string;
  sectionName: string;
}

export class CheckSectionQuestionResponse {
  status: string;
}


// DTO definitions for remaining endpoints
export class FindByAttemptQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  sort: string;
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
  unit: string;
  @ApiProperty({ required: false })
  rejectBuy: string;
  @ApiProperty({ required: false })
  showFavoriteOnly: boolean;
  @ApiProperty({ required: false })
  title: string;
  @ApiProperty({ required: false, description: 'comma seperated subject ids' })
  subjects: string;
}

export class FindByAttemptRequest {
  instancekey: string;
  @ApiProperty({ type: () => FindByAttemptQuery })
  query: FindByAttemptQuery;
  user: User;
}

export class FindByAttemptDto {
  _id: string;
  user: GetUserResponse;
  lastModifiedBy: string;
  lastModifiedDate: Date;
  active: boolean;
  userInfo: UserInfo;
  units: Unit[];
  subjects: Subject[];
  level: number;
  testMode: string;
  accessMode: string;
  countries: Country[];
  title: string;
  titleLower: string;
  courses: string[];
  testseries: string[];
  tags: string[];
  demographicData: DemographicData;
  description: string;
  inviteeEmails: string[];
  inviteePhones: string[];
  classRooms: string[];
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
  locations: string[];
  allowStudent: boolean;
  isShowAttempt: boolean;
  createMode: string;
  testCode: string;
  dirPath: string;
  isAdaptive: boolean;
  adaptiveTest: string;
  randomTestDetails: RandomTestDetail[];
  showCalculator: boolean;
  showFeedback: boolean;
  peerVisibility: boolean;
  initiator: string;
  testType: string;
  questions: Question[];
  sections: Section[];
  enabledCodeLang: string[];
  enableSection: boolean;
  camera: boolean;
  fraudDetect: boolean;
  pinTop: boolean;
  autoEvaluation: boolean;
  fullLength: boolean;
  imageUrl: string;
  offscreenLimit: number;
  buyers: Buyer[];
  instructors: string[];
  randomSection: boolean;
  uid: string;
  synced: boolean;
  owner: string;
  origin: string;
}

export class FindByAttemptResponse {
  response: FindByAttemptDto[]
}

export class CommonQuery {
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
  unit: string;
  @ApiProperty({ required: false })
  rejectBuy: string;
  @ApiProperty({ required: false })
  showFavoriteOnly: boolean;
  @ApiProperty({ required: false })
  title: string;
  @ApiProperty({ required: false, description: 'comma seperated subject ids' })
  subjects: string;
}

export class CountByAttemptRequest {
  instancekey: string;
  user: User;
  query: CommonQuery;
}

export class CountByAttemptResponse {
  count: number;
}

export class CountPracticeQuery {
  @ApiProperty({ required: false })
  attempted: boolean;
  @ApiProperty({ required: false })
  multi: boolean;
  @ApiProperty({ required: false })
  unattempted: boolean;
  @ApiProperty({ required: false })
  purchase: boolean;
  @ApiProperty({ required: false })
  showFavoriteOnly: boolean;
  @ApiProperty({ required: false, description: 'comma seperated publisher ids' })
  publiser: string;
  @ApiProperty({ required: false })
  new: boolean;
  @ApiProperty({ required: false })
  invitation: boolean;
  @ApiProperty({ required: false })
  nonPaid: boolean;
  @ApiProperty({ required: false })
  buy: boolean;
  @ApiProperty({ required: false, description: 'comma seperated unit ids' })
  units: string;
  @ApiProperty({ required: false, description: 'comma seperated subject ids' })
  subjects: string;
  @ApiProperty({ required: false })
  rejectBuy: string;
  @ApiProperty({ required: false })
  title: string;
}

export class CountPracticeRequest {
  instancekey: string;
  query: CountPracticeQuery;
  user: User;
}

export class CountPracticeResponse {
  count: number;
  maxLevel: number;
}

export class GetLastTestMeQuery {
  @ApiProperty({ required: false })
  status: string;
  @ApiProperty({ required: false, description: 'field,descending' })
  sort: string;
}

export class GetLastTestMeRequest {
  instancekey: string;
  query: GetLastTestMeQuery;
  user: User;
}

export class GetLastTestMeResponse {
  statusChangedAt: string;
  _id: string;
}

export class ListPublisherRequest {
  instancekey: string;
  query: CommonQuery;
  user: User;
}

export class ListPublisher {
  _id: string;
  name: string;
}

export class ListPublisherResponse {
  response: ListPublisher;
}

export class ListUnitRequest {
  instancekey: string;
  query: CommonQuery;
  user: User;
}

export class ListUnit {
  _id: string;
  name: string;
  subject: Subject;
}

export class ListUnitResponse {
  response: ListUnit[]
}

export class TestBySubjectRequest {
  instancekey: string;
  user: User;
  id: string;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  searchText: string;
}

export class TestBySubject {
  _id: string;
  title: string;
  units: Unit[];
  totalQuestion: number;
  subjects: Subject[];
  totalTime: number;
  testMode: string;
  status: string;
  colorCode: string;
  imageUrl: string;
}

export class TestBySubjectResponse {
  response: TestBySubject[];
}

export class TestByTopicRequest {
  instancekey: string;
  id: string;
  user: User;
  @ApiProperty({ required: false })
  searchText: string;
}

export class TestByTopic {
  _id: string;
  title: string;
  subjects: Subject[];
  accessMode: string;
  totalQuestion: number;
  slugfly: string;
  units: Unit[];
  totalTime: number;
  testMode: string;
  status: string;
}

export class TestByTopicResponse {
  response: TestByTopic[];
}

export class TopicQuestionDistributionByCategoryRequest {
  instancekey: string;
  id: string;
}

export class TopicQuestionDistributionByCategory {
  count: number;
  courseName: string;
  category: string;
}

export class TopicQuestionDistributionByCategoryResponse {
  response: TopicQuestionDistributionByCategory[];
}

export class FindOnePracticeQuery {
  @ApiProperty({ required: false })
  hasAccessMode: boolean;
  @ApiProperty({ required: false })
  activeSubject: boolean;
  @ApiProperty({ required: false })
  getPackage: boolean;
  @ApiProperty({ required: false })
  activeUnit: boolean;
  @ApiProperty({ required: false })
  home: boolean;
  @ApiProperty({ required: false })
  hasClassrooms: boolean;
}

export class FindOneSharedRequest {
  instancekey: string;
  query: FindOnePracticeQuery;
  user: User;
  id: string;
  ip: string;
}

class Avatar {
  mimeType: string;
  size: number;
  fileUrl: string;
  fileName: string;
  path: string;
  _id: string;
}

class UserFindOneShared {
  name: string;
  roles: string[];
  avatar: Avatar;
  _id: string;
  avatarUrl: string;
  avatarUrlSM: string;
  avatarUrlMD: string;
}

class Profile {
  name: string;
  _id: string;
  avatarUrl: string;
  avatarUrlSM: string;
  avatarUrlMD: string;
}

class PublicProfile {
  name: string;
  avatarUrl: string;
  avatarUrlSM: string;
  avatarUrlMD: string;
}

class LastModifiedBy {
  _id: string;
  name: string;
  profile: Profile;
  publicProfile: PublicProfile;
  token: Token;
  id: string;
}

class Token {
  _id: string;
}

class QuestionFindOneShared {
  _id: string;
  subject: Subject;
  topic: Topic;
  category: string;
  minusMark: number;
  plusMark: number;
  coding: Coding[];
}

class Topic {
  _id: string;
  name: string;
}

class Coding {
  language: string;
  timeLimit: number;
  memLimit: number;
  template: string;
  solution: string;
}

class PracticeQuestion {
  question: QuestionFindOneShared;
  section: string;
  minusMark: number;
  plusMark: number;
  createdAt: Date;
  order: number;
  _id: string;
}

class UnitObj {
  _id: string;
  name: string;
  active: boolean;
  subject: string;
}

class Course {
  _id: string;
  title: string;
}

class TestSeries {
  _id: string;
  title: string;
}

export class FindOneSharedResponse {
  _id: string;
  user: UserFindOneShared;
  lastModifiedBy: LastModifiedBy;
  lastModifiedDate: Date;
  active: boolean;
  userInfo: User;
  units: Unit[];
  subjects: Subject[];
  level: number;
  testMode: string;
  accessMode: string;
  countries: Country[];
  title: string;
  titleLower: string;
  courses: Course[];
  testseries: TestSeries[];
  tags: string[];
  demographicData: DemographicData;
  description: string;
  inviteeEmails: string[];
  inviteePhones: string[];
  classRooms: string[];
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
  locations: string[];
  allowStudent: boolean;
  isShowAttempt: boolean;
  createMode: string;
  testCode: string;
  dirPath: string;
  isAdaptive: boolean;
  adaptiveTest: string;
  randomTestDetails: RandomTestDetail[];
  showCalculator: boolean;
  showFeedback: boolean;
  peerVisibility: boolean;
  initiator: string;
  testType: string;
  questions: PracticeQuestion[];
  sections: Section[];
  enabledCodeLang: string[];
  enableSection: boolean;
  camera: boolean;
  fraudDetect: boolean;
  pinTop: boolean;
  autoEvaluation: boolean;
  fullLength: boolean;
  imageUrl: string;
  offscreenLimit: number;
  buyers: Buyer[];
  instructors: string[];
  randomSection: boolean;
  uid: string;
  synced: boolean;
  owner: string;
  origin: string;
  __v: number;
  numberQuestions: number;
  deActiceSubject: string[];
  enrolled: boolean;
  unitObj: UnitObj[];
  price: number;
  marketPlacePrice: number;
  discountValue: number;
  currency: string;
}

export class CountByExamIdQuery {
  @ApiProperty({ required: false, description: 'test-series id' })
  series: string;
  @ApiProperty({ required: false, description: 'title' })
  name: string;
  @ApiProperty({ required: false, description: 'comma seperated practice ids' })
  ids: string;
  @ApiProperty({ required: false, description: 'comma seperated subject ids' })
  subjects: string;
  @ApiProperty({ required: false, description: 'comma seperated access modes' })
  accessMode: string;
  @ApiProperty({ required: false, description: 'comma seperated classroom ids' })
  classrooms: string;
}

export class CountByExamIdRequest {
  instancekey: string;
  query: CountByExamIdQuery;
  user: User;
}

export class CountByExamIdResponse {
  count: number;
}

export class FindByExamIdQuery {
  @ApiProperty({ required: false })
  page?: number;
  @ApiProperty({ required: false })
  limit?: number;
  @ApiProperty({ required: false })
  name?: string;
  @ApiProperty({ required: false, description: 'test-series id' })
  series?: string;
  @ApiProperty({ required: false, description: 'field needed of practice' })
  select?: string;
  @ApiProperty({ required: false, description: 'comma seperated subject ids' })
  subjects?: string;
  @ApiProperty({ required: false, description: 'comma seperated accessModes' })
  accessMode?: string;
  @ApiProperty({ required: false, description: 'comma seperated testType' })
  testType?: string;
  @ApiProperty({ required: false })
  notAdaptive?: boolean;
  @ApiProperty({ required: false, description: 'comma seperated subject ids' })
  classrooms?: string;
  @ApiProperty({ required: false, description: 'comma seperated practice ids' })
  ids?: string;
}

export class FindByExamIdRequest {
  instancekey: string;
  query: FindByExamIdQuery;
  user: User;
}

export class FindByExamIdResponse {
  practiceSetByExam: PracticeSetDto[];
}


export class ProcessingDocmRequest {
  instancekey: string;
  user: User;
}

export class ProcessingDocmResponse { }

export class UpdateAttendanceRequest {
  instancekey: string;
  token: string;
  user: User;
  @ApiProperty()
  @IsMongoId()
  testId: string;
  @ApiProperty()
  @IsMongoId()
  studentId: string;
  @ApiProperty()
  admitted: boolean;
}

export class AttendanceNote {
  name: string;
  user: string;
  remark: string;
  createdAt: Date;
}

export class UpdateAttendance {
  _id: string;
  practicesetId: string;
  teacherId: string;
  className: string;
  classId: string;
  studentId: string;
  name: string;
  studentUserId: string;
  status: string;
  admitted: boolean;
  active: boolean;
  createdAt: string;
  type: string;
  attemptLimit: number;
  offscreenLimit: number;
  updatedAt: string;
  notes?: AttendanceNote[];
}

export class UpdateAttendanceResponse {
  data: UpdateAttendance;
}

export class ResetTerminatedAttemptRequest {
  instancekey: string;
  @ApiProperty()
  @IsMongoId()
  user: string;
  @ApiProperty()
  @IsMongoId()
  test: string;
}

export class ResetTerminatedAttemptResponse {
  status: string;
}

export class UpdateQuestionOrderRequest {
  instancekey: string;
  id: string;
  @ApiProperty()
  @IsMongoId()
  question: string;
  @ApiProperty()
  order: number;
}

export class UpdateQuestionOrderResponse {
  response: { [key: string]: number };
  status: string;
}

export class DestroyPracticeRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class DestroyPracticeResponse {
  status: string;
}

export class TestDetailsQuery {
  @ApiProperty({ required: false })
  withdraw: boolean;
}

export class TestDetailsRequest {
  instancekey: string;
  id: string;
  query: TestDetailsQuery;
  user: User;
}

export class TestDetailsResponse {

}

export class FindAllQuery {
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

export class GetOpeningGamesRequest {
  instancekey: string;
  token: string;
  user: User;
}

class Turn {
  timeElapsed: number;
  question: string;
  _id: string;
  createdAt: string;
  isCorrect: boolean;
  answers: string[];
  subject: Subject;
  topic: Topic;
}

class Game {
  _id: string;
  title: string;
  inTurnPlayer: Player;
  players: Player[];
  expiresOn: string;
  grade: Grade;
}

class Player {
  _id: string;
  name: string;
  avatarUrl?: string;
}

class Grade {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  name: string;
}

export class GameAttempt {
  _id: string;
  updatedAt: string;
  createdAt: string;
  turns: Turn[];
  isInTurn: boolean;
  isEvaluated: boolean;
  isActive: boolean;
  isAbandoned: boolean;
  game: Game;
  player: Player;
  version: number;
}

export class GetOpeningGamesResponse {
  response: GameAttempt[];
}

export class GetGameHistoryRequest {
  instancekey: string;
  user: User;
}

export class GetGameHistoryResponse {
  response: GameAttempt[];
}

export class GetGameRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class GetGameResponse extends PracticeSetDto {
  attempt: GameAttempt;
}

export class Friend {
  @ApiProperty()
  studentId: string;
}

export class NewGameBody {
  @ApiProperty({ type: () => Grade })
  grade: Grade;
  @ApiProperty({ type: () => [Friend] })
  friends: Friend[];
  @ApiProperty()
  isFriend: boolean;
}

export class NewGameRequest {
  instancekey: string;
  token: string;
  user: User;
  body: NewGameBody;
}

export class NewGameResponse {
  practiceId: string;
}

export class CheckQuestionsBeforePublishRequest {
  instancekey: string;
  id: string;
}

export class CheckQuestionsBeforePublishResponse {
  status: string;
}

export class GetFeedbacksQuery {
  @ApiProperty({ required: false })
  page: string;
  @ApiProperty({ required: false })
  limit: string;
  @ApiProperty({ required: false })
  sortAttr: string;
  @ApiProperty({ required: false })
  isAscSort: string;
  @ApiProperty({ required: false })
  rating: string;
}

export class GetFeedbacksRequest {
  instancekey: string;
  id: string;
  query: GetFeedbacksQuery;
}

export class FeedbackItem {
  _id: string;
  name: string;
  value: boolean;
}

export class FeedbackData {
  _id: string;
  user: string | null;
  courseId: string;
  comment: string;
  rating: number;
  feedbacks: FeedbackItem[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  practiceSetId: string;
}

export class GetFeedbacksResponse {
  data: FeedbackData[];
  count: number;
}

export class SearchOneRequest {
  instancekey: string;
  id: string;
  user: User;
  status: string;
}

export class SearchOneResponse {
  response: PracticeSetDto;
}

export class FindQuestionTemporaryRequest {
  instancekey: string;
  quesId: string;
  user: User;
}

export class FindQuestionTemporaryResponse {
  exist: boolean;
}

export class GetByTestSeriesRequest {
  instancekey: string;
  id: string;
}

export class GetByTestSeriesDto {
  id: string;
  user: string;
  totalQuestion: number;
  rating: number;
  updatedAt: string;
  createdAt: string;
  totalJoinedStudent: number;
  expiresOn: string;
  statusChangedAt: string;
  status: string;
  attemptAllowed: number;
  classRooms: string[];
  titleLower: string;
  title: string;
  accessMode: string;
  subjects: string[];
  units: string[];
  userInfo: string;
  totalTime: number;
  testCode: string;
  isShowAttempt: boolean;
  totalAttempt: number;
  testMode: string;
  requireAttendance: boolean;
  isAdaptive: boolean;
  questionsToDisplay: number;
  testType: string;
  order: number;
  index: number;
  autoEvaluation: boolean;
  imageUrl: string;
  level: string;
}

export class GetByTestSeriesResponse {
  practiceSetByExam: GetByTestSeriesDto[];
}

export class SupportedProfilesRequest { }

export class SupportedProfilesResponse {

}

export class FindTestByTestCodeRequest {
  instancekey: string;
  id: string;
}

export class FindTestByTestCodeResponse {
  _id: string;
  user: User;
  subjects: Subject[];
  testMode: string;
  accessMode: string;
  titleLower: string;
  isAdaptive: boolean;
  camera: boolean;
  slugfly: string;
  type: string;
  title: string;
}

export class FindForMentorQuery {
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  searchText: string;
}

export class FindForMentorRequest {
  instancekey: string;
  query: FindForMentorQuery;
  user: User;
}

export class FindForMentor {
  id: string;
  units: Unit[];
  subjects: Subject[];
  testMode: string;
  accessMode: string;
  title: string;
  status: string;
  totalQuestion: number;
  totalTime: number;
}

export class FindForMentorResponse {
  response: FindForMentor[];
}

export class GetBuyModeTestForTeacherQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  status: string;
  @ApiProperty({ required: false })
  title: string;
}

export class GetBuyModeTestForTeacherRequest {
  instancekey: string;
  query: GetBuyModeTestForTeacherQuery;
  user: User;
}

class GetBuyModeTestForTeacher {
  _id: string;
  user: User;
  subjects: Subject[];
  testMode: string;
  accessMode: string;
  countries: Country[];
  title: string;
  totalQuestion: number;
  questionsToDisplay: number;
  totalTime: number;
  imageUrl: string;
  price: number;
  marketPlacePrice: number;
  discountValue: number;
  currency: string;
}

export class GetBuyModeTestForTeacherResponse {
  response: GetBuyModeTestForTeacher[];
}

export class RemoveQuestionBody {
  @IsMongoId()
  @ApiProperty()
  question: string;
  @IsMongoId()
  @ApiProperty()
  practice: string;
}

export class RemoveQuestionRequest {
  instancekey: string;
  body: RemoveQuestionBody;
}

export class RemoveQuestionResponse {
  response: { [key: string]: number };
}

export class CompletedTestStudentsByClassQuery {
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  studentName: string;
  @ApiProperty({ required: false })
  includeCount: boolean;
}

export class CompletedTestStudentsByClassRequest {
  instancekey: string;
  timezoneoffset: string;
  id: string;
  query: CompletedTestStudentsByClassQuery;
}

export class StudentAttempts {
  _id: string;
  userId: string;
  name: string;
  provider: string;
  avatar: Avatar;
}

export class CompletedTestStudentsByClassResponse {
  studentAttempts: StudentAttempts[];
  total: number;
}

export class CompletedTestByClassRequest {
  instancekey: string;
  timezoneoffset: string;
  classId: string;
}

export class AttemptStat {
  _id: string | null;
  abandoned: number;
  finished: number;
  totalAttempts: number;
}

export class Test {
  _id: string;
  totalTime: number;
  offscreenLimit: number;
  camera: boolean;
  totalQuestion: number;
  startDate: string;
  attemptAllowed: number;
  classRooms: string[];
  title: string;
  testMode: string;
}

export class TestWithAttemptStat {
  attemptStat: AttemptStat;
  test: Test;
}

export class CompletedTestByClassResponse {
  tests: TestWithAttemptStat[];
  loggedIn: number;
}

export class OngoingTestByClassRequest {
  instancekey: string;
  timezoneoffset: string;
  classId: string;
  testOnly: boolean;
}

export class OngoingTest {
  _id: string;
  startDate: string;
  classRooms: string[];
  title: string;
  testMode: string;
}

export class OngoingTestAttemptStats {
  _id: string;
  abandoned: number;
  finished: number;
  ongoing: number;
  total: number;
}

export class OngoingTestByClassResponse {
  test: OngoingTest;
  students: number;
  attemptStats: OngoingTestAttemptStats;
  loggedIn: number;
}

export class OngoingAttemptsRequest {
  instancekey: string;
  id: string; // class id
}

export class StudentAttempt {
  _id: string;
  studentName: string;
  rollNumber: string;
  totalAttempts: number;
  attemptId: string;
}

export class OngoingAttemptsResponse {
  tests: number;
  students: number;
  attempts: StudentAttempt[];
}

export class TodayProctoredTestsQuery {
  @ApiProperty({ required: false })
  classId: string;
  @ApiProperty({ required: false, description: 'ongoing/today' })
  session: string;
}

export class TodayProctoredTestsRequest {
  instancekey: string;
  timezoneoffset: string;
  query: TodayProctoredTestsQuery;
  user: User;
}

class TodayProctoredTestsAttempt {
  _id: string;
  abandoned: number;
  finished: number;
  totalAttempts: number;
  totalStudents: number;
}

class UserLog {
  _id: string;
  loggedIn: number;
}

export class TodayProctoredTestsResponse {
  testDetails: OngoingTest[];
  tests: number;
  students: number;
  attempts: TodayProctoredTestsAttempt[];
  loggedIn: UserLog[];
}

export class UpcomingTestByClassRequest {
  instancekey: string;
  timezoneoffset: string;
  id: string
}

class UpcomingTestByClass {
  _id: string;
  totalTime: number;
  startDate: Date;
  title: string;
  testMode: string;
  subjects: Subject[];
}

export class UpcomingTestByClassResponse {
  tests: UpcomingTestByClass[];
}

export class GetSessionTimesBody {
  @ApiProperty()
  day: string;
  @ApiProperty()
  month: string;
  @ApiProperty()
  year: string;
}

export class GetSessionTimesRequest {
  instancekey: string;
  user: User;
  body: GetSessionTimesBody;
}

export class GetSessionTimes {
  startDate: string;
  count: number;
}

export class GetSessionTimesResponse {
  response: GetSessionTimes[];
}

export class RecommendedTestsBySubjectQuery {
  page: number;
  limit: number;
  searchText: string;
}

export class RecommendedTestsBySubjectRequest {
  instancekey: string;
  id: string;
  query: RecommendedTestsBySubjectQuery;
  user: User;
}

class RecommendedTestsBySubject {
  title: string;
  subjects: Subject[];
  accessMode: string;
  totalQuestion: number;
  slugfly: string;
  units: Unit[];
  totalTime: number;
  testMode: string;
  status: string;
  colorCode: string;
  imageUrl: string;
}

export class RecommendedTestsBySubjectResponse {
  response: RecommendedTestsBySubject[];
}

export class RecentTestByUserQuery {
  page: number;
  limit: number;
  title: string;
  subjects: string;
}

export class RecentTestByUserRequest {
  instancekey: string;
  id: string;
  query: RecentTestByUserQuery;
  user: User;
}

export class RecentTestByUser {
  testMode: string;
  subjects: Subject[];
  colorCode: string | null;
  imageUrl: string | null;
  id: string;
  title: string;
  totalQuestion: number;
  totalTime: number;
}

export class RecentTestByUserResponse {
  response: RecentTestByUser[];
}

export class SearchTestsQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  skip: number;
  @ApiProperty({ required: false })
  sort: string;
  @ApiProperty({ required: false })
  attempted: boolean;
  @ApiProperty({ required: false })
  multi: boolean;
  @ApiProperty({ required: false })
  unattempted: boolean;
  @ApiProperty({ required: false })
  purchase: boolean;
  @ApiProperty({ required: false })
  showFavoriteOnly: boolean;
  @ApiProperty({ required: false, description: 'comma seperated publisher ids' })
  publiser: string;
  @ApiProperty({ required: false })
  new: boolean;
  @ApiProperty({ required: false })
  invitation: boolean;
  @ApiProperty({ required: false })
  nonPaid: boolean;
  @ApiProperty({ required: false })
  buy: boolean;
  @ApiProperty({ required: false, description: 'comma seperated unit ids' })
  units: string;
  @ApiProperty({ required: false, description: 'comma seperated subject ids' })
  subjects: string;
  @ApiProperty({ required: false })
  rejectBuy: string;
  @ApiProperty({ required: false })
  title: string;
}

export class SearchTestsRequest {
  instancekey: string;
  query: SearchTestsQuery;
  user: User;
  searchText: string;
  tags: string;
}

export class SearchTestsResponse {
  results: PracticeSetDto[];
  count: number;
}

export class SearchUnitsQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  title: string;
}

export class SearchUnitsRequest {
  instancekey: string;
  query: SearchUnitsQuery;
}

export class SearchUnits {
  _id: string;
  name: string;
  subject: string;
}

export class SearchUnitsResponse {
  response: SearchUnits[];
}

export class ArchiveQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  status: string;
  @ApiProperty({ required: false })
  count: number;
}

export class ArchiveRequest {
  instancekey: string;
  id: string;
  query: ArchiveQuery;
  user: User;
}

export class Archive {
  _id: string;
  questionsToDisplay: number;
  totalTime: number;
  totalQuestion: number;
  title: string;
  testMode: string;
  subjects: Subject;
}

export class ArchiveResponse {
  response: Archive[];
}

export class SaveAsRequest {
  instancekey: string;
  id: string;
  @ApiProperty()
  title: string;
  user: User;
}

export class SaveAsResponse {
  response: PracticeSetDto;
}

export class FindOneForSessionRequest {
  instancekey: string;
  id: string;
}

export class FindOneForSessionResponse {
  _id: string;
  status: string;
  title: string;
  questionsToDisplay: number;
  totalQuestion: number;
  totalJoinedStudent: number;
}

export class FindOneWithQuestionsQuery {
  @ApiProperty({ required: false })
  hasAccessMode: boolean;
  @ApiProperty({ required: false })
  hasMeta: boolean;
  @ApiProperty({ required: false })
  notCheckActiveMember: boolean;
  @ApiProperty({ required: false })
  packageId: string;
}

export class FindOneWithQuestionsRequest {
  instancekey: string;
  token: string;
  id: string;
  authorization: string;
  ip: string;
  user: User;
  query: FindOneWithQuestionsQuery;
}

export class FindOneWithQuestionsResponse { }

export class ShareLinkBody {
  @ApiProperty()
  @IsMongoId()
  practiceSetId: string;
  @ApiProperty()
  emails: string;
  @ApiProperty()
  phones: string[];
}

export class ShareLinkRequest {
  instancekey: string;
  body: ShareLinkBody;
  user: User;
}

export class ShareLinkResponse { }

export class CheckTestCodeRequest {
  instancekey: string;
  code: string;
  user: User;
}

export class CheckTestCodeResponse {
  downloadLink: string;
}

export class ExportPDFQuery {
  @ApiProperty({ required: false })
  hasAnswers: boolean;
  @ApiProperty({ required: false })
  directDownload: boolean;
}

export class ExportPDFRequest {
  instancekey: string;
  id: string;
  query: ExportPDFQuery;
}

export class ExportPDFResponse {
  downloadLink: string;
}

export class FraudCheckRequest {
  instancekey: string;
  id: string;
}

export class FraudCheckResponse {
  response: string;
}

export class GetStudentTakingTestQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  isPrivate: boolean;
  @ApiProperty({ required: false, description: 'comma seperated class ids' })
  classes: string;
  @ApiProperty({ required: false })
  searchText: string;
  @ApiProperty({ required: false })
  includeCount: boolean;
}

export class GetStudentTakingTestRequest {
  instancekey: string;
  token: string;
  id: string;
  query: GetStudentTakingTestQuery;
  user: User;
}

export class StudentTakingTest {
  _id: string;
  studentId: string;
  name: string;
  offscreenLimit: number;
  attemptLimit: number;
  status: string;
  rollNumber: string;
  userId: string;
}

export class GetStudentTakingTestResponse {
  students: StudentTakingTest[];
  count: number;
  total: number;
}







export class ImportQuestionRequest {
  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  questions: string[];
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  fromSearch: boolean;
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  practice: string;
  @ApiProperty({ required: false })
  @IsOptional()
  searchParams: any;
  instancekey: string;
  user: User;
}

export class ImportQuestionResponse { }


export class ImportFileBody {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  QB?: boolean;
  @ApiProperty()
  @IsString()
  testId?: string;
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  notifyUser?: boolean;
  @ApiProperty()
  @IsString()
  tags?: string;
  @ApiProperty()
  @IsString()
  isAllowReuse?: string;
}
export class ImportFileReq {
  @ApiProperty({ type: 'string', format: 'binary' })
  file?: Express.Multer.File;
  user?: User;
  instancekey?: string;
  body?: ImportFileBody;
}

export class ExportTestQuery {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  deleteUrl?: string;
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  directDownload?: boolean;
}
export class ExportTestReq {
  id?: string;
  user?: User;
  instancekey?: string;
  query?: ExportTestQuery;
}

export class Empty { }

export class PlayGameBody {
  @ApiProperty()
  @IsMongoId()
  question: string;
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  answers: string[];
  @ApiProperty()
  isCorrect: boolean;
  @ApiProperty()
  seconds: string;
}

export class PlayGameRequest {
  instancekey: string;
  id: string;
  body: PlayGameBody
  user: User;
  token: string;
}

export class PlayGameResponse {
  continue: boolean;
  finish: boolean;
  _id: string;
  name: string;
  avatar: Avatar;
  mark: number;
  time: number;
  isWinner: boolean;
}

export class FindForTeacherBody {
  @ApiProperty()
  title: string;
  @ApiProperty()
  keyword: string;
  @ApiProperty()
  titleOnly: boolean;
  @ApiProperty()
  page: number;
  @ApiProperty()
  limit: number;
  @ApiProperty()
  sort: string;
  @ApiProperty()
  multiStatus: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  notCheckExpiresOn: boolean;
  @ApiProperty()
  expired: string;
  @ApiProperty()
  testMode: string;
  @ApiProperty()
  subjects: string[];
  @ApiProperty()
  levels: string;
  @ApiProperty()
  unit: string;
  @ApiProperty()
  classRoom: string;
  @ApiProperty()
  accessMode: string;
  @ApiProperty()
  isInternalOnly: boolean;
  @ApiProperty()
  includeCount: boolean;
  @ApiProperty()
  noPaging: boolean;
}

export class FindForTeacherRequest {
  query: FindForTeacherBody;
  user: User;
  instancekey: string;
}

export class FindForTeacherResponse {

}