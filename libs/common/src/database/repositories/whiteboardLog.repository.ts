import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WhiteboardLog } from '../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class WhiteboardLogRepository extends AbstractRepository<WhiteboardLog> {
  protected readonly logger = new Logger(WhiteboardLogRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(WhiteboardLog.name, WhiteboardLogRepository.conn[0] ? WhiteboardLogRepository.conn[0] : 'staging') conn0: Model<WhiteboardLog>,
    @InjectModel(WhiteboardLog.name, WhiteboardLogRepository.conn[1] ? WhiteboardLogRepository.conn[1] : 'staging') conn1: Model<WhiteboardLog>,
    @InjectModel(WhiteboardLog.name, WhiteboardLogRepository.conn[2] ? WhiteboardLogRepository.conn[2] : 'staging') conn2: Model<WhiteboardLog>,
    @InjectModel(WhiteboardLog.name, WhiteboardLogRepository.conn[3] ? WhiteboardLogRepository.conn[3] : 'staging') conn3: Model<WhiteboardLog>,
    @InjectModel(WhiteboardLog.name, WhiteboardLogRepository.conn[4] ? WhiteboardLogRepository.conn[4] : 'staging') conn4: Model<WhiteboardLog>,
    @InjectModel(WhiteboardLog.name, WhiteboardLogRepository.conn[5] ? WhiteboardLogRepository.conn[5] : 'staging') conn5: Model<WhiteboardLog>,
    @InjectModel(WhiteboardLog.name, WhiteboardLogRepository.conn[6] ? WhiteboardLogRepository.conn[6] : 'staging') conn6: Model<WhiteboardLog>,
    @InjectModel(WhiteboardLog.name, WhiteboardLogRepository.conn[7] ? WhiteboardLogRepository.conn[7] : 'staging') conn7: Model<WhiteboardLog>,
    @InjectModel(WhiteboardLog.name, WhiteboardLogRepository.conn[8] ? WhiteboardLogRepository.conn[8] : 'staging') conn8: Model<WhiteboardLog>,
    @InjectModel(WhiteboardLog.name, WhiteboardLogRepository.conn[9] ? WhiteboardLogRepository.conn[9] : 'staging') conn9: Model<WhiteboardLog>,
  ) {
    super({
      [WhiteboardLogRepository.conn.at(0)]: conn0,
      [WhiteboardLogRepository.conn.at(1)]: conn1,
      [WhiteboardLogRepository.conn.at(2)]: conn2,
      [WhiteboardLogRepository.conn.at(3)]: conn3,
      [WhiteboardLogRepository.conn.at(4)]: conn4,
      [WhiteboardLogRepository.conn.at(5)]: conn5,
      [WhiteboardLogRepository.conn.at(6)]: conn6,
      [WhiteboardLogRepository.conn.at(7)]: conn7,
      [WhiteboardLogRepository.conn.at(8)]: conn8,
      [WhiteboardLogRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


