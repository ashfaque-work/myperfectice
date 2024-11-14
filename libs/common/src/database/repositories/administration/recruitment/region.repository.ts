import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { AbstractRepository } from '../../../abstract.repository';
import { Region } from '../../../models';

@Injectable()
export class RegionRepository extends AbstractRepository<Region> {
    protected readonly logger = new Logger(RegionRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(Region.name, RegionRepository.conn[0] ? RegionRepository.conn[0] : 'staging') conn0: Model<Region>,
        @InjectModel(Region.name, RegionRepository.conn[1] ? RegionRepository.conn[1] : 'staging') conn1: Model<Region>,
        @InjectModel(Region.name, RegionRepository.conn[2] ? RegionRepository.conn[2] : 'staging') conn2: Model<Region>,
        @InjectModel(Region.name, RegionRepository.conn[3] ? RegionRepository.conn[3] : 'staging') conn3: Model<Region>,
        @InjectModel(Region.name, RegionRepository.conn[4] ? RegionRepository.conn[4] : 'staging') conn4: Model<Region>,
        @InjectModel(Region.name, RegionRepository.conn[5] ? RegionRepository.conn[5] : 'staging') conn5: Model<Region>,
        @InjectModel(Region.name, RegionRepository.conn[6] ? RegionRepository.conn[6] : 'staging') conn6: Model<Region>,
        @InjectModel(Region.name, RegionRepository.conn[7] ? RegionRepository.conn[7] : 'staging') conn7: Model<Region>,
        @InjectModel(Region.name, RegionRepository.conn[8] ? RegionRepository.conn[8] : 'staging') conn8: Model<Region>,
        @InjectModel(Region.name, RegionRepository.conn[9] ? RegionRepository.conn[9] : 'staging') conn9: Model<Region>,
    ) {
        super({
            [RegionRepository.conn.at(0)]: conn0,
            [RegionRepository.conn.at(1)]: conn1,
            [RegionRepository.conn.at(2)]: conn2,
            [RegionRepository.conn.at(3)]: conn3,
            [RegionRepository.conn.at(4)]: conn4,
            [RegionRepository.conn.at(5)]: conn5,
            [RegionRepository.conn.at(6)]: conn6,
            [RegionRepository.conn.at(7)]: conn7,
            [RegionRepository.conn.at(8)]: conn8,
            [RegionRepository.conn.at(9)]: conn9,
        })        
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}