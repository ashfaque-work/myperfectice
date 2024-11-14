import { CreateArticleReq, CreateArticleRes, DestroyArticleReq, DestroyArticleRes, FindOneReq, FindOneRes, IndexReq, IndexRes, NotvoteReq, NotvoteRes, UndoNotvoteReq, UndoNotvoteRes, UnvoteReq, UnvoteRes, UpdateArticleReq, UpdateArticleRes, UpdateCountReq, UpdateCountRes, VoteReq, VoteRes } from "@app/common/dto/userManagement/article.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufArticleService = 'AuthGrpcService';

export interface ArticleGrpcInterface {
    Index(request: IndexReq): Promise<IndexRes>;
    Create(request: CreateArticleReq): Promise<CreateArticleRes>;
    FindOne(request: FindOneReq): Promise<FindOneRes>;
    Vote(request: VoteReq): Promise<VoteRes>;
    Unvote(request: UnvoteReq): Promise<UnvoteRes>;
    Notvote(request: NotvoteReq): Promise<NotvoteRes>;
    UndoNotvote(request: UndoNotvoteReq): Promise<UndoNotvoteRes>
    Update(request: UpdateArticleReq): Promise<UpdateArticleRes>
    UpdateCount(request: UpdateCountReq): Promise<UpdateCountRes>
    Destroy(request: DestroyArticleReq): Promise<DestroyArticleRes>
}

@Injectable()
export class ArticleGrpcServiceClientImpl implements ArticleGrpcInterface {
    private articleGrpcServiceClient: ArticleGrpcInterface;
    private readonly logger = new Logger(ArticleGrpcServiceClientImpl.name);

    constructor(
        @Inject('authGrpcService') private articleGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.articleGrpcServiceClient = this.articleGrpcClient.getService<ArticleGrpcInterface>(
            protobufArticleService
        )
        this.logger.debug('gRPC client initialized');
    }

    async Index(request: IndexReq): Promise<IndexRes> {
        
        return await this.articleGrpcServiceClient.Index(request);
    }

    async Create(request: CreateArticleReq): Promise<CreateArticleRes> {
        return await this.articleGrpcServiceClient.Create(request);
    }

    async FindOne(request: FindOneReq): Promise<FindOneRes> {
        return await this.articleGrpcServiceClient.FindOne(request);
    }

    async Vote(request: VoteReq): Promise<VoteRes> {
        return await this.articleGrpcServiceClient.Vote(request);
    }

    async Unvote(request: VoteReq): Promise<VoteRes> {
        return await this.articleGrpcServiceClient.Unvote(request);
    }

    async Notvote(request: NotvoteReq): Promise<NotvoteRes> {
        return await this.articleGrpcServiceClient.Notvote(request);
    }

    async UndoNotvote(request: UndoNotvoteReq): Promise<UndoNotvoteRes> {
        return await this.articleGrpcServiceClient.UndoNotvote(request);
    }

    async Update(request: UpdateArticleReq): Promise<UpdateArticleRes> {
        return await this.articleGrpcServiceClient.Update(request);
    }

    async UpdateCount(request: UpdateCountReq): Promise<UpdateCountRes> {
        return await this.articleGrpcServiceClient.UpdateCount(request);
    }

    async Destroy(request: DestroyArticleReq): Promise<DestroyArticleRes> {
        return await this.articleGrpcServiceClient.Destroy(request);
    }
}