import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '../abstract.repository';
import { User } from '../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UsersRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(User.name, UsersRepository.conn[0] ? UsersRepository.conn[0] : 'staging') conn0: Model<User>,
    @InjectModel(User.name, UsersRepository.conn[1] ? UsersRepository.conn[1] : 'staging') conn1: Model<User>,
    @InjectModel(User.name, UsersRepository.conn[2] ? UsersRepository.conn[2] : 'staging') conn2: Model<User>,
    @InjectModel(User.name, UsersRepository.conn[3] ? UsersRepository.conn[3] : 'staging') conn3: Model<User>,
    @InjectModel(User.name, UsersRepository.conn[4] ? UsersRepository.conn[4] : 'staging') conn4: Model<User>,
    @InjectModel(User.name, UsersRepository.conn[5] ? UsersRepository.conn[5] : 'staging') conn5: Model<User>,
    @InjectModel(User.name, UsersRepository.conn[6] ? UsersRepository.conn[6] : 'staging') conn6: Model<User>,
    @InjectModel(User.name, UsersRepository.conn[7] ? UsersRepository.conn[7] : 'staging') conn7: Model<User>,
    @InjectModel(User.name, UsersRepository.conn[8] ? UsersRepository.conn[8] : 'staging') conn8: Model<User>,
    @InjectModel(User.name, UsersRepository.conn[9] ? UsersRepository.conn[9] : 'staging') conn9: Model<User>,
  ) {
    super({
      [UsersRepository.conn.at(0)]: conn0,
      [UsersRepository.conn.at(1)]: conn1,
      [UsersRepository.conn.at(2)]: conn2,
      [UsersRepository.conn.at(3)]: conn3,
      [UsersRepository.conn.at(4)]: conn4,
      [UsersRepository.conn.at(5)]: conn5,
      [UsersRepository.conn.at(6)]: conn6,
      [UsersRepository.conn.at(7)]: conn7,
      [UsersRepository.conn.at(8)]: conn8,
      [UsersRepository.conn.at(9)]: conn9,
    });
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}
