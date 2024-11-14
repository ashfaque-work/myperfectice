import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { protobufNiitService } from '@app/common/grpc-clients/administration';
import { NiitService } from './niit.service';
import { TestSendMailReq } from '@app/common/dto/administration';

@Controller()
export class NiitController {
  constructor(private readonly niitService: NiitService) { }
 
  @GrpcMethod(protobufNiitService, 'NiitUserAttemptDetails')
  niitUserAttemptDetails(request: TestSendMailReq) {
    return this.niitService.niitUserAttemptDetails(request);
  }
}
