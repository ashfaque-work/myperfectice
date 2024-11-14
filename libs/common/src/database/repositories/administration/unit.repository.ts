import { AbstractRepository } from '../../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Unit } from '../../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class UnitRepository extends AbstractRepository<Unit> {
  protected readonly logger = new Logger(UnitRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Unit.name, UnitRepository.conn[0] ? UnitRepository.conn[0] : 'staging') conn0: Model<Unit>,
    @InjectModel(Unit.name, UnitRepository.conn[1] ? UnitRepository.conn[1] : 'staging') conn1: Model<Unit>,
    @InjectModel(Unit.name, UnitRepository.conn[2] ? UnitRepository.conn[2] : 'staging') conn2: Model<Unit>,
    @InjectModel(Unit.name, UnitRepository.conn[3] ? UnitRepository.conn[3] : 'staging') conn3: Model<Unit>,
    @InjectModel(Unit.name, UnitRepository.conn[4] ? UnitRepository.conn[4] : 'staging') conn4: Model<Unit>,
    @InjectModel(Unit.name, UnitRepository.conn[5] ? UnitRepository.conn[5] : 'staging') conn5: Model<Unit>,
    @InjectModel(Unit.name, UnitRepository.conn[6] ? UnitRepository.conn[6] : 'staging') conn6: Model<Unit>,
    @InjectModel(Unit.name, UnitRepository.conn[7] ? UnitRepository.conn[7] : 'staging') conn7: Model<Unit>,
    @InjectModel(Unit.name, UnitRepository.conn[8] ? UnitRepository.conn[8] : 'staging') conn8: Model<Unit>,
    @InjectModel(Unit.name, UnitRepository.conn[9] ? UnitRepository.conn[9] : 'staging') conn9: Model<Unit>,
  ){
    super({
      [UnitRepository.conn.at(0)]: conn0,
      [UnitRepository.conn.at(1)]: conn1,
      [UnitRepository.conn.at(2)]: conn2,
      [UnitRepository.conn.at(3)]: conn3,
      [UnitRepository.conn.at(4)]: conn4,
      [UnitRepository.conn.at(5)]: conn5,
      [UnitRepository.conn.at(6)]: conn6,
      [UnitRepository.conn.at(7)]: conn7,
      [UnitRepository.conn.at(8)]: conn8,
      [UnitRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


