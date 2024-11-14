import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { AbstractRepository } from '../../abstract.repository';
import { Evaluation } from '../../models';

@Injectable()
export class EvaluationRepository extends AbstractRepository<Evaluation> {
  protected readonly logger = new Logger(EvaluationRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Evaluation.name, EvaluationRepository.conn[0] ? EvaluationRepository.conn[0] : 'staging') conn0: Model<Evaluation>,
    @InjectModel(Evaluation.name, EvaluationRepository.conn[1] ? EvaluationRepository.conn[1] : 'staging') conn1: Model<Evaluation>,
    @InjectModel(Evaluation.name, EvaluationRepository.conn[2] ? EvaluationRepository.conn[2] : 'staging') conn2: Model<Evaluation>,
    @InjectModel(Evaluation.name, EvaluationRepository.conn[3] ? EvaluationRepository.conn[3] : 'staging') conn3: Model<Evaluation>,
    @InjectModel(Evaluation.name, EvaluationRepository.conn[4] ? EvaluationRepository.conn[4] : 'staging') conn4: Model<Evaluation>,
    @InjectModel(Evaluation.name, EvaluationRepository.conn[5] ? EvaluationRepository.conn[5] : 'staging') conn5: Model<Evaluation>,
    @InjectModel(Evaluation.name, EvaluationRepository.conn[6] ? EvaluationRepository.conn[6] : 'staging') conn6: Model<Evaluation>,
    @InjectModel(Evaluation.name, EvaluationRepository.conn[7] ? EvaluationRepository.conn[7] : 'staging') conn7: Model<Evaluation>,
    @InjectModel(Evaluation.name, EvaluationRepository.conn[8] ? EvaluationRepository.conn[8] : 'staging') conn8: Model<Evaluation>,
    @InjectModel(Evaluation.name, EvaluationRepository.conn[9] ? EvaluationRepository.conn[9] : 'staging') conn9: Model<Evaluation>,
  ){
    super({
      [EvaluationRepository.conn.at(0)]: conn0,
      [EvaluationRepository.conn.at(1)]: conn1,
      [EvaluationRepository.conn.at(2)]: conn2,
      [EvaluationRepository.conn.at(3)]: conn3,
      [EvaluationRepository.conn.at(4)]: conn4,
      [EvaluationRepository.conn.at(5)]: conn5,
      [EvaluationRepository.conn.at(6)]: conn6,
      [EvaluationRepository.conn.at(7)]: conn7,
      [EvaluationRepository.conn.at(8)]: conn8,
      [EvaluationRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


