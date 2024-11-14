import { Injectable, Logger } from "@nestjs/common"
import { AbstractRepository } from "../abstract.repository"
import { Notification } from "../models"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { instanceKeys } from '@app/common/config';

@Injectable()
export class NotificationRepository extends AbstractRepository<Notification> {
    protected readonly logger = new Logger(NotificationRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(Notification.name, NotificationRepository.conn[0] ? NotificationRepository.conn[0] : 'staging') conn0: Model<Notification>,
        @InjectModel(Notification.name, NotificationRepository.conn[1] ? NotificationRepository.conn[1] : 'staging') conn1: Model<Notification>,
        @InjectModel(Notification.name, NotificationRepository.conn[2] ? NotificationRepository.conn[2] : 'staging') conn2: Model<Notification>,
        @InjectModel(Notification.name, NotificationRepository.conn[3] ? NotificationRepository.conn[3] : 'staging') conn3: Model<Notification>,
        @InjectModel(Notification.name, NotificationRepository.conn[4] ? NotificationRepository.conn[4] : 'staging') conn4: Model<Notification>,
        @InjectModel(Notification.name, NotificationRepository.conn[5] ? NotificationRepository.conn[5] : 'staging') conn5: Model<Notification>,
        @InjectModel(Notification.name, NotificationRepository.conn[6] ? NotificationRepository.conn[6] : 'staging') conn6: Model<Notification>,
        @InjectModel(Notification.name, NotificationRepository.conn[7] ? NotificationRepository.conn[7] : 'staging') conn7: Model<Notification>,
        @InjectModel(Notification.name, NotificationRepository.conn[8] ? NotificationRepository.conn[8] : 'staging') conn8: Model<Notification>,
        @InjectModel(Notification.name, NotificationRepository.conn[9] ? NotificationRepository.conn[9] : 'staging') conn9: Model<Notification>,
    ) {
        super({
            [NotificationRepository.conn.at(0)]: conn0,
            [NotificationRepository.conn.at(1)]: conn1,
            [NotificationRepository.conn.at(2)]: conn2,
            [NotificationRepository.conn.at(3)]: conn3,
            [NotificationRepository.conn.at(4)]: conn4,
            [NotificationRepository.conn.at(5)]: conn5,
            [NotificationRepository.conn.at(6)]: conn6,
            [NotificationRepository.conn.at(7)]: conn7,
            [NotificationRepository.conn.at(8)]: conn8,
            [NotificationRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}

