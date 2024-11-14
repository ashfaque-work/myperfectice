import {
	FindCodesnippetReq, Empty, GetCodeByUIDReq, UpdateCodesnippetReq, ChangePairCodingReq,
	CreateCodesnippetReq, DeleteCodesnippetReq
} from '@app/common/dto/administration';
import { CodesnippetGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CodesnippetService {
	constructor(private codesnippetGrpcServiceClientImpl: CodesnippetGrpcServiceClientImpl) { }

	async findCodesnippet(request: FindCodesnippetReq): Promise<Empty> {
		return await this.codesnippetGrpcServiceClientImpl.FindCodesnippet(request);
	}

	async getCodeByUID(request: GetCodeByUIDReq): Promise<Empty> {
		return await this.codesnippetGrpcServiceClientImpl.GetCodeByUID(request);
	}

	async updateCodesnippet(request: UpdateCodesnippetReq): Promise<Empty> {
		return await this.codesnippetGrpcServiceClientImpl.UpdateCodesnippet(request);
	}

	async changePairCoding(request: ChangePairCodingReq): Promise<Empty> {
		return await this.codesnippetGrpcServiceClientImpl.ChangePairCoding(request);
	}

	async createCodesnippet(request: CreateCodesnippetReq): Promise<Empty> {
		return await this.codesnippetGrpcServiceClientImpl.CreateCodesnippet(request);
	}

	async deleteCodesnippet(request: DeleteCodesnippetReq): Promise<Empty> {
		return await this.codesnippetGrpcServiceClientImpl.DeleteCodesnippet(request);
	}
}
