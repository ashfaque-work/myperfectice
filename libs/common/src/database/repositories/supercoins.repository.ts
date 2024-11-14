import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SuperCoins } from "../models";

@Injectable()
export class SuperCoinsRepository extends AbstractRepository<SuperCoins> {
  protected readonly logger = new Logger(SuperCoinsRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(SuperCoins.name, SuperCoinsRepository.conn[0] ? SuperCoinsRepository.conn[0] : 'staging') conn0: Model<SuperCoins>,
    @InjectModel(SuperCoins.name, SuperCoinsRepository.conn[1] ? SuperCoinsRepository.conn[1] : 'staging') conn1: Model<SuperCoins>,
    @InjectModel(SuperCoins.name, SuperCoinsRepository.conn[2] ? SuperCoinsRepository.conn[2] : 'staging') conn2: Model<SuperCoins>,
    @InjectModel(SuperCoins.name, SuperCoinsRepository.conn[3] ? SuperCoinsRepository.conn[3] : 'staging') conn3: Model<SuperCoins>,
    @InjectModel(SuperCoins.name, SuperCoinsRepository.conn[4] ? SuperCoinsRepository.conn[4] : 'staging') conn4: Model<SuperCoins>,
    @InjectModel(SuperCoins.name, SuperCoinsRepository.conn[5] ? SuperCoinsRepository.conn[5] : 'staging') conn5: Model<SuperCoins>,
    @InjectModel(SuperCoins.name, SuperCoinsRepository.conn[6] ? SuperCoinsRepository.conn[6] : 'staging') conn6: Model<SuperCoins>,
    @InjectModel(SuperCoins.name, SuperCoinsRepository.conn[7] ? SuperCoinsRepository.conn[7] : 'staging') conn7: Model<SuperCoins>,
    @InjectModel(SuperCoins.name, SuperCoinsRepository.conn[8] ? SuperCoinsRepository.conn[8] : 'staging') conn8: Model<SuperCoins>,
    @InjectModel(SuperCoins.name, SuperCoinsRepository.conn[9] ? SuperCoinsRepository.conn[9] : 'staging') conn9: Model<SuperCoins>,
  ) {
    super({
      [SuperCoinsRepository.conn.at(0)]: conn0,
      [SuperCoinsRepository.conn.at(1)]: conn1,
      [SuperCoinsRepository.conn.at(2)]: conn2,
      [SuperCoinsRepository.conn.at(3)]: conn3,
      [SuperCoinsRepository.conn.at(4)]: conn4,
      [SuperCoinsRepository.conn.at(5)]: conn5,
      [SuperCoinsRepository.conn.at(6)]: conn6,
      [SuperCoinsRepository.conn.at(7)]: conn7,
      [SuperCoinsRepository.conn.at(8)]: conn8,
      [SuperCoinsRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}