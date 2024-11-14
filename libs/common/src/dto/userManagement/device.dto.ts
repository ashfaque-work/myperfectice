import { ApiProperty } from "@nestjs/swagger"
import { ReqUser } from "../user.dto";

export class InsertDeviceBody {
    @ApiProperty()
    uuid: string;
    @ApiProperty()
    platform: string;
    @ApiProperty()
    deviceToken: string;

}

export class InsertDeviceReq {
    body: InsertDeviceBody;
    user: ReqUser
}

export class InsertDeviceRes {
    response: string
}

export class RemoveDeviceReq {
    id: string;
    devicePlatform: string;
}

export class RemoveDeviceRes {
    response: string;
}

export class RemoveDeviceTokenReq {
    token: string;
    user: ReqUser;
}

export class RemoveDeviceTokenRes {
    response: string;
}

class Device {
    _id: string;
    user: string;
    platform: string;
    deviceToken: string;
    createdAt: Date;
    updatedAt: Date;
}

export class GetAllRes {
    response: Device[]
}