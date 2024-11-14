import { AttemptDetailRepository, AttemptRepository, AttendanceRepository, FeedbackRepository, isEmail, NotificationRepository, PracticeSetRepository, QuestionFeedbackRepository, QuestionRepository, RedisCaching, regexCode, SocketClientService, UsersRepository } from '@app/common';
import { MessageCenter } from '@app/common/components/messageCenter';
import { config } from '@app/common/config';
import { CreateFeedbackRequest, CreateQuestionFeedbackRequest, FindAllByMeRequest, FindAllByPracticeRequest, GetQuestionFbRequest, GetTopFeedbacksRequest, RespondFeedbackRequest, SummaryByMeRequest } from '@app/common/dto/question-bank.dto';
import { Injectable, InternalServerErrorException, Logger, UnprocessableEntityException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';

@Injectable()
export class FeedbackService {
    constructor(
        private readonly practiceSetRepository: PracticeSetRepository,
        private readonly feedbackRepository: FeedbackRepository,
        private readonly usersRepository: UsersRepository,
        private readonly questionFeedbackRepository: QuestionFeedbackRepository,
        private readonly attemptRepository: AttemptRepository,
        private readonly attemptDetailRepository: AttemptDetailRepository,
        private readonly attendanceRepository: AttendanceRepository,
        private readonly questionRepository: QuestionRepository,
        private readonly notificationRepository: NotificationRepository,
        private readonly messageCenter: MessageCenter,
        private readonly redisCache: RedisCaching,
        private readonly socketClientService: SocketClientService,

    ) { }

    async findAllByPractice(req: FindAllByPracticeRequest) {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 20;
            const skip = (page - 1) * limit;

            let conditions: any = {
                practiceSetId: Types.ObjectId.isValid(req.practiceSetId) ? new ObjectId(req.practiceSetId) : req.practiceSetId,
            };

            if (req.query.rating && req.query.rating != '0') {
                conditions.rating = Number(req.query.rating);
            }

            if (req.query.tags && req.query.tags !== 'all') {
                conditions['feedbacks.name'] = req.query.tags.toString();
            }

            const textMatch: any = {};
            if (req.query.keywords) {
                const regexText = new RegExp(req.query.keywords, 'i');
                textMatch['$or'] = [{ comment: regexText }, { 'user.name': regexText }];
                // conditions['comment'] = regexText
            }

            if (!Types.ObjectId.isValid(conditions.practiceSetId)) {

                var code = conditions.practiceSetId;
                this.practiceSetRepository.setInstanceKey(req.instancekey);
                const result = await this.practiceSetRepository.findOne({
                    testCode: regexCode(code),
                }, { _id: 1 }, { lean: true })

                if (!result) {
                    return { data: [], count: 0 };
                }
                conditions.practiceSetId = result._id;

                const [data, count]: any = await Promise.all([
                    await this.getFeedbackWithUser(req, conditions, skip, limit),
                    await this.feedbackRepository.countDocuments(conditions)
                ])

                return { data: data, count: count }
            } else {
                const [data, count]: any = await Promise.all([
                    await this.feedbackRepository.aggregate([
                        { $match: conditions },
                        {
                            $project: {
                                comment: 1,
                                feedbacks: 1,
                                user: 1,
                                practiceSetId: 1,
                                attemptId: 1,
                                owner: 1,
                                updatedAt: 1,
                                createdAt: 1,
                                rating: 1,
                                positive: 1,
                                length: { $strLenCP: "$comment" },
                                composite: 1
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                let: { user: "$user" },
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ["$_id", "$$user"] } }
                                    },
                                    { $project: { name: 1, avatar: 1, avatarSM: 1, avatarMD: 1 } }
                                ],
                                as: "user"
                            }
                        },
                        { $unwind: "$user" },
                        { $match: textMatch },
                        { $sort: { composite: -1, length: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                    ]),
                    await this.feedbackRepository.aggregate([
                        { $match: conditions },
                        {
                            $project: {
                                comment: 1,
                                feedbacks: 1,
                                user: 1,
                                practiceSetId: 1,
                                attemptId: 1,
                                owner: 1,
                                updatedAt: 1,
                                createdAt: 1,
                                rating: 1,
                                positive: 1,
                                length: { $strLenCP: "$comment" },
                                composite: 1
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                let: { user: "$user" },
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ["$_id", "$$user"] } }
                                    },
                                    { $project: { name: 1, avatar: 1, avatarSM: 1, avatarMD: 1 } }
                                ],
                                as: "user"
                            }
                        },
                        { $unwind: "$user" },
                        { $match: textMatch },
                        {
                            $count: "count"
                        }
                    ])
                ]);

                const feedbackCount = count && count.length ? count[0].count : 0;

                return { data, count: feedbackCount };
            }
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException(error.message);
        }
    }

    private async getFeedbackWithUser(req: any, conditions: any, skip: number, limit: number) {
        try {
            this.feedbackRepository.setInstanceKey(req.instancekey)
            const feedbacks: any = await this.feedbackRepository.aggregate([
                { $match: conditions },
                { $project: { comment: 1, feedbacks: 1, user: 1, practiceSetId: 1, attemptId: 1, owner: 1, updatedAt: 1, createdAt: 1, rating: 1, composite: 1, neutral: 1, positive: 1, length: { $strLenCP: "$comment" }, negative: 1 } },
                { $sort: { composite: -1, length: -1 } },
                { $skip: skip },
                { $limit: limit },
            ])
            if (!feedbacks) {
                return [];
            } else {
                this.usersRepository.setInstanceKey(req.instancekey);
                const result = await Promise.all(feedbacks.map(async (feedback) => {
                    const user = await this.usersRepository.findById(feedback.user);
                    feedback.user = user;
                    return feedback;
                }));
                return result;
            }
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    async summaryByMe(req: SummaryByMeRequest) {
        const settings = await this.redisCache.getSetting({ instancekey: req.instancekey }, function (settings: any) {
            return settings;
        })
        var filter: any = {}
        if (!settings.isWhiteLabelled) {
            if (req.user.roles.includes(config.roles.teacher) || req.user.roles.includes(config.roles.publisher) || req.user.roles.includes(config.roles.mentor)) {
                filter.user = new ObjectId(req.user._id)
            }
        } else {
            if (req.user.roles.includes(config.roles.publisher) || req.user.roles.includes(config.roles.mentor)) {
                filter.user = new ObjectId(req.user._id)
            }
        }

        this.practiceSetRepository.setInstanceKey(req.instancekey);
        const practices = await this.practiceSetRepository.find(filter, { _id: 1 }, { lean: true })

        var practiceIds = practices.map(p => p._id);

        var condition: any = {}
        if (!settings.isWhiteLabelled) {
            if (req.user.roles.includes(config.roles.teacher) || req.user.roles.includes(config.roles.mentor)) {
                condition.owner = new ObjectId(req.user._id)
            }
        }
        if (req.user.roles.includes(config.roles.publisher)) {
            condition.owner = new ObjectId(req.user._id)

        }
        condition.practiceSetId = {
            $in: practiceIds
        }
        var match = {
            $match: condition
        }
        var group = {
            $group: {
                _id: '$owner',
                avgRating: {
                    $avg: '$rating'
                }
            }
        }
        this.feedbackRepository.setInstanceKey(req.instancekey);
        const result = await this.feedbackRepository.aggregate([match, group])

        return { response: result }
    }

    async findAllByMe(req: FindAllByMeRequest) {
        var page = (req.query.page) ? req.query.page : 1
        var limit = (req.query.limit) ? req.query.limit : 20
        var skip = (page - 1) * limit

        var conditions: any = {}
        if (req.query.rating && req.query.rating != '0') {
            var rating = JSON.parse('[' + req.query.rating + ']')
            conditions.rating = {
                '$in': rating
            }
        }
        if (req.query.day && req.query.day != 0) {
            conditions.createdAt = {
                $gte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * req.query.day)
            }
        }

        if (req.user.roles.includes(config.roles.centerHead) ||
            req.user.roles.includes(config.roles.teacher) ||
            req.user.roles.includes(config.roles.mentor)) {

            conditions.owner = req.user._id
        }

        let pipe: any = [
            {
                '$match': conditions
            },
            {
                '$sort': { 'createdAt': -1 }
            }
        ]

        if (req.query.name) {
            pipe.push({
                '$lookup': {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            })
            pipe.push({
                '$unwind': '$user'
            })

            pipe.push({
                '$match': {
                    'user.name': {
                        '$regex': req.query.name,
                        '$options': 'i'
                    }
                }
            })
        }

        let dataFacet = []

        if (req.query.sort) {
            var dataSort = req.query.sort.split(',')
            if (dataSort[0] != 'createdAt' || dataSort[1] != '-1') {
                var temp = '{"' + dataSort[0] + '":' + dataSort[1] + ' }'
                var jsonArray = JSON.parse(temp)
                dataFacet.push({
                    '$sort': jsonArray
                })
            }
        }

        dataFacet.push({
            '$skip': skip
        })
        dataFacet.push({
            '$limit': limit
        })

        // if does not have name query => user not yet lookup
        // we lookup it here
        if (!req.query.name) {
            dataFacet.push({
                '$lookup': {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            })
            dataFacet.push({
                '$unwind': '$user'
            })
        }
        dataFacet.push({
            '$project': {
                comment: 1,
                idOffline: 1,
                rating: 1,
                user: {
                    name: '$user.name',
                    provider: '$user.provider',
                    avatarUrl: '$user.avatarUrl',
                    avatar: '$user.avatar',
                    google: '$user.google',
                    facebook: '$user.facebook'
                },
                createdAt: 1,
                practiceSetId: 1
            }
        })
        dataFacet.push({
            '$lookup': {
                from: 'practicesets',
                localField: 'practiceSetId',
                foreignField: '_id',
                as: 'practiceSets'
            }
        })
        dataFacet.push({
            '$unwind': { path: "$practiceSets", preserveNullAndEmptyArrays: true }
        })
        dataFacet.push({
            '$project': {
                comment: 1,
                idOffline: 1,
                rating: 1,
                user: 1,
                createdAt: 1,
                practiceSet: '$practiceSets.title'
            }
        })

        pipe.push({
            $facet: {
                data: dataFacet,
                count: [
                    {
                        $count: 'total'
                    }
                ]
            }
        })

        this.feedbackRepository.setInstanceKey(req.instancekey)
        const results: any = await this.feedbackRepository.aggregate(pipe)

        return {
            data: results[0].data,
            count: results[0].count[0] ? results[0].count[0].total : 0
        }
    }

    async getQuestionFbPendingResponses(req: GetQuestionFbRequest) {
        try {
            let page = req.query.page || 1
            let limit = req.query.limit || 10
            let skip = (page - 1) * limit

            let query: any = { responded: false }
            if (!req.user.roles.includes('admin')) {
                query.location = new ObjectId(req.user.activeLocation)
            }
            let pipe: any = [
                { $match: query },
                { $group: { _id: { student: '$studentId', test: '$practicesetId', question: '$questionId' }, count: { $sum: 1 }, oldest: { $last: '$createdAt' } } },
                { $group: { _id: { student: '$_id.student', test: '$_id.test' }, question: { $sum: 1 }, count: { $sum: '$count' }, oldest: { $last: '$oldest' } } }
            ]

            let facet: any = {
                pendings: [
                    { $sort: { "oldest": -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: 'practicesets',
                            let: { test: "$_id.test" },
                            pipeline: [
                                {
                                    $match: { $expr: { $eq: ["$_id", "$$test"] } }
                                },
                                { $project: { title: 1, userInfo: 1, course: 1 } }
                            ],
                            as: "testInfo"
                        }
                    },
                    {
                        $unwind: '$testInfo'
                    },
                    {
                        $lookup: {
                            from: 'courses',
                            let: { course: "$testInfo.course" },
                            pipeline: [
                                {
                                    $match: { $expr: { $eq: ["$_id", "$$course"] } }
                                },
                                { $project: { title: 1, _id: 1 } }
                            ],
                            as: "courseInfo"
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            let: { student: "$_id.student" },
                            pipeline: [
                                {
                                    $match: { $expr: { $eq: ["$_id", "$$student"] } }
                                },
                                { $project: { name: 1, avatar: 1 } }
                            ],
                            as: "userInfo"
                        }
                    },
                    {
                        $unwind: '$userInfo'
                    },
                    {
                        $project: {
                            test: '$testInfo',
                            student: '$userInfo',
                            question: 1,
                            count: 1,
                            oldest: 1,
                            course: '$courseInfo'
                        }
                    },
                ]
            }

            if (req.query.count) {
                facet.total = [{ $count: 'total' }]
            }

            pipe.push({
                $facet: facet
            })

            this.questionFeedbackRepository.setInstanceKey(req.instancekey);
            let results: any = await this.questionFeedbackRepository.aggregate(pipe)

            if (req.query.count) {
                return {
                    feedbacks: results[0].pendings,
                    count: results[0].total[0] ? results[0].total[0].total : 0
                }
            } else {
                return {
                    feedbacks: results[0].pendings
                }
            }
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getTopFeedbacks(req: GetTopFeedbacksRequest) {
        try {
            this.feedbackRepository.setInstanceKey(req.instancekey);
            const data = await this.feedbackRepository.aggregate([
                { $match: { practiceSetId: new ObjectId(req.id) } },
                { $unwind: "$feedbacks" },
                {
                    $group: {
                        _id: { practice: "$practiceSetId", tags: "$feedbacks.name" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                {
                    $match: { $nor: [{ "_id.tags": { $eq: "helpfulCheck" } }, { "_id.tags": { $eq: "viewAllCheck" } }] }
                },
                { $limit: 5 }
            ])

            return { response: data };
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    private async updateRating(req, feedback) {
        try {
            this.feedbackRepository.setInstanceKey(req.instancekey);
            const feedbacks = await this.feedbackRepository.find({
                practiceSetId: feedback.practiceSetId
            })
            let totalRating = 0;

            for (const feedback of feedbacks) {
                totalRating += feedback.rating;
            }

            const averageRating = (totalRating / feedbacks.length).toFixed(0)
            this.practiceSetRepository.setInstanceKey(req.instancekey)
            const result = await this.practiceSetRepository.updateOne(
                { _id: feedbacks[0].practiceSetId },
                { rating: averageRating },
            );

            return result;
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    private async countAttemptPractice(req: any, test: any) {
        try {
            var condition: any = {
                practicesetId: test._id,
                isAbandoned: false
            }

            if (req.user && req.user.roles.includes('publisher')) {
                condition.location = new ObjectId(req.user.activeLocation)
                try {
                    this.attemptRepository.setInstanceKey(req.instancekey)
                    let result: any = await this.attemptRepository.aggregate([
                        { $match: condition },
                        { $group: { _id: '$user' } },
                        { $count: 'total' }
                    ])
                    if (result && result.length) {
                        test.totalJoinedStudent = result[0].total
                    }
                } catch (ex) {
                    Logger.error(ex);
                    throw new InternalServerErrorException(ex.message);
                }
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            const count = await this.attemptRepository.countDocuments(condition);
            return count;
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    async createFeedback(req: CreateFeedbackRequest) {
        try {
            let data: any = {
                user: new ObjectId(req.user._id),
                rating: req.body.rating,
                comment: req.body.comment,
                attemptId: req.body.attemptId,
                practiceSetId: new ObjectId(req.body.practiceSetId),
                owner: new ObjectId(req.body.owner),
                idOffline: req.body.idOffline
            }

            var attemptCondition = []
            var condition: any = {
                attemptId: data.attemptId
            }
            if (data.idOffline) {
                condition = {
                    idOffline: data.idOffline
                }
                attemptCondition.push({
                    idOffline: data.idOffline
                })
            }

            var checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$')
            if (checkForHexRegExp.test(data.attemptId) && data.attemptId.length == 24) {
                attemptCondition.push({
                    _id: new ObjectId(data.attemptId)
                })
                condition = {
                    attemptId: new ObjectId(data.attemptId)
                }
            }
            if (attemptCondition.length === 0) {
                throw new UnprocessableEntityException({
                    params: 'attemptId',
                    message: 'Can not found attempt to add feedback'
                })
            }

            this.feedbackRepository.setInstanceKey(req.instancekey);
            const result = await this.feedbackRepository.findOne(condition);

            if (result && result.user.toString() == data.user.toString()) {
                result.comment = data.comment
                await this.feedbackRepository.findByIdAndUpdate(result._id, result);

                return { status: 'ok' };
            } else {
                this.attemptRepository.setInstanceKey(req.instancekey);
                const record = await this.attemptRepository.findOne({
                    $and: attemptCondition
                })
                if (!record) {
                    throw new UnprocessableEntityException({
                        params: 'attemptId',
                        message: 'Can not found attempt to add feedback'
                    })
                }
                const feedbackData = {
                    user: data.user,
                    practiceSetId: data.practiceSetId,
                    attemptId: record._id,
                    idOffline: data.idOffline,
                    comment: data.comment,
                    rating: data.rating,
                    owner: data.owner,
                    ...(req.body.feedbacks && { feedbacks: req.body.feedbacks })
                };

                this.feedbackRepository.setInstanceKey(req.instancekey);
                data = await this.feedbackRepository.create(feedbackData);


                await this.updateRating(req, data)
                await this.attemptRepository.updateOne({
                    _id: record._id
                }, {
                    isAbandoned: false
                })

                // Update the corresponding field in attemptDetail
                this.attemptDetailRepository.setInstanceKey(req.instancekey);
                await this.attemptDetailRepository.findOneAndUpdate({
                    attempt: record._id
                }, {
                    $set: {
                        isAbandoned: false
                    }
                })

                this.practiceSetRepository.setInstanceKey(req.instancekey);
                let test = await this.practiceSetRepository.findById(data.practiceSetId);

                this.attendanceRepository.setInstanceKey(req.instancekey);
                let atd = await this.attendanceRepository.findOne({
                    practicesetId: test._id,
                    studentId: new ObjectId(req.user._id)
                })

                if (atd) {
                    if (atd.status != 'terminated' && atd.active) {
                        atd.status = 'finished'
                    }

                    await this.attendanceRepository.findByIdAndUpdate(atd._id, atd);

                    if (test.requireAttendance) {
                        await this.socketClientService.initializeSocketConnection(req.instancekey, req.token);
                        this.socketClientService.toUser(req.instancekey, atd.teacherId, 'attendance.update', {
                            studentId: atd.studentId,
                            status: atd.status,
                            admitted: atd.admitted
                        });
                    } else {
                        await this.socketClientService.initializeSocketConnection(req.instancekey, req.token);
                        this.socketClientService.toTestRoom(req.instancekey, data.practiceSetId, 'test.finish', {
                            studentId: req.user._id,
                            status: atd.status
                        })
                    }
                }

                const result = await this.countAttemptPractice(req, data)


                test.totalAttempt = result
                await this.practiceSetRepository.findByIdAndUpdate(test._id, test);

                return { status: 'ok' };
            }
        } catch (error) {
            Logger.error(error);
            if (error instanceof UnprocessableEntityException) {
                throw new GrpcInternalException(error.getResponse());
            }
            throw new GrpcInternalException(error.message);
        }
    }

    private async sendQuestionFeedbackEmail(req) {
        try {
            let settings: any = await this.redisCache.getSettingAsync(req.instancekey)
            let options: any = {}

            this.usersRepository.setInstanceKey(req.instancekey);
            let teacher = await this.usersRepository.findById(new ObjectId(req.body.teacherId), 'userId', { lean: true })

            options.teacherId = teacher._id;
            options.user = teacher.userId;

            this.questionRepository.setInstanceKey(req.instancekey);
            let question = await this.questionRepository.findById(new ObjectId(req.body.questionId), {
                questionText: 1
            }, { lean: true })

            options.question = String(question.questionText).replace(/&nbsp;/g, ' ').replace(/<[^>]+>/gm, '')

            this.attemptRepository.setInstanceKey(req.instancekey);
            let attempt = await this.attemptRepository.findById(new ObjectId(req.body.attemptId), {
                'practiceSetInfo.title': 1,
                practicesetId: 1
            }, { lean: true });

            options.title = attempt.practiceSetInfo.title
            options.feedbacks = req.body.feedbacks
            options.QN = req.body.questionNo
            options.comment = req.body.comment.trim().replace(/&nbsp;/g, ' ').replace(/<[^>]+>/gm, '')
            options.studentName = req.user.name
            options.studentEmail = req.user.userId
            options.sharingLink = settings.baseUrl + 'practice-detail/' + attempt.practicesetId

            this.notificationRepository.setInstanceKey(req.instancekey)
            let notification = await this.notificationRepository.create({
                receiver: options.teacherId,
                type: 'notification',
                modelId: 'questionFeedback',
                subject: 'Student feedback on one or more question(s) received'
            })

            let dataMsgCenter: any = {
                receiver: options.teacherId,
                modelId: 'questionFeedback'
            }

            if (isEmail(options.user)) {
                options.subject = 'Feedback Submitted for the questions of ' + options.title
                dataMsgCenter.to = options.user;
                dataMsgCenter.isScheduled = true
                dataMsgCenter.cc = {
                    'hello@myperfectice.com': 'hello@myperfectice.com'
                }
            }

            this.messageCenter.sendWithTemplate({ instancekey: req.instancekey }, 'question-feedback', options, dataMsgCenter)
        } catch (ex) {
            Logger.error(ex)
            throw new InternalServerErrorException(ex);
        }
    }

    async createQuestionFeedback(req: CreateQuestionFeedbackRequest) {
        var condition = {
            teacherId: new ObjectId(req.body.teacherId),
            attemptId: new ObjectId(req.body.attemptId),
            questionId: new ObjectId(req.body.questionId),
            studentId: new ObjectId(req.body.studentId),
            practicesetId: new ObjectId(req.body.practicesetId)
        }

        this.questionFeedbackRepository.setInstanceKey(req.instancekey)
        const feedbacksQuestion = await this.questionFeedbackRepository.findOne(condition);

        if (feedbacksQuestion) {
            feedbacksQuestion.feedbacks = req.body.feedbacks
            feedbacksQuestion.comment = req.body.comment.trim()
            const feedback = await this.questionFeedbackRepository.findByIdAndUpdate(feedbacksQuestion._id, feedbacksQuestion);
            await this.sendQuestionFeedbackEmail(req)

            return feedback
        } else {
            var feedbackData: any = condition;
            feedbackData.feedbacks = req.body.feedbacks
            feedbackData.comment = req.body.comment.trim()
            feedbackData.location = new ObjectId(req.user.activeLocation)

            const feedback = await this.questionFeedbackRepository.create(feedbackData)
            await this.sendQuestionFeedbackEmail(req)

            return feedback
        }
    }

    private async trackForTeacher(req, options, student) {
        try {
            let dataMsgCenter = {
                receiver: new ObjectId(req.user._id),
                modelId: 'system'
            }
            this.notificationRepository.setInstanceKey(req.instancekey);
            let notification = await this.notificationRepository.create({
                receiver: new ObjectId(req.user._id),
                type: 'notification',
                modelId: 'Teacher respond',
                subject: 'Teacher has responded to your comment'
            })

            this.messageCenter.sendWithTemplate({instancekey: req.instancekey}, 'feedback-respond', options, dataMsgCenter)
            await this.questionFeedbackRepository.updateOne({
                _id: new ObjectId(student.feedbackId)
            }, {
                $set: {
                    responded: true
                }
            })
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async respondFeedback(req:RespondFeedbackRequest) {
        try {
            var feedbackRespond = req.body;
            var options: any = {}
            var studentQ = req.body.studentQ;
            var teacherR = req.body.teacherR;
            if (teacherR) {
                for (const eachStudent of studentQ) {
                    this.usersRepository.setInstanceKey(req.instancekey);
                    const student = await this.usersRepository.findById(new ObjectId(eachStudent.studentId), {
                        userId: 1
                    })

                    options.teacher = req.user.name;
                    options.test = feedbackRespond.test;
                    options.question = String(feedbackRespond.question).replace(/<[^>]+>/gm, '');
                    options.comment = teacherR.comment
                    // String( feedbackRespond.comment
                    //).replace(/<[^>]+>/gm, '');
                    options.subject = 'Teacher has responded to your comment'
                    options.email = student.userId;
                    options.userId = student.userId;

                    this.notificationRepository.setInstanceKey(req.instancekey);
                    let notification = await this.notificationRepository.create({
                        receiver: new ObjectId(eachStudent.studentId),
                        type: 'notification',
                        modelId: 'Teacher respond',
                        subject: 'Teacher has responded to your comment'
                    })

                    let dataMsgCenter: any = {
                        receiver: new ObjectId(eachStudent.studentId),
                        modelId: 'questionFeedback'
                    }

                    if (isEmail(options.userId)) {
                        dataMsgCenter.to = options.userId;
                        dataMsgCenter.cc = {
                            'hello@myperfectice.com': 'hello@myperfectice.com',
                            'rajeev@myperfectice.com': 'rajeev@myperfectice.com',
                            'yashvant@myperfectice.com': 'yashvant@myperfectice.com',
                        }
                        dataMsgCenter.isScheduled = true;
                    }

                    this.messageCenter.sendWithTemplate({instancekey: req.instancekey}, 'feedback-respond', options, dataMsgCenter)
                    await this.trackForTeacher(req, options, eachStudent)

                    return { status: 'ok' };
                }
            } else {
                throw new GrpcInternalException('Add Teacher Response first');
            }
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }
}