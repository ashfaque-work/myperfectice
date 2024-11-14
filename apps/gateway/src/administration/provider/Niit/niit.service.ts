import { Empty, TestSendMailReq } from '@app/common/dto/administration';
import { NiitGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NiitService {
	constructor(private niitGrpcServiceClientImpl: NiitGrpcServiceClientImpl) { }

	async niitUserAttemptDetails(request: TestSendMailReq): Promise<Empty> {
		return await this.niitGrpcServiceClientImpl.NiitUserAttemptDetails(request);
	}
}
