import {Injectable,Logger} from "@nestjs/common"
import {AbstractRepository} from "../abstract.repository"
import { Feedback, UserEnrollment } from "../models"
import {InjectModel} from "@nestjs/mongoose"
import { Model } from "mongoose"


import { instanceKeys } from '@app/common/config';

@Injectable()
export class UserEnrollmentRepository extends AbstractRepository<UserEnrollment> {
    protected readonly logger = new Logger(UserEnrollmentRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(UserEnrollment.name, UserEnrollmentRepository.conn[0] ? UserEnrollmentRepository.conn[0] : 'staging') conn0: Model<UserEnrollment>,
        @InjectModel(UserEnrollment.name, UserEnrollmentRepository.conn[1] ? UserEnrollmentRepository.conn[1] : 'staging') conn1: Model<UserEnrollment>,
        @InjectModel(UserEnrollment.name, UserEnrollmentRepository.conn[2] ? UserEnrollmentRepository.conn[2] : 'staging') conn2: Model<UserEnrollment>,
        @InjectModel(UserEnrollment.name, UserEnrollmentRepository.conn[3] ? UserEnrollmentRepository.conn[3] : 'staging') conn3: Model<UserEnrollment>,
        @InjectModel(UserEnrollment.name, UserEnrollmentRepository.conn[4] ? UserEnrollmentRepository.conn[4] : 'staging') conn4: Model<UserEnrollment>,
        @InjectModel(UserEnrollment.name, UserEnrollmentRepository.conn[5] ? UserEnrollmentRepository.conn[5] : 'staging') conn5: Model<UserEnrollment>,
        @InjectModel(UserEnrollment.name, UserEnrollmentRepository.conn[6] ? UserEnrollmentRepository.conn[6] : 'staging') conn6: Model<UserEnrollment>,
        @InjectModel(UserEnrollment.name, UserEnrollmentRepository.conn[7] ? UserEnrollmentRepository.conn[7] : 'staging') conn7: Model<UserEnrollment>,
        @InjectModel(UserEnrollment.name, UserEnrollmentRepository.conn[8] ? UserEnrollmentRepository.conn[8] : 'staging') conn8: Model<UserEnrollment>,
        @InjectModel(UserEnrollment.name, UserEnrollmentRepository.conn[9] ? UserEnrollmentRepository.conn[9] : 'staging') conn9: Model<UserEnrollment>,
    ) {
        super({
            [UserEnrollmentRepository.conn.at(0)]: conn0,
            [UserEnrollmentRepository.conn.at(1)]: conn1,
            [UserEnrollmentRepository.conn.at(2)]: conn2,
            [UserEnrollmentRepository.conn.at(3)]: conn3,
            [UserEnrollmentRepository.conn.at(4)]: conn4,
            [UserEnrollmentRepository.conn.at(5)]: conn5,
            [UserEnrollmentRepository.conn.at(6)]: conn6,
            [UserEnrollmentRepository.conn.at(7)]: conn7,
            [UserEnrollmentRepository.conn.at(8)]: conn8,
            [UserEnrollmentRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}
