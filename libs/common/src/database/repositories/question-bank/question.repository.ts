import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from '../../models/question-bank/question.schema';
import { instanceKeys } from '@app/common/config';
import { AbstractRepository } from '../../abstract.repository';

@Injectable()
export class QuestionRepository extends AbstractRepository<Question> {
  protected readonly logger = new Logger(QuestionRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Question.name, QuestionRepository.conn[0] ? QuestionRepository.conn[0] : 'staging') conn0: Model<Question>,
    @InjectModel(Question.name, QuestionRepository.conn[1] ? QuestionRepository.conn[1] : 'staging') conn1: Model<Question>,
    @InjectModel(Question.name, QuestionRepository.conn[2] ? QuestionRepository.conn[2] : 'staging') conn2: Model<Question>,
    @InjectModel(Question.name, QuestionRepository.conn[3] ? QuestionRepository.conn[3] : 'staging') conn3: Model<Question>,
    @InjectModel(Question.name, QuestionRepository.conn[4] ? QuestionRepository.conn[4] : 'staging') conn4: Model<Question>,
    @InjectModel(Question.name, QuestionRepository.conn[5] ? QuestionRepository.conn[5] : 'staging') conn5: Model<Question>,
    @InjectModel(Question.name, QuestionRepository.conn[6] ? QuestionRepository.conn[6] : 'staging') conn6: Model<Question>,
    @InjectModel(Question.name, QuestionRepository.conn[7] ? QuestionRepository.conn[7] : 'staging') conn7: Model<Question>,
    @InjectModel(Question.name, QuestionRepository.conn[8] ? QuestionRepository.conn[8] : 'staging') conn8: Model<Question>,
    @InjectModel(Question.name, QuestionRepository.conn[9] ? QuestionRepository.conn[9] : 'staging') conn9: Model<Question>,
  ){
    super({
      [QuestionRepository.conn.at(0)]: conn0,
      [QuestionRepository.conn.at(1)]: conn1,
      [QuestionRepository.conn.at(2)]: conn2,
      [QuestionRepository.conn.at(3)]: conn3,
      [QuestionRepository.conn.at(4)]: conn4,
      [QuestionRepository.conn.at(5)]: conn5,
      [QuestionRepository.conn.at(6)]: conn6,
      [QuestionRepository.conn.at(7)]: conn7,
      [QuestionRepository.conn.at(8)]: conn8,
      [QuestionRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


