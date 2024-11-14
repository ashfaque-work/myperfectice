import { ApproveStudentExplanationRequest, CountByPracticeRequest, CreateExplanationRequest, CreateQuestionRequest, CreateTestFormPoolRequest, DeleteQuestionRequest, ExecuteCodeRequest, FeedbackQuestionCountRequest, FeedbackQuestionRequest, GenerateRandomTestRequest, GetAllQuestionRequest, GetByAttemptRequest, GetLastInPracticeRequest, GetLastRequest, GetQuestionForOnlineTestRequest, GetQuestionRequest, GetQuestionTagsResquest, GetRandomQuestionsRequest, GetReusedCountRequest, InternalSearchDto, InternalSearchRequest, PersonalTopicAnalysisRequest, QuestionBankDto, QuestionCategoryDto, QuestionComplexityByTopicRequest, QuestionDistributionCategoryResponse, QuestionDistributionMarksResponse, QuestionDistributionRequest, QuestionIsAttemptRequest, QuestionPerformanceRequest, QuestionSummaryTopicRequest, QuestionUsedCountResponse, SummarySubjectPracticeRequest, SummaryTopicOfPracticeBySubjectRequest, SummaryTopicPracticeRequest, TestSeriesSummaryBySubjectRequest, UpdateQuestionRequest, UpdateStudentQuestionRequest, UpdateTagsRequest, UserDto } from '@app/common/dto/question-bank.dto';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { AttemptDetailRepository, AttemptRepository, ClassroomRepository, ExamScheduleRepository, PracticeSetRepository, QuestionRepository, QuestionTagRepository, RedisCaching, regexCode, SubjectRepository, TestSeriesRepository, TopicRepository, UnitRepository, UsersRepository } from '@app/common';
import { GrpcAbortedException, GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException, GrpcUnavailableException } from 'nestjs-grpc-exceptions';
import { Question } from '../../../libs/common/src/database/models/question-bank/question.schema';
import { config, getAssets } from '@app/common/config';
import * as roleHelper from '@app/common/helpers/role-helper';
import * as util from '@app/common/Utils';
import { QuestionBus } from '@app/common/bus/question.bus';
import { EventBus } from '@app/common/components/eventBus';
import * as _ from 'lodash';
import axios from 'axios';

interface QuestionWithSectionOrder extends Question {
  section: string;
  order: number;
  canEdit: boolean;
}

@Injectable()
export class QuestionBankService {
  constructor(private readonly questionRepository: QuestionRepository,
    private readonly practiceSetRepository: PracticeSetRepository,
    private readonly attemptDetailRepository: AttemptDetailRepository,
    private readonly questionTagRepository: QuestionTagRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly unitRepository: UnitRepository,
    private readonly topicRepository: TopicRepository,
    private readonly questionBus: QuestionBus,
    private readonly eventBus: EventBus,
    private readonly testSeriesRepository: TestSeriesRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly usersRepository: UsersRepository,
    private readonly classroomRepository: ClassroomRepository,
    private readonly examScheduleRepository: ExamScheduleRepository,
    private readonly redisCache: RedisCaching) { }

  protected readonly logger: Logger;
  async validateSubjectUnitTopic(instancekey: string, newQuestion: any): Promise<void> {
    try {
      await this.validateSubject(instancekey, newQuestion);
      await this.validateUnit(instancekey, newQuestion);
      await this.validateTopic(instancekey, newQuestion);
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  private async validateSubject(instancekey: string, newQuestion: any): Promise<void> {
    try {
      if (!newQuestion.subject) {
        return;
      }
      this.subjectRepository.setInstanceKey(instancekey);
      const subject = await this.subjectRepository.findOne({
        _id: new Types.ObjectId(newQuestion.subject._id),
        $or: [{ active: { $exists: false } }, { active: true }],
      });

      if (!subject) {
        throw {
          params: 'subject',
          message: `Subject '${newQuestion.subject.name}' is inactive. Please select another subject.`,
        };
      }

      newQuestion.subject = {
        _id: subject._id,
        name: subject.name,
      };
    } catch (error) {
      throw error;
    }
  }

  private async validateUnit(instancekey: string, newQuestion: any): Promise<void> {
    try {
      this.unitRepository.setInstanceKey(instancekey);
      const findUnit = await this.unitRepository
        .findOne({
          _id: new Types.ObjectId(newQuestion.unit._id),
          $or: [{ active: { $exists: false } }, { active: true }],
        })
      const unit: any = await this.unitRepository.populate(findUnit, 'subject');

      if (!unit) {
        throw {
          params: 'unit',
          message: `Unit '${newQuestion.unit.name}' is inactive. Please select another unit.`,
        };
      }

      if (!newQuestion.subject && unit.subject) {
        newQuestion.subject = {
          _id: unit.subject._id,
          name: unit.subject.name,
        };
      }

      newQuestion.unit = {
        _id: unit._id,
        name: unit.name,
      };
    } catch (error) {
      throw error;
    }
  }

  private async validateTopic(instancekey: string, newQuestion: any): Promise<void> {
    try {
      this.topicRepository.setInstanceKey(instancekey);
      const topic = await this.topicRepository.findOne({
        _id: new Types.ObjectId(newQuestion.topic._id),
        $or: [{ active: { $exists: false } }, { active: true }],
      });

      if (!topic) {
        throw {
          params: 'topic',
          message: `Topic '${newQuestion.topic.name}' is inactive. Please select another topic.`,
        };
      }

      newQuestion.topic = {
        _id: topic._id,
        name: topic.name,
      };
    } catch (error) {
      throw error;
    }
  }
  // create question
  async createQuestion(createQuestionRequest: CreateQuestionRequest) {
    try {
      let practice: any = null;
      if (createQuestionRequest.practiceSets && createQuestionRequest.practiceSets[0]) {

        //find practice set
        this.practiceSetRepository.setInstanceKey(createQuestionRequest.instancekey)
        practice = await this.practiceSetRepository.findById(new ObjectId(createQuestionRequest.practiceSets[0]))

        if (!practice) {
          throw new NotFoundException('Practice set not found');
        }
      }
      const user = createQuestionRequest.userData;
      const instancekey = createQuestionRequest.instancekey;
      delete createQuestionRequest.instancekey;
      delete createQuestionRequest.userData;

      let data: any = createQuestionRequest;
      data.user = new Types.ObjectId(user._id);
      try {
        await this.validateSubjectUnitTopic(instancekey, data);
      } catch (error) {
        Logger.error(error);
        throw new BadRequestException(error.message)
      }

      let question: any;
      try {
        question = await this.questionRepository.create(data);
      } catch (error) {
        Logger.error(error);
        throw new InternalServerErrorException("Unable to create question");
      }

      // In case student make this question, we set default value for it
      if (user.roles.includes(config.roles.student)) {
        question.approveStatus = 'pending';
        question.isActive = false;
      }

      // Add default value for partialMakr
      if (question.category == 'mcq' && question.questionType == 'multiple' && question.partialMark) {
        question.plusMark = 4;
        question.minusMark = -2;

        question.answers.forEach(function (a) {
          if (a.isCorrectAnswer) {
            a.marks = 1;
          } else {
            a.marks = 0;
          }
        })
      }

      // createdBy is not in schema 
      // question.createdBy = req.user._id
      // question has userRole as string
      question.userRole = user.roles[0]

      if (roleHelper.canOnlySeeLocationContents([user.roles])) {
        question.locations = [new Types.ObjectId(user.activeLocation)];
      }

      let savedQuestion: any;
      try {
        const questionId = question._id;
        this.questionRepository.setInstanceKey(instancekey)
        delete question._id
        savedQuestion = await this.questionRepository.findByIdAndUpdate(questionId, question);
      } catch (error) {
        // this.logger.error(error.message);
        Logger.error(error);
        throw new InternalServerErrorException("Unable to update the created question");
      }

      await this.questionBus.addTags(instancekey, user._id, question)

      if (practice != null) {

        var q: any = {
          question: savedQuestion._id,
          createdAt: Date.now()
        }
        if (data.section) {
          q.section = data.section
        } else {
          q.section = savedQuestion.subject.name
        }

        // Init question order if it is not exist
        if (practice.questions.length > 0 && !practice.questions[0].order) {
          practice.questions.forEach((cq, idx) => cq.order = idx + 1)
        }

        q.order = practice.questions.length + 1

        practice.questions.push(q)

        practice.totalQuestion = practice.questions.length

        await this.rebuildPracticeSection(instancekey, practice)

        return { ...savedQuestion };
      } else {
        return { ...savedQuestion };
      }
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message)
      } else if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message)
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async rebuildPracticeSection(instancekey: string, test: any) {
    if (test.enableSection) {
      let allQuestionSections = {}
      let qids = test.questions.map(q => q.question);
      this.questionRepository.setInstanceKey(instancekey);
      let questions = await this.questionRepository.find({ _id: { $in: qids } }, { unit: 1 })
      test.questions.forEach(function (q) {
        if (q.section) {
          let dataIdx = questions.findIndex(qd => qd._id.equals(q.question))
          if (!allQuestionSections[q.section]) {
            allQuestionSections[q.section] = {
              name: q.section,
              showCalculator: false,
              time: 5,
              units: [questions[dataIdx].unit]
            };
          } else if (allQuestionSections[q.section].units.findIndex(s => s._id.equals(questions[dataIdx].unit._id)) == -1) {
            allQuestionSections[q.section].units.push(questions[dataIdx].unit);
          }
        }
      })

      test.sections.forEach(s => {
        if (allQuestionSections[s.name]) {
          allQuestionSections[s.name]._id = s._id;
          allQuestionSections[s.name].showCalculator = s.showCalculator
          allQuestionSections[s.name].time = s.time
          allQuestionSections[s.name].optionalQuestions = s.optionalQuestions
        }
      })
      test.sections = []
      for (let s in allQuestionSections) {
        test.sections.push(allQuestionSections[s])
      }
    }
    console.log(test);
    try {
      const updatedTest = await this.practiceSetRepository.findByIdAndUpdate(test._id, test);
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Unable to update practice set');
    }
  }
  async getQuestions(request: GetAllQuestionRequest) {
    var filter = {}
    var page = (request.page) ? request.page : 1
    var limit = (request.limit) ? request.limit : 20
    var skip = (page - 1) * limit

    if (request.subject) {
      filter['subject._id'] = new Types.ObjectId(request.subject)
    }
    let sort: any = { createdAt: -1 };

    if (request.sort) {
      const [field, order] = request.sort.split(',');
      sort = { [field]: order === 'ascending' ? 1 : -1 };
    }
    var questions: any;
    try {
      const questionsFind: any = await this.questionRepository.find(filter, null, { sort, skip, limit });
      questions = await this.questionRepository.populate(questionsFind, 'topic._id');
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Error finding Question')
    }

    return {
      response: (questions.map(question => {
        return {
          _id: question._id,
          answerExplain: question.answerExplain,
          answerNumber: question.answerNumber,
          complexity: question.complexity,
          createdAt: question.createdAt,
          minusMark: question.minusMark,
          plusMark: question.plusMark,
          practiceSets: question.practiceSets,
          questionHeader: question.questionHeader,
          questionText: question.questionText,
          questionTextArray: question.questionTextArray,
          questionType: question.questionType,
          unit: question.unit,
          topic: question.topic,
          updatedAt: question.updatedAt,
          user: question.user,
          isAllowReuse: question.isAllowReuse,
          answers: question.answers,
          coding: question.coding,
          wordLimit: question.wordLimit,
          tags: question.tags,
          hasUserInput: question.hasUserInput,
          userInputDescription: question.userInputDescription,
          hasArg: question.hasArg,
          argumentDescription: question.argumentDescription,
          approveStatus: question.approveStatus,
          alternativeExplanations: question.alternativeExplanations,
          partialMark: question.partialMark,
          testcases: question.testcases
        }
      }))
    }
  }

  // get all question 
  async getAllQuestion(request: GetAllQuestionRequest) {
    try {
      var page = (request.page) ? request.page : 1;
      var limit = (request.limit) ? request.limit : 20;
      var skip = (page - 1) * limit;
      if (request.practiceSet) {
        var sort: any = {
          'questions.createdAt': -1
        }
        if (request.sort) {
          if (request.sort.indexOf(';') > -1) {
            var sortArr = request.sort.split(';');

            sort = {}
            sortArr.forEach((si) => {
              var tmp: any = si.split(',');

              var order = tmp[1];
              if (isNaN(tmp[1])) {
                if (tmp[1] === 'asc' || tmp[1] === 'ascending') {
                  order = 1;
                } else {
                  order = -1;
                }
              }
              sort['questions.' + tmp[0]] = Number(order)
            })
          } else {
            var tmp: any = request.sort.split(',')
            sort = {}
            var order = tmp[1]
            if (isNaN(tmp[1])) {
              if (tmp[1] === 'asc' || tmp[1] === 'ascending') {
                order = 1
              } else {
                order = -1
              }
            }
            sort['questions.' + tmp[0]] = Number(order)
          }
        }

        var pipe = []
        pipe.push({
          $match: {
            '_id': new Types.ObjectId(request.practiceSet)
          }
        })
        pipe.push({
          $unwind: '$questions'
        })

        // Optimize the query
        if (request.subject) {
          // if query include subject, we need to lookup question first            
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
              'questionInfo.subject._id': new Types.ObjectId(request.subject)
            }
          })

          pipe.push({
            $sort: sort
          })
          pipe.push({
            $skip: skip
          })
          pipe.push({
            $limit: limit
          })
        } else {
          // If not, lookup later after limit and skip
          pipe.push({
            $sort: sort
          })
          //We must add  skip and limit after all match pipeline
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
        }

        if (request.keyword) {
          var regexText = {
            $regex: util.regex(request.keyword, 'i')
          }
          pipe.push({
            $match: {
              $or: [{
                'questionInfo.questionText': regexText
              },
              {
                'questionInfo.topic.name': regexText
              },
              {
                'questionInfo.unit.name': regexText
              }
              ]
            }
          })
        }

        pipe.push({
          $skip: skip
        })
        pipe.push({
          $limit: limit
        })
        pipe.push({
          $group: {
            '_id': '$_id',
            'questionList': {
              $push: {
                'question': '$questions',
                'detail': '$questionInfo',
                'answers': '$answers'
              }
            }
          }
        })
        var result: any;
        try {
          result = await this.practiceSetRepository.aggregate(pipe);
        } catch (error) {
          throw new InternalServerErrorException("Error finding Practice Set")
        }

        if (result == null || result.length === 0) {
          return { response: [] }
        }

        return {
          response: (result[0].questionList.map(item => {
            return {
              _id: item.detail._id,
              answerExplain: item.detail.answerExplain,
              answerNumber: item.detail.answerNumber,
              complexity: item.detail.complexity,
              minusMark: item.detail.minusMark,
              plusMark: item.detail.plusMark,
              practiceSets: item.detail.practiceSets,
              questionHeader: item.detail.questionHeader,
              questionText: item.detail.questionText,
              questionTextArray: item.detail.questionTextArray,
              questionType: item.detail.questionType,
              unit: item.detail.unit,
              topic: item.detail.topic,
              updatedAt: item.detail.updatedAt,
              user: item.detail.user,
              isAllowReuse: item.detail.isAllowReuse,
              category: item.detail.category,
              answers: item.detail.answers,
              coding: item.detail.coding,
              wordLimit: item.detail.wordLimit,
              hasUserInput: item.detail.hasUserInput,
              userInputDescription: item.detail.userInputDescription,
              hasArg: item.detail.hasArg,
              argumentDescription: item.detail.argumentDescription,
              approveStatus: item.detail.approveStatus,
              alternativeExplanations: item.detail.alternativeExplanations,
              testcases: item.detail.testcases,
              tags: item.detail.tags,
              section: item.question.section,
              createdAt: item.question.createdAt,
              order: item.question.order,
              partialMark: item.detail.partialMark
            }
          }))
        }
      } else {
        const result = await this.getQuestions(request);
        return result;
      }
    } catch (error) {
      console.error(error);
      throw new GrpcInternalException('Internal Server Error');
    }
  }

  // get question by-> id
  async getQuestion(request: GetQuestionRequest) {
    try {
      this.questionRepository.setInstanceKey(request.instancekey);
      const question: any = await this.questionRepository.findById(request._id);
      var result: any;
      if (!question) {
        throw new NotFoundException;
      }
      if (request.relatedTopic) {
        question.topicRelated = {}
        this.topicRepository.setInstanceKey(request.instancekey);
        try {
          result = await this.topicRepository.findById(question.topic._id);
        } catch (error) {
          return { ...question };
        }
        question.topicRelated = result;

        return { ...question };
      }
      return { ...question };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException('Question not found');
      }
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  private async checkAttemptedTest(instancekey: string, questionId: string): Promise<void> {
    try {
      this.attemptDetailRepository.setInstanceKey(instancekey);
      const result = await this.attemptDetailRepository.findOne({
        'QA.question': new Types.ObjectId(questionId)
      });
      if (result) {
        throw new UnprocessableEntityException('This question is part of a test which is already attempted by a student.');
      }
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  private async checkQuestionExists(instancekey: string, questionId: string) {
    try {
      this.questionRepository.setInstanceKey(instancekey);
      const question = await this.questionRepository.findOne({ _id: new Types.ObjectId(questionId) }, { __v: 0 });
      if (!question) {
        throw new NotFoundException('Cannot find this question');
      }
      return question;
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }

  // update question
  /* 
  TODO: markModified not working @ad
  */
  async updateQuestion(updateQuestionRequest: UpdateQuestionRequest) {
    try {
      const instancekey = updateQuestionRequest.instancekey;
      const qId = updateQuestionRequest._id;
      let data = _.omit(updateQuestionRequest, '_id', 'createdAt', 'updatedAt')

      await this.validateSubjectUnitTopic(instancekey, data);
      if (!config.allowEdit) {
        await this.checkAttemptedTest(instancekey, qId);
      }
      const question = await this.checkQuestionExists(instancekey, qId);

      if (question.questionTextArray.length > 0) {
        question.questionTextArray.forEach(function (questionText: string, index: number) {
          if (questionText == question.questionText) {
            question.questionTextArray[index] = data.questionText
          }
        })
      }
      var practices = data.practiceSets
      delete data.practiceSets

      // Remove image if it is removed from question before merge new data
      this.eventBus.emit('Question.Updated', {
        insKey: updateQuestionRequest.instancekey,
        uploadDir: getAssets(instancekey),
        oQuestion: _.pick(question, 'questionHeader', 'questionText', 'answers', 'answerExplain'),
        nQuestion: _.pick(data, 'questionHeader', 'questionText', 'answers', 'answerExplain')
      })

      var updatedQues = _.merge(question, data)

      // merge will not remove item in array, we have to do this manually
      if (data.coding && data.coding.length > 0) {
        for (let i = updatedQues.coding.length - 1; i >= 0; i--) {
          let coding = updatedQues.coding[i];
          let codingIndex = _.findIndex(data.coding, { language: coding.language })
          if (codingIndex == -1) {
            updatedQues.coding.splice(i, 1)
          }
        }
      }

      // Validate code question, in case it is added to a test or package which has incompatible enabled code langs
      if (updatedQues.category == 'code') {
        let tests = await this.practiceSetRepository.find({ 'questions.question': updatedQues._id }, { title: 1, enabledCodeLang: 1 });

        for (let tidx = 0; tidx < tests.length; tidx++) {
          let t = tests[tidx]
          let valid = true;
          if (t.enabledCodeLang && t.enabledCodeLang.length) {
            let newCodelang = [...t.enabledCodeLang]
            for (let c of updatedQues.coding) {
              if (newCodelang.indexOf(c.language) == -1) {
                newCodelang.push(c.language)
              }
            }
            if (newCodelang.length != t.enabledCodeLang) {
              await this.practiceSetRepository.updateOne({ _id: t._id }, { $set: { enabledCodeLang: newCodelang } })
            }
            // if (!valid) {
            // let invalidTestName = t.title

            // return res.status(400).json({ message: 'The question belongs to the test "' + invalidTestName + '" which has incompatible "ENABLED CODE LANGUAGES" setting' })
            // }
          }

          // Check package next
          if (valid) {
            this.testSeriesRepository.setInstanceKey(instancekey)
            let pacs = await this.testSeriesRepository.find({ practiceIds: t._id }, { name: 1, enabledCodeLang: 1 })

            pacs.forEach(p => {
              if (p.enabledCodeLang && p.enabledCodeLang.length) {
                valid = updatedQues.coding.some(c => {
                  return { response: p.enabledCodeLang.indexOf(c.language) > -1 };
                })

                if (!valid) {
                  throw new UnprocessableEntityException('The question belongs to the test "' + t.title + '" in Test Series "' + p.name + '" which has incompatible "ENABLED CODE LANGUAGES" setting')
                }
              }
            })
          }
        }
      }

      updatedQues.questionTextArray = data.questionTextArray;
      if (updatedQues.category == 'mcq' && (updatedQues.answers.length != updatedQues.answerNumber)) {
        updatedQues.answers.splice(updatedQues.answerNumber, updatedQues.answers.length - updatedQues.answerNumber)
      }

      // Save question detail
      // global.dbInsts[req.headers.instancekey].Question.findByIdAndUpdate({ _id: req.params.id }, updatedQues, function(err, newQuestion) {
      // call findByIdAndUpdate will not trigger pre/post save hook in model

      // Check and set default value for partialMark question
      if (updatedQues.category == 'mcq' && updatedQues.questionType == 'multiple' && updatedQues.partialMark) {
        updatedQues.plusMark = 4;
        updatedQues.minusMark = -2;

        updatedQues.answers.forEach(function (a) {
          if (a.isCorrectAnswer) {
            a.marks = 1
          } else {
            a.marks = 0
          }
        })
      }
      updatedQues.lastModifiedBy = new ObjectId(updateQuestionRequest.userId)
      updatedQues.tags = data.tags
      // @ad markmodified not working
      // updatedQues.markModified('tags')
      if (data.audioFiles) {
        updatedQues.audioFiles = [];

        for (let file of data.audioFiles) {
          updatedQues.audioFiles.push(file)
        }
      }
      if (data.answerExplainAudioFiles) {
        updatedQues.answerExplainAudioFiles = [];

        for (let file of data.answerExplainAudioFiles) {
          updatedQues.answerExplainAudioFiles.push(file)
        }
      }

      if (updatedQues.category === 'mcq') {
        updatedQues.answers.forEach((a: any) => {
          const matchingAnswer = data.answers.find((da: any) => da._id.toString() === a._id.toString());
          
          if (matchingAnswer && matchingAnswer.audioFiles) {
            a.audioFiles = [...matchingAnswer.audioFiles];
          }
        });
      }
      
      const newQuestion = await this.questionRepository.findByIdAndUpdate(qId, updatedQues);

      if (!updateQuestionRequest.notUpdatetag) {
        this.questionBus.addTags(instancekey, updateQuestionRequest.userId, updatedQues)
      }

      // remove saved question
      const dataRedis = { instancekey: instancekey, params: { id: updateQuestionRequest._id } }
      this.redisCache.del(dataRedis, 'onlineTestQuestion_' + updatedQues._id.toString())

      if (practices) {
        // Update question info related to this practiceSet
        this.practiceSetRepository.setInstanceKey(instancekey);
        const tests = await this.practiceSetRepository.find({ _id: { $in: practices } });

        if (!tests || !tests.length) {
          return {};
        }

        tests.forEach(async test => {
          var dataRedis = { instancekey: instancekey, params: { id: updateQuestionRequest._id } };
          if (test.status == 'published') {
            dataRedis = { instancekey: instancekey, params: { id: test._id } };
            this.redisCache.del(dataRedis, 'findOneWithQuestionsAccessMode')
            this.redisCache.del(dataRedis, 'findOneWithQuestionsAccessMode_meta')
          }
          if (data.section) {
            var idx = _.findIndex(test.questions, {
              question: updatedQues._id
            })
            if (idx > -1) {
              var question = test.questions[idx]
              question.section = data.section
              await this.rebuildPracticeSection(instancekey, test)
            }
          }
          await this.practiceSetRepository.findByIdAndUpdate(test._id, test);
        })
      }
      return { ...updatedQues }
    } catch (error) {
      Logger.error(error);
      if(error instanceof UnprocessableEntityException){
        throw new GrpcInternalException(error.getResponse());
      }
      throw new GrpcInternalException(error);
    }
  }

  /*
  * delete question
  * restriction: 'teacher'
 */
  async deleteQuestion(deleteQuestionRequest: DeleteQuestionRequest) {
    try {
      let removed: any;
      const id = new Types.ObjectId(deleteQuestionRequest._id);
      // Define query to find the question
      const query = {
        _id: id,
        user: deleteQuestionRequest.userId, // Assuming req.user contains the user object
      };

      // Allow admin to delete questions of other users
      if (deleteQuestionRequest.userRoles.includes(config.roles.admin)) {
        delete query.user;
      }
      // Find the question
      const question = await this.questionRepository.findOne(query);

      if (!question) {
        throw new BadRequestException;
      }

      // Check if the question is used in any non-draft or non-tempt test
      const result = await this.practiceSetRepository.findOne({
        status: { $nin: ['draft', 'tempt'] },
        'questions.question': id,
      });

      if (result) {
        // If yes, set isActive to false
        await this.questionRepository.findByIdAndUpdate(question._id, { isActive: false });
        return { response: question }
      } else {
        // Check if the question is in any attempted test
        const found = await this.attemptDetailRepository.findOne({ 'QA.question': id });

        if (found) {
          // If the question is attempted, only disable it
          const updated = await this.questionRepository.findOneAndUpdate({ _id: id }, { $set: { isActive: false } });
          // Remove ref of this question from any draft or tempt tests.
          await this.practiceSetRepository.updateMany({
            'status': {
              $in: ['draft', 'tempt']
            },
            'questions.question': id
          }, {
            $pull: {
              questions: {
                question: id
              }
            },
            $inc: {
              totalQuestion: -1
            }
          })

          return { response: updated };
        } else {
          // If the question is not attempted, remove it
          this.eventBus.emit('Question.Updated', {
            insKey: deleteQuestionRequest.instancekey,
            uploadDir: getAssets(deleteQuestionRequest.instancekey),
            oQuestion: _.pick(question, 'questionHeader', 'questionText', 'answers', 'answerExplain'),
          });
          removed = await this.questionRepository.findByIdAndDelete(question._id);

        }

        // Remove references of the question from any draft or tempt tests
        await this.practiceSetRepository.updateMany(
          { status: { $in: ['draft', 'tempt'] }, 'questions.question': id },
          { $pull: { questions: { question: id } }, $inc: { totalQuestion: -1 } }
        );

        return { response: removed };
      }
    } catch (error) {
      Logger.error(error);
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException('Bad Request')
      }
      throw new GrpcInternalException(error);
    }
  }


  // update question approve status
  /*
  TODO: DB Query optimization
  */
  async updateStudentQuestion(request: UpdateStudentQuestionRequest) {
    try {
      if (request.status !== 'approved' && request.status !== 'rejected') {
        throw new ForbiddenException({ statusCode: 209, message: 'Invalid status' });
      }

      const question = await this.questionRepository.findOne({ _id: request._id });

      if (question.approveStatus !== 'pending') {
        throw new ForbiddenException({ message: 'Can only change the status of a pending question' });
      }
      const res = await this.questionRepository.findByIdAndUpdate(request._id, { $set: { approveStatus: request.status, isActive: request.status === 'approved' } });
      // question.approveStatus = request.status;
      // question.isActive = request.status === 'approved';

      // await question.save();

      return { response: res };
    } catch (error) {
      Logger.error(error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({ message: 'Failed to save the question' });
    }
  }

  // Create explanation by student
  /* 
  * * Populate was used in previous code but not used here!
  TODO: DB Query optimization
  */
  async createExplanation(request: CreateExplanationRequest) {
    if (!request.explanation || !request.testId || !request.testTitle) {
      throw new BadRequestException({ message: 'Required parameters not provided' });
    }

    try {
      const questionId = new ObjectId(request._id);
      const question = await this.questionRepository.findOne(questionId);
      // .populate('user', '-salt -hashedPassword'); 

      const alternativeExplanations = (!question.alternativeExplanations) ? [] : question.alternativeExplanations;
      alternativeExplanations.push({
        user: {
          _id: new ObjectId(request.user._id),
          name: request.user.name,
        },
        explanation: request.explanation,
        isApproved: false,
      });

      // await question.save();

      const res = await this.questionRepository.findByIdAndUpdate(request._id, { $set: { alternativeExplanations: alternativeExplanations } });

      /* redisCache.getSetting(req, function (settings) {
        // Send email to teacher
        let file = 'student-explanation-update'
        let tmp = {
          studentName: req.user.name,
          testTitle: req.body.testTitle,
          testDetailUrl: settings.baseUrl + 'tests/' + slug(req.body.testTitle, {
            lower: true
          }) + '?id=' + req.body.testId + '&tab=questionList',
          questionText: question.questionText,
          studentExplanation: req.body.explanation,
          subject: 'Student alternative explanation submitted'
        }
   
        let dataMsg = {
          receiver: question.user._id,
          modelId: 'studentExplanation'
        }
   
        if (question.user.email) {
          dataMsg.to = question.user.email;
          dataMsg.isScheduled = true;
        }
   
        MessageCenter.sendWithTemplate(req, file, tmp, dataMsg)
      }) */

      return { response: res };

    } catch (error) {
      Logger.error(error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({ message: 'Failed to save the question' });
    }
  }

  async approveStudentExplanation(request: ApproveStudentExplanationRequest) {
    if (!request.explanations || request.explanations.length === 0) {
      throw new BadRequestException();
    }

    try {
      const questionId = new ObjectId(request._id);
      const question = await this.questionRepository.findOne(questionId);

      if (!question.alternativeExplanations) {
        throw new NotFoundException('Can not find the explanation');
      }
      const alternativeExplanations = question.alternativeExplanations;

      for (const reqExplanation of request.explanations) {
        const eIdx = question.alternativeExplanations.findIndex(
          (e) => e._id.toString() === reqExplanation._id,
        );

        if (eIdx === -1) {
          throw new NotFoundException('Can not find the explanation');
        } else {
          const res = await this.questionRepository.findOneAndUpdate(
            { _id: request._id, 'alternativeExplanations._id': alternativeExplanations[eIdx]._id },
            { $set: { 'alternativeExplanations.$.isApproved': reqExplanation.isApproved } }
          );
          question.alternativeExplanations[eIdx].isApproved = reqExplanation.isApproved;
        }
      }

      return { message: "success" };
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({ message: 'Failed to save the question' });
    }
  }

  /* 
  TODO: Needs debugging
   */
  async questionDistributionByCategory(request: { _id: string }) {
    try {
      if (!request._id) {
        throw new Error('Test ID is required');
      }

      const qIds = await this.practiceSetRepository.distinct(
        'questions.question',
        { _id: new ObjectId(request._id) }
      );

      const result = await this.questionRepository.aggregate([
        { $match: { _id: { $in: qIds } } },
        { $group: { _id: { "category": "$category", "marks": "$plusMark" }, category: { $first: "$category" }, count: { $sum: 1 } } }
        , { $group: { _id: "$category", questions: { $push: { marks: "$_id.marks", category: "$category", count: "$count" } }, count: { $sum: "$count" } } }
        , { $project: { category: "$_id", count: 1, questions: 1, _id: 0 } }
      ]);

      return { response: result };
    } catch (error) {
      throw new Error(`Error while fetching question distribution: ${error.message}`);
    }
  }

  async questionDistributionByMarks(request: { _id: string }) {
    try {
      if (!request._id) {
        throw new Error('Test ID is required');
      }

      const qIds = await this.practiceSetRepository.distinct(
        'questions.question',
        { _id: new ObjectId(request._id) }
      );

      const result = await this.questionRepository.aggregate([
        { $match: { _id: { $in: qIds } } },
        {
          $group: {
            _id: {
              plusMark: "$plusMark",
              minusMark: "$minusMark",
              category: "$category"
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            category: "$_id.category",
            minusMark: "$_id.minusMark",
            plusMark: "$_id.plusMark"
          }
        }
      ]);

      return { response: result };
    } catch (error) {
      throw new Error(`Error while fetching question distribution: ${error.message}`);
    }
  }

  async practiceSummaryBySubject(request: { practice: string }) {
    const pipe = [];
    const match: any = {};

    if (ObjectId.isValid(request.practice)) {
      match.$match = {
        _id: new ObjectId(request.practice)
      }
    } else {
      match.$match = {
        testCode: regexCode(request.practice)
      }
    }
    pipe.push(match);

    pipe.push({ $unwind: '$questions' });
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
      $group: {
        _id: '$questionInfo.topic._id',
        name: {
          $first: '$questionInfo.topic.name'
        },
        subject: {
          $first: '$questionInfo.subject'
        },
        count: {
          $sum: 1
        }

      }
    })

    pipe.push({
      $group: {
        _id: '$subject._id',
        name: {
          $first: '$subject.name'
        },
        topics: {
          $push: { name: "$name", count: "$count", _id: "$_id" }
        },
        count: {
          $sum: "$count"
        }
      }
    })

    pipe.push({ $sort: { count: -1 } });

    try {
      const units = await this.practiceSetRepository.aggregate(pipe);

      return { response: units };
    } catch (err) {
      throw new GrpcInternalException(`Error while fetching practice summary: ${err.message}`);
    }
  }

  async getByPractice(request) {
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey);     
      const test = await this.practiceSetRepository.findOne({ _id: request.practiceId }, 'questions');

      if (!test) {
        throw new NotFoundException("Practice not found.");
      }

      const questions = await this.questionRepository.find({ _id: { $in: test.questions.map((q: any) => q.question) } });

      for (const q of questions) {
        for (const ts of test.questions as any) {
          if (q._id.equals(ts.question)) {
            (q as QuestionWithSectionOrder).section = ts.section;
            (q as QuestionWithSectionOrder).order = ts.order;
            (q as QuestionWithSectionOrder).canEdit = false;
            break;
          }
        }
      }
      questions.sort((q1: QuestionWithSectionOrder, q2: QuestionWithSectionOrder) => q1.order - q2.order);

      return { response: questions };
    } catch (error) {
      console.log(error);
      if(error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message)
      }      
      throw new GrpcInternalException('Internal Server Error');
    }
  }

  async questionUsedCount() {
    try {
      const result = await this.practiceSetRepository.aggregate([
        {
          $unwind: '$questions'
        },
        {
          $group: {
            _id: '$questions.question',
            totalPracticesetCount: { $sum: 1 },
            details: { $push: { subjectName: '$subjects.name', testId: '$_id', testName: '$title' } }
          }
        },
        {
          $project: {
            qId: '$_id',
            totalPracticesetCount: 1,
            details: 1
          }
        }
      ]);

      return { response: result };
    } catch (error) {
      throw new GrpcInternalException('Internal Server Error');
    }
  }

  /*
  TODO: config.allowEdit required 
  * * Coverted null to empty object - not in old logic
  */
  async questionIsAttempt(request: QuestionIsAttemptRequest) {
    // if (config.allowEdit) {
    //   return res.status(200).json(null);
    // } else {
    try {
      this.attemptDetailRepository.setInstanceKey(request.instancekey);
      const attemptDetail = await this.attemptDetailRepository.findOne({ 'QA.question': request.id });

      // handling null cases of QA field - proto doesn't allow null
      if (attemptDetail && attemptDetail.QA) {
        attemptDetail.QA = attemptDetail.QA.map(qa => qa ? qa : {});
      }
      const result = attemptDetail;

      //Uncomment if when we allowed to save attempted question
      // if (result) {
      //   this.practiceSetRepository.setInstanceKey(request.instancekey);
      //   const publishedPractice = await this.practiceSetRepository.findOne({ _id: result.practicesetId, status: 'published' });
      //   return {response: publishedPractice};
      // } else {

      return { response: result };
      // }
    } catch (err) {
      // Logger.warn('validationError %j', err)
      return new GrpcInternalException(err)
    }
    // }
  }

  // id: 5c1e277f40343a79fc2d5f2a
  async questionPerformance(request: QuestionPerformanceRequest) {
    if (!Types.ObjectId.isValid(request.id)) {
      throw new GrpcInvalidArgumentException('Invalid ID');
    }
    try {
      this.attemptDetailRepository.setInstanceKey(request.instancekey)
      const result: any = await this.attemptDetailRepository.aggregate([
        { $match: { isAbandoned: false, 'QA.question': new Types.ObjectId(request.id) } },
        { $sort: { 'createdAt': 1 } },
        { $group: { _id: '$user', QA: { $first: '$QA' } } },
        { $unwind: '$QA' },
        { $match: { 'QA.question': new Types.ObjectId(request.id), 'QA.status': { $in: [1, 2] } } },
        {
          $group: {
            _id: '$QA.status',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ], { allowDiskUse: true });


      if (result.length === 0) {
        return { percentCorrect: 0 };
      }

      if (result.length === 1) {
        return { percentCorrect: result[0]._id === 1 ? 100 : 0 };
      }

      return { percentCorrect: (result[0].count / (result[0].count + result[1].count) * 100) };
    } catch (error) {
      // Logger.warn('validationError %j', err);
      Logger.error(error);
      throw new GrpcInternalException(error);
    }
  }

  async getLast(request: GetLastRequest) {
    try {
      this.questionRepository.setInstanceKey(request.instancekey)
      const q = await this.questionRepository.find({ user: new Types.ObjectId(request.user) }, null, { sort: { createdAt: -1 }, limit: 1 });

      if (q.length === 0) {
        return { response: q }
        // res.sendStatus(204);
      } else {
        return { response: q[0] }
      }
    } catch (err) {
      // Logger.warn('validationError %j', err);
      Logger.error(err);
      throw new GrpcInternalException(err);
    }
  }

  async getLastInPractice(request: GetLastInPracticeRequest) {
    try {
      const date = new Date(request.preDate);
      const pipe: any = [
        { $match: { _id: new Types.ObjectId(request.practice) } },
        { $unwind: '$questions' }
      ];

      if (request.preDate) {
        pipe.push({
          $match: {
            'questions.createdAt': {
              $lt: date
            }
          }
        });
      }

      pipe.push(
        { $sort: { 'questions.createdAt': -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: 'questions',
            localField: 'questions.question',
            foreignField: '_id',
            as: 'questionInfo'
          }
        },
        { $unwind: '$questionInfo' },
        { $project: { 'questionInfo': 1, 'section': '$questions.section' } }
      );

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const result = await this.practiceSetRepository.aggregate(pipe);

      if (result.length === 0) {
        return { response: {} }; // or handle appropriately
      }

      return { response: result[0] };
    } catch (err) {
      Logger.error(err);
      throw new GrpcInternalException(err);
    }
  }

  async search(request: InternalSearchRequest) {
    try {
      let result = await this.internalSearch(request.instancekey, request.user, request.params)

      return { ...result }
    } catch (ex) {
      // Logger.exception(ex);
      Logger.error(ex);
      return new GrpcInternalException("Internal Exception");
    }
  }

  /* 
  TODO: populate not working
  */
  async internalSearch(ik: string, user: UserDto, params: InternalSearchDto) {

    let filter: any = {};

    if (!user.roles.includes('publisher')) {
      filter.locations = new ObjectId(user.activeLocation);
    }

    let qIds: ObjectId[] | null = null;

    if (params.level) {
      qIds = [];
      const practices = await this.practiceSetRepository
        .find({ "subject.level": params.level }, 'questions');

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
        {
          $match: {
            status: 'published',
          },
        },
        {
          $project: {
            questions: 1,
            _id: 0,
          },
        },
        {
          $unwind: '$questions',
        },
        {
          $project: {
            _id: '$questions.question',
          },
        },
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

      const p = await this.practiceSetRepository.findOne({
        user: new ObjectId(user._id),
        status: 'tempt',
      }, 'questions');

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
        "$exists": false,
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
        if (roleHelper.canReadContentsOfAllUsers([user.roles])) {
          filter.isAllowReuse = { $ne: 'none' };
        } else {
          filter.isAllowReuse = 'global';
        }
        filter.user = { $in: params.owners.map((o) => new ObjectId(o)) };
      } else {
        if (roleHelper.canReadContentsOfAllUsers([user.roles])) {
          filter.isAllowReuse = { $ne: 'none' };
        } else {
          filter.$and.push(
            {
              $or: [
                { isAllowReuse: 'global' },
                { isAllowReuse: 'self', user: new ObjectId(user._id) },
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
        } else {
          // in this case no filter mean we will search for all approval status
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
          $in: user.subjects.map((s) => new ObjectId(s)),
        };
      }
    }

    if (params.units && !params.topics) {
      // no need to convert it to objectId unless we use it in aggregation, it gonna crash server if the ObjectId conversion fail
      // One more thing, we also use this query some where else where we have comma separated list of units in the query
      filter['unit._id'] = {
        $in: params.units.map((t) => new ObjectId(t)),
      };
    }

    if (params.topics) {
      filter['topic._id'] = {
        $in: params.topics.map((t) => new ObjectId(t)),
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
        const total = await questionCursor.length;
        return {
          questions: toReturn,
          count: total,
        };
      } else {
        return {
          questions: toReturn,
        };
      }
    }
  }

  async countByPractice(request: CountByPracticeRequest) {
    try {
      const pipe: any = [
        {
          $match: {
            _id: new Types.ObjectId(request.practiceId),
          },
        },
        {
          $unwind: '$questions',
        },
        {
          $lookup: {
            from: 'questions',
            localField: 'questions.question',
            foreignField: '_id',
            as: 'questionInfo',
          },
        },
        {
          $unwind: '$questionInfo',
        },
      ];

      if (request.keyword) {

        const regexText = { $regex: new RegExp(request.keyword, 'i') };
        pipe.push({
          $match: {
            $or: [
              { 'questionInfo.questionText': regexText },
              { 'questionInfo.topic.name': regexText },
              { 'questionInfo.unit.name': regexText },
            ],
          },
        });
      }

      if (request.topics) {
        const topicIds = request.topics.split(',').map(topic => new Types.ObjectId(topic));
        pipe.push({
          $match: {
            'questionInfo.topic._id': { $in: topicIds },
          },
        });
      }

      pipe.push({
        $group: {
          _id: '$_id',
          count: { $sum: 1 },
        },
      });

      const result: any = await this.practiceSetRepository.aggregate(pipe);

      return { count: result.length === 0 ? 0 : result[0].count };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException('Internal Server error')
    }

  }

  async getQuestionTags(request: GetQuestionTagsResquest) {
    try {
      const res = await this.questionTagRepository.distinct('tag', null);
      return { tags: res };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException('Internal Server error')
    }
  }

  async updateTags(request: UpdateTagsRequest) {
    if (!request.questions || !request.questions.length || !request.tags) {
      throw new GrpcInvalidArgumentException("Missing Arguments");
    }
    try {
      const res = await this.questionRepository.updateMany({ _id: { $in: request.questions } }, { $addToSet: { tags: { $each: request.tags } }, $set: { lastModifiedBy: new Types.ObjectId(request.userId) } });
      return { result: true };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException('Internal Server Error')
    }
  }

  async questionSummaryTopic(request: QuestionSummaryTopicRequest) {
    try {
      var filter = {}
      if (request.id) {
        filter['unit._id'] = new Types.ObjectId(request.id)
      }
      if (request.isAllowReuse == 'true') {
        filter['$or'] = [{ isAllowReuse: 'global' }]
        if (request.userId) {
          filter['$or'].push({ $and: [{ isAllowReuse: 'self' }, { user: new Types.ObjectId(request.userId) }] })
        }
      }
      var match = {
        $match: filter
      }
      var group = {
        $group: {
          _id: '$topic._id',
          name: {
            '$first': '$topic.name'
          },
          unit: {
            '$first': '$unit._id'
          },
          count: {
            $sum: 1
          }
        }
      }
      var project = {
        $project: {
          _id: '$_id',
          name: '$name',
          count: '$count',
          unit: '$unit'
        }
      }
      var sort = {
        $sort: {
          'count': -1,
          'name': 1
        }
      }
      const res = await this.questionRepository.aggregate([match, group, project, sort]);

      return { response: res };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException('Internal Server Error');
    }
  }

  async getQuestionForOnlineTest(request: GetQuestionForOnlineTestRequest) {
    try {
      this.redisCache.get({ instancekey: request.instancekey }, 'onlineTestQuestion_' + request.id, function (savedQuestion: Question) {
        if (savedQuestion) {
          return { response: savedQuestion }
        }
      })

      this.questionRepository.setInstanceKey(request.instancekey)
      const question = await this.questionRepository.findById(request.id);
      if (!question) {
        throw new NotFoundException('Question Not Found!');
      }

      await this.questionBus.encryptQuestionAnswer(question, true)

      // store question for one day
      this.redisCache.set({ instancekey: request.instancekey }, 'onlineTestQuestion_' + request.id, question, 60 * 60 * 24);
      return { response: question };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async personalTopicAnalysis(request: PersonalTopicAnalysisRequest) {
    try {
      this.questionRepository.setInstanceKey(request.instancekey)
      let question = await this.questionRepository.findById(request.id);
      if (!question) {
        throw new NotFoundException('Question Not Found!')
      }
      this.attemptRepository.setInstanceKey(request.instancekey);
      let acc = await this.attemptRepository.aggregate(
        [
          { $match: { isAbandoned: false, user: new ObjectId(request.userId), "practiceSetInfo.subjects._id": question.subject._id, 'subjects.0.units.0': { $exists: true } } },
          { $sort: { createdAt: -1 } },
          {
            $group: { _id: { u: '$user', t: '$practicesetId' }, subjects: { $first: '$subjects' } }
          },
          { $unwind: '$subjects' },
          { $unwind: '$subjects.units' },
          { $unwind: '$subjects.units.topics' },
          { $match: { 'subjects.units.topics._id': question.topic._id } },
          {
            $group: {
              _id: '$subjects.units.topics._id',
              obtainMarks: { $sum: '$subjects.units.topics.mark' },
              maxMarks: { $sum: '$subjects.units.topics.maxMarks' },
              correct: { $sum: "$subjects.units.topics.correct" },
              incorrect: { $sum: "$subjects.units.topics.incorrect" }
            }
          },
          {
            $project: {
              _id: 1,
              correct: 1,
              incorrect: 1,
              accuracy: { $cond: [{ $eq: ['$maxMarks', 0] }, 0, { $floor: { '$multiply': [{ $divide: ['$obtainMarks', '$maxMarks'] }, 100] } }] }
            }
          }
        ])
      if (acc && acc[0]) {
        return acc[0];
      } else {
        throw new NotFoundException('Attempt Not Found!')
      }


    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async summaryTopicOfPractices(practiceIds: Types.ObjectId[], req: any) {
    var pipe = []
    pipe.push({
      $match: {
        _id: {
          $in: practiceIds
        }
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

    if (req.unit) {
      pipe.push({
        $match: {
          'questionInfo.unit._id': new Types.ObjectId(req.unit)
        }
      })
    }

    pipe.push({
      $group: {
        _id: '$questionInfo.topic._id',
        name: {
          $first: '$questionInfo.topic.name'
        },
        marks: {
          $sum: "$plusMark"
        },
        count: {
          $sum: 1
        },
        unit: {
          $first: '$questionInfo.unit._id'
        }
      }
    })

    pipe.push({
      $sort: {
        'count': -1,
        'name': 1
      }
    })

    const topics = await this.practiceSetRepository.aggregate(pipe);
    return topics;
  }

  async summaryTopicOfPracticeBySubject(request: SummaryTopicOfPracticeBySubjectRequest) {
    try {
      if (!request.practiceIds) {
        throw new BadRequestException('Practice Ids missing');
      }

      var practiceIds: any = request.practiceIds.split(',')
      if (practiceIds.length === 0) {
        throw new BadRequestException('Practice Ids missing');
      }

      practiceIds = practiceIds.map(pi => new Types.ObjectId(pi))
      const topics = await this.summaryTopicOfPractices(practiceIds, request)
      return { response: topics }
    } catch (error) {
      Logger.error(error);
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async summaryTopicPractice(request: SummaryTopicPracticeRequest) {
    try {
      this.redisCache.globalGet(request.instancekey + '_summaryTopicPractice_' + request.practice, (summary) => {
        if (summary) {
          return { response: summary }
        }
      })
      const topics = await this.summaryTopicOfPractices([new Types.ObjectId(request.practice)], request)

      this.redisCache.globalSet(request.instancekey + '_summaryTopicPractice_' + request.practice, topics)
      return { response: topics }

    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async summarySubjectPractice(request: SummarySubjectPracticeRequest) {
    try {
      var pipe = []
      var code = request.practice
      var match: any = {}

      if (Types.ObjectId.isValid(request.practice)) {
        match.$match = {
          _id: new Types.ObjectId(request.practice)
        }
      } else {
        match.$match = {
          testCode: regexCode(code)
        }
      }
      pipe.push(match)

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
        $group: {
          _id: '$questionInfo.unit._id',
          name: {
            $first: '$questionInfo.unit.name'
          },
          count: {
            $sum: 1
          },
          marks: {
            $sum: '$questionInfo.plusMark'
          }
        }
      })

      pipe.push({
        $sort: {
          'count': -1
        }
      })

      const units = await this.practiceSetRepository.aggregate(pipe);

      return { response: units };

    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async testSeriesSummaryBySubject(request: TestSeriesSummaryBySubjectRequest) {
    try {
      var pipe = []
      var practice = null;
      if (request.practice != null) {
        practice = _.compact(request.practice.split(','))
      }
      var match: any = {}
      var practicesetIds = [];

      if (practice && practice.length > 0) {
        practice.forEach(function (element) {
          practicesetIds.push(new Types.ObjectId(element))
        })
      }

      match.$match = {
        _id: { $in: practicesetIds }
      }
      pipe.push(match)

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
        $group: {
          _id: '$questionInfo.topic._id',
          name: {
            $first: '$questionInfo.topic.name'
          },
          subject: {
            $first: '$questionInfo.subject'
          },
          count: {
            $sum: 1
          }
        }
      })

      pipe.push({
        $group: {
          _id: '$subject._id',
          name: {
            $first: '$subject.name'
          },
          topics: {
            $push: { name: "$name", count: "$count", _id: "$_id" }
          },
          count: {
            $sum: "$count"
          }
        }
      })

      pipe.push({
        $sort: {
          'count': -1
        }
      })

      const units = await this.practiceSetRepository.aggregate(pipe);

      return { response: units };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async getByAttempt(request: GetByAttemptRequest) {
    try {
      var condition = {};
      var checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');

      if (request.attempt.length === 24 && checkForHexRegExp.test(request.attempt)) {
        condition['_id'] = request.attempt
      } else {
        condition['idOffline'] = request.attempt
      }

      this.attemptRepository.setInstanceKey(request.instancekey);
      var attemptObj = await this.attemptRepository.findOne(condition);
      attemptObj = await this.attemptRepository.populate(attemptObj, {
        path: 'attemptdetails',
        select: '-_id QA',
        options: { lean: true }
      })

      if (!attemptObj) {
        return { response: attemptObj }
      }

      if (attemptObj.attemptdetails) {
        attemptObj.QA = attemptObj.attemptdetails.QA
      }

      const questions = await this.questionBus.getQuestionsByAttempt(request, attemptObj);

      return { response: questions };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async getReusedCount(request: GetReusedCountRequest) {
    try {
      var query: any = {
        'questions.question': request.id
      }
      if (request.notAllowDelete) {
        query.status = {
          $nin: ['draft', 'tempt']
        }
      }
      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const result = await this.practiceSetRepository.countDocuments(query);
      return { count: result };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async feedbackQuestion(request: FeedbackQuestionRequest) {
    try {
      var condition: any = {}
      if (request.id) {
        condition._id = new Types.ObjectId(request.id)
      }

      var page = (request.page) ? request.page : 1
      var limit = (request.limit) ? request.limit : 20
      var skip = (page - 1) * limit
      var filter = {}
      if (request.keyword) {
        var regexText = {
          $regex: util.regex(request.keyword, 'i')
        }

        filter = {
          $or: [{
            'questionText': regexText
          },
          {
            'topic.name': regexText
          },
          {
            'unit.name': regexText
          }
          ]
        }
      }

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const fQ = await this.practiceSetRepository.aggregate([{
        $match: condition
      },
      {
        $project: {
          'questions': 1
        }
      },
      {
        $unwind: {
          path: '$questions',
          includeArrayIndex: 'index'
        }
      },
      {
        $lookup: {
          from: 'questionfeedbacks',
          localField: 'questions.question',
          foreignField: 'questionId',
          as: 'qF'
        }
      },
      {
        $project: {
          'feebackCount': {
            $size: '$qF'
          },
          'qId': '$questions.question',
          index: 1,
          order: '$questions.order',
        }
      },
      {
        $match: {
          'feebackCount': {
            $gt: 0
          }
        }
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'qId',
          foreignField: '_id',
          as: 'question'
        }
      },
      {
        $project: {
          'question': '$question',
          _id: 0,
          index: 1,
          order: 1
        }
      },
      {
        $unwind: '$question'
      },
      {
        $project: {
          '_id': '$question._id',
          index: 1,
          order: 1,
          'questionText': '$question.questionText',
          'questionHeader': '$question.questionHeader',
          'createdAt': '$question.createdAt',
          'topic': '$question.topic',
          'unit': '$question.unit',
          'questionType': '$question.questionType',
          'applyLastHeader': '$question.applyLastHeader'
        }
      },
      {
        $lookup: {
          from: 'questionfeedbacks',
          localField: '_id',
          foreignField: 'questionId',
          as: 'qFeed'
        }
      },
      {
        $unwind: "$qFeed"
      },
      //    {
      //        $unwind:"$qFeed.feedbacks"
      //    },
      {
        $lookup: {
          from: 'users',
          localField: 'qFeed.studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: "$student"
      },
      {
        $project: {
          '_id': 1,
          index: 1,
          order: 1,
          'questionText': 1,
          'questionHeader': 1,
          'createdAt': 1,
          'topic': 1,
          'unit': 1,
          'questionType': 1,
          'applyLastHeader': 1,
          "feedbacks": "$qFeed.feedbacks",
          "comment": "$qFeed.comment",
          "feedbackId": "$qFeed._id",
          "student": "$student.name",
          "studentId": "$student._id",
          "responded": "$qFeed.responded",
          "updatedAt": "$qFeed.updatedAt"
        }
      },
      {
        '$group': {
          '_id': { questionId: '$_id' },
          'feedback': {
            '$push': {
              'comment': '$comment', 'feedbackComments': '$feedbacks', "responded": "$responded", 'studentId': "$studentId", "studentName": "$student",
              'updatedAt': "$updatedAt", 'feedbackId': "$feedbackId"
            }
          },
          'index': { $first: "$index" },
          'order': { $first: "$order" },
          'questionText': { $first: "$questionText" },
          'questionHeader': { $first: "$questionHeader" },
          'createdAt': { $first: "$createdAt" },
          'topic': { $first: "$topic" },
          'unit': { $first: "$unit" },
          'questionType': { $first: "$questionType" },
          'applyLastHeader': { $first: "$applyLastHeader" },
        }
      },
      {
        '$project': {
          '_id': '$_id',
          'feedback': 1,
          'updatedAt': 1,
          'index': 1,
          'order': 1,
          'questionText': 1,
          'questionHeader': 1,
          'createdAt': 1,
          'topic': 1,
          'unit': 1,
          'questionType': 1,
          'applyLastHeader': 1,
        }
      },
      {
        $match: filter
      },
      {
        $sort: {
          'updatedAt': -1
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
      ]);

      return { response: fQ };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async feedbackQuestionCount(request: FeedbackQuestionCountRequest) {
    var condition: any = {}
    if (request.id) {
      condition._id = new Types.ObjectId(request.id)
    }
    this.practiceSetRepository.setInstanceKey(request.instancekey);
    const fQCount = await this.practiceSetRepository.aggregate([{
      $match: condition
    },
    {
      $project: {
        'questions': 1
      }
    },
    {
      $unwind: '$questions'
    },
    {
      $lookup: {
        from: 'questionfeedbacks',
        localField: 'questions.question',
        foreignField: 'questionId',
        as: 'qF'
      }
    },
    {
      $project: {
        'feebackCount': {
          $size: '$qF'
        },
        'qId': '$questions.question'
      }
    },
    {
      $match: {
        'feebackCount': {
          $gt: 0
        }
      }
    }
    ]);

    return { count: fQCount.length };
  }

  async questionDistribution(request: QuestionDistributionRequest) {
    try {
      const result = await this.redisCache.getSetting({ instancekey: request.instancekey }, async (settings: any) => {
        var condition: any = {};
        if (request.myquestion) {
          condition.isAllowReuse = { $ne: 'none' }
          condition.user = new Types.ObjectId(request.user._id)
        } else {
          let teacherIds = [];
          let cond: any = {
            role: { $ne: 'student' }
          };

          if (request.user && request.user.locations) {
            const locationIds = request.user.locations.map(id => new Types.ObjectId(id));
            cond.locations = { $in: locationIds };
          }

          if (request.owners) {
            let Ids = request.owners.split(',');
            cond._id = {
              $in: Ids
            }
          }

          if (request.user.roles.includes(config.roles.centerHead) || (request.user.roles.includes(config.roles.admin) && request.owners)) {
            if (request.user.locations.length > 0) {
              teacherIds = await this.usersRepository.distinct('_id', cond)
            }
          }
          if (request.pendingReview) {
            condition["moderation.moderatedBy"] = {
              "$exists": false
            }
          }
          if (request.user.roles.includes(config.roles.centerHead)) {
            if (!condition["$and"]) {
              condition["$and"] = []
            }

            condition["$and"].push({ $or: [{ $and: [{ isAllowReuse: 'global' }, { user: { $in: teacherIds } }] }, { $and: [{ isAllowReuse: 'self' }, { user: new ObjectId(request.user._id) }] }] })
          } else if (request.user.roles.includes(config.roles.teacher)) {
            if (!condition["$and"]) {
              condition["$and"] = []
            }

            condition["$and"].push({ $or: [{ $and: [{ isAllowReuse: 'global' }, { user: { $in: teacherIds } }] }, { $and: [{ isAllowReuse: 'self' }, { user: new ObjectId(request.user._id) }] }] })

          } else {
            condition.isAllowReuse = { $ne: 'none' }
          }
        }

        if (request.grade) {
          condition['subject._id'] = new Types.ObjectId(request.subject)
        } else {
          if (request.user) {
            const subjectIds = request.user.subjects.map(id => new Types.ObjectId(id));
            condition['subject._id'] = { $in: subjectIds };
          }
        }
        if (request.units) {
          condition['unit._id'] = new Types.ObjectId(request.units)
        }
        if (request.complexity) {
          condition.complexity = request.complexity
        }

        if (request.isActive) {
          condition.isActive = true
        } else {
          condition.isActive = false
        }
        if (request.tags) {

          let tags = [];

          request.tags.split(',').forEach((t) => {
            // tags.push(
            //     new RegExp(t, "i")
            // )
            tags.push(t)
            tags.push(t.toLowerCase())
          })

          condition.tags = {
            $in: tags
          }
        }
        if (request.keyword) {
          if (!condition["$and"]) {
            condition["$and"] = []
          }
          var regexText = {
            $regex: util.regex(request.keyword, 'i')
          }
          condition["$and"].push({
            $or: [{
              'questionText': regexText
            },
            {
              'topic.name': regexText
            },
            {
              'unit.name': regexText
            }
            ]
          })
        }

        var ids = [];
        // waterfall removed
        if (request.unusedOnly) {
          this.practiceSetRepository.setInstanceKey(request.instancekey);
          const qIds: any = await this.practiceSetRepository.aggregate([{
            $match: {
              status: 'published'
            }
          },
          {
            $project: {
              questions: 1,
              _id: 0
            }
          },
          {
            $unwind: '$questions'
          },
          {
            $project: {
              _id: '$questions.question'
            }
          }
          ])
          if (qIds && qIds.length > 0) {
            for (var i = 0; i < qIds.length; i++) {
              ids.push(qIds[i]._id)
            }
            condition._id = {
              $nin: ids
            }
          }
        }

        // Update filter. notInTest will contain test id
        if (request.notInTest) {
          this.practiceSetRepository.setInstanceKey(request.instancekey);
          const p = await this.practiceSetRepository.findById(new Types.ObjectId(request.notInTest), { 'questions': 1 })

          if (p.questions && p.questions.length > 0) {
            for (var i = 0; i < p.questions.length; i++) {
              ids.push(p.questions[i].question)
            }
            condition._id = {
              $nin: ids
            }
          }
        } else if (request.excludeTempt) {
          this.practiceSetRepository.setInstanceKey(request.instancekey);
          const result = await this.practiceSetRepository.find({
            user: new Types.ObjectId(request.user._id),
            status: 'tempt'
          }, { 'questions': 1 });

          var p = result[0]

          if (p && p.questions && p.questions.length > 0) {
            for (var i = 0; i < p.questions.length; i++) {
              ids.push(p.questions[i].question)
            }
            condition._id = {
              $nin: ids
            }
          }
        }

        this.questionRepository.setInstanceKey(request.instancekey);
        const result = await this.questionRepository.aggregate(
          [{
            '$match': condition
          },
          {
            '$project': {
              'unit': 1,
              'group': {
                'name': '$unit.name',
                '_id': '$unit._id'
              }
            }
          },
          {
            '$group': {
              '_id': '$group',
              'count': {
                '$sum': 1
              },
              'unit': {
                $first: '$unit'
              }
            }
          },
          {
            '$sort': {
              '_id': 1
            }
          },
          {
            '$project': {
              '_id': '$_id._id',
              'count': true,
              'name': '$_id.name',
              unit: 1
            }
          },
          {
            '$project': {
              '_id': 1,
              'count': 1,
              'name': {
                $concat: [{
                  $substr: ['$unit.name', 0, 3]
                }, ' - ', '$name']
              }
            }
          },
          {
            '$sort': {
              'name': 1
            }
          }
          ]);
        return result;
      })
      return { response: result };
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async questionComplexityByTopic(request: QuestionComplexityByTopicRequest) {
    try {
      const results = await this.redisCache.getSetting({ instancekey: request.instancekey }, async (settings) => {
        var filter: any = {}
        let condition: any

        if (request.myquestion) {
          filter.isAllowReuse = { $ne: 'none' }
          filter.user = new ObjectId(request.user._id)
        } else {
          let teacherIds = [];
          if (request.user && request.user.locations) {
            const locationIds = request.user.locations.map(id => new Types.ObjectId(id));

            condition = {
              locations: {
                $in: locationIds,

              },
              role: { $ne: 'student' }
            }
          }
          if (request.owners) {
            let Ids = request.owners.split(',');
            condition._id = {
              $in: Ids
            }
          }

          if (request.user.roles.includes(config.roles.centerHead) || (request.user.roles.includes(config.roles.admin) && request.owners)) {
            if (request.user.locations.length > 0) {
              this.usersRepository.setInstanceKey(request.instancekey);
              teacherIds = await this.usersRepository.distinct('_id', condition)
            }
          }
          if (request.pendingReview) {
            filter["moderation.moderatedBy"] = {
              "$exists": false
            }
          }

          if (request.user.roles.includes(config.roles.centerHead)) {
            if (!filter["$and"]) {
              filter["$and"] = []
            }

            filter["$and"].push({ $or: [{ $and: [{ isAllowReuse: 'global' }, { user: { $in: teacherIds } }] }, { $and: [{ isAllowReuse: 'self' }, { user: new ObjectId(request.user._id) }] }] })
          } else if (request.user.roles.includes(config.roles.teacher)) {

            if (!filter["$and"]) {
              filter["$and"] = []
            }
            filter["$and"].push({ $or: [{ $and: [{ isAllowReuse: 'global' }, { user: { $in: teacherIds } }] }, { $and: [{ isAllowReuse: 'self' }, { user: new ObjectId(request.user._id) }] }] })

          } else {
            filter.isAllowReuse = { $ne: 'none' }
          }
        }

        if (request.studentQuestions) {
          // IN this case teacher is searching for student questions
          // We don't need user filter here, instead we will find all questions that has 'approveStatus' set
          if (request.pending) {
            filter.approveStatus = 'pending'
          } else {
            filter.approveStatus = {
              $in: ['pending', 'approved', 'rejected']
            }
          }

        } else {
          // Only show user' questions in non-white-label. Otherwise show all questions in pool
          if (!request.user.roles.includes(config.roles.admin)) {
            if (request.user.roles.includes(config.roles.student) || !settings.isWhiteLabelled) {
              filter.user = new Types.ObjectId(request.user._id)
            }
          }

          if (request.isApproved) {
            filter.approveStatus = 'approved';
          } else {
            // in this case no filter mean we will search for all approval status
          }
        }

        if (request.complexity) {
          filter.complexity = request.complexity
        }

        if (request.isActive == true) {
          filter.isActive = true
        } else {
          filter.isActive = false
        }

        if (request.tags) {
          let tags = [];

          request.tags.split(',').forEach((t) => {
            // tags.push(
            //     new RegExp(t, "i")
            // )
            tags.push(t)
            tags.push(t.toLowerCase())
          })

          filter.tags = {
            $in: tags
          }
        }

        if (request.subject) {
          filter['subject._id'] = new Types.ObjectId(request.subject)
        } else {
          if (request.user) {
            const subjectIds = request.user.subjects.map(id => new Types.ObjectId(id));
            filter['subject._id'] = {
              $in: subjectIds
            }
          }
        }

        if (request.unit) {
          filter['unit._id'] = new Types.ObjectId(request.unit)
        }

        if (request.topics) {
          var topics: any = request.topics.split(',')
          topics = topics.map(function (t) {
            return new Types.ObjectId(t)
          })
          filter['topic._id'] = {
            $in: topics
          }
        }
        if (request.keyword) {
          var regexText = {
            $regex: util.regex(request.keyword, 'i')
          }
          if (!filter["$and"]) {
            filter["$and"] = []
          }
          filter["$and"].push({
            $or: [{
              'questionText': regexText
            },
            {
              'topic.name': regexText
            },
            {
              'unit.name': regexText
            }
            ]
          })
        }

        var ids = [];
        // waterfall removed
        if (request.unusedOnly == true) {
          try {
            this.practiceSetRepository.setInstanceKey(request.instancekey);
            const qIds = await this.practiceSetRepository.aggregate(
              [{
                $match: {
                  status: 'published'
                }
              },
              {
                $project: {
                  questions: 1,
                  _id: 0
                }
              },
              {
                $unwind: '$questions'
              },
              {
                $project: {
                  _id: '$questions.question'
                }
              }]);

            if (qIds && qIds.length > 0) {
              for (var i = 0; i < qIds.length; i++) {
                ids.push(qIds[i]._id)
              }

              filter._id = {
                $nin: ids
              }
            }
          } catch (error) {
            throw new InternalServerErrorException(error.message)
          }
        }

        // Update filter notInTest will contain test id
        if (request.notInTest) {
          try {
            this.practiceSetRepository.setInstanceKey(request.instancekey);
            const p = await this.practiceSetRepository.findById(new Types.ObjectId(request.notInTest), { 'questions': 1 });
            if (p.questions && p.questions.length > 0) {
              for (var i = 0; i < p.questions.length; i++) {
                ids.push(p.questions[i].question)
              }

              filter._id = {
                $nin: ids
              }
            }
          } catch (error) {
            throw new InternalServerErrorException(error.message);
          }
        } else if (request.excludeTempt == true) {
          try {
            this.practiceSetRepository.setInstanceKey(request.instancekey);
            const result = await this.practiceSetRepository.find(
              {
                user: new Types.ObjectId(request.user._id),
                status: 'tempt'
              }, { 'questions': 1 });

            var p = result[0]
            if (p && p.questions && p.questions.length > 0) {
              for (var i = 0; i < p.questions.length; i++) {
                ids.push(p.questions[i].question)
              }

              filter._id = {
                $nin: ids
              }
            }
          } catch (error) {
            throw new InternalServerErrorException(error.message);
          }
        }

        try {
          this.questionRepository.setInstanceKey(request.instancekey);
          const results = await this.questionRepository.aggregate(
            [{
              '$match': filter
            },
            {
              '$project': {
                'name': '$topic.name',
                '_id': '$topic._id',
                complexity: 1
              }
            },
            {
              '$sort': {
                'name': 1
              }
            }
            ])
          return results;

        } catch (error) {
          throw new InternalServerErrorException(error.message)
        }
      })
      return { response: results }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message)
    }

  }

  /* 
  ? exam schedule collection is missing in the databases
  */
  async generateRandomTest(request: GenerateRandomTestRequest) {
    try {
      let todaySchedule: any = {};
      this.classroomRepository.setInstanceKey(request.instancekey)
      let userClassroom = await this.classroomRepository.find({
        "students.studentId": new ObjectId(request.user._id), "allowDelete": true,
        "active": true
      }, { name: 1 });

      this.examScheduleRepository.setInstanceKey(request.instancekey);
      let schedules: any = await this.examScheduleRepository.aggregate(
        [{ $match: { classrooms: { $in: userClassroom.map(d => d.name) } } },
        {
          $project: {
            "year": {
              "$year": "$examDate"
            },
            "month": {
              "$month": "$examDate"
            },
            "day": {
              "$dayOfMonth": "$examDate"
            },
            slotTime: 1,
            course: 1,
            testType: 1,
            allowedAttempt: 1,
            tags: 1,
            classrooms: 1,
            settings: 1,
            active: 1
          }
        }, {
          $match: {
            "year": request.year,
            "month": request.month + 1, //because January starts with 0
            "day": request.day
          }
        }]);

      schedules = schedules.find(d => {
        let slots = d.slotTime.split('-')
        let currentTime = request.currentTime;
        if (currentTime >= slots[0] && currentTime <= slots[1]) {
          return true
        } else {
          return false

        }
      })

      if (!schedules) {
        throw new UnprocessableEntityException("No scheduled test found for you. Please check exam schedule or contact administrator for support");
      } else {
        todaySchedule = { ...schedules }
      }

      let activeClassrooms = userClassroom.filter(d => todaySchedule.classrooms.indexOf(d.name) > -1)

      this.attemptRepository.setInstanceKey(request.instancekey);
      let attemptCount = await this.attemptRepository.countDocuments({ user: new ObjectId(request.user._id), 'practiceSetInfo.subjects.name': todaySchedule.course, "practiceSetInfo.classRooms": { $in: activeClassrooms.map(d => d._id) } })

      if (todaySchedule.allowedAttempt <= attemptCount) {
        throw new UnprocessableEntityException("You have reached maximum number of permitted attempts on this Course. Please contact Administrator.")
      }

      const result = await this.redisCache.getSetting({ instancekey: request.instancekey }, async (settings) => {
        let filter: any = {}
        filter.tags = {
          $in: todaySchedule.tags
        }
        if (request.user) {
          const subjectIds = request.user.subjects.map(id => new Types.ObjectId(id));
          filter['subject._id'] = {
            $in: subjectIds
          }
        }

        this.questionRepository.setInstanceKey(request.instancekey);
        const questions = await this.questionRepository.find(filter, {
          createdAt: 1,
          plusMark: 1,
          minusMark: 1,
          subject: 1,
          isActive: 1,
          isAllowReuse: 1,
          unit: 1,
          topic: 1,
          complexity: 1
        })

        if (todaySchedule.settings.totalQuestion > questions.length) {
          throw new UnprocessableEntityException("System didn't find specified number of questions to generate dynamic test. Please contact administrator");
        }
        let finalQuestion = [];
        todaySchedule.settings.questionsdistribution.forEach(qd => {
          let set = questions.filter(d => d.plusMark == qd.marks && d.topic.name == qd.topic)
          set = util.shuffleArray(set)
          let rQ = util.shuffleArray(set.slice(0, qd.count))
          finalQuestion = finalQuestion.concat(rQ);
        })

        if (todaySchedule.settings.totalQuestion > finalQuestion.length) {
          throw new UnprocessableEntityException("System didn't find specified number of questions to generate dynamic test. Please contact administrator");
        }

        finalQuestion = util.shuffleArray(finalQuestion);
        finalQuestion.sort((a, b) => a.plusMark - b.plusMark)

        const results = finalQuestion;
        if (results.length > 0) {
          var data: any = {};
          data.user = new ObjectId(request.user._id)
          data.userInfo = {
            '_id': new ObjectId(request.user._id),
            'name': request.user.name
          }
          var d = new Date();
          data.title = "Proctor Exam of " + todaySchedule.course + " for " + request.user.name + " on " + d.toISOString();
          data.totalQuestion = todaySchedule.settings.totalQuestion;
          data.totalTime = todaySchedule.settings.totalTime;
          data.attemptAllowed = 1
          data.enableMarks = true
          data.isMarksLevel = todaySchedule.settings.isMarksLevel;
          if (data.isMarksLevel) {
            data.plusMark = todaySchedule.settings.plusMark;
            data.minusMark = todaySchedule.settings.minusMark;
          }
          data.totalJoinedStudent = 0;
          data.showFeedback = false;
          data.peerVisibility = false;
          data.accessMode = todaySchedule.settings.accessMode;
          if (todaySchedule.settings.camera) {
            data.camera = todaySchedule.settings.camera;
          }
          if (todaySchedule.settings.offscreenLimit) {
            data.offscreenLimit = todaySchedule.settings.offscreenLimit;
          }
          if (todaySchedule.settings.startTimeAllowance) {
            data.startTimeAllowance = todaySchedule.settings.startTimeAllowance;
          }

          data.status = 'published'
          data.inviteeEmails = []
          data.inviteePhones = []

          if (request.user.email) {
            data.inviteeEmails.push(request.user.email)
          } else if (request.user.phoneNumber) {
            data.inviteePhones.push(request.user.phoneNumber)
          }

          data.testMode = todaySchedule.settings.testMode;
          data.createMode = 'questionPool'
          // data.randomQuestions = todaySchedule.settings.randomQuestions
          data.randomQuestions = false;

          // data.randomizeAnswerOptions = todaySchedule.settings.randomizeAnswerOptions;
          data.randomizeAnswerOptions = false

          data.startDate = d;
          data.isShowResult = false;
          data.isShowAttempt = false
          data.initiator = 'student';
          data.classRooms = [];
          if (todaySchedule.classrooms) {
            data.classRooms = activeClassrooms.map(d => d._id);
          }

          data.subject = [];
          data.questions = [];
          let addedUnits = {};
          let unitsOfQuestions = []

          data.questions = results.map((item, index) => {
            if (addedUnits[String(item.unit._id)]) {
              addedUnits[String(item.unit._id)] = true;
              unitsOfQuestions.push({
                _id: item.unit._id,
                name: item.unit.name
              })
            }

            return {
              question: item._id,
              createdAt: item.createdAt,
              section: item.unit.name,
              plusMark: item.plusMark,
              minusMark: item.minusMark,
              order: index + 1

            }
          });
          data.subject = {
            _id: results[0].subject._id,
            name: results[0].subject.name,
            level: 0
          }
          data.units = unitsOfQuestions;
          data.locations = [new Types.ObjectId(request.user.activeLocation)]

          this.practiceSetRepository.setInstanceKey(request.instancekey)
          var practiceSet = await this.practiceSetRepository.create(data);

          this.questionRepository.setInstanceKey(request.instancekey);
          await this.questionRepository.updateMany({ _id: { $in: results.map(r => r._id) } }, { $addToSet: { practiceSets: practiceSet._id } })

          return practiceSet;

        } else {
          throw new UnprocessableEntityException("System didn't find specified number of questions to generate dynamic test. Please contact administrator")
        }
      })
      return { response: JSON.stringify(result) };
    } catch (error) {
      Logger.error(error);
      if (error instanceof UnprocessableEntityException) {
        throw new GrpcNotFoundException(error.message)
      }
      throw new GrpcInternalException('Something went wrong, please try again.');
    }
  }

  async getRandomQuestions(request: GetRandomQuestionsRequest) {
    this.redisCache.getSetting({ instancekey: request.instancekey }, async (settings) => {
      let filter: any = {}
      let practice = await this.practiceSetRepository.findById(request.id, { questions: 1, randomTestDetails: 1 });
      filter.practiceSets = {
        $in: request.id
      }

      // waterfall function removed
      const questions = await this.questionRepository.find(filter, {
        createdAt: 1,
        plusMark: 1,
        minusMark: 1,
        subject: 1,
        isActive: 1,
        isAllowReuse: 1,
        unit: 1,
        topic: 1,
        complexity: 1
      })

      // todaySchedule varible used without initialization
    })
  }

  async createTestFormPool(request: CreateTestFormPoolRequest) {
    try {
      if (request.title) {
        request.title = request.title.replace(/ {1,}/g, " ");
      }

      var result = await this.redisCache.getSetting({ instancekey: request.instancekey }, async (settings) => {
        var filter: any = {}
        let teacherIds = [];
        let condition: any = {}
        if (request.user && request.user.locations) {
          const locationIds = request.user.locations.map(id => new Types.ObjectId(id));

          condition = {
            locations: {
              $in: locationIds,

            },
            role: { $ne: 'student' }
          }
        }
        if (request.owners) {
          let Ids = request.owners.split(',');
          condition._id = {
            $in: Ids
          }
        }

        if (request.user.roles.includes(config.roles.centerHead) || (request.user.roles.includes(config.roles.admin) && request.owners)) {
          if (request.user.locations && request.user.locations.length > 0) {
            this.usersRepository.setInstanceKey(request.instancekey);
            teacherIds = await this.usersRepository.distinct('_id', condition);
          }
        }

        if (request.pendingReview) {
          filter["moderation.moderatedBy"] = {
            "$exists": false
          }
        }
        if (request.marks) {
          if (!filter["$and"]) {
            filter["$and"] = []
          }
          filter["$and"].push({ $or: [{ plusMark: request.marks }, { minusMark: request.marks }] })
        }
        var limit = request.totalQuestion ? request.totalQuestion : 10;
        if (request.myquestion) {
          if (request.user.roles.includes(config.roles.centerHead) || (request.user.roles.includes(config.roles.admin) && request.owners)) {
            if (!filter["$and"]) {
              filter["$and"] = []
            }
            filter["$and"].push({ $or: [{ user: { $in: teacherIds }, isAllowReuse: 'self' }, { isAllowReuse: 'self', user: new Types.ObjectId(request.user._id) }] })
          } else {
            filter.isAllowReuse = { $ne: 'none' }
            filter.user = new Types.ObjectId(request.user._id)
          }
        } else {
          if (request.user.roles.includes(config.roles.centerHead) || (request.user.roles.includes(config.roles.admin) && request.owners)) {
            if (!filter["$and"]) {
              filter["$and"] = []
            }

            filter["$and"].push({ $or: [{ $and: [{ isAllowReuse: 'global' }, { user: { $in: teacherIds } }] }, { $and: [{ isAllowReuse: 'self' }, { user: new Types.ObjectId(request.user._id) }] }] })
          } else if (request.user.roles.includes(config.roles.teacher)) {

            if (!filter["$and"]) {
              filter["$and"] = []
            }

            filter["$and"].push({ $or: [{ $and: [{ isAllowReuse: 'global' }, { user: { $in: teacherIds } }] }, { $and: [{ isAllowReuse: 'self' }, { user: new Types.ObjectId(request.user._id) }] }] })

          } else {
            filter.isAllowReuse = { $ne: 'none' }
          }
        }

        if (request.reUse) {
          if (request.studentQuestions) {
            // IN this case teacher is searching for student questions
            // We don't need user filter here, instead we will find all questions that has 'approveStatus' set
            if (request.pending) {
              filter.approveStatus = 'pending'
            } else {
              filter.approveStatus = {
                $in: ['pending', 'approved', 'rejected']
              }
            }
          } else {
            // Only show user' questions in non-white-label. Otherwise show all questions in pool          
            if (request.isApproved) {
              filter.approveStatus = 'approved';
            } else {
              // in this case no filter mean we will search for all approval status
            }
          }
        }
        if (request.complexity) {
          filter.complexity = request.complexity
        }

        // We will by pass this filter in case we search for student Questions
        if (!request.user.roles.includes(config.roles.student) && !request.studentQuestions) {
          if (request.isActive) {
            filter.isActive = true
          } else {
            filter.isActive = false
          }
        }

        if (request.tags) {
          let tags = [];

          request.tags.split(',').forEach((t) => {
            // tags.push(
            //     new RegExp(t, "i")
            // )
            tags.push(t)
            tags.push(t.toLowerCase())
          })

          filter.tags = {
            $in: tags
          }
        }

        if (request.subject) {
          filter['subject._id'] = new Types.ObjectId(request.subject)
        } else {
          if (request.user) {
            filter['subject._id'] = {
              $in: request.user.subjects.map(s => new ObjectId(s))
            }
          }
        }

        if (request.units && !request.topics) {
          // no need to convert it to objectId unless we use it in aggregation, it gonna crash server if the ObjectId conversion fail
          // One more thing, we also use this query some where else where we have comma separated list of units in the query
          var units = request.units.split(',')
          filter['unit._id'] = {
            $in: units
          }
        }

        if (request.topics) {
          var topics = request.topics.split(',')
          filter['topic._id'] = {
            $in: topics
          }
        }

        if (request.keyword) {
          if (!filter["$and"]) {
            filter["$and"] = []
          }
          var regexText = {
            $regex: util.regex(request.keyword, 'i')
          }
          filter["$and"].push({
            $or: [{
              'questionText': regexText
            },
            {
              'topic.name': regexText
            },
            {
              'unit.name': regexText
            }
            ]
          })
        }

        // @ad error: sort is snot declared 
        if (request.sort) {
          // sort = request.sort.split(',')
        }

        var ids = []
        // waterfall removed
        var userFilter: any = {}
        userFilter.title = request.title
        this.practiceSetRepository.setInstanceKey(request.instancekey);
        const exPracticeSet = await this.practiceSetRepository.findOne(userFilter);

        if (exPracticeSet) {
          throw new BadRequestException('A practice test with this name already exists in your list.');
        }

        if (request.unusedOnly) {
          this.practiceSetRepository.setInstanceKey(request.instancekey);
          const qIds = await this.practiceSetRepository.aggregate([{
            $match: {
              status: 'published'
            }
          },
          {
            $project: {
              questions: 1,
              _id: 0
            }
          },
          {
            $unwind: '$questions'
          },
          {
            $project: {
              _id: '$questions.question'
            }
          }
          ])
          if (qIds && qIds.length > 0) {
            for (var i = 0; i < qIds.length; i++) {
              ids.push(qIds[i]._id)
            }
            filter._id = {
              $nin: ids
            }
          }
        }

        if (request.notInTest) {
          this.practiceSetRepository.setInstanceKey(request.instancekey);
          const p = await this.practiceSetRepository.findById(new Types.ObjectId(request.notInTest), { 'questions': 1 })
          if (p.questions && p.questions.length > 0) {
            for (var i = 0; i < p.questions.length; i++) {
              ids.push(p.questions[i].question)
            }
            filter._id = {
              $nin: ids
            }
          }
        } else if (request.excludeTempt) {
          this.practiceSetRepository.setInstanceKey(request.instancekey);
          const result = await this.practiceSetRepository.find({
            user: new Types.ObjectId(request.user._id),
            status: 'tempt'
          }, { 'questions': 1 });
          if (!(result.length === 0)) {
            var p = result[0]
            if (p.questions && p.questions.length > 0) {
              for (var i = 0; i < p.questions.length; i++) {
                ids.push(p.questions[i].question)
              }
              filter._id = {
                $nin: ids
              }
            }
          }
        }

        this.questionRepository.setInstanceKey(request.instancekey);
        var questions = await this.practiceSetRepository.find(filter, {
          createdAt: 1,
          plusMark: 1,
          minusMark: 1,
          subject: 1,
          isActive: 1,
          isAllowReuse: 1,
        }, { limit: limit });

        const results = questions;
        if (results.length > 0 && results.length >= limit) {
          var data: any = {};
          data.user = new Types.ObjectId(request.user._id)
          data.userInfo = {
            _id: new Types.ObjectId(request.user._id),
            name: request.user.name
          }

          data.title = request.title;
          data.totalQuestion = request.totalQuestion
          data.totalTime = request.totalQuestion;
          data.totalAttempt = 0
          data.attemptAllowed = 0
          data.enableMarks = true
          data.isMarksLevel = true
          data.totalJoinedStudent = 0
          data.accessMode = 'public'
          data.status = 'draft'
          data.inviteeEmails = []
          data.inviteePhones = []
          data.createMode = 'questionPool'
          var unitsOfQuestions = []
          var addedUnits = {}
          questions = []

          if (!data.subject && results[0].subject) {
            data.subject = {
              _id: results[0].subject._id,
              name: results[0].subject.name,
              level: 0
            }
          }
          results.forEach(function (item, index) {
            questions.push({
              question: item._id,
              createdAt: item.createdAt,
              section: item.unit.name,
              plusMark: item.plusMark,
              minusMark: item.minusMark,
              order: index + 1
            })

            if (addedUnits[String(item.unit._id)]) {
              addedUnits[String(item.unit._id)] = true;
              unitsOfQuestions.push({
                _id: item.unit._id,
                name: item.unit.name
              })
            }
          })
          data.units = unitsOfQuestions;
          data.questions = questions;
          data.locations = [new Types.ObjectId(request.user.activeLocation)]
          this.practiceSetRepository.setInstanceKey(request.instancekey);
          var practiceSet = await this.practiceSetRepository.create(data);


          await this.questionRepository.updateMany({ _id: { $in: results.map(r => r._id) } }, { $addToSet: { practiceSets: practiceSet._id } })
          return practiceSet;

        } else {
          throw new UnprocessableEntityException("Your search didn't return specified number of questions. Please change your search criteria or lower number of questions in the new test")
        }
      })
      return { response: JSON.stringify(result) };
    } catch (error) {
      Logger.error(error);
      if (error instanceof UnprocessableEntityException) {
        throw new GrpcNotFoundException(error.message)
      }
      throw new GrpcInternalException('Something went wrong, please try again.');
    }
  }


  async executeCode(req: ExecuteCodeRequest) {
    try {
      var type = req.query.type

      // To preserve student code, we will create attemptdetail first to save student code
      let codeRequest: any = req.body
      try {
        // codeRequest = JSON.parse(req.body)

      } catch (err) {

      }
      let testId = req.query.testId
      let questionId = req.query.questionId
      let attemptDetailId = req.query.attemptDetailId

      let atmDetail
      let practice
      let question
      this.practiceSetRepository.setInstanceKey(req.instancekey);
      practice = await this.practiceSetRepository.findOne({ _id: testId }, { user: 1, testMode: 1, isAdaptive: 1 });

      if (testId && questionId && practice.isAdaptive && practice.testMode != 'learning') {
        if (attemptDetailId) {
          // Check if this attempt detail is valid
          //removed from condition
          // attempt: { $exists: false }
          this.attemptDetailRepository.setInstanceKey(req.instancekey);
          atmDetail = await this.attemptDetailRepository.findOne({ _id: attemptDetailId, practicesetId: testId });
        }

        if (atmDetail) {
          var qIdx = _.findIndex(atmDetail.QA, (a) => a.question.toString() == questionId)

          if (qIdx == -1) {
            question = {
              question: questionId,
              answers: [{
                codeLanguage: type,
                code: codeRequest.code,
                testcases: codeRequest.testcases
              }]
            }

            atmDetail.QA.push(question)
          } else {
            question = atmDetail.QA[qIdx]
            question.answers.unshift({
              codeLanguage: type,
              code: codeRequest.code,
              testcases: codeRequest.testcases
            })
          }

          await this.attemptDetailRepository.findByIdAndUpdate(attemptDetailId, atmDetail);
        } else {
          // Create attempt detail if it is not exists
          question = {
            question: questionId,
            answers: [{
              codeLanguage: type,
              code: codeRequest.code,
              testcases: codeRequest.testcases
            }]
          }
          atmDetail = await this.attemptDetailRepository.create({
            user: new ObjectId(req.user._id),
            practicesetId: testId,
            isAbandoned: true,
            QA: [question]
          })


          attemptDetailId = atmDetail._id
        }
      }

      // Configure the request
      var options = {
        url: config.codeRunnerUrl + type,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(codeRequest)
      }

      var response: any;
      try {
        response = await axios(options);
      } catch (error) {
        Logger.error('code engine %j', error)
        throw new BadRequestException();
      }

      if (response.status == 200) {
        let output = response.data;

        if (attemptDetailId) {
          this.attemptDetailRepository.setInstanceKey(req.instancekey);
          let att = await this.attemptDetailRepository.findById(attemptDetailId);

          if (att != null) {
            let qIdx = _.findIndex(att.QA, (a) => a.question.toString() == questionId)

            if (qIdx > -1) {
              let ques = att.QA[qIdx]
              ques.answers[0].compileMessage = output.compileMessage.join('\n')
              ques.answers[0].compileTime = output.compileTime

              ques.answers[0].testcases = output.result.map(r => {
                let out = ''
                let error = ''
                if (r.exitCode != 0 && r.err) {
                  for (let i = 0; i < r.err.length; i++) {
                    error += r.err[i] + '\n'
                  }
                  error = error.trimRight()
                } else if (r.out) {
                  out = r.out.trimRight()
                }

                return { input: r.input, args: r.args, output: out, runTime: r.runTime, error: error }
              })

              await this.attemptDetailRepository.findByIdAndUpdate(att._id, att);
            }
          }
        }

        return {
          output: output,
          attemptDetailId: attemptDetailId
        }
      }

      if (!response.data) {
        throw new BadRequestException();
      }

      try {
        var json = response.data

        if (attemptDetailId && json.err) {
          let msg = ''

          for (let i = 0; i < json.err.length; i++) {
            msg += json.err[i]
          }

          this.attemptDetailRepository.setInstanceKey(req.instancekey);
          let att = await this.attemptDetailRepository.findById(attemptDetailId);

          if (att != null) {
            let qIdx = _.findIndex(att.QA, (a) => a.question.toString() == questionId)

            if (qIdx > -1) {
              let ques = att.QA[qIdx]

              ques.answers[0].compileMessage = msg;
              //markModified
              await this.attemptDetailRepository.findByIdAndUpdate(att._id, att);
            }
          }
        }

        throw new BadRequestException({
          output: json,
          attemptDetailId: attemptDetailId
        })
      } catch (e) {
        throw new BadRequestException({
          output: response.data,
          attemptDetailId: attemptDetailId
        })
      }

    } catch (error) {
      Logger.error(error);
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.getResponse());
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }
}

