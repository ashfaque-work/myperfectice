import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';


class ProgramCountry {
    @ApiProperty()
    code: string;
    @ApiProperty()
    name: string;
}
class User {
    _id: string;
    roles: string[];
    activeLocation: Types.ObjectId;
    @ApiProperty({ type: [ProgramCountry] })
    country?: ProgramCountry[];
    subjects?: Types.ObjectId[];
}

export class ProgramRequest {
    @ApiProperty({ required: true })
    name?: string;
    @ApiProperty({ type: [String] })
    subjects?: ObjectId[];
    @ApiProperty({ type: [ProgramCountry] })
    countries?: ProgramCountry[];
    slugfly?: string;
    isAllowReuse?: string;
    createdBy?: Types.ObjectId;
    location?: Types.ObjectId;
    instancekey?: string;
    user?: User;
}
export class LastModifiedBy {
    @ApiProperty()
    _id: Types.ObjectId;
    @ApiProperty()
    name: string;
}
export class Program {
    @ApiProperty()
    _id: Types.ObjectId;
    @ApiProperty({ required: true })
    name?: string;
    @ApiProperty()
    slugfly?: string;
    @ApiProperty({ type: Boolean, default: true })
    active?: boolean;
    @ApiProperty({ type: [String] })
    subjects?: ObjectId[];
    @ApiProperty({ enum: ['global', 'self'], default: 'global' })
    isAllowReuse?: string;
    @ApiProperty({ type: String })
    lastModifiedBy?: Types.ObjectId;
    @ApiProperty({ type: String })
    createdBy?: Types.ObjectId;
    @ApiProperty()
    uid?: string;
    @ApiProperty({ type: [ProgramCountry] })
    countries?: ProgramCountry[];
    @ApiProperty({ type: String })
    location?: Types.ObjectId;
    @ApiProperty()
    updatedAt?: string;
}

export class GetAllProgramRequest {
    name?: string;
    includeDeactivated?: boolean;
    country?: string;
    user?: User;
    instancekey?: string;
}

export class GetProgramResponse {
    @ApiProperty()
    response: Program[];
}

export class GetOneProgramRequest {
    @ApiProperty()
    _id: string;
    instancekey?: string;
}

export class GetOneProgramResponse {
    @ApiProperty()
    response: Program;
}

export class UpdateProgramRequest {
    _id: string;
    @ApiProperty({ required: true })
    name: string;
    @ApiProperty({ type: [String] })
    subjects: ObjectId[];
    @ApiProperty({ type: [ProgramCountry] })
    countries: ProgramCountry[];
    userid: string;
    instancekey?: string;
}
export class UpdateProgramStatusRequest {
    _id: string;
    @ApiProperty({ type: Boolean, default: true })
    active?: boolean;
    userid: string;
    instancekey?: string;
}

export class UpdateProgramResponse {
    @ApiProperty()
    response: Program[];
}

export class DeleteProgramRequest {
    @ApiProperty()
    _id: string;
    instancekey?: string;
}

export class DeleteProgramResponse {
    _id: string;
    name: string;
}

export class GetInstProgReq {
    includeDeactivated?: boolean;
    subject?: string;
    user?: User;
    instancekey?: string;
}