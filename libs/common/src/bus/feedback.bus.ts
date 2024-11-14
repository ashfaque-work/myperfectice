import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as _ from 'lodash';
import { AttemptRepository, FeedbackRepository, NotificationRepository, UsersRepository } from '../database';
import { RedisCaching } from '../services';
import * as feedbackValidator from '@app/common/validators/feedback';
import { BitlyService, EventBus } from '../components';
import { MessageCenter } from '../components/messageCenter';


@Injectable()
export class FeedbackBus {
    constructor(private readonly feedbackRepository: FeedbackRepository,
        private readonly attemptRepository: AttemptRepository,
        private readonly notificationRepository: NotificationRepository,
        private readonly userRepository: UsersRepository,
        private readonly redisCache: RedisCaching,
        private readonly eventBus: EventBus,
        private readonly bitlyService: BitlyService,
        private readonly messageCenter: MessageCenter,
    ) { }

    async createOffline(req: any, feedbackRequest: any) {
        try {
            var model = _.pick(feedbackRequest, 'user',
                'practiceSetId', 'attemptId', 'idOffline', 'rating', 'comment', 'owner');

            this.feedbackRepository.setInstanceKey(req.instancekey);
            const result = await this.feedbackRepository.findOne({ practiceSetId: model.practiceSetId, idOffline: model.idOffline });
            if (result) {
                return result;
            }
            this.attemptRepository.setInstanceKey(req.instancekey);
            const record = await this.attemptRepository.findOne({ idOffline: model.idOffline })

            if (!record) {
                return;
            }
            model.attemptId = record._id;
            var feedbackModel = await this.feedbackRepository.create(model);

            Logger.debug('feedbackData', feedbackModel);
            return;
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    async sharePractice(req: any, shareBody: any) {
        const settings = await this.redisCache.getSetting({ instancekey: req.instancekey }, function (settings: any) {
            return settings;
        });
        var supportEmail = settings.supportEmail;

        const { errors, data } = feedbackValidator.validateSharingLink(req, shareBody)
        if (errors) {
            throw new BadRequestException(errors);
        }
        var file = 'sharing-practiceset';
        var tmp = {
            logo: settings.baseUrl + 'images/logo2.png',
            senderName: data.user.name,
            sharingLink: settings.baseUrl + 'practice/' + data.practiceSetId,
            subject: 'Practice Test Sharing',
            supportEmail: supportEmail
        };
        var confirmUrl = settings.baseUrl + 'practice/' + data.practiceSetId;
        this.eventBus.emit('Practice.shared', {
            req: {
                headers: {
                    instancekey: req.instancekey
                }
            },
            tmp: tmp,
            file: file,
            user: data.user._id,
            data: {
                _id: data._id,
                emails: data.emails
            }
        })

        await Promise.all([
            await this.sendSms(req, data, confirmUrl),
            await this.sendMessage(req, file, tmp, data)
        ]);
    }

    private async sendSms(req: any, data: any, confirmUrl: string) {
        if (!data.phones) {
            return;
        }
        this.userRepository.setInstanceKey(req.instancekey);
        const users = await this.userRepository.find({
            $or: [
                { userId: { $in: data.phones } },
                { phoneNumber: { $in: data.phones } },
                { phoneNumberFull: { $in: data.phones } }
            ]
        })
        if (users.length === 0) {
            return;
        }

        try {
            var text = 'Please click the link above to take this test.' + confirmUrl;
            confirmUrl = await this.bitlyService.shorten(confirmUrl);
            text = 'Please click the link above to take this test.' + confirmUrl;

            await this.sendSmsToUser(req, users, text);
        } catch (error) {
            if (error) {
                Logger.error('bitly error %j', error);
            }
            await this.sendSmsToUser(req, users, text)
        }
    }

    private async sendMessage(req: any, file: any, tmp: any, data: any) {
        if (!data.emails) {
            return;
        }
        let dataMsgCenter = {
            to: data.emails,
            modelId: 'sharePractice',
            isScheduled: true
        };
    
        await this.messageCenter.sendWithTemplate(req, file, tmp, dataMsgCenter);
    }

    private async sendSmsToUser(req: any, users: any[], text: string): Promise<void> {
        const phoneNumberToSend = [];

        for (const user of users) {
            let userPhoneNumber = user.phoneNumber ? user.phoneNumber : user.userId;

            if (!user.phoneNumberFull) {
                if (!user.country || !user.country.callingCodes || user.country.callingCodes.length === 0) {
                    continue;
                }
                const callingCode = user.country.callingCodes[0];
                userPhoneNumber = callingCode + userPhoneNumber;
            } else {
                userPhoneNumber = user.phoneNumberFull;
            }

            phoneNumberToSend.push(userPhoneNumber);
        }

        if (phoneNumberToSend.length === 0) {
            return;
        }

        const uniquePhoneNumbers = _.uniq(phoneNumberToSend);

        for (const phone of uniquePhoneNumbers) {
            try {
                this.notificationRepository.setInstanceKey(req.instancekey);
                await this.notificationRepository.create({
                    modelId: 'sharePractice',
                    isScheduled: true,
                    isEmail: false,
                    to: phone,
                    sms: text,
                });

            } catch (err) {
                Logger.error(`Error saving SMS notification for ${phone}: ${err.message}`);
            }
        }
    }
}