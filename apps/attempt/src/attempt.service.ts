import {
  Attempt, AttemptDetail, AttemptDetailRepository, AttemptRepository, AttemptSubmissionRepository, ClassroomRepository,
  Constants, KhanAcademyRepository, MappingRepository, PracticeSetRepository,
  PsychoResult, PsychoResultRepository, QuestionFeedbackRepository, RedisCaching, SettingRepository, globals,
  StudentRecommendationRepository, SubjectRepository, TopicRepository, UserLogRepository, UsersRepository, regexCode
} from '@app/common';
import { fetchVideos, regex } from '@app/common/Utils';
import { AttendanceRepository } from '@app/common/database/repositories/attendance.repository';
import {
  ClassroomListSubjectStudentDoRequest, ClassroomSummarySpeedByDateRequest, ClassroomSummarySpeedRequest,
  CountAllByTeacherRequest, CountAllRequest, CountByUserRequest, CountMeRequest, CountStudentAttemptedRequest,
  CountSummaryAttemptedPracticeRequest, CreateRequest, FindAllByMeRequest, FindAllByPracticeRequest, FindAllByTeacherRequest,
  FindAllNotCreatedByRequest, FindOneAttemptByMeRequest, FindOneAttemptRequest, FindOneByMeRequest, FindOneRequest,
  FindPsychoResultByTestRequest, FindQuestionFeedbackRequest, FinishPsychoTestRequest, FinishRequest, CalculateSatTotalScoreReq,
  GetAccuracyPercentileRequest, GetAccuracyRankRequest, GetAllProvidersRequest, GetAttemptByUserReq, GetAttemptRequest,
  GetCareerScoreRequest, GetCareerSumReq, GetClassroomByTestRequest, GetFirstAttemptRequest, GetLastByMeRequest,
  GetListAvgSpeedByPracticeRequest, GetListPercentCorrectByPracticeRequest, GetListSubjectsMeRequest, GetListSubjectsStudentRequest,
  GetListTopicsMeRequest, GetListTopicsStudentRequest, GetProctoringAttemptRequest, GetPsychoClassroomRequest,
  GetPsychoResultRequest, GetResultPracticeRequest, GetSpeedRankRequest, GetTotalQuestionBySubjectMeRequest,
  GetTotalQuestionBySubjectStudentRequest, GetTotalQuestionTopicMeRequest, GetTotalQuestionTopicStudentRequest,
  InvitationRequest, IsAllowDoTestRequest, PartialSubmitAttemptRequest, QuestionByComplexityRequest, QuestionByConfidenceRequest,
  QuestionSubmitRequest, RecordQuestionReviewRequest, ResetItemInQueueRequest, SaveCamCaptureRequest, StartRequest,
  SubmitToQueueRequest, SummaryAbondonedMeRequest, SummaryAbondonedStudentRequest, SummaryAttemptedBySubjectMeRequest,
  SummaryAttemptedBySubjectStudentRequest, SummaryAttemptedPracticeRequest, SummaryAttemptedStudentRequest, AccuracyBySubjectReq,
  SummaryCorrectByDateMeRequest, SummaryCorrectByDateStudentRequest, SummaryDoPracticeRequest, SummaryOnePracticeSetRequest,
  SummaryPracticeMeRequest, SummaryPracticeStudentRequest, SummaryQuestionBySubjectMeRequest, SummaryQuestionBySubjectStudentRequest,
  SummaryQuestionByTopicMeRequest, SummaryQuestionByTopicStudentRequest, SummarySpeedTopicByDateMeRequest,
  SummarySpeedTopicByDateStudentRequest, SummarySubjectCorrectByDateMeRequest, SummarySubjectCorrectByDateStudentRequest,
  SummarySubjectCorrectMeRequest, SummarySubjectCorrectStudentRequest, SummarySubjectSpeedByDateMeRequest,
  SummarySubjectSpeedByDateStudentRequest, SummarySubjectSpeedMeRequest, SummarySubjectSpeedStudentRequest,
  SummaryTopicCorrectMeRequest, SummaryTopicCorrectStudentRequest, SummaryTopicSpeedMeRequest, SummaryTopicSpeedStudentRequest,
  TopperSummaryReq, GetCareerAttemptsRequest, UpdateAbandonStatusRequest, UpdateSuspiciousRequest, UpdateTimeLimitExhaustedCountRequest,
  ClassroomListTopicStudentDoReq,
  SaveScreenRecordingRequest,
  SaveQrUploadRequest
} from '@app/common/dto/attempt.dto';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import async from 'async'
import { QuestionBus } from '@app/common/bus/question.bus';
import { config } from '@app/common/config';
import { _ } from 'lodash'
import { ObjectId } from 'mongodb';
import { MessageCenter } from '@app/common/components/messageCenter';
import { AttemptProcessor } from '@app/common/components/AttemptProcessor';
import { StudentBus } from '@app/common/bus';
import { GrpcAbortedException, GrpcInternalException } from 'nestjs-grpc-exceptions';
import SatCalculationTable from '@app/common/helpers/satScoreCalc';
import { S3Service } from '@app/common/components/aws/s3.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
const calculateScore = require('@alheimsins/bigfive-calculate-score')
const getResult = require('@alheimsins/b5-result-text')

let checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
let Branch_Mapping_For_Aptitude = [
  {
    "Computer Science Engineering": [
      {
        name: "Numerical Aptitude",
        priority: "High",
      },
      {
        name: "Verbal Aptitude",
        priority: "Low",
      },
      {
        name: "Mechanical Aptitude",
        priority: "Medium",
      },
      {
        name: "Spatial Aptitude",
        priority: "Low",
      },
      {
        name: "Reasoning Aptitude",
        priority: "High",
      },
    ],
  },
  {
    "Electronics and Communication Engineering": [
      {
        name: "Numerical Aptitude",
        priority: "High",
      },
      {
        name: "Verbal Aptitude",
        priority: "Medium",
      },
      {
        name: "Mechanical Aptitude",
        priority: "Medium",
      },
      {
        name: "Spatial Aptitude",
        priority: "Low",
      },
      {
        name: "Reasoning Aptitude",
        priority: "High",
      },
    ],
  },
  {
    "Electrical Engineering": [
      {
        name: "Numerical Aptitude",
        priority: "High",
      },
      {
        name: "Verbal Aptitude",
        priority: "Low",
      },
      {
        name: "Mechanical Aptitude",
        priority: "High",
      },
      {
        name: "Spatial Aptitude",
        priority: "Medium",
      },
      {
        name: "Reasoning Aptitude",
        priority: "High",
      },
    ],
  },
  {
    "Agricultural Engineering": [
      {
        name: "Numerical Aptitude",
        priority: "High",
      },
      {
        name: "Verbal Aptitude",
        priority: "Medium",
      },
      {
        name: "Mechanical Aptitude",
        priority: "Medium",
      },
      {
        name: "Spatial Aptitude",
        priority: "Medium",
      },
      {
        name: "Reasoning Aptitude",
        priority: "High",
      },
    ],
  },
  {
    "Mechanical Engineering": [
      {
        name: "Numerical Aptitude",
        priority: "High",
      },
      {
        name: "Verbal Aptitude",
        priority: "Low",
      },
      {
        name: "Mechanical Aptitude",
        priority: "High",
      },
      {
        name: "Spatial Aptitude",
        priority: "High",
      },
      {
        name: "Reasoning Aptitude",
        priority: "High",
      },
    ],
  },
  {
    "Civil Engineering": [
      {
        name: "Numerical Aptitude",
        priority: "High",
      },
      {
        name: "Verbal Aptitude",
        priority: "Medium",
      },
      {
        name: "Mechanical Aptitude",
        priority: "High",
      },
      {
        name: "Spatial Aptitude",
        priority: "High",
      },
      {
        name: "Reasoning Aptitude",
        priority: "High",
      },
    ],
  },
  {
    "Plastics and Polymer Engineering": [
      {
        name: "Numerical Aptitude",
        priority: "High",
      },
      {
        name: "Verbal Aptitude",
        priority: "Medium",
      },
      {
        name: "Mechanical Aptitude",
        priority: "Low",
      },
      {
        name: "Spatial Aptitude",
        priority: "Low",
      },
      {
        name: "Reasoning Aptitude",
        priority: "High",
      },
    ],
  },
];

let Branch_Mapping_For_Personality = [
  {
    "Computer Science Engineering": [
      {
        name: "Extroversion",
        priority: "Low",
      },
      {
        name: "Agreeableness",
        priority: "Medium",
      },
      {
        name: "Openness",
        priority: "High",
      },
      {
        name: "Conscientiousness",
        priority: "Medium",
      },
      {
        name: "Neuroticism",
        priority: "Low",
      },
    ],
  },
  {
    "Electronics and Communication Engineering": [
      {
        name: "Extroversion",
        priority: "Medium",
      },
      {
        name: "Agreeableness",
        priority: "High",
      },
      {
        name: "Openness",
        priority: "High",
      },
      {
        name: "Conscientiousness",
        priority: "Medium",
      },
      {
        name: "Neuroticism",
        priority: "Low",
      },
    ],
  },
  {
    "Electrical Engineering": [
      {
        name: "Extroversion",
        priority: "Low",
      },
      {
        name: "Agreeableness",
        priority: "High",
      },
      {
        name: "Openness",
        priority: "Low",
      },
      {
        name: "Conscientiousness",
        priority: "High",
      },
      {
        name: "Neuroticism",
        priority: "Low",
      },
    ],
  },
  {
    "Agricultural Engineering": [
      {
        name: "Extroversion",
        priority: "Medium",
      },
      {
        name: "Agreeableness",
        priority: "High",
      },
      {
        name: "Openness",
        priority: "High",
      },
      {
        name: "Conscientiousness",
        priority: "Medium",
      },
      {
        name: "Neuroticism",
        priority: "Low",
      },
    ],
  },
  {
    "Mechanical Engineering": [
      {
        name: "Extroversion",
        priority: "Low",
      },
      {
        name: "Agreeableness",
        priority: "Medium",
      },
      {
        name: "Openness",
        priority: "Medium",
      },
      {
        name: "Conscientiousness",
        priority: "High",
      },
      {
        name: "Neuroticism",
        priority: "Low",
      },
    ],
  },
  {
    "Civil Engineering": [
      {
        name: "Extroversion",
        priority: "Medium",
      },
      {
        name: "Agreeableness",
        priority: "Medium",
      },
      {
        name: "Openness",
        priority: "High",
      },
      {
        name: "Conscientiousness",
        priority: "High",
      },
      {
        name: "Neuroticism",
        priority: "Low",
      },
    ],
  },
  {
    "Plastics and Polymer Engineering": [
      {
        name: "Extroversion",
        priority: "Medium",
      },
      {
        name: "Agreeableness",
        priority: "High",
      },
      {
        name: "Openness",
        priority: "Medium",
      },
      {
        name: "Conscientiousness",
        priority: "High",
      },
      {
        name: "Neuroticism",
        priority: "Low",
      },
    ],
  },
];

let definedLevel = ["Low", "Medium", "High"];

@Injectable()
export class AttemptService {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly questionFeedbackRepository: QuestionFeedbackRepository,
    private readonly practiceSetRepository: PracticeSetRepository,
    private readonly userRepository: UsersRepository,
    private readonly redisCaching: RedisCaching,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly attemptDetailRepository: AttemptDetailRepository,
    private readonly psychoResultRepository: PsychoResultRepository,
    private readonly classroomRepository: ClassroomRepository,
    private readonly settingRepository: SettingRepository,
    private readonly questionBus: QuestionBus,
    private readonly khanAcademyRepository: KhanAcademyRepository,
    private readonly topicRepository: TopicRepository,
    private readonly mappingRepository: MappingRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly userLogRepository: UserLogRepository,
    private readonly attemptSubmissionRepository: AttemptSubmissionRepository,
    private readonly messageCenter: MessageCenter,
    private readonly studentRecommendationRepository: StudentRecommendationRepository,
    private readonly attemptProcessor: AttemptProcessor,
    private readonly studentBus: StudentBus,
    private readonly s3Service: S3Service,
    @InjectQueue('attempt-submission') private attemptQueue: Queue
  ) { }

  async classroomSummarySpeedByDateHelper(request, condition) {
    var condition2 = this.createMatch(condition);
    var match2 = {
      $match: condition2
    }
    let pipeline = [];
    pipeline.push(
      {
        $match: condition,
      },
      globals.lookup,
      globals.unw,
      globals.add,
      globals.pro,
      match2,
      {
        $unwind: "$QA"
      }
    );
    if (request.query.subjects) {
      pipeline.push({
        $match: {
          "QA.subject._id": new Types.ObjectId(request.query.subjects)
        }
      })
    }
    if (request.query.topic) {
      pipeline.push(
        {
          $match: {
            "QA.topic._id": new Types.ObjectId(request.query.topic)
          }
        }
      )
    }

    pipeline.push(
      {
        $group: {
          _id: "$_id",
          totalQuestions: {
            $sum: {
              $cond: [{ $eq: ["$QA.status", 3] }, 0, 1],
            },
          }, //TODO real time do a test
          user: {
            $first: "$user",
          },
          totalTime: {
            $sum: {
              $cond: [
                {
                  $gt: ["$QA.timeEslapse", 0],
                },
                "$QA.timeEslapse",
                0,
              ],
            },
          },
          createdAt: {
            $first: "$createdAt",
          },
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
            day: {
              $dayOfMonth: "$createdAt",
            },
            user: "$user",
          },
          timeEslapse: {
            $sum: "$totalTime",
          },
          user: {
            $first: "$user",
          },
          created: {
            $first: "$createdAt",
          },
          totalQuestions: {
            $sum: "$totalQuestions",
          },
        }
      },
      {
        $project: {
          _id: 0,
          day: "$_id",
          totalQuestions: "$totalQuestions",
          timeEslapse: "$timeEslapse",
          user: "$user",
          created: "$created",
          avgTimeDoQuestion: {
            $cond: [
              {
                $eq: ["$totalQuestions", 0],
              },
              0,
              {
                $divide: ["$timeEslapse", "$totalQuestions"],
              },
            ],
          },
        }
      },
      {
        $sort: {
          created: 1
        }
      }
    )

    this.attemptRepository.setInstanceKey(request.instancekey);
    let results: any = await this.attemptRepository.aggregate(pipeline);
    results = await Promise.all(results.map(async (result) => {
      this.userRepository.setInstanceKey(request.instancekey)
      const user = await this.userRepository.findById(result.user)
      result.name = user.name
      return result
    }))
    return results
  }

  async classroomSummarySpeedHelper(request, condition) {
    var condition2 = this.createMatch(condition);
    var match2 = {
      $match: condition2
    }
    let pipeline = [];
    pipeline.push(
      {
        $match: condition,
      },
      globals.lookup,
      globals.unw,
      globals.add,
      globals.pro,
      match2,
      {
        $unwind: "$QA"
      }
    );
    if (request.query.subjects) {
      pipeline.push(
        {
          $match:
            { "QA.subject._id": new Types.ObjectId(request.query.subjects) }
        }

      )
    }
    pipeline.push(
      {
        $group: {
          _id: "$_id",
          totalQuestionsOri: {
            $sum: 1,
          },
          totalCorrects: {
            $sum: {
              $cond: [
                {
                  $eq: ["$QA.status", 1],
                },
                1,
                0,
              ],
            },
          },
          totalMissed: {
            $sum: {
              $cond: [
                {
                  $eq: ["$QA.status", 3],
                },
                1,
                0,
              ],
            },
          },
          doTime: {
            $sum: {
              $cond: [
                {
                  $lt: ["$QA.status", 3],
                },
                "$QA.timeEslapse",
                0,
              ],
            },
          },
          totalQuestionsDo: {
            $sum: {
              $cond: [{ $eq: ["$QA.status", 3] }, 0, 1],
            },
          }, //TODO real time do a test
          user: {
            $first: "$user",
          },
          totalTimeTaken: {
            $sum: {
              $cond: [
                {
                  $gt: ["$QA.timeEslapse", 0],
                },
                "$QA.timeEslapse",
                0,
              ],
            },
          },
        }
      },
      {
        $group: {
          _id: "$user",
          totalQuestions: {
            $sum: "$totalQuestionsOri",
          },
          totalCorrects: {
            $sum: "$totalCorrects",
          },
          totalQuestionsDo: {
            $sum: "$totalQuestionsDo",
          },
          totalTimeTaken: {
            $sum: "$totalTimeTaken",
          },
        }
      },
      {
        $project: {
          totalQuestions: "$totalQuestionsDo",
          totalQuestionOri: "$totalQuestionsOri",
          totalTimeTaken: "$totalTimeTaken",
          accuracyPercent: {
            $cond: [
              {
                $eq: ["$totalQuestionsOri", 0],
              },
              0,
              {
                $multiply: [
                  {
                    $divide: ["$totalCorrects", "$totalQuestionsOri"],
                  },
                  100,
                ],
              },
            ],
          },
          avgTimeDoQuestion: {
            $cond: [
              {
                $eq: ["$totalQuestionsDo", 0],
              },
              0,
              {
                $divide: ["$totalTimeTaken", "$totalQuestionsDo"],
              },
            ],
          },
        }
      },
      {
        $sort: {
          accuracyPercent: -1
        }
      }
    )

    this.attemptRepository.setInstanceKey(request.instancekey);
    this.userRepository.setInstanceKey(request.instancekey)
    let results: any = await this.attemptRepository.aggregate(pipeline);
    results = await Promise.all(results.map(async user => {
      const result = await this.userRepository.findById(
        user._id
      )
      user.name = result.name;
      return user;
    }))
    return results

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

    let settings: any = await this.redisCaching.getSettingAsync(request.instancekey)
    let attempt: any = await this.attemptProcessor.handleNewAttempt(request.instancekey, settings, data, practice)

    // Send email to student
    await this.emailAttemptSubmit(request, data.practicesetId);

    attempt = this.removeAttemptDetails(attempt)
    return attempt;
  }

  difference(r, o) {
    var diff = 0;
    diff = definedLevel.indexOf(o) - definedLevel.indexOf(r);
    return diff;
  }

  calculateInterest(attempt) {
    var allBranch = [
      {
        name: "Computer Science Engineering",
        mark: 0,
        shortName: "Computer",
      },
      {
        name: "Electronics and Communication Engineering",
        mark: 0,
        shortName: "Electronics",
      },
      {
        name: "Electrical Engineering",
        mark: 0,
        shortName: "Electrical",
      },
      {
        name: "Agricultural Engineering",
        mark: 0,
        shortName: "Agriculture",
      },
      {
        name: "Mechanical Engineering",
        mark: 0,
        shortName: "Mechanical",
      },
      {
        name: "Civil Engineering",
        mark: 0,
        shortName: "Civil",
      },
      {
        name: "Plastics and Polymer Engineering",
        mark: 0,
        shortName: "Plastic",
      },
    ];
    var branchData = {};

    if (!branchData["Computer"]) {
      branchData["Computer"] = {
        totalCount: 0,
        userCount: 0,
      };
    }
    if (!branchData["Electronics"]) {
      branchData["Electronics"] = {
        totalCount: 0,
        userCount: 0,
      };
    }
    if (!branchData["Electrical"]) {
      branchData["Electrical"] = {
        totalCount: 0,
        userCount: 0,
      };
    }
    if (!branchData["Mechanical"]) {
      branchData["Mechanical"] = {
        totalCount: 0,
        userCount: 0,
      };
    }
    if (!branchData["Civil"]) {
      branchData["Civil"] = {
        totalCount: 0,
        userCount: 0,
      };
    }

    if (!branchData["Agriculture"]) {
      branchData["Agriculture"] = {
        totalCount: 0,
        userCount: 0,
      };
    }
    if (!branchData["Plastic"]) {
      branchData["Plastic"] = {
        totalCount: 0,
        userCount: 0,
      };
    }

    var questions = attempt.QA.filter(function (q) {
      return q.subject.name === "Areas of Interest";
    });

    questions.forEach(function (q) {
      q.question.answers.forEach(function (answer_doc) {
        if (answer_doc.branch && answer_doc.branch != undefined) {
          branchData[answer_doc.branch].totalCount++;
        }
      });
      if (q.answers.length > 0) {
        var selectedAnswer = q.answers[0];

        // find answer data in question
        var idx = _.findIndex(q.question.answers, function (a) {
          return a._id.toString() === selectedAnswer.answerId.toString();
        });

        if (idx > -1) {
          if (!branchData[q.question.answers[idx].branch]) {
            branchData[q.question.answers[idx].branch] = {
              totalCount: 0,
              userCount: 0,
            };
          }
          branchData[q.question.answers[idx].branch].userCount++;
        }
      }
    });

    for (var branch in branchData) {
      allBranch.forEach(function (b, i) {
        if (branch == b.shortName && branchData[branch].userCount > 0) {
          allBranch[i].mark =
            (branchData[branch].userCount / branchData[branch].totalCount) * 100;
        }
      });
    }

    return allBranch;
  }


  calculatePersonality(attempt) {
    var questions = attempt.QA.filter(function (q) {
      return q.subject.name === "Personality";
    });

    var markPerTopic = {};
    questions.forEach(function (q) {
      if (!markPerTopic[q.topic._id]) {
        markPerTopic[q.topic._id] = {
          name: q.topic.name,
          mark: 0,
        };
      }

      if (q.answers.length > 0) {
        var selectedAnswer = q.answers[0];
        // find answer data in question
        var idx = _.findIndex(q.question.answers, function (a) {
          return a._id.toString() === selectedAnswer.answerId.toString();
        });
        if (idx > -1) {
          markPerTopic[q.topic._id].mark += q.question.answers[idx].marks;
        }
      }
    });
    var personalityAnalysis = [];

    // Summary of topic
    for (var t in markPerTopic) {
      if (markPerTopic[t].mark > 18) {
        markPerTopic[t].sum = "High";
        markPerTopic[t].value = 1;
      } else if (markPerTopic[t].mark > 11) {
        markPerTopic[t].sum = "Medium";
        markPerTopic[t].value = 2;
      } else {
        markPerTopic[t].sum = "Low";
        markPerTopic[t].value = 3;
      }
    }

    for (var t in markPerTopic) {
      if (markPerTopic[t].name == "Openness") {
        personalityAnalysis.push({
          name: markPerTopic[t].name,
          define: "open to new ideas",
          score: markPerTopic[t].sum,
          value: markPerTopic[t].value,
        });
      }
      if (markPerTopic[t].name == "Conscientiousness") {
        personalityAnalysis.push({
          name: markPerTopic[t].name,
          define: "medium regard for rules and norms",
          score: markPerTopic[t].sum,
          value: markPerTopic[t].value,
        });
      }
      if (markPerTopic[t].name == "Agreeableness") {
        personalityAnalysis.push({
          name: markPerTopic[t].name,
          define: "getting along with people",
          score: markPerTopic[t].sum,
          value: markPerTopic[t].value,
        });
      }
      if (markPerTopic[t].name == "Extroversion") {
        personalityAnalysis.push({
          name: markPerTopic[t].name,
          define: "tendency to socialize with other people/group",
          score: markPerTopic[t].sum,
          value: markPerTopic[t].value,
        });
      }
      if (markPerTopic[t].name == "Neuroticism") {
        personalityAnalysis.push({
          name: markPerTopic[t].name,
          define: "emotional instability and degree of negative emotions",
          score: markPerTopic[t].sum,
          value: markPerTopic[t].value,
        });
      }
    }

    var allBranch = [
      {
        name: "Computer Science Engineering",
        mark: 0,
      },
      {
        name: "Electronics and Communication Engineering",
        mark: 0,
      },
      {
        name: "Electrical Engineering",
        mark: 0,
      },
      {
        name: "Agricultural Engineering",
        mark: 0,
      },
      {
        name: "Mechanical Engineering",
        mark: 0,
      },
      {
        name: "Civil Engineering",
        mark: 0,
      },
      {
        name: "Plastics and Polymer Engineering",
        mark: 0,
      },
    ];

    for (var t in markPerTopic) {
      var topic = markPerTopic[t];
      Branch_Mapping_For_Personality.forEach(function (branch_doc, bI) {
        branch_doc[allBranch[bI].name].forEach(function (topic_doc, sI) {
          if (topic.name == topic_doc.name) {
            var diff = this.difference(topic_doc.priority, topic.sum);
            if (diff == 0) {
              allBranch[bI].mark = allBranch[bI].mark + 1;
            } else if (diff == 1 || diff == -1) {
              allBranch[bI].mark = allBranch[bI].mark + 0;
            } else if (diff == 2 || diff == -2) {
              allBranch[bI].mark = allBranch[bI].mark - 1;
            }
          }
        });
      });
    }

    allBranch.forEach(function (doc, ind) {
      allBranch[ind].mark = (doc.mark / 5) * 100;
    });
    var result = {
      allBranch: allBranch,
      personalityAnalysis: personalityAnalysis,
    };

    return result;
  }


  calculateAptitude(attempt) {
    // Get all questions in Aptitude subject
    var questions = attempt.QA.filter(function (q) {
      return q.subject.name === "Aptitude";
    });

    // Calculate mark for each topic
    var markPerTopic = {};
    questions.forEach(function (q) {
      if (!markPerTopic[q.topic._id]) {
        markPerTopic[q.topic._id] = {
          name: q.topic.name,
          mark: 0,
        };
      }

      if (q.status == Constants.CORRECT) {
        markPerTopic[q.topic._id].mark += 1;
      }
    });

    var aptitudeAnalysis = [];

    // Summary of topic
    for (var t in markPerTopic) {
      if (markPerTopic[t].mark >= 4) {
        markPerTopic[t].sum = "High";
        aptitudeAnalysis.push({
          name: markPerTopic[t].name,
          define: "",
          score: markPerTopic[t].sum,
          value: 1,
        });
      } else if (markPerTopic[t].mark >= 2) {
        markPerTopic[t].sum = "Medium";
        aptitudeAnalysis.push({
          name: markPerTopic[t].name,
          define: "",
          score: markPerTopic[t].sum,
          value: 2,
        });
      } else {
        markPerTopic[t].sum = "Low";
        aptitudeAnalysis.push({
          name: markPerTopic[t].name,
          define: "",
          score: markPerTopic[t].sum,
          value: 3,
        });
      }
    }

    var allBranch = [
      {
        name: "Computer Science Engineering",
        mark: 0,
      },
      {
        name: "Electronics and Communication Engineering",
        mark: 0,
      },
      {
        name: "Electrical Engineering",
        mark: 0,
      },
      {
        name: "Agricultural Engineering",
        mark: 0,
      },
      {
        name: "Mechanical Engineering",
        mark: 0,
      },
      {
        name: "Civil Engineering",
        mark: 0,
      },
      {
        name: "Plastics and Polymer Engineering",
        mark: 0,
      },
    ];

    for (var t in markPerTopic) {
      var topic = markPerTopic[t];
      Branch_Mapping_For_Aptitude.forEach(function (branch_doc, bI) {
        branch_doc[allBranch[bI].name].forEach(function (topic_doc, sI) {
          if (topic.name == topic_doc.name) {
            var diff = this.difference(topic_doc.priority, topic.sum);

            if (topic_doc.priority == "Low") {
              allBranch[bI].mark = allBranch[bI].mark + 1;
            } else if (topic_doc.priority == "Medium") {
              if (diff == 0) {
                allBranch[bI].mark = allBranch[bI].mark + 1;
              } else if (diff == 1 || diff == -1) {
                allBranch[bI].mark = allBranch[bI].mark + 0;
              }
            } else {
              if (diff == 0) {
                allBranch[bI].mark = allBranch[bI].mark + 1;
              } else if (diff == 1 || diff == -1) {
                allBranch[bI].mark = allBranch[bI].mark + 0;
              } else if (diff == 2 || diff == -2) {
                allBranch[bI].mark = allBranch[bI].mark - 1;
              }
            }
          }
        });
      });
    }

    allBranch.forEach(function (doc, ind) {
      allBranch[ind].mark = (doc.mark / 5) * 100;
    });

    var result = {
      allBranch: allBranch,
      aptitudeAnalysis: aptitudeAnalysis,
    };

    return result;
  }

  async emailAttemptSubmit(request, testId) {
    this.practiceSetRepository.setInstanceKey(request.instancekey)
    let practice = await this.practiceSetRepository.findOne(
      { _id: new ObjectId(testId) },
      { title: 1 },
      { lean: true },
    )

    let tmpOptions = {
      testName: practice?.title,
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
  async summaryQuestionByTopic(request, condition) {
    let pipeline = [];
    let condition2 = this.createMatch(condition)
    pipeline.push(
      {
        $match: condition,
      },
      {
        $lookup: {
          from: "attemptdetails",
          localField: "_id",
          foreignField: "attempt",
          as: "someField"
        }
      },
      {
        $unwind: "$someField"
      },
      {
        $addFields: {
          QA: "$someField.QA"
        }
      },
      {
        $project: {
          someField: 0
        }
      },
      {
        $match: condition2
      },
      {
        $unwind: "$QA"
      }
    )
    if (request.subjects) {
      pipeline.push({
        $match: {
          "QA.subject._id": new Types.ObjectId(request.subjects)
        }
      })
    }
    pipeline.push(
      {
        $group: {
          _id: "$QA.topic._id",
          total: {
            $sum: 1,
          },
        }
      },
      {
        $project: {
          _id: "$_id",
          total: 1,
        }
      }
    )
    this.attemptRepository.setInstanceKey(request.instancekey)
    let results = await this.attemptRepository.aggregate(pipeline)
    results = await Promise.all(
      results.map(async (topic: any) => {
        try {
          this.topicRepository.setInstanceKey(request.instancekey);
          const result = await this.topicRepository.findById(topic._id);
          if (result !== null) {
            topic.name = result.name;
          }
          return topic;
        } catch (err) {
          // Handle individual errors if needed
          throw err;
        }
      })
    );
    return results
  }

  async getAccuracyPercentileSubject(request) {
    let result: any = await this.attemptRepository.findById(new Types.ObjectId(request.attemptId));
    if (!result) throw "Not Found"
    var condition = {
      user: {
        $ne: new Types.ObjectId(result.user),
      },
      practicesetId: new Types.ObjectId(result.practicesetId)
    }
    let pipeline = [];
    pipeline.push(
      {
        $match: condition
      },
      {
        $lookup: {
          from: "attemptdetails",
          localField: "_id",
          foreignField: "attempt",
          as: "someField"
        }
      },
      {
        $unwind: "$someField"
      },
      {
        $addFields: {
          QA: "$someField.QA"
        }
      },
      {
        $project: {
          someField: 0
        }
      },
      {
        $unwind: "$QA"
      },
      {
        $match: {
          "QA.subject._id": new Types.ObjectId(request.subject)
        }
      },
      {
        $group: {
          _id: "$_id",
          createdAt: {
            $first: "$createdAt",
          },
          totalQuestions: {
            $sum: 1,
          },
          totalCorrects: {
            $first: "$totalCorrects",
          },
          user: {
            $first: "$user",
          },
          marks: {
            $sum: "$QA.actualMarks",
          },
          obtainMarks: {
            $sum: "$QA.obtainMarks",
          },
        },
      },
      {
        $project: {
          marks: 1,
          obtainMarks: 1,
          totalQuestions: "$totalQuestions",
          user: "$user",
          day: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          totalCorrects: "$totalCorrects",
        },
      },
      {
        $project: {
          totalQuestions: 1,
          user: 1,
          day: 1,
          totalCorrects: 1,
          accuracyPercent: {
            $cond: [
              {
                $eq: ["$marks", 0],
              },
              0,
              {
                $multiply: [
                  {
                    $divide: ["$obtainMarks", "$marks"],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$user",
          user: {
            $first: "$user",
          },
          day: {
            $first: "$day",
          },
          totalQuestions: {
            $first: "$totalQuestions",
          },
          totalCorrects: {
            $max: "$totalCorrects",
          },
          accuracyPercent: {
            $max: "$accuracyPercent",
          },
        },
      },
      {
        $sort: {
          accuracyPercent: 1,
        },
      }
    )

    let percents = await this.attemptRepository.aggregate(pipeline);
    if (!percents) return null;
    result = await this.calculatePercentile(percents, result, request);
    return result
  }

  async calculatePercentile(percents, attempt, req) {
    const percentliteList = await Promise.all(
      percents.map(async (data) => Number(data.accuracyPercent))
    );

    let percentCurrentAttempt = 0;
    let totalCorrects = 0;

    if (attempt.totalMark > 0) {
      totalCorrects = attempt.totalMark;
      percentCurrentAttempt = Number(
        ((totalCorrects / attempt.maximumMarks) * 100).toFixed(2)
      );
    }

    if (req.subject && req.correctedPercent) {
      percentCurrentAttempt = Number(
        Number(req.query.correctedPercent).toFixed(2)
      );
    }

    const percentFirst = [...percentliteList];
    const pcurrent = percentCurrentAttempt;
    percentliteList.push(percentCurrentAttempt);
    percentliteList.sort((a, b) => a - b);

    let belowNumber = 0;
    const N = percentliteList.length;
    let sameNumber = 0;
    const fixed = [];

    for (let i = 0; i < N; i++) {
      const num = Number(percentliteList[i].toFixed(2));
      fixed.push(num.toFixed(2));

      if (percentCurrentAttempt > num) {
        belowNumber++;
      }
      if (percentCurrentAttempt === num) {
        sameNumber++;
      }
    }

    const rank = ((belowNumber + 0.5 * sameNumber) / N) * 100;

    return {
      percentlite: rank,
      accuracys: percentliteList,
      temp: percentFirst,
      current: pcurrent,
      fixed: fixed,
    };
  }

  async summarySpeedTopicByDate(request, condition) {
    var condition2 = this.createMatch(condition)
    let pipeline = [];
    pipeline.push(
      {
        $match: condition
      },
      {
        $lookup: {
          from: "attemptdetails",
          localField: "_id",
          foreignField: "attempt",
          as: "someField"
        }
      },
      {
        $unwind: "$someField"
      },
      {
        $addFields: {
          QA: "$someField.QA"
        }
      },
      {
        $project: {
          someField: 0
        }
      },
      {
        $match: condition2
      },
      {
        $unwind: "$QA"
      }
    )

    if (request.subjects) {
      pipeline.push({
        $match: {
          "QA.subject._id": new Types.ObjectId(request.subjects)
        }
      })
    }
    if (request.topic) {
      pipeline.push({
        $match: {
          "QA.topic._id": new Types.ObjectId(request.topic)
        }
      })
    }
    pipeline.push({
      $match: {
        "QA.timeEslapse": {
          $gt: 0,
        },
      }
    })
    let subtract = 0;
    if (request.timezoneoffset) {
      subtract = 60 * 1000 * request.timezoneoffset;
    }
    pipeline.push(
      {
        $match: {
          createdAt: {
            $lte: new Date(new Date().getTime() - subtract),
          },
        }
      },
      {
        $project: {
          _id: "$_id",
          createdAt: 1,
          QA: 1,
          isAbandoned: 1,
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
            day: {
              $dayOfMonth: "$createdAt",
            },
            topicId: "$QA.topic._id",
          },
          topic: {
            $first: "$QA.topic.name",
          },
          created: {
            $first: "$createdAt",
          },
          avgSpeed: {
            $avg: "$QA.timeEslapse",
          },
        }
      },
      {
        $sort: {
          created: 1,
        }
      },
      {
        $project: {
          _id: 0,
          created: "$created",
          day: "$_id",
          topic: "$topic",
          avgSpeed: "$avgSpeed",
        }
      }

    )
    this.attemptRepository.setInstanceKey(request.instancekey)
    let results = await this.attemptRepository.aggregate(pipeline)
    return results

  }

  async summaryDoPractice(request, filter) {
    var filter2 = this.extractFromFilter(filter);
    if (filter2.length == 0) {
      filter2.push({})
    }

    this.attemptRepository.setInstanceKey(request.instancekey)
    let attempts = await this.attemptRepository.aggregate([
      {
        $match: { $and: filter }
      },
      {
        $lookup: {
          from: "attemptdetails",
          localField: "_id",
          foreignField: "attempt",
          as: "someField"
        }
      },
      {
        $unwind: "$someField"
      },
      {
        $addFields: {
          QA: "$someField.QA"
        }
      },
      {
        $project: {
          someField: 0
        }
      },
      {
        $match: {
          $and: filter2,
        },
      }
    ])

    let count = await Promise.all(
      attempts.map((attempt) => {

        return attempt.practicesetId.toString();
      })
    );

    // Remove duplicate values using lodash's uniq
    const uniqResult = _.uniq(count);

    return uniqResult.length > 0 ? uniqResult.length : 0
  }

  async summaryQuestionBySubject(request, condition) {
    let condition2 = this.createMatch(condition)
    let pipeline = [];
    pipeline.push({
      $match: condition
    })
    pipeline.push(
      {
        $lookup: {
          from: "attemptdetails",
          localField: "_id",
          foreignField: "attempt",
          as: "someField"
        }
      },
      {
        $unwind: "$someField"
      },
      {
        $addFields: {
          QA: "$someField.QA"
        }
      },
      {
        $project: {
          someField: 0
        }
      },
    )
    pipeline.push({
      $match: condition2
    })
    pipeline.push(
      {
        $unwind: "$QA",
      },
      {
        $group: {
          _id: "$QA.subject._id",
          total: {
            $sum: 1,
          },
          name: {
            $first: "$QA.subject.name",
          },
        },
      },
      {
        $project: {
          subject: {
            _id: "$_id",
            name: "$name",
          },
          total: 1,
        },
      }
    )
    this.attemptRepository.setInstanceKey(request.instancekey);
    let results = await this.attemptRepository.aggregate(pipeline)
    results = await Promise.all(results.map(async (subject: any) => {
      try {
        this.subjectRepository.setInstanceKey(request.instancekey)
        const result = await this.subjectRepository.findById(subject.subjectId);
        if (result) {
          subject.name = result.name;
        } else {
          Logger.debug(
            "Instance " +
            request.instancekey +
            " Missing subject with ID: " +
            subject.subjectId?.toString()
          );
        }
        return subject;
      } catch (err) {
        Logger.error(err);
        throw err;
      }
    }));
    return results

  }

  async summaryPractice(request, filter) {
    filter = this.conditionCount(request, filter)
    let filter2 = this.extractFromFilter(filter);
    if (filter2.length === 0) {
      filter2.push({});
    }

    this.attemptRepository.setInstanceKey(request.instancekey);
    let results = await this.attemptRepository.aggregate([
      {
        $match: {
          $and: filter,
        }
      },
      {
        $lookup: {
          from: "attemptdetails",
          localField: "_id",
          foreignField: "attempt",
          as: "someField"
        }
      },
      {
        $unwind: "$someField"
      },
      {
        $addFields: {
          QA: "$someField.QA"
        }
      },
      {
        $project: {
          someField: 0
        }
      },
      {
        $match: {
          $and: filter2
        }
      }
    ])

    return results.length

  }

  conditionCount(request, filter, isAbandoned?) {
    if (request.lastDay) {
      var lastDate = new Date();
      lastDate = new Date(lastDate.setTime(request.lastDay))
      filter.push({
        createdAt: {
          $gte: new Date(lastDate),
        },
      });
    }
    if (request.subjects) {
      var subjects = request.subjects;
      filter.push({
        "QA.subject._id": new Types.ObjectId(subjects),
      });
    }
    if (!isAbandoned) {
      filter.push({
        isAbandoned: false,
      });
    }
    return filter;
  }

  extractFromFilter(filter) {
    var newFilter = [];
    for (var i = 0; i < filter.length; i++) {
      var newObj = this.createMatch(filter[i]);
      if (Object.keys(newObj).length) {
        newFilter.push(newObj);
      }
    }
    return newFilter;
  }

  async summaryAbondoned(request, filter) {
    filter.push({
      isAbandoned: true
    })
    filter = this.conditionCount(request, filter, true)

    let filter2 = this.extractFromFilter(filter);
    if (filter2.length === 0) {
      filter2.push({})
    }
    this.attemptRepository.setInstanceKey(request.instancekey)
    let results = await this.attemptRepository.aggregate([
      {
        $match: {
          $and: filter
        }
      },
      {
        $lookup: {
          from: "attemptdetails",
          localField: "_id",
          foreignField: "attempt",
          as: "someField"
        }
      },
      {
        $unwind: "$someField"
      },
      {
        $addFields: {
          QA: "$someField.QA"
        }
      },
      {
        $project: {
          someField: 0
        }
      },
      {
        $match: {
          $and: filter2
        }
      }
    ])
    return results.length
  }

  async summarySubjectSpeed(request, condition) {
    let aggregate = [];
    let condition2 = this.createMatch(condition)
    aggregate.push({
      $match: condition
    })
    aggregate.push({
      $lookup: {
        from: "attemptdetails",
        localField: "_id",
        foreignField: "attempt",
        as: "someField"
      }
    })
    aggregate.push({
      $unwind: "$someField"
    })
    aggregate.push({
      $addFields: {
        QA: "$someField.QA"
      }
    })
    aggregate.push({
      $project: {
        someField: 0
      }
    })
    aggregate.push({
      $match: condition2
    })
    aggregate.push({
      $unwind: "$QA"
    })
    aggregate.push({
      $group: {
        _id: "$QA.subject._id",
        name: {
          $first: "$QA.topic.name",
        },
        timeEslapse: {
          $sum: {
            $cond: [
              {
                $gt: ["$QA.timeEslapse", 0],
              },
              "$QA.timeEslapse",
              0,
            ],
          },
        },
        number: {
          $sum: {
            $cond: [
              {
                $gt: ["$QA.timeEslapse", 0],
              },
              1,
              0,
            ],
          },
        },
      },
    })
    aggregate.push({
      $project: {
        total: "$number",
        timeEslapse: "$timeEslapse",
        name: 1,
      },
    })
    aggregate.push({
      $sort: {
        total: -1,
      },
    })
    this.attemptRepository.setInstanceKey(request.instancekey)
    let results = await this.attemptRepository.aggregate(aggregate)
    results = await Promise.all(results.map(async (subject: any) => {
      try {
        this.subjectRepository.setInstanceKey(request.instancekey)
        const result = await this.subjectRepository.findById(subject.subjectId)
        if (result) subject.name = result.name
        else {
          Logger.debug("Instance " + request.instancekey + " Missing subject with Id: " + subject._id.toString())
        }
        return subject
      } catch (err) {
        throw new InternalServerErrorException ("Instance " + request.instancekey + " Missing subject with Id: " + subject._id.toString())
      }
    }))
    return results
  }

  async summaryAttemptedBySubject(request, condition) {
    condition.isEvaluated = true;
    var condition2 = this.createMatch(condition)

    var aggregate = [];
    aggregate.push({
      $match: condition
    })
    aggregate.push({
      $lookup: {
        from: "attemptdetails",
        localField: "_id",
        foreignField: "attempt",
        as: "someField"
      }
    })
    aggregate.push({
      $unwind: "$someField"
    })
    aggregate.push({
      $addFields: {
        QA: "$someField.QA"
      }
    })
    aggregate.push({
      $project: {
        someField: 0
      }
    })
    aggregate.push({
      $match: condition2
    })
    aggregate.push({
      $unwind: "$QA"
    })
    if (request.subjects) {
      aggregate.push({
        $match: {
          "QA.subject._id": new Types.ObjectId(request.subjects)
        }
      })
    }
    aggregate.push({
      $group: {
        _id: "$QA.subject._id",
        totalQuestions: {
          $sum: 1,
        },
        totalCorrects: {
          $sum: {
            $cond: [
              {
                $eq: ["$QA.status", 1],
              },
              1,
              0,
            ],
          },
        },
        totalMissed: {
          $sum: {
            $cond: [
              {
                $eq: ["$QA.status", 3],
              },
              1,
              0,
            ],
          },
        },
        totalMarks: {
          $sum: "$QA.actualMarks",
        },
        obtainMark: {
          $sum: "$QA.obtainMarks",
        },
        doTime: {
          $sum: {
            $cond: [
              {
                $lt: ["$QA.status", 3],
              },
              "$QA.timeEslapse",
              0,
            ],
          },
        },
        timeEslapse: {
          $sum: "$QA.timeEslapse",
        },
        doQuestion: {
          $sum: {
            $cond: [{ $eq: ["$QA.status", 3] }, 0, 1],
          },
        },
      },
    });

    aggregate.push({
      $project: {
        _id: "$_id",
        totalMark: "$obtainMark",
        totalTestMark: "$totalMarks",
        totalTimeTaken: "$totalTimeTaken",
        doTime: "$doTime",
        doQuestion: "$doQuestion",
        totalMissed: "$totalMissed",
        totalCorrects: "$totalCorrects",
        totalQuestions: "$totalQuestions",
        avgTimeDoQuestion: {
          $cond: [
            {
              $eq: ["$doQuestion", 0],
            },
            0,
            {
              $divide: ["$timeEslapse", "$doQuestion"],
            },
          ],
        },
        avgTimeQuestion: {
          $cond: [
            {
              $eq: ["$totalQuestions", 0],
            },
            0,
            {
              $divide: ["$timeEslapse", "$totalQuestions"],
            },
          ],
        },
      },
    });
    this.attemptRepository.setInstanceKey(request.instancekey)
    let results = await this.attemptRepository.aggregate(aggregate)

    if (!results) return results
    results = await Promise.all(results.map(async (subject: any) => {
      try {
        this.subjectRepository.setInstanceKey(request.instancekey)
        const result = await this.subjectRepository.findById(subject.subjectId)
        if (result) subject.name = result.name
        else {
          Logger.debug("Instance " + request.instancekey + " Missing subject with Id: " + subject._id.toString())
        }
        return subject
      } catch (err) {
        throw new InternalServerErrorException ("Instance " + request.instancekey + " Missing subject with Id: " + subject._id.toString())
      }
    }))
    return results
  }

  async summarySubjectSpeedByDate(request, condition) {
    let subtract = 0;
    if (request.timezoneoffset) {
      subtract = 60 * 1000 * request.timezoneoffset;
    }

    let condition2 = this.createMatch(condition)
    let aggregate = [];
    aggregate.push({
      $match: condition
    })
    aggregate.push({
      $match: {
        createdAt: {
          $lte: new Date(new Date().getTime() - subtract),
        },
      },
    })
    aggregate.push({
      $lookup: {
        from: "attemptdetails",
        localField: "_id",
        foreignField: "attempt",
        as: "someField"
      }
    })
    aggregate.push({
      $unwind: "$someField"
    })
    aggregate.push({
      $addFields: {
        QA: "$someField.QA"
      }
    })
    aggregate.push({
      $project: {
        someField: 0
      }
    })
    aggregate.push({
      $match: condition2
    })

    aggregate.push({
      $project: {
        createdAt: 1,
        totalTime: 1,
        totalMissed: 1,
        totalErrors: 1,
        totalCorrects: 1,
        isAbandoned: 1,
        QA: 1,
      }
    })
    aggregate.push({
      $unwind: "$QA"
    })
    aggregate.push({
      $match: {
        "QA.timeEslapse": {
          $gte: 0,
        },
      }
    })
    aggregate.push({
      $group: {
        _id: {
          year: {
            $year: "$createdAt",
          },
          month: {
            $month: "$createdAt",
          },
          day: {
            $dayOfMonth: "$createdAt",
          },
          subjectId: "$QA.subject._id",
          id: "$_id",
          question: "$QA.question",
        },
        subjectName: {
          $first: "$QA.subject.name",
        },
        timeEslapse: {
          $first: "$QA.timeEslapse",
        },
        QA: {
          $first: "$QA",
        },
        createdAt: {
          $first: "$createdAt",
        },
      }
    })
    aggregate.push({
      $group: {
        _id: {
          year: {
            $year: "$createdAt",
          },
          month: {
            $month: "$createdAt",
          },
          day: {
            $dayOfMonth: "$createdAt",
          },
          subjectId: "$_id.subjectId",
        },
        subjectId: {
          $first: "$QA.subject._id",
        },
        created: {
          $first: "$createdAt",
        },
        timeEslapse: {
          $sum: {
            $cond: [
              {
                $gt: ["$timeEslapse", 0],
              },
              "$timeEslapse",
              0,
            ],
          },
        },
        totalQuestions: {
          $sum: {
            $cond: [
              {
                $gt: ["$timeEslapse", 0],
              },
              1,
              0,
            ],
          },
        },
      }
    })
    aggregate.push({
      $project: {
        _id: 0,
        created: "$created",
        day: "$_id",
        timeEslapse: "$timeEslapse",
        totalQuestions: "$totalQuestions",
        subjectId: "$subjectId",
      }
    })
    aggregate.push({
      $sort: { created: 1 }
    })
    this.attemptRepository.setInstanceKey(request.instancekey)
    let results = await this.attemptRepository.aggregate(aggregate)
    results = await Promise.all(results.map(async (subject: any) => {
      try {
        const result = await this.subjectRepository.findById(subject.subjectId);
        if (result) {
          subject.name = result.name;
        } else {
          Logger.debug(
            "Instance " +
            request.instancekey +
            " Missing subject with ID: " +
            subject.subjectId.toString()
          );
        }
        return subject;
      } catch (err) {
        Logger.error("Error fetching subject with ID: " + subject.subjectId.toString(), err);
        throw err;
      }
    }));
    return results
  }

  async summaryCorrectByDate(request, condition) {
    var subtract = 0;
    if (request.timezoneoffset) {
      subtract = 60 * 1000 * request.timezoneoffset
    }
    var condition2 = this.createMatch(condition);
    var aggregate = [];
    aggregate.push({
      $match: condition
    })
    aggregate.push({
      $lookup: {
        from: "attemptdetails",
        localField: "_id",
        foreignField: "attempt",
        as: "someField"
      }
    })
    aggregate.push({
      $unwind: "$someField"
    })
    aggregate.push({
      $addFields: {
        QA: "$someField.QA"
      }
    })
    aggregate.push({
      $project: {
        someField: 0
      }
    })
    aggregate.push({
      $match: condition2
    })

    aggregate.push({
      $match: {
        createdAt: {
          $lte: new Date(new Date().getTime() - subtract),
        },
      }
    })
    aggregate.push({
      $project: {
        createdAt: 1,
        totalTime: "$totalTime",
        totalErrors: "$totalErrors",
        isAbandoned: "$isAbandoned",
        QA: "$QA",
      }
    })
    aggregate.push({
      $unwind: "$QA"
    })
    if (request.topic) {
      aggregate.push({
        $match: {
          "QA.topic._id": new Types.ObjectId(request.topic)
        }
      })
    }
    aggregate.push({
      $group: {
        _id: {
          year: {
            $year: "$createdAt",
          },
          month: {
            $month: "$createdAt",
          },
          day: {
            $dayOfMonth: "$createdAt",
          },
          topicId: "$QA.topic._id",
          id: "$_id",
          question: "$QA.question",
        },
        topicId: {
          $first: "$QA.topic._id",
        },
        topicCorrect: {
          $sum: {
            $cond: [
              {
                $eq: ["$QA.status", 1],
              },
              1,
              {
                $cond: [
                  {
                    $eq: ["$QA.status", 5],
                  },
                  1,
                  0,
                ],
              },
            ],
          },
        },
        actualMarks: {
          $sum: "$QA.actualMarks",
        },
        obtainMarks: {
          $sum: "$QA.obtainMarks",
        },
        QA: {
          $first: "$QA",
        },
        createdAt: {
          $first: "$createdAt",
        },
        totalTimeTaken: {
          $first: "$totalTime",
        },
        totalErrors: {
          $first: "$totalErrors",
        },
      }
    })
    aggregate.push({
      $group: {
        _id: {
          year: {
            $year: "$createdAt",
          },
          month: {
            $month: "$createdAt",
          },
          day: {
            $dayOfMonth: "$createdAt",
          },
          topicId: "$topicId",
        },
        topicCorrect: {
          $sum: {
            $cond: [
              {
                $eq: ["$QA.status", 1],
              },
              1,
              {
                $cond: [
                  {
                    $eq: ["$QA.status", 5],
                  },
                  1,
                  0,
                ],
              },
            ],
          },
        },
        actualMarks: {
          $sum: "$actualMarks",
        },
        obtainMarks: {
          $sum: "$obtainMarks",
        },
        topicId: {
          $first: "$topicId",
        },
        created: {
          $first: "$createdAt",
        },
        topic: {
          $first: "$QA.topic.name",
        },
        totalQuestion: {
          $sum: 1,
        },
      }
    })
    aggregate.push({
      $project: {
        _id: 0,
        created: "$created",
        day: "$_id",
        topicCorrect: "$topicCorrect",
        topic: "$topic",
        totalQuestion: "$totalQuestion",
        pecentCorrects: {
          $multiply: [
            {
              $cond: [
                {
                  $eq: ["$actualMarks", 0],
                },
                0,
                {
                  $divide: ["$obtainMarks", "$actualMarks"],
                },
              ],
            },
            100,
          ],
        },
      }
    })
    aggregate.push({
      $sort: { created: 1 }
    })

    this.attemptRepository.setInstanceKey(request.instancekey)
    let results = await this.attemptRepository.aggregate(aggregate)
    return results
  }

  async summarySubjectCorrectByDate(request, condition) {
    try {
      condition.isShowAttempt = true;
      condition.isEvaluated = true;
      if (request.subjects) {
        var subjects = request.subjects.split(",");
        var Objectsubjects = subjects.map((id) => new Types.ObjectId(id))
      } else if (request.user) {
        this.userRepository.setInstanceKey(request.instancekey)
        const sub = await this.userRepository.find(
          { _id: new Types.ObjectId(request.user) },
          { subjects: 1 }
        )
        var Objectsubjects = sub[0].subjects.map((id) => new Types.ObjectId(id))
      } else {
        Objectsubjects = request.userSubjects.map(id => new Types.ObjectId(id))
      }
      condition["subjects._id"] = { $in: Objectsubjects };
      var subtract = 0;
      if (request.timezoneoffset) {
        subtract = 60 * 1000 * request.timezoneOffset
      }

      var aggregate = []
      aggregate.push({
        $match: {
          createdAt: {
            $lte: new Date(new Date().getTime() - subtract),
          },
        },
      });
      aggregate.push({
        $match: condition,
      })
      aggregate.push({
        $lookup: {
          from: "attemptdetails",
          localField: "_id",
          foreignField: "attempt",
          as: "someField"
        }
      })
      aggregate.push({
        $unwind: "$someField"
      })
      aggregate.push({
        $addFields: {
          QA: "$someField.QA"
        }
      })
      aggregate.push({
        $project: {
          someField: 0
        }
      })
      var condition2 = this.createMatch(condition);
      aggregate.push({
        $match: condition2,
      })
      aggregate.push({
        $unwind: "$QA",
      })
      aggregate.push({
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
            day: {
              $dayOfMonth: "$createdAt",
            },
            subjectId: "$QA.subject_id",
            id: "$_id",
            question: "$QA.question",
          },
          subjectName: {
            $first: "$QA.subject.name",
          },
          timeEslapse: {
            $first: "$QA.timeEslapse",
          },
          subjectId: {
            $first: "$QA.subject._id",
          },
          correct: {
            $sum: {
              $cond: [
                {
                  $eq: ["$QA.status", 1],
                },
                1,
                0,
              ],
            },
          },

          QA: {
            $first: "$QA",
          },
          createdAt: {
            $first: "$createdAt",
          },
          totalMissed: {
            $first: "$totalMissed",
          },
          totalCorrects: {
            $first: "$totalCorrects",
          },
          totalTimeTaken: {
            $first: "$totalTime",
          },
          totalErrors: {
            $first: "$totalErrors",
          },
        },
      })
      aggregate.push({
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
            day: {
              $dayOfMonth: "$createdAt",
            },
            subjectId: "$subjectId",
          },
          correct: {
            $sum: {
              $cond: [
                {
                  $eq: ["$correct", 1],
                },
                1,
                0,
              ],
            },
          },
          marks: {
            $sum: "$QA.actualMarks",
          },
          obtainMarks: {
            $sum: "$QA.obtainMarks",
          },
          subjectId: {
            $first: "$QA.subject._id",
          },
          created: {
            $first: "$createdAt",
          },
          timeEslapse: {
            $sum: {
              $cond: [
                {
                  $gt: ["$timeEslapse", 0],
                },
                "$timeEslapse",
                0,
              ],
            },
          },
          totalQuestionDo: {
            $sum: {
              $cond: [
                {
                  $gt: ["$timeEslapse", 0],
                },
                1,
                0,
              ],
            },
          },
          createdAt: {
            $first: "$createdAt",
          },
          totalQuestion: {
            $sum: 1,
          },
        },
      })
      aggregate.push({
        $project: {
          _id: 0,
          created: "$createdAt",
          obtainMarks: 1,
          marks: 1,
          day: "$_id",
          correct: "$correct",
          subjectId: "$subjectId",
          totalQuestion: "$totalQuestion",
          totalQuestionDo: "$totalQuestionDo",
          timeEslapse: "$timeEslapse",
        },
      })
      aggregate.push({
        $project: {
          _id: 0,
          created: 1,
          day: 1,
          correct: 1,
          subjectId: 1,
          totalQuestion: 1,
          totalQuestionDo: 1,
          timeEslapse: 1,
          pecentCorrects: {
            $cond: [
              {
                $eq: ["$marks", 0],
              },
              0,
              {
                $multiply: [
                  {
                    $divide: ["$obtainMarks", "$marks"],
                  },
                  100,
                ],
              },
            ],
          },
        },
      })
      aggregate.push({
        $sort: {
          created: 1,
        },
      })

      this.attemptRepository.setInstanceKey(request.instancekey);
      let results = await this.attemptRepository.aggregate(aggregate)

      if (!results) return results;
      results = await Promise.all(
        results.map(async (subject: any) => {
          try {
            const result = await this.subjectRepository.findById(subject.subjectId);
            if (result) {
              subject.name = result.name;
            } else if (subject.subjectId) {
              Logger.debug(
                "Instance " +
                request.instancekey +
                " Missing subject with ID: " +
                subject.subjectId.toString()
              );
            }
          } catch (err) {
            throw err;
          }
          return subject;
        })
      );
      return results
    } catch (err) {
      Logger.error(err);
      throw "Internal Server error"
    }
  }


  async summarySubjectCorrect(request, condition) {
    var condition2 = this.createMatch(condition)
    var aggregate = []
    aggregate.push({
      $match: condition
    })
    aggregate.push({
      $lookup: {
        from: "attemptdetails",
        localField: "_id",
        foreignField: "attempt",
        as: "someField"
      }
    })
    aggregate.push({
      $unwind: "$someField"
    })
    aggregate.push({
      $addFields: {
        QA: "$someField.QA"
      }
    })
    aggregate.push({
      $project: {
        someField: 0
      }
    })
    aggregate.push({
      $match: condition2
    })

    aggregate.push({
      $unwind: "$QA"
    })
    aggregate.push({
      $group: {
        _id: "$QA.subject._id",
        name: {
          $first: "$QA.subject.name",
        },
        timeEslapse: {
          $sum: {
            $cond: [
              {
                $gt: ["$QA.timeEslapse", 0],
              },
              "$QA.timeEslapse",
              0,
            ],
          },
        },
        totalCorrects: {
          $sum: {
            $cond: [
              {
                $eq: ["$QA.status", 1],
              },
              1,
              0,
            ],
          },
        },

        totalQuestionsDo: {
          $sum: {
            $cond: [
              {
                $or: [
                  {
                    $eq: ["$QA.status", 1],
                  },
                  {
                    $eq: ["$QA.status", 2],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    })

    aggregate.push({
      $project: {
        total: "$totalCorrects",
        timeEslapse: "$timeEslapse",
        totalQuestionsDo: "$totalQuestionsDo",
        name: 1,
      },
    })

    aggregate.push({
      $sort: { total: -1 }
    })
    this.attemptRepository.setInstanceKey(request.instancekey)
    let result = await this.attemptRepository.aggregate(aggregate)
    return result
  }


  async summaryTopicSpeed(request, condition) {
    var condition2 = this.createMatch(condition);
    let aggregate = [];
    aggregate.push({
      $match: condition
    })
    aggregate.push({
      $lookup: {
        from: "attemptdetails",
        localField: "_id",
        foreignField: "attempt",
        as: "someField"
      }
    })
    aggregate.push({
      $unwind: "$someField"
    })
    aggregate.push({
      $addFields: {
        QA: "$someField.QA"
      }
    })
    aggregate.push({
      $project: {
        someField: 0
      }
    })
    aggregate.push({
      $match: condition2
    })

    aggregate.push({
      $unwind: "$QA"
    })

    if (request.subjects) {
      var subjects = request.subjects.split(",");
      var Objectsubjects = subjects.map(id => new Types.ObjectId(id))
      aggregate.push({
        $match: {
          "QA.subject._id": {
            $in: Objectsubjects,
          },
        }
      })
    }
    aggregate.push({
      $group: {
        _id: "$QA.topic._id",
        name: {
          $first: "$QA.topic.name",
        },
        timeEslapse: {
          $sum: {
            $cond: [
              {
                $gt: ["$QA.timeEslapse", 0],
              },
              "$QA.timeEslapse",
              0,
            ],
          },
        },
        number: {
          $sum: {
            $cond: [
              {
                $gt: ["$QA.timeEslapse", 0],
              },
              1,
              0,
            ],
          },
        },
      }
    })

    aggregate.push({
      $project: {
        total: "$number",
        timeEslapse: "$timeEslapse",
        name: 1,
      }
    })
    aggregate.push({
      $sort: { total: -1 }
    })

    this.attemptRepository.setInstanceKey(request.instancekey);
    let result = await this.attemptRepository.aggregate(aggregate)
    return result

  }

  async summaryTopicCorrect(request, condition) {
    var limit = 0;
    if (request.limit) {
      limit = request.limit;
    }
    var aggregate = [];
    var condition2 = this.createMatch(condition)
    aggregate.push({
      $match: condition
    })
    aggregate.push({
      $lookup: {
        from: "attemptdetails",
        localField: "_id",
        foreignField: "attempt",
        as: "someField"
      }
    })
    aggregate.push({
      $unwind: "$someField"
    })
    aggregate.push({
      $addFields: {
        QA: "$someField.QA"
      }
    })
    aggregate.push({
      $project: {
        someField: 0
      }
    })
    aggregate.push({
      $match: condition2
    })

    aggregate.push({
      $unwind: "$QA"
    })

    if (request.subjects) {
      var subjects = request.subjects.split(",");
      var Objectsubjects = subjects.map(id => new Types.ObjectId(id))
      aggregate.push({
        $match: {
          "QA.subject._id": {
            $in: Objectsubjects,
          },
        }
      })
    }
    aggregate.push({
      $match: {
        "QA.status": 2
      }
    })
    aggregate.push({
      $group: {
        _id: "$QA.topic._id",
        name: {
          $first: "$QA.topic.name",
        },
        number: {
          $sum: {
            $cond: [
              {
                $eq: ["$QA.status", 1],
              },
              1,
              0,
            ],
          },
        },
        timeEslapse: {
          $sum: {
            $cond: [
              {
                $eq: ["$QA.status", 1],
              },
              "$QA.timeEslapse",
              0,
            ],
          },
        },
      }
    })
    aggregate.push({
      $project: {
        total: "$number",
        timeEslapse: "$timeEslapse",
        name: 1,
      }
    })

    if (limit > 0) {
      aggregate.push({
        $limit: limit
      })
    }
    aggregate.push({
      $sort: { total: -1 }
    })

    this.attemptRepository.setInstanceKey(request.instancekey)
    let result = await this.attemptRepository.aggregate(aggregate)
    return result;
  }

  async getListTopic(request, condition) {
    var aggregate = [];
    aggregate.push({
      $match: condition,
    })
    aggregate.push({
      $unwind: "$subjects"
    })
    if (request.subjects) {
      aggregate.push({
        $match: {
          "subjects._id": new Types.ObjectId(request.subjects)
        }
      })
    }
    aggregate.push({
      $unwind: "$subjects.units",
    });

    aggregate.push({
      $unwind: "$subjects.units.topics",
    });
    aggregate.push({
      $group: {
        _id: "$subjects.units.topics._id",
        name: {
          $first: "$subjects.units.topics.name",
        },
        subject: {
          $first: "$subjects._id",
        },
      }
    })

    aggregate.push({
      $project: {
        name: 1,
        subject: "$subject",
      }
    })

    aggregate.push({
      $sort: { name: 1 }
    })
    this.attemptRepository.setInstanceKey(request.instancekey)
    let results = await this.attemptRepository.aggregate(aggregate)
    return results
  }

  async getTotalQuestionBySubject(req, condition) {
    var condition2 = this.createMatch(condition);
    var aggregate: any = [];
    aggregate.push({
      $match: condition
    })
    aggregate.push({
      $lookup: {
        from: "attemptdetails",
        localField: "_id",
        foreignField: "attempt",
        as: "someField"
      }
    })
    aggregate.push({
      $unwind: "$someField"
    })
    aggregate.push({
      $addFields: {
        QA: "$someField.QA"
      }
    })
    aggregate.push({
      $project: {
        someField: 0
      }
    })
    aggregate.push({
      $match: condition2
    })

    aggregate.push({
      $unwind: "$QA",
    })
    aggregate.push({
      $group: {
        _id: "$QA.subject._id",
        total: {
          $sum: 1,
        },
        totalVitrual: {
          $sum: {
            $cond: [
              {
                $gte: ["$QA.timeEslapse", 1000],
              },
              1,
              0,
            ],
          },
        },
        timeEslapseVitrual: {
          $sum: {
            $cond: [
              {
                $gte: ["$QA.timeEslapse", 1000],
              },
              "$QA.timeEslapse",
              0,
            ],
          },
        },
        name: {
          $first: "$QA.subject.name",
        },
        timeEslapse: {
          $sum: "$QA.timeEslapse",
        },
      },
    })

    this.attemptRepository.setInstanceKey(req.instancekey)
    let results = await this.attemptRepository.aggregate(aggregate)
    if (!results) {
      return results
    };

    results = await Promise.all(
      results.map(async (subject: any) => {
        try {
          const result = await this.subjectRepository.findById(subject._id);
          if (result) {
            subject.name = result.name;
          } else {
            throw (
              "Instance " +
              req.instancekey +
              " missing subject with ID: " +
              subject._id.toString()
            );
          }
          return subject;
        } catch (err) {
          throw err;  // This will be caught by the outer try-catch block
        }
      })
    );
    return results
  }

  async getTotalQuestionTopic(request, condition) {
    var condition2 = this.createMatch(condition);

    let aggregate = []
    aggregate.push({
      $match: condition
    })
    aggregate.push({
      $lookup: {
        from: "attemptdetails",
        localField: "_id",
        foreignField: "attempt",
        as: "someField"
      }
    })
    aggregate.push({
      $unwind: "$someField"
    })
    aggregate.push({
      $addFields: {
        QA: "$someField.QA"
      }
    })
    aggregate.push({
      $project: {
        someField: 0
      }
    })
    aggregate.push({
      $unwind: "$QA"
    })
    aggregate.push({
      $match: condition2
    })
    if (request.subjects) {
      var subjects = request.subjects.split(",")
      var objSubjects = subjects.map((id) => new Types.ObjectId(id))
      aggregate.push({
        $match: {
          "QA.subject._id": {
            $in: objSubjects
          }
        }
      })
    }
    aggregate.push({
      $group: {
        _id: "$QA.topic._id",
        total: {
          $sum: 1,
        },
        name: {
          $first: "$QA.topic.name",
        },
        timeEslapse: {
          $sum: "$QA.timeEslapse",
        },
      }
    })
    aggregate.push({
      $project: {
        id: 1,
        total: 1,
        name: 1,
        lowerCase: {
          $toLower: "$name",
        },
      }
    })

    aggregate.push({
      $sort: { lowerCase: 1 }
    })
    this.attemptRepository.setInstanceKey(request.instancekey)
    var result = this.attemptRepository.aggregate(aggregate)

    return result;
  }

  async getListSubjects(request, condition) {
    try {
      condition.isShowAttempt = true;
      condition.isEvaluated = true;
      let aggregate = [];
      aggregate.push({
        $match: condition,
      });
      aggregate.push({
        $unwind: "$subjects",
      })
      aggregate.push({
        $group: {
          _id: "$subjects._id",
          name: {
            $first: "$subjects.name",
          }
        }
      })
      aggregate.push({
        $sort: {
          name: 1,
        },
      })
      this.attemptRepository.setInstanceKey(request.instancekey);
      let result = await this.attemptRepository.aggregate(aggregate)
      return result
    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }
  async findOneItem(request, filter) {
    this.attemptRepository.setInstanceKey(request.instancekey)
    let attemptObj = await this.attemptRepository.findOne(filter)
    attemptObj = await this.attemptRepository.populate(attemptObj, [
      {
        path: "attemptdetails",
        select: "-_id QA",
        options: { lean: true },
      },
      {
        path: "user",
        select: {
          salt: 0,
          hashedPassword: 0,
          emailVerifyToken: 0,
          emailVerifyExpired: 0,
          passwordResetToken: 0,
          passwordResetExpired: 0,
        },
      }
    ])

    if (!attemptObj) return attemptObj;
    attemptObj = this.removeAttemptDetails(attemptObj);

    if (!attemptObj.QA) {
      Logger.debug("Undefined QA in attempt " + attemptObj._id.toString());
      throw "Bad Request"
    }
    this.practiceSetRepository.setInstanceKey(request.instancekey)
    let practiceSetObj = await this.practiceSetRepository.findById(attemptObj.practicesetId)
    if (request.isTeacher) {
      if (practiceSetObj.user.toString() !== (request.userId)) {
        throw "Internal Server error"
      }
    }
    this.userRepository.setInstanceKey(request.instancekey)
    let user: any = await this.userRepository.findById(practiceSetObj.user)
    practiceSetObj.user = user.profile;

    if (request.feedbackPage) {
      var toReturn = {
        _id: attemptObj._id,
        practiceset: practiceSetObj,
        QA: attemptObj.QA.map((qa) => {
          return {
            feedback: qa.feedback,
            category: qa.category,
          }
        })
      }
      return toReturn;
    }

    let questions = await this.questionBus.getQuestionsByAttempt(
      request, attemptObj
    )
    var getData = attemptObj.QA;
    practiceSetObj.questions = [];

    getData.forEach((err, indx) => {
      questions.forEach((err, indx1) => {
        var a = getData[indx].question.toString();
        if (questions[indx1]._id) {
          var b = questions[indx1]._id.toString();
          if (a.indexOf(b) > -1) {
            practiceSetObj.questions[indx] = questions[indx1];
          }
        }
      })
    });

    let vlist = await this.redisCaching.getAsync(
      request.instancekey, "khan"
    );
    if (!vlist) {
      this.khanAcademyRepository.setInstanceKey(request.instancekey)
      vlist = await this.khanAcademyRepository.find({})
      await this.redisCaching.set(request, "khan", vlist, 60 * 60 * 24);
    }
    try {
      for (let i = 0; i < practiceSetObj.questions.length; i++) {
        let oQuestion: any = practiceSetObj.questions[i];
        this.topicRepository.setInstanceKey(request.instancekey)
        let topic = await this.topicRepository.findById(oQuestion.topic)

        oQuestion.topic = topic;

        if (topic) {
          let khanTopic: any = await this.redisCaching.getAsync(
            request.instancekey, "khan_topic_" + topic._id
          );
          if (khanTopic) {
            oQuestion["mappings"] = khanTopic.mappings;
            oQuestion["videos"] = khanTopic.videos;
          } else {
            this.mappingRepository.setInstanceKey(request.instancekey)
            let mappingsdata = await this.mappingRepository.find({ perfecticeId: topic._id })

            var vList1 = [];
            for (let m = 0; m < mappingsdata.length; m++) {
              var mappingVideo = fetchVideos(vlist, mappingsdata[m].providerId, topic._id)
              vList1.push(mappingVideo);
            }

            oQuestion["mappings"] = mappingsdata;
            oQuestion["videos"] = vList1;

            await this.redisCaching.set(
              request,
              "khan_topic_" + topic._id,
              { mappings: mappingsdata, videos: vList1 }, 60 * 60 * 24
            )
          }
        }
      }

      attemptObj.practiceSet = practiceSetObj;
      return attemptObj;
    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  conditionSummary(req, withOutSubjectCondition?) {
    var condition: any = {};
    if (req.lastDay) {
      var lastDate: Date = new Date();
      lastDate = new Date(lastDate.setTime(req.lastDay));
      condition.createdAt = {
        $gte: new Date(lastDate)
      }
    }

    if (!withOutSubjectCondition) {
      if (req.subjects) {
        var subjects = req.subjects.split(",");
        var Objectsubjects = subjects.map((id) => new Types.ObjectId(id))
        condition["QA.subject._id"] = {
          $in: Objectsubjects,
        }
      }
    }
    condition.isAbandoned = false;
    return condition
  }

  createMatch(obj) {
    var keys = Object.keys(obj);
    var newObject = {};
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf("QA") + 1) {
        newObject[keys[i]] = obj[keys[i]];
        delete obj[keys[i]]
      }
    }
    return newObject
  }
  getMyFilter(req) {
    var filter: any = [{
      ongoing: { $ne: true }
    }];
    if (req.lastDay) {
      var lastDate = new Date();
      lastDate = new Date(lastDate.setTime(req.lastDay))
      filter.push({
        createdAt: {
          $gte: lastDate
        }
      })
    }
    if (req.onlyDay) {
      var onlyDay = new Date();
      onlyDay = new Date(lastDate.setTime(req.onlyDay));
      filter.push({
        createdAt: {
          $lte: new Date(onlyDay)
        }
      })
    }
    if (req.keyword) {
      var regexText = {
        $regex: regex(req.keyword, 'i')
      };
      filter.push({
        $or: [{
          'practiceSetInfo.title': regexText
        }, {
          'createdBy.name': regexText
        }]
      })
    }
    if (req.publisher) {
      var publisher = req.publisher.split(',');
      filter.push({
        'createdBy.user': {
          $in: publisher
        }
      })
    }
    if (req.subject) {
      var subjects = req.subject.split(',');
      subjects = subjects.map(sub => new Types.ObjectId(sub))
      filter.push({
        'practiceSetInfo.subjects._id': {
          $in: subjects
        }
      })
    } else {
      if (req.user) {
        filter.push({
          'practiceSetInfo.subjects._id': {
            $in: req.userSubjects
          }
        })
      }
    }

    if (req.practice) {
      filter.push({
        practicesetId: new Types.ObjectId(req.practice)
      })
    }

    return filter;
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
  async getLastByStudent(req, condition) {
    condition.isShowAttempt = true;
    this.attemptRepository.setInstanceKey(req.instancekey)
    let attempt = await this.attemptRepository.findOne(condition)
    attempt = await this.attemptRepository.populate(attempt, { path: "user" })
    if (!attempt) return attempt
    this.practiceSetRepository.setInstanceKey(req.instancekey)
    let practicesetObj: any = await this.practiceSetRepository.findById(attempt.practicesetId)
    this.userRepository.setInstanceKey(req.instancekey)
    let user = await this.userRepository.findById(practicesetObj.user)
    practicesetObj.user = user;
    let questions = await this.questionBus.getQuestionsByPractice(req.instancekey, practicesetObj)
    practicesetObj.questions = questions;
    attempt.practiceset = practicesetObj;
    let data = await this.attemptDetailRepository.findOne({
      attempt: attempt._id
    })
    attempt.analysis = data

    return attempt;
  }

  // Returns Loggedin users Attempt

  async findAllByMe(request: FindAllByMeRequest) {
    try {
      var page = request.page ? request.page : 1;
      var limit = request.limit ? request.limit : 10;
      let sort: any = { createdAt: -1 };

      if (request.sort) {
        const [field, order] = request.sort.split(',');
        sort = { [field]: order === 'ascending' ? 1 : -1 };
      }

      var skip = (page - 1) * limit;
      var filter: any = this.getMyFilter(request);

      filter.push({
        $or: [
          {
            isShowAttempt: {
              $exists: false
            }
          },
          {
            isShowAttempt: null
          },
          {
            isShowAttempt: true
          }
        ]
      });
      filter.push({
        user: new Types.ObjectId(request.userId)
      });
      filter.push({
        isAbandoned: false
      });
      this.attemptRepository.setInstanceKey(request.instancekey)
      let docs = await this.attemptRepository.find({ $and: filter }, null, {
        sort: sort,
        skip: skip,
        limit: limit
      })
      docs = await this.attemptRepository.populate(docs, [
        {
          path: 'attemptdetails',
          select: '-_id QA',
          options: { lean: true },
          populate: {
            path: 'QA.question',
            options: { lean: true }
          }
        }, {
          path: 'practicesetId',
          options: { lean: true }
        },
        {
          path: 'ceatedBy.user',
          options: { lean: true }
        }
      ])
      docs = this.removeAttemptDetails(docs)
      return { res: docs }

    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  //Fetch one Attempt by the logged in user
  async getFirstAttempt(request: GetFirstAttemptRequest) {
    try {
      var condition = {
        user: new Types.ObjectId(request.userId),
        isAbandoned: false,
        isShowAttempt: true,
      }

      this.attemptRepository.setInstanceKey(
        request.instancekey
      )

      let attempt = await this.attemptRepository.findOne(condition)
      if (!attempt) {
        return attempt
      }

      return { attempt }
    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async findQuestionFeedback(request: FindQuestionFeedbackRequest) {
    try {
      this.questionFeedbackRepository.setInstanceKey(request.instancekey)
      let qFeedback = await this.questionFeedbackRepository.find({
        attemptId: new Types.ObjectId(request.attemptId)
      })
      return { qFeedback }

    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }

  async findOneAttemptByMe(request: FindOneAttemptByMeRequest) {
    try {
      var condition = {
        user: new Types.ObjectId(request.userId)
      }
      if (request.attemptId.length === 24 && checkForHexRegExp.test(request.attemptId)) {
        condition["_id"] = new Types.ObjectId(request.attemptId)
      } else {
        condition["idOffline"] = new Types.ObjectId(request.attemptId)
      }
      this.attemptRepository.setInstanceKey(request.instancekey)
      let attemptObj = await this.attemptRepository.findOne(condition);
      attemptObj = await this.attemptRepository.populate(attemptObj, [
        {
          path: "user",
          select: "-_id",
          options: { lean: true },
        }, {
          path: "attemptdetails",
          select: "-_id QA",
          options: { lean: true },
        }
      ])

      if (!attemptObj) return attemptObj;
      this.practiceSetRepository.setInstanceKey(request.instancekey)
      let practiceSet: any = await this.practiceSetRepository.findById(attemptObj.practicesetId);
      if (!practiceSet) throw "Not Found";
      this.userRepository.setInstanceKey(request.instancekey)
      let user = await this.userRepository.findById(practiceSet.user)
      if (!user) throw "Not Found";
      practiceSet.user = user;
      attemptObj.practiceset = practiceSet;
      attemptObj = this.removeAttemptDetails(attemptObj);
      return { attemptObj }

    } catch (err) {
      Logger.error(err);
      throw "Internal Server error"
    }
  }

  async isAllowDoTest(request: IsAllowDoTestRequest) {
    try {
      let allowed = await this.redisCaching.getSetting(request, async (settings) => {
        this.practiceSetRepository.setInstanceKey(request.instancekey)
        let practice = await this.practiceSetRepository.findById(request.practiceId);
        if (!practice) throw "Not Found"
        if (!practice.attemptAllowed || practice.attemptAllowed == 0) {
          return { allowed: true }
        }

        this.attendanceRepository.setInstanceKey(request.instancekey)
        let att = await this.attendanceRepository.findOne(
          {
            practicesetId: new Types.ObjectId(request.practiceId),
            studentId: new Types.ObjectId(request.userId)
          }
        )
        var limit = practice.attemptAllowed;
        if (att && att.attemptLimit) {
          limit = att.attemptLimit
        }
        var filter: any = {
          practiceSetId: new Types.ObjectId(request.practiceId),
          user: new Types.ObjectId(request.userId)
        }
        if (!settings.features.fraudDetect) {
          filter.isAbandoned = false;
          filter.ongoing = false;
        }
        this.attemptRepository.setInstanceKey(request.instancekey)
        var count = await this.attemptRepository.countDocuments(filter)
        count = count ? count : 0;

        if (count < limit) {
          return { allowed: true }
        } else {
          return { allowed: false }
        }
      })
      return { allowed }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async findAllByTeacher(request: FindAllByTeacherRequest) {
    try {
      var page = request.page ? request.page : 1;
      var limit = request.limit ? request.limit : 20;
      let sort: any = { createdAt: -1 };

      if (request.sort) {
        const [field, order] = request.sort.split(',');
        if (field == "createdBy.name")
          sort = { [field]: order === 'ascending' ? 1 : -1 };
      }
      var skip = (page - 1) * limit;
      var filter: any = this.getMyFilter(request)
      filter.push({
        user: new Types.ObjectId(request.user)
      })
      filter.push({
        "createdBy.user": new Types.ObjectId(request.userId)
      })
      this.attemptRepository.setInstanceKey(request.instancekey)
      let docs = await this.attemptRepository.find({
        $and: filter
      }, null, {
        skip: skip,
        sort: sort,
        limit: limit,
      })

      docs = await this.attemptRepository.populate(docs, [
        {
          path: "attemptdetails",
          select: "-_id QA",
          options: { lean: true },
        },
        {
          path: "practicesetId",
          options: { lean: true },
        }
      ])
      docs = this.removeAttemptDetails(docs);
      return { docs }
    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  getCurrentDate() {
    return { date: new Date() }
  }

  async countAllByTeacher(request: CountAllByTeacherRequest) {
    var filter: any = this.getMyFilter(request);
    if (request.user) {
      filter.push({
        user: new Types.ObjectId(request.user)
      })
    }
    filter.push({
      "createdBy.user": new Types.ObjectId(request.userId)
    })

    if (request.subject) {
      var subject: any = request.subject.split(",")
      subject = subject.map(id => new Types.ObjectId(id));
      filter.push({
        "practiceSetInfo.subjects._id": {
          $in: subject
        }
      })
    }
    this.attemptRepository.setInstanceKey(request.instancekey)
    let count = await this.attemptRepository.countDocuments({ $and: filter })

    return { count }
  }

  async countMe(request: CountMeRequest) {
    try {
      let count = await this.redisCaching.getSetting(request, async (settings) => {
        if (settings.features.fraudDetect) {
          var filter = this.getMyFilter(request);

          filter.push({
            user: new Types.ObjectId(request.userId),
            ongoing: { $ne: true }
          });
          filter.push({
            $or: [
              {
                isShowAttempt: {
                  $exists: false,
                }
              },
              {
                isShowAttempt: null,
              },
              {
                isShowAttempt: true,
              },
              {
                isShowAttempt: false,
              },
            ]
          });

          if (!request.allowAbandoned) {
            filter.push({
              isAbandoned: false
            })
          }
          this.attemptRepository.setInstanceKey(request.instancekey)
          let count = await this.attemptRepository.countDocuments({
            $and: filter
          })
          return count
        } else {
          var filter: any = [];
          filter.push({
            user: new Types.ObjectId(request.userId),
            ongoing: false
          })
          if (request.practice) {
            var practiceSet = new Types.ObjectId(request.practice)
            filter.push({
              practicesetId: practiceSet
            })
          }
          filter.push({
            isAbandoned: false
          })
          this.attemptRepository.setInstanceKey(request.instancekey)
          let count = await this.attemptRepository.countDocuments({ $and: filter })
          count = count ? count : 0;
          return count
        }
      })
      return { count }
    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async countAll(request: CountAllRequest) {
    try {
      var condition: any = {};
      if (Types.ObjectId.isValid(new Types.ObjectId(request.practice))) {
        condition.practicesetId = new Types.ObjectId(request.practice);
        condition.isAbandoned = false;
        this.attemptRepository.setInstanceKey(request.instancekey)
        let count = await this.attemptRepository.countDocuments(condition)
        count = count ? count : 0;
        return { count }
      } else {
        var code = request.practice;
        this.practiceSetRepository.setInstanceKey(request.instancekey);
        let data = await this.practiceSetRepository.findOne(
          {
            testCode: regexCode(code)
          },
          {
            _id: 1,
          }
        )
        if (!data) {
          throw "PracticeSet not found"
        }
        condition.practicesetId = data._id;
        condition.isAbandoned = false;
        this.attemptRepository.setInstanceKey(request.instancekey);
        let count = await this.attemptRepository.countDocuments(condition)
        count = count ? count : 0;
        return { count }
      }
    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async findAllByPractice(request: FindAllByPracticeRequest) {
    try {
      let attempts = await this.attemptRepository.find({
        practicesetId: new Types.ObjectId(request.practicesetId)
      }, null,
        {
          sort: { "createdAt": -1 }
        });
      attempts = await this.attemptRepository.populate(attempts, [
        {
          path: "user",
          options: { lean: true },
        },
        {
          path: "attemptdetails",
          select: "-_id QA",
          options: { lean: true },
        }
      ])


      const result = await Promise.all(attempts.map(async (oResult) => {
        oResult = this.removeAttemptDetails(oResult);

        oResult.totalQuestion =
          oResult.totalMissed + oResult.totalErrors + oResult.totalCorrects;
        oResult.perCentCorrect = (
          (oResult.totalCorrects * 100) /
          oResult.QA.length
        ).toFixed(2);
        oResult.totalTimeEslapse = 0;

        for (const qa of oResult.QA) {
          oResult.totalTimeEslapse += qa.timeEslapse;
        }

        oResult.averageTime = (
          oResult.totalTimeEslapse /
          1000 /
          oResult.QA.length
        ).toFixed(0);

        return oResult;
      }));
      return { result }

    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }

  async getResultPractice(request: GetResultPracticeRequest) {
    try {
      var condition: {
        practicesetId: Types.ObjectId,
        _id?: Types.ObjectId

      } = {
        practicesetId: new Types.ObjectId(request.practicesetId)
      }
      if (request.attemptId) {
        condition._id = new Types.ObjectId(request.attemptId)
      }
      this.attemptRepository.setInstanceKey(request.instancekey)
      let attempt = await this.attemptRepository.findOne(condition)
      attempt = this.removeAttemptDetails(attempt)
      return { attempt }
    } catch (err) {
      Logger.error(err);
      throw "Internal server Error"
    }
  }

  async getLastByMe(request: GetLastByMeRequest) {
    try {
      var condition: { user: Types.ObjectId, isAbandoned: boolean, practicesetId?: Types.ObjectId } = {
        user: new Types.ObjectId(request.userId),
        isAbandoned: false
      }
      if (request.practicesetId) {
        condition.practicesetId = new Types.ObjectId(request.practicesetId)
      }
      let attempt = await this.getLastByStudent(request, condition)
      return { attempt }
    } catch (err) {
      Logger.error(err);
      throw "Internal server Error"
    }
  }

  async getListAvgSpeedByPractice(request: GetListAvgSpeedByPracticeRequest) {
    var aggregate = [];
    aggregate.push({
      $match: {
        practicesetId: new Types.ObjectId(request.practicesetId)
      }
    })
    aggregate.push({
      $lookup: {
        from: "attemptdetails",
        localField: "_id",
        foreignField: "attempt",
        as: "someField"
      }
    })
    aggregate.push({
      $unwind: "$someField"
    })
    aggregate.push({
      $addFields: {
        QA: "$someField.QA"
      }
    })
    aggregate.push({
      $project: {
        someField: 0
      }
    })
    aggregate.push({
      $unwind: "$QA"
    })
    if (request.subject) {
      aggregate.push({
        $match: {
          "QA.subject._id": new Types.ObjectId(request.subject)
        }
      })
    }

    aggregate.push({
      $group: {
        _id: "$_id",
        totalQuestions: {
          $sum: {
            $cond: [{ $eq: ["$QA.status", 3] }, 0, 1],
          },
        },
        user: {
          $first: "$user",
        },
        totalTime: {
          $first: "$totalTime",
        },
        realTime: {
          $sum: "$QA.timeEslapse",
        },
      }
    })

    aggregate.push({
      $project: {
        totalQuestions: "$totalQuestions",
        user: "$user",
        realTime: "$realTime",
        totalTime: "$totalTime",
        avgSpeed: {
          $cond: [
            {
              $eq: ["$totalQuestions", 0],
            },
            0,
            {
              $divide: ["$realTime", "$totalQuestions"],
            },
          ],
        },
      }
    })
    aggregate.push({
      $group: {
        _id: "$user",
        user: {
          $first: "$user",
        },
        totalQuestions: {
          $first: "$totalQuestions",
        },
        realTime: {
          $min: "$realTime",
        },
        totalTime: {
          $min: "$totalTime",
        },
        avgSpeed: {
          $min: "$avgSpeed",
        },
      }
    })

    aggregate.push({
      $sort: { avgSpeed: 1 }
    })
    this.attemptRepository.setInstanceKey(request.instancekey)
    let result = await this.attemptRepository.aggregate(aggregate)

    return { result }
  }

  async getListPercentCorrectByPractice(request: GetListPercentCorrectByPracticeRequest) {
    try {
      var condition = {
        practicesetId: new Types.ObjectId(request.practicesetId),
      };
      var aggregate = [];
      aggregate.push({
        $match: condition,
      })
      aggregate.push({
        $lookup: {
          from: "attemptdetails",
          localField: "_id",
          foreignField: "attempt",
          as: "someField"
        }
      })
      aggregate.push({
        $unwind: "$someField"
      })
      aggregate.push({
        $addFields: {
          QA: "$someField.QA"
        }
      })
      aggregate.push({
        $project: {
          someField: 0
        }
      })
      if (request.subject) {
        aggregate.push({
          $unwind: "$QA",
        })
        condition["QA.subject._id"] = new Types.ObjectId(request.subject)
        aggregate.push({
          $group: {
            _id: "$_id",
            totalQuestions: {
              $sum: 1,
            },
            totalCorrects: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$QA.status", 1],
                  },
                  1,
                  0,
                ],
              },
            },
            user: {
              $first: "$user",
            },
          },
        })
      } else {
        aggregate.push({
          $unwind: "$QA",
        })
        aggregate.push({
          $group: {
            _id: "$_id",
            totalQuestions: {
              $sum: 1,
            },
            totalCorrects: {
              $first: "$totalCorrects",
            },
            user: {
              $first: "$user",
            },
          }
        })
      }

      var condition2 = this.createMatch(condition);

      aggregate.push({
        $match: condition2
      })

      aggregate.push({
        $project: {
          totalQuestions: "$totalQuestions",
          user: "$user",
          totalCorrects: "$totalCorrects",
          accuracyPercent: {
            $cond: [
              {
                $eq: ["$totalQuestions", 0],
              },
              0,
              {
                $multiply: [
                  {
                    $divide: ["$totalCorrects", "$totalQuestions"],
                  },
                  100,
                ],
              },
            ],
          },
        }
      })
      aggregate.push({
        $group: {
          _id: "$user",
          user: {
            $first: "$user",
          },
          totalQuestions: {
            $first: "$totalQuestions",
          },
          totalCorrects: {
            $max: "$totalCorrects",
          },
          accuracyPercent: {
            $max: "$accuracyPercent",
          },
        },
      })
      aggregate.push({
        $sort: {
          accuracyPercent: -1,
        },
      })
      this.attemptRepository.setInstanceKey(request.instancekey)
      let result = await this.attemptRepository.aggregate(aggregate)

      return { result }

    } catch (err) {
      Logger.error(err);

      throw "Internal server error"
    }
  }

  async getPsychoClassroom(request: GetPsychoClassroomRequest) {
    try {
      this.psychoResultRepository.setInstanceKey(request.instancekey)
      this.psychoResultRepository.setInstanceKey(request.instancekey)
      let result = await this.psychoResultRepository.distinct(
        "classrooms",
        { practiceset: new Types.ObjectId(request.practiceset) }
      )
      let query: any = { _id: { $in: result } };
      if (request.userRole == config.roles.teacher) {
        query.$or = [
          {
            user: new Types.ObjectId(request.userId)
          },
          {
            owners: new Types.ObjectId(request.userId)
          }
        ]
      } else {
        if (request.userRole == config.roles.centerHead) {
          let locations = request.locations.map(l => new Types.ObjectId(l))
          query.location = {
            $in: locations
          }
        }
      }
      this.classroomRepository.setInstanceKey(request.instancekey)
      let classes = await this.classroomRepository.find(query, { name: 1 })
      return { classes }

    } catch (err) {
      Logger.error(err);
      throw "Internal Server error"
    }
  }

  async getAllProviders(request: GetAllProvidersRequest) {
    try {
      var query = {
        contentProviders: 1,
        _id: 0,
      }
      this.settingRepository.setInstanceKey(request.instancekey)
      let contents = await this.settingRepository.findOne(
        {
          slug: "whiteLabel",
        },
        query
      )

      return { contents }
    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async findOneByMe(request: FindOneByMeRequest) {
    try {
      var condition = {}
      if (request.attemptId.length === 24 && checkForHexRegExp.test(request.attemptId)) {
        condition["_id"] = new Types.ObjectId(request.attemptId)
      } else {
        condition["idOffline"] = new Types.ObjectId(request.attemptId)
      }
      this.attemptRepository.setInstanceKey(request.instancekey)
      let attemptObj: any = await this.attemptRepository.findOne(condition)
      attemptObj = await this.attemptRepository.populate(attemptObj, {
        path: "attemptdetails",
        select: "-_id QA",
        options: { lean: true },
      })
      if (!attemptObj) return attemptObj

      attemptObj = this.removeAttemptDetails(attemptObj);
      this.practiceSetRepository.setInstanceKey(request.instancekey)
      this.userRepository.setInstanceKey(request.instancekey)
      let practiceSetObj: any = await this.practiceSetRepository.findById(attemptObj.practicesetId)
      let user: any = await this.userRepository.findById(
        practiceSetObj.user
      )
      practiceSetObj.user = user.profile;
      let questions: any = await this.questionBus.getQuestionsByAttempt(request, attemptObj)
      var getData: any = attemptObj.QA;
      practiceSetObj.questions = [];

      getData.forEach(function (qa, indx) {
        questions.some(function (q, indx1) {
          var a = getData[indx].question.toString();
          var b = questions[indx1]._id.toString();
          if (a.indexOf(b) > -1) {
            practiceSetObj.questions[indx] = questions[indx1];

            // Rearrange answers if they are randomized
            if (qa.answerOrder && qa.answerOrder.length) {
              let newAnsOrder = [];
              qa.answerOrder.forEach((a) => {
                q.answers.some((oa) => {
                  if (oa._id.equals(a)) {
                    newAnsOrder.push(oa);
                    return true;
                  }
                });
              });
              // Simple validate
              if (newAnsOrder.length == q.answers.length) {
                q.answers = newAnsOrder;
              }
            }

            return true;
          }
        });
      });
      let vlist = await this.redisCaching.getAsync(
        request.instancekey,
        "khan"
      );

      if (!vlist) {
        this.khanAcademyRepository.setInstanceKey(request.instancekey)
        vlist = await this.khanAcademyRepository.find({})
        await this.redisCaching.set(request, "khan", vlist, 60 * 60 * 24);
      }

      try {
        for (let i = 0; i < practiceSetObj.questions.length; i++) {
          let oQuestion = practiceSetObj.questions[i];
          this.topicRepository.setInstanceKey(request.instancekey)
          let topic = await this.topicRepository.findById(oQuestion.topic)

          oQuestion.topic = topic;

          if (topic) {

            let khanTopic: any = await this.redisCaching.getAsync(
              request.instancekey, "khan_topic_" + topic._id
            );
            if (khanTopic) {
              oQuestion["mappings"] = khanTopic.mappings;
              oQuestion["videos"] = khanTopic.videos;
            } else {
              this.mappingRepository.setInstanceKey(request.instancekey)
              let mappingsdata = await this.mappingRepository.find({ perfecticeId: topic._id })

              var vList1 = [];
              for (let m = 0; m < mappingsdata.length; m++) {
                var mappingVideo = fetchVideos(vlist, mappingsdata[m].providerId, topic._id)
                vList1.push(mappingVideo);
              }

              oQuestion["mappings"] = mappingsdata;
              oQuestion["videos"] = vList1;

              this.redisCaching.set(
                request,
                "khan_topic_" + topic._id,
                { mappings: mappingsdata, videos: vList1 }, 60 * 60 * 24
              )
            }
          }
        }

        attemptObj.practiceset = practiceSetObj;
        return { attemptObj };
      } catch (err) {
        Logger.error(err);
        throw "Internal Server Error"
      }
    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async invitation(request: InvitationRequest) {
    try {
      var filter = {
        _id: new Types.ObjectId(request.attemptId)
      }

      request.isTeacher = true;

      let attemptObj = await this.findOneItem(request, filter)

      return { attemptObj }
    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async findAllNotCreatedBy(request: FindAllNotCreatedByRequest) {
    try {
      var filter = {
        "practiceSetInfo.createdBy": null,
      }
      this.attemptRepository.setInstanceKey(request.instancekey)
      let attempts = await this.attemptRepository.find(filter)
      attempts = await this.attemptRepository.populate(attempts,
        {
          path: "practicesetId",
          select: "user"
        }
      )
      if (attempts.length === 0) {
        throw "Not Found"
      }

      async.map(
        attempts,
        (attempt, cb) => {
          cb(null, _.pick(attempt, "_id", "practiceSetInfo"));
        }, (err, results) => {
          return { results }
        }
      )
      return { attempts }
    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async getListSubjectsMe(request: GetListSubjectsMeRequest) {
    try {
      var condition = this.conditionSummary(request, true)
      var Objectsubjects = [];
      if (request.subjects) {
        var subjects = request.subjects.split(",")
        Objectsubjects = subjects.map((id) => new Types.ObjectId(id))
      } else if (request.user) {
        this.userRepository.setInstanceKey(request.instancekey)
        const sub = await this.userRepository.find(
          { _id: request.user },
          { subjects: 1 }
        )
        Objectsubjects = sub[0].subjects.map((id) => new Types.ObjectId(id))
      } else {
        Objectsubjects = request.userSubjects.map((id) => new Types.ObjectId(id))
      }

      if (request.user) {
        condition.user = new Types.ObjectId(request.user);
      } else {
        condition.user = new Types.ObjectId(request.userId);
      }
      condition["subjects._id"] = { $in: Objectsubjects };
      let results = await this.getListSubjects(request, condition)
      return { results }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getTotalQuestionTopicMe(request: GetTotalQuestionTopicMeRequest) {
    try {
      var condition: any = this.conditionSummary(request);
      condition.user = new Types.ObjectId(request.userId);
      let result = await this.getTotalQuestionTopic(request, condition);
      return { result }

    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async getTotalQuestionBySubjectMe(request: GetTotalQuestionBySubjectMeRequest) {
    try {
      var condition = this.conditionSummary(request);
      condition.user = new Types.ObjectId(request.userId);
      let result = await this.getTotalQuestionBySubject(request, condition)
      return { result }

    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }

  async getListTopicsMe(request: GetListTopicsMeRequest) {
    try {
      var condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.userId);
      condition.isShowAttempt = true;
      condition.isEvaluated = true;

      let result = await this.getListTopic(request, condition);
      return { result }
    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }

  async summaryTopicCorrectMe(request: SummaryTopicCorrectMeRequest) {
    var condition = this.conditionSummary(request, true)
    condition.user = new Types.ObjectId(request.userId);
    let result = await this.summaryTopicCorrect(request, condition)

    return { result }
  }

  async summaryTopicSpeedMe(request: SummaryTopicSpeedMeRequest) {
    try {
      var condition = this.conditionSummary(request, true)
      condition.user = new Types.ObjectId(request.userId)
      let result = await this.summaryTopicSpeed(request, condition)
      return { result }
    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async summarySubjectCorrectMe(request: SummarySubjectCorrectMeRequest) {
    try {
      var condition = this.conditionSummary(request);
      condition.user = new Types.ObjectId(request.userId);
      let result = await this.summarySubjectCorrect(request, condition)
      return { result }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async summarySubjectCorrectByDateMe(request: SummarySubjectCorrectByDateMeRequest) {
    try {
      var condition = this.conditionSummary(request);
      if (request.user) {
        condition.user = new Types.ObjectId(request.user)
      } else {
        condition.user = new Types.ObjectId(request.userId)
      }
      let results = await this.summarySubjectCorrectByDate(request, condition)
      return { results }

    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async summaryCorrectByDateMe(request: SummaryCorrectByDateMeRequest) {
    try {
      var condition = this.conditionSummary(request)
      condition.user = new Types.ObjectId(request.userId);
      condition.isShowAttempt = true;
      let results = await this.summaryCorrectByDate(request, condition)

      return { results }
    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async summarySubjectSpeedByDateMe(request: SummarySubjectSpeedByDateMeRequest) {
    try {
      var condition = this.conditionSummary(request, true)
      condition.user = new Types.ObjectId(request.userId);
      condition.isEvaluated = true;
      let results = await this.summarySubjectSpeedByDate(request, condition)
      return { results }

    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async summaryAttemptedBySubjectMe(request: SummaryAttemptedBySubjectMeRequest) {
    try {
      var condition: any = {};
      condition = this.conditionSummary(request, true)
      condition.user = new Types.ObjectId(request.userId);
      condition.isShowAttempt = true;
      condition.isEvaluated = true;
      let results = await this.summaryAttemptedBySubject(request, condition)
      return { results }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async summarySubjectSpeedMe(request: SummarySubjectSpeedMeRequest) {
    try {
      var condition = this.conditionSummary(request)
      condition.user = new Types.ObjectId(request.userId);
      let results = await this.summarySubjectSpeed(request, condition)
      return { results }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async summaryQuestionByTopicMe(request: SummaryQuestionByTopicMeRequest) {
    try {
      var condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.userId);
      condition.isShowAttempt = true;
      let results = await this.summaryQuestionByTopic(request, condition)
      return { results }
    } catch (err) {
      throw "Internal server error"
    }
  }

  //62a1681c8c09981b25675410
  //change isAbandoned to true
  async summaryAbondonedMe(request: SummaryAbondonedMeRequest) {
    var filter = [];
    filter.push({
      user: new Types.ObjectId(request.userId)
    })
    let results = await this.summaryAbondoned(request, filter);
    return { results }
  }

  async summaryPracticeMe(request: SummaryPracticeMeRequest) {
    try {
      var filter = [];
      filter.push({
        user: new Types.ObjectId(request.userId)
      })
      filter.push({
        isShowAttempt: true
      })
      let results = await this.summaryPractice(request, filter)
      return { results }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async summaryQuestionBySubjectMe(request: SummaryQuestionBySubjectMeRequest) {
    try {
      var condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.userId);
      let results = await this.summaryQuestionBySubject(request, condition)
      return { results }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async summaryDoPracticeRoute(request: SummaryDoPracticeRequest) {
    try {
      let filter: any = [{ isShowAttempt: true }];
      filter = this.conditionCount(request, filter);
      if (request.user) {
        filter.push({
          user: new Types.ObjectId(request.user)
        })
        let results = await this.summaryDoPractice(request, filter)

        return { results }
      } else {
        filter.push({
          user: new Types.ObjectId(request.userId)
        })
        let results = await this.summaryDoPractice(request, filter)

        return { results }
      }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  //UserId: 62962ec9e855ce85473fac84
  async questionByConfidence(request: QuestionByConfidenceRequest) {
    try {
      let condition = {
        user: new Types.ObjectId(request.user)
      }
      let aggregate = [];
      aggregate.push({
        $match: condition
      })
      aggregate.push(
        {
          $unwind: "$QA"
        },
      )
      if (request.limit) {
        aggregate.push(
          {
            $limit: request.limit
          }
        )
      }
      aggregate.push({
        $project: {
          "QA.hasMarked": 1,
          "QA.answerChanged": 1,
          "QA.topic.name": 1,
          "QA.subject.name": 1,
        }
      })
      this.attemptDetailRepository.setInstanceKey(request.instancekey)
      let attempt = await this.attemptDetailRepository.aggregate(aggregate)

      let groupBySubject = _.groupBy(attempt, (o: any) => o.QA.subject.name)
      let groupByTopic = _.groupBy(attempt, (o: any) => o.QA.topic.name)

      let reformatter = (item, type) => {
        _.forOwn(item, function (value, key) {
          var n = 0;
          var p = 0;
          _.forOwn(value, function (value1, key) {

            n += value1.QA?.answerChanged;
            p += value1.QA?.hasMarked;
          });
          item[key] = {
            answerChanged: n,
            hasMarked: p,
          };
        });
        var arr: any = [];
        _.forOwn(item, function (value, key) {
          var obj = {};
          obj[type] = key;
          obj["answerChanged"] = value?.answerChanged;
          obj["hasMarked"] = value?.hasMarked;
          arr.push(obj);
        });
        //sort
        arr.sort(function (a, b) {
          var A = a?.answerChanged + a?.hasMarked;
          var B = b?.answerChanged + b?.hasMarked;
          return A > B;
        });
        return arr;
      }
      groupBySubject = reformatter(groupBySubject, "subject");
      groupByTopic = reformatter(groupByTopic, "topic");

      var obj = {
        Subject: groupBySubject,
        Topic: groupByTopic,
      };
      return { results: obj }

    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async summarySpeedTopicByDateMe(request: SummarySpeedTopicByDateMeRequest) {
    try {
      let condition = this.conditionSummary(request, true)
      condition.user = new Types.ObjectId(request.userId)
      condition.isShowAttempt = true;

      let results = await this.summarySpeedTopicByDate(request, condition)
      return { results }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async getSpeedRank(request: GetSpeedRankRequest) {
    try {
      let pipeline = [];
      pipeline.push(
        {
          $match: {
            practicesetId: new Types.ObjectId(request.practicesetId),
            isAbandoned: false,
            isEvaluated: true,
          }
        },
        {
          $lookup: {
            from: "attemptdetails",
            localField: "_id",
            foreignField: "attempt",
            as: "someField"
          }
        },
        {
          $unwind: "$someField"
        },
        {
          $addFields: {
            QA: "$someField.QA"
          }
        },
        {
          $project: {
            someField: 0
          }
        },
        {
          $unwind: "$QA",
        }
      )
      if (request.subject) {
        pipeline.push({
          $match: {
            "QA.subject._id": new Types.ObjectId(request.subject)
          }
        })
      }
      pipeline.push(
        {
          $group: {
            _id: "$_id",
            totalQuestions: {
              $sum: {
                $cond: [{ $eq: ["$QA.status", 3] }, 0, 1],
              },
            },
            user: {
              $first: "$user",
            },
            totalTime: {
              $first: "$totalTime",
            },
            realTime: {
              $sum: "$QA.timeEslapse",
            },
          }
        },
        {
          $project: {
            totalQuestions: "$totalQuestions",
            user: "$user",
            realTime: "$realTime",
            totalTime: "$totalTime",
            avgSpeed: {
              $cond: [
                {
                  $eq: ["$totalQuestions", 0],
                },
                0,
                {
                  $divide: ["$realTime", "$totalQuestions"],
                },
              ],
            },
          }
        },
        {
          $group: {
            //Prajval M : inside group $group was used (The field '$group' must be an accumulator object)
            _id: "$user",
            user: {
              $first: "$user",
            },
            totalQuestions: {
              $first: "$totalQuestions",
            },
            realTime: {
              $min: "$realTime",
            },
            totalTime: {
              $min: "$totalTime",
            },
            avgSpeed: {
              $min: "$avgSpeed",
            },
          }
        },
        {
          $sort: { avgSpeed: 1 }
        }
      )
      this.attemptRepository.setInstanceKey(request.instancekey)
      let result: any = await this.attemptRepository.aggregate(pipeline)
      if (!result) return { rank: null }
      let $post = _.findIndex(result, function (index) {
        if (request.user) {
          return index.user.toString() == request.user.toString();
        } else {
          return index.user.toString() == request.userId.toString();
        }
      });
      if ($post > -1) {
        let avgSpeed = result[$post].avgSpeed;

        let newRank = _.findIndex(result, function (index) {
          return index.avgSpeed == avgSpeed
        });
        if (newRank > -1) {
          if (newRank > $post) {
            return { rank: $post + 1 }
          } else {
            return { rank: newRank + 1 }
          }
        }
      } else {
        return { rank: null }
      }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async getAccuracyRank(request: GetAccuracyRankRequest) {
    try {
      let pipeline = [];
      pipeline.push(
        {
          $match: {
            practicesetId: new Types.ObjectId(request.practicesetId),
            isAbandoned: false
          },
        },
        {
          $lookup: {
            from: "attemptdetails",
            localField: "_id",
            foreignField: "attempt",
            as: "someField"
          }
        },
        {
          $unwind: "$someField"
        },
        {
          $addFields: {
            QA: "$someField.QA"
          }
        },
        {
          $project: {
            someField: 0
          }
        },
        {
          $unwind: "$QA",
        }
      );
      if (request.subject) {
        pipeline.push({
          $match: {
            "QA.subject._id": new Types.ObjectId(request.subject)
          }
        })
      }
      pipeline.push(
        {
          $group: {
            _id: "$_id",
            totalQuestions: {
              $sum: 1,
            },
            totalCorrects: {
              $first: "$totalCorrects",
            },
            user: {
              $first: "$user",
            },
          }
        },
        {
          $project: {
            totalQuestions: 1,
            user: 1,
            totalCorrects: 1,
            accuracyPercent: {
              $cond: [
                {
                  $eq: ["$totalQuestions", 0],
                },
                0,
                {
                  $multiply: [
                    {
                      $divide: ["$totalCorrects", "$totalQuestions"],
                    },
                    100,
                  ],
                },
              ],
            },
          }
        },
        {
          $group: {
            _id: "$user",
            user: {
              $first: "$user",
            },
            totalQuestions: {
              $first: "$totalQuestions",
            },
            totalCorrects: {
              $max: "$totalCorrects",
            },
            accuracyPercent: {
              $max: "$accuracyPercent",
            },
          }
        },
        {
          $sort: { accuracyPercent: -1 }
        }
      )

      this.attemptRepository.setInstanceKey(request.instancekey);
      let result: any = await this.attemptRepository.aggregate(pipeline)


      if (!result) return { rank: null }
      let $post = _.findIndex(result, function (index) {
        if (request.user) {
          return index.user.toString() == request.user.toString();
        } else {
          return index.user.toString() == request.userId.toString();
        }
      });
      if ($post > -1) {
        var accuracyPercent = result[$post].accuracyPercent;
        var newRank = _.findIndex(result, function (index) {
          return index.accuracyPercent == accuracyPercent;
        });
        if (newRank > -1) {
          if (newRank > $post) {
            return { rank: $post + 1 }
          } else {
            return { rank: newRank + 1 }
          }
        }
      } else {
        return { rank: null }
      }
    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }

  async getAccuracyPercentile(request: GetAccuracyPercentileRequest) {
    try {
      if (!request.subject) {
        this.attemptRepository.setInstanceKey(request.instancekey);
        let result: any = await this.attemptRepository.findById(new Types.ObjectId(request.attemptId));

        if (!result) throw "Not Found";
        let condition: any = {
          user: {
            $ne: new Types.ObjectId(result.user)
          },
          practicesetId: new Types.ObjectId(result.practicesetId)
        }
        condition.isEvaluated = true;
        let condition2 = this.createMatch(condition);
        let pipeline = [];
        pipeline.push(
          {
            $match: condition
          },
          {
            $lookup: {
              from: "attemptdetails",
              localField: "_id",
              foreignField: "attempt",
              as: "someField"
            }
          },
          {
            $unwind: "$someField"
          },
          {
            $addFields: {
              QA: "$someField.QA"
            }
          },
          {
            $project: {
              someField: 0
            }
          },
          {
            $match: condition2
          },
          {
            $unwind: "$QA"
          },
          {
            $group: {
              _id: "$_id",
              createdAt: {
                $first: "$createdAt",
              },
              totalQuestions: {
                $sum: 1,
              },
              totalCorrects: {
                $first: "$totalCorrects",
              },
              user: {
                $first: "$user",
              },
              marks: {
                $sum: "$QA.actualMarks",
              },
              obtainMarks: {
                $sum: "$QA.obtainMarks",
              },
            },
          },
          {
            $project: {
              marks: 1,
              obtainMarks: 1,
              totalQuestions: "$totalQuestions",
              user: "$user",
              day: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              totalCorrects: "$totalCorrects",
            },
          },
          {
            $project: {
              totalQuestions: 1,
              user: 1,
              day: 1,
              totalCorrects: 1,
              accuracyPercent: {
                $cond: [
                  {
                    $eq: ["$marks", 0],
                  },
                  0,
                  {
                    $multiply: [
                      {
                        $divide: ["$obtainMarks", "$marks"],
                      },
                      100,
                    ],
                  },
                ],
              },
            },
          },
          {
            $group: {
              _id: "$user",
              user: {
                $first: "$user",
              },
              day: {
                $first: "$day",
              },
              totalQuestions: {
                $first: "$totalQuestions",
              },
              totalCorrects: {
                $max: "$totalCorrects",
              },
              accuracyPercent: {
                $max: "$accuracyPercent",
              },
            },
          },
          {
            $sort: {
              accuracyPercent: 1,
            },
          }
        )
        let percents = await this.attemptRepository.aggregate(pipeline);
        if (!percents) {
          return { res: null }
        }
        result = await this.calculatePercentile(percents, result, request)
        return { result }
      } else {
        let result = await this.getAccuracyPercentileSubject(request)
        return { result }
      }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async classroomListSubjectStudentDo(request: ClassroomListSubjectStudentDoRequest) {
    try {
      let condition = this.conditionSummary(request, true);
      condition["practiceSetInfo.accessMode"] = "invitation";
      condition["practiceSetInfo.classRooms"] = new Types.ObjectId(request.classroomId)
      condition["createdBy.user"] = new Types.ObjectId(request.userId);
      let result = await this.getListSubjects(request, condition)
      return { result }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async classroomListTopicStudentDo(request: ClassroomListTopicStudentDoReq) {
    try {
      let listUser = await this.studentBus.getUserIdList(request)
      if (!listUser || listUser.length == 0) {
        return null
      } else {
        var condition = this.conditionSummary(request, true);
        condition["user"] = {
          $in: listUser,
        }
        condition["practiceSetInfo.accessMode"] = "invitation";
        condition["practiceSetInfo.classRooms"] = {
          $in: [new Types.ObjectId(request.query.classroom)]
        }

        let results = await this.getListTopic(request, condition)

        return { results }
      }
    } catch (err) {
      throw new GrpcInternalException(err.message);
    }
  }

  async classroomSummaryQuestionBySubject(request: ClassroomListTopicStudentDoReq) {
    try {
      let listUser = await this.studentBus.getUserIdList(request)
      if (!listUser || listUser.length == 0) {
        return null
      } else {
        let condition = this.conditionSummary(request, true);
        condition["user"] = {
          $in: listUser,
        }
        condition["practiceSetInfo.accessMode"] = "invitation";
        condition['createdBy.user'] = new Types.ObjectId(request.user._id);

        const active = {
          "user": new Types.ObjectId(request.user._id),
          $or: [{ "active": { $exists: false } }, { "active": true }]
        }

        this.classroomRepository.setInstanceKey(request.instancekey);
        const classes = await this.classroomRepository.find({ active });

        const stuArr = classes.map(c => c._id);

        if (request.query.classroom === '000000000000000000000000') {
          condition['practiceSetInfo.classRooms'] = { $in: stuArr };
        } else {
          condition['practiceSetInfo.classRooms'] = {
            $in: [new Types.ObjectId(request.query.classroom)]
          };
        }

        const results = await this.summaryQuestionBySubject(request, condition);

        return { results }
      }
    } catch (err) {
      throw new GrpcInternalException(err.message);
    }
  }

  async classroomSummaryAttempted(request: ClassroomListTopicStudentDoReq) {
    try {
      let listUser = await this.studentBus.getUserIdList(request)
      if (!listUser || listUser.length == 0) {
        return null
      } else {
        let condition = this.conditionSummary(request, true);
        condition["user"] = { $in: listUser }
        condition["practiceSetInfo.accessMode"] = "invitation";
        condition['createdBy.user'] = new Types.ObjectId(request.user._id);
        condition['practiceSetInfo.classRooms'] = new Types.ObjectId(request.query.classroom);
        condition['createdBy.user'] = new Types.ObjectId(request.user._id);

        if (request.query.subjects) {
          const results = await this.summaryAttemptedBySubject(request, condition);

          return { results }
        } else {
          const results = await this.getClassroomSummaryAttempted(request, condition);
          return results
        }
      }
    } catch (err) {
      throw new GrpcInternalException(err.message);
    }
  }

  //Used by classroomSummaryAttempted function
  async getClassroomSummaryAttempted(request: any, condition: any) {
    let match = {};
    let group: any = {};
    let groupAll = {};

    let condition2 = this.createMatch(condition)

    let match2 = { $match: condition2 }

    match = { $match: condition };
    let unwind = { $unwind: "$QA" };
    let groupAttempted = {
      $group: {
        _id: "$_id",
        totalDoQuestions: {
          "$sum": { "$cond": [{ "$eq": ["$QA.status", 3] }, 0, 1] }
        },
        user: { $first: "$user" },
        totalTime: { $first: "$totalTime" },
        totalCorrects: { $first: "$totalCorrects" },
        totalMissed: { $first: "$totalMissed" },
        totalQuestions: { $first: "$totalQuestions" },
        totalErrors: { $first: "$totalErrors" },
        practicesetId: { $first: "$practicesetId" }
      }
    };
    group = {
      $group: {
        _id: "$practicesetId",
        totalQuestions: { $first: "$totalQuestions" },
        totalQuestionDo: {
          $sum: { $add: ["$totalMissed", "$totalCorrects", "$totalErrors"] }
        },
        totalMissed: { $sum: "$totalMissed" },
        totalCorrects: { $sum: "$totalCorrects" },
        totalTimeTaken: { $sum: "$totalTime" },
        totalAttempt: { $sum: 1 }
      }
    };
    groupAll = {
      $group: {
        _id: null,
        totalQuestions: { $sum: '$totalQuestions' },
        totalQuestionDo: { $sum: '$totalQuestionDo' },
        totalMissed: { $sum: "$totalMissed" },
        totalCorrects: { $sum: "$totalCorrects" },
        totalTimeTaken: { $sum: "$totalTimeTaken" },
        totalAttempt: { $sum: "$totalAttempt" },
        totalPractices: { $sum: 1 }
      }
    };
    let sort = { $sort: { '_id': 1 } };

    let search = {
      $match: {
        'classRooms': {
          "$in": [new Types.ObjectId(request.query.classroom)]
        },
        'user': new ObjectId(request.user._id)
      }
    };

    group = { $group: { _id: null, count: { $sum: 1 } } };

    const response: any = await this.practiceSetRepository.aggregate([search, group]);
    const result: any = await this.attemptRepository.aggregate([match, globals.lookup, globals.unw, globals.add, globals.pro, match2, unwind, groupAttempted, group, sort, groupAll])

    if (result.length > 0) {
      if (response.length > 0) {
        result[0].totalPractices = response[0].count;
      }
      return result[0];
    } else {
      let obj = null;
      if (response.length > 0) {
        obj = {
          "_id": null,
          "totalQuestions": 0,
          "totalQuestionDo": 0,
          "totalMissed": 0,
          "totalCorrects": 0,
          "totalTimeTaken": 0,
          "totalAttempt": 0,
          "totalPractices": response[0].count
        }
      }

      return { obj };
    }
  }

  async classroomSummaryAttemptedAllClassrooms(request: ClassroomListTopicStudentDoReq) {
    try {
      let listUser = await this.studentBus.getUserIdList(request)
      if (!listUser || listUser.length == 0) {
        return null
      }

      let condition = this.conditionSummary(request, true);
      condition["user"] = { $in: listUser }

      if (request.query.classroom) {
        condition['practiceSetInfo.classRooms'] = { $in: [new Types.ObjectId(request.query.classroom)] };
      } else {
        condition.$and = [
          { 'practiceSetInfo.classRooms': { $exists: true } },
          { 'practiceSetInfo.classRooms': { $ne: [] } }
        ]
      }

      condition['createdBy.user'] = new Types.ObjectId(request.user._id);

      if (request.query.subjects) {
        const results = await this.summaryAttemptedBySubject(request, condition);
        return { results }
      } else {
        const results = await this.getClassroomSummaryAttempted(request, condition);
        return results
      }
    } catch (err) {
      throw new GrpcInternalException(err.message);
    }
  }

  async classroomSummaryQuestionByTopic(request: ClassroomListTopicStudentDoReq) {
    try {
      let listUser = await this.studentBus.getUserIdList(request)
      if (!listUser || listUser.length == 0) {
        return null
      }

      let condition = this.conditionSummary(request, true);
      condition["user"] = { $in: listUser }

      condition['practiceSetInfo.accessMode'] = 'invitation';
      condition['practiceSetInfo.classRooms'] = { $in: [new Types.ObjectId(request.query.classroom)] };
      condition['createdBy.user'] = new Types.ObjectId(request.user._id);

      const results = await this.summaryQuestionByTopic(request, condition);

      return { results };
    } catch (err) {
      throw new GrpcInternalException(err.message);
    }
  }

  async classroomSummaryCorrect(request: ClassroomListTopicStudentDoReq) {
    try {
      let listUser = await this.studentBus.getUserIdList(request)
      if (!listUser || listUser.length == 0) {
        return null
      } else {
        let condition = this.conditionSummary(request, true);
        condition["user"] = {
          $in: listUser,
        }
        condition["practiceSetInfo.accessMode"] = "invitation";
        condition['createdBy.user'] = new Types.ObjectId(request.user._id);

        const active = {
          "user": new Types.ObjectId(request.user._id),
          $or: [{ "active": { $exists: false } }, { "active": true }]
        }

        this.classroomRepository.setInstanceKey(request.instancekey);
        const classes = await this.classroomRepository.find({ active });

        const stuArr = classes.map(c => c._id);

        if (request.query.classroom === '000000000000000000000000') {
          condition['practiceSetInfo.classRooms'] = { $in: stuArr };
        } else {
          condition['practiceSetInfo.classRooms'] = {
            $in: [new Types.ObjectId(request.query.classroom)]
          };
        }

        const results = await this.getClassroomSummaryCorrect(request, condition);

        return { results }
      }
    } catch (err) {
      throw new GrpcInternalException(err.message);
    }
  }

  async getClassroomSummaryCorrect(request: any, condition: any) {
    const condition2 = this.createMatch(condition)
    const match = { $match: condition };
    const match2 = { $match: condition2 }

    const aggregatePipeline = [
      match,
      globals.lookup,
      globals.unw,
      globals.add,
      globals.pro,
      match2,
      { $unwind: '$QA' },
      { $match: request.query.subjects ? { 'QA.subject._id': new Types.ObjectId(request.query.subjects) } : {} },
      {
        $group: {
          _id: '$_id',
          totalQuestions: { $sum: 1 },
          totalCorrects: {
            $sum: { $cond: [{ $eq: ['$QA.status', 1] }, 1, 0] }
          },
          totalQuestionsDo: {
            $sum: { $cond: [{ $eq: ['$QA.status', 3] }, 0, 1] }
          },
          totalMissed: {
            $sum: { $cond: [{ $eq: ['$QA.status', 3] }, 1, 0] }
          },
          doQuestion: {
            $sum: { $cond: [{ $eq: ['$QA.status', 3] }, 0, 1] }
          },
          doTime: {
            $sum: { $cond: [{ $lt: ['$QA.status', 3] }, '$QA.timeEslapse', 0] }
          },
          totalTimeTaken: {
            $sum: { $cond: [{ $gt: ['$QA.timeEslapse', 0] }, '$QA.timeEslapse', 0] }
          },
          timeEslapse: { $sum: '$QA.timeEslapse' },
          user: { $first: '$user' }
        }
      },
      {
        $group: {
          _id: '$user',
          totalQuestions: { $sum: '$totalQuestions' },
          totalCorrects: { $sum: '$totalCorrects' },
          totalQuestionsDo: { $sum: '$totalQuestionsDo' },
          totalTimeTaken: { $sum: '$totalTimeTaken' }
        }
      },
      {
        $project: {
          user: '$_id',
          totalQuestions: '$totalQuestions',
          totalCorrects: '$totalCorrects',
          totalQuestionsDo: '$totalQuestionsDo',
          accuracyPercent: {
            $cond: [{ $eq: ['$totalQuestions', 0] }, 0, {
              $multiply: [{ $divide: ['$totalCorrects', '$totalQuestions'] }, 100]
            }]
          },
          avgTimeDoQuestion: {
            $cond: [{ $eq: ['$totalQuestionsDo', 0] }, 0, {
              $divide: ['$totalTimeTaken', '$totalQuestionsDo']
            }]
          }
        }
      },
      { $sort: { accuracyPercent: -1 } }
    ];

    const attempts: any = await this.attemptRepository.aggregate(aggregatePipeline);

    const results = await this.userRepository.populate(attempts, { path: 'user', select: 'name email' });
    return results;
  }

  async classroomSummaryCorrectByDate(request: ClassroomListTopicStudentDoReq) {
    try {
      let listUser = await this.studentBus.getUserIdList(request)
      if (!listUser || listUser.length == 0) {
        return null
      } else {
        let condition = this.conditionSummary(request, true);
        condition["user"] = {
          $in: listUser,
        }
        condition['createdBy.user'] = new Types.ObjectId(request.user._id);

        const active = {
          "user": new Types.ObjectId(request.user._id),
          $or: [{ "active": { $exists: false } }, { "active": true }]
        }

        this.classroomRepository.setInstanceKey(request.instancekey);
        const classes = await this.classroomRepository.find({ active });

        const stuArr = classes.map(c => c._id);

        if (request.query.classroom === '000000000000000000000000') {
          condition['practiceSetInfo.classRooms'] = { $in: stuArr };
        } else {
          condition['practiceSetInfo.classRooms'] = {
            $in: [new Types.ObjectId(request.query.classroom)]
          };
        }

        const results = await this.getclassroomSummaryCorrectByDate(request, condition);

        return { results }
      }
    } catch (err) {
      throw new GrpcInternalException(err.message);
    }
  }

  async getclassroomSummaryCorrectByDate(request: any, condition: any) {
    const condition2 = this.createMatch(condition)
    const match = { $match: condition };
    const match2 = { $match: condition2 }

    const aggregatePipeline = [
      match,
      globals.lookup,
      globals.unw,
      globals.add,
      globals.pro,
      match2,
      { $unwind: '$QA' },
      { $match: request.query.subjects ? { 'QA.subject._id': new Types.ObjectId(request.query.subjects) } : {} },
      { $match: request.query.topic ? { 'QA.topic._id': new Types.ObjectId(request.query.topic) } : {} },
      { $match: { 'createdAt': { $type: 9 } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            user: '$user'
          },
          totalQuestionsDo: { "$sum": { "$cond": [{ "$eq": ["$QA.status", 3] }, 0, 1] } },
          totalTimeTaken: { "$sum": { "$cond": [{ "$gt": ["$QA.timeEslapse", 0] }, "$QA.timeEslapse", 0] } },
          totalCorrects: { "$sum": { "$cond": [{ "$eq": ["$QA.status", 1] }, 1, 0] } },
          created: { '$first': '$createdAt' },
          user: { '$first': '$user' },
          totalQuestions: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          created: "$created",
          day: "$_id",
          totalCorrects: "$totalCorrects",
          user: "$user",
          userData: "$user",
          totalQuestionsDo: "$totalQuestionsDo",
          totalTimeTanken: "$totalTimeTaken",
          totalQuestions: "$totalQuestions",
          avgTimeDoQuestion: {
            $cond: [{ $eq: ["$totalQuestionsDo", 0] }, 0, { "$divide": ["$totalTimeTaken", "$totalQuestionsDo"] }]
          },
          pecentCorrects: {
            $cond: [{ $eq: ["$totalQuestions", 0] }, 0, {
              $multiply: [{ $divide: ["$totalCorrects", "$totalQuestions"] }, 100]
            }]
          }
        }
      },
      { $sort: { 'created': 1 } }
    ];

    const attempts: any = await this.attemptRepository.aggregate(aggregatePipeline);

    const results = await this.userRepository.populate(attempts, { path: 'userData', select: 'name email' });
    return results;
  }

  async test(request: ClassroomListTopicStudentDoReq) {
    try {
      const results = await this.studentBus.countStudents(request);      
      return results;
    } catch (err) {
      throw new GrpcInternalException(err.message);
    }
  }

  

  async getListSubjectsStudent(request: GetListSubjectsStudentRequest) {
    try {
      let condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.user);
      let result = await this.getListSubjects(request, condition);
      return { result };
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async getTotalQuestionTopicStudent(request: GetTotalQuestionTopicStudentRequest) {
    try {
      let condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.getTotalQuestionTopic(request, condition);
      return { results }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async getTotalQuestionBySubjectStudent(request: GetTotalQuestionBySubjectStudentRequest) {
    try {
      let condition = this.conditionSummary(request);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.getTotalQuestionBySubject(request, condition);
      return { results }
    } catch (err) {
      throw "internal Server error"
    }
  }

  async getListTopicsStudent(request: GetListTopicsStudentRequest) {
    try {
      var condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.user)
      let results = await this.getListTopic(request, condition);
      return { results }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async summaryTopicSpeedStudent(request: SummaryTopicSpeedStudentRequest) {
    try {
      let condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.summaryTopicSpeed(request, condition);
      return { results }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async summaryTopicCorrectStudent(request: SummaryTopicCorrectStudentRequest) {
    try {
      var condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.summaryTopicCorrect(request, condition);

      return { results }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async summarySubjectCorrectStudent(request: SummarySubjectCorrectStudentRequest) {
    try {
      var condition = this.conditionSummary(request);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.summarySubjectCorrect(request, condition);
      return { results }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async summarySubjectCorrectByDateStudent(request: SummarySubjectCorrectByDateStudentRequest) {
    try {
      var condition = this.conditionSummary(request);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.summarySubjectCorrectByDate(request, condition);
      return { results }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async summarySubjectSpeedByDateStudent(request: SummarySubjectSpeedByDateStudentRequest) {
    try {
      var condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.summarySubjectSpeedByDate(request, condition);
      return { results }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async summaryCorrectByDateStudent(request: SummaryCorrectByDateStudentRequest) {
    try {
      var condition = this.conditionSummary(request);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.summaryCorrectByDate(request, condition);
      return { results }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async summaryAttemptedBySubjectStudent(request: SummaryAttemptedBySubjectStudentRequest) {
    try {
      var condition: any = {};
      condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.summaryAttemptedBySubject(request, condition);
      return { results }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async summarySubjectSpeedStudent(request: SummarySubjectSpeedStudentRequest) {
    try {
      var condition = this.conditionSummary(request);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.summarySubjectSpeed(request, condition);
      return { results }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async summaryAbondonedStudent(request: SummaryAbondonedStudentRequest) {
    try {
      var filter = [];
      filter = this.conditionCount(request, filter, true);
      filter.push({
        user: new Types.ObjectId(request.user),
      });
      let results = await this.summaryAbondoned(request, filter);
      return { results }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async summaryPracticeStudent(request: SummaryPracticeStudentRequest) {
    var filter = [];
    filter.push({
      user: new Types.ObjectId(request.user),
    });

    let results = await this.summaryPractice(request, filter);
    return { results }
  }

  async summaryAttemptedStudent(request: SummaryAttemptedStudentRequest) {
    try {
      var condition: any = {};
      condition = this.conditionSummary(request);
      delete condition.isAbandoned;
      condition.isShowAttempt = true;
      condition.isEvaluated = true;
      condition.user = new Types.ObjectId(request.user)
      let condition2 = this.createMatch(condition)
      let pipeline = [];
      pipeline.push(
        {
          $match: condition
        },
        {
          $lookup: {
            from: "attemptdetails",
            localField: "_id",
            foreignField: "attempt",
            as: "someField"
          }
        },
        {
          $unwind: "$someField"
        },
        {
          $addFields: {
            QA: "$someField.QA"
          }
        },
        {
          $project: {
            someField: 0
          }
        },
        {
          $match: condition2
        },
        {
          $unwind: "$QA",
        },
        {
          $group: {
            _id: {
              _id: "$_id",
            },
            totalQuestion: {
              $sum: 1,
            },
            doQuestion: {
              $sum: {
                $cond: [{ $eq: ["$QA.status", 3] }, 0, 1],
              },
            },
            totalMissed: {
              $first: "$totalMissed",
            },
            totalCorrects: {
              $first: "$totalCorrects",
            },
            totalTimeTaken: {
              $sum: "$QA.timeEslapse",
            },
            totalMark: {
              $first: "$totalMark",
            },
            totalTestMark: {
              $sum: "$QA.actualMarks",
            },
            practicesetId: {
              $first: "$practicesetId",
            },
            user: {
              $first: "$user",
            },
            isAbandoned: {
              $first: "$isAbandoned",
            },
          },
        }, {
        $group: {
          _id: {
            user: "$user",
            test: "$practicesetId",
            isAbandoned: "$isAbandoned",
          },
          totalQuestion: {
            $sum: "$totalQuestion",
          },
          doQuestion: {
            $sum: "$doQuestion",
          },
          totalMissed: {
            $sum: "$totalMissed",
          },
          totalCorrects: {
            $sum: "$totalCorrects",
          },
          totalTimeTaken: {
            $sum: "$totalTimeTaken",
          },
          totalAttempts: {
            $sum: 1,
          },
          totalMark: {
            $sum: "$totalMark",
          },
          totalTestMark: {
            $sum: "$totalTestMark",
          },
        },
      },
        {
          $group: {
            _id: {
              user: "$_id.user",
              isAbandoned: "$_id.isAbandoned",
            },
            totalQuestion: {
              $sum: "$totalQuestion",
            },
            doQuestion: {
              $sum: "$doQuestion",
            },
            totalMissed: {
              $sum: "$totalMissed",
            },
            totalCorrect: {
              $sum: "$totalCorrects",
            },
            totalTimeTaken: {
              $sum: "$totalTimeTaken",
            },
            totalAttempt: {
              $sum: "$totalAttempts",
            },
            totalMark: {
              $sum: "$totalMark",
            },
            totalTestMark: {
              $sum: "$totalTestMark",
            },
            totalTest: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      )

      this.attemptRepository.setInstanceKey(request.instancekey);
      let results = await this.attemptRepository.aggregate(pipeline)
      return { results }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async summaryQuestionBySubjectStudent(request: SummaryQuestionBySubjectStudentRequest) {
    try {
      var condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.summaryQuestionBySubject(request, condition);
      return { results }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async summarySpeedTopicByDateStudent(request: SummarySpeedTopicByDateStudentRequest) {
    try {
      var condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.summarySpeedTopicByDate(request, condition);
      return { results }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async summaryQuestionByTopicStudent(request: SummaryQuestionByTopicStudentRequest) {
    try {
      var condition = this.conditionSummary(request, true);
      condition.user = new Types.ObjectId(request.user);
      let results = await this.summaryQuestionByTopic(request, condition);
      return { results }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async questionByComplexity(request: QuestionByComplexityRequest) {
    try {
      let pipeline = [];
      pipeline.push(
        {
          $match: {
            _id: new Types.ObjectId(request.attemptId)
          }
        },
        {
          $lookup: {
            from: "attemptdetails",
            localField: "_id",
            foreignField: "attempt",
            as: "someField"
          }
        },
        {
          $unwind: "$someField"
        },
        {
          $addFields: {
            QA: "$someField.QA"
          }
        },
        {
          $project: {
            someField: 0
          }
        },
        {
          $unwind: "$QA",
        },
        {
          $project: {
            question: "$QA.question",
            status: "$QA.status",
            actualMarks: "$QA.actualMarks",
            obtainMarks: "$QA.obtainMarks",
            "subject._id": "$QA.subject._id",
            "subject.name": "$QA.subject.name",
            "topic._id": "$QA.topic._id",
            "topic.name": "$QA.topic.name",
          },
        },
        {
          $lookup: {
            from: "questions",
            localField: "question",
            foreignField: "_id",
            as: "questionInfo",
          },
        },
        {
          $unwind: "$questionInfo",
        },
        {
          $project: {
            question: 1,
            status: 1,
            actualMarks: 1,
            obtainMarks: 1,
            subject: 1,
            topic: 1,
            complexity: "$questionInfo.complexity",
          },
        },
        {
          $group: {
            _id: {
              topic: "$topic",
              complexity: "$complexity",
            },
            marks: {
              $sum: "$actualMarks",
            },
            obtainMarks: {
              $sum: "$obtainMarks",
            },
            subject: {
              $first: "$subject._id",
            },
          },
        },
        {
          $project: {
            subject: 1,
            marks: 1,
            obtainMarks: 1,
            _id: "$_id.topic._id",
            name: "$_id.topic.name",
            complexity: "$_id.complexity",
          },
        },
      )
      let topic = await this.attemptRepository.aggregate(pipeline);
      return { topic }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async getProctoringAttempt(request: GetProctoringAttemptRequest) {
    try {
      let start = new Date();
      start.setHours(0, 0, 0, 0);

      let end = new Date();
      end.setHours(23, 59, 59, 999);
      this.userRepository.setInstanceKey(request.instancekey)
      let student = await this.userRepository.findOne(
        { _id: new Types.ObjectId(request.userId), role: "student", isActive: true },
        {
          name: 1,
          userId: 1,
          rollNumber: 1,
          lastLogin: 1,
          identityInfo: 1,
          role: 1,
          provider: 1,
          country: 1,
          avatar: 1,
          avatarSM: 1,
          avatarMD: 1,
        }
      )

      if (!student) {
        throw "Not Found"
      }
      let attQuery: any = {
        user: student._id,
      }

      if (request.attemptId) {
        attQuery._id = new Types.ObjectId(request.attemptId)
      }

      if (request.classId) {
        attQuery["practiceSetInfo.classRooms"] = new Types.ObjectId(request.classId)
      }
      this.attemptRepository.setInstanceKey(request.instancekey)
      let foundAttempts = await this.attemptRepository.find(attQuery, null, {
        sort: { updatedAt: -1 },
        limit: 1
      })
      foundAttempts = await this.attemptRepository.populate(foundAttempts, "attemptdetails")
      if (!foundAttempts.length) {
        return { student }
      }
      let attempt = foundAttempts[0];
      let userLogs: any = await this.userRepository.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lt: end },
            user: student._id,
          },
        },
        {
          $project: {
            timeActive: { $divide: ["$timeActive", 60000] },
            browser: "$connectionInfo.browser",
            os: "$connectionInfo.os",
            device: "$connectionInfo.device",
            ai: { $arrayElemAt: ["$connectionInfo.locs", 0] },
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
        { $sort: { updatedAt: -1.0 } },
        { $limit: 1 },
      ])

      if (userLogs.length) {
        if (userLogs[0].browser) {
          student.browser = userLogs[0].browser;
        }
        if (userLogs[0].os) {
          student.os = userLogs[0].os;
        }
        if (userLogs[0].device) {
          student.device = userLogs[0].device;
        }
        if (userLogs[0].ai) {
          student.lastCity = userLogs[0].ai.city;
          student.lastCountry = userLogs[0].ai.country;
          student.ip = userLogs[0].ai.ip;
        }
      }

      let attempts = await this.attemptRepository.distinct("_id", {
        user: attempt.user,
        practicesetId: attempt.practicesetId,
      })

      return {
        student, attempt, attempts
      }

    } catch (err) {
      Logger.error(err);
      throw "Internal Server Error"
    }
  }

  async summaryOnePracticeSet(request: SummaryOnePracticeSetRequest) {
    try {
      var condition: any = {}
      var lastDate = null;
      if (request.lastDay) {
        lastDate = new Date();
        lastDate = lastDate.setTime(request.lastDay);
      }
      if (request.lastMonth) {
        lastDate = new Date();
        lastDate = lastDate.setTime(request.lastMonth)
      }
      if (lastDate != null) {
        condition["createdAt"] = {
          $gte: new Date(lastDate)
        }
      }

      condition["practicesetId"] = new Types.ObjectId(request.practicesetId);
      condition.isAbandoned = false;

      this.attemptRepository.setInstanceKey(request.instancekey);
      let results = await this.attemptRepository.aggregate([
        {
          $match: condition
        },
        {
          $group: {
            _id: {
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
            created: {
              $first: "$createdAt",
            },
            number: {
              $sum: 1,
            },
          },
        },
        {
          $project: {
            _id: "$created",
            day: "$_id",
            number: "$number",
          },
        },
        {
          $sort: {
            created: 1,
          },
        }
      ])
      return { results }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async summaryAttemptedPractice(request: SummaryAttemptedPracticeRequest) {
    try {
      let match = {
        $match: {
          practicesetId: new Types.ObjectId(request.practicesetId),
          isAbandoned: false,
          ongoing: { $ne: true }
        }
      }
      var unwind = {
        $unwind: "$QA",
      };
      var group = {
        $group: {
          _id: "$_id",
          totalQuestion: {
            $first: "$totalQuestions",
          },
          totalCorrects: {
            $first: "$totalCorrects",
          },
          totalMissed: {
            $first: "$totalMissed",
          },
          totalErrors: {
            $first: "$totalErrors",
          },
          totalMark: {
            $first: "$totalMark",
          },
          accessMode: {
            $first: "$practiceSetInfo.accessMode",
          },
          practiceSetInfo: {
            $first: "$practiceSetInfo",
          },
          totalTimeTaken: {
            $first: "$totalTime",
          },
          doQuestion: {
            $sum: {
              $cond: [{ $eq: ["$QA.status", 3] }, 0, 1],
            },
          },
          user: {
            $first: "$user",
          },
          questionPractice: {
            $sum: 1,
          },
          createdBy: {
            $first: "$createdBy",
          },
          createdAt: {
            $first: "$createdAt",
          },
          updatedAt: {
            $first: "$createdAt",
          },
          offscreenTime: {
            $first: "$offscreenTime",
          },
          fraudDetected: {
            $first: "$fraudDetected",
          },
          screenSwitched: {
            $sum: { $size: "$QA.offscreen" },
          },
        },
      };

      var project = {
        $project: {
          _id: "$_id",
          totalMissed: 1,
          totalCorrects: 1,
          totalTimeTaken: 1,
          questionPractice: 1,
          totalTimeTakenMi: {
            $cond: [
              {
                $eq: ["$totalTimeTaken", 0],
              },
              0,
              {
                $divide: ["$totalTimeTaken", 60000],
              },
            ],
          },
          totalErrors: 1,
          totalQuestion: {
            $ifNull: ["$totalQuestion", "$questionPractice"],
          },
          avgTime: {
            $cond: [
              {
                $eq: ["$doQuestion", 0],
              },
              0,
              {
                $divide: ["$totalTimeTaken", "$doQuestion"],
              },
            ],
          },
          practiceSetInfo: 1,
          accessMode: "$practiceSetInfo.accessMode",
          classroom: {
            $arrayElemAt: ["$practiceSetInfo.classRooms", 0],
          },
          pecentCorrects: {
            $multiply: [
              {
                $divide: ["$totalCorrects", "$totalQuestion"],
              },
              100,
            ],
          },
          createdBy: "$createdBy",
          createdAt: "$createdAt",
          createdAtFormat: {
            $substr: ["$createdAt", 0, 10],
          },
          updatedAtFormat: {
            $substr: ["$updatedAt", 0, 10],
          },
          user: "$user",
          totalMark: "$totalMark",
          offscreenTime: { $divide: ["$offscreenTime", 1000] },
          fraud: { $size: "$fraudDetected" },
          screenSwitched: "$screenSwitched",
        },
      };
      var sort = {
        $sort: {
          totalTimeTaken: 1,
        },
      };
      if (request.sort) {
        var dataSort = request.sort.split(",");
        var temp = '{"' + dataSort[0] + '":' + dataSort[1] + " }";
        var jsonArray = JSON.parse(temp);
        sort = {
          $sort: jsonArray,
        };
      }
      var pipline: any = [
        match,
        {
          $lookup: {
            from: "attemptdetails",
            localField: "_id",
            foreignField: "attempt",
            as: "someField"
          }
        },
        {
          $unwind: "$someField"
        },
        {
          $addFields: {
            QA: "$someField.QA"
          }
        },
        {
          $project: {
            someField: 0
          }
        },
        unwind,
        group,
        project,
        sort,
      ];
      pipline.push({
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      });

      if (request.type !== "exportResult") {
        let limitData = request.limit ? request.limit : 20;
        let page = request.page ? request.page : 1;

        let facet: any = {
          attempts: [
            {
              $skip: (page - 1) * limitData,
            },
            {
              $limit: limitData,
            },
          ],
        };
        if (request.includeCount) {
          facet.total = [{ $count: "all" }];
        }

        pipline.push({
          $facet: facet,
        });
      } else {
        pipline.push({
          $project: {
            _id: 1,
            totalMissed: 1,
            totalCorrects: 1,
            totalTimeTakenMi: "$totalTimeTakenMi",
            totalTimeTaken: 1,
            totalErrors: 1,
            totalQuestions: "$totalQuestion",
            avgTime: 1,
            practiceSetInfo: "$practiceSetInfo.title",
            accessMode: 1,
            pecentCorrects: 1,
            totalMark: 1,
            offscreenTime: 1,
            fraud: 1,
            screenSwitched: 1,
            classroom: 1,
            classroomName: 1,
            user: 1,
            studentName: 1,
            createdBy: "$createdBy.name",
            createdAt: "$createdAtFormat",
            updatedAt: "$updatedAtFormat",
          },
        });
      }
      this.attemptRepository.setInstanceKey(request.instancekey)
      let results = await this.attemptRepository.aggregate(pipline)
      if (!results) return { results }

      if (request.type !== "exportResult") {
        let result: any = results[0];
        if (result.total) {
          result.total = result.total[0] ? result.total[0].all : 0;
        }
        return { result }
      } else {

        return { results }
      }
    } catch (err) {
      Logger.error(err);
      throw "Internal server Error"
    }
  }

  async countStudentAttempted(request: CountStudentAttemptedRequest) {
    try {
      var filter = {
        isAbandoned: false,
        "createdBy.user": new Types.ObjectId(request.userId)
      }
      this.attemptRepository.setInstanceKey(request.instancekey)
      let result = await this.attemptRepository.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: "$createdBy.user"
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ])

      return { count: result.length }
    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }

  async countSummaryAttemptedPractice(request: CountSummaryAttemptedPracticeRequest) {
    try {
      var condition = {
        practicesetId: new Types.ObjectId(request.practicesetId)
      }
      var match = {
        $match: condition
      }
      var group = {
        $group: {
          _id: "$user",
        }
      }
      this.attemptRepository.setInstanceKey(request.instancekey);
      let result = await this.attemptRepository.aggregate([match, group])

      return { result }
    } catch (err) {
      throw "internal server error"
    }
  }

  async countByUser(request: CountByUserRequest) {
    try {
      var filter = [];
      filter.push({
        isAbandoned: false,
        "createdBy.user": new Types.ObjectId(request.userId)
      })
      this.attemptRepository.setInstanceKey(request.instancekey);
      let count = await this.attemptRepository.countDocuments({
        $and: filter
      })

      return { count }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async updateTimeLimitExhaustedCount(request: UpdateTimeLimitExhaustedCountRequest) {
    try {
      this.attemptRepository.setInstanceKey(request.instancekey)
      await this.attemptRepository.updateOne(
        { _id: new Types.ObjectId(request.attemptId) },
        { $inc: { timeLimitExhaustedCount: 1 } }
      )
      return { status: "ok" }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async updateSuspicious(request: UpdateSuspiciousRequest) {
    try {
      this.attemptRepository.setInstanceKey(request.instancekey)
      await this.attemptRepository.updateOne(
        {
          _id: new Types.ObjectId(request.attemptId)
        },
        {
          $set: {
            markedSuspicious: request.markedSuspicious
          }
        }
      )
      return { markedSuspicious: request.markedSuspicious }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async start(request: StartRequest) {
    try {
      if (!request.testId) {
        throw "Unexpected request"
      }
      this.practiceSetRepository.setInstanceKey(request.instancekey);
      let test = await this.practiceSetRepository.findOne(
        { _id: new Types.ObjectId(request.testId) }
      )
      if (!test) throw "Test Not Found";
      this.attemptRepository.setInstanceKey(request.instancekey)
      let newAttempt: any = new Attempt()
      newAttempt.practicesetId = test._id;
      newAttempt.user = new Types.ObjectId(request.userId);
      newAttempt.studentName = request.userName;
      newAttempt.email = request.userEmail;
      newAttempt.ongoing = true;
      newAttempt.isAbandoned = true;
      newAttempt.practiceSetInfo = {
        title: test.title,
        classRooms: test.classRooms,
        accessMode: test.accessMode,
      }
      newAttempt.location = new Types.ObjectId(request.activeLocation)

      if (test.level != undefined) {
        newAttempt.practiceSetInfo.level = test.level
      }

      if (test.accessMode == "invitation" || test.accessMode == "internal") {
        this.classroomRepository.setInstanceKey(request.instancekey);
        let attClasses = await this.classroomRepository.distinct("_id", {
          _id: { $in: test.classRooms },
          "students.studentId": new Types.ObjectId(request.userId),
          location: new Types.ObjectId(request.activeLocation),
        })

        newAttempt.practiceSetInfo.classRooms = attClasses
      }

      if (request.referenceType && request.referenceId) {
        newAttempt.referenceId = new Types.ObjectId(request.referenceId);
        newAttempt.referenceType = request.referenceType

        if (request.referenceData) {
          newAttempt.referenceData = request.referenceData
        }
      }

      let alreadyAttempted = await this.attemptRepository.findOne({
        user: request.userId,
        practicesetId: test._id
      })

      if (!alreadyAttempted) {
        await this.practiceSetRepository.updateOne(
          {
            _id: test._id,
          },
          {
            $inc: {
              totalJoinedStudent: 1
            }
          }
        )
      }

      newAttempt = await this.attemptRepository.create(newAttempt);
      let newDetail = new AttemptDetail();
      newDetail.practicesetId = test._id;
      newDetail.user = new Types.ObjectId(request.userId);
      newDetail.attempt = newAttempt._id;

      newDetail = await this.attemptDetailRepository.create(newDetail);

      await this.attemptRepository.updateOne(
        { _id: newAttempt._id },
        { $set: { attemptdetails: newDetail._id } }
      )

      this.userLogRepository.setInstanceKey(request.instancekey);
      let log = await this.userLogRepository.findOne(
        {
          user: new Types.ObjectId(request.userId),
          token: request.token
        }
      )

      log.takingPracticeSet = test._id;
      log.ip = request.ip;
      return { attempt: newAttempt._id }

    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }

  async finishPsychoTest(request: FinishPsychoTestRequest) {
    try {
      let testId = new Types.ObjectId(request.practicesetId);
      let answers = request.answersOfUser
      let questions = await this.questionBus.getQuestionsByPracticeId(request, testId);

      let data = [];
      answers.forEach((a: any, idx) => {
        if (!a) {
          throw ("Psycho test " +
            testId +
            " user " +
            request.userId.toString() +
            ": There is empty answer at idx " +
            idx)
        }
        let qIdx = _.findIndex(questions, (q) => q._id.toString() == a.question);
        let q = questions[qIdx];
        if (a.answers?.length > 0) {
          let userAnswerId = a.answers[0].answerId;
          let aIdx = _.findIndex(
            q.answers,
            (ans) => ans._id.toString() == userAnswerId
          );
          let item = {
            domain: q.domain,
            facet: q.facet,
            score: q.answers[aIdx].score
          }
          data.push(item);
        }
      });

      let psychoAttempt = new PsychoResult();
      psychoAttempt.user = new Types.ObjectId(request.userId);
      psychoAttempt.practiceset = testId;
      psychoAttempt.answers = data;

      this.practiceSetRepository.setInstanceKey(request.instancekey);
      let test = await this.practiceSetRepository.findOne({ _id: testId });
      if (test.accessMode == "invitation" || test.accessMode == "internal") {
        psychoAttempt.classrooms = test.classRooms;
        if (test.classRooms.length > 1) {
          this.classroomRepository.setInstanceKey(request.instancekey)
          let attClasses = await this.classroomRepository.distinct("_id", {
            _id: { $in: test.classRooms },
            "students.studentId": new Types.ObjectId(request.userId),
            location: new Types.ObjectId(request.activeLocation)
          });
          if (!attClasses.length) {
            attClasses = test.classRooms;
          }
          psychoAttempt.classrooms = new Types.ObjectId(attClasses.toString());
        }
      }

      await this.psychoResultRepository.create(psychoAttempt);
      await this.practiceSetRepository.updateOne(
        { _id: testId },
        { $set: { "totalAttempt": test.totalAttempt + 1 } }
      )
      test.totalAttempt += 1;
      return { psychoAttempt }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async partialSubmitAttempt(request: PartialSubmitAttemptRequest) {
    try {
      var attemptId = new Types.ObjectId(request.attemptId);
      if (!attemptId || !ObjectId.isValid(attemptId)) {
        attemptId = new ObjectId()
      } else {
        attemptId = new Types.ObjectId(attemptId);
      }
      this.attemptRepository.setInstanceKey(request.instancekey)
      let existingAtt: any = await this.attemptRepository.findById(attemptId,
        {
          attemptdetails: 1, ongoing: 1
        }
      )
      if (existingAtt && existingAtt.ongoing) {
        this.attemptDetailRepository.setInstanceKey(request.instancekey)
        await this.attemptDetailRepository.updateOne(
          { _id: existingAtt.attemptdetails },
          { $set: { QA: request.answerOfUser } }
        )
      } else {
        if (request.practicesetId) {
          let test: any = await this.practiceSetRepository.findOne({
            _id: new Types.ObjectId(request.practicesetId)
          })

          if (!test) {
            throw "Not Found"
          }

          attemptId = new ObjectId();

          existingAtt = new Attempt();

          existingAtt._id = attemptId;
          existingAtt.practicesetId = test._id;
          existingAtt.user = new Types.ObjectId(request.userId);
          existingAtt.ongoing = true;
          existingAtt.isAbandoned = true;
          existingAtt.practiceSetInfo = {
            title: test.title,
            classRooms: test.classRooms,
            accessMode: test.accessMode,
          }
          existingAtt.location = new Types.ObjectId(request.activeLocation);

          if (test.level != undefined) {
            existingAtt.practiceSetInfo.level = test.level;
          }

          if (test.accessMode == "invitation") {
            let attClasses = await this.classroomRepository.distinct("_id", {
              _id: { $in: test.classRooms },
              "students.studentId": new Types.ObjectId(request.userId),
              location: new Types.ObjectId(request.activeLocation)
            })

            existingAtt.practiceSetInfo.classRooms = attClasses;
          }
          existingAtt = await this.attemptRepository.create(existingAtt);
          let attDetails: any = new AttemptDetail();
          attDetails.practicesetId = new Types.ObjectId(request.practicesetId);
          attDetails.user = new Types.ObjectId(request.userId);
          attDetails.attempt = existingAtt._id;
          attDetails.QA = request.answerOfUser;

          attDetails = await this.attemptDetailRepository.create(attDetails)

          await this.attemptRepository.updateOne(
            { _id: existingAtt._id },
            { $set: { attemptdetails: attDetails._id } }
          )
        } else {
          throw "Internal server error"
        }
        return { attemptId: existingAtt._id }
      }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async submitToQueue(request: SubmitToQueueRequest) {    
    try {
      if (request.body.attemptId) {
        this.attemptRepository.setInstanceKey(request.instancekey)
        await this.attemptRepository.updateOne(
          { _id: new Types.ObjectId(request.body.attemptId) },
          { $set: { ongoing: false, isEvaluated: false } }
        )
      }

      let submission = await this.attemptSubmissionRepository.findOneAndUpdate(
        { attemptId: new Types.ObjectId(request.body.attemptId) },
        { $set: { status: "draft", data: request.body } },
        { upsert: true, new: true }
      )

      await this.attemptQueue.add('attempt submission',
        { ik: request.instancekey, submission: submission._id },
        {
          removeOnComplete: true,
        }
      );

      this.userLogRepository.setInstanceKey(request.instancekey)
      await this.userLogRepository.updateOne(
        {
          user: new Types.ObjectId(request.userId),
          takingPracticeSet: new Types.ObjectId(request.body.practiceId),
          $or: [
            { token: request.token },
            { ip: request.ip }
          ]
        },
        {
          $unset: {
            takingPracticeSet: 1,
          },
        },
        { strict: false }
      )

      await this.emailAttemptSubmit(request, request.body.practiceId)
      return { status: "ok" }
    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }

  async resetItemInQueue(request: ResetItemInQueueRequest) {
    try {
      if (!request.submitIds) {
        throw ({ message: "Invalid Id" })
      }
      let ids = request.submitIds.split(",");
      this.attemptSubmissionRepository.setInstanceKey(request.instancekey);

      let sub = await this.attemptSubmissionRepository.find({ _id: { $in: ids } })

      if (sub.length) {
        await Promise.all(
          sub.map(async (item) => {
            if (item.status == "processed" && !item.error) {
              return;
            }
            await this.attemptSubmissionRepository.findByIdAndUpdate(item._id,
              {
                status: "draft",
                error: ""
              }
            )
            item.status = "draft";
            item.error = "";
            await this.attemptQueue.add(
              { ik: request.instancekey, submission: item._id },
              { removeOnComplete: true }
            );
          })
        )
      }
      return { status: "reset" }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async questionSubmit(request: QuestionSubmitRequest) {
    try {
      var attemptId = new Types.ObjectId(request.attemptId);
      if (!attemptId || !ObjectId.isValid(attemptId)) {
        attemptId = new ObjectId();
      } else {
        attemptId = new Types.ObjectId(attemptId)
      }

      this.attemptSubmissionRepository.setInstanceKey(request.instancekey)
      await this.attemptSubmissionRepository.updateOne(
        { attemptId: attemptId },
        { $push: { userAnswers: request.question } },
        { upsert: true }
      )

      this.attemptRepository.setInstanceKey(request.instancekey)
      let existingAtt: any = await this.attemptRepository.findById(attemptId,
        { attemptdetails: 1, ongoing: 1 }
      )

      if (existingAtt && existingAtt.ongoing) {
        var atd = await this.attemptDetailRepository.findById(existingAtt.attemptdetails)
        var idx = atd.QA.findIndex(
          (q) => q.question == new Types.ObjectId(request.question.question)
        );
        if (idx > -1) {
          _.assign(atd.QA[idx], request.question);
          await this.attemptDetailRepository.updateOne(
            { _id: atd._id, "QA.question": new Types.ObjectId(request.question.question) },
            { $set: { "QA.$": atd.QA[idx] } }
          )
        } else {
          await this.attemptDetailRepository.updateOne(
            { _id: atd._id },
            { $push: { QA: request.question } }
          )
        }
      } else {
        if (request.practicesetId) {
          let test = await this.practiceSetRepository.findOne({
            _id: new Types.ObjectId(request.practicesetId)
          })
          if (!test) {
            Logger.warn("questionSubmit test not found " + request.practicesetId)
            throw "Not Found"
          }

          Logger.warn(
            `questionSubmit new Attempt created fir user  ${request.userId} in test ${request.practicesetId}`
          )

          attemptId = new ObjectId();

          existingAtt = new Attempt();
          existingAtt._id = attemptId;
          existingAtt.practicesetId = test._id;
          existingAtt.user = new Types.ObjectId(request.userId);
          existingAtt.ongoing = true;
          existingAtt.isAbandoned = true;
          existingAtt.practiceSetInfo = {
            title: test.title,
            classRooms: test.classRooms,
            accessMode: test.accessMode,
          }

          if (test.level != undefined) {
            existingAtt.practiceSetInfo.level = test.level
          }

          if (test.accessMode == "invitation" || test.accessMode == "internal") {
            let classes = await this.classroomRepository.distinct("_id", {
              "students.studentId": new Types.ObjectId(request.userId),
              location: new Types.ObjectId(request.activeLocation)
            })

            let attClasses = [];

            classes.forEach((classId) => {
              if (test.classRooms.findIndex((c) => c.equals(classId)) > -1) {
                attClasses.push(classId);
              }
            });

            existingAtt.practiceSetInfo.classRooms = attClasses;
          }
          existingAtt = await this.attemptRepository.create(existingAtt)
          let attDetails: any = new AttemptDetail();
          attDetails.practicesetId = new Types.ObjectId(request.practicesetId);
          attDetails.user = new Types.ObjectId(request.userId);
          attDetails.attempt = existingAtt._id
          attDetails.QA = [request.question]

          attDetails = await this.attemptDetailRepository.create(attDetails);

          await this.attemptRepository.updateOne(
            { _id: existingAtt._id },
            { $set: { attemptdetails: attDetails._id } }
          )
        } else {
          Logger.warn("QuestionSubmit no practiceId")
          throw "Not Found"
        }
      }
      return { attemptId: existingAtt._id }
    } catch (err) {
      throw "Internal Server error"
    }
  }

  async saveCamCapture(request: SaveCamCaptureRequest) {
    try {
      if (!request.filePath) {
        throw "Not Found"
      }

      this.attemptRepository.setInstanceKey(request.instancekey);
      let attempt: any = await this.attemptRepository.findById(request.attemptId)
      if (!attempt) throw "Not Found"

      if (!attempt.face_detection) {
        attempt.face_detection = {
          frames: [],
          fraud: false
        }
      }

      attempt.face_detection.frames.push({
        image: request.filePath,
        captured: Date.now()
      });

      await this.attemptRepository.findByIdAndUpdate(
        attempt._id, attempt
      )

      let userId = attempt.auth._id;

      const user = await this.userRepository.findById(userId);
      let sourceImage = `staging` + user.identityInfo.imageUrl;

      /*
      "filePath": "https://skillifyai-face-recognition.s3.ap-south-1.amazonaws.com/faceReg/new_snu_myperfectice/attempts/668e1b1abe1444de8508b785/2024-07-10T05:42:10.jpg"
      */
      let targetImage = request.filePath;
      let startIndex = targetImage.indexOf('faceReg/');
      if (startIndex === -1) {
        throw "Invalid file path format";
      }
      targetImage = targetImage.substring(startIndex);
      let data = await this.s3Service.faceRegCompare(sourceImage, targetImage);
      let faceMatchedScore = 0;
      if (data.length > 0) {
        faceMatchedScore = data.sort((a, b) => { return b - a })[0];
      }

      // let identityThreshold = settings.IdentityMatchThreshold;
      let identityThreshold = 80;
      if (faceMatchedScore < identityThreshold) {
        throw new GrpcAbortedException("An unauthorized person has been detected");
      }
      return { status: "Ok" }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async saveScreenRecording(request: SaveScreenRecordingRequest) {
    try {
      if (!request.filePath) {
        throw "Not Found"
      }

      this.attemptRepository.setInstanceKey(request.instancekey);
      let attempt: any = await this.attemptRepository.findById(request.attemptId)
      if (!attempt) throw "Not Found"

      if (!attempt.screen_recordings) {
        attempt.screen_recordings = []
      }

      attempt.screen_recordings.push({
        video: request.filePath,
        captured: new Date()
      });

      await this.attemptRepository.findByIdAndUpdate(
        attempt._id, attempt
      )
      return { status: "Ok" }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async saveQrUpload(request: SaveQrUploadRequest) {
    try {
      if (!request.filePath) {
        throw "Not Found"
      }

      this.attemptRepository.setInstanceKey(request.instancekey);
      let attempt: any = await this.attemptRepository.findById(request.attemptId)
      if (!attempt) throw "Not Found"

      if (!attempt.answerSheets) {
        attempt.answerSheets = []
      }

      attempt.answerSheets.push({
        answerSheet: request.filePath,
        date: new Date()
      });

      await this.attemptRepository.findByIdAndUpdate(
        attempt._id, attempt
      )
      return { status: "Ok" }
    } catch (err) {
      throw "Internal Server Error"
    }
  }

  async recordQuestionReview(request: RecordQuestionReviewRequest) {
    try {
      var isClosing = false;
      if (request.state == "closing") {
        isClosing = true;
      }
      if (!request.time) {
        throw "Bad Request"
      }

      this.attemptDetailRepository.setInstanceKey(request.instancekey);
      let attempt = await this.attemptDetailRepository.findOne(
        { attempt: new Types.ObjectId(request.attemptId) }
      )
      if (!attempt) {
        if (!isClosing) {
          throw "Not Found"
        }
      }
      var qIdx = _.findIndex(attempt.QA, function (q) {
        return { res: q.question.equals(request.questionId) }
      });

      if (qIdx === -1) {
        if (!isClosing) {
          throw "Not Found"
        }
      }
      if (!attempt.QA[qIdx].reviewTimeSpent) {
        attempt.QA[qIdx].reviewTimeSpent = request.time;
        attempt.QA[qIdx].reviewTimes = 1;
      } else {
        attempt.QA[qIdx].reviewTimeSpent += request.time;
        attempt.QA[qIdx].reviewTimes += 1;
      }
      if (!isClosing) {
        return { res: "ok" }
      }

    } catch (err) {
      throw "Internal Server error"
    }
  }

  async updateAbandonStatus(request: UpdateAbandonStatusRequest) {
    try {
      if (request.liveboard) {
        this.attemptRepository.setInstanceKey(request.instancekey);
        let attempt = await this.attemptRepository.updateOne(
          {
            _id: new Types.ObjectId(request.attemptId)
          },
          {
            $set: {
              markedSuspicious: request.markedSuspicious
            }
          }
        )

        return { attempt }
      } else {
        this.attemptRepository.setInstanceKey(request.instancekey);
        let attempt = await this.attemptRepository.findOneAndUpdate(
          {
            _id: new Types.ObjectId(request.attemptId)
          },
          {
            $set: {
              isAbandoned: false
            }
          }
        )
        this.attemptDetailRepository.setInstanceKey(request.instancekey)
        let detail = await this.attemptDetailRepository.updateOne(
          {
            attempt: new Types.ObjectId(request.attemptId)
          },
          {
            $set: {
              isAbandoned: false
            }
          }
        )

        let count = await this.attemptRepository.countDocuments(
          {
            practicesetId: attempt.practicesetId,
            isAbandoned: false
          }
        )

        this.practiceSetRepository.setInstanceKey(request.instancekey);
        await this.practiceSetRepository.updateOne(
          {
            _id: attempt.practicesetId,
          },
          {
            totalAttempt: count
          }
        )
        return { attempt }
      }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async findPsychoResultByTest(request: FindPsychoResultByTestRequest) {
    try {
      this.psychoResultRepository.setInstanceKey(request.instancekey);
      let result = await this.psychoResultRepository.findOne(
        {
          user: new Types.ObjectId(request.userId),
          practiceset: new Types.ObjectId(request.practicesetId)
        }, null, { sort: { createdAt: -1 } }
      )

      return { result }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async getPsychoResult(request: GetPsychoResultRequest) {
    try {
      this.psychoResultRepository.setInstanceKey(request.instancekey)
      let result: any = await this.psychoResultRepository.findById(new Types.ObjectId(request.psychoResultId))
      result = await this.psychoResultRepository.populate(result,
        {
          path: "practiceset",
          select: "title userInfo units subject",
        }
      )
      const scores = calculateScore(result)
      let b5 = getResult({
        scores: scores,
        lang: "en"
      })
      if (!result.analysis || _.isEmpty(result.analysis)) {
        let analysis = {};
        b5.forEach((a) => {
          analysis[a.title] = {
            scores: a.score,
            rating: a.scoreText,
            subCategory: {}
          };

          a.facets.forEach(f => {
            analysis[a.title].subCategory[f.title] = f.score
          })
        });

        result = await this.psychoResultRepository.updateOne(
          {
            _id: result._id,
          },
          {
            $set: {
              analysis: analysis
            }
          }
        )
      }

      return {
        user: result.user,
        practiceset: result.practiceset,
        createdAt: result.createdAt,
        b5Result: b5,
      }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async findOneAttempt(request: FindOneAttemptRequest) {
    try {
      var filter = {};
      if (request.attemptId.length === 24 && checkForHexRegExp.test(request.attemptId)) {
        filter["_id"] = new Types.ObjectId(request.attemptId);
      } else {
        filter["idOffline"] = new Types.ObjectId(request.attemptId)
      }
      this.attemptRepository.setInstanceKey(request.instancekey)
      let attempt = await this.attemptRepository.findOne(filter, {
        "practiceSetInfo.title": 1,
        isShowAttempt: 1,
        "practiceSetInfo.accessMode": 1,
        "practiceSetInfo.subjects": 1,
        user: 1,
        attemptdetails: 1,
      })

      attempt = await this.attemptRepository.populate(attempt,
        [{
          path: "user",
          select: "-salt -hashedPassword"
        },
        {
          path: "attemptdetails"
        }]
      )
      if (!attempt) throw "Not Found";

      var attemptObj: any = {}

      attemptObj._id = attempt._id;
      var practiceSetObj = attempt.practiceSetInfo;
      practiceSetObj.isShowAttempt - attempt.isShowAttempt;
      if (attempt.user.profile) {
        practiceSetObj.user = attempt.user.profile;
      } else {
        practiceSetObj.user = attempt.user;
      }
      attemptObj.practiceset = practiceSetObj;
      attemptObj.QA = attempt.attemptdetails.QA;
      return { attemptObj }

    } catch (err) {
      throw "Internal server error"
    }
  }

  async getClassroomByTest(request: GetClassroomByTestRequest) {
    try {
      this.attemptRepository.setInstanceKey(request.instancekey)
      let result = await this.attemptRepository.distinct(
        "practiceSetInfo.classRooms",
        {
          practicesetId: new Types.ObjectId(request.practicesetId),
          "practiceSetInfo.accessMode": "invitation"
        }
      )

      if (result.length == 0) {
        return { classsrooms: [] };
      }
      var filter: any = {
        _id: { $in: result },
        allowDelete: true,
      }

      if (request.userRole == config.roles.teacher) {
        filter.$or = [
          {
            user: new Types.ObjectId(request.userId)
          },
          {
            owners: new Types.ObjectId(request.userId)
          }
        ]
      } else {
        if (request.userRole == config.roles.centerHead) {
          var location = request.location.map(id => new Types.ObjectId(id))
          filter.location = {
            $in: location
          }
        }
      }

      this.classroomRepository.setInstanceKey(request.instancekey);
      let classrooms = await this.classroomRepository.find(filter, {
        name: 1
      })

      if (classrooms.length) {
        return { classrooms }
      } else {
        throw "Please enter valid parameters"
      }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async getCareerScore(request: GetCareerScoreRequest) {
    try {
      this.studentRecommendationRepository.setInstanceKey(request.instancekey);
      let alreadyExist = await this.studentRecommendationRepository.findOne({
        attempt: new Types.ObjectId(request.attemptId),
        user: new Types.ObjectId(request.userId)
      })

      if (alreadyExist) return { res: alreadyExist }

      this.attemptRepository.setInstanceKey(request.instancekey);
      let attempt: any = await this.attemptRepository.findById(new Types.ObjectId(request.attemptId));
      attempt = await this.attemptRepository.populate(attempt,
        {
          path: "attemptdetails",
          select: "-_id QA",
          options: { lean: true },
          populate: {
            path: "QA.question",
            options: { lean: true },
          },
        }
      )
      if (!attempt) {
        throw { msg: "Attempt is not found" }
      }
      var careerScore: any = {
        Personality: {},
        Aptitude: {},
        Interest: [],
      }
      attempt = this.removeAttemptDetails(attempt);

      var aptitude_cal = this.calculateAptitude(attempt);
      careerScore.Aptitude = aptitude_cal.allBranch;

      var personality_cal = this.calculatePersonality(attempt);
      careerScore.Personality = personality_cal.allBranch;

      careerScore.Interest = this.calculateInterest(attempt);

      var finalResult: any = []

      for (var i = 0; i < careerScore.Interest.length; i++) {
        finalResult.push({
          branch: careerScore.Interest[i].name,
          percentage:
            careerScore.Personality[i].mark * 0.3 +
            careerScore.Aptitude[i].mark * 0.4 +
            careerScore.Interest[i].mark * 0.3,
          aptitudeAnalysis: aptitude_cal.aptitudeAnalysis,
          personalityAnalysis: personality_cal.personalityAnalysis,
        });
      }

      finalResult.sort((a: any, b: any) => {
        return a.percentage < b.percentage;
      });
      Logger.debug(finalResult);

      var recommendation: any = [];
      for (var i = 0; i < 2; i++) {
        if (i == 0) {
          finalResult[i].isMain = true;
        } else {
          finalResult[i].isMain = false;
        }

        recommendation.push(finalResult[i]);
      }

      var stdRecommendation: any = {
        user: new Types.ObjectId(request.userId),
        attempt: new Types.ObjectId(request.attemptId),
        recommendation: recommendation,
      };

      if (request.userName) {
        stdRecommendation.name = request.userName;
      }

      if (request.userEmail) {
        stdRecommendation.email = request.userEmail;
      }
      if (request.userPhoneNumber) {
        stdRecommendation.phoneNumber = request.userPhoneNumber;
      }
      if (request.userGender) {
        stdRecommendation.gender = request.userGender;
      }
      if (request.userInterest) {
        stdRecommendation.interest = request.userInterest;
      }
      if (request.userCity) {
        stdRecommendation.city = request.userCity;
      }
      if (request.userState) {
        stdRecommendation.state = request.userState;
      }
      if (request.userDistrict) {
        stdRecommendation.district = request.userDistrict;
      }
      if (request.userBirthDate) {
        stdRecommendation.birthdate = request.userBirthDate;
      }
      if (request.userKnowAboutUs) {
        stdRecommendation.knowAboutUs = request.userKnowAboutUs;
      }

      this.studentRecommendationRepository.setInstanceKey(request.instancekey)
      await this.studentRecommendationRepository.create(stdRecommendation);

      return { res: stdRecommendation }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async getAttempt(request: GetAttemptRequest) {
    try {
      var condition: any = {};
      if (request.attemptId.length === 24 && checkForHexRegExp.test(request.attemptId)) {
        condition._id = new Types.ObjectId(request.attemptId)
      } else {
        condition.idOffline = new Types.ObjectId(request.attemptId)
      }
      this.attemptRepository.setInstanceKey(request.instancekey)
      let attempt = await this.attemptRepository.findOne(condition)
      attempt = await this.attemptRepository.populate(attempt, [
        {
          path: "attemptdetails",
          populate: { path: "QA.question", options: { lean: true } },
          select: "-_id QA",
        },
        { path: "user", options: { lean: true } }
      ])
      if (!attempt) {
        throw "Not Found"
      }
      this.practiceSetRepository.setInstanceKey(request.instancekey)
      this.userRepository.setInstanceKey(request.instancekey)
      let practiceSet: any = await this.practiceSetRepository.findById(attempt.practicesetId);
      let user: any = await this.userRepository.findById(practiceSet.user)

      practiceSet.user = user;
      attempt.practiceSet = practiceSet;

      return { attempt }
    } catch (err) {
      throw "Internal server error"
    }
  }

  async create(request: CreateRequest) {
    try {
      let data: any = request.body;

      let token = request.token.split(' ')[1];
      let ip = request.ip;

      let newAttempt = await this.processNewAttempt(request)

      await this.userLogRepository.updateOne(
        {
          user: new Types.ObjectId(request.userId),
          takingPracticeSet: new Types.ObjectId(data.testId),
          $or: [{ token: token }, { ip: ip }]
        },
        { $unset: { takingPracticeSet: 1 } }
      )

      return newAttempt;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async finish(request: FinishRequest) {
    try {
      this.attemptRepository.setInstanceKey(request.instancekey);
      let attempt = await this.attemptRepository.findOne(
        {
          _id: new Types.ObjectId(request.attemptId),
          ongoing: false
        }
      )

      attempt = await this.attemptRepository.populate(attempt,
        {
          path: "attemptdetails",
          select: "-_id QA",
        }
      );

      if (attempt && !request.attemptId) {
        attempt = this.removeAttemptDetails(attempt);
        return { attempt }
      }

      let body = {
        answersOfUser: request.answersOfUser,
        practiceId: request.practiceId,
        isAbandoned: request.isAbandoned,
        questionOrder: request.questionOrder
      }
      let newAttempt = await this.attemptProcessor.process(
        request.instancekey, request.attemptId, body
      )
      return { attempt: newAttempt }

    } catch (err) {
      throw "Internal Server error"
    }
  }

  async getCareerAttempts(request: GetCareerAttemptsRequest) {
    try {
      var sort = { "createdAt": -1 };
      let page = 1;
      let limit = 20;
      let skip = 0;
      if (request.page && request.limit) {
        page = request.page ? request.page : 1;
        limit = request.limit ? request.limit : 20;
        skip = (page - 1) * limit;
      }
      this.studentRecommendationRepository.setInstanceKey(request.instancekey)
      var query = await this.studentRecommendationRepository.find({}, null,
        {
          sort: sort,
          limit: limit,
          skip: skip
        }
      )
      return { results: query }
    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }

  async getCareerSum(request: GetCareerSumReq) {
    try {
      const baseFilter = {
        roles: config.roles.student,
        $or: [
          { isActive: { $exists: false } },
          { isActive: true }
        ]
      };
      this.userRepository.setInstanceKey(request.instancekey)
      this.attemptRepository.setInstanceKey(request.instancekey)

      return new Promise((resolve, reject) => {
        async.parallel(
          [
            (cb) => {
              // Count total students
              this.userRepository.countDocuments(baseFilter).then(count => cb(null, count)).catch(cb);
            },
            (cb) => {
              // Count installed students, count any student has 'interest' field
              const copyFilter = _.clone(baseFilter);
              copyFilter.interest = { $exists: true };
              this.userRepository.countDocuments(copyFilter).then(count => cb(null, count)).catch(cb);
            },
            (cb) => {
              // count attempt on the test '5af3385aec9c7e000b7fddfa'
              this.attemptRepository.countDocuments(
                { practicesetId: "5af3385aec9c7e000b7fddfa", isAbandoned: false }
              ).then(count => cb(null, count)).catch(cb);
            },
            (cb) => {
              // Simulate rating retrieval
              cb(null, 4.2);
            },
          ],
          (err, results) => {
            if (err) {
              Logger.error('Error in getCareerSum:', err);
              return reject({ status: 500, message: 'Internal Server Error' });
            }
            resolve({
              totalStudents: results[0],
              installed: results[1],
              totalAttempts: results[2],
              rating: results[3],
            });
          }
        );
      });
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async findOne(request: FindOneRequest) {
    try {
      var condition = {};
      if (request.attemptId.length == 24 && checkForHexRegExp.test(request.attemptId)) {
        condition["_id"] = new Types.ObjectId(request.attemptId);
      } else {
        condition["idOffline"] = new Types.ObjectId(request.attemptId);
      }

      if (request.onlyTimeAndScore) {
        this.attemptRepository.setInstanceKey(request.instancekey)
        let atm = await this.attemptRepository.findOne(
          condition,
          {
            totalTime: 1,
            totalMarks: 1,
            maximumMarks: 1,
            pending: 1,
            totalMissed: 1,
            totalQuestions: 1,
            practicesetId: 1,
          }
        )
        atm = await this.attemptRepository.populate(atm, {
          path: "practicesetId",
          select: "isShowAttempt isShowResult"
        })

        atm.showScore = !atm.pending &&
          atm.practicesetId?.isShowAttempt &&
          atm.practicesetId?.isShowResult;
        return { atm }
      }
      let atm = await this.findOneItem(request, condition)
      return { atm }
    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }

  async classroomSummarySpeed(request: ClassroomSummarySpeedRequest) {
    try {
      let listUser = await this.studentBus.getUserIdList(request)

      if (!listUser || listUser.length == 0) {
        return null
      } else {
        var condition = this.conditionSummary(request, true);
        condition["user"] = {
          $in: listUser,
        }
        condition["practiceSetInfo.accessMode"] = "invitation";
        condition["practiceSetInfo.classRooms"] = {
          $in: [new Types.ObjectId(request.classroom)]
        }

        let results = await this.classroomSummarySpeedHelper(request, condition)
        return { results }
      }
    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }

  async classroomSummarySpeedByDate(request: ClassroomSummarySpeedByDateRequest) {
    try {
      let listUser = await this.studentBus.getUserIdList(request);
      if (!listUser || listUser.length == 0) {
        return null;
      } else {
        var condition = this.conditionSummary(request, true);
        condition["user"] = {
          $in: listUser,
        }
        condition["practiceSetInfo.accessMode"] = "invitation";
        condition["practiceSetInfo.classRooms"] = {
          $in: [new Types.ObjectId(request.classroom)]
        }

        let results = await this.classroomSummarySpeedByDateHelper(request, condition);
        return { results }
      }
    } catch (err) {
      Logger.error(err);
      throw "Internal server error"
    }
  }

  async summaryAllSubjectCorrectByDateMe(request: SummarySubjectCorrectByDateMeRequest) {
    try {
      const condition = this.conditionSummary(request);
      const results = await this.summarySubjectCorrectByDate(request, condition)
      return { results }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  private scoreInSubject(subj: string, myArray: any[]): number {
    for (const item of myArray) {
      if (item.subject === subj) {
        return item.correct;
      }
    }
  }

  async calculateSatTotalScore(request: CalculateSatTotalScoreReq) {
    try {
      const condition = { attempt: new Types.ObjectId(request.attempt) };

      const match = { $match: condition };
      const unwind = { $unwind: '$QA' };
      const projectOne = { $project: { subject: '$QA.subject.name', status: '$QA.status', _id: 0 } };
      const groupBy = { $group: { _id: '$subject', correct: { $sum: { $cond: [{ $eq: ['$status', 1] }, 1, 0] } } } };
      const projectTwo = { $project: { subject: '$_id', correct: 1, _id: 0 } };

      this.attemptRepository.setInstanceKey(request.instancekey)
      const result = await this.attemptRepository.aggregate([match, unwind, projectOne, groupBy, projectTwo]);

      const ReadingRawScore = this.scoreInSubject('Reasoning Ability', result);
      const WritingRawScore = this.scoreInSubject('Quantitative Aptitude', result);
      const MathRawScore = this.scoreInSubject('English Language', result);

      if (ReadingRawScore === undefined || WritingRawScore === undefined || MathRawScore === undefined) {
        return { statusCode: 400, error: "Attempt is not as per SAT Exam standard." };
      } else {
        const EvidenceBasedReadingAndWritingScore =
          (Number(SatCalculationTable[ReadingRawScore]['Reading']) + Number(SatCalculationTable[WritingRawScore]['Writing and Language'])) * 10;
        const MathSectionScore = Number(SatCalculationTable[MathRawScore]['Math']);
        const totalRequiredScore = EvidenceBasedReadingAndWritingScore + MathSectionScore;

        return { totalScore: totalRequiredScore };
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getAttemptByUser(request: GetAttemptByUserReq) {
    try {
      if (request.query.type === 'attempt') {
        this.attemptRepository.setInstanceKey(request.instancekey)
        const attempts = await this.attemptRepository.find(
          { practicesetId: new ObjectId(request.query.practicesetId), user: new ObjectId(request.query.id) },
          { face_detection: 1, markedSuspicious: 1, ongoing: 1, isAbandoned: 1, fraudDetected: 1 },
          { sort: { createdAt: 1 }, lean: true }
        );
        return { response: { attempts } };
      } else if (request.query.type === 'attemptDetail') {
        this.attemptDetailRepository.setInstanceKey(request.instancekey)
        const attemptDetails = await this.attemptDetailRepository.find(
          { practicesetId: new Types.ObjectId(request.query.practicesetId), user: new ObjectId(request.query.id) },
          { QA: 1, isAbandoned: 1 },
          { sort: { createdAt: 1 }, lean: true }
        );

        return { response: { attemptDetails } };
      } else if (request.query.type === 'attendance') {
        this.attendanceRepository.setInstanceKey(request.instancekey)
        const att = await this.attendanceRepository.find(
          { practicesetId: new Types.ObjectId(request.query.practicesetId), studentId: new ObjectId(request.query.id) },
          undefined,
          { lean: true }
        );

        if (att.length > 0) {
          const attendanceData = att[0];
          const attendance = {
            attemptLimit: attendanceData.attemptLimit,
            offscreenLimit: attendanceData.offscreenLimit,
            notes: attendanceData.notes,
          };
          return { response: { attendance } };
        } else {
          const attendance = {};
          return { response: { attendance } };
        }
      }
      else {
        return {}
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async topperSummary(request: TopperSummaryReq) {
    try {
      let topperSummary = {
        topTime: 0,
        topScore: 0,
      };

      this.attemptRepository.setInstanceKey(request.instancekey)
      const attemptForTime = await this.attemptRepository.find(
        { practicesetId: new ObjectId(request.testId), isAbandoned: false },
        { totalTime: 1 },
        { sort: { totalTime: 1.0 }, lean: true }
      );

      const attemptForScore = await this.attemptRepository.find(
        { practicesetId: new ObjectId(request.testId), isAbandoned: false },
        { totalMark: 1 },
        { sort: { totalMark: -1.0 }, lean: true }
      );

      if (attemptForTime.length > 0) {
        topperSummary.topTime = attemptForTime[0].totalTime;
      }
      if (attemptForScore.length > 0) {
        topperSummary.topScore = attemptForScore[0].totalMark;
      }

      return topperSummary;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async accuracyBySubject(request: AccuracyBySubjectReq) {
    try {
      let condition: any = { user: new ObjectId(request.userId) };

      if (request.query.subjects) {
        const subjects = request.query.subjects.split(',').map(id => new ObjectId(id));
        condition['QA.subject._id'] = {
          $in: subjects
        };
      }
      this.attemptDetailRepository.setInstanceKey(request.instancekey)
      let unitSummary: any = await this.attemptDetailRepository.aggregate([
        { $match: condition },
        { $project: { user: 1, practicesetId: 1, QA: 1 } },
        { $unwind: "$QA" },
        {
          $group: {
            _id: { _id: "$QA.unit._id", name: "$QA.unit.name" },
            count: { $sum: 1 },
            timeEslapse: { $sum: "$QA.timeEslapse" },
            doQuestion: { $sum: { $cond: [{ $eq: ["$QA.status", 3] }, 0, 1] } },
            actualMarks: { $sum: "$QA.actualMarks" },
            obtainMarks: { $sum: "$QA.obtainMarks" }
          }
        },
        {
          $project: {
            _id: 0,
            avgTimeDoQuestion: {
              $cond: [{
                $eq: ["$doQuestion", 0]
              }, 0, {
                $divide: ["$timeEslapse", "$doQuestion"]
              }]
            },
            accuracy: {
              $multiply: [{
                $cond: [{
                  $eq: ["$actualMarks", 0]
                }, 0, {
                  $divide: ["$obtainMarks", "$actualMarks"]
                }]
              }, 100]
            },
            unit: "$_id.name"
          }
        },
        { $match: { accuracy: { $lt: 40 } } }
      ]);

      unitSummary = unitSummary.filter(d => d.unit);

      return { unitSummary };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getUserResponse(request: CalculateSatTotalScoreReq) {
    try {
      const condition: any = {};
      const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

      if (request.attempt.length === 24 && checkForHexRegExp.test(request.attempt)) {
        condition['_id'] = new ObjectId(request.attempt);
      } else {
        condition['idOffline'] = request.attempt;
      }

      this.attemptDetailRepository.setInstanceKey(request.instancekey)
      const attemptObj = await this.attemptRepository.findOne(
        condition, undefined,
        {
          populate: [{ path: 'attemptdetails', select: '-_id QA', options: { lean: true } }],
          lean: true, new: true
        }
      );

      if (!attemptObj) {
        return null;
      }

      if (attemptObj.attemptdetails) {
        attemptObj.QA = attemptObj.attemptdetails.QA;
        return { QA: attemptObj.QA };
      }
      return { QA: [] }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }


}
