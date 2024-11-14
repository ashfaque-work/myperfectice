import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { Attendance } from '../models';

@Injectable()
export class AttendanceRepository extends AbstractRepository<Attendance> {
    protected readonly logger = new Logger(AttendanceRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(Attendance.name, AttendanceRepository.conn[0] ? AttendanceRepository.conn[0] : 'staging') conn0: Model<Attendance>,
        @InjectModel(Attendance.name, AttendanceRepository.conn[1] ? AttendanceRepository.conn[1] : 'staging') conn1: Model<Attendance>,
        @InjectModel(Attendance.name, AttendanceRepository.conn[2] ? AttendanceRepository.conn[2] : 'staging') conn2: Model<Attendance>,
        @InjectModel(Attendance.name, AttendanceRepository.conn[3] ? AttendanceRepository.conn[3] : 'staging') conn3: Model<Attendance>,
        @InjectModel(Attendance.name, AttendanceRepository.conn[4] ? AttendanceRepository.conn[4] : 'staging') conn4: Model<Attendance>,
        @InjectModel(Attendance.name, AttendanceRepository.conn[5] ? AttendanceRepository.conn[5] : 'staging') conn5: Model<Attendance>,
        @InjectModel(Attendance.name, AttendanceRepository.conn[6] ? AttendanceRepository.conn[6] : 'staging') conn6: Model<Attendance>,
        @InjectModel(Attendance.name, AttendanceRepository.conn[7] ? AttendanceRepository.conn[7] : 'staging') conn7: Model<Attendance>,
        @InjectModel(Attendance.name, AttendanceRepository.conn[8] ? AttendanceRepository.conn[8] : 'staging') conn8: Model<Attendance>,
        @InjectModel(Attendance.name, AttendanceRepository.conn[9] ? AttendanceRepository.conn[9] : 'staging') conn9: Model<Attendance>,
    ) {
        super({
            [AttendanceRepository.conn.at(0)]: conn0,
            [AttendanceRepository.conn.at(1)]: conn1,
            [AttendanceRepository.conn.at(2)]: conn2,
            [AttendanceRepository.conn.at(3)]: conn3,
            [AttendanceRepository.conn.at(4)]: conn4,
            [AttendanceRepository.conn.at(5)]: conn5,
            [AttendanceRepository.conn.at(6)]: conn6,
            [AttendanceRepository.conn.at(7)]: conn7,
            [AttendanceRepository.conn.at(8)]: conn8,
            [AttendanceRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}


