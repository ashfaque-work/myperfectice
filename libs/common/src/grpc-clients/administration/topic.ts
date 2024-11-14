import {
    TopicRequest, Topic, DeleteTopicRequest, DeleteTopicResponse, GetTopicResponse,
    GetOneTopicRequest, GetOneTopicResponse, UpdateTopicRequest, UpdateTopicResponse,
    GetAllTopicRequest, UpdateTopicStatusRequest, GetTopicBySlugRequest, GetTopicByUnitRequest
} from '@app/common/dto/administration/topic.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufTopicService = 'AdministrationGrpcService';

export interface TopicGrpcInterface {
    CreateTopic(request: TopicRequest): Promise<Topic>;
    GetTopic(request: GetAllTopicRequest): Promise<GetTopicResponse>;
    GetOneTopic(request: GetOneTopicRequest): Promise<GetOneTopicResponse>;
    UpdateTopic(request: UpdateTopicRequest): Promise<UpdateTopicResponse>;
    UpdateTopicStatus(request: UpdateTopicStatusRequest): Promise<UpdateTopicResponse>;
    DeleteTopic(request: DeleteTopicRequest): Promise<DeleteTopicResponse>;
    GetTopicBySlug(request: GetTopicBySlugRequest): Promise<GetOneTopicResponse>;
    GetTopicByUnit(request: GetTopicByUnitRequest): Promise<GetTopicResponse>;
}

@Injectable()
export class TopicGrpcServiceClientImpl implements TopicGrpcInterface {
    private topicGrpcServiceClient: TopicGrpcInterface;
    private readonly logger = new Logger(TopicGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private topicGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.topicGrpcServiceClient =
            this.topicGrpcClient.getService<TopicGrpcInterface>(
                protobufTopicService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async CreateTopic(request: TopicRequest): Promise<Topic> {
        this.logger.debug('Calling CreateTopic function...');
        return await this.topicGrpcServiceClient.CreateTopic(request);
    }

    async GetTopic(request: GetAllTopicRequest): Promise<GetTopicResponse> {
        return await this.topicGrpcServiceClient.GetTopic(request);
    }

    async GetOneTopic(request: GetOneTopicRequest): Promise<GetOneTopicResponse> {
        return await this.topicGrpcServiceClient.GetOneTopic(request);
    }

    async UpdateTopic(request: UpdateTopicRequest): Promise<UpdateTopicResponse> {
        return await this.topicGrpcServiceClient.UpdateTopic(request);
    }

    async UpdateTopicStatus(request: UpdateTopicStatusRequest): Promise<UpdateTopicResponse> {
        return await this.topicGrpcServiceClient.UpdateTopicStatus(request);
    }

    async DeleteTopic(request: DeleteTopicRequest): Promise<DeleteTopicResponse> {
        return await this.topicGrpcServiceClient.DeleteTopic(request);
    }

    async GetTopicBySlug(request: GetTopicBySlugRequest): Promise<GetOneTopicResponse> {
        return await this.topicGrpcServiceClient.GetTopicBySlug(request);
    }

    async GetTopicByUnit(request: GetTopicByUnitRequest): Promise<GetTopicResponse> {
        return await this.topicGrpcServiceClient.GetTopicByUnit(request);
    }
}
