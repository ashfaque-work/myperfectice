import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UnitService } from './unit.service';
import { protobufUnitService } from '@app/common/grpc-clients/administration';
import {
  UnitRequest, DeleteUnitRequest, GetOneUnitRequest, UpdateUnitRequest,
  GetAllUnitRequest, UpdateUnitStatusRequest
} from '@app/common/dto/administration/unit.dto';

@Controller()
export class UnitController {
  constructor(private readonly unitService: UnitService) { }

  @GrpcMethod(protobufUnitService, 'CreateUnit')
  createUnit(request: UnitRequest) {
    return this.unitService.createUnit(request);
  }

  @GrpcMethod(protobufUnitService, 'GetUnit')
  getUnit(request: GetAllUnitRequest) {
    return this.unitService.getUnit(request);
  }

  @GrpcMethod(protobufUnitService, 'GetOneUnit')
  getOneUnit(request: GetOneUnitRequest) {
    return this.unitService.getOneUnit(request);
  }

  @GrpcMethod(protobufUnitService, 'UpdateUnit')
  updateUnit(request: UpdateUnitRequest) {
    return this.unitService.updateUnit(request);
  }
  @GrpcMethod(protobufUnitService, 'UpdateUnitStatus')
  updateUnitStatus(request: UpdateUnitStatusRequest) {
    return this.unitService.updateUnitStatus(request);
  }

  @GrpcMethod(protobufUnitService, 'DeleteUnit')
  deleteUnit(request: DeleteUnitRequest) {
    return this.unitService.deleteUnit(request);
  }

  @GrpcMethod(protobufUnitService, 'GetUnitsBySubject')
  getUnitsBySubject(request: GetAllUnitRequest) {
    return this.unitService.getUnitsBySubject(request);
  }
}
