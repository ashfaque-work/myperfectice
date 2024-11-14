import { GetClassroomPostsReq, GetCommentsReq, GetCreateReq, GetDeleteReq, GetDiscussionOfCourseReq, GetDiscussionReq, GetFlagDiscussionReq, GetFlaggedPostReq, GetMySavedPostsReq, GetNotvoteReq, GetOneFlaggedPostReq, GetOneReq, GetUndonotvoteReq, GetUnflagDiscussionReq, GetUnvoteReq, GetVoteReq, GetYourPostsReq, PostCommentReq, PostUpdateReq, SavePostReq, UnsavedPostReq, createDiscussionRespondReq } from "@app/common/dto/userManagement/discussions.dto";
import { DiscussionsGrpcServiceClientImpl } from "@app/common/grpc-clients/auth/discussions";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DiscussionsService {
    constructor(private discussionsGrpcServiceClientImpl: DiscussionsGrpcServiceClientImpl) {}

    async getDiscussion(request: GetDiscussionReq) {
        return this.discussionsGrpcServiceClientImpl.GetDiscussion(request);
    }

    async getClassroomPosts(request: GetClassroomPostsReq) {
        return this.discussionsGrpcServiceClientImpl.GetClassroomPosts(request);
    }

    async getYourPosts(request: GetYourPostsReq) {
        return this.discussionsGrpcServiceClientImpl.GetYourPosts(request);
    }

    async getMySavedPosts(request: GetMySavedPostsReq) {
        return this.discussionsGrpcServiceClientImpl.GetMySavedPosts(request);
    }

    async flagDiscussion(request: GetFlagDiscussionReq) {
        return this.discussionsGrpcServiceClientImpl.FlagDiscussion(request);
    }

    async unflagDiscussion(request: GetUnflagDiscussionReq) {
        return this.discussionsGrpcServiceClientImpl.UnflagDiscussion(request);
    }

    async getFlaggedPost(request: GetFlaggedPostReq) {
        return this.discussionsGrpcServiceClientImpl.GetFlaggedPost(request);
    }

    async getOneFlaggedPost(request: GetOneFlaggedPostReq) {
        return this.discussionsGrpcServiceClientImpl.GetOneFlaggedPost(request);
    }

    async getDiscussionOfCourse(request: GetDiscussionOfCourseReq) {
        return this.discussionsGrpcServiceClientImpl.GetDiscussionOfCourse(request);
    }

    async getOne(request: GetOneReq) {
        return this.discussionsGrpcServiceClientImpl.GetOne(request);
    }

    async getComments(request: GetCommentsReq) {
        return this.discussionsGrpcServiceClientImpl.GetComments(request);
    }

    async create(request: GetCreateReq) {
        return this.discussionsGrpcServiceClientImpl.CreateDiscussion(request);
    }

    async comment(request: PostCommentReq) {
        return this.discussionsGrpcServiceClientImpl.Comment(request);
    }

    async updateDiscussion(request: PostUpdateReq) {
        return this.discussionsGrpcServiceClientImpl.UpdateDiscussion(request);
    }

    async vote(request: GetVoteReq) {
        return this.discussionsGrpcServiceClientImpl.Vote(request);
    }

    async unvote(request: GetUnvoteReq) {
        return this.discussionsGrpcServiceClientImpl.Unvote(request);
    }

    async notvote(request: GetNotvoteReq) {
        return this.discussionsGrpcServiceClientImpl.Notvote(request);
    }

    async undonotvote(request: GetUndonotvoteReq) {
        return this.discussionsGrpcServiceClientImpl.Undonotvote(request);
    }

    async delete(request: GetDeleteReq) {
        return this.discussionsGrpcServiceClientImpl.Delete(request);
    }

    async savePost(request: SavePostReq) {
        return this.discussionsGrpcServiceClientImpl.SavePost(request);
    }

    async unsavedPost(request: UnsavedPostReq) {
        return this.discussionsGrpcServiceClientImpl.UnsavedPost(request);
    }

    async createDiscussionRespond(request: createDiscussionRespondReq) {
        return this.discussionsGrpcServiceClientImpl.CreateDiscussionRespond(request);
    }
}