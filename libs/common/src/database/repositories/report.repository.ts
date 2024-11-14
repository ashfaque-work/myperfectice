import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Report } from "../models";

@Injectable()
export class ReportRepository extends AbstractRepository<Report> {
  protected readonly logger = new Logger(ReportRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Report.name, ReportRepository.conn[0] ? ReportRepository.conn[0] : 'staging') conn0: Model<Report>,
    @InjectModel(Report.name, ReportRepository.conn[1] ? ReportRepository.conn[1] : 'staging') conn1: Model<Report>,
    @InjectModel(Report.name, ReportRepository.conn[2] ? ReportRepository.conn[2] : 'staging') conn2: Model<Report>,
    @InjectModel(Report.name, ReportRepository.conn[3] ? ReportRepository.conn[3] : 'staging') conn3: Model<Report>,
    @InjectModel(Report.name, ReportRepository.conn[4] ? ReportRepository.conn[4] : 'staging') conn4: Model<Report>,
    @InjectModel(Report.name, ReportRepository.conn[5] ? ReportRepository.conn[5] : 'staging') conn5: Model<Report>,
    @InjectModel(Report.name, ReportRepository.conn[6] ? ReportRepository.conn[6] : 'staging') conn6: Model<Report>,
    @InjectModel(Report.name, ReportRepository.conn[7] ? ReportRepository.conn[7] : 'staging') conn7: Model<Report>,
    @InjectModel(Report.name, ReportRepository.conn[8] ? ReportRepository.conn[8] : 'staging') conn8: Model<Report>,
    @InjectModel(Report.name, ReportRepository.conn[9] ? ReportRepository.conn[9] : 'staging') conn9: Model<Report>,
  ) {
    super({
      [ReportRepository.conn.at(0)]: conn0,
      [ReportRepository.conn.at(1)]: conn1,
      [ReportRepository.conn.at(2)]: conn2,
      [ReportRepository.conn.at(3)]: conn3,
      [ReportRepository.conn.at(4)]: conn4,
      [ReportRepository.conn.at(5)]: conn5,
      [ReportRepository.conn.at(6)]: conn6,
      [ReportRepository.conn.at(7)]: conn7,
      [ReportRepository.conn.at(8)]: conn8,
      [ReportRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}