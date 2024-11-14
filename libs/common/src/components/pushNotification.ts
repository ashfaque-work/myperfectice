import { Injectable } from '@nestjs/common';
import * as PushNotifications from 'node-pushnotifications';
import * as path from 'path';
import * as _ from 'lodash';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import { ClassroomRepository, DeviceRepository } from '../database';
import * as config from '../config';

@Injectable()
export class PushService {
    private pushService: any;

    constructor(
        private readonly classroomRepository: ClassroomRepository,
        private readonly deviceRepository: DeviceRepository,
    ) {
        this.pushService = new PushNotifications(config.pushNotifications);
        // config.pushNotifications.apn.options.pfx = path.resolve('server/cert/ProductionPerfectice.p12');
        // config.pushNotifications.apn.options.passphrase = '123456';
        this.pushService.deviceType = ['ios', 'android'];
    }

    private send(tokens: string[], title: string, message: string, options: any, cb: Function): void {
        let toPush = {
            title,
            topic: title,
            body: message,
            priority: 'high',
            contentAvailable: true,
            ...options,
        };
        this.pushService.send(tokens, toPush, cb);
    }

    async pushToUsers(ik: string, users: string[], title: string, message: string, options: any, cb: Function = () => { }): Promise<void> {
        try {
            this.deviceRepository.setInstanceKey(ik);
            const devices = await this.deviceRepository.find({ user: { $in: users } }, { deviceToken: 1 });
            if (devices.length === 0) {
                return cb();
            }
            const tokens = devices.map(d => d.deviceToken);
            this.send(tokens, title, message, options, cb);
        } catch (err) {
            cb(err);
        }
    }

    async pushToClassroom(ik: string, classroomId: string, excludeUser: string, title: string, message: string, options: any, cb: Function = () => { }): Promise<void> {
        try {
            this.classroomRepository.setInstanceKey(ik);
            const classroom = await this.classroomRepository.findById(classroomId, { students: 1 }, { lean: true });
            if (!classroom) {
                return cb();
            }
            let allIds = classroom.students.map(s => s.studentId);
            if (excludeUser) {
                allIds = allIds.filter(s => s && !s.equals(excludeUser));
            }
            if (allIds.length === 0) {
                return cb();
            }
            //   const devices = await this.deviceModel.find({ user: { $in: allIds } }, { deviceToken: 1 }).lean().exec();
            //   if (devices.length === 0) {
            //     return cb();
            //   }
            //   const tokens = devices.map(d => d.deviceToken);
            //   this.send(tokens, title, message, options, cb);
        } catch (err) {
            cb(err);
        }
    }
}