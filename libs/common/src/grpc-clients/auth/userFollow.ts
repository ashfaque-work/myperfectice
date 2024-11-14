import { AmIFollowReq, AmIFollowRes, FollowListReq, FollowListRes, FollowReq, FollowRes } from "@app/common/dto/userFollow.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufUserFollowService = 'AuthGrpcService';

export interface UserFollowGrpcInterface {
    AmIFollow(request: AmIFollowReq): Promise<AmIFollowRes>;
    Follow(request: FollowReq): Promise<FollowRes>;
    FollowList(request: FollowListReq): Promise<FollowListRes>;
}

@Injectable()
export class UserFollowGrpcServiceClientImpl implements UserFollowGrpcInterface {
    private userFollowGrpcServiceClient: UserFollowGrpcInterface;
    private readonly logger = new Logger(UserFollowGrpcServiceClientImpl.name)

    constructor(
        @Inject('authGrpcService') private userFollowGrpcClient: ClientGrpc,
    ) {}

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.userFollowGrpcServiceClient =
            this.userFollowGrpcClient.getService<UserFollowGrpcInterface>(
                protobufUserFollowService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async AmIFollow(request: AmIFollowReq): Promise<AmIFollowRes> {
        return await this.userFollowGrpcServiceClient.AmIFollow(request);
    }

    async Follow(request: FollowReq): Promise<FollowRes> {
        return await this.userFollowGrpcServiceClient.Follow(request);
    }
    
    async FollowList(request: FollowListReq): Promise<FollowListRes> {
        return await this.userFollowGrpcServiceClient.FollowList(request);
    }
}