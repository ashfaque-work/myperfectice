import { Controller } from "@nestjs/common";
import { UserFollowService } from "./userFollow.service";
import { GrpcMethod } from "@nestjs/microservices";

import { AmIFollowReq, AmIFollowRes, FollowListReq, FollowReq } from "@app/common/dto/userFollow.dto";
import { protobufUserFollowService } from "@app/common/grpc-clients/auth";

@Controller()
export class UserFollowController {
    constructor(private readonly userFollowService: UserFollowService) { }

    @GrpcMethod(protobufUserFollowService, 'AmIFollow')
    async amIFollow(request: AmIFollowReq) {
        console.log("microservice....")
        return await this.userFollowService.amIFollow(request);
    }

    @GrpcMethod(protobufUserFollowService, 'Follow')
    async follow(request: FollowReq) {
        return await this.userFollowService.follow(request);
    }

    @GrpcMethod(protobufUserFollowService, 'FollowList')
    async followList(request: FollowListReq) {
        return await this.userFollowService.followList(request);
    }
}