import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attempt } from '../../models';
import { AbstractRepository } from '../../abstract.repository';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class AttemptRepository extends AbstractRepository<Attempt> {
  protected readonly logger = new Logger(AttemptRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Attempt.name, AttemptRepository.conn[0] ? AttemptRepository.conn[0] : 'staging') conn0: Model<Attempt>,
    @InjectModel(Attempt.name, AttemptRepository.conn[1] ? AttemptRepository.conn[1] : 'staging') conn1: Model<Attempt>,
    @InjectModel(Attempt.name, AttemptRepository.conn[2] ? AttemptRepository.conn[2] : 'staging') conn2: Model<Attempt>,
    @InjectModel(Attempt.name, AttemptRepository.conn[3] ? AttemptRepository.conn[3] : 'staging') conn3: Model<Attempt>,
    @InjectModel(Attempt.name, AttemptRepository.conn[4] ? AttemptRepository.conn[4] : 'staging') conn4: Model<Attempt>,
    @InjectModel(Attempt.name, AttemptRepository.conn[5] ? AttemptRepository.conn[5] : 'staging') conn5: Model<Attempt>,
    @InjectModel(Attempt.name, AttemptRepository.conn[6] ? AttemptRepository.conn[6] : 'staging') conn6: Model<Attempt>,
    @InjectModel(Attempt.name, AttemptRepository.conn[7] ? AttemptRepository.conn[7] : 'staging') conn7: Model<Attempt>,
    @InjectModel(Attempt.name, AttemptRepository.conn[8] ? AttemptRepository.conn[8] : 'staging') conn8: Model<Attempt>,
    @InjectModel(Attempt.name, AttemptRepository.conn[9] ? AttemptRepository.conn[9] : 'staging') conn9: Model<Attempt>,
  ){
    super({
      [AttemptRepository.conn.at(0)]: conn0,
      [AttemptRepository.conn.at(1)]: conn1,
      [AttemptRepository.conn.at(2)]: conn2,
      [AttemptRepository.conn.at(3)]: conn3,
      [AttemptRepository.conn.at(4)]: conn4,
      [AttemptRepository.conn.at(5)]: conn5,
      [AttemptRepository.conn.at(6)]: conn6,
      [AttemptRepository.conn.at(7)]: conn7,
      [AttemptRepository.conn.at(8)]: conn8,
      [AttemptRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


