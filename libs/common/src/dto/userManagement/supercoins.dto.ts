import { ApiProperty } from "@nestjs/swagger";
import { ReqUser } from "../user.dto";

export class IndexSupercoinsReq {
    instancekey: string;
    type: string;
    searchText: string;
}

class SupercoinsRes {
    _id: string;
    title: string;
    summary: string;
    value: number;
    status: boolean;
    type: string;
    mode: string;
}

export class IndexSupercoinsRes {
    response: SupercoinsRes[];
    message: string;
}

export class UpdateSupercoinsBody {
    @ApiProperty()
    full: string;
    @ApiProperty()
    title: string;
    @ApiProperty()
    summary: string;
    @ApiProperty()
    value: number;
    @ApiProperty()
    status: boolean;
}

export class UpdateSupercoinsReq {
    instancekey: string;
    id: string;
    @ApiProperty()
    body: UpdateSupercoinsBody;
    user: ReqUser;
}

class UpdateSupercoins {
    _id: string;
    title: string;
    summary: string;
    value: number;
    status: boolean;
    type: string;
    mode: string;
    lastModifiedBy: string;
    updatedAt: string;
}

export class UpdateSupercoinsRes {
    response: UpdateSupercoins;
    message: string;
}

export class CreateSupercoinsBody {
    @ApiProperty()
    title: string;
    @ApiProperty()
    summary: string;
    @ApiProperty()
    value: number;
    @ApiProperty()
    type: string;
}

export class CreateSupercoinsReq {
    instancekey: string;
    @ApiProperty()
    body: CreateSupercoinsBody;
    user: ReqUser;
}

export class CreateSupercoinsRes {
    _id: string;
    title: string;
    status: boolean;
    summary: string;
    value: number;
    type: string;
    createdBy: string;
    updatedBy: string;
}

export class RequestStudentsReq {
    instancekey: string;
    activityType: string;
    searchText: string;
}

class RequestStudent {
    _id: string;
    activityType: string;
    studentId: string;
    name: string;
    userId: string;
    studetnMsg: string;
}

export class RequestStudentsRes {
    response: RequestStudent[];
    message: string;
}

export class UpdateStatusBody {
    @ApiProperty()
    activityType: string;
    @ApiProperty()
    teacherMsg: string;
    @ApiProperty()
    studentId: string;
    @ApiProperty()
    email: string;
}

export class UpdateStatusReq {
    instancekey: string;
    id: string;
    @ApiProperty()
    body: UpdateStatusBody;
    user: ReqUser;
}

export class UpdateStatusRes {
    _id: string;
    status: boolean;
    activityType: string;
    count: number;
    coins: number;
    user: string;
    mode: string;
    activityId: string;
    teacherMsg: string;
    createdAt: string;
    updatedAt: string;
    message: string;
}

export class GetMembersReq {
    instancekey: string;
    name: string;
}

class MemberId {
    user: string;
}

class MemberAvatar {
    mimeType: string;
    size: number;
    fileUrl: string;
    fileName: string;
    path: string;
    _id: string;    
}

class GetMember {
    _id: MemberId;
    earned: number;
    redeem: number;
    inprocess: number;
    studentId: string;
    name: string;
    email: string;
    avatar: MemberAvatar;
}

export class GetMembersRes {
    response: GetMember;
}