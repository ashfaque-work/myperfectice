import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";
import { ReqUser } from "../user.dto";

class Viewership {
    user: string;
    viewDate: Date;
}

class Feedbacks {
    user: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

export class CreateArticle {
    @ApiProperty()
    @IsMongoId()
    user?: string
    @ApiProperty()
    description: string;
    @ApiProperty()
    title: string;
    @ApiProperty()
    summary: string;
    @ApiProperty()
    link: string;
    viewed: number;
    @ApiProperty()
    tags: string[];
    viewership: Viewership[];
    feedbacks: Feedbacks[];
    avgRating: number;
    @ApiProperty()
    contentType: string;
    vote: string[];
    notVote: string[];
    createdAt: Date;
    updatedAt: Date;
    approved: boolean;
    @ApiProperty()
    isTop: boolean;
    active: boolean;
    @ApiProperty()
    expiresOn: Date;
    @ApiProperty()
    onlyVideo: boolean;
}

class IndexQuery {
    page: string;
    limit: string;
    sort: string;
    contentTypes: string;
    searchText: string;
}

export class IndexReq {
    query: IndexQuery;
    user: ReqUser
}

export class IndexRes {
    count: number;
    articles: CreateArticle;
}

export class CreateArticleReq {
    @ApiProperty()
    body: CreateArticle;
    user: ReqUser;
}

export class CreateArticleRes {
    response: string;
}

export class FindOneReq {
    id: string;
}

export class FindOneRes {
    response: CreateArticle;
}

export class VoteReq {
    id: string;
    user: ReqUser;
}

export class VoteRes {
    response: string;
}

export class UnvoteReq {
    id: string;
    user: ReqUser;
}

export class UnvoteRes {
    response: string;
}

export class NotvoteReq {
    id: string;
    user: ReqUser;
}

export class NotvoteRes {
    response: string;
}

export class UndoNotvoteReq {
    id: string;
    user: ReqUser;
}

export class UndoNotvoteRes {
    response: string;
}

export class UpdateArticle extends CreateArticle {
    @ApiProperty()
    approved: boolean;
}

export class UpdateArticleReq {
    id: string;
    body: UpdateArticle;   
}

export class UpdateArticleRes {
    response: CreateArticle;
}

export class DestroyArticleReq {
    id: string;
}

export class DestroyArticleRes {
    response: CreateArticle;
}

export class UpdateCountBody {
    @ApiProperty()
    feedback: string;
    @ApiProperty()
    rating: number;
    @ApiProperty()
    viewCount: number;
}

export class UpdateCountReq {
    user: ReqUser;
    id: string;
    body: UpdateCountBody;
}

export class UpdateCountRes {
    response: CreateArticle;
}