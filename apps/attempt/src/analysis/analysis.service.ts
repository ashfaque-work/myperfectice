import {
    AttemptDetailRepository, AttemptRepository, ClassroomRepository, Constants, globals, TestSeriesRepository,
    UserCourseRepository, UsersRepository
} from "@app/common";
import { AllFirstQuestionsDetailReq, GetTimeWastedReq, PeakTimeAndDurationReq } from "@app/common/dto/analysis.dto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions";

@Injectable()

export class AnalysisService {
    constructor(
        private readonly attemptRepository: AttemptRepository,
        private readonly attemptDetailRepository: AttemptDetailRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly userRepository: UsersRepository,
        private readonly userCourseRepository: UserCourseRepository,
        private readonly testSeriesRepository: TestSeriesRepository
    ) { }

    //Internal Function - start
    private getMaxLength(arr: any[]): { maxStart: number; maxEnd: number } {
        let count = 0;
        let result = 0;
        let maxEnd = 0;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].status == 0)
                count = 0;
            else {
                count++;
                if (count > result) {
                    maxEnd = i;
                    result = count;
                }
            }
        }

        const answer: any = { "maxEnd": maxEnd };
        if (result > 1)
            answer["maxStart"] = (maxEnd - result + 1);
        else if (result == 1)
            answer["maxStart"] = maxEnd;
        else
            answer["maxStart"] = 0;

        return answer;
    }

    private peakTimeAndDurationOfAttempt(attempt: any): any {
        const cumulativeTimeAndStatus = [];
        const reqFieldsQA = [];
        for (let i = 0; i < attempt.QA.length; i++) {
            reqFieldsQA.push({
                createdAt: attempt.QA[i].createdAt,
                status: attempt.QA[i].status == 1 ? 1 : 0
            });

            cumulativeTimeAndStatus.push({
                cumulativeTime: Math.abs(Math.round((attempt.QA[i].createdAt - attempt.createdAt) / 1000)),
                status: attempt.QA[i].status
            });
        }

        reqFieldsQA.sort((a, b) => {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        cumulativeTimeAndStatus.sort((a, b) => {
            return a.cumulativeTime - b.cumulativeTime;
        });

        const response: any = this.getMaxLength(reqFieldsQA);
        if (reqFieldsQA.length > 0) {
            if (reqFieldsQA[response.maxStart] && reqFieldsQA[response.maxStart].status == 1)
                response.peakStart = Math.abs(Math.round((reqFieldsQA[response.maxStart].createdAt - attempt.createdAt) / 1000));
            else
                response.peakStart = 0;
            response.peakDuration = Math.round((reqFieldsQA[response.maxEnd].createdAt - reqFieldsQA[response.maxStart].createdAt) / 1000);
            response.cumulativeTimeAndStatus = cumulativeTimeAndStatus;
        }

        return response;
    }

    private async getPracticeQuestionCountByDays(request: any, day: number): Promise<number> {
        const filter: any = {
            user: request.query.user ? new Types.ObjectId(request.query.user) : new Types.ObjectId(request.user._id),
        };

        if (request.query.subject) {
            filter['QA'] = {
                "$elemMatch": {
                    "status": { $ne: 3 },
                    "subject._id": new Types.ObjectId(request.query.subject)
                }
            };
        } else {
            filter['QA'] = {
                "$elemMatch": {
                    "status": { $ne: 3 },
                }
            };
        }

        if (day > 0) {
            const lastDate = parseInt(day.toString());
            filter.createdAt = {
                $gte: new Date((new Date().getTime() - (lastDate * 24 * 60 * 60 * 1000)))
            };
        }

        this.attemptDetailRepository.setInstanceKey(request.instancekey)
        const questionCount: any = await this.attemptDetailRepository.aggregate([
            { $project: { user: 1, createdAt: 1, "QA.status": 1, "QA.subject": 1 } },
            { $match: filter },
            { $project: { user: 1, createdAt: 1, "questions": { $size: "$QA" } } },
            { $group: { _id: "$user", count: { $sum: "$questions" } } }
        ]);

        if (!questionCount || questionCount.length === 0) {
            return 0;
        }
        return questionCount[0].count;
    }
    //Internal Function - end

    async peakTimeAndDuration(request: PeakTimeAndDurationReq): Promise<any> {
        try {
            this.attemptDetailRepository.setInstanceKey(request.instancekey)
            const attempt = await this.attemptDetailRepository.findOne(
                { attempt: new Types.ObjectId(request.query.attemptId) },
                { "QA.createdAt": 1, "QA.status": 1, createdAt: 1 }
            );

            if (!attempt) {
                return { msg: "No attempt found." };
            }

            const reqResponse = this.peakTimeAndDurationOfAttempt(attempt);

            return reqResponse;
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async allFirstQuestionsDetail(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            this.attemptRepository.setInstanceKey(request.instancekey)
            this.attemptDetailRepository.setInstanceKey(request.instancekey)
            const userId = request.query.user ? new Types.ObjectId(request.query.user) : new Types.ObjectId(request.user._id);
            const matchUser = { $match: { user: userId, isAbandoned: false, totalCorrects: { $gte: 1 } } };
            const projectQA = { $project: { QA: 1 } };
            const unwindQA = { $unwind: "$QA" };
            const projectTopic = { $project: { "topic._id": "$QA.topic._id", "topic.name": "$QA.topic.name", status: "$QA.status" } };
            const groupByTopic = {
                $group: {
                    _id: "$topic",
                    totalQuestions: { $sum: 1 },
                    totalErrors: { $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] } },
                    totalCorrects: { $sum: { $cond: [{ $eq: ["$status", 1] }, 1, 0] } }
                }
            };
            const projectTopicAndCorrect = { $project: { topic: "$_id", correct: { $divide: ["$totalCorrects", "$totalQuestions"] }, _id: 0 } };
            const matchCorrect = { $match: { correct: { $gt: 0.49 } } };
            const sortByCorrect = { $sort: { "correct": -1 } };
            const bestTopics: any = await this.attemptRepository.aggregate([
                matchUser,
                globals.lookup, globals.unw, globals.add, globals.pro,
                projectQA,
                unwindQA,
                projectTopic,
                groupByTopic,
                projectTopicAndCorrect,
                matchCorrect,
                sortByCorrect
            ]);

            const attempts: any = await this.attemptDetailRepository.aggregate([
                {
                    $match: { user: userId, isAbandoned: false },
                },
                {
                    $project: {
                        "QA.createdAt": 1, "QA.status": 1, "QA.topic": 1, createdAt: 1
                    }
                }
            ]);

            if (attempts.length > 0) {
                let totalTimeToPickUp = 0;
                let totalCorrect = 0;
                let isAreaOfStrength = 0;
                let totalFirstQuestions = 0;
                const n = attempts.length;
                for (let i = 0; i < n; i++) {
                    const reqFieldsQA = [];
                    for (let k = 0; k < (attempts[i].QA).length; k++) {
                        if ((attempts[i].QA)[k].status == 1 || (attempts[i].QA)[k].status == 2)
                            reqFieldsQA.push((attempts[i].QA)[k]);
                    }

                    if (reqFieldsQA.length > 0) {
                        reqFieldsQA.sort((a, b) => {
                            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                        });

                        const firstQuestion = reqFieldsQA[0];
                        totalTimeToPickUp += new Date(firstQuestion.createdAt).getTime() - new Date(attempts[i].createdAt).getTime();
                        totalCorrect += (firstQuestion.status == 1) ? 1 : 0;

                        for (let j = 0; j < bestTopics.length; j++) {
                            if (bestTopics[j].topic && (bestTopics[j].topic._id).equals(firstQuestion.topic._id)) {
                                isAreaOfStrength += 1;
                                break;
                            }
                        }
                        totalFirstQuestions += 1;
                    }
                }

                if (totalFirstQuestions == 0) {
                    return { msg: 'No question found' };
                }

                const answer: any = {
                    avgTimeToPickUp: (Math.round(totalTimeToPickUp / (totalFirstQuestions * 1000))) / 60000,
                    correctAnswer: Math.round((totalCorrect / totalFirstQuestions) * 100),
                    areaOfStrength: Math.round((isAreaOfStrength / totalFirstQuestions) * 100)
                };

                return answer;
            } else {
                return {
                    avgTimeToPickUp: 0,
                    correctAnswer: 0,
                    areaOfStrength: 0
                };
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async averagePeakTimeAndDuration(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            this.attemptDetailRepository.setInstanceKey(request.instancekey)
            const userId = request.query.user ? new Types.ObjectId(request.query.user) : new Types.ObjectId(request.user._id);
            let filter: any = {
                user: userId,
                isAbandoned: false
            };

            if (request.query.subject) {
                filter.QA = {
                    $elemMatch: {
                        "subject._id": new Types.ObjectId(request.query.subject)
                    }
                };
            }

            const attempts = await this.attemptDetailRepository.aggregate([
                { $match: filter },
                { $project: { "QA.createdAt": 1, "QA.status": 1, createdAt: 1 } }
            ]);

            if (attempts.length > 0) {
                let n = 0;
                let totalPeakStart = 0;
                let totalPeakDuration = 0;
                for (let i = 0; i < attempts.length; i++) {
                    if (attempts[i].QA.length > 0) {
                        n++;
                        const temp = this.peakTimeAndDurationOfAttempt(attempts[i]);
                        totalPeakStart += temp.peakStart;
                        totalPeakDuration += temp.peakDuration;
                    }
                }

                const reqResponse: any = {
                    avgPeakStart: n ? totalPeakStart / n : 0,
                    avgPeakDuration: n ? totalPeakDuration / n : 0
                };

                return reqResponse;
            } else {
                throw new BadRequestException({ "status": 400, "error": "Not completed any attempt till now by user." });
            }
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(error.getResponse());
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async questionsExceedAvgTime(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            this.attemptRepository.setInstanceKey(request.instancekey)
            this.attemptDetailRepository.setInstanceKey(request.instancekey)
            const lookup = { $lookup: { from: 'practicesets', localField: 'practicesetId', foreignField: '_id', as: 'psdetail' } };
            const unwindPsdetail = { $unwind: '$psdetail' };
            const projectQA = {
                $project: {
                    QA: 1,
                    avgtime: {
                        $cond: {
                            if: { $eq: ['$psdetail.isAdaptive', true] },
                            then: { $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.questionsToDisplay'] }, 60000] },
                            else: {
                                $cond: {
                                    if: { $eq: ['$psdetail.sectionTimeLimit', true] },
                                    then: { $multiply: [{ $divide: [{ $sum: '$psdetail.sections.time' }, '$psdetail.totalQuestion'] }, 60000] },
                                    else: { $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.totalQuestion'] }, 60000] }
                                }
                            }
                        }
                    }
                }
            };

            const unwindQA = { $unwind: '$QA' };
            const projectQuestion = {
                $project: {
                    question: '$QA.question',
                    avgtime: 1,
                    timeElapse: '$QA.timeEslapse',
                    status: '$QA.status',
                    'subject._id': '$QA.subject._id',
                    'subject.name': '$QA.subject.name',
                    'unit._id': '$QA.unit._id',
                    'unit.name': '$QA.unit.name',
                    'topic._id': '$QA.topic._id',
                    'topic.name': '$QA.topic.name',
                    _id: 0,
                    cmp_value: { $gt: ['$QA.timeEslapse', '$avgtime'] }
                }
            };
            const matchCMP = { $match: { cmp_value: true } };
            const projectExtraTime = { $project: { question: 1, extraTime: { $divide: [{ $subtract: ['$timeElapse', '$avgtime'] }, 1000] }, status: 1 } };
            const group = {
                $group: {
                    _id: null,
                    questionsExceededAvgTime: { $sum: 1 },
                    timewasted: { $sum: { $cond: [{ $in: ['$status', [2, 3]] }, '$extraTime', 0] } },
                    incorrectAndAvgTimeExceeded: { $sum: { $cond: [{ $in: ['$status', [2, 3]] }, 1, 0] } }
                }
            };
            const project = { $project: { _id: 0, count: 1, timeWasted: { $divide: ['$timewasted', 60] }, incorrectAndAvgTimeExceeded: 1, questionsExceededAvgTime: 1 } };

            const aggregationPipe = [lookup, unwindPsdetail, projectQA, unwindQA, projectQuestion, matchCMP, projectExtraTime, group, project];

            if (request.query.attemptId) {
                const matchAttempt: any = { $match: { attempt: new Types.ObjectId(request.query.attemptId) } };
                aggregationPipe.unshift(matchAttempt);

                const result = await this.attemptDetailRepository.aggregate(aggregationPipe);

                return { result };
            } else {
                const matchQuery: any = { user: new Types.ObjectId(request.user._id), isAbandoned: false };
                aggregationPipe.unshift({ $match: matchQuery });

                const result = await this.attemptRepository.aggregate(aggregationPipe);

                return { result };
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async firstQuestionDetail(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            this.attemptDetailRepository.setInstanceKey(request.instancekey)
            const attemptId = new Types.ObjectId(request.query.attemptId);
            const userId = new Types.ObjectId(request.user._id);

            const matchUser = { $match: { user: userId, isAbandoned: false, totalCorrects: { $gte: 1 } } };
            const projectQA = { $project: { QA: 1 } };
            const unwindQA = { $unwind: "$QA" };
            const projectTopic = { $project: { "topic._id": "$QA.topic._id", "topic.name": "$QA.topic.name", status: "$QA.status" } };
            const groupByTopic = {
                $group: {
                    _id: "$topic",
                    totalQuestions: { $sum: 1 },
                    totalErrors: { $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] } },
                    totalCorrects: { $sum: { $cond: [{ $eq: ["$status", 1] }, 1, 0] } }
                }
            };
            const projectTopicAndCorrect = { $project: { topic: "$_id", correct: { $divide: ["$totalCorrects", "$totalQuestions"] }, _id: 0 } };
            const matchCorrect = { $match: { correct: { $gt: 0.49 } } };
            const sortByCorrect = { $sort: { "correct": -1 } };

            const bestTopics: any = await this.attemptRepository.aggregate([
                matchUser,
                globals.lookup, globals.unw, globals.add, globals.pro,
                projectQA,
                unwindQA,
                projectTopic,
                groupByTopic,
                projectTopicAndCorrect,
                matchCorrect,
                sortByCorrect
            ]);

            const attempt = await this.attemptDetailRepository.findOne(
                { attempt: attemptId },
                { "QA.createdAt": 1, "QA.status": 1, "QA.topic": 1, createdAt: 1 }
            );

            if (!attempt) {
                throw new Error('Please pass valid attempt Id');
            }

            const reqFieldsQA = attempt.QA.filter(qa => qa.status === 1 || qa.status === 2);

            reqFieldsQA.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            if (reqFieldsQA.length > 0) {
                const firstQuestion = reqFieldsQA[0];
                const answer = {
                    answeredCorrectly: firstQuestion.status === 1,
                    isAreaOfStrength: false,
                    timeToPickUp: Math.round(((new Date(firstQuestion.createdAt).getTime() - new Date(attempt.createdAt).getTime()) / 1000) / 60),
                    topic: firstQuestion.topic
                };

                for (const topic of bestTopics) {
                    if (topic.topic && new Types.ObjectId(topic.topic._id).equals(new Types.ObjectId(firstQuestion.topic._id))) {
                        answer.isAreaOfStrength = true;
                    }
                }

                return answer;
            }

            return {};
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async questionsWithExceedTimeFlag(request: PeakTimeAndDurationReq): Promise<any> {
        try {
            const attemptId = new Types.ObjectId(request.query.attemptId);

            const matchAttempt = { $match: { attempt: attemptId } };
            const lookupPractice = { $lookup: { from: 'practicesets', localField: 'practicesetId', foreignField: '_id', as: 'psdetail' } };
            const unwindPS = { $unwind: '$psdetail' };
            const projectQA = {
                $project: {
                    QA: 1,
                    avgTime: {
                        $cond: {
                            if: { $eq: ['$psdetail.isAdaptive', true] },
                            then: { $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.questionsToDisplay'] }, 60] },
                            else: {
                                $cond: {
                                    if: { $eq: ['$psdetail.sectionTimeLimit', true] },
                                    then: {
                                        $multiply: [{ $divide: [{ $sum: '$psdetail.sections.time' }, '$psdetail.totalQuestion'] }, 60]
                                    },
                                    else: {
                                        $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.totalQuestion'] }, 60]
                                    }
                                }
                            }
                        }
                    }
                }
            };
            const unwindQA = { $unwind: '$QA' };
            const projectAvgTime = {
                $project: {
                    avgTime: 1,
                    question: '$QA.question',
                    timeElapse: '$QA.timeEslapse',
                    status: '$QA.status',
                    topic: '$QA.topic',
                    unit: '$QA.unit',
                    subject: '$QA.subject',
                    index: '$QA.index',
                    _id: 0,
                    exceededAvgTime: { $gt: ['$QA.timeEslapse', { $multiply: ['$avgTime', 1000] }] }
                }
            };
            const lookupQuestions = { $lookup: { from: 'questions', localField: 'question', foreignField: '_id', as: 'quesDetail' } };
            const unwindQuesDetail = { $unwind: '$quesDetail' };
            const project = {
                $project: {
                    exceededAvgTime: 1,
                    timeElapse: { $divide: ['$timeElapse', 1000] },
                    avgTime: 1,
                    status: 1,
                    topic: 1,
                    unit: 1,
                    index: 1,
                    subject: 1,
                    question: {
                        id: '$quesDetail._id',
                        text: '$quesDetail.questionText'
                    }
                }
            };

            const aggregationPipe = [
                matchAttempt,
                lookupPractice,
                unwindPS,
                projectQA,
                unwindQA,
                projectAvgTime,
                lookupQuestions,
                unwindQuesDetail,
                project
            ];

            this.attemptDetailRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptDetailRepository.aggregate(aggregationPipe);

            return { result };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async topicsUserExceedAvgTime(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            const userId = request.query.user ? new Types.ObjectId(request.query.user) : new Types.ObjectId(request.user._id);
            let filter: any = {
                user: userId,
                isAbandoned: false
            };

            if (request.query.subject) {
                filter.QA = {
                    $elemMatch: {
                        "subject._id": new Types.ObjectId(request.query.subject)
                    }
                };
            }

            const matchUser = { $match: filter };
            const lookupPS = { $lookup: { from: "practicesets", localField: "practicesetId", foreignField: "_id", as: "psdetail" } };
            const unwindPS = { $unwind: "$psdetail" };
            const projectQA = {
                $project: {
                    QA: 1,
                    avgTime: {
                        $cond: {
                            if: { $eq: ['$psdetail.isAdaptive', true] },
                            then: { $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.questionsToDisplay'] }, 60] },
                            else: { $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.totalQuestion'] }, 60] }
                        }
                    }
                }
            };
            const unwindQA = { $unwind: '$QA' };
            const projectTime = {
                $project: {
                    _id: 0,
                    timeElapse: '$QA.timeEslapse',
                    status: '$QA.status',
                    'subject._id': '$QA.subject._id',
                    'subject.name': '$QA.subject.name',
                    'topic._id': '$QA.topic._id',
                    'topic.name': '$QA.topic.name',
                    exceedAvgTime: { $gt: ['$QA.timeEslapse', { $multiply: ['$avgTime', 1000] }] },
                    diff: { $subtract: [{ $divide: ['$QA.timeEslapse', 1000] }, '$avgTime'] }
                }
            };
            const matchStatus = { $match: { status: { $in: [2, 3] }, exceedAvgTime: true } };
            const groupTopic = { $group: { _id: { subject: '$subject', topic: '$topic' }, count: { $sum: 1 }, totaldiff: { $sum: '$diff' } } };
            const projectTopic = { $project: { subject: '$_id.subject', topic: '$_id.topic', count: 1, avgTimeExc: { $divide: ['$totaldiff', '$count'] }, _id: 0 } };
            const sortCount = { $sort: { count: -1, avgTimeExc: -1 } };
            const limit = { $limit: 10 };

            const aggregationPipe = [matchUser, lookupPS, unwindPS, projectQA, unwindQA, projectTime, matchStatus, groupTopic, projectTopic, sortCount, limit];

            this.attemptDetailRepository.setInstanceKey(request.instancekey)
            const results = await this.attemptDetailRepository.aggregate(aggregationPipe);

            return { results };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async unitUserExceedAvgTime(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            const userId = new Types.ObjectId(request.user._id);
            let filter: any = {
                user: userId,
                isAbandoned: false
            };
            if (request.query.subject) {
                filter['QA'] = {
                    $elemMatch: {
                        'subject._id': new Types.ObjectId(request.query.subject)
                    }
                };
            }

            const matchUser = { $match: filter };
            const lookupPS = { $lookup: { from: 'practicesets', localField: 'practicesetId', foreignField: '_id', as: 'psdetail' } };
            const unwindPS = { $unwind: '$psdetail' };
            const projectQA = {
                $project: {
                    QA: 1,
                    avgTime: {
                        $cond: {
                            if: { $eq: ['$psdetail.isAdaptive', true] },
                            then: { $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.questionsToDisplay'] }, 60] },
                            else: {
                                $cond: {
                                    if: { $eq: ['$psdetail.sectionTimeLimit', true] },
                                    then: { $multiply: [{ $divide: [{ $sum: '$psdetail.sections.time' }, '$psdetail.totalQuestion'] }, 60] },
                                    else: { $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.totalQuestion'] }, 60] }
                                }
                            }
                        }
                    }
                }
            };
            const unwindQA = { $unwind: '$QA' };
            const projectTime = {
                $project: {
                    timeElapse: '$QA.timeEslapse',
                    status: '$QA.status',
                    'subject._id': '$QA.subject._id',
                    'subject.name': '$QA.subject.name',
                    'unit._id': '$QA.unit._id',
                    'unit.name': '$QA.unit.name',
                    'topic._id': '$QA.topic._id',
                    'topic.name': '$QA.topic.name',
                    _id: 0,
                    exceedAvgTime: { $gt: ['$QA.timeEslapse', { $multiply: ['$avgTime', 1000] }] },
                    diff: { $subtract: [{ $divide: ['$QA.timeEslapse', 1000] }, '$avgTime'] }
                }
            };
            const matchStatus = { $match: { status: { $in: [2, 3, 5] }, exceedAvgTime: true } };
            const groupUnit = { $group: { _id: { subject: '$subject', unit: '$unit' }, count: { $sum: 1 }, totaldiff: { $sum: '$diff' } } };
            const projectUnit = { $project: { subject: '$_id.subject', unit: '$_id.unit', count: 1, avgTimeExc: { $divide: ['$totaldiff', '$count'] }, _id: 0 } };
            const sortCount = { $sort: { count: -1, avgTimeExc: -1 } };
            const limit = { $limit: 10 };

            const aggregationPipe = [matchUser, lookupPS, unwindPS, projectQA, unwindQA, projectTime, matchStatus, groupUnit, projectUnit, sortCount, limit];

            this.attemptDetailRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptDetailRepository.aggregate(aggregationPipe);

            if (result.length === 0) {
                throw new Error('Internal error...');
            }
            return { result };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async avoidUnitsOfUser(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            const userId = new Types.ObjectId(request.user._id);
            let filter: any = {
                user: userId,
                isAbandoned: false
            };
            if (request.query.subject) {
                filter['QA'] = {
                    $elemMatch: {
                        'subject._id': new Types.ObjectId(request.query.subject)
                    }
                };
            }

            const matchUser = { $match: filter };
            const lookupPS = { $lookup: { from: 'practicesets', localField: 'practicesetId', foreignField: '_id', as: 'psdetail' } };
            const unwindPS = { $unwind: '$psdetail' };
            const projectQA = {
                $project: {
                    QA: 1,
                    avgTime: {
                        $cond: {
                            if: { $eq: ['$psdetail.isAdaptive', true] },
                            then: { $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.questionsToDisplay'] }, 60] },
                            else: {
                                $cond: {
                                    if: { $eq: ['$psdetail.sectionTimeLimit', true] },
                                    then: { $multiply: [{ $divide: [{ $sum: '$psdetail.sections.time' }, '$psdetail.totalQuestion'] }, 60] },
                                    else: { $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.totalQuestion'] }, 60] }
                                }
                            }
                        }
                    }
                }
            };
            const unwindQA = { $unwind: '$QA' };
            const projectQues = {
                $project: {
                    question: '$QA.question',
                    timeElapse: '$QA.timeEslapse',
                    status: '$QA.status',
                    'unit.id': '$QA.unit._id',
                    'unit.name': '$QA.unit.name',
                    avgTime: 1,
                    _id: 0,
                    exceededAvgTime: { $gt: ['$QA.timeEslapse', { $multiply: ['$avgTime', 1000] }] }
                }
            };
            const matchStatus = { $match: { status: 2, exceededAvgTime: true } };
            const groupUnit = { $group: { _id: '$unit', count: { $sum: 1 } } };
            const projectUnit = { $project: { unitId: '$_id.id', unitName: '$_id.name', count: 1, _id: 0 } };
            const sort = { $sort: { count: -1 } };

            const aggregationPipe = [matchUser, lookupPS, unwindPS, projectQA, unwindQA, projectQues, matchStatus, groupUnit, projectUnit, sort];

            this.attemptDetailRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptDetailRepository.aggregate(aggregationPipe);
            if (result.length === 0) {
                throw new Error('Internal error...');
            }
            return { result };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async avoidTopicsOfUser(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            const userId = request.query.user ? new Types.ObjectId(request.query.user) : new Types.ObjectId(request.user._id);

            let filter: any = {
                user: userId,
                isAbandoned: false
            };
            if (request.query.subject) {
                filter['QA'] = {
                    $elemMatch: {
                        'subject._id': new Types.ObjectId(request.query.subject)
                    }
                };
            }
            if (request.query.attemptId) {
                filter['attempt'] = new Types.ObjectId(request.query.attemptId);
            }

            const matchUser = { $match: filter };
            const lookupPS = { $lookup: { from: 'practicesets', localField: 'practicesetId', foreignField: '_id', as: 'psdetail' } };
            const unwindPS = { $unwind: '$psdetail' };
            const projectQA = {
                $project: {
                    QA: 1,
                    avgTime: {
                        $cond: {
                            if: { $eq: ['$psdetail.isAdaptive', true] },
                            then: { $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.questionsToDisplay'] }, 60] },
                            else: {
                                $cond: {
                                    if: { $eq: ['$psdetail.sectionTimeLimit', true] },
                                    then: { $multiply: [{ $divide: [{ $sum: '$psdetail.sections.time' }, '$psdetail.totalQuestion'] }, 60] },
                                    else: { $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.totalQuestion'] }, 60] }
                                }
                            }
                        }
                    }
                }
            };
            const unwindQA = { $unwind: '$QA' };
            const projectQues = {
                $project: {
                    question: '$QA.question',
                    timeElapse: '$QA.timeEslapse',
                    status: '$QA.status',
                    'topic.id': '$QA.topic._id',
                    'topic.name': '$QA.topic.name',
                    avgTime: 1,
                    _id: 0,
                    exceededAvgTime: { $gt: ['$QA.timeEslapse', { $multiply: ['$avgTime', 1000] }] }
                }
            };
            const matchStatus = { $match: { status: 2, exceededAvgTime: true } };
            const groupTopic = { $group: { _id: '$topic', count: { $sum: 1 } } };
            const projectTopic = { $project: { topicId: '$_id.id', topicName: '$_id.name', count: 1, _id: 0 } };
            const sort = { $sort: { count: -1 } };

            const aggregationPipe = [matchUser, lookupPS, unwindPS, projectQA, unwindQA, projectQues, matchStatus, groupTopic, projectTopic, sort];

            this.attemptDetailRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptDetailRepository.aggregate(aggregationPipe);
            if (result.length === 0) {
                return { result: [] };
            }

            return { result };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async missedQuesAndPossibleMarks(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            const userId = new Types.ObjectId(request.user._id);
            const attemptId = new Types.ObjectId(request.query.attemptId);

            const matchUser = { $match: { user: userId, isAbandoned: false } };
            let projectQA: any = { $project: { QA: 1 } };
            let unwindQA = { $unwind: '$QA' };
            const projectStatus = { $project: { status: '$QA.status', topic: '$QA.topic._id', _id: 0 } };
            let matchStatus: any = { $match: { status: { $in: [1, 2] } } };
            const groupTopic = {
                $group: {
                    _id: '$topic',
                    totalCount: { $sum: 1 },
                    totalCorrects: { $sum: { $cond: [{ $eq: ['$status', 1] }, 1, 0] } },
                    totalWrong: { $sum: { $cond: [{ $eq: ['$status', 2] }, 1, 0] } }
                }
            };
            const projectTopic = { $project: { topic: '$_id', correctProb: { $divide: ['$totalCorrects', '$totalCount'] }, wrongProb: { $divide: ['$totalWrong', '$totalCount'] }, _id: 0 } };

            let aggregationPipe = [matchUser, projectQA, unwindQA, projectStatus, matchStatus, groupTopic, projectTopic];

            this.attemptDetailRepository.setInstanceKey(request.instancekey)
            const topicsProb: any = await this.attemptDetailRepository.aggregate(aggregationPipe);

            const lookupMap = {};
            for (let i = 0, len = topicsProb.length; i < len; i++) {
                lookupMap[topicsProb[i].topic] = topicsProb[i];
            }

            const matchAttempt = { $match: { _id: attemptId, isAbandoned: false } };
            projectQA = { $project: { QA: 1, totalQuestions: 1 } };
            unwindQA = { $unwind: '$QA' };
            let projectQues = { $project: { totalQuestions: 1, question: '$QA.question', status: '$QA.status', topic: '$QA.topic._id', timeElapse: '$QA.timeEslapse', _id: 0 } };
            matchStatus = { $match: { status: 3 } };
            const lookup = { $lookup: { from: 'questions', localField: 'question', foreignField: '_id', as: 'questiondetail' } };
            const unwindQues = { $unwind: '$questiondetail' };
            const project = { $project: { totalQuestions: 1, question: 1, timeElapse: 1, plusMark: '$questiondetail.plusMark', minusMark: '$questiondetail.minusMark', topic: 1 } };

            aggregationPipe = [matchAttempt, globals.lookup, globals.unw, globals.add, globals.pro, projectQA, unwindQA, projectQues, matchStatus, lookup, unwindQues, project];
            this.attemptRepository.setInstanceKey(request.instancekey)
            const missedQuestions: any = await this.attemptRepository.aggregate(aggregationPipe);
            let results = [];
            for (let i = 0; i < missedQuestions.length; i++) {
                if (missedQuestions[i].minusMark < 0 && missedQuestions[i].timeElapse > 0) {
                    let temp: any = {};
                    temp['topic'] = missedQuestions[i].topic;
                    temp['question'] = missedQuestions[i].question;
                    temp['plusMark'] = missedQuestions[i].plusMark;
                    temp['minusMark'] = missedQuestions[i].minusMark;

                    if (lookupMap[missedQuestions[i].topic] != null) {
                        temp['correctProb'] = lookupMap[missedQuestions[i].topic].correctProb;
                        temp['wrongProb'] = lookupMap[missedQuestions[i].topic].wrongProb;
                    }

                    results.push(temp);
                }
            }

            let percentMissed = 0;
            if (missedQuestions.length > 0) percentMissed = results.length / missedQuestions[0].totalQuestions;

            const desiredResult = { missed: results.length, percentMissed: percentMissed, results: results };
            let possibleGain = 0;
            for (let i = 0; i < desiredResult.results.length; i++) {
                if (desiredResult.results[i]['correctProb']) possibleGain += desiredResult.results[i]['plusMark'] * desiredResult.results[i]['correctProb'];
            }

            const requiredResult = {
                missed: desiredResult.missed,
                percentMissed: desiredResult.percentMissed * 100,
                possibleGain: Math.round(possibleGain)
            };
            return requiredResult;
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getTimeWasted(request: GetTimeWastedReq): Promise<any> {
        try {
            const userId = request.query.user ? new Types.ObjectId(request.query.user) : new Types.ObjectId(request.user._id);
            const subjectId = new Types.ObjectId(request.subjectId);

            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { user: userId, isAbandoned: false, 'subjects._id': subjectId } },
                { $lookup: { from: 'practicesets', localField: 'practicesetId', foreignField: '_id', as: 'psdetail' } },
                { $unwind: '$psdetail' },
                {
                    $project: {
                        attemptdetails: 1,
                        avgtime: {
                            $cond: {
                                if: { $eq: ['$psdetail.isAdaptive', true] },
                                then: { $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.questionsToDisplay'] }, 60000] },
                                else: {
                                    $cond: {
                                        if: { $eq: ['$psdetail.sectionTimeLimit', true] },
                                        then: {
                                            $multiply: [{ $divide: [{ $sum: '$psdetail.sections.time' }, '$psdetail.totalQuestion'] }, 60000],
                                        },
                                        else: {
                                            $multiply: [{ $divide: ['$psdetail.totalTime', '$psdetail.totalQuestion'] }, 60000],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                globals.lookup, globals.unw, globals.add, globals.pro,
                { $unwind: '$QA' },
                {
                    $match: {
                        'QA.subject._id': subjectId,
                        'QA.status': { $ne: Constants.MISSED },
                    },
                },
                {
                    $project: {
                        avgtime: 1,
                        timeElapse: { $divide: ['$QA.timeEslapse', 60000] },
                        extraTime: { $divide: [{ $subtract: ['$QA.timeEslapse', '$avgtime'] }, 60000] },
                        isIncorrect: { $cond: [{ $in: ['$QA.status', [Constants.INCORRECT, Constants.MISSED]] }, true, false] },
                        isTimeExceeded: { $cond: [{ $gt: ['$QA.timeEslapse', '$avgtime'] }, 1, 0] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalQuestion: { $sum: 1 },
                        questionExceedTime: { $sum: '$isTimeExceeded' },
                        questionIncorrectAndExceedTime: {
                            $sum: {
                                $cond: [{ $and: [{ $eq: ['$isTimeExceeded', 1] }, { $eq: ['$isIncorrect', true] }] }, 1, 0],
                            },
                        },
                        timewasted: {
                            $sum: {
                                $cond: [{ $and: [{ $eq: ['$isTimeExceeded', 1] }, { $eq: ['$isIncorrect', true] }] }, '$extraTime', 0],
                            },
                        },
                        totalTime: { $sum: '$timeElapse' },
                    },
                },
            ]);

            if (result[0]) {
                return result[0];
            } else {
                return {
                    totalQuestion: 0,
                    questionExceedTime: 0,
                    questionIncorrectAndExceedTime: 0
                };
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getStrengthAndWeekness(request: GetTimeWastedReq): Promise<any> {
        try {
            let user: any = request.user;
            const subjectId = new Types.ObjectId(request.subjectId);

            if (request.query.user) {
                this.userRepository.setInstanceKey(request.instancekey)
                user = await this.userRepository.findById(request.query.user, { createdAt: 1 });
                if (!user) {
                    throw new NotFoundException();
                }
            }
            const createdAt = new Date(user.createdAt).toISOString();

            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                {
                    $match: {
                        isAbandoned: false,
                        'subjects._id': subjectId,
                        createdAt: { $gte: new Date(createdAt) },
                    },
                },
                { $unwind: '$subjects' },
                { $match: { 'subjects._id': subjectId } },
                { $unwind: '$subjects.units' },
                {
                    $group: {
                        _id: { user: '$user', unit: '$subjects.units._id' },
                        unitName: { $first: '$subjects.units.name' },
                        accuracy: { $avg: '$subjects.units.accuracy' },
                    },
                },
                {
                    $facet: {
                        top: [
                            {
                                $group: {
                                    _id: '$_id.unit',
                                    accuracy: { $max: '$accuracy' },
                                    unitName: { $first: '$unitName' },
                                },
                            },
                        ],
                        average: [
                            {
                                $group: {
                                    _id: '$_id.unit',
                                    accuracy: { $avg: '$accuracy' },
                                    unitName: { $first: '$unitName' },
                                },
                            },
                        ],
                        student: [
                            {
                                $match: { '_id.user': new Types.ObjectId(user._id) },
                            },
                            {
                                $project: {
                                    _id: '$_id.unit',
                                    accuracy: 1,
                                    unitName: 1,
                                },
                            },
                        ],
                    },
                },
            ]);

            return result[0] || {};
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getTopStrengthAndWeakness(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            let user: any = request.user;

            if (request.query.user) {
                this.userRepository.setInstanceKey(request.instancekey)
                user = await this.userRepository.findById(request.query.user, { createdAt: 1 });
                if (!user) {
                    throw new NotFoundException();
                }
            }
            let sort = -1;
            if (request.query.weakness) {
                sort = 1;
            }

            this.attemptRepository.setInstanceKey(request.instancekey)
            const subjects: any = await this.attemptRepository.aggregate([
                {
                    $match: {
                        isAbandoned: false,
                        user: new Types.ObjectId(user._id),
                        createdAt: { $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) },
                    },
                },
                { $unwind: '$subjects' },
                {
                    $group: {
                        _id: '$subjects._id',
                        accuracy: { $sum: '$subjects.accuracy' },
                        subjectName: { $first: '$subjects.name' },
                    },
                },
                { $sort: { accuracy: sort } },
            ]);

            if (subjects && subjects.length > 0) {
                const subjectId = new Types.ObjectId(subjects[0]._id);
                const subjectName = subjects[0].subjectName;
                const result = await this.attemptRepository.aggregate([
                    {
                        $match: {
                            isAbandoned: false,
                            'subjects._id': subjectId,
                            createdAt: { $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) },
                        },
                    },
                    { $unwind: '$subjects' },
                    { $match: { 'subjects._id': subjectId } },
                    { $unwind: '$subjects.units' },
                    {
                        $group: {
                            _id: { user: '$user', unit: '$subjects.units._id' },
                            unitName: { $first: '$subjects.units.name' },
                            accuracy: { $avg: '$subjects.units.accuracy' },
                        },
                    },
                    {
                        $facet: {
                            student: [
                                {
                                    $match: { '_id.user': new Types.ObjectId(user._id) },
                                },
                                {
                                    $project: {
                                        _id: '$_id.unit',
                                        accuracy: 1,
                                        unitName: 1,
                                    },
                                },
                            ],
                        },
                    },
                ]);

                return { subject: subjectName, result: result[0] || {} };
            }
            return {};
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getCourseProgress(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            const userId = request.query.user ? new Types.ObjectId(request.query.user) : new Types.ObjectId(request.user._id);

            this.userCourseRepository.setInstanceKey(request.instancekey)
            const courses = await this.userCourseRepository.distinct('course', { user: userId, active: true });

            const analysis = await this.userCourseRepository.aggregate([
                { $match: { course: { $in: courses }, active: true } },
                { $unwind: '$contents' },
                { $match: { 'contents.completed': true } },
                {
                    $group: {
                        _id: '$_id',
                        course: { $first: '$course' },
                        user: { $first: '$user' },
                        updatedAt: { $first: '$updatedAt' },
                        doContents: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'courses',
                        let: { cid: '$course' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$cid'] } } },
                            { $project: { title: 1, sections: 1 } },
                        ],
                        as: 'courseInfo',
                    },
                },
                { $unwind: '$courseInfo' },
                { $unwind: '$courseInfo.sections' },
                {
                    $project: {
                        _id: 1,
                        user: 1,
                        course: 1,
                        updatedAt: 1,
                        title: '$courseInfo.title',
                        doContents: 1,
                        contentCount: { $size: '$courseInfo.sections.contents' },
                    },
                },
                {
                    $group: {
                        _id: '$_id',
                        user: { $first: '$user' },
                        course: { $first: '$course' },
                        updatedAt: { $first: '$updatedAt' },
                        title: { $first: '$title' },
                        doContents: { $first: '$doContents' },
                        totalContents: { $sum: '$contentCount' },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        user: 1,
                        course: 1,
                        updatedAt: 1,
                        title: 1,
                        doContents: 1,
                        totalContents: 1,
                    },
                },
                {
                    $facet: {
                        analysis: [
                            {
                                $group: {
                                    _id: '$course',
                                    top: { $max: '$doContents' },
                                    avg: { $avg: '$doContents' },
                                },
                            },
                        ],
                        studentCourses: [{ $match: { user: userId } }],
                    },
                },
            ]);

            return analysis[0] || {};
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getTestseriesProgress(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            let user: any = request.user;

            if (request.query.user) {
                this.userRepository.setInstanceKey(request.instancekey)
                user = await this.userRepository.findById(request.query.user, { subjects: 1, createdAt: 1 });
                if (!user) {
                    throw new NotFoundException();
                }
            }

            // query possible testseries
            this.classroomRepository.setInstanceKey(request.instancekey)
            const classes = await this.classroomRepository.distinct('_id', {
                'students.studentId': user._id, active: true,
            });

            const tsquery: any = {
                status: 'published',
                'subjects._id': { $in: user.subjects.map(s => new Types.ObjectId(s)) },
                $or: [
                    {
                        accessMode: 'public',
                    },
                    {
                        accessMode: 'buy',
                    },
                ],
            };

            if (classes.length) {
                tsquery.$or.push({
                    classrooms: { $in: classes },
                });
            }

            this.testSeriesRepository.setInstanceKey(request.instancekey)
            this.attemptRepository.setInstanceKey(request.instancekey)
            const testseries = await this.testSeriesRepository.find(tsquery, { title: 1, practiceIds: 1 }, { lean: true });

            const toReturn: any = [];
            for (const seri of testseries) {
                const result: any = await this.attemptRepository.aggregate([
                    { $match: { practicesetId: { $in: seri.practiceIds }, isAbandoned: false } },
                    {
                        $group: {
                            _id: { user: '$user', test: '$practicesetId' },
                            updatedAt: { $last: '$updatedAt' },
                        },
                    },
                    {
                        $group: {
                            _id: '$_id.user',
                            tests: { $sum: 1 },
                            updatedAt: { $last: '$updatedAt' },
                        },
                    },
                    {
                        $facet: {
                            analysis: [
                                {
                                    $group: {
                                        _id: null,
                                        top: { $max: '$tests' },
                                        avg: { $avg: '$tests' },
                                    },
                                },
                            ],
                            student: [{ $match: { _id: new Types.ObjectId(user._id) } }],
                        },
                    },
                ]);

                if (result[0] && result[0].student.length) {
                    const testSeriesProgress: any = {
                        title: seri.title,
                        totalContents: seri.practiceIds.length,
                        doContents: result[0].student[0].tests,
                        updatedAt: result[0].student[0].updatedAt,
                        top: result[0].analysis[0].top,
                        avg: Math.round(result[0].analysis[0].avg),
                    };
                    toReturn.push(testSeriesProgress);
                }
            }

            return { response: toReturn };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getPracticeEffort(request: AllFirstQuestionsDetailReq): Promise<any> {
        try {
            const result = {
                todayEffort: await this.getPracticeQuestionCountByDays(request, 1),
                monthEffort: await this.getPracticeQuestionCountByDays(request, 30),
                overAllEffort: await this.getPracticeQuestionCountByDays(request, 0)
            }
            return result;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

}
