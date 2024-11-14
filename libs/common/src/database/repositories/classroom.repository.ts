import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Classroom } from '../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class ClassroomRepository extends AbstractRepository<Classroom> {
  protected readonly logger = new Logger(ClassroomRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Classroom.name, ClassroomRepository.conn[0] ? ClassroomRepository.conn[0] : 'staging') conn0: Model<Classroom>,
    @InjectModel(Classroom.name, ClassroomRepository.conn[1] ? ClassroomRepository.conn[1] : 'staging') conn1: Model<Classroom>,
    @InjectModel(Classroom.name, ClassroomRepository.conn[2] ? ClassroomRepository.conn[2] : 'staging') conn2: Model<Classroom>,
    @InjectModel(Classroom.name, ClassroomRepository.conn[3] ? ClassroomRepository.conn[3] : 'staging') conn3: Model<Classroom>,
    @InjectModel(Classroom.name, ClassroomRepository.conn[4] ? ClassroomRepository.conn[4] : 'staging') conn4: Model<Classroom>,
    @InjectModel(Classroom.name, ClassroomRepository.conn[5] ? ClassroomRepository.conn[5] : 'staging') conn5: Model<Classroom>,
    @InjectModel(Classroom.name, ClassroomRepository.conn[6] ? ClassroomRepository.conn[6] : 'staging') conn6: Model<Classroom>,
    @InjectModel(Classroom.name, ClassroomRepository.conn[7] ? ClassroomRepository.conn[7] : 'staging') conn7: Model<Classroom>,
    @InjectModel(Classroom.name, ClassroomRepository.conn[8] ? ClassroomRepository.conn[8] : 'staging') conn8: Model<Classroom>,
    @InjectModel(Classroom.name, ClassroomRepository.conn[9] ? ClassroomRepository.conn[9] : 'staging') conn9: Model<Classroom>,
  ) {
    super({
      [ClassroomRepository.conn.at(0)]: conn0,
      [ClassroomRepository.conn.at(1)]: conn1,
      [ClassroomRepository.conn.at(2)]: conn2,
      [ClassroomRepository.conn.at(3)]: conn3,
      [ClassroomRepository.conn.at(4)]: conn4,
      [ClassroomRepository.conn.at(5)]: conn5,
      [ClassroomRepository.conn.at(6)]: conn6,
      [ClassroomRepository.conn.at(7)]: conn7,
      [ClassroomRepository.conn.at(8)]: conn8,
      [ClassroomRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


