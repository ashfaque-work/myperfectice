import { ApiProperty } from "@nestjs/swagger";
import { ReqUser } from "../user.dto";
import { ArrayNotEmpty, IsArray, IsEnum, IsMongoId, IsOptional, IsString, Validate } from "class-validator";
import { Types } from "mongoose";
import { Transform } from "class-transformer";

class GetFilterQuery {
    feedType?: string;
    courseContent?: string;
    count?: boolean;
    limit?: number;
    page?: number;
    skip?: number;
    sort?: string;
}

class GradeSubjectTopic {
    @ApiProperty()
    @IsMongoId()
    _id?: string;
    @ApiProperty()
    name?: string;
}

class Attachment {
    @ApiProperty({ required: false })
    title?: string;
    @ApiProperty({ required: false })
    type?: 'document' | 'link' | 'image';
    @ApiProperty({ required: false })
    url?: string;
    @ApiProperty({ required: false })
    imageUrl?: string;
    @ApiProperty({ required: false })
    description?: string;
}

export class CreateDiscussionReq {
    @ApiProperty({ required: false })
    courseContent?: string;
    @ApiProperty({ required: false })
    grade?: GradeSubjectTopic;
    @ApiProperty({ required: false })
    subject?: GradeSubjectTopic;
    @ApiProperty({ required: false })
    topic?: GradeSubjectTopic;
    @ApiProperty({ required: false })
    description?: string;
    @ApiProperty({ required: false })
    classRooms?: string[];
    @ApiProperty({ required: false, type: [Attachment] })
    attachments?: Attachment[];
    @ApiProperty({ required: false })
    viewed?: number;
    @ApiProperty({ required: false, type: String })
    vote?: Types.ObjectId[];
    @ApiProperty({ required: false, type: String })
    notVote?: Types.ObjectId[];
    @ApiProperty({ required: false })
    isComment?: boolean;
    @ApiProperty({ required: false })
    isReply?: boolean;
    @ApiProperty({ required: false })
    parent?: string;
    @ApiProperty({ required: false })
    comments?: string[];
    @ApiProperty({ required: false, type: String })
    savedBy?: Types.ObjectId[];
    @ApiProperty({ required: false })
    feedType?: string;
    @ApiProperty({ required: false })
    active?: boolean;
    @ApiProperty({ required: false })
    allowComment?: boolean;
    @ApiProperty({ required: false })
    pin?: boolean;
    @ApiProperty({ required: false })
    flagged?: boolean;
    @ApiProperty({ required: false })
    questionNumber?: number;
    @ApiProperty({ required: false })
    location?: string;
}

class GetDiscussionQuery {
    feedType: string;
    courseContent: string;
    myQuestionsOnly: string;
    flagged: string;
    date: string;
    classes: string;
    publicDiscussion: string;
    text: string;
    tags: string;
    count: boolean;
    sort: string;
    limit: number;
    page: number;
    skip: number;
}

export class GetDiscussionReq {
    query: GetDiscussionQuery;
    instancekey: string;
    user: ReqUser;
    body: any;
}

export class GetDiscussionRes {

}

export class GetClassroomPostsReq {
    id: string;
    query: GetFilterQuery;
}

export class GetClassroomPostsRes {
    response: string;
}

export class GetYourPostsReq {
    id: string;
    query: GetFilterQuery;
    user: ReqUser;
}

export class GetYourPostsRes {
    response: string;
}

export class GetMySavedPostsReq {
    id: string;
    query: GetFilterQuery;
    user: ReqUser;
}

export class GetMySavedPostsRes {
    response: string;
}

export class GetFlagDiscussionReq {
    id: string;
}

export class GetFlagDiscussionRes {
    response: string;
}

export class GetUnflagDiscussionReq {
    id: string;
}

export class GetUnflagDiscussionRes {
    response: string;
}

export class GetFlaggedPostReq {
    query: GetFilterQuery;
    user: ReqUser;
    instancekey: string;
}

export class GetFlaggedPostRes {
    response: string;
}

export class GetOneFlaggedPostReq {
    id: string;
}

export class GetOneFlaggedPostRes {
    response: string;
}

export class GetDiscussionOfCourseReq {
    courseId: string;
    searchText: string;
    limit: number;
    skip: number;
    lastDays: string;
    unanswered: string;
    count: number;
    user: ReqUser;
}

export class GetDiscussionOfCourseRes {
    response: string;
}

export class GetOneReq {
    id: string;
    loadComments: boolean;
}

export class GetOneRes {
    response: string;
}

export class GetCommentsReq {
    id: string;
    page: number;
    user: ReqUser;
}

export class GetCommentsRes {
    response: string;
}

export class GetCreateReq {
    body: CreateDiscussionReq;
    user: ReqUser;
    instancekey?: string;
}

export class GetCreateRes {
    response: string;
}

export class PostCommentBody {
    @ApiProperty()
    description: string;
    @ApiProperty()
    attachments: Attachment[];
}

export class PostCommentReq {
    @IsMongoId()
    id: string;
    @ApiProperty()
    body: PostCommentBody;
    user: ReqUser;
}

export class PostCommentRes {
    response: string;
}

export class PostUpdateBody {
    @ApiProperty()
    newViewed: number;
    @ApiProperty()
    pin: boolean;
    @ApiProperty()
    description: string;
    @ApiProperty({ type: [Attachment] })
    attachments: Attachment[];
}

export class PostUpdateReq {
    id: string;
    @ApiProperty()
    body: PostUpdateBody;
    user: ReqUser;
}

export class PostUpdateRes {
    response: string;
}

export class GetVoteReq {
    id: string;
    user: ReqUser;
}

export class GetVoteRes {
    response: string;
}

export class GetUnvoteReq {
    id: string;
    user: ReqUser;
}

export class GetUnvoteRes {
    response: string;
}

export class GetNotvoteReq {
    id: string;
    user: ReqUser;
}

export class GetNotvoteRes {
    response: string;
}

export class GetUndonotvoteReq {
    id: string;
    user: ReqUser;
}

export class GetUndonotvoteRes {
    response: string;
}

export class GetDeleteReq {
    id: string;
    user: ReqUser;
}

export class GetDeleteRes {
    response: string;
}

export class SavePostReq {
    id: string;
    user: ReqUser;
}

export class SavePostRes {
    response: string;
}

export class UnsavedPostReq {
    id: string;
    user: ReqUser;
}

export class UnsavedPostRes {
    response: string;
}

class TeacherR {
    comment: string;
}

class StudentQ {
    comment: string;
    studentId: string;
    feedbackId: string;
}

export class CreateDissRespondBody {
    comment: string;
    feedType: string;
    classRooms: string[];
    studentQ: StudentQ[];
    teacherR: TeacherR;
}

export class createDiscussionRespondReq {
    id: string;
    body: CreateDissRespondBody;
    user: ReqUser;
}

export class createDiscussionRespondRes {
    response: string;
}