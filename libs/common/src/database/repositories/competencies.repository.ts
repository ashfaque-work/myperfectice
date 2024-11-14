import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Competencies } from "../models";

@Injectable()
export class CompetenciesRepository extends AbstractRepository<Competencies> {
  protected readonly logger = new Logger(CompetenciesRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Competencies.name, CompetenciesRepository.conn[0] ? CompetenciesRepository.conn[0] : 'staging') conn0: Model<Competencies>,
    @InjectModel(Competencies.name, CompetenciesRepository.conn[1] ? CompetenciesRepository.conn[1] : 'staging') conn1: Model<Competencies>,
    @InjectModel(Competencies.name, CompetenciesRepository.conn[2] ? CompetenciesRepository.conn[2] : 'staging') conn2: Model<Competencies>,
    @InjectModel(Competencies.name, CompetenciesRepository.conn[3] ? CompetenciesRepository.conn[3] : 'staging') conn3: Model<Competencies>,
    @InjectModel(Competencies.name, CompetenciesRepository.conn[4] ? CompetenciesRepository.conn[4] : 'staging') conn4: Model<Competencies>,
    @InjectModel(Competencies.name, CompetenciesRepository.conn[5] ? CompetenciesRepository.conn[5] : 'staging') conn5: Model<Competencies>,
    @InjectModel(Competencies.name, CompetenciesRepository.conn[6] ? CompetenciesRepository.conn[6] : 'staging') conn6: Model<Competencies>,
    @InjectModel(Competencies.name, CompetenciesRepository.conn[7] ? CompetenciesRepository.conn[7] : 'staging') conn7: Model<Competencies>,
    @InjectModel(Competencies.name, CompetenciesRepository.conn[8] ? CompetenciesRepository.conn[8] : 'staging') conn8: Model<Competencies>,
    @InjectModel(Competencies.name, CompetenciesRepository.conn[9] ? CompetenciesRepository.conn[9] : 'staging') conn9: Model<Competencies>,
  ) {
    super({
      [CompetenciesRepository.conn.at(0)]: conn0,
      [CompetenciesRepository.conn.at(1)]: conn1,
      [CompetenciesRepository.conn.at(2)]: conn2,
      [CompetenciesRepository.conn.at(3)]: conn3,
      [CompetenciesRepository.conn.at(4)]: conn4,
      [CompetenciesRepository.conn.at(5)]: conn5,
      [CompetenciesRepository.conn.at(6)]: conn6,
      [CompetenciesRepository.conn.at(7)]: conn7,
      [CompetenciesRepository.conn.at(8)]: conn8,
      [CompetenciesRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}