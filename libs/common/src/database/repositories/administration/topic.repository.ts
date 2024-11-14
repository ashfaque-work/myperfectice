import { AbstractRepository } from '../../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic } from '../../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class TopicRepository extends AbstractRepository<Topic> {
  protected readonly logger = new Logger(TopicRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Topic.name, TopicRepository.conn[0] ? TopicRepository.conn[0] : 'staging') conn0: Model<Topic>,
    @InjectModel(Topic.name, TopicRepository.conn[1] ? TopicRepository.conn[1] : 'staging') conn1: Model<Topic>,
    @InjectModel(Topic.name, TopicRepository.conn[2] ? TopicRepository.conn[2] : 'staging') conn2: Model<Topic>,
    @InjectModel(Topic.name, TopicRepository.conn[3] ? TopicRepository.conn[3] : 'staging') conn3: Model<Topic>,
    @InjectModel(Topic.name, TopicRepository.conn[4] ? TopicRepository.conn[4] : 'staging') conn4: Model<Topic>,
    @InjectModel(Topic.name, TopicRepository.conn[5] ? TopicRepository.conn[5] : 'staging') conn5: Model<Topic>,
    @InjectModel(Topic.name, TopicRepository.conn[6] ? TopicRepository.conn[6] : 'staging') conn6: Model<Topic>,
    @InjectModel(Topic.name, TopicRepository.conn[7] ? TopicRepository.conn[7] : 'staging') conn7: Model<Topic>,
    @InjectModel(Topic.name, TopicRepository.conn[8] ? TopicRepository.conn[8] : 'staging') conn8: Model<Topic>,
    @InjectModel(Topic.name, TopicRepository.conn[9] ? TopicRepository.conn[9] : 'staging') conn9: Model<Topic>,
  ){
    super({
      [TopicRepository.conn.at(0)]: conn0,
      [TopicRepository.conn.at(1)]: conn1,
      [TopicRepository.conn.at(2)]: conn2,
      [TopicRepository.conn.at(3)]: conn3,
      [TopicRepository.conn.at(4)]: conn4,
      [TopicRepository.conn.at(5)]: conn5,
      [TopicRepository.conn.at(6)]: conn6,
      [TopicRepository.conn.at(7)]: conn7,
      [TopicRepository.conn.at(8)]: conn8,
      [TopicRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


