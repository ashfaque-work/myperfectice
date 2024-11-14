import { Types } from 'mongoose';
import { ApiProperty, ApiQuery } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class Subject {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  name: string;
}

export class Topic {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  name: string;
  count?: number;
}

export class Unit {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  name: string;
};

export class Moderation {
  @ApiProperty()
  moderatedBy: string;
  @ApiProperty()
  moderationDate: Date;
}

export class AudioFiles {
  @ApiProperty()
  url: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  duration: number;
}

export class Answers {
  @ApiProperty()
  answerText: string;
  @ApiProperty()
  answerTextArray: string[];
  @ApiProperty()
  isCorrectAnswer: boolean;
  @ApiProperty()
  input: string;
  @ApiProperty()
  marks: number;
  @ApiProperty()
  score: number;
  @ApiProperty()
  userText: string;
  @ApiProperty()
  correctMatch: string;
  @ApiProperty({ type: [AudioFiles] })
  audioFiles: AudioFiles[];
  meta: string;
  iv: string;
};

export class TestCases {
  @ApiProperty()
  isSample: boolean;
  @ApiProperty()
  args: string;
  @ApiProperty()
  input: string;
  @ApiProperty()
  output: string;
}

export class Coding {
  @ApiProperty()
  language: string;
  @ApiProperty()
  timeLimit: number;
  @ApiProperty()
  memLimit: number;
  @ApiProperty()
  template: string;
  @ApiProperty()
  solution: string;
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
  @ApiProperty()
  _id: string;
  @ApiProperty()
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
  grade: string[];
  ownLocation: boolean;
}

export class AlternativeExplanations {
  @ApiProperty({ type: () => User })
  user: User;
  @ApiProperty()
  explanation: string;
  @ApiProperty()
  isApproved: boolean;
}
export class TopicRelated {
  _id: string;
  name: string;
  slugfly: string;
  unit: Types.ObjectId;
  active: boolean;
  uid: string;
  synced: boolean;
  isAllowReuse: string;
  lastModifiedBy: Types.ObjectId;
  createdBy: Types.ObjectId;
  tags: string[];
}
export class QuestionBankDto {
  _id: string;
  @ApiProperty()
  user: string;
  @ApiProperty({ enum: ['student', 'support', 'teacher', 'mentor', 'publisher', 'admin', 'director', 'centerHead', 'operator'] })
  userRole: string;
  @ApiProperty()
  practiceSets: string[];
  @ApiProperty({ type: () => Subject })
  subject: Subject;
  @ApiProperty({ type: () => Topic })
  topic: Topic;
  @ApiProperty({ type: () => Unit })
  unit: Unit;
  @ApiProperty()
  tags: string[];
  @ApiProperty()
  complexity: string;
  @ApiProperty()
  questionType: string;
  @ApiProperty()
  isAllowReuse: string;
  @ApiProperty({ type: () => Moderation })
  moderation: Moderation;
  @ApiProperty()
  category: string;
  @ApiProperty()
  questionText: string;
  @ApiProperty()
  questionTextArray: string[];
  @ApiProperty({ type: [AudioFiles] })
  audioFiles: AudioFiles[];
  @ApiProperty()
  answerExplainArr: string[];
  @ApiProperty()
  answerExplain: string;
  @ApiProperty({ type: () => [AudioFiles] })
  answerExplainAudioFiles: AudioFiles[];
  @ApiProperty()
  prefferedLanguage: string[];
  @ApiProperty()
  questionHeader: string;
  @ApiProperty()
  answerNumber: number;
  @ApiProperty()
  minusMark: number;
  @ApiProperty()
  plusMark: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  isActive: boolean;
  @ApiProperty()
  wordLimit: number;
  @ApiProperty()
  partialMark: boolean;
  @ApiProperty()
  domain: string;
  @ApiProperty()
  facet: number;
  @ApiProperty({ type: () => [Answers] })
  answers: Answers[];
  @ApiProperty()
  userInputDescription: string;
  @ApiProperty()
  hasUserInput: boolean;
  @ApiProperty()
  argumentDescription: string;
  @ApiProperty()
  hasArg: boolean;
  @ApiProperty()
  modelId: number;
  @ApiProperty()
  tComplexity: number;
  @ApiProperty({ type: () => [TestCases] })
  testcases: TestCases[];
  @ApiProperty({ type: () => [Coding] })
  coding: Coding[];
  @ApiProperty()
  approveStatus: string;
  @ApiProperty({ type: () => [AlternativeExplanations] })
  alternativeExplanations: AlternativeExplanations[];
  @ApiProperty()
  lastModifiedBy: string;
  @ApiProperty()
  uid: string;
  @ApiProperty()
  locations: string[];
  topicRelated?: TopicRelated;
}

export class CreateQuestionUser {
  _id: string;
  roles: string;
  activeLocation: string;
}

export class CreateQuestionRequest {
  @ApiProperty()
  practiceSets: string[];
  @ApiProperty({ type: () => Subject })
  @IsNotEmpty()
  subject: Subject;
  @ApiProperty({ type: () => Topic })
  @IsNotEmpty()
  topic: Topic;
  @ApiProperty({ type: () => Unit })
  @IsNotEmpty()
  unit: Unit;
  @ApiProperty()
  tags: string[];
  @ApiProperty()
  complexity: string;
  @ApiProperty()
  questionType: string;
  @ApiProperty()
  isAllowReuse: string;
  @ApiProperty({ type: () => Moderation })
  moderation: Moderation;
  @ApiProperty()
  category: string;
  @ApiProperty()
  @IsNotEmpty()
  questionText: string;
  @ApiProperty()
  questionTextArray: string[];
  @ApiProperty({ type: [AudioFiles], required: false })
  audioFiles?: AudioFiles[];
  @ApiProperty()
  answerExplainArr: string[];
  @ApiProperty()
  answerExplain: string;
  @ApiProperty({ type: () => [AudioFiles] })
  answerExplainAudioFiles: AudioFiles[];
  @ApiProperty()
  prefferedLanguage: string[];
  @ApiProperty()
  questionHeader: string;
  @ApiProperty()
  answerNumber: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  isActive: boolean;
  @ApiProperty()
  wordLimit: number;
  @ApiProperty()
  partialMark: boolean;
  @ApiProperty()
  domain: string;
  @ApiProperty()
  facet: number;
  @ApiProperty({ type: () => [Answers] })
  answers: Answers[];
  @ApiProperty()
  userInputDescription: string;
  @ApiProperty()
  hasUserInput: boolean;
  @ApiProperty()
  argumentDescription: string;
  @ApiProperty()
  hasArg: boolean;
  @ApiProperty()
  modelId: number;
  @ApiProperty()
  tComplexity: number;
  @ApiProperty({ type: () => [TestCases] })
  testcases: TestCases[];
  @ApiProperty({ type: () => [Coding] })
  coding: Coding[];
  @ApiProperty()
  approveStatus: string;
  @ApiProperty({ type: () => [AlternativeExplanations] })
  alternativeExplanations: AlternativeExplanations[];
  @ApiProperty()
  lastModifiedBy?: string;
  @ApiProperty()
  uid: string;
  instancekey: string;
  userData: CreateQuestionUser;
}

export class CreateQuestionResponse extends QuestionBankDto { }

export class GetAllQuestionRequest {
  instancekey: string;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  sort: string;
  @ApiProperty({ required: false })
  practiceSet: string;
  @ApiProperty({ required: false })
  subject: string;
  @ApiProperty({ required: false })
  keyword: string;
}

export class GetAllQuestionResponse {
  response: QuestionBankDto[];
}

export class GetQuestionRequest {
  instancekey: string;
  @ApiProperty()
  _id: string;
  relatedTopic?: boolean;
}

export class GetQuestionResponse {
  response: QuestionBankDto;
}

export class UpdateQuestionRequest {
  instancekey: string;
  _id: string;
  @ApiProperty()
  questionText: string;
  @ApiProperty()
  practiceSets: string[];
  @ApiProperty({ type: () => Subject })
  subject: Subject;
  @ApiProperty({ type: () => Topic })
  topic: Topic;
  @ApiProperty({ type: () => Unit })
  unit: Unit;
  @ApiProperty({ type: () => [Coding] })
  coding: Coding[];
  @ApiProperty()
  questionTextArray: string[];
  @ApiProperty()
  tags: string[];
  @ApiProperty({ type: [AudioFiles] })
  audioFiles: AudioFiles[];
  @ApiProperty({ type: () => [AlternativeExplanations] })
  alternativeExplanations: AlternativeExplanations[];
  @ApiProperty({ type: () => [Answers] })
  answers: Answers[];
  @ApiProperty()
  section: string;
  @ApiProperty()
  notUpdatetag: boolean;
  userId: string;
}

export class UpdateQuestionResponse extends QuestionBankDto { }

export class DeleteQuestionRequest {
  @ApiProperty()
  _id: string;
  instancekey: string;
  userId: string;
  userRoles: string[];
}

export class DeleteQuestionResponse {
  response: QuestionBankDto;
}

export class UpdateStudentQuestionRequest {
  _id: string;
  status: string;
  instancekey: string;
}

export class UpdateStudentQuestionResponse extends QuestionBankDto { }

export class CreateExplanationRequest {
  _id: string;
  @ApiProperty()
  explanation: string;
  @ApiProperty()
  testId: string;
  @ApiProperty()
  testTitle: string;
  @ApiProperty({ type: User })
  user: User;
  instancekey: string;
}

export class CreateExplanationResponse extends QuestionBankDto { }

export class Explanation {
  @ApiProperty()
  _id: string;
  @ApiProperty({ type: () => User })
  user: User;
  @ApiProperty()
  explanation: string;
  @ApiProperty()
  isApproved: boolean;
}

export class ApproveStudentExplanationRequest {
  _id: string;
  @ApiProperty({ type: [Explanation] })
  explanations: Explanation[];
  instancekey: string;
}

export class ApproveStudentExplanationResponse {
  message: string;
}

// Question distribution by category
export interface Question {
  marks: number;
  category: string;
  count: number;
}

export interface QuestionCategoryDto {
  questions: Question[];
  count: number;
  category: string;
}

export interface QuestionDistributionCategoryResponse {
  response: QuestionCategoryDto[];
}

// Question distribution by marks
export interface QuestionMarksDto {
  category: string;
  minusMark: number;
  plusMark: number;
}

export interface QuestionDistributionMarksResponse {
  response: QuestionMarksDto[];
}

// practiceSummaryBySubject
export interface UnitDto {
  name: string;
  count: number;
  _id: string;
}

export interface PracticeSummaryBySubject {
  _id: string;
  name: string;
  units: UnitDto[];
  count: number;
}

export interface PracticeSummaryBySubjectResponse {
  response: PracticeSummaryBySubject[];
}

// getByPractice
export interface PracticeQuestion extends QuestionBankDto {
  section: string;
  order: number;
  canEdit: boolean;
}

export interface PracticeQuestionsResponse {
  response: PracticeQuestion[];
}

// Question used count
export class PracticeSetDetailsDto {
  subjectName: string;
  testId: string;
  testName: string;
}

export class QuestionUsedCountDto {
  qId: string;
  totalPracticesetCount: number;
  details: PracticeSetDetailsDto[];
}

export class QuestionUsedCountResponse {
  response: QuestionUsedCountDto[];
}

// getPracticeSetClassroom 
// export interface GetPracticeSetClassroom{  
//     _id: {
//         classroomId: string;
//     },
//     name: string;
//     seqCode: string;
//     imageUrl: string;
//     colorCode: string;
//     studentsCount: number;
//     attemptsCount: number;
//     joinByCode: boolean;

// }

// export interface GetPracticesetClassroomsResponse{
//   response: GetPracticeSetClassroom[];
// }
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
  @ApiProperty()
  error: string;
}

export class AnswerQA {
  @ApiProperty({ type: String })
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

export class QA {
  @ApiProperty({ type: String })
  question: Types.ObjectId;
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
  @ApiProperty({ type: [AnswerQA] })
  answers?: AnswerQA[];
  @ApiProperty()
  teacherComment?: string;
  @ApiProperty()
  reviewTimes?: number;
  @ApiProperty()
  reviewTimeSpent?: number;
  @ApiProperty()
  tComplexity?: number;
  @ApiProperty({ type: [String] })
  answerOrder?: Types.ObjectId[];
  @ApiProperty()
  scratchPad?: string[];
  @ApiProperty()
  evaluatorAssigned?: boolean;
}

export class AttemptDetailDto {
  practicesetId: Types.ObjectId;
  user: Types.ObjectId;
  attempt?: Types.ObjectId;
  isAbandoned?: boolean;
  archiveQA?: any[];
  QA: QA[] | null;
}

export class QuestionIsAttemptRequest {
  instancekey: string;
  id: string;
}

export class QuestionIsAttemptResponse {
  response: AttemptDetailDto;
}

export class QuestionPerformanceRequest {
  instancekey: string;
  id: string;
}

export class QuestionPerformanceResponse {
  percentCorrect: number;
}

export class GetLastRequest {
  instancekey: string;
  user: string;
}

export class GetLastResponse {
  response: QuestionBankDto;
}

export class GetLastInPracticeRequest {
  instancekey: string;
  practice: string;
  preDate: Date;
}

export class GetLastInPracticeDto {
  questionInfo: QuestionBankDto;
  section: string;
}

export class GetLastInPracticeResponse {
  response: GetLastInPracticeDto;
}

export class UserDto {
  _id: string;
  roles: string;
  activeLocation: string;
  subjects: string[];
}

export class InternalSearchDto {
  @ApiProperty({ required: false })
  level?: string;

  @ApiProperty({ required: false })
  unusedOnly?: boolean;

  @ApiProperty({ required: false })
  notInTest?: string;

  @ApiProperty({ required: false })
  excludeTempt?: boolean;

  @ApiProperty({ type: [String], required: false })
  usedQuestions?: string[];

  @ApiProperty({ type: [String], required: false })
  excludeQuestions?: string[];

  @ApiProperty({ required: false })
  marks?: number;

  @ApiProperty({ required: false })
  pendingReview?: boolean;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty({ required: false })
  isEasy?: boolean;

  @ApiProperty({ required: false })
  isModerate?: boolean;

  @ApiProperty({ required: false })
  isDifficult?: boolean;

  @ApiProperty({ type: [String], required: false })
  tags?: string[];

  @ApiProperty({ required: false })
  myquestion?: boolean;

  @ApiProperty({ type: [String], required: false })
  owners?: string[];

  @ApiProperty({ required: false })
  reUse?: boolean;

  @ApiProperty({ required: false })
  studentQuestions?: boolean;

  @ApiProperty({ required: false })
  pending?: boolean;

  @ApiProperty({ required: false })
  isApproved?: boolean;

  @ApiProperty({ required: false })
  isActive?: boolean;

  @ApiProperty({ required: false })
  subject?: string;

  @ApiProperty({ type: [String], required: false })
  units?: string[];

  @ApiProperty({ type: [String], required: false })
  topics?: string[];

  @ApiProperty({ required: false })
  keyword?: string;

  @ApiProperty({ required: false })
  altSolution?: boolean;

  @ApiProperty({ required: false })
  toImport?: boolean;

  @ApiProperty({ required: false })
  includeCount?: boolean;

  @ApiProperty({ required: false })
  page?: number;

  @ApiProperty({ required: false })
  limit?: number;
}

export class InternalSearchRequest {
  instancekey: string;
  user: UserDto;
  params: InternalSearchDto;
}

export class TopicDto {
  _id: string;
  name: string;
  slugfly: string;
  unit: Types.ObjectId;
  active: boolean;
  uid: string;
  synced: boolean;
  isAllowReuse: string;
  lastModifiedBy: Types.ObjectId;
  createdBy: Types.ObjectId;
  tags: string[];
}

export class InternalSearchTopic {
  _id: TopicDto;
  name: string;
}

export class InternalSearchQuestionDto {
  _id: string;
  createBy: string;
  answerExplain: string;
  answerNumber: string;
  wordLimit: number;
  complexity: string;
  createdAt: Date;
  minusMark: number;
  plusMark: number;
  practiceSets: string[];
  questionHeader: string;
  questionText: string;
  questionTextArray: string[];
  questionType: string;
  subject: Subject;
  unit: Unit;
  topic: InternalSearchTopic;
  updatedAt: Date;
  user: string;
  isAllowReuse: string;
  isActive: boolean;
  category: string;
  answers: Answers[];
  tags: string[];
  coding: Coding[];
  hasUserInput: boolean;
  userInputDescription: string;
  hasArg: boolean;
  argumentDescription: string;
  approveStatus: string;
  alternativeExplanations: AlternativeExplanations[];
  partialMark: number;
  moderation: Moderation;
  testcases: TestCases[];
}

export class InternalSearchData {
  questions: InternalSearchQuestionDto[];
  count?: number;
}

export class InternalSearchResponse {
  response: InternalSearchData;
}

export class CountByPracticeRequest {
  instancekey: string;
  practiceId: string;
  @ApiProperty({ required: false })
  keyword?: string;
  @ApiProperty({ required: false, description: "comma seperated multiple id" })
  topics?: string;
}

export class CountByPracticeResponse {
  count: number;
}

export class GetQuestionTagsResquest {
  instancekey: string;
}

export class GetQuestionTagsResponse {
  tags: string[];
}

export class UpdateTagsRequest {
  instancekey: string;
  @ApiProperty({ description: 'array of question ids' })
  questions: string[];
  @ApiProperty({ description: 'array of tags' })
  tags: string[];
  userId: string;
}

export class UpdateTagsResponse {
  result: boolean;
}

export class QuestionSummaryTopicRequest {
  instancekey: string;
  id: string;
  isAllowReuse: string;
  userId: string;
}
export class QuestionSummaryTopicDto {
  _id: string;
  name: string;
  count: number;
  unit: string;
}
export class QuestionSummaryTopicResponse {
  response: QuestionSummaryTopicDto[];
}

export class GetQuestionForOnlineTestRequest {
  instancekey: string;
  id: string;
}

export class GetQuestionForOnlineTestResponse {
  response: Question;
}

export class PersonalTopicAnalysisRequest {
  instancekey: string;
  userId: string;
  id: string;
}

export class PersonalTopicAnalysisResponse {
  _id: string;
  correct: string;
  incorrect: string;
  accuracy: string;
}

export class SummaryTopicOfPracticeBySubjectRequest {
  instancekey: string;
  unit: string;
  practiceIds: string;
}

export class SummaryTopicOfPractice {
  _id: string;
  name: string;
  count: number;
  marks: number;
  unit: string;
}

export class SummaryTopicOfPracticeBySubjectResponse {
  response: SummaryTopicOfPractice[];
}

export class SummaryTopicPracticeRequest {
  instancekey: string;
  practice: string;
  unit: string;
}

export class SummaryTopicPracticeResponse {
  response: SummaryTopicOfPractice[];
}

export class SummarySubjectPracticeRequest {
  instancekey: string;
  practice: string;
}

export class SummarySubjectPracticeResponse {
  response: SummaryTopicOfPractice[];
}

export class TestSeriesSummaryBySubjectRequest {
  instancekey: string;
  practice: string;
}

export class TestSeriesSummaryBySubject {
  _id: string;
  name: string;
  topics: Topic[];
  count: number;
}

export class TestSeriesSummaryBySubjectResponse {
  response: TestSeriesSummaryBySubject[];
}

export class GetByAttemptRequest {
  instancekey: string;
  attempt: string;
  userRoles: string[];
}

export class GetByAttemptResponse {
  response: QuestionBankDto[];
}

export class GetReusedCountRequest {
  instancekey: string;
  id: string;
  notAllowDelete?: boolean;
}

export class GetReusedCountResponse {
  count: number;
}

export class FeedbackQuestionRequest {
  instancekey: string;
  id: string;
  @ApiProperty({ required: false })
  page?: number;
  @ApiProperty({ required: false })
  limit?: number;
  @ApiProperty({ required: false })
  keyword?: string;
}

export class Feedback {
  comment: string;
  feedbackComments: string[];
  responded: string;
  studentId: string;
  studentName: string;
  updatedAt: Date;
  feedbackId: string;
}

export class QuestionId {
  questionId: string;
}

export class FeedbackQuestion {
  _id: QuestionId;
  feedback: Feedback[];
  updatedAt: Date;
  index: number;
  order: number;
  questionText: string;
  questionHeader: string;
  createdAt: Date;
  topic: Topic;
  unit: Unit;
  questionType: string;
  applyLastHeader: boolean;
}

export class FeedbackQuestionResponse {
  response: FeedbackQuestion[];
}

export class FeedbackQuestionCountRequest {
  instancekey: string;
  id: string;
}

export class FeedbackQuestionCountResponse {
  count: number;
}

export class QuestionDistributionUser {
  _id: string;
  locations: string[];
  roles: string[];
  subjects: string[];
}

export class QuestionDistributionRequest {
  instancekey: string;
  user: QuestionDistributionUser;
  @ApiProperty({ required: false })
  myquestion?: boolean;
  @ApiProperty({ required: false })
  owners?: string;
  @ApiProperty({ required: false })
  pendingReview?: boolean;
  @ApiProperty({ required: false })
  grade?: string;
  @ApiProperty({ required: false })
  subject?: string;
  @ApiProperty({ required: false })
  units?: string;
  @ApiProperty({ required: false })
  complexity?: string;
  @ApiProperty({ required: false })
  isActive?: boolean;
  @ApiProperty({ description: 'comma seperated tags', required: false })
  tags?: string;
  @ApiProperty({ required: false })
  keyword?: string;
  @ApiProperty({ required: false })
  unusedOnly?: boolean;
  @ApiProperty({ required: false, description: 'practice_set id' })
  notInTest?: string;
  @ApiProperty({ required: false })
  excludeTempt?: boolean;
}

export class QuestionDistribution {
  _id: string;
  count: number;
  name: string;
}

export class QuestionDistributionResponse {
  response: QuestionDistribution[];
}

export class QuestionComplexityByTopicRequest {
  instancekey: string;
  user: QuestionDistributionUser;
  @ApiProperty({ required: false })
  myquestion?: boolean;
  @ApiProperty({ required: false })
  owners?: string;
  @ApiProperty({ required: false })
  pendingReview?: boolean;
  @ApiProperty({ required: false })
  studentQuestions?: boolean;
  @ApiProperty({ required: false })
  isApproved?: boolean;
  @ApiProperty({ required: false })
  complexity?: string;
  @ApiProperty({ required: false })
  isActive?: boolean;
  @ApiProperty({ required: false, description: 'comma seperated tags' })
  tags?: string;
  @ApiProperty({ required: false })
  subject?: string;
  @ApiProperty({ required: false })
  unit?: string;
  @ApiProperty({ required: false, description: 'comma seperated topic ids' })
  topics?: string;
  @ApiProperty({ required: false })
  keyword?: string;
  @ApiProperty({ required: false })
  unusedOnly?: boolean;
  @ApiProperty({ required: false, description: 'practice_set id' })
  notInTest?: string;
  @ApiProperty({ required: false })
  excludeTempt?: boolean;
  @ApiProperty({ required: false })
  pending?: boolean;
}

export class QuestionComplexityByTopic {
  name: string; // Topic name
  _id: string; // Topic ID
  complexity: string;
}

export class QuestionComplexityByTopicResponse {
  response: QuestionComplexityByTopic[];
}

export class GenerateRandomTestUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  subjects: string[];
  activeLocation: string;
}

export class GenerateRandomTestRequest {
  instancekey: string;
  user: GenerateRandomTestUser;
  @ApiProperty()
  year: number;
  @ApiProperty()
  month: number;
  @ApiProperty()
  day: number;
  @ApiProperty()
  currentTime: string;
}

export class GenerateRandomTestResponse {
  response: string;
}

export class CreateTestFormPoolUser {
  _id: string;
  name: string;
  subjects: string[];
  locations: string[];
  roles: string[];
  activeLocation: string;
}

export class CreateTestFormPoolRequest {
  instancekey: string;
  user: CreateTestFormPoolUser;
  @ApiProperty({ required: false })
  title?: string;
  @ApiProperty({ required: false })
  totalQuestion?: number;
  @ApiProperty({ required: false })
  marks?: number;
  @ApiProperty({ required: false })
  myquestion?: boolean;
  @ApiProperty({ required: false })
  owners?: string;
  @ApiProperty({ required: false })
  pendingReview?: boolean;
  @ApiProperty({ required: false })
  studentQuestions?: boolean;
  @ApiProperty({ required: false })
  isApproved?: boolean;
  @ApiProperty({ required: false })
  complexity?: string;
  @ApiProperty({ required: false })
  isActive?: boolean;
  @ApiProperty({ required: false })
  tags?: string;
  @ApiProperty({ required: false })
  subject?: string;
  @ApiProperty({ required: false })
  units?: string;
  @ApiProperty({ required: false })
  topics?: string;
  @ApiProperty({ required: false })
  keyword?: string;
  @ApiProperty({ required: false })
  sort?: string;
  @ApiProperty({ required: false })
  unusedOnly?: boolean;
  @ApiProperty({ required: false })
  notInTest?: string;
  @ApiProperty({ required: false })
  excludeTempt?: boolean;
  @ApiProperty({ required: false })
  reUse?: boolean;
  @ApiProperty({ required: false })
  pending?: boolean;
}

export class CreateTestFormPoolResponse {
  user: string;
  userInfo: {
    _id: string;
    name: string;
  };
  title: string;
  totalQuestion: number;
  totalAttempt: number;
  attemptAllowed: number;
  enableMarks: boolean;
  isMarksLevel: boolean;
  totalJoinedStudent: number;
  accessMode: string;
  status: string;
  inviteeEmails: string[];
  inviteePhones: string[];
  createMode: string;
  units: {
    _id: string;
    name: string;
  }[];
  questions: {
    question: string;
    createdAt: Date;
    section: string;
    plusMark: number;
    minusMark: number;
    order: number;
  }[];
  locations: string[];
}

export class GetRandomQuestionsRequest {
  instancekey: string;
  id: string;
}

export class GetRandomQuestionsResponse {
  response: string;
}

export class ExecuteCodeQuery {
  @ApiProperty({ required: true })
  type: string;
  @IsMongoId()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  testId: Types.ObjectId;
  @IsMongoId()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  questionId: Types.ObjectId;
  @IsMongoId()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  attemptDetailId: Types.ObjectId;
}

export class ExecuteCodeBody {
  @ApiProperty()
  code: string;
  @ApiProperty()
  testcases: TestCases;
}

export class ExecuteCodeRequest {
  instancekey: string;
  query: ExecuteCodeQuery;
  body: ExecuteCodeBody;
  user: User;
}

export class ExecuteCodeResponse {

}

// Adative Test

export class GenerateAdaptiveTestBody {
  @ApiProperty()
  subject: string;
  @ApiProperty()
  unit: string;
  @ApiProperty()
  learningMode: string;
}

export class GenerateAdaptiveTestRequest {
  instancekey: string;
  body: GenerateAdaptiveTestBody;
  user: User;
}

export class GenerateAdaptiveTestResponse {

}

export class CheckQuestionCountInAdaptiveTestBody {
  @ApiProperty()
  subject: string;
  @ApiProperty()
  unit: string;
}

export class CheckQuestionCountInAdaptiveTestRequest {
  instancekey: string;
  user: User;
  body: CheckQuestionCountInAdaptiveTestBody;
}

export class QuestionPresentedDto {
  _id: string;
  complexity: string;
  tComplexity: number;
}

export class SubjectsOfQuestionsDto {
  _id: string;
  name: string;
}

export class CheckQuestionCountInAdaptiveTestResponse {
  questions: QuestionPresentedDto[];
  subjects: SubjectsOfQuestionsDto[];
  units: Unit[];
}


export class GenerateAdaptiveLearningTestBody {
  @ApiProperty()
  subject: string;
  @ApiProperty()
  unit: string;
}

export class GenerateAdaptiveLearningTestRequest {
  instancekey: string;
  user: User;
  body: GenerateAdaptiveLearningTestBody;
}

export class GenerateAdaptiveLearningTestResponse {
  _id: string;
}

export class GetFirstQuestionQuery {
  @ApiProperty()
  @IsMongoId()
  practiceset: string;
}

export class GetFirstQuestionRequest {
  instancekey: string;
  user: User;
  query: GetFirstQuestionQuery
}

export class GetFirstQuestionResponse {

}

class UseAnswer {
  @ApiProperty()
  answerId: string;
  @ApiProperty()
  codeLanguage: string;
  @ApiProperty({ type: () => [TestCases] })
  testcases: TestCases[];
}

export class GetNextQuestionBody {
  @ApiProperty()
  testId: string;
  @ApiProperty()
  question: string;
  @ApiProperty()
  attempt: string;
  @ApiProperty()
  finish: string;
  @ApiProperty({ type: () => [UseAnswer] })
  answers: UseAnswer[];
  @ApiProperty()
  category: string;
  @ApiProperty()
  scratchPad: string[];
  @ApiProperty()
  qSpendTime: number;
  @ApiProperty()
  feedback: string;
  @ApiProperty()
  index: string;
  @ApiProperty()
  adaptiveObject: string;
}

export class GetNextQuestionRequest {
  instancekey: string;
  body: GetNextQuestionBody;
  user: User;
}


export class GetNextQuestionResponse {

}

export class GetAdaptiveTestRequest {
  instancekey: string;
  id: string;
}

export class GetAdaptiveTestResponse {

}

// Ansync 
export class FeedbackItem {
  @ApiProperty()
  name: string;
  @ApiProperty()
  value: boolean;
}

export class ShareLinkBody {
  @ApiProperty()
  @IsMongoId()
  practiceSetId: string;
  @ApiProperty()
  emails: string;
  @ApiProperty()
  phones: string[];
}

class CreatedBy {
  @ApiProperty({ type: String })
  user: Types.ObjectId;
  @ApiProperty()
  name: string;
}

class AttemptTopic {
  @ApiProperty({ type: String })
  _id: Types.ObjectId;
  @ApiProperty()
  name: string
  @ApiProperty()
  speed: number;
  @ApiProperty()
  accuracy: number;
  @ApiProperty()
  correct: number;
  @ApiProperty()
  pending: number;
  @ApiProperty()
  partial: number;
  @ApiProperty()
  missed: number;
  @ApiProperty()
  incorrect: number;
  @ApiProperty()
  mark: number;
  @ApiProperty()
  maxMarks: number;
}

class AttemptUnit {
  @ApiProperty({ type: String })
  _id: Types.ObjectId;
  @ApiProperty()
  name: string;
  @ApiProperty()
  speed: number;
  @ApiProperty()
  accuracy: number;
  @ApiProperty()
  correct: number;
  @ApiProperty()
  pending: number;
  @ApiProperty()
  partial: number;
  @ApiProperty()
  missed: number;
  @ApiProperty()
  incorrect: number;
  @ApiProperty()
  mark: number;
  @ApiProperty()
  maxMarks: number;
  @ApiProperty({ type: [AttemptTopic] })
  topics: AttemptTopic[];
}

class AttemptSubject {
  @ApiProperty({ type: String })
  _id: Types.ObjectId;
  @ApiProperty()
  name: string;
  @ApiProperty()
  correct: number;
  @ApiProperty()
  missed: number;
  @ApiProperty()
  incorrect: number;
  @ApiProperty()
  pending: number;
  @ApiProperty()
  partial: number;
  @ApiProperty()
  mark: number;
  @ApiProperty()
  speed: number;
  @ApiProperty()
  accuracy: number;
  @ApiProperty()
  maxMarks: number;
  @ApiProperty()
  offscreenTime: number;
  @ApiProperty({ type: [AttemptUnit] })
  units: AttemptUnit[];
}

class Grade {
  _id: string;
  name: string;
}

class PracticeSetInfo {
  @ApiProperty()
  title: string;
  @ApiProperty()
  titleLower: string;
  @ApiProperty({ type: [AttemptUnit] })
  units: AttemptUnit[];
  @ApiProperty({ type: [AttemptSubject] })
  subjects: AttemptSubject[];
  @ApiProperty({ type: String })
  createdBy: Types.ObjectId;
  @ApiProperty()
  accessMode: string;
  @ApiProperty({ type: [String] })
  classRooms: Types.ObjectId[];
  @ApiProperty()
  isAdaptive: boolean;
  @ApiProperty({ type: String })
  adaptiveTest: Types.ObjectId;
  @ApiProperty()
  level: number;
  @ApiProperty({ type: [Grade] })
  grades: [Grade];
}

class FaceDetectionFrame {
  @ApiProperty()
  captured: Date
  @ApiProperty()
  headCount: number;
  @ApiProperty()
  candidate: boolean;
  @ApiProperty()
  image: string;
}

class FaceDetection {
  @ApiProperty({ type: [FaceDetectionFrame] })
  frames: FaceDetectionFrame[];
  @ApiProperty()
  fraud: boolean;
}

class IdentityInfo {
  @ApiProperty()
  imageUrl: string;
  @ApiProperty()
  fileUrl: string;
  @ApiProperty()
  matchedPercentage: number;
}

export class AttemptDTO {
  @ApiProperty({ type: String })
  _id: Types.ObjectId;
  @ApiProperty({ type: String })
  practicesetId: Types.ObjectId;
  @ApiProperty({ type: String })
  user: Types.ObjectId;
  @ApiProperty()
  studentName: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  lastIndex: number;
  @ApiProperty({ type: String })
  attemptdetails: Types.ObjectId;
  @ApiProperty({ type: () => [QA] })
  QA: QA[];
  @ApiProperty()
  idOffline: string;
  @ApiProperty()
  totalQuestions: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  isEvaluated: boolean;
  @ApiProperty()
  partial: number;
  @ApiProperty()
  partiallyAttempted: boolean;
  @ApiProperty()
  isLevelReset: boolean;
  @ApiProperty()
  pending: number;
  @ApiProperty()
  maximumMarks: number;
  @ApiProperty()
  isShowAttempt: boolean;
  @ApiProperty()
  isFraudulent: boolean;
  @ApiProperty()
  markedSuspicious: boolean;
  @ApiProperty()
  isAnsync: boolean;
  @ApiProperty()
  isCratedOffline: boolean;
  @ApiProperty()
  totalMark: number;
  @ApiProperty()
  plusMark: number;
  @ApiProperty()
  minusMark: number;
  @ApiProperty()
  totalMissed: number;
  @ApiProperty()
  totalErrors: number;
  @ApiProperty()
  totalTime: number;
  @ApiProperty()
  totalCorrects: number;
  @ApiProperty()
  isAbandoned: boolean;
  @ApiProperty()
  totalMarkeds: number;
  @ApiProperty({ type: CreatedBy })
  createdBy: CreatedBy;
  @ApiProperty()
  attemptType: string;
  @ApiProperty({ type: [AttemptSubject] })
  subjects: AttemptSubject[];
  @ApiProperty({ type: PracticeSetInfo })
  practiceSetInfo: PracticeSetInfo;
  @ApiProperty()
  offscreenTime: number;
  @ApiProperty({ type: [Date] })
  fraudDetected: Date[];
  @ApiProperty()
  terminated: boolean;
  @ApiProperty()
  resumeCount: number;
  @ApiProperty()
  timeLimitExhaustedCount: number;
  @ApiProperty()
  ongoing: boolean;
  @ApiProperty({ type: FaceDetection })
  face_detection: FaceDetection;
  @ApiProperty({ type: IdentityInfo })
  identityInfo: IdentityInfo;
  @ApiProperty({ type: String })
  referenceId: Types.ObjectId;
  @ApiProperty()
  referenceType: string;
  @ApiProperty()
  referenceData: any;
  @ApiProperty({ type: String })
  location: Types.ObjectId;
}

export class AnsyncAllBody {
  @ApiProperty({ type: () => [AttemptDTO] })
  attempts: AttemptDTO[];
  @ApiProperty({ type: () => [FeedbackItem] })
  feedbacks: FeedbackItem[];
  @ApiProperty({ type: () => [ShareLinkBody] })
  shareLinks: ShareLinkBody[];
}

export class AnsyncAllRequest {
  instancekey: string;
  user: User
  body: AnsyncAllBody;
}

export class AnsyncAllResponse {
  attemptNotAsync: AttemptDTO[];
  attemptAsync: AttemptDTO[];
  feedbackNotAsync: FeedbackItem[];
  feedbackAsync: FeedbackItem[];
}

// Certificates
export class IndexQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
}

export class IndexRequest {
  instancekey: string;
  id: string;
  query: IndexQuery;
}

class Course {
  _id: string;
  title: string;
  certificate: boolean;
  expiresOn: string;
  imageUrl: string;
}

export class Certificate {
  _id: string;
  course: Course;
  issuedCertificate: boolean;
  issuedCertificateDate: string;
}

export class IndexResponse {
  response: Certificate[];
}

export class CreateCertificateBody {
  @ApiProperty()
  course: string;
  @ApiProperty()
  issuedBy: string;
  @ApiProperty()
  issuedTo: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  imageUrl: string;
}

export class CreateCertificateRequest {
  instancekey: string;
  user: User;
  body: CreateCertificateBody;
}

export class CreateCertificateResponse {
  _id: string;
}

export class GetPublicProfileCertificatesRequest {
  instancekey: string;
  id: string;
}

export class GetPublicProfileCertificatesResponse {

}

// Evaluation
export class GetAssignedTestsQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  text: string;
  @ApiProperty({ required: false })
  includeCount: boolean;
}

export class GetAssignedTestsRequest {
  instancekey: string;
  query: GetAssignedTestsQuery;
  user: User;
}

export class GetAssignedTestsResponse { }

export class GetUnassignedTestsQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  text: string;
  @ApiProperty({ required: false })
  includeCount: boolean;
}

export class GetUnassignedTestsRequest {
  instancekey: string;
  user: User;
  query: GetUnassignedTestsQuery;
}

export class GetUnassignedTestsResponse { }

export class FindEvaluatorsQuery {
  @ApiProperty({ required: false })
  name: string;
  @ApiProperty({ required: false, description: 'PracticeSet ID' })
  test: string;
}

export class FindEvaluatorsRequest {
  instancekey: string;
  query: FindEvaluatorsQuery;
  user: User;
}

export class FindEvaluatorsResponse { }

export class GetQuestionsForEvaluationQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false, description: 'true/false' })
  pendingEvaluation: string;
  @ApiProperty({ required: false })
  includeCount: boolean;
}

export class GetQuestionsForEvaluationRequest {
  instancekey: string;
  user: User;
  query: GetQuestionsForEvaluationQuery;
}

export class GetQuestionsForEvaluationResponse { }

export class GetPendingTestsQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  title: string;
  @ApiProperty({ required: false })
  includeCount: boolean;
}

export class GetPendingTestsRequest {
  instancekey: string;
  query: GetPendingTestsQuery;
  user: User;
}

export class ClassRoom {
  _id: string;
  name: string;
}

export class PendingTest {
  _id: string;
  questions: number;
  title: string;
  classRooms: ClassRoom[];
  testMode: string;
}

export class GetPendingTestsResponse {
  tests: PendingTest[];
  count: number;
}

export class GetQuestionEvaluationsByTestQuery {
  @ApiProperty({ required: false })
  attemptId: string;
  @ApiProperty({ required: false })
  system: string;
  @ApiProperty({ required: false })
  isPending: string;
}

export class GetQuestionEvaluationsByTestRequest {
  instancekey: string;
  testId: string;
  user: User;
  query: GetQuestionEvaluationsByTestQuery;
}

export class GetQuestionEvaluationsByTestResponse { }

export class GetStudentsForEvaluationByTestQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  system: string;
  @ApiProperty({ required: false })
  attemptId: string;
  @ApiProperty({ required: false })
  isPending: string;
  @ApiProperty({ required: false })
  searchText: string;
  @ApiProperty({ required: false })
  countInclude: boolean;
}

export class GetStudentsForEvaluationByTestRequest {
  instancekey: string;
  testId: string;
  query: GetStudentsForEvaluationByTestQuery;
  user: User;
}

export class GetStudentsForEvaluationByTestResponse { }

export class StartTestEvaluationQuery {
  @ApiProperty({ required: false })
  system: string;
  @ApiProperty({ required: false })
  attemptId: string;
}

export class StartTestEvaluationRequest {
  instancekey: string;
  testId: string;
  query: StartTestEvaluationQuery;
  user: User;
}

export class StartTestEvaluationResponse { }

export class GetTestEvaluationStatQuery {
  @ApiProperty({ required: false })
  attemptId: string;
  @ApiProperty({ required: false })
  system: string;
}

export class GetTestEvaluationStatRequest {
  instancekey: string;
  testId: string;
  user: User
  query: GetTestEvaluationStatQuery;
}

export class GetTestEvaluationStatResponse { }

export class QuestionEvaluationBody {
  @ApiProperty()
  question: string;
  @ApiProperty()
  status: number;
  @ApiProperty()
  teacherComment: string;
  @ApiProperty()
  marks: number;
  @ApiProperty()
  eId: string;
  @ApiProperty()
  timeSpent: number;
}

export class QuestionEvaluationRequest {
  instancekey: string;
  id: string;
  body: QuestionEvaluationBody;
}

export class QuestionEvaluationResponse { }

export class AssignEvaluatorsBody {
  @ApiProperty()
  evaluators: string[];
}

export class AssignEvaluatorsRequest {
  instancekey: string;
  testId: string;
  body: AssignEvaluatorsBody;
  user: User;
}

export class AssignEvaluatorsResponse { }

export class RemoveEvaluatorsBody {
  @ApiProperty()
  evaluator: string
  @ApiProperty()
  option: string;
  @ApiProperty()
  newEvaluators: string[]
}

export class RemoveEvaluatorsRequest {
  instancekey: string;
  testId: string;
  body: RemoveEvaluatorsBody;
  user: User;

}

export class RemoveEvaluatorsResponse { }


// Favorite
export class FindAllPracticesQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  sort: string;
  @ApiProperty({ required: false })
  title: string;
  @ApiProperty({ required: false })
  publiser: string;
  @ApiProperty({ required: false })
  subject: string;
  @ApiProperty({ required: false })
  grades: string;
}

export class FindAllPracticesRequest {
  instancekey: string;
  query: FindAllPracticesQuery;
  user: User;
}

export class FindAllPracticesResponse { }

export class FindByPracticeRequest {
  instancekey: string;
  practice: string;
  user: User;
}

export class FindByPracticeResponse { }

export class CountByMeQuery {
  @ApiProperty({ required: false })
  title: string;
  @ApiProperty({ required: false })
  publiser: string;
  @ApiProperty({ required: false })
  subject: string;
  @ApiProperty({ required: false })
  grades: string;
}

export class CountByMeRequest {
  instancekey: string;
  user: User;
  query: CountByMeQuery;
}

export class CountByMeResponse { }

export class CreateFavoriteBody {
  @IsMongoId()
  @ApiProperty()
  practiceSetId: string;
}

export class CreateFavoriteRequest {
  instancekey: string;
  user: User;
  body: CreateFavoriteBody;
}

export class CreateFavoriteResponse { }

export class DestroyByUserRequest {
  instancekey: string;
  user: User;
  practiceSet: string;
}

export class DestroyByUserResponse { }

// Feedback
export class FindAllByPracticeQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  rating: string;
  @ApiProperty({ required: false })
  tags: string;
  @ApiProperty({ required: false })
  keywords: string;
}

export class FindAllByPracticeRequest {
  instancekey: string;
  practiceSetId: string;
  query: FindAllByPracticeQuery;
}

export class FindAllByPracticeResponse { }

export class SummaryByMeRequest {
  instancekey: string;
  user: User;
}

export class SummaryByMeResponse { }

export class FindAllByMeQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  rating: string;
  @ApiProperty({ required: false })
  day: number;
  @ApiProperty({ required: false })
  name: string;
  @ApiProperty({ required: false })
  sort: string;
}

export class FindAllByMeRequest {
  instancekey: string;
  query: FindAllByMeQuery;
  user: User;
}

export class FindAllByMeResponse { }

export class GetQuestionFbQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  count: boolean;
}

export class GetQuestionFbRequest {
  instancekey: string;
  query: GetQuestionFbQuery
  user: User;
}

export class GetQuestionFbResponse { }

export class GetTopFeedbacksRequest {
  instancekey: string;
  id: string;
}

export class GetTopFeedbacksResponse { }

export class FeedbackData {
  @ApiProperty({ required: false })
  name: string;
  @ApiProperty({ required: false })
  value: boolean;
}

export class CreateFeedbackBody {
  @ApiProperty({ required: true })
  rating: string;
  @ApiProperty({ required: false })
  @MaxLength(400, { message: 'Comment must be smaller than 4000 characters' })
  comment: string;
  @ApiProperty({ required: true })
  attemptId: string;
  @ApiProperty({ required: true })
  practiceSetId: string;
  @ApiProperty({ required: false })
  owner: string;
  @ApiProperty({ required: false })
  idOffline: string;
  @ApiProperty({ required: false, type: [FeedbackData] })
  feedbacks: FeedbackData[];
}

export class CreateFeedbackRequest {
  instancekey: string;
  token: string;
  user: User;
  body: CreateFeedbackBody;
}

export class CreateFeedbackResponse { }

export class CreateQuestionFeedbackBody {
  @ApiProperty()
  @IsMongoId()
  teacherId: string
  @ApiProperty()
  @IsMongoId()
  attemptId: string
  @ApiProperty()
  @IsMongoId()
  questionId: string
  @ApiProperty()
  @IsMongoId()
  studentId: string
  @ApiProperty()
  practicesetId: string
  @ApiProperty()
  feedbacks: string
  @ApiProperty()
  comment: string
}

export class CreateQuestionFeedbackRequest {
  instancekey: string;
  body: CreateQuestionFeedbackBody;
  user: User;
}

export class CreateQuestionFeedbackResponse { }

export class StudentQ {
  @ApiProperty()
  studentId: string;
  @ApiProperty()
  feedbackId: string;
}

export class TeacherR {
  @ApiProperty()
  comment: string;
}

export class RespondFeedbackBody {
  @ApiProperty({ type: [StudentQ] })
  studentQ: StudentQ[];
  @ApiProperty({ type: TeacherR })
  teacherR: TeacherR;
  @ApiProperty()
  test: string;
  @ApiProperty()
  question: string;
}

export class RespondFeedbackRequest {
  instancekey: string;
  body: RespondFeedbackBody;
  user: User;
}

export class RespondFeedbackResponse { }

// LearningTest
export class GetPracticeSetQuery {
  practiceset: string;
  @ApiProperty({ required: false })
  referenceType: string;
  @ApiProperty({ required: false })
  referenceId: string;
  @ApiProperty({ required: false })
  referenceData: string;
  attempt: Object;
  @ApiProperty({ required: false })
  packageId: string;
}

export class GetPracticeSetRequest {
  instancekey: string;
  id: string;
  user: User;
  query: GetPracticeSetQuery;
}

export class GetPracticeSetResponse { }

export class GetNextQuestionLearningTestBody {
  @ApiProperty()
  testId: string;
  @ApiProperty()
  answers: string[];
  @ApiProperty()
  attempt: string;
  @ApiProperty()
  packageId: string;
  @ApiProperty()
  question: string;
  @ApiProperty()
  index: number;
  @ApiProperty()
  category: string;
  @ApiProperty()
  qSpendTime: number;
  @ApiProperty()
  feedback: string | boolean;
  @ApiProperty()
  scratchPad: string[];
  @ApiProperty()
  finish: boolean;
}

export class GetNextQuestionLearningTestRequest {
  instancekey: string;
  body: GetNextQuestionLearningTestBody;
  query?;
  user: User;
}

export class GetNextQuestionLearningTestResponse {
}

// Session
export class FilterTestListsQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  skip: number;
  @ApiProperty({ required: false })
  sort: string;
  @ApiProperty({ required: true })
  selectedSubjects: string;
  @ApiProperty({ required: false })
  searchText: string;
  @ApiProperty({ required: false })
  tags: string;

}

export class FilterTestListsRequest {
  instancekey: string;
  query: FilterTestListsQuery;
  user: User
}

export class FilterTestListsResponse { }

export class GetSessionsQuery {
  @ApiProperty({ required: false })
  selectedSlot: string;
}

export class GetSessionsRequest {
  instancekey: string;
  query: GetSessionsQuery;
  user: User;
  timezoneoffset: string;
}

export class GetSessionsResponse { }

export class GetSessionByIdRequest {
  instancekey: string;
  session: string;
}

export class GetSessionByIdResponse { }

export class GetSessionDetailsRequest {
  instancekey: string;
  session: string;
}

export class GetSessionDetailsResponse {

}

export class GetPracticesBySessionRequest {
  instancekey: string;
  session: string;
}

export class GetPracticesBySessionResponse {

}

export class GetStudentsByPracticeQuery {
  @ApiProperty({ required: true })
  @IsMongoId()
  practiceId: string;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
}

export class GetStudentsByPracticeRequest {
  instancekey: string;
  session: string;
  query: GetStudentsByPracticeQuery;
}

export class GetStudentsByPracticeResponse {

}

export class UpdateStudentStatusBody {
  @ApiProperty()
  classroom: string;
  @ApiProperty()
  active: string;
  @ApiProperty()
  student: string;
  @ApiProperty()
  isActive: string;
}

export class UpdateStudentStatusRequest {
  instancekey: string;
  body: UpdateStudentStatusBody;
}

export class UpdateStudentStatusResponse { }

export class TestStatusQuery {
  @ApiProperty({ required: true })
  totalTime: number;
}

export class TestStatusRequest {
  instancekey: string;
  practiceId: string;
  query: TestStatusQuery;
}

export class TestStatusResponse { }

export class CreateSessionBody {
  @ApiProperty()
  title: string;
  @ApiProperty()
  practiceIds: string[];
  @ApiProperty()
  startDate: string;
  @ApiProperty()
  deactivateRemainingStudents: boolean;
}

export class CreateSessionRequest {
  instancekey: string;
  body: CreateSessionBody;
  user: User;
}

export class CreateSessionResponse { }

export class UpdateSessionBody {
  @ApiProperty()
  title: string;
  @ApiProperty()
  camera: boolean;
  @ApiProperty()
  plusMark: number;
  @ApiProperty()
  minusMark: number;
  @ApiProperty()
  isMarksLevel: boolean;
  @ApiProperty()
  startTimeAllowance: number;
  @ApiProperty()
  randomQuestions: boolean;
  @ApiProperty()
  randomizeAnswerOptions: boolean;
  @ApiProperty()
  requireAttendance: boolean;
  @ApiProperty()
  autoEvaluation: boolean;
  @ApiProperty()
  isShowAttempt: boolean;
  @ApiProperty()
  isShowResult: boolean;
  @ApiProperty()
  allowTeacher: boolean;
  @ApiProperty()
  showFeedback: boolean;
  @ApiProperty()
  offscreenLimit: number;
  @ApiProperty()
  attemptAllowed: number;
  @ApiProperty()
  startDate: string;
  @ApiProperty()
  totalTime: number;
  @ApiProperty()
  practiceIds: string[];
  @ApiProperty()
  deactivateRemainingStudents: boolean;
}

export class UpdateSessionRequest {
  id: string;
  instancekey: string;
  body: UpdateSessionBody;
  user: User;
}

export class UpdateSessionResponse { }

// Mapping
export class VideoForPracticeSetRequest {
  instancekey: string;
}

export class VideoForPracticeSetResponse { }

// Test Series
export class FindQuery {
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  subject: string;
  @ApiProperty({ required: false })
  accessMode: string;
  @ApiProperty({ required: false })
  level: string;
  @ApiProperty({ required: false })
  author: string;
  @ApiProperty({ required: false })
  price: string;
  @ApiProperty({ required: false })
  status: string;
  @ApiProperty({ required: false })
  title: string;
  @ApiProperty({ required: false })
  includeCount: boolean;
  @ApiProperty({ required: false })
  countStudent: boolean;
  @ApiProperty({ required: false })
  countQuestion: boolean;
}

export class FindRequest {
  instancekey: string;
  query: FindQuery;
  user: User;
  ip: string;
}

export class FindResponse { }

export class GetPublicListingQuery {
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  skip: number;
  @ApiProperty({ required: false })
  count: boolean;
}

export class GetPublicListingRequest {
  instancekey: string;
  query: GetPublicListingQuery;
  ip: string;
}

export class GetPublicListingResponse { }

export class SummaryTestseriesRequest {
  instancekey: string;
  user: User;
  id: string;
  ip: string;
}

export class SummaryTestseriesResponse { }

export class GetAttemptedTestsOfTestseriesRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class GetAttemptedTestsOfTestseriesResponse { }

export class GetTestseriesPublicRequest {
  instancekey: string;
  id: string;
  user: User;
  ip: string;
}

export class GetTestseriesPublicResponse { }

export class SummaryPackagesQuery {
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  accessMode: string;
  @ApiProperty({ required: false })
  keywords: string;
  @ApiProperty({ required: false })
  level: number;
  @ApiProperty({ required: false })
  price: string;
  @ApiProperty({ required: false })
  author: string;
  @ApiProperty({ required: false })
  name: string;
  @ApiProperty({ required: false })
  subject: string[];
  @ApiProperty({ required: false })
  count: boolean;
  @ApiProperty({ required: false })
  enrolled: boolean;
  @ApiProperty({ required: false })
  home: boolean;
}

export class SummaryPackagesRequest {
  query: SummaryPackagesQuery;
  user: User;
  instancekey: string;
  ip: string;
}

export class SummaryPackagesResponse { }

export class CountPackagesQuery {
  @ApiProperty({ required: false })
  accessMode: string;
  @ApiProperty({ required: false })
  keywords: string;
  @ApiProperty({ required: false })
  level: number;
  @ApiProperty({ required: false })
  price: string;
  @ApiProperty({ required: false })
  author: string;
  @ApiProperty({ required: false })
  name: string;
  @ApiProperty({ required: false })
  subject: string;
  @ApiProperty({ required: false })
  cart: string;
}

export class CountPackagesRequest {
  instancekey: string;
  query: CountPackagesQuery;
  user: User;
}

export class CountPackagesResponse { }

export class SummaryPackagesByStudentQuery {
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  accessMode: string;
  @ApiProperty({ required: false })
  keywords: string;
  @ApiProperty({ required: false })
  level: number;
  @ApiProperty({ required: false })
  price: string;
  @ApiProperty({ required: false })
  author: string;
  @ApiProperty({ required: false })
  name: string;
  @ApiProperty({ required: false })
  subject: string[];
  @ApiProperty({ required: false })
  cart: string;
  @ApiProperty({ required: false })
  count: boolean;
  @ApiProperty({ required: false })
  enrolled: boolean;
  @ApiProperty({ required: false })
  home: boolean;
}

export class SummaryPackagesByStudentRequest {
  instancekey: string;
  user: User;
  query: SummaryPackagesByStudentQuery;
  ip: string;
}

export class SummaryPackagesByStudentResponse { }

export class RecommendedTestSeriesQuery {
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  subjects: string;
  @ApiProperty({ required: false })
  searchText: string;
  @ApiProperty({ required: false })
  cart: string;
}

export class RecommendedTestSeriesRequest {
  instancekey: string;
  user: User;
  query: RecommendedTestSeriesQuery;
  ip: string;
}

export class RecommendedTestSeriesResponse { }

export class BoughtTestSeriesByOthersQuery {
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  page: number;
}

export class BoughtTestSeriesByOthersRequest {
  instancekey: string;
  query: BoughtTestSeriesByOthersQuery;
  user: User;
  ip: string;
}

export class BoughtTestSeriesByOthersResponse { }

export class GetMyTestSeriesQuery {
  @ApiProperty({ required: false })
  attemptCount: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  user: string;
}

export class GetMyTestSeriesRequest {
  instancekey: string;
  query: GetMyTestSeriesQuery;
  user: User;
}

export class GetMyTestSeriesResponse { }

export class GetAuthorsRequest {
  instancekey: string;
  user: User;
}

export class GetAuthorsResponse {

}

export class GetSubjectsQuery {
  @ApiProperty({ required: false })
  title: string;
}

export class GetSubjectsRequest {
  instancekey: string;
  user: User;
  query: GetSubjectsQuery;
}

export class GetSubjectsResponse { }

export class GetTeacherMostPopularQuery {
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  mode: string;
  @ApiProperty({ required: false })
  title: string;
}

export class GetTeacherMostPopularRequest {
  instancekey: string;
  query: GetTeacherMostPopularQuery;
  user: User;
  ip: string;
}

export class GetTeacherMostPopularResponse { }

export class GetTeacherHighestPaidQuery {
  @ApiProperty({ required: false })
  limit: number;
}

export class GetTeacherHighestPaidRequest {
  instancekey: string;
  query: GetTeacherHighestPaidQuery
  user: User;
  ip: string;
}

export class GetTeacherHighestPaidResponse { }

export class TeacherSummaryTestseriesRequest {
  instancekey: string;
  id: string;
  ip: string;
  user: User;
}

export class TeacherSummaryTestseriesResponse { }

export class LevelStatusOfPackageQuery {
  @ApiProperty({ required: false })
  currnetLevel: string;
}

export class LevelStatusOfPackageRequest {
  instancekey: string;
  id: string;
  query: LevelStatusOfPackageQuery;
  user: User;
}

export class LevelStatusOfPackageResponse { }

export class PackageHasLevelRequest {
  instancekey: string;
  id: string;
}

export class PackageHasLevelResponse { }

export class GetOngoingClassesRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class GetOngoingClassesResponse { }

export class SummaryPackagesByTeacherQuery {
  @ApiProperty({ required: false })
  multiStatus: string;
  @ApiProperty({ required: false })
  name: string;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  grades: string;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  sort: string;
}

export class SummaryPackagesByTeacherRequest {
  instancekey: string;
  user: User;
  query: SummaryPackagesByTeacherQuery;
}

export class SummaryPackagesByTeacherResponse { }

export class TeacherCountPackagesQuery {
  @ApiProperty({ required: false })
  multiStatus: string;
  @ApiProperty({ required: false })
  name: string;
  @ApiProperty({ required: false })
  grades: string;
}

export class TeacherCountPackagesRequest {
  instancekey: string;
  user: User;
  query: TeacherCountPackagesQuery;
}

export class TeacherCountPackagesResponse { }

export class GetPackageAttemptCountQuery {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  practice: string;
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  testSeries: string;
}

export class GetPackageAttemptCountRequest {
  instancekey: string;
  query: GetPackageAttemptCountQuery;
  user: User;
}

export class GetPackageAttemptCountResponse {
}

export class GetTestByPracticeRequest {
  instancekey: string;
  practice: string;
}

export class GetTestByPracticeResponse { }

export class GetTotalStudentRequest {
  instancekey: string;
  id: string;
}

export class GetTotalStudentResponse { }

export class GetFavoriteTsQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
}
export class GetFavoriteTsRequest {
  instancekey: string;
  user: User;
  ip: string;
  query: GetFavoriteTsQuery;

}

export class GetFavoriteTsResponse { }

export class GetPublisherTestseriesQuery {
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  skip: number;
  @ApiProperty({ required: false })
  title: string;
  @ApiProperty({ required: false })
  count: boolean;
}

export class GetPublisherTestseriesRequest {
  instancekey: string;
  query: GetPublisherTestseriesQuery;
  user: User;
}

export class GetPublisherTestseriesResponse { }

export class TestSeriesSubject {
  @ApiProperty()
  _id: Types.ObjectId;
  @ApiProperty()
  name: string;
}

export class CreateTestseriesBody {
  @ApiProperty()
  title: string;
  @ApiProperty({ type: [TestSeriesSubject] })
  subjects: TestSeriesSubject[];
  @ApiProperty()
  summary: string;
  @ApiProperty()
  imageUrl: string;
}

export class CreateTestseriesRequest {
  instancekey: string;
  body: CreateTestseriesBody;
  user: User;
}

export class CreateTestseriesResponse { }

export class AddFavoriteRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class AddFavoriteResponse { }

export class PublishRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class PublishResponse { }

export class RevokeRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class RevokeResponse { }

export class AddTestBody {
  @ApiProperty()
  testId: string;
}

export class AddTestRequest {
  instancekey: string;
  id: string;
  user: User;
  body: AddTestBody;
}

export class AddTestResponse { }

export class RemoveTestBody {
  @ApiProperty()
  testId: string;
}

export class RemoveTestRequest {
  instancekey: string;
  id: string;
  user: User;
  body: RemoveTestBody;
}

export class RemoveTestResponse { }

export class UpdateTestOrderBody {
  @ApiProperty()
  test: string;
  @ApiProperty()
  order: number;
}

export class UpdateTestOrderRequest {
  instancekey: string;
  id: string;
  body: UpdateTestOrderBody;
}

export class UpdateTestOrderResponse { }

export class RemoveClassroomBody {
  @ApiProperty()
  classroom: string;
}

export class RemoveClassroomRequest {
  instancekey: string;
  id: string;
  body: RemoveClassroomBody;
}

export class RemoveClassroomResponse { }

export class UpdateTestseriesBody {
  @ApiProperty()
  enabledCodeLang: string[];
  @ApiProperty()
  practiceIds: string[];
  @ApiProperty()
  classrooms: string[];
  @ApiProperty()
  status: string;
  @ApiProperty()
  accessMode: string;
}

export class UpdateTestseriesRequest {
  instancekey: string;
  id: string;
  body: UpdateTestseriesBody;
  user: User;
}

export class UpdateTestseriesResponse { }

export class RemoveFavoriteRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class RemoveFavoriteResponse {
  status: string;
}

export class DeleteTestseriesRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class DeleteTestseriesResponse {
}

export class GetStudentRankRequest {
  instancekey: string;
  id: string;
}

export class GetStudentRankResponse { }

export class PercentCompleteTestseriesQuery {
  @ApiProperty({ required: false })
  limit: number;
}

export class PercentCompleteTestseriesRequest {
  instancekey: string;
  id: string;
  query: PercentCompleteTestseriesQuery;
  user: User;
}

export class PercentCompleteTestseriesResponse { }

export class PercentAccuracyTestseriesQuery {
  @ApiProperty({ required: false })
  daysLimit: number;
  @ApiProperty({ required: false })
  userOnly: boolean;
}

export class PercentAccuracyTestseriesRequest {
  instancekey: string;
  id: string;
  query: PercentAccuracyTestseriesQuery;
  user: User;
}

export class PercentAccuracyTestseriesResponse { }

export class PracticeHoursTestSeriesQuery {
  @ApiProperty({ required: false })
  daysLimit: number;
  @ApiProperty({ required: false })
  userOnly: boolean;
  @ApiProperty({ required: false })
  limit: number;
}

export class PracticeHoursTestSeriesRequest {
  instancekey: string;
  id: string;
  query: PracticeHoursTestSeriesQuery;
  user: User;
}

export class PracticeHoursTestSeriesResponse { }

export class AssesmentWiseMarksTestSeriesRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class AssesmentWiseMarksTestSeriesResponse {

}

export class QuestionCategoryTestSeriesRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class QuestionCategoryTestSeriesResponse { }

export class SubjectWiseMarksTestSeriesRequest {
  instancekey: string;
  id: string;
  user: User;
}

export class SubjectWiseMarksTestSeriesResponse { }

export class SearchForMarketPlaceQuery {
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  title: string;
}

export class SearchForMarketPlaceRequest {
  instancekey: string;
  query: SearchForMarketPlaceQuery;
}

export class SearchForMarketPlaceResponse { }

export class GetBestSellerQuery {
  page: number;
  limit: number;
  title: string;
}

export class GetBestSellerRequest {
  instancekey: string;
  user: User;
  query: GetBestSellerQuery;
  ip: string;
}

export class GetBestSellerResponse {

}