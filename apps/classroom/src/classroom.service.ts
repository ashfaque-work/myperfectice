import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import {
  AttemptDetailRepository, AttemptRepository, AttendanceRepository, ClassroomRepository, Constants, CourseRepository, DiscussionRepository,
  FileRepository, globals, isEmail, isNumber, LocationRepository, matchArray, NotificationRepository, PracticeSetRepository, PushService,
  RedisCaching, regexName, SettingRepository, SocketClientService, SubjectRepository, TestSeriesRepository, TopicRepository, UserLogRepository,
  UsersRepository, validateName, validatePassword, wbTeacherInfoRepository, WhiteboardLogRepository
} from '@app/common';
import {
  AddStudentsReq, CreateClassroomReq, DeleteClassroomReq, GetAllStudentsReq, FindAllReq, FindByIdReq, FindByIdRes, GetRequestStudentsReq,
  RemoveStudentReq, UpdateClassStatusReq, UpdateClassroomReq, FindMeReq, GetClassroomStudentsReq, ClassroomSummaryCorrectReq, SaveAsReq,
  GetStudentsReq, GetAllAssignmentByCountReq, UpdateStudentAssignmentReq, GetUserAssignmentReq, AssignAssignmentMarksReq, CreateAssignmentReq,
  GetTeacherAssignmentsReq, UpdateTeacherAssignmentsStatusReq, DeleteTeacherAssignmentReq, EditTeacherAssignmentReq, AddFolderItemReq,
  UpdateAttendantReq, UpdateSteamingStatusReq, UpdateStudentStatusReq, StartWbSessionReq, DeleteFolderItemReq, GetMentoringTimeReq,
  GetPracticeTimeReq, AssignMentorTasksReq, AddToClsWatchListReq, SetDailyGoalsReq, CheckAllowAddReq, ImportStudentReq,
  ImportMentorReq, ImportStudentAdminReq,
} from '@app/common/dto/classroom.dto';
import { ObjectId } from 'mongodb';
import { GrpcInternalException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import mongoose, { Types } from 'mongoose';
import { config } from '@app/common/config';
import { WhiteboardService } from '@app/common/components/whiteboard/whiteboard.service';
import slugify from 'slugify';
import { StudentBus } from '@app/common/bus';
import * as _ from 'lodash';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse, AxiosError } from 'axios';
import { catchError, firstValueFrom, of } from 'rxjs';
import timeHelper from '@app/common/helpers/time-helper';
import { MessageCenter } from '@app/common/components/messageCenter';
import * as path from 'path';
import * as xlsx from 'xlsx';
import * as moment from 'moment';


@Injectable()
export class ClassroomService {
  constructor(
    private readonly classroomRepository: ClassroomRepository,
    private readonly discussionRepository: DiscussionRepository,
    private readonly usersRepository: UsersRepository,
    private readonly locationRepository: LocationRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly practiceSetRepository: PracticeSetRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly topicRepository: TopicRepository,
    private readonly fileRepository: FileRepository,
    private readonly courseRepository: CourseRepository,
    private readonly whiteboardLogRepository: WhiteboardLogRepository,
    private readonly wbTeacherInfoRepository: wbTeacherInfoRepository,
    private readonly userLogRepository: UserLogRepository,
    private readonly attemptDetailRepository: AttemptDetailRepository,
    private readonly testSeriesRepository: TestSeriesRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly settingRepository: SettingRepository,
    private readonly redisCache: RedisCaching,
    private readonly whiteboardService: WhiteboardService,
    private readonly studentBus: StudentBus,
    private readonly httpService: HttpService,
    private readonly socketClientService: SocketClientService,
    private readonly pushService: PushService,
    private readonly messageCenter: MessageCenter,
  ) { }

  //Internal Functions - start
  async getLocations(query, instancekey) {
    try {
      const condition: any = {};
      if (query.name) {
        condition.name = {
          "$regex": query.name,
          "$options": "i",
        };
      }

      const active = {
        $or: [
          { active: { $exists: false } },
          { active: true },
        ],
      };
      const filterQuery = { ...condition, ...active };
      this.locationRepository.setInstanceKey(instancekey);
      const locations = await this.locationRepository.find(filterQuery, { name: 1 });

      if (locations.length > 0) {
        const results = await Promise.all(
          locations.map(async (location) => {
            this.classroomRepository.setInstanceKey(instancekey);
            const count = await this.classroomRepository.countDocuments({ location: location._id, ...active });

            return { ...location, classroom: count };
          }),
        );

        return results;
      } else {
        throw new InternalServerErrorException ('not found');
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  private async getClassroomId(request: any): Promise<Types.ObjectId[]> {
    const { user, query, instancekey } = request;
    return await this.redisCache.getSetting(request, async (settings: any) => {
      let condition: any = {};
      let active = {
        $or: [{
          "active": {
            $exists: false
          }
        }, {
          "active": true
        }]
      }
      let locationCond: any[] = [];
      if (user.roles.includes('student')) {
        condition["students.studentId"] = new ObjectId(user._id);
      } else if (settings.isWhiteLabelled) {
        if (user.roles.includes('teacher') || user.roles.includes('mentor')) {
          condition.user = new ObjectId(user._id);
        } else {
          condition.allowDelete = true;
          if (user.roles.includes('centerHead')) {
            locationCond = user.locations.map(l => new ObjectId(l));
          }
        }
      } else {
        if (user.roles.includes('teacher') || user.roles.includes('mentor')) {
          condition.user = new ObjectId(user._id);
        } else if (user.roles.includes('centerHead')) {
          locationCond = user.locations.map(l => new ObjectId(l));
        }
      }

      if (query.locations) {
        const queryLocations = query.locations.split(',').map((l: string) => new Types.ObjectId(l));
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
      this.classroomRepository.setInstanceKey(instancekey);
      condition.$and = active;
      const classrooms = await this.classroomRepository.find(condition, { _id: 1 });

      const stuArr = classrooms.map((classroom: any) => classroom._id);
      return stuArr;
    });
  }

  private conditionSummary(request: any, withOutSubjectCondition: boolean): any {
    const { query } = request;
    const condition: any = {};

    if (query.lastDay) {
      const lastDate = new Date();
      lastDate.setDate(lastDate.getDate() - query.lastDay);
      condition.createdAt = {
        $gte: new Date(lastDate),
      };
    }

    if (!withOutSubjectCondition && query.subjects) {
      const subjects = query.subjects.split(',').map((id: string) => new Types.ObjectId(id));
      condition['QA.subject._id'] = { $in: subjects };
    }

    condition.isAbandoned = false;
    return condition;
  }

  private async classroomSummaryAttempted(request: any, condition: any): Promise<any> {
    try {
      const match = { $match: condition };
      const unwind = { $unwind: '$QA' };

      let subjectMatch: any = {
        $match: {},
      };

      if (request.query.subjects) {
        subjectMatch = {
          $match: {
            'QA.subject._id': new Types.ObjectId(request.query.subjects),
          },
        };
      }

      const groupAttempted = {
        $group: {
          _id: '$_id',
          totalDoQuestions: {
            "$sum": {
              "$cond": [{ "$eq": ["$QA.status", 3] }, 0, 1]
            },
          },
          user: { $first: '$user' },
          totalTime: { $sum: '$QA.timeEslapse' },
          totalCorrects: {
            $sum: {
              $cond: [{ $eq: ['$QA.status', Constants.CORRECT] }, 1, 0],
            },
          },
          totalMissed: {
            $sum: {
              $cond: [{ $eq: ['$QA.status', Constants.MISSED] }, 1, 0],
            },
          },
          totalQuestions: { $first: '$totalQuestions' },
          totalTestQuestions: { $sum: 1 },
          marks: { $sum: '$QA.actualMarks' },
          obtainMarks: { $sum: '$QA.obtainMarks' },
          totalErrors: { $first: '$totalErrors' },
          practicesetId: { $first: '$practicesetId' },
        },
      };

      const group = {
        $group: {
          _id: '$practicesetId',
          totalQuestions: { $first: '$totalQuestions' },
          totalTestQuestions: { $first: '$totalTestQuestions' },
          totalQuestionDo: { $sum: '$totalDoQuestions' },
          totalMissed: { $first: '$totalMissed' },
          totalCorrects: { $first: '$totalCorrects' },
          marks: { $sum: '$marks' },
          obtainMarks: { $sum: '$obtainMarks' },
          totalTimeTaken: { $sum: '$totalTime' },
          totalAttempt: { $sum: 1 },
        },
      };

      const groupAll = {
        $group: {
          _id: null,
          totalQuestions: { $sum: '$totalQuestions' },
          totalTestQuestions: { $sum: '$totalTestQuestions' },
          totalQuestionDo: { $sum: '$totalQuestionDo' },
          totalMissed: { $sum: '$totalMissed' },
          totalCorrects: { $sum: '$totalCorrects' },
          totalTimeTaken: { $sum: '$totalTimeTaken' },
          marks: { $sum: '$marks' },
          obtainMarks: { $sum: '$obtainMarks' },
          totalAttempt: { $sum: '$totalAttempt' },
          totalPractices: { $sum: 1 },
        },
      };

      const project = {
        $project: {
          totalQuestions: 1,
          totalTestQuestions: 1,
          totalQuestionDo: 1,
          totalMissed: 1,
          totalCorrects: 1,
          totalTimeTaken: 1,
          totalAttempt: 1,
          totalPractices: 1,
          marksPercent: {
            $multiply: [
              {
                $cond: [
                  { $eq: ['$marks', 0] },
                  0,
                  { $divide: ['$obtainMarks', '$marks'] },
                ],
              },
              100,
            ],
          },
        },
      };

      const sort = { $sort: { _id: 1 } };

      this.attemptRepository.setInstanceKey(request.instancekey);
      const result = await this.attemptRepository.aggregate([
        match,
        globals.lookup,
        globals.unw,
        globals.add,
        globals.pro,
        unwind,
        subjectMatch,
        groupAttempted,
        group,
        groupAll,
        project,
        sort,
      ]);

      if (result.length > 0) {
        return result[0];
      } else {
        return {
          _id: null,
          totalQuestions: 0,
          totalQuestionDo: 0,
          totalMissed: 0,
          totalCorrects: 0,
          totalTimeTaken: 0,
          totalAttempt: 0,
          totalPractices: 0,
          marksPercent: 0,
          totalTestQuestions: 0,
        };
      }

    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  private getFilterByTeacher(request: any): any[] {
    const { query, user } = request;
    let filter: any = [];
    const expiresOnFilter = { $lt: new Date() };

    if (query.multiStatus) {
      const filterMultiStatus = [];
      const expiresFilter = [];
      const multiStatus = query.multiStatus.split(',');

      if (multiStatus && multiStatus.length > 0) {
        if (multiStatus.length > 1) {
          for (const ssIndex of multiStatus) {
            if (ssIndex === 'expired') {
              expiresFilter.push({
                $and: [
                  { expiresOn: expiresOnFilter },
                  { expiresOn: { $ne: null } },
                  { status: 'published' },
                ],
              });
            } else {
              filterMultiStatus.push(ssIndex);
            }
          }

          if (filterMultiStatus.length > 1) {
            expiresFilter.push({
              status: { $in: filterMultiStatus },
            });
          } else {
            expiresFilter.push({
              status: filterMultiStatus[0],
            });
          }

          filter.push({
            $or: expiresFilter,
          });
        } else {
          filter.push(this.getFilterWithStatus(multiStatus[0], filter));
        }
      } else {
        filter.push({
          expiresOn: expiresOnFilter,
        });
      }
    }

    if (query.status) {
      if (query.notCheckExpiresOn) {
        filter.push({ status: query.status });
      } else {
        filter = this.getFilterWithStatus(query.status as string, filter);
      }
    }

    if (query.expired) {
      filter = this.getFilterWithStatus(query.expired as string, filter);
    }

    if (query.keyword) {
      filter.push({
        $or: [
          { title: { $regex: query.keyword, $options: 'i' } },
          { 'subjects.name': { $regex: query.keyword, $options: 'i' } },
          { 'units.name': { $regex: query.keyword, $options: 'i' } },
          { status: { $regex: query.keyword, $options: 'i' } },
        ],
      });
    }

    if (query.testMode) {
      filter.push({ testMode: query.testMode });
    }

    if (query.subjects) {
      const subjects = typeof query.subjects === 'string'
        ? _.compact((query.subjects as string).split(','))
        : query.subjects;
      filter.push({ 'subjects._id': { $in: subjects.map(s => new Types.ObjectId(s)) } });
    } else {
      filter.push({ 'subjects._id': { $in: user.subjects.map(s => new Types.ObjectId(s)) } });
    }

    if (query.levels) {
      const levels = _.compact((query.levels as string).split(','));
      filter.push({ 'subjects.level': { $in: levels } });
    }

    if (query.unit) {
      const units = _.compact((query.unit as string).split(','));
      filter.push({ 'units._id': { $in: units.map(u => new ObjectId(u)) } });
    }

    if (user.role !== 'publisher') {
      filter.push({ locations: new Types.ObjectId(user.activeLocation) });
    }

    return filter;
  }

  private getFilterWithStatus(status: string, filter: any[]): any[] {
    var conditionExpired = {
      $lte: new Date()
    }
    const expiresOnFilter = { $lt: new Date() };

    if (status === 'expired') {
      filter.push({
        $or: [
          { expiresOn: expiresOnFilter, status: 'published' },
          { status: 'revoked' },
        ],
      });
    } else {
      if (status === "draft" || status === "published") {
        filter.push({
          $or: [
            { expiresOn: { $gt: new Date() }, status: 'published' },
            { status: 'draft' },
            { expiresOn: null },
          ],
        });
      }
      filter.push({ status: status });
    }

    return filter;
  }

  private async getListSubjects(request: any, condition: any): Promise<any> {
    const condition2 = this.createMatch(condition);

    const match2 = { $match: condition2 };
    const match = { $match: condition };
    const unwind = { $unwind: '$QA' };
    const project = {
      $project: {
        name: {
          $concat: [{ $substr: ['$grade', 0, 3] }, ' - ', '$name']
        }
      }
    };
    const group = {
      $group: {
        _id: "$QA.subject._id",
        name: { '$first': '$QA.subject.name' },
        grade: { '$first': '$practiceSetInfo.grades.name' }
      }
    };

    const sort = { $sort: { name: 1 } };
    this.practiceSetRepository.setInstanceKey(request.instancekey);
    const res = await this.practiceSetRepository.aggregate([
      match,
      globals.lookup,
      globals.unw,
      globals.add,
      globals.pro,
      match2,
      unwind,
      group,
      project,
      sort
    ]);

    return res;
  }

  private createMatch(obj: any): any {
    const keys = Object.keys(obj);
    const newObject: any = {};
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].includes('QA')) {
        newObject[keys[i]] = obj[keys[i]];
        delete obj[keys[i]];
      }
    }
    return newObject;
  }

  private async summaryQuestionBySubject(request, condition) {
    try {
      const condition2 = this.createMatch(condition);

      const pipeline = [
        { $match: condition },
        globals.lookup,
        globals.unw,
        globals.add,
        globals.pro,
        { $match: condition2 },
        { $unwind: '$QA' },
        {
          $group: {
            _id: '$QA.subject._id',
            total: { $sum: 1 },
            name: { $first: '$QA.subject.name' }
          }
        },
        {
          $project: {
            subject: { _id: '$_id', name: '$name' },
            total: 1
          }
        }
      ];

      this.attemptRepository.setInstanceKey(request.instancekey);
      this.subjectRepository.setInstanceKey(request.instancekey);
      const results: any = await this.attemptRepository.aggregate(pipeline);
      if (!results && results.length < 1) {
        throw new InternalServerErrorException ('Summary Question not found:');
      }

      const subjects = await Promise.all(results.map(async (subject) => {
        const result = await this.subjectRepository.findById(new Types.ObjectId(subject._id));
        if (result) {
          subject.name = result.name;
        }
        return subject;
      }));
      return subjects;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getListTopic(request, condition): Promise<any> {
    try {
      const { instancekey, query } = request;
      const pipeline = [
        { $match: condition },
        globals.lookup,
        globals.unw,
        globals.add,
        globals.pro,
        { $match: this.createMatch(condition) },
        { $unwind: '$QA' },
        { $group: { _id: '$QA.topic._id', name: { $first: '$QA.topic.name' }, subject: { $first: '$QA.subject._id' } } },
        { $project: { name: 1, subject: 1 } },
        { $sort: { name: 1 } }
      ];

      if (query.subjects) {
        pipeline.splice(4, 0, { $match: { 'QA.subject._id': new Types.ObjectId(query.subjects) } });
      }

      this.attemptRepository.setInstanceKey(instancekey);
      const result = await this.attemptRepository.aggregate(pipeline);

      return result;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async summaryQuestionByTopic(request, condition): Promise<any> {
    try {
      const { instancekey, query } = request;
      const pipeline = [
        { $match: condition },
        globals.lookup,
        globals.unw,
        globals.add,
        globals.pro,
        { $match: this.createMatch(condition) },
        { $unwind: '$QA' },
        { $group: { _id: '$QA.topic._id', total: { $sum: 1 } } },
        { $project: { _id: 1, total: 1 } }
      ];

      if (query.subjects) {
        pipeline.splice(4, 0, { $match: { 'QA.subject._id': new Types.ObjectId(query.subjects) } });
      }

      this.attemptRepository.setInstanceKey(instancekey);
      this.topicRepository.setInstanceKey(instancekey);
      const results: any = await this.attemptRepository.aggregate(pipeline);
      if (!results && results.length < 1) {
        throw new InternalServerErrorException ('Summary Question by topic not found:');
      }

      const topics = await Promise.all(
        results.map(async topic => {
          const result = await this.topicRepository.findById(topic._id);
          if (result !== null) {
            topic.name = result.name;
          }
          return topic;
        })
      );

      return topics;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async summaryCorrectByDate(request, condition): Promise<any> {
    try {
      const { instancekey, query } = request;
      const pipeline = [
        { $match: condition },
        globals.lookup,
        globals.unw,
        globals.add,
        globals.pro,
        { $match: this.createMatch(condition) },
        { $unwind: '$QA' },
        { $match: { 'createdAt': { $type: 9 } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              user: '$user'
            },
            totalQuestionsDo: { $sum: { $cond: [{ $eq: ['$QA.status', 3] }, 0, 1] } },
            totalTimeTaken: { $sum: { $cond: [{ $gt: ['$QA.timeEslapse', 0] }, '$QA.timeEslapse', 0] } },
            marks: { $sum: '$QA.actualMarks' },
            obtainMarks: { $sum: '$QA.obtainMarks' },
            totalCorrects: { $sum: { $cond: [{ $eq: ['$QA.status', 1] }, 1, 0] } },
            created: { $first: '$createdAt' },
            user: { $first: '$user' },
            totalQuestions: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            marks: 1,
            obtainMarks: 1,
            created: 1,
            day: '$_id',
            totalCorrects: 1,
            userData: '$user',
            totalQuestionsDo: 1,
            totalTimeTaken: 1,
            totalQuestions: 1,
            avgTimeDoQuestion: { $cond: [{ $eq: ['$totalQuestionsDo', 0] }, 0, { $divide: ['$totalTimeTaken', '$totalQuestionsDo'] }] },
            percentCorrects: { $cond: [{ $eq: ['$marks', 0] }, 0, { $multiply: [{ $divide: ['$obtainMarks', '$marks'] }, 100] }] }
          }
        },
        { $sort: { 'created': 1 } }
      ];

      if (query.subjects) {
        pipeline.splice(4, 0, { $match: { 'QA.subject._id': new Types.ObjectId(query.subjects) } });
      }
      if (query.topic) {
        pipeline.splice(4, 0, { $match: { 'QA.topic._id': new Types.ObjectId(query.topic) } });
      }

      this.attemptRepository.setInstanceKey(instancekey);
      this.usersRepository.setInstanceKey(instancekey);
      const results: any = await this.attemptRepository.aggregate(pipeline);
      if (!results && results.length < 1) {
        throw new InternalServerErrorException ('Summary by date not found:');
      }

      const populatedResults = await this.usersRepository.populate(results, {
        path: 'userData',
        select: 'name email'
      });

      return populatedResults;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async subjectAccuracyAndSpeed(instancekey: string, condition: any): Promise<any> {
    try {
      const condition2 = this.createMatch(condition);
      const match2 = {
        $match: condition2,
      };

      this.attemptRepository.setInstanceKey(instancekey);
      const result = await this.attemptRepository.aggregate([
        {
          $match: condition,
        },
        globals.lookup,
        globals.unw,
        globals.add,
        globals.pro,
        match2,
        {
          $unwind: '$QA',
        },
        {
          $project: {
            status: '$QA.status',
            timeElapse: '$QA.timeEslapse',
            'subject._id': '$QA.subject._id',
            'subject.name': '$QA.subject.name',
            grade: '$practiceSetInfo.grades',
            actualMarks: '$QA.actualMarks',
            obtainMarks: '$QA.obtainMarks',
            _id: 0,
          },
        },
        {
          $group: {
            _id: '$subject',
            marks: { $sum: '$actualMarks' },
            obtainMarks: { $sum: '$obtainMarks' },
            grade: { $first: '$grade.name' },
            totalQuestions: { $sum: 1 },
            totalTime: { $sum: '$timeElapse' },
            doQuestion: {
              $sum: {
                $cond: [{ $eq: ['$status', 3] }, 0, 1],
              },
            },
            totalErrors: {
              $sum: {
                $cond: [{ $eq: ['$status', 2] }, 1, 0],
              },
            },
            totalCorrects: {
              $sum: {
                $cond: [{ $eq: ['$status', 1] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            marks: 1,
            obtainMarks: 1,
            subject: {
              _id: '$_id._id',
              name: {
                $concat: [
                  { $substr: ['$grade', 0, 3] },
                  ' - ',
                  '$_id.name',
                ],
              },
            },
            avgTimeDoQuestion: {
              $divide: [
                {
                  $cond: [
                    { $eq: ['$doQuestion', 0] },
                    0,
                    { $divide: ['$totalTime', '$doQuestion'] },
                  ],
                },
                1000,
              ],
            },
            _id: 0,
          },
        },
        {
          $project: {
            subject: 1,
            avgTimeDoQuestion: 1,
            accuracyPercent: {
              $multiply: [
                {
                  $cond: [
                    { $eq: ['$marks', 0] },
                    0,
                    { $divide: ['$obtainMarks', '$marks'] },
                  ],
                },
                100,
              ],
            },
          },
        },
      ]);

      return result;
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async topicAccuracyAndSpeed(instancekey: string, condition: any, filter: any): Promise<any> {
    try {
      const condition2 = this.createMatch(condition);
      const match2 = {
        $match: condition2,
      };

      this.attemptRepository.setInstanceKey(instancekey);
      const result = await this.attemptRepository.aggregate([
        {
          $match: condition,
        },
        globals.lookup,
        globals.unw,
        globals.add,
        globals.pro,
        match2,
        {
          $unwind: '$QA',
        },
        {
          $match: filter,
        },
        {
          $project: {
            status: '$QA.status',
            timeElapse: '$QA.timeEslapse',
            'topic._id': '$QA.topic._id',
            'topic.name': '$QA.topic.name',
            actualMarks: '$QA.actualMarks',
            obtainMarks: '$QA.obtainMarks',
            _id: 0,
          },
        },
        {
          $group: {
            _id: '$topic',
            marks: { $sum: '$actualMarks' },
            obtainMarks: { $sum: '$obtainMarks' },
            totalQuestions: { $sum: 1 },
            doQuestion: {
              $sum: {
                $cond: [{ $eq: ['$status', 3] }, 0, 1],
              },
            },
            totalTime: { $sum: '$timeElapse' },
            totalErrors: {
              $sum: {
                $cond: [{ $eq: ['$status', 2] }, 1, 0],
              },
            },
            totalCorrects: {
              $sum: {
                $cond: [{ $eq: ['$status', 1] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            topic: '$_id',
            marks: 1,
            obtainMarks: 1,
            avgTimeDoQuestion: {
              $divide: [
                {
                  $cond: [
                    { $gt: ['$doQuestion', 0] },
                    { $divide: ['$totalTime', '$doQuestion'] },
                    0,
                  ],
                },
                1000,
              ],
            },
            _id: 0,
          },
        },
        {
          $project: {
            topic: 1,
            avgTimeDoQuestion: 1,
            marks: 1,
            obtainMarks: 1,
            accuracyPercent: {
              $multiply: [
                {
                  $cond: [
                    { $gt: ['$marks', 0] },
                    { $divide: ['$obtainMarks', '$marks'] },
                    0,
                  ],
                },
                100,
              ],
            },
          },
        },
      ]);

      return result;
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  private async sendEmailtoStudent(settings, req, emitData) {
    let file = 'add-student-to-class';
    if (emitData.classRoom === 'Group Study') {
      file = 'add-student-to-mycircle';
    }

    let customMessage = `You have been added to classroom “${emitData.classRoom}” by “${req.user.name}”`;

    const options = {
      customMessage,
      subject: 'Welcome to the new classroom',
      productName: settings.productName,
      institute: emitData.institute.name ? emitData.institute.name : ' ',
      code: emitData.institute.code ? emitData.institute.code : ' ',
      classroomCode: emitData.classroomCode ? emitData.classroomCode : ' ',
      hiddenLink: settings.baseUrl,
      senderName: req.user.name
    };

    for (const student of emitData.students) {
      const dataMsgCenter: any = {
        modelId: 'classroom',
        isScheduled: true,
        isEmail: true
      };

      if (isEmail(student.userId)) {
        dataMsgCenter.to = student.userId;
      } else {
        dataMsgCenter.to = req.user.country.callingCodes[0] + student.userId;
        dataMsgCenter.isEmail = false;
        dataMsgCenter.sms = `Welcome to the new classroom. ${customMessage}`;
      }

      if (student._id) {
        dataMsgCenter.sender = req.user._id;
        dataMsgCenter.receiver = student._id;
        dataMsgCenter.itemId = student._id;

        await this.pushService.pushToUsers(req.instancekey, [student._id], 'Welcome to the new classroom', customMessage, {});
      }
      await this.messageCenter.sendWithTemplate(req.instancekey, file, options, dataMsgCenter);
    }
  }

  private async sendUploadErrorEmail(request: any, options: any) {
    this.notificationRepository.setInstanceKey(request.instancekey);
    await this.notificationRepository.create({
      receiver: new Types.ObjectId(request.user._id),
      type: "notification",
      modelId: "upload user",
      subject: "Student upload processing failed",
    });

    let dataMsgCenter: any = {
      receiver: request.user._id,
      modelId: "uploadUser",
    };

    if (isEmail(options.user)) {
      dataMsgCenter.to = options.user;
      dataMsgCenter.isScheduled = true;
    }

    await this.messageCenter.sendWithTemplate(request, "upload-student-error-email", options, dataMsgCenter)
    return {
      code: 0,
      totalStudentCount: options.totalStudentCount,
      addedStudentCount: options.addedStudentCount,
      returnStudentCount: options.returnStudentCount,
      errorCount: options.errorCount
    };
  }

  private async sendEmailToStudents(settings: any, request: any, emitData: any) {
    try {
      let file = "add-student-to-class";
      if (emitData.classRoom === "Group Study") {
        file = "add-student-to-mycircle";
      }

      let customMessage = `You have been added to classroom “${emitData.classRoom}” by “${request.user.name}”`;

      let options = {
        customMessage,
        subject: "Welcome to the new classroom",
        productName: settings.productName,
        institute: emitData.institute.name || " ",
        code: emitData.institute.code || " ",
        classroomCode: emitData.classroomCode || " ",
        hiddenLink: settings.baseUrl,
        senderName: request.user.name,
      };

      await Promise.all(emitData.students.map(async (student: any) => {
        let dataMsgCenter: any = {
          modelId: "classroom",
          isScheduled: true,
          isEmail: true,
        };

        if (isEmail(student.userId)) {
          dataMsgCenter.to = student.userId;
        } else {
          dataMsgCenter.to = `${request.user.country.callingCodes[0]}${student.userId}`;
          dataMsgCenter.isEmail = false;
          dataMsgCenter.sms = `Welcome to the new classroom. ${customMessage}`;
        }

        if (student._id) {
          dataMsgCenter.sender = request.user._id;
          dataMsgCenter.receiver = student._id;
          dataMsgCenter.itemId = student._id;

          await this.pushService.pushToUsers(
            request.instancekey, [student._id], "Welcome to the new classroom", customMessage, {},
          );
        }

        await this.messageCenter.sendWithTemplate(request, file, options, dataMsgCenter);
      }));
    } catch (err) {
      throw new GrpcInternalException(err.message)
    }
  }

  private async addStudentToClassroom(userId: Types.ObjectId, studentToAdd: any) {
    const classroom = await this.classroomRepository.findOne({ user: userId, name: 'My Mentees' });
    if (classroom) {
      classroom.students.push(studentToAdd);
      await this.classroomRepository.updateOne({ _id: classroom._id }, classroom);
    } else {
      throw new InternalServerErrorException('My  Mentees classroom is not found!');
    }
  }

  private async sendUploadUserErrorEmail(request: any, options: any) {
    this.notificationRepository.setInstanceKey(request.instancekey);
    await this.notificationRepository.create({
      receiver: new Types.ObjectId(request.user._id),
      type: "notification",
      modelId: "upload user",
      subject: "User upload processing failed",
    });

    let dataMsgCenter: any = {
      receiver: request.user._id,
      modelId: "uploadUser",
    };

    if (isEmail(options.user)) {
      dataMsgCenter.to = options.user;
      dataMsgCenter.isScheduled = true;
    }

    await this.messageCenter.sendWithTemplate(request, "upload-user-error-email", options, dataMsgCenter)
  }

  private async invalidateTokenAfterPasswordChanged(request: any, userId: any) {
    // invalidate user token
    this.userLogRepository.setInstanceKey(request.instancekey);
    const token = await this.userLogRepository.distinct('token', { user: userId });
    if (token && token[0]) {
      var tosave = {}
      token.forEach((t) => {
        tosave[t] = true
      })
      this.redisCache.set(request, userId + '_revoked_token', tosave, 60 * 60 * 24)
    }

    Logger.debug('deactivate user: ' + userId.toString())
    await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
    this.socketClientService.toUser(request.instancekey, userId.toString(), 'account.deactivate', { reason: 'Password Changed' })
  }
  //Internal Functions - end

  async findAll(request: FindAllReq) {
    try {
      const { location, instancekey, user } = request;
      let settings: any = await this.redisCache.getSettingAsync(instancekey)

      const projection = {
        name: 1,
        seqCode: 1,
        location: 1,
        showAnalysis: 1
      };
      const filter: any = { active: true, location: new Types.ObjectId(user.activeLocation) };

      const roles = config.roles;
      const userRoles = user.roles;

      if (userRoles.some(role => [roles.admin, roles.support, roles.director].includes(role))) {
        filter.allowDelete = true;
        filter.slugfly = { $ne: "group-study" };
      } else if (userRoles.some(role => [roles.teacher, roles.mentor].includes(role))) {
        if (settings.isWhiteLabelled) {
          filter.$or = [{ user: new Types.ObjectId(user._id) }, { owners: new Types.ObjectId(user._id) }];
        } else {
          filter.user = new Types.ObjectId(user._id);
        }
      } else {
        filter.allowDelete = true;
        if (userRoles.includes(roles.centerHead)) {
          filter.location = { $in: user.locations };
        }
      }

      if (userRoles.some(role => [roles.admin, roles.support, roles.director, roles.centerHead].includes(role))) {
        filter.userRole = { $ne: 'student' };
      }

      if (location) {
        filter.location = new Types.ObjectId(location);
      } else {
        filter.location = new Types.ObjectId(user.activeLocation);
      }

      this.classroomRepository.setInstanceKey(instancekey);
      const classrooms = await this.classroomRepository.find(filter, projection, { sort: { 'createdAt': -1 } });

      if (!classrooms || classrooms.length === 0) {
        throw new InternalServerErrorException ('No classroom found');
      }

      return { response: classrooms };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findMe(request: FindMeReq) {
    try {
      const { query, instancekey, user } = request;

      let results = await this.redisCache.getSetting(request, async (settings: any) => {
        const pageNumber = query.page ? query.page : 1;
        const limitNumber = query.limit ? query.limit : 20;
        const skip = (pageNumber - 1) * limitNumber;

        let projection: any = {
          allowDelete: 1,
          location: 1,
          createdAt: 1,
          owners: 1,
          name: 1,
          nameLower: 1,
          role: 1,
          stream: 1,
          isNew: 1,
          user: 1,
          updatedAt: 1,
          slugfly: 1,
          "students._id": 1,
          seqCode: 1,
          showAnalysis: 1,
          colorCode: 1,
          imageUrl: 1
        };
        if (query.home) {
          projection = {
            _id: 1,
            name: 1,
            user: 1,
            updatedAt: 1,
            seqCode: 1,
            colorCode: 1,
            imageUrl: 1
          };
        }

        const filter: any = { active: true };

        if (query.searchText) {
          filter["name"] = {
            "$regex": query.searchText,
            "$options": "i"
          }
        }

        const roles = config.roles;
        const userRoles = user.roles;

        if (userRoles && userRoles.some(role => [roles.admin].includes(role))) {
          filter.allowDelete = true;
          filter.slugfly = { $ne: "group-study" };
        } else if (userRoles && userRoles.some(role => [roles.director].includes(role))) {
          filter.allowDelete = true;
          filter.userRole = { $ne: 'student' };
          filter.slugfly = { $ne: "group-study" };
        } else if (userRoles && userRoles.some(role => [roles.student].includes(role))) {
          filter.slugfly = { $ne: "my-mentees" };
          filter.$or = [
            {
              $and: [
                { "students.studentId": new ObjectId(user._id) },
                { slugfly: { $ne: 'group-study' } }
              ]
            },
            { user: new ObjectId(user._id) }
          ];
        } else if (userRoles && userRoles.some(role => [roles.teacher, roles.mentor].includes(role))) {
          filter.$or = [
            { user: new ObjectId(user._id) },
            { owners: new ObjectId(user._id) }
          ];
        } else {
          filter.allowDelete = true;
          filter.userRole = { $ne: 'student' };
        }

        if (query.name) {
          filter.name = { $regex: new RegExp(query.name, 'i') };
        }
        if (query.locations) {
          filter.location = { $in: query.locations.split(",").map(l => new ObjectId(l)) };
        } else if (!query.name) {
          filter.location = new Types.ObjectId(user.activeLocation);
        }

        this.classroomRepository.setInstanceKey(instancekey);
        const results = await this.classroomRepository.find(
          filter, projection, { skip, limit: limitNumber, sort: { updatedAt: -1 } }, [
          { path: 'location', select: 'name', options: { lean: true } },
          { path: 'user', select: 'name roles', options: { lean: true } }
        ]);

        if (settings.features.whiteboard && query.checkSession) {
          await Promise.all(results.map(async (room) => {
            const meeting = await this.whiteboardService.getMeeting(instancekey, room._id.toString());
            room.sessionStarted = !!meeting && meeting.running;
            if (room.sessionStarted) {
              room.sessionJoined = meeting.users.includes(user._id.toString());
            }
          }));
        }
        return results;
      });

      return { response: results };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async countMe(request: FindMeReq) {
    try {
      const { query, instancekey, user } = request;

      let result = await this.redisCache.getSetting(request, async (settings: any) => {
        const filter: any = { active: true };

        if (query.searchText) {
          filter["name"] = {
            "$regex": query.searchText,
            "$options": "i"
          }
        }

        const roles = config.roles;
        const userRoles = user.roles;

        if (userRoles.some(role => [roles.admin].includes(role))) {
          filter.allowDelete = true;
          filter.slugfly = { $ne: "group-study" };
        } else if (userRoles.some(role => [roles.director].includes(role))) {
          filter.allowDelete = true;
          filter.userRole = { $ne: 'student' };
          filter.slugfly = { $ne: "group-study" };
        } else if (userRoles.some(role => [roles.student].includes(role))) {
          filter.slugfly = { $ne: "my-mentees" };
          filter.$or = [
            {
              $and: [
                { "students.studentId": user._id },
                { slugfly: { $ne: 'group-study' } }
              ]
            },
            { user: user._id }
          ];
        } else if (userRoles.some(role => [roles.teacher, roles.mentor].includes(role))) {
          filter.$or = [
            { user: user._id },
            { owners: user._id }
          ];
        } else {
          filter.allowDelete = true;
          filter.userRole = { $ne: 'student' };
        }

        if (query.name) {
          filter.name = { $regex: new RegExp(query.name, 'i') };
        }
        if (query.locations) {
          filter.location = { $in: query.locations.split(",") };
        } else if (!query.name) {
          filter.location = new Types.ObjectId(user.activeLocation);
        }

        this.classroomRepository.setInstanceKey(instancekey);
        return this.classroomRepository.countDocuments(filter);
      });

      return { count: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getLocationByMe(request: FindMeReq) {
    try {
      const { query, instancekey, user } = request;

      if (query.all) {
        const locations = await this.getLocations(query, instancekey);
        return { response: locations };
      } else {
        const conditions: any = {};

        const roles = config.roles;

        if (user.roles.some(role => [roles.director, roles.publisher, roles.teacher].includes(role))) {
          conditions._id = { $in: user.locations };
        }

        const active = {
          $or: [
            { active: { $exists: false } },
            { active: true },
          ],
        };

        const filterQuery = { ...conditions, ...active };
        const sortVal = query.sort;
        const options = sortVal ? { sortVal } : {};

        this.locationRepository.setInstanceKey(instancekey);
        const locations = await this.locationRepository.find(filterQuery, { name: 1 }, options);

        return { response: locations };
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findMentorClassroom(request: FindMeReq) {
    try {
      const { query, instancekey, user } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      let classroom: any = await this.classroomRepository.findOne(
        {
          $or: [
            { slugfly: 'my-mentees' },
            { nameLower: 'my mentees' },
            { slugfly: 'group-study' },
            { nameLower: 'group study' },
          ],
          user: new Types.ObjectId(user._id),
        },
        { students: 0 },
        { lean: true },
      );

      if (!classroom) {
        throw new InternalServerErrorException ('Classroom not found');
      }

      classroom = await this.redisCache.getSetting(request, async (settings: any) => {
        if (settings.features.whiteboard && query.checkSession) {
          let meeting = await this.whiteboardService.getMeeting(instancekey, classroom._id);
          classroom.sessionStarted = !!meeting && meeting.running;

          if (classroom.sessionStarted) {
            for (let i = 0; i < meeting.users.length; i++) {
              if (meeting.users[i] === user._id.toString()) {
                classroom.sessionJoined = true;
                break;
              }
            }
          }

        }
        return classroom;
      });

      return { classroom: classroom };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findMeOneById(request: FindByIdReq): Promise<FindByIdRes> {
    try {
      const { _id, instancekey, user } = request;

      const result = await this.redisCache.getSetting(request, async (settings: any) => {
        const filter: any = { _id, active: true };
        const roles = config.roles;
        if (user.roles.some(role => [roles.teacher, roles.mentor].includes(role))) {
          filter.$or = [
            { user: user._id },
            { owners: user._id }
          ];
        } else {
          if (settings.isWhiteLabelled) {
            filter.allowDelete = true;
            if (user.roles.includes('centerHead')) {
              filter.location = {
                $in: user.locations,
              };
            }
          }
        }

        this.classroomRepository.setInstanceKey(instancekey);
        let classroom: any = await this.classroomRepository.findOne(filter);
        if (!classroom) {
          throw new InternalServerErrorException ('No classroom found');
        }
        return classroom;
      });

      return { response: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findMeOne(request: FindByIdReq): Promise<FindByIdRes> {
    try {
      const { query, instancekey, user } = request;

      const result = await this.redisCache.getSetting(request, async (settings: any) => {
        const filter: any = {};
        const roles = config.roles;
        if (user.roles.some(role => [roles.teacher, roles.mentor].includes(role))) {
          filter.user = user._id;
        } else {
          if (settings.isWhiteLabelled) {
            filter.allowDelete = true;
          }
        }

        if (query.neClassRoom) {
          filter['_id'] = { $ne: query.neClassRoom };
        }

        if (query.name) {
          filter.name = regexName(query.name);
        }
        filter.location = new Types.ObjectId(user.activeLocation);

        this.classroomRepository.setInstanceKey(instancekey);
        let classroom: any = await this.classroomRepository.findOne(filter);
        if (!classroom) {
          throw new NotFoundException('No classroom found');
        }
      });

      return { response: result };
    } catch (error) {
      if(error instanceof NotFoundException){
        throw new GrpcNotFoundException(error.message)
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async findById(request: FindByIdReq): Promise<FindByIdRes> {
    try {
      const { _id, instancekey, query, user } = request;

      let settings: any = await this.redisCache.getSettingAsync(instancekey);

      const filter = { _id, active: true };

      let projection = {};
      if (query.assignment) {
        projection = { _id: 1, imageUrl: 1, name: 1, user: 1 };
      }
      if (query.classroomSetting) {
        projection = { _id: 1, imageUrl: 1, name: 1, user: 1, seqCode: 1, location: 1, owners: 1, joinByCode: 1 };
      }
      this.classroomRepository.setInstanceKey(instancekey);
      let classroom: any = await this.classroomRepository.findOne(filter, projection);
      if (!classroom) {
        throw new InternalServerErrorException ('No classroom found');
      }

      if (query.includeUser) {
        classroom = await this.classroomRepository.populate(classroom, { path: 'user', select: 'name' });
      }
      if (query.owners) {
        classroom = await this.classroomRepository.populate(classroom, { path: 'owners', select: 'name _id' });
      }
      if (query.includeStudentInfo) {
        classroom = await this.classroomRepository.populate(classroom, {
          path: 'students.studentId',
          select: 'name avatar provider facebook google'
        });
      }

      if (classroom.students && classroom.students.length) {
        classroom.totalStudents = classroom.students.length;
      } else {
        classroom.totalStudents = 0;
      }

      if (query.studentNotCount) {
        delete classroom.students;
      }

      if (settings.features.whiteboard && query.checkSession) {
        let meeting = await this.whiteboardService.getMeeting(instancekey, _id);
        classroom.sessionStarted = !!meeting && meeting.running;

        if (classroom.sessionStarted) {
          classroom.sessionJoined = meeting.users.includes(user._id.toString());
        }
      }

      if (query.includeStudentInfo) {
        let registeredStudents = [];
        for (let student of classroom.students) {
          if (student.studentId) {
            registeredStudents.push(student);
            student.name = student.studentId.name;
            student.avatar = student.studentId.avatar;
            student.provider = student.studentId.provider;
            student.facebook = student.studentId.facebook;
            student.google = student.studentId.google;
            student.studentId = student.studentId._id;
          }
        }
        classroom.students = registeredStudents;
      }

      return classroom;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findStudents(request: FindMeReq) {
    try {
      if (request.query.isExport) {
        const result = await this.studentBus.getExportStudentList(request)
        return { response: result };
      } else {
        const result = await this.studentBus.getStudentList(request)
        return { response: result };
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async countStudents(request: FindMeReq) {
    try {
      const { query, user, instancekey } = request;
      const roles = config.roles;
      const userRoles = user.roles;

      if (userRoles.includes(roles.admin) || userRoles.includes(roles.director) || query.all) {
        this.usersRepository.setInstanceKey(instancekey);
        const studentCount = await this.usersRepository.countDocuments({
          roles: { $in: ["student"] }
        });
        const count = {
          allstudent: studentCount,
          registeredUser: 0
        };

        return { count: count };
      } else {
        const count = await this.studentBus.countStudents(request)
        return { count: count };
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findTeachers(request: FindByIdReq) {
    try {
      const { _id, query, user, instancekey } = request;
      // Fetch the classroom details
      this.classroomRepository.setInstanceKey(instancekey);
      const cls = await this.classroomRepository.findById(_id);
      if (!cls) {
        throw new InternalServerErrorException ('No classroom found by this ID.');
      }

      cls.owners.push(cls.user);

      // Filter blocked users
      if (user.blockedUsers && user.blockedUsers.length) {
        cls.owners = cls.owners.filter(u => !user.blockedUsers.find(bu => bu.equals(u)));
      }

      // Build match condition
      const match: any = { _id: { $in: cls.owners } };
      if (query.name) {
        match.$or = [
          { name: { $regex: query.name, $options: 'i' } },
          { email: query.name },
        ];
      }

      // Build the pipeline
      const pipeline: any[] = [
        { $match: match },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            avatar: 1,
          },
        },
        { $sort: { name: 1 } },
      ];

      // Handle count query
      if (query.count) {
        pipeline.push({ $count: 'count' });
        this.usersRepository.setInstanceKey(instancekey);
        const teachers = await this.usersRepository.aggregate(pipeline);
        return { response: teachers };
      }

      // Handle pagination
      const page = query.page ? query.page : 1;
      const limit = query.limit ? query.limit : 20;
      const skip = (page - 1) * limit;

      pipeline.push({ $skip: skip }, { $limit: limit });

      // Fetch teachers
      const teachers: any = await this.usersRepository.aggregate(pipeline);

      // Handle chat support
      if (query.chatSupport) {
        await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
        const tasks = teachers.map(async t => {
          t.isOnline = await this.socketClientService.isOnline(instancekey, t._id);
          this.socketClientService.joinRoom(instancekey, t._id, 'class_' + _id);
        });
        await Promise.all(tasks);
      }

      return { response: teachers };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findClassroomStudents(request: FindByIdReq) {
    try {
      const { _id, query, user, instancekey } = request;
      // Fetch the classroom details
      this.classroomRepository.setInstanceKey(instancekey);
      const cls = await this.classroomRepository.findById(_id);
      if (!cls) {
        throw new InternalServerErrorException ('No classroom found by this ID.');
      }

      // Build match condition
      const match: any = { _id: new Types.ObjectId(_id) };
      const nameFilter: any = {};
      if (query.name) {
        nameFilter.$or = [
          { "userData.name": { $regex: query.name, $options: 'i' } },
          { "userData.email": query.name },
        ];
      }

      // Build the pipeline
      const pipeline: any[] = [
        { $match: match },
        { $unwind: "$students" },
        { $match: { "students.studentId": { $exists: true, $ne: null } } },
        {
          $lookup: {
            from: 'users',
            let: { uId: '$students.studentId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$uId'] } } },
              { $project: { _id: 1, name: 1, roles: 1, avatar: 1, avatarSM: 1, avatarMD: 1, email: "$userId" } },
            ],
            as: 'userData'
          }
        },
        {
          $project: {
            _id: 1,
            studentId: "$students.studentId",
            userData: 1,
          }
        },
        { $unwind: "$userData" },
        { $match: nameFilter },
        { $sort: { name: 1 } },
      ];

      // Handle count query
      if (query.count) {
        pipeline.push({ $count: 'count' });
        const students = await this.classroomRepository.aggregate(pipeline);
        return { response: students };
      }

      // Handle pagination
      const page = query.page ? query.page : 1;
      const limit = query.limit ? query.limit : 25;
      const skip = (page - 1) * limit;

      pipeline.push({ $skip: skip }, { $limit: limit });

      // Fetch students
      let students: any = await this.classroomRepository.aggregate(pipeline);

      // Filter blocked users
      if (user.blockedUsers && user.blockedUsers.length) {
        students = students.filter(u => !user.blockedUsers.find(bu => bu.equals(u.studentId))).map(e => e.studentId);
      }

      // Handle chat support
      if (query.chatSupport) {
        await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
        const tasks = students.map(async t => {
          t.isOnline = await this.socketClientService.isOnline(instancekey, t.studentId);
          this.socketClientService.joinRoom(instancekey, t.studentId, 'class_' + _id);
        });
        await Promise.all(tasks);
      }

      return { response: students };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async classroomSummaryAttemptedAllClassrooms(request) {
    try {
      const { query, user, instancekey } = request;
      const listUser = await this.studentBus.getUserIdList(request);
      let result: any = {};
      if (!listUser || listUser.length === 0) {
        result = {};
      }
      else {
        let condition = this.conditionSummary(request, true);

        condition['user'] = { $in: listUser };
        condition.isEvaluated = true;

        if (query.interval && query.interval.toString() === '15') {
          condition.createdAt = {
            $gte: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000),
          };
        }

        if (query.practice) {
          const testIds = query.practice.split(',').map((id: string) => new Types.ObjectId(id));
          condition['practicesetId'] = { $in: testIds };
          result = await this.classroomSummaryAttempted(request, condition);
        } else {
          if (user.roles.includes('teacher')) {
            condition['createdBy.user'] = new Types.ObjectId(user._id);
          }

          if (query.mymentee) {
            result = await this.classroomSummaryAttempted(request, condition);
          } else if (!query.classroom) {
            const stuArr = await this.getClassroomId(request);
            condition['practiceSetInfo.classRooms'] = { $in: stuArr };
            result = await this.classroomSummaryAttempted(request, condition);
          } else {
            let practiceIds: Types.ObjectId[] = [];

            this.courseRepository.setInstanceKey(instancekey);
            const courses: any = await this.courseRepository.aggregate([
              { $match: { classrooms: new Types.ObjectId(query.classroom) } },
              { $project: { _id: 1, sections: 1 } },
            ]);

            for (const course of courses) {
              const secs = course.sections.filter((s: any) => s.active && s.status === 'published');
              secs.forEach((sec: any) => {
                const contents = sec.contents.filter((c: any) => c.type === 'quiz' || c.type === 'assessment');
                contents.forEach((c: any) => {
                  if (c.source) {
                    practiceIds.push(c.source);
                  }
                });
              });
            }

            this.testSeriesRepository.setInstanceKey(instancekey);
            const testseries = await this.testSeriesRepository.aggregate([
              { $match: { classrooms: new Types.ObjectId(query.classroom) } },
              { $project: { _id: 1, practiceIds: 1 } },
            ]);

            for (const test of testseries) {
              practiceIds = practiceIds.concat(test.practiceIds);
            }

            condition['$or'] = [
              { 'practiceSetInfo.classRooms': new Types.ObjectId(query.classroom) },
              { practicesetId: { $in: practiceIds } },
            ];
            result = await this.classroomSummaryAttempted(request, condition);
          }
        }
      }

      return result;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findByClassRoom(request: FindMeReq) {
    try {
      const { query, user, instancekey } = request;
      const conditionExpired = { $gt: new Date() };
      return await this.redisCache.getSetting(request, async (settings: any) => {
        const filter = this.getFilterByTeacher(request);
        const page = query.page ? query.page : 1;
        const limit = query.limit ? query.limit : 20;
        const skip = (page - 1) * limit;
        const roles = config.roles;
        const userRoles = user.roles;

        filter.push({
          $or: [{ expiresOn: conditionExpired }, { expiresOn: null }],
          'testseries.0': { $exists: false },
          'course.0': { $exists: false },
        });
        if (query.subjects) {
          filter.push({ 'subjects._id': new Types.ObjectId(query.subjects) });
        }

        if (userRoles.includes('teacher')) {
          filter.push({ user: new Types.ObjectId(user._id) });
        }

        filter.push({ accessMode: 'invitation' });

        if (userRoles.includes(roles.student)) {
          filter.push({ status: 'published' });
          filter.push({
            $or: [{ initiator: 'teacher' }, { $and: [{ initiator: 'student' }, { user: new Types.ObjectId(user._id) }] }],
          });
        }

        if (!query.classroom) {
          const stuArr = await this.getClassroomId(request);
          filter.push({ classRooms: { $in: stuArr } });
        } else {
          filter.push({ classRooms: new Types.ObjectId(query.classroom) });
          if (userRoles.includes(roles.student)) {
            this.attendanceRepository.setInstanceKey(instancekey);
            const attendances = await this.attendanceRepository.find({
              studentId: new Types.ObjectId(user._id),
              active: true,
              admitted: true,
              classId: new Types.ObjectId(query.classroom),
            });

            const testIds = attendances.map(attendance => attendance.practicesetId);

            filter.push({
              $or: [
                { requireAttendance: { $exists: false } },
                { requireAttendance: false },
                { _id: { $in: testIds } },
              ],
            });
          }
        }
        this.practiceSetRepository.setInstanceKey(instancekey);
        const practiceSets = await this.practiceSetRepository.find(
          { $and: filter }, null, { skip, limit, sort: { 'statusChangedAt': -1 } }
        );
        if (!practiceSets || practiceSets.length === 0) {
          throw new InternalServerErrorException ('Not found.');
        }

        const result = practiceSets.map(oPractice => {
          if (settings.features.universityExam && oPractice.testMode === 'proctored' && userRoles.includes(roles.student)) {
            oPractice.slugfly = slugify(oPractice.subjects[0].name + ' - Proctor Exam', { lower: true });
            oPractice.title = oPractice.subjects[0].name + ' - Proctor Exam';
            oPractice.titleLower = (oPractice.subjects[0].name + ' - Proctor Exam').toLowerCase();
          } else {
            oPractice.slugfly = slugify(oPractice.titleLower, { lower: true });
          }
          return { practice: oPractice, numberQuestions: oPractice.questions.length };
        });

        const count = await this.practiceSetRepository.countDocuments({ $and: filter });

        return { result: result, count: count };
      });

    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async countByClassRoom(request: FindMeReq) {
    try {
      const { query, user, instancekey } = request;
      const conditionExpired = { $gt: new Date() };
      const filter = this.getFilterByTeacher(request);
      const roles = config.roles;
      const userRoles = user.roles;
      const settings = await this.redisCache.getSetting({ instancekey: request.instancekey }, function (settings: any) {
        return settings;
      })
      filter.push({
        $or: [{ expiresOn: conditionExpired }, { expiresOn: null }]
      });

      if (query.subjects) {
        filter.push({ 'subjects._id': new Types.ObjectId(query.subjects) });
      }

      if (settings.isWhiteLabelled) {
        if (userRoles.includes('teacher')) {
          // filter.push({
          //     $or: [{
          //         user: req.user._id
          //     }, {
          //         lastModifiedBy: req.user._id
          //     }]
          // });
        }
      } else {
        if (userRoles.includes('teacher')) {
          filter.push({ user: new Types.ObjectId(user._id) });
        }
      }

      filter.push({ accessMode: 'invitation' });

      if (userRoles.includes(roles.student)) {
        filter.push({ status: 'published' });
        filter.push({
          $or: [{ initiator: 'teacher' }, { $and: [{ initiator: 'student' }, { user: new Types.ObjectId(user._id) }] }],
        });
      }

      if (!query.classroom) {
        const stuArr = await this.getClassroomId(request);
        filter.push({ classRooms: { $in: stuArr } });
      } else {
        filter.push({ classRooms: new Types.ObjectId(query.classroom) });
        if (userRoles.includes(roles.student)) {
          this.attendanceRepository.setInstanceKey(instancekey);
          const attendances = await this.attendanceRepository.find({
            studentId: new Types.ObjectId(user._id),
            active: true,
            admitted: true,
            classId: new Types.ObjectId(query.classroom),
          });

          const testIds = attendances.map(attendance => attendance.practicesetId);

          filter.push({
            $or: [
              { requireAttendance: { $exists: false } },
              { requireAttendance: false },
              { _id: { $in: testIds } },
            ],
          });
        }
      }
      this.practiceSetRepository.setInstanceKey(instancekey);
      const count = await this.practiceSetRepository.countDocuments({ $and: filter });

      return { count: count };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async listSubjectStudentDo(request: FindMeReq) {
    try {
      const { query, user } = request;
      const result = await this.redisCache.getSetting(request, async (settings: any) => {

        const listUser = await this.studentBus.getUserIdList(request);

        let result: any = {};
        if (!listUser || listUser.length === 0) {
          result = [];
          return result;
        }

        const condition = this.conditionSummary(request, true);

        condition['user'] = { $in: listUser };
        condition.isEvaluated = true;

        if (query.practice) {
          const testIds = query.practice.split(',').map(id => new Types.ObjectId(id));
          condition["practicesetId"] = { $in: testIds };
          result = await this.getListSubjects(request, condition);
        } else {
          if (settings.isWhiteLabelled) {
            if (user.roles.includes('teacher')) {
              condition['practiceSetInfo.accessMode'] = 'invitation';
            }
          } else {
            if (user.roles.includes('teacher')) {
              condition['practiceSetInfo.accessMode'] = 'invitation';
              condition['createdBy.user'] = new Types.ObjectId(user._id);
            }
          }

          if (query.mymentee) {
            result = await this.getListSubjects(request, condition);
          } else if (!query.classroom) {
            const stuArr = await this.getClassroomId(request);
            condition['practiceSetInfo.classRooms'] = { $in: stuArr.map(id => new Types.ObjectId(id)) };
            result = await this.getListSubjects(request, condition);
          } else {
            condition['practiceSetInfo.classRooms'] = { $in: [new Types.ObjectId(query.classroom)] };
            result = await this.getListSubjects(request, condition);
          }
        }
        return result;
      });

      return { results: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async classroomSummaryQuestionBySubject(request: FindMeReq) {
    try {
      const { query, user } = request;
      const listUser = await this.studentBus.getUserIdList(request);
      let result: any = {};

      if (!listUser || listUser.length === 0) {
        result = {};
        return result;
      }

      const condition = this.conditionSummary(request, true);

      condition['user'] = { $in: listUser };
      condition.isEvaluated = true;

      if (query.practice) {
        const testIds = query.practice.split(',').map(id => new Types.ObjectId(id));
        condition["practicesetId"] = { $in: testIds };
        result = await this.summaryQuestionBySubject(request, condition);
      } else if (user.roles.includes('teacher')) {
        condition['createdBy.user'] = new Types.ObjectId(user._id);
      }

      if (query.mymentee) {
        result = await this.summaryQuestionBySubject(request, condition);
      } else if (!query.classroom) {
        const stuArr = await this.getClassroomId(request);
        condition['practiceSetInfo.classRooms'] = { $in: stuArr.map(id => new Types.ObjectId(id)) };
        result = await this.summaryQuestionBySubject(request, condition);
      } else {
        condition['practiceSetInfo.classRooms'] = { $in: [new Types.ObjectId(query.classroom)] };
        result = await this.summaryQuestionBySubject(request, condition);
      }
      return { results: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async classroomListTopicStudentDo(request: FindMeReq) {
    try {
      const { query, user } = request;
      const listUser = await this.studentBus.getUserIdList(request);

      let result: any = {};
      if (!listUser || listUser.length === 0) {
        result = {};
        return result;
      }

      const condition = this.conditionSummary(request, true);

      condition['user'] = { $in: listUser };
      condition.isEvaluated = true;

      if (query.practice) {
        const testIds = query.practice.split(',').map(id => new Types.ObjectId(id));
        condition["practicesetId"] = { $in: testIds };
        result = await this.getListTopic(request, condition);
      } else if (user.roles.includes('teacher')) {
        condition['createdBy.user'] = new Types.ObjectId(user._id);
      }

      if (query.mymentee) {
        result = await this.getListTopic(request, condition);
      } else if (!query.classroom) {
        const stuArr = await this.getClassroomId(request);
        condition['practiceSetInfo.classRooms'] = { $in: stuArr.map(id => new Types.ObjectId(id)) };
        result = await this.getListTopic(request, condition);
      } else {
        condition['practiceSetInfo.classRooms'] = { $in: [new Types.ObjectId(query.classroom)] };
        result = await this.getListTopic(request, condition);
      }

      return { results: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async classroomSummaryQuestionByTopic(request: FindMeReq) {
    try {
      const { query, user, instancekey } = request;
      const result = await this.redisCache.getSetting(request, async (settings: any) => {
        const listUser = await this.studentBus.getUserIdList(request);

        let result: any = {};
        if (!listUser || listUser.length === 0) {
          result = {};
          return result;
        }

        const condition = this.conditionSummary(request, true);

        condition['user'] = { $in: listUser };
        condition.isEvaluated = true;

        if (query.practice) {
          const testIds = query.practice.split(',').map(id => new Types.ObjectId(id));
          condition["practicesetId"] = { $in: testIds };
          result = await this.summaryQuestionByTopic(request, condition);
        } else if (user.roles.includes('teacher')) {
          condition['createdBy.user'] = new Types.ObjectId(user._id);
        }

        if (query.mymentee) {
          result = await this.summaryQuestionByTopic(request, condition);
        } else if (!query.classroom) {
          const stuArr = await this.getClassroomId(request);
          condition['practiceSetInfo.classRooms'] = { $in: stuArr.map(id => new Types.ObjectId(id)) };
          result = await this.summaryQuestionByTopic(request, condition);
        } else {
          condition['practiceSetInfo.classRooms'] = { $in: [new Types.ObjectId(query.classroom)] };
          result = await this.summaryQuestionByTopic(request, condition);
        }
        return result;
      });

      return { results: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async classroomSummaryCorrectByDate(request: FindMeReq) {
    try {
      const { query, user, instancekey } = request;
      const result = await this.redisCache.getSetting(request, async (settings: any) => {
        const listUser = await this.studentBus.getUserIdList(request);

        let result: any = {};
        if (!listUser || listUser.length === 0) {
          result = {};
          return result;
        }

        const condition = this.conditionSummary(request, true);

        condition['user'] = { $in: listUser };
        condition.isEvaluated = true;

        if (query.practice) {
          const testIds = query.practice.split(',').map(id => new Types.ObjectId(id));
          condition["practicesetId"] = { $in: testIds };
          result = await this.summaryCorrectByDate(request, condition);
        } else if (user.roles.includes('teacher')) {
          condition['createdBy.user'] = new Types.ObjectId(user._id);
        }

        if (query.mymentee) {
          result = await this.summaryCorrectByDate(request, condition);
        } else if (!query.classroom) {
          const stuArr = await this.getClassroomId(request);
          condition['practiceSetInfo.classRooms'] = { $in: stuArr.map(id => new Types.ObjectId(id)) };
          result = await this.summaryCorrectByDate(request, condition);
        } else {
          condition['practiceSetInfo.classRooms'] = { $in: [new Types.ObjectId(query.classroom)] };
          result = await this.summaryCorrectByDate(request, condition);
        }

        return result;
      });

      return { results: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async classroomSummaryCorrect(request: ClassroomSummaryCorrectReq) {
    try {
      const { query, instancekey } = request;
      const REPORT_API_URL = config.reportApi;
      let url = `${REPORT_API_URL}leaderboard?classId=${query.classroom}`;

      if (query.subjects) {
        url += `&subject=${query.subjects}`;
      }

      if (query.practice) {
        url += `&practice=${query.practice}`;
      }

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'instancekey': instancekey
          }
        }).pipe(
          catchError((error: AxiosError) => {
            Logger.error(`Request failed with status code ${error.response?.status}`);
            Logger.error(`Error data: ${JSON.stringify(error.response?.data)}`);
            throw new InternalServerErrorException (`Failed to fetch data from report API: ${JSON.stringify(error.response?.data)}`);
          })
        )
      );

      return { data: response.data };
    } catch (error) {
      return { data: [] }
    }
  }

  async getClassRoomByLocation(request: FindMeReq) {
    try {
      const { query, instancekey, user } = request;
      if (query.locationsIds) {
        const locationIds = query.locationsIds.split(',');
        const conditions: any = {
          location: { $in: locationIds.map(l => new ObjectId(l)) },
          active: true,
          allowDelete: true,
          userRole: { $ne: 'student' },
        };

        const allowedRoles = ['admin', 'director', 'operator', 'publisher'];
        const isAuthorized = user.roles.some(role => allowedRoles.includes(role));
        if (!isAuthorized) {
          conditions.$or = [
            { owners: new ObjectId(user._id) },
            { user: new ObjectId(user._id) },
          ];
        }

        this.classroomRepository.setInstanceKey(instancekey);
        const classrooms = await this.classroomRepository.find(conditions);

        return { response: classrooms };
      }
      return { message: "No classroom found." }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getClassroomLeaderBoard(request: ClassroomSummaryCorrectReq) {
    try {
      const { query, instancekey } = request;
      const REPORT_API_URL = config.reportApi;
      let url = `${REPORT_API_URL}leaderboard?classId=${query.classroom}`;

      if (query.subjects) {
        url += `&subject=${query.subjects}`;
      }

      if (query.practice) {
        url += `&practice=${query.practice}`;
      }

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'instanceKey': instancekey
          }
        }).pipe(
          catchError((error: AxiosError) => {
            Logger.error(`Request failed with status code ${error.response?.status}`);
            Logger.error(`Error data: ${JSON.stringify(error.response?.data)}`);
            throw new InternalServerErrorException (`Failed to fetch data from report API: ${JSON.stringify(error.response?.data)}`);
          })
        )
      );

      if (response.data) {
        const data = response.data.data || [];
        this.usersRepository.setInstanceKey(instancekey);
        for (const item of data) {
          item.user = await this.usersRepository.findOne(
            { userId: item.userId },
            { name: 1, role: 1, avatar: 1, avatarSM: 1, avatarMD: 1, provider: 1, google: 1, facebook: 1 }
          );
        }
        return { response: data };
      } else {
        Logger.debug('%j', response.data);
        return { response: [] };
      }
    } catch (error) {
      return { response: [] };
    }
  }

  async getFiles(request: GetAllStudentsReq) {
    try {
      const { _id, instancekey } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const filesIds = await this.classroomRepository.distinct('folder', { _id: _id });

      if (filesIds.length > 0) {
        this.fileRepository.setInstanceKey(instancekey);
        const files = await this.fileRepository.find(
          { _id: { $in: filesIds } }, null, null, [{ path: 'ownerId', select: 'name', options: { lean: true } }]
        );

        return { files: files };
      } else {
        return { message: 'No Files Found' };
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getClassroomByUserLocation(request: FindMeReq) {
    try {
      const { query, instancekey, user } = request;
      if (user.locations.length > 0) {
        const conditions = {
          location: new Types.ObjectId(user.activeLocation),
          active: true,
        };

        this.classroomRepository.setInstanceKey(instancekey);
        const classrooms = await this.classroomRepository.find(conditions, { _id: 1, name: 1 });

        if (query.course) {
          this.courseRepository.setInstanceKey(instancekey);
          const data = await Promise.all(
            classrooms.map(async (element) => {
              const tagged = await this.courseRepository.findOne({ classrooms: element._id });
              if (!tagged) {
                return element;
              }
              return null;
            })
          );
          const noTaggedCls = data.filter(cls => cls !== null);

          return { response: noTaggedCls };
        } else {
          return { response: classrooms };
        }
      } else {
        return { message: "No classroom found." }
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getStudents(request: GetStudentsReq) {
    try {
      const { _id, query, instancekey, timezoneoffset } = request;
      const limit = query.limit || 20;
      const skip = ((query.page || 1) - 1) * limit;
      const start = timeHelper.getStartOfToday(timezoneoffset);

      const facet = { students: [] };
      const pipe: mongoose.PipelineStage[] = [
        { $match: { _id: new Types.ObjectId(_id) } },
        { $unwind: '$students' },
        { $match: { 'students.studentId': { $ne: null } } }
      ];

      pipe.push({
        $group: {
          _id: "$students.studentId"
        }
      });

      if (query.search) {

        const regex = (query: string) => new RegExp(query, 'i');
        pipe.push({
          $lookup: {
            from: 'users',
            let: { uId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$uId'] },
                  $or: [
                    { name: { $regex: regex(query.search as string) } },
                    { userId: { $regex: regex(query.search as string) } },
                    { rollNumber: { $regex: regex(query.search as string) } }
                  ]
                }
              },
              { $project: { _id: 1, name: 1, rollNumber: 1 } }
            ],
            as: 'studentData'
          }
        }, {
          $unwind: '$studentData'
        });

        if (query.ongoingTest) {
          pipe.push({
            $lookup: {
              from: 'attempts',
              let: { uId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$user', '$$uId'] },
                    practicesetId: new Types.ObjectId(query.ongoingTest as string),
                    ongoing: true
                  }
                },
                { $project: { _id: 1, updatedAt: 1 } }
              ],
              as: 'attemptData'
            }
          }, {
            $unwind: { path: '$attemptData', preserveNullAndEmptyArrays: true }
          }, {
            $sort: { 'attemptData.updatedAt': -1, 'studentData.name': 1 }
          });
        }

        facet.students.push(
          { $skip: skip },
          { $limit: limit },
          { $project: { _id: 1, name: '$studentData.name', rollNumber: '$studentData.rollNumber' } }
        );

        if (query.includeCount) {
          facet['total'] = [{ $count: 'total' }];
        }
      } else {
        if (query.ongoingTest) {
          pipe.push({
            $lookup: {
              from: 'attempts',
              let: { uId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$user', '$$uId'] },
                    practicesetId: new Types.ObjectId(query.ongoingTest as string),
                    ongoing: true,
                    createdAt: { $gte: start }
                  }
                },
                { $project: { _id: 1, updatedAt: 1 } }
              ],
              as: 'attemptData'
            }
          }, {
            $unwind: { path: '$attemptData', preserveNullAndEmptyArrays: true }
          }, {
            $sort: { 'attemptData.updatedAt': -1, 'studentData.name': 1 }
          });
        }

        facet.students.push(
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              let: { uId: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$uId'] } } },
                { $project: { _id: 1, name: 1, rollNumber: 1 } }
              ],
              as: 'studentData'
            }
          }, {
          $unwind: '$studentData'
        }, {
          $project: { _id: 1, name: '$studentData.name', rollNumber: '$studentData.rollNumber' }
        });

        if (query.includeCount) {
          facet['total'] = [{ $count: 'total' }];
        }
      }

      pipe.push({ $facet: facet });

      this.classroomRepository.setInstanceKey(instancekey);
      const results: any = await this.classroomRepository.aggregate(pipe);

      if (!results[0]) {
        return { message: "No student found." }
      }

      const result = results[0];
      if (result.total) {
        result.total = result.total[0] ? result.total[0].total : 0;
      }
      return result;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findSubjectAccuracyAndSpeed(request: FindMeReq) {
    try {
      const { query, user, instancekey } = request;
      const listUser = await this.studentBus.getUserIdList(request);

      let result: any = {};
      if (!listUser || listUser.length === 0) {
        return { message: 'No user found.' };
      }
      const filter = {};
      const condition = this.conditionSummary(request, true);

      condition['user'] = { $in: listUser };
      condition.isEvaluated = true;

      if (query.practice) {
        const testIds = query.practice.split(',').map(id => new Types.ObjectId(id));
        condition["practicesetId"] = { $in: testIds };
        if (query.subjects) {
          filter['QA.subject._id'] = new Types.ObjectId(query.subjects);
          result = await this.topicAccuracyAndSpeed(instancekey, condition, filter)
        } else {
          result = await this.subjectAccuracyAndSpeed(instancekey, condition);
        }
      } else {
        if (user.roles.includes('teacher')) {
          condition['createdBy.user'] = new Types.ObjectId(user._id);
        }

        if (query.mymentee) {
          if (query.subjects) {
            filter['QA.subject._id'] = new Types.ObjectId(query.subjects);
            result = await this.topicAccuracyAndSpeed(instancekey, condition, filter);
          } else {
            result = await this.subjectAccuracyAndSpeed(instancekey, condition);
          }
        } else if (!query.classroom) {
          const stuArr = await this.getClassroomId(request);
          condition['practiceSetInfo.classRooms'] = { $in: stuArr.map(id => new Types.ObjectId(id)) };
          if (query.subjects) {
            filter['QA.subject._id'] = new Types.ObjectId(query.subjects);
            result = await this.topicAccuracyAndSpeed(instancekey, condition, filter);
          } else {
            result = await this.subjectAccuracyAndSpeed(instancekey, condition);
          }
        } else {
          condition['practiceSetInfo.classRooms'] = { $in: [new Types.ObjectId(query.classroom)] };
          if (query.subjects) {
            filter['QA.subject._id'] = new Types.ObjectId(query.subjects);
            result = await this.topicAccuracyAndSpeed(instancekey, condition, filter);
          } else {
            result = await this.subjectAccuracyAndSpeed(instancekey, condition);
          }
        }

      }

      return { subjects: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getStreamingUrlAndStatus(request: GetAllStudentsReq) {
    try {
      const { _id, instancekey } = request;
      this.usersRepository.setInstanceKey(instancekey);

      const userId = new Types.ObjectId(_id);
      const pipeline = [
        {
          $match: {
            _id: userId,
          },
        },
        {
          $project: {
            _id: 0,
            email: 1,
            phoneNumber: 1,
          },
        },
        {
          $lookup: {
            from: 'students',
            localField: 'email',
            foreignField: 'email',
            as: 'student',
          },
        },
        {
          $unwind: {
            path: '$student',
          },
        },
        {
          $project: {
            classRoom: '$student.classRoom',
          },
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'classRoom',
            foreignField: '_id',
            as: 'classroomDet',
          },
        },
        {
          $unwind: {
            path: '$classroomDet',
          },
        },
        {
          $project: {
            stream: '$classroomDet.stream',
            user: '$classroomDet.user',
          },
        },
      ];

      const pipeline2 = [
        {
          $match: {
            _id: userId,
          },
        },
        {
          $project: {
            _id: 0,
            email: 1,
            phoneNumber: 1,
          },
        },
        {
          $lookup: {
            from: 'students',
            localField: 'phoneNumber',
            foreignField: 'studentUserId',
            as: 'studet',
          },
        },
        {
          $unwind: {
            path: '$studet',
          },
        },
        {
          $project: {
            classRoom: '$studet.classRoom',
          },
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'classRoom',
            foreignField: '_id',
            as: 'classroomDet',
          },
        },
        {
          $unwind: {
            path: '$classroomDet',
          },
        },
        {
          $project: {
            stream: '$classroomDet.stream',
            user: '$classroomDet.user',
          },
        },
      ];

      const res1: any = await this.usersRepository.aggregate(pipeline);

      if (res1.length > 0) {
        let userIds = res1.filter(r => r.stream).map(r => r.user);
        if (userIds.length > 0) {
          userIds = userIds.map(id => new Types.ObjectId(id));
          const users = await this.usersRepository.find(
            {
              _id: { $in: userIds },
            },
            { streamUrl: 1, _id: 0 },
            { lean: true },
          );
          return users.map(user => ({
            stream: true,
            streamUrl: user.streamUrl,
          }));
        }
        const result = [{ stream: false, streamUrl: '' }]
        return { results: result };
      } else {
        const res2: any = await this.usersRepository.aggregate(pipeline);
        if (res2.length > 0) {
          let userIds = res2.filter(r => r.stream).map(r => r.user);
          if (userIds.length > 0) {
            userIds = userIds.map(id => new Types.ObjectId(id));
            const users = await this.usersRepository.find(
              {
                _id: { $in: userIds },
              },
              { streamUrl: 1, _id: 0 },
              { lean: true },
            );
            return users.map(user => ({
              stream: true,
              streamUrl: user.streamUrl,
            }));
          }
          const result = [{ stream: false, streamUrl: '' }]
          return { results: result };
        } else {
          const res3: any = await this.usersRepository.aggregate(pipeline2);
          if (res3.length > 0) {
            let userIds = res3.filter(r => r.stream).map(r => r.user);
            if (userIds.length > 0) {
              userIds = userIds.map(id => new Types.ObjectId(id));
              const users = await this.usersRepository.find(
                {
                  _id: { $in: userIds },
                },
                { streamUrl: 1, _id: 0 },
                { lean: true },
              );
              return users.map(user => ({
                stream: true,
                streamUrl: user.streamUrl,
              }));
            }
            const result = [{ stream: false, streamUrl: '' }]
            return { results: result };
          } else {
            const result = [{ stream: false, streamUrl: '' }]
            return { results: result };
          }
        }
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getAttendants(request: GetStudentsReq) {
    try {
      const { _id, query, instancekey, timezoneoffset, user } = request;

      const condition = {
        _id: new Types.ObjectId(_id),
        $or: [
          { active: { $exists: false } },
          { active: true },
        ],
      };

      const pipe: any[] = [
        { $match: condition },
        { $unwind: '$students' },
        {
          $lookup: {
            from: 'users',
            localField: 'students.studentId',
            foreignField: '_id',
            as: 'user_doc',
          },
        },
        { $unwind: '$user_doc' },
      ];

      if (query.name && query.name !== '') {
        pipe.push({
          $match: {
            'user_doc.name': {
              $regex: query.name,
              $options: 'i',
            },
          },
        });
      }

      const page = query.page ? query.page : 1;
      const limit = query.limit ? query.limit : 20;
      const skip = (page - 1) * limit;

      pipe.push(
        { $sort: { 'students.createdAt': -1 } },
        {
          $project: {
            className: '$name',
            user: '$students.studentId',
            name: '$user_doc.name',
            userId: '$user_doc.userId',
            rollNumber: '$user_doc.rollNumber',
          },
        },
        { $skip: skip },
        { $limit: limit },
      );

      this.classroomRepository.setInstanceKey(instancekey);
      const students: any = await this.classroomRepository.aggregate(pipe);

      if (students.length === 0) {
        return { message: 'No students found' };
      }

      let mToday = new Date();
      if (timezoneoffset) {
        const offset = parseInt(timezoneoffset, 10);
        if (!isNaN(offset)) {
          mToday = new Date(mToday.getTime() - 60 * 1000 * offset);
        }
      }
      mToday.setHours(0, 0, 0, 0);

      const stdIDs = students.map((s) => s.user);

      this.attendanceRepository.setInstanceKey(instancekey);
      const atts = await this.attendanceRepository.find({
        type: 'classroom',
        classId: new Types.ObjectId(_id),
        teacherId: new Types.ObjectId(user._id),
        studentId: { $in: stdIDs },
        active: true,
        createdAt: { $gte: mToday },
      });

      for (let i = 0; i < students.length; i++) {
        let s = students[i];

        let foundAtt = atts.find((a) => a.studentId.equals(s.user));
        if (!foundAtt) {
          foundAtt = await this.attendanceRepository.create({
            classId: new Types.ObjectId(_id),
            className: s.className,
            teacherId: new Types.ObjectId(user._id),
            studentId: s.user,
            name: s.name,
            studentUserId: s.userId,
            admitted: false,
            status: "absent",
            createdAt: new Date(),
            updatedAt: new Date(),
            type: "classroom",
          });
        }
        s.attendantId = foundAtt._id;
        s.status = foundAtt.status;
        s.admitted = foundAtt.admitted;
        s.updatedAt = foundAtt.updatedAt;
      }

      return { students: students };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async countAttendants(request: GetClassroomStudentsReq) {
    try {
      const { _id, query, instancekey } = request;

      const condition = { _id: new Types.ObjectId(_id), active: true };

      const pipe: any[] = [
        { $match: condition },
        { $unwind: '$students' },
        { $match: { 'students.studentId': { $exists: true } } }
      ];

      if (query.name && query.name !== '') {
        pipe.push(
          {
            $lookup: {
              from: "users",
              localField: "students.studentId",
              foreignField: "_id",
              as: "user_doc",
            },
          },
          { $unwind: '$user_doc' },
          {
            $match: {
              'user_doc.name': {
                "$regex": query.name,
                "$options": "i",
              },
            },
          }
        );
      }

      pipe.push({ $count: 'count' });

      this.classroomRepository.setInstanceKey(instancekey);
      const result = await this.classroomRepository.aggregate(pipe);
      return result[0] || { count: 0 };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findStudent(request: FindByIdReq) {
    try {
      const { _id, query, user, instancekey } = request;
      const oStudent: any = {};

      const filter: any[] = [
        { user: new Types.ObjectId(user._id) },
        { 'students.studentId': new Types.ObjectId(_id) },
      ];

      if (query.isMentee) {
        filter.push({
          $or: [
            { slugfly: 'my-mentees' },
            { nameLower: 'my mentees' },
          ],
        });
      } else if (query.isMyCircle) {
        filter.push({
          $or: [
            { slugfly: 'group-study' },
            { nameLower: 'group study' },
          ],
        });
      }

      this.classroomRepository.setInstanceKey(instancekey);
      const classRoom = await this.classroomRepository.findOne({ $and: filter });
      if (classRoom) {
        oStudent.classObject = classRoom;
      }

      this.usersRepository.setInstanceKey(instancekey);
      const userData = await this.usersRepository.findById(_id);
      if (userData) {
        oStudent.user = userData;
      }

      return oStudent;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getAllAssignments(request: GetAllStudentsReq) {
    try {
      const { _id, instancekey } = request;
      this.classroomRepository.setInstanceKey(instancekey);
      const assignments = await this.classroomRepository.find({ _id: _id }, '_id assignments');

      if (!assignments) {
        throw new InternalServerErrorException ('Assignments not found');
      }

      const data = assignments[0].assignments.filter(assignment => assignment.status === 'published');

      return data.length > 0 ? { assignments: data } : { assignments: [] };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async recentEvaluatedAssignment(request: FindMeReq) {
    try {
      const { query, instancekey } = request;
      const filter = { _id: query.classroom };
      const result = [];

      this.classroomRepository.setInstanceKey(instancekey);
      const classrooms = await this.classroomRepository.find(filter, 'students assignments user');

      if (!classrooms || classrooms.length === 0) {
        return { results: [] };
      }

      const classroom = classrooms[0];

      for (const assignment of classroom.assignments) {
        const totalSub = classroom.students.length;
        let sub = 0;

        if (assignment.status === 'published') {
          if (classroom.students.length > 0) {
            classroom.students.forEach(student => {
              if (student['assignments']) {
                student.assignments.forEach(a => {
                  if (a.evaluated) {
                    sub++;
                  }
                });
              }
            });
          }

          if (assignment._id && sub === totalSub) {
            result.push({
              assignment: assignment,
              total: totalSub,
              evaluated: sub,
            });
          }
        }
      }

      return { results: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getAllAssignmentByCount(request: GetAllAssignmentByCountReq) {
    try {
      const { classroom, assignment, instancekey } = request;
      this.classroomRepository.setInstanceKey(instancekey);

      const filter: any = {};
      const aggregatePipeline = [];

      if (classroom && !assignment) {
        aggregatePipeline.push(
          { "$match": { "_id": new Types.ObjectId(classroom) } },
          { $project: { students: 1, "totalStud": { $size: "$students" } } },
          { "$unwind": "$students" },
          {
            "$project": {
              totalStud: 1,
              "ass": "$students.assignments",
              "stu": "$students.studentId"
            }
          },
          { "$unwind": "$ass" },
          {
            "$project": {
              "ass": 1,
              "assIds": "$ass._id",
              "evaluated": "$ass.evaluated",
              "stu": 1,
              totalStud: 1,
            }
          },
          {
            "$group": {
              "_id": { "assIds": "$assIds" },
              "eva": {
                "$sum": {
                  "$cond": [{ "$eq": ["$evaluated", true] }, 1, 0]
                }
              },
              "count": { "$sum": 1 },
              "ass": { $first: "$ass" },
              totalStud: { $first: "$totalStud" }
            }
          },
          {
            "$project": {
              "assignment": "$ass",
              "totalStud": 1,
              "totalAttempted": "$count",
              "eva": "$eva",
              "evaluated": {
                $multiply: [{ $divide: ["$eva", "$count"] }, 100]
              },
              "notEvaluated": {
                $multiply: [{ $divide: [{ $subtract: ["$count", "$eva"] }, "$count"] }, 100]
              },
              _id: 0
            }
          },
        );
      } else if (classroom && assignment) {
        aggregatePipeline.push(
          { "$match": { "_id": new Types.ObjectId(classroom) } },
          { $project: { students: 1, "totalStud": { $size: "$students" } } },
          { "$unwind": "$students" },
          {
            "$project": {
              totalStud: 1,
              "ass": "$students.assignments",
              "stu": "$students.studentId"
            }
          },
          { "$unwind": "$ass" },
          {
            "$project": {
              "ass": 1,
              "assIds": "$ass._id",
              "evaluated": "$ass.evaluated",
              "stu": 1,
              totalStud: 1,
            }
          },
          { "$match": { "assIds": new Types.ObjectId(assignment) } },
          {
            "$group": {
              "_id": { "assIds": "$assIds" },
              "eva": {
                "$sum": {
                  "$cond": [{ "$eq": ["$evaluated", true] }, 1, 0]
                }
              },
              "count": { "$sum": 1 },
              "ass": { $first: "$ass" },
              totalStud: { $first: "$totalStud" }
            }
          },
          {
            "$project": {
              "assignment": "$ass",
              "totalStud": 1,
              "totalAttempted": "$count",
              "eva": "$eva",
              "evaluated": {
                $multiply: [{ $divide: ["$eva", "$count"] }, 100]
              },
              "notEvaluated": {
                $multiply: [{ $divide: [{ $subtract: ["$count", "$eva"] }, "$count"] }, 100]
              },
              _id: 0
            }
          },
        );
      } else {
        return { error: 'No Assignment Found' };
      }

      const data = await this.classroomRepository.aggregate(aggregatePipeline);

      return { data: data };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getAssignmentById(request: GetAllAssignmentByCountReq) {
    try {
      const { classroom, assignment, teacher, instancekey } = request;
      if (!classroom && !assignment) {
        Logger.warn('No Assignment Found');
        return { status: 422, error: 'No Assignment Found' };
      }

      this.classroomRepository.setInstanceKey(instancekey);
      const classroomData: any = await this.classroomRepository.findById(classroom);

      if (!classroomData) {
        Logger.warn('No Assignment Found');
        return { status: 422, error: 'No Assignment Found' };
      }

      const totalSub = classroomData.students.length;
      let sub = 0;
      const studentSub = [];

      this.usersRepository.setInstanceKey(instancekey);
      for (const student of classroomData.students) {
        if (student.assignments) {
          for (const studentAssignment of student.assignments) {
            if (studentAssignment._id.toString() === assignment.toString()) {
              sub++;
              if (teacher) {
                const user = await this.usersRepository.findById(student.studentId);
                studentSub.push({
                  assignment: studentAssignment,
                  student: user,
                });
              }
            }
          }
        }
      }

      const clsUser = await this.usersRepository.findById(classroomData.user);
      if (classroomData.assignments) {
        for (const clsAssignment of classroomData.assignments) {
          if (clsAssignment._id && clsAssignment._id.toString() === assignment.toString()) {
            const dataRes = {
              status: 200,
              data: {
                assignment: clsAssignment,
                total: totalSub,
                submitted: sub,
                createdBy: clsUser,
                studSub: studentSub,
              }
            };
            return dataRes;
          }
        }
      }

      Logger.warn('No Assignment Found');
      return { status: 422, error: 'No Assignment Found' };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async updateStudentAssignment(request: UpdateStudentAssignmentReq) {
    try {
      const { classroom, assignment, title, answerText, attachments, user, instancekey } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const assign = await this.classroomRepository.findById(classroom, { assignments: 1 });

      let ass = null;
      for (let i = 0; i < assign.assignments.length; i++) {
        if (assign.assignments[i]._id.toString() === assignment.toString()) {
          ass = assign.assignments[i];
          break;
        }
      }

      if (!ass) {
        Logger.warn('No assignment Found');
        return { status: 422, error: 'No assignment Found' };
      }

      const newAssignment = {
        _id: new Types.ObjectId(assignment),
        title: ass.title,
        ansTitle: title,
        answerText: answerText,
        attachments: attachments,
        totalMark: 0,
        maximumMarks: ass.maximumMarks,
        dueDate: ass.dueDate,
      };

      const updateResult = await this.classroomRepository.updateOne(
        { _id: classroom },
        { $push: { "students.$[element].assignments": newAssignment } },
        { arrayFilters: [{ "element.studentId": { "$eq": user._id } }] }
      );

      if (!updateResult) {
        return { status: 422, error: 'Update failed' };
      }

      return { status: 200, classroom: updateResult };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getUserAssignment(request: GetUserAssignmentReq) {
    try {
      const { query, instancekey } = request;

      if (!query.classroom || !query.assignment || !query.student) {
        throw new Error('Missing required parameters');
      }

      this.classroomRepository.setInstanceKey(instancekey);
      const assign: any = await this.classroomRepository.aggregate([
        { $match: { _id: new Types.ObjectId(query.classroom) } },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'u',
          },
        },
        {
          $project: {
            createdby: '$u.name',
            students: '$students',
          },
        },
        { $unwind: '$students' },
        {
          $match: {
            'students.studentId': new Types.ObjectId(query.student),
          },
        },
        {
          $project: {
            students: '$students',
            createdby: 1,
          },
        },
        { $unwind: '$students.assignments' },
        {
          $match: {
            'students.assignments._id': new Types.ObjectId(query.assignment),
          },
        },
      ]);

      if (assign.length === 0) {
        return { status: 422, error: 'No Assignment Found' };
      }

      const assignmentData = assign[0];
      if (assignmentData.students.assignments.feedback?.user) {
        const feedbackUser = new Types.ObjectId(assignmentData.students.assignments.feedback.user);
        this.usersRepository.setInstanceKey(instancekey);
        const user = await this.usersRepository.findById(feedbackUser, { name: 1 });
        return {
          status: 200, data: { assignment: assignmentData.students.assignments, user: user.name },
        };
      } else {
        return {
          status: 200, data: { assignment: assignmentData.students.assignments },
        };
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async assignAssignmentMarks(request: AssignAssignmentMarksReq) {
    try {
      const { classroom, assignment, student, totalMark, feedback, instancekey } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const assign = await this.classroomRepository.findById(classroom, { assignments: 1 });
      let ass = null;

      if (!assign) {
        Logger.warn('No assignment found');
        return { status: 422, error: 'No assignment found' };
      }

      for (let i = 0; i < assign.assignments.length; i++) {
        if (assign.assignments[i]._id.toString() === assignment.toString()) {
          ass = assign.assignments[i];
          break;
        }
      }

      if (!ass) {
        Logger.warn('No assignment found');
        return { status: 422, error: 'No assignment found' };
      }

      const updatePayload = {
        "students.$.assignments.$[index].totalMark": totalMark,
        "students.$.assignments.$[index].evaluated": true,
      };

      if (feedback) {
        updatePayload["students.$.assignments.$[index].feedback"] = {
          user: new Types.ObjectId(feedback.user),
          text: feedback.text,
        };
      }

      const updateResult = await this.classroomRepository.updateOne(
        {
          _id: classroom,
          "students.studentId": { $in: [new Types.ObjectId(student)] },
        },
        {
          $set: updatePayload,
        },
        { arrayFilters: [{ "index._id": { $eq: new Types.ObjectId(assignment) } }] }
      );

      if (!updateResult) {
        return { status: 422, error: 'Update failed' };
      }

      return { status: 200, _id: updateResult._id };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getAllUserAssignment(request: DeleteClassroomReq) {
    try {
      const { _id, user, instancekey } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const assignments: any = await this.classroomRepository.aggregate([
        { $match: { _id: new Types.ObjectId(_id) } },
        { $unwind: "$students" },
        {
          $match: {
            "students.studentId": new Types.ObjectId(user._id),
          }
        },
        {
          $project: {
            students: "$students"
          }
        }
      ]);

      if (!assignments || assignments.length === 0 || !assignments[0].students) {
        Logger.warn('No assignments found');
        return { status: 422, error: 'No assignments found' };
      }

      return { assignment: assignments[0].students.assignments };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async createAssignment(request: CreateAssignmentReq) {
    try {
      const { _id, assignment, instancekey } = request;
      const newAssignment = {
        ...assignment,
        _id: new Types.ObjectId(),
        dueDate: new Date(assignment.dueDate),
        createdAt: new Date(),
      };

      this.classroomRepository.setInstanceKey(instancekey);
      const updatedClassroom = await this.classroomRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(_id) },
        { $push: { assignments: newAssignment } },
        { new: true }
      );

      if (!updatedClassroom) {
        return { status: 422, error: "Failed to create Assignment." };
      }

      return { status: 200, classroom: updatedClassroom };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getTeacherAssignments(request: GetTeacherAssignmentsReq) {
    try {
      const { _id, instancekey, status } = request;
      this.classroomRepository.setInstanceKey(instancekey);

      const assign: any = await this.classroomRepository.aggregate([
        { $match: { _id: new Types.ObjectId(_id) } },
        { $unwind: "$assignments" },
        {
          $match: {
            "assignments.status": status
          }
        },
        {
          $project: {
            assignments: 1,
            totalStud: { $size: "$students" }
          }
        }
      ]);

      if (!assign || assign.length === 0) {
        return { status: 422, error: 'No Assignments found' };
      }

      let getEvaluatedData = [];

      if (status === 'published') {
        getEvaluatedData = await this.classroomRepository.aggregate([
          { $match: { _id: new Types.ObjectId(_id) } },
          {
            $project: {
              students: 1,
              totalStud: { $size: "$students" }
            }
          },
          { $unwind: "$students" },
          {
            $project: {
              totalStud: 1,
              ass: "$students.assignments",
              stu: "$students.studentId"
            }
          },
          { $unwind: "$ass" },
          {
            $project: {
              ass: 1,
              assIds: "$ass._id",
              evaluated: "$ass.evaluated",
              stu: 1,
              totalStud: 1
            }
          },
          {
            $group: {
              _id: { assIds: "$assIds" },
              eva: {
                $sum: {
                  $cond: [{ $eq: ["$evaluated", true] }, 1, 0]
                }
              },
              count: { $sum: 1 },
              ass: { $first: "$ass" },
              totalStud: { $first: "$totalStud" }
            }
          },
          {
            $project: {
              assignment: "$ass._id",
              totalStud: 1,
              totalAttempted: "$count",
              eva: "$eva",
              evaluated: {
                $multiply: [{ $divide: ["$eva", "$count"] }, 100]
              },
              notEvaluated: {
                $multiply: [{ $divide: [{ $subtract: ["$count", "$eva"] }, "$count"] }, 100]
              },
              _id: 0
            }
          }
        ]);
      }

      if (getEvaluatedData.length > 0) {
        assign.forEach(ass => {
          const i = getEvaluatedData.findIndex(e => e.assignment.toString() === ass.assignments._id.toString());
          if (i > -1) {
            ass.totalAttempted = getEvaluatedData[i].totalAttempted;
            ass.eva = getEvaluatedData[i].eva;
            ass.evaluated = getEvaluatedData[i].evaluated;
            ass.notEvaluated = getEvaluatedData[i].notEvaluated;
          } else {
            ass.totalAttempted = 0;
            ass.eva = 0;
            ass.evaluated = 0;
            ass.notEvaluated = 0;
          }
        });
      } else {
        assign.forEach(ass => {
          ass.totalAttempted = 0;
          ass.eva = 0;
          ass.evaluated = 0;
          ass.notEvaluated = 0;
        });
      }
      return { data: assign };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async updateTeacherAssignmentsStatus(request: UpdateTeacherAssignmentsStatusReq) {
    try {
      const { classroom, assignment, status, instancekey } = request;
      this.classroomRepository.setInstanceKey(instancekey);

      const assign = await this.classroomRepository.findById(classroom, { assignments: 1 });
      let ass = null;

      for (const a of assign.assignments) {
        if (a._id.toString() === assignment) {
          ass = a;
          break;
        }
      }

      if (ass && status) {
        const result = await this.classroomRepository.findOneAndUpdate(
          { _id: new Types.ObjectId(classroom) },
          { $set: { "assignments.$[index].status": status } },
          { arrayFilters: [{ "index._id": new Types.ObjectId(assignment) }], new: true }
        );

        return { status: 200, _id: result._id };
      }

      return { status: 400, error: 'Invalid data' };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async deleteTeacherAssignment(request: DeleteTeacherAssignmentReq) {
    try {
      const { classroom, assignment, instancekey } = request;
      this.classroomRepository.setInstanceKey(instancekey);

      // Check if the assignment exists
      const classroomData = await this.classroomRepository.findById(classroom, { assignments: 1 });
      if (!classroomData || !classroomData.assignments.some(ass => ass._id.toString() === assignment)) {
        return { status: 400, error: 'Assignment not found' };
      }

      // Proceed with deletion
      const updatedClassroom = await this.classroomRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(classroom) },
        { $pull: { assignments: { _id: new Types.ObjectId(assignment) } } },
        { new: true }
      );

      if (!updatedClassroom) {
        return { status: 400, error: 'Assignment not found' };
      }

      return { status: 200, _id: updatedClassroom._id };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async editTeacherAssignment(request: EditTeacherAssignmentReq) {
    try {
      const { classroom, assignment, title, description, maximumMarks, status, dueDate, attachments, instancekey } = request;
      this.classroomRepository.setInstanceKey(instancekey);

      const assign = await this.classroomRepository.findById(classroom, { assignments: 1 });
      let ass = null;

      if (!assign || !assign.assignments) {
        Logger.warn('No assignment found');
        return { status: 400, error: 'No assignment found' };
      }

      for (let i = 0; i < assign.assignments.length; i++) {
        if (assign.assignments[i]._id.toString() === assignment.toString()) {
          ass = assign.assignments[i];
          break;
        }
      }

      if (!ass) {
        Logger.warn('No assignment found');
        return { status: 400, error: 'No assignment found' };
      }

      const updatePayload = {
        "assignments.$[index].title": title,
        "assignments.$[index].description": description,
        "assignments.$[index].maximumMarks": maximumMarks,
        "assignments.$[index].status": status,
        "assignments.$[index].dueDate": new Date(dueDate),
        "assignments.$[index].attachments": attachments,
      };

      const updatedClassroom = await this.classroomRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(classroom) },
        { $set: updatePayload },
        {
          arrayFilters: [{ "index._id": { $eq: new Types.ObjectId(assignment) } }],
          new: true,
        }
      );

      if (!updatedClassroom) {
        return { status: 400, error: 'Update failed' };
      }

      return { status: 200, classroom: updatedClassroom };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getWbSessions(request: FindMeReq) {
    try {
      const { query, user, instancekey } = request;

      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      this.classroomRepository.setInstanceKey(instancekey);
      this.whiteboardLogRepository.setInstanceKey(instancekey);

      // Get distinct classrooms
      const locClassroom = await this.classroomRepository.distinct('_id', { location: new Types.ObjectId(user.activeLocation) });

      // Fetch whiteboard sessions in batches
      const sessions = await this.whiteboardLogRepository.find(
        {
          status: 'started', classroom: { $in: locClassroom }
        },
        null,
        {
          sort: { updatedAt: -1 },
          skip,
          limit,
        },
        [
          { path: 'classroom', select: 'name _id' },
          { path: 'user', select: 'name _id' },
        ]
      );

      if (!sessions.length) {
        return { sessions: [], count: 0 };
      }

      if (query.count) {
        const total = await this.whiteboardLogRepository.countDocuments({
          status: 'started',
          classroom: { $in: locClassroom },
        });

        return { sessions, count: total };
      } else {
        return { sessions };
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async addFolderItem(request: AddFolderItemReq) {
    try {
      const { _id, item, instancekey } = request;

      if (_id && item) {
        // Create the new file
        this.fileRepository.setInstanceKey(instancekey);
        const newFile = await this.fileRepository.create({
          fileName: item.fileName,
          originalName: item.originalname,
          fileUrl: item.fileUrl,
          path: item.path,
          isActive: item.isActive,
          type: item.type,
          ownerId: new Types.ObjectId(item.ownerId),
          size: item.size,
          mimeType: item.mimeType,
          thumbType: item.thumbType,
        });

        // Update the classroom to push the new file's ID into the folder
        this.classroomRepository.setInstanceKey(instancekey);
        const updateResult = await this.classroomRepository.findOneAndUpdate(
          { _id }, { $push: { folder: newFile._id } }, { new: true }
        );

        if (!updateResult) {
          return { status: 404, error: 'Classroom not found or update failed' };
        }

        return { fileId: newFile._id, status: 200 };
      }
      return { status: 403, error: 'Invalid input' };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async updateClassroom(request: UpdateClassroomReq) {
    try {
      const { _id, instancekey, ...updateData } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const classroom = await this.classroomRepository.findOne({ _id: new Types.ObjectId(_id), active: true });
      if (!classroom) {
        throw new InternalServerErrorException ('Classroom not found');
      }

      // Remove properties that should not be updated directly
      delete updateData['students'];
      delete updateData['createdAt'];
      delete updateData['updatedAt'];

      // Merge the existing classroom data with the new update data
      const updatedClassroom = { ...classroom, ...updateData };

      // Check for duplicate name
      const existingClassroom = await this.classroomRepository.findOne({
        _id: { $nin: [classroom._id] },
        slugfly: slugify(updateData.name || classroom.name, { lower: true }),
        active: true
      });

      if (existingClassroom) {
        throw new InternalServerErrorException ('Warning, Classroom already exists. It may be inactive.');
      }

      const result = await this.classroomRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(_id) },
        updatedClassroom
      );

      return { response: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async resetWbSession(request: GetAllStudentsReq) {
    try {
      const { _id, instancekey } = request;

      // Update the whiteboard sessions
      this.whiteboardLogRepository.setInstanceKey(instancekey);
      const result = await this.whiteboardLogRepository.updateMany(
        { classroom: new Types.ObjectId(_id) },
        { $set: { status: 'stopped' } }
      );

      if (result.modifiedCount === 0) {
        return { status: 404, message: 'No sessions found to update' };
      }

      return { status: 200, message: 'Sessions has been reset.' };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async updateAttendant(request: UpdateAttendantReq) {
    try {
      const { _id, classId, admitted, timezoneoffset, instancekey, user } = request;

      let query: any = {
        _id: new Types.ObjectId(_id),
        teacherId: new Types.ObjectId(user._id),
        type: 'classroom',
        active: true
      };
      if (classId) {
        query.classId = new Types.ObjectId(classId);
      }

      let mToday = new Date();
      if (timezoneoffset) {
        const offset = parseInt(timezoneoffset, 10);
        mToday = new Date(mToday.getTime() - 60 * 1000 * offset);
        mToday.setHours(0, 0, 0, 0);
        query.createdAt = { $gte: mToday };
      }

      const updateData = {
        admitted: admitted,
        status: admitted ? 'present' : 'absent'
      };

      this.attendanceRepository.setInstanceKey(instancekey);
      const att = await this.attendanceRepository.findOneAndUpdate(query, updateData, { new: true });

      if (!att) {
        return { statusCode: 404, message: 'Unable to update.' };
      }

      return { admitted: att.admitted, status: att.status, updatedAt: att.updatedAt };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async updateSteamingStatus(request: UpdateSteamingStatusReq) {
    try {
      const { _id, stream, instancekey } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const updateResult = await this.classroomRepository.updateOne(
        { _id: _id }, { $set: { stream: stream } }, { new: true }
      );

      if (!updateResult) {
        return { status: 404, message: 'Classroom not found or not updated' };
      }

      return { status: 200, classroom: updateResult };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async updateStudentStatus(request: UpdateStudentStatusReq) {
    try {
      const { _id, studentId, instancekey } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const updateResult = await this.classroomRepository.updateOne(
        {
          _id: _id,
          "students.studentId": studentId,
        },
        {
          $set: {
            "students.$.iRequested": false,
          },
        },
        { new: true }
      );

      if (!updateResult) {
        return { status: 404, message: 'Classroom or student not found' };
      }

      return { status: 200, message: 'Student status updated successfully.' };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async saveAs(request: SaveAsReq) {
    try {
      const { _id, name, instancekey, user } = request;
      this.classroomRepository.setInstanceKey(instancekey);
      const result: any = await this.classroomRepository.findById(_id);

      if (!result) {
        return { status: 404, message: 'Classroom not found' };
      }

      const existingClassRoom: any = await this.classroomRepository.findOne({ name: name, active: true });
      if (existingClassRoom) {
        return { status: 400, message: 'name_exists' };
      }

      const newClassRoomData = {
        name: name,
        user: new Types.ObjectId(user._id),
        userRole: result.userRole,
        location: result.location,
        owners: result.owners,
        imageUrl: result.imageUrl ? result.imageUrl : '',
        students: result.students,
        assignments: result.assignments,
        active: true,
        institute: result.institute
      };

      const newClassRoom = await this.classroomRepository.create(newClassRoomData);

      return { status: 200, classroom: newClassRoom };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async createClassroom(request: CreateClassroomReq) {
    try {
      const { name, imageUrl, location, owners, showAnalysis, joinByCode, instancekey, user } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const existingClassroom = await this.classroomRepository.findOne({
        name: name,
        user: new Types.ObjectId(user._id),
        active: true,
        location: new Types.ObjectId(user.activeLocation),
      });

      if (existingClassroom) {
        throw new InternalServerErrorException ('This classroom name already exists in our system. Please change the name!');
      }

      const data = {
        name,
        user: new Types.ObjectId(user._id),
        userRole: user.roles[0],
        location: (location) ? new Types.ObjectId(location) : new Types.ObjectId(user.activeLocation),
        owners: owners.map(owner => new Types.ObjectId(owner)),
        imageUrl: imageUrl || '',
        showAnalysis,
        joinByCode,
        active: true,
      };
      const newClassroom = await this.classroomRepository.create(data);
      return newClassroom;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async startWbSession(request: StartWbSessionReq) {
    try {
      const { room, subject, teacher, ip, instancekey, user } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      this.whiteboardLogRepository.setInstanceKey(instancekey);
      this.wbTeacherInfoRepository.setInstanceKey(instancekey);

      const classroom = await this.classroomRepository.findById(room);

      if (!classroom) {
        return { status: 404, message: 'Classroom not found' };
      }
      const userId = user._id.toString();
      const classroomUserId = classroom.user.toString();
      if (
        userId !== classroomUserId &&
        classroom.owners.findIndex((e: any) => e.toString() === user._id.toString()) === -1 &&
        !user.roles.includes('admin')
      ) {
        return {
          status: 400,
          message: 'Classes should be created by you. Only then you can start the classroom session!',
        };
      }

      const openSession = await this.whiteboardLogRepository.findOne({
        user: new Types.ObjectId(user._id),
        status: { $in: ['started', 'running'] },
      });

      if (openSession) {
        return { status: 400, message: 'Cannot have concurrent classes!' };
      }

      const result = await this.whiteboardService.start(request, classroom._id.toString(), classroom.name);
      if (result.sessionId) {
        await this.wbTeacherInfoRepository.create({
          subject: subject,
          teacher: teacher,
          sessionId: result.sessionId,
        });
      }

      if (result.url) {
        await this.whiteboardLogRepository.create({
          user: new Types.ObjectId(user._id),
          classroom: new Types.ObjectId(classroom._id),
          ip: ip,
          status: 'started',
        });
      }

      return { status: 200, result: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async addStudents(request: AddStudentsReq) {
    try {
      const { instancekey, user, isMentee, isMyCircle, classRoom, studentUserId, location } = request;
      const autoAdded = !!(isMentee || isMyCircle);
      let results = await this.redisCache.getSetting(request, async (settings: any) => {
        const status = settings.isWhiteLabelled && !user.roles.includes('student');

        const studentUserList = [];
        let classroomData;
        let institute;
        this.classroomRepository.setInstanceKey(request.instancekey);

        const studentsToAdd = await Promise.all(studentUserId.map(async (studentEmail) => {
          const condition: any = { userId: studentEmail };
          if (location && location._id) {
            condition.locations = { $in: [location._id] };
          }

          this.usersRepository.setInstanceKey(request.instancekey);
          const userData = await this.usersRepository.findOne(condition);

          if (userData) {
            if (user.roles.includes('student') && !userData.roles.includes('student')) {
              throw new InternalServerErrorException ('student_role');
            }

            const studentToAdd = {
              studentId: userData._id as ObjectId,
              status: status as boolean,
              autoAdd: autoAdded,
              studentUserId: userData.userId,
              registeredAt: userData.createdAt,
              iRequested: false,
              createdAt: new Date(),
              isWatchList: false,
              dailyGoal: 0,
              tasks: [],
              assignments: [],
            };

            classroomData = await this.classroomRepository.findOneAndUpdate(
              { _id: classRoom },
              { $push: { students: studentToAdd } },
              { new: true },
            );

            this.locationRepository.setInstanceKey(request.instancekey);
            institute = await this.locationRepository.findOne({ _id: classroomData.location });

            if (autoAdded) {
              await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
              this.socketClientService.enableChat(instancekey, user._id, userData._id)
            }

            if (user.roles.includes('student')) {
              const newClassroom = await this.classroomRepository.findOne({
                $or: [{ slugfly: 'group-study' }, { nameLower: 'group study' }],
                user: userData._id,
              });

              const studentToAddGroupStudy = {
                studentId: userData._id as ObjectId,
                status: status as boolean,
                autoAdd: true,
                studentUserId: user.userId,
                registeredAt: user.createdAt,
                iRequested: false,
                createdAt: new Date(),
                isWatchList: false,
                dailyGoal: 0,
                tasks: [],
                assignments: [],
              };

              if (!newClassroom) {
                // const createdClassroom = await this.classroomRepository.create({
                //   name: 'Group Study',
                //   user: userData._id,
                //   allowDelete: false,
                //   active: true,
                //   students: [studentToAddGroupStudy],
                // });
                // await this.classroomRepository.updateOne(
                //   { _id: createdClassroom._id },
                //   { $set: { students: [studentToAddGroupStudy] } },
                // );
              } else {
                await this.classroomRepository.updateOne(
                  { _id: newClassroom._id },
                  { $addToSet: { students: studentToAddGroupStudy } },
                );
              }
            }
            studentUserList.push({
              _id: userData._id,
              userId: studentEmail,
            });

            return studentToAdd;
          } else {
            const studentToAdd = {
              status: false,
              autoAdd: autoAdded,
              studentUserId: studentEmail,
              createdAt: new Date(),
              isWatchList: false,
              dailyGoal: 0,
              tasks: [],
              assignments: [],
            };
            classroomData = await this.classroomRepository.findOneAndUpdate(
              { _id: classRoom },
              { $push: { students: studentToAdd } },
              { new: true },
            );

            studentUserList.push({
              _id: null,
              userId: studentEmail,
            });

            return studentToAdd;
          }
        }));

        const classroom = await this.classroomRepository.findOne({ _id: classRoom });
        if (!classroom) {
          throw new InternalServerErrorException ('Classroom not found');
        }

        const emitData = {
          students: studentUserList,
          classRoom: classroomData.name,
          classroomCode: classroomData.seqCode,
          institute,
        };

        await this.sendEmailtoStudent(settings, request, emitData);

        return classroom;

      });
      return results;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async removeStudent(request: RemoveStudentReq) {
    try {
      const { classRoomId, studentId, user, instancekey } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const stdClassroom = await this.classroomRepository.findOneAndUpdate(
        { '_id': new ObjectId(classRoomId) },
        { $pull: { students: { studentId: new ObjectId(studentId) } } },
        { new: true }
      );

      if (!stdClassroom) {
        return { message: 'OK' };
      }

      // Let student leave the chat room
      await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
      this.socketClientService.leaveRoom(instancekey, studentId, 'class_' + stdClassroom._id);
      if (user.roles.includes('mentor') || user.roles.includes('teacher')) {
        const teacherClass = await this.classroomRepository.findOne({
          user: user._id,
          'students.studentId': studentId
        });

        if (!teacherClass) {
          // Disable chat if student is not in any teacher's classroom
          this.socketClientService.disableChat(instancekey, user._id, studentId);
        }
      }

      return { message: 'OK' };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async checkAllowAdd(request: CheckAllowAddReq) {
    try {
      const { classroom, studentId, user, instancekey } = request;
      const settings = await this.redisCache.getSetting(request);

      if (!studentId) {
        return { msg: 'Email or phone number is required' };
      }
      if (!classroom) {
        return { msg: 'Classroom is required' };
      }

      const isStudent = user.roles.includes('student');
      const isMentor = user.roles.includes('mentor');

      if (isEmail(studentId)) {
        if (user.email === studentId && isStudent) {
          return { msg: 'Please enter your friend email' };
        }
      } else {
        if (user.phoneNumber === studentId && isStudent) {
          return { msg: 'Please enter your friend phone Number' };
        }
      }

      if (isEmail(studentId)) {
        if (user.email === studentId && !isStudent) {
          return { msg: 'Please add student role only!!' };
        }
      } else {
        if (user.phoneNumber === studentId && isStudent) {
          return { msg: 'Please add student role only!!' };
        }
      }
      this.classroomRepository.setInstanceKey(instancekey);
      const classroomData = await this.classroomRepository.findOne({
        _id: new Types.ObjectId(classroom),
        'students.studentUserId': studentId
      });

      if (classroomData) {
        return { msg: `Student (${studentId}) already exists in your classroom.` };
      }

      this.locationRepository.setInstanceKey(instancekey);
      this.usersRepository.setInstanceKey(instancekey);
      const institute = await this.locationRepository.findOne({ _id: new Types.ObjectId(user.activeLocation) }, { code: 1, name: 1, _id: 1 });
      const classroomInfo = await this.classroomRepository.findOne({ _id: new Types.ObjectId(classroom) }, { name: 1, _id: 1, seqCode: 1 });
      const studentData = await this.usersRepository.findOne({ userId: studentId });

      if (studentData) {
        if (!isMentor && !studentData.locations.find(l => l.equals(user.activeLocation))) {
          const emitData = {
            students: [{ _id: studentData._id, userId: studentData.userId }],
            classRoom: classroomInfo.name,
            classroomCode: classroomInfo.seqCode,
            institute
          };
          await this.sendEmailtoStudent(settings, request, emitData);
          return { msg: `Student (${studentId}) does not exist in our institute. A mail has been sent to the student email.` };
        }
      } else {
        if (!isStudent) {
          const emitData = {
            students: [{ _id: null, userId: studentId }],
            classRoom: classroomInfo.name,
            classroomCode: classroomInfo.seqCode,
            institute
          };
          await this.sendEmailtoStudent(settings, request, emitData);
          return { msg: `Student (${studentId}) does not exist in our platform. Please ask him/her to signup on our platform. A mail has been sent to the student email.` };
        }
      }

      if (studentData && !studentData.roles.includes('student')) {
        const labelMessage = isEmail(studentId) ? 'email' : 'phone';
        return { msg: `A user with ${labelMessage} "${studentId}" exists in the system as a teacher/parents/publisher. It cannot be added as a student.` };
      }

      return { studentId: studentId };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getClassroomStudents(request: GetClassroomStudentsReq) {
    try {
      const { _id, instancekey, query } = request;
      const page = query.page ? query.page : 1;
      const limit = query.limit ? query.limit : 20;
      const skip = (page - 1) * limit;

      const studentMatch = { $expr: { $eq: ['$_id', '$$uId'] } };
      if (query.name && query.name !== '') {
        studentMatch['$or'] = [
          { name: { $regex: new RegExp(query.name, 'i') } },
          { email: query.name },
        ];
      }

      const pipeline = [
        { $match: { _id: new ObjectId(_id) } },
        { $unwind: "$students" },
        {
          $lookup: {
            from: 'users',
            let: { uId: '$students.studentId' },
            pipeline: [{ $match: studentMatch }],
            as: 'userData'
          }
        },
        { $unwind: "$userData" },
        {
          $facet: {
            students: [
              { $sort: { "userData.name": 1 } },
              { $skip: skip },
              { $limit: limit },
              {
                $lookup: {
                  from: "practicesets",
                  localField: "_id",
                  foreignField: "classRooms",
                  as: "p"
                }
              },
              { $unwind: { path: "$p", preserveNullAndEmptyArrays: true } },
              {
                $group: {
                  _id: "$userData._id",
                  class: { $first: "$_id" },
                  testIds: { $push: "$p._id" },
                  userData: { $first: "$userData" }
                }
              },
              {
                $lookup: {
                  from: "attempts",
                  let: { student: "$_id", practiceIds: "$testIds" },
                  pipeline: [
                    {
                      $match: {
                        isAbandoned: false,
                        $expr: {
                          $and: [
                            { $eq: ['$$student', '$user'] },
                            { $in: ["$practicesetId", "$$practiceIds"] }
                          ]
                        }
                      }
                    },
                    { $group: { _id: '$practicesetId' } }
                  ],
                  as: "a"
                }
              },
              {
                $project: {
                  _id: 1,
                  class: 1,
                  totalAttempt: { $size: "$a" },
                  totalPractice: { $size: '$testIds' },
                  userData: 1
                }
              },
              {
                $lookup: {
                  from: "courses",
                  let: { classroom: "$class" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [{ $in: ['$$classroom', '$classrooms'] }]
                        }
                      }
                    },
                    { $unwind: "$sections" },
                    { $unwind: "$sections.contents" },
                    { $match: { $expr: { $eq: ['$sections.contents.active', true] } } },
                    {
                      $group: {
                        _id: { courseId: "$_id", section: "$sections._id" },
                        totalContents: { $sum: 1 }
                      }
                    },
                    {
                      $group: {
                        _id: "$_id.courseId",
                        totalContents: { $sum: "$totalContents" }
                      }
                    }
                  ],
                  as: "c"
                }
              },
              { $unwind: { path: "$c", preserveNullAndEmptyArrays: true } },
              {
                $lookup: {
                  from: "usercourses",
                  let: { crs: "$c._id", user: "$_id.user" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [{ $eq: ['$$crs', '$course'] }, { $eq: ["$user", "$$user"] }]
                        }
                      }
                    },
                    { $unwind: "$contents" },
                    { $match: { 'contents.completed': true } },
                    { $group: { _id: "$_id", completedContents: { $sum: 1 } } }
                  ],
                  as: "uc"
                }
              },
              { $unwind: { path: "$uc", preserveNullAndEmptyArrays: true } },
              {
                $group: {
                  _id: '$_id',
                  allCourseContents: { $sum: { $ifNull: ['$c.totalContents', 0] } },
                  completedCourseContents: { $sum: { $ifNull: ['$uc.completedContents', 0] } },
                  totalAttempt: { $first: '$totalAttempt' },
                  totalPractice: { $first: "$totalPractice" },
                  userData: { $first: "$userData" }
                }
              },
              { $sort: { "userData.name": 1 } }
            ],
            ...(query.count && {
              count: [{ $count: "total" }]
            })
          }
        }
      ];

      this.classroomRepository.setInstanceKey(instancekey);
      const results: any = await this.classroomRepository.aggregate(pipeline);

      const result = results[0] || { count: 0, students: [] };
      if ('count' in result) {
        result.count = result.count[0] ? result.count[0].total : 0;
      }

      return result
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getAllStudents(request: GetAllStudentsReq) {
    try {
      this.classroomRepository.setInstanceKey(request.instancekey);
      const students = await this.classroomRepository.aggregate([{
        $match: {
          _id: new ObjectId(request._id),
        }
      },
      { $unwind: "$students" },
      {
        $lookup: {
          from: 'users',
          let: { uId: '$students.studentId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$uId'] } } },
            { $project: { _id: 1, lastLogin: 1, name: 1, role: 1, avatar: 1, avatarSM: 1, avatarMD: 1, provider: 1, email: "$userId" } }
          ],
          as: 'userData'
        }
      },
      { $unwind: "$userData" },
      {
        $lookup: {
          from: "practicesets",
          localField: "_id",
          foreignField: "classRooms",
          as: "p"
        }
      },
      {
        $unwind: {
          path: "$p",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: { class: "$_id", user: "$userData._id" },
          totalTests: { $push: "$p._id" },
          userData: { $first: "$userData" }
        }
      },
      {
        $project: {
          _id: 1,
          totalTests: 1,
          userData: 1
        }
      },
      {
        $lookup: {
          from: "attempts",
          let: { student: "$userData._id", practiceIds: "$totalTests" },
          pipeline: [
            {
              $match: {
                $expr:
                {
                  $and: [{ $eq: ['$$student', '$user'] }, { $in: ["$practicesetId", "$$practiceIds"] }, { $eq: ["$isAbandoned", false] }
                  ],
                }
              }
            },
            { $project: { _id: 1, practicesetId: 1 } }
          ],
          as: "a"
        }
      },
      { $unwind: { path: "$a", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { class: "$_id.class", practice: "$a.practicesetId", user: "$userData._id" },
          attemptPractice: { $first: "$a.practicesetId" },
          totalTest: { $first: "$totalTests" },
          userData: { $first: "$userData" }
        }
      },
      {
        $group: {
          _id: { class: "$_id.class", user: "$userData._id" },
          attemptPractice: { $addToSet: "$attemptPractice" },
          totalTest: { $first: "$totalTest" },
          userData: { $first: "$userData" }
        }
      },
      {
        $project: {
          _id: 1,
          attemptPractice: 1,
          totalPractice: { $size: "$totalTest" },
          totalTest: 1,
          userData: 1
        }
      },
      {
        $lookup: {
          from: "courses",
          let: { classroom: "$_id.class" },
          pipeline: [
            {
              $match: {
                $expr:
                {
                  $and: [{ $in: ['$$classroom', '$classrooms'] }
                  ],
                }
              }
            },
            { $unwind: "$sections" },
            { $unwind: "$sections.contents" },
            {
              $match: {
                $expr:
                  { $eq: ['$sections.contents.active', true] }
              }
            },
            {
              $group:
              {
                _id: { courseId: "$_id", section: "$sections._id" },
                contents: { $push: "$sections.contents._id" },
                totalContents: { $sum: 1 }
              }
            },
            {
              $group:
              {
                _id: { courseId: "$_id.courseId" },
                totalSection: { $sum: 1 },
                totalContents: { $sum: "$totalContents" }
              }
            },
          ],
          as: "c"
        }
      },
      { $unwind: { path: "$c", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "usercourses",
          let: { crs: "$c._id.courseId", user: "$_id.user" },
          pipeline: [
            {
              $match: {
                $expr:
                {
                  $and: [{ $eq: ['$$crs', '$course'] }, { $eq: ["$user", "$$user"] }
                  ],
                }
              }
            },
            { $unwind: "$contents" },
            {
              $match: {
                $expr:
                  { $eq: ['$contents.completed', true] }
              }
            },
            {
              $group:
              {
                _id: { courseId: "$_id.courseId" },
                completedContents: { $sum: 1 }
              }
            },
          ],
          as: "uc"
        }
      },
      { $sort: { "userData.name": 1 } },
      ])

      return { response: students }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async updateClassStatus(request: UpdateClassStatusReq) {
    try {
      const update = { active: request.active, updatedAt: Date.now() }

      this.classroomRepository.setInstanceKey(request.instancekey);
      const classStatusUpdated = await this.classroomRepository.findByIdAndUpdate(request._id, update, { new: true })
      if (!classStatusUpdated) {
        return { statusCode: 500, message: "some error has been occured.." }
      }
      return { response: classStatusUpdated }
    } catch (error) {
      throw new GrpcInternalException('Failed to update Class Status');
    }
  }

  async deleteClassroom(request: DeleteClassroomReq) {
    try {
      const { _id, instancekey, user } = request;
      // let settings: any = await this.redisCache.getSettingAsync(instancekey)
      let results = await this.redisCache.getSetting(request, async (settings: any) => {
        const filter: any = { active: true, _id: _id };
        const roles = config.roles;

        if (user.roles.includes('teacher') || (user.roles.includes(roles.mentor))) {
          filter.user = user._id;
        } else {
          if (settings.isWhiteLabelled) {
            filter.allowDelete = true;
            if (user.roles.some(role => [roles.centerHead].includes(role))) {
              filter.location = { $in: user.locations };
            }
          }
        }

        this.classroomRepository.setInstanceKey(instancekey);
        const classroom = await this.classroomRepository.findOne(filter);
        if (!classroom || !classroom.allowDelete) {
          return { statusCode: 400, message: "You can't delete this classroom" };
        }

        await this.classroomRepository.findOneAndUpdate(
          { _id: classroom._id },
          { $set: { active: false } }
        );

        //deactivate this classroom's discussion also
        this.discussionRepository.setInstanceKey(instancekey);
        const discussions = await this.discussionRepository.find(classroom._id);

        if (discussions.length) {
          await Promise.all(
            discussions.map(async (discussion) => {
              const idx = discussion.classRooms.indexOf(classroom._id);
              if (idx > -1) {
                discussion.classRooms.splice(idx, 1);
                if (discussion.classRooms.length === 0) {
                  discussion.active = false;
                }
                await this.discussionRepository.saveDiscussion(discussion);
              }
            })
          );
        }

        return { statusCode: 204, message: 'Classroom deactivated successfully' };
      });
      return results;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async deleteFolderItem(request: DeleteFolderItemReq) {
    try {
      const { _id, itemId, instancekey } = request;
      this.classroomRepository.setInstanceKey(instancekey);
      this.fileRepository.setInstanceKey(instancekey);

      // Check if classroom exists
      const classroom = await this.classroomRepository.findOne({ _id: _id });
      if (!classroom) {
        return { status: 400, message: "Can't delete this classroom" };
      }

      // Check if file exists
      const file = await this.fileRepository.findOne({ _id: itemId });
      if (!file) {
        return { status: 400, message: "Can't delete this file" };
      }

      // Delete the file
      const deleteResult = await this.fileRepository.findByIdAndDelete(itemId);
      if (!deleteResult) {
        return { status: 404, message: 'File not found' };
      }

      // Update the classroom to remove the file from the folder
      const updateResult = await this.classroomRepository.findOneAndUpdate(
        { _id: _id },
        { $pull: { folder: new Types.ObjectId(itemId) } },
        { new: true }
      );

      if (!updateResult) {
        return { status: 404, message: 'Classroom not found or update failed' };
      }

      return { status: 200, result: updateResult._id };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getRequestStudent(request: GetRequestStudentsReq) {
    try {
      this.classroomRepository.setInstanceKey(request.instancekey);
      let page = (request.page) ? request.page : 1;
      let limit = (request.limit) ? request.limit : 20;
      let skip = (page - 1) * limit;
      let condition = {
        _id: request._id,
        active: true
      };

      let sort = {
        'students.createdAt': -1
      };
      if (request.sort) {
        let dataSort = request.sort.split(',');
        let temp = '{"' + dataSort[0] + '":' + dataSort[1] + ' }';
        let jsonArray = JSON.parse(temp)
        sort = jsonArray
      }

      let reqStudents = await this.classroomRepository.aggregate([{
        $match: condition
      },
      {
        $unwind: "$students"
      },
      {
        $match: {
          "students.iRequested": true,
          "students.status": false
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "students.studentId",
          foreignField: "_id",
          as: "userinfo"
        }
      },
      {
        $unwind: { "path": "$userinfo", "preserveNullAndEmptyArrays": true }
      },
      { $unwind: { path: "$userinfo.location", "preserveNullAndEmptyArrays": true } },
      {
        $lookup: {
          from: "locations",
          localField: "userinfo.locations",
          foreignField: "_id",
          as: "loc"
        }
      },
      { $unwind: { path: "$loc", "preserveNullAndEmptyArrays": true } },
      {
        $sort: sort
      },
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
          studentName: { $first: '$userinfo.name' },
          userLoc: { $push: "$loc.name" }
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      ])
      return {
        response: reqStudents
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getMentorStudents(request: FindByIdReq) {
    try {
      const { _id, query, instancekey } = request;
      let page = (query.page) ? query.page : 1;
      let limit = (query.limit) ? query.limit : 20;
      let skip = (page - 1) * limit;

      let searchText = {};
      if (query.name) {
        searchText = {
          $or: [
            {
              'u.name': {
                $regex: new RegExp(query.name, 'i'),
              },
            },
            {
              'u.userId': query.name,
            },
          ],
        };
      }

      this.classroomRepository.setInstanceKey(instancekey);
      const students = await this.classroomRepository.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(_id),
          },
        },
        { $unwind: '$students' },
        {
          $match: {
            'students.iRequested': false,
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { uId: '$students.studentId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$uId'] } } },
              {
                $project: {
                  name: 1,
                  roles: 1,
                  avatar: 1,
                  avatarSM: 1,
                  avatarMD: 1,
                  provider: 1,
                  locations: 1,
                  userId: 1,
                },
              },
            ],
            as: 'u',
          },
        },
        { $unwind: '$u' },
        { $match: searchText },
        { $unwind: { path: '$u.locations', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'locations',
            let: { uId: '$u.locations' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$uId'] } } },
              { $project: { name: 1 } },
            ],
            as: 'loc',
          },
        },
        {
          $lookup: {
            from: 'attempts',
            let: { uId: '$u._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$user', '$$uId'] },
                      { $eq: ['$isAbandoned', false] },
                      { $eq: ['$isShowAttempt', true] },
                      { $eq: ['$isEvaluated', true] },
                    ],
                  },
                },
              },
              { $unwind: { path: '$subjects', preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: 1,
                  createdAt: 1,
                  accuracy: '$subjects.accuracy',
                  totalTime: { $divide: ['$totalTime', 60000] },
                  user: 1,
                },
              },
              {
                $group: {
                  _id: '$user',
                  attemptId: { $addToSet: '$_id' },
                  createdAt: { $first: '$createdAt' },
                  accuracy: { $sum: '$accuracy' },
                  totalTime: { $sum: '$totalTime' },
                },
              },
            ],
            as: 'a',
          },
        },
        {
          $lookup: {
            from: 'usercourses',
            let: { uId: '$u._id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$user', '$$uId'] } } },
              { $unwind: { path: '$contents', preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: 1,
                  createdAt: 1,
                  timeSpent: { $divide: ['$contents.timeSpent', 60000] },
                  user: 1,
                  type: '$contents.type',
                },
              },
              {
                $match: {
                  $or: [{ type: 'video' }, { type: 'note' }, { type: 'ebook' }],
                },
              },
              {
                $group: {
                  _id: '$user',
                  usercourseId: { $addToSet: '$course' },
                  createdAt: { $first: '$createdAt' },
                  timeSpent: { $sum: '$timeSpent' },
                },
              },
            ],
            as: 'uc',
          },
        },
        {
          $group: {
            _id: '$u._id',
            u: { $first: '$u' },
            loc: { $first: '$loc' },
            a: { $first: '$a' },
            uc: { $first: '$uc' },
            isWatch: { $first: '$students.isWatchList' },
          },
        },
        { $sort: { 'u.name': 1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      return { status: 200, students: students };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getMentoringTime(request: GetMentoringTimeReq) {
    try {
      const { user, instancekey } = request;
      this.userLogRepository.setInstanceKey(instancekey);
      const data = await this.userLogRepository.aggregate([
        {
          $match: {
            user: new Types.ObjectId(user._id),
            createdAt: { $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            timeActive: { $sum: "$timeActive" }
          }
        },
        { $sort: { "_id.day": 1 } },
        { $project: { _id: 1, timeActive: { $divide: ["$timeActive", 60000] } } }
      ]);

      return { data: data };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getPracticeTime(request: GetPracticeTimeReq) {
    try {
      const { _id, studentId, limit, instancekey } = request;

      let filter: any = {};
      if (studentId) {
        filter['u._id'] = new Types.ObjectId(studentId);
      }

      let limitFilter: any = {};
      const timeRange = limit ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
      limitFilter['createdAt'] = {
        $gte: new Date(new Date().getTime() - timeRange)
      };

      this.classroomRepository.setInstanceKey(instancekey);
      const data = await this.classroomRepository.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(_id)
          }
        },
        { $unwind: "$students" },
        {
          $match: {
            "students.iRequested": false
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "students.studentId",
            foreignField: "_id",
            as: "u"
          }
        },
        { $unwind: "$u" },
        { $match: filter },
        {
          $lookup: {
            from: "attempts",
            localField: "u._id",
            foreignField: "user",
            as: "a"
          }
        },
        { $unwind: "$a" },
        {
          $project: {
            createdAt: "$a.createdAt",
            _id: 1,
            studentId: "$u._id",
            studentName: "$u.name",
            totalTime: "$a.totalTime",
          }
        },
        {
          $match: limitFilter
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
              studentId: "$studentId"
            },
            studentName: { $first: "$studentName" },
            totalAttemptTime: { $sum: "$totalTime" },
          }
        },
        {
          $project: {
            _id: 1,
            totalAttemptTime: { $divide: ["$totalAttemptTime", 10000] },
            studentName: 1
          }
        },
        { $sort: { "_id.day": 1 } }
      ]);

      return { status: 200, data: data };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getLearningTime(request: GetPracticeTimeReq) {
    try {
      const { _id, studentId, limit, instancekey } = request;

      let filter: any = {};
      if (studentId) {
        filter['u._id'] = new Types.ObjectId(studentId);
      }

      let limitFilter: any = {};
      const timeRange = limit ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
      limitFilter['start'] = {
        $gte: new Date(new Date().getTime() - timeRange)
      };
      this.classroomRepository.setInstanceKey(instancekey);
      const data = await this.classroomRepository.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(_id)
          }
        },
        { $unwind: "$students" },
        {
          $match: {
            "students.iRequested": false
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "students.studentId",
            foreignField: "_id",
            as: "u"
          }
        },
        { $unwind: "$u" },
        { $match: filter },
        {
          $lookup: {
            from: "usercourses",
            localField: "students.studentId",
            foreignField: "user",
            as: "someField"
          }
        },
        { $unwind: "$someField" },
        { $unwind: "$someField.contents" },
        {
          $match: {
            $or: [
              { "someField.contents.type": "video" },
              { "someField.contents.type": "note" },
              { "someField.contents.type": "ebook" }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            studentId: "$u._id",
            studentName: "$u.name",
            timeSpent: "$someField.contents.timeSpent",
            start: "$someField.contents.start",
            contentId: "$someField.contents._id"
          }
        },
        {
          $match: limitFilter
        },
        {
          $group: {
            _id: {
              year: { $year: "$start" },
              month: { $month: "$start" },
              day: { $dayOfMonth: "$start" },
              studentId: "$studentId"
            },
            studentName: { $first: "$studentName" },
            timeSpent: { $sum: "$timeSpent" }
          }
        },
        {
          $project: {
            _id: 1,
            timeSpent: { $divide: ["$timeSpent", 60000] },
            studentName: 1
          }
        },
        { $sort: { "_id.day": 1 } }
      ]);

      return { status: 200, data: data };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getLeastPracticeTime(request: GetAllStudentsReq) {
    try {
      const { _id, instancekey } = request;

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // January is 0
      const currentDay = currentDate.getDate();

      this.classroomRepository.setInstanceKey(instancekey);
      const data = await this.classroomRepository.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(_id)
          }
        },
        { $unwind: "$students" },
        {
          $lookup: {
            from: "users",
            localField: "students.studentId",
            foreignField: "_id",
            as: "u"
          }
        },
        { $unwind: "$u" },
        {
          $lookup: {
            from: "attempts",
            localField: "u._id",
            foreignField: "user",
            as: "a"
          }
        },
        { $unwind: "$a" },
        {
          $project: {
            createdAt: "$a.createdAt",
            year: { $year: "$a.createdAt" },
            month: { $month: "$a.createdAt" },
            day: { $dayOfMonth: "$a.createdAt" },
            _id: 1,
            studentId: "$u._id",
            studentName: "$u.name",
            totalTime: "$a.totalTime"
          }
        },
        {
          $match: {
            year: currentYear,
            month: currentMonth,
            day: currentDay
          }
        },
        { $sort: { totalTime: 1 } },
        {
          $group: {
            _id: "$studentId",
            studentName: { $first: "$studentName" },
            totalAttemptTime: { $first: "$totalTime" }
          }
        },
        {
          $project: {
            _id: 1,
            studentName: 1,
            totalAttemptTime: { $divide: ["$totalAttemptTime", 60000] }
          }
        }
      ]);
      return { status: 200, currentDay: data[0] };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getMentorStudentData(request: GetAllStudentsReq) {
    try {
      const { _id, instancekey } = request;

      this.attemptRepository.setInstanceKey(instancekey);
      const students = await this.attemptRepository.aggregate([
        {
          $match: {
            user: new Types.ObjectId(_id),
            isAbandoned: false,
            isShowAttempt: true,
            isEvaluated: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'u',
          },
        },
        { $unwind: '$u' },
        { $unwind: '$subjects' },
        {
          $project: {
            _id: 1,
            createdAt: '$createdAt',
            studentId: '$u._id',
            studentName: '$u.name',
            avatar: '$u.avatar',
            totalTime: '$totalTime',
            subjects: '$subjects',
            practice: '$practicesetId',
            userId: '$u.userId',
            totalErrors: 1,
            totalCorrects: 1,
            pending: 1,
            partial: 1,
          },
        },
        {
          $group: {
            _id: '$studentId',
            studentName: { $first: '$studentName' },
            totalAttemptTime: { $first: '$totalTime' },
            accuracy: { $sum: '$subjects.accuracy' },
            speed: { $sum: '$subjects.speed' },
            avatar: { $first: '$avatar' },
            totalAttempts: { $sum: 1 },
            practice: { $addToSet: '$practice' },
            userId: { $first: '$userId' },
            totalErrors: { $sum: '$totalErrors' },
            totalCorrects: { $sum: '$totalCorrects' },
            pending: { $sum: '$pending' },
            partial: { $sum: '$partial' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            totalAttemptTime: { $divide: ['$totalAttemptTime', 60000] },
            accuracy: 1,
            speed: { $divide: ['$speed', '$count'] },
            studentName: 1,
            totalAttempts: 1,
            totalTests: { $size: '$practice' },
            userId: 1,
            avatar: 1,
            doQuestion: {
              $sum: ['$totalErrors', '$totalCorrects', '$pending', '$partial'],
            },
          },
        },
        {
          $sort: {
            studentName: 1,
          },
        },
      ]);
      return { status: 200, students: students };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async todayAttemptQuestions(request: GetAllStudentsReq) {
    try {
      const { _id, instancekey } = request;

      this.attemptDetailRepository.setInstanceKey(instancekey);
      const students = await this.attemptDetailRepository.aggregate([
        {
          $match: {
            user: new Types.ObjectId(_id),
            isAbandoned: false,
            createdAt: { $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        { $unwind: "$QA" },
        {
          $project: {
            _id: 1,
            user: 1,
            createdAt: 1,
            status: "$QA.status",
            doQuestion: {
              $sum: {
                $cond: [{ $eq: ["$QA.status", 3] }, 0, 1]
              }
            },
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            doQuestion: { $sum: "$doQuestion" }
          }
        },
        { $sort: { "_id.day": 1 } },
      ]);

      return { status: 200, students: students };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getClassroomStudent(request: GetPracticeTimeReq) {
    try {
      const { _id, studentId, instancekey } = request;

      if (!_id || !studentId) {
        return { status: 422, message: 'Invalid' };
      }

      this.classroomRepository.setInstanceKey(instancekey);
      const students = await this.classroomRepository.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(_id),
          },
        },
        { $unwind: '$students' },
        {
          $match: {
            'students.studentId': new Types.ObjectId(studentId),
          },
        },
        {
          $project: {
            _id: 1,
            students: 1,
          },
        },
      ]);

      return { status: 200, students: students };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findReviewStudents(request: GetAllStudentsReq) {
    try {
      const { _id, instancekey } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const students = await this.classroomRepository.aggregate([
        {
          $match: { _id: new Types.ObjectId(_id) },
        },
        { $unwind: '$students' },
        {
          $lookup: {
            from: 'users',
            localField: 'students.studentId',
            foreignField: '_id',
            as: 'uinfo',
          },
        },
        { $unwind: '$uinfo' },
        {
          $match: {
            'uinfo.dossier.status': 'pending',
          },
        },
        {
          $project: {
            _id: 1,
            studentId: '$uinfo._id',
            avatar: '$uinfo.avatar',
            name: '$uinfo.name',
            email: '$uinfo.email',
            statusChangedAt: '$uinfo.dossier.statusChangedAt',
          },
        },
      ]);

      return { status: 200, students: students };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getAssignedTasks(request: GetPracticeTimeReq) {
    try {
      const { _id, studentId, instancekey } = request;

      if (!_id || !studentId) {
        return { status: 422, message: 'Invalid' };
      }

      this.classroomRepository.setInstanceKey(instancekey);
      const result = await this.classroomRepository.aggregate([
        { $match: { _id: new Types.ObjectId(_id) } },
        { $unwind: '$students' },
        { $match: { 'students.studentId': new Types.ObjectId(studentId) } },
        { $unwind: '$students.tasks' },
        {
          $project: {
            _id: 1,
            name: 1,
            assignDate: '$students.tasks.assignDate',
            practiceId: '$students.tasks.practiceId',
          },
        },
        {
          $lookup: {
            from: 'practicesets',
            localField: 'practiceId',
            foreignField: '_id',
            as: 'pInfo',
          },
        },
        { $unwind: '$pInfo' },
        {
          $project: {
            _id: 1,
            name: 1,
            assignDate: 1,
            practiceName: '$pInfo.title',
            practiceId: 1,
          },
        },
        {
          $lookup: {
            from: 'attempts',
            let: {
              uId: new Types.ObjectId(studentId),
              practiceId: '$practiceId',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$user', '$$uId'] },
                      { $eq: ['$practicesetId', '$$practiceId'] },
                      { $eq: ['$isShowAttempt', true] },
                      { $eq: ['$isAbandoned', false] },
                    ],
                  },
                },
              },
              {
                $unwind: { path: '$subjects', preserveNullAndEmptyArrays: true },
              },
              {
                $project: { _id: 1, createdAt: 1, user: 1 },
              },
            ],
            as: 'a',
          },
        },
      ]);

      return { status: 200, result: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async assignMentorTasks(request: AssignMentorTasksReq) {
    try {
      const { _id, tasks, studentId, instancekey } = request;

      if (!_id || !studentId || !tasks) {
        return { status: 422, message: 'Invalid' };
      }

      this.classroomRepository.setInstanceKey(instancekey);
      const classRoom = await this.classroomRepository.findById(_id);
      if (!classRoom) {
        return { status: 422, message: 'No User Found' };
      }

      const result = await this.classroomRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(_id) },
        { $push: { 'students.$[element].tasks': { $each: tasks } } },
        {
          arrayFilters: [
            { 'element.studentId': new Types.ObjectId(studentId) },
          ],
          new: true,
        }
      );

      if (!result) {
        return { status: 422, message: 'Error updating tasks' };
      }
      return { status: 200, result: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getStudentAssignedTasks(request: GetAllStudentsReq) {
    try {
      const { _id, instancekey } = request;
      if (!_id) {
        return { status: 422, message: 'No students found' };
      }

      this.classroomRepository.setInstanceKey(instancekey);
      const results = await this.classroomRepository.aggregate([
        {
          $match: {
            $and: [
              { slugfly: 'my-mentees' },
              { nameLower: 'my mentees' },
            ],
          },
        },
        { $unwind: '$students' },
        { $match: { 'students.studentId': new Types.ObjectId(_id) } },
        { $unwind: '$students.tasks' },
        {
          $lookup: {
            from: 'practicesets',
            localField: 'students.tasks.practiceId',
            foreignField: '_id',
            as: 'pinfo',
          },
        },
        { $unwind: '$pinfo' },
        {
          $project: {
            title: '$pinfo.title',
            practiceId: '$pinfo._id',
            classId: '$_id',
            assignDate: '$students.tasks.assignDate',
            user: '$students.studentId',
            mentor: '$user',
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { uId: '$mentor' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$uId'] }],
                  },
                },
              },
              {
                $project: { _id: 1, name: 1 },
              },
            ],
            as: 'mentors',
          },
        },
        {
          $lookup: {
            from: 'attempts',
            let: { uId: '$user', practiceId: '$practiceId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$user', '$$uId'] },
                      { $eq: ['$practicesetId', '$$practiceId'] },
                      { $eq: ['$isAbandoned', false] },
                    ],
                  },
                },
              },
              {
                $project: { _id: 1, createdAt: 1, practicesetId: 1 },
              },
            ],
            as: 'a',
          },
        },
      ]);

      return { status: 200, results: results };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async addToClsWatchList(request: AddToClsWatchListReq) {
    try {
      const { _id, status, studentId, instancekey } = request;

      if (!_id || !studentId) {
        return { status: 422, message: 'No Such Student Found' };
      }

      this.classroomRepository.setInstanceKey(instancekey);
      const result = await this.classroomRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(_id) },
        { $set: { 'students.$[element].isWatchList': status } },
        { arrayFilters: [{ 'element.studentId': new Types.ObjectId(studentId) }], new: true }
      );

      if (!result) {
        return { status: 422, message: 'Error updating watch list status' };
      }

      return { status: 200, result: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getWatchListStatus(request: GetPracticeTimeReq) {
    try {
      const { _id, studentId, instancekey } = request;
      if (!_id || !studentId) {
        return { status: 422, message: 'Not Found' };
      }

      this.classroomRepository.setInstanceKey(instancekey);
      const data = await this.classroomRepository.aggregate([
        { $match: { _id: new Types.ObjectId(_id) } },
        { $unwind: '$students' },
        { $match: { 'students.studentId': new Types.ObjectId(studentId) } },
        { $project: { _id: 1, students: 1 } },
      ]);

      return { status: 200, data: data };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async setDailyGoals(request: SetDailyGoalsReq) {
    try {
      const { _id, goal, studentId, instancekey } = request;

      if (!_id || !studentId) {
        return { status: 422, message: 'No Such Student Found' };
      }

      this.classroomRepository.setInstanceKey(instancekey);
      const result = await this.classroomRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(_id) },
        { $set: { 'students.$[element].dailyGoal': goal } },
        { arrayFilters: [{ 'element.studentId': new Types.ObjectId(studentId) }], new: true }
      );

      if (!result) {
        return { status: 422, message: 'Error updating daily goals.' };
      }

      return { status: 200, result: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getSessionInfo(request: GetAllStudentsReq) {
    try {
      const { _id, instancekey } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const classroom = await this.classroomRepository.findById(_id);
      if (!classroom) {
        return { status: 404, message: 'No classroom found by this ID.' };
      }

      const meeting = await this.whiteboardService.getMeeting(instancekey, classroom._id.toString());
      if (!meeting) {
        return { status: 404, message: 'No meeting found.' };
      }

      return { status: 200, meeting: meeting };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async joinSession(request: DeleteClassroomReq) {
    try {
      const { _id, user, instancekey } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const classroom = await this.classroomRepository.findById(_id);
      if (!classroom) {
        return { status: 404, message: 'No classroom found by this ID.' };
      }

      const result = await this.whiteboardService.join(request, classroom._id.toString(), classroom.user.toString());

      if (!result) {
        return { status: 404, message: 'No meeting found.' };
      }

      return { status: 200, meeting: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getRecordings(request: GetAllStudentsReq) {
    try {
      const { _id, instancekey } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const classroom = await this.classroomRepository.findById(_id);
      if (!classroom) {
        return { status: 404, message: 'No classroom found by this ID.' };
      }

      const recordings = await this.whiteboardService.getRecordings(request, classroom._id.toString());
      for (let i = 0; i < recordings.length; i++) {
        let recordDetails = await this.classroomRepository.findOne({ sessionId: recordings[i].sessionId });
        if (recordDetails) {
          recordings[i].teacher = recordDetails.teacher;
          recordings[i].subject = recordDetails.subject;
          recordings[i].video = recordDetails.video;
        }
      }

      return { status: 200, recordings: recordings };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getPublicMentorStudents(request: GetAllStudentsReq) {
    try {
      const { _id, instancekey } = request;

      this.classroomRepository.setInstanceKey(instancekey);
      const students: any = await this.classroomRepository.aggregate([
        {
          $match: {
            user: new Types.ObjectId(_id),
            slugfly: 'my-mentees'
          }
        },
        { $unwind: "$students" },
        { $match: { "students.iRequested": false } },
        { $count: "total" }
      ]);

      const total = students.length > 0 ? students[0].total : 0;

      return { status: 200, total: total };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async importStudent(request: ImportStudentReq): Promise<any> {
    const { file, user, instancekey } = request;
    try {
      if (!file) {
        return { code: -1, error: "No file passed" };
      }
      const ext = path.extname(file.originalname);
      if (ext !== '.xls' && ext !== '.xlsx') {
        return { code: -2, error: "Wrong extension type" };
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const excelToJson: any = xlsx.utils.sheet_to_json(worksheet);

      const existsAsTeacher = [];
      const invalidEmailOrPhone = [];
      const alreadyExists = [];
      const students = [];
      for (let i = 0; i < excelToJson.length; i++) {
        excelToJson[i] = _.transform(excelToJson[i], (result, val, key) => {
          result[key.toLowerCase()] = val;
        });

        const student = {};
        if (excelToJson[i].email && isEmail(excelToJson[i].email)) {
          student['studentUserId'] = excelToJson[i].email;
          students.push(student);
        } else if (excelToJson[i].phone && excelToJson[i].phone.length === 10) {
          student['studentUserId'] = String(excelToJson[i].phone);
          students.push(student);
        } else {
          invalidEmailOrPhone.push({
            invalid: excelToJson[i].email === undefined ? excelToJson[i].phone : excelToJson[i].email,
          });
        }
      }

      this.classroomRepository.setInstanceKey(instancekey);
      this.usersRepository.setInstanceKey(instancekey);
      this.locationRepository.setInstanceKey(instancekey);
      const settings = await this.redisCache.getSetting(request);

      const uniqueStudents = _.uniqBy(students, 'studentUserId');
      const stuDocs = [];
      const classroomId = new Types.ObjectId(request.classRoom);
      let institute = {};

      const classroom = await this.classroomRepository.findOne({ _id: classroomId });
      if (!classroom) {
        throw new InternalServerErrorException('Classroom not found');
      }

      institute = await this.locationRepository.findOne({ _id: classroom.location }, { code: 1, name: 1, _id: 1 });

      const toMessageStudents = [];
      for (const student of uniqueStudents) {
        const studentEmail = student.studentUserId;

        const exist = classroom.students.findIndex(s => s.studentUserId === studentEmail) > -1;
        if (exist) {
          alreadyExists.push({ alreadyExist: studentEmail });
          continue;
        }

        const userData = await this.usersRepository.findOne(
          { userId: studentEmail, locations: { $in: [user.activeLocation] } },
          { userId: 1, createdAt: 1, roles: 1, activeLocation: 1 }, { lean: true }
        );
        if (!userData) {
          return { message: 'Some students are not found on the platform' };
        }

        const studentToAdd: any = {
          status: true,
          autoAdd: false,
          studentUserId: studentEmail
        };

        if (userData) {
          studentToAdd.studentId = userData._id;
          studentToAdd.studentUserId = userData.userId;
          studentToAdd.registeredAt = userData.createdAt;
        }

        if (userData && !userData.roles.includes('student')) {
          existsAsTeacher.push({ teacher: userData.userId });
          continue;
        }

        toMessageStudents.push({ _id: userData ? userData._id : null, userId: studentToAdd.studentUserId });

        if (classroom.name === 'My Mentees' && !settings.isWhiteLabelled) {
          studentToAdd.status = false;
        }

        classroom.students.push(studentToAdd);
        stuDocs.push(studentToAdd);
      }

      await this.classroomRepository.updateOne({ _id: classroomId }, { $set: { students: classroom.students } });

      if (existsAsTeacher.length > 0 || invalidEmailOrPhone.length > 0) {
        const options = {
          user: request.mentorEmail,
          existsAsTeacher,
          invalidEmailOrPhone,
          alreadyExists,
          totalStudentCount: excelToJson.length,
          addedStudentCount: stuDocs.length + alreadyExists.length,
          returnStudentCount: excelToJson.length - (stuDocs.length + alreadyExists.length),
          fileName: file.originalname,
          startDate: moment().format('MMM DD, YYYY HH:mm:ss'),
          subject: 'Students upload status',
        };
        return await this.sendUploadErrorEmail(request, options);
      } else {
        const emitData = {
          students: toMessageStudents,
          classRoom: classroom.name,
          classroomCode: classroom.seqCode,
          institute: institute,
        };

        await this.sendEmailToStudents(settings, request, emitData);

        return {
          code: 0,
          totalStudentCount: excelToJson.length,
          addedStudentCount: stuDocs.length + alreadyExists.length,
          returnStudentCount: excelToJson.length - (stuDocs.length + alreadyExists.length)
        };
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw new GrpcInternalException(error.getResponse())
      }
      throw new GrpcInternalException({ code: 1, data: 'Corupted excel file' })
    }
  }

  async importMentor(request: ImportMentorReq): Promise<any> {
    try {
      const { file, instancekey } = request;
      if (!file) {
        return { code: -1, error: "No file passed" };
      }
      const ext = path.extname(file.originalname);
      if (ext !== '.xls' && ext !== '.xlsx') {
        return { code: -2, error: "Wrong extension type" };
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const excelToJson: any = xlsx.utils.sheet_to_json(worksheet);

      for (let i = 0; i < excelToJson.length; i++) {
        excelToJson[i] = _.transform(excelToJson[i], (result, val, key) => {
          result[key.toLowerCase()] = val;
        });
      }

      const existsAsTeacher = [];
      const notExist = [];
      const invalidEmailOrPhone = [];
      const alreadyExists = [];
      const mentors = [];

      for (let i = 0; i < excelToJson.length; i++) {
        const student = {};
        if (
          excelToJson[i]['mentor'] &&
          excelToJson[i]['mentee'] &&
          (isEmail(excelToJson[i]['mentor']) ||
            excelToJson[i]['mentor'].length === 10) &&
          (isEmail(excelToJson[i]['mentee']) ||
            excelToJson[i]['mentee'].length === 10)
        ) {
          student['studentUserId'] = excelToJson[i].mentee;
          student['mentor'] = excelToJson[i].mentor;
          mentors.push(student);
        } else {
          const rep = {
            invalid:
              excelToJson[i].mentor === undefined
                ? excelToJson[i].mentor
                : excelToJson[i].mentee,
          };
          invalidEmailOrPhone.push(rep);
        }
      }

      const serializedData = [];
      for (const mentor of mentors) {
        const exist = serializedData.find((el) => mentor.mentor === el.mentor);
        if (exist) {
          exist.mentees.push(mentor.studentUserId);
        } else {
          serializedData.push({ mentor: mentor.mentor, mentees: [mentor.studentUserId] });
        }
      }

      this.classroomRepository.setInstanceKey(instancekey);
      this.usersRepository.setInstanceKey(instancekey);

      const stuDocs = [];
      for (const mentorData of serializedData) {
        const user = await this.usersRepository.findOne({ userId: mentorData.mentor });
        if (user) {
          const mentorsList = mentorData.mentees;
          for (const student of mentorsList) {
            const userId = user._id;
            const studentEmail = student;
            const condition = { name: 'My Mentees', user: userId, 'students.studentUserId': studentEmail };

            const classroom = await this.classroomRepository.findOne(condition);
            if (classroom) {
              alreadyExists.push({ alreadyExist: studentEmail });
              continue;
            }

            const userData = await this.usersRepository.findOne({ userId: studentEmail });
            if (userData) {
              if (!userData.roles.includes('student')) {
                existsAsTeacher.push({ teacher: userData.userId });
                continue;
              }
              const studentToAdd = {
                studentId: userData._id,
                status: true,
                autoAdd: true,
                studentUserId: userData.userId,
                registeredAt: userData.createdAt,
              };
              await this.addStudentToClassroom(userId, studentToAdd);
              stuDocs.push(studentToAdd);
            } else {
              const studentToAdd = {
                status: true,
                autoAdd: true,
                studentUserId: studentEmail,
              };
              await this.addStudentToClassroom(userId, studentToAdd);
              stuDocs.push(studentToAdd);
            }
          }
        } else {
          notExist.push({ notExist: mentorData.mentor });
        }
      }

      if (existsAsTeacher.length > 0 || invalidEmailOrPhone.length > 0 || notExist.length > 0) {
        const options = {
          user: request.mentorEmail,
          notExist,
          existsAsTeacher,
          invalidEmailOrPhone,
          alreadyExists,
          totalStudentCount: excelToJson.length,
          addedStudentCount: stuDocs.length + alreadyExists.length,
          returnStudentCount: excelToJson.length - (stuDocs.length + alreadyExists.length + notExist.length),
          errorCount: existsAsTeacher.length + invalidEmailOrPhone.length + notExist.length,
          fileName: file.originalname,
          startDate: moment().format('MMM DD, YYYY HH:mm:ss'),
          subject: 'Mentors upload status',
        };
        return await this.sendUploadErrorEmail(request, options);
      } else {
        return {
          code: 0,
          totalStudentCount: excelToJson.length,
          addedStudentCount: stuDocs.length + alreadyExists.length,
          returnStudentCount: excelToJson.length - (stuDocs.length + alreadyExists.length + notExist.length),
          errorCount: existsAsTeacher.length + invalidEmailOrPhone.length + notExist.length,
        };
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw new GrpcInternalException(error.getResponse())
      }
      throw new GrpcInternalException({ code: 1, data: 'Corupted excel file' })
    }
  }

  async importStudentAdmin(request: ImportStudentAdminReq): Promise<any> {
    try {
      console.log(request);
      
      const { file, user, instancekey, resetPass } = request;
      if (!file) {
        return { code: -1, error: "No file passed" };
      }
      const ext = path.extname(file.originalname);
      if (ext !== '.xls' && ext !== '.xlsx') {
        return { code: -2, error: "Wrong extension type" };
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const excelToJson: any = xlsx.utils.sheet_to_json(worksheet);

      for (let i = 0; i < excelToJson.length; i++) {
        excelToJson[i] = _.transform(excelToJson[i], (result, val, key) => {
          result[key.toLowerCase()] = val;
        });
      }

      this.classroomRepository.setInstanceKey(instancekey);
      this.usersRepository.setInstanceKey(instancekey);
      this.settingRepository.setInstanceKey(instancekey);
      this.subjectRepository.setInstanceKey(instancekey);
      this.locationRepository.setInstanceKey(instancekey);
      let masterData = await this.settingRepository.findOne({ slug: 'masterdata' }, { passingYear: 1 });
      let masterPY = [];
      let defaultPY = null;
      if (masterData) {
        masterPY = masterData.passingYear.filter(y => y.active).map(y => y.name);
        defaultPY = masterData.passingYear.find(y => y.active && y.default);
      }

      const users = [];
      const errors = [];


      for (let i = 0; i < excelToJson.length; i++) {
        const user: any = {};
        let userId = '';
        if (excelToJson[i]['email']) {
          excelToJson[i]['email'] = excelToJson[i]['email'].trim().toLowerCase();
          userId = excelToJson[i]['email'];
        } else {
          userId = excelToJson[i]['phone'];
        }

        if (users.find(u => u.userId === userId)) {
          continue;
        }

        // Validation logic
        if (!excelToJson[i]['email'] && !excelToJson[i]['phone']) {
          errors.push({ code: 2, error: 'Email or phone number is required.', user: userId, row: i + 1 });
          continue;
        }

        if (excelToJson[i]['email'] && !isEmail(excelToJson[i]['email'])) {
          errors.push({ code: 2, error: 'Invalid Email address.', user: userId, row: i + 1 });
          continue;
        }

        if (excelToJson[i]['phone'] && (excelToJson[i]['phone'].length !== 10 || !isNumber(excelToJson[i]['phone']))) {
          errors.push({ code: 2, error: 'Invalid Phone number.', user: userId, row: i + 1 });
          continue;
        }

        if (!excelToJson[i]['role']) {
          errors.push({ code: 2, error: 'Role is empty or not valid.', user: userId, row: i + 1 });
          continue;
        }

        if (excelToJson[i]['role'].trim().toLowerCase() === 'admin' && !request.user.roles.includes('admin')) {
          errors.push({ code: 1, error: 'Cannot upload admin', user: userId, row: i + 1 });
          continue;
        }

        if (!excelToJson[i]['name'] || !validateName(excelToJson[i]['name'])) {
          errors.push({ code: 2, error: 'Name must be alphabets.', user: userId, row: i + 1 });
          continue;
        }

        if (excelToJson[i]['password'] && !validatePassword(excelToJson[i]['password'])) {
          errors.push({ code: 2, error: 'Password must be of 8-20 Characters with at least one alphabet and one number', user: userId, row: i + 1 });
          continue;
        }

        if (!excelToJson[i]['location']) {
          errors.push({ code: 2, error: 'Location is required', user: userId, row: i + 1 });
          continue;
        }

        if (!excelToJson[i]['subjects']) {
          errors.push({ code: 2, error: 'subject is required', user: userId, row: i + 1 });
          continue;
        }

        // Validate subjects
        user['subjectsName'] = excelToJson[i]['subjects'];
        let subjects = user['subjectsName'].split(':').map(item => item.trim());

        let subjectList = await this.subjectRepository.find(
          { active: true, name: { $in: subjects } }, { _id: 1, name: 1 });

        if (subjectList.length !== subjects.length) {
          errors.push({
            code: 1,
            error: 'Subject(s) name is(are) not valid.',
            user: userId,
            row: i + 1,
            subjects: subjects.filter(sub => !subjectList.find(s => s.name === sub))
          });
          continue;
        } else {
          user['subjects'] = subjectList.map(a => a._id);
        }

        // Validate locations
        user['locationName'] = excelToJson[i]['location'];
        let locations = _.compact(user['locationName'].split(':').map(item => item.trim()));

        if (!request.user.roles.includes('admin')) {
          let validLoc = await this.locationRepository.findOne(
            { _id: new Types.ObjectId(request.user.activeLocation) }, { select: ['name'] }
          );
          if (!locations.length) {
            locations.push(validLoc.name);
          } else if (locations.length > 1 || locations[0] !== validLoc.name) {
            errors.push({ code: 1, error: 'Location(s) name is(are) not valid.', user: userId, row: i + 1 });
            continue;
          }
        }

        let locationsList = await this.locationRepository.find(
          { name: { $in: locations } }, { _id: 1, name: 1 }
        );

        if (locationsList.length !== locations.length) {
          errors.push({
            code: 1,
            error: 'Location(s) name is(are) not valid.',
            user: userId,
            row: i + 1,
            locations: locations.filter(loc => !locationsList.find(l => l.name === loc))
          });
          continue;
        } else {
          user['locations'] = locationsList.map(a => a._id);
        }

        // Validate classroom
        user['classname'] = excelToJson[i]['classroom'];
        if (user['classname']) {
          let classroomList = user.classname.split(':').map(item => item.trim());

          let invalidClass = [];
          for (let classroomName of classroomList) {
            let cond = {
              location: { $in: user.locations },
              $or: [{ slugfly: classroomName }, { name: classroomName }, { nameLower: classroomName.toLowerCase() }]
            };
            let cls = await this.classroomRepository.findOne(cond, { select: ['_id'] });
            if (!cls) {
              invalidClass.push(classroomName);
            }
          }
          if (invalidClass.length) {
            errors.push({ code: 1, error: `${invalidClass.join(', ')} classroom(s) doesn't(don't) exist`, user: userId, row: i + 1 });
            continue;
          }
        }

        // Hard-coding country information temporarily
        var callingCodes = ['91'];
        var country = {
          code: 'IN',
          name: 'India',
          callingCodes: callingCodes
        };
        user['country'] = country;
        user['userId'] = userId;
        user['name'] = excelToJson[i]['name'];
        user['password'] = excelToJson[i]['password'];
        user['rollNumber'] = excelToJson[i]['roll number'];
        user['registrationNo'] = excelToJson[i]['registration number'];
        user['roles'] = [excelToJson[i]['role'].trim().toLowerCase()];

        if (excelToJson[i]['email']) {
          user['email'] = excelToJson[i]['email'];
        }

        if (excelToJson[i]['phone']) {
          user['phoneNumber'] = excelToJson[i]['phone'];
          user['phoneNumberFull'] = callingCodes + excelToJson[i]['phone'];
        }

        if (excelToJson[i]['passingyear']) {
          user['passingYear'] = excelToJson[i]['passingyear'];
        }

        if (excelToJson[i]['placementstatus']) {
          user['placementStatus'] = excelToJson[i]['placementstatus'];
        }

        if (user['roles'][0] === 'centerhead') {
          user['roles'][0] = 'centerHead';
        }

        if (resetPass == 'true') {
          user['forcePasswordReset'] = true;
        }

        users.push(user);

        // saving user data
        let updatedUser: any = {};
        try {
          const cond = {
            $or: []
          };
          if (user.userId) {
            cond.$or.push({ userId: user.userId });
          }
          if (user.email) {
            cond.$or.push({ email: user.email.toLowerCase() });
          }
          if (user.phoneNumber) {
            cond.$or.push({ phoneNumber: user.phoneNumber });
          }
          let data = await this.usersRepository.findOne(cond);

          if (data) {
            // Update existing user logic as in the original code
            let passwordChanged = false;
            if (user['password']) {
              data.setPassword(user['password']);
              passwordChanged = true;
            }

            data.updatedAt = new Date();
            data.emailVerifyToken = '';
            data.emailVerifyExpired = '';
            data.emailVerified = true;
            data.isActive = true;
            data.status = true;

            if (user['rollNumber']) {
              data.rollNumber = user['rollNumber'];
            }

            if (user['registrationNo']) {
              data.registrationNo = user['registrationNo'];
            }

            if (user['name']) {
              data.name = user['name'];
            }

            if (user.email) {
              data.email = user.email;
            }

            if (user.phoneNumber) {
              data.phoneNumber = user.phoneNumber;
            }
            if (user.phoneNumberFull) {
              data.phoneNumberFull = user.phoneNumberFull;
            }

            if (user['placementStatus']) {
              data.placementStatus = user['placementStatus'];
            }

            if (user['passingYear'] && masterPY.includes(user['passingYear'])) {
              data.passingYear = user['passingYear'];
            }

            if (user['subjects'].length) {
              user['subjects'].forEach(ns => {
                if (!data['subjects'].includes(ns)) {
                  data['subjects'].push(ns);
                }
              });
            }

            if (user['locations'].length) {
              user['locations'].forEach(nl => {
                if (!data['locations'].includes(nl)) {
                  data['locations'].push(nl);
                }
              });
            }

            if (user.forcePasswordReset) {
              data.forcePasswordReset = user.forcePasswordReset;
            }

            await this.usersRepository.updateOne({ _id: data._id }, data);
            updatedUser = data;

            // Invalidate user token if password is changed => force user to logout
            if (passwordChanged) {
              this.invalidateTokenAfterPasswordChanged(request, data._id);
            }
          } else {
            // Create new user logic as in the original code
            let newUser: any = this.usersRepository.create(user);

            // set default passingYear
            if (user['roles'][0] === 'student' && defaultPY && (!user['passingYear'] || !masterPY.includes(user['passingYear']))) {
              newUser.passingYear = defaultPY.name;
            }

            newUser.activeLocation = newUser.locations[0];
            newUser.onboarding = true;

            newUser.setPassword(user['password']);
            updatedUser = await this.usersRepository.create(newUser);
          }
        } catch (err) {
          if (err.name === 'ValidationError') {
            for (let field in err.errors) {
              errors.push({ code: 4, error: err.errors[field].message, user: userId, row: i + 1 });
            }
            continue;
          }
        }

        // add student to classroom
        if (user.roles[0] === 'student' && user.classname) {
          let classroomList = user.classname.split(':').map(item => item.trim());

          for (let classroomName of classroomList) {
            let cond = {
              location: { $in: user.locations },
              $or: [{ slugfly: classroomName }, { name: classroomName }, { nameLower: classroomName.toLowerCase() }]
            };
            let cls = await this.classroomRepository.findOne(cond);
            if (cls.students.length) {
              let foundStudent = cls.students.find(s => s.studentUserId === user.email || s.studentUserId === user.phoneNumber);
              if (!foundStudent) {
                cls.students.push({
                  studentId: updatedUser._id,
                  status: false,
                  autoAdd: false,
                  studentUserId: updatedUser.userId,
                  registeredAt: updatedUser.createdAt
                });
                await this.classroomRepository.findByIdAndUpdate(cls._id, cls);
              }
            }
          }
        }
      }

      if (errors.length > 0) {
        const options = {
          user: user.email,
          user_errors: errors,
          fileName: file.originalname,
          startDate: moment().format('MMM DD, YYYY HH:mm:ss'),
          subject: 'Users upload status',
        };
        await this.sendUploadUserErrorEmail(request, options);
        return { errorCount: errors.length };
      } else {
        return { message: 'OK' };
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw new GrpcInternalException(error.getResponse())
      }
      throw new GrpcInternalException({ code: 1, data: 'Corupted excel file' })
    }
  }
}
