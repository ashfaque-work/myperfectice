import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { protobufBackpackService } from '@app/common/grpc-clients/administration';
import { DeleteBackpackReq, UpdateBackpackReq, BackpackReq } from '@app/common/dto/administration/backpack.dto';
import { BackpackService } from './backpack.service';

@Controller()
export class BackpackController {
  constructor(private readonly backpackService: BackpackService) { }

  @GrpcMethod(protobufBackpackService, 'GetBackpack')
  getBackpack(request: BackpackReq) {
    return this.backpackService.getBackpack(request);
  }

  @GrpcMethod(protobufBackpackService, 'UpdateBackpack')
  updateBackpack(request: UpdateBackpackReq) {
    return this.backpackService.updateBackpack(request);
  }

  @GrpcMethod(protobufBackpackService, 'DeleteBackpack')
  deleteBackpack(request: DeleteBackpackReq) {
    return this.backpackService.deleteBackpack(request);
  }

  @GrpcMethod(protobufBackpackService, 'CreateBackpack')
  createBackpack(request: BackpackReq) {
    return this.backpackService.createBackpack(request);
  }
}
