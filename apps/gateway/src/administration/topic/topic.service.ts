import {
    TopicRequest, Topic, GetTopicResponse, GetOneTopicRequest, GetOneTopicResponse,
    UpdateTopicRequest, UpdateTopicResponse, DeleteTopicRequest, DeleteTopicResponse,
    GetAllTopicRequest, UpdateTopicStatusRequest, GetTopicBySlugRequest, GetTopicByUnitRequest
} from '@app/common/dto/administration/topic.dto';
import { TopicGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TopicService {
    constructor(private topicGrpcServiceClientImpl: TopicGrpcServiceClientImpl) { }

    async createTopic(request: TopicRequest): Promise<Topic> {
        return await this.topicGrpcServiceClientImpl.CreateTopic(request);
    }

    async getTopic(request: GetAllTopicRequest): Promise<GetTopicResponse> {
        return await this.topicGrpcServiceClientImpl.GetTopic(request);
    }

    async getOneTopic(request: GetOneTopicRequest): Promise<GetOneTopicResponse> {
        return await this.topicGrpcServiceClientImpl.GetOneTopic(request);
    }

    async updateTopic(request: UpdateTopicRequest): Promise<UpdateTopicResponse> {
        return await this.topicGrpcServiceClientImpl.UpdateTopic(request);
    }

    async updateTopicStatus(request: UpdateTopicStatusRequest): Promise<UpdateTopicResponse> {
        return await this.topicGrpcServiceClientImpl.UpdateTopicStatus(request);
    }

    async deleteTopic(request: DeleteTopicRequest): Promise<DeleteTopicResponse> {
        return await this.topicGrpcServiceClientImpl.DeleteTopic(request);
    }

    async getTopicBySlug(request: GetTopicBySlugRequest): Promise<GetOneTopicResponse> {
        return await this.topicGrpcServiceClientImpl.GetTopicBySlug(request);
    }

    async getTopicByUnit(request: GetTopicByUnitRequest): Promise<GetTopicResponse> {
        return await this.topicGrpcServiceClientImpl.GetTopicByUnit(request);
    }
}
