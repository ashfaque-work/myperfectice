import { AbstractRepository } from '../../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject } from '../../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class SubjectRepository extends AbstractRepository<Subject> {
  protected readonly logger = new Logger(SubjectRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Subject.name, SubjectRepository.conn[0] ? SubjectRepository.conn[0] : 'staging') conn0: Model<Subject>,
    @InjectModel(Subject.name, SubjectRepository.conn[1] ? SubjectRepository.conn[1] : 'staging') conn1: Model<Subject>,
    @InjectModel(Subject.name, SubjectRepository.conn[2] ? SubjectRepository.conn[2] : 'staging') conn2: Model<Subject>,
    @InjectModel(Subject.name, SubjectRepository.conn[3] ? SubjectRepository.conn[3] : 'staging') conn3: Model<Subject>,
    @InjectModel(Subject.name, SubjectRepository.conn[4] ? SubjectRepository.conn[4] : 'staging') conn4: Model<Subject>,
    @InjectModel(Subject.name, SubjectRepository.conn[5] ? SubjectRepository.conn[5] : 'staging') conn5: Model<Subject>,
    @InjectModel(Subject.name, SubjectRepository.conn[6] ? SubjectRepository.conn[6] : 'staging') conn6: Model<Subject>,
    @InjectModel(Subject.name, SubjectRepository.conn[7] ? SubjectRepository.conn[7] : 'staging') conn7: Model<Subject>,
    @InjectModel(Subject.name, SubjectRepository.conn[8] ? SubjectRepository.conn[8] : 'staging') conn8: Model<Subject>,
    @InjectModel(Subject.name, SubjectRepository.conn[9] ? SubjectRepository.conn[9] : 'staging') conn9: Model<Subject>,
  ){
    super({
      [SubjectRepository.conn.at(0)]: conn0,
      [SubjectRepository.conn.at(1)]: conn1,
      [SubjectRepository.conn.at(2)]: conn2,
      [SubjectRepository.conn.at(3)]: conn3,
      [SubjectRepository.conn.at(4)]: conn4,
      [SubjectRepository.conn.at(5)]: conn5,
      [SubjectRepository.conn.at(6)]: conn6,
      [SubjectRepository.conn.at(7)]: conn7,
      [SubjectRepository.conn.at(8)]: conn8,
      [SubjectRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


