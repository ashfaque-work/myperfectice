import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TopicService } from './topic.service';
import { protobufTopicService } from '@app/common/grpc-clients/administration';
import {
  TopicRequest, DeleteTopicRequest, GetOneTopicRequest, UpdateTopicRequest,
  GetAllTopicRequest, UpdateTopicStatusRequest, GetTopicBySlugRequest, GetTopicByUnitRequest
} from '@app/common/dto/administration/topic.dto';

@Controller()
export class TopicController {
  constructor(private readonly topicService: TopicService) { }

  @GrpcMethod(protobufTopicService, 'CreateTopic')
  createTopic(request: TopicRequest) {
    return this.topicService.createTopic(request);
  }

  @GrpcMethod(protobufTopicService, 'GetTopic')
  getTopic(request: GetAllTopicRequest) {
    return this.topicService.getTopic(request);
  }

  @GrpcMethod(protobufTopicService, 'GetOneTopic')
  getOneTopic(request: GetOneTopicRequest) {
    return this.topicService.getOneTopic(request);
  }

  @GrpcMethod(protobufTopicService, 'UpdateTopic')
  updateTopic(request: UpdateTopicRequest) {
    return this.topicService.updateTopic(request);
  }

  @GrpcMethod(protobufTopicService, 'UpdateTopicStatus')
  updateTopicStatus(request: UpdateTopicStatusRequest) {
    return this.topicService.updateTopicStatus(request);
  }

  @GrpcMethod(protobufTopicService, 'DeleteTopic')
  deleteTopic(request: DeleteTopicRequest) {
    return this.topicService.deleteTopic(request);
  }

  @GrpcMethod(protobufTopicService, 'GetTopicBySlug')
  getTopicBySlug(request: GetTopicBySlugRequest) {
    return this.topicService.getTopicBySlug(request);
  }

  @GrpcMethod(protobufTopicService, 'GetTopicByUnit')
  getTopicByUnit(request: GetTopicByUnitRequest) {
    return this.topicService.getTopicByUnit(request);
  }
}
