import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class CourseRepository extends AbstractRepository<Course> {
  protected readonly logger = new Logger(CourseRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Course.name, CourseRepository.conn[0] ? CourseRepository.conn[0] : 'staging') conn0: Model<Course>,
    @InjectModel(Course.name, CourseRepository.conn[1] ? CourseRepository.conn[1] : 'staging') conn1: Model<Course>,
    @InjectModel(Course.name, CourseRepository.conn[2] ? CourseRepository.conn[2] : 'staging') conn2: Model<Course>,
    @InjectModel(Course.name, CourseRepository.conn[3] ? CourseRepository.conn[3] : 'staging') conn3: Model<Course>,
    @InjectModel(Course.name, CourseRepository.conn[4] ? CourseRepository.conn[4] : 'staging') conn4: Model<Course>,
    @InjectModel(Course.name, CourseRepository.conn[5] ? CourseRepository.conn[5] : 'staging') conn5: Model<Course>,
    @InjectModel(Course.name, CourseRepository.conn[6] ? CourseRepository.conn[6] : 'staging') conn6: Model<Course>,
    @InjectModel(Course.name, CourseRepository.conn[7] ? CourseRepository.conn[7] : 'staging') conn7: Model<Course>,
    @InjectModel(Course.name, CourseRepository.conn[8] ? CourseRepository.conn[8] : 'staging') conn8: Model<Course>,
    @InjectModel(Course.name, CourseRepository.conn[9] ? CourseRepository.conn[9] : 'staging') conn9: Model<Course>,
  ) {
    super({
      [CourseRepository.conn.at(0)]: conn0,
      [CourseRepository.conn.at(1)]: conn1,
      [CourseRepository.conn.at(2)]: conn2,
      [CourseRepository.conn.at(3)]: conn3,
      [CourseRepository.conn.at(4)]: conn4,
      [CourseRepository.conn.at(5)]: conn5,
      [CourseRepository.conn.at(6)]: conn6,
      [CourseRepository.conn.at(7)]: conn7,
      [CourseRepository.conn.at(8)]: conn8,
      [CourseRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


