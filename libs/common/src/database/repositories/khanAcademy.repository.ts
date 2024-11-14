import { Injectable, Logger } from "@nestjs/common"
import { AbstractRepository } from "../abstract.repository"
import { KhanAcademy } from "../models"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { instanceKeys } from '@app/common/config';

@Injectable()
export class KhanAcademyRepository extends AbstractRepository<KhanAcademy> {
    protected readonly logger = new Logger(KhanAcademyRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(KhanAcademy.name, KhanAcademyRepository.conn[0] ? KhanAcademyRepository.conn[0] : 'staging') conn0: Model<KhanAcademy>,
        @InjectModel(KhanAcademy.name, KhanAcademyRepository.conn[1] ? KhanAcademyRepository.conn[1] : 'staging') conn1: Model<KhanAcademy>,
        @InjectModel(KhanAcademy.name, KhanAcademyRepository.conn[2] ? KhanAcademyRepository.conn[2] : 'staging') conn2: Model<KhanAcademy>,
        @InjectModel(KhanAcademy.name, KhanAcademyRepository.conn[3] ? KhanAcademyRepository.conn[3] : 'staging') conn3: Model<KhanAcademy>,
        @InjectModel(KhanAcademy.name, KhanAcademyRepository.conn[4] ? KhanAcademyRepository.conn[4] : 'staging') conn4: Model<KhanAcademy>,
        @InjectModel(KhanAcademy.name, KhanAcademyRepository.conn[5] ? KhanAcademyRepository.conn[5] : 'staging') conn5: Model<KhanAcademy>,
        @InjectModel(KhanAcademy.name, KhanAcademyRepository.conn[6] ? KhanAcademyRepository.conn[6] : 'staging') conn6: Model<KhanAcademy>,
        @InjectModel(KhanAcademy.name, KhanAcademyRepository.conn[7] ? KhanAcademyRepository.conn[7] : 'staging') conn7: Model<KhanAcademy>,
        @InjectModel(KhanAcademy.name, KhanAcademyRepository.conn[8] ? KhanAcademyRepository.conn[8] : 'staging') conn8: Model<KhanAcademy>,
        @InjectModel(KhanAcademy.name, KhanAcademyRepository.conn[9] ? KhanAcademyRepository.conn[9] : 'staging') conn9: Model<KhanAcademy>,
    ) {
        super({
            [KhanAcademyRepository.conn.at(0)]: conn0,
            [KhanAcademyRepository.conn.at(1)]: conn1,
            [KhanAcademyRepository.conn.at(2)]: conn2,
            [KhanAcademyRepository.conn.at(3)]: conn3,
            [KhanAcademyRepository.conn.at(4)]: conn4,
            [KhanAcademyRepository.conn.at(5)]: conn5,
            [KhanAcademyRepository.conn.at(6)]: conn6,
            [KhanAcademyRepository.conn.at(7)]: conn7,
            [KhanAcademyRepository.conn.at(8)]: conn8,
            [KhanAcademyRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}

