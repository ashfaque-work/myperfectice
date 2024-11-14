import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Role } from '../enums';
import { Types } from 'mongoose';
import { IsEmailOrPhoneNumber, IsNotDisposableEmail, IsOfAge } from '../decorators';
import { Type } from 'class-transformer';

export class UserDto {
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
  practiceViews: Types.ObjectId[];
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

export class UserCountry {
  code: string;
  name: string;
  currency: string;
  confirmed: boolean;
  callingCodes: string[];
}

export class user {
  userid: string;
  email: string;
}

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

export class Country {
  @ApiProperty()
  name?: string;
  @ApiProperty()
  code?: string;
  @ApiProperty()
  confirmed?: boolean;
  @ApiProperty()
  callingCodes?: string[];
  @ApiProperty()
  currency?: string;
}

class DossierUserInfo {
  @ApiProperty({ type: String })
  user: Types.ObjectId;
  @ApiProperty()
  name: string;
}

class Note {
  @ApiProperty()
  version: number;
  @ApiProperty()
  comment: string;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  type: string;
  @ApiProperty({ type: () => DossierUserInfo })
  userInfo: DossierUserInfo;
}

class Feedback {
  @ApiProperty()
  comment: string;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  type: string;
  @ApiProperty({ type: () => DossierUserInfo })
  userInfo: DossierUserInfo;
}
class IdentityInfo {
  @ApiProperty()
  imageUrl: string;
  @ApiProperty()
  fileUrl: string;
  @ApiProperty()
  matchedPercentage: number;
}

class MentorInfo {
  @ApiProperty({ type: String })
  user: Types.ObjectId;

  @ApiProperty()
  name: string;
}

export class ReqUser {
  _id?: any;
  name?: string;
  email?: string;
  emailVerified?: boolean;
  status?: boolean;
  isActive?: boolean;
  roles: string[];
  dossier?: Dossier;
  @ApiProperty()
  userId?: string;
  avatar?: Avatar;
  avatarSM?: Avatar;
  avatarMD?: Avatar;
  phoneNumber?: string;
  phoneNumberFull?: string;
  isPublic?: boolean;
  allowOnlineClass?: boolean;
  profileCompleted?: number;
  trainingProfileCompleted?: number;
  @ApiProperty({ type: Country })
  country?: Country;
  city?: string;
  ref?: Types.ObjectId;
  gender?: string;
  state?: string;
  programs?: string[];
  subjects?: Types.ObjectId[];
  locations?: Types.ObjectId[];
  managerStudent?: boolean;
  managerPractice?: boolean;
  practiceViews?: Types.ObjectId[];
  practiceAttempted?: Types.ObjectId[];
  emailStudents?: string[];
  lastLogin?: Date;
  lastAttempt?: Date;
  theme?: string;
  birthdate?: Date;
  streamUrl?: string;
  instagram?: Object;
  studentExclusive?: boolean;
  activeLocation?: Types.ObjectId;
  registrationNo?: string;
  expertise?: string;
  forcePasswordReset?: boolean;
  institute?: string;
  district?: string;
  pin?: number;
  street?: string;
  interest?: string;
  knowAboutUs?: string;
  about?: string;
  openAI?: string;
  interestedSubject?: string[];
  specialization?: string[];
  preferences?: Preference;
  experiences?: Experience[];
  whiteboard?: boolean;
  liveboard?: boolean;
  canCreateMultiLocations?: boolean;
  coverImageUrl?: string;
  isVerified?: boolean;
  isMentor?: boolean;
  blockedUsers?: any[];
  optoutDate?: Date;
  ambassador?: boolean;
  onboarding?: boolean;
  optoutReason?: string;
  optoutEmail?: boolean;
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  programmingLang?: ProgrammingLang[];
  educationDetails?: EducationDetail[];
  entranceExam?: EntranceExam[];
  academicProjects?: AcademicProject[];
  trainingCertifications?: TrainingCertification[];
  industryCertificates?: IndustryCertificate[];
  externalAssessment?: ExternalAssessment[];
  awardsAndRecognition?: AwardAndRecognition[];
  extraCurricularActivities?: ExtraCurricularActivity[];
  packageSchedules?: PackageSchedule[];
  @ApiProperty({ type: IdentityInfo })
  identityInfo?: IdentityInfo;
  codingExperience?: string;
  levelHistory?: LevelHistory[];
  passingYear?: string;
  provider?: string;
  emailVerifyToken?: string;
  emailVerifyExpired?: Date;
  rollNumber?: string;
  loginCount?: number;
  designation?: string;
  followings?: string[];
  passwordResetToken?: string;
  followers?: string[];
  instituteUrl?: string;
  placementStatus?: string;
  videoResume?: string;
  coreBranch?: string;
  mentorInfo?: MentorInfo;
  token?: string;
  isTempt: boolean;
}

enum DossierStatus {
  draft = 'draft',
  rejected = 'rejected',
  pending = 'pending',
  approved = 'approved',
}

export class Dossier {
  @ApiProperty()
  @IsEnum(['draft', 'rejected', 'pending', 'approved'])
  status: 'draft' | 'rejected' | 'pending' | 'approved';
  @ApiProperty()
  statusChangedAt: Date;
  @ApiProperty({ type: () => [Note] })
  notes: Note[];
  @ApiProperty({ type: () => [Feedback] })
  feedback: Feedback[];
}

class EducationDetail {
  @ApiProperty()
  educationType: string;
  @ApiProperty()
  board: string;
  @ApiProperty()
  marksType: string;
  @ApiProperty()
  marks: number;
  @ApiProperty()
  passingYear: number;
  @ApiProperty()
  stream: string;
}

class EntranceExam {
  year: string;
  rank: number;
  name: string;
}

class AcademicProject {
  name: string;
  groupSize: string;
  description: string;
  startDate: Date;
  endDate: Date;
  document: string;
  url: string;
  sysgen: boolean;
}

class TrainingCertification {
  type: string;
  provider: string;
  city: string;
  state: string;
  startDate: Date;
  endDate: Date;
  expiredDate: Date;
  certificate?: string;
  url?: string;
  description: string;
  sysgen: boolean;
}

class IndustryCertificate {
  name: string;
  provider: string;
  certificateDate: Date;
  expiredDate: Date;
  certificate: string;
  url?: string;
  sysgen: boolean;
}

class ExternalAssessment {
  name: string;
  mostRecentScore: number;
  yearOfAssessment: number;
  maximumScore: number;
}

class AwardAndRecognition {
  awardDetails: string;
  date: Date;
}

class ExtraCurricularActivity {
  activityDetails: string;
  startDate: Date;
  endDate: Date;
}

class PackageSchedule {
  package: Types.ObjectId;
  code: string;
}

class Experience {
  title: string;
  employmentType: string;
  company: string;
  location: string;
  currentlyWorking: boolean;
  startDate: Date;
  endDate: Date;
  description: string;
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

class LevelHistory {
  subjectId: Types.ObjectId;
  level: number;
  updateDate: Date;
}

class ProgrammingLang {
  name: string;
  rating: number;
  description: string
}

export interface GetUserRequest {
  instancekey: string;
  _id: string;
}

export class GetUserResponse {
  _id?: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  status?: boolean;
  isActive?: boolean;
  roles: string[];
  dossier?: Dossier;
  userId?: string;
  avatar?: Avatar;
  avatarSM?: Avatar;
  avatarMD?: Avatar;
  phoneNumber?: string;
  phoneNumberFull?: string;
  isPublic?: boolean;
  allowOnlineClass?: boolean;
  profileCompleted?: number;
  trainingProfileCompleted?: number;
  country?: Country;
  city?: string;
  ref?: Types.ObjectId;
  gender?: string;
  state?: string;
  programs?: string[];
  subjects?: string[];
  locations?: string[];
  grade?: string[];
  managerStudent?: boolean;
  managerPractice?: boolean;
  practiceViews?: string[];
  practiceAttempted?: string[];
  emailStudents?: string[];
  lastLogin?: Date;
  lastAttempt?: Date;
  theme?: string;
  birthdate?: Date;
  streamUrl?: string;
  instagram?: string;
  studentExclusive?: boolean;
  activeLocation?: string;
  registrationNo?: string;
  expertise?: string;
  forcePasswordReset?: boolean;
  institute?: string;
  district?: string;
  pin?: number;
  street?: string;
  interest?: string;
  knowAboutUs?: string;
  about?: string;
  openAI?: string;
  interestedSubject?: string[];
  specialization?: string[];
  preferences?: Preference;
  experiences?: Experience[];
  whiteboard?: boolean;
  liveboard?: boolean;
  canCreateMultiLocations?: boolean;
  isVerified?: boolean;
  isMentor?: boolean;
  blockedUsers?: any[];
  optoutDate?: Date;
  ambassador?: boolean;
  onboarding?: boolean;
  optoutReason?: string;
  optoutEmail?: boolean;
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  programmingLang?: ProgrammingLang[];
  educationDetails?: EducationDetail[];
  entranceExam?: EntranceExam[];
  academicProjects?: AcademicProject[];
  trainingCertifications?: TrainingCertification[];
  industryCertificates?: IndustryCertificate[];
  externalAssessment?: ExternalAssessment[];
  awardsAndRecognition?: AwardAndRecognition[];
  extraCurricularActivities?: ExtraCurricularActivity[];
  packageSchedules?: PackageSchedule[];
  identityInfo?: IdentityInfo;
  codingExperience?: string;
  levelHistory?: LevelHistory[];
  passingYear?: number;
  provider?: string;
  emailVerifyToken?: string;
  emailVerifyExpired?: Date;
  rollNumber?: string;
  loginCount?: number;
  designation?: string;
  followings?: string[];
  passwordResetToken?: string;
  followers?: string[];
  instituteUrl?: string;
  placementStatus?: string;
  videoResume?: string;
  coreBranch?: string;
  mentorInfo?: MentorInfo;
}

export class CreateUserDto {
  instancekey: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsEmailOrPhoneNumber()
  @IsNotDisposableEmail()
  userId: string;
  @ApiProperty()
  email: string;
  phoneNumber: string;
  phoneNumberFull?: string;
  @ApiProperty()
  @IsString()
  @Length(8, 20)
  password: string;
  newPassword?: boolean;
  @ApiProperty()
  @IsOptional()
  @IsString()
  tempPassword?: string;
  @IsEnum(Role, { each: true, message: "Provide correct roles" })
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  userRoles: string[];
  roles: string[];
  @ApiProperty({ required: false, type: String })
  @IsOfAge()
  @IsOptional()
  birthdate?: Date;
  @ApiProperty()
  name: string;
  @ApiProperty()
  @IsOptional()
  locations?: Types.ObjectId[];
  @ApiProperty()
  @IsOptional()
  seqCode?: string;
  @ApiProperty()
  @IsOptional()
  programs?: string[];
  @ApiProperty({ type: Country })
  @IsOptional()
  country?: Country;
  @ApiProperty()
  @IsOptional()
  subjects?: Types.ObjectId[];
  @ApiProperty({ type: Avatar })
  avatar?: Avatar;
  avatarUrl?: string;
  avatarUrlSM?: string;
  provider?: string;
  isMentor?: boolean;
  passingYear?: string;
  emailVerifyToken?: string;
  emailVerifyExpired?: Date;
  isVerified?: boolean;
  whiteboard?: boolean;
  liveboard?: boolean;
  @ApiProperty()
  @IsOptional()
  joiningInstitute?: boolean;
  @ApiProperty()
  @IsOptional()
  instituteId?: string;
  ip?: string;
  user?: ReqUser;
  userid?: string;
  emailVerified?: boolean;
  forcePasswordReset?: boolean;
  createdBy?: Types.ObjectId;
  activeLocation?: Types.ObjectId;
  onboarding?: boolean;
}
export class CreateUserResponse { response: string }

export class UpdateUserBody {
  @ValidateIf(o => o.name != undefined)
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z]+$/, { message: 'Name must be alphabets' })
  name: string;

  @ApiProperty()
  rollNumber: string;

  @ApiProperty()
  registrationNo?: string;

  @ApiProperty()
  avatarUrl?: string;

  @ApiProperty({ type: Avatar })
  avatar?: Avatar;

  @ApiProperty()
  avatarUrlSM?: string;

  @ApiProperty()
  passingYear?: string;

  @ApiProperty({ type: Country })
  @IsNotEmpty({ message: "Country is be required" })
  country: Country;

  @ApiProperty()
  @ValidateIf(o => o.birthdate !== undefined)
  @IsOfAge()
  birthdate?: Date;

  @ApiProperty()
  @MaxLength(100, { message: "City name must be smaller than 100 characters" })
  @IsOptional()
  city?: string;

  @ApiProperty()
  state?: string;

  @ApiProperty()
  isVerified?: boolean;

  @ApiProperty()
  whiteboard?: boolean;

  @ApiProperty()
  @IsArray({ message: "Subjects must be array." })
  subjects?: Types.ObjectId[];

  @ApiProperty()
  @ValidateIf(o => o.newUserId !== undefined)
  @IsEmailOrPhoneNumber()
  newUserId?: string;

  @ValidateIf(o => o.userRoles !== undefined)
  @IsEnum(Role, { each: true, message: "Provide correct roles" })
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  userRoles?: string[];

  @ApiProperty()
  forcePasswordReset?: boolean;

  @ApiProperty({ enum: ["placed", "optedOut", "locked", "placementReady", "unqualified"] })
  placementStatus?: string;

  @ApiProperty()
  @ValidateIf(o => o.password !== undefined)
  @Length(8, 20)
  password?: string;

  @ApiProperty()
  liveboard?: boolean;

  @ApiProperty()
  locations: Types.ObjectId[];
}

export class UpdateUserDto {
  instancekey: string;
  _id: string;
  body: UpdateUserBody;
  user: UserDto;
  timezoneoffset: string;
  token: string;
}

export class ChangePasswordBody {
  @ApiProperty()
  @IsNotEmpty({ message: 'Old Password is required' })
  @MaxLength(20, { message: "Old Password must be smaller than 20 characters" })
  oldPassword: string;
  @ApiProperty()
  @IsNotEmpty({ message: 'New Password is required' })
  @MaxLength(20, { message: "New Password must be smaller than 20 characters" })
  newPassword: string;
}

export class ChangePasswordReq {
  instancekey: string;
  token: string;
  timezoneoffset: string;
  user: ReqUser;
  body: ChangePasswordBody;
}

export class ChangePasswordRes {
  status: string;
}

export class ChangeNewPasswordBody {
  @ApiProperty()
  @IsNotEmpty({ message: 'New Password is required' })
  @MaxLength(20, { message: "New Password must be smaller than 20 characters" })
  newPassword: string;
  @ApiProperty()
  refresh: boolean;
}

export class ChangeNewPasswordQuery {
  @ApiProperty({ required: false })
  remember: boolean
}

export class ChangeNewPasswordHeaders {
  userAgent: string;
}

export class ChangeNewPasswordReq {
  instancekey: string;
  token: string;
  id: string;
  body: ChangeNewPasswordBody;
  timezoneoffset: string;
  ip: string;
  headers: ChangeNewPasswordHeaders;
  query: ChangeNewPasswordQuery;
}

export class ChangeNewPasswordRes {
  status: string;
  user: GetUserResponse;
}



export class DossierStatusUpdateReqDto {
  _id?: string;

  @ApiProperty({ type: () => MentorInfo })
  mentorInfo: MentorInfo;

  @ApiProperty({ type: () => Dossier })
  dossier: Dossier;
}

export class DossierStatusUpdateResDto {
  dossier: Dossier;
}

export class UpdateDossierCommentsReqDto {
  _id: string;
  @ApiProperty({ type: () => Feedback })
  feedback: Feedback;
}

export class UpdateDossierCommentsResDto {
  @ApiProperty({ type: GetUserResponse })
  response: GetUserResponse;
}

export class UpdateUserStatusReq {
  _id: string;
  @ApiProperty()
  isActive: boolean;
}

export class UpdateUserStatusRes {
  response: string;
}

export class SendForReviewDossierReq {
  _id: string;
  @ApiProperty({ type: Note })
  notes: Note;
}

export class SendForReviewDossierRes {
  @ApiProperty({ type: GetUserResponse })
  response: GetUserResponse;
}

export class BlockuserReq {
  userid: Types.ObjectId;
  @ApiProperty()
  user: string;
}

export class BlockuserRes {
  response: string;
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

export class AddLocationReq {
  @ApiProperty()
  name: string;
  userid: Types.ObjectId;
}

export class AddLocationRes {
  @ApiProperty({ type: Location })
  response: Location;
}

export class EditLocationReq {
  _id: string;
  @ApiProperty()
  name: string;
}

export class EditLocationRes {
  @ApiProperty({ type: Location })
  response: Location;
}

export class AddSubjectsReq {
  userid: string;
  @ApiProperty({ type: [String], required: true })
  subjects: string[];
}

export class AddSubjectsRes {
  response: string;
}

export class UpdateUserCountryReq {
  _id: string;
  @ApiProperty()
  email?: string;

  @ApiProperty()
  @ValidateIf(o => o.phoneNumber !== undefined)
  @Length(10)
  phoneNumber?: string;

  @ValidateIf(o => o.name != undefined)
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  rollNumber: string;

  @ApiProperty()
  registrationNo?: string;

  @ApiProperty()
  avatarUrl?: string;

  @ApiProperty({ type: Avatar })
  avatar?: Avatar;

  @ApiProperty()
  avatarUrlSM?: string;

  @ApiProperty()
  avatarSM?: Avatar;

  @ApiProperty()
  avatarMD?: Avatar;

  @ApiProperty({ type: () => Dossier })
  dossier?: Dossier;

  @ApiProperty()
  passingYear?: string;
  userId?: string;

  @ApiProperty({ type: Country })
  country: Country;

  @ApiProperty()
  ref?: Types.ObjectId;

  @ApiProperty()
  @ValidateIf(o => o.birthdate !== undefined)
  @IsOfAge()
  birthdate?: Date;

  @ApiProperty()
  gender?: string;

  @ApiProperty()
  district?: string;

  @ApiProperty()
  interest?: string;

  @ApiProperty()
  knowAboutUs?: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state?: string;

  @ApiProperty()
  isVerified?: boolean;

  @ApiProperty()
  whiteboard?: boolean;

  @ApiProperty()
  provider?: string;

  @ApiProperty()
  subjects?: Types.ObjectId[];

  @ApiProperty()
  @ValidateIf(o => o.newUserId !== undefined)
  @IsEmailOrPhoneNumber()
  newUserId?: string;

  @ValidateIf(o => o.userRoles !== undefined)
  @IsEnum(Role, { each: true, message: "Provide correct roles" })
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  userRoles?: string[];

  @ApiProperty()
  forcePasswordReset?: boolean;

  @ApiProperty({ enum: ["placed", "optedOut", "locked", "placementReady", "unqualified"] })
  placementStatus?: string;

  @ApiProperty()
  @ValidateIf(o => o.password !== undefined)
  @Length(8, 20)
  password?: string;

  @ApiProperty()
  liveboard?: boolean;

  @ApiProperty()
  locations: Types.ObjectId[];
}
export class UpdateUserCountryRes extends UpdateUserCountryReq { }
export class UpdateUserResponse extends UpdateUserDto { }

export class ReportUserReq {
  @ApiProperty()
  @IsMongoId()
  userId: string;

  @ApiProperty()
  reason: string;

  user: ReqUser;
}

export class ReportUserRes {
  response: string;
}

export class UnblockUserReq {
  @ApiProperty()
  @IsMongoId()
  userId: string;
  user: ReqUser;
}

export class UnblockUserRes {
  @ApiProperty()
  response: string;
}

export class PartnerUserBody {
  @ApiProperty()
  examSeriesCode: string;
  @ApiProperty()
  testCode: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  clientId: string;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  clientCandidateID: string;
  @ApiProperty()
  clientAuthorizationID: string;
  @ApiProperty()
  registrationNo: string;
  @ApiProperty()
  token: string;
}

export class PartnerUserReq {
  instancekey: string;
  body: PartnerUserBody;
}

export class Practice {
  _id: string;
  title: string;
  titleLower: string;
  slugfly: string;
}

export class PartnerUserRes {
  token: string;
  practice: Practice;
}

export class UpdateUtmStatusReq {
  @ApiProperty()
  utmId: string;
  user: ReqUser
}

export class UpdateUtmStatusRes {
  response: string;
}

class VisitUrl {
  @ApiProperty()
  url: string;
  @ApiProperty()
  date: Date;
}

class MarketingUtm {
  @ApiProperty({ required: true })
  source: string;
  @ApiProperty({ required: true })
  medium: string;
  @ApiProperty({ required: true })
  campaign: string;
  @ApiProperty({ type: [VisitUrl] })
  visitingUrls: Array<VisitUrl>;
  @ApiProperty()
  user: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  signupDate: Date;
  @ApiProperty()
  ip: string;
  @ApiProperty()
  location: string;
  @ApiProperty()
  savedUtm?: string;
  @ApiProperty()
  url: string;
}

export class AddUtmVisitorReq {
  @ApiProperty()
  body: MarketingUtm;
  ip: string;
  user: ReqUser;
}

export class AddUtmVisitorRes {
  response: string;
}

class Session {
  @ApiProperty()
  selectedSlot: Date;
  @ApiProperty()
  classrooms: string;
  @ApiProperty()
  users: string;
  @ApiProperty()
  setting: string;
  @ApiProperty()
  tests: string;
}

class PracticeSession {
  @ApiProperty()
  classRooms: string;
}

export class ManageSessionBody {
  @ApiProperty()
  session: Session;
  @ApiProperty()
  practice: PracticeSession;
  @ApiProperty()
  isActive: boolean;
}

export class ManageSessionReq {
  instancekey: string;
  @ApiProperty()
  body: ManageSessionBody;
}

export class ManageSessionRes {
  response: string;
}

export class InviteUsersReq {
  @ApiProperty()
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];

  instancekey: string;
  user: ReqUser;
}

export class InviteUsersRes {
  response: string;
}

export class UpdateSubjectsReq {
  @ApiProperty()
  subjects: string[];
  @ApiProperty()
  country: string;
  user: ReqUser;
  instancekey: string;
}

export class UpdateSubjectsRes {
  response: string;
}

export class UpdateOptionsDataReq {
  @ApiProperty()
  body: GetUserResponse;
}

class AddStudentParam {
  @ApiProperty()
  seqCode: string;
}

class AddStudentQuery {
  @ApiProperty()
  testCode: string;
  @ApiProperty()
  subjects: string;
}

export class AddStudentInClassroomReq {
  @ApiProperty()
  params: AddStudentParam;
  @ApiProperty()
  query: AddStudentQuery;
  user: ReqUser;
  instancekey: string;
}

export class AddStudentInClassroomRes {
  response: string;
}

export class EmployabilityIndexReq {
  user: ReqUser;
  instancekey: string;
}

export class EmployabilityIndexRes {
  response: string;
}

export class PsychoIndexReq {
  user: ReqUser;
  instancekey: string;
}

export class PsychoIndexRes {
  response: string;
}

export class SocialLoginParams {
  provider: string;
}


export class SocialLoginBodyUser {
  @ApiProperty({ description: "facebook Id" })
  id: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  givenName: string;
  @ApiProperty()
  familyName: string;
  @ApiProperty()
  gender: string;
  @ApiProperty()
  first_name: string;
  @ApiProperty()
  last_name: string;
  @ApiProperty()
  roles: string[];
}

export class SocialLoginBody {
  @ApiProperty()
  user: SocialLoginBodyUser;
}

export class SocialLoginHeaders {
  userAgent: string;
}

export class SocialLoginReq {
  instancekey: string;
  provider: string;
  ip: string;
  @ApiProperty()
  body: SocialLoginBody;
  headers: SocialLoginHeaders;
}

export class SocialLoginRes {
  token: string
}

class LoginAfterOauthHeader {
  userAgent: string;
}

export class LoginAfterOauthReq {
  @ApiProperty()
  body: CreateUserDto;
  instancekey: string;
  remember: boolean;
  headers: LoginAfterOauthHeader;
}

export class LoginAfterOauthRes {
  response: string;
}

class VerifyCodeParams {
  token: string;
}

export class VerifiedCodeReq {
  @ApiProperty()
  params: VerifyCodeParams;
  instancekey: string;
}

export class VerifiedCodeRes {
  response?: string;
}

export class TempConfirmationCodeReq {
  @ApiProperty()
  id: string;
  instancekey: string;
}

export class TempConfirmationCodeRes {
  response?: string;
}

export class TempSignupBody {
  @ApiProperty()
  name: string;
  @ApiProperty()
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(20, { message: 'Password must be smaller than 20 characters' })
  password: string;
  @ApiProperty()
  @IsNotEmpty({ message: "Email or phone number is required." })
  @IsEmailOrPhoneNumber()
  userId: string;
  @ApiProperty()
  @IsNotEmpty({ message: 'Country is required' })
  country: string;
  @ApiProperty()
  roles: string[];
}

export class TempSignupReq {
  instancekey: string;
  @ApiProperty({ type: () => TempSignupBody })
  body: TempSignupBody;
}

export class TempSignupRes {
  response: ReqUser;
}

export class UpdateIdentityImageParam {
  @ApiProperty()
  @IsMongoId()
  id: string;
}

export class UpdateIdentityImageBody {
  @ApiProperty()
  fileUrl: string;
}

export class UpdateIdentityImageReq {
  params: UpdateIdentityImageParam;
  @ApiProperty()
  body: UpdateIdentityImageBody;
  instancekey: string;
}

export class UpdateIdentityImageRes {
  response: string;
}

export class UpdateConnectionHeader {
  instancekey: string;
  userAgent: string;
  authToken: string;
}

export class UpdateConnectionBody {
  @ApiProperty()
  device: string;
  @ApiProperty()
  os: string;
  @ApiProperty()
  isMobile: boolean;
  @ApiProperty()
  version: string;
}

export class UpdateConnectionInfoReq {
  user: ReqUser;
  headers: UpdateConnectionHeader;
  body: UpdateConnectionBody;
  ip: string;
}

export class UpdateConnectionInfoRes {
  response: string;
}

// export class UpdateRequest{
//   id: string;
//   instance_key: string;
//   user: ReqUser;
// }

export class UserRequest {
  @ApiProperty()
  _id?: string;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  emailVerified?: boolean;

  @ApiProperty()
  status?: boolean;

  @ApiProperty()
  isActive?: boolean;

  roles: string[];

  dossier?: Dossier;

  @ApiProperty()
  userId?: string;

  avatar?: Avatar;

  avatarSM?: Avatar;

  avatarMD?: Avatar;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  phoneNumberFull?: string;

  @ApiProperty()
  isPublic?: boolean;

  @ApiProperty()
  allowOnlineClass?: boolean;

  @ApiProperty()
  profileCompleted?: number;

  @ApiProperty()
  trainingProfileCompleted?: number;

  @ApiProperty({ type: Country })
  country?: Country;

  @ApiProperty()
  city?: string;

  @ApiProperty()
  ref?: Types.ObjectId;

  @ApiProperty()
  gender?: string;

  @ApiProperty()
  state?: string;

  @ApiProperty()
  programs?: string[];

  @ApiProperty()
  subjects?: Types.ObjectId[];

  @ApiProperty()
  locations?: Types.ObjectId[];

  @ApiProperty()
  managerStudent?: boolean;

  @ApiProperty()
  managerPractice?: boolean;

  @ApiProperty()
  practiceViews?: Types.ObjectId[];

  @ApiProperty()
  practiceAttempted?: Types.ObjectId[];

  @ApiProperty()
  emailStudents?: string[];

  @ApiProperty()
  lastLogin?: Date;

  @ApiProperty()
  lastAttempt?: Date;

  @ApiProperty()
  theme?: string;

  @ApiProperty()
  birthdate?: Date;

  @ApiProperty()
  streamUrl?: string;

  @ApiProperty()
  instagram?: Object;

  @ApiProperty()
  studentExclusive?: boolean;

  @ApiProperty()
  activeLocation?: Types.ObjectId;

  @ApiProperty()
  registrationNo?: string;

  @ApiProperty()
  expertise?: string;

  @ApiProperty()
  forcePasswordReset?: boolean;

  @ApiProperty()
  institute?: string;

  @ApiProperty()
  district?: string;

  @ApiProperty()
  pin?: number;

  @ApiProperty()
  street?: string;

  @ApiProperty()
  interest?: string;

  @ApiProperty()
  knowAboutUs?: string;

  @ApiProperty()
  about?: string;

  @ApiProperty()
  openAI?: string;

  @ApiProperty()
  interestedSubject?: string[];

  @ApiProperty()
  specialization?: string[];

  @ApiProperty()
  preferences?: Preference;

  @ApiProperty()
  experiences?: Experience[];

  @ApiProperty()
  whiteboard?: boolean;

  @ApiProperty()
  liveboard?: boolean;

  @ApiProperty()
  canCreateMultiLocations?: boolean;

  @ApiProperty()
  coverImageUrl?: string;

  @ApiProperty()
  isVerified?: boolean;

  @ApiProperty()
  isMentor?: boolean;

  @ApiProperty()
  blockedUsers?: any[];

  @ApiProperty()
  optoutDate?: Date;

  @ApiProperty()
  ambassador?: boolean;

  @ApiProperty()
  onboarding?: boolean;

  @ApiProperty()
  optoutReason?: string;

  @ApiProperty()
  optoutEmail?: boolean;

  @ApiProperty()
  createdBy?: Types.ObjectId;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;

  @ApiProperty()
  programmingLang?: ProgrammingLang[];

  @ApiProperty()
  educationDetails?: EducationDetail[];

  @ApiProperty()
  entranceExam?: EntranceExam[];

  @ApiProperty()
  academicProjects?: AcademicProject[];

  @ApiProperty()
  trainingCertifications?: TrainingCertification[];

  @ApiProperty()
  industryCertificates?: IndustryCertificate[];

  @ApiProperty()
  externalAssessment?: ExternalAssessment[];

  @ApiProperty()
  awardsAndRecognition?: AwardAndRecognition[];

  @ApiProperty()
  extraCurricularActivities?: ExtraCurricularActivity[];

  @ApiProperty()
  packageSchedules?: PackageSchedule[];

  @ApiProperty({ type: IdentityInfo })
  identityInfo?: IdentityInfo;

  @ApiProperty()
  codingExperience?: string;

  @ApiProperty()
  levelHistory?: LevelHistory[];

  @ApiProperty()
  passingYear?: string;

  @ApiProperty()
  provider?: string;

  @ApiProperty()
  emailVerifyToken?: string;

  @ApiProperty()
  emailVerifyExpired?: Date;

  @ApiProperty()
  rollNumber?: string;

  @ApiProperty()
  loginCount?: number;

  @ApiProperty()
  designation?: string;

  @ApiProperty()
  followings?: string[];

  @ApiProperty()
  passwordResetToken?: string;

  @ApiProperty()
  followers?: string[];

  @ApiProperty()
  instituteUrl?: string;

  @ApiProperty()
  placementStatus?: string;

  @ApiProperty()
  videoResume?: string;

  @ApiProperty()
  coreBranch?: string;

  @ApiProperty()
  mentorInfo?: MentorInfo;

  @ApiProperty()
  token?: string;

  @ApiProperty()
  isTempt: boolean;
}

export class UpdateRequest extends UserRequest {
  id: string;
  instancekey: string;
  @ApiProperty({ type: ReqUser })
  user: ReqUser;
  userId: string;
  @ApiProperty()
  @IsOptional()
  isRequiredIdentity: boolean;
  @ApiProperty()
  @IsOptional()
  approval: boolean;
  userid: string;
}

export class UpdateResponse {
  msg: string;
}

export class ValidateUserPictureRequest {
  instancekey: string;
  user: ReqUser
}

export class ValidateUserPictureResponse {
  valid: boolean;
  reason: string;
  confidence: number;
}

export class FindQuery {
  @ApiProperty({ required: false })
  teacherOnly: boolean;
  @ApiProperty({ required: false })
  location: string;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  roles: string;
  @ApiProperty({ required: false })
  searchText: string;
  @ApiProperty({ required: false })
  lastAttempt: boolean;
  @ApiProperty({ required: false })
  chatSupport: boolean;
  @ApiProperty({ required: false })
  count: boolean;
}

export class FindRequest {
  query: FindQuery;
  userdata: UserDto;
  instancekey: string;
}

export class FindResponse {

}