import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ReportedUser } from "../models";

@Injectable()
export class ReportedUserRepository extends AbstractRepository<ReportedUser> {
  protected readonly logger = new Logger(ReportedUserRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(ReportedUser.name, ReportedUserRepository.conn[0] ? ReportedUserRepository.conn[0] : 'staging') conn0: Model<ReportedUser>,
    @InjectModel(ReportedUser.name, ReportedUserRepository.conn[1] ? ReportedUserRepository.conn[1] : 'staging') conn1: Model<ReportedUser>,
    @InjectModel(ReportedUser.name, ReportedUserRepository.conn[2] ? ReportedUserRepository.conn[2] : 'staging') conn2: Model<ReportedUser>,
    @InjectModel(ReportedUser.name, ReportedUserRepository.conn[3] ? ReportedUserRepository.conn[3] : 'staging') conn3: Model<ReportedUser>,
    @InjectModel(ReportedUser.name, ReportedUserRepository.conn[4] ? ReportedUserRepository.conn[4] : 'staging') conn4: Model<ReportedUser>,
    @InjectModel(ReportedUser.name, ReportedUserRepository.conn[5] ? ReportedUserRepository.conn[5] : 'staging') conn5: Model<ReportedUser>,
    @InjectModel(ReportedUser.name, ReportedUserRepository.conn[6] ? ReportedUserRepository.conn[6] : 'staging') conn6: Model<ReportedUser>,
    @InjectModel(ReportedUser.name, ReportedUserRepository.conn[7] ? ReportedUserRepository.conn[7] : 'staging') conn7: Model<ReportedUser>,
    @InjectModel(ReportedUser.name, ReportedUserRepository.conn[8] ? ReportedUserRepository.conn[8] : 'staging') conn8: Model<ReportedUser>,
    @InjectModel(ReportedUser.name, ReportedUserRepository.conn[9] ? ReportedUserRepository.conn[9] : 'staging') conn9: Model<ReportedUser>,
  ) {
    super({
      [ReportedUserRepository.conn.at(0)]: conn0,
      [ReportedUserRepository.conn.at(1)]: conn1,
      [ReportedUserRepository.conn.at(2)]: conn2,
      [ReportedUserRepository.conn.at(3)]: conn3,
      [ReportedUserRepository.conn.at(4)]: conn4,
      [ReportedUserRepository.conn.at(5)]: conn5,
      [ReportedUserRepository.conn.at(6)]: conn6,
      [ReportedUserRepository.conn.at(7)]: conn7,
      [ReportedUserRepository.conn.at(8)]: conn8,
      [ReportedUserRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}