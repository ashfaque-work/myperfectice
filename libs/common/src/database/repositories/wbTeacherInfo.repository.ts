import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { wbTeacherInfo } from '../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class wbTeacherInfoRepository extends AbstractRepository<wbTeacherInfo> {
  protected readonly logger = new Logger(wbTeacherInfoRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(wbTeacherInfo.name, wbTeacherInfoRepository.conn[0] ? wbTeacherInfoRepository.conn[0] : 'staging') conn0: Model<wbTeacherInfo>,
    @InjectModel(wbTeacherInfo.name, wbTeacherInfoRepository.conn[1] ? wbTeacherInfoRepository.conn[1] : 'staging') conn1: Model<wbTeacherInfo>,
    @InjectModel(wbTeacherInfo.name, wbTeacherInfoRepository.conn[2] ? wbTeacherInfoRepository.conn[2] : 'staging') conn2: Model<wbTeacherInfo>,
    @InjectModel(wbTeacherInfo.name, wbTeacherInfoRepository.conn[3] ? wbTeacherInfoRepository.conn[3] : 'staging') conn3: Model<wbTeacherInfo>,
    @InjectModel(wbTeacherInfo.name, wbTeacherInfoRepository.conn[4] ? wbTeacherInfoRepository.conn[4] : 'staging') conn4: Model<wbTeacherInfo>,
    @InjectModel(wbTeacherInfo.name, wbTeacherInfoRepository.conn[5] ? wbTeacherInfoRepository.conn[5] : 'staging') conn5: Model<wbTeacherInfo>,
    @InjectModel(wbTeacherInfo.name, wbTeacherInfoRepository.conn[6] ? wbTeacherInfoRepository.conn[6] : 'staging') conn6: Model<wbTeacherInfo>,
    @InjectModel(wbTeacherInfo.name, wbTeacherInfoRepository.conn[7] ? wbTeacherInfoRepository.conn[7] : 'staging') conn7: Model<wbTeacherInfo>,
    @InjectModel(wbTeacherInfo.name, wbTeacherInfoRepository.conn[8] ? wbTeacherInfoRepository.conn[8] : 'staging') conn8: Model<wbTeacherInfo>,
    @InjectModel(wbTeacherInfo.name, wbTeacherInfoRepository.conn[9] ? wbTeacherInfoRepository.conn[9] : 'staging') conn9: Model<wbTeacherInfo>,
  ) {
    super({
      [wbTeacherInfoRepository.conn.at(0)]: conn0,
      [wbTeacherInfoRepository.conn.at(1)]: conn1,
      [wbTeacherInfoRepository.conn.at(2)]: conn2,
      [wbTeacherInfoRepository.conn.at(3)]: conn3,
      [wbTeacherInfoRepository.conn.at(4)]: conn4,
      [wbTeacherInfoRepository.conn.at(5)]: conn5,
      [wbTeacherInfoRepository.conn.at(6)]: conn6,
      [wbTeacherInfoRepository.conn.at(7)]: conn7,
      [wbTeacherInfoRepository.conn.at(8)]: conn8,
      [wbTeacherInfoRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


