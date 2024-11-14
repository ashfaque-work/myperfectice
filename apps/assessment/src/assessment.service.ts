import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import {
  ArchiveRequest,
  ChangeOwnershipRequest,
  CheckQuestionsBeforePublishRequest,
  CheckSectionQuestionRequest,
  CheckTestCodeRequest,
  CompletedTestByClassRequest,
  CompletedTestStudentsByClassRequest,
  CountByAttemptRequest,
  CountByExamIdRequest,
  CountPracticeRequest,
  CreateAssessmentRequest,
  DestroyPracticeRequest,
  EndTestSessionRequest,
  EnrollTestRequest,
  ExportPDFRequest,
  ExportTestReq,
  FindByAttemptRequest,
  FindByExamIdRequest,
  FindForMentorRequest,
  FindForTeacherRequest,
  FindOneForSessionRequest,
  FindOneSharedRequest,
  FindOneWithQuestionsRequest,
  FindPracticeSetsRequest,
  FindProctorTestRequest,
  FindQuestionTemporaryRequest,
  FindTestBySessionRequest,
  FindTestByTestCodeRequest,
  FraudCheckRequest,
  GetAssessmentRequest,
  GetAttendanceStatusRequest,
  GetAttendantsRequest,
  GetAvgRatingByAssessmentRequest,
  GetBuyModeTestForTeacherRequest,
  GetByTestSeriesRequest,
  GetfeedbackRatingByAssessmentRequest,
  GetFeedbacksRequest,
  GetGameHistoryRequest,
  GetGameRequest,
  GetLastTestMeRequest,
  GetMaximumTestMarksRequest,
  GetMaximumTestMarksResponse,
  GetOpeningGamesRequest,
  GetPracticesetClassroomsRequest,
  GetPublicTestsRequest,
  GetQuestionFeedbackRequest,
  GetQuestionListRequest,
  GetSessionTimesRequest,
  GetStudentTakingTestRequest,
  GetTestLimitRequest,
  ImportFileReq,
  ImportQuestionRequest,
  ListPublisherRequest,
  ListUnitRequest,
  NewGameRequest,
  OngoingAttemptsRequest,
  OngoingTestByClassRequest,
  OngoingTestByUserRequest,
  PlayGameRequest,
  ProcessingDocmRequest,
  PublisherAssessmentRequest,
  RecentTestByUserRequest,
  RecommendedTestsBySubjectRequest,
  RemoveQuestionRequest,
  ResetIpRestrictionRequest,
  ResetTerminatedAttemptRequest,
  SaveAsRequest,
  SearchOneRequest,
  SearchTestsRequest,
  SearchUnitsRequest,
  ShareLinkRequest,
  StartTestSessionRequest,
  TestBySubjectRequest,
  TestByTopicRequest,
  TestDetailsRequest,
  TodayProctoredTestsRequest,
  TopicQuestionDistributionByCategoryRequest,
  UpcomingTestByClassRequest,
  UpcomingTestsRequest,
  UpdateAllQuestionSectionRequest,
  UpdateAssessmentRequest,
  UpdateAttendanceLimitRequest,
  UpdateAttendanceRequest,
  UpdateQuestionOrderRequest,
  UpdateQuestionSectionRequest
} from '@app/common/dto/assessment.dto';
import { ObjectId } from 'mongodb';
import { GrpcAbortedException, GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException, GrpcPermissionDeniedException } from 'nestjs-grpc-exceptions';
import { AttemptDetailRepository, AttemptRepository, BitlyService, canReadContentsOfAllUsers, ClassroomRepository, Constants, CourseRepository, escapeRegex, FavoriteRepository, FeedbackRepository, GameAttemptRepository, getUniqueCode, isEmail, LocationRepository, NotificationRepository, PsychoResultRepository, PushService, QuestionFeedbackRepository, QuestionRepository, RedisCaching, regexCode, regexName, Settings, SocketClientService, SubjectRepository, TestSeriesRepository, TopicRepository, UnitRepository, UserEnrollmentRepository, UserLogRepository, UsersRepository } from '@app/common';
import { PracticeSetRepository } from '../../../libs/common/src/database/repositories/practice-set.repository';
import { Types } from 'mongoose';
import * as _ from 'lodash';
import * as slug from 'slug';
import * as moment from 'moment';
import { EventBus } from '@app/common/components/eventBus';
import { AttendanceRepository } from '@app/common/database/repositories/attendance.repository';
import * as striptags from 'striptags';
import { config, getAssets } from '@app/common/config';
import { MessageCenter } from '@app/common/components/messageCenter';
import * as path from 'path';
import fs from 'fs';
import { QuestionBus } from '@app/common/bus';
import axios from 'axios';
import timeHelper from '@app/common/helpers/time-helper';
import * as util from '@app/common/Utils';
import { PracticeSetExcelService } from './practiceSetExcelService';
import * as Excel from 'exceljs';
import * as fsExtra from 'fs-extra';
import * as zipper from 'zip-local';
import slugify from 'slugify';
import { S3Service } from '@app/common/components/aws/s3.service';
import { AttemptProcessor } from '@app/common/components/AttemptProcessor';

@Injectable()
export class AssessmentService {
  constructor(private readonly practiceSetRepository: PracticeSetRepository,
    private readonly usersRepository: UsersRepository,
    private readonly locationRepository: LocationRepository,
    private readonly unitRepository: UnitRepository,
    private readonly classroomRepository: ClassroomRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly userLogRepository: UserLogRepository,
    private readonly topicRepository: TopicRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly attemptDetailRepository: AttemptDetailRepository,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly questionFeedbackRepository: QuestionFeedbackRepository,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly userEnrollmentRepository: UserEnrollmentRepository,
    private readonly favoriteRepository: FavoriteRepository,
    private readonly testSeriesRepository: TestSeriesRepository,
    private readonly courseRepository: CourseRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly psychoResultRepository: PsychoResultRepository,
    private readonly gameAttemptRepository: GameAttemptRepository,
    private readonly pushService: PushService,
    private readonly questionBus: QuestionBus,
    private readonly messageCenter: MessageCenter,
    private readonly eventBus: EventBus,
    private readonly bitly: BitlyService,
    private readonly settings: Settings,
    private readonly redisCache: RedisCaching,
    private readonly practiceSetExcelService: PracticeSetExcelService,
    private readonly socketClientService: SocketClientService,
    private readonly s3Service: S3Service,
    private readonly attemptProcessor: AttemptProcessor,

  ) { }


  // create assessment
  async createAssessment(request: CreateAssessmentRequest) {
    try {
      const settings = await this.redisCache.getSetting({ instancekey: request.instancekey }, function (settings: any) {
        return settings;
      })

      request.title = request.title.replace(/ {1,}/g, " ");
      const req = { ...request };

      let data = _.assign(request, {
        user: new Types.ObjectId(request.user._id),
        userInfo: {
          _id: new Types.ObjectId(request.user._id),
          name: request.user.name,
        }
      })

      await this.validateSubject(data);
      data = await this.validateUnit(data);
      data = await this.validatePracticeTitle(request, settings);
      const result = await this.newPractice(req, data);

      return { response: result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  private async validateSubject(data: any): Promise<void> {
    try {
      var subjects = data.subjects.map(g => new Types.ObjectId(g._id))
      this.subjectRepository.setInstanceKey(data.instancekey);
      const result = await this.subjectRepository.find({
        _id: {
          $in: subjects
        },
        active: false
      });
      if (result.length > 0) {
        throw 'Params: subject | The selected subject or examination is no longer active';
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async validateUnit(data: any) {
    try {
      var inactiveUnits = []
      var validUnits = []

      //  find subject have in list grade
      data.units.map(async (unit: any) => {
        this.unitRepository.setInstanceKey(data.instancekey)
        const rsUnit = await this.unitRepository.findById(new Types.ObjectId(unit._id));

        if (!rsUnit) {
          throw { message: `Params: unit |  Unit ${unit.name} does not exist` };
        }

        if (!rsUnit.active) {
          inactiveUnits.push(rsUnit.name);
        }

        const matchedSubject = data.subjects.find((e: any) => e._id === rsUnit.subject.toString());
        if (matchedSubject) {
          validUnits.push(rsUnit);
        }
      })
      if (inactiveUnits.length > 0) {
        throw { message: `Params: unit |  The selected units ${inactiveUnits.join()} is no longer active` };
      }
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async validatePracticeTitle(data: any, redisSettings: any) {
    try {
      /*find practice have same title*/
      var userFilter: any = {}
      userFilter.title = data.title
      if (!redisSettings.isWhiteLabelled) {
        userFilter.user = new Types.ObjectId(data.user._id);
      }
      this.practiceSetRepository.setInstanceKey(data.instancekey);
      const result = await this.practiceSetRepository.findOne(userFilter);
      if (result) {
        throw { message: 'Params: title |  A practice test with this name already exists in your list.' };
      }
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }


  private async addListEmailFromClassRoom(instancekey: string, practiceSet: any) {
    if (practiceSet.classRooms && practiceSet.classRooms.length > 0) {
      this.classroomRepository.setInstanceKey(instancekey)
      const results: any = await this.classroomRepository.aggregate([{
        $match: {
          _id: {
            $in: practiceSet.classRooms
          }
        }
      },
      {
        $unwind: '$students'
      },
      {
        $project: {
          'students.studentUserId': 1
        }
      }
      ]);
      if (results) {
        var listEmails = []
        results.forEach(sdt => {
          if (sdt.students.studentUserId) {
            listEmails.push(sdt.students.studentUserId)
          }
        })
        practiceSet.studentEmails = listEmails

        return practiceSet
      }
    } else {
      practiceSet.studentEmails = null
      return practiceSet
    }
  }

  private async newPractice(request: any, data: any) {
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey);
      var practiceSet = await this.practiceSetRepository.create(data);
      practiceSet = await this.addListEmailFromClassRoom(request.instancekey, practiceSet)

      practiceSet.countries = [{
        code: request.user.country.code,
        name: request.user.country.name,
        currency: request.user.country.currency,
        price: 0,
        marketPlacePrice: 0,
        discountValue: 0
      }]

      practiceSet.locations = []
      practiceSet.origin = 'institute'

      if (request.user.roles.includes('publisher')) {
        practiceSet.origin = 'publisher'
      } else if (request.user.activeLocation) {
        this.locationRepository.setInstanceKey(request.instancekey)
        let loc = await this.locationRepository.findOne({ _id: new Types.ObjectId(request.user.activeLocation) });
        if (loc.type == 'publisher') {
          practiceSet.origin = 'publisher'
        }
      }

      if (request.user.activeLocation) {
        practiceSet.locations.push(request.user.activeLocation)
      }
      const practiceId = practiceSet._id;
      delete practiceSet._id;
      
      const newPracticeset = await this.practiceSetRepository.findByIdAndSave(practiceId, practiceSet)

      return newPracticeset
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  // get all assessment
  async getAllAssessment() {
    try {
      const res = await this.practiceSetRepository.find({});
      return {
        response: res,
      };

    } catch (error) {
      console.error(error);
    }
  }

  // get assessment by-> id
  async getAssessment(getAssessmentRequest: GetAssessmentRequest) {
    try {
      const res = await this.practiceSetRepository.findOne(getAssessmentRequest);

      return { response: res };

    } catch (error) {
      console.error(error);
    }
  }

  public async logTestUpdate(request: UpdateAssessmentRequest) {
    try {
      this.userLogRepository.setInstanceKey(request.instancekey);
      await this.userLogRepository.updateOne({
        user: new Types.ObjectId(request.user._id),
        token: request.headers.authorization.split(' ')[1]
      }, {
        $push: {
          updateTests: {
            time: new Date(),
            data: request
          }
        },
      }, { strict: false });
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  private async withDrawn(request: any) {
    var userFilter: any = {}
    userFilter._id = new ObjectId(request._id)
    if (request.user.roles.includes('admin') || request.user.roles.includes('director')) { } else {
      userFilter.user = new ObjectId(request.user._id)
    }
    this.practiceSetRepository.setInstanceKey(request.instancekey);
    let practiceset = await this.practiceSetRepository.findOne(userFilter);
    if (!practiceset) {
      throw new NotFoundException('Practice test could not be withdrawn. Please contact Administrator.')
    }

    const result = await this.practiceSetRepository.updateOne(userFilter, {
      $set: {
        status: request.status,
        isShowResult: request.isShowResult,
        peerVisibility: request.peerVisibility,
        isShowAttempt: request.isShowAttempt,
        instructors: request.instructors
      }
    })
    await this.redisCache.del({ instancekey: request.instancekey, params: { id: request._id } }, 'findOneWithQuestionsAccessMode')
    await this.redisCache.del({ instancekey: request.instancekey, params: { id: request._id } }, 'findOneWithQuestionsAccessMode_meta')

    return result;
  }

  private async validateUpdatePracticeTitle(request: UpdateAssessmentRequest, title: string, settings: any) {
    var userFilter: any = {}
    userFilter._id = {
      $ne: request.id
    }
    userFilter.title = title
    if (!settings.isWhiteLabelled) {
      userFilter.user = new ObjectId(request.user._id);
    }

    this.practiceSetRepository.setInstanceKey(request.instancekey);
    const exPracticeSet = await this.practiceSetRepository.findOne(userFilter);

    if (exPracticeSet) {
      throw { message: 'Params: title |  A practice test with this name already exists in your list.' };
    }
  }

  async validateSubjectUnitTopic(instancekey: string, newPractice: any, oldPractice: any): Promise<boolean> {
    try {
      await this.validateUpdatePracticeSubject(instancekey, newPractice, oldPractice);
      await this.validateUpdatePracticeUnit(instancekey, newPractice, oldPractice);
      await this.validateUpdatePracticeTopic(instancekey, newPractice, oldPractice);

      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async validateUpdatePracticeSubject(instancekey: string, newPractice: any, oldPractice: any) {
    try {
      var filter = []
      filter.push({
        _id: new Types.ObjectId(newPractice.subjects[0]._id)
      })
      filter.push({
        $or: [{
          active: {
            $exists: false
          }
        }, {
          active: true
        }]
      })

      this.subjectRepository.setInstanceKey(instancekey);
      const result = await this.subjectRepository.findOne({ $and: filter });
      if (!result) {
        throw { message: `Params: subject | Subject ${newPractice.subjects[0].name} is inactive please select other subject.` }
      }
    } catch (error) {
      throw error
    }
  }

  private async validateUpdatePracticeUnit(instancekey: string, newPractice: any, oldPractice: any) {
    try {
      for (const unit of newPractice.units) {
        this.unitRepository.setInstanceKey(instancekey);
        const inactiveUnit = await this.unitRepository.findOne({
          _id: new Types.ObjectId(unit._id),
          active: false
        });

        if (inactiveUnit) {
          throw { message: `Params: unit | Unit ${unit.name} is inactive please select other unit.` };
        }
      }
    } catch (error) {
      throw error
    }
  }

  private async validateUpdatePracticeTopic(instancekey: string, newPractice: any, oldPractice: any) {
    var topicSelected = []
    var questionIds = oldPractice.questions.map(function (q) {
      return q.question
    })

    this.questionRepository.setInstanceKey(instancekey);
    const questions = await this.questionRepository.find({
      _id: {
        $in: questionIds
      }
    })
    if (questions.length == 0) {
      return
    }
    for (const question of questions) {
      topicSelected.push(question.topic._id);
    }

    if (topicSelected.length == 0) {
      return;
    }

    this.topicRepository.setInstanceKey(instancekey);
    const topic = await this.topicRepository.findOne({
      _id: {
        $in: topicSelected
      },
      active: false
    })

    if (!topic) {
      return;
    }
    throw { message: `Params: topic | Practice test contain quesion have topic ${topic.name} is inactive please select other topic.` };
  }

  private async validateCodeQuestionSettings(instancekey: string, newPractice: any) {
    try {
      // Check if the enabled code lang exist in all code question
      if (newPractice.questions) {
        this.questionRepository.setInstanceKey(instancekey);
        const result = await this.questionRepository.find({ _id: { $in: newPractice.questions.map(q => new Types.ObjectId(q.question)) }, category: 'code' }, { coding: 1 });
        if (result.length > 0) {
          var pushEnableLang = []
          result.forEach(function (r) {
            if (r.coding) {
              r.coding.forEach(c => {
                pushEnableLang.push(c.language)
              })
            }
          });
          pushEnableLang = _.uniq(pushEnableLang);
          newPractice.enabledCodeLang = pushEnableLang
        }

        return newPractice;
      } else {
        return newPractice;
      }
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  private async updatePracticeSetDraft(request: UpdateAssessmentRequest, practiceSet: any, dataBody: any, updatedSet: any) {
    try {
      var lastUnits = practiceSet.units
      updatedSet.subjects = dataBody.subjects
      updatedSet.units = dataBody.units

      if (lastUnits && lastUnits.length > 0) {
        var unitIds = lastUnits.map(s => new Types.ObjectId(s._id))
        var pipe = []
        pipe.push({
          $match: {
            _id: new Types.ObjectId(request.id)
          }
        })
        pipe.push({
          $unwind: '$questions'
        })
        pipe.push({
          $lookup: {
            from: 'questions',
            localField: 'questions.question',
            foreignField: '_id',
            as: 'questionInfo'
          }
        })
        pipe.push({
          $unwind: '$questionInfo'
        })
        pipe.push({
          $match: {
            'questionInfo.unit._id': {
              $in: unitIds
            }
          }
        })
        pipe.push({
          $group: {
            _id: '$questionInfo.unit._id',
            name: {
              $first: '$questionInfo.unit.name'
            }
          }
        })

        this.practiceSetRepository.setInstanceKey(request.instancekey);
        const result = await this.practiceSetRepository.aggregate(pipe);

        var listUnitHaveQ = result
        var haveErrors = false
        if (listUnitHaveQ && listUnitHaveQ.length > 0) {
          for (var i in listUnitHaveQ) {
            var post = _.findIndex(dataBody.units, function (data) {
              return data._id == listUnitHaveQ[i]._id
            })
            if (post == -1) {
              haveErrors = true
              throw { message: `Params: subject | You can't unselect one or more subject because they have one or more questions added. Plase delete those questions before unselecting these subjects.` }
            }
          }
          if (!haveErrors) {
            const result = this.countQsBeforUpdate(updatedSet);
            return result;
          }
        } else {
          const result = this.countQsBeforUpdate(updatedSet);
          return result;
        }
      } else {
        const result = this.countQsBeforUpdate(updatedSet)
        return result;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async countQsBeforUpdate(updatedSet: any) {
    updatedSet.totalQuestion = updatedSet.questions.length
    return updatedSet;
  }

  private async validatePracticeTest(request: UpdateAssessmentRequest, lastModifiedPractice, updatedSet) {
    if (updatedSet.attemptAllowed && updatedSet.attemptAllowed > 0) {
      if (updatedSet.attemptAllowed < lastModifiedPractice.attemptAllowed) {
        throw { message: `Params: 'attemptAllowed' | Number of attemps can't be reduced.` };
      }
    }
    if (updatedSet.isAdaptive) {
      var questionIds = updatedSet.questions.map(q => q.question)

      this.questionRepository.setInstanceKey(request.instancekey);
      const questions: any = await this.questionRepository.aggregate([{
        $match: {
          '_id': {
            $in: questionIds
          }
        }
      },
      {
        $project: {
          complexity: 1
        }
      },
      {
        $group: {
          _id: '$complexity',
          count: {
            $sum: 1
          }
        }
      }
      ])
      var min = 0
      if (questions.length > 0) {
        min = questions[0].count
        for (var i = 1; i < questions.length; i++) {
          min = Math.min(min, questions[i].count)
        }
      }
      if (questions.length < 3)
        min = 0
      if (min < 10 || min < updatedSet.questionsToDisplay)
        throw `Params: questions | Since you want to display ' + String(updatedSet.questionsToDisplay) + ' questions, Adaptive test must have at least '  {String(updatedSet.questionsToDisplay)} questions of every difficulty level (easy, medium and hard).`

      for (const unit of updatedSet.units) {
        const isValid = await this.validateUnitBeforePublish(request, lastModifiedPractice, unit);
        if (!isValid) {
          const subIndex = updatedSet.units.indexOf(unit);
          if (subIndex >= 0) {
            updatedSet.units.splice(subIndex, 1);
          }
          throw { message: `Params: unit | Detail: ${unit.name} | The practice test contains at least one unit with no question. Please add at least 1 question to those units and try again.` };
        }
      }
    }
  }

  private async validateUnitBeforePublish(request: UpdateAssessmentRequest, practice, unit) {
    try {
      var qIds = practice.questions.map(function (q) {
        return q.question
      })
      this.questionRepository.setInstanceKey(request.instancekey);
      const result = await this.questionRepository.findOne({
        _id: {
          $in: qIds
        },
        'unit._id': unit._id
      })
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async afterUpdatePractice(request: UpdateAssessmentRequest, practiceSet, updatedSet) {
    try {
      if (updatedSet.status == 'published') {
        if (practiceSet.status === 'draft') {
          await this.sendEmailPublished(request, updatedSet)
          // Push notification
          this.eventBus.emit('PracticeSet.published', {
            req: {
              headers: {
                instancekey: request.instancekey
              }
            },
            model: _.pick(updatedSet, '_id', 'subject', 'accessMode', 'user', 'title', 'userInfo', 'expiresOn')
          })
        }

        // get different email form InviteeEmails
        if (updatedSet.accessMode === 'invitation') {
          await this.compareEmailBeforeSend(request, practiceSet, updatedSet)
          await this.sendMailToDiffStudent(request, practiceSet, updatedSet)

          const result = await this.compareAttr('inviteePhones', practiceSet, updatedSet);
          this.getPhoneNumberAndSendSms(request, result, practiceSet)
        }
      }
      return;
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  private async getPhoneNumberAndSendSms(request: UpdateAssessmentRequest, result, practice) {
    try {
      const settings = await this.redisCache.getSetting({ instancekey: request.instancekey }, function (settings: any) {
        return settings;
      });

      this.usersRepository.setInstanceKey(request.instancekey);
      const users = await this.usersRepository.find({
        $or: [{
          phoneNumberFull: {
            $in: result
          }
        }]
      }, { phoneNumberFull: 1 }, { lean: true })

      if (users.length === 0) {
        return
      }
      var confirmUrl = settings.baseUrl + 'practice/' + practice._id
      try {
        const response = await this.bitly.shorten(confirmUrl);
        confirmUrl = response
      } catch (error) {
        Logger.error('bitly error %j', error)
      }

      for (const user of users) {
        if (!user.phoneNumberFull) {
          continue;
        }

        const smsNotification = await this.notificationRepository.create({
          modelId: 'sharePractice',
          isScheduled: true,
          isEmail: false,
          to: user.phoneNumberFull,
          sms: `We have shared a practice test with you. ${settings.baseUrl}practice/${practice._id}`,
        });
      }
      return;
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  private async sendMailToDiffStudent(req: UpdateAssessmentRequest, practiceSet, updatedSet) {
    try {
      if (updatedSet.classRooms && updatedSet.classRooms.length > 0) {
        var invationStudents = []
        var emailStudents = updatedSet.studentEmails
        var diffrentEmail = _.difference(emailStudents, updatedSet.inviteeEmails)
        if (diffrentEmail.length > 0 && practiceSet.status != 'draft') {
          invationStudents = _.difference(diffrentEmail, practiceSet.studentEmails)
        } else {
          invationStudents = diffrentEmail
        }
        if (invationStudents.length > 0) {
          this.invitationStudent(req, updatedSet, _.uniq(invationStudents, true))
        }
      }
      return;
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  private async compareAttr(attr, old, newValue) {
    try {
      var oldAttrValue = old[attr]
      if (typeof newValue[attr] == 'undefined' || (newValue[attr] && newValue[attr].length == 0) || !newValue[attr]) {
        return [];
      }
      newValue[attr] = newValue[attr].filter(function (n) {
        return n != undefined
      })
      var arrayValue = []
      var updatedValue = newValue[attr] ? newValue[attr] : []
      if (typeof old[attr] !== 'undefined' && old[attr] && old[attr].length > 0) {
        for (var i in oldAttrValue) {
          var indexDiff = _.findIndex(newValue[attr], function (index) {
            return oldAttrValue[i] === index
          })
          if (indexDiff > -1) {
            updatedValue.splice(indexDiff, 1)
          }
        }
        arrayValue = updatedValue ? updatedValue : []
      } else {
        arrayValue = updatedValue ? updatedValue : []
      }
      return arrayValue;
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  /**
 * Send email for practice set published
 * @param {type} req
 * @param {type} practice
 * @returns {undefined}
 */
  private async sendEmailPublished(request: UpdateAssessmentRequest, practice) {
    try {
      let tmp = {
        name: practice.title,
        datePublished: moment(practice.statusChangedAt).format('MMM DD, YYYY'),
        subject: 'Practice test published'
      }
      let dataMsg: any = {
        receiver: request.user._id,
        itemId: practice._id,
        modelId: 'publishPractice'
      }
      if (request.user.email) {
        dataMsg.to = request.user.email
        dataMsg.isScheduled = true
      }
      this.messageCenter.send_with_template(request.instancekey, 'published', tmp, dataMsg)
      return;
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  private async compareEmailBeforeSend(request: UpdateAssessmentRequest, practiceSet, updatedSet) {
    try {
      var oldEmail = practiceSet.inviteeEmails
      if (updatedSet.inviteeEmails && updatedSet.inviteeEmails.length > 0) {
        var inviteEmails = []
        var updateEmails = updatedSet.inviteeEmails
        // check last practice is published or draf
        // if publish compare email
        if (practiceSet.inviteeEmails && practiceSet.inviteeEmails.length > 0 && practiceSet.status == 'published') {
          for (var i in oldEmail) {
            var postDiffrent = _.findIndex(updatedSet.inviteeEmails, function (index) {
              return oldEmail[i] == index
            })
            if (postDiffrent > -1) {
              updateEmails.splice(postDiffrent, 1)
            }
          }
          inviteEmails = updateEmails
        } else {
          inviteEmails = updateEmails
        }
        if (inviteEmails.length > 0) {
          Logger.debug('send mail to', inviteEmails)
          await this.invitationStudent(request, updatedSet, inviteEmails)
        }
        return true;
      }
      return true;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async invitationStudent(request, practice, inviteEmails) {
    try {
      const settings = await this.redisCache.getSetting({ instancekey: request.instancekey }, function (settings: any) {
        return settings;
      })
      Logger.debug('Start to send email', inviteEmails)
      let tmlfile = 'sharing-practiceset-invitation'
      let optionTmp = {
        senderName: request.user.name,
        sharingEmail: settings.supportEmail,
        sharingLink: settings.baseUrl + 'start/' + practice.testCode,
        subject: 'Practice test invitation',
        bcc: true
      }
      this.eventBus.emit('Practice.Invitation', {
        req: {
          headers: {
            instancekey: request.instancekey
          }
        },
        practice: _.pick(practice, '_id', 'user', 'title', 'userInfo'),
        emails: inviteEmails,
        tmp: {
          name: tmlfile,
          options: optionTmp
        }
      })
      if (request.informStudents) {
        inviteEmails.map((email) => {
          this.messageCenter.send_with_template(request.instancekey, tmlfile, optionTmp, {
            to: email,
            modelId: 'inviteTest',
            isScheduled: true
          })
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async updateQuestionAndAttempt(request: UpdateAssessmentRequest, practiceSet) {
    try {
      this.attemptRepository.setInstanceKey(request.instancekey);
      await this.attemptRepository.updateMany({
        'practicesetId': practiceSet._id // @ad check if ObjectId
      }, {
        $set: {
          'isShowAttempt': practiceSet.isShowAttempt,
          "practiceSetInfo.titleLower": practiceSet.title.toLowerCase(),
          "practiceSetInfo.title": practiceSet.title
        }
      })
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }


  /* 
  * * checking course in practice but its courses with multiple IDs
  */
  // update assessment by-> id
  async updateAssessment(request: UpdateAssessmentRequest) {
    try {
      var resultToUpdate: any;
      const settings = await this.redisCache.getSetting({ instancekey: request.instancekey })
      await this.logTestUpdate(request);

      if (request.body.title) {
        request.body.title = request.body.title.replace(/ {1,}/g, " ");
      }

      if (request.body.enableMarks && request.body.isMarksLevel) {
        if (!request.body.enableMarks || !request.body.isMarksLevel) {
          request.body.plusMark = 1;
          request.body.minusMark = 0;
        }
      }
      if (request.body.status == 'revoked') {
        await this.withDrawn(request)
      } else {
        if (request.body.testMode != 'proctored') {
          request.body.startDate = null;
          request.body.startTimeAllowance = 0;
        }
        var lastStatus: any = null;
        var oldPractice: any = {};
        var newPractice: any = {};

        let data = _.omit(request.body, '_id', 'createdAt', 'updatedAt', 'questions', 'testCode');
        var instructions = striptags(request.body.instructions);
        var description = striptags(request.body.description);

        if (instructions.length > 4000) {
          throw new BadRequestException('Instructions must be smaller than 4000 characters.');
        }
        if (description.length > 4000) {
          throw new BadRequestException('Description must be smaller than 4000 characters.');
        }

        var filter = {
          _id: new ObjectId(request.id)
        }

        this.practiceSetRepository.setInstanceKey(request.instancekey);
        const practiceSet = await this.practiceSetRepository.findOne(filter);
        if (!practiceSet) {
          throw new NotFoundException('Practice Not Found');
        }

        // Not allow to update revoked or expired test
        if (practiceSet.status === 'revoked' || practiceSet.status === 'expired') {
          throw new ForbiddenException({ param: 'status', message: 'Withdrawn or Expired practice test is uneditable.' })
        }

        // unverified user cannot publish public/buy mode test
        if (data.accessMode != 'invitation' && data.status == 'published' && practiceSet.stauts != 'published' && (request.user.roles.includes('teacher') || request.user.roles.includes('mentor')) && !request.user.isVerified) {
          throw new ForbiddenException({ param: 'status', message: 'You are not allowed to publish this test. Please contact admin to verify your account.' })
        }

        var title = practiceSet.title
        if (data.title) {
          title = data.title
        }
        oldPractice = { ...practiceSet }

        // callback start
        await this.validateUpdatePracticeTitle(request, title, settings);

        lastStatus = practiceSet.status;

        if (lastStatus !== 'draft' && lastStatus !== 'tempt') {
          if (data.subjects) {
            delete data.subjects
          }
          if (data.units) {
            delete data.units
          }
        }
        newPractice = _.mergeWith(practiceSet, data, function (a, b) {
          if (_.isArray(a)) {
            return a = b
          }
        })
        if (data.classRooms) {
          newPractice.classRooms = data.classRooms.filter(d => d != null)
        }

        if (!(newPractice.status == 'revoked' || (lastStatus == 'published' && newPractice.status == 'published'))) {
          var checkTopic = lastStatus == 'draft' && newPractice.status == 'draft'

          checkTopic = await this.validateSubjectUnitTopic(request.instancekey, newPractice, oldPractice);
        }

        newPractice = await this.validateCodeQuestionSettings(request.instancekey, newPractice)
        let newDataToSave: any;
        if ((lastStatus == 'draft' || lastStatus == 'tempt') && newPractice.status == 'draft') {

          newDataToSave = await this.updatePracticeSetDraft(request, oldPractice, data, newPractice)

        } else {
          /**
           * validate before update practice
          */
          await this.validatePracticeTest(request, oldPractice, newPractice);
          const newData = await this.addListEmailFromClassRoom(request.instancekey, newPractice);
          // count number question before update practice
          newDataToSave = await this.countQsBeforUpdate(newData);
        }

        if (newDataToSave.inviteePhones) {
          newDataToSave.inviteePhones.filter(function (n) {
            return n !== undefined
          })
        }

        newDataToSave.randomizeAnswerOptions = practiceSet.randomizeAnswerOptions
        newDataToSave.randomQuestions = practiceSet.randomQuestions
        newDataToSave.sectionJump = practiceSet.sectionJump
        newDataToSave.sectionTimeLimit = practiceSet.sectionTimeLimit
        if (practiceSet.status != 'published') {
          newDataToSave.subjects = request.body.subjects
        }
        if (practiceSet.testType === 'random' && request.body.randomTestDetails && request.body.randomTestDetails.length > 0) {
          newDataToSave.randomTestDetails = request.body.randomTestDetails
        }

        if (request.body.units.length > 0 && practiceSet.status != 'published') {
          var unitData = [];
          request.body.units.forEach(function (sub) {
            unitData.push({
              _id: new Types.ObjectId(sub._id),
              name: sub.name
            })
          })
          newDataToSave.units = unitData;

        }
        newDataToSave.user = data.user;
        newDataToSave.userInfo = data.userInfo
        // Added to remove classroom email id
        var classroomEmail = newDataToSave.studentEmails
        newDataToSave.studentEmails = ''

        newDataToSave.lastModifiedBy = new ObjectId(request.user._id)
        newDataToSave.lastModifiedDate = new Date()

        newDataToSave.titleLower = practiceSet.title.toLowerCase()
        if (!newDataToSave.testType) { // without this check it will overwrite other type of test like psychometry
          // set default if not set or is set to tadaptive previously                            
          newDataToSave.testType = 'practice';
        }


        // Keep this to handle renaming question section          
        var sectionsBeforeMerge = JSON.parse(JSON.stringify(newDataToSave.sections))

        // Handle section merge
        var sections = []
        newDataToSave.sections.forEach(function (s) {
          var idx = _.findIndex(sections, {
            name: s.name
          })
          if (idx === -1) {
            sections.push(s)
          } else {
            // Merge sections
            sections[idx].time += s.time
          }
        })

        newDataToSave.sections = sections

        if (oldPractice.sections && oldPractice.sections.length > 0) {
          // Update section name
          var updatedSection = {}

          oldPractice.sections.forEach(function (s) {

            var idx = _.findIndex(sectionsBeforeMerge, function (sec2) {

              return sec2._id.toString() === s._id.toString()
            })
            if (idx > -1 && s.name !== sectionsBeforeMerge[idx].name) {
              updatedSection[s.name] = sectionsBeforeMerge[idx].name
            }
          })

          if (!_.isEmpty(updatedSection)) {
            // Update all questions has this section name
            newDataToSave.questions.forEach(function (q) {
              if (updatedSection[q.section] != null) {
                q.section = updatedSection[q.section]
              }
            })
          }
        }

        if (newDataToSave.minusMark == 0) {
          newDataToSave.minusMark = Number(newDataToSave.minusMark)
        }

        if (newDataToSave.sectionTimeLimit) {
          newDataToSave.totalTime = 0
          newDataToSave.sections.forEach(function (sec) {
            newDataToSave.totalTime += sec.time
          })
        }

        try {
          newDataToSave.user=newDataToSave.userInfo._id;
          const result = await this.practiceSetRepository.findByIdAndSave(newDataToSave._id, newDataToSave);

          newDataToSave.studentEmails = classroomEmail
          this.afterUpdatePractice(request, oldPractice, newDataToSave)

          if (result.status == 'published') {
            this.updateQuestionAndAttempt(request, result)
            this.redisCache.del({ instancekey: request.instancekey, params: { id: request.id } }, 'findOneWithQuestionsAccessMode')
            this.redisCache.del({ instancekey: request.instancekey, params: { id: request.id } }, 'findOneWithQuestionsAccessMode_meta')
            this.redisCache.globalDelAsync(request.instancekey + '_test_unit_count_' + result._id)
            this.redisCache.globalDelAsync(request.instancekey + '_summaryTopicPractice_' + result._id)
          }

          if (result.attemptAllowed != oldPractice.attemptAllowed || result.offscreenLimit != oldPractice.offscreenLimit) {
            let setField: any = {}
            if (result.attemptAllowed != oldPractice.attemptAllowed) {
              setField.attemptLimit = result.attemptAllowed
            }
            if (result.offscreenLimit != oldPractice.offscreenLimit) {
              setField.offscreenLimit = result.offscreenLimit
            }

            this.attendanceRepository.setInstanceKey(request.instancekey);
            await this.attendanceRepository.updateMany({ practicesetId: new Types.ObjectId(result._id) }, { $set: setField })

          }
          // update course title and summary 
          // if (result.course) {

          //   const course = await global.dbInsts[req.headers.instancekey].Courses.findOne({ _id: result.course }, { sections: 1, _id: 1 })
          //   const section = course.sections.filter(
          //     item => item.contents.some(e => e.source && e.source.toString() === result._id.toString())
          //   );
          //   const toUpdate = section[0].contents.filter(e => e.source && e.source.toString() === result._id.toString())

          //   await global.dbInsts[req.headers.instancekey].Courses.findOneAndUpdate({ _id: result.course }, {
          //     $set: {
          //       "sections.$[].contents.$[inner].title": result.title,
          //     }
          //   }, {
          //     arrayFilters: [{
          //       "inner.type": { '$in': ['quiz', 'assessment'] },
          //       "inner._id": { "$eq": toUpdate[0]._id }
          //     }]
          //   });
          // }

          try {
            // update instructors subjects
            if (newDataToSave.instructors.length) {
              this.usersRepository.setInstanceKey(request.instancekey);
              await this.usersRepository.updateMany({ _id: { $in: newDataToSave.instructors } }, { $addToSet: { subjects: { $each: newDataToSave.subjects.map(s => s._id) } } })
              if (newDataToSave.accessMode === 'invitation') {
                // add teacher to classroom's instructors
                this.classroomRepository.setInstanceKey(request.instancekey);
                await this.classroomRepository.updateMany({ _id: { $in: newDataToSave.classrooms } }, { $addToSet: { owners: { $each: newDataToSave.instructors } } })
              }
            }
          } catch (ex) {
            Logger.error(ex)
          }

          return { response: result }

        } catch (error) {
          Logger.error(error);
          throw new InternalServerErrorException(error.message);
        }

      }
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      } else if (error instanceof ForbiddenException) {
        throw new GrpcPermissionDeniedException(error.getResponse());
      }
      throw new GrpcInternalException(error.message);
    }
  }



  // subject enrollment 
  async enrollTest(request: EnrollTestRequest) {
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey)
      const test = await this.practiceSetRepository.findOne({ _id: request._id });
      if (!test) {
        throw new NotFoundException('Test not found');
      }

      const itemIds = test.subjects.map((s: any) => s._id);

      this.usersRepository.setInstanceKey(request.instancekey);
      await this.usersRepository.findOneAndUpdate({ _id: new ObjectId(request.user._id) }, {
        $addToSet: { subjects: { $each: itemIds } }
      });

      // Enroll to a specific location if specified in the request query
      if (request.location) {
        this.locationRepository.setInstanceKey(request.instancekey);
        const loc = await this.locationRepository.findOne({ _id: request.location });
        if (loc) {
          await this.usersRepository.findOneAndUpdate({ _id: new ObjectId(request.user._id) }, {
            $addToSet: { locations: loc._id },
            $set: { activeLocation: loc._id }
          });
        }
      }

      return { message: 'Subjects successfully added' };
    } catch (err) {
      Logger.error(err);
      throw new GrpcInternalException('Some Error Occured!');
    }
  }

  /* 
  TODO: Url error of currency conversion
   */
  async getPublisherAssessments(request: PublisherAssessmentRequest) {
    try {
      var limit = request.limit;
      var page = request.page;
      var skip = request.skip;
      var title = request.title;
      var count = request.count;

      limit = Number(limit || 4);
      page = Number(page || 1);
      skip = (page - 1) * limit;
      if (skip) {
        skip = Number(skip);
      }

      let pipeline: object[] = [];

      let match = {
        $match: {
          origin: 'publisher',
          accessMode: 'buy',
          status: 'published',
          $and: [
            {
              $or: [
                {
                  expiresOn: {
                    $gt: new Date(),
                  },
                },
                {
                  expiresOn: null,
                },
                {
                  expiresOn: '',
                },
              ],
            },
          ],
        },
      };
      if (title) {
        const titleMatch = {
          title: {
            $regex: title,
            $options: 'i',
          }
        };
        match.$match = { ...match.$match, ...titleMatch };

      }

      pipeline.push(match)

      if (count) {
        pipeline.push({ $count: 'total' })

        let testsCount = await this.practiceSetRepository.aggregate(pipeline);

        return { count: testsCount };
      }
      pipeline.push({ $skip: skip }, { $limit: limit })

      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      })

      pipeline.push({ $unwind: '$user' })

      pipeline.push({
        $project: {
          title: 1,
          colorCode: 1,
          imageUrl: 1,
          countries: 1,
          accessMode: 1,
          subjects: 1,
          instructors: 1,
          userName: '$user.name',
          user: '$user._id',
          statusChangedAt: 1,
          type: 1,
          status: 1,
          startDate: 1,
          expiresOn: 1,
          testMode: 1,
        },
      })

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      let tests: any = await this.practiceSetRepository.aggregate(
        pipeline,
      );

      for (let test of tests) {
        this.userEnrollmentRepository.setInstanceKey(request.instancekey);
        let enrolled = await this.userEnrollmentRepository.findOne(
          { item: new ObjectId(test._id), user: new ObjectId(request.user._id), location: new ObjectId(request.user.activeLocation) },
          { _id: 1 },
        );
        test.enrolled = !!enrolled;

        await this.settings.setPriceByUserCountry(request, test);
      }
      return { response: tests };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException('Some Error Occured!');
    }
  }

  async updateAllQuestionSection(request: UpdateAllQuestionSectionRequest) {
    try {
      if (!request.section && !request.questionIds) {
        throw new GrpcInvalidArgumentException('Invalid Argument');
      }
      let questionIds = request.questionIds.map((e: string) => new ObjectId(e));

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      let test = await this.practiceSetRepository.findOne({ _id: request._id, enableSection: true });

      if (Object.keys(test).length === 0) {
        throw new GrpcNotFoundException('PracticeSet not found');
      }

      let qs = test.questions.filter(q => request.questionIds.includes(q.question.toString()));

      if (!qs || (qs && qs.length === 0)) {
        throw new GrpcNotFoundException('Question not found');
      }

      const updated = await this.practiceSetRepository.findOneAndUpdate(
        { _id: request._id, enableSection: true },
        {
          $set: {
            "questions.$[element].section": request.section[0],
            "lastModifiedBy": new ObjectId(request.user._id)
          }
        },
        { arrayFilters: [{ "element.question": { "$in": questionIds } }], returnOriginal: false }
      );

      return updated;
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException('Some Error Occured!');
    }
  }

  async getPublicTest(request: GetPublicTestsRequest) {
    try {
      const page = request.page || 1;
      const limit = request.limit || 4;
      const skip = (page - 1) * limit;

      const condition = {
        accessMode: { $in: ['public', 'buy'] },
        status: 'published',
        'courses.0': { $exists: false },
        'testseries.0': { $exists: false },
        $and: [
          {
            $or: [
              { expiresOn: { $gt: new Date() } },
              { expiresOn: null },
              { expiresOn: '' },
            ],
          },
        ],
      };

      const defaultLoc = await this.locationRepository.findOne({ active: true, isDefault: true }, { _id: 1 });

      const locationFilter = { $or: [{ locations: [] }] };

      if (defaultLoc) {
        locationFilter.$or.push({ locations: defaultLoc._id });
      }

      Object.assign(condition.$and, locationFilter);
      const projection = { title: 1, countries: 1, accessMode: 1, subjects: 1, user: 1, userInfo: 1, expiresOn: 1, imageUrl: 1, colorCode: 1 };
      const options = {
        sort: { rating: -1, totalAttempt: -1 },
        skip,
        limit
      };

      const tests = await this.practiceSetRepository.find(condition, projection, options);

      for (const ts of tests) {
        await this.settings.setPriceByUserCountry(request, ts);
      }

      if (request.count) {
        const total = await this.practiceSetRepository.countDocuments(condition);
        return { tests: tests, total: total };
      } else {
        return { tests: tests };
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException('Some Error Occured!');
    }
  }

  async getMaximumTestMarks(request: GetMaximumTestMarksRequest): Promise<GetMaximumTestMarksResponse> {
    const pipe = [{
      '$match': {
        _id: new Types.ObjectId(request.id)
      }
    }, {
      '$project': {
        questions: 1
      }
    },
    {
      '$unwind': '$questions'
    },
    {
      '$lookup': {
        from: 'questions',
        localField: 'questions.question',
        foreignField: '_id',
        as: 'questions'
      }
    },
    {
      '$unwind': '$questions'
    },
    {
      '$group': {
        '_id': '$_id',
        'maximumMarks': {
          '$sum': '$questions.plusMark'
        }
      }
    }];
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const maxMarks: any = await this.practiceSetRepository.aggregate(pipe);

      if (maxMarks.length > 0) {
        return { maximumMarks: maxMarks[0].maximumMarks }
      } else {
        return { maximumMarks: 0 }
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async getQuestionFeedback(request: GetQuestionFeedbackRequest) {
    var page = (request.page) ? request.page : 1;
    var limit = (request.limit) ? request.limit : 10;
    var skip = (page - 1) * limit;

    var condition = {
      questionId: new ObjectId(request.qId)
    }
    if (request.count == true) {
      this.questionFeedbackRepository.setInstanceKey(request.instancekey);
      const qFCount = await this.questionFeedbackRepository.countDocuments(condition);
      return { count: qFCount };
    }
    else {
      this.questionFeedbackRepository.setInstanceKey(request.instancekey);
      const qFeedback = await this.questionFeedbackRepository.find(condition, null, { sort: { updatedAt: -1 }, skip: skip, limit: limit });
      const result = await this.questionFeedbackRepository.populate(qFeedback, {
        path: 'studentId',
        select: 'name',
        options: { lean: true }
      })

      return { response: result };
    }
  }

  async startTestSession(request: StartTestSessionRequest) {
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const test = await this.practiceSetRepository.findById(new ObjectId(request.id));

      if (!test) {
        throw new NotFoundException();
      }
      if (!test.requireAttendance || test.status != 'published') {
        throw new ForbiddenException();
      }

      this.classroomRepository.setInstanceKey(request.instancekey);
      const results: any = await this.classroomRepository.aggregate([{
        $match: {
          _id: {
            $in: test.classRooms
          }
        }
      },
      {
        $unwind: '$students'
      },
      {
        $group: {
          _id: "$students.studentId",
          userId: { $first: "$students.studentUserId" },
          classId: { $first: "$_id" },
          className: { $first: "$name" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      }
      ]);

      const attendants: any[] = [];

      for (const data of results) {
        const attendant = {
          practicesetId: test._id,
          teacherId: new ObjectId(request.user._id),
          classId: data.classId,
          className: data.className,
          studentId: data._id,
          name: data.userInfo.name,
          studentUserId: data.userId,
          status: 'absent',
          admitted: false,
          active: true,
          createdAt: new Date()
        };

        attendants.push(attendant);
      }

      this.attendanceRepository.setInstanceKey(request.instancekey);
      const docs = await this.attendanceRepository.insertMany(attendants);

      return { total: docs.length, attendants: docs };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message)
    }
  }

  async endTestSession(request: EndTestSessionRequest) {
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const test = await this.practiceSetRepository.findById(request.id);

      if (!test) {
        throw new NotFoundException();
      }

      if (!test.requireAttendance || test.status != 'published') {
        throw new ForbiddenException();
      }

      this.attendanceRepository.setInstanceKey(request.instancekey);
      await this.attendanceRepository.updateMany({
        practicesetId: test._id,
        //  teacherId: req.user._id,
        active: true
      }, {
        $set: {
          active: false
        }
      })
      return { status: 'ok' };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message)
    }
  }

  async getAttendants(request: GetAttendantsRequest) {
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const test = await this.practiceSetRepository.findById(new ObjectId(request.id));
      if (!test) {
        throw new NotFoundException();
      }
      if (!test.requireAttendance) {
        throw new ForbiddenException();
      }

      var query: any = {
        practicesetId: new ObjectId(request.id),
        teacherId: new ObjectId(request.user._id),
        active: true
      };
      if (request.admit && !request.reject) {
        query.admitted = true;
      } else if (!request.admit && request.reject) {
        query.admitted = false;
      }

      var statusQuery = [];
      if (request.absent) {
        statusQuery.push('absent');
      }
      if (request.ready) {
        statusQuery.push('ready');
      }
      if (request.started) {
        statusQuery.push('started');
      }
      if (request.finished) {
        statusQuery.push('finished');
      }
      if (statusQuery.length > 0) {
        query.status = {
          $in: statusQuery
        };
      }
      let searchQuery: any = {}
      if (request.searchText) {
        searchQuery.$or = [{
          'name': {
            "$regex": request.searchText,
            "$options": "i"
          }
        }, {
          'studentUserId': request.searchText
        },
        {
          'rollNumber': request.searchText
        }]
      }

      if (request.classes) {
        query.classId = {
          $in: request.classes.split(',')
        };
      }
      if (request.count) {
        this.attendanceRepository.setInstanceKey(request.instancekey)
        const result = await this.attendanceRepository.aggregate([{
          $match: query
        },
        { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'userInfo' } },
        { $unwind: "$userInfo" },
        {
          $project: {
            "practicesetId": 1,
            "teacherId": 1,
            "classId": 1,
            "className": 1,
            "studentId": 1,
            "name": 1,
            "studentUserId": 1,
            "offscreenLimit": 1,
            "attemptLimit": 1,
            "type": 1,
            "updatedAt": 1,
            "createdAt": 1,
            "active": 1,
            "admitted": 1,
            "status": 1,
            "rollNumber": "$userInfo.rollNumber"
          }
        },
        { $match: searchQuery }
        ])
        return { total: result.length }
      } else {
        var page = request.page ? request.page : 1
        var limit = request.limit ? request.limit : 20
        var skip = (page - 1) * limit

        this.attendanceRepository.setInstanceKey(request.instancekey)
        const attendants: any = await this.attendanceRepository.aggregate([{
          $match: query
        },
        { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'userInfo' } },
        { $unwind: "$userInfo" },
        {
          $project: {
            "practicesetId": 1,
            "teacherId": 1,
            "classId": 1,
            "className": 1,
            "studentId": 1,
            "name": 1,
            "studentUserId": 1,
            "offscreenLimit": 1,
            "attemptLimit": 1,
            "type": 1,
            "updatedAt": 1,
            "createdAt": 1,
            "active": 1,
            "admitted": 1,
            "status": 1,
            "rollNumber": "$userInfo.rollNumber"
          }
        },
        { $match: searchQuery },
        { $skip: skip },
        { $limit: limit }
        ])

        await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);

        await Promise.all(
          attendants.map(async (s: any) => {
            s.isOnline = await this.socketClientService.isOnline(request.instancekey, s.studentId.toString());
          })
        );

        return { attendants };
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message)
    }
  }

  async resetIpRestriction(request: ResetIpRestrictionRequest) {
    try {
      this.userLogRepository.setInstanceKey(request.instancekey);
      await this.userLogRepository.updateMany({ user: new ObjectId(request.studentId), takingPracticeSet: new ObjectId(request.id) }, { $unset: { takingPracticeSet: 1 } })

      this.attemptRepository.setInstanceKey(request.instancekey);
      await this.attemptRepository.updateMany({
        user: new ObjectId(request.studentId),
        practicesetId: new ObjectId(request.id), ongoing: true
      }, { $set: { ongoing: false } })

      return { status: 'ok' }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }


  async updateAttendanceLimit(request: UpdateAttendanceLimitRequest) {
    try {
      if (!request.user) {
        throw new BadRequestException();
      }
      this.attendanceRepository.setInstanceKey(request.instancekey)
      let att: any;
      try {
        att = await this.attendanceRepository.findOne({ practicesetId: new ObjectId(request.id), studentId: new ObjectId(request.user) })

      } catch (error) {
        Logger.warn('attemptLimit ' + request.attemptLimit + ' offscreenLimit ' + request.offscreenLimit)
      }
      if (!att) {
        this.practiceSetRepository.setInstanceKey(request.instancekey);
        let test = await this.practiceSetRepository.findById(request.id);
        this.usersRepository.setInstanceKey(request.instancekey);
        let user = await this.usersRepository.findById(request.user);
        let notes = [];
        if (request.note) {
          notes.push(request.note)
        }
        att = await this.attendanceRepository.create({
          practicesetId: test._id,
          studentId: user._id,
          name: user.name,
          studentUserId: user.userId,
          attemptLimit: test.attemptAllowed,
          notes: notes
        })

        if (test.offscreenLimit) {
          att.offscreenLimit = test.offscreenLimit
        }
      }

      att.attemptLimit = request.attemptLimit;
      att.offscreenLimit = request.offscreenLimit;
      /* 
     ! notes are pushed two times in case of (!test)
      */
      if (request.note) {
        att.notes.push(request.note);
      }

      await this.attendanceRepository.updateOne(att._id, att);

      return { data: 'ok' }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message)
    }
  }

  async findPracticeSets(request: FindPracticeSetsRequest) {
    try {
      var page = request.page ? request.page : 1
      var limit = request.limit ? request.limit : 20
      var skip = (page - 1) * limit
      let condition = {
        status: "published",
        accessMode: "invitation",
        testMode: "proctored"
      }
      if (request.grade) {
        condition["units._id"] = request.grade
      }
      if (request.subject) {
        condition["subjects._id"] = request.subject
      }

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const results = await this.practiceSetRepository.find(condition, { title: 1 }, { page: page, limit: limit, skip: skip });
      return { response: results }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async getAttendanceStatus(request: GetAttendanceStatusRequest) {
    try {
      if (!request.user || !request.id) {
        throw new BadRequestException();
      }
      this.attendanceRepository.setInstanceKey(request.instancekey)
      const att = await this.attendanceRepository.findOne({ practicesetId: new ObjectId(request.id), studentId: new ObjectId(request.user) });
      if (!att) {
        return { status: 'ready' };
      }
      return { status: att.status };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async changeOwnership(request: ChangeOwnershipRequest) {
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey)
      const result = await this.practiceSetRepository.findByIdAndUpdate(request.id, { $set: { user: new ObjectId(request.userId), userInfo: { name: request.name, _id: new ObjectId(request.userId) } } })
      return { response: result }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async getTestLimit(request: GetTestLimitRequest) {
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey)
      let test = await this.practiceSetRepository.findById(new ObjectId(request.id), { attemptAllowed: 1, offscreenLimit: 1 });

      this.attendanceRepository.setInstanceKey(request.instancekey);
      const atd = await this.attendanceRepository.findOne({ practicesetId: test._id, studentId: new ObjectId(request.studentId) })

      if (atd) {
        return {
          attemptLimit: atd.attemptLimit,
          offscreenLimit: atd.offscreenLimit,
          notes: atd.notes
        }
      } else {
        return {
          attemptLimit: test.attemptAllowed,
          offscreenLimit: test.offscreenLimit,
          notes: []
        }
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async findProctorTest(request: FindProctorTestRequest) {
    try {
      const subjects = request.user.subjects;
      let filter: any = {
        accessMode: 'invitation',
        allowStudent: true,
        'subjects._id': {
          $in: subjects ? subjects.map(s => new ObjectId(s)) : undefined
        }
      }
      let classIds = [];
      this.classroomRepository.setInstanceKey(request.instancekey)
      classIds = await this.classroomRepository.distinct('_id', { 'students.studentUserId': request.user.userId, active: true, location: new ObjectId(request.user.activeLocation) })

      if (classIds && classIds.length != 0) {
        this.attendanceRepository.setInstanceKey(request.instancekey);
        let testIds = await this.attendanceRepository.distinct('practicesetId', {
          studentId: new ObjectId(request.user._id),
          active: true,
          admitted: true,
          classId: {
            $in: classIds
          }
        })

        filter.classRooms = {
          $in: classIds
        }

        filter.$or = [{
          requireAttendance: {
            $exists: false
          }
        },
        {
          requireAttendance: false
        },
        // In case require attendance, start date need to be over and attendance is allowed
        {
          $and: [{
            $or: [{
              startDate: null
            }, {
              startDate: {
                $gt: new Date()
              }
            }]
          },
          {
            _id: {
              $in: testIds
            }
          }
          ]
        }
        ]

        this.practiceSetRepository.setInstanceKey(request.instancekey);
        let practiceSet = await this.practiceSetRepository.findOne(filter, { title: 1, startDate: 1 })

        if (!practiceSet) {
          throw new NotFoundException('No test found');
        }
        if (practiceSet.startDate) {
          var startDate = moment(practiceSet.startDate)
          var now = new Date()

          if (startDate.subtract(15, 'minutes').isAfter(now)) {
            throw new NotFoundException('This test has scheduled to start on ' + startDate.toString() + ',You can login 15 min before it is started')
          }

          if (practiceSet.startTimeAllowance > 0 && startDate.add(practiceSet.startTimeAllowance, 'minutes').isBefore(now)) {
            throw new NotFoundException("All Today's scheduled test has already started.")
          }
        }

        return { ...practiceSet };
      }
      throw new NotFoundException('No test scheduled')
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message)
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async ongoingTestByUser(request: OngoingTestByUserRequest) {
    try {
      this.classroomRepository.setInstanceKey(request.instancekey);
      let clsIds = await this.classroomRepository.distinct('_id', {
        "slugfly": {
          "$nin": ["group-study", "my-mentees"]
        },
        active: true,
        "students.studentId": new ObjectId(request.id),
        location: new ObjectId(request.user.activeLocation),
      });

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      let tests = await this.practiceSetRepository.find({
        accessMode: 'invitation',
        classRooms: { $in: clsIds },
        testMode: 'proctored',
        status: 'published',
        $expr: {
          $and: [
            { $gte: [new Date(), "$startDate"] },
            {
              $lt: [
                new Date(),
                {
                  $add: [
                    "$startDate",
                    {
                      $multiply: [
                        1000 * 60, "$totalTime"
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      }, {
        classRooms: 1,
        testMode: 1,
        title: 1,
        startDate: 1,
        attemptAllowed: 1,
        offscreenLimit: 1,
        totalQuestion: 1,
        camera: 1
      });

      if (!tests.length) {
        throw new NotFoundException();
      }

      let testToReturn = tests[0];
      // If more than one test found, return the test that student has started 
      if (tests.length > 1) {
        this.attemptRepository.setInstanceKey(request.instancekey);
        let attempt = await this.attemptRepository.findOne({ user: new ObjectId(request.id), ongoing: true, practicesetId: { $in: tests.map(t => t._id) } }, { practicesetId: 1 });

        if (attempt) {
          testToReturn = tests.find(t => t._id.equals(attempt.practicesetId));
        }
      }

      this.attendanceRepository.setInstanceKey(request.instancekey);
      let att = await this.attendanceRepository.findOne({ practicesetId: testToReturn._id, studentId: new ObjectId(request.id) });

      if (att) {
        testToReturn.attemptLimit = att.attemptLimit
        testToReturn.offscreenLimit = att.offscreenLimit
        testToReturn.notes = att.notes
      }

      return { ...testToReturn };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException(error.message)
    }
  }

  async findTestBySession(request: FindTestBySessionRequest) {
    try {
      let selectedSlot = new Date(request.selectedSlot);

      if (request.selectedSlot) {
        this.practiceSetRepository.setInstanceKey(request.instancekey);
        let tests = await this.practiceSetRepository.find({
          accessMode: 'invitation',
          testMode: 'proctored',
          startDate: selectedSlot,
          locations: new ObjectId(request.user.activeLocation),
        }, { classRooms: 1, title: 1, testMode: 1, status: 1, startDate: 1, attemptAllowed: 1, offscreenLimit: 1 });

        tests = await this.practiceSetRepository.populate(tests, {
          path: 'classRooms',
          select: 'name students'
        });

        if (!tests) {
          throw new NotFoundException();
        }
        return { response: tests };
      }
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async upcomingTests(request: UpcomingTestsRequest) {
    try {

      if (request.id) {
        var page = (request.page) ? request.page : 1
        var limit = (request.limit) ? request.limit : 5
        var skip = (page - 1) * limit

        this.practiceSetRepository.setInstanceKey(request.instancekey);
        let aggregate = await this.practiceSetRepository.aggregate([
          {
            $match: {
              "subjects._id": new ObjectId(request.id),
              status: 'published',
              locations: new ObjectId(request.user.activeLocation),
              startDate: { $gte: new Date() }
            }
          },
          { $limit: limit },
          { $skip: skip },
          {
            $project: {
              title: 1,
              description: 1,
              totalTime: 1,
              totalQuestion: 1,
              questionsToDisplay: 1,
              startDate: { "$add": ["$startDate", 5.5 * 60 * 60000] },
              testMode: 1
            }
          }
        ]);

        return { response: aggregate }
      } else {
        throw new BadRequestException('invalid param')
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message)
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async getAvgRatingByAssessment(request: GetAvgRatingByAssessmentRequest) {
    try {
      if (request.id) {
        let condition = {
          "rating": {
            "$exists": true
          },
          practiceSetId: new ObjectId(request.id)
        }
        this.feedbackRepository.setInstanceKey(request.instancekey)
        let result = await this.feedbackRepository.aggregate([
          {
            $match: condition
          },
          {
            $group: {
              _id: { practiceSetId: "$practiceSetId", rating: "$rating" },
              totalRatings: { $sum: "$rating" },
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: "$_id.practiceSetId",
              ratings: {
                $push: {
                  rating: "$_id.rating",
                  count: "$count",
                  avgRating: {
                    $cond: [{
                      $eq: ["$count", 0]
                    }, 0, {

                      $divide: ["$_id.rating", "$count"]

                    }]
                  }
                }
              }, totalRatings: { $sum: "$totalRatings" }, count: { $sum: "$count" }
            }
          },
          {
            $project: {
              ratings: 1, totalRatings: 1, count: 1,
              avgRating: {
                $cond: [{
                  $eq: ["$count", 0]
                }, 0, {

                  $divide: ["$totalRatings", "$count"]

                }]
              }
            }
          }

        ]);

        return { ...result[0] };

      } else {
        throw new NotFoundException();
      }
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message)
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async getfeedbackRatingByAssessment(request: GetfeedbackRatingByAssessmentRequest) {
    try {
      if (request.id) {
        let condition = {
          "rating": {
            "$exists": true
          },
          practiceSetId: new ObjectId(request.id)
        }
        this.feedbackRepository.setInstanceKey(request.instancekey);
        let result = await this.feedbackRepository.aggregate([
          {
            $match: condition
          },
          {
            $group: {
              _id: { practiceSetId: "$practiceSetId", attempt: "$attemptId" },
              feedbacks: { $first: "$feedbacks" },
              count: { $sum: 1 }
            }
          },
          { $unwind: "$feedbacks" },
          {
            $group: {
              _id: { practiceSetId: "$_id.practiceSetId", name: "$feedbacks.name" },
              name: { $first: '$feedbacks.name' },
              'feedback': {
                $push: {
                  name: "$feedbacks.name",
                  percent: {
                    $cond: [{
                      $eq: ["$feedbacks.value", true]
                    }, 1, 0]
                  }
                }
              },
              count: { $sum: "$count" }
            }
          },
          {
            $project: {
              feedback: 1, count: 1,
            }
          },
          { $unwind: "$feedback" },
          {
            $group: {
              _id: { practiceSetId: "$_id.practiceSetId", name: "$feedback.name" },
              name: { $first: '$feedback.name' },
              reviewCount: { $sum: "$feedback.percent" },
              count: { $first: '$count' }
            }
          },
        ]);

        return { response: result };

      } else {
        throw new NotFoundException('Not Found');

      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException('Internal Server Error')
    }
  }

  async getQuestionList(request: GetQuestionListRequest) {
    this.practiceSetRepository.setInstanceKey(request.instancekey);
    const test = await this.practiceSetRepository.findById(request.id);

    if (!test) {
      throw new NotFoundException();
    }

    const result = _.sortBy(test.questions, 'order').map(q => { return { _id: q.question, order: q.order } });

    return { response: result };

  }

  async updateQuestionSection(request: UpdateQuestionSectionRequest) {
    try {
      if (!request.section) {
        throw new BadRequestException();
      }
      this.practiceSetRepository.setInstanceKey(request.instancekey);
      let test = await this.practiceSetRepository.findOne({ _id: new ObjectId(request.id), enableSection: true });
      if (!test) {
        throw new NotFoundException();
      }

      let q = test.questions.find(q => q.question.equals(request.questionId))
      if (!q) {
        throw new NotFoundException();
      }

      if (q.section == request.section) {
        return { status: 'ok' };
      }

      let oldSection = q.section
      q.section = request.section

      if (q.section) {
        // if this is a section rename (no more question tagged with with old section)
        if (oldSection && !test.questions.filter(q => q.section == oldSection).length) {
          let section = test.sections.find(s => s.name == oldSection)
          if (section) {
            section.name = request.section
          } else {
            // this condition should not happen!
            test.sections.push({
              name: q.section,
              time: 1,
              showCalculator: false
            })
          }
        } else {
          // new section
          if (!test.sections.find(s => s.name == q.section)) {
            test.sections.push({
              name: q.section,
              time: 1,
              showCalculator: false
            })
          }
        }
      }
      await this.practiceSetRepository.findByIdAndUpdate(test._id, test);

      if (q.section) {
        let sectionToReturn = test.sections.find(s => s.name == q.section)

        return { ...sectionToReturn }
      } else {
        return {}
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async getPracticesetClassrooms(request: GetPracticesetClassroomsRequest) {
    try {
      let condition = {}
      if (!request.user.roles.includes('publisher')) {
        condition["cinfo.location"] = new ObjectId(request.user.activeLocation)
      }
      this.practiceSetRepository.setInstanceKey(request.instancekey)
      let classrooms = await this.practiceSetRepository.aggregate([{
        $match: { _id: new ObjectId(request.id) }
      },
      { $unwind: "$classRooms" },
      {
        $lookup:
        {
          from: 'classrooms',
          localField: 'classRooms',
          foreignField: '_id',
          as: 'cinfo'
        }
      },
      { $unwind: "$cinfo" },
      { $match: condition },
      {
        $project: {
          classroomId: "$cinfo._id",
          studentsCount: { $size: "$cinfo.students" },
          students: "$cinfo.students",
          classroomName: "$cinfo.name",
          imageUrl: "$cinfo.imageUrl",
          colorCode: "$cinfo.colorCode",
          seqCode: "$cinfo.seqCode"
        }
      },
      {
        $unwind: {
          path: "$students",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'attempts',
          let: { uId: '$students.studentId' },
          pipeline: [
            {
              $match: {
                $expr:
                {
                  $and: [{ $eq: ['$$uId', '$user'] },
                  { $eq: ["$practicesetId", new ObjectId(request.id)] },
                  { $eq: ["$isAbandoned", false] }
                  ]
                }
              }
            },
          ],
          as: 'userData'
        }
      },
      {
        $project: {
          classroomId: 1,
          classroomName: 1,
          user: 1,
          studentsCount: "$studentsCount",
          totalAttempt: { $size: "$userData" },
          imageUrl: 1,
          colorCode: 1, seqCode: 1
        }
      },
      {
        $group: {
          _id: { classroomId: "$classroomId", studentId: "$user" },
          name: { $first: "$classroomName" },
          user: { $first: "$user" },
          imageUrl: { $first: "$imageUrl" },
          colorCode: { $first: "$colorCode" },
          studentsCount: { $first: "$studentsCount" },
          attemptsCount: { $sum: "$totalAttempt" },
          seqCode: { $first: "$seqCode" }
        }
      },
      {
        $group: {
          _id: { classroomId: "$_id.classroomId" },
          name: { $first: "$name" },
          seqCode: { $first: "$seqCode" },
          imageUrl: { $first: "$imageUrl" },
          colorCode: { $first: "$colorCode" },
          studentsCount: { $first: "$studentsCount" },
          attemptsCount: { $sum: "$attemptsCount" },
        }
      },

      ])
      return { response: classrooms }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async checkSectionQuestion(request: CheckSectionQuestionRequest) {
    try {
      if (request.testId) {
        this.practiceSetRepository.setInstanceKey(request.instancekey)
        var questions = await this.practiceSetRepository.aggregate([
          {
            $match: { _id: new ObjectId(request.testId) }
          },
          { $unwind: "$questions" },
          {
            $match: { "questions.section": request.sectionName.toString() }
          },
          { $project: { _id: 1, questions: 1 } }
        ])

        if (questions && questions.length > 0) {
          throw new ForbiddenException('You can not delete this section. This section has question!!');
        } else {
          return { status: 'ok' }
        }
      } else {
        throw new BadRequestException();
      }
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      } else if (error instanceof ForbiddenException) {
        throw new GrpcAbortedException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }


  private async filterWhenUserLogin(req: any): Promise<any> {
    const filter: any[] = [];
    const accessRule: any[] = [];
    const filterGroup: any = { $and: [] };
    const filterMulti: any[] = [];
    const expiresOnFilter = { $gt: new Date() };

    if (!(req.query.invitation && !req.query.buy && !req.query.purchase && !req.query.nonPaid)) {
      accessRule.push({ accessMode: { $ne: 'invitation' } });
    }

    const accessPrivate: any[] = [];

    if (req.user.email) {
      const inviteeEmails = { inviteeEmails: req.user.email, accessMode: 'invitation' };
      accessRule.push(inviteeEmails);
      accessPrivate.push(inviteeEmails);
    }

    if (req.user.phoneNumberFull) {
      const inviteePhones = { inviteePhones: req.user.phoneNumberFull, accessMode: 'invitation' };
      accessRule.push(inviteePhones);
      accessPrivate.push(inviteePhones);
    }

    var condition = []
    if (req.user.email) {
      condition.push({
        studentUserId: req.user.email
      })
      condition.push({
        email: req.user.email
      })
    }
    if (req.user.phoneNumberFull) {
      condition.push({
        studentUserId: req.user.phoneNumberFull
      })
    }
    if (!req.user.userId) {
      return { accessRule, filter };
    }

    this.classroomRepository.setInstanceKey(req.instancekey)
    const classes = await this.classroomRepository.find({
      active: true,
      'students.studentUserId': req.user.userId,
    }, { _id: 1 });

    if (classes && classes.length) {
      const inClassRooms = {
        classRooms: { $in: classes.map(c => c._id) },
        accessMode: 'invitation',
      };
      accessRule.push(inClassRooms);
      accessPrivate.push(inClassRooms);
    }

    if (req.query.attempted) {
      if (!req.query.unattempted || req.query.multi) {
        const testAttempted = await this.getTestAttempted(req, filter);

        const filterAttempted = { _id: { $in: [...new Set(testAttempted)] } };
        filterMulti.push(filterAttempted);
        if (!req.query.multi) {

          filter.push(filterAttempted);
        }
      }
    }

    if (req.query.unattempted) {
      if (req.query.multi || !req.query.attempted) {
        const testUnAttempted = await this.getTestUnAttempted(req, filter);
        const filterUnAttempted = { _id: { $nin: [...new Set(testUnAttempted)] } };
        filterMulti.push(filterUnAttempted);
        if (!req.query.multi) {
          filter.push(filterUnAttempted);
        }
      }
    }

    if (req.query.purchase) {
      var accessModeBuy = {
        accessMode: 'buy'
      }
      if ((!req.query.invitation && !req.query.nonPaid && !req.query.buy) || req.query.multi) {
        const testPurchase = await this.getTestPurchase(req, filter);
        const filterBuy = { _id: { $in: testPurchase } };
        if (!req.query.multi) {
          filter.push(accessModeBuy, filterBuy);
        } else {
          filterMulti.push({ accessMode: 'buy', _id: { $in: testPurchase } });
        }
      }
    }

    if (req.query.buy) {
      if ((!req.query.invitation && !req.query.nonPaid && !req.query.purchase) || req.query.multi) {
        if (!req.query.multi) {
          filter.push({ accessMode: 'buy' });
        } else {
          filterMulti.push({ accessMode: 'buy' });
        }
      }
    }

    if (req.query.showFavoriteOnly) {
      const favoritesTest = await this.getMyFavorite(req);
      const filterFavorite = { _id: { $in: favoritesTest } };
      if (!req.query.multi) {
        filter.push(filterFavorite);
      } else {
        filterMulti.push(filterFavorite);
      }
    }

    if (accessRule.length > 0 && !req.query.multi) {
      filter.push({ $or: accessRule });
    }

    if (req.query.publiser) {
      const $users = req.query.publiser.split(',');
      if ($users.length > 0) {
        const result = $users.map((item) => new ObjectId(item));

        filter.push({
          user: {
            $in: result,
          },
        });
        filterGroup.$and.push({
          user: {
            $in: result,
          },
        });
      }
    }

    if (req.query.new) {
      const filterByNew = { _id: { $nin: req.user.practiceViews.map(pv => new ObjectId(pv)) } };
      if (!req.query.multi) {
        filter.push(filterByNew);
      } else {
        filterMulti.push(filterByNew);
      }
      filterGroup.$and.push(filterByNew);
    }

    filterGroup.$and.push({ locations: new ObjectId(req.user.activeLocation) });
    filter.push({ locations: new ObjectId(req.user.activeLocation), status: 'published' });

    if (req.query.nonPaid) {
      const nonPass = { accessMode: { $nin: ['buy', 'invitation'] } };
      if (!req.query.multi && (!req.query.invitation && !req.query.buy)) {
        filter.push(nonPass);
      } else {
        filterMulti.push(nonPass);
      }
    }

    if (req.query.multi) {
      if (req.query.invitation) {
        filterMulti.push(...accessPrivate);
      }
    }

    const filterExpires = { $or: [{ expiresOn: expiresOnFilter }, { expiresOn: null }, { expiresOn: '' }] };
    filter.push(filterExpires);
    filterGroup.$and.push(filterExpires);

    if (req.query.title) {
      const regexText = regexName(req.query.title);
      const filterTitle = { $or: [{ title: regexText }] };
      filter.push(filterTitle);
      filterGroup.$and.push(filterTitle);
    }

    if (req.query.unit) {
      const units = req.query.unit.split(',').map(id => new ObjectId(id));
      if (units.length > 0) {
        filter.push({ 'unit._id': { $in: units } });
        filterGroup.$and.push({ 'unit._id': { $in: units } });
      }
    }

    if (req.query.rejectBuy) {
      const filterRejectBuy = { accessMode: { $ne: 'buy' } };
      filter.push(filterRejectBuy);
      filterGroup.$and.push(filterRejectBuy);
    }

    if (req.query.multi && filterMulti.length > 0) {
      filter.push({ $or: filterMulti });
    }
    return { filter, filterGroup };
  }

  private async getTestAttempted(req: any, filter: any) {
    try {
      this.attemptRepository.setInstanceKey(req.instancekey)
      var attempts = await this.attemptRepository.find({
        user: new ObjectId(req.user._id),
        isAbandoned: false
      });

      attempts = await this.attemptRepository.populate(attempts, {
        path: 'attemptdetails',
        select: '-_id QA'
      });

      const practiceTest = [];
      const uniq = {};

      if (attempts && attempts.length > 0) {
        for (const attempt of attempts) {
          if (!uniq[attempt.practicesetId]) {
            uniq[attempt.practicesetId] = true;
            practiceTest.push(new ObjectId(attempt.practicesetId));
          }
        }
        return practiceTest;
      } else {
        return filter;
      }

    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  private async getTestUnAttempted(req: any, filter: any): Promise<string[]> {
    try {
      this.attemptRepository.setInstanceKey(req.instancekey)
      const attempts = await this.attemptRepository.find({
        user: new ObjectId(req.user._id),
        isAbandoned: false
      });
      if (attempts && attempts.length > 0) {
        const unattemptedTests = attempts.map(attempt => attempt.practicesetId);
        return unattemptedTests;
      } else {
        return [];
      }
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  private async getTestPurchase(req: any, filter: any) {
    try {
      const ids = await this.getPracticesInTestseriesAndCourses(req, 'buy');
      var practiceBuy = []
      if (ids && ids.length) {
        practiceBuy = ids
      }
      return practiceBuy;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  private async getPracticesInTestseriesAndCourses(req: any, accessMode: string) {
    var query: any = {
      user: new ObjectId(req.user._id),
      type: { $in: ['testseries', 'course'] },
      $or: [{
        expiresOn: {
          $gt: new Date()
        }
      }, {
        expiresOn: null
      }],
      location: new ObjectId(req.user.activeLocation)
    }

    if (accessMode) {
      query.accessMode = accessMode
    }

    this.userEnrollmentRepository.setInstanceKey(req.instancekey);
    const details: any = await this.userEnrollmentRepository.aggregate([
      {
        $match: query
      }, {
        $lookup: {
          from: 'courses',
          localField: 'item',
          foreignField: '_id',
          as: 'course'
        }
      }, {
        $unwind: { path: '$course', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'testseries',
          localField: 'item',
          foreignField: '_id',
          as: 'testseries'
        }
      },
      {
        $unwind: { path: '$testseries', preserveNullAndEmptyArrays: true }
      }
    ]);
    let ids = []
    for (let dt of details) {
      if (dt.testseries) {
        ids = ids.concat(dt.testseries.practiceIds)
      } else if (dt.course) {
        for (let sec of dt.course.sections) {
          ids = ids.concat(sec.contents.filter(c => c.type == 'assessment').map(c => c.source))
        }
      }
    }

    if (ids.length > 0) {
      return ids;
    } else {
      return;
    }
  }

  private async getMyFavorite(req: any) {
    this.favoriteRepository.setInstanceKey(req.instancekey)
    const practiceSets = await this.favoriteRepository.find({
      user: new ObjectId(req.user._id),
      location: new ObjectId(req.user.activeLocation)
    }, {
      practiceSet: 1,
      _id: 0
    })
    return practiceSets.map(t => t.practiceSet)
  }

  private async filterForGuest(req: any): Promise<{ filterAnd: any[], filterGroup: any }> {
    const filterAnd = [];
    const filterGroup: any = {};
    const filterOr = [];
    const expiresOnFilter = {
      $gt: new Date(),
    };
    const filterExpires = {
      $or: [
        { expiresOn: expiresOnFilter },
        { expiresOn: null },
        { expiresOn: '' },
      ],
    };

    filterGroup.$and = [];
    filterAnd.push({
      accessMode: { $ne: 'invitation' },
    });

    if (req.query.attempted && !req.query.unattempted) {
      if (req.query.multi) {
        filterOr.push({ _id: { $in: [] } });
      }
    }

    if (req.query.purchase && ((!req.query.invitation && !req.query.nonPaid && !req.query.buy) || req.query.multi)) {
      if (!req.query.multi) {
        filterAnd.push({ _id: { $in: [] } });
        filterAnd.push({ accessMode: 'buy' });
      } else {
        filterOr.push({ _id: { $in: [] } });
      }
    }

    if (req.query.buy && ((!req.query.invitation && !req.query.nonPaid && !req.query.purchase) || req.query.multi)) {
      if (!req.query.multi) {
        filterAnd.push({ accessMode: 'buy' });
      } else {
        filterOr.push({ accessMode: 'buy' });
      }
    }

    if (req.query.invitation && req.query.multi) {
      filterOr.push({ _id: { $in: [] } });
    }

    if (req.query.showFavoriteOnly) {
      if (!req.query.multi) {
        filterAnd.push({ _id: { $in: [] } });
      } else {
        filterOr.push({ _id: { $in: [] } });
      }
    }

    if (req.query.new) {
      filterOr.push({ user: { $ne: null } });
      filterGroup.$and.push({ user: { $ne: null } });
    }

    filterAnd.push({ status: 'published' });

    if (req.query.nonPaid) {
      const nonPass = {
        accessMode: { $nin: ['buy', 'invitation'] },
      };
      if (!req.query.multi && (!req.query.invitation && !req.query.buy)) {
        filterAnd.push(nonPass);
      } else {
        filterOr.push(nonPass);
      }
    }

    if (req.query.publiser) {
      const $users = req.query.publiser.split(',');
      filterAnd.push({ 'user': { $in: $users } });
      filterGroup.$and.push({ 'user': { $in: $users } });
    }

    filterAnd.push(filterExpires);
    filterGroup.$and.push(filterExpires);

    if (req.query.title) {
      const regexText = regexName(req.query.title);
      const filterTitle = {
        $or: [{ title: regexText }],
      };
      filterAnd.push(filterTitle);
      filterGroup.$and.push(filterTitle);
    }

    if (req.query.unit) {
      const filterByUnit = {
        'units._id': { $in: req.query.unit.split(',') },
      };
      filterAnd.push(filterByUnit);
      filterGroup.$and.push(filterByUnit);
    }

    if (req.query.subjects) {
      const filterBySubjects = {
        'subjects._id': { $in: req.query.subjects.split(',') },
      };
      filterAnd.push(filterBySubjects);
      filterGroup.$and.push(filterBySubjects);
    }

    if (req.query.rejectBuy) {
      const filterRejectBuy = {
        accessMode: { $ne: 'buy' },
      };
      filterAnd.push(filterRejectBuy);
      filterGroup.$and.push(filterRejectBuy);
    }

    if (req.query.multi && filterOr.length > 0) {
      filterAnd.push({ $or: filterOr });
    }

    return { filterAnd, filterGroup };
  }

  private async getAvaiableFilter(req: any): Promise<{ filter: any; filterGroup: any }> {
    try {
      const filters: { filter: any; filterGroup: any } = req.user
        ? await this.filterWhenUserLogin(req)
        : await this.filterForGuest(req);
      return filters;
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }


  async findPracticeAttempted(req: FindByAttemptRequest) {
    try {
      var page = (req.query.page) ? req.query.page : 1
      var limit = (req.query.limit) ? req.query.limit : 20
      var sort: any = { statusChangedAt: -1 };
      var skip = (page - 1) * limit
      if (req.query.sort) {
        const [sortField, sortOrder] = req.query.sort.split(',');
        sort = sortOrder === 'descending' ? { [sortField]: -1 } : { [sortField]: 1 };
      }

      this.attemptRepository.setInstanceKey(req.instancekey);

      const practices = await this.attemptRepository.distinct('practicesetId', {
        user: new ObjectId(req.user._id),
        isAbandoned: false
      })
      var { filter, filterGroup } = await this.getAvaiableFilter(req);

      if (req.query.attempted) {
        filter.push({
          _id: {
            $in: practices
          }
        })
      } else {

        filter.push({
          _id: {
            $nin: practices
          }
        })
      }

      this.practiceSetRepository.setInstanceKey(req.instancekey);
      const practiceSets = await this.practiceSetRepository.find({ $and: filter }, null, { sort: sort, skip: skip, limit: limit }, [{ path: 'user', options: { lean: true } }])

      return { response: practiceSets };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async countPracticeAttempted(request: CountByAttemptRequest) {
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const practices = await this.attemptRepository.distinct('practicesetId', {
        user: new ObjectId(request.user._id),
        isAbandoned: false
      })

      var { filter, filterGroup } = await this.getAvaiableFilter(request);
      if (request.query.attempted) {
        filter.push({
          _id: {
            $in: practices
          }
        })
      } else {
        filter.push({
          _id: {
            $nin: practices
          }
        })
      }
      const count = await this.practiceSetRepository.countDocuments({ $and: filter })

      return { count: count };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  private async gradeHistoryFilter(req: any): Promise<any> {
    const filter: any = {};
    const conditionOr: any = { $or: [] };

    try {
      if (req.query.attempted && req.query.multi) {
        const testAttempted = await this.getTestAttempted(req, filter);
        const filterAttempted = {
          _id: { $in: _.uniq(testAttempted) },
        };
        conditionOr.$or.push(filterAttempted);
      }

      if (req.query.multi && req.query.unattempted) {
        const testUnAttempted = await this.getTestUnAttempted(req, filter);
        const filterUnAttempted = {
          _id: { $nin: _.uniq(testUnAttempted) },
        };
        conditionOr.$or.push(filterUnAttempted);
      }

      if (req.query.purchase && req.query.multi) {
        const testPurchase = await this.getTestPurchase(req, filter);
        const filterBuy = {
          _id: { $in: testPurchase },
        };
        conditionOr.$or.push(filterBuy);
      }

      if (req.query.showFavoriteOnly && req.query.multi) {
        const favoritesTest = await this.getMyFavorite(req);
        const filterFavorite = {
          _id: { $in: favoritesTest },
        };
        conditionOr.$or.push(filterFavorite);
      }

      if (req.user.roles.includes('student')) {
        filter.status = 'published';
      }

      if (req.query.publiser) {
        const users = req.query.publiser.split(',').map(u => new ObjectId(u));
        if (users.length > 0) {
          filter.user = { $in: users };
        }
      }

      if (req.query.new) {
        const filterByNew = {
          _id: { $nin: req.user.practiceViews.map(pv => new ObjectId(pv)) },
        };
        if (req.query.multi) {
          conditionOr.$or.push(filterByNew);
        }
      }

      if (req.query.multi && req.query.invitation) {
        conditionOr.$or.push({ accessMode: 'invitation' });
      }

      if (req.query.multi && req.query.nonPaid) {
        conditionOr.$or.push({ accessMode: 'public' });
      }

      if (req.query.multi && req.query.buy) {
        conditionOr.$or.push({ accessMode: 'buy' });
      }

      if (req.query.units) {
        const units = req.query.units.split(',').map(s => new ObjectId(s));
        if (units.length > 0) {
          filter['units._id'] = { $in: units };
        }
      }

      if (req.query.subjects) {
        const subjects = req.query.subjects.split(',').map(s => new ObjectId(s));
        filter['subjects._id'] = { $in: subjects };
      }

      if (req.query.rejectBuy) {
        filter.accessMode = { $ne: 'buy' };
      }

      let finalFilter = filter;

      if (conditionOr.$or.length > 0) {
        finalFilter = {
          $and: [filter, conditionOr],
        };
      }

      if (req.query.title) {
        const search: any = {};
        const regexText = {
          $regex: new RegExp(escapeRegex(req.query.title), 'i'),
        };

        search.$or = [
          { title: regexText },
          { 'subjects.name': regexText },
          { 'units.name': regexText },
          { testMode: regexText },
        ];

        if (finalFilter.$and) {
          finalFilter.$and.push(search);
        } else {
          finalFilter = {
            $and: [filter, search],
          };
        }
      }

      return finalFilter;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  private async getAvaiableTestFilter(req: any): Promise<{ filter: any; filterGroup: any }> {
    try {
      const filters: { filter: any; filterGroup: any } = req.user
        ? await this.gradeHistoryFilter(req)
        : await this.filterForGuest(req);
      return filters;
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  /* 
  * There is the same method in student.controller
  * Any fixed in here need to be applied in student.controller
 */
  private async baseFilter(req: any): Promise<any> {
    var accessMode: any = {
      $or: [
        { accessMode: 'public' },
        { accessMode: 'buy' },
      ],
      "testseries.0": { "$exists": false },
      "courses.0": { "$exists": false }
    };

    const expire = {
      $or: [
        { expiresOn: { $gt: new Date() } },
        { expiresOn: null },
        { expiresOn: '' }
      ]
    };

    let invitationFilter = {};
    let classIds: ObjectId[] = [];
    const basicFilter = { $and: [accessMode, expire] };

    if (!req.user || !req.user.userId) {
      return basicFilter;
    }

    try {
      this.classroomRepository.setInstanceKey(req.instancekey);
      const classes = await this.classroomRepository.find({
        'students.studentUserId': req.user.userId,
        active: true
      }, {
        '_id': 1
      });

      if (!classes.length) {
        invitationFilter = {
          $and: [
            { accessMode: 'invitation' },
            { user: new ObjectId(req.user._id) }
          ]
        };

        accessMode.$or.push(invitationFilter);

        const locFilter = !req.user.roles.includes('publisher') ? { locations: new ObjectId(req.user.activeLocation) } : {};

        return { $and: [locFilter, accessMode, expire] };

      } else {
        classIds = _.map(classes, '_id');

        this.attendanceRepository.setInstanceKey(req.instancekey)
        const attendances = await this.attendanceRepository.find({
          studentId: new ObjectId(req.user._id),
          active: true,
          admitted: true,
          classId: { $in: classIds }
        });

        const testIds = _.map(attendances, 'practicesetId');

        invitationFilter = {
          $and: [
            { accessMode: 'invitation' },
            { allowStudent: true },
            {
              $or: [
                { classRooms: { $in: classIds } },
                { user: new ObjectId(req.user._id) }
              ]
            },
            {
              $or: [
                { requireAttendance: { $exists: false } },
                { requireAttendance: false },
                // In case require attendance, start date need to be over and attendance is allowed
                {
                  // $and: [{
                  //     $or: [{
                  //         startDate: null
                  //     }, {
                  //         startDate: {
                  //             $gt: new Date()
                  //         }
                  //     }]
                  // },
                  // {
                  _id: {
                    $in: testIds
                  }
                  // }]
                }
              ]
            }
          ]
        };

        accessMode.$or.push(invitationFilter);

        const locFilter = { locations: new ObjectId(req.user.activeLocation) };

        return { $and: [locFilter, accessMode, expire] };
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  private async getPracticeCount(strData: any, filter: any, req: any) {
    try {
      strData.$or = [
        { initiator: 'teacher' },
        { $and: [{ initiator: 'student' }, { user: new ObjectId(req.user._id) }] }
      ];

      const condition = { $match: strData };
      const testFilter = { $match: filter };

      this.practiceSetRepository.setInstanceKey(req.instancekey);
      const result: any = await this.practiceSetRepository.aggregate([
        condition,
        testFilter,
        { $count: 'total' }
      ]);

      return {
        count: result[0] ? result[0].total : 0,
        maxLevel: 0
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }


  async countPractice(request: CountPracticeRequest) {
    try {
      if (request.user.roles.includes('student')) {
        const basicFilter = await this.baseFilter(request);

        const filter = await this.getAvaiableTestFilter(request);

        if (request.user) {
          const result = await this.getPracticeCount(basicFilter, filter, request);

          return result;
        } else {
          this.practiceSetRepository.setInstanceKey(request.instancekey);
          const count = await this.practiceSetRepository.countDocuments(filter);
          return { count: count, maxLevel: 0 };
        }
      } else {
        let filter: any = {};
        if (request.query.title) {
          const regexText = {
            $regex: new RegExp(escapeRegex(request.query.title), 'i')
          };

          filter['$or'] = [
            { 'title': regexText },
            { 'subjects.name': regexText },
            { 'units.name': regexText },
            { 'testMode': regexText }
          ];
        }
        const result = await this.getPracticeCount({}, filter, request);

        return result;
      }
    } catch (error) {
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async getLastTest(request: GetLastTestMeRequest) {
    try {
      const settings = await this.redisCache.getSetting({ instancekey: request.instancekey }, function (settings: any) {
        return settings;
      })

      var condition: any = {}
      if (!settings.isWhiteLabelled) {
        if (request.user.roles.includes(config.roles.teacher) || request.user.roles.includes(config.roles.publisher) || request.user.roles.includes(config.roles.mentor)) {
          condition.user = new ObjectId(request.user._id)
        }
      } else {
        if (request.user.roles.includes(config.roles.mentor) || request.user.roles.includes(config.roles.publisher)) {
          condition.user = new ObjectId(request.user._id)
        }
      }

      var sort: any = { createdAt: -1 }
      if (request.query.status) {
        condition.status = request.query.status
      }
      if (request.query.sort) {
        const [sortField, sortOrder] = request.query.sort.split(',');
        sort = sortOrder === 'descending' ? { [sortField]: -1 } : { [sortField]: 1 };

      }

      this.practiceSetRepository.setInstanceKey(request.instancekey)
      const test = await this.practiceSetRepository.findOne(condition, {
        statusChangedAt: 1,
        _id: 0
      }, { sort: sort, lean: true });

      return { ...test };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async listPublisher(request: ListPublisherRequest) {
    const group = {
      $group: {
        _id: '$user'
      }
    };

    try {
      const { filter, filterGroup } = await this.getAvaiableFilter(request);

      const match = {
        $match: {
          $and: filter
        }
      };

      this.practiceSetRepository.setInstanceKey(request.instancekey)
      const result = await this.practiceSetRepository.aggregate([match, group]);

      if (result && result.length) {
        const users = result.map(u => u._id);
        this.usersRepository.setInstanceKey(request.instancekey)
        const userResults = await this.usersRepository.find({
          _id: {
            $in: users
          }
        }, {
          _id: 1,
          name: 1
        });

        return { response: userResults };
      } else {
        return {};
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async listUnit(request: ListUnitRequest) {
    const unwind = {
      $unwind: '$units'
    };

    const group = {
      $group: {
        _id: '$units._id'
      }
    };

    try {
      const { filter, filterGroup } = await this.getAvaiableFilter(request);

      const match = {
        $match: filterGroup
      };

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const result = await this.practiceSetRepository.aggregate([unwind, match, group]);

      if (result && result.length > 0) {
        const units = result.map(s => s._id);
        this.unitRepository.setInstanceKey(request.instancekey);
        const unitResults = await this.unitRepository.find({
          _id: {
            $in: units
          }
        }, {
          _id: 1,
          name: 1,
          subject: 1
        },
          { name: 1, lean: true },
          [{
            path: 'subject',
            select: 'name'
          }])

        return { response: unitResults };
      } else {
        return [];
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  // //NG API

  async testBySubject(request: TestBySubjectRequest): Promise<any> {
    try {
      const limit = request.limit ? request.limit : 35;
      const sort = { statusChangedAt: -1 };

      const condition = await this.baseFilter(request);
      const subject = request.id.split(',').map((s: string) => new ObjectId(s));

      condition['subjects._id'] = { '$in': subject };
      condition.status = 'published';
      condition.accessMode = { '$ne': 'buy' };

      if (request.searchText) {
        const regexText = regexName(request.searchText);
        condition.title = regexText;
      }

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const tests = await this.practiceSetRepository
        .find(condition, {
          title: 1, units: 1,
          totalQuestion: 1, subjects: 1, totalTime: 1, testMode: 1, status: 1, colorCode: 1, imageUrl: 1
        }, { sort: sort, limit: limit, lean: true });

      if (!tests) {
        throw new NotFoundException('Tests not found');
      }

      return { response: tests };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async testByTopic(request: TestByTopicRequest): Promise<any> {
    try {
      if (!request.id) {
        throw new NotFoundException('No test found');
      }

      this.questionRepository.setInstanceKey(request.instancekey)
      const topicTestIds = await this.questionRepository.distinct('practiceSets', { "topic._id": request.id });

      const condition = await this.baseFilter(request);
      if (request.searchText) {
        const regexText = regexName(request.searchText);
        condition.title = regexText;
      }

      condition.status = 'published';

      if (topicTestIds.length > 0) {
        condition._id = { $in: topicTestIds };
      }

      this.practiceSetRepository.setInstanceKey(request.instancekey)
      const tests = await this.practiceSetRepository.find(condition, {
        title: 1,
        subjects: 1,
        accessMode: 1,
        totalQuestion: 1,
        slugfly: 1,
        units: 1,
        totalTime: 1,
        testMode: 1,
        status: 1
      }, { lean: true });

      if (!tests) {
        throw new NotFoundException();
      }

      return { response: tests };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async topicQuestionDistributionByCategory(request: TopicQuestionDistributionByCategoryRequest) {
    try {
      if (!request.id) {
        throw new BadRequestException('invalid param');
      }

      const condition: any = {
        isAllowReuse: 'global',
        'topic._id': new ObjectId(request.id),
      };

      this.attemptDetailRepository.setInstanceKey(request.instancekey);
      const attemptedQuestion = await this.attemptDetailRepository.distinct("QA.question", { "QA.topic._id": new ObjectId(request.id) });

      condition["_id"] = { $nin: attemptedQuestion };

      this.questionRepository.setInstanceKey(request.instancekey);
      const questions = await this.questionRepository.aggregate([
        { $match: condition },
        {
          $group: {
            _id: { category: "$category", courseName: "$subject.name" },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            courseName: "$_id.courseName",
            category: "$_id.category",
            count: 1
          }
        }
      ]);

      return { response: questions };
    } catch (error) {
      Logger.error(error);
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  /* 
  * @req data-> params.id, query.hasAccessMode, instancekey, query.activeSubject,
  * query.getPackage, query.activeUnit, user, query.home, query.hasClassrooms
  */
  private async findOnePractice(req: any, filter: any[]) {
    try {
      if (req.id.length === 6) {
        filter.push({ testCode: regexCode(req.id) });
      } else {
        if (!ObjectId.isValid(req.id)) {
          throw new InternalServerErrorException();
        }
        if (!(await this.roleCheck(req, req.id))) {
          throw new NotFoundException('No access to this assessment')
        }
        filter.push({ _id: new ObjectId(req.id as string), active: true });
      }

      if (req.query.hasAccessMode === true) {
        return await this.findOneHasAccessMode(req, filter);
      } else {
        var practiceSet: any = await this.practiceSetRepository.findById(req.id);

        practiceSet = await this.practiceSetRepository.populate(practiceSet, [{
          path: 'questions.question',
          select: 'name _id category topic coding subject plusMark minusMark',
          options: { lean: true }
        },
        {
          path: 'lastModifiedBy',
          select: 'name email'
        },
        {
          path: 'instructors',
          select: 'name _id'
        }

        ]);

        if (!practiceSet) {
          throw new NotFoundException();
        }

        const oPractice = practiceSet;

        await Promise.all([
          this.handleActiveSubject(req, oPractice),
          this.handlePackage(req, oPractice),
          this.handleActiveUnit(req, oPractice),
          this.handleNumberQuestions(oPractice),
          this.handleUser(req, practiceSet, oPractice),
          this.countAttemptPracticeFindPractice(req, oPractice),
          this.checkFavorite(req, oPractice),
          this.populateCourses(req, oPractice),
          this.populateTestSeries(req, oPractice),
          this.checkEnrollment(req, oPractice)
        ]);

        await this.applyUniversityExamSettings(req, oPractice);

        return oPractice;
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async handleActiveSubject(req: any, oPractice: any): Promise<void> {
    try {
      if (!req.query.activeSubject) return;
      this.subjectRepository.setInstanceKey(req.instancekey)
      const subjects = await this.subjectRepository.find({ '_id': oPractice.subjects._id, 'active': false }, { _id: 1 }, { lean: true });

      oPractice.deActiceSubject = subjects.map(g => g._id);
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async handlePackage(req: any, oPractice: any): Promise<void> {
    try {
      if (oPractice.accessMode === 'buy' && req.query.getPackage) {
        this.testSeriesRepository.setInstanceKey(req.instancekey)
        const packageObject = await this.testSeriesRepository.findOne({ practiceIds: { $in: [oPractice._id] } }, null, { lean: true });
        oPractice['pack'] = packageObject;
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async handleActiveUnit(req: any, oPractice: any): Promise<void> {
    try {
      if (!req.query.activeUnit) return;
      const units = oPractice.units.map((s: any) => s._id);
      this.unitRepository.setInstanceKey(req.instancekey)
      const unitObjects = await this.unitRepository.find({ _id: { $in: units }, active: { $ne: false } }, { name: 1, active: 1, subject: 1 }, { lean: true });
      oPractice.unitObj = unitObjects;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private handleNumberQuestions(oPractice: any): void {
    try {
      oPractice.numberQuestions = oPractice.questions.length;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async handleUser(req: any, practiceSet: any, oPractice: any): Promise<void> {
    try {
      this.usersRepository.setInstanceKey(req.instancekey)
      const user = await this.usersRepository.findById(practiceSet.user, '-emailVerifyToken -emailVerifyExpired -hashedPassword -salt -passwordResetToken', { lean: true });
      oPractice.user = {
        'name': user.name,
        'roles': user.roles,
        'avatar': user.avatar,
        '_id': user._id,
        avatarUrl: user.avatar ? user.avatar.fileUrl : '',
        avatarUrlSM: user.avatarSM ? user.avatarSM.fileUrl : '',
        avatarUrlMD: user.avatarMD ? user.avatarMD.fileUrl : ''
      };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async countAttemptPracticeFindPractice(req: any, oPractice: any) {
    try {
      const result = await this.countAttemptPractice(req, oPractice);
      oPractice.totalAttempt = result;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }


  private async checkFavorite(req: any, oPractice: any): Promise<void> {
    try {
      const params = { user: oPractice.user, practiceSet: oPractice._id };
      this.favoriteRepository.setInstanceKey(req.instancekey);
      const fav = await this.favoriteRepository.findOne(params, null, { lean: true });
      if (fav) {
        oPractice.isFavorite = true;
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async populateCourses(req: any, oPractice: any): Promise<void> {
    try {
      if (!oPractice.courses) return;
      const params = { _id: { $in: oPractice.courses } };
      this.courseRepository.setInstanceKey(req.instancekey)
      const courses = await this.courseRepository.find(params, { _id: 1, title: 1 }, { lean: true });
      if (courses) {
        oPractice.courses = courses;
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async populateTestSeries(req: any, oPractice: any): Promise<void> {
    try {
      if (!oPractice.testseries) return;
      const params = { _id: { $in: oPractice.testseries } };
      this.testSeriesRepository.setInstanceKey(req.instancekey);
      const testSeries = await this.testSeriesRepository.find(params, { _id: 1, title: 1 }, { lean: true });
      if (testSeries) {
        oPractice.testseries = testSeries;
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async checkEnrollment(req: any, oPractice: any): Promise<void> {
    try {
      if (!req.user) return;
      this.userEnrollmentRepository.setInstanceKey(req.instancekey);
      const enrollment = await this.userEnrollmentRepository.findOne({ type: 'practice', item: oPractice._id, user: new ObjectId(req.user._id as string) }, null, { lean: true });
      oPractice.enrolled = !!enrollment;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async applyUniversityExamSettings(req: any, oPractice: any): Promise<void> {
    try {
      const settings = await this.redisCache.getSetting({ instancekey: req.instancekey }, function (settings: any) {
        return settings;
      })
      if (settings.features.universityExam && oPractice.testMode === 'proctored' && req.user.roles.includes(config.roles.student)) {
        oPractice.slugfly = slug((oPractice.subjects[0].name + ' - Proctor Exam').replace(/\s+/g, "-"), { lower: true });
        oPractice.title = oPractice.subjects[0].name + ' - Proctor Exam';
        oPractice.titleLower = oPractice.title.toLowerCase();
      }
      await this.settings.setPriceByUserCountry(req, oPractice);
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async roleCheck(req: any, test: string): Promise<boolean> {
    try {
      this.practiceSetRepository.setInstanceKey(req.instancekey)
      const tsD = await this.practiceSetRepository.findOne({ _id: new ObjectId(test) }, { _id: 1, accessMode: 1 }, { lean: true });
      if (req.user && req.user.roles.includes('teacher') && tsD.accessMode !== 'buy') {
        const roleFilter = {
          $or: [
            { user: new ObjectId(req.user._id as string) },
            { instructors: new ObjectId(req.user._id as string) },
            { peerVisibility: true }
          ]
        };

        const expire = {
          $or: [
            { expiresOn: { $gt: new Date() } },
            { expiresOn: null },
            { expiresOn: '' }
          ]
        };

        const tests = { _id: new ObjectId(test) };
        let filter: any = { $and: [tests, roleFilter] };

        const ts = await this.practiceSetRepository.findOne(filter, { _id: 1 }, { lean: true });

        if (ts) {
          return true;
        } else if (!ts) {
          filter = { $and: [expire, tests] };
          let val = false;
          this.practiceSetRepository.setInstanceKey(req.instancekey)
          const tss = await this.practiceSetRepository.findOne(filter, { _id: 1, courses: 1, testseries: 1 }, { lean: true });

          if (tss.courses && tss.courses.length > 0) {
            this.courseRepository.setInstanceKey(req.instancekey)
            const courses = await this.courseRepository.find({ _id: { $in: tss.courses } }, { _id: 1, instructors: 1, user: 1 }, { lean: true });
            for (const course of courses) {
              if (course && course.instructors.length > 0) {
                const index = course.instructors.findIndex((e: any) => e._id.toString() === req.user._id.toString());
                if (index > -1) {
                  val = true;
                  break;
                }
              }
              if (course.user) {
                const index = course.user._id.toString() === req.user._id.toString();
                // if (index > -1) {
                val = true;
                break;
                // }
              }
            }
            if (val) {
              return val;
            }
          }

          if (tss.testseries && tss.testseries.length > 0) {
            this.testSeriesRepository.setInstanceKey(req.instancekey)
            const testseries = await this.testSeriesRepository.find({ _id: { $in: tss.testseries } }, { _id: 1, instructors: 1, user: 1 }, { lean: true });
            for (const series of testseries) {
              if (series && series.instructors.length > 0) {
                const index = series.instructors.findIndex((e: any) => e.toString() === req.user._id.toString());
                if (index > -1) {
                  val = true;
                  break;
                }
              }
              if (series.user) {
                const index = series.user.toString() === req.user._id.toString();
                // if (index > -1) {
                val = true;
                break;
                // }
              }
            }
          }

          return val;
        } else {
          return false;
        }
      }

      return true;
    } catch (e) {
      Logger.error(e);
      return false;
    }
  }

  async findOneHasAccessMode(req: any, filter: any[]): Promise<void> {
    try {
      const settings = await this.redisCache.getSetting({ instancekey: req.instancekey }, function (settings: any) {
        return settings;
      })

      const accessRule = await this.getAccessRules(req);
      if (accessRule.length > 0) {
        filter.push({ $or: accessRule });
      }

      filter.push({
        $or: [
          { expiresOn: { $gt: new Date() } },
          { expiresOn: null },
          { expiresOn: '' },
        ],
      });
      filter.push({ status: 'published' });

      if (req.user && req.user.roles.includes('student')) {
        if (!req.user.subjects) {
          throw new NotFoundException("params: 'grade-profile' message: 'This practice test belongs to an examination type that is not set in your profile'")
        }

        this.practiceSetRepository.setInstanceKey(req.instancekey);
        const resultPractice = await this.practiceSetRepository.findOne({ _id: new ObjectId(req.id as string) }, { _id: 1 }, { lean: true });
        if (!resultPractice) {
          throw new NotFoundException("params: 'grade-profile' message: 'This practice test belongs to an examination type that is not set in your profile'")
        }
      }

      let project = {};
      if (req.query.home) {
        project = {
          _id: 1,
          testMode: 1,
          title: 1,
          totalTime: 1,
          totalQuestion: 1,
          accessMode: 1,
          instructions: 1,
          instructors: 1,
          statusChangedAt: 1,
          questionsToDisplay: 1,
          isAdaptive: 1,
          timePerQuestion: 1,
          questionMode: 1,
          user: 1,
          testType: 1,
          demographicData: 1,
          subjects: 1,
        };
      }

      this.practiceSetRepository.setInstanceKey(req.instancekey)
      let testQuery = await this.practiceSetRepository.findOne({ $and: filter }, project);
      testQuery = await this.practiceSetRepository.populate(testQuery, {
        path: 'units',
        select: 'name _id',
        options: { lean: true },
      })

      if (req.query.hasClassrooms) {
        testQuery = await this.practiceSetRepository.populate(testQuery, {
          path: 'classRooms',
          options: { lean: true },
        });
      }

      const oPractice = testQuery;

      if (!oPractice) {
        throw new NotFoundException();
      }

      await this.populatePracticeDetails(req, oPractice);

      if (settings.features.universityExam && oPractice.testMode === 'proctored') {
        oPractice.slugfly = slug((oPractice.subjects[0].name + ' - Proctor Exam').replace(/\s+/g, "-"), {
          lower: true
        });
        oPractice.title = oPractice.subjects[0].name + ' - Proctor Exam';
        oPractice.titleLower = oPractice.title.toLowerCase();
      }
      if (req.user && req.user.roles.includes('student')) {
        this.usersRepository.setInstanceKey(req.instancekey);
        await this.usersRepository.updateOne({ _id: new ObjectId(req.user._id as string) }, { $addToSet: { practiceViews: oPractice._id } });
      }

      return oPractice;

    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getAccessRules(req: any): Promise<any[]> {
    try {
      const accessRule = [];
      if (req.user) {
        accessRule.push({ accessMode: { $ne: 'invitation' } });
        if (req.user.email) {
          accessRule.push({ inviteeEmails: req.user.email });
        }
        if (req.user.phoneNumberFull) {
          accessRule.push({ inviteePhones: req.user.phoneNumberFull });
        }

        var condition = []
        if (req.user.email) {
          condition.push({
            studentUserId: req.user.email
          })
          condition.push({
            email: req.user.email
          })
        }
        if (req.user.phoneNumberFull) {
          condition.push({
            studentUserId: req.user.phoneNumberFull
          })
        }

        this.classroomRepository.setInstanceKey(req.instancekey);
        const classes = await this.classroomRepository.distinct('_id', {
          'students.studentUserId': req.user.userId,
          $or: [{ active: { $exists: false } }, { active: true }],
        });

        if (classes) {
          accessRule.push({ classRooms: { $in: classes } });
        }
      }
      return accessRule;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async populatePracticeDetails(req: Request, oPractice: any): Promise<void> {
    await Promise.all([
      this.countAttemptPracticeAccessMode(req, oPractice),
      this.populateUnits(req, oPractice),
      this.populateUser(req, oPractice),
      this.check_favorite(req, oPractice),
      this.checkAttendance(req, oPractice),
    ]);
  }

  private async countAttemptPracticeAccessMode(req: any, oPractice: any) {
    try {
      const result = await this.countAttemptPractice(req, oPractice);
      oPractice.totalAttempt = result;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async populateUnits(req: any, oPractice: any): Promise<void> {
    try {
      if (!req.query.home) {
        const subCount: any = await this.redisCache.globalGet(`${req.instancekey}_test_unit_count_${oPractice._id}`, function (subCount: any) {
          return subCount;
        })
        if (subCount) {
          oPractice.numberQuestions = subCount.numberQuestions;
          oPractice.questionsPerUnit = subCount.subs;
        } else {
          this.practiceSetRepository.setInstanceKey(req.instancekey);
          const results: any = await this.practiceSetRepository.aggregate([
            { $match: { _id: oPractice._id } },
            { $unwind: '$questions' },
            {
              $lookup: {
                from: 'questions',
                localField: 'questions.question',
                foreignField: '_id',
                as: 'questionInfo',
              },
            },
            { $unwind: '$questionInfo' },
            {
              $group: {
                _id: '$questionInfo.unit._id',
                name: { $first: '$questionInfo.unit.name' },
                count: { $sum: 1 },
                marks: { $sum: '$questionInfo.plusMark' },
              },
            },
            { $sort: { count: -1 } },
          ]);

          oPractice.questionsPerUnit = results;
          // oPractice.numberQuestions = results.reduce((sum, unit) => sum + unit.count, 0);
          oPractice.numberQuestions = 0
          for (var i = 0; i < results.length; i++) {
            oPractice.numberQuestions += results[i].count
          }
          await this.redisCache.globalGet(`${req.instancekey}_test_unit_count_${oPractice._id}`, { subs: results, numberQuestions: oPractice.numberQuestions })
        }
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async populateUser(req: any, oPractice: any): Promise<void> {
    try {
      this.usersRepository.setInstanceKey(req.instancekey)
      const user = await this.usersRepository.findById(oPractice.user, null, { lean: true });
      if (user) {
        oPractice.user = {
          'name': user.name,
          'roles': user.roles,
          'avatar': user.avatar,
          '_id': user._id,
          avatarUrl: user.avatar ? user.avatar.fileUrl : '',
          avatarUrlSM: user.avatarSM ? user.avatarSM.fileUrl : '',
          avatarUrlMD: user.avatarMD ? user.avatarMD.fileUrl : ''
        };
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async check_favorite(req: any, oPractice: any): Promise<void> {
    try {
      if (!req.query.home) {
        var favorite: any;
        if (req.user) {
          this.favoriteRepository.setInstanceKey(req.instancekey);
          favorite = await this.favoriteRepository.findOne({ user: new ObjectId(req.user._id as string), practiceSet: oPractice._id }, null, { lean: true });
          oPractice.isFavorite = favorite != null
        } else {
          oPractice.isFavorite = false;
        }
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async checkAttendance(req: any, oPractice: any): Promise<void> {
    try {
      if (!req.query.home && req.user) {
        this.attendanceRepository.setInstanceKey(req.instancekey);
        const att = await this.attendanceRepository.findOne({ practicesetId: oPractice._id, studentId: new ObjectId(req.user._id) }, null, { lean: true });
        if (att) {
          oPractice.attendance = {
            attemptLimit: att.attemptLimit,
            offscreenLimit: att.offscreenLimit,
          };
        }
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async countAttemptPractice(req: any, oPractice: any): Promise<number> {
    try {
      var condition: any = {
        practicesetId: oPractice._id,
        isAbandoned: false
      }
      if (req.user && !(req.user.roles.includes('publisher'))) {
        condition.location = new ObjectId(req.user.activeLocation as string)
        this.attemptRepository.setInstanceKey(req.instancekey);
        let result: any = await this.attemptRepository.aggregate([
          { $match: condition },
          { $group: { _id: '$user' } },
          { $count: 'total' }
        ])
        if (result && result.length) {
          oPractice.totalJoinedStudent = result[0].total
        } else {
          oPractice.totalJoinedStudent = 0
        }
      }
      this.attemptRepository.setInstanceKey(req.instancekey);
      let count = await this.attemptRepository.countDocuments(condition)

      return count;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOneWithTotalQuestion(request: FindOneSharedRequest) {
    try {
      var filter = []
      const result = await this.findOnePractice(request, filter);
      return { ...result };
    } catch (error) {
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async countByExamId(request: CountByExamIdRequest) {
    try {
      const settings = await this.redisCache.getSetting({ instancekey: request.instancekey }, function (settings: any) {
        return settings;
      })

      if (request.query.series) {
        const condition: any = {};
        if (request.query.name) {
          condition['p.title'] = regexName(request.query.name);
        }

        this.testSeriesRepository.setInstanceKey(request.instancekey)
        const result: any = await this.testSeriesRepository.aggregate([
          { $match: { "_id": new ObjectId(request.query.series) } },
          { $project: { 'praticeinfo': 1 } },
          { $unwind: "$praticeinfo" },
          {
            $lookup: {
              from: "practicesets",
              localField: "praticeinfo.practicesetId",
              foreignField: "_id",
              as: "p",
            },
          },
          { $unwind: "$p" },
          { $match: condition },
          { $count: 'total' },
        ]);

        return { count: result && result[0] ? result[0].total : 0 }
      }

      const condition: any = {
        locations: new ObjectId(request.user.activeLocation),
        $or: [
          { status: 'published' },
          { status: 'draft' },
        ],
      };

      if (request.query.name) {
        condition.title = new RegExp(request.query.name, 'i');
      }

      if (request.query.ids) {
        condition._id = { $in: request.query.ids.split(',').map((id: string) => new ObjectId(id)) };
      }

      if (request.query.subjects) {
        condition['subjects._id'] = { $in: request.query.subjects.split(',').map((id: string) => new ObjectId(id)) };
      }

      if (request.query.accessMode !== 'internal') {
        condition['accessMode'] = { $ne: 'internal' };
      }

      if (request.query.accessMode) {
        condition.accessMode = { $in: request.query.accessMode.split(',') };
      }

      if (request.query.accessMode === 'invitation' && request.query.classrooms) {
        condition['classRooms'] = {
          $in: request.query.classrooms.split(',').map((id: string) => new ObjectId(id)),
        };
      }

      let teacherIds: ObjectId[] = [];
      if (request.user.locations && request.user.locations.length > 0) {
        this.usersRepository.setInstanceKey(request.instancekey);
        teacherIds = await this.usersRepository.distinct('_id', {
          locations: { $in: request.user.locations.map(l => new ObjectId(l)) },
          role: { $ne: 'student' },
        });
      }

      if (request.user.roles.includes(config.roles.centerHead)) {
        condition.$or = [
          { user: { $in: teacherIds } },
          { user: new ObjectId(request.user._id) },
        ];
      }

      if (request.user.roles.includes(config.roles.teacher)) {
        condition.$or = [
          { $and: [{ peerVisibility: true }, { user: { $in: teacherIds } }] },
          {
            $or: [
              { user: new ObjectId(request.user._id) },
              { instructors: new ObjectId(request.user._id) },
            ],
          },
        ];
      }

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const count = await this.practiceSetRepository.countDocuments(condition);
      return { count: count };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInvalidArgumentException(error.message)
    }
  }

  async findByExamId(request: FindByExamIdRequest) {
    try {
      const settings = await this.redisCache.getSetting({ instancekey: request.instancekey }, function (settings: any) {
        return settings;
      })
      const page = request.query.page ? request.query.page : 1;
      const limit = request.query.limit ? request.query.limit : 20;
      const sort = { statusChangedAt: -1 };
      const skip = (page - 1) * limit;
      const condition: any = {};

      if (request.query.name) {
        condition.title = regexName(request.query.name);
      }

      if (request.query.series) {
        const projection: any = {
          '_id': "$p._id",
          'user': "$p.user",
          'totalQuestion': "$p.totalQuestion",
          'rating': "$p.rating",
          'updatedAt': "$p.updatedAt",
          'createdAt': "$p.createdAt",
          'totalJoinedStudent': "$p.totalJoinedStudent",
          'expiresOn': "$p.expiresOn",
          'statusChangedAt': "$p.statusChangedAt",
          'status': "$p.status",
          'attemptAllowed': "$p.attemptAllowed",
          'classRooms': "$p.classRooms",
          'titleLower': "$p.titleLower",
          'title': "$p.title",
          'accessMode': "$p.accessMode",
          'subjects': "$p.subjects",
          'units': "$p.units",
          'userInfo': "$p.userInfo",
          'totalTime': "$p.totalTime",
          'testCode': "$p.testCode",
          'isShowAttempt': "$p.isShowAttempt",
          'totalAttempt': "$p.totalAttempt",
          'testMode': "$p.testMode",
          'questions': "$p.questions",
          'price': "$p.price",
          'requireAttendance': "$p.requireAttendance",
          'isAdaptive': "$p.isAdaptive",
          'questionsToDisplay': "$p.questionsToDisplay",
          'slugfly': "$p.slugfly",
          'testType': "$p.testType",
          'order': "$praticeinfo.order",
          'index': "index",
          "autoEvaluation": "$p.autoEvaluation"
        };

        if (request.query.select) {
          const toSelect = request.query.select.split(',');
          projection._id = "$p._id";
          projection.order = "$praticeinfo.order";
          projection.titleLower = '$p.titleLower';
          toSelect.forEach((s: string) => {
            projection[s] = `$p.${s}`;
          });
        }

        this.testSeriesRepository.setInstanceKey(request.instancekey);
        const practiceSetByExam = await this.testSeriesRepository.aggregate([
          { $match: { _id: new ObjectId(request.query.series) } },
          { $project: { praticeinfo: 1 } },
          { $unwind: { path: "$praticeinfo", includeArrayIndex: "index" } },
          {
            $lookup: {
              from: "practicesets",
              localField: "praticeinfo.practicesetId",
              foreignField: "_id",
              as: "p",
            },
          },
          { $unwind: "$p" },
          { $project: projection },
          { $match: condition },
          { $sort: { order: 1 } },
          { $skip: skip },
          { $limit: limit },
        ]);

        //start
        if (!request.query.select || request.query.select.includes('totalAttempt')) {
          const result = await Promise.all(practiceSetByExam.map(async (practiceset: any) => {
            practiceset.slugfly = slug(practiceset.titleLower, {
              lower: true
            });
            practiceset.totalAttempt = await this.countAttemptPractice(request, practiceset);
            return practiceset;
          }));
          return { practiceSetByExam: result };
        } else {
          return { practiceSetByExam: practiceSetByExam };
        }
        //end
      } else {
        const condition: any = {
          locations: new ObjectId(request.user.activeLocation),
          status: { $in: ['published', 'draft'] },
        };

        if (request.query.subjects) {
          condition['subjects._id'] = { $in: request.query.subjects.split(',').map((id: string) => new ObjectId(id)) };
        }

        if (request.query.accessMode !== 'internal') {
          condition['accessMode'] = { $ne: 'internal' };
        }

        if (request.query.accessMode) {
          condition.accessMode = { $in: request.query.accessMode.split(',') };
        }

        if (request.query.testType) {
          condition.testType = { $in: request.query.testType.split(',') };
        }

        if (request.query.notAdaptive) {
          condition.isAdaptive = false;
        }

        if (request.query.accessMode === 'invitation' && request.query.classrooms) {
          condition.classRooms = {
            $in: request.query.classrooms.split(',').map((id: string) => new ObjectId(id)),
          };
        }

        if (request.query.ids) {
          condition._id = { $in: request.query.ids.split(',').map((id: string) => new ObjectId(id)) };
        }

        let teacherIds: ObjectId[] = [];
        if (request.user.locations && request.user.locations.length > 0) {
          this.usersRepository.setInstanceKey(request.instancekey)
          teacherIds = await this.usersRepository.distinct('_id', {
            locations: { $in: request.user.locations.map(l => new ObjectId(l)) },
            role: { $ne: 'student' },
          });
        }

        if (request.user.roles.includes(config.roles.publisher)) {
          delete condition.locations;
          condition.user = new ObjectId(request.user._id);
        } else if (request.user.roles.includes(config.roles.centerHead)) {
          condition.$or = [
            { user: { $in: teacherIds } },
            { user: new ObjectId(request.user._id) },
          ];
        } else if (request.user.roles.includes(config.roles.teacher)) {
          condition.$or = [
            { $and: [{ peerVisibility: true }, { user: { $in: teacherIds } }] },
            {
              $or: [
                { user: new ObjectId(request.user._id) },
                { instructors: new ObjectId(request.user._id) },
              ],
            },
          ];
        }

        if (request.query.name) {
          condition.title = regexName(request.query.name);
        }

        let projection: any = {
          createMode: 0,
          description: 0,
          instructions: 0,
          inviteeEmails: 0,
          inviteePhones: 0,
          studentEmails: 0,
          sectionJump: 0,
          randomizeAnswerOptions: 0,
          notes: 0,
          attemptAllowed: 0,
          countries: 0,
          enableMarks: 0,
          isMarksLevel: 0,
          isShowAttempt: 0,
          isShowResult: 0,
          minusMark: 0,
          plusMark: 0,
          randomQuestions: 0,
        };

        if (request.query.select) {
          const toSelect = request.query.select.split(',');
          projection = { _id: 1, titleLower: 1 };
          toSelect.forEach((s: string) => {
            projection[s] = 1;
          });
        }

        this.practiceSetRepository.setInstanceKey(request.instancekey)
        const practiceSetByExam = await this.practiceSetRepository.find(condition, projection, { sort: sort, skip: skip, limit: limit, lean: true });

        if (!request.query.select || request.query.select.includes('totalAttempt')) {
          const result = await Promise.all(practiceSetByExam.map(async (practiceset: any) => {
            practiceset.slugfly = slug(practiceset.titleLower, {
              lower: true
            });
            practiceset.totalAttempt = await this.countAttemptPractice(request, practiceset);
            return practiceset;
          }));

          return { practiceSetByExam: result };
        } else {
          return { practiceSetByExam: practiceSetByExam };
        }
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async getProcessingDocm(request: ProcessingDocmRequest) {
    const processing = await this.redisCache.get({ instancekey: request.instancekey }, request.user._id.toString() + '_docmProcessing', function (processing: any) {
      return processing;
    })
    return { response: JSON.stringify(processing) }
  }

  async updateAttendance(request: UpdateAttendanceRequest) {
    try {
      this.attendanceRepository.setInstanceKey(request.instancekey)
      var attendance = await this.attendanceRepository.findOne({
        teacherId: new ObjectId(request.user._id),
        practicesetId: new ObjectId(request.testId),
        studentId: new ObjectId(request.studentId),
        active: true,
      }, null, { lean: true });

      if (!attendance) {
        throw new NotFoundException();
      }

      if (attendance.status === 'started' || attendance.status === 'finished') {
        throw new ForbiddenException();
      }

      attendance.admitted = request.admitted;
      attendance.status = attendance.admitted ? 'ready' : 'absent';

      attendance = await this.attendanceRepository.findByIdAndUpdate(attendance._id, attendance);

      await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
      this.socketClientService.toUser(request.instancekey, attendance.teacherId, 'attendance.update', {
        studentId: attendance.studentId,
        status: attendance.status,
        admitted: attendance.admitted
      });

      this.practiceSetRepository.setInstanceKey(request.instancekey)
      const test = await this.practiceSetRepository.findById(request.testId);
      if (!test) {
        throw new NotFoundException();
      }

      const settings = await this.redisCache.getSetting({ instancekey: request.instancekey }, function (settings: any) {
        return settings;
      })

      this.notificationRepository.setInstanceKey(request.instancekey)
      var notification: any = await this.notificationRepository.create({
        receiver: attendance.studentId,
        type: 'notification',
        modelId: 'attendance',
        subject: `Test attendance ${request.admitted ? 'allowed' : 'forbidden'}`,
      });

      if (request.admitted) {
        notification.itemId = test._id;
      }
      notification = await this.notificationRepository.findByIdAndUpdate(notification._id, notification)

      const data = {
        sender: request.user,
        receiver: attendance.studentId,
        subject: 'Test attendance',
        message: `You are ${request.admitted ? 'allowed' : 'forbidden'} to attend this test ${test.title}`,
        itemId: test._id,
        modelId: 'attendance',
        type: 'message',
      };

      const tmlfile = 'test-attendance';
      const optionTmp = {
        senderName: 'We',
        admitted: request.admitted,
        testAttendance: request.admitted ? 'allowed' : 'forbidden',
        testTitle: test.title,
        testLink: `${settings.baseUrl}${test.testCode}`,
        subject: 'Practice test attendance',
      };

      if (attendance.studentUserId) {
        data['to'] = attendance.studentUserId;
        data['isEmail'] = isEmail(attendance.studentUserId);
        data['isScheduled'] = true;
      }

      await this.messageCenter.send_with_template(request.instancekey, tmlfile, optionTmp, data);

      return { data: attendance };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      } else if (error instanceof ForbiddenException) {
        throw new GrpcPermissionDeniedException(error.message);
      }
      throw new GrpcInternalException('Internal Server Error')
    }
  }

  async resetTerminatedAttempt(request: ResetTerminatedAttemptRequest) {
    const { user, test } = request;

    if (!user || !ObjectId.isValid(user) || !test || !ObjectId.isValid(test)) {
      throw new BadRequestException();
    }

    try {
      this.attendanceRepository.setInstanceKey(request.instancekey);
      await this.attendanceRepository.updateOne(
        { practicesetId: new ObjectId(test), studentId: new ObjectId(user) },
        { $set: { status: 'finished' } }
      );
      return { status: 'finished' }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateQuestionOrder(request: UpdateQuestionOrderRequest) {
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey);
      var test = await this.practiceSetRepository.findOne({ _id: new ObjectId(request.id) });
      if (!test) {
        throw new NotFoundException();
      }

      if (test.questions.length === 0) {
        return { status: 'ok' };
      }

      if (!test.questions[0].order) {
        test.questions.forEach((q, qIdx) => {
          q.order = qIdx + 1;
        });
      }

      if (!request.question || !request.order) {
        return { status: 'ok' };
      }

      if (request.order < 1 || request.order > test.questions.length) {
        throw new ForbiddenException();
      }

      const q1Idx = _.findIndex(test.questions, (q) => q.question.toString() === request.question);

      if (q1Idx === -1) {
        throw new NotFoundException();
      }

      if (test.questions[q1Idx].order === request.order) {
        return { status: 'ok' };
      }

      // if go up
      if (test.questions[q1Idx].order > request.order) {
        // increase the order number of all questions between new location and old location
        test.questions.forEach((q) => {
          if (q.question.toString() !== request.question && q.order >= request.order && q.order < test.questions[q1Idx].order) {
            q.order++;
          }
        });
      } else { // if go down
        test.questions.forEach((q) => {
          // decrease the order number of all questions between new location and old location
          if (q.question.toString() !== request.question && q.order <= request.order && q.order > test.questions[q1Idx].order) {
            q.order--;
          }
        });
      }

      test.questions[q1Idx].order = request.order;
      test = await this.practiceSetRepository.findByIdAndUpdate(test._id, test);

      const toReturn = {};
      test.questions.forEach(q => {
        toReturn[q.question.toString()] = q.order;
      });

      return { response: toReturn };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      } else if (error instanceof ForbiddenException) {
        throw new GrpcPermissionDeniedException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async destroy(request: DestroyPracticeRequest) {
    const filter = {
      _id: new ObjectId(request.id),
    };

    // If not has role admin then user must be the owner of this practice
    // JIRA PERFECTWEB-47
    if (!request.user.roles.includes('admin')) {
      filter['user'] = new ObjectId(request.user._id);
    }

    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey)
      const practiceSet = await this.practiceSetRepository.findOne(filter);

      if (!practiceSet) {
        throw new NotFoundException();
      }

      await this.practiceSetRepository.updateOne({ _id: new ObjectId(request.id) }, { $set: { active: false } });

      await this.removeFromPackage(request);
      await this.onPracticesetDelete(request, practiceSet);

      return { status: 'ok' };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  private async removeFromPackage(request: any) {
    try {
      this.testSeriesRepository.setInstanceKey(request.instancekey)
      await this.testSeriesRepository.updateMany(
        { "practiceIds": new ObjectId(request.id as string), "praticeinfo.practicesetId": new ObjectId(request.id as string) },
        { $pull: { practiceIds: new ObjectId(request.id as string), "praticeinfo": { practicesetId: new ObjectId(request.id as string) } } }
      );
      return;
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  private async onPracticesetDelete(request: any, practice: any) {
    try {
      let hasUsedQuestion = false;

      if (practice.questions.length > 0) {
        const questionIds = practice.questions.map((q) => q.question);
        this.questionRepository.setInstanceKey(request.instancekey)
        const questions = await this.questionRepository.find({
          _id: { $in: questionIds },
        });

        await Promise.all(
          questions.map(async (q) => {
            if (q.isAllowReuse === 'none') {
              this.eventBus.emit('Question.Updated', {
                insKey: request.instancekey,
                uploadDir: getAssets(request.instancekey),
                oQuestion: _.pick(q, 'questionHeader', 'questionText', 'answers', 'answerExplain'),
              });
              await q.remove();
            } else if (q.practiceSets && q.practiceSets.some((s) => s.equals(practice._id))) {
              // If this question is reusable and originally belong to this practiceSet
              // find if it is used by any other test.
              this.practiceSetRepository.setInstanceKey(request.instancekey)
              const result = await this.practiceSetRepository.find({
                'questions.question': q._id,
              });

              if (!result || result.length === 0) {
                this.eventBus.emit('Question.Updated', {
                  insKey: request.instancekey,
                  uploadDir: getAssets(request.instancekey),
                  oQuestion: _.pick(q, 'questionHeader', 'questionText', 'answers', 'answerExplain'),
                });
                await q.remove();
              } else {
                this.questionRepository.setInstanceKey(request.instancekey)
                await this.questionRepository.updateOne({ _id: q._id }, { $pull: { practiceSets: practice._id } });
                hasUsedQuestion = true;
              }
            }
          }),
        );
      }

      if (!hasUsedQuestion && practice.dirPath) {
        const fullPath = path.join(path.normalize(global.rootPath + '/..'), practice.dirPath);

        fs.access(fullPath, fs.constants.R_OK | fs.constants.W_OK, async (err) => {
          if (!err) {
            fs.readdir(fullPath, async (err, files) => {
              if (err) throw err;

              await Promise.all(
                files.map(async (file) => {
                  const filePath = path.join(fullPath, file);
                  const stat = await fs.promises.stat(filePath);
                  if (stat.isDirectory()) {
                    // Handle directory if needed
                  } else {
                    await fs.promises.unlink(filePath);
                  }
                }),
              );

              fs.rmdir(fullPath, (err) => {
                if (err) Logger.error(err);
              });
            });
          }
        });
      }
      return;
    } catch (err) {
      Logger.error('PracticeSet.Deleted', err);
      throw err;
    }
  }

  async testDetails(request: TestDetailsRequest) {
    try {
      const filter: any[] = [];
      if (request.id.length === 6) {
        filter.push({
          testCode: regexCode(request.id),
        });
      } else {
        if (!ObjectId.isValid(request.id)) {
          throw new NotFoundException();
        }
        filter.push({
          _id: new ObjectId(request.id),
        });
      }
      const settings = await this.redisCache.getSetting({ instancekey: request.instancekey }, function (settings: any) {
        return settings;
      })

      const accessRule = await this.testDetailsAccessRules(request);
      if (accessRule.length > 0) {
        filter.push({ $or: accessRule });
      }

      filter.push({
        $or: [
          { expiresOn: { $gt: new Date() } },
          { expiresOn: null },
          { expiresOn: '' },
        ],
      });

      if (request.query.withdraw) {
        filter.push({
          $or: [{ status: 'published' }, { status: 'revoked' }],
        });
      } else {
        filter.push({ status: 'published' });
      }

      const isStudent = request.user && request.user.roles.includes('student');

      if (isStudent) {
        this.practiceSetRepository.setInstanceKey(request.instancekey);
        const resultPractice = await this.practiceSetRepository.findOne({ _id: new ObjectId(request.id) }, { _id: 1 }, { lean: true });
        if (!resultPractice) {
          throw new NotFoundException('No tests found');
        }
      }

      const project = {
        user: 1,
        totalQuestion: 1,
        updatedAt: 1,
        createdAt: 1,
        totalJoinedStudent: 1,
        expiresOn: 1,
        statusChangedAt: 1,
        status: 1,
        plusMark: 1,
        minusMark: 1,
        enableMarks: 1,
        description: 1,
        title: 1,
        accessMode: 1,
        subjects: 1,
        units: 1,
        userInfo: 1,
        totalTime: 1,
        isShowResult: 1,
        testCode: 1,
        isShowAttempt: 1,
        totalAttempt: 1,
        countries: 1,
        isAdaptive: 1,
        questionsToDisplay: 1,
        testType: 1,
        testMode: 1,
        colorCode: 1,
        imageUrl: 1,
        demographicData: 1,
        isMarksLevel: 1,
        slug: 1,
        testseries: 1,
        courses: 1,
      };

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const testQuery = await this.practiceSetRepository.findOne({ $and: filter }, project, { lean: true });

      const oPractice: any = testQuery;
      if (!oPractice) {
        throw new NotFoundException();
      }

      await this.settings.setPriceByUserCountry(request, oPractice);

      this.attemptRepository.setInstanceKey(request.instancekey);
      const lastAttempt = await this.attemptRepository
        .findOne({
          practicesetId: oPractice._id,
          user: new ObjectId(request.user._id),
          isLevelReset: false,
        }, {
          isAbandoned: 1,
          ongoing: 1
        },
          { sort: { createdAt: -1 }, lean: true });

      if (lastAttempt) {
        oPractice.lastAttempt = lastAttempt;
      }

      oPractice.enrolled = await this.testDetailsCheckEnrollment(request, oPractice);
      const result = await this.countAttemptPractice(request, oPractice)

      oPractice.totalAttempt = result;
      if (settings.features.universityExam && oPractice.testMode === 'proctored') {
        oPractice.slugfly = slug((oPractice.title + ' - Proctor Exam').replace(/\s+/g, "-"), {
          lower: true
        });
        oPractice.title = oPractice.title + ' - Proctor Exam';
        oPractice.titleLower = (oPractice.title + ' - Proctor Exam').toLowerCase();
      }

      return oPractice;
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  private async testDetailsAccessRules(request: any) {
    try {
      const accessRule = [];
      if (request.user) {
        accessRule.push({ accessMode: { $ne: 'invitation' } });
        if (request.user.email) {
          accessRule.push({ inviteeEmails: request.user.email });
        }
        if (request.user.phoneNumberFull) {
          accessRule.push({ inviteePhones: request.user.phoneNumberFull });
        }

        var condition = []
        if (request.user.email) {
          condition.push({
            studentUserId: request.user.email
          })
          condition.push({
            email: request.user.email
          })
        }
        if (request.user.phoneNumberFull) {
          condition.push({
            studentUserId: request.user.phoneNumberFull
          })
        }

        this.classroomRepository.setInstanceKey(request.instancekey);
        const classes = await this.classroomRepository
          .distinct('_id', {
            'students.studentUserId': request.user.userId,
            active: true,
          });

        if (classes.length > 0) {
          accessRule.push({ classRooms: { $in: classes } });
        }
      }
      return accessRule;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async testDetailsCheckEnrollment(request: any, oPractice: any): Promise<boolean> {
    try {
      if (oPractice.accessMode === 'buy') {
        let refItems = []
        if (oPractice.testseries) {
          refItems = refItems.concat(oPractice.testseries)
        } else if (oPractice.courses) {
          refItems = refItems.concat(oPractice.courses)
        }

        if (refItems.length > 0) {
          this.userEnrollmentRepository.setInstanceKey(request.instancekey)
          const enrollment = await this.userEnrollmentRepository
            .findOne({ type: 'testseries', item: { $in: refItems }, user: new ObjectId(request.user._id as string) }, { _id: 1 }, { lean: true });
          return !!enrollment;
          // oPractice.enrolled = ut.length
        } else {
          this.userEnrollmentRepository.setInstanceKey(request.instancekey)
          const enrollment = await this.userEnrollmentRepository
            .findOne({ type: 'practice', item: oPractice._id, user: new ObjectId(request.user._id as string) }, { _id: 1 }, { lean: true });
          return !!enrollment;
        }

      } else {
        if (oPractice.subjects.length > request.user.subjects.length) {
          return false
        } else {
          var newArray = [];
          oPractice.subjects.forEach(subject => {
            const found = request.user.subjects.find(s => s.toString() === subject._id.toString());
            if (!found) {
              newArray.push(subject);
            }
          });
          if (newArray.length === 0) {
            return true;
          } else {
            return false;
          }
        }
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async index(request) {
    try {
      const page = request.query.page ? request.query.page : 1;
      const limit = request.query.limit ? request.query.limit : 20;
      let sort: any = { pinTop: -1, statusChangedAt: -1 };

      if (request.query.sort) {
        const [sortField, sortOrder] = request.query.sort.split(',');
        sort = sortOrder === 'desc' ? { pinTop: -1, [sortField]: -1 } : { pinTop: -1, [sortField]: 1 };
      }

      const skip = request.query.skip ? request.query.skip : (page - 1) * limit;

      const basicFilter = await this.baseFilter(request);
      if (request.query.tags) {
        basicFilter.tags = request.query.tags;
      }
      if (request.query.upcoming) {
        basicFilter.startDate = { $gte: new Date() };
      }
      basicFilter.isAdaptive = request.query.adaptive ?? false;

      const filter = await this.getAvaiableTestFilter(request);

      if (request.user) {
        const response = await this.getPracticeSetTests(basicFilter, sort, skip, limit, page, request, filter);

        return response

      } else {
        basicFilter.allowStudent = true;

        this.practiceSetRepository.setInstanceKey(request.instancekey);
        var practiceSets = await this.practiceSetRepository
          .find({ ...basicFilter, ...filter },
            'title countries pinTop autoEvaluation questionsToDisplay totalQuestion price totalTime testCode testMode totalJoinedStudent accessMode rating status statusChangedAt units subjects userInfo slugfly allowStudent', // Projection
            {
              sort,
              skip,
              limit,
              lean: true
            });

        for (var practiceSet of practiceSets) {
          practiceSet.isFavorite = false;

          practiceSet.totalAttempt = await this.countAttemptPractice(request, practiceSet);
        }
        return { results: practiceSets };
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  private async getPracticeSetTests(getStrData: any, sort: any, skip: number, limit: number, page: number, request: any, filter: any) {
    try {
      const settings = await this.redisCache.getSetting({ instancekey: request.instancekey }, function (settings: any) {
        return settings;
      })

      let project: any = {};
      if (request.query.home) {
        project = {
          $project: {
            colorCode: 1,
            totalQuestion: 1,
            imageUrl: 1,
            status: 1,
            title: 1,
            accessMode: 1,
            subjects: 1,
            testCode: 1,
            totalTime: 1,
            testMode: 1,
            pinTop: 1,
            statusChangedAt: 1,
            titleLower: 1,
            countries: 1,
          },
        };
      } else {
        project = {
          $project: {
            user: 1,
            totalQuestion: 1,
            rating: 1,
            updatedAt: 1,
            createdAt: 1,
            totalJoinedStudent: 1,
            expiresOn: 1,
            statusChangedAt: 1,
            status: 1,
            attemptAllowed: 1,
            notes: 1,
            plusMark: 1,
            minusMark: 1,
            enableMarks: 1,
            isMarksLevel: 1,
            instructions: 1,
            studentEmails: 1,
            classRooms: 1,
            inviteeEmails: 1,
            description: 1,
            titleLower: 1,
            title: 1,
            accessMode: 1,
            subjects: 1,
            units: 1,
            userInfo: 1,
            totalTime: 1,
            isShowResult: 1,
            testCode: 1,
            inviteePhones: 1,
            isShowAttempt: 1,
            totalAttempt: 1,
            questions: 1,
            countries: 1,
            requireAttendance: 1,
            isAdaptive: 1,
            questionsToDisplay: 1,
            slugfly: 1,
            testType: 1,
            testMode: 1,
            pinTop: 1,
            autoEvaluation: 1,
            allowStudent: 1,
            colorCode: 1,
            imageUrl: 1,
            partiallyAttempted: 1,
          },
        };
      }

      getStrData.$or = [{ initiator: 'teacher' }, { $and: [{ initiator: 'student' }, { user: new ObjectId(request.user._id as string) }] }];
      let condition: any = { $match: {} };
      if (request.user.roles.includes('student')) {
        condition = { $match: getStrData };
      }

      const testFilter = { $match: filter };

      if (request.query.sort) {
        const sortQuery = request.query.sort.split(',');
        sort = { pinTop: -1 };
        sort[sortQuery[0]] = sortQuery[1] === '-1' || sortQuery[1] === 'desc' ? -1 : 1;
      } else {
        sort = { pinTop: -1, statusChangedAt: -1 };
      }

      const sortData = { $sort: sort };
      const skipData = { $skip: skip };
      const limitData = { $limit: limit };

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      // const practiceSets = await this.practiceSetRepository.aggregate([condition, testFilter, project, sortData, skipData, limitData]);
      const practiceSets = await this.practiceSetRepository.aggregate([condition, testFilter, project, sortData, skipData, limitData]);
      const results = await Promise.all(practiceSets.map(async (practiceSet) => {
        let oPractice: any = practiceSet;

        if (settings.features.universityExam && oPractice.testMode === 'proctored') {
          oPractice.slugfly = slug((oPractice.subjects[0].name + ' - Proctor Exam').replace(/\s+/g, "-"), {
            lower: true
          });
          oPractice.title = oPractice.subjects[0].name + ' - Proctor Exam';
          if (!request.query.home) {
            oPractice.titleLower = (oPractice.subjects[0].name + ' - Proctor Exam').toLowerCase();
          }
        } else {
          if (!request.query.home) {
            oPractice.slugfly = slug(oPractice.titleLower, {
              lower: true
            })
          }
        }

        if (oPractice.accessMode === 'buy') {
          this.testSeriesRepository.setInstanceKey(request.instancekey);
          const packageObject = await this.testSeriesRepository.findOne({ practiceIds: { $in: [oPractice._id] } }, null, { lean: true });
          if (!request.query.home) {
            oPractice.package = packageObject;
          }
        }

        if (request.user) {
          this.favoriteRepository.setInstanceKey(request.instancekey);
          const favorite = await this.favoriteRepository.findOne({ user: new ObjectId(request.user._id as string), practiceSet: oPractice._id }, { lean: true });
          oPractice.isFavorite = !!favorite;
        } else {
          oPractice.isFavorite = false;
        }

        oPractice.totalAttempt = await this.countAttemptPractice(request, oPractice);

        if (request.query.includeLastAttempt) {
          this.attemptRepository.setInstanceKey(request.instancekey)
          // Get last attempt
          const lastAttempt = await this.attemptRepository.findOne({
            practicesetId: oPractice._id,
            user: new ObjectId(request.user._id),
            isLevelReset: false,
            // , ongoing: { $ne: true }
          }, {
            isAbandoned: 1,
            ongoing: 1,
          }, { sort: { createdAt: -1 }, lean: true });
          if (lastAttempt && !request.query.home) {
            oPractice.lastAttempt = lastAttempt;
          }
        }

        if (oPractice.testType === 'psychometry') {
          this.psychoResultRepository.setInstanceKey(request.instancekey)
          const psychoResult = await this.psychoResultRepository.findOne({
            user: new ObjectId(request.user._id as string),
            practiceset: oPractice._id,
          }, null, { sort: { createdAt: -1 }, lean: true });
          oPractice.psychoAttempted = psychoResult;
        }
        return oPractice;
      }))

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const countResult: any = await this.practiceSetRepository.aggregate([condition, testFilter, { $count: 'count' }]);
      const count = countResult && countResult[0] ? countResult[0].count : 0;

      await Promise.all(results.map(async (practiceSet) => {
        await this.settings.setPriceByUserCountry(request, practiceSet);
      }));

      return { results: results, count };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getOpeningGames(request: GetOpeningGamesRequest) {
    try {
      this.gameAttemptRepository.setInstanceKey(request.instancekey)
      const gameAttempts = await this.gameAttemptRepository.find({
        'player._id': new ObjectId(request.user._id as string),
        isActive: true,
        'game.expiresOn': { $gt: new Date() },
      }, null,
        { updatedAt: -1, lean: true },
        [
          { path: 'player._id', select: 'name avatar', options: { lean: true } },
          { path: 'game.inTurnPlayer._id', select: 'name avatar', options: { lean: true } },
          { path: 'game.players._id', select: 'name avatar', options: { lean: true } },
        ]);

      for (var g of gameAttempts) {
        g.player.avatarUrl = g.player._id.avatar ? g.player._id.avatar.fileUrl : '';
        g.player._id = g.player._id._id;

        g.game.inTurnPlayer.avatarUrl = g.game.inTurnPlayer._id.avatar ? g.game.inTurnPlayer._id.avatar.fileUrl : '';
        g.game.inTurnPlayer._id = g.game.inTurnPlayer._id._id;

        for (const p of g.game.players) {
          p.avatarUrl = p._id.avatar ? p._id.avatar.fileUrl : '';
          p._id = p._id._id;

          if (p._id.toString() !== request.user._id.toString()) {
            await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
            p.isOnline = await this.socketClientService.isOnline(request.instancekey, p._id);
          }
        }
      }

      return { response: gameAttempts };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async getGameHistory(request: GetGameHistoryRequest) {
    try {
      this.gameAttemptRepository.setInstanceKey(request.instancekey)
      const attempts = await this.gameAttemptRepository.find({
        'player._id': new ObjectId(request.user._id),
        $or: [
          { isEvaluated: true },
          { 'game.expiresOn': { $lt: new Date() } }
        ]
      }, null, { sort: { updatedAt: -1 }, lean: true });

      return { response: attempts };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async getGame(request: GetGameRequest) {
    try {
      const game: any = await new Promise((resolve) => {
        this.redisCache.getAndSetOne({ instancekey: request.instancekey, params: { id: request.id } }, 'game', null, function (game: any) {
          resolve(game);
        }
        );
      });

      if (game) {
        this.gameAttemptRepository.setInstanceKey(request.instancekey)
        const gameAttempt = await this.gameAttemptRepository.findOne({
          'player._id': new ObjectId(request.user._id),
          'game._id': new ObjectId(request.id),
          isAbandoned: false,
          'game.expiresOn': { $gt: new Date() },
        }, null, { lean: true });

        game.attempt = gameAttempt;

        return game;
      }

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const practiceSet = await this.practiceSetRepository.findById(new ObjectId(request.id), null, { lean: true });
      if (!practiceSet) {
        throw new NotFoundException();
      }
      const questions = await this.questionBus.getQuestionsByPractice(request.instancekey, practiceSet);
      practiceSet.questions = questions;

      const cachedGame: any = await new Promise((resolve) => {
        this.redisCache.getAndSetOne({ instancekey: request.instancekey, params: { id: request.id } }, 'game', practiceSet, function (cachedGame: any) {
          resolve(cachedGame);
        }
        );
      });

      this.gameAttemptRepository.setInstanceKey(request.instancekey)
      const gameAttempt = await this.gameAttemptRepository.findOne({
        'player._id': new ObjectId(request.user._id),
        'game._id': new ObjectId(request.id),
        isActive: true,
        isAbandoned: false,
        'game.expiresOn': { $gt: new Date() },
      }, null, { lean: true });

      cachedGame.attempt = gameAttempt;
      return cachedGame;
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  private async getRandomArbitrary(min: number, max: number) {
    return Math.ceil(Math.random() * (max - min) + min);
  }

  private async newGameValidation(req: any): Promise<void> {
    try {
      if (!req.body.isFriend) {
        // In this case, random opponent
        // We will find opponent for the user
        this.gameAttemptRepository.setInstanceKey(req.instancekey);
        const gameAttempts = await this.gameAttemptRepository.find({
          'player._id': new ObjectId(req.user._id as string),
          isAbandoned: false,
          isActive: true,
          'game.expiresOn': { $gt: new Date() },
        }, null, { lean: true });

        const opponents = [req.user._id.toString()];

        for (const gameAttempt of gameAttempts) {
          gameAttempt.game.players.forEach((p) => {
            if (!opponents.includes(p._id.toString())) {
              opponents.push(p._id.toString());
            }
          });
        }

        const userFilter = {
          _id: { $nin: opponents },
          role: 'student',
          isActive: true,
          subjects: req.body.grade._id,
        };

        // var or = [{
        //     studentUserId: {
        //         $exists: true
        //     }
        // }, {
        //     phoneNumber: {
        //         $exists: true
        //     }
        // }, {
        //     email: {
        //         $exists: true
        //     }
        // }]

        this.usersRepository.setInstanceKey(req.instancekey);
        const userCount = await this.usersRepository.countDocuments(userFilter);

        if (userCount === 0) {
          throw new Error('Cannot find any opponent.');
        }

        const random = await this.getRandomArbitrary(0, userCount - 1);

        this.usersRepository.setInstanceKey(req.instancekey);
        const users = await this.usersRepository.find(userFilter, null, { skip: random, limit: 1, lean: true });

        const customPlayer = {
          studentId: users[0]._id,
          studentUserId: users[0].userId,
          email: users[0].email,
          phoneNumber: users[0].phoneNumber,
        };
        req.body.friends = [customPlayer];
        return;
      } else {
        if (!req.body.friends || req.body.friends.length === 0) {
          throw { status: 400, msg: 'No opponent found.' };
        }
        if (req.body.friends.length > 1) {
          throw { status: 400, msg: 'Only one opponent allowed.' };
        }

        // Get all active games that user is playing
        this.gameAttemptRepository.setInstanceKey(req.instancekey);
        const gameAttempts = await this.gameAttemptRepository.find({
          'player._id': new ObjectId(req.user._id as string),
          isAbandoned: false,
          isActive: true,
          'game.expiresOn': { $gt: new Date() },
        }, null, { lean: true });

        const opponent = req.body.friends[0];

        for (const gameAttempt of gameAttempts) {
          var idx = _.findIndex(gameAttempt.game.players, function (p) {
            return p._id.equals(opponent.studentId)
          })
          if (idx > -1) {
            throw { status: 400, msg: 'You are already having an ongoing game with this opponent.' };
          }
        }
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async shuffle(a: any) {
    var j: number, x: any, i: number;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }

  async newGame(request: NewGameRequest) {
    try {
      await this.newGameValidation(request);

      const selectedGrade = request.body.grade;
      const opponents = request.body.friends;

      const limitrecords = 10;
      let complexity = 'easy';

      var qCount = await this.getQuestionCount(request, selectedGrade, complexity, limitrecords);

      if (qCount < limitrecords) {
        complexity = 'moderate';
        qCount = await this.getQuestionCount(request, selectedGrade, complexity, limitrecords);
      }

      if (qCount < limitrecords) {
        complexity = 'hard';
        qCount = await this.getQuestionCount(request, selectedGrade, complexity, limitrecords);
      }

      this.unitRepository.setInstanceKey(request.instancekey);
      const units = await this.unitRepository.find({ subject: new ObjectId(selectedGrade._id as string) }, null, { lean: true });
      await this.shuffle(units);

      if (qCount < limitrecords) {
        throw new NotFoundException('Selected grade does not have enough questions to play.');
      }


      const foundQuestions = await this.getRandomQuestions(request, units, selectedGrade, complexity, limitrecords);

      // Trim array down to 10
      const questions = foundQuestions.slice(0, limitrecords);
      const { newPracticeset, allPlayers } = await this.createPracticeSet(request, questions, opponents);

      await this.createGameAttempts(request, newPracticeset, allPlayers);

      await this.notifyPlayers(request, opponents, newPracticeset);

      return { practiceId: newPracticeset._id };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  private async getQuestionCount(request, selectedGrade, complexity, limitrecords): Promise<number> {
    try {
      this.questionRepository.setInstanceKey(request.instancekey);
      return this.questionRepository.countDocuments({
        isAllowReuse: 'global',
        category: 'mcq',
        'subject._id': new ObjectId(selectedGrade._id as string),
        complexity: complexity
      });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getRandomQuestions(request, units, selectedGrade, complexity, limitrecords) {
    try {
      const filter = {
        isAllowReuse: 'global',
        category: 'mcq',
        'subject._id': new ObjectId(selectedGrade._id as string),
        complexity: complexity
      };

      // Loop through random list of subjects and fetch questions 
      let foundQuestions = [];
      let subIdx = 0;

      while (foundQuestions.length < limitrecords) {
        const unit = units[subIdx % units.length];
        subIdx++;
        filter['unit._id'] = unit._id;

        this.questionRepository.setInstanceKey(request.instancekey);
        const count = await this.questionRepository.countDocuments(filter);
        const random = await this.getRandomArbitrary(0, count > 3 ? count - 3 : count);
        this.questionRepository.setInstanceKey(request.instancekey);
        const questions = await this.questionRepository.find(filter, null, { skip: random, limit: 3, lean: true });
        foundQuestions = foundQuestions.concat(questions);
      }

      return foundQuestions;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async createPracticeSet(request, questions, opponents) {
    // Tada! random question
    // 2. Create a test with these random questions
    // Get list of units
    try {
      var units = []
      questions.forEach(function (q) {
        let sIdx = _.findIndex(units, (s) => {
          return s._id.equals(q.unit._id)
        })
        if (sIdx === -1) {
          units.push(q.unit)
        }
      })

      var practiceSet: any = {};

      practiceSet.subjects = [questions[0].subject];
      practiceSet.units = units;
      practiceSet.accessMode = 'invitation';
      practiceSet.status = 'published';
      practiceSet.expiresOn = moment(new Date()).add(2, 'days');
      practiceSet.attemptAllowed = 1;
      practiceSet.totalQuestion = 10;

      practiceSet.totalTime = 10;
      practiceSet.statusChangedAt = new Date();
      practiceSet.isShowResult = true;
      practiceSet.user = new ObjectId(request.user._id as string);

      practiceSet.inviteePhones = [];
      practiceSet.inviteeEmails = [];
      practiceSet.showFeedback = false;

      practiceSet.testType = 'game';

      //updated 01-20
      practiceSet.initiator = 'student';

      practiceSet.createMode = 'questionPool';
      practiceSet.userInfo = {
        _id: new ObjectId(request.user._id as string),
        name: request.user.name
      }

      practiceSet.locations = [new ObjectId(request.user.activeLocation as string)]

      practiceSet.enableMarks = false;
      practiceSet.testCode = getUniqueCode(6);
      practiceSet.title = "New game created by " + request.user.name + " - " + practiceSet.testCode;

      if (request.user.email) {
        practiceSet.inviteeEmails.push(request.user.email)
      }
      if (request.user.phoneNumberFull) {
        practiceSet.inviteePhones.push(request.user.phoneNumberFull)
      }

      var allPlayers = []
      allPlayers.push(request.user._id.toString());

      for (var idx = 0; idx < opponents.length; idx++) {
        var o = opponents[idx]
        allPlayers.push(o.studentId);

        if (o.studentUserId) {
          if (isEmail(o.studentUserId)) {
            practiceSet.inviteeEmails.push(o.studentUserId);
          } else {
            practiceSet.inviteePhones.push(o.studentUserId);
          }
        } else {
          if (o.email) {
            practiceSet.inviteeEmails.push(o.email);
          } else if (o.phoneNumber) {
            practiceSet.inviteePhones.push(o.phoneNumber);
          } else {
            throw new NotFoundException('Cannot find your opponent')
          }
        }
      }
      // practiceSet.studentEmails = opponents.map(function(o) {
      //     return o.studentUserId;
      // });

      practiceSet.questions = questions.map(function (q) {
        return {
          question: q._id
        }
      })

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const newPracticeset = await this.practiceSetRepository.create(practiceSet);
      return { newPracticeset, allPlayers };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  private async createGameAttempts(request, newPracticeset, allPlayers): Promise<void> {
    try {
      this.usersRepository.setInstanceKey(request.instancekey);
      const players = await this.usersRepository.find({ _id: { $in: allPlayers } }, null, { lean: true });

      var inTurnPlayer = {};
      var playersInfo = [];
      players.forEach(function (p) {
        if (p._id.toString() === request.user._id.toString()) {
          inTurnPlayer = {
            _id: p._id,
            name: p.name
            // ,avatar: p.avatar
          };
        }

        playersInfo.push({
          _id: p._id,
          name: p.name
          // ,avatar: p.avatar
        });
      })
      var gameAttemptData: any;
      await Promise.all(players.map(async (player) => {
        gameAttemptData = {
          player: {
            _id: player._id,
            name: player.name
            // ,avatar: player.avatar
          },
          game: {
            _id: newPracticeset._id,
            title: newPracticeset.title,
            subject: {
              _id: newPracticeset.subjects[0]._id,
              name: newPracticeset.subjects[0].name
            },
            expiresOn: newPracticeset.expiresOn,
            players: playersInfo,
            inTurnPlayer: inTurnPlayer
          },
          isInTurn: player._id.toString() === request.user._id.toString()
        };

        await this.gameAttemptRepository.create(gameAttemptData);
      }));
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async notifyPlayers(request, opponents, newPracticeset) {
    try {
      var playerIds = [];
      await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
      for (const o of opponents) {
        await this.socketClientService.toUser(
          request.instancekey,
          o.studentId,
          'game.start',
          { game: newPracticeset._id }
        );
        playerIds.push(o.studentId);
      }

      this.pushService.pushToUsers(request.instancekey, playerIds,
        'You are invited to play game',
        'You are invited to play game', {
        custom: {
          state: {
            // State to go on mobile
            name: 'student.game',
            params: {
              id: newPracticeset._id
            }
          }
        }
      })
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // Check if a test can be published
  async checkQuestionsBeforePublish(request: CheckQuestionsBeforePublishRequest) {

    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey)
      var test = await this.practiceSetRepository.findOne({
        _id: new ObjectId(request.id)
      }, null, { lean: true })
      test = await this.practiceSetRepository.populate(test, {
        path: 'questions.question', populate: { path: 'category' }
      })


      if (!test) {
        throw new NotFoundException();
      }

      var codingAndDesTypeQuestion = 0

      if (test.questions.length >= 2) {
        test.questions.forEach(function (q, qI) {
          if (q.question.category == 'code' || q.question.category == 'descriptive') {
            codingAndDesTypeQuestion++;
          }
        })
      }

      if (test.totalQuestion < 5 && codingAndDesTypeQuestion < 2) {
        throw new NotFoundException('Please add  at least 5 questions or 2 coding questions before publishing the assessment.');
      }

      return { status: "OK" };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async getFeedbacks(request: GetFeedbacksRequest) {
    try {
      const page = request.query.page ? parseInt(request.query.page, 10) : 1;
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : 20;
      const skip = (page - 1) * limit;
      const sortAttr = request.query.sortAttr ? request.query.sortAttr : 'createdAt';
      const sortType = request.query.isAscSort === 'true' ? 1 : -1;

      const conditions: any = {
        practiceSetId: new ObjectId(request.id),
      };

      if (request.query.rating && request.query.rating !== '0') {
        conditions.rating = Number(request.query.rating);
      }
      this.feedbackRepository.setInstanceKey(request.instancekey)

      const [data, count] = await Promise.all([
        await this.feedbackRepository.find(conditions, null, { sort: { [sortAttr]: sortType }, skip: skip, limit: limit }, [{ path: 'user', options: { lean: true } }]),
        await this.feedbackRepository.countDocuments(conditions),
      ]);

      return { data, count };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async searchOne(request: SearchOneRequest) {
    try {
      var filter: any = {}

      if (request.id === 'me') {
        filter.user = new ObjectId(request.user._id)
      } else {
        filter._id = new ObjectId(request.id)
      }
      if (request.status) {
        filter.status = request.status
      }

      this.practiceSetRepository.setInstanceKey(request.instancekey)
      const result = await this.practiceSetRepository.findOne(filter, null, { lean: true })
      return { response: result }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async findQuestionTemporary(request: FindQuestionTemporaryRequest) {
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey)
      const temptPractice = await this.practiceSetRepository.findOne({
        user: new ObjectId(request.user._id),
        status: 'tempt',
        'questions.question': new ObjectId(request.quesId)
      }, null, { lean: true })

      if (temptPractice) {
        return { exist: true }
      } else {
        return { exist: false }
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async getByTestSeries(request: GetByTestSeriesRequest) {
    try {
      var projection = {
        _id: "$p._id",
        user: "$p.user",
        totalQuestion: "$p.totalQuestion",
        rating: "$p.rating",
        updatedAt: "$p.updatedAt",
        createdAt: "$p.createdAt",
        totalJoinedStudent: "$p.totalJoinedStudent",
        expiresOn: "$p.expiresOn",
        statusChangedAt: "$p.statusChangedAt",
        status: "$p.status",
        attemptAllowed: "$p.attemptAllowed",
        classRooms: "$p.classRooms",
        titleLower: "$p.titleLower",
        title: "$p.title",
        accessMode: "$p.accessMode",
        subjects: "$p.subjects",
        units: "$p.units",
        userInfo: "$p.userInfo",
        totalTime: "$p.totalTime",
        testCode: "$p.testCode",
        isShowAttempt: "$p.isShowAttempt",
        totalAttempt: "$p.totalAttempt",
        testMode: "$p.testMode",
        requireAttendance: "$p.requireAttendance",
        isAdaptive: "$p.isAdaptive",
        questionsToDisplay: "$p.questionsToDisplay",
        testType: "$p.testType",
        order: "$praticeinfo.order",
        index: "$index",
        autoEvaluation: "$p.autoEvaluation",
        imageUrl: "$p.imageUrl",
        level: "$p.level"
      }

      this.testSeriesRepository.setInstanceKey(request.instancekey);
      const tests: any = await this.testSeriesRepository.aggregate([{
        $match: {
          _id: new ObjectId(request.id)
        }
      },
      {
        $project: {
          praticeinfo: 1
        }
      },
      {
        $unwind: {
          path: "$praticeinfo",
          includeArrayIndex: "index"
        }
      },
      {
        $lookup: {
          from: "practicesets",
          let: { tid: "$praticeinfo.practicesetId" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$tid"] }, status: 'published' }
            }
          ],
          as: "p"
        }
      },
      {
        $unwind: "$p"
      },
      {
        $project: projection
      },
      {
        $sort: {
          order: 1
        }
      }
      ])

      for (let test of tests) {
        test.slugfly = slug(test.titleLower, {
          lower: true
        })
      }

      return { practiceSetByExam: tests };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async getSupportedProfile() {
    try {
      var profiles: any = await this.redisCache.globalGet('supportedProfiles', function (profiles: any) {
        return profiles;
      })
      let url = `http://extractor.myperfectice.com/ExtractService/api/content/profiles`

      const response: any = await axios.get(url);

      // if (response.statusCode == 200 && body) {
      //   profiles = JSON.parse(body)
      //   await this.redisCache.globalSet('supportedProfiles', profiles)

      //   res.status(200).send(profiles)
      // } else {
      //   res.sendStatus(404)
      // }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async findTestByTestCode(req: FindTestByTestCodeRequest) {
    try {
      if (!req.id) {
        throw new BadRequestException();
      }

      var testCode = req.id
      if (req.id.length > 6) {
        // Check both class and test 
        testCode = req.id.slice(0, 6);
        let classCode = req.id.slice(6);

        this.classroomRepository.setInstanceKey(req.instancekey)
        let classroom = await this.classroomRepository.findOne({
          seqCode: regexCode(classCode)
        }, null, { lean: true });

        if (!classroom) {
          throw new NotFoundException('Invalid code');
        }

        this.practiceSetRepository.setInstanceKey(req.instancekey);
        var test = await this.practiceSetRepository.findOne({
          testCode: regexCode(testCode)
        }, {
          _id: 1,
          subjects: 1,
          user: 1,
          accessMode: 1,
          testMode: 1,
          isAdaptive: 1,
          title: 1,
          titleLower: 1,
          camera: 1
        }, { lean: true })

        test = await this.practiceSetRepository.populate(test, { path: 'user', select: 'country', options: { lean: true } });

        if (test) {
          test.slugfly = slug(test.titleLower, {
            lower: true
          })
          test['type'] = 'practice'
          return test;
        }

        let crs = await this.courseRepository.findOne({
          courseCode: regexCode(testCode)
        }, {
          _id: 1,
          title: 1,
          titleLower: 1,
          subjects: 1
        })

        if (crs) {
          crs['type'] = 'course'
          return crs;
        }

        this.testSeriesRepository.setInstanceKey(req.instancekey);
        let ts = await this.testSeriesRepository.findOne({
          testseriesCode: regexCode(testCode)
        }, {
          _id: 1,
          title: 1,
          titleLower: 1,
          subjects: 1
        }, { lean: true });

        if (ts) {
          ts.type = 'testseries'
          return ts;
        }
        if (!test && !crs && !ts) {
          throw new NotFoundException('Invalid code');
        }


      } else {
        this.practiceSetRepository.setInstanceKey(req.instancekey)
        let test = await this.practiceSetRepository.findOne({
          testCode: regexCode(testCode)
        }, {
          _id: 1,
          subjects: 1,
          user: 1,
          accessMode: 1,
          testMode: 1,
          isAdaptive: 1,
          titleLower: 1,
          camera: 1
        }, { lean: true })
        test = await this.practiceSetRepository.populate(test, { path: 'user', select: 'country', options: { lean: true } })

        if (test) {
          test.slugfly = slug(test.titleLower, {
            lower: true
          })
          test['type'] = 'practice'

          return test;
        }

        this.courseRepository.setInstanceKey(req.instancekey);
        let crs = await this.courseRepository.findOne({
          courseCode: regexCode(testCode)
        }, {
          _id: 1,
          title: 1,
          titleLower: 1,
          subject: 1
        }, { lean: true });

        if (crs) {
          crs['type'] = 'course'

          return crs;
        }
        this.testSeriesRepository.setInstanceKey(req.instancekey)
        let ts = await this.testSeriesRepository.findOne({
          testseriesCode: regexCode(testCode)
        }, {
          _id: 1,
          title: 1,
          titleLower: 1,
          subjects: 1
        }, { lean: true });

        if (ts) {
          ts['type'] = 'testseries'

          return ts;
        }
        if (!test && !crs && !ts) {
          throw new NotFoundException('Invalid code');
        }
      }
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }

  }

  async findForMentor(request: FindForMentorRequest) {
    try {
      let limit = request.query.limit ? request.query.limit : 20;
      var sort = { statusChangedAt: -1 };
      var condition = await this.baseFilter(request);

      // condition['subjects._id'] = { $in: request.user.subjects }
      condition.status = 'published'
      condition.accessMode = { $nin: ['buy', 'internal'] }

      if (request.user.preferences && !request.user.preferences.viewExistingAssessment) {
        condition.user = new ObjectId(request.user._id)
      }
      if (request.user.roles.includes('teacher')) {
        condition.$or =
          [{
            user: new ObjectId(request.user._id)
          }, {

            instructors: new ObjectId(request.user._id)
          }]
      }
      if (request.query.searchText) {
        var regexText = regexName(request.query.searchText)
        condition.title = regexText;
      }
      this.practiceSetRepository.setInstanceKey(request.instancekey);
      let tests = await this.practiceSetRepository
        .find(condition, {
          title: 1, units: 1, accessMode: 1,
          totalQuestion: 1, questionsToDisplay: 1, subjects: 1, totalTime: 1, testMode: 1, status: 1, colorCode: 1, imageUrl: 1
        }, { sort: sort, limit: limit, lean: true });
      if (!tests) {
        throw new NotFoundException();
      }

      return { response: tests }
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async getBuyModeTestForTeacher(req: GetBuyModeTestForTeacherRequest) {
    try {
      var page = (req.query.page) ? req.query.page : 1
      var limit = (req.query.limit) ? req.query.limit : 5
      var skip = (page - 1) * limit
      var condition: any = {
        accessMode: 'buy',
        status: 'published',
        locations: new ObjectId(req.user.activeLocation)
      }
      if (req.query.status) {
        condition['status'] = req.query.status
      }
      if (req.query.title) {
        var regexText = regexName(req.query.title)
        condition['title'] = regexText;
      }
      this.userEnrollmentRepository.setInstanceKey(req.instancekey)
      let enrolledTests = await this.userEnrollmentRepository.distinct('item', {
        user: new ObjectId(req.user._id),
        type: 'practice',
      })
      condition._id = { $nin: enrolledTests }
      this.practiceSetRepository.setInstanceKey(req.instancekey);
      var results = await this.practiceSetRepository.find(condition,
        { title: 1, totalTime: 1, countries: 1, totalQuestion: 1, questionsToDisplay: 1, subjects: 1, imageUrl: 1, colorCode: 1, testMode: 1, accessMode: 1 },
        { limit: limit, skip: skip, lean: true },
        [{ path: 'user', select: 'name _id' }]);

      for (let r of results) {
        await this.settings.setPriceByUserCountry(req, r)
      }
      return { response: results };
    } catch (e) {
      Logger.error(e)
      throw new GrpcInternalException(e)
    }
  }

  async removeQuestion(req: RemoveQuestionRequest) {
    if (!req.body.question) {
      throw new NotFoundException();
    }

    try {
      this.practiceSetRepository.setInstanceKey(req.instancekey)
      const data = await this.practiceSetRepository.findOneAndUpdate(
        { _id: new ObjectId(req.body.practice), 'questions.question': new ObjectId(req.body.question) },
        {
          $pull: {
            questions: {
              question: new ObjectId(req.body.question)
            }
          },
          $inc: { totalQuestion: -1 }
        },
        { new: true }
      )

      if (!data) {
        throw new NotFoundException();
      }

      this.questionRepository.setInstanceKey(req.instancekey);
      const q = await this.questionRepository.findById(new ObjectId(req.body.question))
      if (q.isAllowReuse !== 'none') {
        if (q.practiceSets && q.practiceSets.some(s => s.equals(req.body.practice))) {
          const practiceSet = await this.practiceSetRepository.findOne({
            _id: { $ne: new ObjectId(req.body.practice) },
            'questions.question': q._id
          })

          if (!practiceSet) {
            this.attemptDetailRepository.setInstanceKey(req.instancekey)
            const found = await this.attemptDetailRepository.findOne({ 'QA.question': new ObjectId(req.body.question) }, null, { lean: true });
            if (found) {
              await this.questionRepository.updateOne({ _id: new ObjectId(req.body.question) }, { $set: { isActive: false } });
            } else {
              this.eventBus.emit('Question.Updated', {
                insKey: req.instancekey,
                uploadDir: getAssets(req.instancekey),
                oQuestion: _.pick(q, 'questionHeader', 'questionText', 'answers', 'answerExplain')
              });
              await this.questionRepository.findByIdAndDelete(new ObjectId(req.body.question))
            }
          } else {
            await this.questionRepository.updateOne({ _id: q._id }, { $pull: { practiceSets: new ObjectId(req.body.practice) } })
          }
        }
      } else {
        this.attemptDetailRepository.setInstanceKey(req.instancekey)
        const found = await this.attemptDetailRepository.findOne({ 'QA.question': new ObjectId(req.body.question) }, null, { lean: true })
        if (found) {
          this.questionRepository.setInstanceKey(req.instancekey)
          await this.questionRepository.updateOne({ _id: new ObjectId(req.body.question) }, { $set: { isActive: false } })
        } else {
          this.eventBus.emit('Question.Updated', {
            insKey: req.instancekey,
            uploadDir: getAssets(req.instancekey),
            oQuestion: _.pick(q, 'questionHeader', 'questionText', 'answers', 'answerExplain')
          });
          await this.questionRepository.findByIdAndDelete(req.body.question);
        }
      }

      if (data.sectionTimeLimit) {
        // update totalTime after remove question.
        // Because we can have custom section for some questions, if all those questions remove, related section also be removed
        // ==> update totalTime also
        let totalTime = 0;
        data.sections.forEach(sec => {
          totalTime += sec.time;
        });
        data.totalTime = totalTime;
      }

      if (data.questions[0]?.order) {
        data.questions.sort((q1, q2) => {
          if (q1.order < q2.order) {
            return -1;
          } else if (q1.order > q2.order) {
            return 1;
          } else {
            return 0;
          }
        });
      }

      // Re calculate question order
      let toReturn = {}
      data.questions.forEach((q, qIdx) => {
        q.order = qIdx + 1
        toReturn[q.question._id.toString()] = q.order
      })

      await this.practiceSetRepository.findByIdAndUpdate(data._id, data);

      return { response: toReturn };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async completedTestStudentsByClass(req: CompletedTestStudentsByClassRequest) {
    try {
      const start = timeHelper.getStartOfToday(req.timezoneoffset);


      this.classroomRepository.setInstanceKey(req.instancekey)
      const students = await this.classroomRepository
        .distinct('students.studentId', { _id: new ObjectId(req.id) });

      this.practiceSetRepository.setInstanceKey(req.instancekey)
      const tests = await this.practiceSetRepository
        .distinct('_id', {
          accessMode: 'invitation',
          classRooms: new ObjectId(req.id),
          testMode: 'proctored',
          status: 'published',
          $where: "new Date() > ((new Date(this.startDate)).getTime() + 1000 * 60 * this.totalTime)",
          startDate: { $gte: start }
        });

      if (tests && tests.length > 0) {
        let limit = req.query.limit || 15
        let skip = ((req.query.page || 1) - 1) * limit

        let filter: any = { _id: { $in: students } };
        if (req.query.studentName) {
          filter.$or = [
            { name: regexName(req.query.studentName) },
            { userId: regexName(req.query.studentName) }
          ];
        }

        var pipe: any = [
          { $match: filter },
          {
            $project: {
              _id: 1,
              name: 1,
              userId: 1,
              avatar: 1,
              provider: 1,
              facebook: 1,
              google: 1
            }
          },
          {
            $lookup: {
              from: 'attempts',
              let: { uid: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$user", "$$uid"] },
                    practicesetId: { $in: tests },
                    createdAt: { $gte: start }
                  }
                },
                {
                  $group: {
                    _id: '$user',
                    isAbandoned: { $last: '$isAbandoned' },
                    ongoing: { $last: '$ongoing' },
                    totalQuestions: { $last: '$totalQuestions' },
                    doQuestions: { $last: '$doQuestions' },
                    totalMissed: { $last: '$totalMissed' }
                  }
                },
                {
                  $project: {
                    isAbandoned: 1,
                    ongoing: 1,
                    totalQuestions: 1,
                    doQuestions: { $subtract: ['$totalQuestions', '$totalMissed'] }
                  }
                }
              ],
              as: 'attempt'
            }
          },
          {
            $unwind: {
              path: '$attempt',
              preserveNullAndEmptyArrays: true
            }
          }
        ];

        const facet = {
          studentAttempts: [
            { $skip: skip },
            { $limit: limit }
          ]
        };

        if (req.query.includeCount) {
          facet['total'] = [{ $count: 'total' }];
        }

        pipe.push({ $facet: facet });

        this.usersRepository.setInstanceKey(req.instancekey);
        const results: any = await this.usersRepository.aggregate(pipe);

        if (!results[0]) {
          return { studentAttempts: [], total: 0 };
        }

        const result = results[0];
        if (result.total) {
          result.total = result.total[0] ? result.total[0].total : 0;
        }

        return result;
      } else {
        return { studentAttempts: [], total: 0 };
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async completedTestByClass(req: CompletedTestByClassRequest) {
    try {
      const startOfDay = timeHelper.getStartOfToday(req.timezoneoffset);
      const clsIds = new ObjectId(req.classId);
      const result = [];

      this.classroomRepository.setInstanceKey(req.instancekey)
      const students = await this.classroomRepository
        .distinct('students.studentId', { _id: clsIds });

      this.practiceSetRepository.setInstanceKey(req.instancekey);
      const tests = await this.practiceSetRepository.find({
        accessMode: 'invitation',
        classRooms: clsIds,
        testMode: 'proctored',
        status: 'published',
        $where: "new Date() > ((new Date(this.startDate)).getTime() + 1000 * 60 * this.totalTime)",
        startDate: { $gte: startOfDay }
      }, {
        _id: 1,
        classRooms: 1,
        testMode: 1,
        title: 1,
        startDate: 1,
        totalTime: 1,
        attemptAllowed: 1,
        offscreenLimit: 1,
        totalQuestion: 1,
        camera: 1
      }, { lean: true });

      this.userLogRepository.setInstanceKey(req.instancekey);
      const userLogs = await this.userLogRepository.distinct('user', {
        user: { $in: students },
        startTime: { $gte: startOfDay }
      });

      for (const test of tests) {
        this.attemptRepository.setInstanceKey(req.instancekey);
        const attempts = await this.attemptRepository.aggregate([
          {
            $match: {
              user: { $in: students },
              practicesetId: test._id,
              createdAt: { $gte: test.startDate }
            }
          },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: '$user',
              ongoing: { $first: '$ongoing' },
              isAbandoned: { $first: '$isAbandoned' }
            }
          },
          {
            $group: {
              _id: null,
              abandoned: {
                $sum: {
                  $cond: [
                    { $and: [{ $eq: ["$ongoing", false] }, { $eq: ["$isAbandoned", true] }] },
                    1,
                    0
                  ]
                }
              },
              finished: {
                $sum: { $cond: [{ $eq: ["$isAbandoned", false] }, 1, 0] }
              },
              totalAttempts: { $sum: 1 }
            }
          }
        ]);

        result.push({
          attemptStat: attempts[0] || { abandoned: 0, finished: 0, totalAttempts: 0 },
          test: test
        });
      }

      return { tests: result, loggedIn: userLogs.length };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async ongoingTestByClass(req: OngoingTestByClassRequest) {
    try {
      // There should be only one ongoing proctored test for a class
      this.practiceSetRepository.setInstanceKey(req.instancekey);
      const test = await this.practiceSetRepository.findOne({
        testMode: 'proctored',
        status: 'published',
        classRooms: new ObjectId(req.classId),
        $where: "new Date() >= this.startDate && new Date() < ((new Date(this.startDate)).getTime() + 1000 * 60 * this.totalTime)"
      }, { classRooms: 1, testMode: 1, startDate: 1, title: 1 }, { lean: true });

      const emptyData = { abandoned: 0, finished: 0, ongoing: 0, total: 0 };

      if (!test) {
        return { students: 0, attemptStats: emptyData, loggedIn: 0 };
      }

      if (req.testOnly) {
        return { test };
      }

      this.classroomRepository.setInstanceKey(req.instancekey);
      const students = await this.classroomRepository
        .distinct('students.studentId', { _id: req.classId });

      this.attemptRepository.setInstanceKey(req.instancekey)
      const results = await this.attemptRepository.aggregate([
        {
          $match: { user: { $in: students }, practicesetId: test._id, createdAt: { $gte: test.startDate } }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: '$user',
            isAbandoned: { $first: '$isAbandoned' },
            ongoing: { $first: '$ongoing' }
          }
        },
        {
          $group: {
            _id: null,
            abandoned: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$ongoing", false] },
                      { $eq: ["$isAbandoned", true] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            finished: { $sum: { $cond: [{ $eq: ["$isAbandoned", false] }, 1, 0] } },
            ongoing: { $sum: { $cond: [{ $eq: ["$ongoing", true] }, 1, 0] } },
            total: { $sum: 1 }
          }
        }
      ])

      const startOfDay = timeHelper.getStartOfToday(req.timezoneoffset);
      const userLogs = await this.userLogRepository.distinct('user', {
        user: { $in: students },
        startTime: { $gte: startOfDay }
      })

      return {
        test: test,
        students: students.length,
        attemptStats: results[0] || emptyData,
        loggedIn: userLogs.length
      };

    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async ongoingAttempts(req: OngoingAttemptsRequest) {
    try {
      let clsIds = new ObjectId(req.id);

      this.practiceSetRepository.setInstanceKey(req.instancekey);
      let tests = await this.practiceSetRepository.find({
        testMode: 'proctored',
        status: 'published',
        classRooms: { $in: clsIds },
        $where: "new Date()>= this.startDate  && new Date() < ((new Date(this.startDate)).getTime()+1000 * 60 * this.totalTime)"
      }, { classRooms: 1, testMode: 1, startDate: 1 },
        {
          sort: { "startDate": 1.0 },
          lean: true,
        });

      if (tests.length > 0) {
        let pIds = tests.map(t => t._id);

        this.classroomRepository.setInstanceKey(req.instancekey);
        let students = await this.classroomRepository.distinct('students.studentId', { _id: { $in: clsIds } });
        this.attemptRepository.setInstanceKey(req.instancekey)
        let attempts: any = await this.attemptRepository
          .aggregate([
            { $match: { user: { $in: students }, practicesetId: { $in: pIds }, ongoing: true } },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'u'
              }
            },
            { $unwind: "$u" },
            {
              $group: {
                _id: '$u._id',
                studentName: { $first: "$u.name" },
                rollNumber: { $first: "$u.rollNumber" },
                totalAttempts: { $sum: 1 },
                attemptId: { $first: '$_id' }
              }
            }
          ]);

        const response = {
          tests: tests.length,
          students: students.length,
          attempts: attempts.map(attempt => ({
            _id: attempt._id.toString(),
            studentName: attempt.studentName,
            rollNumber: attempt.rollNumber,
            totalAttempts: attempt.totalAttempts,
            attemptId: attempt.attemptId.toString(),
          }))
        };

        return response;

      } else {
        return { tests: 0, students: 0, attempts: [] };
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async todayProctoredTests(req: TodayProctoredTestsRequest) {
    try {
      if (req.query.session === 'ongoing') {
        let pIds = [];
        this.practiceSetRepository.setInstanceKey(req.instancekey);
        let tests = await this.practiceSetRepository.find({
          testMode: 'proctored',
          status: 'published',
          locations: new ObjectId(req.user.activeLocation),
          $where: "new Date()>= this.startDate && new Date() < ((new Date(this.startDate)).getTime() + 1000 * 60 * this.totalTime)"
        }, { classRooms: 1, testMode: 1, startDate: 1, title: 1 }, { sort: { "startDate": 1 }, lean: true })

        if (tests.length > 0) {
          let classrooms = [];

          if (req.query.classId) {
            classrooms.push(new ObjectId(req.query.classId))
          }

          for (let t of tests) {
            pIds.push(t._id)
            if (!req.query.classId && t.classRooms.length) {
              classrooms = classrooms.concat(t.classRooms);
            }
          }

          this.classroomRepository.setInstanceKey(req.instancekey);
          let students = await this.classroomRepository.distinct('students.studentId', { _id: { $in: classrooms } })

          let attempts = await this.attemptRepository
            .aggregate([{ $match: { user: { $in: students }, practicesetId: { $in: pIds } } },
            {
              $group: {
                _id: '$user',
                abandoned: {
                  $sum: {
                    $cond: [{
                      $and: [{ $eq: ["$ongoing", false] },
                      { $eq: ["$isAbandoned", true] }
                      ]
                    },
                      1,
                      0]
                  }
                },
                finished: { $sum: { $cond: [{ $eq: ["$isAbandoned", false] }, 1, 0] } },
                ongoing: {
                  $sum: {
                    $cond: [{ $eq: ["$ongoing", true] }, 1, 0]

                  }
                },
                totalAttempts: {
                  $sum: 1
                }
              }
            }, {
              $group: {
                _id: 'null',
                abandoned: {
                  $sum: "$abandoned"
                },
                finished: { $sum: "$finished" }
                ,
                ongoing: {
                  $sum: "$ongoing"
                },
                totalAttempts: {
                  $sum: "$totalAttempts"
                },
                totalStudents: { $sum: 1 }
              }
            }])

          this.userLogRepository.setInstanceKey(req.instancekey)
          let userLogs = await this.userLogRepository
            .aggregate([{ $match: { user: { $in: students } } },
            {
              $group: {
                _id: '$user',
                loggedIn: {
                  $sum: 1
                },
              }
            }
            ])

          return { testDetails: tests, tests: tests.length, students: students.length, attempts: attempts, loggedIn: userLogs }
        } else {
          return { tests: 0, students: 0, attempts: [] }
        }
      } else if (req.query.session === 'today') {
        let start = timeHelper.getStartOfToday(req.timezoneoffset)
        let end = timeHelper.getEndOfToday(req.timezoneoffset)

        let classrooms = [];
        this.practiceSetRepository.setInstanceKey(req.instancekey);
        let tests = await this.practiceSetRepository.find({
          testMode: 'proctored',
          locations: new ObjectId(req.user.activeLocation),
          startDate: { $gte: start, $lt: end }
        }, { classRooms: 1, testMode: 1, startDate: 1 }, { lean: true });

        if (tests.length > 0) {
          if (req.query.classId) {
            classrooms.push(new ObjectId(req.query.classId))
          } else {
            for (let t of tests) {
              if (t.classRooms.length > 0) {
                classrooms = classrooms.concat(t.classRooms);
              }
            }
          }

          this.classroomRepository.setInstanceKey(req.instancekey);
          let students = await this.classroomRepository.distinct('students.studentUserId', { _id: { $in: classrooms } })

          return { tests: tests.length, students: students.length }
        } else {
          return { tests: 0, students: 0 }
        }
      } else {
        throw new BadRequestException();
      }
    } catch (error) {
      Logger.error(error);
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async upcomingTestByClass(req: UpcomingTestByClassRequest) {
    try {
      let start = new Date();
      let end = timeHelper.getEndOfToday(req.timezoneoffset)

      this.practiceSetRepository.setInstanceKey(req.instancekey)
      let tests = await this.practiceSetRepository.find({
        accessMode: 'invitation',
        classRooms: new ObjectId(req.id),
        testMode: 'proctored',
        status: 'published',
        startDate: { $gte: start, $lt: end }
      }, { _id: 1, testMode: 1, title: 1, startDate: 1, totalTime: 1, subjects: 1, }, { lean: true })

      return { tests: tests };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async getSessionTimes(req: GetSessionTimesRequest) {
    try {
      this.practiceSetRepository.setInstanceKey(req.instancekey);
      let times = await this.practiceSetRepository.aggregate([
        {
          $match: {
            accessMode: 'invitation',
            testMode: 'proctored',
            locations: new ObjectId(req.user.activeLocation)
          }
        },
        {
          $project: {
            year: {
              $year: "$startDate"
            },
            month: {
              $month: "$startDate"
            },
            day: {
              $dayOfMonth: "$startDate"
            },
            accessMode: 1,
            testMode: 1,
            startDate: 1
          }
        },
        {
          $match: {
            year: req.body.year,
            month: req.body.month + 1, //because January starts with 0
            day: req.body.day
          }
        },

        { $group: { _id: { "hour": { $hour: "$startDate" }, "minute": { $minute: "$startDate" } }, count: { $sum: 1 }, startDate: { $first: "$startDate" } } },

        { $project: { startDate: 1, count: 1 } },
        { $sort: { startDate: 1 } }
      ])
      return { response: times }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async recommendedTestsBySubject(req: RecommendedTestsBySubjectRequest) {
    try {
      if (req.id) {

        var condition: any = await this.baseFilter(req);

        var page = (req.query.page) ? req.query.page : 1
        var limit = (req.query.limit) ? req.query.limit : 5
        var skip = (page - 1) * limit

        condition['subjects._id'] = new ObjectId(req.id);
        condition.status = 'published'

        if (req.query.searchText) {
          var regexText = regexName(req.query.searchText)
          condition.title = regexText;
        }

        this.attemptRepository.setInstanceKey(req.instancekey);
        const alreadyAttemptedTestsId = await this.attemptRepository
          .distinct('practicesetId', { user: new ObjectId(req.user._id), 'subjects._id': new ObjectId(req.id) });

        var sort = { statusChangedAt: -1 }


        if (alreadyAttemptedTestsId.length > 0) {
          condition._id = { $nin: alreadyAttemptedTestsId }
        }

        this.practiceSetRepository.setInstanceKey(req.instancekey);
        let tests = await this.practiceSetRepository.find(condition,
          { title: 1, subjects: 1, accessMode: 1, totalQuestion: 1, slugfly: 1, units: 1, totalTime: 1, testMode: 1, status: 1, colorCode: 1, imageUrl: 1 },
          { sort: sort, skip: skip, limit: limit, lean: true });

        if (!tests) {
          throw new NotFoundException();
        }

        return { response: tests }

      } else {
        throw new NotFoundException('No recommended tests found');
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  private async recentbaseFilter(req: any) {
    var accessMode: any = {
      $or: [{
        'p.accessMode': 'public'
      }, {

        'p.accessMode': 'buy'
      }]
    }

    var expire = {
      $or: [{
        "p.expiresOn": {
          $gt: new Date()
        }
      }, {
        "p.expiresOn": null
      }, {
        "p.expiresOn": ''
      }]
    }
    var invitationFilter = {};
    var classIds = [];
    var basicFilter = {
      $and: [accessMode, expire]
    };

    if (!req.user || !req.user.userId) {
      return basicFilter;
    }

    this.classroomRepository.setInstanceKey(req.instancekey);
    const classes = await this.classroomRepository.find({
      'students.studentUserId': req.user.userId,
      active: true,
      location: new ObjectId(req.user.activeLocation as string)
    }, {
      '_id': 1
    }, { lean: true });
    if (!classes || classes.length === 0) {
      invitationFilter = {
        $and: [{
          'p.accessMode': 'invitation'
        },
        {
          "p.user": new ObjectId(req.user._id as string)
        }]
      }

      accessMode.$or.push(invitationFilter);

      var locFilter = { 'p.locations': new ObjectId(req.user.activeLocation as string) }

      return { $and: [locFilter, accessMode, expire] }

    } else {
      classIds = _.map(classes, '_id');

      this.attendanceRepository.setInstanceKey(req.instancekey);
      const attendances = await this.attendanceRepository.find({
        studentId: new ObjectId(req.user._id as string),
        active: true,
        admitted: true,
        classId: {
          $in: classIds
        }
      }, null, { lean: true });

      var testIds = _.map(attendances, 'practicesetId');

      invitationFilter = {
        $and: [{
          'p.accessMode': 'invitation'
        },
        {
          'p.allowStudent': true
        },
        {
          $or: [{
            'p.classRooms': {

              $in: classIds
            }
          }, {

            "p.user": new ObjectId(req.user._id as string)
          }]

        },
        {
          $or: [{
            requireAttendance: {
              $exists: false
            }
          },
          {
            requireAttendance: false
          },
          // In case require attendance, start date need to be over and attendance is allowed
          {
            // $and: [{
            //     $or: [{
            //         startDate: null
            //     }, {
            //         startDate: {
            //             $gt: new Date()
            //         }
            //     }]
            // },
            // {
            _id: {
              $in: testIds
            }
            // }]
          }
          ]
        }
        ]
      }

      var loc_filter = { 'p.locations': new ObjectId(req.user.activeLocation as string) }

      accessMode.$or.push(invitationFilter);

      return { $and: [loc_filter, accessMode, expire] }

    }
  }

  async recentTestByUser(req: RecentTestByUserRequest) {
    const condition = await this.recentbaseFilter(req);
    var page = (req.query.page) ? req.query.page : 1
    var limit = (req.query.limit) ? req.query.limit : 5
    var skip = (page - 1) * limit
    // var filter = {};
    if (req.query.title) {
      var regexText = regexName(req.query.title)
      condition['p.title'] = regexText
    }

    var date = new Date();
    // subtracting 15 days
    var attemptDate = new Date(date.getTime() - (15 * 24 * 60 * 60 * 1000));

    if (req.query.subjects) {
      var subjects = _.compact(req.query.subjects.split(','))
      var subjectIds = subjects.map(s => new ObjectId(s as string))

      condition['p.subjects._id'] = { $in: subjectIds };
    }
    condition['p.courses.0'] = { "$exists": false };
    condition['p.testseries.0'] = { "$exists": false };
    condition['p.status'] = 'published';


    this.attemptRepository.setInstanceKey(req.instancekey);
    let aggregate = await this.attemptRepository.aggregate([
      {
        $match: {
          "user": new ObjectId(req.id),
          "createdAt": { $gte: attemptDate },
          "isAbandoned": false
        }
      },
      {
        $lookup: {
          "from": "practicesets",
          "localField": "practicesetId",
          "foreignField": "_id",
          "as": "p"
        }
      },
      { $unwind: "$p" },
      { $match: condition },
      {
        $group: {
          _id: { id: "$p._id" },
          title: { $first: "$p.title" },
          testMode: { $first: "$p.testMode" },
          description: { $first: "$p.description" },
          subjects: { $first: "$p.subjects" },
          totalQuestion: { $first: "$p.totalQuestion" },
          totalTime: { $first: "$p.totalTime" },
          colorCode: { $first: "$p.colorCode" },
          imageUrl: { $first: "$p.imageUrl" },
          attemptCreated: { $first: "$createdAt" },
          questionsToDisplay: { $first: "$p.questionsToDisplay" },

        }
      },
      {
        $project: {
          "_id": "$_id.id",
          "title": "$title",
          "description": "$description",
          "totalQuestion": "$totalQuestion",
          "totalTime": "$totalTime",
          "attemptCreated": 1,
          "testMode": 1,
          "subjects": 1,
          "imageUrl": 1,
          "colorCode": 1,
          "questionsToDisplay": 1,
        }
      },
      { $sort: { "attemptCreated": -1 } },
      {
        $project: {
          "_id": "$_id",
          "title": "$title",
          "totalQuestion": "$totalQuestion",
          "totalTime": "$totalTime",
          "testMode": 1,
          "subjects": 1,
          "imageUrl": 1,
          "colorCode": 1,
        }
      },
      { $skip: skip },
      { $limit: limit }


    ])

    return { response: aggregate }
  }

  async searchTests(req: SearchTestsRequest) {
    try {
      const page = req.query.page ? req.query.page : 1;
      const limit = req.query.limit ? req.query.limit : 20;
      let sort: any = { pinTop: -1, statusChangedAt: -1 };
      if (req.query.sort) {
        const temp = req.query.sort.split(',');
        sort = { pinTop: -1, [temp[0]]: temp[1] === 'descending' ? -1 : 1 }
      }
      const skip = req.query.skip ? req.query.skip : (page - 1) * limit;

      // baseFilter will filter test by access mode and expire
      const basicFilter = await this.baseFilter(req);
      if (req.searchText) {
        const regexText = regexName(req.searchText);
        basicFilter.title = regexText;
      }
      if (req.tags) {
        basicFilter.tags = req.tags;
      }

      const filter = await this.getAvaiableTestFilter(req);

      if (req.user) {
        const result = await this.getPracticeSetTests(basicFilter, sort, skip, limit, page, req, filter);
        return result;

      } else {
        basicFilter.allowStudent = true;
        this.practiceSetRepository.setInstanceKey(req.instancekey);
        const practiceSets = await this.practiceSetRepository.find({ $and: [basicFilter, filter] }, 'title pinTop autoEvaluation totalQuestion questionsToDisplay price totalTime testCode testMode totalJoinedStudent accessMode rating status statusChangedAt subjects units userInfo slugfly allowStudent',
          { sort: sort, skip: skip, limit: limit, lean: true });

        const results = await Promise.all(practiceSets.map(async (practiceset) => {
          practiceset.isFavorite = false;
          practiceset.totalAttempt = 0;
          const totalAttempt = await this.countAttemptPractice(req, practiceset);
          practiceset.totalAttempt = totalAttempt;
          return practiceset;
        }));

        return { results: results };
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error);
    }
  }

  async searchUnits(req: SearchUnitsRequest) {
    try {
      var page = (req.query.page) ? req.query.page : 1
      var limit = (req.query.limit) ? req.query.limit : 10
      var skip = (page - 1) * limit
      var regexText = {
        $regex: new RegExp(escapeRegex(req.query.title), 'i')
      };
      this.unitRepository.setInstanceKey(req.instancekey);
      let aggregate = await this.unitRepository.aggregate([
        {
          $match: {
            name: regexText
          }
        },
        {
          $project: {
            name: 1,
            subject: 1,
          }
        },
        { $limit: limit },
        { $skip: skip }

      ]);

      return { response: aggregate }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error);
    }
  }


  async getArchiveAssessments(req: ArchiveRequest) {
    try {
      var page = (req.query.page) ? req.query.page : 1;
      var limit = (req.query.limit) ? req.query.limit : 50;
      var sort = { 'updatedAt': -1 };
      var skip = (page - 1) * limit;
      let results: any = []

      let filter: any = {
        status: 'revoked'
      }
      if (req.query.status) {
        filter.status = req.query.status
      }
      if (!req.user.roles.includes('mentor')) {
        filter.locations = new ObjectId(req.user.activeLocation)
      }

      this.attemptDetailRepository.setInstanceKey(req.instancekey)
      let testIds = await this.attemptDetailRepository.distinct('practicesetId', { user: new ObjectId(req.id) ? new ObjectId(req.id) : new ObjectId(req.user._id) })
      if (testIds.length > 0) {
        this.practiceSetRepository.setInstanceKey(req.instancekey);
        results = await this.practiceSetRepository.find({ _id: { $in: testIds }, ...filter }, { title: 1, totalTime: 1, questionsToDisplay: 1, totalQuestion: 1, subjects: 1, imageUrl: 1, colorCode: 1, testMode: 1 },
          { sort: sort, limit: limit, skip: skip, lean: true }
        )
        if (req.query.count) {
          results = 0;
          this.practiceSetRepository.setInstanceKey(req.instancekey)
          results = await this.practiceSetRepository.countDocuments({ _id: { $in: testIds } })
        }
      }

      return { response: results };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error);
    }
  }

  async saveAs(req: SaveAsRequest) {
    try {
      req.title = req.title.replace(/ {1,}/g, " ");

      this.practiceSetRepository.setInstanceKey(req.instancekey);
      let result = await this.practiceSetRepository.findById(req.id, null, { lean: true });

      // Check if name already exists
      let found = await this.practiceSetRepository.findOne({ title: req.title }, null, { lean: true });

      if (found) {
        throw new BadRequestException('name_exists');
      }
      let tempTest = { ...result }

      delete tempTest._id
      delete tempTest.courses
      delete tempTest.testseries
      delete tempTest.lastModifiedBy
      delete tempTest.lastModifiedDate


      delete tempTest.testCode
      tempTest.status = 'draft';

      tempTest.statusChangedAt = new Date();
      tempTest.updatedAt = new Date();
      tempTest.createdAt = new Date();
      tempTest.totalAttempt = 0;
      tempTest.rating = 0;
      tempTest.user = new ObjectId(req.user._id);
      tempTest.userInfo = {
        _id: new ObjectId(req.user._id),
        name: req.user.name
      }
      tempTest.totalJoinedStudent = 0;
      tempTest.title = req.title;
      if (tempTest.startDate) {
        tempTest.startDate = new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000))
      }
      tempTest.locations = [new ObjectId(req.user.activeLocation)]

      let test = await this.practiceSetRepository.create(tempTest)

      return { response: test };
    } catch (error) {
      Logger.error(error);
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async findOneForSession(req: FindOneForSessionRequest) {
    if (req.id) {
      this.practiceSetRepository.setInstanceKey(req.instancekey)
      var prac = await this.practiceSetRepository.findOne({ _id: new ObjectId(req.id) }, { _id: 1, status: 1, title: 1, totalQuestion: 1, questionsToDisplay: 1, totalJoinedStudent: 1 }, { lean: true });
      prac = await this.practiceSetRepository.populate(prac, { path: 'classRooms', select: '_id name' });

      return { ...prac };
    } else {
      throw new GrpcNotFoundException("Not Found");
    }
  }

  private async updateTestAttendance(req: FindOneWithQuestionsRequest, practiceObject) {
    try {
      if (practiceObject.requireAttendance) {
        this.attendanceRepository.setInstanceKey(req.instancekey);
        const attendance = await this.attendanceRepository.findOneAndUpdate({
          practicesetId: practiceObject._id,
          studentId: new ObjectId(req.user._id as string),
          active: true
        }, {
          status: 'started'
        }, {
          new: true
        });

        await this.socketClientService.initializeSocketConnection(req.instancekey, req.token);
        await this.socketClientService.toUser(req.instancekey, attendance.teacherId, 'attendance.update', {
          studentId: attendance.studentId,
          status: attendance.status,
          admitted: attendance.admitted
        });

      } else {
        // Create an attendance for user to save test limit
        this.attendanceRepository.setInstanceKey(req.instancekey);
        var attendance = await this.attendanceRepository.findOne({
          practicesetId: practiceObject._id,
          studentId: new ObjectId(req.user._id)
        })

        if (!attendance) {
          attendance = await this.attendanceRepository.create({
            practicesetId: practiceObject._id,
            studentId: new ObjectId(req.user._id),
            name: req.user.name,
            studentUserId: req.user.userId,
            attemptLimit: practiceObject.attemptAllowed,
            offscreenLimit: practiceObject.offscreenLimit ? practiceObject.offscreenLimit : 0
          })
        } else {
          attendance.updatedAt = Date.now()
        }

        attendance.status = 'started'

        await this.attendanceRepository.findByIdAndUpdate(attendance._id, attendance)

        await this.socketClientService.toTestRoom(req.instancekey, practiceObject._id, 'test.join', {
          studentId: req.user._id.toString(),
          name: req.user.name,
          userId: req.user.userId,
          attemptLimit: attendance.attemptLimit,
          offscreenLimit: attendance.offscreenLimit,
          status: attendance.status
        })
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async filterCodeLanguages(req: FindOneWithQuestionsRequest, practice) {
    try {
      let enableLang = practice.enabledCodeLang;
      if (practice.testseries && practice.testseries.length > 0 || req.query.packageId) {

        let query: any = { status: 'published', practiceIds: practice._id }
        if (req.query.packageId) {
          query._id = req.query.packageId
        } else {
          query._id = practice.testseries
        }
        // get enable lang from pack
        this.testSeriesRepository.setInstanceKey(req.instancekey);
        let pac = await this.testSeriesRepository.findOne(query, { enabledCodeLang: 1 }, { lean: true });
        if (pac && pac.enabledCodeLang && pac.enabledCodeLang[0]) {
          enableLang = pac.enabledCodeLang
        }
      }

      if (enableLang && enableLang[0]) {
        practice.questions.forEach(question => {
          if (question.category == 'code') {
            question.coding = question.coding.filter(c => enableLang.indexOf(c.language) > -1);
          }
        })
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async findOneWithQuestionsAccessMode(req: FindOneWithQuestionsRequest) {
    try {

      var token = req.authorization.split(' ')[1]
      var ip = req.ip
      var filter = []

      filter.push({
        status: 'published'
      })

      filter.push({
        $or: [{
          expiresOn: {
            $gt: new Date()
          }
        }, {
          expiresOn: null
        }, {
          expiresOn: ''
        }]
      })

      if (req.user) {
        var accessRule = []

        if (req.user.isActive === false) {
          return {
            status: 422,
            params: 'account-active',
            message: 'Your account is disabled. Please contact Perfectice to enable it.'
          }
        }

        if (req.user.roles.includes('student') && !req.user.subjects) {
          return {
            params: 'grade-profile',
            message: 'This practice test belongs to an examination type that is not set in your profile.',
            status: 404
          }
        }

        // check status user
        // Push condition user have role do a test
        // This condition is or not and
        accessRule.push({
          accessMode: {
            $ne: 'invitation'
          }
        })
        if (req.user.email) {
          accessRule.push({
            inviteeEmails: req.user.email
          })
        }
        if (req.user.phoneNumberFull) {
          accessRule.push({
            inviteePhones: req.user.phoneNumberFull
          })
        }
        // if user in classroom add condition with condition user in that classroom to do the test
        var condition = []
        if (req.user.email) {
          condition.push({
            studentUserId: req.user.email
          })
          condition.push({
            email: req.user.email
          })
        }
        if (req.user.phoneNumberFull) {
          condition.push({
            studentUserId: req.user.phoneNumberFull
          })
        }
        if (req.user.phoneNumber) {
          condition.push({
            studentUserId: req.user.phoneNumberFull
          })
        }
        if (req.user.userId) {
          condition.push({
            studentUserId: req.user.phoneNumberFull
          })
        }
        if (condition.length) {
          try {
            this.classroomRepository.setInstanceKey(req.instancekey)
            let students = await this.classroomRepository.find({
              'students.studentUserId': req.user.userId,
              active: true
            }, {
              '_id': 1
            }, { lean: true })
            if (students) {
              accessRule.push({
                classRooms: {
                  $in: students.map(s => s._id)
                }
              })
            }
          } catch (err) {
            throw new InternalServerErrorException();
          }
        }

        if (accessRule.length > 0) {
          // if user have accessRule. add to default filter with or condition array accessRule
          // and (or accessMode not invitation , or email user in email invation, or user in a classroom of practice
          filter.push({
            $or: accessRule
          })
        }
      }
      const settings = await this.redisCache.getSetting({ instancekey: req.instancekey }, function (settings: any) {
        return settings;
      })

      let limitData = null
      
      const practiceSet = await this.practiceSetRepository.findOne({ _id: req.id }, null, { $and: filter, lean: true })
      
      if (!practiceSet) {
        throw new NotFoundException();
      }
      let hasSubject = req.user.subjects.find(g => new ObjectId(g).equals(practiceSet.subjects[0]._id))
      if (!hasSubject) {
        return {
          status: 404,
          params: 'grade-profile',
          message: 'This assessment belongs to an subject type that is not set in your profile.'
        }
      }

      if (practiceSet.level && settings.features.studentLevel) {
        if (!req.user.levelHistory) {
          return {
            status: 403,
            params: 'subject-level',
            message: 'This practice test belongs to higher level.'
          }
        }
        for (let sub of practiceSet.subjects) {
          if (!req.user.levelHistory.find(l => new ObjectId(l.subjectId).equals(sub._id) && l.level >= practiceSet.level)) {
            return {
              status: 403,
              params: 'subject-level',
              message: `The subject '${sub.name}' in this assessment belongs to higher level.`
            }
          }
        }
      }

      if (practiceSet.startDate) {
        var startDate = moment(practiceSet.startDate)
        var now = new Date()

        if (startDate.isAfter(now)) {
          return {
            params: 'start-date',
            startDate: practiceSet.startDate,
            message: 'You cannot take this test before it is started',
            status: 404
          }
        }
        // incase startTimeAllowance is set > 0:
        // student can take the test within startTimeAllowance.
        // But incase teacher increase student attempt limit to give him second chance, 
        // student can take the test within startDate + totalTime
        if (practiceSet.startTimeAllowance > 0) {
          if (limitData && limitData.attemptLimit > practiceSet.attemptAllowed) {
            if (startDate.add(practiceSet.totalTime, 'minutes').isBefore(now)) {
              return {
                params: 'start-date',
                message: 'Sorry, this test has already started. You can not take this test',
                status: 404
              }
            }
          } else {
            if (startDate.add(practiceSet.startTimeAllowance, 'minutes').isBefore(now)) {
              return {
                params: 'start-date',
                message: 'Sorry, this test has already started. You can not take this test',
                status: 404
              }
            }
          }
        }
        // else if startTimeAllowance = 0, student can take the test any time
      }

      let orgTotalTime = practiceSet.totalTime

      // waterfall
      this.attendanceRepository.setInstanceKey(req.instancekey);
      const data = await this.attendanceRepository.findOne({
        practicesetId: practiceSet._id,
        studentId: new ObjectId(req.user._id as string),
        active: true
      }, null, { lean: true })

      if (practiceSet.requireAttendance && (!data || !data.admitted || !data.active)) {
        return {
          params: 'Require attendence',
          message: 'You need permission from teacher/admin to take this practice test.',
          status: 403
        };
      }
      // get limit info

      limitData = data

      this.attemptRepository.setInstanceKey(req.instancekey);
      const attempts = await this.attemptRepository.find({ user: new ObjectId(req.user._id as string), practicesetId: practiceSet._id }, { ongoing: 1, isAbandoned: 1 });

      let totalCount = attempts.length;
      let finishCount = 0;
      for (var i = 0; i < attempts.length; i++) {
        // only check this for proctored test
        if (practiceSet.testMode == 'proctored' && attempts[i].ongoing && settings.features.fraudDetect) {
          return {
            params: 'Already started',
            startDate: practiceSet.startDate,
            message: 'You are already taking this test.',
            status: 404
          }
        }
        if (!attempts[i].isAbandoned) {
          finishCount++;
        }
      }

      // IF test has limited attempt (attemptAllowed > 0), check number of attempt
      if (practiceSet.attemptAllowed) {
        let attemptToCheck = settings.features.fraudDetect ? totalCount : finishCount;
        if (attemptToCheck >= practiceSet.attemptAllowed && (!limitData || attemptToCheck >= limitData.attemptLimit)) {
          return {
            params: 'Attempt-Limit',
            startDate: practiceSet.startDate,
            message: 'You have reached maximum number of permitted attempts on this test. Please contact Administrator or publisher of this test.',
            status: 404
          }
        }
      }

      if (!req.query.notCheckActiveMember && practiceSet.accessMode == 'buy') {
        this.userEnrollmentRepository.setInstanceKey(req.instancekey);
        const result = await this.userEnrollmentRepository.findOne({
          item: practiceSet._id,
          user: new ObjectId(req.user._id as string),
          accessMode: 'buy',
        }, null, { lean: true })

        if (!result) {
          let refItems = []

          if (practiceSet.testseries) {
            refItems = refItems.concat(practiceSet.testseries)
          }
          if (practiceSet.courses) {
            refItems = refItems.concat(practiceSet.courses)
          }

          if (refItems.length) {
            this.userEnrollmentRepository.setInstanceKey(req.instancekey);
            const result = this.userEnrollmentRepository.findOne({
              item: refItems,
              user: new ObjectId(req.user._id as string),
              // accessMode: 'buy',
            }, null, { lean: true })

            if (!result) {
              return {
                params: 'package-user',
                message: 'This practice test is part of a ' + (practiceSet.testseries && practiceSet.testseries.length ? 'test series' : 'course') + '. You need to buy it first.',
                status: 422
              }
            }
          } else {
            return {
              params: 'buy-test',
              message: 'You need to buy this assessment.',
              status: 422
            };
          }
        }
      }

      if (practiceSet.camera && practiceSet.testMode == 'proctored' && settings.features.fraudDetect) {
        // Call report api to get random camera time
        let url = config.reportApi + 'createImageInterval?duration=' + practiceSet.totalTime
        const response = await axios.get(url, { headers: { 'instancekey': req.instancekey } });
        if (response.status == 200 && response.data) {
          practiceSet.cameraTime = response.data.intervals
        }
      }

      if (practiceSet.testMode == 'proctored' && settings.endTimeFixed) {
        let d = new Date()
        let endTime = (new Date(practiceSet.startDate)).getTime() + (practiceSet.totalTime * 60 * 1000);
        let timeDiff = endTime - d.getTime();
        if (timeDiff > 0) {
          practiceSet.orgTotalTime = orgTotalTime
          practiceSet.totalTime = timeDiff / (60000)
        } else {
          return {
            params: 'start-date',
            message: 'Sorry, Examination time has already expired. You can not take this test',
            status: 404
          }
        }
      }

      if (practiceSet.testMode === 'proctored') {
        
        this.userLogRepository.setInstanceKey(req.instancekey)
        const log = await this.userLogRepository.findOne({
          user: new ObjectId(req.user._id as string),
          takingPracticeSet: new ObjectId(req.id)
        })
        if (log && settings.features.fraudDetect) {
          // A user can login in many devices, and we only allow one to take the test
          // So we check access_token to asure this
          if (log.token !== token) {
            // If the time of taking this test exceed its limit, we can allow another test.
            // This is in case user taking test and then just close the browser or device power down...
            var time = Math.floor(((new Date().getTime() - log.updatedAt) / 1000) / 60)
            var totalTestTime = practiceSet.totalTime
            if (time < totalTestTime) {
              // IF not the same device
              Logger.debug('Duplicate account! instance %s user %s test %s', req.instancekey, req.user._id, req.id)

              return {
                params: 'Duplicate Account',
                message: 'You are taking this test on another device.',
                status: 404
              }
            } else {
              // unset takingPracticeSet
              log.takingPracticeSet = null
              await this.userLogRepository.findByIdAndUpdate(log._id, log);
            }
          }


        }
      }

      // We finally reach here, it means user is allow to take test
      practiceSet.serverTime = new Date()

      // We gonna try to get test data from redis cache first otherwise take it from db and save to redis
      var key = 'findOneWithQuestionsAccessMode' + (req.query.hasMeta ? '_meta' : '')
      
      const doc: any = await new Promise((resolve) => {
        this.redisCache.getAndSetOne({ instancekey: req.instancekey, params: { id: req.id } }, key, null, function (doc: any) {
          resolve(doc);
        }
        );
      });
      
      if (doc != null) {
        await this.filterCodeLanguages(req, doc)
        // set limit
        if (limitData) {
          doc.attendance = {
            attemptLimit: limitData.attemptLimit,
            offscreenLimit: limitData.offscreenLimit
          }
        }

        // Only camera enable test need attemptId when student start the test
        if (practiceSet.camera && practiceSet.testMode == 'proctored') {
          doc.cameraTime = practiceSet.cameraTime
        }
        if (practiceSet.accessMode == 'invitation') {
          doc.classRooms = practiceSet.classRooms;
        }

        // doc.attemptId = await createAttempt(req, practiceSet, req.query.attemptId)

        if (settings.features.universityExam && doc.testMode == 'proctored') {
          doc.slugfly = slug((doc.subjects[0].name + ' - Proctor Exam').replace(/\s+/g, "-"), {
            lower: true
          })
          doc.title = doc.subjects[0].name + ' - Proctor Exam'
          doc.titleLower = (doc.subjects[0].name + ' - Proctor Exam').toLowerCase();

        }
        if (practiceSet.testMode == 'proctored' && settings.endTimeFixed) {
          doc.totalTime = practiceSet.totalTime
        }
        await this.updateTestAttendance(req, doc);

        return doc;
      } else {
        // async parallel
        this.usersRepository.setInstanceKey(req.instancekey);
        const user = await this.usersRepository.findById(practiceSet.user)
        practiceSet.teacher = {
          'name': user.name,
          'roles': user.roles,
          'avatar': user.avatar,
          '_id': user._id,
          avatarUrl: user.avatar ? user.avatar.fileUrl : '',
          avatarUrlSM: user.avatarSM ? user.avatarSM.fileUrl : '',
          avatarUrlMD: user.avatarMD ? user.avatarMD.fileUrl : ''
        };

        this.subjectRepository.setInstanceKey(req.instancekey);
        const sub = await this.subjectRepository.findById(practiceSet.subjects[0]._id, { lean: true })
        // practiceSet.view = sub.view;

        var questions = await this.questionBus.getQuestionsForTest(req, practiceSet, req.query.hasMeta)
        
        if (practiceSet.testType == 'random') {
          practiceSet.randomizeAnswerOptions = true;
          practiceSet.randomQuestions = true;
          if (practiceSet.randomTestDetails && practiceSet.randomTestDetails.length == 0) {
            questions = util.shuffleArray(questions)
            practiceSet.questions = questions.slice(0, practiceSet.questionsToDisplay);

          } else {
            let finalQuestion = [];

            if (!practiceSet.isMarksLevel) {
              practiceSet.randomTestDetails.forEach(rd => {
                let set = questions.filter(d => d.plusMark == rd.quesMarks && d.topic._id.equals(rd.topic))
                set = util.shuffleArray(set)
                let rQ = util.shuffleArray(set.slice(0, rd.questions))
                finalQuestion = finalQuestion.concat(rQ);

              })

            } else {
              practiceSet.randomTestDetails.forEach(rd => {
                let set = questions.filter(d => d.topic._id.equals(rd.topic))
                set = util.shuffleArray(set)
                let rQ = util.shuffleArray(set.slice(0, rd.questions))
                finalQuestion = finalQuestion.concat(rQ);
              })
            }

            if (practiceSet.questionsToDisplay > finalQuestion.length) {
              return {
                error: 'insufficient question',
                'message': "System didn't find specified number of questions in test to generate random test. Please contact administrator"
              }
            }
            practiceSet.questions = util.shuffleArray(finalQuestion);
          }

        } else {          
          practiceSet.questions = questions
        }

        // in case of endTimeFixed = true, totalTime may have been changed, so we reset totalTime before saving to redis.
        let totalTime = practiceSet.totalTime;
        practiceSet.totalTime = orgTotalTime;
        // if it's random test then no need to add in redis as it will be always new set of questions
        // assign calculated totalTime after redis set.
        if (practiceSet.testType == 'random') {

          practiceSet.totalTime = totalTime;
          await this.filterCodeLanguages(req, practiceSet)
          if (limitData) {
            practiceSet.attendance = {
              attemptLimit: limitData.attemptLimit,
              offscreenLimit: limitData.offscreenLimit
            }
          }

          // practiceSet.attemptId = await createAttempt(req, practiceSet, req.query.attemptId)
          if (settings.features.universityExam && practiceSet.testMode == 'proctored') {
            practiceSet.slugfly = slug((practiceSet.subjects[0].name + ' - Proctor Exam').replace(/\s+/g, "-"), {
              lower: true
            })
            practiceSet.title = practiceSet.subjects[0].name + ' - Proctor Exam'
            practiceSet.titleLower = (practiceSet.subjects[0].name + ' - Proctor Exam').toLowerCase();

          }
          await this.updateTestAttendance(req, practiceSet);

          return practiceSet
        } else {
          const doc: any = await new Promise((resolve) => {
            this.redisCache.getAndSetOne({ instancekey: req.instancekey, params: { id: req.id } }, key, practiceSet, function (doc: any) {
              resolve(doc);
            });
          });

          practiceSet.totalTime = totalTime;
          await this.filterCodeLanguages(req, practiceSet)
          if (limitData) {
            practiceSet.attendance = {
              attemptLimit: limitData.attemptLimit,
              offscreenLimit: limitData.offscreenLimit
            }
          }

          // practiceSet.attemptId = await createAttempt(req, practiceSet, req.query.attemptId)
          if (settings.features.universityExam && practiceSet.testMode == 'proctored') {
            practiceSet.slugfly = slug((practiceSet.subjects[0].name + ' - Proctor Exam').replace(/\s+/g, "-"), {
              lower: true
            })
            practiceSet.title = practiceSet.subjects[0].name + ' - Proctor Exam'
            practiceSet.titleLower = (practiceSet.subjects[0].name + ' - Proctor Exam').toLowerCase();
          }
          await this.updateTestAttendance(req, practiceSet);
          return practiceSet
        }
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }

  }

  /* 
  ! "view" is not in subject
   */
  async findOneWithQuestions(req: FindOneWithQuestionsRequest) {
    try {

      if (req.query.hasAccessMode) {
        const practiceSet = await this.findOneWithQuestionsAccessMode(req);
        practiceSet.questions.map(q => q.question)
        return practiceSet;
      } else {
        this.practiceSetRepository.setInstanceKey(req.instancekey);
        var practiceSet: any = await this.practiceSetRepository.findById(new ObjectId(req.id), null, { lean: true });
        if (!practiceSet) {
          throw new NotFoundException();
        }
        var oPractice = practiceSet
        oPractice.questions = []
        oPractice.serverTime = new Date()
        const [subject, user, questions] = await Promise.all([
          await this.subjectRepository.findById(oPractice.subjects[0]._id, {}, { lean: true }),
          await this.usersRepository.findById(oPractice.user, {}, { lean: true }),
          await this.questionBus.getQuestionsForTest(req, practiceSet, req.query.hasMeta),
        ]);

        // practiceSet.view = subject.view;
        practiceSet.user = user;
        practiceSet.teacher = user;
        practiceSet.questions = questions;

        return { ...oPractice };
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  private async sendSmsToUser(instancekey: string, users: any[], text: string) {
    try {
      const phoneNumberToSend: string[] = [];

      for (const user of users) {
        let userPhoneNumber = user.phoneNumber ? user.phoneNumber : user.userId;

        if (!user.phoneNumberFull) {
          if (!user.country) continue;
          if (!user.country.callingCodes || user.country.callingCodes.length === 0) continue;

          const callingCode = user.country.callingCodes[0];
          userPhoneNumber = callingCode + userPhoneNumber;
        } else {
          userPhoneNumber = user.phoneNumberFull;
        }

        phoneNumberToSend.push(userPhoneNumber);
      }

      if (phoneNumberToSend.length === 0) {
        return;
      }

      const uniquePhoneNumbers = _.uniq(phoneNumberToSend);

      for (const phone of uniquePhoneNumbers) {
        this.notificationRepository.setInstanceKey(instancekey);
        const smsNotification = await this.notificationRepository.create({
          modelId: 'sharePractice',
          isScheduled: true,
          isEmail: false,
          to: phone,
          sms: text,
        });
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async sendSms(instancekey, data, confirmUrl) {
    try {
      if (data.phones) {
        this.usersRepository.setInstanceKey(instancekey)
        const users = await this.usersRepository.find({
          $or: [{
            userId: {
              $in: data.phones
            }
          },
          {
            phoneNumber: {
              $in: data.phones
            }
          },
          {
            phoneNumberFull: {
              $in: data.phones
            }
          }
          ]
        }, null, { lean: true });
        if (users.length > 0) {
          var text = 'Please click the link above to take this test.' + confirmUrl
          try {
            const response = await this.bitly.shorten(confirmUrl);
            confirmUrl = response

            text = 'Please click the link above to take this test.' + confirmUrl
            this.sendSmsToUser(instancekey, users, text)
          } catch (err) {
            this.sendSmsToUser(instancekey, users, text)
          }
        }
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async sendMail(instancekey: string, file: any, tmp: any, data: any) {
    try {
      if (data.emails) {
        let dataMsg = {
          to: data.emails,
          modelId: 'sharePractice',
          isScheduled: true
        };

        await this.messageCenter.send_with_template(instancekey, file, tmp, dataMsg);
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async shareLink(req: ShareLinkRequest) {
    try {
      if (!req.body.practiceSetId) {
        throw new BadRequestException();
      }
      if (!req.body.emails && !req.body.phones) {
        throw new BadRequestException('emails is required')
      }

      const settings = await this.redisCache.getSetting({ instancekey: req.instancekey }, function (settings: any) {
        return settings;
      })

      let data = _.assign(req.body, {
        user: req.user
      })

      this.practiceSetRepository.setInstanceKey(req.instancekey);
      var practicSet = await this.practiceSetRepository.findById(new ObjectId(data.practiceSetId), {
        testCode: 1,
        _id: 0
      })

      let file = 'sharing-practiceset'
      let confirmUrl = settings.baseUrl + practicSet.testCode
      let tmp = {
        logo: settings.baseUrl + 'images/logo2.png',
        senderName: data.user.name,
        sharingLink: confirmUrl,
        subject: 'Practice Test Sharing',
        supportEmail: settings.supportEmail
      }

      this.eventBus.emit('Practice.shared', {
        req: {
          headers: {
            instancekey: req.instancekey
          }
        },
        tmp: tmp,
        file: file,
        user: data.user._id,
        data: {
          _id: data._id,
          emails: data.emails
        }
      })

      await Promise.all([
        this.sendSms(req.instancekey, data, confirmUrl),
        this.sendMail(req.instancekey, file, tmp, data),
      ])

      return;
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  private async emailAttemptSubmit(request, testId) {
    this.practiceSetRepository.setInstanceKey(request.instancekey)
    let practice = await this.practiceSetRepository.findOne(
      { _id: testId },
      { title: 1 },
      { lean: true },
    )
    let tmpOptions = {
      testName: practice.title,
      subject: "Your attempt is recorded.",
    };

    let dataMsgCenter: any = {
      receiver: request.userId,
      modelId: "attemptSubmitted",
    };

    if (request.email) {
      dataMsgCenter.to = request.email;
      dataMsgCenter.isScheduled = true;
    }

    await this.messageCenter.sendWithTemplate(request,
      "attempt-submit",
      tmpOptions,
      dataMsgCenter,
      function () {
        Logger.debug("attempt submit is sent");
      }
    )
  }

  removeAD(doc) {
    if (doc.attemptdetails)
      if (doc.attemptdetails.QA) {
        var QA = doc.attemptdetails.QA.slice()
        if (!(Object.keys(doc).indexOf('_id') + 1)) {
          doc = doc.toObject()
        }
        doc.QA = QA
        doc.attemptdetails = doc.attemptdetails._id
      }
    return doc
  }

  removeAttemptDetails(docs) {
    if (Array.isArray(docs)) {
      for (var i = 0; i < docs.length; i++) {
        docs[i] = this.removeAD(docs[i])
      }
    } else {
      docs = this.removeAD(docs)
    }

    return docs
  }

  private async processNewAttempt(request: any) {
    let data: any = {}
    if (request.body.isAbandoned) {
      data.isAbandoned = request.body.isAbandoned
    }
    if (request.body.$fraudDetected) {
      data.fraudDetected = request.body.fraudDetected;
    }
    if (request.body.isFraudulent) {
      data.isFraudulent = request.body.isFraudulent
    }
    if (request.body.attemptId) {
      data.attemptId = new Types.ObjectId(request.body.attemptId);
    }
    if (request.body.terminated) {
      data.terminated = request.body.terminated
    }
    if (request.body.referenceId) {
      data.referenceId = new Types.ObjectId(request.body.referenceId)
    }
    if (request.body.practicesetId) {
      data.practicesetId = new Types.ObjectId(request.body.practicesetId)
    }
    if (request.body.referenceType) {
      data.referenceType = request.body.referenceType
    }
    if (request.body._id) {
      data._id = request.body._id;
    }

    data.email = request.userEmail;

    this.attemptRepository.setInstanceKey(request.instancekey);
    const existingAttempt = await this.attemptRepository.findOne({
      user: new Types.ObjectId(request.userId),
      practicesetId: data.practicesetId
    })

    if (!existingAttempt) {
      await this.practiceSetRepository.updateOne(
        { _id: data.practicesetId },
        { $inc: { totalJoinedStudent: 1 } }
      );
    }

    const practice = await this.practiceSetRepository.findById(
      data.practicesetId, undefined, { new: true },
      [{ path: 'user', select: '-salt -hashedPassword', options: { lean: true } }],
    );

    let settings: any = await this.redisCache.getSettingAsync(request.instancekey)
    let attempt: any = await this.attemptProcessor.handleNewAttempt(request.instancekey, settings, data, practice)

    // Send email to student
    await this.emailAttemptSubmit(request, data.practicesetId);

    attempt = this.removeAttemptDetails(attempt)
    return attempt;
  }

  async endGame(req: PlayGameRequest) {
    // Create game attempt    
    var gameAttempt = await this.gameAttemptRepository.findOne({
      'player._id': new ObjectId(req.user._id),
      'game._id': new ObjectId(req.id),
      isAbandoned: false
    })
    gameAttempt = this.gameAttemptRepository.populate(gameAttempt, {
      path: 'turns.question',
      select: 'topic unit category',
      options: { lean: true }
    })

    if (!gameAttempt) {
      throw new NotFoundException('game attempt not found');
    }

    var attempt = {
      user: new ObjectId(req.user._id),
      practicesetId: new ObjectId(req.id),
      totalQuestions: 10,
      isAbandoned: gameAttempt.isAbandoned,
      totalCorrects: 0,
      totalTime: 0,
      totalErrors: 0,
      totalMissed: 0,
      totalMark: 0,
      maximumMarks: 10,
      plusMark: 1,
      minusMark: 0,
      attemptType: 'game',
      QA: []
    }

    gameAttempt.turns.forEach(function (t) {
      let status: any = Constants.MISSED
      if (t.isCorrect) {
        attempt.totalCorrects++;
        attempt.totalMark++;
        status = Constants.CORRECT
      } else if (t.answers.length > 0) {
        attempt.totalErrors++;
        status = Constants.INCORRECT
      } else {
        attempt.totalMissed++;
      }
      attempt.totalTime += t.timeElapsed * 1000

      attempt.QA.push({
        topic: t.question.topic,
        unit: t.question.unit,
        question: t.question._id,
        category: t.question.category,
        timeEslapse: t.timeElapsed * 1000,
        createdAt: t.createdAt,
        actualMarks: 1,
        obtainMarks: t.isCorrect ? 1 : 0,
        status: status,
        isMissed: status == Constants.MISSED,
        answers: t.answers
      })
    })

    var request: any = req;
    request.body = attempt
    const newAttempt = await this.processNewAttempt(request)

    await this.gameAttemptRepository.findOneAndUpdate({
      _id: gameAttempt._id
    }, {
      $set: {
        isActive: false,
        attempt: newAttempt._id
      }
    })
  }

  async playGame(req: PlayGameRequest) {
    // 1. Save user turn
    const turn = {
      question: req.body.question,
      answers: req.body.answers,
      isCorrect: req.body.isCorrect,
      timeElapsed: req.body.seconds // In seconds
    };

    try {
      await this.socketClientService.initializeSocketConnection(req.instancekey, req.token);

      this.gameAttemptRepository.setInstanceKey(req.instancekey);
      const attempt = await this.gameAttemptRepository.findOneAndUpdate({
        'player._id': new ObjectId(req.user._id),
        'game._id': new ObjectId(req.id),
        isActive: true,
        isAbandoned: false,
        isInTurn: true,
        'game.expiresOn': { $gt: new Date() }
      }, {
        $set: { isInTurn: req.body.isCorrect },
        $push: { turns: turn }
      }, { new: true });

      if (!attempt) {
        throw new NotFoundException();
      }

      if (req.body.isCorrect) {
        await this.gameAttemptRepository.updateMany({
          'game._id': new ObjectId(req.id),
          'game.players._id': new ObjectId(req.user._id)
        }, {
          $inc: { 'game.players.$.mark': 1 }
        });

        for (const p of attempt.game.players) {
          if (!p._id.equals(req.user._id)) {
            await this.socketClientService.toUser(
              req.instancekey, p._id, 'game.correct', { game: req.id, player: req.user._id }
            );
          }
        }

      }

      const isTurnFinish = attempt.turns.length === 10;
      if (isTurnFinish) {
        attempt.isActive = false;
        await this.endGame(req);
      }

      if (isTurnFinish || !turn.isCorrect) {
        const next = await this.gameAttemptRepository.findOne({
          _id: { $ne: attempt._id },
          'game._id': new ObjectId(req.id),
          isActive: true,
          isAbandoned: false,
          isInTurn: false
        })

        if (next) {
          await this.gameAttemptRepository.updateOne({ _id: next._id }, {
            $set: { isInTurn: true, 'game.inTurnPlayer': next.player }
          })

          await this.gameAttemptRepository.updateMany({
            _id: { $ne: next._id },
            'game._id': new ObjectId(req.id),
            isActive: true,
            isAbandoned: false,
            isInTurn: false
          }, {
            $set: { 'game.inTurnPlayer': next.player }
          })

          await this.socketClientService.toUser(req.instancekey, next.player._id, 'game.turn', req.id);

          this.pushService.pushToUsers(req.instancekey, [next.player._id],
            'It is your turn to play game',
            'It is your turn to play game', {
            custom: {
              state: {
                name: 'student.game',
                params: { id: req.id }
              }
            }
          });

          return { continue: false, finish: isTurnFinish };
        } else {
          if (isTurnFinish) {
            const allPlayers = await this.gameAttemptRepository.find({
              'game._id': new ObjectId(req.id),
              isAbandoned: false
            });

            let winner: any = { mark: 0, time: 0 };
            const players = allPlayers.map(p => {
              let mark = 0;
              let time = 0;
              p.turns.forEach(t => {
                if (t.isCorrect) {
                  mark++;
                }
                time += t.timeElapsed;
              });

              if (winner.mark < mark || (winner.mark === mark && winner.time > time)) {
                winner = { mark, time, _id: p.player._id };
              }

              return {
                _id: p.player._id,
                name: p.player.name,
                avatar: p.player.avatar,
                mark,
                time,
                isWinner: false
              };
            });

            const winnerIndex = players.findIndex(p => p._id.toString() === winner._id.toString());
            players[winnerIndex].isWinner = true;

            await this.gameAttemptRepository.updateMany({
              'game._id': new ObjectId(req.id),
              isAbandoned: false
            }, {
              $set: { isEvaluated: true, 'game.players': players }
            });

            for (const p of players) {
              await this.socketClientService.toUser(req.instancekey, p._id, 'game.end', req.id);
            }

            return { continue: false, finish: true };
          } else {
            attempt.isInTurn = true;
            await this.gameAttemptRepository.findByIdAndUpdate(attempt._id, attempt)
            return { continue: true, finish: false };
          }
        }
      } else {
        return { continue: true };
      }
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async checkTestCode(req: CheckTestCodeRequest) {
    try {
      let testCode = req.code;
      let seqCode: string | undefined;

      if (testCode.length === 12) {
        seqCode = testCode.slice(6, 12);
        testCode = testCode.slice(0, 6);
      }

      const condition = {
        testCode: regexCode(testCode),
      };

      this.practiceSetRepository.setInstanceKey(req.instancekey);
      var practiceInfo = await this.practiceSetRepository
        .findOne(condition, {
          '_id': 1,
          subjects: 1,
          user: 1,
          testMode: 1,
          isAdaptive: 1,
        }, { lean: true })

      practiceInfo = await this.practiceSetRepository.populate(practiceInfo, { path: 'user', select: '-salt -hashedPassword' })

      if (!practiceInfo) {
        return { status: 404, message: 'Not found' };
      }

      if (practiceInfo.user.country.code !== req.user.country.code) {
        return {
          status: 403,
          message: 'Test is published in different country',
        };
      }

      const userSubjectIndex = req.user.subjects.findIndex((subjectId) =>
        subjectId.toString() === practiceInfo.subjects[0]._id.toString()
      );

      if (userSubjectIndex === -1) {
        this.usersRepository.setInstanceKey(req.instancekey);
        await this.usersRepository.updateOne(
          { _id: new ObjectId(req.user._id) },
          { $push: { subjects: practiceInfo.subjects[0]._id } }
        );
      }

      if (seqCode) {
        this.classroomRepository.setInstanceKey(req.instancekey);
        const classroom = await this.classroomRepository.findOne({
          seqCode: regexCode(seqCode),
        });

        if (!classroom) {
          return { status: 404, message: 'Classroom is not found' };
        }

        const studentIndex = classroom.students.findIndex((student) =>
          student.studentId.equals(req.user._id)
        );

        if (studentIndex === -1) {
          classroom.students.push({
            studentId: new ObjectId(req.user._id),
            status: true,
            autoAdd: false,
            studentUserId: req.user.userId,
            registeredAt: req.user.createdAt,
            iRequested: false,
          });

          await this.classroomRepository.findByIdAndUpdate(classroom._id, classroom);
        }
      }

      return practiceInfo;
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async exportPDF(req: ExportPDFRequest) {
    let url = `${config.reportApi}testExportAsPDF?testId=${req.id}`;

    if (req.query.hasAnswers) {
      url += `&include_answer=${req.query.hasAnswers}`;
    }

    Logger.debug('start export');

    try {
      if (req.query.directDownload) {
        url += '&direct_download=true';
        const response = await axios({
          url: url,
          method: 'get',
          headers: {
            'instancekey': 'f2)2-EDu-lonYuqcGTat!AEI$SKillify',
          },
          responseType: 'stream',
          timeout: 600000,
        });
        return { stream: response.data };
      } else {
        const response = await axios({
          url: url,
          method: 'get',
          headers: {
            'instancekey': 'f2)2-EDu-lonYuqcGTat!AEI$SKillify',
          },
          timeout: 600000,
        });

        Logger.debug('export return');
        if (response.status !== 200) {
          if (response.data.message) {
            throw new NotFoundException(response.data.message);
          }
          throw new NotFoundException();
        }

        Logger.debug('export data %j', response.data);

        const dl = `${config.reportApi}exports/${response.data.data}`;
        return { downloadLink: dl };
      }
    } catch (err) {
      console.error(err);
      if (err instanceof NotFoundException) {
        throw new GrpcNotFoundException(err.message);
      }
      throw new GrpcInternalException('Internal Server Error')
    }
  }

  async fraudCheck(req: FraudCheckRequest) {
    const url = `${config.reportApi}analyzeFraud?testId=${req.id}`;

    try {
      const response = await axios({
        url: url,
        method: 'get',
        headers: {
          'instancekey': req.instancekey,
        },
        timeout: 60000,
      });

      if (response.status !== 200) {
        if (response.data.message) {
          console.error('Fraud check error:', response.data.message);
        }
        throw new BadRequestException(`Fraud check failed with code ${response.status}`);
      }

      return { response: response.data };
    } catch (err) {
      console.error(err);
      if (err instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(err.message);
      }

      throw new GrpcInternalException(err.message);
    }
  }

  async getStudentTakingTest(req: GetStudentTakingTestRequest) {
    // let admin/teacher join the test room
    await this.socketClientService.initializeSocketConnection(req.instancekey, req.token);
    await this.socketClientService.joinTest(req.instancekey, req.user._id, req.id);

    if (req.query.isPrivate) {
      if (!req.query.classes) {
        return {
          count: 0,
          students: []
        };
      }

      let classes: any = req.query.classes.split(',');
      this.classroomRepository.setInstanceKey(req.instancekey);
      classes = await this.classroomRepository.find({ _id: { $in: classes } }, { name: 1, students: 1 }, { lean: true },
        [{ path: 'students.studentId', select: 'name', options: { lean: true } }])

      let students = [];
      let ids = [];
      classes.forEach(c => {
        c.students.forEach(s => {
          const found = _.findIndex(students, { userId: s.studentUserId });

          if (found === -1) {
            const item = {
              name: s.studentId ? s.studentId.name : '',
              userId: s.studentUserId,
              studentId: s.studentId ? s.studentId._id : '',
              classes: [{
                _id: c._id,
                name: c.name
              }]
            };

            students.push(item);
            if (s.studentId) {
              ids.push(item.studentId);
            }
          } else {
            students[found].classes.push({
              _id: c._id,
              name: c.name
            });
          }
        });
      });

      this.userLogRepository.setInstanceKey(req.instancekey)
      let logs = await this.userLogRepository.find({ user: { $in: ids }, takingPracticeSet: new ObjectId(req.id) }, null, { lean: true })

      this.attendanceRepository.setInstanceKey(req.instancekey);
      let attendances = await this.attendanceRepository.find({ practicesetId: new ObjectId(req.id), studentId: { $in: ids } }, null, { lean: true },
        [{ path: 'studentId', select: 'rollNumber', options: { lean: true } }]);

      let toCheckForLastAttempt = [];
      students.forEach(s => {
        s.status = 'ready';
        const logIdx = _.findIndex(logs, (a) => a.user.equals(s.studentId));
        if (logIdx > -1) {
          s.status = 'started';
        } else {
          toCheckForLastAttempt.push(s);
        }

        for (const attendance of attendances) {
          if (attendance.studentId._id.equals(s.studentId)) {
            s.attemptLimit = attendance.attemptLimit;
            s.offscreenLimit = attendance.offscreenLimit;
            s.rollNumber = attendance.studentId.rollNumber;
            s.studentId = attendance.studentId._id;
            break;
          }
        }
      });

      this.attemptRepository.setInstanceKey(req.instancekey)
      let attempts = await this.attemptRepository.aggregate([
        {
          $match: {
            practicesetId: new ObjectId(req.id),
            user: { $in: toCheckForLastAttempt.map(i => i._id) }
          }
        },
        {
          $group: {
            _id: '$user',
            lastAttempt: { $last: "$createdAt" },
            isAbandoned: { $last: "$isAbandoned" }
          }
        }
      ]);

      toCheckForLastAttempt.forEach(s => {
        const lastAttempt = _.findIndex(attempts, { _id: s._id });
        if (lastAttempt > -1) {
          s.status = attempts[lastAttempt].isAbandoned ? 'abandoned' : 'finished';
        }
      });

      await Promise.all(students.map(async (s) => {
        s.isOnline = await this.socketClientService.isOnline(req.instancekey, s.studentId);
      }));

      return {
        count: students.length,
        students: students
      };
    } else {
      // Public or bought Test
      const page = req.query.page ? req.query.page : 1;
      const limit = req.query.limit ? req.query.limit : 20;
      const skip = (page - 1) * limit;

      let pipe: any = [{
        $match: {
          practicesetId: new ObjectId(req.id)
        }
      }];
      pipe.push(
        { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'userInfo' } }
      );
      pipe.push({ $unwind: "$userInfo" });
      pipe.push({
        $project: {
          "studentId": 1,
          "name": 1,
          "studentUserId": 1,
          "status": 1,
          "attemptLimit": 1,
          "offscreenLimit": 1,
          "rollNumber": "$userInfo.rollNumber"
        }
      });

      if (req.query.searchText) {
        pipe.push({
          $match: {
            $or: [
              { 'name': { "$regex": req.query.searchText, "$options": "i" } },
              { 'studentUserId': { "$regex": req.query.searchText, "$options": "i" } },
              { 'rollNumber': req.query.searchText }
            ]
          }
        });
      }

      let facet = {
        students: [
          { $sort: { 'updatedAt': -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              "studentId": 1,
              "name": 1,
              "userId": "$studentUserId",
              "status": 1,
              "attemptLimit": 1,
              "offscreenLimit": 1,
              "rollNumber": 1
            }
          }
        ]
      };

      if (req.query.includeCount) {
        facet['total'] = [{ $count: 'all' }];
      }

      pipe.push({ $facet: facet });

      this.attendanceRepository.setInstanceKey(req.instancekey)
      const result: any = await this.attendanceRepository.aggregate(pipe);

      await Promise.all(result[0].students.map(async (s) => {
        s.isOnline = await this.socketClientService.isOnline(req.instancekey, s.studentId);
      }));

      const finalResult = result[0];
      if (finalResult.total) {
        finalResult.total = finalResult.total[0] ? finalResult.total[0].all : 0;
      }

      return finalResult;
    }
  }

  async importFile(req: ImportFileReq) {
    try {
      const { file, body } = req;
      if (!file) {
        throw new BadRequestException('No file passed');
      }

      const ext = path.extname(file.originalname);
      if (body.QB || body.testId) {
        switch (ext) {
          case '.xls':
          case '.xlsx':
            await this.practiceSetExcelService.importQuestionExcelFile(req);
            break;
          default:
            await this.practiceSetExcelService.importQZipFile(req);
            break;
        }
      } else {
        switch (ext) {
          case '.xls':
          case '.xlsx':
            await this.practiceSetExcelService.importOnlyExcelFile(req);
            break;
          case '.docx':
            await this.practiceSetExcelService.sendToExtractService(req);
            break;
          default:
            await this.practiceSetExcelService.importZipFile(req);
            break;
        }
      }
      return { message: 'File processed successfully' };
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(err.message);
      }
      throw new GrpcInternalException(err.message);
    }
  }

  async importQuestion(req: ImportQuestionRequest) {
    try {
      const { fromSearch, practice, searchParams, user, instancekey } = req;
      let questions: any = req.questions;

      if (!questions && !fromSearch) {
        return {};
      }

      this.practiceSetRepository.setInstanceKey(req.instancekey);
      this.questionRepository.setInstanceKey(req.instancekey);

      const practiceSet: any = await this.practiceSetRepository.findById(new ObjectId(practice));

      if (!practiceSet) {
        throw new NotFoundException('Practice not found');
      }

      if (fromSearch) {
        if (!searchParams) {
          throw new BadRequestException('Search parameters not provided');
        }
        searchParams.toImport = true;
        questions = await this.internalSearch(user, searchParams);

        if (!questions?.length) {
          return { totalQuestion: practiceSet.totalQuestion };
        }
      }

      for (const pQuestion of practiceSet.questions) {
        if (questions.includes(pQuestion.question.toString())) {
          throw new BadRequestException('One or more selected questions are already imported');
        }
      }

      const quesList = await this.questionRepository.find(
        { _id: { $in: questions.map(q => new ObjectId(q)) }, isActive: true },
        undefined, { lean: true }
      );

      if (!quesList || quesList.length === 0) {
        throw new NotFoundException('Question not found');
      }

      if (practiceSet.questions.length > 0 && !practiceSet.questions[0].order) {
        practiceSet.questions.forEach((cq, idx) => cq.order = idx + 1);
      }

      const orderList = [];
      questions.forEach(oq => {
        const qIdx = _.findIndex(quesList, ql => ql._id.equals(oq));
        if (qIdx > -1) {
          orderList.push(quesList[qIdx]);
        }
      });

      const date = new Date();
      orderList.forEach((oq, idx) => {
        practiceSet.questions.push({
          question: oq._id,
          createdAt: new Date(date.getTime() + 100 * idx),
          section: oq.subject.name,
          order: practiceSet.questions.length + 1,
        });
      });

      practiceSet.totalQuestion = practiceSet.questions.length;

      await this.practiceSetRepository.updateOne({ _id: practiceSet._id }, { $set: { questions: practiceSet.questions, totalQuestion: practiceSet.totalQuestion } });

      await this.questionRepository.updateMany({ _id: { $in: questions } }, { $addToSet: { practiceSets: practiceSet._id } });

      return { totalQuestion: practiceSet.totalQuestion };
    } catch (err) {
      Logger.log(err);
      
      if (err instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(err.message);
      } else if (err instanceof NotFoundException) {
        throw new GrpcNotFoundException(err.message);
      }
      throw new GrpcInternalException(err.message);
    }
  }

  //Internal function used in importQuestion
  async internalSearch(user: any, params: any) {
    let filter: any = {};

    if (!user.roles.includes('publisher')) {
      filter.locations = new Types.ObjectId(user.activeLocation);
    }

    let qIds: ObjectId[] | null = null;

    if (params.level) {
      qIds = [];
      const practices = await this.practiceSetRepository.find(
        { "subject.level": params.level }, 'questions', { lean: true }
      );

      if (practices.length) {
        practices.forEach(function (p) {
          if (p.questions) {
            for (let i = 0; i < p.questions.length; i++) {
              qIds.push(p.questions[i].question);
            }
          }
        });
      } else {
        return { questions: [] };
      }
    }

    let notqIds: ObjectId[] = [];

    if (params.unusedOnly) {
      const unusedIds = await this.practiceSetRepository.aggregate([
        { $match: { status: 'published' } },
        { $project: { questions: 1, _id: 0 } },
        { $unwind: '$questions' },
        { $project: { _id: '$questions.question' } },
      ]);

      unusedIds.forEach((unusedId: any) => {
        notqIds.push(unusedId._id);
      });
    }

    if (params.notInTest) {
      const p = await this.practiceSetRepository.findById(new ObjectId(params.notInTest), 'questions');

      if (p.questions && p.questions.length) {
        p.questions.forEach((question: any) => {
          notqIds.push(question.question);
        });
      }
    } else if (params.excludeTempt) {
      if (params.usedQuestions && params.usedQuestions.length > 0) {
        params.usedQuestions.forEach((q: string) => notqIds.push(new ObjectId(q)));
      }

      const p = await this.practiceSetRepository.findOne(
        { user: new Types.ObjectId(user._id), status: 'tempt' }, 'questions', { lean: true }
      );

      if (p && p.questions) {
        p.questions.forEach((question: any) => {
          notqIds.push(question.question);
        });
      }
    }

    if (params.excludeQuestions && params.excludeQuestions.length) {
      notqIds = [...notqIds, ...params.excludeQuestions.map((id: string) => new ObjectId(id))];
    }

    if (qIds && notqIds.length) {
      qIds = qIds.filter((q: ObjectId) => !notqIds.find((nid: ObjectId) => nid.equals(q)));
      if (!qIds.length) {
        return { questions: [] };
      }
      filter._id = { $in: qIds };
    } else if (qIds) {
      if (!qIds.length) {
        return { questions: [] };
      }
      filter._id = { $in: qIds };
    } else if (notqIds.length) {
      filter._id = {
        $nin: notqIds,
      };
    }

    /** DONE filter by _id */

    filter.$and = [];

    if (params.marks) {
      filter.$or = [{ plusMark: params.marks }, { minusMark: params.marks }];
    }

    if (params.pendingReview) {
      filter["moderation.moderatedBy"] = {
        "$exists": false
      };
    }

    if (params.category) {
      filter.category = params.category;
    }

    if (params.isEasy || params.isModerate || params.isDifficult) {
      filter.complexity = { $in: [] };

      if (params.isEasy) {
        filter.complexity.$in.push('easy');
      }
      if (params.isModerate) {
        filter.complexity.$in.push('moderate');
      }
      if (params.isDifficult) {
        filter.complexity.$in.push('hard');
      }
    }

    if (params.tags) {
      filter.tags = {
        $in: params.tags,
      };
    }


    if (params.myquestion) {
      filter.isAllowReuse = { $ne: 'none' };
      filter.user = new ObjectId(user._id);
    } else {
      if (params.owners) {
        if (canReadContentsOfAllUsers([user.roles])) {
          filter.isAllowReuse = { $ne: 'none' };
        } else {
          filter.isAllowReuse = 'global';
        }
        filter.user = { $in: params.owners.map(o => new ObjectId(o)) };
      } else {
        if (canReadContentsOfAllUsers([user.roles])) {
          filter.isAllowReuse = { $ne: 'none' };
        } else {
          filter.$and.push(
            {
              $or: [
                { isAllowReuse: 'global' }, { isAllowReuse: 'self', user: new ObjectId(user._id) }
              ],
            },
          );
        }
      }
    }

    if (params.reUse) {
      if (params.studentQuestions) {
        if (params.pending) {
          filter.approveStatus = 'pending';
        } else {
          filter.approveStatus = {
            $in: ['pending', 'approved', 'rejected'],
          };
        }
      } else {
        if (params.isApproved) {
          filter.approveStatus = 'approved';
        }
      }
    }

    // We will by pass this filter in case we search for student Questions
    if (!user.roles.includes(config.roles.student) && !params.studentQuestions) {
      if (params.isActive) {
        filter.isActive = true;
      } else {
        filter.isActive = false;
      }
    }

    if (params.subject && !params.units && !params.topics) {
      filter['subject._id'] = new ObjectId(params.subject);
    } else {
      if (user) {
        filter['subject._id'] = {
          $in: user.subjects.map((s: string) => new ObjectId(s)),
        };
      }
    }

    if (params.units && !params.topics) {
      // no need to convert it to objectId unless we use it in aggregation, it gonna crash server if the ObjectId conversion fail
      // One more thing, we also use this query some where else where we have comma separated list of units in the query
      filter['unit._id'] = {
        $in: params.units.map((t: string) => new ObjectId(t)),
      };
    }

    if (params.topics) {
      filter['topic._id'] = {
        $in: params.topics.map((t: string) => new ObjectId(t)),
      };
    }

    if (params.keyword) {
      const regexText = {
        $regex: util.regex(params.keyword, 'i')
      };
      filter["$and"] = [];
      filter["$and"].push({
        $or: [
          { 'questionText': regexText },
          { 'topic.name': regexText },
          { 'unit.name': regexText },
        ],
      });
    }

    // Filter questions that has alternativeExplanations
    if (params.altSolution) {
      filter.alternativeExplanations = {
        $exists: true,
        $ne: [],
      };
    }

    if (!filter.$and.length) {
      delete filter.$and;
    }

    // for import all searched questions to test
    // we need only list of Ids

    if (params.toImport) {
      const toReturn = await this.questionRepository.distinct('_id', filter);
      return toReturn;
    } else {
      const sort = {
        'unit.name': 1,
        'topic.name': 1,
        'updatedAt': 1,
      };
      const page = params.page ? params.page : 1;
      const limit = params.limit ? params.limit : 20;
      const skip = (page - 1) * limit;

      const questionCursor: any = await this.questionRepository.find(filter, null, { sort, skip, limit }, [{ path: 'user', select: 'name' }, 'topic._id']);

      const toReturn = [];

      for await (const question of questionCursor) {
        toReturn.push({
          _id: question._id,
          createBy: question.user.name,
          answerExplain: question.answerExplain,
          answerNumber: question.answerNumber,
          wordLimit: question.wordLimit,
          complexity: question.complexity,
          createdAt: question.createdAt,
          minusMark: question.minusMark,
          plusMark: question.plusMark,
          practiceSets: question.practiceSets,
          questionHeader: question.questionHeader,
          questionText: question.questionText,
          questionTextArray: question.questionTextArray,
          questionType: question.questionType,
          subject: question.subject,
          unit: question.unit,
          topic: question.topic,
          updatedAt: question.updatedAt,
          user: question.user._id,
          isAllowReuse: question.isAllowReuse,
          isActive: question.isActive,
          category: question.category,
          answers: question.answers,
          tags: question.tags,
          coding: question.coding,
          hasUserInput: question.hasUserInput,
          userInputDescription: question.userInputDescription,
          hasArg: question.hasArg,
          argumentDescription: question.argumentDescription,
          approveStatus: question.approveStatus,
          alternativeExplanations: question.alternativeExplanations,
          partialMark: question.partialMark,
          moderation: question.moderation,
          testcases: question.testcases,
        });
      }

      if (params.includeCount) {
        const total = await questionCursor.cursor.count();
        return { questions: toReturn, count: total };
      } else {
        return { questions: toReturn };
      }
    }
  }

  async exportTest(req: ExportTestReq) {
    try {
      const uploadPath = getAssets(req.instancekey);
      if (req.query.deleteUrl) {
        const filePth = path.join(config.root + "/" + uploadPath, req.query.deleteUrl);
        fs.unlink(filePth, (err) => {
          if (err) {
            Logger.error(err);
          }
          return { message: "ok" };
        });
      } else {
        this.practiceSetRepository.setInstanceKey(req.instancekey);
        const data = await this.practiceSetRepository.findById(
          req.id, undefined, { populate: { path: "questions.question" }, lean: true }
        );

        if (!data) {
          throw new NotFoundException('Practice set not found');
        }

        const defaultPath = path.join(uploadPath, "download");
        const uploadDir = path.join(defaultPath, "exports");
        await fsExtra.ensureDir(defaultPath);
        await fsExtra.ensureDir(uploadDir);
        const exportDir = path.join(uploadDir, slugify(data.titleLower, { lower: true }));
        await fsExtra.ensureDir(exportDir);

        const result = await this.writeToExcelAndZipExcelAndImages(req, data);
        return result;
      }
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(err.message);
      } else if (err instanceof NotFoundException) {
        throw new GrpcNotFoundException(err.message);
      }
      throw new GrpcInternalException(err.message);
    }
  }

  async writeToExcelAndZipExcelAndImages(req: any, data: any): Promise<{ sourceFile: string }> {
    const wb = new Excel.Workbook();
    const testSheet = wb.addWorksheet("Practice Test");
    const qSheet = wb.addWorksheet("Questions");

    const testColumn = [
      { header: "Header", key: "head" },
      { header: "Value", key: "val" },
    ];

    testSheet.columns = testColumn;
    testSheet.getRow(1).font = { bold: true };

    testSheet.addRow(["Name", data.title]);
    testSheet.addRow(["Description", data.description]);
    testSheet.addRow(["Time Allocated", data.totalTime]);
    testSheet.addRow(["Country", data.countries[0].code]);
    testSheet.addRow(["Positive Marks", data.plusMark]);
    testSheet.addRow(["Negative Marks", data.minusMark]);
    testSheet.addRow(["Mark At Test Level", data.isMarksLevel]);

    const qColumns = [
      { header: "Subject", key: "sub" },
      { header: "Unit", key: "uni" },
      { header: "Topic", key: "top" },
      { header: "Complexity", key: "comp" },
      { header: "Instruction", key: "inst" },
      { header: "Positive marks", key: "pm" },
      { header: "Negative Marks", key: "nm" },
      { header: "Question", key: "ques" },
      { header: "Option 1", key: "o1" },
      { header: "Option 2", key: "o2" },
      { header: "Option 3", key: "o3" },
      { header: "Option 4", key: "o4" },
      { header: "Option 5", key: "o5" },
      { header: "Answers", key: "ans" },
      { header: "Explanation", key: "exp" },
      { header: "Category", key: "cat" },
      { header: "Has User Input", key: "hui" },
      { header: "User Input Description", key: "uid" },
      { header: "Has Arg", key: "ha" },
      { header: "Argument Description", key: "ad" },
      { header: "Coding", key: "coding" },
      { header: "Word Limit", key: "wordLimit" },
      { header: "Order", key: "order" },
    ];

    qSheet.columns = qColumns;
    qSheet.getRow(1).font = { bold: true };

    let img = 0;

    for (const item of data.questions) {
      if (item.question) {
        const que = item.question;
        let qtext = que.questionText;
        let ansexp = que.answerExplain;
        let qHeader = que.questionHeader;
        let arr = [];

        if (qHeader && qHeader.match(/<img/)) {
          img++;
          qHeader = await this.insertImageAndReplaceUserId(req, qHeader, data);
        }
        if (qtext.match(/<img/)) {
          img++;
          qtext = await this.insertImageAndReplaceUserId(req, qtext, data);
        }
        if (ansexp && ansexp.match(/img/)) {
          img++;
          ansexp = await this.insertImageAndReplaceUserId(req, ansexp, data);
        }

        for (const ans of que.answers) {
          let ansoption = ans.answerText;
          if (ansoption.match(/img/)) {
            ansoption = await this.insertImageAndReplaceUserId(req, ansoption, data);
            img++;
          }

          arr.push(ansoption);

          if (ans.isCorrectAnswer) {
            const ca = que.answers.indexOf(ans) + 1;
            arr.push(ca);
          }
        }

        const category = que.category;
        const hasUserInput = category === "code" ? que.hasUserInput : false;
        const userInputDescription = category === "code" ? que.userInputDescription : "";
        const hasArg = category === "code" ? que.hasArg : false;
        const argumentDescription = category === "code" ? que.argumentDescription : "";
        const coding = category === "code" ? JSON.stringify(que.coding) : "";
        const wordLimit = category === "descriptive" ? que.wordLimit : 1;
        const order = item.order || "";

        qSheet.addRow([
          que.subject.name,
          que.unit.name,
          que.topic.name,
          que.complexity,
          qHeader,
          que.plusMark,
          que.minusMark,
          qtext,
          arr[0],
          arr[1],
          arr[2],
          arr[3],
          arr[4],
          arr[5],
          ansexp,
          category,
          hasUserInput,
          userInputDescription,
          hasArg,
          argumentDescription,
          coding,
          wordLimit,
          order,
        ]);
      }
    }

    const uploadPath = getAssets(req.instancekey);
    if (img) {
      const exportZipFile = `/download/exports/${slugify(data.titleLower, { lower: true })}.zip`;
      const finalDir = path.join(uploadPath, "download/exports", slug(data.titleLower, { lower: true }), slug(data.titleLower, { lower: true }));

      await fsExtra.ensureDir(finalDir);

      await wb.xlsx.writeFile(path.join(config.root, finalDir, `${slugify(data.titleLower, { lower: true })}.xlsx`));

      await new Promise<void>((resolve, reject) => {
        zipper.zip(finalDir, (error, zipped) => {
          if (!error) {
            zipped.compress();
            zipped.save(path.join(config.root, uploadPath, exportZipFile), (error) => {
              if (error) {
                Logger.error(error);
                return reject(new BadRequestException());
              }
              Logger.debug("saved successfully !");
              resolve();
            });
          } else {
            return reject(new BadRequestException());
          }
        });
      });

      return { sourceFile: exportZipFile };
    } else {
      const exportExcelFile = `/download/exports/${slugify(data.titleLower, { lower: true })}.xlsx`;
      const excelPath = path.join(config.root, uploadPath, exportExcelFile);
      await wb.xlsx.writeFile(excelPath);
      return { sourceFile: exportExcelFile };
    }
  }

  async insertImageAndReplaceUserId(req: any, text: string, data: any): Promise<string> {
    try {
      const regex = /<img[^>]+src="([^">]+)"/g;
      const imgSrcs = text.match(regex);
      for (let i = 0; i < imgSrcs.length; i++) {
        let src = imgSrcs[i];
        // Direct url, don't download
        if (src.indexOf('src="https://') > -1 || src.indexOf('src="http://') > -1) {
          continue;
        }
        Logger.debug("image path " + i + " " + src);
        // trim the last "
        src = src.substring(0, src.length - 1);

        let srcarr = src.split('/');
        // Adjust data, make sure the path always start with 'uploads'
        srcarr = srcarr.slice(srcarr.indexOf('uploads'));
        src = srcarr.join('/');

        // In case of test import by upload feature, image will be in '/uploads/image/<user_id>/<test_name>/image_name.jpg'
        // But in case of image created when user making the question manually in web app, the image will be in '/uploads/image/<user_id>/image_name.jpg'
        // We need to handle both cases
        const isImported = srcarr.length == 5;

        Logger.debug('length of image src: ' + srcarr.length);
        const fileName = isImported ? srcarr[4] : srcarr[3];

        const imagePath = path.join(getAssets(req.instancekey), src);

        const destinationDir = path.join(
          config.root, getAssets(req.instancekey), 'download/exports/',
          slugify(data.titleLower, { lower: true }), slugify(data.titleLower, { lower: true })
        );

        const destinationFile = path.join(destinationDir, fileName);

        await fsExtra.mkdirp(destinationDir);

        try {
          await this.s3Service.downloadUserAsset(imagePath.replace('assets/', ''), destinationFile);

          Logger.debug('success!');

          text = text.replace(srcarr[2], '{unique_user_id}');
          if (isImported) {
            text = text.replace(srcarr[3], '{unique_test_name}');
          } else {
            // In this case no test_name in that path to be replaced, what is in srcarr[3] is file name
            text = text.replace(srcarr[3], '{unique_test_name}' + '/' + fileName);
          }
        } catch (err) {
          Logger.error('fail to download s3 file %s %o', imagePath, err);
        }
      }

      return text;
    } catch (err) {
      Logger.error('%o', err);
      return text;
    }
  }

  private getFilterWithStatusAggregation(status, filter) {
    var conditionExpired: any = {
      $lte: new Date()
    }
    var expiresOnFilter = {
      $lt: new Date()
    }
    if (status === 'expired') {
      filter.push({
        $match: {
          $or: [
            {
              expiresOn: expiresOnFilter,
              status: 'published'
            },
            {
              status: 'revoked'
            }
          ]
        }

      })

    } else {
      if (status === 'draft' || status === 'published') {
        conditionExpired = {
          $gt: new Date()
        }
        filter.push({
          $match: {
            $or: [{
              expiresOn: conditionExpired,
              status: 'published'
            }, {
              status: 'draft'
            }, {
              expiresOn: null
            }]
          }
        })
      }
      filter.push({
        $match: {
          status: status
        }
      })
    }
    return filter
  }

  async findForTeacher(req: FindForTeacherRequest) {
    try {
      req.query.title = req.query.title ? req.query.title : req.query.keyword
      delete req.query.keyword

      let pipeline: any = []
      let projection: any = {
        'user': 1,
        'totalQuestion': 1,
        'questionsToDisplay': 1,
        'rating': 1,
        'updatedAt': 1,
        'createdAt': 1,
        'totalJoinedStudent': 1,
        'expiresOn': 1,
        'statusChangedAt': 1,
        'status': 1,
        'attemptAllowed': 1,
        'titleLower': 1,
        'title': 1,
        'accessMode': 1,
        'subjects': 1,
        'units': 1,
        'userInfo': 1,
        'totalTime': 1,
        'isShowAttempt': 1,
        'totalAttempt': 1,
        'price': 1,
        'isAdaptive': 1,
        'slugfly': 1,
        'testType': 1,
        'allowTeacher': 1,
        'allowStudent': 1,
        "autoEvaluation": 1,
        "startDate": 1,
        "testMode": 1,
        "colorCode": 1,
        "imageUrl": 1,
        "description": 1,
        'countries': 1
      }

      if (req.query.titleOnly) {
        projection = {
          title: 1
        }
      }

      var page = req.query.page || 1
      var limit = req.query.limit || 20
      var sort: any = {
        'pinTop': -1,
        'updatedAt': -1
      }
      if (req.query.sort) {
        var tempSort = req.query.sort.split(',')
        if (tempSort[0] === 'popular') {
          sort = {
            'pinTop': -1,
            'rating': tempSort[1],
            'totalAttempt': tempSort[1]
          }
        } else {
          ['pinTop', 'descending']
          sort = {
            'pinTop': -1,
            updatedAt: -1
          }
        }
      }
      var skip = (page - 1) * limit

      let expiresOnFilter = {
        $lt: new Date()
      }

      if (req.query.multiStatus) {
        var filterMultiStatus = []
        var expiresFilter = []
        var multiStatus = req.query.multiStatus.split(',')
        if (multiStatus.length > 0) {
          if (multiStatus.length > 1) {
            for (var i in multiStatus) {
              var ssIndex = multiStatus[i]
              if (ssIndex === 'expired') {
                expiresFilter.push({
                  $and: [{
                    'expiresOn': expiresOnFilter
                  }, {
                    'expiresOn': {
                      $ne: null
                    }
                  }, {
                    'status': 'published'
                  }]
                })
              } else {
                filterMultiStatus.push(ssIndex)
              }
            }
            if (filterMultiStatus.length > 1) {
              expiresFilter.push({
                status: {
                  $in: filterMultiStatus
                }
              })
            } else {
              expiresFilter.push({
                status: filterMultiStatus[0]
              })
            }
            pipeline.push({
              $match: {
                $or: expiresFilter
              }
            })
          } else {
            pipeline = this.getFilterWithStatusAggregation(multiStatus[0], pipeline)
          }
        } else {
          pipeline.push({
            $match: {
              'expiresOn': expiresOnFilter
            }
          })
        }
      }

      if (req.query.status) {
        if (req.query.notCheckExpiresOn) {
          pipeline.push({
            $match: {
              status: req.query.status
            }
          })
        } else {
          pipeline = this.getFilterWithStatusAggregation(req.query.status, pipeline)
        }
      }

      if (req.query.expired) {
        pipeline = this.getFilterWithStatusAggregation(req.query.expired, pipeline)
      }

      if (req.query.title) {
        pipeline.push({
          $match: {
            $or: [{
              title: {
                "$regex": req.query.title,
                "$options": "i"
              }
            },
            {
              "subjects.name": {
                "$regex": req.query.title,
                "$options": "i"
              }
            }, {
              "units.name": {
                "$regex": req.query.title,
                "$options": "i"
              }
            }, {
              status: {
                "$regex": req.query.title,
                "$options": "i"
              }
            }, {
              testMode: {
                $regex: req.query.title,
                "$options": "i"
              }
            }

            ]
          }
        })
      }
      if (req.query.testMode) {
        pipeline.push({
          $match: {
            testMode: req.query.testMode
          }
        })
      }
      if (req.query.subjects) {
        var subjects = []
        if (typeof req.query.subjects === 'string') {
          subjects = [new ObjectId(req.query.subjects)]
        } else {
          req.query.subjects.forEach(s => {
            subjects.push(new ObjectId(s))
          })
        }
        pipeline.push({
          $match: {
            'subjects._id': {
              $in: subjects
            }
          }
        })
      } else {
        pipeline.push({
          $match: {
            'subjects._id': {
              $in: req.user.subjects.map((s) => new ObjectId(s))
            }
          }
        })
      }
      if (req.query.levels) {
        var levels = _.compact(req.query.levels.split(','))
        pipeline.push({
          $match: {
            level: {
              $in: levels
            }
          }
        })
      }
      if (req.query.unit) {
        var units = _.compact(req.query.unit.split(','))

        pipeline.push({
          $match: {
            'units._id': {
              $in: units
            }
          }
        })
      }

      if (!req.user.roles.includes('publisher')) {
        pipeline.push({ $match: { locations: new ObjectId(req.user.activeLocation) } })
      }

      pipeline.push({
        $match: {
          active: true,
          initiator: { $ne: 'student' }
        }
      })
      if (req.user.roles.includes('mentor')) {
        pipeline.push({
          $match: {
            $or: [{
              user: new ObjectId(req.user._id)
            }, {
              instructors: new ObjectId(req.user._id)
            }]
          }
        })
      }

      if (req.user.roles.includes('publisher') && req.user.activeLocation) {
        this.locationRepository.setInstanceKey(req.instancekey);
        let ownLocation = await this.locationRepository.findOne({ _id: new ObjectId(req.user.activeLocation), user: new ObjectId(req.user._id) }, { user: 1 }, { lean: true });
        if (ownLocation) {
          // publisher can have his own institute => all tests in his institute should be visible to him
          // and his own test regardless of location
          pipeline.push({
            $match: {
              $or: [
                {
                  locations: new ObjectId(req.user.activeLocation)
                },
                {
                  user: new ObjectId(req.user._id)
                }
              ]
            }
          })
        } else {
          pipeline.push({
            $match: {
              user: new ObjectId(req.user._id)
            }
          })
        }
      }

      let teacherIds = [];
      if (req.user.locations.length > 0) {
        this.usersRepository.setInstanceKey(req.instancekey);
        teacherIds = await this.usersRepository.distinct('_id', {
          locations: {
            $in: req.user.locations.map((l) => new ObjectId(l))
          },
          role: { $ne: 'student' }
        })
      }

      if (req.user.roles.includes(config.roles.centerHead)) {
        pipeline.push({
          $match: {
            $or: [{
              user: { $in: teacherIds }
            }, {
              user: new ObjectId(req.user._id)
            }]
          }
        })
      }
      if (req.user.roles.includes(config.roles.support)) {
        pipeline.push({
          $match: {
            status: 'published'
          }
        })
      }
      if (req.user.roles.includes(config.roles.teacher)) {
        pipeline.push({
          $match: {
            $or: [{
              peerVisibility: true,
              user: { $in: teacherIds }
            }, {
              user: new ObjectId(req.user._id)
            }, {
              instructors: new ObjectId(req.user._id)
            }]
          }
        })

      }

      if (req.query.classRoom) {
        pipeline.push({
          $match: {
            classRooms: new ObjectId(req.query.classRoom)
          }
        })
      }
      if (req.user.roles.includes(config.roles.teacher)) {
        let classIds = [];
        this.classroomRepository.setInstanceKey(req.instancekey);
        classIds = await this.classroomRepository.distinct('_id', {
          $or: [{
            user: new ObjectId(req.user._id)
          }, {
            owners: new ObjectId(req.user._id)
          }]
        })

        if (req.query.accessMode === 'internal') {
          if (req.query.isInternalOnly) {
            pipeline.push({
              $match: {
                accessMode: req.query.accessMode
              }
            })
          } else {
            pipeline.push({
              $match: {
                'courses.0': { $exists: false },
                'testseries.0': { $exists: false },
                accessMode: req.query.accessMode
              }
            })
          }
        } else if (req.query.accessMode === 'invitation' && classIds.length) {
          pipeline.push({
            $match: {
              $or: [
                {
                  user: new ObjectId(req.user._id)
                },
                {
                  accessMode: req.query.accessMode,
                  classRooms: { $in: classIds },
                  allowTeacher: true
                }
              ]
            }
          })
        } else {
          if (classIds.length > 0) {
            pipeline.push({
              $match: {
                $or: [
                  { user: new ObjectId(req.user._id) },
                  { accessMode: 'public' },
                  { accessMode: 'buy' },
                  {
                    accessMode: 'invitation',
                    allowTeacher: true,
                    classRooms: { $in: classIds }
                  }]
              }
            })
          } else {
            pipeline.push({
              $match: {
                $or: [
                  {
                    user: new ObjectId(req.user._id)
                  }, {

                    instructors: new ObjectId(req.user._id)
                  },
                  { accessMode: 'public' },
                  { accessMode: 'buy' },
                ]
              }
            })
          }
        }
      } else {
        if (req.query.accessMode) {
          pipeline.push({
            $match: {
              accessMode: req.query.accessMode
            }
          })
          if (req.query.accessMode == 'internal' && req.query.isInternalOnly !== true) {
            pipeline.push({
              $match: {
                'courses.0': { $exists: false },
                'testseries.0': { $exists: false }
              }
            })
          }
        } else {
          pipeline.push({
            $match: {
              accessMode: {
                $in: ['public', 'buy', 'invitation']
              }
            }
          })
        }
      }
      if (req.query.accessMode !== 'internal') {
        pipeline.push({
          $match: {
            accessMode: { '$ne': 'internal' },
            'courses.0': { $exists: false },
            'testseries.0': { $exists: false }
          }
        })
      }

      if (req.user.roles.includes(config.roles.director)) {
        pipeline.push({
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
          { $unwind: "$userInfo" },
          {
            $match: {
              $expr: {
                $cond: [{ $eq: ["$userInfo.role", "publisher"] },
                { $ne: ["$status", "draft"] }, {}]
              }

            }
          }

        )
      }
      pipeline.push({
        $project: projection
      })
      pipeline.push({
        $sort: sort
      })
      let countPipeline = [...pipeline]
      if (!req.query.noPaging) {
        pipeline.push({ $skip: skip }, { $limit: limit })
      }

      this.practiceSetRepository.setInstanceKey(req.instancekey);
      var queryPipe: any = await this.practiceSetRepository.aggregate(pipeline)
      if (req.query.titleOnly) {
        if (req.query.includeCount) {
          countPipeline.push({ $count: "total" })
          const total: any = await this.practiceSetRepository.aggregate(countPipeline)

          return {
            total: total[0] ? total[0].total : 0,
            tests: queryPipe
          }
        }

        return {
          tests: queryPipe
        }
      }
      await Promise.all(queryPipe.map(async practiceset => {
        practiceset.slugfly = slug(practiceset.titleLower, {
          lower: true
        })
        await this.settings.setPriceByUserCountry(req, practiceset)

        practiceset.totalAttempt = await this.countAttemptPractice(req, practiceset)
      }))

      if (req.query.includeCount) {
        countPipeline.push({ $count: "total" })
        const total: any = await this.practiceSetRepository.aggregate(countPipeline)

        return {
          total: total[0] ? total[0].total : 0,
          tests: queryPipe
        }
      }

      return {
        tests: queryPipe
      }

    } catch (ex) {
      Logger.error(ex)
      throw new GrpcInternalException('Internal Server Error')
    }
  }
}
