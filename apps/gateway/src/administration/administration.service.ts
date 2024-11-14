import {
  LocationRequest, LocationResponse, GetLocationResponse, GetOneLocationRequest, ImportLocationReq, Empty,
  GetOneLocationResponse, DeleteLocationRequest, DeleteLocationResponse, UpdateLocationRequest, UpdateLocationResponse,
  GetUserLocationRequest, GetUserLocationResponse, UpdateLocationStatusRequest, UpdateLocationStatusResponse,
} from '@app/common/dto/administration';
import { AdministrationGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdministrationService {
  constructor(private administrationGrpcServiceClientImpl: AdministrationGrpcServiceClientImpl) { }

  async createLocation(request: LocationRequest): Promise<LocationResponse> {
    return await this.administrationGrpcServiceClientImpl.CreateLocation(request);
  }

  async getLocation(request: LocationRequest): Promise<GetLocationResponse> {
    return await this.administrationGrpcServiceClientImpl.GetLocation(request);
  }

  async getOneLocation(request: GetOneLocationRequest): Promise<GetOneLocationResponse> {
    return await this.administrationGrpcServiceClientImpl.GetOneLocation(request);
  }

  async updateLocation(id: string, request: UpdateLocationRequest): Promise<UpdateLocationResponse> {
    const newRequest = { ...{ _id: id }, ...request }
    return await this.administrationGrpcServiceClientImpl.UpdateLocation(newRequest);
  }

  async updateStatus(id: string, request: UpdateLocationStatusRequest): Promise<UpdateLocationStatusResponse> {
    const newRequest = { ...{ _id: id }, ...request }
    return await this.administrationGrpcServiceClientImpl.UpdateStatus(newRequest);
  }

  async deleteLocation(request: DeleteLocationRequest): Promise<DeleteLocationResponse> {
    return await this.administrationGrpcServiceClientImpl.DeleteLocation(request);
  }

  async getUserLocation(request: GetUserLocationRequest): Promise<GetUserLocationResponse> {
    return await this.administrationGrpcServiceClientImpl.GetUserLocation(request);
  }

  async importLocation(request: ImportLocationReq): Promise<Empty> {
    return await this.administrationGrpcServiceClientImpl.ImportLocation(request);
  }
}
