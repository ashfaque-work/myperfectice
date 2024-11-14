import {
    ProgramRequest, Program, DeleteProgramRequest, DeleteProgramResponse, GetProgramResponse,
    GetOneProgramRequest, GetOneProgramResponse, UpdateProgramRequest, UpdateProgramResponse,
    UpdateProgramStatusRequest, GetAllProgramRequest, GetInstProgReq
} from '@app/common/dto/administration/program.dto';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufProgramService = 'AdministrationGrpcService';

export interface ProgramGrpcInterface {
    CreateProgram(request: ProgramRequest): Promise<Program>;
    GetProgram(request: GetAllProgramRequest): Promise<GetProgramResponse>;
    GetOneProgram(request: GetOneProgramRequest): Promise<GetOneProgramResponse>;
    UpdateProgram(request: UpdateProgramRequest): Promise<UpdateProgramResponse>;
    UpdateProgramStatus(request: UpdateProgramStatusRequest): Promise<UpdateProgramResponse>;
    DeleteProgram(request: DeleteProgramRequest): Promise<DeleteProgramResponse>;
    GetInstitutePrograms(request: GetInstProgReq): Promise<GetProgramResponse>;
    GetPublisherPrograms(request: GetInstProgReq): Promise<GetProgramResponse>;
}

@Injectable()
export class ProgramGrpcServiceClientImpl implements ProgramGrpcInterface {
    private programGrpcServiceClient: ProgramGrpcInterface;
    private readonly logger = new Logger(ProgramGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private programGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.programGrpcServiceClient =
            this.programGrpcClient.getService<ProgramGrpcInterface>(
                protobufProgramService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async CreateProgram(request: ProgramRequest): Promise<Program> {
        return await this.programGrpcServiceClient.CreateProgram(request);
    }

    async GetProgram(request: GetAllProgramRequest): Promise<GetProgramResponse> {
        return await this.programGrpcServiceClient.GetProgram(request);
    }

    async GetOneProgram(request: GetOneProgramRequest): Promise<GetOneProgramResponse> {
        return await this.programGrpcServiceClient.GetOneProgram(request);
    }

    async UpdateProgram(request: UpdateProgramRequest): Promise<UpdateProgramResponse> {
        return await this.programGrpcServiceClient.UpdateProgram(request);
    }

    async UpdateProgramStatus(request: UpdateProgramStatusRequest): Promise<UpdateProgramResponse> {
        return await this.programGrpcServiceClient.UpdateProgramStatus(request);
    }

    async DeleteProgram(request: DeleteProgramRequest): Promise<DeleteProgramResponse> {
        return await this.programGrpcServiceClient.DeleteProgram(request);
    }

    async GetInstitutePrograms(request: GetInstProgReq): Promise<GetProgramResponse> {
        return await this.programGrpcServiceClient.GetInstitutePrograms(request);
    }

    async GetPublisherPrograms(request: GetInstProgReq): Promise<GetProgramResponse> {
        return await this.programGrpcServiceClient.GetPublisherPrograms(request);
    }
}
