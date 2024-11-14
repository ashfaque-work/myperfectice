import { GetAllRes, InsertDeviceReq, InsertDeviceRes, RemoveDeviceReq, RemoveDeviceRes, RemoveDeviceTokenReq, RemoveDeviceTokenRes } from "@app/common/dto/userManagement/device.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufDeviceService = 'AuthGrpcService';

export interface DeviceGrpcInterface {
    InsertDevice(request: InsertDeviceReq): Promise<InsertDeviceRes>;
    RemoveDevice(request: RemoveDeviceReq): Promise<RemoveDeviceRes>;
    RemoveDeviceToken(request: RemoveDeviceTokenReq): Promise<RemoveDeviceTokenRes>;
    GetAll(request: {}): Promise<GetAllRes>;
}

@Injectable()
export class DeviceGrpcServiceClientImpl implements DeviceGrpcInterface {
    private deviceGrpcServiceClient: DeviceGrpcInterface;
    private readonly logger = new Logger(DeviceGrpcServiceClientImpl.name);

    constructor(
        @Inject('authGrpcService') private deviceGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.deviceGrpcServiceClient = this.deviceGrpcClient.getService<DeviceGrpcInterface>(protobufDeviceService)
        this.logger.debug('gRPC client initialized');
    }

    async InsertDevice(request: InsertDeviceReq): Promise<InsertDeviceRes> {
        return await this.deviceGrpcServiceClient.InsertDevice(request);
    }

    async RemoveDevice(request: RemoveDeviceReq): Promise<RemoveDeviceRes> {
        return await this.deviceGrpcServiceClient.RemoveDevice(request);
    }

    async RemoveDeviceToken(request: RemoveDeviceTokenReq): Promise<RemoveDeviceTokenRes> {
        return await this.deviceGrpcServiceClient.RemoveDeviceToken(request);
    }

    async GetAll(request: {}): Promise<GetAllRes> {
        return await this.deviceGrpcServiceClient.GetAll(request);
    }
}