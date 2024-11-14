import { AmIFollowReq, AmIFollowRes, FollowListReq, FollowListRes, FollowReq, FollowRes } from "@app/common/dto/userFollow.dto";
import { UserFollowGrpcServiceClientImpl } from "@app/common/grpc-clients/auth/userFollow";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserFollowService {
    constructor(private userFollowGrpcServiceClientImpl: UserFollowGrpcServiceClientImpl) { }

    async amIFollow(request: AmIFollowReq): Promise<AmIFollowRes> {
        return await this.userFollowGrpcServiceClientImpl.AmIFollow(request);
    }

    async follow(request: FollowReq): Promise<FollowRes> {
        return await this.userFollowGrpcServiceClientImpl.Follow(request);
    }

    async followList(request: FollowListReq): Promise<FollowListRes> {       
        return await this.userFollowGrpcServiceClientImpl.FollowList(request);
    }
}