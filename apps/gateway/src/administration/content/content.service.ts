import {
	ContentRequest, Content, GetContentByIdRequest, GetContentByIdResponse, UpdateContentRequest,
	GetAllContentReq, GetAllContentRes, CountContentRes, GetContentByCodeReq, ExportViewerRes,
	getContentsTaggedWithTopicReq, FindSubjectUnitAndTopicsReq, FindSubjectUnitAndTopicsRes, UpdateContentCountReq
} from '@app/common/dto/administration/content.dto';
import { ContentGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentService {
	constructor(private contentGrpcServiceClientImpl: ContentGrpcServiceClientImpl) { }

	async getAllContents(request: GetAllContentReq): Promise<GetAllContentRes> {
		return await this.contentGrpcServiceClientImpl.GetAllContents(request);
	}

	async countContent(request: GetAllContentReq): Promise<CountContentRes> {
		return await this.contentGrpcServiceClientImpl.CountContent(request);
	}

	async getContentById(request: GetContentByIdRequest): Promise<GetContentByIdResponse> {
		return await this.contentGrpcServiceClientImpl.GetContentById(request);
	}

	async updateContent(request: UpdateContentRequest): Promise<Content> {
		return await this.contentGrpcServiceClientImpl.UpdateContent(request);
	}

	async createContent(request: ContentRequest): Promise<Content> {
		return await this.contentGrpcServiceClientImpl.CreateContent(request);
	}

	async getRemoteContent(request: GetContentByIdRequest): Promise<GetContentByIdResponse> {
		return await this.contentGrpcServiceClientImpl.GetRemoteContent(request);
	}

	async contentfindByCode(request: GetContentByCodeReq): Promise<GetContentByIdResponse> {
		return await this.contentGrpcServiceClientImpl.ContentfindByCode(request);
	}

	async exportViewer(request: GetContentByIdRequest): Promise<ExportViewerRes> {
		return await this.contentGrpcServiceClientImpl.ExportViewer(request);
	}

	async getContentsTaggedWithTopic(request: getContentsTaggedWithTopicReq): Promise<GetAllContentRes> {
		return await this.contentGrpcServiceClientImpl.GetContentsTaggedWithTopic(request);
	}

	async findSubjectUnitAndTopics(request: FindSubjectUnitAndTopicsReq): Promise<FindSubjectUnitAndTopicsRes> {
		return await this.contentGrpcServiceClientImpl.FindSubjectUnitAndTopics(request);
	}

	async deleteContent(request: GetContentByIdRequest): Promise<GetContentByIdResponse> {
		return await this.contentGrpcServiceClientImpl.DeleteContent(request);
	}

	async updateContentCount(request: UpdateContentCountReq): Promise<Content> {
		return await this.contentGrpcServiceClientImpl.UpdateContentCount(request);
	}
}