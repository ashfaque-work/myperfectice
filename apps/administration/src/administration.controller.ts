import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AdministrationService } from './administration.service';
import { protobufAdministrationService } from '@app/common/grpc-clients/administration';
import {
  LocationRequest, GetOneLocationRequest, UpdateLocationRequest, DeleteLocationRequest,
  GetUserLocationRequest, UpdateLocationStatusRequest, ImportLocationReq,
} from '@app/common/dto/administration/location.dto';
@Controller()
export class AdministrationController {
  constructor(private readonly administrationService: AdministrationService) { }

  @GrpcMethod(protobufAdministrationService, 'CreateLocation')
  createLocation(request: LocationRequest) {
    return this.administrationService.createLocation(request);
  }

  @GrpcMethod(protobufAdministrationService, 'GetLocation')
  getLocation(request: LocationRequest) {
    return this.administrationService.getLocation(request);
  }

  @GrpcMethod(protobufAdministrationService, 'GetOneLocation')
  getOneLocation(request: GetOneLocationRequest) {
    return this.administrationService.getOneLocation(request);
  }

  @GrpcMethod(protobufAdministrationService, 'UpdateLocation')
  updateLocation(request: UpdateLocationRequest) {
    return this.administrationService.updateLocation(request);
  }

  @GrpcMethod(protobufAdministrationService, 'UpdateStatus')
  updateStatus(request: UpdateLocationStatusRequest) {
    return this.administrationService.updateStatus(request);
  }

  @GrpcMethod(protobufAdministrationService, 'DeleteLocation')
  deleteLocation(request: DeleteLocationRequest) {
    return this.administrationService.deleteLocation(request);
  }

  @GrpcMethod(protobufAdministrationService, 'GetUserLocation')
  getUserLocation(request: GetUserLocationRequest) {
    return this.administrationService.getUserLocation(request);
  }

  @GrpcMethod(protobufAdministrationService, 'ImportLocation')
  importLocation(request: ImportLocationReq) {
    return this.administrationService.importLocation(request);
  }
}
