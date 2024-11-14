import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '../../abstract.repository';
import { AttemptDetail } from '../../models/assessment/attempt-detail.schema';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class AttemptDetailRepository extends AbstractRepository<AttemptDetail> {
  protected readonly logger = new Logger(AttemptDetailRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(AttemptDetail.name, AttemptDetailRepository.conn[0] ? AttemptDetailRepository.conn[0] : 'staging') conn0: Model<AttemptDetail>,
    @InjectModel(AttemptDetail.name, AttemptDetailRepository.conn[1] ? AttemptDetailRepository.conn[1] : 'staging') conn1: Model<AttemptDetail>,
    @InjectModel(AttemptDetail.name, AttemptDetailRepository.conn[2] ? AttemptDetailRepository.conn[2] : 'staging') conn2: Model<AttemptDetail>,
    @InjectModel(AttemptDetail.name, AttemptDetailRepository.conn[3] ? AttemptDetailRepository.conn[3] : 'staging') conn3: Model<AttemptDetail>,
    @InjectModel(AttemptDetail.name, AttemptDetailRepository.conn[4] ? AttemptDetailRepository.conn[4] : 'staging') conn4: Model<AttemptDetail>,
    @InjectModel(AttemptDetail.name, AttemptDetailRepository.conn[5] ? AttemptDetailRepository.conn[5] : 'staging') conn5: Model<AttemptDetail>,
    @InjectModel(AttemptDetail.name, AttemptDetailRepository.conn[6] ? AttemptDetailRepository.conn[6] : 'staging') conn6: Model<AttemptDetail>,
    @InjectModel(AttemptDetail.name, AttemptDetailRepository.conn[7] ? AttemptDetailRepository.conn[7] : 'staging') conn7: Model<AttemptDetail>,
    @InjectModel(AttemptDetail.name, AttemptDetailRepository.conn[8] ? AttemptDetailRepository.conn[8] : 'staging') conn8: Model<AttemptDetail>,
    @InjectModel(AttemptDetail.name, AttemptDetailRepository.conn[9] ? AttemptDetailRepository.conn[9] : 'staging') conn9: Model<AttemptDetail>,
  ){
    super({
      [AttemptDetailRepository.conn.at(0)]: conn0,
      [AttemptDetailRepository.conn.at(1)]: conn1,
      [AttemptDetailRepository.conn.at(2)]: conn2,
      [AttemptDetailRepository.conn.at(3)]: conn3,
      [AttemptDetailRepository.conn.at(4)]: conn4,
      [AttemptDetailRepository.conn.at(5)]: conn5,
      [AttemptDetailRepository.conn.at(6)]: conn6,
      [AttemptDetailRepository.conn.at(7)]: conn7,
      [AttemptDetailRepository.conn.at(8)]: conn8,
      [AttemptDetailRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


