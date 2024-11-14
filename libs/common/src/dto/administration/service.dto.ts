import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, ValidateNested, IsDefined, ArrayNotEmpty, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

class User {
    _id: Types.ObjectId;
    name?: string;
    roles?: string[];
    userId?: string;
    email?: string;
    avatar?: string;
    country?: string;
}
class ServiceCountry {
    @ApiProperty()
    code: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    currency: string;
    @ApiProperty()
    price: number;
    @ApiProperty()
    marketPlacePrice: number;
    @ApiProperty()
    discountValue: number;
}
enum DurationUnit {
    YEAR = 'year',
    MONTH = 'month',
    WEEK = 'week',
    DAY = 'day',
}
enum ServiceType {
    SUPPORT = 'support',
    MEMBERSHIP = 'membership',
}
enum ServiceStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    REVOKED = 'revoked',
}

export class CreateServiceReq {
    @ApiProperty({ required: true })
    @IsString()
    @IsDefined()
    title: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    shortDescription?: string;

    @ApiProperty({ required: false })
    @IsEnum(ServiceType, {
        message: `type must be one of the following values: ${Object.values(ServiceType).join(', ')}`,
    })
    @IsOptional()
    type?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    imageUrl?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    duration?: number;

    @ApiProperty({ required: true })
    @IsString()
    @IsEnum(DurationUnit, {
        message: `durationUnit must be one of the following values: ${Object.values(DurationUnit).join(', ')}`,
    })
    @IsOptional()
    durationUnit?: string;

    @ApiProperty({ type: [String], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    highlights?: string[];

    @ApiProperty({ type: [String], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiProperty({ type: Boolean, default: true, required: false })
    @IsBoolean()
    @IsOptional()
    active?: boolean;

    @ApiProperty({ type: [ServiceCountry], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ServiceCountry)
    @IsOptional()
    countries?: ServiceCountry[];
    lastModifiedBy?: Types.ObjectId;
    user?: User;
    instancekey?: string;
}

export class CreateServiceRes {
    _id: Types.ObjectId;
}

export class Service {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    shortDescription?: string;
    type?: string;
    imageUrl?: string;
    duration?: number;
    durationUnit?: string;
    highlights?: string[];
    tags?: string[];
    active?: boolean;
    countries?: ServiceCountry[];
    lastModifiedBy?: Types.ObjectId;
    user?: User;
    status?: string;
    statusCode?: number;
    message?: string;
}

export class RevokeServiceReq {
    _id: string;
    instancekey?: string;
    user?: User;
}

export class EditServiceReq {
    _id: string;
    @ApiProperty({ required: true })
    @IsString()
    @IsDefined()
    title: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    shortDescription?: string;

    @ApiProperty({ required: false })
    @IsEnum(ServiceType, {
        message: `type must be one of the following values: ${Object.values(ServiceType).join(', ')}`,
    })
    @IsOptional()
    type?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    imageUrl?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    duration?: number;

    @ApiProperty({ required: false })
    @IsEnum(DurationUnit, {
        message: `durationUnit must be one of the following values: ${Object.values(DurationUnit).join(', ')}`,
    })
    @IsOptional()
    durationUnit?: string;

    @ApiProperty({ type: [String], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    highlights?: string[];

    @ApiProperty({ type: [String], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiProperty({ type: Boolean, default: true, required: false })
    @IsBoolean()
    @IsOptional()
    active?: boolean;

    @ApiProperty({ type: [ServiceCountry], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ServiceCountry)
    @IsOptional()
    countries?: ServiceCountry[];

    @ApiProperty({ required: false })
    @IsEnum(ServiceStatus, {
        message: `status must be one of the following values: ${Object.values(ServiceStatus).join(', ')}`,
    })
    @IsOptional()
    status?: string;
    lastModifiedBy?: Types.ObjectId;
    instancekey?: string;
    user?: User;
}

export class DeleteServiceReq {
    @ApiProperty()
    _id: string;
    user?: User;
    instancekey?: string;
}

export class FindServicesReq {
    _id?: string;
    limit?: number;
    skip?: number;
    searchText?: string;
    count?: boolean;
    instancekey?: string;
    user?: User;
}

export class FindServicesRes {
    response: Service[];
    count?: number;
}

export class GetServiceMembersReq {
    @ApiProperty()
    _id: string;
    limit?: number;
    skip?: number;
    searchText?: string;
    count?: boolean;
    instancekey?: string;
}

export class GetServiceMembersRes {
    users?: string;
}

export class GetTaggingForStudentsReq {
    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    @IsMongoId({ each: true })
    students: string[];
    instancekey?: string;
}

export class GetTaggingForStudentsRes {
    studentServices?: Service[];
}

export class GetServiceReq {
    @ApiProperty()
    _id: string;
    instancekey?: string;
}

export class GetTaggingServicesForStudentRes {
    response?: Service[];
}