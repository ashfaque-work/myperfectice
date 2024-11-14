import { DeviceRepository } from "@app/common";
import { InsertDeviceReq, RemoveDeviceReq, RemoveDeviceTokenReq } from "@app/common/dto/userManagement/device.dto";
import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { GrpcInternalException } from "nestjs-grpc-exceptions";

@Injectable()
export class DeviceService {
    constructor(private readonly deviceRepository: DeviceRepository) {}

    async insertDevice(request: InsertDeviceReq) {
        try {
            if(request.body.uuid) {
                await this.deviceRepository.findOneAndUpdate({
                    user: new ObjectId(request.user._id),
                    platform: request.body.platform,
                    deviceUUID: request.body.uuid
                }, {
                    $set: {
                        deviceToken: request.body.deviceToken
                    }
                }, {
                    upsert: true
                })

                return {
                    response: "Ok"
                }
            }

            const device = await this.deviceRepository.findOne({user: request.user._id, platform: request.body.platform, deviceToken: request.body.deviceToken})

            if(!device) {
                let newDevice = await this.deviceRepository.create({
                    user: new ObjectId(request.user._id),
                    deviceToken: request.body.deviceToken,
                    platform: request.body.platform
                });

                return {
                    response: "Ok"
                }

            } else {
                return {
                    response: "Ok"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async removeDevice(request: RemoveDeviceReq) {
        try {
            const device = await this.deviceRepository.findOneAndDelete({
                user: new ObjectId(request.id),
                platform: request.devicePlatform
            })

            if(!device) {
                throw new Error("Not found")
            }

            return {
                response: "OK"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async removeDeviceToken(request: RemoveDeviceTokenReq) {
        try {
            const device = await this.deviceRepository.findOneAndDelete({
                user: new ObjectId(request.user._id),
                deviceToken: request.token
            })

            if(!device){
                throw new Error("Not found!")
            }

            return {
                response: "Ok"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAll(request: {}) {
        try {
            const found = await this.deviceRepository.find({}, {}, {sort: {createdAt: "asc"}});

            return {
                response: found
            }
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

}