import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SessionManagement } from "../models";

@Injectable()
export class SessionManagementRepository extends AbstractRepository<SessionManagement> {
    protected readonly logger = new Logger(SessionManagementRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(SessionManagement.name, SessionManagementRepository.conn[0] ? SessionManagementRepository.conn[0] : 'staging') conn0: Model<SessionManagement>,
        @InjectModel(SessionManagement.name, SessionManagementRepository.conn[1] ? SessionManagementRepository.conn[1] : 'staging') conn1: Model<SessionManagement>,
        @InjectModel(SessionManagement.name, SessionManagementRepository.conn[2] ? SessionManagementRepository.conn[2] : 'staging') conn2: Model<SessionManagement>,
        @InjectModel(SessionManagement.name, SessionManagementRepository.conn[3] ? SessionManagementRepository.conn[3] : 'staging') conn3: Model<SessionManagement>,
        @InjectModel(SessionManagement.name, SessionManagementRepository.conn[4] ? SessionManagementRepository.conn[4] : 'staging') conn4: Model<SessionManagement>,
        @InjectModel(SessionManagement.name, SessionManagementRepository.conn[5] ? SessionManagementRepository.conn[5] : 'staging') conn5: Model<SessionManagement>,
        @InjectModel(SessionManagement.name, SessionManagementRepository.conn[6] ? SessionManagementRepository.conn[6] : 'staging') conn6: Model<SessionManagement>,
        @InjectModel(SessionManagement.name, SessionManagementRepository.conn[7] ? SessionManagementRepository.conn[7] : 'staging') conn7: Model<SessionManagement>,
        @InjectModel(SessionManagement.name, SessionManagementRepository.conn[8] ? SessionManagementRepository.conn[8] : 'staging') conn8: Model<SessionManagement>,
        @InjectModel(SessionManagement.name, SessionManagementRepository.conn[9] ? SessionManagementRepository.conn[9] : 'staging') conn9: Model<SessionManagement>,
    ) {
        super({
            [SessionManagementRepository.conn.at(0)]: conn0,
            [SessionManagementRepository.conn.at(1)]: conn1,
            [SessionManagementRepository.conn.at(2)]: conn2,
            [SessionManagementRepository.conn.at(3)]: conn3,
            [SessionManagementRepository.conn.at(4)]: conn4,
            [SessionManagementRepository.conn.at(5)]: conn5,
            [SessionManagementRepository.conn.at(6)]: conn6,
            [SessionManagementRepository.conn.at(7)]: conn7,
            [SessionManagementRepository.conn.at(8)]: conn8,
            [SessionManagementRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}