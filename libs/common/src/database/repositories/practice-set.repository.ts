import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PracticeSet } from '../models/practice-set.schema';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class PracticeSetRepository extends AbstractRepository<PracticeSet> {
  protected readonly logger = new Logger(PracticeSetRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(PracticeSet.name, PracticeSetRepository.conn[0] ? PracticeSetRepository.conn[0] : 'staging') conn0: Model<PracticeSet>,
    @InjectModel(PracticeSet.name, PracticeSetRepository.conn[1] ? PracticeSetRepository.conn[1] : 'staging') conn1: Model<PracticeSet>,
    @InjectModel(PracticeSet.name, PracticeSetRepository.conn[2] ? PracticeSetRepository.conn[2] : 'staging') conn2: Model<PracticeSet>,
    @InjectModel(PracticeSet.name, PracticeSetRepository.conn[3] ? PracticeSetRepository.conn[3] : 'staging') conn3: Model<PracticeSet>,
    @InjectModel(PracticeSet.name, PracticeSetRepository.conn[4] ? PracticeSetRepository.conn[4] : 'staging') conn4: Model<PracticeSet>,
    @InjectModel(PracticeSet.name, PracticeSetRepository.conn[5] ? PracticeSetRepository.conn[5] : 'staging') conn5: Model<PracticeSet>,
    @InjectModel(PracticeSet.name, PracticeSetRepository.conn[6] ? PracticeSetRepository.conn[6] : 'staging') conn6: Model<PracticeSet>,
    @InjectModel(PracticeSet.name, PracticeSetRepository.conn[7] ? PracticeSetRepository.conn[7] : 'staging') conn7: Model<PracticeSet>,
    @InjectModel(PracticeSet.name, PracticeSetRepository.conn[8] ? PracticeSetRepository.conn[8] : 'staging') conn8: Model<PracticeSet>,
    @InjectModel(PracticeSet.name, PracticeSetRepository.conn[9] ? PracticeSetRepository.conn[9] : 'staging') conn9: Model<PracticeSet>,
  ) {
    super({
      [PracticeSetRepository.conn.at(0)]: conn0,
      [PracticeSetRepository.conn.at(1)]: conn1,
      [PracticeSetRepository.conn.at(2)]: conn2,
      [PracticeSetRepository.conn.at(3)]: conn3,
      [PracticeSetRepository.conn.at(4)]: conn4,
      [PracticeSetRepository.conn.at(5)]: conn5,
      [PracticeSetRepository.conn.at(6)]: conn6,
      [PracticeSetRepository.conn.at(7)]: conn7,
      [PracticeSetRepository.conn.at(8)]: conn8,
      [PracticeSetRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


