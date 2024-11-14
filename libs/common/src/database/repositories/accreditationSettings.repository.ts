import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { AccreditationSettings } from '../models';

@Injectable()
export class AccreditationSettingsRepository extends AbstractRepository<AccreditationSettings> {
    protected readonly logger = new Logger(AccreditationSettingsRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(AccreditationSettings.name, AccreditationSettingsRepository.conn[0] ? AccreditationSettingsRepository.conn[0] : 'staging') conn0: Model<AccreditationSettings>,
        @InjectModel(AccreditationSettings.name, AccreditationSettingsRepository.conn[1] ? AccreditationSettingsRepository.conn[1] : 'staging') conn1: Model<AccreditationSettings>,
        @InjectModel(AccreditationSettings.name, AccreditationSettingsRepository.conn[2] ? AccreditationSettingsRepository.conn[2] : 'staging') conn2: Model<AccreditationSettings>,
        @InjectModel(AccreditationSettings.name, AccreditationSettingsRepository.conn[3] ? AccreditationSettingsRepository.conn[3] : 'staging') conn3: Model<AccreditationSettings>,
        @InjectModel(AccreditationSettings.name, AccreditationSettingsRepository.conn[4] ? AccreditationSettingsRepository.conn[4] : 'staging') conn4: Model<AccreditationSettings>,
        @InjectModel(AccreditationSettings.name, AccreditationSettingsRepository.conn[5] ? AccreditationSettingsRepository.conn[5] : 'staging') conn5: Model<AccreditationSettings>,
        @InjectModel(AccreditationSettings.name, AccreditationSettingsRepository.conn[6] ? AccreditationSettingsRepository.conn[6] : 'staging') conn6: Model<AccreditationSettings>,
        @InjectModel(AccreditationSettings.name, AccreditationSettingsRepository.conn[7] ? AccreditationSettingsRepository.conn[7] : 'staging') conn7: Model<AccreditationSettings>,
        @InjectModel(AccreditationSettings.name, AccreditationSettingsRepository.conn[8] ? AccreditationSettingsRepository.conn[8] : 'staging') conn8: Model<AccreditationSettings>,
        @InjectModel(AccreditationSettings.name, AccreditationSettingsRepository.conn[9] ? AccreditationSettingsRepository.conn[9] : 'staging') conn9: Model<AccreditationSettings>,
    ) {
        super({
            [AccreditationSettingsRepository.conn.at(0)]: conn0,
            [AccreditationSettingsRepository.conn.at(1)]: conn1,
            [AccreditationSettingsRepository.conn.at(2)]: conn2,
            [AccreditationSettingsRepository.conn.at(3)]: conn3,
            [AccreditationSettingsRepository.conn.at(4)]: conn4,
            [AccreditationSettingsRepository.conn.at(5)]: conn5,
            [AccreditationSettingsRepository.conn.at(6)]: conn6,
            [AccreditationSettingsRepository.conn.at(7)]: conn7,
            [AccreditationSettingsRepository.conn.at(8)]: conn8,
            [AccreditationSettingsRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}


