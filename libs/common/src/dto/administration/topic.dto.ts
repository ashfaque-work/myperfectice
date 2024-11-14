import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

class User {
    id: string;
    roles: string[];
}

export class TopicRequest {
    @ApiProperty({ required: true })
    name: string;
    @ApiProperty({ type: String })
    unit?: Types.ObjectId;
    @ApiProperty({ type: [String] })
    tags?: string[];
    isAllowReuse?: string;
    lastModifiedBy?: Types.ObjectId;
    createdBy?: Types.ObjectId;
    user?: User;
    instancekey?: string;
}

export class Topic {
    @ApiProperty()
    _id: string;
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
    updatedAt?: Date;
    topicName?: string;
    questionCount?: number;
}

export class GetAllTopicRequest{
    id?: string;
    units?: string;
    active?: boolean;
    instancekey?: string;
}

export class GetTopicResponse {
    @ApiProperty()
    response: Topic[];
}

export class GetOneTopicRequest {
    @ApiProperty()
    _id: string;
    instancekey?: string;
}

export class GetOneTopicResponse {
    @ApiProperty()
    response: Topic;
}

export class UpdateTopicRequest {
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

export class UpdateTopicStatusRequest {
    _id: string;
    @ApiProperty({ type: Boolean, default: true })
    active?: boolean;
    lastModifiedBy: Types.ObjectId;
    updatedAt?: Date;
    instancekey?: string;
    user?: User;
}

export class UpdateTopicResponse {
    @ApiProperty()
    response: Topic[];
}

export class DeleteTopicRequest {
    @ApiProperty()
    _id: string;
    instancekey?: string;
    user?: User;
}

export class DeleteTopicResponse {
    _id: string;
    name: string;
    active?: boolean;
}

export class GetTopicBySlugRequest{
    slug: string;
    unit?: string;
    instancekey?: string;
}

export class GetTopicByUnitRequest{
    unitId?: string;
    page?: number;
    limit?: number;
    searchText?: string;
    instancekey?: string;
}