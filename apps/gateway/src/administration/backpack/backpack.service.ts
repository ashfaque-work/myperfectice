import { BackpackReq, Backpack, GetBackpackRes, UpdateBackpackReq, DeleteBackpackReq } from '@app/common/dto/administration';
import { BackpackGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BackpackService {
	constructor(private backpackGrpcServiceClientImpl: BackpackGrpcServiceClientImpl) { }

	async getBackpack(request: BackpackReq): Promise<GetBackpackRes> {
		return await this.backpackGrpcServiceClientImpl.GetBackpack(request);
	}

	async updateBackpack(request: UpdateBackpackReq): Promise<Backpack> {
		return await this.backpackGrpcServiceClientImpl.UpdateBackpack(request);
	}

	async deleteBackpack(request: DeleteBackpackReq): Promise<Backpack> {
		return await this.backpackGrpcServiceClientImpl.DeleteBackpack(request);
	}

	async createBackpack(request: BackpackReq): Promise<Backpack> {
		return await this.backpackGrpcServiceClientImpl.CreateBackpack(request);
	}
}
