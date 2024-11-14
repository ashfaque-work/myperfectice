import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PsychoResult } from "../models";

@Injectable()
export class PsychoResultRepository extends AbstractRepository<PsychoResult> {
    protected readonly logger = new Logger(PsychoResultRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(PsychoResult.name, PsychoResultRepository.conn[0] ? PsychoResultRepository.conn[0] : 'staging') conn0: Model<PsychoResult>,
        @InjectModel(PsychoResult.name, PsychoResultRepository.conn[1] ? PsychoResultRepository.conn[1] : 'staging') conn1: Model<PsychoResult>,
        @InjectModel(PsychoResult.name, PsychoResultRepository.conn[2] ? PsychoResultRepository.conn[2] : 'staging') conn2: Model<PsychoResult>,
        @InjectModel(PsychoResult.name, PsychoResultRepository.conn[3] ? PsychoResultRepository.conn[3] : 'staging') conn3: Model<PsychoResult>,
        @InjectModel(PsychoResult.name, PsychoResultRepository.conn[4] ? PsychoResultRepository.conn[4] : 'staging') conn4: Model<PsychoResult>,
        @InjectModel(PsychoResult.name, PsychoResultRepository.conn[5] ? PsychoResultRepository.conn[5] : 'staging') conn5: Model<PsychoResult>,
        @InjectModel(PsychoResult.name, PsychoResultRepository.conn[6] ? PsychoResultRepository.conn[6] : 'staging') conn6: Model<PsychoResult>,
        @InjectModel(PsychoResult.name, PsychoResultRepository.conn[7] ? PsychoResultRepository.conn[7] : 'staging') conn7: Model<PsychoResult>,
        @InjectModel(PsychoResult.name, PsychoResultRepository.conn[8] ? PsychoResultRepository.conn[8] : 'staging') conn8: Model<PsychoResult>,
        @InjectModel(PsychoResult.name, PsychoResultRepository.conn[9] ? PsychoResultRepository.conn[9] : 'staging') conn9: Model<PsychoResult>,
    ) {
        super({
            [PsychoResultRepository.conn.at(0)]: conn0,
            [PsychoResultRepository.conn.at(1)]: conn1,
            [PsychoResultRepository.conn.at(2)]: conn2,
            [PsychoResultRepository.conn.at(3)]: conn3,
            [PsychoResultRepository.conn.at(4)]: conn4,
            [PsychoResultRepository.conn.at(5)]: conn5,
            [PsychoResultRepository.conn.at(6)]: conn6,
            [PsychoResultRepository.conn.at(7)]: conn7,
            [PsychoResultRepository.conn.at(8)]: conn8,
            [PsychoResultRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}