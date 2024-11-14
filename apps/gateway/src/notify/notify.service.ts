import { Empty, FindOneReq, GetNotificationsReq } from '@app/common';
import { NotifyGrpcClientService } from '@app/common/grpc-clients/notify';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotifyService {
    constructor(private notifyGrpcClientService: NotifyGrpcClientService) { }

    async index(request: GetNotificationsReq): Promise<Empty> {
        return await this.notifyGrpcClientService.Index(request);
    }

    async countUnread(request: GetNotificationsReq): Promise<Empty> {
        return await this.notifyGrpcClientService.CountUnread(request);
    }

    async findOne(request: FindOneReq): Promise<Empty> {
        return await this.notifyGrpcClientService.FindOne(request);
    }

    async setReadMsg(request: FindOneReq): Promise<Empty> {
        return await this.notifyGrpcClientService.SetReadMsg(request);
    }

    async removeByUser(request: FindOneReq): Promise<Empty> {
        return await this.notifyGrpcClientService.RemoveByUser(request);
    }
}
