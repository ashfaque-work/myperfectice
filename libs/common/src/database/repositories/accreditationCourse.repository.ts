import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { AccreditationCourses } from '../models';

@Injectable()
export class AccreditationCoursesRepository extends AbstractRepository<AccreditationCourses> {
    protected readonly logger = new Logger(AccreditationCoursesRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(AccreditationCourses.name, AccreditationCoursesRepository.conn[0] ? AccreditationCoursesRepository.conn[0] : 'staging') conn0: Model<AccreditationCourses>,
        @InjectModel(AccreditationCourses.name, AccreditationCoursesRepository.conn[1] ? AccreditationCoursesRepository.conn[1] : 'staging') conn1: Model<AccreditationCourses>,
        @InjectModel(AccreditationCourses.name, AccreditationCoursesRepository.conn[2] ? AccreditationCoursesRepository.conn[2] : 'staging') conn2: Model<AccreditationCourses>,
        @InjectModel(AccreditationCourses.name, AccreditationCoursesRepository.conn[3] ? AccreditationCoursesRepository.conn[3] : 'staging') conn3: Model<AccreditationCourses>,
        @InjectModel(AccreditationCourses.name, AccreditationCoursesRepository.conn[4] ? AccreditationCoursesRepository.conn[4] : 'staging') conn4: Model<AccreditationCourses>,
        @InjectModel(AccreditationCourses.name, AccreditationCoursesRepository.conn[5] ? AccreditationCoursesRepository.conn[5] : 'staging') conn5: Model<AccreditationCourses>,
        @InjectModel(AccreditationCourses.name, AccreditationCoursesRepository.conn[6] ? AccreditationCoursesRepository.conn[6] : 'staging') conn6: Model<AccreditationCourses>,
        @InjectModel(AccreditationCourses.name, AccreditationCoursesRepository.conn[7] ? AccreditationCoursesRepository.conn[7] : 'staging') conn7: Model<AccreditationCourses>,
        @InjectModel(AccreditationCourses.name, AccreditationCoursesRepository.conn[8] ? AccreditationCoursesRepository.conn[8] : 'staging') conn8: Model<AccreditationCourses>,
        @InjectModel(AccreditationCourses.name, AccreditationCoursesRepository.conn[9] ? AccreditationCoursesRepository.conn[9] : 'staging') conn9: Model<AccreditationCourses>,
    ) {
        super({
            [AccreditationCoursesRepository.conn.at(0)]: conn0,
            [AccreditationCoursesRepository.conn.at(1)]: conn1,
            [AccreditationCoursesRepository.conn.at(2)]: conn2,
            [AccreditationCoursesRepository.conn.at(3)]: conn3,
            [AccreditationCoursesRepository.conn.at(4)]: conn4,
            [AccreditationCoursesRepository.conn.at(5)]: conn5,
            [AccreditationCoursesRepository.conn.at(6)]: conn6,
            [AccreditationCoursesRepository.conn.at(7)]: conn7,
            [AccreditationCoursesRepository.conn.at(8)]: conn8,
            [AccreditationCoursesRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}


