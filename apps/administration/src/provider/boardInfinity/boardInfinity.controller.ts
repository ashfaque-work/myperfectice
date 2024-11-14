import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { protobufBoardInfinityService } from '@app/common/grpc-clients/administration';
import { BoardInfinityService } from './boardInfinity.service';
import { UserAttemptDetailsReq } from '@app/common/dto/administration';

@Controller()
export class BoardInfinityController {
  constructor(private readonly codesnippetService: BoardInfinityService) { }
 
  @GrpcMethod(protobufBoardInfinityService, 'InfinityUserAttemptDetails')
  ininityUserAttemptDetails(request: UserAttemptDetailsReq) {
    return this.codesnippetService.ininityUserAttemptDetails(request);
  }
}
