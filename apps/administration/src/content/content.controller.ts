import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ContentService } from './content.service';
import { protobufContentService } from '@app/common/grpc-clients/administration';
import {
  ContentRequest, FindSubjectUnitAndTopicsReq, GetAllContentReq, GetContentByCodeReq,
  GetContentByIdRequest, getContentsTaggedWithTopicReq, UpdateContentCountReq, UpdateContentRequest
} from '@app/common/dto/administration/content.dto';

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) { }

  @GrpcMethod(protobufContentService, 'GetAllContents')
  getAllContents(request: GetAllContentReq) {
    return this.contentService.getAllContents(request);
  }

  @GrpcMethod(protobufContentService, 'CountContent')
  countContent(request: GetAllContentReq) {
    return this.contentService.countContent(request);
  }

  @GrpcMethod(protobufContentService, 'CreateContent')
  createContent(request: ContentRequest) {
    return this.contentService.createContent(request);
  }

  @GrpcMethod(protobufContentService, 'GetContentById')
  getContentById(request: GetContentByIdRequest) {
    return this.contentService.getContentById(request);
  }

  @GrpcMethod(protobufContentService, 'UpdateContent')
  updateContent(request: UpdateContentRequest) {
    return this.contentService.updateContent(request);
  }

  @GrpcMethod(protobufContentService, 'GetRemoteContent')
  getRemoteContent(request: GetContentByIdRequest) {
    return this.contentService.getRemoteContent(request);
  }

  @GrpcMethod(protobufContentService, 'ContentfindByCode')
  contentfindByCode(request: GetContentByCodeReq) {
    return this.contentService.contentfindByCode(request);
  }

  @GrpcMethod(protobufContentService, 'ExportViewer')
  exportViewer(request: GetContentByIdRequest) {
    return this.contentService.exportViewer(request);
  }

  @GrpcMethod(protobufContentService, 'GetContentsTaggedWithTopic')
  getContentsTaggedWithTopic(request: getContentsTaggedWithTopicReq) {
    return this.contentService.getContentsTaggedWithTopic(request);
  }

  @GrpcMethod(protobufContentService, 'FindSubjectUnitAndTopics')
  findSubjectUnitAndTopics(request: FindSubjectUnitAndTopicsReq) {
    return this.contentService.findSubjectUnitAndTopics(request);
  }

  @GrpcMethod(protobufContentService, 'DeleteContent')
  deleteContent(request: GetContentByIdRequest) {
    return this.contentService.deleteContent(request);
  }

  @GrpcMethod(protobufContentService, 'UpdateContentCount')
  updateContentCount(request: UpdateContentCountReq) {
    return this.contentService.updateContentCount(request);
  }
}
