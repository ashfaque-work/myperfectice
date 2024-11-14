import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

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
    @IsBoolean()
    @IsOptional()
    weakness?: boolean
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
}

export class PeakTimeAndDurationReq {
    @ApiProperty({ required: false })
    query?: Query;
    instancekey: string;
}

export class AllFirstQuestionsDetailReq {
    @ApiProperty({ required: false })
    query?: Query;
    user?: User;
    instancekey: string;
}

export class GetTimeWastedReq {
    @ApiProperty({ required: false })
    query?: Query;
    @ApiProperty({ required: true })
    @IsString()
    @IsMongoId()
    subjectId?: string;
    user?: User;
    instancekey: string;
}