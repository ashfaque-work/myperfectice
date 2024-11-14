import { Empty, GetContactReq, ImportGSTReq } from '@app/common/dto/administration';
import { ToolGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ToolService {
	constructor(private toolGrpcServiceClientImpl: ToolGrpcServiceClientImpl) { }

	async importGST(request: ImportGSTReq): Promise<Empty> {
		return await this.toolGrpcServiceClientImpl.ImportGST(request);
	}

	async getContact(request: GetContactReq): Promise<Empty> {
		return await this.toolGrpcServiceClientImpl.GetContact(request);
	}
}
