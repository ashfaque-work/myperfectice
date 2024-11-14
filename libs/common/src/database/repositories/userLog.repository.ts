import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserLog } from "../models";

@Injectable()
export class UserLogRepository extends AbstractRepository<UserLog> {
  protected readonly logger = new Logger(UserLogRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(UserLog.name, UserLogRepository.conn[0] ? UserLogRepository.conn[0] : 'staging') conn0: Model<UserLog>,
    @InjectModel(UserLog.name, UserLogRepository.conn[1] ? UserLogRepository.conn[1] : 'staging') conn1: Model<UserLog>,
    @InjectModel(UserLog.name, UserLogRepository.conn[2] ? UserLogRepository.conn[2] : 'staging') conn2: Model<UserLog>,
    @InjectModel(UserLog.name, UserLogRepository.conn[3] ? UserLogRepository.conn[3] : 'staging') conn3: Model<UserLog>,
    @InjectModel(UserLog.name, UserLogRepository.conn[4] ? UserLogRepository.conn[4] : 'staging') conn4: Model<UserLog>,
    @InjectModel(UserLog.name, UserLogRepository.conn[5] ? UserLogRepository.conn[5] : 'staging') conn5: Model<UserLog>,
    @InjectModel(UserLog.name, UserLogRepository.conn[6] ? UserLogRepository.conn[6] : 'staging') conn6: Model<UserLog>,
    @InjectModel(UserLog.name, UserLogRepository.conn[7] ? UserLogRepository.conn[7] : 'staging') conn7: Model<UserLog>,
    @InjectModel(UserLog.name, UserLogRepository.conn[8] ? UserLogRepository.conn[8] : 'staging') conn8: Model<UserLog>,
    @InjectModel(UserLog.name, UserLogRepository.conn[9] ? UserLogRepository.conn[9] : 'staging') conn9: Model<UserLog>,
  ) {
    super({
      [UserLogRepository.conn.at(0)]: conn0,
      [UserLogRepository.conn.at(1)]: conn1,
      [UserLogRepository.conn.at(2)]: conn2,
      [UserLogRepository.conn.at(3)]: conn3,
      [UserLogRepository.conn.at(4)]: conn4,
      [UserLogRepository.conn.at(5)]: conn5,
      [UserLogRepository.conn.at(6)]: conn6,
      [UserLogRepository.conn.at(7)]: conn7,
      [UserLogRepository.conn.at(8)]: conn8,
      [UserLogRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}