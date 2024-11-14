import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { protobufHostRateService } from '@app/common/grpc-clients/administration';
import { HostRateService } from './hostRate.service';
import { CreateHostRateReq, FeedbackReq, ShareLinkReq, TestSendMailReq } from '@app/common/dto/administration';

@Controller()
export class HostRateController {
  constructor(private readonly codesnippetService: HostRateService) { }

  @GrpcMethod(protobufHostRateService, 'CreateHostRate')
  createHostRate(request: CreateHostRateReq) {
    return this.codesnippetService.createHostRate(request);
  }

  @GrpcMethod(protobufHostRateService, 'ShareLink')
  shareLink(request: ShareLinkReq) {
    return this.codesnippetService.shareLink(request);
  }

  @GrpcMethod(protobufHostRateService, 'Feedback')
  feedback(request: FeedbackReq) {
    return this.codesnippetService.feedback(request);
  }

  @GrpcMethod(protobufHostRateService, 'TestSendMail')
  testSendMail(request: TestSendMailReq) {
    return this.codesnippetService.testSendMail(request);
  }


}
