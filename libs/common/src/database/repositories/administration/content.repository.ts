import { AbstractRepository } from '../../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content } from '../../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class ContentRepository extends AbstractRepository<Content> {
  protected readonly logger = new Logger(ContentRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Content.name, ContentRepository.conn[0] ? ContentRepository.conn[0] : 'staging') conn0: Model<Content>,
    @InjectModel(Content.name, ContentRepository.conn[1] ? ContentRepository.conn[1] : 'staging') conn1: Model<Content>,
    @InjectModel(Content.name, ContentRepository.conn[2] ? ContentRepository.conn[2] : 'staging') conn2: Model<Content>,
    @InjectModel(Content.name, ContentRepository.conn[3] ? ContentRepository.conn[3] : 'staging') conn3: Model<Content>,
    @InjectModel(Content.name, ContentRepository.conn[4] ? ContentRepository.conn[4] : 'staging') conn4: Model<Content>,
    @InjectModel(Content.name, ContentRepository.conn[5] ? ContentRepository.conn[5] : 'staging') conn5: Model<Content>,
    @InjectModel(Content.name, ContentRepository.conn[6] ? ContentRepository.conn[6] : 'staging') conn6: Model<Content>,
    @InjectModel(Content.name, ContentRepository.conn[7] ? ContentRepository.conn[7] : 'staging') conn7: Model<Content>,
    @InjectModel(Content.name, ContentRepository.conn[8] ? ContentRepository.conn[8] : 'staging') conn8: Model<Content>,
    @InjectModel(Content.name, ContentRepository.conn[9] ? ContentRepository.conn[9] : 'staging') conn9: Model<Content>,
  ){
    super({
      [ContentRepository.conn.at(0)]: conn0,
      [ContentRepository.conn.at(1)]: conn1,
      [ContentRepository.conn.at(2)]: conn2,
      [ContentRepository.conn.at(3)]: conn3,
      [ContentRepository.conn.at(4)]: conn4,
      [ContentRepository.conn.at(5)]: conn5,
      [ContentRepository.conn.at(6)]: conn6,
      [ContentRepository.conn.at(7)]: conn7,
      [ContentRepository.conn.at(8)]: conn8,
      [ContentRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


