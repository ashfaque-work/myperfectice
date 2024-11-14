import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

class User {
    id: string;
    roles: string[];
}

export class UnitRequest {
    @ApiProperty({ required: true })
    name: string;
    @ApiProperty({ type: String, required: true })
    subject?: Types.ObjectId;
    @ApiProperty()
    code?: string;
    @ApiProperty({ type: [String] })
    tags?: string[];
    createdBy?: Types.ObjectId;
    isAllowReuse?: string;
    lastModifiedBy?: Types.ObjectId;
    user?: User;
    instancekey?: string;
}

export class Unit {
    @ApiProperty()
    _id: Types.ObjectId;
    @ApiProperty({ required: true })
    name: string;
    @ApiProperty()
    slugfly: string;
    @ApiProperty({ type: String })
    unit: Types.ObjectId;
    @ApiProperty({ type: Boolean, default: true })
    active: boolean;
    @ApiProperty()
    uid: string;
    @ApiProperty({ type: Boolean, default: true })
    synced: boolean;
    @ApiProperty({ enum: ['global', 'self'] })
    isAllowReuse: string;
    @ApiProperty({ type: String })
    lastModifiedBy: Types.ObjectId;
    @ApiProperty({ type: String })
    createdBy: Types.ObjectId;
    @ApiProperty({ type: [String] })
    tags: string[];
    unitName?: string;
    updatedAt?: Date;
    topicsCount?: number;
    questionCount?: number;
    topics?: string[];
}

export class GetAllUnitRequest{
    id?: string;
    topics?: string;
    active?: boolean;
    instancekey?: string;
}

export class GetUnitResponse {
    @ApiProperty()
    response: Unit[];
}

export class GetOneUnitRequest {
    @ApiProperty()
    _id: string;
    instancekey?: string;
}

export class GetOneUnitResponse {
    @ApiProperty()
    response: Unit;
}

export class UpdateUnitRequest {
    _id: string;
    @ApiProperty({ required: true })
    name: string;
    @ApiProperty({ type: [String] })
    tags: string[];
    slugfly: string;
    lastModifiedBy: Types.ObjectId;
    updatedAt?: Date;
    instancekey?: string;
    user?: User;
}

export class UpdateUnitStatusRequest {
    _id: string;
    @ApiProperty({ type: Boolean, default: true })
    active?: boolean;
    lastModifiedBy: Types.ObjectId;
    updatedAt?: Date;
    instancekey?: string;
    user?: User;
}

export class UpdateUnitResponse {
    @ApiProperty()
    response: Unit[];
}

export class DeleteUnitRequest {
    @ApiProperty()
    _id: string;
    instancekey?: string;
}

export class DeleteUnitResponse {
    _id: string;
    name: string;
}

export class GetUnitsBySubjectRequest{
    subject?: string;
    page?: number;
    limit?: number;
    searchText?: string;
    instancekey?: string;
}