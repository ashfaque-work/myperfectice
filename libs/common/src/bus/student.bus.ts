import { Injectable, Logger } from "@nestjs/common";
import { AttemptRepository, ClassroomRepository } from "../database";
import { Types } from "mongoose";
import { RedisCaching } from "../services";
import { matchArray } from "../Utils";
import { config } from "../config";
import { SocketClientService } from "../socket";

interface AttemptAggregationResult {
  lastAttempted: Date;
  accuracy: number;
  speed: number;
  user: Types.ObjectId;
}

@Injectable()
export class StudentBus {
  constructor(
    private readonly classroomRepository: ClassroomRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly redisCache: RedisCaching,
    private readonly socketClientService: SocketClientService    
  ) { }
  protected readonly logger: Logger;

  async getUserIdList(request: any) {
    try {
      const { query, user, instancekey } = request;
      return await this.redisCache.getSetting(request, async (settings: any) => {
        const filter: any = {};

        const condition: any = {
          $or: [
            { active: { $exists: false } },
            { active: true },
          ],
        };
        let locationCond: any[] = [];

        if (query.classroom) {
          condition._id = new Types.ObjectId(query.classroom);
        } else {
          const userId = new Types.ObjectId(user._id);
          const userLocations = user.locations.map(l => new Types.ObjectId(l));
          const roles = config.roles;
          const userRoles = user.roles;
          if (userRoles.includes(roles.student)) {
            condition["students.studentId"] = userId;
          } else if (settings.isWhiteLabelled) {
            if (userRoles.includes(roles.mentor)) {
              condition.user = userId;
            } else if (userRoles.includes(roles.teacher)) {
              filter.$or = [{ user: userId }, { owners: userId }];
            } else {
              condition.allowDelete = true;
              if (userRoles.includes(roles.centerHead)) {
                locationCond = userLocations;
              }
            }
          } else {
            if (userRoles.includes(roles.teacher) || userRoles.includes(roles.mentor)) {
              condition.user = userId;
            } else if (userRoles.includes(roles.centerHead)) {
              locationCond = userLocations;
            }
          }

        }

        if (query.locations) {
          const queryLocations = query.locations.split(',').map((l) => new Types.ObjectId(l));
          if (locationCond && locationCond.length > 0) {
            locationCond = matchArray(queryLocations, locationCond);
            if (locationCond.length === 0) {
              return [];
            }
          } else {
            locationCond = queryLocations;
          }
        }

        if (locationCond && locationCond.length > 0) {
          condition.location = { $in: locationCond };
        }

        const pipeline: any[] = [
          { $match: condition },
          { $unwind: "$students" },
          {
            $match: {
              'students.studentId': { $exists: true, $ne: null },
              $or: [
                { "name": { $ne: "My Mentees" } },
                { "students.status": true }
              ]
            }
          },
          { $project: { 'students.studentId': 1 } }
        ];

        this.classroomRepository.setInstanceKey(instancekey);
        const classroomStudents = await this.classroomRepository.aggregate(pipeline);
        
        const results = classroomStudents.map((student: any) => new Types.ObjectId(student.students.studentId));       
        return results
      });
    } catch (err) {
      throw new Error(`Error counting students: ${err.message}`);
    }
  }

  async countStudents(request: any): Promise<any> {
    try {
      const { query, user, instancekey } = request;
      return await this.redisCache.getSetting(request, async (settings: any) => {
        const condition: any = { active: true };
        let filter: any = {};
        let locationCond = [];

        if (query.classroom) {
          condition._id = new Types.ObjectId(query.classroom);
        } else {
          const roles = config.roles;
          const userRoles = user.roles;
          if (userRoles.includes(roles.student)) {
            condition["students.studentId"] = user._id;
          } else if (settings.isWhiteLabelled) {
            if (userRoles.includes(roles.mentor)) {
              condition.user = user._id;
            } else if (userRoles.includes(roles.teacher)) {
              filter.$or = [{ user: user._id }, { owners: user._id }];
            } else {
              condition.allowDelete = true;
              if (userRoles.includes(roles.centerHead)) {
                locationCond = user.locations;
              }
            }
          } else {
            if (userRoles.includes(roles.teacher) || userRoles.includes(roles.mentor)) {
              condition.user = user._id;
            } else {
              condition.allowDelete = true;
              if (userRoles.includes(roles.centerHead)) {
                locationCond = user.locations;
              }
            }
          }
        }

        if (query.locations) {
          const queryLocations = query.locations.split(',').map((l) => new Types.ObjectId(l));
          if (locationCond.length > 0) {
            locationCond = matchArray(queryLocations, locationCond);
            if (locationCond.length === 0) {
              return { allstudent: 0, registeredUser: 0 };
            }
          } else {
            locationCond = queryLocations;
          }
        }

        if (locationCond.length > 0) {
          condition.location = { $in: locationCond };
        }

        const pipeline: any[] = [
          { $match: condition },
          { $match: filter },
          { $unwind: "$students" }
        ];

        if (query.name && query.name !== '') {
          pipeline.push({
            $lookup: {
              from: "users",
              localField: "students.studentId",
              foreignField: "_id",
              as: "userinfo"
            }
          });

          pipeline.push({ $unwind: "$userinfo" });

          pipeline.push({
            $match: {
              $or: [
                { 'userinfo.name': { "$regex": query.name, "$options": "i" } },
                { 'userinfo.rollNumber': query.name },
                { 'userinfo.userId': query.name }
              ]
            }
          });
        }

        pipeline.push({
          $group: {
            _id: '$students.studentUserId',
            studentId: { $first: '$students.studentId' }
          }
        });

        pipeline.push({
          $group: {
            _id: null,
            total: { $sum: 1 },
            registered: { $sum: { $cond: { if: { $ne: ['$studentId', null] }, then: 1, else: 0 } } }
          }
        });
        this.classroomRepository.setInstanceKey(instancekey);
        const result: any = await this.classroomRepository.aggregate(pipeline);

        const count = {
          allstudent: result.length > 0 ? result[0].total : 0,
          registeredUser: result.length > 0 ? result[0].registered : 0
        };

        return count;
      });
    } catch (err) {
      throw new Error(`Error counting students: ${err.message}`);
    }
  }

  async getExportStudentList(request: any): Promise<any> {
    const { query, user, instancekey } = request;
    return await this.redisCache.getSetting(request, async (settings: any) => {
      const studentList = [];
      const condition: any = {
        $or: [
          { "active": { $exists: false } },
          { "active": true },
        ],
      };

      let locationCond = [];

      if (query.classroom) {
        condition._id = new Types.ObjectId(query.classroom);
      } else {
        const userId = user._id;
        const userLocations = user.locations;
        const roles = config.roles;
        const userRoles = user.roles;

        if (settings.isWhiteLabelled) {
          if (userRoles.includes(roles.mentor)) {
            condition.user = userId;
          } else if (userRoles.includes(roles.teacher)) {
            condition.$or = [{ user: userId }, { owners: userId }];
          } else {
            condition.allowDelete = true;
            if (userRoles.includes(roles.centerHead)) {
              locationCond = userLocations;
            }
          }
        } else {
          if (userRoles.includes(roles.teacher) || userRoles.includes(roles.mentor)) {
            condition.user = userId;
          } else {
            condition.allowDelete = true;
            if (userRoles.includes(roles.centerHead)) {
              locationCond = userLocations;
            }
          }
        }
      }

      if (query.locations) {
        const queryLocations = query.locations.split(',').map((l) => new Types.ObjectId(l));
        if (locationCond.length > 0) {
          locationCond = matchArray(queryLocations, locationCond);
          if (locationCond.length === 0) {
            return [];
          }
        } else {
          locationCond = queryLocations;
        }
      }

      if (locationCond.length > 0) {
        condition.location = { $in: locationCond };
      }

      const pipeline = [
        { $match: condition },
        { $unwind: "$students" },
        {
          $lookup: {
            from: "users",
            localField: "students.studentId",
            foreignField: "_id",
            as: "userinfo",
          }
        },
        { $unwind: { path: "$userinfo", preserveNullAndEmptyArrays: true } },
        { $sort: { 'students.createdAt': -1 } }
      ];
      this.classroomRepository.setInstanceKey(instancekey);
      const classroomData: any[] = await this.classroomRepository.aggregate(pipeline);

      const studentClassroomMap: { [key: string]: Types.ObjectId[] } = {};

      for (const classroom of classroomData) {
        const student = classroom.students;
        if (!student.studentUserId) continue;

        const studentUserId = student.studentUserId;
        if (studentClassroomMap[studentUserId]) {
          studentClassroomMap[studentUserId].push(classroom._id);
          continue;
        }

        studentClassroomMap[studentUserId] = [classroom._id];
        const userInfo = classroom.userinfo ? classroom.userinfo : undefined;
        const studentObject: any = {
          classRoom: {
            _id: classroom._id,
            name: classroom.name,
          },
          studentUserId,
          createdAt: new Date(student.createdAt),
          studentId: student._id,
          registeredAt: student.registeredAt ? new Date(student.registeredAt) : undefined,
          user: userInfo,
          name: userInfo ? userInfo.name : '',
          lastLogin: userInfo ? userInfo.lastLogin : undefined,
          rollNumber: userInfo ? userInfo.rollNumber : '',
          level: [],
        };

        studentList.push(studentObject);
      }

      const result = await Promise.all(
        studentList.map(async (student) => {
          if (student.studentId !== '') {
            const cond: any = {
              user: student.studentId,
              isAbandoned: false,
              isEvaluated: true,
              'practiceSetInfo.accessMode': 'invitation',
              'practiceSetInfo.classRooms': { $in: studentClassroomMap[student.studentUserId] },
            };

            if (user.role === config.roles.student) {
              cond.isShowAttempt = true;
            }

            const attemptPipeline = [
              { $match: cond },
              {
                $project: {
                  user: 1,
                  studentName: 1,
                  email: 1,
                  practicesetId: 1,
                  practiceSetInfo: 1,
                  totalTime: 1,
                  totalQuestions: 1,
                  maximumMarks: 1,
                  totalMark: 1,
                  createdAt: 1,
                  isAbandoned: 1,
                  isEvaluated: 1,
                  isShowAttempt: 1,
                },
              },
              { $sort: { createdAt: -1 } },
              {
                $group: {
                  _id: '$user',
                  maximumMarks: { $sum: '$maximumMarks' },
                  totalMark: { $sum: '$totalMark' },
                  totalQuestions: { $sum: '$totalQuestions' },
                  totalTime: { $sum: '$totalTime' },
                  lastAttempted: { $first: '$createdAt' },
                },
              },
              {
                $project: {
                  lastAttempted: 1,
                  accuracy: {
                    $multiply: [
                      {
                        $cond: [
                          { $eq: ['$maximumMarks', 0] },
                          0,
                          { $divide: ['$totalMark', '$maximumMarks'] },
                        ],
                      },
                      100,
                    ],
                  },
                  speed: {
                    $divide: [
                      {
                        $cond: [
                          { $eq: ['$totalQuestions', 0] },
                          0,
                          { $divide: ['$totalTime', '$totalQuestions'] },
                        ],
                      },
                      1000,
                    ],
                  },
                  user: 1,
                },
              },
            ];
            this.attemptRepository.setInstanceKey(instancekey);
            const attempt = await this.attemptRepository.aggregate(attemptPipeline) as unknown as AttemptAggregationResult[];
            if (attempt && attempt.length > 0) {
              student.lastAttempted = attempt[0].lastAttempted;
              student.accuracy = attempt[0].accuracy;
              student.speed = attempt[0].speed;
            }
          }
          return student;
        }),
      );

      return result;
    });
  }

  async getStudentList(request: any): Promise<any> {
    const { query, user, instancekey } = request;

    return await this.redisCache.getSetting(request, async (settings: any) => {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;
      const condition: any = { active: true };
      let locationCond = [];

      if (query.classroom) {
        condition._id = new Types.ObjectId(query.classroom);
      } else {
        const userId = user._id;
        const userLocations = user.locations;
        const roles = config.roles;
        const userRoles = user.roles;

        if (settings.isWhiteLabelled) {
          if (userRoles.includes(roles.student)) {
            condition["students.studentId"] = userId;
          } else if (userRoles.includes(roles.teacher) || userRoles.includes(roles.mentor)) {
            condition.user = userId;
          } else {
            condition.allowDelete = true;
            if (userRoles.includes(roles.centerHead)) {
              locationCond = userLocations;
            }
          }
        } else {
          if (userRoles.includes(roles.teacher) || userRoles.includes(roles.mentor)) {
            condition.user = userId;
          } else if (userRoles.includes(roles.centerHead)) {
            locationCond = userLocations;
          }
        }
      }

      if (query.locations) {
        const queryLocations = query.locations.split(',').map((l) => new Types.ObjectId(l));
        if (locationCond.length > 0) {
          locationCond = matchArray(queryLocations, locationCond);
          if (locationCond.length === 0) {
            return [];
          }
        } else {
          locationCond = queryLocations;
        }
      }

      if (locationCond.length > 0) {
        condition.location = { $in: locationCond };
      }

      const secondCondition: any = {};
      if (user.blockedUsers && user.blockedUsers.length) {
        secondCondition['userinfo._id'] = { $nin: user.blockedUsers };
      }
      if (query.inactive) {
        secondCondition['userinfo.lastLogin'] = { $lte: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000) };
      }
      if (query.name && query.name !== '') {
        secondCondition.$or = [
          { 'userinfo.name': { $regex: query.name, $options: 'i' } },
          { 'userinfo.rollNumber': query.name },
          { 'userinfo.userId': query.name },
        ];
      }

      let sort: any = { 'createdAt': -1, 'userinfo.name': 1 };
      if (query.sort) {
        const dataSort = query.sort.split(',');
        sort = { [dataSort[0]]: parseInt(dataSort[1], 10) };
      }

      const pipeline = [
        { $match: condition },
        { $unwind: '$students' },
        {
          $lookup: {
            from: 'users',
            localField: 'students.studentId',
            foreignField: '_id',
            as: 'userinfo',
          },
        },
        { $unwind: { path: '$userinfo', preserveNullAndEmptyArrays: true } },
        { $match: secondCondition },
        {
          $group: {
            _id: '$students.studentUserId',
            classes: { $push: '$_id' },
            classRoomId: { $first: '$_id' },
            classRoomName: { $first: '$name' },
            createdBy: { $first: '$user' },
            classStudentId: { $first: '$students._id' },
            createdAt: { $first: '$students.createdAt' },
            status: { $first: '$students.status' },
            autoAdd: { $first: '$students.autoAdd' },
            iRequested: { $first: '$students.iRequested' },
            studentId: { $first: '$students.studentId' },
            userinfo: { $first: '$userinfo' },
          },
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'psychoresults',
            localField: 'studentId',
            foreignField: 'user',
            as: 'psychoArray',
          },
        },
      ];
      this.classroomRepository.setInstanceKey(instancekey);
      const students: any[] = await this.classroomRepository.aggregate(pipeline);

      for (let student of students) {
        student.studentUserId = student._id;
        student._id = student.classStudentId;
        student.classRoom = { _id: student.classRoomId, name: student.classRoomName };
        delete student.classRoomId;
        delete student.classRoomName;
        delete student.classStudentId;
        if (student.userinfo) {
          student.registeredAt = student.userinfo.createdAt;
          student.name = student.userinfo.name;
          student.lastLogin = student.userinfo.lastLogin;
          student.rollNumber = student.userinfo.rollNumber;
          student.email = student.userinfo.email;
          student.userId = student.userinfo.userId;
          student.dossier = student.userinfo.dossier;
          student.avatar = student.userinfo.avatar;
          student.provider = student.userinfo.provider;
          student.google = student.userinfo.google;
          student.facebook = student.userinfo.facebook;
        }
        delete student.userinfo;
        if (student.psychoArray && student.psychoArray.length > 0) {
          student.psycho = student.psychoArray[student.psychoArray.length - 1]._id;
        }
        delete student.psychoArray;
      }

      if (query.classroom && query.chatSupport) {
        await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
        this.socketClientService.joinRoom(instancekey, user._id, 'class_' + query.classroom);
      }

      const result = await Promise.all(
        students.map(async (student) => {
          if (student.studentId) {
            student.isMentee = !!student.autoAdd;

            await Promise.all([
              (async () => {
                if (query.classroom && query.chatSupport) {
                  await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
                  student.isOnline = await this.socketClientService.isOnline(instancekey, student.studentId);
                  this.socketClientService.joinRoom(instancekey, student.studentId, 'class_' + query.classroom);
                }
              })(),
              (async () => {
                const cond: any = {
                  user: student.studentId,
                  isAbandoned: false,
                  isEvaluated: true,
                };
                if (
                  user.role !== config.roles.mentor &&
                  student.classRoom.name !== 'My Mentees' &&
                  student.classRoom.name !== 'Group Study'
                ) {
                  cond['practiceSetInfo.accessMode'] = 'invitation';
                  cond['practiceSetInfo.classRooms'] = { $in: student.classes };
                }

                if (user.role === config.roles.student) {
                  cond.isShowAttempt = true;
                }
                this.attemptRepository.setInstanceKey(instancekey);
                const attempt = await this.attemptRepository.findOne(cond, { sort: { createdAt: -1 } });
                if (attempt) {
                  student.lastAttempted = attempt.createdAt;
                }
                delete student.classes;
              })(),
            ]);

          }
          return student;
        })
      );
      return result;
    });

  }
  
}
