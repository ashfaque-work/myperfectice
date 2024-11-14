import { Empty, TestSendMailReq } from '@app/common/dto/administration';
import { PlatformByNumbersGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlatformByNumbersService {
	constructor(private platformByNumbersGrpcServiceClientImpl: PlatformByNumbersGrpcServiceClientImpl) { }

	async getplatformByNumbers(request: TestSendMailReq): Promise<Empty> {
		return await this.platformByNumbersGrpcServiceClientImpl.GetplatformByNumbers(request);
	}
}
