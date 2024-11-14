import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MarketingUtm } from "../models";

@Injectable()
export class MarketingUtmRepository extends AbstractRepository<MarketingUtm> {
  protected readonly logger = new Logger(MarketingUtmRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(MarketingUtm.name, MarketingUtmRepository.conn[0] ? MarketingUtmRepository.conn[0] : 'staging') conn0: Model<MarketingUtm>,
    @InjectModel(MarketingUtm.name, MarketingUtmRepository.conn[1] ? MarketingUtmRepository.conn[1] : 'staging') conn1: Model<MarketingUtm>,
    @InjectModel(MarketingUtm.name, MarketingUtmRepository.conn[2] ? MarketingUtmRepository.conn[2] : 'staging') conn2: Model<MarketingUtm>,
    @InjectModel(MarketingUtm.name, MarketingUtmRepository.conn[3] ? MarketingUtmRepository.conn[3] : 'staging') conn3: Model<MarketingUtm>,
    @InjectModel(MarketingUtm.name, MarketingUtmRepository.conn[4] ? MarketingUtmRepository.conn[4] : 'staging') conn4: Model<MarketingUtm>,
    @InjectModel(MarketingUtm.name, MarketingUtmRepository.conn[5] ? MarketingUtmRepository.conn[5] : 'staging') conn5: Model<MarketingUtm>,
    @InjectModel(MarketingUtm.name, MarketingUtmRepository.conn[6] ? MarketingUtmRepository.conn[6] : 'staging') conn6: Model<MarketingUtm>,
    @InjectModel(MarketingUtm.name, MarketingUtmRepository.conn[7] ? MarketingUtmRepository.conn[7] : 'staging') conn7: Model<MarketingUtm>,
    @InjectModel(MarketingUtm.name, MarketingUtmRepository.conn[8] ? MarketingUtmRepository.conn[8] : 'staging') conn8: Model<MarketingUtm>,
    @InjectModel(MarketingUtm.name, MarketingUtmRepository.conn[9] ? MarketingUtmRepository.conn[9] : 'staging') conn9: Model<MarketingUtm>,
  ) {
    super({
      [MarketingUtmRepository.conn.at(0)]: conn0,
      [MarketingUtmRepository.conn.at(1)]: conn1,
      [MarketingUtmRepository.conn.at(2)]: conn2,
      [MarketingUtmRepository.conn.at(3)]: conn3,
      [MarketingUtmRepository.conn.at(4)]: conn4,
      [MarketingUtmRepository.conn.at(5)]: conn5,
      [MarketingUtmRepository.conn.at(6)]: conn6,
      [MarketingUtmRepository.conn.at(7)]: conn7,
      [MarketingUtmRepository.conn.at(8)]: conn8,
      [MarketingUtmRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}