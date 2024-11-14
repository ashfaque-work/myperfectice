import { CreateArticleReq, DestroyArticleReq, FindOneReq, IndexReq, NotvoteReq, UndoNotvoteReq, UpdateArticleReq, UpdateCountReq, VoteReq } from "@app/common/dto/userManagement/article.dto";
import { ArticleGrpcServiceClientImpl } from "@app/common/grpc-clients/auth/article";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ArticleService {
    constructor(private articleGrpcServiceClientImpl: ArticleGrpcServiceClientImpl) {}

    async index(request: IndexReq) {
        return await this.articleGrpcServiceClientImpl.Index(request)
    }

    async create(request: CreateArticleReq) {
        return await this.articleGrpcServiceClientImpl.Create(request);
    }

    async findOne(request: FindOneReq) {
        return await this.articleGrpcServiceClientImpl.FindOne(request);
    }

    async vote(request: VoteReq) {
        return await this.articleGrpcServiceClientImpl.Vote(request);
    }

    async unvote(request: VoteReq) {
        return await this.articleGrpcServiceClientImpl.Unvote(request);
    }

    async notvote(request: NotvoteReq) {
        return await this.articleGrpcServiceClientImpl.Notvote(request);
    }

    async undoNotvote(request: UndoNotvoteReq) {
        return await this.articleGrpcServiceClientImpl.UndoNotvote(request);
    }

    async update(request: UpdateArticleReq) {
        return await this.articleGrpcServiceClientImpl.Update(request);
    }

    async updateCount(request: UpdateCountReq) {
        return await this.articleGrpcServiceClientImpl.UpdateCount(request)
    }

    async destroy(request: DestroyArticleReq) {
        return await this.articleGrpcServiceClientImpl.Destroy(request);
    }
}