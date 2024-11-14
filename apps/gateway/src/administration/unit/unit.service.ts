import {
	UnitRequest, Unit, GetUnitResponse, GetOneUnitRequest, GetOneUnitResponse,
	UpdateUnitRequest, UpdateUnitResponse, DeleteUnitRequest, DeleteUnitResponse,
	GetAllUnitRequest,
	UpdateUnitStatusRequest,
	GetUnitsBySubjectRequest
} from '@app/common/dto/administration/unit.dto';
import { UnitGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UnitService {
	constructor(private unitGrpcServiceClientImpl: UnitGrpcServiceClientImpl) { }

	async createUnit(request: UnitRequest): Promise<Unit> {
		return await this.unitGrpcServiceClientImpl.CreateUnit(request);
	}

	async getUnit(request: GetAllUnitRequest): Promise<GetUnitResponse> {
		return await this.unitGrpcServiceClientImpl.GetUnit(request);
	}

	async getOneUnit(request: GetOneUnitRequest): Promise<GetOneUnitResponse> {
		return await this.unitGrpcServiceClientImpl.GetOneUnit(request);
	}

	async updateUnit(id: string, request: UpdateUnitRequest): Promise<UpdateUnitResponse> {
		const newRequest = { ...{ _id: id }, ...request }
		return await this.unitGrpcServiceClientImpl.UpdateUnit(newRequest);
	}

	async updateUnitStatus(id: string, request: UpdateUnitStatusRequest): Promise<UpdateUnitResponse> {
		const newRequest = { ...{ _id: id }, ...request }
		return await this.unitGrpcServiceClientImpl.UpdateUnitStatus(newRequest);
	}

	async deleteUnit(request: DeleteUnitRequest): Promise<DeleteUnitResponse> {
		return await this.unitGrpcServiceClientImpl.DeleteUnit(request);
	}

	async getUnitsBySubject(request: GetUnitsBySubjectRequest): Promise<GetUnitResponse> {
		return await this.unitGrpcServiceClientImpl.GetUnitsBySubject(request);
	}
}
