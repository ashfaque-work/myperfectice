import { protobufNotifyService } from '@app/common/grpc-clients/notify';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotifyEmailDto } from './dto/notify-email.dto';
import { NotifyService } from './notify.service';
import { FindOneReq, GetNotificationsReq } from '@app/common';

@Controller()
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @GrpcMethod(protobufNotifyService, 'notifyEmail')
  async notifyEmail(data: NotifyEmailDto) {
    this.notifyService.notifyEmail(data);
  }

  @GrpcMethod(protobufNotifyService, 'Index')
  async index(request: GetNotificationsReq) {
    return this.notifyService.index(request);
  }

  @GrpcMethod(protobufNotifyService, 'CountUnread')
  async countUnread(request: GetNotificationsReq) {
    return this.notifyService.countUnread(request);
  }

  @GrpcMethod(protobufNotifyService, 'FindOne')
  async findOne(request: FindOneReq) {
    return this.notifyService.findOne(request);
  }

  @GrpcMethod(protobufNotifyService, 'SetReadMsg')
  async setReadMsg(request: FindOneReq) {
    return this.notifyService.setReadMsg(request);
  }

  @GrpcMethod(protobufNotifyService, 'RemoveByUser')
  async removeByUser(request: FindOneReq) {
    return this.notifyService.removeByUser(request);
  }
}
