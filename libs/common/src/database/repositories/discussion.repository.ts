import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Discussion } from '../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class DiscussionRepository extends AbstractRepository<Discussion> {
  protected readonly logger = new Logger(DiscussionRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Discussion.name, DiscussionRepository.conn[0] ? DiscussionRepository.conn[0] : 'staging') conn0: Model<Discussion>,
    @InjectModel(Discussion.name, DiscussionRepository.conn[1] ? DiscussionRepository.conn[1] : 'staging') conn1: Model<Discussion>,
    @InjectModel(Discussion.name, DiscussionRepository.conn[2] ? DiscussionRepository.conn[2] : 'staging') conn2: Model<Discussion>,
    @InjectModel(Discussion.name, DiscussionRepository.conn[3] ? DiscussionRepository.conn[3] : 'staging') conn3: Model<Discussion>,
    @InjectModel(Discussion.name, DiscussionRepository.conn[4] ? DiscussionRepository.conn[4] : 'staging') conn4: Model<Discussion>,
    @InjectModel(Discussion.name, DiscussionRepository.conn[5] ? DiscussionRepository.conn[5] : 'staging') conn5: Model<Discussion>,
    @InjectModel(Discussion.name, DiscussionRepository.conn[6] ? DiscussionRepository.conn[6] : 'staging') conn6: Model<Discussion>,
    @InjectModel(Discussion.name, DiscussionRepository.conn[7] ? DiscussionRepository.conn[7] : 'staging') conn7: Model<Discussion>,
    @InjectModel(Discussion.name, DiscussionRepository.conn[8] ? DiscussionRepository.conn[8] : 'staging') conn8: Model<Discussion>,
    @InjectModel(Discussion.name, DiscussionRepository.conn[9] ? DiscussionRepository.conn[9] : 'staging') conn9: Model<Discussion>,
  ) {
    super({
      [DiscussionRepository.conn.at(0)]: conn0,
      [DiscussionRepository.conn.at(1)]: conn1,
      [DiscussionRepository.conn.at(2)]: conn2,
      [DiscussionRepository.conn.at(3)]: conn3,
      [DiscussionRepository.conn.at(4)]: conn4,
      [DiscussionRepository.conn.at(5)]: conn5,
      [DiscussionRepository.conn.at(6)]: conn6,
      [DiscussionRepository.conn.at(7)]: conn7,
      [DiscussionRepository.conn.at(8)]: conn8,
      [DiscussionRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


