import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { createHash } from 'node:crypto';

@Injectable()
export class SocketClientService implements OnModuleDestroy {
  private socket: Socket | null = null;
  private connecting = false;
  private isDisconnected = true;
  private readonly logger = new Logger(SocketClientService.name);
  private instancekey: string;
  private token: string;

  constructor() {
    this.logger.log('SocketClientService constructor called.');
  }

  async initializeSocketConnection(instancekey: string, token: string): Promise<void> {
    if (this.connecting || (this.socket && this.socket.connected)) {
      this.logger.log('Already connecting or socket is already connected.');
      return;
    }

    this.instancekey = instancekey;
    this.token = token;
    const url = 'http://localhost:3000';
    const ns = '/ns-' + createHash('md5').update(instancekey).digest('hex');

    this.logger.log(`Connecting to ${url}${ns} with token ${token}`);
    this.connecting = true;

    this.socket = io(`${url}${ns}`, {
      transports: ['websocket', 'polling'],
      query: { token: token },
    });

    return new Promise((resolve) => {
      this.socket.on('connect', () => {
        this.logger.log('Connected to Socket.IO server');
        this.connecting = false;
        this.isDisconnected = false;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        this.logger.error('Connection error:', error);
        this.connecting = false;
        this.isDisconnected = true;
        resolve(); // Resolve the promise to continue with the API logic
      });

      this.socket.on('error', (error) => {
        this.logger.error('Error:', error);
        this.connecting = false;
        this.isDisconnected = true;
        resolve(); // Resolve the promise to continue with the API logic
      });

      this.socket.on('disconnect', (reason) => {
        this.logger.warn('Disconnected:', reason);
        this.connecting = false;
        this.isDisconnected = true;
      });

      this.socket.on('reconnect_attempt', () => {
        this.logger.log('Reconnecting...');
        this.socket.io.opts.query = { token: this.token };
      });
    });
  }

  isConnected(): boolean {
    return this.socket && this.socket.connected;
  }

  async ensureConnected(): Promise<void> {
    if (!this.isConnected() && this.instancekey && this.token) {
      await this.initializeSocketConnection(this.instancekey, this.token);
    }
  }

  async sendMessage(data: any): Promise<void> {
    await this.ensureConnected();
    if (this.isConnected()) {
      this.logger.log('Socket is connected, sending message:', data);
      this.socket.emit('message', data, (response) => {
        this.logger.log('Server response:', response);
      });
    } else {
      this.logger.warn('Socket is not connected. Unable to send message.');
    }
  }

  async toUser(instancekey: string, userId: string, eventName: string, data: any): Promise<void> {
    await this.ensureConnected();
    if (this.isConnected()) {
      this.logger.log(`Emitting event ${eventName} to user ${userId}`);
      this.socket.emit('toUser', { instancekey, userId, eventName, data });
    } else {
      this.logger.warn('Socket is not connected. Unable to emit event.');
    }
  }

  async isOnline(instancekey: string, userId: string): Promise<boolean> {
    await this.ensureConnected();
    if (this.isConnected()) {
      this.logger.log(`Checking online status for user: ${userId}`);
      return new Promise((resolve, reject) => {
        this.socket.emit('isOnline', { instancekey, userId }, (response) => {
          this.logger.log(`Online status for user ${userId}: ${response}`);
          resolve(response);
        });
        this.socket.on('error', (error) => {
          this.logger.error(`Error in isOnline: ${error}`);
          reject(false);
        });
      });
    } else {
      this.logger.warn('Socket is not connected. Unable to check online status.');
      return false;
    }
  }

  async getOnlineUsers(instancekey: string, roles: any): Promise<string[]> {
    await this.ensureConnected();
    if (this.isConnected()) {
      this.logger.log(`Getting online users for roles: ${roles}`);
      return new Promise((resolve, reject) => {
        this.socket.emit('getOnlineUsers', { instancekey, roles }, (response: string[]) => {
          this.logger.log(`Online users: ${response}`);
          resolve(response);
        });

        this.socket.on('error', (error) => {
          this.logger.error(`Error in getOnlineUsers: ${error}`);
          reject(error);
        });
      });
    } else {
      this.logger.warn('Socket is not connected. Unable to emit event.');
      return [];
    }
  }

  async joinRoom(instancekey: string, userId: string, roomId: string, save?: boolean, callback?: (response: boolean) => void): Promise<void> {
    await this.ensureConnected();
    if (this.isConnected()) {
      this.logger.log(`Joining room ${roomId} for user: ${userId}`);
      this.socket.emit('joinRoom', { instancekey, userId, roomId, save }, (response: boolean) => {
        this.logger.log(`Join room response for user ${userId}: ${response}`);
        if (callback) {
          callback(response);
        }
      });
      this.socket.on('error', (error) => {
        this.logger.error(`Error in joinRoom: ${error}`);
        if (callback) {
          callback(false);
        }
      });
    } else {
      this.logger.warn('Socket is not connected. Unable to join room.');
      if (callback) {
        callback(false);
      }
    }
  }

  async leaveRoom(instancekey: string, userId: string, roomId: string, save?: boolean, callback?: (response: boolean) => void): Promise<void> {
    await this.ensureConnected();
    if (this.isConnected()) {
      this.logger.log(`Leaving room ${roomId} for user: ${userId}`);
      this.socket.emit('leaveRoom', { instancekey, userId, roomId, save }, (response: boolean) => {
        this.logger.log(`Leave room response for user ${userId}: ${response}`);
        if (callback) {
          callback(response);
        }
      });
      this.socket.on('error', (error) => {
        this.logger.error(`Error in leaveRoom: ${error}`);
        if (callback) {
          callback(false);
        }
      });
    } else {
      this.logger.warn('Socket is not connected. Unable to leave room.');
      if (callback) {
        callback(false);
      }
    }
  }

  async notifyRoom(instancekey: string, roomId: string, eventName: string, data: any): Promise<boolean> {
    await this.ensureConnected();
    if (this.isConnected()) {
      this.logger.log(`Notifying room for room Id: ${roomId}`);
      return new Promise((resolve, reject) => {
        this.socket.emit('notifyRoom', { instancekey, roomId, eventName, data }, (response) => {
          this.logger.log(`Notifying room for room Id ${roomId}: ${response}`);
          resolve(response);
        });
        this.socket.on('error', (error) => {
          this.logger.error(`Error in notifyRoom: ${error}`);
          reject(false);
        });
      });
    } else {
      this.logger.warn('Socket is not connected. Unable to notify room.');
      return false;
    }
  }

  async notifyMod(instancekey: string, eventName: string, data: any): Promise<boolean> {
    await this.ensureConnected();
    if (this.isConnected()) {
      this.logger.log(`Notifying mod for event name: ${eventName}`);
      return new Promise((resolve, reject) => {
        this.socket.emit('notifyMod', { instancekey, eventName, data }, (response) => {
          this.logger.log(`Notifying mod for event name ${eventName}: ${response}`);
          resolve(response);
        });
        this.socket.on('error', (error) => {
          this.logger.error(`Error in notify Mod: ${error}`);
          reject(false);
        });
      });
    } else {
      this.logger.warn('Socket is not connected. Unable to notify mod.');
      return false;
    }
  }

  async joinTest(instancekey: string, userId: string, testId: string, callback?: (response: boolean) => void): Promise<void> {
    await this.ensureConnected();
    if (this.isConnected()) {
      this.logger.log(`Joining test ${testId} for user: ${userId}`);
      this.socket.emit('joinTest', { instancekey, userId, testId }, (response: boolean) => {
        this.logger.log(`Join test response for user ${userId}: ${response}`);
        if (callback) {
          callback(response);
        }
      });
      this.socket.on('error', (error) => {
        this.logger.error(`Error in joinTest: ${error}`);
        if (callback) {
          callback(false);
        }
      });
    } else {
      this.logger.warn('Socket is not connected. Unable to join test.');
      if (callback) {
        callback(false);
      }
    }
  }

  async toTestRoom(instancekey: string, testId: string, eventName: string, data: any): Promise<boolean> {
    await this.ensureConnected();
    if (this.isConnected()) {
      this.logger.log(`toTestRoom for event name: ${eventName}`);
      return new Promise((resolve, reject) => {
        this.socket.emit('toTestRoom', { instancekey, testId, eventName, data }, (response) => {
          this.logger.log(`toTestRoom for event name ${eventName}: ${response}`);
          resolve(response);
        });
        this.socket.on('error', (error) => {
          this.logger.error(`Error in toTestRoom: ${error}`);
          reject(false);
        });
      });
    } else {
      this.logger.warn('Socket is not connected. Unable to toTestRoom.');
      return false;
    }
  }

  async disableChat(instancekey: string, user1: string, user2: string): Promise<boolean> {
    await this.ensureConnected();
    if (this.isConnected()) {
      this.logger.log(`Disable chat for users: ${user1} and ${user2}`);
      return new Promise((resolve, reject) => {
        this.socket.emit('disableChat', { instancekey, user1, user2 }, (response) => {
          this.logger.log(`Disable chat for users: ${user1} and ${user2}: ${response}`);
          resolve(response);
        });
        this.socket.on('error', (error) => {
          this.logger.error(`Error in disableChat: ${error}`);
          reject(false);
        });
      });
    } else {
      this.logger.warn('Socket is not connected. Unable to disableChat.');
      return false;
    }
  }

  async enableChat(instancekey: string, user1: string, user2: string): Promise<boolean> {
    await this.ensureConnected();
    if (this.isConnected()) {
      this.logger.log(`Enable chat for users: ${user1} and ${user2}`);
      return new Promise((resolve, reject) => {
        this.socket.emit('enableChat', { instancekey, user1, user2 }, (response) => {
          this.logger.log(`Enable chat for users: ${user1} and ${user2}: ${response}`);
          resolve(response);
        });
        this.socket.on('error', (error) => {
          this.logger.error(`Error in enableChat: ${error}`);
          reject(false);
        });
      });
    } else {
      this.logger.warn('Socket is not connected. Unable to enableChat.');
      return false;
    }
  }

  disconnectSocket() {
    if (this.socket) {
      this.logger.log('Disconnecting socket');
      this.socket.disconnect();
      this.isDisconnected = true;
    }
  }

  onModuleDestroy() {
    this.disconnectSocket();
  }
}