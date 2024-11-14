import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProgramService } from './program.service';
import { protobufProgramService } from '@app/common/grpc-clients/administration';
import {
  ProgramRequest, DeleteProgramRequest, GetOneProgramRequest, UpdateProgramRequest,
  UpdateProgramStatusRequest, GetAllProgramRequest, GetInstProgReq
} from '@app/common/dto/administration/program.dto';

@Controller()
export class ProgramController {
  constructor(private readonly programService: ProgramService) { }

  @GrpcMethod(protobufProgramService, 'CreateProgram')
  createProgram(request: ProgramRequest) {
    return this.programService.createProgram(request);
  }

  @GrpcMethod(protobufProgramService, 'GetProgram')
  getProgram(request: GetAllProgramRequest) {
    return this.programService.getProgram(request);
  }

  @GrpcMethod(protobufProgramService, 'GetOneProgram')
  getOneProgram(request: GetOneProgramRequest) {
    return this.programService.getOneProgram(request);
  }

  @GrpcMethod(protobufProgramService, 'UpdateProgram')
  updateProgram(request: UpdateProgramRequest) {
    return this.programService.updateProgram(request);
  }
  @GrpcMethod(protobufProgramService, 'UpdateProgramStatus')
  updateProgramStatus(request: UpdateProgramStatusRequest) {
    return this.programService.updateProgramStatus(request);
  }

  @GrpcMethod(protobufProgramService, 'DeleteProgram')
  deleteProgram(request: DeleteProgramRequest) {
    return this.programService.deleteProgram(request);
  }

  @GrpcMethod(protobufProgramService, 'GetInstitutePrograms')
  getInstitutePrograms(request: GetInstProgReq) {
    return this.programService.getInstitutePrograms(request);
  }

  @GrpcMethod(protobufProgramService, 'GetPublisherPrograms')
  getPublisherPrograms(request: GetInstProgReq) {
    return this.programService.getPublisherPrograms(request);
  }
}
