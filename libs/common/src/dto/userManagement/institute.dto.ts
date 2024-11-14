import { ApiProperty } from "@nestjs/swagger";
import { Country, ReqUser } from "../user.dto";

export class GetMyInstitutesReq {
    user: ReqUser;
    instancekey: string;
}

export class GetMyInstitutesRes {
    _id: string;
    user: string;
    name: string;
    isDefault: false;
}

export class GetMyOwnInstituteReq {
    user: ReqUser;
}

export class GetMyOwnInstituteRes {
    _id: string;
    user: string;
    name: string;
    isDefault: boolean;
    code: string;
}

export class GetAllLocationsReq {
    user: ReqUser;
}

class LocationList {
    _id: string;
    name: string;
}

export class GetAllLocationsRes {
    response: LocationList[];
}

class GetInstituteQuery {
    programs: boolean;
    subjects: boolean;
    teachers: boolean;
    preferencesOnly: boolean;
}

export class GetInstituteReq {
    id: string;
    instancekey: string;
    query: GetInstituteQuery;
}

class AllInstituteRes {
    _id: string;
    user: string;
    name: string;
    slugfly: string;
    active: boolean;
    isDefault: boolean;
    programs: string[];
    subjects: string[];
    specialization: string[];
    teachers: string[];
    type: string;
    preferences: Preference;
    invitees: string[];
    createdAt: string;
    updatedAt: string;
    students: number;
}

export class GetInstituteRes {
    response: AllInstituteRes;
}

class ProfileProgramsQuery {
    country: string;
    name: string;
}

export class GetProfileProgramsReq {
    id: string;
    user: ReqUser;
    query: ProfileProgramsQuery;
}

class ProfileSubject {
    _id: string;
    name: string;
}

class ProfileProgramResponse {
    _id: string;
    name: string;
    active: boolean;
    countries: Country[];
    updatedAt: string;
    createdAt: string;
    subjects: ProfileSubject[]
}

export class GetProfileProgramsRes {
    response: ProfileProgramResponse[]
}

export class CheckAvailibilityReq {
    user: ReqUser;
    code: string;
}

export class CheckAvailibilityRes {
    status: boolean;
    message: string;
}

export class GetPublicProfileReq {
    id: string;
    user: ReqUser;
}

export class GetPublicProfileRes {
    _id: string;
    name: string;
    programs: string[];
    subjects: string[];
    specialization: string[];
    teachers: string[];
    random: string;
    students: number;
}

export class GetInstituteInviteesReq {
    id: string;
    user: ReqUser;
}

export class GetInstituteInviteesRes {
    _id: string;
    invitees: string;
}

export class CreateInstituteBody {
    @ApiProperty()
    name: string;
    @ApiProperty()
    instituteId: string;
    @ApiProperty()
    subjects: string[];
    @ApiProperty()
    inviteTeachers: string;
}

export class CreateInstituteReq {
    @ApiProperty()
    body: CreateInstituteBody;
    user: ReqUser;
    instancekey: string;
    token: string;
}

export class CreateInstituteRes {
    _id: string;
    user: string;
    name: string;
    slugfly: string;
    active: boolean;
    isDefault: boolean;
    code: string;
    programs: string[];
    subjects: string[];
    specialization: string[];
    teachers: string[];
    type: string;
    preferences: Preference;
    invitees: string[];
    createdAt: string;
    updatedAt: string;
}

export class JoinInstituteBody {
    @ApiProperty()
    code: string
}

export class JoinInstituteReq {
    body: JoinInstituteBody;
    user: ReqUser;
    instancekey: string;
    token: string;
}

export class JoinInstituteRes {
    institute: string;
}

export class LeaveInstituteBody {
    @ApiProperty()
    id: string
}

export class LeaveInstituteReq {
    body: LeaveInstituteBody;
    user: ReqUser;
    instancekey: string;
    token: string;
}

export class LeaveInstituteRes {
    response: string;
}

export class SetDefaultReq {
    user: ReqUser;
    instancekey: string;
    token: string;
}

export class SetDefaultRes {
    response: string;
}

export class InviteToJoinBody {
    @ApiProperty({type: [String]})
    emails: string[]
}

export class InviteToJoinReq {
    id: string;
    body: InviteToJoinBody;
    user: ReqUser;
}

export class InviteToJoinRes {
    response: string;
}

export class ChangeActiveInstituteBody {
    @ApiProperty()
    instituteId: string
}

export class ChangeActiveInstituteReq {
    body: ChangeActiveInstituteBody;
    user: ReqUser;
    instancekey: string;
    token: string;
}

export class ChangeActiveInstituteRes {
    response: string;
}

export class UpdateInstituteBody {
    @ApiProperty()
    name: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    subjects: string[];
    @ApiProperty()
    preferences: Preference[];
    @ApiProperty()
    teacher: string[];
    @ApiProperty()
    imageUrl: string;
    @ApiProperty()
    coverImageUrl: string;
    @ApiProperty()
    programs: string[];
    @ApiProperty()
    specialization: any[];
    @ApiProperty()
    google: string;
    @ApiProperty()
    twitter: string;
    @ApiProperty()
    facebook: string;
    @ApiProperty()
    instagram: string;
    @ApiProperty()
    youtube: string;
    @ApiProperty()
    linkedIn: string;
}

export class UpdateInstituteReq {
    id: string;
    user: ReqUser;
    body: UpdateInstituteBody;
}

export class UpdateInstituteRes {
    response: string;
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

export class UpdateInstitutePreferencesBody {
    @ApiProperty()
    preferences: Preference;
}

export class UpdateInstitutePreferncesReq {
    id: string;
    user: ReqUser;
    @ApiProperty()
    body: UpdateInstitutePreferencesBody;
    instancekey: string;
    token: string;
}

export class UpdateInstitutePreferncesRes {
    response: string;
}

