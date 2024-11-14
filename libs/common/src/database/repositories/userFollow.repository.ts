import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserFollow } from "../models";

@Injectable()
export class UserFollowRepository extends AbstractRepository<UserFollow> {
  protected readonly logger = new Logger(UserFollowRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(UserFollow.name, UserFollowRepository.conn[0] ? UserFollowRepository.conn[0] : 'staging') conn0: Model<UserFollow>,
    @InjectModel(UserFollow.name, UserFollowRepository.conn[1] ? UserFollowRepository.conn[1] : 'staging') conn1: Model<UserFollow>,
    @InjectModel(UserFollow.name, UserFollowRepository.conn[2] ? UserFollowRepository.conn[2] : 'staging') conn2: Model<UserFollow>,
    @InjectModel(UserFollow.name, UserFollowRepository.conn[3] ? UserFollowRepository.conn[3] : 'staging') conn3: Model<UserFollow>,
    @InjectModel(UserFollow.name, UserFollowRepository.conn[4] ? UserFollowRepository.conn[4] : 'staging') conn4: Model<UserFollow>,
    @InjectModel(UserFollow.name, UserFollowRepository.conn[5] ? UserFollowRepository.conn[5] : 'staging') conn5: Model<UserFollow>,
    @InjectModel(UserFollow.name, UserFollowRepository.conn[6] ? UserFollowRepository.conn[6] : 'staging') conn6: Model<UserFollow>,
    @InjectModel(UserFollow.name, UserFollowRepository.conn[7] ? UserFollowRepository.conn[7] : 'staging') conn7: Model<UserFollow>,
    @InjectModel(UserFollow.name, UserFollowRepository.conn[8] ? UserFollowRepository.conn[8] : 'staging') conn8: Model<UserFollow>,
    @InjectModel(UserFollow.name, UserFollowRepository.conn[9] ? UserFollowRepository.conn[9] : 'staging') conn9: Model<UserFollow>,
  ) {
    super({
      [UserFollowRepository.conn.at(0)]: conn0,
      [UserFollowRepository.conn.at(1)]: conn1,
      [UserFollowRepository.conn.at(2)]: conn2,
      [UserFollowRepository.conn.at(3)]: conn3,
      [UserFollowRepository.conn.at(4)]: conn4,
      [UserFollowRepository.conn.at(5)]: conn5,
      [UserFollowRepository.conn.at(6)]: conn6,
      [UserFollowRepository.conn.at(7)]: conn7,
      [UserFollowRepository.conn.at(8)]: conn8,
      [UserFollowRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}