import { AbstractRepository } from '../../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location } from '../../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class LocationRepository extends AbstractRepository<Location> {
  protected readonly logger = new Logger(LocationRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Location.name, LocationRepository.conn[0] ? LocationRepository.conn[0] : 'staging') conn0: Model<Location>,
    @InjectModel(Location.name, LocationRepository.conn[1] ? LocationRepository.conn[1] : 'staging') conn1: Model<Location>,
    @InjectModel(Location.name, LocationRepository.conn[2] ? LocationRepository.conn[2] : 'staging') conn2: Model<Location>,
    @InjectModel(Location.name, LocationRepository.conn[3] ? LocationRepository.conn[3] : 'staging') conn3: Model<Location>,
    @InjectModel(Location.name, LocationRepository.conn[4] ? LocationRepository.conn[4] : 'staging') conn4: Model<Location>,
    @InjectModel(Location.name, LocationRepository.conn[5] ? LocationRepository.conn[5] : 'staging') conn5: Model<Location>,
    @InjectModel(Location.name, LocationRepository.conn[6] ? LocationRepository.conn[6] : 'staging') conn6: Model<Location>,
    @InjectModel(Location.name, LocationRepository.conn[7] ? LocationRepository.conn[7] : 'staging') conn7: Model<Location>,
    @InjectModel(Location.name, LocationRepository.conn[8] ? LocationRepository.conn[8] : 'staging') conn8: Model<Location>,
    @InjectModel(Location.name, LocationRepository.conn[9] ? LocationRepository.conn[9] : 'staging') conn9: Model<Location>,
  ){
    super({
      [LocationRepository.conn.at(0)]: conn0,
      [LocationRepository.conn.at(1)]: conn1,
      [LocationRepository.conn.at(2)]: conn2,
      [LocationRepository.conn.at(3)]: conn3,
      [LocationRepository.conn.at(4)]: conn4,
      [LocationRepository.conn.at(5)]: conn5,
      [LocationRepository.conn.at(6)]: conn6,
      [LocationRepository.conn.at(7)]: conn7,
      [LocationRepository.conn.at(8)]: conn8,
      [LocationRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}

