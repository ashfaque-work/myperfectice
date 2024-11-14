import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { AccreditationEvaluations } from '../models';

@Injectable()
export class AccreditationEvaluationsRepository extends AbstractRepository<AccreditationEvaluations> {
    protected readonly logger = new Logger(AccreditationEvaluationsRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(AccreditationEvaluations.name, AccreditationEvaluationsRepository.conn[0] ? AccreditationEvaluationsRepository.conn[0] : 'staging') conn0: Model<AccreditationEvaluations>,
        @InjectModel(AccreditationEvaluations.name, AccreditationEvaluationsRepository.conn[1] ? AccreditationEvaluationsRepository.conn[1] : 'staging') conn1: Model<AccreditationEvaluations>,
        @InjectModel(AccreditationEvaluations.name, AccreditationEvaluationsRepository.conn[2] ? AccreditationEvaluationsRepository.conn[2] : 'staging') conn2: Model<AccreditationEvaluations>,
        @InjectModel(AccreditationEvaluations.name, AccreditationEvaluationsRepository.conn[3] ? AccreditationEvaluationsRepository.conn[3] : 'staging') conn3: Model<AccreditationEvaluations>,
        @InjectModel(AccreditationEvaluations.name, AccreditationEvaluationsRepository.conn[4] ? AccreditationEvaluationsRepository.conn[4] : 'staging') conn4: Model<AccreditationEvaluations>,
        @InjectModel(AccreditationEvaluations.name, AccreditationEvaluationsRepository.conn[5] ? AccreditationEvaluationsRepository.conn[5] : 'staging') conn5: Model<AccreditationEvaluations>,
        @InjectModel(AccreditationEvaluations.name, AccreditationEvaluationsRepository.conn[6] ? AccreditationEvaluationsRepository.conn[6] : 'staging') conn6: Model<AccreditationEvaluations>,
        @InjectModel(AccreditationEvaluations.name, AccreditationEvaluationsRepository.conn[7] ? AccreditationEvaluationsRepository.conn[7] : 'staging') conn7: Model<AccreditationEvaluations>,
        @InjectModel(AccreditationEvaluations.name, AccreditationEvaluationsRepository.conn[8] ? AccreditationEvaluationsRepository.conn[8] : 'staging') conn8: Model<AccreditationEvaluations>,
        @InjectModel(AccreditationEvaluations.name, AccreditationEvaluationsRepository.conn[9] ? AccreditationEvaluationsRepository.conn[9] : 'staging') conn9: Model<AccreditationEvaluations>,
    ) {
        super({
            [AccreditationEvaluationsRepository.conn.at(0)]: conn0,
            [AccreditationEvaluationsRepository.conn.at(1)]: conn1,
            [AccreditationEvaluationsRepository.conn.at(2)]: conn2,
            [AccreditationEvaluationsRepository.conn.at(3)]: conn3,
            [AccreditationEvaluationsRepository.conn.at(4)]: conn4,
            [AccreditationEvaluationsRepository.conn.at(5)]: conn5,
            [AccreditationEvaluationsRepository.conn.at(6)]: conn6,
            [AccreditationEvaluationsRepository.conn.at(7)]: conn7,
            [AccreditationEvaluationsRepository.conn.at(8)]: conn8,
            [AccreditationEvaluationsRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}


