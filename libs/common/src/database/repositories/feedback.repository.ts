import { Injectable, Logger } from "@nestjs/common"
import { AbstractRepository } from "../abstract.repository"
import { Feedback } from "../models"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { instanceKeys } from '@app/common/config';

@Injectable()
export class FeedbackRepository extends AbstractRepository<Feedback> {
    protected readonly logger = new Logger(FeedbackRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(Feedback.name, FeedbackRepository.conn[0] ? FeedbackRepository.conn[0] : 'staging') conn0: Model<Feedback>,
        @InjectModel(Feedback.name, FeedbackRepository.conn[1] ? FeedbackRepository.conn[1] : 'staging') conn1: Model<Feedback>,
        @InjectModel(Feedback.name, FeedbackRepository.conn[2] ? FeedbackRepository.conn[2] : 'staging') conn2: Model<Feedback>,
        @InjectModel(Feedback.name, FeedbackRepository.conn[3] ? FeedbackRepository.conn[3] : 'staging') conn3: Model<Feedback>,
        @InjectModel(Feedback.name, FeedbackRepository.conn[4] ? FeedbackRepository.conn[4] : 'staging') conn4: Model<Feedback>,
        @InjectModel(Feedback.name, FeedbackRepository.conn[5] ? FeedbackRepository.conn[5] : 'staging') conn5: Model<Feedback>,
        @InjectModel(Feedback.name, FeedbackRepository.conn[6] ? FeedbackRepository.conn[6] : 'staging') conn6: Model<Feedback>,
        @InjectModel(Feedback.name, FeedbackRepository.conn[7] ? FeedbackRepository.conn[7] : 'staging') conn7: Model<Feedback>,
        @InjectModel(Feedback.name, FeedbackRepository.conn[8] ? FeedbackRepository.conn[8] : 'staging') conn8: Model<Feedback>,
        @InjectModel(Feedback.name, FeedbackRepository.conn[9] ? FeedbackRepository.conn[9] : 'staging') conn9: Model<Feedback>,
    ) {
        super({
            [FeedbackRepository.conn.at(0)]: conn0,
            [FeedbackRepository.conn.at(1)]: conn1,
            [FeedbackRepository.conn.at(2)]: conn2,
            [FeedbackRepository.conn.at(3)]: conn3,
            [FeedbackRepository.conn.at(4)]: conn4,
            [FeedbackRepository.conn.at(5)]: conn5,
            [FeedbackRepository.conn.at(6)]: conn6,
            [FeedbackRepository.conn.at(7)]: conn7,
            [FeedbackRepository.conn.at(8)]: conn8,
            [FeedbackRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}

