import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { ProgramOutcome } from "../models/programOutcome.schema";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ProgramOutcomeRepository extends AbstractRepository<ProgramOutcome> {
  protected readonly logger = new Logger(ProgramOutcomeRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(ProgramOutcome.name, ProgramOutcomeRepository.conn[0] ? ProgramOutcomeRepository.conn[0] : 'staging') conn0: Model<ProgramOutcome>,
    @InjectModel(ProgramOutcome.name, ProgramOutcomeRepository.conn[1] ? ProgramOutcomeRepository.conn[1] : 'staging') conn1: Model<ProgramOutcome>,
    @InjectModel(ProgramOutcome.name, ProgramOutcomeRepository.conn[2] ? ProgramOutcomeRepository.conn[2] : 'staging') conn2: Model<ProgramOutcome>,
    @InjectModel(ProgramOutcome.name, ProgramOutcomeRepository.conn[3] ? ProgramOutcomeRepository.conn[3] : 'staging') conn3: Model<ProgramOutcome>,
    @InjectModel(ProgramOutcome.name, ProgramOutcomeRepository.conn[4] ? ProgramOutcomeRepository.conn[4] : 'staging') conn4: Model<ProgramOutcome>,
    @InjectModel(ProgramOutcome.name, ProgramOutcomeRepository.conn[5] ? ProgramOutcomeRepository.conn[5] : 'staging') conn5: Model<ProgramOutcome>,
    @InjectModel(ProgramOutcome.name, ProgramOutcomeRepository.conn[6] ? ProgramOutcomeRepository.conn[6] : 'staging') conn6: Model<ProgramOutcome>,
    @InjectModel(ProgramOutcome.name, ProgramOutcomeRepository.conn[7] ? ProgramOutcomeRepository.conn[7] : 'staging') conn7: Model<ProgramOutcome>,
    @InjectModel(ProgramOutcome.name, ProgramOutcomeRepository.conn[8] ? ProgramOutcomeRepository.conn[8] : 'staging') conn8: Model<ProgramOutcome>,
    @InjectModel(ProgramOutcome.name, ProgramOutcomeRepository.conn[9] ? ProgramOutcomeRepository.conn[9] : 'staging') conn9: Model<ProgramOutcome>,
  ) {
    super({
      [ProgramOutcomeRepository.conn.at(0)]: conn0,
      [ProgramOutcomeRepository.conn.at(1)]: conn1,
      [ProgramOutcomeRepository.conn.at(2)]: conn2,
      [ProgramOutcomeRepository.conn.at(3)]: conn3,
      [ProgramOutcomeRepository.conn.at(4)]: conn4,
      [ProgramOutcomeRepository.conn.at(5)]: conn5,
      [ProgramOutcomeRepository.conn.at(6)]: conn6,
      [ProgramOutcomeRepository.conn.at(7)]: conn7,
      [ProgramOutcomeRepository.conn.at(8)]: conn8,
      [ProgramOutcomeRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}