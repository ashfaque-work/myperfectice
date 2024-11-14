import { AttemptDetailRepository, AttemptRepository, ClassroomRepository, Constants, EvaluationRepository, NotificationRepository, PracticeSetRepository, RedisCaching, UsersRepository } from '@app/common';
import { AssignEvaluatorsRequest, FindEvaluatorsRequest, GetAssignedTestsRequest, GetPendingTestsRequest, GetQuestionEvaluationsByTestRequest, GetQuestionsForEvaluationRequest, GetStudentsForEvaluationByTestRequest, GetTestEvaluationStatRequest, GetUnassignedTestsRequest, QuestionEvaluationRequest, RemoveEvaluatorsRequest, StartTestEvaluationRequest } from '@app/common/dto/question-bank.dto';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import * as util from '@app/common/Utils';
import { MessageCenter } from '@app/common/components/messageCenter';

@Injectable()
export class EvaluationService {
    constructor(private readonly evaluationRepository: EvaluationRepository,
        private readonly usersRepository: UsersRepository,
        private readonly attemptRepository: AttemptRepository,
        private readonly practiceSetRepository: PracticeSetRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly redisCache: RedisCaching,
        private readonly attemptDetailRepository: AttemptDetailRepository,
        private readonly messageCenter: MessageCenter,
        private readonly notificationRepository: NotificationRepository,

    ) { }

    async getAssignedTests(req: GetAssignedTestsRequest) {
        try {
            let page = req.query.page || 1;
            let limit = req.query.limit || 15;
            let skip = (page - 1) * limit;

            let match: any = { active: true, createdBy: { $ne: 'system' } }
            if (!req.user.roles.includes('admin')) {
                match.location = new ObjectId(req.user.activeLocation)
            }
            let pipe: any = [{
                $match: match
            }]
            if (req.query.text) {
                pipe.push({
                    $match: {
                        practicesetTitle: { $regex: req.query.text, $options: "i" }
                    }
                })
            }

            pipe.push(
                {
                    $group: {
                        _id: { test: '$practicesetId', teacher: '$teacher' },
                        practicesetTitle: { $first: '$practicesetTitle' },
                        students: { $addToSet: '$student' },
                        questions: { $sum: 1 },
                        evaluated: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$evaluated', true] },
                                    1,
                                    0
                                ]
                            }
                        },
                        evaluationDate: { $last: '$evaluationDate' }
                    }
                },
                {
                    $group: {
                        _id: '$_id.test',
                        title: { $first: '$practicesetTitle' },
                        teachers: {
                            $push: {
                                _id: '$_id.teacher',
                                students: { $size: '$students' },
                                questions: '$questions',
                                evaluated: '$evaluated',
                                evaluationDate: '$evaluationDate'
                            }
                        }
                    }
                }
            )

            let facet: any = {
                tests: [
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit
                    }
                ]
            }

            if (req.query.includeCount) {
                facet.count = [{ $count: 'total' }]
            }

            pipe.push({
                $facet: facet
            })

            this.evaluationRepository.setInstanceKey(req.instancekey)
            let results: any = await this.evaluationRepository.aggregate(pipe)

            if (!results[0]) {
                return { count: 0, tests: [] };
            }

            let result = results[0]
            if (result.count) {
                result.count = result.count[0] ? result.count[0].total : 0
            }

            // load teacher name and count attempts
            let loadedTeachers = {}
            for (let test of result.tests) {
                let testQuery: any = { practicesetId: test._id, active: true }
                if (!req.user.roles.includes('admin')) {
                    testQuery.location = new ObjectId(req.user.activeLocation);
                }
                this.evaluationRepository.setInstanceKey(req.instancekey)
                test.attempts = (await this.evaluationRepository.distinct('attemptId', testQuery)).length
                for (let teacher of test.teachers) {
                    if (loadedTeachers[teacher._id.toString()]) {
                        teacher.name = loadedTeachers[teacher._id.toString()]
                    } else {
                        this.usersRepository.setInstanceKey(req.instancekey);
                        let user = await this.usersRepository.findById(teacher._id, 'name', { lean: true })
                        teacher.name = user?.name
                        loadedTeachers[teacher._id.toString()] = user?.name
                    }
                }
            }

            return result
        } catch (ex) {
            Logger.error('%o', ex);
            throw new GrpcInternalException("Internal Server Error");

        }
    }

    async getUnassignedTests(req: GetUnassignedTestsRequest) {
        try {
            let page = (req.query.page) ? req.query.page : 1;
            let limit = (req.query.limit) ? req.query.limit : 15;
            let skip = (page - 1) * limit;

            let match: any = { isEvaluated: false, isAbandoned: false }
            if (req.query.text) {
                match['practiceSetInfo.title'] = {
                    $regex: req.query.text,
                    $options: "i"
                }
            }

            if (!req.user.roles.includes('admin')) {
                match.location = new ObjectId(req.user.activeLocation)
            }

            let pipe: any = [
                { $match: match },
                {
                    $lookup: {
                        from: 'attemptdetails',
                        localField: 'attemptdetails',
                        foreignField: '_id',
                        as: 'details'
                    }
                },
                {
                    $unwind: '$details'
                },
                {
                    $unwind: '$details.QA'
                },
                {
                    $match: {
                        'details.QA.evaluatorAssigned': { $ne: true },
                        'details.QA.status': Constants.PENDING
                    }
                },
                {
                    $group: {
                        _id: '$practicesetId',
                        testTitle: { $first: '$practiceSetInfo.title' },
                        attempts: { $addToSet: '$_id' },
                        pendingQuestions: { $sum: 1 }
                    }
                }
            ]

            let facet: any = {
                tests: [
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit
                    }
                ]
            }

            if (req.query.includeCount) {
                facet.count = [{ $count: 'total' }]
            }

            pipe.push({
                $facet: facet
            })

            this.attemptRepository.setInstanceKey(req.instancekey);
            let results: any = await this.attemptRepository.aggregate(pipe);

            if (!results[0]) {
                return { count: 0, tests: [] }
            }

            let result = results[0]
            if (result.count) {
                result.count = result.count[0] ? result.count[0].total : 0
            }

            // get pending question count
            for (let test of result.tests) {
                test.pendingAttempts = test.attempts.length;

                delete test.attempts
            }

            return result
        } catch (ex) {
            Logger.error('%o', ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async findEvaluators(req: FindEvaluatorsRequest) {
        try {
            let query: any = { role: 'teacher', isActive: true }
            if (req.query.name) {
                query.$or = [{
                    'name': {
                        "$regex": req.query.name,
                        "$options": "i"
                    }
                },
                {
                    'userId': {
                        "$regex": req.query.name,
                        "$options": "i"
                    }
                }]
            }
            if (req.query.test) {
                this.practiceSetRepository.setInstanceKey(req.instancekey);
                let test = await this.practiceSetRepository.findById(new ObjectId(req.query.test), 'subjects locations accessMode classRooms', { lean: true })
                query.subjects = { $in: test.subjects.map(s => s._id) }
                // exclude already assigned teacher
                let teacherQuery: any = { practicesetId: new ObjectId(req.query.test), active: true }
                if (!req.user.roles.includes('admin')) {
                    teacherQuery.location = new ObjectId(req.user.activeLocation)
                }
                this.evaluationRepository.setInstanceKey(req.instancekey);
                let teachers = await this.evaluationRepository.distinct('teacher', teacherQuery)
                query._id = { $nin: teachers }
            }

            if (!req.user.roles.includes('admin')) {
                query.locations = new ObjectId(req.user.activeLocation)
            }
            this.usersRepository.setInstanceKey(req.instancekey);
            let teachers = await this.usersRepository.find(query, null, { populate: { path: 'locations', select: 'name' }, select: { name: 1, userId: 1, locations: 1 }, lean: true });

            return { response: teachers }
        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getQuestionsForEvaluation(req: GetQuestionsForEvaluationRequest) {
        try {
            let condition = {
                teacher: new ObjectId(req.user._id),
                evaluated: false,
                active: true
            }
            if (req.query.pendingEvaluation == 'false') {
                condition.evaluated = true
            }

            this.evaluationRepository.setInstanceKey(req.instancekey)
            let qIDS = await this.evaluationRepository.distinct('QAId', condition);

            let pipeline = [];
            pipeline.push({ $match: condition })
            pipeline.push({
                "$lookup":
                {
                    from: "attemptdetails",
                    localField: "attemptDetail",
                    foreignField: "_id",
                    as: "attemptdetails",
                }
            })
            pipeline.push({
                $project:
                {
                    QA: "$attemptdetails.QA",
                    attemptId: 1, practicesetId: 1,
                    evaluated: 1, attemptDetail: 1,
                    timeSpent: 1,
                    QAId: 1
                }
            })

            pipeline.push({ $unwind: "$QA" })
            pipeline.push({ $unwind: "$QA" })
            pipeline.push({ $match: { "QA._id": { $in: qIDS } } })
            pipeline.push({
                $group: {
                    _id: "$QA._id",
                    attemptId: { $first: "$attemptId" },
                    practicesetId: { $first: "$practicesetId" },
                    evaluated: { $first: "$evaluated" },
                    attemptDetail: { $first: "$attemptDetail" },
                    timeSpent: { $first: "$timeSpent" },
                    QA: { $first: "$QA" }
                }
            })

            pipeline.push({
                "$lookup":
                {
                    from: "questions",
                    localField: "QA.question",
                    foreignField: "_id",
                    as: "QA.question",
                }
            })

            pipeline.push({ $unwind: "$QA.question" })

            var page = (req.query.page) ? req.query.page : 1;
            var limit = (req.query.limit) ? req.query.limit : 15;
            var skip = (page - 1) * limit;

            let facet: any = {
                questions: [
                    {
                        $sort: { "QA.question.subject.name": 1 }
                    },
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit
                    }
                ]
            }

            if (req.query.includeCount) {
                facet.count = [{ $count: 'total' }]
            }

            pipeline.push({
                $facet: facet
            })

            let results: any = await this.evaluationRepository.aggregate(pipeline)

            if (!results[0]) {
                return { count: 0, questions: [] };
            }

            let result = results[0]
            if (result.count) {
                result.count = result.count[0] ? result.count[0].total : 0
            }

            return result
        }
        catch (err) {
            Logger.error('%o', err);
            throw new GrpcInternalException(err.message);
        }
    }

    async getPendingTests(req: GetPendingTestsRequest) {
        try {
            let page = (req.query.page) ? req.query.page : 1;
            let limit = (req.query.limit) ? req.query.limit : 20;
            let skip = (page - 1) * limit;

            let match: any = { teacher: new ObjectId(req.user._id), evaluated: false, active: true, createdBy: { $ne: 'system' } }
            if (!req.user.roles.includes('admin')) {
                match.location = new ObjectId(req.user.activeLocation)
            }
            let pipe: any = [
                { $match: match },
                { $group: { _id: '$practicesetId', questions: { $sum: 1 } } }
            ]

            let facet: any = {
                tests: [
                    {
                        $lookup: {
                            from: 'practicesets',
                            let: { t: "$_id" },
                            pipeline: [
                                {
                                    $match: { $expr: { $eq: ["$_id", "$$t"] } }
                                },
                                { $project: { title: 1, classRooms: 1, imageUrl: 1, colorCode: 1, testMode: 1 } }
                            ],
                            as: "test"
                        }
                    },
                    {
                        $unwind: '$test'
                    }
                ]
            }

            if (req.query.title) {
                facet.tests.push({
                    $match: {
                        'test.title': {
                            $regex: req.query.title,
                            $options: "i"
                        }
                    }
                })
            }

            facet.tests.push({
                $skip: skip
            },
                {
                    $limit: limit
                },
                {
                    $project: {
                        _id: 1,
                        questions: 1,
                        title: '$test.title',
                        classRooms: '$test.classRooms',
                        imageUrl: "$test.imageUrl",
                        colorCode: '$test.colorCode',
                        testMode: '$test.testMode'
                    }
                })

            if (req.query.includeCount) {
                facet.count = [{ $count: 'total' }]
            }

            pipe.push({
                $facet: facet
            })

            this.evaluationRepository.setInstanceKey(req.instancekey);
            let results: any = await this.evaluationRepository.aggregate(pipe)

            if (!results[0]) {
                return { count: 0, tests: [] }
            }

            let result = results[0]
            if (result.count) {
                result.count = result.count[0] ? result.count[0].total : 0
            }

            // populate classroom info
            for (let test of result.tests) {
                if (test.classRooms && test.classRooms.length) {
                    let clsQuery: any = { _id: { $in: test.classRooms } }
                    if (!req.user.roles.includes('admin')) {
                        clsQuery.location = new ObjectId(req.user.activeLocation)
                    }
                    this.classroomRepository.setInstanceKey(req.instancekey);
                    let rooms = await this.classroomRepository.find(clsQuery, { name: 1 }, { lean: true })
                    test.classRooms = rooms
                }
            }

            return result

        } catch (ex) {
            Logger.error('%o', ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getQuestionEvaluationsByTest(req: GetQuestionEvaluationsByTestRequest) {
        try {
            let test: any = await this.redisCache.getAsync(req.instancekey, 'test_evaluation_' + req.testId)

            if (!test) {
                this.practiceSetRepository.setInstanceKey(req.instancekey);
                let fTests = await this.practiceSetRepository.aggregate([
                    { $match: { _id: new ObjectId(req.testId) } },
                    {
                        $project: {
                            _id: 1,
                            questions: 1,
                            plusMark: 1,
                            minusMark: 1,
                            enableMarks: 1,
                            isMarksLevel: 1
                        }
                    },
                    {
                        $unwind: '$questions'
                    },
                    {
                        $lookup: {
                            from: 'questions',
                            let: { q: "$questions.question" },
                            pipeline: [
                                {
                                    $match: { $expr: { $eq: ["$_id", "$$q"] } }
                                },
                                { $project: { questionText: 1, plusMark: 1, minusMark: 1 } }
                            ],
                            as: "qInfo"
                        }
                    },
                    {
                        $unwind: '$qInfo'
                    },
                    {
                        $sort: {
                            'question.order': 1
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            plusMark: { $first: '$plusMark' },
                            minusMark: { $first: '$minusMark' },
                            enableMarks: { $first: '$enableMarks' },
                            isMarksLevel: { $first: '$isMarksLevel' },
                            questions: {
                                $push: {
                                    _id: '$qInfo._id',
                                    order: '$questions.order',
                                    questionText: '$qInfo.questionText',
                                    plusMark: '$qInfo.plusMark',
                                    minusMark: '$qInfo.minusMark'
                                }
                            }
                        }
                    }
                ])

                if (!fTests[0]) {
                    throw new BadRequestException();
                }

                test = fTests[0]

                // cache this for one day
                await this.redisCache.set({ instancekey: req.instancekey }, 'test_evaluation_' + req.testId, test, 60 * 60 * 24)
            }

            let query: any = {
                teacher: new ObjectId(req.user._id),
                practicesetId: new ObjectId(req.testId),
                active: true,
                evaluated: true
            }

            query.createdBy = req.query.system ? 'system' : { $ne: 'system' };

            if (req.query.attemptId) {
                query.attemptId = new ObjectId(req.query.attemptId)
            }

            if (req.query.isPending === 'true') {
                query.evaluated = false
            } else if (req.query.isPending === 'false') {
                query.evaluated = true
            }

            if (!req.user.roles.includes('admin')) {
                query.location = new ObjectId(req.user.activeLocation)
            }

            this.evaluationRepository.setInstanceKey(req.instancekey);
            let evaluations = await this.evaluationRepository.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: 'users',
                        let: { user: "$student" },
                        pipeline: [
                            {
                                $match: { $expr: { $eq: ["$_id", "$$user"] } }
                            },
                            { $project: { name: 1, rollNumber: 1, userId: 1 } }
                        ],
                        as: "studentData"
                    }
                },
                {
                    $unwind: '$studentData'
                },
                {
                    $lookup: {
                        from: 'attemptdetails',
                        let: { att: "$attemptId" },
                        pipeline: [
                            {
                                $match: { $expr: { $eq: ["$attempt", "$$att"] } }
                            },
                            { $project: { QA: 1 } }
                        ],
                        as: "attempt"
                    }
                },
                {
                    $unwind: '$attempt'
                },
                {
                    $unwind: '$attempt.QA'
                },
                {
                    $match: { $expr: { $eq: ['$attempt.QA._id', '$QAId'] } }
                },
                {
                    $project: {
                        question: 1,
                        active: 1,
                        student: '$studentData',
                        attemptId: 1,
                        QAId: 1,
                        evaluationDate: 1,
                        evaluated: 1,
                        timeSpent: 1,
                        answers: '$attempt.QA.answers',
                        obtainMarks: '$attempt.QA.obtainMarks',
                        teacherComment: '$attempt.QA.teacherComment'
                    }
                }
            ]);

            // filter only questions in evaluations
            test.questions = test.questions.filter(tq => {
                return !!evaluations.find(e => e.question.equals(tq._id));
            })

            return {
                test: test,
                evaluations: evaluations
            }

        } catch (err) {
            Logger.error('%o', err)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getStudentsForEvaluationByTest(req: GetStudentsForEvaluationByTestRequest) {
        try {
            let test: any = await this.redisCache.getAsync(req.instancekey, 'test_evaluation_' + req.testId)

            if (!test) {
                this.practiceSetRepository.setInstanceKey(req.instancekey);
                let fTests = await this.practiceSetRepository.aggregate([
                    { $match: { _id: new ObjectId(req.testId) } },
                    {
                        $project: {
                            _id: 1,
                            questions: 1,
                            plusMark: 1,
                            minusMark: 1,
                            enableMarks: 1,
                            isMarksLevel: 1
                        }
                    },
                    {
                        $unwind: '$questions'
                    },
                    {
                        $lookup: {
                            from: 'questions',
                            let: { q: "$questions.question" },
                            pipeline: [
                                {
                                    $match: { $expr: { $eq: ["$_id", "$$q"] } }
                                },
                                { $project: { questionText: 1, plusMark: 1, minusMark: 1 } }
                            ],
                            as: "qInfo"
                        }
                    },
                    {
                        $unwind: '$qInfo'
                    },
                    {
                        $sort: {
                            'question.order': 1
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            plusMark: { $first: '$plusMark' },
                            minusMark: { $first: '$minusMark' },
                            enableMarks: { $first: '$enableMarks' },
                            isMarksLevel: { $first: '$isMarksLevel' },
                            questions: {
                                $push: {
                                    _id: '$qInfo._id',
                                    order: '$questions.order',
                                    questionText: '$qInfo.questionText',
                                    plusMark: '$qInfo.plusMark',
                                    minusMark: '$qInfo.minusMark'
                                }
                            }
                        }
                    }
                ])

                if (!fTests[0]) {
                    throw new NotFoundException();
                }

                test = fTests[0]
                // cache this for one day
                await this.redisCache.set(req, 'test_evaluation_' + req.testId, test, 60 * 60 * 24)
            }

            let page = req.query.page || 1;
            let limit = req.query.limit || 15;
            let skip = (page - 1) * limit;

            let query: any = {
                teacher: new ObjectId(req.user._id),
                practicesetId: new ObjectId(req.testId),
                active: true,
                evaluated: true
            }

            query.createdBy = req.query.system ? 'system' : { $ne: 'system' };

            if (req.query.attemptId) {
                query.attemptId = new ObjectId(req.query.attemptId)
            }

            if (req.query.isPending === 'true') {
                query.evaluated = false
            } else if (req.query.isPending === 'false') {
                query.evaluated = true
            }

            if (!req.user.roles.includes('admin')) {
                query.location = new ObjectId(req.user.activeLocation)
            }

            let userMatch: any = {
                $expr: { $eq: ["$_id", "$$user"] }
            }
            if (req.query.searchText) {
                let regex = util.regex(req.query.searchText, 'i')
                userMatch = {
                    $and: [
                        { $expr: { $eq: ["$_id", "$$user"] } },
                        {
                            $or: [
                                {
                                    name: regex
                                },
                                {
                                    rollNumber: regex
                                },
                                {
                                    userId: regex
                                }
                            ]
                        }

                    ]
                }
            }

            let pipe: any = [
                { $match: query },
                {
                    $group: {
                        _id: '$student',
                        items: { $push: "$$ROOT" }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { user: "$_id" },
                        pipeline: [
                            {
                                $match: userMatch
                            },
                            {
                                $project: { name: 1, rollNumber: 1, userId: 1 }
                            }
                        ],
                        as: "studentData"
                    }
                },
                {
                    $unwind: '$studentData'
                }
            ]

            let facet = {
                count: [],
                students: [
                    {
                        $limit: limit
                    },
                    {
                        $skip: skip
                    },
                    {
                        $unwind: '$items'
                    },
                    {
                        $lookup: {
                            from: 'attemptdetails',
                            let: { att: "$items.attemptId" },
                            pipeline: [
                                {
                                    $match: { $expr: { $eq: ["$attempt", "$$att"] } }
                                },
                                { $project: { QA: 1 } }
                            ],
                            as: "attempt"
                        }
                    },
                    {
                        $unwind: '$attempt'
                    },
                    {
                        $unwind: '$attempt.QA'
                    },
                    {
                        $match: { $expr: { $eq: ['$attempt.QA._id', '$items.QAId'] } }
                    },
                    {
                        $project: {
                            _id: 1,
                            studentData: '$studentData',
                            question: '$items.question',
                            attemptId: '$items.attemptId',
                            QAId: '$items.QAId',
                            evaluationDate: '$items.evaluationDate',
                            evaluated: '$items.evaluated',
                            timeSpent: '$items.timeSpent',
                            answers: '$attempt.QA.answers',
                            obtainMarks: '$attempt.QA.obtainMarks',
                            teacherComment: '$attempt.QA.teacherComment'
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            studentData: { $first: '$studentData' },
                            questions: { $push: "$$ROOT" }
                        }
                    },
                    {
                        $project: {
                            studentId: '$_id',
                            name: '$studentData.name',
                            rollNumber: '$studentData.rollNumber',
                            userId: '$studentData.userId',
                            questions: {
                                $map: {
                                    input: '$questions',
                                    as: 'q',
                                    in: {
                                        _id: '$$q.question',
                                        attemptId: '$$q.attemptId',
                                        QAId: '$$q.QAId',
                                        evaluationDate: '$$q.evaluationDate',
                                        evaluated: '$$q.evaluated',
                                        timeSpent: '$$q.timeSpent',
                                        answers: '$$q.answers',
                                        obtainMarks: '$$q.obtainMarks',
                                        teacherComment: '$$q.teacherComment'
                                    }
                                }
                            }
                        }
                    }
                ]
            }

            if (req.query.countInclude) {
                facet.count.push({
                    $count: 'total'
                })
            }

            pipe.push({
                $facet: facet
            })

            this.evaluationRepository.setInstanceKey(req.instancekey);
            let results: any = await this.evaluationRepository.aggregate(pipe);

            if (!results[0]) {
                return { test: test, students: [] };
            }

            let result = results[0]
            result.count = result.count[0] ? result.count[0].total : 0

            let students = result.students;

            // filter only questions in evaluations
            test.questions = test.questions.filter(tq => {
                for (let s of students) {
                    let fq = s.questions.find(q => q._id.equals(tq._id))
                    if (fq) {
                        return true;
                    }
                }
            })


            return {
                test: test,
                students: students,
                total: result.count
            }

        } catch (err) {
            Logger.error('%o', err)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async startTestEvaluation(req: StartTestEvaluationRequest) {
        try {
            this.practiceSetRepository.setInstanceKey(req.instancekey);
            let test: any = await this.practiceSetRepository.findById(req.testId, 'title startDate totalTime imageUrl colorCode testMode', { lean: true })
            if (!test) {
                throw new NotFoundException();
            }

            // if the request is not from evaluation tab
            // fill evaluation collection on the fly
            if (req.query.system) {
                let query: any = {
                    practicesetId: req.testId, teacher: new ObjectId(req.user._id)
                }
                if (req.query.attemptId) {
                    query.attemptId = req.query.attemptId
                }
                if (!req.user.roles.includes('admin')) {
                    query.location = new ObjectId(req.user.activeLocation)
                }

                this.evaluationRepository.setInstanceKey(req.instancekey);
                let assignedQuestions = await this.evaluationRepository.distinct('QAId', query)

                let match: any = { practicesetId: test._id, isAbandoned: false }

                if (req.query.attemptId) {
                    match._id = new ObjectId(req.query.attemptId)
                }

                if (!req.user.roles.includes('admin')) {
                    match.location = new ObjectId(req.user.activeLocation)
                }

                this.attemptRepository.setInstanceKey(req.instancekey);
                let unassignedQuestions: any = await this.attemptRepository.aggregate([
                    { $match: match },
                    {
                        $lookup: {
                            from: 'attemptdetails',
                            localField: 'attemptdetails',
                            foreignField: '_id',
                            as: 'details'
                        }
                    },
                    { $unwind: '$details' },
                    {
                        $project: { _id: 1, user: 1, QA: '$details.QA' }
                    },
                    { $unwind: '$QA' },
                    { $match: { 'QA.status': Constants.PENDING, 'QA._id': { $nin: assignedQuestions } } },
                    {
                        $project: {
                            QAId: '$QA._id',
                            _id: '$QA.question',
                            attempt: '$_id',
                            user: '$user'
                        }
                    }
                ])

                let newEvals = unassignedQuestions.map(q => {
                    let evalData: any = {
                        teacher: new ObjectId(req.user._id),
                        QAId: q.QAId,
                        question: q._id,
                        student: q.user,
                        practicesetId: test._id,
                        practicesetTitle: test.title,
                        attemptId: q.attempt,
                        active: true,
                        evaluated: false,
                        createdBy: 'system'
                    }

                    if (!req.user.roles.includes('admin')) {
                        evalData.location = new ObjectId(req.user.activeLocation)
                    }
                    return evalData;
                })

                this.evaluationRepository.setInstanceKey(req.instancekey);
                await this.evaluationRepository.insertMany(newEvals);
                this.attemptDetailRepository.setInstanceKey(req.instancekey);
                await this.attemptDetailRepository.updateMany({
                    attempt: { $in: unassignedQuestions.map(q => q.attempt) },
                    'QA._id': { $in: unassignedQuestions.map(q => q.QAId) }
                }, {
                    $set: {
                        'QA.$.evaluatorAssigned': true
                    }
                })
            }

            let createdBy = req.query.system ? 'system' : { $ne: 'system' };

            let match: any = { practicesetId: test._id, teacher: new ObjectId(req.user._id), active: true, createdBy: createdBy }

            if (req.query.attemptId) {
                match.attemptId = new ObjectId(req.query.attemptId)
            }

            if (!req.user.roles.includes('admin')) {
                match.location = new ObjectId(req.user.activeLocation)
            }

            this.evaluationRepository.setInstanceKey(req.instancekey);
            let summary: any = await this.evaluationRepository.aggregate([
                { $match: match },
                {
                    $facet: {
                        studentStat: [
                            { $group: { _id: '$student', evaluated: { $sum: { $cond: [{ $eq: ['$evaluated', true] }, 1, 0] } }, count: { $sum: 1 } } }
                        ],
                        questionStat: [
                            { $group: { _id: '$question', evaluated: { $sum: { $cond: [{ $eq: ['$evaluated', true] }, 1, 0] } }, count: { $sum: 1 } } }
                        ]
                    }
                }
            ])

            test.evaluatedQ = 0;
            test.pendingQ = 0;
            test.evaluatedS = 0;
            test.pendingS = 0;

            if (summary[0]) {
                for (let s of summary[0].studentStat) {
                    if (s.evaluated == s.count) {
                        test.evaluatedS++;
                    } else {
                        test.pendingS++;
                    }
                }
                for (let q of summary[0].questionStat) {
                    if (q.evaluated == q.count) {
                        test.evaluatedQ++;
                    } else {
                        test.pendingQ++;
                    }
                }
            }

            return test;
        } catch (ex) {
            Logger.error('%o', ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getTestEvaluationStat(req: GetTestEvaluationStatRequest) {
        try {
            let createdBy = req.query.system ? 'system' : { $ne: 'system' };

            let match: any = { practicesetId: new ObjectId(req.testId), teacher: new ObjectId(req.user._id), active: true, createdBy: createdBy }

            if (req.query.attemptId) {
                match.attemptId = new ObjectId(req.query.attemptId)
            }

            if (!req.user.roles.includes('admin')) {
                match.location = new ObjectId(req.user.activeLocation)
            }

            this.evaluationRepository.setInstanceKey(req.instancekey);
            let summary: any = await this.evaluationRepository.aggregate([
                { $match: match },
                {
                    $facet: {
                        studentStat: [
                            { $group: { _id: '$student', evaluated: { $sum: { $cond: [{ $eq: ['$evaluated', true] }, 1, 0] } }, count: { $sum: 1 } } }
                        ],
                        questionStat: [
                            { $group: { _id: '$question', evaluated: { $sum: { $cond: [{ $eq: ['$evaluated', true] }, 1, 0] } }, count: { $sum: 1 } } }
                        ]
                    }
                }
            ])

            let stats = {
                evaluatedQ: 0,
                pendingQ: 0,
                evaluatedS: 0,
                pendingS: 0
            }

            if (summary[0]) {
                for (let s of summary[0].studentStat) {
                    if (s.evaluated == s.count) {
                        stats.evaluatedS++;
                    } else {
                        stats.pendingS++;
                    }
                }
                for (let q of summary[0].questionStat) {
                    if (q.evaluated == q.count) {
                        stats.evaluatedQ++;
                    } else {
                        stats.pendingQ++;
                    }
                }
            }

            return stats
        } catch (ex) {
            Logger.error('%o', ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    private async createArchiveAttemptAndAttemptDetails(attempt: any, practice: any, ik: string) {
        try {
            this.attemptDetailRepository.setInstanceKey(ik)
            let attemptData = await this.attemptDetailRepository.findById(attempt.attemptdetails, { QA: 1 }, { lean: true });
            let QA = attemptData.QA;
            let newQA = [];
            let totalCorrects = 0;
            let totalErrors = 0;
            let totalMark = 0;
            let pending = 0;
            let plusMark = 0;
            let partial = 0
            let minusMark = 0;
            let maximumMarks = 0;
            let totalQuestions = 0;
            let missed = 0;
            let section = {}
            let hasOptionalQuestion = []
            hasOptionalQuestion = practice.sections.filter(d => d.optionalQuestions > 0)
            if (hasOptionalQuestion.length > 0) {
                if (practice.sections.length > 0) {
                    for (let section of practice.sections) {
                        let secQuestions = []

                        practice.questions.forEach(q => {
                            if (q.section == section.name) {
                                secQuestions.push(String(q.question))
                            }
                        })
                        let sectionQA = []

                        sectionQA = QA.filter(qa => secQuestions.indexOf(String(qa.question)) !== -1)

                        //Sort of obtain marks
                        sectionQA.sort((a, b) => {
                            let isMissedQA = a.isMissed - b.isMissed;
                            if (isMissedQA) {
                                return isMissedQA;
                            }

                            let obtainMarksQA = b.obtainMarks - a.obtainMarks;
                            if (obtainMarksQA) {
                                return obtainMarksQA
                            }
                            return 0;
                        })

                        //exclude optional questions
                        sectionQA.splice(sectionQA.length - section.optionalQuestions, section.optionalQuestions)

                        //Re-assign remaining Questions
                        newQA = newQA.concat(sectionQA);

                        for (let k = 0; k < section.subjects.length; k++) {
                            let tampSecQA = sectionQA.filter(d => d.subject._id == String(section.subjects[k]));
                            let subjects = attempt.subjects.filter(s => s._id == String(section.subjects[k]))
                            // reset value
                            subjects.forEach(d => {
                                d.accuracy = 0;
                                d.maxMarks = 0;
                                d.mark = 0;
                                d.partial = 0;
                                d.correct = 0;
                                d.missed = 0;
                                d.pending = 0;
                                d.incorrect = 0;
                                d.units.forEach(u => {
                                    u.accuracy = 0;
                                    u.incorrect = 0;
                                    u.maxMarks = 0;
                                    u.mark = 0;
                                    u.partial = 0;
                                    u.correct = 0;
                                    u.missed = 0;
                                    u.pending = 0;
                                    u.topics.forEach(t => {
                                        t.accuracy = 0;
                                        t.incorrect = 0;
                                        t.maxMarks = 0;
                                        t.mark = 0;
                                        t.partial = 0;
                                        t.correct = 0;
                                        t.missed = 0;
                                        t.pending = 0;
                                    })
                                })
                            })


                            for (let i = 0; i < tampSecQA.length; i++) {
                                let question = tampSecQA[i]
                                let m = -1;
                                subjects[k].topics.forEach((t, index) => {
                                    if (String(t._id) == String(question.topic._id)) {
                                        m = index;
                                    }
                                })
                                let unit = subjects[k].units.find(u => u._id.equals(question.unit._id))
                                let topic = unit.topics.find(t => t._id.equals(question.topic._id))
                                if (question.status === 1) {
                                    totalCorrects++;
                                    subjects[k].correct++;
                                    unit.correct++;
                                    topic.correct++;
                                    plusMark = plusMark + question.obtainMarks;

                                } else if (question.status === 2) {
                                    subjects[k].incorrect++;
                                    unit.incorrect++;
                                    topic.incorrect++;
                                    totalErrors++;
                                    minusMark = minusMark + question.obtainMarks;

                                } else if (question.status === 4) {
                                    subjects[k].pending++;
                                    unit.pending++;
                                    topic.pending++;
                                    pending++
                                }
                                else if (question.status === 5) {
                                    subjects[k].partial++;
                                    unit.partial++;
                                    topic.partial++;
                                    plusMark = plusMark + question.obtainMarks;

                                    partial++;
                                }
                                else {
                                    subjects[k].missed++
                                    unit.missed++
                                    topic.missed++
                                    missed++

                                }
                                totalQuestions += 1;
                                totalMark = totalMark + question.obtainMarks
                                maximumMarks = maximumMarks + question.actualMarks;

                                subjects[k].mark += question.obtainMarks
                                subjects[k].maxMarks += question.actualMarks
                                subjects[k].accuracy = subjects[k].maxMarks > 0 ? subjects[k].mark / subjects[k].maxMarks : 0

                                unit.mark += question.obtainMarks
                                unit.maxMarks += question.actualMarks
                                unit.accuracy = unit.maxMarks > 0 ? unit.mark / unit.maxMarks : 0

                                topic.mark += question.obtainMarks
                                topic.maxMarks += question.actualMarks
                                topic.accuracy = topic.maxMarks > 0 ? topic.mark / topic.maxMarks : 0
                            }
                        }
                    }
                }
                this.attemptRepository.setInstanceKey(ik)
                await this.attemptRepository.updateOne({ _id: attempt._id },
                    {
                        $set: {
                            totalCorrects: totalCorrects,
                            totalErrors: totalErrors,
                            totalMark: totalMark,
                            pending: pending,
                            plusMark: plusMark,
                            totalMissed: missed,
                            totalQuestions: totalQuestions,
                            partial: partial,
                            minusMark: minusMark,
                            maximumMarks: maximumMarks,
                            subjects: attempt.subjects
                        }
                    })

                newQA.sort((a, b) => {
                    return b.stdTime - a.stdTime
                })
                this.attemptDetailRepository.setInstanceKey(ik);
                await this.attemptDetailRepository.updateOne({ _id: attempt.attemptdetails },
                    {
                        $set: {
                            QA: newQA,
                            archiveQA: QA
                        }
                    })
            }
        }
        catch (ex) {
            Logger.error('%o', ex)
        }
    }

    private async sendEvalutionCompletedNotification(req: any, attempt: any) {
        const settings = await this.redisCache.getSetting({ instancekey: req.instancekey }, function (settings: any) {
            return settings;
        })
        this.notificationRepository.setInstanceKey(req.instancekey);
        let notification = await this.notificationRepository.create({
            receiver: attempt.user,
            type: 'notification',
            modelId: 'testEvaluation',
            subject: 'Your test has been evaluated by teacher'
        });

        let options = {
            student: attempt.studentName,
            teacherName: attempt.createdBy.name,
            testUrl: settings.baseUrl + 'student/attemptSummary/' + attempt._id,
            testName: attempt.practiceSetInfo.title,
            subject: 'Your test has been evaluated by teacher'
        }

        let dataMsgCenter: any = {
            receiver: attempt.user,
            modelId: 'testEvaluation'
        };
        if (attempt.email) {
            dataMsgCenter.to = attempt.email
            dataMsgCenter.isScheduled = true
        }

        await this.messageCenter.sendWithTemplate(req, 'descriptive-submit-to-student', options, dataMsgCenter);
    }

    async questionEvaluation(req: QuestionEvaluationRequest) {
        try {
            this.attemptDetailRepository.setInstanceKey(req.instancekey);
            let updatedAttemps = await this.attemptDetailRepository.findOneAndUpdate({
                attempt: new ObjectId(req.id),
                'QA.question': new ObjectId(req.body.question)
            }, {
                $set: {
                    'QA.$.status': req.body.status,
                    'QA.$.teacherComment': req.body.teacherComment,
                    'QA.$.obtainMarks': req.body.marks
                }
            })

            let oldQA = updatedAttemps.QA.find(q => q.question.equals(req.body.question))

            let topic = oldQA.topic._id;
            let unit = oldQA.unit._id;
            let subject = oldQA.subject._id;

            let isEvaluated = false;
            let markDiff = oldQA.status === 4 ? req.body.marks : req.body.marks - oldQA.obtainMarks;

            this.attemptRepository.setInstanceKey(req.instancekey);
            let newAttempt: any = await this.attemptRepository.aggregate([
                {
                    $match: {
                        _id: new ObjectId(req.id)
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
                    $unwind: "$QA"
                },
                {
                    $project: {
                        "status": "$QA.status",
                        'totalMark': "$totalMark",
                        "plusMark": "$plusMark",
                        "minusMark": "$minusMark"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        totalMark: {
                            $first: "$totalMark"
                        },
                        plusMark: {
                            $first: "$plusMark"
                        },
                        minusMark: {
                            $first: "$minusMark"
                        },
                        pending: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$status", 4]
                                }, 1, 0]
                            }
                        },
                        correct: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$status", 1]
                                }, 1, 0]
                            }
                        },
                        wrong: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$status", 2]
                                }, 1, 0]
                            }
                        },
                        missed: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$status", 3]
                                }, 1, 0]
                            }
                        },
                        partial: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$status", 5]
                                }, 1, 0]
                            }
                        }
                    }
                }
            ])

            if (newAttempt[0].pending == 0) {
                isEvaluated = true;
            }

            var plusMark = newAttempt[0].plusMark;
            var minusMark = newAttempt[0].minusMark;

            switch (req.body.status) {
                case 1:
                    plusMark = plusMark + markDiff;
                    break;
                case 2:
                    if (req.body.marks < 0) {
                        minusMark = minusMark + markDiff;
                    }
                    break;
                case 5:
                    plusMark = plusMark + markDiff;
                    break;
            }

            var totalmark = newAttempt[0].totalMark + markDiff;

            this.attemptRepository.setInstanceKey(req.instancekey);
            updatedAttemps = await this.attemptRepository.findOneAndUpdate({
                _id: new ObjectId(req.id)
            }, {
                $set: {
                    'isEvaluated': isEvaluated,
                    'pending': newAttempt[0].pending,
                    'totalCorrects': newAttempt[0].correct,
                    'totalErrors': newAttempt[0].wrong,
                    'totalMissed': newAttempt[0].missed,
                    "partial": newAttempt[0].partial,
                    "totalMark": totalmark,
                    "plusMark": plusMark,
                    "minusMark": minusMark
                }
            })

            for (var i = 0; i < updatedAttemps.subjects.length; i++) {
                var sub = updatedAttemps.subjects[i]
                if (sub._id.equals(subject)) {
                    if (sub.pending > 0) {
                        sub.pending--
                    }
                    let sschange = false;
                    switch (req.body.status) {
                        case 1:
                            if (oldQA.status != req.body.status) {
                                sub.correct++
                                sschange = true;
                            }
                            break;
                        case 2:
                            if (oldQA.status != req.body.status) {
                                sub.incorrect++
                                sschange = true;

                            }

                            break;
                        case 5:
                            if (oldQA.status != req.body.status) {
                                sub.partial++
                                sschange = true;

                            }

                            break;
                    }

                    if (sschange && req.body.status != 4) {
                        switch (oldQA.status) {
                            case 1:
                                sub.correct--

                                break;
                            case 2:
                                sub.incorrect--

                                break;
                            case 3:
                                sub.missed--

                                break;
                            case 5:
                                sub.partial--

                                break;
                        }
                    }
                    sub.mark += markDiff;
                    sub.accuracy = sub.maxMarks > 0 ? sub.mark / sub.maxMarks : 0
                    for (var j = 0; j < sub.units.length; j++) {
                        if (sub.units[j]._id.equals(unit)) {
                            sub.units[j].mark += markDiff;

                            if (sub.units[j].pending > 0) {
                                sub.units[j].pending--
                            }
                            let usc = false;
                            switch (req.body.status) {
                                case 1:
                                    if (oldQA.status != req.body.status) {
                                        sub.units[j].correct++
                                        usc = true;

                                    }

                                    break;
                                case 2:
                                    if (oldQA.status != req.body.status) {
                                        sub.units[j].incorrect++
                                        usc = true;

                                    }

                                    break;
                                case 5:
                                    if (oldQA.status != req.body.status) {
                                        sub.units[j].partial++
                                        usc = true;

                                    }
                                    break;
                            }

                            if (usc && req.body.status != 4) {
                                switch (oldQA.status) {
                                    case 1:
                                        sub.units[j].correct--

                                        break;

                                    case 2:
                                        sub.units[j].incorrect--

                                        break;
                                    case 3:
                                        sub.units[j].missed--

                                        break;
                                    case 5:
                                        sub.units[j].partial--

                                        break;
                                }
                            }
                            sub.units[j].accuracy = sub.units[j].mark / sub.units[j].maxMarks
                            //topic update
                            for (var k = 0; k < sub.units[j].topics.length; k++) {
                                if (sub.units[j].topics[k]._id.equals(topic)) {
                                    sub.units[j].topics[k].mark += markDiff;

                                    if (sub.units[j].topics[k].pending > 0) {
                                        sub.units[j].topics[k].pending--
                                    }
                                    let tusc = false;
                                    switch (req.body.status) {
                                        case 1:
                                            if (oldQA.status != req.body.status) {
                                                sub.units[j].topics[k].correct++
                                                tusc = true;

                                            }

                                            break;
                                        case 2:
                                            if (oldQA.status != req.body.status) {
                                                sub.units[j].topics[k].incorrect++
                                                tusc = true;

                                            }

                                            break;
                                        case 5:
                                            if (oldQA.status != req.body.status) {
                                                sub.units[j].topics[k].partial++
                                                tusc = true;

                                            }
                                            break;
                                    }

                                    if (tusc && req.body.status != 4) {
                                        switch (oldQA.status) {
                                            case 1:
                                                sub.units[j].topics[k].correct--

                                                break;

                                            case 2:
                                                sub.units[j].topics[k].incorrect--

                                                break;
                                            case 3:
                                                sub.units[j].topics[k].missed--

                                                break;
                                            case 5:
                                                sub.units[j].topics[k].partial--

                                                break;
                                        }
                                    }
                                    sub.units[j].topics[k].accuracy = sub.units[j].topics[k].mark / sub.units[j].topics[k].maxMarks
                                }
                            }

                        }
                    }
                }
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            updatedAttemps = await this.attemptRepository.findOneAndUpdate({ _id: updatedAttemps._id }, { $set: { subjects: updatedAttemps.subjects } }, { lean: true })

            if (req.body.eId) {
                this.evaluationRepository.setInstanceKey(req.instancekey);
                await this.evaluationRepository.updateMany({ QAId: new ObjectId(req.body.eId), active: true }, { $set: { timeSpent: (req.body.timeSpent || 0), evaluated: true, evaluationDate: new Date() } });
            }

            this.practiceSetRepository.setInstanceKey(req.instancekey);
            let practice = await this.practiceSetRepository.findById(updatedAttemps.practicesetId, { sections: 1, questions: 1 }, { lean: true })
            if (newAttempt[0].pending == 0) {
                await this.createArchiveAttemptAndAttemptDetails(updatedAttemps, practice, req.instancekey)
            }

            if (newAttempt[0].pending == 0 && updatedAttemps.isShowAttempt) {
                await this.sendEvalutionCompletedNotification(req, updatedAttemps)
            }

            return {
                result: updatedAttemps
            };

        } catch (ex) {
            Logger.warn('validationError %j', ex)
            throw new GrpcInternalException(ex.message);
        }
    }

    async assignEvaluators(req: AssignEvaluatorsRequest) {
        try {
            if (!req.body.evaluators || !req.body.evaluators.length) {
                throw new BadRequestException({ message: 'missing evaluators' })
            }

            this.practiceSetRepository.setInstanceKey(req.instancekey);
            let test = await this.practiceSetRepository.findById(new ObjectId(req.testId), '_id title', { lean: true });

            if (!test) {
                throw new NotFoundException();
            }

            let match: any = { practicesetId: new ObjectId(test._id), isAbandoned: false }
            if (!req.user.roles.includes('admin')) {
                match.location = new ObjectId(req.user.activeLocation)
            }
            // Split questions equally to each evaluators
            this.attemptRepository.setInstanceKey(req.instancekey);
            let questions: any = await this.attemptRepository.aggregate([
                { $match: match },
                {
                    $lookup: {
                        from: 'attemptdetails',
                        localField: 'attemptdetails',
                        foreignField: '_id',
                        as: 'details'
                    }
                },
                {
                    $unwind: '$details'
                },
                {
                    $unwind: '$details.QA'
                },
                { $match: { 'details.QA.status': Constants.PENDING, 'details.QA.evaluatorAssigned': { $ne: true } } },
                {
                    $project: {
                        user: 1,
                        attempt: '$_id',
                        QAId: '$details.QA._id',
                        question: '$details.QA.question'
                    }
                }
            ])

            while (questions.length) {
                for (let evaluator of req.body.evaluators) {
                    if (!questions[0]) {
                        break;
                    }
                    let question = questions.splice(0, 1)[0];
                    this.evaluationRepository.setInstanceKey(req.instancekey);
                    let evaluation = await this.evaluationRepository.create({
                        teacher: new ObjectId(evaluator),
                        QAId: question.QAId,
                        question: question.question,
                        student: question.user,
                        practicesetId: test._id,
                        practicesetTitle: test.title,
                        attemptId: question.attempt,
                        active: true,
                        createdBy: req.user.roles[0]
                    })

                    if (!req.user.roles.includes('admin')) {
                        evaluation.location = new ObjectId(req.user.activeLocation);
                    }

                    this.attemptDetailRepository.setInstanceKey(req.instancekey);
                    await this.attemptDetailRepository.updateOne({ attempt: question.attempt, 'QA._id': question.QAId }, { $set: { 'QA.$.evaluatorAssigned': true } })
                }
            }

            return { status: 'ok' };
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async removeEvaluators(req: RemoveEvaluatorsRequest) {
        try {           
            if (!req.body.evaluator || !req.body.option || req.body.option == 'new' && (!req.body.newEvaluators || !req.body.newEvaluators.length)) {
                throw new BadRequestException();
            }

            let evalQuery: any = {
                practicesetId: new ObjectId(req.testId),
                teacher: new ObjectId(req.body.evaluator),
                evaluated: false,
                active: true,
                createdBy: { $ne: 'system' }
            }

            if (!req.user.roles.includes('admin')) {
                evalQuery.location = new ObjectId(req.user.activeLocation)
            }

            // remove evaluator and re-assign questions to remaining evaluators
            this.evaluationRepository.setInstanceKey(req.instancekey);
            let remainingQuestions = await this.evaluationRepository.find(evalQuery, null, { lean: true });
            
            if (req.body.option == 'unassigned') {
                evalQuery = { practicesetId: new ObjectId(req.testId), teacher: new ObjectId(req.body.evaluator), createdBy: { $ne: 'system' } }
                if (!req.user.roles.includes('admin')) {
                    evalQuery.location = new ObjectId(req.user.activeLocation)
                }
                await this.evaluationRepository.updateMany(evalQuery, { $set: { active: false } })

                for (let q of remainingQuestions) {
                    this.attemptDetailRepository.setInstanceKey(req.instancekey);
                    await this.attemptDetailRepository.updateOne({ attempt: q.attemptId, 'QA._id': q.QAId }, { $set: { 'QA.$.evaluatorAssigned': false } })
                }

                return { status: 'ok' }
            }

            let evaluators = []
            if (req.body.option == 'new') {
                evaluators = req.body.newEvaluators;
            } else if (req.body.option == 'existing') {
                evalQuery = { practicesetId: new ObjectId(req.testId), active: true, createdBy: { $ne: 'system' } }
                if (!req.user.roles.includes('admin')) {
                    evalQuery.location = new ObjectId(req.user.activeLocation)
                }
                this.evaluationRepository.setInstanceKey(req.instancekey);
                evaluators = await this.evaluationRepository.distinct('teacher', evalQuery)
            }

            if (!evaluators.length) {
                throw new BadRequestException({ message: "No more evaluators to distribute the questions" })
            }

            evalQuery = { practicesetId: new ObjectId(req.testId), teacher: new ObjectId(req.body.evaluator), createdBy: { $ne: 'system' } }
            if (!req.user.roles.includes('admin')) {
                evalQuery.location = new ObjectId(req.user.activeLocation)
            }
            this.evaluationRepository.setInstanceKey(req.instancekey);
            await this.evaluationRepository.updateMany(evalQuery, { $set: { active: false } })

            while (remainingQuestions.length) {
                for (let evaluator of evaluators) {
                    if (!remainingQuestions[0]) {
                        break;
                    }
                    let question = remainingQuestions.splice(0, 1)[0]
                    let evaluation = await this.evaluationRepository.create({
                        teacher: evaluator,
                        QAId: question.QAId,
                        question: question.question,
                        student: question.student,
                        practicesetId: question.practicesetId,
                        practicesetTitle: question.practicesetTitle,
                        attemptId: question.attemptId,
                        active: true,
                        createdBy: req.user.roles[0]
                    })

                    if (!req.user.roles.includes('admin')) {
                        evaluation.location = new ObjectId(req.user.activeLocation)
                    }
                }
            }

            return { status: 'ok' }
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }
}