import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { RedisModule } from '../modules';
import { SocketService } from './socket.service';
import { ChatRoom, ChatRoomRepository, ChatRoomSchema, ChatUser, ChatUserRepository, ChatUserSchema, Classroom, ClassroomRepository, ClassroomSchema, DatabaseModule, User, UserLog, UserLogRepository, UserLogSchema, UserSchema, UsersRepository } from '../database';
import { instanceKeys } from '../config';

const userLogEntity = { name: UserLog.name, schema: UserLogSchema };
const chatUserEntity = { name: ChatUser.name, schema: ChatUserSchema };
const chatRoomEntity = { name: ChatRoom.name, schema: ChatRoomSchema };
const userEntity = { name: User.name, schema: UserSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };


@Module({
    imports: [
        DatabaseModule,
        ...createDatabaseModules([
            userLogEntity, chatUserEntity, chatRoomEntity, userEntity, classroomEntity
        ], instanceKeys),
        RedisModule],
    providers: [SocketGateway, SocketService, UserLogRepository, ChatUserRepository,
        ChatRoomRepository, UsersRepository, ClassroomRepository
    ],
    exports: [SocketGateway],
})
export class SocketModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
    return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}