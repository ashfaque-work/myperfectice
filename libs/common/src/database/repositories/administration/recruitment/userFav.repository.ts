import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { AbstractRepository } from '../../../abstract.repository';
import { UserFav } from '../../../models';

@Injectable()
export class UserFavRepository extends AbstractRepository<UserFav> {
    protected readonly logger = new Logger(UserFavRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(UserFav.name, UserFavRepository.conn[0] ? UserFavRepository.conn[0] : 'staging') conn0: Model<UserFav>,
        @InjectModel(UserFav.name, UserFavRepository.conn[1] ? UserFavRepository.conn[1] : 'staging') conn1: Model<UserFav>,
        @InjectModel(UserFav.name, UserFavRepository.conn[2] ? UserFavRepository.conn[2] : 'staging') conn2: Model<UserFav>,
        @InjectModel(UserFav.name, UserFavRepository.conn[3] ? UserFavRepository.conn[3] : 'staging') conn3: Model<UserFav>,
        @InjectModel(UserFav.name, UserFavRepository.conn[4] ? UserFavRepository.conn[4] : 'staging') conn4: Model<UserFav>,
        @InjectModel(UserFav.name, UserFavRepository.conn[5] ? UserFavRepository.conn[5] : 'staging') conn5: Model<UserFav>,
        @InjectModel(UserFav.name, UserFavRepository.conn[6] ? UserFavRepository.conn[6] : 'staging') conn6: Model<UserFav>,
        @InjectModel(UserFav.name, UserFavRepository.conn[7] ? UserFavRepository.conn[7] : 'staging') conn7: Model<UserFav>,
        @InjectModel(UserFav.name, UserFavRepository.conn[8] ? UserFavRepository.conn[8] : 'staging') conn8: Model<UserFav>,
        @InjectModel(UserFav.name, UserFavRepository.conn[9] ? UserFavRepository.conn[9] : 'staging') conn9: Model<UserFav>,
    ) {
        super({
            [UserFavRepository.conn.at(0)]: conn0,
            [UserFavRepository.conn.at(1)]: conn1,
            [UserFavRepository.conn.at(2)]: conn2,
            [UserFavRepository.conn.at(3)]: conn3,
            [UserFavRepository.conn.at(4)]: conn4,
            [UserFavRepository.conn.at(5)]: conn5,
            [UserFavRepository.conn.at(6)]: conn6,
            [UserFavRepository.conn.at(7)]: conn7,
            [UserFavRepository.conn.at(8)]: conn8,
            [UserFavRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}