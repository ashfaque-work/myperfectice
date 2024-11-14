import { Injectable, Logger } from "@nestjs/common"
import { AbstractRepository } from "../abstract.repository"
import { HostRate } from "../models"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { instanceKeys } from '@app/common/config';

@Injectable()
export class HostRateRepository extends AbstractRepository<HostRate> {
    protected readonly logger = new Logger(HostRateRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(HostRate.name, HostRateRepository.conn[0] ? HostRateRepository.conn[0] : 'staging') conn0: Model<HostRate>,
        @InjectModel(HostRate.name, HostRateRepository.conn[1] ? HostRateRepository.conn[1] : 'staging') conn1: Model<HostRate>,
        @InjectModel(HostRate.name, HostRateRepository.conn[2] ? HostRateRepository.conn[2] : 'staging') conn2: Model<HostRate>,
        @InjectModel(HostRate.name, HostRateRepository.conn[3] ? HostRateRepository.conn[3] : 'staging') conn3: Model<HostRate>,
        @InjectModel(HostRate.name, HostRateRepository.conn[4] ? HostRateRepository.conn[4] : 'staging') conn4: Model<HostRate>,
        @InjectModel(HostRate.name, HostRateRepository.conn[5] ? HostRateRepository.conn[5] : 'staging') conn5: Model<HostRate>,
        @InjectModel(HostRate.name, HostRateRepository.conn[6] ? HostRateRepository.conn[6] : 'staging') conn6: Model<HostRate>,
        @InjectModel(HostRate.name, HostRateRepository.conn[7] ? HostRateRepository.conn[7] : 'staging') conn7: Model<HostRate>,
        @InjectModel(HostRate.name, HostRateRepository.conn[8] ? HostRateRepository.conn[8] : 'staging') conn8: Model<HostRate>,
        @InjectModel(HostRate.name, HostRateRepository.conn[9] ? HostRateRepository.conn[9] : 'staging') conn9: Model<HostRate>,
    ) {
        super({
            [HostRateRepository.conn.at(0)]: conn0,
            [HostRateRepository.conn.at(1)]: conn1,
            [HostRateRepository.conn.at(2)]: conn2,
            [HostRateRepository.conn.at(3)]: conn3,
            [HostRateRepository.conn.at(4)]: conn4,
            [HostRateRepository.conn.at(5)]: conn5,
            [HostRateRepository.conn.at(6)]: conn6,
            [HostRateRepository.conn.at(7)]: conn7,
            [HostRateRepository.conn.at(8)]: conn8,
            [HostRateRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}

