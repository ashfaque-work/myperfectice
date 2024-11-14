import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { RedisCaching } from '../../services';
import { createHash } from 'node:crypto';
import { config } from '@app/common/config';
import { WhiteboardLogRepository } from '@app/common/database';
import { Types } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { parseString } from 'xml2js';
import { SocketClientService } from '@app/common/socket';

@Injectable()
export class WhiteboardService {
  constructor(
    private readonly redisCaching: RedisCaching,
    private readonly whiteboardLogRepository: WhiteboardLogRepository,
    private readonly httpService: HttpService,
    private readonly socketClientService: SocketClientService
  ) { }

  async getMeetings(instancekey: string): Promise<any> {
    const meetings = await this.redisCaching.globalGetAsync(`${instancekey}_meetings`);
    return meetings ? meetings : [];
  }

  async getMeeting(instancekey: string, classId: string): Promise<any> {
    const meetings = await this.redisCaching.globalGetAsync(`${instancekey}_meetings`);
    return meetings ? meetings[classId.toString()] : null;
  }

  async join(request: any, classId: string, classOwner: string) {
    const settings = await this.redisCaching.getSetting(request);
    if (!settings) {
      throw new InternalServerErrorException ('Whiteboard settings not found in cache');
    }

    const { whiteboard: { api: bbb, secret } } = settings;
    const userId = request.user._id.toString();

    const meeting = await this.getMeeting(request.instancekey, classId);
    if (!meeting) {
      return { error: 'Meeting not started yet!' };
    }

    if (meeting.users && meeting.users.includes(userId)) {
      return { error: 'You have already joined!' };
    }

    let pass = classId.substring(6, 11);

    this.whiteboardLogRepository.setInstanceKey(request.instancekey);
    const sessionStarter = await this.whiteboardLogRepository.findOne({
      user: new Types.ObjectId(request.user._id),
      classroom: new Types.ObjectId(classId),
      status: { $in: ['started', 'running'] },
    });

    if (
      request.user._id.equals(classOwner) || sessionStarter && userId === sessionStarter.user.toString() ||
      request.user.role.includes(config.roles.admin) || request.user.role.includes(config.roles.support)
    ) {
      pass = classId.substring(0, 5);
    }

    const meetingID = `${request.instancekey}_${classId}`;
    const query = `fullName=${encodeURIComponent(request.user.name)}&meetingID=${encodeURIComponent(meetingID)}&userID=${userId}&password=${pass}`;
    const checksum = this.createChecksum('join', query, secret);

    return { url: `${bbb}join?${query}${checksum}` };
  }

  private createChecksum(method: string, query: string, secret: string): string {
    const toEncode = method + query + secret;
    const hash = createHash('sha1').update(toEncode).digest('hex');
    return (query ? '&checksum=' : 'checksum=') + hash;
  }

  async getRecordings(req: any, classId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.redisCaching.getSetting(req, async (settings) => {
        if (!settings.whiteboard) {
          return resolve([]);
        }
        const bbb = settings.whiteboard.api;
        const secret = settings.whiteboard.secret;
        const meetingID = `${req.instancekey}_${classId}`;

        let query = `meetingID=${meetingID}`;
        query += this.createChecksum('getRecordings', query, secret);

        const options = {
          url: `${bbb}getRecordings?${query}`,
          method: 'GET',
        };
        try {
          const response = await firstValueFrom(this.httpService.get(options.url).pipe(
            catchError((error: AxiosError) => {
              Logger.error(error);
              reject({ error: 'Fail to get recordings.' });
              throw error;
            })
          ));

          parseString(response.data, (err, result) => {
            if (err) {
              return reject(err);
            }
            const recordings = [];
            try {
              if (result.response.recordings && result.response.recordings[0] && result.response.recordings[0].recording) {
                result.response.recordings[0].recording.forEach(recording => {
                  const data: any = {
                    published: recording.published[0] === 'true',
                    startTime: Number(recording.startTime[0]),
                    endTime: Number(recording.endTime[0]),
                    participants: recording.participants[0],
                    sessionId: recording.internalMeetingID[0],
                  };

                  for (let i = 0; i < recording.playback.length; i++) {
                    if (recording.playback[i].format[0].type[0] === 'presentation') {
                      data.playback = recording.playback[i].format[0].url[0];
                      data.length = Number(recording.playback[i].format[0].length[0]);
                      break;
                    }
                  }
                  recordings.push(data);
                });
              }
            } catch (ex) {
              Logger.error('%o', ex);
            }

            resolve(recordings);
          });
        } catch (error) {
          reject({ error: 'Fail to get recordings!' });
        }
      });
    });
  }

  async start(req: any, classId: string, className: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.redisCaching.getSetting(req, async (settings) => {
        const bbb = settings.whiteboard.api;
        const secret = settings.whiteboard.secret;
        const modPass = classId.substring(0, 5);
        const viewerPass = classId.substring(6, 11);
        const meetingID = `${req.instancekey}_${classId}`;
        let query = `name=${encodeURIComponent(className)}&meetingID=${encodeURIComponent(meetingID)}&attendeePW=${viewerPass}&moderatorPW=${modPass}&logoutURL=${encodeURIComponent(settings.baseUrl)}&lockSettingsDisableCam=true&record=true`;
        query += this.createChecksum('create', query, secret);

        const options = {
          url: `${bbb}create?${query}`,
          method: 'GET',
        };

        try {
          const response = await firstValueFrom(this.httpService.get(options.url).pipe(
            catchError((error: AxiosError) => {
              Logger.error(error);
              reject({ error: 'Fail to start meeting!' });
              throw error;
            })
          ));

          parseString(response.data, async (err, result) => {
            if (err) {
              Logger.error('Fail to start meeting %j', err);
              return resolve({ error: 'Fail to start meeting' });
            }

            const userId = req.user._id.toString();
            let savedMeetings = await this.redisCaching.globalGetAsync(`${req.headers.instancekey}_meetings`);
            if (!savedMeetings) {
              savedMeetings = {};
            }

            savedMeetings[classId] = {
              initializing: true,
              running: true,
              users: [userId],
              count: 0,
              date: new Date(),
            };

            this.redisCaching.globalSet(`${req.instancekey}_meetings`, savedMeetings);
            
            await this.socketClientService.initializeSocketConnection(req.instancekey, req.token);
            this.socketClientService.notifyRoom(req.instancekey, classId, 'session.status', { class: classId, session: savedMeetings[classId] });
            this.socketClientService.notifyMod(req.instancekey, 'session.status', { class: classId, session: savedMeetings[classId] });

            query = `fullName=${encodeURIComponent(req.user.name)}&meetingID=${encodeURIComponent(meetingID)}&password=${modPass}&userID=${userId}`;
            query += this.createChecksum('join', query, secret);

            const bbbSession = { url: `${bbb}join?${query}` };
            try {
              if (result.response.internalMeetingID && result.response.internalMeetingID[0]) {
                bbbSession['sessionId'] = result.response.internalMeetingID[0];
              }
            } catch (err) {
              Logger.error(err);
            }

            resolve(bbbSession);
          });
        } catch (error) {
          return resolve({ error: 'Fail to start meeting' });
        }
      });
    });
  }

  async startOneOnOne(req: any, studentId: string) {
    try {
      const settings: any = await this.redisCaching.getSetting(req);
      const bbb = settings.whiteboard.api;
      const secret = settings.whiteboard.secret;
      const modPass = req.user._id.toString().substring(0, 5);
      const viewerPass = studentId.substring(6, 11);
  
      const meetingID = `${req.instancekey}_${req.user._id}_${studentId}`;
      let query = `name=${encodeURIComponent(req.user.name)}&meetingID=${encodeURIComponent(meetingID)}&attendeePW=${viewerPass}&moderatorPW=${modPass}&logoutURL=${encodeURIComponent(settings.baseUrl)}&maxParticipants=2&lockSettingsDisableCam=true&record=true`;
      query += this.createChecksum('create', query, secret);
  
      const options = {
        url: bbb + 'create?' + query,
        method: 'GET',
      };
  
      let response;
      try {
        response = await axios(options);
      } catch (error) {
        throw new InternalServerErrorException('Fail to start meeting');
      }
  
      return new Promise((resolve, reject) => {
        parseString(response.data, async (err, result) => {
          if (err) {
            Logger.error('Fail to start meeting %j', err);
            return resolve({ error: 'Fail to start meeting' });
          }
  
          const userId = req.user._id.toString();
          let joinQuery = `fullName=${encodeURIComponent(req.user.name)}&meetingID=${encodeURIComponent(meetingID)}&password=${modPass}&userID=${userId}`;
          joinQuery += this.createChecksum('join', joinQuery, secret);
  
          // notify classroom that meeting has started
          await this.socketClientService.initializeSocketConnection(req.instancekey, req.token);
          this.socketClientService.toUser(req.headers.instancekey, studentId, 'one_one_session', { teacherName: req.user.name, meetingID: meetingID });
  
          const bbbSession: any = { url: bbb + 'join?' + joinQuery };
          try {
            if (result.response.internalMeetingID && result.response.internalMeetingID[0]) {
              bbbSession.sessionId = result.response.internalMeetingID[0];
            }
          } catch (err) {
            Logger.error(err);
          }
  
          resolve(bbbSession);
        });
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async joinOneOnOne(req: any, meetingID: string) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      const settings: any = await self.redisCaching.getSetting(req)
      let bbb = settings.whiteboard.api
      let secret = settings.whiteboard.secret
      let userId = req.user._id.toString()

      let viewerPass = userId.substring(6, 11)

      // Now join teacher to the meeting
      let query = `fullName=${encodeURIComponent(req.user.name)}&meetingID=${encodeURIComponent(meetingID)}&userID=${userId}&password=${viewerPass}`
      query += self.createChecksum('join', query, secret)

      resolve({ url: bbb + 'join?' + query })
    })
  }
}
