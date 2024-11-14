import { Controller } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { protobufArticleService } from "@app/common/grpc-clients/auth/article";
import { CreateArticleReq, DestroyArticleReq, FindOneReq, IndexReq, NotvoteReq, UndoNotvoteReq, UnvoteReq, UpdateArticleReq, UpdateCountReq, VoteReq } from "@app/common/dto/userManagement/article.dto";
import { GrpcMethod } from "@nestjs/microservices";

@Controller()
export class ArticleController {
    constructor(private readonly articleService: ArticleService) { }

    @GrpcMethod(protobufArticleService, 'Index')
    async index(request: IndexReq) {
        return await this.articleService.index(request);
    }

    @GrpcMethod(protobufArticleService, 'Create')
    async create(request: CreateArticleReq) {
        return await this.articleService.create(request);
    }

    @GrpcMethod(protobufArticleService, 'FindOne')
    async findOne(request: FindOneReq) {
        return await this.articleService.findOne(request);
    }

    @GrpcMethod(protobufArticleService, 'Vote')
    async vote(request: VoteReq) {
        return await this.articleService.vote(request);
    }

    @GrpcMethod(protobufArticleService, 'Unvote')
    async unvote(request: UnvoteReq) {
        return await this.articleService.unvote(request);
    }

    @GrpcMethod(protobufArticleService, 'Notvote')
    async notvote(request: NotvoteReq) {
        return await this.articleService.notvote(request);
    }

    @GrpcMethod(protobufArticleService, 'UndoNotvote')
    async undoNotvote(request: UndoNotvoteReq) {
        return await this.articleService.undoNotvote(request);
    }

    @GrpcMethod(protobufArticleService, 'Update')
    async update(request: UpdateArticleReq) {
        return await this.articleService.update(request);
    }

    @GrpcMethod(protobufArticleService, 'UpdateCount')
    async updateCount(request: UpdateCountReq) {
        return await this.articleService.updateCount(request);
    }

    @GrpcMethod(protobufArticleService, 'Destroy')
    async destroy(request: DestroyArticleReq) {
        return await this.articleService.destroy(request);
    }
}