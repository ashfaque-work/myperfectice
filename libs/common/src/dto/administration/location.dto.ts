import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IsNotEmpty, IsString } from 'class-validator';

class User {
    _id: string;
    email: string;
    roles?: string[];
    activeLocation?: Types.ObjectId;
    subjects?: Types.ObjectId[];
}

class Assessment {
    @ApiProperty()
    isShow: boolean;
    @ApiProperty()
    allowToCreate: boolean;
    @ApiProperty()
    adaptive: boolean;
    @ApiProperty()
    proctor: boolean;
    @ApiProperty()
    liveBoard: boolean;
    @ApiProperty()
    evaluation: boolean;
}
class TestSeries {
    @ApiProperty()
    isShow: boolean;
    @ApiProperty()
    allowToCreate: boolean;
}
class Course {
    @ApiProperty()
    isShow: boolean;
    @ApiProperty()
    allowToCreate: boolean;
}
class Roles {
    @ApiProperty()
    mentor: boolean;
    @ApiProperty()
    teacher: boolean;
    @ApiProperty()
    operator: boolean;
}
class Classroom {
    @ApiProperty()
    isShow: boolean;
    @ApiProperty()
    assignment: boolean;
    @ApiProperty()
    folder: boolean;
}
class General {
    @ApiProperty()
    editProfileSubject: boolean;
    @ApiProperty()
    resume: boolean;
    @ApiProperty()
    chat: boolean;
    @ApiProperty()
    notification: boolean;
    @ApiProperty()
    signup: boolean;
    @ApiProperty()
    sessionMangement: boolean;
}
class Certificate {
    @ApiProperty()
    name: string;
    @ApiProperty()
    template: string;
}

class Preferences {
    @ApiProperty()
    assessment: Assessment;
    @ApiProperty()
    testSeries: TestSeries;
    @ApiProperty()
    course: Course;
    @ApiProperty()
    roles: Roles;
    @ApiProperty()
    questionBank: boolean;
    @ApiProperty()
    reports: boolean;
    @ApiProperty()
    codeEditor: boolean;
    @ApiProperty()
    classroom: Classroom;
    @ApiProperty()
    general: General;
    @ApiProperty()
    certificate: Certificate;
}
class Invitee {
    @ApiProperty()
    email: string;
    @ApiProperty({ default: false })
    joined: boolean;
    @ApiProperty()
    invitationAt: Date;
    @ApiProperty()
    joinedAt: Date;
}
export class ClassroomInfo {
    @ApiProperty()
    _id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    active: boolean;
    @ApiProperty()
    studentCount: number;
    @ApiProperty()
    teacherCount: number;
}

export class LocationRequest {
    @ApiProperty()
    name?: string;
    @ApiProperty({ default: false })
    isDefault?: boolean;
    user?: User;
    slugfly?: string;
    instancekey?: string;
}

export class LocationResponse {
    @ApiProperty()
    name?: string;
    @ApiProperty()
    slugfly?: string;
    @ApiProperty({ default: true })
    isDefault?: boolean;
    @ApiProperty()
    user?: Types.ObjectId;
}

export class LocationDto {
    @ApiProperty()
    _id: Types.ObjectId;

    @ApiProperty()
    isDefault: boolean;

    @ApiProperty()
    active: boolean;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty({ type: [ClassroomInfo], default: [] })
    cls: ClassroomInfo[];

    @ApiProperty()
    studentCount: number;

    @ApiProperty()
    teacherCount: number;
}
export class GetLocationResponse {
    @ApiProperty({ type: [LocationDto] })
    response: LocationDto[];
}

export class GetUserLocationRequest {
    userid: string;
    instancekey?: string;
}
export class LocationName {
    name: string;
}
export class GetUserLocationResponse {
    response: LocationName[];
}
export class Location {
    @ApiProperty()
    _id: Types.ObjectId;
    @ApiProperty()
    user?: Types.ObjectId;
    @ApiProperty()
    name?: string;
    @ApiProperty()
    slugfly?: string;
    @ApiProperty()
    description?: string;
    @ApiProperty({ default: true })
    active?: boolean;
    @ApiProperty({ default: false })
    isDefault?: boolean;
    @ApiProperty()
    code?: string;
    @ApiProperty({ type: [String] })
    programs?: ObjectId[];
    @ApiProperty({ type: [String] })
    subjects?: ObjectId[];
    @ApiProperty()
    specialization?: any[];
    @ApiProperty()
    logo?: string;
    @ApiProperty()
    imageUrl?: string;
    @ApiProperty({ type: [String] })
    teachers?: ObjectId[];
    // @ApiProperty({ type: Preferences })
    // preferences?: Preferences;
    @ApiProperty()
    coverImageUrl?: string;
    @ApiProperty()
    linkedIn?: string;
    @ApiProperty()
    youtube?: string;
    @ApiProperty()
    instagram?: string;
    @ApiProperty()
    facebook?: string;
    @ApiProperty()
    twitter?: string;
    @ApiProperty()
    google?: string;
    @ApiProperty({ type: [Invitee] })
    invitees?: Invitee[];
    @ApiProperty({ type: String })
    lastModifiedBy?: ObjectId;
    @ApiProperty({ enum: ['publisher', 'institute'], default: 'institute' })
    type?: string;
}

export class GetOneLocationRequest {
    @ApiProperty()
    _id: string;
    instancekey?: string;
}

export class GetOneLocationResponse {
    @ApiProperty()
    response: Location;
}

export class UpdateLocationRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;
    @ApiProperty({ default: false })
    isDefault: boolean;
    _id: string;
    updatedAt: string;
    lastModifiedBy: string;
    userid: string;
    instancekey?: string;
}

export class UpdateLocationResponse {
    response: [
        _id: string,
        name: string,
        isDefault: boolean,
        updatedAt: string,
        lastModifiedBy: string,
        userid: string
    ];
}

export class UpdateLocationStatusRequest {
    @ApiProperty({ default: true })
    active: boolean;
    _id: string;
    updatedAt: string;
    lastModifiedBy: string;
    userid: string;
    instancekey?: string;
}

export class UpdateLocationStatusResponse {
    response: [
        _id: string,
        active: string,
        updatedAt: string,
        lastModifiedBy: string
    ];
}

export class DeleteLocationRequest {
    @ApiProperty()
    _id: string;
    instancekey?: string;
}

export class DeleteLocationResponse {
    _id: string;
    name: string;
    code: string;
    type: string;
}

export class ImportLocationReq {
    @ApiProperty({ type: 'string', format: 'binary' })
    file?: Express.Multer.File;
    user?: User;
    instancekey?: string;
}