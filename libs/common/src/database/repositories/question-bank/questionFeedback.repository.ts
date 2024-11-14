import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '../../abstract.repository';
import { QuestionFeedback } from '../../models/question-bank/questionFeedback.schema';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class QuestionFeedbackRepository extends AbstractRepository<QuestionFeedback> {
  protected readonly logger = new Logger(QuestionFeedbackRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(QuestionFeedback.name, QuestionFeedbackRepository.conn[0] ? QuestionFeedbackRepository.conn[0] : 'staging') conn0: Model<QuestionFeedback>,
    @InjectModel(QuestionFeedback.name, QuestionFeedbackRepository.conn[1] ? QuestionFeedbackRepository.conn[1] : 'staging') conn1: Model<QuestionFeedback>,
    @InjectModel(QuestionFeedback.name, QuestionFeedbackRepository.conn[2] ? QuestionFeedbackRepository.conn[2] : 'staging') conn2: Model<QuestionFeedback>,
    @InjectModel(QuestionFeedback.name, QuestionFeedbackRepository.conn[3] ? QuestionFeedbackRepository.conn[3] : 'staging') conn3: Model<QuestionFeedback>,
    @InjectModel(QuestionFeedback.name, QuestionFeedbackRepository.conn[4] ? QuestionFeedbackRepository.conn[4] : 'staging') conn4: Model<QuestionFeedback>,
    @InjectModel(QuestionFeedback.name, QuestionFeedbackRepository.conn[5] ? QuestionFeedbackRepository.conn[5] : 'staging') conn5: Model<QuestionFeedback>,
    @InjectModel(QuestionFeedback.name, QuestionFeedbackRepository.conn[6] ? QuestionFeedbackRepository.conn[6] : 'staging') conn6: Model<QuestionFeedback>,
    @InjectModel(QuestionFeedback.name, QuestionFeedbackRepository.conn[7] ? QuestionFeedbackRepository.conn[7] : 'staging') conn7: Model<QuestionFeedback>,
    @InjectModel(QuestionFeedback.name, QuestionFeedbackRepository.conn[8] ? QuestionFeedbackRepository.conn[8] : 'staging') conn8: Model<QuestionFeedback>,
    @InjectModel(QuestionFeedback.name, QuestionFeedbackRepository.conn[9] ? QuestionFeedbackRepository.conn[9] : 'staging') conn9: Model<QuestionFeedback>,
  ) {
    super({
      [QuestionFeedbackRepository.conn.at(0)]: conn0,
      [QuestionFeedbackRepository.conn.at(1)]: conn1,
      [QuestionFeedbackRepository.conn.at(2)]: conn2,
      [QuestionFeedbackRepository.conn.at(3)]: conn3,
      [QuestionFeedbackRepository.conn.at(4)]: conn4,
      [QuestionFeedbackRepository.conn.at(5)]: conn5,
      [QuestionFeedbackRepository.conn.at(6)]: conn6,
      [QuestionFeedbackRepository.conn.at(7)]: conn7,
      [QuestionFeedbackRepository.conn.at(8)]: conn8,
      [QuestionFeedbackRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


