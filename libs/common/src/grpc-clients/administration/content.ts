import {
    Content, ContentRequest, CountContentRes, ExportViewerRes, FindSubjectUnitAndTopicsReq,
    FindSubjectUnitAndTopicsRes, GetAllContentReq, GetAllContentRes, GetContentByCodeReq, GetContentByIdRequest,
    GetContentByIdResponse, getContentsTaggedWithTopicReq, UpdateContentCountReq, UpdateContentRequest
} from '@app/common/dto/administration/content.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufContentService = 'AdministrationGrpcService';

export interface ContentGrpcInterface {
    GetAllContents(request: GetAllContentReq): Promise<GetAllContentRes>;
    CountContent(request: GetAllContentReq): Promise<CountContentRes>;
    CreateContent(request: ContentRequest): Promise<Content>;
    GetContentById(request: GetContentByIdRequest): Promise<GetContentByIdResponse>;
    UpdateContent(request: UpdateContentRequest): Promise<Content>;
    GetRemoteContent(request: GetContentByIdRequest): Promise<GetContentByIdResponse>;
    ContentfindByCode(request: GetContentByCodeReq): Promise<GetContentByIdResponse>;
    ExportViewer(request: GetContentByIdRequest): Promise<ExportViewerRes>;
    GetContentsTaggedWithTopic(request: getContentsTaggedWithTopicReq): Promise<GetAllContentRes>;
    FindSubjectUnitAndTopics(request: FindSubjectUnitAndTopicsReq): Promise<FindSubjectUnitAndTopicsRes>;
    DeleteContent(request: GetContentByIdRequest): Promise<GetContentByIdResponse>;
    UpdateContentCount(request: UpdateContentCountReq): Promise<Content>;
}

@Injectable()
export class ContentGrpcServiceClientImpl implements ContentGrpcInterface {
    private contentGrpcServiceClient: ContentGrpcInterface;
    private readonly logger = new Logger(ContentGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private contentGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.contentGrpcServiceClient =
            this.contentGrpcClient.getService<ContentGrpcInterface>(
                protobufContentService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async GetAllContents(request: GetAllContentReq): Promise<GetAllContentRes> {
        return await this.contentGrpcServiceClient.GetAllContents(request);
    }

    async CountContent(request: GetAllContentReq): Promise<CountContentRes> {
        return await this.contentGrpcServiceClient.CountContent(request);
    }

    async CreateContent(request: ContentRequest): Promise<Content> {
        return await this.contentGrpcServiceClient.CreateContent(request);
    }

    async GetContentById(request: GetContentByIdRequest): Promise<GetContentByIdResponse> {
        return await this.contentGrpcServiceClient.GetContentById(request);
    }

    async UpdateContent(request: UpdateContentRequest): Promise<Content> {
        return await this.contentGrpcServiceClient.UpdateContent(request);
    }

    async GetRemoteContent(request: GetContentByIdRequest): Promise<GetContentByIdResponse> {
        return await this.contentGrpcServiceClient.GetRemoteContent(request);
    }

    async ContentfindByCode(request: GetContentByCodeReq): Promise<GetContentByIdResponse> {
        return await this.contentGrpcServiceClient.ContentfindByCode(request);
    }

    async ExportViewer(request: GetContentByIdRequest): Promise<ExportViewerRes> {
        return await this.contentGrpcServiceClient.ExportViewer(request);
    }

    async GetContentsTaggedWithTopic(request: getContentsTaggedWithTopicReq): Promise<GetAllContentRes> {
        return await this.contentGrpcServiceClient.GetContentsTaggedWithTopic(request);
    }

    async FindSubjectUnitAndTopics(request: FindSubjectUnitAndTopicsReq): Promise<FindSubjectUnitAndTopicsRes> {
        return await this.contentGrpcServiceClient.FindSubjectUnitAndTopics(request);
    }

    async DeleteContent(request: GetContentByIdRequest): Promise<GetContentByIdResponse> {
        return await this.contentGrpcServiceClient.DeleteContent(request);
    }

    async UpdateContentCount(request: UpdateContentCountReq): Promise<Content> {
        return await this.contentGrpcServiceClient.UpdateContentCount(request);
    }
}
