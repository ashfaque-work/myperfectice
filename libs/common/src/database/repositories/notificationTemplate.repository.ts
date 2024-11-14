import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { NotificationTemplate } from "../models/notificationTemplate.schema";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class NotificationTemplateRepository extends AbstractRepository<NotificationTemplate> {
  protected readonly logger = new Logger(NotificationTemplateRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(NotificationTemplate.name, NotificationTemplateRepository.conn[0] ? NotificationTemplateRepository.conn[0] : 'staging') conn0: Model<NotificationTemplate>,
    @InjectModel(NotificationTemplate.name, NotificationTemplateRepository.conn[1] ? NotificationTemplateRepository.conn[1] : 'staging') conn1: Model<NotificationTemplate>,
    @InjectModel(NotificationTemplate.name, NotificationTemplateRepository.conn[2] ? NotificationTemplateRepository.conn[2] : 'staging') conn2: Model<NotificationTemplate>,
    @InjectModel(NotificationTemplate.name, NotificationTemplateRepository.conn[3] ? NotificationTemplateRepository.conn[3] : 'staging') conn3: Model<NotificationTemplate>,
    @InjectModel(NotificationTemplate.name, NotificationTemplateRepository.conn[4] ? NotificationTemplateRepository.conn[4] : 'staging') conn4: Model<NotificationTemplate>,
    @InjectModel(NotificationTemplate.name, NotificationTemplateRepository.conn[5] ? NotificationTemplateRepository.conn[5] : 'staging') conn5: Model<NotificationTemplate>,
    @InjectModel(NotificationTemplate.name, NotificationTemplateRepository.conn[6] ? NotificationTemplateRepository.conn[6] : 'staging') conn6: Model<NotificationTemplate>,
    @InjectModel(NotificationTemplate.name, NotificationTemplateRepository.conn[7] ? NotificationTemplateRepository.conn[7] : 'staging') conn7: Model<NotificationTemplate>,
    @InjectModel(NotificationTemplate.name, NotificationTemplateRepository.conn[8] ? NotificationTemplateRepository.conn[8] : 'staging') conn8: Model<NotificationTemplate>,
    @InjectModel(NotificationTemplate.name, NotificationTemplateRepository.conn[9] ? NotificationTemplateRepository.conn[9] : 'staging') conn9: Model<NotificationTemplate>,
  ) {
    super({
      [NotificationTemplateRepository.conn.at(0)]: conn0,
      [NotificationTemplateRepository.conn.at(1)]: conn1,
      [NotificationTemplateRepository.conn.at(2)]: conn2,
      [NotificationTemplateRepository.conn.at(3)]: conn3,
      [NotificationTemplateRepository.conn.at(4)]: conn4,
      [NotificationTemplateRepository.conn.at(5)]: conn5,
      [NotificationTemplateRepository.conn.at(6)]: conn6,
      [NotificationTemplateRepository.conn.at(7)]: conn7,
      [NotificationTemplateRepository.conn.at(8)]: conn8,
      [NotificationTemplateRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}