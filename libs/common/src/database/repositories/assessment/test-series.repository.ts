import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '../../abstract.repository';
import { instanceKeys } from '@app/common/config';
import { TestSeries } from '../../models';

@Injectable()
export class TestSeriesRepository extends AbstractRepository<TestSeries> {
  protected readonly logger = new Logger(TestSeriesRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(TestSeries.name, TestSeriesRepository.conn[0] ? TestSeriesRepository.conn[0] : 'staging') conn0: Model<TestSeries>,
    @InjectModel(TestSeries.name, TestSeriesRepository.conn[1] ? TestSeriesRepository.conn[1] : 'staging') conn1: Model<TestSeries>,
    @InjectModel(TestSeries.name, TestSeriesRepository.conn[2] ? TestSeriesRepository.conn[2] : 'staging') conn2: Model<TestSeries>,
    @InjectModel(TestSeries.name, TestSeriesRepository.conn[3] ? TestSeriesRepository.conn[3] : 'staging') conn3: Model<TestSeries>,
    @InjectModel(TestSeries.name, TestSeriesRepository.conn[4] ? TestSeriesRepository.conn[4] : 'staging') conn4: Model<TestSeries>,
    @InjectModel(TestSeries.name, TestSeriesRepository.conn[5] ? TestSeriesRepository.conn[5] : 'staging') conn5: Model<TestSeries>,
    @InjectModel(TestSeries.name, TestSeriesRepository.conn[6] ? TestSeriesRepository.conn[6] : 'staging') conn6: Model<TestSeries>,
    @InjectModel(TestSeries.name, TestSeriesRepository.conn[7] ? TestSeriesRepository.conn[7] : 'staging') conn7: Model<TestSeries>,
    @InjectModel(TestSeries.name, TestSeriesRepository.conn[8] ? TestSeriesRepository.conn[8] : 'staging') conn8: Model<TestSeries>,
    @InjectModel(TestSeries.name, TestSeriesRepository.conn[9] ? TestSeriesRepository.conn[9] : 'staging') conn9: Model<TestSeries>,
  ){
    super({
      [TestSeriesRepository.conn.at(0)]: conn0,
      [TestSeriesRepository.conn.at(1)]: conn1,
      [TestSeriesRepository.conn.at(2)]: conn2,
      [TestSeriesRepository.conn.at(3)]: conn3,
      [TestSeriesRepository.conn.at(4)]: conn4,
      [TestSeriesRepository.conn.at(5)]: conn5,
      [TestSeriesRepository.conn.at(6)]: conn6,
      [TestSeriesRepository.conn.at(7)]: conn7,
      [TestSeriesRepository.conn.at(8)]: conn8,
      [TestSeriesRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


