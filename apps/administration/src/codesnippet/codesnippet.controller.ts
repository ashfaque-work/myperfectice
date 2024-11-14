import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { protobufCodesnippetService } from '@app/common/grpc-clients/administration';
import {
  ChangePairCodingReq, CreateCodesnippetReq, DeleteCodesnippetReq, FindCodesnippetReq, GetCodeByUIDReq,
  UpdateCodesnippetReq
} from '@app/common/dto/administration/codesnippet.dto';
import { CodesnippetService } from './codesnippet.service';

@Controller()
export class CodesnippetController {
  constructor(private readonly codesnippetService: CodesnippetService) { }

  @GrpcMethod(protobufCodesnippetService, 'FindCodesnippet')
  findCodesnippet(request: FindCodesnippetReq) {
    return this.codesnippetService.findCodesnippet(request);
  }

  @GrpcMethod(protobufCodesnippetService, 'GetCodeByUID')
  getCodeByUID(request: GetCodeByUIDReq) {
    return this.codesnippetService.getCodeByUID(request);
  }

  @GrpcMethod(protobufCodesnippetService, 'UpdateCodesnippet')
  updateCodesnippet(request: UpdateCodesnippetReq) {
    return this.codesnippetService.updateCodesnippet(request);
  }

  @GrpcMethod(protobufCodesnippetService, 'ChangePairCoding')
  changePairCoding(request: ChangePairCodingReq) {
    return this.codesnippetService.changePairCoding(request);
  }

  @GrpcMethod(protobufCodesnippetService, 'CreateCodesnippet')
  createCodesnippet(request: CreateCodesnippetReq) {
    return this.codesnippetService.createCodesnippet(request);
  }

  @GrpcMethod(protobufCodesnippetService, 'DeleteCodesnippet')
  deleteCodesnippet(request: DeleteCodesnippetReq) {
    return this.codesnippetService.deleteCodesnippet(request);
  }
}
