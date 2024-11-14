import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { PracticeSetRepository, QuestionRepository, QuestionTagRepository } from "../database";
import { Types } from "mongoose";
import * as CryptoJS from 'crypto-js';
import { GrpcInternalException } from "nestjs-grpc-exceptions";
import async from "async"

@Injectable()
export class QuestionBus {
  constructor(private readonly questionTagRepository: QuestionTagRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly practiceSetRepository: PracticeSetRepository) { }
  protected readonly logger: Logger;

  async addTags(instancekey: string, userId: string, question: any) {
    try {
      if (question.tags) {
        for (const tag of question.tags) {
          if (tag) {
            this.questionTagRepository.setInstanceKey(instancekey)
            let result = await this.questionTagRepository.findOne({ tagLower: tag.toLowerCase() });
            if (result) {
              // this.logger.debug('Tag already exists');
              console.log('Tag already exists');

            } else {
              let tagObj = {
                tag: tag,
                tagLower: tag.toLowerCase(),
                createdBy: new Types.ObjectId(userId),
              };
              let newTags = await this.questionTagRepository.create(tagObj);
            }
          }
        }

      }
    } catch (e) {
      Logger.error(e)
      throw new InternalServerErrorException(e.message);
    }
  }

  async encryptAnswerMeta(answer: any) {
    const { isCorrectAnswer, _id } = answer;
    delete answer.isCorrectAnswer;

    const meta = {
      isCorrect: isCorrectAnswer
    };

    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(meta), _id.toString());
    answer.meta = encryptedData.toString();
    answer.iv = encryptedData.iv.toString();

    return answer;
  }

  async encryptQuestionAnswer(question: any, hasCorrectAnswer: boolean) {
    if (hasCorrectAnswer) {
      const encryptedAnswers = [];

      for (const answer of question.answers) {
        encryptedAnswers.push(await this.encryptAnswerMeta(answer));
      }

      question.answers = encryptedAnswers;
    }

    // Remove solution from coding question
    if (question.coding && question.coding.length > 0) {
      for (const coding of question.coding) {
        delete coding.solution;
      }
    }
  }

  async getQuestionsByAttempt(req: any, attempt: any) {
    try {
      let qIds = [];
      if (attempt.QA && Array.isArray(attempt.QA)) {
        qIds = attempt.QA
          .filter(q => q && q.question !== null) // Filter out items where q is null or question is null
          .map(q => q.question);
      }
      this.questionRepository.setInstanceKey(req.instancekey)
      const questions = await this.questionRepository.find({ _id: { $in: qIds } })

      this.practiceSetRepository.setInstanceKey(req.instancekey)
      const practice = await this.practiceSetRepository.findById(attempt.practicesetId)

      // reorder question
      let resultQuestions = []
      attempt.QA.forEach(function (q1, indx) {
        questions.some(function (q2, indx1) {
          var a = q1.question.toString()
          var b = q2._id.toString()
          if (a === b) {
            resultQuestions[indx] = q2
            if (!practice.isShowResult && req.userRoles[0] === 'student') {
              q2.answers = [];
              q2.answerExplain = '';
              if (q2.category === 'code') {
                q2.coding.forEach(function (c) {
                  c.solution = '';
                })
              }
            }

            let tq = practice.questions.find(q => q.question.toString() == a)

            if (tq) {
              q2.section = tq.section
              q2.order = tq.order
            }
            return true
          }
        })
      })

      return resultQuestions;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message)
    }
  }

  sortQuestion(questions) {
    if (questions[0] && questions[0].order) {
      questions.sort((q1, q2) => {
        if (q1.order < q2.order) {
          return -1;
        } else if (q1.order > q2.order) {
          return 1;
        } else {
          return 0;
        }
      });
    } else {
      questions.sort((q1, q2) => {
        if (q1.createdAt < q2.createdAt) {
          return -1;
        } else if (q1.createdAt > q2.createdAt) {
          return 1;
        } else {
          return 0;
        }
      });
    }
  }

  async getQuestionsByPracticeId(req, id) {
    try {
      this.practiceSetRepository.setInstanceKey(req.instancekey);
      let practice: any = await this.practiceSetRepository.findById(id);
      let data: any = await this.questionRepository.populate(practice, {
        path: "questions.question",
      })

      this.sortQuestion(data.questions)

      let processedQuestions = await Promise.all(data.questions.map(async (qp) => {
        qp.question.createdAt = qp.createdAt;
        qp.question.order = qp.order;

        // Hide answer and explanation if the user role is student
        if (!practice.isShowResult && req.user.role === 'student') {
          qp.question.answers = [];
          qp.question.answerExplain = '';
          if (qp.question.category === 'code') {
            qp.question.coding.forEach(c => {
              c.solution = '';
            });
          }
        }
        return qp.question;
      }));
      return processedQuestions
    } catch (err) {
      Logger.error(err);
      throw new InternalServerErrorException(err.message)
    }
  }

  async getQuestionsByPractice(ik, practice) {
    try {
      this.questionRepository.setInstanceKey(ik);
      let data: any = await this.questionRepository.populate(practice,
        {
          path: 'questions.question'
        }
      )
      this.sortQuestion(data.questions)

      let questions = []

      data.questions.forEach(qp => {
        qp.question.createdAt = qp.createdAt;
        qp.question.order = qp.order
        qp.question.section = qp.section;

        questions.push(qp.question)
      })
      return questions
    } catch (err) {
      Logger.error(err);
      throw new InternalServerErrorException(err.message)
    }
  }

  // For test, we need to hide/encrypt correct answer or explaination
  async getQuestionsForTest(req, practice, hasCorrectAnswer) {
    var qSelect = '-__v -answerExplain -answerExplainArr';

    this.questionRepository.setInstanceKey(req.instancekey);
    const data: any = await this.questionRepository.populate(practice, {
      path: 'questions.question',
      select: qSelect,
      options: { lean: true }
    })
    // Sort manually, sort in mongoose populate has serius bug https://github.com/Automattic/mongoose/issues/2202
    this.sortQuestion(data.questions)


    const transformedQuestions = data.questions.map((item) => {
      let question = item.question;
      // Mapping properties from parent object to the question object
      question.createdAt = item.createdAt;
      question.section = item.section;
      question.order = item.order;

      this.encryptQuestionAnswer(question, hasCorrectAnswer);

      return question; 
    });

    return transformedQuestions;
  }
}

