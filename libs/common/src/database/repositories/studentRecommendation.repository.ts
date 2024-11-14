import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StudentRecommendation } from "../models";

@Injectable()
export class StudentRecommendationRepository extends AbstractRepository<StudentRecommendation> {
    protected readonly logger = new Logger(StudentRecommendationRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(StudentRecommendation.name, StudentRecommendationRepository.conn[0] ? StudentRecommendationRepository.conn[0] : 'staging') conn0: Model<StudentRecommendation>,
        @InjectModel(StudentRecommendation.name, StudentRecommendationRepository.conn[1] ? StudentRecommendationRepository.conn[1] : 'staging') conn1: Model<StudentRecommendation>,
        @InjectModel(StudentRecommendation.name, StudentRecommendationRepository.conn[2] ? StudentRecommendationRepository.conn[2] : 'staging') conn2: Model<StudentRecommendation>,
        @InjectModel(StudentRecommendation.name, StudentRecommendationRepository.conn[3] ? StudentRecommendationRepository.conn[3] : 'staging') conn3: Model<StudentRecommendation>,
        @InjectModel(StudentRecommendation.name, StudentRecommendationRepository.conn[4] ? StudentRecommendationRepository.conn[4] : 'staging') conn4: Model<StudentRecommendation>,
        @InjectModel(StudentRecommendation.name, StudentRecommendationRepository.conn[5] ? StudentRecommendationRepository.conn[5] : 'staging') conn5: Model<StudentRecommendation>,
        @InjectModel(StudentRecommendation.name, StudentRecommendationRepository.conn[6] ? StudentRecommendationRepository.conn[6] : 'staging') conn6: Model<StudentRecommendation>,
        @InjectModel(StudentRecommendation.name, StudentRecommendationRepository.conn[7] ? StudentRecommendationRepository.conn[7] : 'staging') conn7: Model<StudentRecommendation>,
        @InjectModel(StudentRecommendation.name, StudentRecommendationRepository.conn[8] ? StudentRecommendationRepository.conn[8] : 'staging') conn8: Model<StudentRecommendation>,
        @InjectModel(StudentRecommendation.name, StudentRecommendationRepository.conn[9] ? StudentRecommendationRepository.conn[9] : 'staging') conn9: Model<StudentRecommendation>,
    ) {
        super({
            [StudentRecommendationRepository.conn.at(0)]: conn0,
            [StudentRecommendationRepository.conn.at(1)]: conn1,
            [StudentRecommendationRepository.conn.at(2)]: conn2,
            [StudentRecommendationRepository.conn.at(3)]: conn3,
            [StudentRecommendationRepository.conn.at(4)]: conn4,
            [StudentRecommendationRepository.conn.at(5)]: conn5,
            [StudentRecommendationRepository.conn.at(6)]: conn6,
            [StudentRecommendationRepository.conn.at(7)]: conn7,
            [StudentRecommendationRepository.conn.at(8)]: conn8,
            [StudentRecommendationRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}