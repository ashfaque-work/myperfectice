import { AbstractRepository } from '../../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Backpack } from '../../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class BackpackRepository extends AbstractRepository<Backpack> {
  protected readonly logger = new Logger(BackpackRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Backpack.name, BackpackRepository.conn[0] ? BackpackRepository.conn[0] : 'staging') conn0: Model<Backpack>,
    @InjectModel(Backpack.name, BackpackRepository.conn[1] ? BackpackRepository.conn[1] : 'staging') conn1: Model<Backpack>,
    @InjectModel(Backpack.name, BackpackRepository.conn[2] ? BackpackRepository.conn[2] : 'staging') conn2: Model<Backpack>,
    @InjectModel(Backpack.name, BackpackRepository.conn[3] ? BackpackRepository.conn[3] : 'staging') conn3: Model<Backpack>,
    @InjectModel(Backpack.name, BackpackRepository.conn[4] ? BackpackRepository.conn[4] : 'staging') conn4: Model<Backpack>,
    @InjectModel(Backpack.name, BackpackRepository.conn[5] ? BackpackRepository.conn[5] : 'staging') conn5: Model<Backpack>,
    @InjectModel(Backpack.name, BackpackRepository.conn[6] ? BackpackRepository.conn[6] : 'staging') conn6: Model<Backpack>,
    @InjectModel(Backpack.name, BackpackRepository.conn[7] ? BackpackRepository.conn[7] : 'staging') conn7: Model<Backpack>,
    @InjectModel(Backpack.name, BackpackRepository.conn[8] ? BackpackRepository.conn[8] : 'staging') conn8: Model<Backpack>,
    @InjectModel(Backpack.name, BackpackRepository.conn[9] ? BackpackRepository.conn[9] : 'staging') conn9: Model<Backpack>,
  ){
    super({
      [BackpackRepository.conn.at(0)]: conn0,
      [BackpackRepository.conn.at(1)]: conn1,
      [BackpackRepository.conn.at(2)]: conn2,
      [BackpackRepository.conn.at(3)]: conn3,
      [BackpackRepository.conn.at(4)]: conn4,
      [BackpackRepository.conn.at(5)]: conn5,
      [BackpackRepository.conn.at(6)]: conn6,
      [BackpackRepository.conn.at(7)]: conn7,
      [BackpackRepository.conn.at(8)]: conn8,
      [BackpackRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


