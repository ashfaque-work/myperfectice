import {
  ProgramRequest, Program, GetProgramResponse, GetOneProgramRequest, GetOneProgramResponse,
  UpdateProgramRequest, UpdateProgramResponse, DeleteProgramRequest, DeleteProgramResponse,
  UpdateProgramStatusRequest, GetAllProgramRequest, GetInstProgReq
} from '@app/common/dto/administration/program.dto';
import { ProgramGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProgramService {
  constructor(private programGrpcServiceClientImpl: ProgramGrpcServiceClientImpl) { }

  async createProgram(request: ProgramRequest): Promise<Program> {
    return await this.programGrpcServiceClientImpl.CreateProgram(request);
  }

  async getProgram(request: GetAllProgramRequest): Promise<GetProgramResponse> {
    return await this.programGrpcServiceClientImpl.GetProgram(request);
  }

  async getOneProgram(request: GetOneProgramRequest): Promise<GetOneProgramResponse> {
    console.log('req in sss pp', request);
    return await this.programGrpcServiceClientImpl.GetOneProgram(request);
  }

  async updateProgram(id: string, request: UpdateProgramRequest): Promise<UpdateProgramResponse> {
    const newRequest = { ...{ _id: id }, ...request }
    return await this.programGrpcServiceClientImpl.UpdateProgram(newRequest);
  }
  async updateProgramStatus(id: string, request: UpdateProgramStatusRequest): Promise<UpdateProgramResponse> {
    const newRequest = { ...{ _id: id }, ...request }
    return await this.programGrpcServiceClientImpl.UpdateProgramStatus(newRequest);
  }

  async deleteProgram(request: DeleteProgramRequest): Promise<DeleteProgramResponse> {
    return await this.programGrpcServiceClientImpl.DeleteProgram(request);
  }

  async getInstitutePrograms(request: GetInstProgReq): Promise<GetProgramResponse> {
    return await this.programGrpcServiceClientImpl.GetInstitutePrograms(request);
  }

  async getPublisherPrograms(request: GetInstProgReq): Promise<GetProgramResponse> {
    return await this.programGrpcServiceClientImpl.GetPublisherPrograms(request);
  }
}
