import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { protobufToolService } from '@app/common/grpc-clients/administration';
import { ToolService } from './tool.service';
import { GetContactReq, ImportGSTReq } from '@app/common/dto/administration';

@Controller()
export class ToolController {
  constructor(private readonly codesnippetService: ToolService) { }
 
  @GrpcMethod(protobufToolService, 'ImportGST')
  importGST(request: ImportGSTReq) {
    return this.codesnippetService.importGST(request);
  }
 
  @GrpcMethod(protobufToolService, 'GetContact')
  getContact(request: GetContactReq) {
    return this.codesnippetService.getContact(request);
  }
}
