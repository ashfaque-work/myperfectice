import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GameAttempt } from "../models";

@Injectable()
export class GameAttemptRepository extends AbstractRepository<GameAttempt> {
  protected readonly logger = new Logger(GameAttemptRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(GameAttempt.name, GameAttemptRepository.conn[0] ? GameAttemptRepository.conn[0] : 'staging') conn0: Model<GameAttempt>,
    @InjectModel(GameAttempt.name, GameAttemptRepository.conn[1] ? GameAttemptRepository.conn[1] : 'staging') conn1: Model<GameAttempt>,
    @InjectModel(GameAttempt.name, GameAttemptRepository.conn[2] ? GameAttemptRepository.conn[2] : 'staging') conn2: Model<GameAttempt>,
    @InjectModel(GameAttempt.name, GameAttemptRepository.conn[3] ? GameAttemptRepository.conn[3] : 'staging') conn3: Model<GameAttempt>,
    @InjectModel(GameAttempt.name, GameAttemptRepository.conn[4] ? GameAttemptRepository.conn[4] : 'staging') conn4: Model<GameAttempt>,
    @InjectModel(GameAttempt.name, GameAttemptRepository.conn[5] ? GameAttemptRepository.conn[5] : 'staging') conn5: Model<GameAttempt>,
    @InjectModel(GameAttempt.name, GameAttemptRepository.conn[6] ? GameAttemptRepository.conn[6] : 'staging') conn6: Model<GameAttempt>,
    @InjectModel(GameAttempt.name, GameAttemptRepository.conn[7] ? GameAttemptRepository.conn[7] : 'staging') conn7: Model<GameAttempt>,
    @InjectModel(GameAttempt.name, GameAttemptRepository.conn[8] ? GameAttemptRepository.conn[8] : 'staging') conn8: Model<GameAttempt>,
    @InjectModel(GameAttempt.name, GameAttemptRepository.conn[9] ? GameAttemptRepository.conn[9] : 'staging') conn9: Model<GameAttempt>,
  ) {
    super({
      [GameAttemptRepository.conn.at(0)]: conn0,
      [GameAttemptRepository.conn.at(1)]: conn1,
      [GameAttemptRepository.conn.at(2)]: conn2,
      [GameAttemptRepository.conn.at(3)]: conn3,
      [GameAttemptRepository.conn.at(4)]: conn4,
      [GameAttemptRepository.conn.at(5)]: conn5,
      [GameAttemptRepository.conn.at(6)]: conn6,
      [GameAttemptRepository.conn.at(7)]: conn7,
      [GameAttemptRepository.conn.at(8)]: conn8,
      [GameAttemptRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}