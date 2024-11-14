import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { protobufPlatformByNumbersService } from '@app/common/grpc-clients/administration';
import { PlatformByNumbersService } from './platformByNumbers.service';
import { TestSendMailReq } from '@app/common/dto/administration';

@Controller()
export class PlatformByNumbersController {
  constructor(private readonly codesnippetService: PlatformByNumbersService) { }
 
  @GrpcMethod(protobufPlatformByNumbersService, 'GetplatformByNumbers')
  getplatformByNumbers(request: TestSendMailReq) {
    return this.codesnippetService.getplatformByNumbers(request);
  }
}
