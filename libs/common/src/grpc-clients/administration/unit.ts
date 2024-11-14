import {
    UnitRequest, Unit, DeleteUnitRequest, DeleteUnitResponse, GetUnitResponse,
    GetOneUnitRequest, GetOneUnitResponse, UpdateUnitRequest, UpdateUnitResponse,
    GetAllUnitRequest, UpdateUnitStatusRequest, GetUnitsBySubjectRequest
} from '@app/common/dto/administration/unit.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufUnitService = 'AdministrationGrpcService';

export interface UnitGrpcInterface {
    CreateUnit(request: UnitRequest): Promise<Unit>;
    GetUnit(request: GetAllUnitRequest): Promise<GetUnitResponse>;
    GetOneUnit(request: GetOneUnitRequest): Promise<GetOneUnitResponse>;
    UpdateUnit(request: UpdateUnitRequest): Promise<UpdateUnitResponse>;
    UpdateUnitStatus(request: UpdateUnitStatusRequest): Promise<UpdateUnitResponse>;
    DeleteUnit(request: DeleteUnitRequest): Promise<DeleteUnitResponse>;
    GetUnitsBySubject(request: GetUnitsBySubjectRequest): Promise<GetUnitResponse>;
}

@Injectable()
export class UnitGrpcServiceClientImpl implements UnitGrpcInterface {
    private unitGrpcServiceClient: UnitGrpcInterface;
    private readonly logger = new Logger(UnitGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private unitGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.unitGrpcServiceClient =
            this.unitGrpcClient.getService<UnitGrpcInterface>(
                protobufUnitService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async CreateUnit(request: UnitRequest): Promise<Unit> {
        return await this.unitGrpcServiceClient.CreateUnit(request);
    }

    async GetUnit(request: GetAllUnitRequest): Promise<GetUnitResponse> {
        return await this.unitGrpcServiceClient.GetUnit(request);
    }

    async GetOneUnit(request: GetOneUnitRequest): Promise<GetOneUnitResponse> {
        return await this.unitGrpcServiceClient.GetOneUnit(request);
    }

    async UpdateUnit(request: UpdateUnitRequest): Promise<UpdateUnitResponse> {
        return await this.unitGrpcServiceClient.UpdateUnit(request);
    }

    async UpdateUnitStatus(request: UpdateUnitStatusRequest): Promise<UpdateUnitResponse> {
        return await this.unitGrpcServiceClient.UpdateUnitStatus(request);
    }

    async DeleteUnit(request: DeleteUnitRequest): Promise<DeleteUnitResponse> {
        return await this.unitGrpcServiceClient.DeleteUnit(request);
    }

    async GetUnitsBySubject(request: GetUnitsBySubjectRequest): Promise<GetUnitResponse> {
        return await this.unitGrpcServiceClient.GetUnitsBySubject(request);
    }
}
