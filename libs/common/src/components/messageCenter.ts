import { Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import * as path from 'path';
import { Swig } from 'swig';
import { NotificationRepository, NotificationTemplateRepository, SettingRepository, UsersRepository } from "../database";
import { isEmail } from "../helpers";
import { RedisCaching } from "../services";
import { GrpcInternalException } from "nestjs-grpc-exceptions";

const viewsPath = '../views/emails/'
const swig = new Swig({
    varControls: ['<%=', '%>'],
    cache: false
})

@Injectable()
export class MessageCenter {

    constructor(
        private readonly notificationTemplateRepository: NotificationTemplateRepository,
        private readonly settingRepository: SettingRepository,
        private readonly notificationRepository: NotificationRepository,
        private readonly usersRepository: UsersRepository,
        private readonly redisCaching: RedisCaching
    ) { }

    private dateTimeReviver(key: string, value: any): any {
        if (typeof value === 'string') {
            const a = /ISODate\(\\*"([\.0-9T:+-]*)\\*"\)/.exec(value);
            if (a) {
                return new Date(a[1]);
            }
        }
        return value;
    }

    async render(template: any, options: any, callback?: any) {
        swig.renderFile(path.join(__dirname, viewsPath, template), options || {}, function (err, output) {
            if (err) {
                callback(err);
            } else {
                callback(null, output);
            }
        })
    }

    async send(req: any, template: any, options: any, data: any, callback?: any) {
        try {
            const settings: any = await this.redisCaching.getSetting(req);
            var logoPath = settings.emailLogo;
            options.baseUrl = settings.baseUrl;
            options.logo = logoPath.indexOf('https') == -1 ? settings.baseUrl + logoPath : logoPath;
            options.websiteName = settings.baseUrl;
            options.productName = settings.productName;

            const output = this.render(template, options);

            const notificationData = {
                ...data,
                subject: options.subject || '',
                websiteName: settings.baseUrl,
                productName: settings.productName,
                message: output
            };
            const notification: any = await this.notificationRepository.create(notificationData);

            Logger.debug('Message center have been added %s', notification.subject);
            return callback && callback(null, notification);
        } catch (error) {
            return callback && callback(error);
        }
    }

    async sendWithTemplate(req: any, templateKey: any, options: any, data: any, callback?: any) {
        try {
            this.notificationTemplateRepository.setInstanceKey(req.instancekey)
            let notiTemplate = await this.notificationTemplateRepository.findOne({ key: templateKey })

            if (!notiTemplate) {
                Logger.error("Email Template is missing or inactive: " + templateKey);
                return callback && callback("Email template is missing or inactive: " + templateKey);
            }

            this.settingRepository.setInstanceKey(req.instancekey);
            let notiSettings = await this.settingRepository.findOne({ 'slug': 'notifications' })

            data.key = notiTemplate.key

            options.baseUrl = notiSettings.website[notiSettings.website.length - 1] != '/' ? (notiSettings.website + '/') : notiSettings.website;
            options.logo = notiSettings.emailLogo;
            options.websiteName = notiSettings.website;
            options.productName = notiSettings.productName;

            let output = swig.render(notiSettings.header + notiTemplate.body + notiSettings.footer, {
                locals: options
            })

            if (notiTemplate.sms) {
                data.sms = swig.render(notiTemplate.sms, { locals: options })
            }

            this.notificationRepository.setInstanceKey(req.instancekey)
            let notification = await this.notificationRepository.create(data);

            if (options.subject) {
                notification.subject = options.subject;
            }
            // @ts-ignore
            notification.websiteName = notiSettings.website;
            // @ts-ignore
            notification.productName = notiSettings.productName;

            notification.message = output;

            // if this message is to be sent via email/sms, its template need to be active.
            // Otherwise it will only appear in app message center

            if (notification.isScheduled) {
                notification.isScheduled = notiTemplate.active
            }

            Logger.debug(`Message center have been added ${notification.subject}`);
            return callback && callback(null, notification);
        } catch (error) {
            return callback && callback(error);
        }
    }

    async send_with_template(instancekey: string, templateKey: string, options: any, data: any) {
        try {
            this.notificationTemplateRepository.setInstanceKey(instancekey);
            let notiTemplate = await this.notificationTemplateRepository.findOne({ key: templateKey })

            if (!notiTemplate) {
                console.log(templateKey);

                Logger.error("Email Template is missing or inactive: " + templateKey);
                throw new InternalServerErrorException ("Email template is missing or inactive: " + templateKey);
            }

            let notiSettings = await this.settingRepository.findOne({ 'slug': 'notifications' })

            data.key = notiTemplate.key

            options.baseUrl = notiSettings.website[notiSettings.website.length - 1] != '/' ? (notiSettings.website + '/') : notiSettings.website;
            options.logo = notiSettings.emailLogo;
            options.websiteName = notiSettings.website;
            options.productName = notiSettings.productName;

            let output = swig.render(notiSettings.header + notiTemplate.body + notiSettings.footer, {
                locals: options
            })

            if (notiTemplate.sms) {
                data.sms = swig.render(notiTemplate.sms, { locals: options })
            }

            let notification = await this.notificationRepository.create(data);
            if (options.subject) {
                notification.subject = options.subject;
            }
            // @ts-ignore
            notification.websiteName = notiSettings.website;
            // @ts-ignore
            notification.productName = notiSettings.productName;

            notification.message = output;

            // if this message is to be sent via email/sms, its template need to be active.
            // Otherwise it will only appear in app message center

            if (notification.isScheduled) {
                notification.isScheduled = notiTemplate.active
            }

            Logger.debug(`Message center have been added ${notification.subject}`);
            return notification;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    async sendUsingSource(instancekey: string, userTemplate: any, data: any): Promise<any> {
        try {
            this.settingRepository.setInstanceKey(instancekey)
            this.notificationTemplateRepository.setInstanceKey(instancekey)
            this.usersRepository.setInstanceKey(instancekey)
            this.notificationRepository.setInstanceKey(instancekey)

            const notiSettings = await this.settingRepository.findOne({ 'slug': 'notifications' });
            const notiTemplate = await this.notificationTemplateRepository.findOne({ key: userTemplate.key });
            console.log('notiTemplate', notiTemplate);

            if (!notiTemplate) {
                return { error: "Email template missing: " + userTemplate.key };
            }

            if (!notiTemplate.dataSource) {
                return { error: "Datasource missing: " + userTemplate.key };
            }

            data.key = notiTemplate.key;
            data.subject = notiTemplate.subject;
            data.websiteName = notiSettings.website;
            data.productName = notiSettings.productName;

            // Get users to bind
            const queryStr = JSON.stringify(notiTemplate.dataSource).replace(/@@/g, '$');
            const query = JSON.parse(queryStr, this.dateTimeReviver);
            const users = await this.usersRepository.aggregate(query);

            const fullTemplate = (notiSettings.header + userTemplate.body.replace(/&lt;%=(.*)%&gt;/g, "<%= $1 %>") + notiSettings.footer);

            for (const user of users) {
                const options = {
                    ...user,
                    baseUrl: notiSettings.website[notiSettings.website.length - 1] !== '/' ? (notiSettings.website + '/') : notiSettings.website,
                    websiteName: notiSettings.website,
                    logo: notiSettings.emailLogo,
                    productName: notiSettings.productName,
                    subject: notiTemplate.subject,
                };

                data.message = swig.render(fullTemplate, { locals: options });

                if (userTemplate.sms) {
                    data.sms = swig.render(userTemplate.sms, { locals: options });
                }

                const newNoti = {
                    ...data,
                    receiver: user._id,
                    to: user.userId,
                    isEmail: isEmail(user.userId),
                };

                await this.notificationRepository.create(newNoti);
            }

            return { count: users.length };
        } catch (ex) {
            Logger.error('Exception in sendUsingSource', ex);
            return { error: ex.toString() };
        }
    }

    async buildMail(request: any, data: any): Promise<any> {
        try {
            this.settingRepository.setInstanceKey(request.instancekey)
            this.notificationRepository.setInstanceKey(request.instancekey)
            const notiSettings = await this.settingRepository.findOne({ 'slug': 'notifications' });

            data.key = request.key;
            data.subject = request.subject;
            data.websiteName = notiSettings.website;
            data.productName = notiSettings.productName;

            const fullTemplate = (notiSettings.header + request.body.replace(/&lt;%=(.*)%&gt;/g, "<%= $1 %>") + notiSettings.footer);

            const options = {
                ...request.user,
                baseUrl: notiSettings.website[notiSettings.website.length - 1] !== '/' ? (notiSettings.website + '/') : notiSettings.website,
                websiteName: notiSettings.website,
                logo: notiSettings.emailLogo,
                productName: notiSettings.productName,
                subject: request.subject
            };

            data.message = swig.render(fullTemplate, { locals: options });

            if (request.sms) {
                data.sms = swig.render(request.sms, { locals: options });
            }

            const newNoti = {
                ...data,
                receiver: request.user._id,
                to: request.user.userId,
                isEmail: isEmail(request.user.userId),
            };

            await this.notificationRepository.create(newNoti);
        } catch (ex) {
            Logger.error('Exception in buildMail', ex);
            return { error: ex.toString() };
        }
    }
}
