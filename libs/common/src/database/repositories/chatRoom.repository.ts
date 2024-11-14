import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { ChatRoom } from '../models';

@Injectable()
export class ChatRoomRepository extends AbstractRepository<ChatRoom> {
    protected readonly logger = new Logger(ChatRoomRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(ChatRoom.name, ChatRoomRepository.conn[0] ? ChatRoomRepository.conn[0] : 'staging') conn0: Model<ChatRoom>,
        @InjectModel(ChatRoom.name, ChatRoomRepository.conn[1] ? ChatRoomRepository.conn[1] : 'staging') conn1: Model<ChatRoom>,
        @InjectModel(ChatRoom.name, ChatRoomRepository.conn[2] ? ChatRoomRepository.conn[2] : 'staging') conn2: Model<ChatRoom>,
        @InjectModel(ChatRoom.name, ChatRoomRepository.conn[3] ? ChatRoomRepository.conn[3] : 'staging') conn3: Model<ChatRoom>,
        @InjectModel(ChatRoom.name, ChatRoomRepository.conn[4] ? ChatRoomRepository.conn[4] : 'staging') conn4: Model<ChatRoom>,
        @InjectModel(ChatRoom.name, ChatRoomRepository.conn[5] ? ChatRoomRepository.conn[5] : 'staging') conn5: Model<ChatRoom>,
        @InjectModel(ChatRoom.name, ChatRoomRepository.conn[6] ? ChatRoomRepository.conn[6] : 'staging') conn6: Model<ChatRoom>,
        @InjectModel(ChatRoom.name, ChatRoomRepository.conn[7] ? ChatRoomRepository.conn[7] : 'staging') conn7: Model<ChatRoom>,
        @InjectModel(ChatRoom.name, ChatRoomRepository.conn[8] ? ChatRoomRepository.conn[8] : 'staging') conn8: Model<ChatRoom>,
        @InjectModel(ChatRoom.name, ChatRoomRepository.conn[9] ? ChatRoomRepository.conn[9] : 'staging') conn9: Model<ChatRoom>,
    ) {
        super({
            [ChatRoomRepository.conn.at(0)]: conn0,
            [ChatRoomRepository.conn.at(1)]: conn1,
            [ChatRoomRepository.conn.at(2)]: conn2,
            [ChatRoomRepository.conn.at(3)]: conn3,
            [ChatRoomRepository.conn.at(4)]: conn4,
            [ChatRoomRepository.conn.at(5)]: conn5,
            [ChatRoomRepository.conn.at(6)]: conn6,
            [ChatRoomRepository.conn.at(7)]: conn7,
            [ChatRoomRepository.conn.at(8)]: conn8,
            [ChatRoomRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}


