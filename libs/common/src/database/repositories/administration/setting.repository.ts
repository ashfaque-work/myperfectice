import { AbstractRepository } from '../../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting } from '../../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class SettingRepository extends AbstractRepository<Setting> {
  protected readonly logger = new Logger(SettingRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Setting.name, SettingRepository.conn[0] ? SettingRepository.conn[0] : 'staging') conn0: Model<Setting>,
    @InjectModel(Setting.name, SettingRepository.conn[1] ? SettingRepository.conn[1] : 'staging') conn1: Model<Setting>,
    @InjectModel(Setting.name, SettingRepository.conn[2] ? SettingRepository.conn[2] : 'staging') conn2: Model<Setting>,
    @InjectModel(Setting.name, SettingRepository.conn[3] ? SettingRepository.conn[3] : 'staging') conn3: Model<Setting>,
    @InjectModel(Setting.name, SettingRepository.conn[4] ? SettingRepository.conn[4] : 'staging') conn4: Model<Setting>,
    @InjectModel(Setting.name, SettingRepository.conn[5] ? SettingRepository.conn[5] : 'staging') conn5: Model<Setting>,
    @InjectModel(Setting.name, SettingRepository.conn[6] ? SettingRepository.conn[6] : 'staging') conn6: Model<Setting>,
    @InjectModel(Setting.name, SettingRepository.conn[7] ? SettingRepository.conn[7] : 'staging') conn7: Model<Setting>,
    @InjectModel(Setting.name, SettingRepository.conn[8] ? SettingRepository.conn[8] : 'staging') conn8: Model<Setting>,
    @InjectModel(Setting.name, SettingRepository.conn[9] ? SettingRepository.conn[9] : 'staging') conn9: Model<Setting>,
  ){
    super({
      [SettingRepository.conn.at(0)]: conn0,
      [SettingRepository.conn.at(1)]: conn1,
      [SettingRepository.conn.at(2)]: conn2,
      [SettingRepository.conn.at(3)]: conn3,
      [SettingRepository.conn.at(4)]: conn4,
      [SettingRepository.conn.at(5)]: conn5,
      [SettingRepository.conn.at(6)]: conn6,
      [SettingRepository.conn.at(7)]: conn7,
      [SettingRepository.conn.at(8)]: conn8,
      [SettingRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


