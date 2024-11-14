import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IsBoolean, IsEnum, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';
import { PracticeSetDto } from '../assessment.dto';

class ProgramCountry {
    @ApiProperty()
    code: string;
    @ApiProperty()
    name: string;
}
class User {
    _id: string;
    email: string;
    roles: string[];
    activeLocation: Types.ObjectId;
    @ApiProperty({ type: [ProgramCountry] })
    country?: ProgramCountry[];
    subjects?: Types.ObjectId[];
    locations?: Types.ObjectId[];
    grade?: Types.ObjectId[];
}
class Level {
    @ApiProperty()
    name: string;
    @ApiProperty()
    value: number;
    @ApiProperty()
    quantity: number;
    @ApiProperty()
    quality: number;
}
class Unit {
    @ApiProperty()
    _id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    slugfly: string;
}
class Topic {
    @ApiProperty()
    _id: string;
    @ApiProperty()
    name: string;
}

export class SubjectRequest {
    @ApiProperty()
    code: string;
    @ApiProperty({ required: true })
    name: string;
    @ApiProperty({ type: [String] })
    programs: ObjectId[];
    user?: User;
    instancekey?: string;
}

export class Subject {
    @ApiProperty()
    _id: Types.ObjectId;
    @ApiProperty()
    code?: string;
    @ApiProperty({ required: true })
    name: string;
    @ApiProperty()
    createdAt?: Date;
    @ApiProperty()
    updatedAt?: Date;
    @ApiProperty()
    slugfly?: string;
    @ApiProperty()
    active?: boolean;
    @ApiProperty({ type: [String] })
    programs?: ObjectId[];
    @ApiProperty({ type: [String] })
    units?: ObjectId[];
    @ApiProperty({ enum: ['global', 'self'], default: 'global' })
    isAllowReuse?: string;
    @ApiProperty({ type: String })
    lastModifiedBy?: Types.ObjectId;
    @ApiProperty({ type: String })
    createdBy?: Types.ObjectId;
    @ApiProperty()
    uid?: string;
    @ApiProperty()
    synced?: boolean;
    @ApiProperty()
    tags?: string[];
    @ApiProperty({ type: [Level] })
    levels?: Level[];
    @ApiProperty({ type: String })
    location?: Types.ObjectId;
    subjectName?: string;
    unitCount?: number;
    topicCount?: number;
    questionCount?: number;
    topics?: string[];
}

export class GetAllSubjectQuery {
    @ApiProperty({ required: false })
    unit: boolean;
}

export class GetAllSubjectRequest {
    user?: User;
    instancekey?: string;
    query?: GetAllSubjectQuery;
}

export class GetSubjectResponse {
    @ApiProperty()
    response: Subject[];
}

export class GetOneSubjectRequest {
    @ApiProperty()
    _id: string;
    instancekey?: string;
}

export class GetOneSubjectResponse {
    @ApiProperty()
    response: Subject;
}

export class UpdateSubjectRequest {
    _id: string;
    @ApiProperty({ required: true })
    name: string;
    @ApiProperty({ type: [String] })
    programs: ObjectId[];
    @ApiProperty()
    tags?: string[];
    user?: User;
    instancekey?: string;
}

export class UpdateSubjectResponse {
    @ApiProperty()
    response: Subject[];
}

export class DeleteSubjectRequest {
    @ApiProperty()
    _id: string;
    instancekey?: string;
    user?: User;
}

export class DeleteSubjectResponse {
    _id: string;
    name: string;
}

export class GetMySubjectsRequest {
    queryUser?: string;
    unit?: string;
    topic?: string;
    user?: User;
    instancekey?: string;
}

export class GetSubjectBySlugReq {
    subjectName?: string;
    program?: string;
    instancekey?: string;
}

export class GetTeachersBySubjectsReq {
    user?: User;
    instancekey?: string;
}
export class Teacher {
    name?: string;
}
export class GetTeachersBySubjectsRes {
    response: Teacher[];
}

export class UpdateSubStatusReq {
    _id: string;
    @ApiProperty({ enum: ['global', 'self'], default: 'global' })
    @IsOptional()
    @IsEnum(['global', 'self'])
    isAllowReuse?: string;
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    active?: boolean;
    user?: User;
    instancekey?: string;
}

export class GetUnitsBySubReq {
    @ApiProperty()
    subjects?: string;
    _id?: string;
    instancekey?: string;
}

export class GetUnitsBySubRes {
    response: [
        _id?: string,
        name?: string,
        units?: Unit[]
    ];
}

export class GetTopicsByUnitReq {
    @ApiProperty()
    units?: string;
    _id?: string;
    instancekey?: string;
}

export class GetTopicsByUnitRes {
    response: [
        _id?: string,
        name?: string,
        topics?: Topic[]
    ];
}

export class GetInstSubReq {
    activeOnly?: boolean;
    page?: number;
    limit?: number;
    searchText?: string;
    instancekey?: string;
    user?: User;
}

export class GetPubSubReq {
    page?: number;
    limit?: number;
    searchText?: string;
    instancekey?: string;
    user?: User;
}

export class GetSubByTestReq {
    testId?: string;
    testDetails?: string;
    instancekey?: string;
    user?: User;
}
export class GetSubByTestRes {
    test?: PracticeSetDto;
    subjects: Subject[];
}

class Query {
    @IsOptional()
    @IsNumber()
    value?: number;
    @IsOptional()
    @IsString()
    grade?: string;
    @IsOptional()
    @IsNumber()
    day?: number;
    @IsOptional()
    @IsString()
    classroom?: string;
    @IsOptional()
    @IsString()
    locations?: string;
    @IsOptional()
    @IsNumber()
    limit?: number;
}

export class GetAttemptTrendByGradeReq {
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    instancekey: string;
}
export class GetAttemptTrendByGradeRes {
    message?: string;
}

export class AttemptTrendReq {
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    instancekey: string;
    user?: User;
}
export class AttemptTrendRes {
    message?: string;
}

export class SignUpTrendRes {
    message?: string;
}

export class QuestionAddedTrendRes {
    message?: string;
}

export class HighestAttemptedStudentRes {
    message?: string;
}
export class MostAbandonedTestRes {
    message?: string;
}

export class ImportSubjectsReq {
    @ApiProperty({ type: 'string', format: 'binary' })
    file?: Express.Multer.File;
    user?: User;
    instancekey?: string;
}