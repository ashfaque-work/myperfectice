import {
    LocationRequest, LocationResponse, GetLocationResponse, GetOneLocationRequest, ImportLocationReq, Empty,
    GetOneLocationResponse, DeleteLocationRequest, DeleteLocationResponse, UpdateLocationRequest, UpdateLocationResponse,
    GetUserLocationRequest, GetUserLocationResponse, UpdateLocationStatusRequest, UpdateLocationStatusResponse
} from '@app/common/dto/administration';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufAdministrationPackage = 'administration';
export const protobufAdministrationService = 'AdministrationGrpcService';

export interface AdministrationGrpcInterface {
    CreateLocation(request: LocationRequest): Promise<LocationResponse>;
    GetLocation(request: LocationRequest): Promise<GetLocationResponse>;
    GetOneLocation(request: GetOneLocationRequest): Promise<GetOneLocationResponse>;
    UpdateLocation(request: UpdateLocationRequest): Promise<UpdateLocationResponse>;
    UpdateStatus(request: UpdateLocationStatusRequest): Promise<UpdateLocationStatusResponse>;
    DeleteLocation(request: DeleteLocationRequest): Promise<DeleteLocationResponse>;
    GetUserLocation(request: GetUserLocationRequest): Promise<GetUserLocationResponse>;
    ImportLocation(request: ImportLocationReq): Promise<Empty>;
}

@Injectable()
export class AdministrationGrpcServiceClientImpl implements AdministrationGrpcInterface {
    private administrationGrpcServiceClient: AdministrationGrpcInterface;
    private readonly logger = new Logger(AdministrationGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private administrationGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.administrationGrpcServiceClient =
            this.administrationGrpcClient.getService<AdministrationGrpcInterface>(
                protobufAdministrationService,
            );
        this.logger.debug('gRPC client initialized.');
    }

    async CreateLocation(request: LocationRequest): Promise<LocationResponse> {
        return await this.administrationGrpcServiceClient.CreateLocation(request);
    }

    async GetLocation(request: LocationRequest): Promise<GetLocationResponse> {
        return await this.administrationGrpcServiceClient.GetLocation(request);
    }

    async GetOneLocation(request: GetOneLocationRequest): Promise<GetOneLocationResponse> {
        return await this.administrationGrpcServiceClient.GetOneLocation(request);
    }

    async UpdateLocation(request: UpdateLocationRequest): Promise<UpdateLocationResponse> {
        return await this.administrationGrpcServiceClient.UpdateLocation(request);
    }

    async UpdateStatus(request: UpdateLocationStatusRequest): Promise<UpdateLocationStatusResponse> {
        return await this.administrationGrpcServiceClient.UpdateStatus(request);
    }

    async DeleteLocation(request: DeleteLocationRequest): Promise<DeleteLocationResponse> {
        return await this.administrationGrpcServiceClient.DeleteLocation(request);
    }

    async GetUserLocation(request: GetUserLocationRequest): Promise<GetUserLocationResponse> {
        return await this.administrationGrpcServiceClient.GetUserLocation(request);
    }

    async ImportLocation(request: ImportLocationReq): Promise<Empty> {
        return await this.administrationGrpcServiceClient.ImportLocation(request);
    }
}
