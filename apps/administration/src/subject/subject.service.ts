import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  AttemptDetailRepository, AttemptRepository, isEmail, LocationRepository, NotificationRepository,
  PracticeSetRepository, ProgramRepository, QuestionRepository, RedisCaching, SubjectRepository,
  TopicRepository, UnitRepository, UsersRepository
} from '@app/common';
import {
  SubjectRequest, GetAllSubjectRequest, DeleteSubjectRequest, GetOneSubjectRequest, UpdateSubjectRequest,
  GetOneSubjectResponse, GetMySubjectsRequest, GetSubjectBySlugReq, GetTeachersBySubjectsReq,
  GetTeachersBySubjectsRes, GetSubjectResponse, UpdateSubStatusReq, GetUnitsBySubReq, GetUnitsBySubRes,
  GetTopicsByUnitRes, GetTopicsByUnitReq, GetInstSubReq, GetPubSubReq, GetSubByTestReq, AttemptTrendReq,
  ImportSubjectsReq, GetAttemptTrendByGradeReq
} from '@app/common/dto/administration/subject.dto';
import { ObjectId } from 'mongodb';
import { GrpcInternalException, GrpcInvalidArgumentException } from 'nestjs-grpc-exceptions';
import slugify from 'slugify';
import * as mainHelper from '@app/common/helpers/main-helper';
import * as roleHelper from '@app/common/helpers/role-helper';
import { Types } from 'mongoose';
import { config } from '@app/common/config';
import { StudentBus } from '@app/common/bus';
import * as path from 'path';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as _ from 'lodash';
import { MessageCenter } from '@app/common/components/messageCenter';

@Injectable()
export class SubjectService {
  constructor(
    private readonly subjectRepository: SubjectRepository,
    private readonly locationRepository: LocationRepository,
    private readonly programRepository: ProgramRepository,
    private readonly practiceSetRepository: PracticeSetRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly attemptDetailRepository: AttemptDetailRepository,
    private readonly userRepository: UsersRepository,
    private readonly unitRepository: UnitRepository,
    private readonly topicRepository: TopicRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly redisCaching: RedisCaching,
    private readonly studentBus: StudentBus,
    private readonly messageCenter: MessageCenter
  ) { }

  // Internal Functions - start
  private getStringDate(lastDate: number): string {
    var newTime = new Date();
    newTime.setTime(lastDate);
    var date = new Date(newTime);
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();

    var newDate = [date.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('-');
    return newDate;
  }

  private async aggregateAttempts(instancekey: string, filter: any, condition: any): Promise<any> {
    const aggregationPipeline = [
      {
        "$match": filter
      },
      {
        "$project": {
          "isAbandoned": 1,
          "createdAt_day": {
            "$let": {
              "vars": {
                "field": "$createdAt"
              },
              "in": {
                "date": {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": "$$field"
                  }
                }
              }
            }
          },
          "createdAt": {
            "$let": {
              "vars": {
                "field": "$createdAt"
              },
              "in": {
                "date": {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": {
                      "$subtract": ["$$field", {
                        "$multiply": [{
                          "$subtract": [{
                            "$dayOfWeek": "$$field"
                          }, 1]
                        }, 86400000]
                      }]
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        "$match": condition
      },
      {
        "$project": {
          "_id": "$_id",
          "group": {
            "createdAt": "$createdAt"
          }
        }
      },
      {
        "$group": {
          "_id": "$group",
          "count": {
            "$sum": 1
          }
        }
      },
      {
        "$sort": {
          "_id": 1
        }
      },
      {
        "$project": {
          "_id": false,
          "count": true,
          "createdAt": "$_id.createdAt"
        }
      },
      {
        "$sort": {
          "createdAt": 1
        }
      }
    ];

    this.attemptRepository.setInstanceKey(instancekey);
    return await this.attemptRepository.aggregate(aggregationPipeline);
  }

  private async aggregateQuestion(filter: any, condition: any) {
    return await this.questionRepository.aggregate([
      { $match: filter },
      {
        $project: {
          createdAt: {
            $let: {
              vars: {
                field: '$createdAt',
              },
              in: {
                date: {
                  $dateToString: {
                    format: '%Y-%m',
                    date: '$$field',
                  },
                },
              },
            },
          },
        },
      },
      { $match: condition },
      {
        $project: {
          _id: '$_id',
          group: {
            createdAt: '$createdAt',
          },
        },
      },
      {
        $group: {
          _id: '$group',
          count: {
            $sum: 1,
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: false,
          count: true,
          createdAt: '$_id.createdAt',
        },
      },
      { $sort: { createdAt: 1 } },
    ]);
  }

  private async generateUniqueCode(name: string, type: string): Promise<string> {
    const matches = name.match(/\b(\w)/g);
    const strLength = matches.length;
    const acronym = matches.join('');
    let newCode = acronym.toUpperCase() + mainHelper.getRandomCode(10 - strLength);

    let found;
    if (type === 'subject') {
      found = await this.subjectRepository.findOne({ code: newCode });
    } else if (type === 'unit') {
      found = await this.unitRepository.findOne({ code: newCode });
    }

    while (found) {
      newCode = acronym.toUpperCase() + mainHelper.getRandomCode(10 - strLength);
      if (type === 'subject') {
        found = await this.subjectRepository.findOne({ code: newCode });
      } else if (type === 'unit') {
        found = await this.unitRepository.findOne({ code: newCode });
      }
    }

    return newCode;
  }

  private async sendUploadSubjectErrorEmail(request: any, options: any) {
    this.notificationRepository.setInstanceKey(request.instancekey);
    await this.notificationRepository.create({
      receiver: new Types.ObjectId(request.user._id),
      type: "notification",
      modelId: "upload user",
      subject: "Subject upload processing failed",
    });

    let dataMsgCenter: any = {
      receiver: request.user._id,
      modelId: "uploadUser",
    };

    if (isEmail(options.user)) {
      dataMsgCenter.to = options.user;
      dataMsgCenter.isScheduled = true;
    }

    this.messageCenter.sendWithTemplate(
      request, "subject-upload-failed", options, dataMsgCenter
    );
  }
  // Internal Functions - end

  async createSubject(request: SubjectRequest) {
    try {
      const instancekey = request.instancekey;
      this.subjectRepository.setInstanceKey(instancekey);

      let query = {};
      const slugfly = slugify(request.name, { lower: true });
      let subCode = '';
      if (request.code) {
        subCode = mainHelper.padWithZeroes(request.code.toUpperCase(), 10);
        query = { code: subCode };
      } else if (request.programs && request.programs.length === 0) {
        query = { slugfly: slugfly };
      } else {
        query = { programs: { $in: request.programs }, slugfly: slugfly };
      }

      let result = await this.subjectRepository.findOne(query);

      if (result) {
        throw new BadRequestException('A subject with this name already exists. Please enter another name/code for your subject.');
      } else {
        if (request.code) {
          subCode = mainHelper.padWithZeroes(request.code.toUpperCase(), 10);
        } else {
          const str = request.name;
          const matches = str.match(/\b(\w)/g);
          const strLength = matches.length;
          const acronym = matches.join('');
          let newCode = acronym.toUpperCase() + mainHelper.getRandomCode(10 - strLength);
          let found = await this.subjectRepository.findOne({ code: newCode });

          while (found != null) {
            newCode = acronym + mainHelper.getRandomCode(10 - strLength);
            found = await this.subjectRepository.findOne({ code: newCode });
          }
          subCode = newCode;
        }
      }

      const newSubject = await this.subjectRepository.create({
        name: request.name,
        code: subCode,
        programs: request.programs,
        isAllowReuse: roleHelper.canSeeGlobalContents(request.user.roles) ? 'global' : 'self',
        createdBy: new ObjectId(request.user._id),
        slugfly: slugfly,
        location: roleHelper.canOnlySeeLocationContents(request.user.roles) ? new ObjectId(request.user.activeLocation) : undefined,
      });

      await this.subjectRepository.updateOne(
        { _id: request.user._id },
        { $push: { subjects: newSubject._id } },
      );

      if (request.user.roles.includes('director') && request.user.activeLocation) {
        // add this program to location
        this.locationRepository.setInstanceKey(instancekey);
        await this.locationRepository.updateOne(
          { _id: new ObjectId(request.user.activeLocation) },
          { $addToSet: { subjects: newSubject._id } }
        );
      }

      // update subject list in program
      this.programRepository.setInstanceKey(instancekey);
      await this.programRepository.updateMany(
        { _id: { $in: newSubject.programs } },
        { $addToSet: { subjects: newSubject._id } },
      );
      
      return newSubject;

    } catch (error) {
      console.log(error);      
      if(error instanceof BadRequestException){
        throw new GrpcInvalidArgumentException(error.message)
      }
      throw new GrpcInternalException(error);
    }
  }

  async getSubject(request: GetAllSubjectRequest) {
    try {      
      const instancekey = request.instancekey;
      this.subjectRepository.setInstanceKey(instancekey);
      let filter: any = { active: true };

      if (request.user) {
        if (request.user.roles.includes('publisher')) {
          filter._id = { $in: request.user.subjects.map(s => new ObjectId(s)) };          
        }
        else if (!request.user.roles.includes('admin') && request.user.activeLocation) {          
          const inst = await this.locationRepository.findOne(
            { _id: new ObjectId(request.user.activeLocation) },
            { subjects: 1 }
          );
          if (inst) {
            filter._id = { $in: inst.subjects };
          }
        }
      }
      
      let subjects: any = await this.subjectRepository.find(filter, { name: 1, slugfly: 1, units: 1 }, { sort: { 'slugfly': 1 } });
      if(request.query.unit){
        subjects = await this.subjectRepository.populate(subjects, { path: 'units', select: 'name', options: { lean: true } })
      }
      return { response: subjects };

    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getOneSubject(request: GetOneSubjectRequest) {
    try {     
      const instancekey = request.instancekey;
      this.subjectRepository.setInstanceKey(instancekey);
      const subject = await this.subjectRepository.findById(request._id);
      if (!subject) {
        throw ('Subject not found');
      }
      
      return {
        ...subject
      };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async updateSubject(request: UpdateSubjectRequest) {
    try {
      const { _id, name, programs, instancekey, user } = request;
      this.subjectRepository.setInstanceKey(instancekey);
      const slugfly = slugify(name, { lower: true });
      const query = {
        _id: { $ne: _id },
        slugfly: slugfly,
        programs: programs,
      };

      let subjectToUpdate = await this.subjectRepository.findOne(query);
      if (subjectToUpdate) {
        throw ('A subject with this name already exists. Please enter another name for your subject.');
      }

      let subject = await this.subjectRepository.findById(_id);
      // Store the old programs
      const oldPrograms = subject.programs;
      const oldName = subject.name;
      const needNameUpdate = oldName !== name;

      const update: any = {
        slugfly: slugfly,
        name: name,
        programs: programs,
        updatedAt: Date.now(),
        lastModifiedBy: user._id,
      };

      if (request.tags) {
        update.tags = request.tags;
      }
      const updatedSubject = await this.subjectRepository.findByIdAndUpdate(
        _id,
        update,
        { new: true },
      );

      if (!updatedSubject) {
        throw new Error('Subject not found');
      }

      this.programRepository.setInstanceKey(instancekey);

      // Update programs
      const toRemove = oldPrograms.filter(i => !updatedSubject.programs.includes(new Types.ObjectId(i)));

      if (toRemove.length) {
        await this.programRepository.updateMany(
          { _id: { $in: toRemove } },
          { $pull: { subjects: updatedSubject._id } }
        );
      }
      await this.programRepository.updateMany(
        { _id: { $in: programs } },
        { $addToSet: { subjects: updatedSubject._id } }
      );

      // Update related entities
      if (needNameUpdate) {
        this.practiceSetRepository.setInstanceKey(instancekey);
        this.questionRepository.setInstanceKey(instancekey);
        this.attemptRepository.setInstanceKey(instancekey);
        this.attemptDetailRepository.setInstanceKey(instancekey);

        await this.practiceSetRepository.updateMany(
          { "subjects._id": _id },
          { $set: { "subjects.$.name": name } }
        );

        await this.questionRepository.updateMany(
          { "subject._id": _id },
          { $set: { "subject.name": name } }
        );

        await this.attemptRepository.updateMany(
          { "practiceSetInfo.subjects._id": _id },
          { $set: { "practiceSetInfo.subjects.$.name": name, "subjects.$.name": name } }
        );

        await this.attemptDetailRepository.updateMany(
          { "QA.subject._id": _id },
          { $set: { "QA.$.subject.name": name } }
        );
      }

      return { response: updatedSubject };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async deleteSubject(request: DeleteSubjectRequest) {
    try {
      const { _id, instancekey, user } = request;
      this.subjectRepository.setInstanceKey(instancekey);
      this.programRepository.setInstanceKey(instancekey);
      const updatedSubject = await this.subjectRepository.findByIdAndUpdate(
        _id,
        {
          active: false,
          lastModifiedBy: user._id,
        },
        { new: true },
      );

      if (!updatedSubject) {
        throw ('Subject not found');
      }

      await this.programRepository.updateMany(
        { _id: { $in: updatedSubject.programs } },
        {
          $pull: { subjects: updatedSubject._id },
          $set: { lastModifiedBy: user._id },
        },
      );

      return updatedSubject;
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getMySubjects(request: GetMySubjectsRequest) {
    try {
      const instancekey = request.instancekey;
      this.subjectRepository.setInstanceKey(instancekey);
      this.userRepository.setInstanceKey(instancekey);

      let subs = [];
      if (request.queryUser) {
        const userSubs = await this.userRepository.findById(request.queryUser);
        subs = userSubs.subjects;
      } else {
        subs = request.user.subjects.map(s => new ObjectId(s));
      }
      if (!request.unit && !request.topic) {
        const data = await this.subjectRepository.find({ _id: { $in: subs }, active: true }, { name: 1 });
        return { response: data };
      }
      if (!request.topic) {
        let subjects: any = await this.subjectRepository.find({ _id: { $in: subs }, active: true }, { name: 1, units: 1 })
        subjects = await this.subjectRepository.populate(subjects, { path: 'units', select: 'name' });

        return { response: subjects };
      }
      const subjects = await this.subjectRepository.aggregate([
        { $match: { _id: { $in: subs }, active: true } },
        { $unwind: '$units' },
        {
          $lookup:
          {
            from: 'units',
            localField: 'units',
            foreignField: '_id',
            as: 'uinfo'
          }
        },
        {
          $unwind: '$uinfo'
        },
        {
          $unwind: '$uinfo.topics'
        },
        {
          $lookup: {
            from: 'topics',
            let: { 'tid': "$uinfo.topics" },
            pipeline: [{
              $match: {
                active: true,
                $expr: { $eq: ["$_id", "$$tid"] }
              }
            },
            { $project: { name: 1 } }
            ],
            as: 'tinfo'
          }
        },
        {
          $unwind: '$tinfo'
        },
        {
          $group: {
            _id: { subject: '$_id', unit: '$units' },
            subName: { $first: '$name' },
            unitName: { $first: '$uinfo.name' },
            topics: {
              $push: {
                _id: '$tinfo._id',
                name: '$tinfo.name'
              }
            }
          }
        },
        {
          $group: {
            _id: '$_id.subject',
            name: { $first: '$subName' },
            units: {
              $push: {
                _id: '$_id.unit',
                name: '$unitName',
                topics: '$topics'
              }
            }
          }
        }
      ]);
      console.log('sub', JSON.stringify(subjects));
      return { response: subjects };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getSubjectBySlug(request: GetSubjectBySlugReq): Promise<GetOneSubjectResponse> {
    try {
      const { subjectName, program, instancekey } = request;

      const query: any = {};
      if (subjectName && program) {
        query.slugfly = slugify(subjectName, { lower: true });
        query.programs = { $in: program };
      } else if (subjectName) {
        query.slugfly = slugify(subjectName, { lower: true });
      } else if (program) {
        query.programs = { $in: program };
      } else {
        throw ('Invalid request. Either subjectName or program must be provided.');
      }

      this.subjectRepository.setInstanceKey(instancekey);
      const subject = await this.subjectRepository.findOne(query);
      if (!subject) {
        throw ('No subject found. Please enter another name for your subject.');
      }
      return { response: subject };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getTeachersBySubjects(request: GetTeachersBySubjectsReq): Promise<GetTeachersBySubjectsRes> {
    try {
      const { user, instancekey } = request;
      let userQuery: any = {
        roles: { $in: ['teacher', 'mentor', 'operator'] },
        // role: { $in: ['teacher', 'mentor', 'operator'] },
        isActive: true,
        subjects: { $in: user.subjects.map(s => new ObjectId(s)) }
      };

      if (user.activeLocation) {
        userQuery.locations = new ObjectId(user.activeLocation);
      }
      this.userRepository.setInstanceKey(instancekey);
      const users = await this.userRepository.find(userQuery, { name: 1 }, { lean: true });
      if (!users) {
        throw ('No teachers found.');
      }

      return { response: users };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getAdaptiveSubjects(request: GetTeachersBySubjectsReq): Promise<GetSubjectResponse> {
    try {
      const { user, instancekey } = request;
      const userSubject = user.subjects.map(s => new ObjectId(s))

      this.subjectRepository.setInstanceKey(instancekey);
      let subjects: any = await this.subjectRepository.find({
        _id: { $in: userSubject },
        adaptive: true, 
        active: true
      }, 'name units');

      subjects = await this.subjectRepository.populate(subjects, { path: 'units', select: 'name', options: { lean: true } })

      if (!subjects) {
        throw ('No subjects found.');
      }

      return { response: subjects };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async updateSubjectStatus(request: UpdateSubStatusReq) {
    try {
      const { _id, isAllowReuse, active, instancekey, user } = request;
      this.subjectRepository.setInstanceKey(instancekey);

      const update: any = {
        lastModifiedBy: new ObjectId(user._id),
        updatedAt: new Date(),
      };

      if (isAllowReuse !== undefined) {
        update.isAllowReuse = isAllowReuse;
      } else {
        update.active = active;
      }

      const updatedSubject = await this.subjectRepository.findOneAndUpdate(
        { _id: _id }, update, { new: true }
      );
      if (!updatedSubject) {
        throw ('Subject not found');
      }

      return { response: updatedSubject };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getUnitsBySubject(request: GetUnitsBySubReq): Promise<GetUnitsBySubRes> {
    try {
      const filter: any = {};
      if (request.subjects) {
        const subjectIds = request.subjects.split(',').map((s) => new Types.ObjectId(s));
        filter._id = { $in: subjectIds };
        filter.active = true;

        this.subjectRepository.setInstanceKey(request.instancekey);
        let subjects: any = await this.subjectRepository.find(filter, 'name units');
        subjects = await this.subjectRepository.populate(subjects, { path: 'units', select: '_id name', options: { lean: true } });
        return { response: subjects };
      }
      throw ('Subject not found');
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getTopicsByUnit(request: GetTopicsByUnitReq): Promise<GetTopicsByUnitRes> {
    try {
      const filter: any = {};
      if (request.units) {
        const unitIds = request.units.split(',').map((s) => new Types.ObjectId(s));
        filter._id = { $in: unitIds };
        filter.active = true;

        this.unitRepository.setInstanceKey(request.instancekey);
        let units: any = await this.unitRepository.find(filter, 'name topics');
        units = await this.unitRepository.populate(units, { path: 'topics', select: '_id name', options: { lean: true } });
        return { response: units };
      }
      throw ('Unit not found');
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getInstituteSubjects(request: GetInstSubReq) {
    try {
      const { activeOnly, page, limit, searchText, instancekey, user } = request;
      this.locationRepository.setInstanceKey(instancekey);
      this.subjectRepository.setInstanceKey(instancekey);
      const inst = await this.locationRepository.findOne({ _id: user.activeLocation });

      if (typeof activeOnly === 'string' && activeOnly === 'true') {
        const subjects = await this.subjectRepository.find({ _id: { $in: inst.subjects }, active: true }, { name: 1 });
        return { response: subjects };
      }

      let reqPage = (page) ? page : 1;
      let reqLimit = (limit) ? limit : 20;
      let skip = (reqPage - 1) * reqLimit;

      let filter: any = {
        $and: [
          {
            $or: [{ _id: { $in: inst.subjects } }, { location: inst._id }],
          },
        ],
      };

      if (searchText) {
        filter.$and.push({
          $or: [
            { name: new RegExp(searchText, 'i') },
            { tags: new RegExp(searchText, 'i') },
          ],
        });
      }

      const subjects = await this.subjectRepository.aggregate([
        {
          $match: filter,
        },
        {
          $sort: { name: 1 },
        },
        {
          $skip: skip
        },
        {
          $limit: reqLimit
        },
        {
          $project: {
            subjectName: '$name',
            updatedAt: 1,
            createdBy: 1,
            active: 1,
            units: 1,
            programs: 1,
          },
        },
      ]);

      await Promise.all(
        subjects.map(async (sub) => {
          sub.unitCount = sub.units.length;
          if (sub.unitCount) {
            this.topicRepository.setInstanceKey(instancekey);
            sub.topicCount = await this.topicRepository.countDocuments({
              unit: { $in: sub.units },
            });
          } else {
            sub.topicCount = 0;
          }

          this.programRepository.setInstanceKey(instancekey);
          sub.programs = await this.programRepository.distinct('name', {
            _id: { $in: sub.programs },
          });

          this.questionRepository.setInstanceKey(instancekey);
          sub.questionCount = await this.questionRepository.countDocuments({
            'subject._id': sub._id,
          });
          delete sub.units;
        }),
      );
      console.log('sss', subjects)
      return { response: subjects };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getPublisherSubjects(request: GetPubSubReq) {
    try {
      const { page, limit, searchText, instancekey, user } = request;
      let reqPage = (page) ? page : 1;
      let reqLimit = (limit) ? limit : 20;
      let skip = (reqPage - 1) * reqLimit;

      let filter: any = {
        $and: [
          {
            $or: [{ _id: { $in: user.subjects } }, { createdBy: new Types.ObjectId(user._id) }],
          },
        ],
      };

      if (searchText) {
        filter.$and.push({
          $or: [
            { name: new RegExp(searchText, 'i') },
            { tags: new RegExp(searchText, 'i') },
          ],
        });
      }

      this.subjectRepository.setInstanceKey(instancekey);
      const subjects = await this.subjectRepository.aggregate([
        {
          $match: filter,
        },
        {
          $sort: { name: 1 },
        },
        {
          $skip: skip
        },
        {
          $limit: reqLimit
        },
        {
          $project: {
            subjectName: '$name',
            updatedAt: 1,
            createdBy: 1,
            active: 1,
            units: 1,
            programs: 1,
            isAllowReuse: 1,
          },
        },
      ]);

      await Promise.all(
        subjects.map(async (sub) => {
          sub.unitCount = sub.units.length;
          if (sub.unitCount) {
            this.topicRepository.setInstanceKey(instancekey);
            sub.topicCount = await this.topicRepository.countDocuments({
              unit: { $in: sub.units },
            });
          } else {
            sub.topicCount = 0;
          }

          this.programRepository.setInstanceKey(instancekey);
          sub.programs = await this.programRepository.distinct('name', {
            _id: { $in: sub.programs },
          });

          this.questionRepository.setInstanceKey(instancekey);
          sub.questionCount = await this.questionRepository.countDocuments({
            'subject._id': sub._id,
          });
          delete sub.units;
        }),
      );

      return { response: subjects };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getSubjectList(request: GetPubSubReq) {
    try {
      const { page, limit, searchText, instancekey, user } = request;
      let reqPage = (page) ? page : 1;
      let reqLimit = (limit) ? limit : 20;
      let skip = (reqPage - 1) * reqLimit;

      let filter: any = {};

      if (!user.roles.includes('admin')) {
        filter._id = { $in: user.subjects.map(s => new ObjectId(s)) };
      }

      if (searchText) {
        const regexText = new RegExp(searchText, 'i');
        filter.name = regexText;
      }

      this.subjectRepository.setInstanceKey(instancekey);
      const subjects = await this.subjectRepository.aggregate([
        {
          $match: filter,
        },
        {
          $sort: { name: 1 },
        },
        {
          $skip: skip
        },
        {
          $limit: reqLimit
        },
        {
          $project: {
            subjectName: '$name',
            updatedAt: 1,
            createdBy: 1,
            active: 1,
            units: 1,
            programs: 1,
            isAllowReuse: 1,
          },
        },
      ]);

      await Promise.all(
        subjects.map(async (sub) => {
          sub.unitCount = sub.units.length;
          if (sub.unitCount) {
            this.topicRepository.setInstanceKey(instancekey);
            sub.topicCount = await this.topicRepository.countDocuments({
              unit: { $in: sub.units },
            });
          } else {
            sub.topicCount = 0;
          }

          this.programRepository.setInstanceKey(instancekey);
          sub.programs = await this.programRepository.distinct('name', {
            _id: { $in: sub.programs },
          });

          this.questionRepository.setInstanceKey(instancekey);
          sub.questionCount = await this.questionRepository.countDocuments({
            'subject._id': sub._id,
          });
          delete sub.units;
        }),
      );

      return { response: subjects };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getSubjectsInAllExams(request: GetAllSubjectRequest) {
    try {
      const { instancekey, user } = request;
      this.subjectRepository.setInstanceKey(instancekey);
      let subjects: any;

      if (user) {
        subjects = await this.subjectRepository.find(
          { _id: { $in: user.subjects.map(s => new ObjectId(s)) } },
          {
            _id: 1,
            name: 1,
            // programs: 1,
            imageUrl: 1
          },
          { sort: { 'name': 1 } }
        );
      } else {
        this.practiceSetRepository.setInstanceKey(instancekey);
        const distinctSubjects: any = await this.practiceSetRepository.distinct('subjects._id', {});
        if (distinctSubjects.length > 0) {
          subjects = await this.subjectRepository.find(
            { _id: { $in: distinctSubjects } },
            { _id: 1, name: 1, programs: 1, imageUrl: 1 },
            { sort: { 'name': 1 } }
          );
          subjects = await this.subjectRepository.populate(
            subjects,
            { path: 'programs', select: 'name', options: { lean: true } }
          );
        } else {
          subjects = [];
        }
      }
      console.log('sub', subjects);
      
      return { response: subjects };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getSubjectsByTest(request: GetSubByTestReq) {
    try {
      const { testId, testDetails, instancekey, user } = request;
      let projection = 'subjects units';
      if (testDetails) {
        projection += ' ' + testDetails;
      }
      this.practiceSetRepository.setInstanceKey(instancekey);
      let test = await this.practiceSetRepository.findById(testId, projection);
      if (!test) {
        throw ('No test found.');
      }

      let subs = test.subjects.map(s => s._id);
      let units = test.units.map(u => u._id);

      let subjects = await this.subjectRepository.aggregate([
        { $match: { _id: { $in: subs }, active: true } },
        { $unwind: '$units' },
        { $match: { units: { $in: units } } },
        {
          $lookup: {
            from: 'units',
            localField: 'units',
            foreignField: '_id',
            as: 'uinfo'
          }
        },
        { $unwind: '$uinfo' },
        { $unwind: '$uinfo.topics' },
        {
          $lookup: {
            from: 'topics',
            let: { tid: '$uinfo.topics' },
            pipeline: [
              { $match: { active: true, $expr: { $eq: ['$_id', '$$tid'] } } },
              { $project: { name: 1 } }
            ],
            as: 'tinfo'
          }
        },
        { $unwind: '$tinfo' },
        {
          $group: {
            _id: { subject: '$_id', unit: '$units' },
            subName: { $first: '$name' },
            unitName: { $first: '$uinfo.name' },
            topics: {
              $push: {
                _id: '$tinfo._id',
                name: '$tinfo.name'
              }
            }
          }
        },
        {
          $group: {
            _id: '$_id.subject',
            name: { $first: '$subName' },
            units: {
              $push: {
                _id: '$_id.unit',
                name: '$unitName',
                topics: '$topics'
              }
            }
          }
        }
      ]);

      if (testDetails) {
        delete test.subjects;
        delete test.units;

        return { test, subjects };
      } else {
        return { subjects };
      }

    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getAttemptTrend(request: GetAttemptTrendByGradeReq) {
    try {
      const { query, instancekey } = request;

      const daysValue = Number(query.value);
      const aggregationPipeline = [
        {
          $match: {
            createdAt: {
              $gt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * daysValue),
            },
            "practiceSetInfo.grades._id": new ObjectId(query.grade),
          },
        },
        {
          $project: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
            day: {
              $dayOfMonth: "$createdAt",
            },
          },
        },
        {
          $group: {
            _id: {
              year: "$year",
              month: "$month",
              day: "$day",
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ];

      this.attemptRepository.setInstanceKey(instancekey);
      const result = await this.attemptRepository.aggregate(aggregationPipeline);

      return { response: result };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getSignUpTrend(request: GetAttemptTrendByGradeReq) {
    try {
      const { query, instancekey } = request;

      // Ensure 'value' is treated as a number
      const daysValue = Number(query.value);

      const aggregationPipeline = [
        {
          $unwind: "$grade",
        },
        {
          $match: {
            createdAt: {
              $gt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * daysValue),
            },
            grade: new ObjectId(query.grade),
          },
        },
        {
          $project: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
            day: {
              $dayOfMonth: "$createdAt",
            },
          },
        },
        {
          $group: {
            _id: {
              year: "$year",
              month: "$month",
              day: "$day",
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ];

      this.userRepository.setInstanceKey(instancekey);
      const result = await this.userRepository.aggregate(aggregationPipeline);

      return { response: result };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async attemptTrend(request: AttemptTrendReq) {
    try {
      const { query, instancekey, user } = request;
      let filter: any = {};
      let condition: any = { isAbandoned: false };

      if (query.day) {
        const day = Number(query.day);
        const startDate = this.getStringDate(day);
        condition["createdAt_day"] = {
          "$gte": { "date": startDate }
        };
      }

      if (user.roles.includes(config.roles.mentor)) {
        const listUser = await this.studentBus.getUserIdList(request);
        filter['user'] = { $in: listUser };
        filter.isAbandoned = false;

        const result = await this.aggregateAttempts(instancekey, filter, condition);
        return { response: result };

      } else if (user.roles.includes(config.roles.centerHead)) {
        if (user.locations.length > 0) {
          this.userRepository.setInstanceKey(instancekey);
          const teacherList = await this.userRepository.find({
            roles: { $in: [config.roles.teacher] },
            locations: { $in: user.locations }
          }, { name: 1 });

          if (teacherList.length > 0) {
            const tIds = teacherList.map(t => t._id);
            filter["createdBy.user"] = { $in: tIds };

            const result = await this.aggregateAttempts(instancekey, filter, condition);
            return { response: result };
          } else {
            return { response: [] };
          }
        } else {
          return { response: [] };
        }

      } else {
        if (user.roles.includes(config.roles.teacher) || user.roles.includes(config.roles.publisher)) {
          filter['practiceSetInfo.createdBy'] = new ObjectId(user._id);
        }

        const result = await this.aggregateAttempts(instancekey, filter, condition);
        return { response: result };
      }
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async signUpTrend(request: AttemptTrendReq) {
    try {
      const { query, instancekey, user } = request;
      let condition: any = { roles: 'student' };
      if (query.day) {
        const day = Number(query.day);
        const startDate = this.getStringDate(day);
        condition["createdAt~~~day"] = {
          "$gte": {
            "date": startDate
          }
        };
      }

      let filter: any = {};
      if (user.grade && user.grade.length > 0) {
        filter.grade = { $in: user.grade.map(id => new Types.ObjectId(id)) };
      }

      this.userRepository.setInstanceKey(instancekey);
      const result = await this.userRepository.aggregate([
        {
          "$match": filter
        },
        {
          "$project": {
            'roles': 1,
            "createdAt~~~day": {
              "$let": {
                "vars": {
                  "field": "$createdAt"
                },
                "in": {
                  "date": {
                    "$dateToString": {
                      "format": "%Y-%m-%d",
                      "date": "$$field"
                    }
                  }
                }
              }
            },
            "createdAt~~~week": {
              "$let": {
                "vars": {
                  "field": "$createdAt"
                },
                "in": {
                  "date": {
                    "$dateToString": {
                      "format": "%Y-%m-%d",
                      "date": {
                        "$subtract": ["$$field", {
                          "$multiply": [{
                            "$subtract": [{
                              "$dayOfWeek": "$$field"
                            }, 1]
                          }, 86400000]
                        }]
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "$match": condition
        },
        {
          "$project": {
            "_id": "$_id",
            "___group": {
              "createdAt~~~week": "$createdAt~~~week"
            }
          }
        },
        {
          "$group": {
            "_id": "$___group",
            "count": {
              "$sum": 1
            }
          }
        },
        {
          "$sort": {
            "_id": 1
          }
        },
        {
          "$project": {
            "_id": false,
            "count": true,
            "createdAt": "$_id.createdAt~~~week"
          }
        },
        {
          "$sort": {
            "createdAt": 1
          }
        }
      ]);

      return { response: result };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async questionAddedTrend(request: AttemptTrendReq) {
    try {
      const { query, instancekey, user } = request;
      const condition: any = {};
      const filter: any = {};

      this.userRepository.setInstanceKey(instancekey);
      this.questionRepository.setInstanceKey(instancekey);

      if (query.day) {
        const lastDate = new Date();
        lastDate.setTime(query.day);
        filter.createdAt = { $gte: new Date(lastDate) };
      }

      if (user.roles.includes(config.roles.centerHead)) {
        const cond: any = {};
        cond.roles = config.roles.teacher;
        if (user.locations.length > 0) {
          cond.locations = { $in: user.locations };
          const teacherList = await this.userRepository.find(cond, { name: 1 });
          if (teacherList.length > 0) {
            const tIds = teacherList.map((tId) => tId._id);
            filter.user = { $in: tIds };
            const trend = await this.aggregateQuestion(filter, condition);
            return { trend: trend };
          } else {
            return { trend: [] };
          }
        } else {
          return { trend: [] };
        }
      } else {
        if (user.roles.includes(config.roles.teacher) || user.roles.includes(config.roles.publisher)) {
          filter.user = user._id;
        }

        const trend = await this.aggregateQuestion(filter, condition);
        return { trend: trend };
      }
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async loginTrend(request: GetAttemptTrendByGradeReq) {
    try {
      const { query, instancekey } = request;
      const condition: any = {};

      if (query.day) {
        const startDate = this.getStringDate(query.day);
        condition['createdAt_day'] = {
          $gte: { date: startDate },
        };
      }

      this.userRepository.setInstanceKey(instancekey);
      const trend = await this.userRepository.aggregate([
        { $match: { roles: { $in: ['student'] } } },
        {
          $project: {
            createdAt: {
              $let: {
                vars: { field: '$createdAt' },
                in: {
                  date: {
                    $dateToString: {
                      format: '%Y-%m-%d',
                      date: {
                        $subtract: [
                          '$$field',
                          {
                            $multiply: [
                              {
                                $subtract: [
                                  { $dayOfWeek: '$$field' },
                                  1,
                                ],
                              },
                              86400000,
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            createdAt_day: {
              $let: {
                vars: { field: '$createdAt' },
                in: {
                  date: {
                    $dateToString: { format: '%Y-%m-%d', date: '$$field' },
                  },
                },
              },
            },
          },
        },
        { $match: condition },
        {
          $project: {
            _id: '$_id',
            group: { createdAt: '$createdAt' },
          },
        },
        {
          $group: {
            _id: '$group',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: false,
            count: true,
            createdAt: '$_id.createdAt',
          },
        },
        { $sort: { createdAt: 1 } },
      ]);

      return { trend: trend };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async highestAttemptedStudent(request: AttemptTrendReq) {
    try {
      const { query, instancekey, user } = request;

      const filter: any = {};
      const condition: any = { isAbandoned: false };

      if (query.day) {
        const startDate = this.getStringDate(query.day);
        condition['createdAt_day'] = { $gte: { date: startDate } };
      }

      const limit = query.limit ? query.limit : 10;
      if (user.roles.includes(config.roles.mentor)) {
        const listUser = await this.studentBus.getUserIdList(request);

        filter['user'] = { $in: listUser };
        filter.isAbandoned = false;
      } else if (user.roles.includes('centerHead')) {
        if (user.locations.length > 0) {
          const teacherList = await this.userRepository.find(
            { roles: { $in: ['teacher'] }, locations: { $in: user.locations } },
            { name: 1 }
          );

          if (teacherList.length > 0) {
            const tIds = teacherList.map(teacher => teacher._id);
            filter['createdBy.user'] = { $in: tIds };
          } else {
            return { response: [] };
          }
        }
        else {
          return { response: [] };
        }
      } else {
        if (user.roles.includes(config.roles.teacher) || user.roles.includes(config.roles.publisher)) {
          filter['createdBy.user'] = new Types.ObjectId(user._id);
        }
      }

      this.attemptRepository.setInstanceKey(instancekey);
      const response = await this.attemptRepository.aggregate([
        { $match: filter },
        {
          $project: {
            createdAt_day: {
              $let: {
                vars: { field: '$createdAt' },
                in: {
                  date: {
                    $dateToString: { format: '%Y-%m-%d', date: '$$field' },
                  },
                },
              },
            },
            isAbandoned: '$isAbandoned',
            studentName: '$studentName',
          },
        },
        { $match: condition },
        {
          $project: {
            _id: '$_id',
            group: { studentName: '$studentName' },
          },
        },
        {
          $group: {
            _id: '$group',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: false,
            count: true,
            studentName: '$_id.studentName',
          },
        },
        { $sort: { count: -1, studentName: 1 } },
        { $limit: limit },
      ]);

      return { response: response };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async mostAbandonedStudent(request: AttemptTrendReq) {
    try {
      const { query, instancekey, user } = request;

      const filter: any = {};
      const condition: any = { isAbandoned: true };

      if (query.day) {
        const startDate = this.getStringDate(query.day);
        condition['createdAt_day'] = { $gte: { date: startDate } };
      }

      const limit = query.limit ? query.limit : 10;
      if (user.roles.includes(config.roles.mentor)) {
        const listUser = await this.studentBus.getUserIdList(request);

        filter['user'] = { $in: listUser };
      } else if (user.roles.includes('centerHead')) {
        if (user.locations.length > 0) {
          const teacherList = await this.userRepository.find(
            { roles: { $in: ['teacher'] }, locations: { $in: user.locations } },
            { name: 1 }
          );

          if (teacherList.length > 0) {
            const tIds = teacherList.map(teacher => teacher._id);
            filter['createdBy.user'] = { $in: tIds };
          } else {
            return { response: [] };
          }
        }
        else {
          return { response: [] };
        }
      } else {
        if (user.roles.includes(config.roles.teacher) || user.roles.includes(config.roles.publisher)) {
          filter['createdBy.user'] = new Types.ObjectId(user._id);
        }
      }

      this.attemptRepository.setInstanceKey(instancekey);
      const response = await this.attemptRepository.aggregate([
        { $match: filter },
        {
          $project: {
            createdAt_day: {
              $let: {
                vars: { field: '$createdAt' },
                in: {
                  date: {
                    $dateToString: { format: '%Y-%m-%d', date: '$$field' },
                  },
                },
              },
            },
            isAbandoned: '$isAbandoned',
            studentName: '$studentName',
          },
        },
        { $match: condition },
        {
          $project: {
            _id: '$_id',
            group: { studentName: '$studentName' },
          },
        },
        {
          $group: {
            _id: '$group',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: false,
            count: true,
            studentName: '$_id.studentName',
          },
        },
        { $sort: { count: -1, studentName: 1 } },
        { $limit: limit },
      ]);

      return { response: response };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async mostAbandonedTest(request: AttemptTrendReq) {
    try {
      const { query, instancekey, user } = request;

      const filter: any = {};
      const condition: any = { isAbandoned: true };

      if (query.day) {
        const startDate = this.getStringDate(query.day);
        condition['createdAt_day'] = { $gte: { date: startDate } };
      }

      const limit = query.limit ? query.limit : 10;
      if (user.roles.includes(config.roles.mentor)) {
        const listUser = await this.studentBus.getUserIdList(request);

        filter['user'] = { $in: listUser };
      } else {
        if (user.roles.includes(config.roles.teacher) || user.roles.includes(config.roles.publisher)) {
          filter['createdBy.user'] = new Types.ObjectId(user._id);
        }
      }

      this.attemptRepository.setInstanceKey(instancekey);
      const response = await this.attemptRepository.aggregate([
        { $match: filter },
        {
          $project: {
            createdAt: {
              $let: {
                vars: { field: '$createdAt' },
                in: { date: { $dateToString: { format: '%Y-%m-%d', date: '$$field' } } },
              },
            },
            isAbandoned: '$isAbandoned',
            title: '$practiceSetInfo.title',
            practiceSetInfo: '$practiceSetInfo',
          },
        },
        { $match: condition },
        {
          $project: {
            _id: '$_id',
            group: { title: '$title' },
          },
        },
        {
          $group: {
            _id: '$group',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: false,
            count: true,
            title: '$_id.title',
          },
        },
        { $sort: { count: -1, title: 1 } },
        { $limit: limit },
      ]);

      return { response: response };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async importSubjects(request: ImportSubjectsReq): Promise<any> {
    const { file, user, instancekey } = request;
    try {
      if (!file) {
        return { code: -1, error: "No file passed" };
      }
      const ext = path.extname(file.originalname);
      if (ext !== '.xls' && ext !== '.xlsx') {
        return { code: -2, error: "Wrong extension type" };
      }
      const settings = await this.redisCaching.getSetting(request);
      let defaultCountry: any = settings.countries.find(c => c.default)
      if (!defaultCountry) {
        defaultCountry = settings.countries[0]
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const excelToJson: any = xlsx.utils.sheet_to_json(worksheet);

      const invalidSubjects = [];
      const invalidPrograms = [];
      const masterData = [];
      for (let i = 0; i < excelToJson.length; i++) {
        excelToJson[i] = _.transform(excelToJson[i], (result, val, key) => {
          result[key.toLowerCase()] = val;
        });

        if (excelToJson[i].program && excelToJson[i].subject && excelToJson[i].unit && excelToJson[i].topic) {
          masterData.push({
            program: excelToJson[i].program,
            subject: excelToJson[i].subject,
            unit: excelToJson[i].unit,
            topic: excelToJson[i].topic,
          });
        } else {
          invalidSubjects.push({ invalid: excelToJson[i].subject ?? excelToJson[i].subject });
        }
      }

      this.subjectRepository.setInstanceKey(instancekey);
      this.topicRepository.setInstanceKey(instancekey);
      this.unitRepository.setInstanceKey(instancekey);
      this.programRepository.setInstanceKey(instancekey);

      for (const data of masterData) {
        const programSlug = slugify(data.program, { lower: true });
        const program = await this.programRepository.findOne({ slugfly: programSlug });
        if (program) {
          let subject = await this.subjectRepository.findOne(
            {
              slugfly: slugify(data.subject, { lower: true }),
              programs: { $in: [program._id] }
            }
          );
          if (!subject) {
            const subCode = await this.generateUniqueCode(data.subject, 'subject');
            subject = await this.subjectRepository.create({
              name: data.subject,
              code: subCode,
              slugfly: slugify(data.subject, { lower: true }),
              createdBy: new Types.ObjectId(user._id),
              programs: [program._id],
              location: !(user.roles.includes('admin') || user.roles.includes('publisher')) ? new Types.ObjectId(user.activeLocation) : undefined,
            });

            await this.programRepository.updateOne({ _id: program._id }, { $push: { subjects: subject._id } });
          }

          const unitQuery = { slugfly: slugify(data.unit, { lower: true }), subject: subject._id };
          let unit = await this.unitRepository.findOne(unitQuery);

          if (!unit) {
            const unitCode = await this.generateUniqueCode(data.unit, 'unit');
            const unitModel = {
              name: data.unit,
              subject: subject._id,
              code: unitCode,
              slugfly: slugify(data.unit, { lower: true }),
              createdBy: new Types.ObjectId(user._id),
            };

            unit = await this.unitRepository.create(unitModel);
            await this.subjectRepository.updateOne({ _id: subject._id }, { $addToSet: { units: unit._id } });
          }

          const topicQuery = { slugfly: slugify(data.topic, { lower: true }), unit: unit._id };
          let topic = await this.topicRepository.findOne(topicQuery);

          if (!topic) {
            const topicModel = {
              name: data.topic,
              unit: unit._id,
              slugfly: slugify(data.topic, { lower: true }),
              createdBy: new Types.ObjectId(user._id),
            };

            topic = await this.topicRepository.create(topicModel);
            await this.unitRepository.updateOne({ _id: unit._id }, { $addToSet: { topics: topic._id } });
          }
        } else {
          invalidPrograms.push(data.program);
        }
      }

      if (invalidPrograms && invalidPrograms.length > 0 || masterData.length === 0) {
        const options = {
          user: user.email,
          invalidPrograms,
          fileName: file.originalname,
          startDate: moment().format('MMM DD, YYYY HH:mm:ss'),
          subject: 'Subject upload processing failed'
        };
        await this.sendUploadSubjectErrorEmail(request, options);
        throw new InternalServerErrorException('Some programs may not be there, Some Data may lost');
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
