import { GetClassroomPostsReq, GetClassroomPostsRes, GetCommentsReq, GetCommentsRes, GetCreateReq, GetCreateRes, GetDeleteReq, GetDeleteRes, GetDiscussionOfCourseReq, GetDiscussionOfCourseRes, GetDiscussionReq, GetDiscussionRes, GetFlagDiscussionReq, GetFlagDiscussionRes, GetFlaggedPostReq, GetFlaggedPostRes, GetMySavedPostsReq, GetMySavedPostsRes, GetNotvoteReq, GetNotvoteRes, GetOneFlaggedPostReq, GetOneFlaggedPostRes, GetOneReq, GetOneRes, GetUndonotvoteReq, GetUndonotvoteRes, GetUnflagDiscussionReq, GetUnflagDiscussionRes, GetUnvoteReq, GetUnvoteRes, GetVoteReq, GetVoteRes, GetYourPostsReq, GetYourPostsRes, PostCommentReq, PostCommentRes, PostUpdateReq, PostUpdateRes, SavePostReq, SavePostRes, UnsavedPostReq, UnsavedPostRes, createDiscussionRespondReq, createDiscussionRespondRes } from "@app/common/dto/userManagement/discussions.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufDiscussionsService = 'AuthGrpcService';

export interface DiscussionsGrpcInterface {
    GetDiscussion(request: GetDiscussionReq): Promise<GetDiscussionRes>;
    GetClassroomPosts(request: GetClassroomPostsReq): Promise<GetClassroomPostsRes>;
    GetYourPosts(request: GetYourPostsReq): Promise<GetYourPostsRes>;
    GetMySavedPosts(request: GetMySavedPostsReq): Promise<GetMySavedPostsRes>;
    FlagDiscussion(request: GetFlagDiscussionReq): Promise<GetFlagDiscussionRes>;
    UnflagDiscussion(request: GetUnflagDiscussionReq): Promise<GetUnflagDiscussionRes>;
    GetFlaggedPost(request: GetFlaggedPostReq): Promise<GetFlaggedPostRes>;
    GetOneFlaggedPost(request: GetOneFlaggedPostReq): Promise<GetOneFlaggedPostRes>;
    GetDiscussionOfCourse(request: GetDiscussionOfCourseReq): Promise<GetDiscussionOfCourseRes>;
    GetOne(request: GetOneReq): Promise<GetOneRes>;
    GetComments(request: GetCommentsReq): Promise<GetCommentsRes>;
    CreateDiscussion(request: GetCreateReq): Promise<GetCreateRes>;
    Comment(request: PostCommentReq): Promise<PostCommentRes>;
    UpdateDiscussion(request: PostUpdateReq): Promise<PostUpdateRes>;
    Vote(request: GetVoteReq): Promise<GetVoteRes>;
    Unvote(request: GetUnvoteReq): Promise<GetUnvoteRes>;
    Notvote(request: GetNotvoteReq): Promise<GetNotvoteRes>;
    Undonotvote(request: GetUndonotvoteReq): Promise<GetUndonotvoteRes>;
    Delete(request: GetDeleteReq): Promise<GetDeleteRes>;
    SavePost(request: SavePostReq): Promise<SavePostRes>;
    UnsavedPost(request: UnsavedPostReq): Promise<UnsavedPostRes>;
    CreateDiscussionRespond(request: createDiscussionRespondReq): Promise<createDiscussionRespondRes>;
}

@Injectable()
export class DiscussionsGrpcServiceClientImpl implements DiscussionsGrpcInterface {
    private discussionsGrpcServiceClient: DiscussionsGrpcInterface;
    private readonly logger = new Logger(DiscussionsGrpcServiceClientImpl.name);

    constructor(
        @Inject('authGrpcService') private discussionsGrpcClient: ClientGrpc,
    ) {}

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.discussionsGrpcServiceClient = this.discussionsGrpcClient.getService<DiscussionsGrpcInterface>(protobufDiscussionsService)
        this.logger.debug('gRPC client initialized');
    }

    async GetDiscussion(request: GetDiscussionReq): Promise<GetDiscussionRes> {
        return await this.discussionsGrpcServiceClient.GetDiscussion(request);
    }

    async GetClassroomPosts(request: GetClassroomPostsReq): Promise<GetClassroomPostsRes> {
        return await this.discussionsGrpcServiceClient.GetClassroomPosts(request);
    }

    async GetYourPosts(request: GetYourPostsReq): Promise<GetYourPostsRes> {
        return await this.discussionsGrpcServiceClient.GetYourPosts(request);
    }

    async GetMySavedPosts(request: GetMySavedPostsReq): Promise<GetMySavedPostsRes> {
        return await this.discussionsGrpcServiceClient.GetMySavedPosts(request);
    }

    async FlagDiscussion(request: GetFlagDiscussionReq): Promise<GetFlagDiscussionRes> {
        return await this.discussionsGrpcServiceClient.FlagDiscussion(request);
    }

    async UnflagDiscussion(request: GetUnflagDiscussionReq): Promise<GetUnflagDiscussionRes> {
        return await this.discussionsGrpcServiceClient.UnflagDiscussion(request);
    }

    async GetFlaggedPost(request: GetFlaggedPostReq): Promise<GetFlaggedPostRes> {        
        return await this.discussionsGrpcServiceClient.GetFlaggedPost(request);
    }

    async GetOneFlaggedPost(request: GetOneFlaggedPostReq): Promise<GetOneFlaggedPostRes> {
        return await this.discussionsGrpcServiceClient.GetOneFlaggedPost(request);
    }

    async GetDiscussionOfCourse(request: GetDiscussionOfCourseReq): Promise<GetDiscussionOfCourseRes> {
        return await this.discussionsGrpcServiceClient.GetDiscussionOfCourse(request);
    }

    async GetOne(request: GetOneReq): Promise<GetOneRes> {
        return await this.discussionsGrpcServiceClient.GetOne(request);
    }

    async GetComments(request: GetCommentsReq): Promise<GetCommentsRes> {
        return await this.discussionsGrpcServiceClient.GetComments(request);
    }

    async CreateDiscussion(request: GetCreateReq): Promise<GetCreateRes> {
        return await this.discussionsGrpcServiceClient.CreateDiscussion(request);
    }

    async Comment(request: PostCommentReq): Promise<PostCommentRes> {
        return await this.discussionsGrpcServiceClient.Comment(request);
    }

    async UpdateDiscussion(request: PostUpdateReq): Promise<PostUpdateRes> {
        return await this.discussionsGrpcServiceClient.UpdateDiscussion(request);
    }

    async Vote(request: GetVoteReq): Promise<GetVoteRes> {
        return await this.discussionsGrpcServiceClient.Vote(request);
    }

    async Unvote(request: GetUnvoteReq): Promise<GetUnvoteRes> {
        return await this.discussionsGrpcServiceClient.Unvote(request);
    }

    async Notvote(request: GetNotvoteReq): Promise<GetNotvoteRes> {
        return await this.discussionsGrpcServiceClient.Notvote(request);
    }

    async Undonotvote(request: GetUndonotvoteReq): Promise<GetUndonotvoteRes> {
        return await this.discussionsGrpcServiceClient.Undonotvote(request);
    }

    async Delete(request: GetDeleteReq): Promise<GetDeleteRes> {
        return await this.discussionsGrpcServiceClient.Delete(request);
    }

    async SavePost(request: SavePostReq): Promise<SavePostRes> {
        return await this.discussionsGrpcServiceClient.SavePost(request);
    }

    async UnsavedPost(request: UnsavedPostReq): Promise<UnsavedPostRes> {
        return await this.discussionsGrpcServiceClient.UnsavedPost(request);
    }

    async CreateDiscussionRespond(request: createDiscussionRespondReq): Promise<createDiscussionRespondRes> {
        return await this.discussionsGrpcServiceClient.CreateDiscussionRespond(request)
    }
}