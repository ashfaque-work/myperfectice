import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { AccreditationReports } from '../models';

@Injectable()
export class AccreditationReportsRepository extends AbstractRepository<AccreditationReports> {
    protected readonly logger = new Logger(AccreditationReportsRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(AccreditationReports.name, AccreditationReportsRepository.conn[0] ? AccreditationReportsRepository.conn[0] : 'staging') conn0: Model<AccreditationReports>,
        @InjectModel(AccreditationReports.name, AccreditationReportsRepository.conn[1] ? AccreditationReportsRepository.conn[1] : 'staging') conn1: Model<AccreditationReports>,
        @InjectModel(AccreditationReports.name, AccreditationReportsRepository.conn[2] ? AccreditationReportsRepository.conn[2] : 'staging') conn2: Model<AccreditationReports>,
        @InjectModel(AccreditationReports.name, AccreditationReportsRepository.conn[3] ? AccreditationReportsRepository.conn[3] : 'staging') conn3: Model<AccreditationReports>,
        @InjectModel(AccreditationReports.name, AccreditationReportsRepository.conn[4] ? AccreditationReportsRepository.conn[4] : 'staging') conn4: Model<AccreditationReports>,
        @InjectModel(AccreditationReports.name, AccreditationReportsRepository.conn[5] ? AccreditationReportsRepository.conn[5] : 'staging') conn5: Model<AccreditationReports>,
        @InjectModel(AccreditationReports.name, AccreditationReportsRepository.conn[6] ? AccreditationReportsRepository.conn[6] : 'staging') conn6: Model<AccreditationReports>,
        @InjectModel(AccreditationReports.name, AccreditationReportsRepository.conn[7] ? AccreditationReportsRepository.conn[7] : 'staging') conn7: Model<AccreditationReports>,
        @InjectModel(AccreditationReports.name, AccreditationReportsRepository.conn[8] ? AccreditationReportsRepository.conn[8] : 'staging') conn8: Model<AccreditationReports>,
        @InjectModel(AccreditationReports.name, AccreditationReportsRepository.conn[9] ? AccreditationReportsRepository.conn[9] : 'staging') conn9: Model<AccreditationReports>,
    ) {
        super({
            [AccreditationReportsRepository.conn.at(0)]: conn0,
            [AccreditationReportsRepository.conn.at(1)]: conn1,
            [AccreditationReportsRepository.conn.at(2)]: conn2,
            [AccreditationReportsRepository.conn.at(3)]: conn3,
            [AccreditationReportsRepository.conn.at(4)]: conn4,
            [AccreditationReportsRepository.conn.at(5)]: conn5,
            [AccreditationReportsRepository.conn.at(6)]: conn6,
            [AccreditationReportsRepository.conn.at(7)]: conn7,
            [AccreditationReportsRepository.conn.at(8)]: conn8,
            [AccreditationReportsRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}


