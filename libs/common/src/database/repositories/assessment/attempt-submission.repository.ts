import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttemptSubmission } from '../../models';
import { AbstractRepository } from '../../abstract.repository';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class AttemptSubmissionRepository extends AbstractRepository<AttemptSubmission> {
  protected readonly logger = new Logger(AttemptSubmissionRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(AttemptSubmission.name, AttemptSubmissionRepository.conn[0] ? AttemptSubmissionRepository.conn[0] : 'staging') conn0: Model<AttemptSubmission>,
    @InjectModel(AttemptSubmission.name, AttemptSubmissionRepository.conn[1] ? AttemptSubmissionRepository.conn[1] : 'staging') conn1: Model<AttemptSubmission>,
    @InjectModel(AttemptSubmission.name, AttemptSubmissionRepository.conn[2] ? AttemptSubmissionRepository.conn[2] : 'staging') conn2: Model<AttemptSubmission>,
    @InjectModel(AttemptSubmission.name, AttemptSubmissionRepository.conn[3] ? AttemptSubmissionRepository.conn[3] : 'staging') conn3: Model<AttemptSubmission>,
    @InjectModel(AttemptSubmission.name, AttemptSubmissionRepository.conn[4] ? AttemptSubmissionRepository.conn[4] : 'staging') conn4: Model<AttemptSubmission>,
    @InjectModel(AttemptSubmission.name, AttemptSubmissionRepository.conn[5] ? AttemptSubmissionRepository.conn[5] : 'staging') conn5: Model<AttemptSubmission>,
    @InjectModel(AttemptSubmission.name, AttemptSubmissionRepository.conn[6] ? AttemptSubmissionRepository.conn[6] : 'staging') conn6: Model<AttemptSubmission>,
    @InjectModel(AttemptSubmission.name, AttemptSubmissionRepository.conn[7] ? AttemptSubmissionRepository.conn[7] : 'staging') conn7: Model<AttemptSubmission>,
    @InjectModel(AttemptSubmission.name, AttemptSubmissionRepository.conn[8] ? AttemptSubmissionRepository.conn[8] : 'staging') conn8: Model<AttemptSubmission>,
    @InjectModel(AttemptSubmission.name, AttemptSubmissionRepository.conn[9] ? AttemptSubmissionRepository.conn[9] : 'staging') conn9: Model<AttemptSubmission>,
  ){
    super({
      [AttemptSubmissionRepository.conn.at(0)]: conn0,
      [AttemptSubmissionRepository.conn.at(1)]: conn1,
      [AttemptSubmissionRepository.conn.at(2)]: conn2,
      [AttemptSubmissionRepository.conn.at(3)]: conn3,
      [AttemptSubmissionRepository.conn.at(4)]: conn4,
      [AttemptSubmissionRepository.conn.at(5)]: conn5,
      [AttemptSubmissionRepository.conn.at(6)]: conn6,
      [AttemptSubmissionRepository.conn.at(7)]: conn7,
      [AttemptSubmissionRepository.conn.at(8)]: conn8,
      [AttemptSubmissionRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


