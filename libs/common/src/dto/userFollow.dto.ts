import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";
import { ReqUser } from "./user.dto";
import exp from "constants";

export class AmIFollowParam {
    @ApiProperty()
    @IsMongoId()
    userId: string;
}

export class AmIFollowReq {
    params: AmIFollowParam;
    user: ReqUser
}

export class AmIFollowRes {
    response: string;
}

class FollowBody {
    @ApiProperty()
    unfollowMe: boolean;
    @ApiProperty()
    @IsMongoId()
    userId: string;
    @ApiProperty()
    state: boolean;
}

class FollowDatas {
    @ApiProperty()
    _id: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    followingId: string;
    @ApiProperty()
    status: boolean;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updatedAt: Date;
}

export class FollowReq {
    @ApiProperty()
    body: FollowBody
    user: ReqUser;
}

export class FollowRes {
    @ApiProperty()
    response: FollowDatas;
}

export class FollowList {
    @ApiProperty()
    userId: string;
    @ApiProperty()
    type: string;
    @ApiProperty()
    id: string;
}

export class FollowListReq {
    @ApiProperty()
    body: FollowList;
}

export class FollowListRes {
    response: FollowDatas;
}