import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ServiceService } from './service.service';
import { protobufServiceService } from '@app/common/grpc-clients/administration';
import {
  CreateServiceReq, GetServiceReq, EditServiceReq,
  FindServicesReq, RevokeServiceReq,
  DeleteServiceReq,
  GetTaggingForStudentsReq,
  GetServiceMembersReq
} from '@app/common/dto/administration';

@Controller()
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) { }

  @GrpcMethod(protobufServiceService, 'CreateService')
  createService(request: CreateServiceReq) {
    return this.serviceService.createService(request);
  }

  @GrpcMethod(protobufServiceService, 'GetTaggingForStudents')
  getTaggingForStudents(request: GetTaggingForStudentsReq) {
    return this.serviceService.getTaggingForStudents(request);
  }

  @GrpcMethod(protobufServiceService, 'RevokeService')
  revokeService(request: RevokeServiceReq) {
    return this.serviceService.revokeService(request);
  }

  @GrpcMethod(protobufServiceService, 'PublishService')
  publishService(request: RevokeServiceReq) {
    return this.serviceService.publishService(request);
  }

  @GrpcMethod(protobufServiceService, 'EditService')
  editService(request: EditServiceReq) {
    return this.serviceService.editService(request);
  }

  @GrpcMethod(protobufServiceService, 'DeleteService')
  deleteService(request: DeleteServiceReq) {
    return this.serviceService.deleteService(request);
  }
  
  @GrpcMethod(protobufServiceService, 'FindServices')
  findServices(request: FindServicesReq) {
    return this.serviceService.findServices(request);
  }

  @GrpcMethod(protobufServiceService, 'FindPublicServices')
  findPublicServices(request: FindServicesReq) {
    return this.serviceService.findPublicServices(request);
  }

  @GrpcMethod(protobufServiceService, 'GetServiceMembers')
  getServiceMembers(request: GetServiceMembersReq) {
    return this.serviceService.getServiceMembers(request);
  }

  @GrpcMethod(protobufServiceService, 'GetTaggingServicesForStudent')
  getTaggingServicesForStudent(request: GetServiceReq) {
    return this.serviceService.getTaggingServicesForStudent(request);
  }
  
  @GrpcMethod(protobufServiceService, 'GetService')
  getService(request: GetServiceReq) {
    return this.serviceService.getService(request);
  }


}
