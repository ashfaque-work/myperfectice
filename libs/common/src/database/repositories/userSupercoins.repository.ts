import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserSuperCoins } from "../models";

@Injectable()
export class UserSuperCoinsRepository extends AbstractRepository<UserSuperCoins> {
  protected readonly logger = new Logger(UserSuperCoinsRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(UserSuperCoins.name, UserSuperCoinsRepository.conn[0] ? UserSuperCoinsRepository.conn[0] : 'staging') conn0: Model<UserSuperCoins>,
    @InjectModel(UserSuperCoins.name, UserSuperCoinsRepository.conn[1] ? UserSuperCoinsRepository.conn[1] : 'staging') conn1: Model<UserSuperCoins>,
    @InjectModel(UserSuperCoins.name, UserSuperCoinsRepository.conn[2] ? UserSuperCoinsRepository.conn[2] : 'staging') conn2: Model<UserSuperCoins>,
    @InjectModel(UserSuperCoins.name, UserSuperCoinsRepository.conn[3] ? UserSuperCoinsRepository.conn[3] : 'staging') conn3: Model<UserSuperCoins>,
    @InjectModel(UserSuperCoins.name, UserSuperCoinsRepository.conn[4] ? UserSuperCoinsRepository.conn[4] : 'staging') conn4: Model<UserSuperCoins>,
    @InjectModel(UserSuperCoins.name, UserSuperCoinsRepository.conn[5] ? UserSuperCoinsRepository.conn[5] : 'staging') conn5: Model<UserSuperCoins>,
    @InjectModel(UserSuperCoins.name, UserSuperCoinsRepository.conn[6] ? UserSuperCoinsRepository.conn[6] : 'staging') conn6: Model<UserSuperCoins>,
    @InjectModel(UserSuperCoins.name, UserSuperCoinsRepository.conn[7] ? UserSuperCoinsRepository.conn[7] : 'staging') conn7: Model<UserSuperCoins>,
    @InjectModel(UserSuperCoins.name, UserSuperCoinsRepository.conn[8] ? UserSuperCoinsRepository.conn[8] : 'staging') conn8: Model<UserSuperCoins>,
    @InjectModel(UserSuperCoins.name, UserSuperCoinsRepository.conn[9] ? UserSuperCoinsRepository.conn[9] : 'staging') conn9: Model<UserSuperCoins>,
  ) {
    super({
      [UserSuperCoinsRepository.conn.at(0)]: conn0,
      [UserSuperCoinsRepository.conn.at(1)]: conn1,
      [UserSuperCoinsRepository.conn.at(2)]: conn2,
      [UserSuperCoinsRepository.conn.at(3)]: conn3,
      [UserSuperCoinsRepository.conn.at(4)]: conn4,
      [UserSuperCoinsRepository.conn.at(5)]: conn5,
      [UserSuperCoinsRepository.conn.at(6)]: conn6,
      [UserSuperCoinsRepository.conn.at(7)]: conn7,
      [UserSuperCoinsRepository.conn.at(8)]: conn8,
      [UserSuperCoinsRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}