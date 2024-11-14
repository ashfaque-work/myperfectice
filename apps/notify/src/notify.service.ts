import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { NotifyEmailDto } from './dto/notify-email.dto';
import { FindOneReq, GetNotificationsReq, NotificationRepository, SocketClientService } from '@app/common';
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException, GrpcPermissionDeniedException } from 'nestjs-grpc-exceptions';
import { Types } from 'mongoose';

@Injectable()
export class NotifyService {
  constructor(
    private readonly configService: ConfigService,
    private readonly notificationRepository: NotificationRepository,
    private readonly socketClientService: SocketClientService
  ) { }

  private readonly transporter = nodemailer.createTransport({
    // service: 'gmail',
    // auth: {
    //   type: 'OAuth2',
    //   user: this.configService.get('SMTP_USER'),
    //   clientId: this.configService.get('GOOGLE_OAUTH_CLIENT_ID'),
    //   clientSecret: this.configService.get('GOOGLE_OAUTH_CLIENT_SECRET'),
    //   refreshToken: this.configService.get('GOOGLE_OAUTH_REFRESH_TOKEN'),
    // },
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: this.configService.get('MAILTRAP_USER'),
      pass: this.configService.get('MAILTRAP_PASSWORD'),
    }
  });

  //Internal Functions - start
  private async getAvailableFilter(request: any) {
    const filter: any = [{ receiver: new Types.ObjectId(request.user._id) }];

    if (request.query.isNew) {
      filter.push({ 'isRead': false });
    }

    if (request.query.notficationType) {
      filter.push({ modelId: { $in: request.query.notficationType.split('-') } });
    }

    if (request.query.notIn) {
      filter.push({ modelId: { $nin: request.query.notIn.split('-') } });
    } else if (request.query.type === 'message') {
      const msgFilter = ['practicetest', 'mentor', 'sms', 'inviteTest', 'sharePractice', 'updateAnswer', 'smsPayment', 'shareLink',
        'activateAccount', 'confirmEmail', 'adminUpdateUser', 'recoverPass', 'sharePractice'];
      filter.push({ modelId: { $nin: msgFilter } });
    }

    if (request.query.type) {
      filter.push({ type: request.query.type });
    }

    return filter;
  }
  //Internal Functions - end

  async notifyEmail({ email, text }: NotifyEmailDto) {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject: 'Time sheet notify',
      text,
    }).then(info => console.log(info))
      .catch(error => console.log(error));
  }

  async index(request: GetNotificationsReq): Promise<any> {
    try {
      const page = request.query.page ? Number(request.query.page) : 1;
      const limit = request.query.limit ? Number(request.query.limit) : 20;
      const skip = (page - 1) * limit;
      let sort: any = { createdAt: -1 };
      if (request.query.sort) {
        const [field, order] = request.query.sort.split(',');
        sort = { [field]: order === 'ascending' ? 1 : -1 };
      }

      const filter = await this.getAvailableFilter(request);

      if (request.query.keyword) {
        const regexText = new RegExp(request.query.keyword, 'i');
        filter.push({ $or: [{ message: regexText }, { subject: regexText }] });
      }

      this.notificationRepository.setInstanceKey(request.instancekey);
      const notifications = await this.notificationRepository.find(
        { $and: filter }, {}, { sort, skip, limit }
      );
      return { notifications: notifications };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async countUnread(request: GetNotificationsReq): Promise<any> {
    try {
      const filter = await this.getAvailableFilter(request);

      this.notificationRepository.setInstanceKey(request.instancekey);
      const count = await this.notificationRepository.countDocuments(
        { $and: filter }
      );
      return { count: count };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findOne(request: FindOneReq): Promise<any> {
    try {

      this.notificationRepository.setInstanceKey(request.instancekey);
      const notification = await this.notificationRepository.findOne({ _id: request._id });
      if (!notification) {
        throw new BadRequestException();
      }
      if (request.user._id.toString() !== notification.receiver.toString()) {
        throw new UnauthorizedException();
      }

      const previousNoti = await this.notificationRepository.find(
        {
          receiver: request.user._id,
          createdAt: { $lte: notification.createdAt },
          _id: { $ne: request._id },
          type: "message",
        },
        {},
        { sort: { createdAt: -1 }, limit: 1 }
      );

      notification.previousNoti = previousNoti.length > 0 ? previousNoti[0] : {};

      const nextNoti = await this.notificationRepository.findOne({
        receiver: new Types.ObjectId(request.user._id),
        createdAt: { $gt: new Date(notification.createdAt) },
        type: 'message',
      });

      notification.nextNoti = nextNoti ? nextNoti : {};

      return notification;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      } else if (error instanceof UnauthorizedException) {
        throw new GrpcPermissionDeniedException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async setReadMsg(request: FindOneReq): Promise<any> {
    try {
      this.notificationRepository.setInstanceKey(request.instancekey);
      const notification = await this.notificationRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(request._id), isRead: false },
        { $set: { isRead: true } },
        { new: true }
      );

      if (!notification) {
        throw new NotFoundException();
      }
      await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
      this.socketClientService.toUser(
        request.instancekey,
        request.user._id,
        "notification.read",
        { _id: request._id, type: notification.type, modelId: notification.modelId }
      );
      
      return notification;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async removeByUser(request: FindOneReq): Promise<any> {
    try {
      this.notificationRepository.setInstanceKey(request.instancekey);
      const existingNotification = await this.notificationRepository.findOne(
        { receiver: new Types.ObjectId(request.user._id), _id: new Types.ObjectId(request._id) }
      );
      if (!existingNotification) {
        throw new BadRequestException();
      }

      await this.notificationRepository.findByIdAndDelete(request._id);
      
      return { statusCode: 204, message: 'Notification is removed.' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }


}
