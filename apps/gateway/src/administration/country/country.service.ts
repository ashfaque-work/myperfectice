import { FindAllStatesReq, FindSupportRes, GetInfoReq, GetInfoRes, GetStateReq, GetStateRes } from '@app/common/dto/administration';
import { CountryGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CountryService {
	constructor(private countryGrpcServiceClientImpl: CountryGrpcServiceClientImpl) { }

	async findSupport({}): Promise<FindSupportRes> {
		return await this.countryGrpcServiceClientImpl.FindSupport({});
	}

	async findAllStates(request: FindAllStatesReq): Promise<GetStateRes> {
		return await this.countryGrpcServiceClientImpl.FindAllStates(request);
	}

	async getInfo(request: GetInfoReq): Promise<GetInfoRes> {
		return await this.countryGrpcServiceClientImpl.GetInfo(request);
	}

	async getState(request: GetStateReq): Promise<GetStateRes> {
		return await this.countryGrpcServiceClientImpl.GetState(request);
	}
}
