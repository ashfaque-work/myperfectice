import { Controller } from "@nestjs/common";
import { DiscussionsService } from "./discussions.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufDiscussionsService } from "@app/common/grpc-clients/auth/discussions";
import { GetClassroomPostsReq, GetCommentsReq, GetCreateReq, GetDeleteReq, GetDiscussionOfCourseReq, GetDiscussionReq, GetFlagDiscussionReq, GetFlaggedPostReq, GetMySavedPostsReq, GetNotvoteReq, GetOneFlaggedPostReq, GetOneReq, GetUndonotvoteReq, GetUnflagDiscussionReq, GetUnvoteReq, GetVoteReq, GetYourPostsReq, PostCommentReq, PostUpdateReq, SavePostReq, UnsavedPostReq, createDiscussionRespondReq } from "@app/common/dto/userManagement/discussions.dto";

@Controller()
export class DiscussionsController {
    constructor(private readonly discussionsService: DiscussionsService) {}

    @GrpcMethod(protobufDiscussionsService, 'GetDiscussion')
    async getDiscussion(request: GetDiscussionReq) {
        return this.discussionsService.getDiscussion(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'GetClassroomPosts')
    async getClassroomPosts(request: GetClassroomPostsReq) {
        return this.discussionsService.getClassroomPosts(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'GetYourPosts')
    async getYourPosts(request: GetYourPostsReq) {
        return this.discussionsService.getYourPosts(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'GetMySavedPosts')
    async getMySavedPosts(request: GetMySavedPostsReq) {
        return this.discussionsService.getMySavedPosts(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'FlagDiscussion')
    async flagDiscussion(request: GetFlagDiscussionReq) {
        return this.discussionsService.flagDiscussion(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'UnflagDiscussion')
    async unflagDiscussion(request: GetUnflagDiscussionReq) {
        return this.discussionsService.unflagDiscussion(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'GetFlaggedPost')
    async getFlaggedPost(request: GetFlaggedPostReq) {
        return this.discussionsService.getFlaggedPost(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'GetOneFlaggedPost')
    async getOneFlaggedPost(request: GetOneFlaggedPostReq) {
        return this.discussionsService.getOneFlaggedPost(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'GetDiscussionOfCourse')
    async getDiscussionOfCourse(request: GetDiscussionOfCourseReq) {
        return this.discussionsService.getDiscussionOfCourse(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'GetOne')
    async getOne(request: GetOneReq) {
        return this.discussionsService.getOne(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'GetComments')
    async getComments(request: GetCommentsReq) {
        return this.discussionsService.getComments(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'CreateDiscussion')
    async create(request: GetCreateReq) {      
        return this.discussionsService.create(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'Comment')
    async comment(request: PostCommentReq) {
        return this.discussionsService.comment(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'UpdateDiscussion')
    async update(request: PostUpdateReq) {
        // console.log("hello from update controller")
        return this.discussionsService.update(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'Vote')
    async vote(request: GetVoteReq) {
        return this.discussionsService.vote(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'Unvote')
    async unvote(request: GetUnvoteReq) {
        return this.discussionsService.unvote(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'Notvote')
    async notvote(request: GetNotvoteReq) {
        return this.discussionsService.notvote(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'Undonotvote')
    async undonotvote(request: GetUndonotvoteReq) {
        return this.discussionsService.undonotvote(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'Delete')
    async delete(request: GetDeleteReq) {
        return this.discussionsService.delete(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'SavePost')
    async savePost(request: SavePostReq) {
        return this.discussionsService.savePost(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'UnsavedPost')
    async unsavedPost(request: UnsavedPostReq) {
        return this.discussionsService.unsavedPost(request);
    }

    @GrpcMethod(protobufDiscussionsService, 'CreateDiscussionRespond')
    async createDiscussionRespond(request: createDiscussionRespondReq) {
        return this.discussionsService.createDiscussionRespond(request);
    }
}