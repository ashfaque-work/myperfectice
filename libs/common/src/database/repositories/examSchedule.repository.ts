import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { ExamSchedule } from '../models';

@Injectable()
export class ExamScheduleRepository extends AbstractRepository<ExamSchedule> {
  protected readonly logger = new Logger(ExamScheduleRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(ExamSchedule.name, ExamScheduleRepository.conn[0] ? ExamScheduleRepository.conn[0] : 'staging') conn0: Model<ExamSchedule>,
    @InjectModel(ExamSchedule.name, ExamScheduleRepository.conn[1] ? ExamScheduleRepository.conn[1] : 'staging') conn1: Model<ExamSchedule>,
    @InjectModel(ExamSchedule.name, ExamScheduleRepository.conn[2] ? ExamScheduleRepository.conn[2] : 'staging') conn2: Model<ExamSchedule>,
    @InjectModel(ExamSchedule.name, ExamScheduleRepository.conn[3] ? ExamScheduleRepository.conn[3] : 'staging') conn3: Model<ExamSchedule>,
    @InjectModel(ExamSchedule.name, ExamScheduleRepository.conn[4] ? ExamScheduleRepository.conn[4] : 'staging') conn4: Model<ExamSchedule>,
    @InjectModel(ExamSchedule.name, ExamScheduleRepository.conn[5] ? ExamScheduleRepository.conn[5] : 'staging') conn5: Model<ExamSchedule>,
    @InjectModel(ExamSchedule.name, ExamScheduleRepository.conn[6] ? ExamScheduleRepository.conn[6] : 'staging') conn6: Model<ExamSchedule>,
    @InjectModel(ExamSchedule.name, ExamScheduleRepository.conn[7] ? ExamScheduleRepository.conn[7] : 'staging') conn7: Model<ExamSchedule>,
    @InjectModel(ExamSchedule.name, ExamScheduleRepository.conn[8] ? ExamScheduleRepository.conn[8] : 'staging') conn8: Model<ExamSchedule>,
    @InjectModel(ExamSchedule.name, ExamScheduleRepository.conn[9] ? ExamScheduleRepository.conn[9] : 'staging') conn9: Model<ExamSchedule>,
  ) {
    super({
      [ExamScheduleRepository.conn.at(0)]: conn0,
      [ExamScheduleRepository.conn.at(1)]: conn1,
      [ExamScheduleRepository.conn.at(2)]: conn2,
      [ExamScheduleRepository.conn.at(3)]: conn3,
      [ExamScheduleRepository.conn.at(4)]: conn4,
      [ExamScheduleRepository.conn.at(5)]: conn5,
      [ExamScheduleRepository.conn.at(6)]: conn6,
      [ExamScheduleRepository.conn.at(7)]: conn7,
      [ExamScheduleRepository.conn.at(8)]: conn8,
      [ExamScheduleRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


