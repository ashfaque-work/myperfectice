import { Empty, FindOneReq, GetNotificationsReq, NotifyEmailMessage } from '@app/common/dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const protobufNotifyPackage = 'notify';
export const protobufNotifyService = 'NotifyService';

export interface NotifyClientInterface {
  notifyEmail(request: NotifyEmailMessage): Promise<Empty>;
  Index(request: GetNotificationsReq): Promise<Empty>;
  CountUnread(request: GetNotificationsReq): Promise<Empty>;
  FindOne(request: FindOneReq): Promise<Empty>;
  SetReadMsg(request: FindOneReq): Promise<Empty>;
  RemoveByUser(request: FindOneReq): Promise<Empty>;
}

@Injectable()
export class NotifyGrpcClientService implements NotifyClientInterface {
  private notifyGrpcService: NotifyClientInterface;
  private readonly logger = new Logger(NotifyGrpcClientService.name);

  constructor(
    @Inject('notifyGrpcService') private notifyGrpcClient: ClientGrpc,
  ) { }

  async onModuleInit() {
    this.notifyGrpcService =
      this.notifyGrpcClient.getService<NotifyClientInterface>(
        protobufNotifyService,
      );
    this.logger.debug('notify MS has been initialted.');
  }

  async notifyEmail(request: NotifyEmailMessage): Promise<Empty> {
    return await this.notifyGrpcService.notifyEmail(request);
  }

  async Index(request: GetNotificationsReq): Promise<Empty> {
    return await this.notifyGrpcService.Index(request);
  }

  async CountUnread(request: GetNotificationsReq): Promise<Empty> {
    return await this.notifyGrpcService.CountUnread(request);
  }

  async FindOne(request: FindOneReq): Promise<Empty> {
    return await this.notifyGrpcService.FindOne(request);
  }

  async SetReadMsg(request: FindOneReq): Promise<Empty> {
    return await this.notifyGrpcService.SetReadMsg(request);
  }

  async RemoveByUser(request: FindOneReq): Promise<Empty> {
    return await this.notifyGrpcService.RemoveByUser(request);
  }
}
