import { InsertDeviceReq, RemoveDeviceReq, RemoveDeviceTokenReq } from "@app/common/dto/userManagement/device.dto";
import { DeviceGrpcServiceClientImpl } from "@app/common/grpc-clients/auth/device";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DeviceService {
    constructor(private deviceGrpcServiceClientImpl: DeviceGrpcServiceClientImpl) {}

    async insertDevice(request: InsertDeviceReq) {
        return this.deviceGrpcServiceClientImpl.InsertDevice(request);
    }

    async removeDevice(request: RemoveDeviceReq) {
        return this.deviceGrpcServiceClientImpl.RemoveDevice(request);
    }

    async removeDeviceToken(request: RemoveDeviceTokenReq) {
        return this.deviceGrpcServiceClientImpl.RemoveDeviceToken(request);
    }

    async getAll(request: {}) {
        return this.deviceGrpcServiceClientImpl.GetAll(request);
    }
}