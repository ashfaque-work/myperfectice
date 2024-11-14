import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserCourse } from '../models';

import { instanceKeys } from '@app/common/config';

@Injectable()
export class UserCourseRepository extends AbstractRepository<UserCourse> {
    protected readonly logger = new Logger(UserCourseRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(UserCourse.name, UserCourseRepository.conn[0] ? UserCourseRepository.conn[0] : 'staging') conn0: Model<UserCourse>,
        @InjectModel(UserCourse.name, UserCourseRepository.conn[1] ? UserCourseRepository.conn[1] : 'staging') conn1: Model<UserCourse>,
        @InjectModel(UserCourse.name, UserCourseRepository.conn[2] ? UserCourseRepository.conn[2] : 'staging') conn2: Model<UserCourse>,
        @InjectModel(UserCourse.name, UserCourseRepository.conn[3] ? UserCourseRepository.conn[3] : 'staging') conn3: Model<UserCourse>,
        @InjectModel(UserCourse.name, UserCourseRepository.conn[4] ? UserCourseRepository.conn[4] : 'staging') conn4: Model<UserCourse>,
        @InjectModel(UserCourse.name, UserCourseRepository.conn[5] ? UserCourseRepository.conn[5] : 'staging') conn5: Model<UserCourse>,
        @InjectModel(UserCourse.name, UserCourseRepository.conn[6] ? UserCourseRepository.conn[6] : 'staging') conn6: Model<UserCourse>,
        @InjectModel(UserCourse.name, UserCourseRepository.conn[7] ? UserCourseRepository.conn[7] : 'staging') conn7: Model<UserCourse>,
        @InjectModel(UserCourse.name, UserCourseRepository.conn[8] ? UserCourseRepository.conn[8] : 'staging') conn8: Model<UserCourse>,
        @InjectModel(UserCourse.name, UserCourseRepository.conn[9] ? UserCourseRepository.conn[9] : 'staging') conn9: Model<UserCourse>,
    ) {
        super({
            [UserCourseRepository.conn.at(0)]: conn0,
            [UserCourseRepository.conn.at(1)]: conn1,
            [UserCourseRepository.conn.at(2)]: conn2,
            [UserCourseRepository.conn.at(3)]: conn3,
            [UserCourseRepository.conn.at(4)]: conn4,
            [UserCourseRepository.conn.at(5)]: conn5,
            [UserCourseRepository.conn.at(6)]: conn6,
            [UserCourseRepository.conn.at(7)]: conn7,
            [UserCourseRepository.conn.at(8)]: conn8,
            [UserCourseRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}

