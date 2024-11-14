import {
	Empty, CreateHostRateReq, ShareLinkReq, FeedbackReq, TestSendMailReq
} from '@app/common/dto/administration';
import { HostRateGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HostRateService {
	constructor(private hostRateGrpcServiceClientImpl: HostRateGrpcServiceClientImpl) { }

	async createHostRate(request: CreateHostRateReq): Promise<Empty> {
		return await this.hostRateGrpcServiceClientImpl.CreateHostRate(request);
	}

	async shareLink(request: ShareLinkReq): Promise<Empty> {
		return await this.hostRateGrpcServiceClientImpl.ShareLink(request);
	}

	async feedback(request: FeedbackReq): Promise<Empty> {
		return await this.hostRateGrpcServiceClientImpl.Feedback(request);
	}

	async testSendMail(request: TestSendMailReq): Promise<Empty> {
		return await this.hostRateGrpcServiceClientImpl.TestSendMail(request);
	}

	async test(): Promise<Empty> {
		const result = { date: new Date(), dateTime: new Date().getTime() }
		return result;
	}
}
