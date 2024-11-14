import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Articles } from "../models";

@Injectable()
export class ArticlesRepository extends AbstractRepository<Articles> {
  protected readonly logger = new Logger(ArticlesRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Articles.name, ArticlesRepository.conn[0] ? ArticlesRepository.conn[0] : 'staging') conn0: Model<Articles>,
    @InjectModel(Articles.name, ArticlesRepository.conn[1] ? ArticlesRepository.conn[1] : 'staging') conn1: Model<Articles>,
    @InjectModel(Articles.name, ArticlesRepository.conn[2] ? ArticlesRepository.conn[2] : 'staging') conn2: Model<Articles>,
    @InjectModel(Articles.name, ArticlesRepository.conn[3] ? ArticlesRepository.conn[3] : 'staging') conn3: Model<Articles>,
    @InjectModel(Articles.name, ArticlesRepository.conn[4] ? ArticlesRepository.conn[4] : 'staging') conn4: Model<Articles>,
    @InjectModel(Articles.name, ArticlesRepository.conn[5] ? ArticlesRepository.conn[5] : 'staging') conn5: Model<Articles>,
    @InjectModel(Articles.name, ArticlesRepository.conn[6] ? ArticlesRepository.conn[6] : 'staging') conn6: Model<Articles>,
    @InjectModel(Articles.name, ArticlesRepository.conn[7] ? ArticlesRepository.conn[7] : 'staging') conn7: Model<Articles>,
    @InjectModel(Articles.name, ArticlesRepository.conn[8] ? ArticlesRepository.conn[8] : 'staging') conn8: Model<Articles>,
    @InjectModel(Articles.name, ArticlesRepository.conn[9] ? ArticlesRepository.conn[9] : 'staging') conn9: Model<Articles>,
  ) {
    super({
      [ArticlesRepository.conn.at(0)]: conn0,
      [ArticlesRepository.conn.at(1)]: conn1,
      [ArticlesRepository.conn.at(2)]: conn2,
      [ArticlesRepository.conn.at(3)]: conn3,
      [ArticlesRepository.conn.at(4)]: conn4,
      [ArticlesRepository.conn.at(5)]: conn5,
      [ArticlesRepository.conn.at(6)]: conn6,
      [ArticlesRepository.conn.at(7)]: conn7,
      [ArticlesRepository.conn.at(8)]: conn8,
      [ArticlesRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}