import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { AbstractRepository } from '../../../abstract.repository';
import { Instance } from '../../../models';


@Injectable()
export class InstanceRepository extends AbstractRepository<Instance> {
    protected readonly logger = new Logger(InstanceRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(Instance.name, InstanceRepository.conn[0] ? InstanceRepository.conn[0] : 'staging') conn0: Model<Instance>,
        @InjectModel(Instance.name, InstanceRepository.conn[1] ? InstanceRepository.conn[1] : 'staging') conn1: Model<Instance>,
        @InjectModel(Instance.name, InstanceRepository.conn[2] ? InstanceRepository.conn[2] : 'staging') conn2: Model<Instance>,
        @InjectModel(Instance.name, InstanceRepository.conn[3] ? InstanceRepository.conn[3] : 'staging') conn3: Model<Instance>,
        @InjectModel(Instance.name, InstanceRepository.conn[4] ? InstanceRepository.conn[4] : 'staging') conn4: Model<Instance>,
        @InjectModel(Instance.name, InstanceRepository.conn[5] ? InstanceRepository.conn[5] : 'staging') conn5: Model<Instance>,
        @InjectModel(Instance.name, InstanceRepository.conn[6] ? InstanceRepository.conn[6] : 'staging') conn6: Model<Instance>,
        @InjectModel(Instance.name, InstanceRepository.conn[7] ? InstanceRepository.conn[7] : 'staging') conn7: Model<Instance>,
        @InjectModel(Instance.name, InstanceRepository.conn[8] ? InstanceRepository.conn[8] : 'staging') conn8: Model<Instance>,
        @InjectModel(Instance.name, InstanceRepository.conn[9] ? InstanceRepository.conn[9] : 'staging') conn9: Model<Instance>,
    ) {
        super({
            [InstanceRepository.conn.at(0)]: conn0,
            [InstanceRepository.conn.at(1)]: conn1,
            [InstanceRepository.conn.at(2)]: conn2,
            [InstanceRepository.conn.at(3)]: conn3,
            [InstanceRepository.conn.at(4)]: conn4,
            [InstanceRepository.conn.at(5)]: conn5,
            [InstanceRepository.conn.at(6)]: conn6,
            [InstanceRepository.conn.at(7)]: conn7,
            [InstanceRepository.conn.at(8)]: conn8,
            [InstanceRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}