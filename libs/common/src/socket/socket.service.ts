import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisCaching } from '../services';
import { WebSocketServer } from '@nestjs/websockets';
import { config } from '../config';
import { createHash } from 'node:crypto';
import { ChatRoomRepository, ChatUserRepository, ClassroomRepository, UserLogRepository, UsersRepository } from '../database';
import { Types } from 'mongoose';

interface DecodedToken {
    userId: string;
    roles: string[];
    ik: string;
    [key: string]: any;
}
interface CustomSocket extends Socket {
    id: string;
    decoded_token: DecodedToken;
    encoded_token: string;
    address: string;
    connectedAt: Date;
}

const namespaceMapping = {};
const allNamespaces = [];

config.dbs.forEach(c => {
    const ns = '/ns-' + createHash('md5').update(c.instancekey).digest('hex');
    allNamespaces.push(ns);
    namespaceMapping[c.instancekey] = ns;
});

@Injectable()
export class SocketService {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(SocketService.name);

    constructor(
        private readonly redisCaching: RedisCaching,
        private readonly userLogRepository: UserLogRepository,
        private readonly chatUserRepository: ChatUserRepository,
        private readonly chatRoomRepository: ChatRoomRepository,
        private readonly usersRepository: UsersRepository,
        private readonly classroomRepository: ClassroomRepository,
    ) { }

    // async onConnect(socket: CustomSocket) {
    //     // User room
    //     this.logger.debug('socket connect %s', socket.decoded_token.userId);
    //     const ik = socket.decoded_token.ik;
    //     const userId = socket.decoded_token.userId;
    //     const roles = socket.decoded_token.roles;

    //     this.userLogRepository.setInstanceKey(ik);
    //     await this.userLogRepository.updateOne(
    //         { user: new Types.ObjectId(userId), token: socket.encoded_token },
    //         { $set: { startTime: Date.now(), online: true } }
    //     );

    //     if (roles && roles.some(role => role !== 'student')) {
    //         // Let teacher/admin...etc.. join in moderator room
    //         socket.join('mod');
    //     }

    //     socket.nsp.emit('user.join', { user: userId });

    //     // And join the room of his own so that we can handle the case one user login in many devices
    //     socket.join(userId);

    //     socket.on('user.isOnline', async (user, cb) => {
    //         const isOnline = await this.isUserOnline(ik, user);
    //         cb(isOnline);
    //     });
    //     console.log('joinGame>>>');
        
    //     this.gameHandler(socket);
    //     console.log('joinGame>>> exec');
    //     this.chatHandler(socket);
    //     this.proctorHandler(socket);
    // }

    // async onDisconnect(socket: CustomSocket) {
    //     this.logger.debug('socket disconnect %s', socket.decoded_token.userId);
    //     const ik = socket.decoded_token.ik;
    //     const userId = socket.decoded_token.userId;

    //     this.userLogRepository.setInstanceKey(ik);
    //     const log: any = await this.userLogRepository.findOne({ user: new Types.ObjectId(userId), token: socket.encoded_token });
    //     if (log && log.startTime) {
    //         const timeActive = Date.now() - log.startTime.getTime();
    //         const result = await this.userLogRepository.updateOne(
    //             { user: new Types.ObjectId(userId), token: socket.encoded_token },
    //             { $set: { timeActive, online: false } }
    //         );
    //     }

    //     const fieldToUpdate = {};
    //     fieldToUpdate[`sockets.${socket.id}`] = false;
    //     this.chatUserRepository.setInstanceKey(ik);
    //     await this.chatUserRepository.updateOne({ user: new Types.ObjectId(userId) }, { $unset: fieldToUpdate });

    //     socket.nsp.emit('user.left', { user: userId });
    // }

    // async isUserOnline(instancekey: string, userId: string): Promise<boolean> {
    //     if (!userId) {
    //         return false;
    //     }
    //     try {
    //         const user = userId.toString();
    //         // Find if any socket in this user room
    //         // const sockets = await this.server.of(namespaceMapping[instancekey]).in(user).fetchSockets();
    //         // return sockets.length > 0;
    //         const sockets = await this.server.of(namespaceMapping[instancekey]).fetchSockets();
    //         const userSockets = sockets.filter(socket => socket.data.decoded_token.userId === user);
    //         return userSockets.length > 0;
    //     } catch (ex) {
    //         return false;
    //     }
    // }

    // gameHandler(socket: CustomSocket) {
    //     console.log('joinGame internal>>>');
        
    //     socket.on('joinGame', (data, cb) => {
    //         console.log('joinGame joinGame internal>>>', data);
    //         socket.join(data);
    //         if (cb) {
    //             cb(true);
    //         }
    //     });
    // }

    // async getSockInfo(instancekey: string, userId: string) {
    //     let socInfo = {
    //         user: new Types.ObjectId(userId),
    //         rooms: new Map<string, any>(),
    //         read: new Map<string, any>(),
    //         sockets: new Map<string, any>()
    //     };
    //     try {
    //         this.chatUserRepository.setInstanceKey(instancekey);
    //         let chatUser = await this.chatUserRepository.findOne({ user: new Types.ObjectId(userId) });
    //         if (chatUser) {
    //             socInfo = chatUser;
    //         } else {
    //             chatUser = await this.chatUserRepository.create(socInfo);
    //             console.log('chatUser created', chatUser);
    //         }
    //     } catch (error) {
    //         this.logger.error('%o', error);
    //     }
    //     return socInfo;
    // }

    // async updateUserChatroom(instancekey: string, userId: string, room: string) {
    //     let toUpdate = {};
    //     toUpdate['rooms.' + room] = true;
    //     this.chatUserRepository.setInstanceKey(instancekey);
    //     await this.chatUserRepository.updateOne({ user: new Types.ObjectId(userId) }, { $set: toUpdate });
    // }

    // async chatHandler(socket: CustomSocket) {
    //     const ik = socket.decoded_token.ik;
    //     const userId = socket.decoded_token.userId;

    //     const socInfo = await this.getSockInfo(ik, userId);
    //     socInfo.sockets[socket.id] = true;
    //     await this.updateUserSocket(ik, userId, socket.id);

    //     for (const room in socInfo.rooms) {
    //         socket.join(room);
    //     }

    //     socket.on('chat.invite', async (friend) => {
    //         const room = await this.findUserRoom(socket, friend);
    //         if (!socket.rooms[room]) {
    //             socket.join(room);
    //         }

    //         const friendSocket = await this.getSockInfo(ik, friend);
    //         for (const s in friendSocket.sockets) {
    //             const socketInstance = this.server.of(namespaceMapping[ik]).sockets.get(s);
    //             if (socketInstance) {
    //                 socketInstance.join(room);
    //             }
    //         }

    //         socInfo.rooms[room] = true;
    //         friendSocket.rooms[room] = true;
    //         await this.updateUserChatroom(ik, friend, room);
    //         await this.updateUserChatroom(ik, userId, room);
    //     });

    //     socket.on('new.message', async (data) => {
    //         if (data.user) {
    //             const isBlocked = await this.checkBlocked(ik, data.user, userId);
    //             if (isBlocked) {
    //                 return;
    //             }
    //         }
    //         let room = data.id;
    //         if (!room) {
    //             if (data.toClass) {
    //                 room = `class_${data.class}`;
    //             } else if (data.user) {
    //                 room = await this.findUserRoom(socket, data.user);
    //             } else {
    //                 return;
    //             }
    //         }

    //         if (!data.toClass && !socket.rooms[room]) {
    //             socket.join(room);
    //             socInfo.rooms[room] = true;
    //             await this.updateUserChatroom(ik, userId, room);
    //         }

    //         socket.to(room).emit('new.message', { msg: data, room });

    //         const roomData = await this.getRoomMessages(ik, room);
    //         roomData.messages.push(data);
    //         socInfo.read[room] = roomData.messages.length;
    //         await this.updateChatRead(ik, userId, room, roomData.messages.length);
    //         await this.addMessage(ik, room, data);

    //         const msg = data.msg.length > 100 ? data.msg.substring(0, 100) : data.msg;
    //         const notificationMsg = `${data.sender.name}: ${msg}`;

    //         const settings: any = await this.redisCaching.getSettingAsync(ik);
    //         if (settings?.pushNotification?.chat) {
    //             const options = {
    //                 custom: {
    //                     state: {
    //                         name: 'chat',
    //                         params: { uid: data.id },
    //                     },
    //                     style: 'inbox',
    //                     summaryText: '%n% new chat messages',
    //                     room: data.sender._id,
    //                 },
    //             };
    //             if (data.toClass) {
    //                 options.custom.room = `class_${data.class}`;
    //                 // await this.pushToClassroom(ik, data.class, userId, 'New chat message', notificationMsg, options);
    //             } else {
    //                 // await this.pushToUsers(ik, [data.user], 'New chat message', notificationMsg, options);
    //             }
    //         }
    //     });

    //     socket.on('message.read', async (data) => {
    //         let room = '';
    //         if (data.user) {
    //             room = await this.findUserRoom(socket, data.user);
    //         } else if (data.class) {
    //             room = `class_${data.class}`;
    //         } else if (data.id) {
    //             room = data.id;
    //         } else {
    //             return;
    //         }

    //         const roomData = await this.getRoomMessages(ik, room);
    //         socInfo.read[room] = roomData.messages.length;
    //         await this.updateChatRead(ik, userId, room, roomData.messages.length);
    //         data.room = room;
    //         socket.to(userId).emit('message.read', data);
    //     });

    //     socket.on('chat.get', async (data, cb) => {
    //         if (cb) {
    //             const socInfo = await this.getSockInfo(ik, userId);
    //             let room = '';
    //             if (data.user) {
    //                 const isBlocked = await this.checkBlocked(ik, userId, data.user);
    //                 if (isBlocked) {
    //                     return cb({ error: 'Cannot send message to blocked user.' });
    //                 }
    //                 await this.getSockInfo(ik, data.user);
    //                 room = await this.findUserRoom(socket, data.user);
    //             } else if (data.class) {
    //                 room = `class_${data.class}`;
    //             } else {
    //                 return cb({});
    //             }

    //             const roomData: any = await this.getRoomMessages(ik, room);
    //             if (data.markRead) {
    //                 socInfo.read[room] = roomData.messages.length;
    //                 await this.updateChatRead(ik, userId, room, roomData.messages.length);
    //             }

    //             if (roomData.hidden) {
    //                 this.chatUserRepository.setInstanceKey(ik);
    //                 await this.chatRoomRepository.updateOne({ uid: roomData.uid }, { $set: { hidden: false } });
    //             }

    //             cb({ msg: roomData.messages, read: socInfo.read[room] || 0, uid: room });
    //         }
    //     });

    //     socket.on('message.unread', async (params, cb) => {
    //         if (cb) {
    //             const socInfo = await this.getSockInfo(ik, userId);
    //             let rooms = [];
    //             const chats = await this.getChatList(ik, userId, socInfo, params);

    //             for (const chat of chats) {
    //                 const readCount = socInfo.read[chat.uid];
    //                 if (!readCount || readCount < chat.messages.length) {
    //                     rooms.push({
    //                         unread: readCount ? chat.messages.length - readCount : chat.messages.length,
    //                         room: chat.uid,
    //                         lastMessage: chat.messages[chat.messages.length - 1],
    //                         disabled: chat.disabled,
    //                         hidden: chat.hidden,
    //                     });
    //                 }
    //             }

    //             rooms.sort((a, b) => (a.lastMessage.time > b.lastMessage.time ? -1 : a.lastMessage.time < b.lastMessage.time ? 1 : 0));

    //             let total = rooms.length;
    //             if (params?.limit) {
    //                 const skip = params.skip || 0;
    //                 rooms = rooms.slice(skip, skip + params.limit);
    //             }

    //             if (params.loadUser) {
    //                 const loadedUser = {};
    //                 this.usersRepository.setInstanceKey(ik);
    //                 for (const room of rooms) {
    //                     const sender = room.lastMessage.sender;
    //                     if (room.lastMessage.user && Types.ObjectId.isValid(room.lastMessage.user)) {
    //                         if (!loadedUser[room.lastMessage.user]) {
    //                             loadedUser[room.lastMessage.user] = await this.usersRepository.findOne(
    //                                 { _id: new Types.ObjectId(room.lastMessage.user) },
    //                                 { name: 1, gender: 1, role: 1, userId: 1, 'avatar.fileUrl': 1, provider: 1, google: 1, facebook: 1 }
    //                             );
    //                             if (loadedUser[room.lastMessage.user]?.avatarSM?.fileUrl) {
    //                                 loadedUser[room.lastMessage.user].avatar = loadedUser[room.lastMessage.user].avatarSM;
    //                                 delete loadedUser[room.lastMessage.user].avatarSM;
    //                             }
    //                         }
    //                         room.lastMessage.userInfo = loadedUser[room.lastMessage.user];
    //                     }

    //                     if (!loadedUser[sender._id]) {
    //                         loadedUser[sender._id] = await this.usersRepository.findOne(
    //                             { _id: new Types.ObjectId(sender._id) },
    //                             { userId: 1, gender: 1, 'avatar.fileUrl': 1, provider: 1, google: 1, facebook: 1 }
    //                         );
    //                         if (loadedUser[sender._id]?.avatarSM?.fileUrl) {
    //                             loadedUser[sender._id].avatar = loadedUser[sender._id].avatarSM;
    //                             delete loadedUser[sender._id].avatarSM;
    //                         }
    //                     }
    //                     sender.userInfo = loadedUser[sender._id];
    //                 }
    //             }

    //             cb({ total, rooms });
    //         }
    //     });

    //     socket.on('message.list', async (params, cb) => {
    //         if (cb) {
    //             const socInfo = await this.getSockInfo(ik, userId);
    //             let rooms = [];
    //             const chats = await this.getChatList(ik, userId, socInfo, params);

    //             chats.forEach(chat => {
    //                 const readCount = socInfo.read[chat.uid];
    //                 rooms.push({
    //                     unread: readCount ? chat.messages.length - readCount : chat.messages.length,
    //                     room: chat.uid,
    //                     lastMessage: chat.messages[chat.messages.length - 1],
    //                     disabled: chat.disabled,
    //                     hidden: chat.hidden,
    //                 });
    //             });

    //             rooms.sort((a, b) => (a.lastMessage.time > b.lastMessage.time ? -1 : a.lastMessage.time < b.lastMessage.time ? 1 : 0));

    //             let total = rooms.length;
    //             if (params?.limit) {
    //                 const startIdx = params.skip || 0;
    //                 rooms = rooms.slice(startIdx, startIdx + params.limit);
    //             }

    //             if (params.loadUser) {
    //                 const loadedUser = {};
    //                 this.usersRepository.setInstanceKey(ik);
    //                 for (const room of rooms) {
    //                     const sender = room.lastMessage.sender;
    //                     if (room.lastMessage.user && Types.ObjectId.isValid(room.lastMessage.user)) {
    //                         if (!loadedUser[room.lastMessage.user]) {
    //                             loadedUser[room.lastMessage.user] = await this.usersRepository.findOne(
    //                                 { _id: new Types.ObjectId(room.lastMessage.user) },
    //                                 { userId: 1, name: 1, gender: 1, role: 1, 'avatar.fileUrl': 1, provider: 1, google: 1, facebook: 1 }
    //                             );
    //                             if (loadedUser[room.lastMessage.user]?.avatarSM?.fileUrl) {
    //                                 loadedUser[room.lastMessage.user].avatar = loadedUser[room.lastMessage.user].avatarSM;
    //                                 delete loadedUser[room.lastMessage.user].avatarSM;
    //                             }
    //                         }
    //                         room.lastMessage.userInfo = loadedUser[room.lastMessage.user];
    //                     }

    //                     if (!loadedUser[sender._id]) {
    //                         loadedUser[sender._id] = await this.usersRepository.findOne(
    //                             { _id: new Types.ObjectId(sender._id) },
    //                             { userId: 1, gender: 1, 'avatar.fileUrl': 1, provider: 1, google: 1, facebook: 1 }
    //                         );
    //                         if (loadedUser[sender._id]?.avatarSM?.fileUrl) {
    //                             loadedUser[sender._id].avatar = loadedUser[sender._id].avatarSM;
    //                             delete loadedUser[sender._id].avatarSM;
    //                         }
    //                     }
    //                     sender.userInfo = loadedUser[sender._id];
    //                 }
    //             }

    //             cb(params?.includeCount ? { total, rooms } : rooms);
    //         }
    //     });

    //     socket.on('room.list', async (params, cb) => {
    //         if (cb) {
    //             this.chatUserRepository.setInstanceKey(ik);
    //             this.chatRoomRepository.setInstanceKey(ik);
    //             this.usersRepository.setInstanceKey(ik);
    //             this.classroomRepository.setInstanceKey(ik);
    //             const chatUser = await this.chatUserRepository.findOne({ user: new Types.ObjectId(userId) });
    //             const skip = params.skip || 0;
    //             const limit = params.limit || 15;
    //             const roomQuery: any = { hidden: false, disabled: false };

    //             if (params.uid) {
    //                 await this.chatRoomRepository.updateOne({ uid: params.uid }, { $set: { updatedAt: new Date() } });
    //                 roomQuery.$or = [
    //                     { uid: { $in: Object.keys(chatUser.rooms) }, 'messages.0': { $exists: true } },
    //                     { uid: params.uid },
    //                 ];
    //             } else {
    //                 roomQuery.uid = { $in: Object.keys(chatUser.rooms) };
    //                 roomQuery['messages.0'] = { $exists: true };
    //             }

    //             const rooms = await this.chatRoomRepository.find(
    //                 roomQuery, null, { limit: limit, skip: skip, sort: { updatedAt: -1 } },
    //             );

    //             for (const room of rooms) {
    //                 if (room.messages.length) {
    //                     room.lastMessage = room.messages[room.messages.length - 1];
    //                 }
    //                 if (room.uid.includes('class_')) {
    //                     if (room.lastMessage) {
    //                         room.user = await this.usersRepository.findOne(
    //                             { _id: new Types.ObjectId(room.lastMessage.sender._id) },
    //                             { userId: 1, name: 1, gender: 1, role: 1, 'avatar.fileUrl': 1, provider: 1, google: 1, facebook: 1 }
    //                         );
    //                         room.user.isOnline = await this.isUserOnline(ik, room.user._id);
    //                     }

    //                     const classroom = await this.classroomRepository.findOne(
    //                         { _id: room.uid.replace('class_', '') },
    //                         { name: 1 }
    //                     );
    //                     if (classroom) {
    //                         room.roomName = `Class ${classroom.name}`;
    //                     }
    //                     room.isClass = true;
    //                 } else {
    //                     const user_id = room.uid.replace(userId, '').replace(/_/g, '');
    //                     room.user = await this.usersRepository.findOne(
    //                         { _id: user_id },
    //                         { userId: 1, name: 1, gender: 1, role: 1, 'avatar.fileUrl': 1, provider: 1, google: 1, facebook: 1 }
    //                     );
    //                     room.user.isOnline = await this.isUserOnline(ik, room.user._id);
    //                     room.roomName = room.user.name;
    //                 }

    //                 delete room.messages;
    //             }

    //             if (params.includeCount) {
    //                 const total = await this.chatRoomRepository.countDocuments
    //                 cb({ total, rooms });
    //             } else {
    //                 cb({ rooms });
    //             }
    //         }
    //     });

    //     socket.on('room.get', async (data, cb) => {
    //         if (cb) {
    //             let room = '';
    //             if (data.user) {
    //                 room = await this.findUserRoom(socket, data.user);
    //             } else if (data.class) {
    //                 room = `class_${data.class}`;
    //             } else {
    //                 return cb({});
    //             }
    //             cb({ room });
    //         }
    //     });

    //     socket.on('chat.hide', async (data) => {
    //         if (!data.uid) {
    //             return;
    //         }
    //         this.chatRoomRepository.setInstanceKey(ik);
    //         await this.chatRoomRepository.updateOne({ uid: data.uid }, { $set: { hidden: true } });
    //         socket.to(userId).emit('chat.hide', data.uid);
    //     });

    //     socket.on('location.join', async (data) => {
    //         if (!data.location) {
    //             return;
    //         }
    //         socket.join(`loc_${data.location}`);
    //     });

    //     socket.on('location.leave', async (data) => {
    //         if (!data.location) {
    //             return;
    //         }
    //         socket.leave(`loc_${data.location}`);
    //     });

    //     socket.on('join.pair.coding', async (data) => {
    //         if (!data.snippet) {
    //             return;
    //         }
    //         socket.join(`code_snippet_${data.snippet}`);
    //     });

    //     socket.on('leave.pair.coding', async (data) => {
    //         if (!data.snippet) {
    //             return;
    //         }
    //         socket.leave(`code_snippet_${data.snippet}`);
    //     });

    //     socket.on('changes.pair.coding', async (data) => {
    //         if (!data.snippet) {
    //             return;
    //         }
    //         socket.to(`code_snippet_${data.snippet}`).emit('changes.pair.coding', data);
    //     });

    //     socket.on('cursor.pair.coding', async (data) => {
    //         if (!data.snippet) {
    //             return;
    //         }
    //         socket.to(`code_snippet_${data.snippet}`).emit('cursor.pair.coding', data);
    //     });

    //     socket.on('execute.pair.coding', async (data) => {
    //         if (!data.snippet) {
    //             return;
    //         }
    //         socket.to(`code_snippet_${data.snippet}`).emit('execute.pair.coding', data);
    //     });
    // }

    // async proctorHandler(socket: CustomSocket) {
    //     socket.on('video.call', async (params) => {
    //         if (!params.peer || !params.action) {
    //             return;
    //         }
    //         const peer = params.peer;
    //         delete params.peer;
    //         params.sender = socket.decoded_token.userId;
    //         socket.to(peer).emit('video.call', params);
    //     });

    //     socket.on('proctor.notification', (params) => {
    //         if (!params.teacher || !params.studentId || !params.msg) {
    //             return;
    //         }
    //         socket.to(params.studentId).emit('proctor.notification', { teacher: params.teacher, msg: params.msg });
    //     });
    // }

    // async updateUserSocket(ik: string, userId: string, socketId: string) {
    //     const toUpdate = {};
    //     toUpdate[`sockets.${socketId}`] = true;
    //     this.chatRoomRepository.setInstanceKey(ik);
    //     await this.chatUserRepository.updateOne({ user: new Types.ObjectId(userId) }, { $set: toUpdate });
    // }

    // async findUserRoom(socket: CustomSocket, user2: string): Promise<string> {
    //     const user1 = socket.decoded_token.userId;
    //     const ik = socket.decoded_token.ik;

    //     const possibleRoom = this.getPossibleRoomName(user1, user2);
    //     this.chatRoomRepository.setInstanceKey(ik);
    //     let roomData = await this.chatRoomRepository.findOne({ uid: { $in: possibleRoom } });

    //     if (roomData) {
    //         return roomData.uid;
    //     } else {
    //         const roomUid = `${user1}_${user2}`;

    //         try {
    //             const newRoomData = { uid: roomUid, messages: new Types.DocumentArray([]), createdAt: new Date(), updatedAt: new Date() };
    //             await this.chatRoomRepository.create(newRoomData);

    //             const updateQuery = {};
    //             updateQuery[`rooms.${roomUid}`] = true;
    //             this.chatUserRepository.setInstanceKey(ik);
    //             await this.chatUserRepository.updateOne({ user: new Types.ObjectId(user1) }, { $set: updateQuery });
    //             await this.chatUserRepository.updateOne({ user: new Types.ObjectId(user2) }, { $set: updateQuery });
    //         } catch (ex) {
    //             this.logger.error('findUserRoom %o', ex);
    //         }
    //         return roomUid;
    //     }
    // }

    // async getRoomMessages(ik: string, room: string) {
    //     const roomData = { uid: room, messages: new Types.DocumentArray([]) };
    //     try {
    //         this.chatRoomRepository.setInstanceKey(ik);
    //         const data = await this.chatRoomRepository.findOne({ uid: room });
    //         if (data) {
    //             return data;
    //         } else {
    //             await this.chatRoomRepository.create(roomData);
    //         }
    //     } catch (err) {
    //         this.logger.error('getRoomMessages %o', err);
    //     }
    //     return roomData;
    // }

    // async updateChatRead(ik: string, userId: string, room: string, messageCount: number) {
    //     const toUpdate = {};
    //     toUpdate[`read.${room}`] = messageCount;
    //     this.chatUserRepository.setInstanceKey(ik);
    //     await this.chatUserRepository.updateOne({ user: new Types.ObjectId(userId) }, { $set: toUpdate });
    // }

    // async addMessage(ik: string, room: string, message: any) {
    //     this.chatRoomRepository.setInstanceKey(ik);
    //     await this.chatRoomRepository.updateOne(
    //         { uid: room },
    //         { $set: { hidden: false, updatedAt: new Date() }, $push: { messages: message } }
    //     );
    // }

    // async checkBlocked(ik: string, user1: string, user2: string): Promise<boolean> {
    //     this.usersRepository.setInstanceKey(ik);
    //     let isBlocked = await this.usersRepository.findOne({ _id: new Types.ObjectId(user1), blockedUsers: user2 }, { _id: 1 });
    //     if (!isBlocked) {
    //         isBlocked = await this.usersRepository.findOne({ _id: new Types.ObjectId(user2), blockedUsers: user1 }, { _id: 1 });
    //     }
    //     return !!isBlocked;
    // }

    // async getChatList(ik: string, userId: string, socInfo: any, params: any) {
    //     const users = {};
    //     const classes = {};
    //     for (const r in socInfo.rooms) {
    //         if (r.indexOf('class_') > -1) {
    //             classes[r.replace('class_', '')] = r;
    //         } else {
    //             users[r.replace(`${userId}_`, '').replace(`_${userId}`, '')] = r;
    //         }
    //     }

    //     const userArr = Object.keys(users);
    //     const classArr = Object.keys(classes);
    //     const userRooms = [];

    //     if (userArr.length) {
    //         const query: any = { _id: { $in: userArr } };
    //         if (params.name) {
    //             query.name = { $regex: new RegExp(params.name, 'i') };
    //         }
    //         this.usersRepository.setInstanceKey(ik);
    //         const foundUsers = await this.usersRepository.find(query, { name: 1 });
    //         foundUsers.forEach(f => {
    //             userRooms.push(users[f._id]);
    //         });
    //     }

    //     if (classArr.length) {
    //         const query: any = { _id: { $in: classArr } };
    //         if (params.name) {
    //             query.name = { $regex: new RegExp(params.name, 'i') };
    //         }
    //         this.classroomRepository.setInstanceKey(ik);
    //         const foundClasses = await this.classroomRepository.find(query, { name: 1 });
    //         foundClasses.forEach(f => {
    //             userRooms.push(classes[f._id]);
    //         });
    //     }
    //     this.chatRoomRepository.setInstanceKey(ik);
    //     const chats = await this.chatRoomRepository.find({
    //         uid: { $in: userRooms },
    //         hidden: false,
    //         disabled: false,
    //         'messages.0': { $exists: true },
    //     });

    //     return chats;
    // }

    // // Helper method to get possible room names
    // getPossibleRoomName(user1: string, user2: string, user3?: string): string[] {
    //     const possibleRoom = [`${user1}_${user2}`, `${user2}_${user1}`];
    //     if (user3) {
    //         possibleRoom.push(`${user1}_${user2}_${user3}`, `${user1}_${user3}_${user2}`, `${user2}_${user1}_${user3}`, `${user2}_${user3}_${user1}`, `${user3}_${user1}_${user2}`, `${user3}_${user2}_${user1}`);
    //     }
    //     return possibleRoom;
    // }
}
