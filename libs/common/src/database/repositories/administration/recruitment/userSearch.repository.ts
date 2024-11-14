import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { AbstractRepository } from '../../../abstract.repository';
import { UserSearch } from '../../../models';

@Injectable()
export class UserSearchRepository extends AbstractRepository<UserSearch> {
    protected readonly logger = new Logger(UserSearchRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(UserSearch.name, UserSearchRepository.conn[0] ? UserSearchRepository.conn[0] : 'staging') conn0: Model<UserSearch>,
        @InjectModel(UserSearch.name, UserSearchRepository.conn[1] ? UserSearchRepository.conn[1] : 'staging') conn1: Model<UserSearch>,
        @InjectModel(UserSearch.name, UserSearchRepository.conn[2] ? UserSearchRepository.conn[2] : 'staging') conn2: Model<UserSearch>,
        @InjectModel(UserSearch.name, UserSearchRepository.conn[3] ? UserSearchRepository.conn[3] : 'staging') conn3: Model<UserSearch>,
        @InjectModel(UserSearch.name, UserSearchRepository.conn[4] ? UserSearchRepository.conn[4] : 'staging') conn4: Model<UserSearch>,
        @InjectModel(UserSearch.name, UserSearchRepository.conn[5] ? UserSearchRepository.conn[5] : 'staging') conn5: Model<UserSearch>,
        @InjectModel(UserSearch.name, UserSearchRepository.conn[6] ? UserSearchRepository.conn[6] : 'staging') conn6: Model<UserSearch>,
        @InjectModel(UserSearch.name, UserSearchRepository.conn[7] ? UserSearchRepository.conn[7] : 'staging') conn7: Model<UserSearch>,
        @InjectModel(UserSearch.name, UserSearchRepository.conn[8] ? UserSearchRepository.conn[8] : 'staging') conn8: Model<UserSearch>,
        @InjectModel(UserSearch.name, UserSearchRepository.conn[9] ? UserSearchRepository.conn[9] : 'staging') conn9: Model<UserSearch>,
    ) {
        super({
            [UserSearchRepository.conn.at(0)]: conn0,
            [UserSearchRepository.conn.at(1)]: conn1,
            [UserSearchRepository.conn.at(2)]: conn2,
            [UserSearchRepository.conn.at(3)]: conn3,
            [UserSearchRepository.conn.at(4)]: conn4,
            [UserSearchRepository.conn.at(5)]: conn5,
            [UserSearchRepository.conn.at(6)]: conn6,
            [UserSearchRepository.conn.at(7)]: conn7,
            [UserSearchRepository.conn.at(8)]: conn8,
            [UserSearchRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}