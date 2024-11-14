import { Empty, UserAttemptDetailsReq } from '@app/common/dto/administration';
import { BoardInfinityGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardInfinityService {
	constructor(private boardInfinityGrpcServiceClientImpl: BoardInfinityGrpcServiceClientImpl) { }

	async ininityUserAttemptDetails(request: UserAttemptDetailsReq): Promise<Empty> {
		return await this.boardInfinityGrpcServiceClientImpl.InfinityUserAttemptDetails(request);
	}
}
