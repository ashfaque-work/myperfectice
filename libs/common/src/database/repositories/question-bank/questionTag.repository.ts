import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuestionTag } from '../../models/question-bank/questionTag.schema';
import { AbstractRepository } from '../../abstract.repository';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class QuestionTagRepository extends AbstractRepository<QuestionTag> {
  protected readonly logger = new Logger(QuestionTagRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(QuestionTag.name, QuestionTagRepository.conn[0] ? QuestionTagRepository.conn[0] : 'staging') conn0: Model<QuestionTag>,
    @InjectModel(QuestionTag.name, QuestionTagRepository.conn[1] ? QuestionTagRepository.conn[1] : 'staging') conn1: Model<QuestionTag>,
    @InjectModel(QuestionTag.name, QuestionTagRepository.conn[2] ? QuestionTagRepository.conn[2] : 'staging') conn2: Model<QuestionTag>,
    @InjectModel(QuestionTag.name, QuestionTagRepository.conn[3] ? QuestionTagRepository.conn[3] : 'staging') conn3: Model<QuestionTag>,
    @InjectModel(QuestionTag.name, QuestionTagRepository.conn[4] ? QuestionTagRepository.conn[4] : 'staging') conn4: Model<QuestionTag>,
    @InjectModel(QuestionTag.name, QuestionTagRepository.conn[5] ? QuestionTagRepository.conn[5] : 'staging') conn5: Model<QuestionTag>,
    @InjectModel(QuestionTag.name, QuestionTagRepository.conn[6] ? QuestionTagRepository.conn[6] : 'staging') conn6: Model<QuestionTag>,
    @InjectModel(QuestionTag.name, QuestionTagRepository.conn[7] ? QuestionTagRepository.conn[7] : 'staging') conn7: Model<QuestionTag>,
    @InjectModel(QuestionTag.name, QuestionTagRepository.conn[8] ? QuestionTagRepository.conn[8] : 'staging') conn8: Model<QuestionTag>,
    @InjectModel(QuestionTag.name, QuestionTagRepository.conn[9] ? QuestionTagRepository.conn[9] : 'staging') conn9: Model<QuestionTag>,
  ) {
    super({
      [QuestionTagRepository.conn.at(0)]: conn0,
      [QuestionTagRepository.conn.at(1)]: conn1,
      [QuestionTagRepository.conn.at(2)]: conn2,
      [QuestionTagRepository.conn.at(3)]: conn3,
      [QuestionTagRepository.conn.at(4)]: conn4,
      [QuestionTagRepository.conn.at(5)]: conn5,
      [QuestionTagRepository.conn.at(6)]: conn6,
      [QuestionTagRepository.conn.at(7)]: conn7,
      [QuestionTagRepository.conn.at(8)]: conn8,
      [QuestionTagRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


