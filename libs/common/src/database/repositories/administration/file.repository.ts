import { AbstractRepository } from '../../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from '../../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class FileRepository extends AbstractRepository<File> {
  protected readonly logger = new Logger(FileRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(File.name, FileRepository.conn[0] ? FileRepository.conn[0] : 'staging') conn0: Model<File>,
    @InjectModel(File.name, FileRepository.conn[1] ? FileRepository.conn[1] : 'staging') conn1: Model<File>,
    @InjectModel(File.name, FileRepository.conn[2] ? FileRepository.conn[2] : 'staging') conn2: Model<File>,
    @InjectModel(File.name, FileRepository.conn[3] ? FileRepository.conn[3] : 'staging') conn3: Model<File>,
    @InjectModel(File.name, FileRepository.conn[4] ? FileRepository.conn[4] : 'staging') conn4: Model<File>,
    @InjectModel(File.name, FileRepository.conn[5] ? FileRepository.conn[5] : 'staging') conn5: Model<File>,
    @InjectModel(File.name, FileRepository.conn[6] ? FileRepository.conn[6] : 'staging') conn6: Model<File>,
    @InjectModel(File.name, FileRepository.conn[7] ? FileRepository.conn[7] : 'staging') conn7: Model<File>,
    @InjectModel(File.name, FileRepository.conn[8] ? FileRepository.conn[8] : 'staging') conn8: Model<File>,
    @InjectModel(File.name, FileRepository.conn[9] ? FileRepository.conn[9] : 'staging') conn9: Model<File>,
  ){
    super({
      [FileRepository.conn.at(0)]: conn0,
      [FileRepository.conn.at(1)]: conn1,
      [FileRepository.conn.at(2)]: conn2,
      [FileRepository.conn.at(3)]: conn3,
      [FileRepository.conn.at(4)]: conn4,
      [FileRepository.conn.at(5)]: conn5,
      [FileRepository.conn.at(6)]: conn6,
      [FileRepository.conn.at(7)]: conn7,
      [FileRepository.conn.at(8)]: conn8,
      [FileRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


