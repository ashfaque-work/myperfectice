import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { AccreditationAttainments } from '../models';

@Injectable()
export class AccreditationAttainmentsRepository extends AbstractRepository<AccreditationAttainments> {
    protected readonly logger = new Logger(AccreditationAttainmentsRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(AccreditationAttainments.name, AccreditationAttainmentsRepository.conn[0] ? AccreditationAttainmentsRepository.conn[0] : 'staging') conn0: Model<AccreditationAttainments>,
        @InjectModel(AccreditationAttainments.name, AccreditationAttainmentsRepository.conn[1] ? AccreditationAttainmentsRepository.conn[1] : 'staging') conn1: Model<AccreditationAttainments>,
        @InjectModel(AccreditationAttainments.name, AccreditationAttainmentsRepository.conn[2] ? AccreditationAttainmentsRepository.conn[2] : 'staging') conn2: Model<AccreditationAttainments>,
        @InjectModel(AccreditationAttainments.name, AccreditationAttainmentsRepository.conn[3] ? AccreditationAttainmentsRepository.conn[3] : 'staging') conn3: Model<AccreditationAttainments>,
        @InjectModel(AccreditationAttainments.name, AccreditationAttainmentsRepository.conn[4] ? AccreditationAttainmentsRepository.conn[4] : 'staging') conn4: Model<AccreditationAttainments>,
        @InjectModel(AccreditationAttainments.name, AccreditationAttainmentsRepository.conn[5] ? AccreditationAttainmentsRepository.conn[5] : 'staging') conn5: Model<AccreditationAttainments>,
        @InjectModel(AccreditationAttainments.name, AccreditationAttainmentsRepository.conn[6] ? AccreditationAttainmentsRepository.conn[6] : 'staging') conn6: Model<AccreditationAttainments>,
        @InjectModel(AccreditationAttainments.name, AccreditationAttainmentsRepository.conn[7] ? AccreditationAttainmentsRepository.conn[7] : 'staging') conn7: Model<AccreditationAttainments>,
        @InjectModel(AccreditationAttainments.name, AccreditationAttainmentsRepository.conn[8] ? AccreditationAttainmentsRepository.conn[8] : 'staging') conn8: Model<AccreditationAttainments>,
        @InjectModel(AccreditationAttainments.name, AccreditationAttainmentsRepository.conn[9] ? AccreditationAttainmentsRepository.conn[9] : 'staging') conn9: Model<AccreditationAttainments>,
    ) {
        super({
            [AccreditationAttainmentsRepository.conn.at(0)]: conn0,
            [AccreditationAttainmentsRepository.conn.at(1)]: conn1,
            [AccreditationAttainmentsRepository.conn.at(2)]: conn2,
            [AccreditationAttainmentsRepository.conn.at(3)]: conn3,
            [AccreditationAttainmentsRepository.conn.at(4)]: conn4,
            [AccreditationAttainmentsRepository.conn.at(5)]: conn5,
            [AccreditationAttainmentsRepository.conn.at(6)]: conn6,
            [AccreditationAttainmentsRepository.conn.at(7)]: conn7,
            [AccreditationAttainmentsRepository.conn.at(8)]: conn8,
            [AccreditationAttainmentsRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}


