import { Injectable, Logger } from "@nestjs/common";

import { AbstractRepository } from "../abstract.repository";
import { Favorite } from "../models";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { instanceKeys } from '@app/common/config';

@Injectable()
export class FavoriteRepository extends AbstractRepository<Favorite> {
  protected readonly logger = new Logger(FavoriteRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Favorite.name, FavoriteRepository.conn[0] ? FavoriteRepository.conn[0] : 'staging') conn0: Model<Favorite>,
    @InjectModel(Favorite.name, FavoriteRepository.conn[1] ? FavoriteRepository.conn[1] : 'staging') conn1: Model<Favorite>,
    @InjectModel(Favorite.name, FavoriteRepository.conn[2] ? FavoriteRepository.conn[2] : 'staging') conn2: Model<Favorite>,
    @InjectModel(Favorite.name, FavoriteRepository.conn[3] ? FavoriteRepository.conn[3] : 'staging') conn3: Model<Favorite>,
    @InjectModel(Favorite.name, FavoriteRepository.conn[4] ? FavoriteRepository.conn[4] : 'staging') conn4: Model<Favorite>,
    @InjectModel(Favorite.name, FavoriteRepository.conn[5] ? FavoriteRepository.conn[5] : 'staging') conn5: Model<Favorite>,
    @InjectModel(Favorite.name, FavoriteRepository.conn[6] ? FavoriteRepository.conn[6] : 'staging') conn6: Model<Favorite>,
    @InjectModel(Favorite.name, FavoriteRepository.conn[7] ? FavoriteRepository.conn[7] : 'staging') conn7: Model<Favorite>,
    @InjectModel(Favorite.name, FavoriteRepository.conn[8] ? FavoriteRepository.conn[8] : 'staging') conn8: Model<Favorite>,
    @InjectModel(Favorite.name, FavoriteRepository.conn[9] ? FavoriteRepository.conn[9] : 'staging') conn9: Model<Favorite>,
  ){
    super({
      [FavoriteRepository.conn.at(0)]: conn0,
      [FavoriteRepository.conn.at(1)]: conn1,
      [FavoriteRepository.conn.at(2)]: conn2,
      [FavoriteRepository.conn.at(3)]: conn3,
      [FavoriteRepository.conn.at(4)]: conn4,
      [FavoriteRepository.conn.at(5)]: conn5,
      [FavoriteRepository.conn.at(6)]: conn6,
      [FavoriteRepository.conn.at(7)]: conn7,
      [FavoriteRepository.conn.at(8)]: conn8,
      [FavoriteRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}

