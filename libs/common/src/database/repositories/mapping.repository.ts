import { Injectable, Logger } from "@nestjs/common"
import { AbstractRepository } from "../abstract.repository"
import { Mapping } from "../models"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { instanceKeys } from '@app/common/config';

@Injectable()
export class MappingRepository extends AbstractRepository<Mapping> {
    protected readonly logger = new Logger(MappingRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(Mapping.name, MappingRepository.conn[0] ? MappingRepository.conn[0] : 'staging') conn0: Model<Mapping>,
        @InjectModel(Mapping.name, MappingRepository.conn[1] ? MappingRepository.conn[1] : 'staging') conn1: Model<Mapping>,
        @InjectModel(Mapping.name, MappingRepository.conn[2] ? MappingRepository.conn[2] : 'staging') conn2: Model<Mapping>,
        @InjectModel(Mapping.name, MappingRepository.conn[3] ? MappingRepository.conn[3] : 'staging') conn3: Model<Mapping>,
        @InjectModel(Mapping.name, MappingRepository.conn[4] ? MappingRepository.conn[4] : 'staging') conn4: Model<Mapping>,
        @InjectModel(Mapping.name, MappingRepository.conn[5] ? MappingRepository.conn[5] : 'staging') conn5: Model<Mapping>,
        @InjectModel(Mapping.name, MappingRepository.conn[6] ? MappingRepository.conn[6] : 'staging') conn6: Model<Mapping>,
        @InjectModel(Mapping.name, MappingRepository.conn[7] ? MappingRepository.conn[7] : 'staging') conn7: Model<Mapping>,
        @InjectModel(Mapping.name, MappingRepository.conn[8] ? MappingRepository.conn[8] : 'staging') conn8: Model<Mapping>,
        @InjectModel(Mapping.name, MappingRepository.conn[9] ? MappingRepository.conn[9] : 'staging') conn9: Model<Mapping>,
    ) {
        super({
            [MappingRepository.conn.at(0)]: conn0,
            [MappingRepository.conn.at(1)]: conn1,
            [MappingRepository.conn.at(2)]: conn2,
            [MappingRepository.conn.at(3)]: conn3,
            [MappingRepository.conn.at(4)]: conn4,
            [MappingRepository.conn.at(5)]: conn5,
            [MappingRepository.conn.at(6)]: conn6,
            [MappingRepository.conn.at(7)]: conn7,
            [MappingRepository.conn.at(8)]: conn8,
            [MappingRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}

