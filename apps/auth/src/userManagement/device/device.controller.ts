import { Controller } from "@nestjs/common";
import { DeviceService } from "./device.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufDeviceService } from "@app/common/grpc-clients/auth/device";
import { InsertDeviceReq, RemoveDeviceReq, RemoveDeviceTokenReq } from "@app/common/dto/userManagement/device.dto";

@Controller()
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) {}

    @GrpcMethod(protobufDeviceService, 'InsertDevice')
    async insertDevice(request: InsertDeviceReq) {
        return await this.deviceService.insertDevice(request);
    }

    @GrpcMethod(protobufDeviceService, 'RemoveDevice')
    async removeDevice(request: RemoveDeviceReq) {
        return await this.deviceService.removeDevice(request);
    }

    @GrpcMethod(protobufDeviceService, 'RemoveDeviceToken')
    async removeDeviceToken(request: RemoveDeviceTokenReq) {
        return await this.deviceService.removeDeviceToken(request);
    }

    @GrpcMethod(protobufDeviceService, 'GetAll')
    async getAll(request: {}) {
        return await this.deviceService.getAll(request);
    }
}