import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Unit } from './unit.dto';

class User {
    _id: string;
    roles: string[];
    activeLocation: Types.ObjectId;
    subjects?: string[];
    userId?: string;
    viewCount?: number;
    classroom?: string;
}

export class ContentRequest {
    @ApiProperty({ type: 'string', format: 'binary' })
    file?: Express.Multer.File;
    @ApiProperty()
    url?: string;
    @ApiProperty({ required: true })
    title?: string;
    @ApiProperty()
    summary?: string;
    @ApiProperty({ enum: ["video", "ebook"], default: "video" })
    contentType?: string;
    @ApiProperty()
    filePath?: string;
    @ApiProperty({ type: [String] })
    tags?: string[];
    @ApiProperty()
    imageUrl?: string;
    user?: User;
    instancekey?: string;
}
class Viewership{
    user: Types.ObjectId;
    viewDate: Date;
}
class Feedbacks{
    user: Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}
export class Content {
    _id: Types.ObjectId;
    title: string;
    url: string;
    summary: string;
    contentType?: string;
    filePath?: string;
    tags: string[];
    imageUrl?: string;
    viewed?: number;
    avgRating?: number;
    location: Types.ObjectId;
    viewership?: Viewership[];
    feedbacks?: Feedbacks[];
    createdAt?: string;
    updatedAt?: string;
    user?: User;
}

export class GetContentByIdRequest {
    @ApiProperty()
    _id: string;
    instancekey?: string;
}

export class GetContentByIdResponse {
    @ApiProperty()
    response: Content;
}

export class UpdateContentRequest {
    _id: string;
    @ApiProperty({ required: true })
    title?: string;
    @ApiProperty()
    summary?: string;
    @ApiProperty({ type: [String] })
    tags?: string[];
    instancekey?: string;
}

export class GetAllContentReq {
    title?: string;
    type?: string;
    page?: number;
    limit?: number;
    user?: User;
    instancekey?: string;
}

export class GetAllContentRes {
    response?: Content[];
    contents?: Content[];
    count?: number;
}

export class CountContentRes {
    count: number;
}

export class GetContentByCodeReq {
    @ApiProperty()
    code: string;
    user?: User;
    instancekey?: string;
}

export class ExportViewerRes {
    response: User[];
}

export class getContentsTaggedWithTopicReq {
    topicId?: string;
    contentType?: string;
    includeCount?: boolean;
    page?: number;
    limit?: number;
    user?: User;
    instancekey?: string;
}

export class FindSubjectUnitAndTopicsReq {
    accreditationEnabled?: boolean;
    user?: User;
    instancekey?: string;
}
class SubUnitTopic {
	_id?: string; 
	name?: string; 
	units?: Unit;
	adaptive?: string;
}
export class FindSubjectUnitAndTopicsRes {
    response: SubUnitTopic[];
}

export class UpdateContentCountReq {
    _id: string;
    @ApiProperty()
    feedback?: string;
    @ApiProperty()
    rating?: number;
    @ApiProperty()
    viewCount?: number;
    user?: User;
    instancekey?: string;
}