import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { ChatUser } from '../models';

@Injectable()
export class ChatUserRepository extends AbstractRepository<ChatUser> {
    protected readonly logger = new Logger(ChatUserRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(ChatUser.name, ChatUserRepository.conn[0] ? ChatUserRepository.conn[0] : 'staging') conn0: Model<ChatUser>,
        @InjectModel(ChatUser.name, ChatUserRepository.conn[1] ? ChatUserRepository.conn[1] : 'staging') conn1: Model<ChatUser>,
        @InjectModel(ChatUser.name, ChatUserRepository.conn[2] ? ChatUserRepository.conn[2] : 'staging') conn2: Model<ChatUser>,
        @InjectModel(ChatUser.name, ChatUserRepository.conn[3] ? ChatUserRepository.conn[3] : 'staging') conn3: Model<ChatUser>,
        @InjectModel(ChatUser.name, ChatUserRepository.conn[4] ? ChatUserRepository.conn[4] : 'staging') conn4: Model<ChatUser>,
        @InjectModel(ChatUser.name, ChatUserRepository.conn[5] ? ChatUserRepository.conn[5] : 'staging') conn5: Model<ChatUser>,
        @InjectModel(ChatUser.name, ChatUserRepository.conn[6] ? ChatUserRepository.conn[6] : 'staging') conn6: Model<ChatUser>,
        @InjectModel(ChatUser.name, ChatUserRepository.conn[7] ? ChatUserRepository.conn[7] : 'staging') conn7: Model<ChatUser>,
        @InjectModel(ChatUser.name, ChatUserRepository.conn[8] ? ChatUserRepository.conn[8] : 'staging') conn8: Model<ChatUser>,
        @InjectModel(ChatUser.name, ChatUserRepository.conn[9] ? ChatUserRepository.conn[9] : 'staging') conn9: Model<ChatUser>,
    ) {
        super({
            [ChatUserRepository.conn.at(0)]: conn0,
            [ChatUserRepository.conn.at(1)]: conn1,
            [ChatUserRepository.conn.at(2)]: conn2,
            [ChatUserRepository.conn.at(3)]: conn3,
            [ChatUserRepository.conn.at(4)]: conn4,
            [ChatUserRepository.conn.at(5)]: conn5,
            [ChatUserRepository.conn.at(6)]: conn6,
            [ChatUserRepository.conn.at(7)]: conn7,
            [ChatUserRepository.conn.at(8)]: conn8,
            [ChatUserRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}


