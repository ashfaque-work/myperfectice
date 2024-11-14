import { AbstractRepository } from '../../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Program } from '../../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class ProgramRepository extends AbstractRepository<Program> {
  protected readonly logger = new Logger(ProgramRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Program.name, ProgramRepository.conn[0] ? ProgramRepository.conn[0] : 'staging') conn0: Model<Program>,
    @InjectModel(Program.name, ProgramRepository.conn[1] ? ProgramRepository.conn[1] : 'staging') conn1: Model<Program>,
    @InjectModel(Program.name, ProgramRepository.conn[2] ? ProgramRepository.conn[2] : 'staging') conn2: Model<Program>,
    @InjectModel(Program.name, ProgramRepository.conn[3] ? ProgramRepository.conn[3] : 'staging') conn3: Model<Program>,
    @InjectModel(Program.name, ProgramRepository.conn[4] ? ProgramRepository.conn[4] : 'staging') conn4: Model<Program>,
    @InjectModel(Program.name, ProgramRepository.conn[5] ? ProgramRepository.conn[5] : 'staging') conn5: Model<Program>,
    @InjectModel(Program.name, ProgramRepository.conn[6] ? ProgramRepository.conn[6] : 'staging') conn6: Model<Program>,
    @InjectModel(Program.name, ProgramRepository.conn[7] ? ProgramRepository.conn[7] : 'staging') conn7: Model<Program>,
    @InjectModel(Program.name, ProgramRepository.conn[8] ? ProgramRepository.conn[8] : 'staging') conn8: Model<Program>,
    @InjectModel(Program.name, ProgramRepository.conn[9] ? ProgramRepository.conn[9] : 'staging') conn9: Model<Program>,
  ){
    super({
      [ProgramRepository.conn.at(0)]: conn0,
      [ProgramRepository.conn.at(1)]: conn1,
      [ProgramRepository.conn.at(2)]: conn2,
      [ProgramRepository.conn.at(3)]: conn3,
      [ProgramRepository.conn.at(4)]: conn4,
      [ProgramRepository.conn.at(5)]: conn5,
      [ProgramRepository.conn.at(6)]: conn6,
      [ProgramRepository.conn.at(7)]: conn7,
      [ProgramRepository.conn.at(8)]: conn8,
      [ProgramRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}
