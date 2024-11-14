import { CourseRepository, PracticeSetRepository, QuestionRepository, TestSeriesRepository, UserEnrollmentRepository, UsersRepository, regexName, shuffleArray } from "@app/common";
import { AsessmentTrendReq, CourseTrendReq, GetAssessmetSubjectDistributionReq, GetCourseSubjectDistributionReq, GetQuestionSubjectDistributionReq, GetSoldDataReq, GetTestseriesSubjectDistributionReq, GetTransactionLogsReq, IndexPublisherReq, TestSeriesTrendReq } from "@app/common/dto/userManagement/publisher.dto";
import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { GrpcInternalException } from "nestjs-grpc-exceptions";

@Injectable()
export class PublisherService {

    constructor(
        private readonly practiceSetRepository: PracticeSetRepository,
        private readonly usersRepository: UsersRepository,
        private readonly courseRepository: CourseRepository,
        private readonly testSeriesRepository: TestSeriesRepository,
        private readonly questionRepository: QuestionRepository,
        private readonly userEnrollmentRepository: UserEnrollmentRepository
    ) { }

    async indexPublisher(request: IndexPublisherReq) {
        try {
            // request.query = request.body;

            let group = {}

            group = {
                $group: { _id: "$user" }
            };

            let condition: any = {}
            condition.status = 'published';

            if (request.user) {
                //  condition['grades._id'] = { $in: request.user.grade }
                condition['subjects._id'] = { $in: request.user.subjects.map(s => new ObjectId(s)) }
            }

            let match = {
                $match: condition
            }

            this.practiceSetRepository.setInstanceKey(request.instancekey)
            const result = await this.practiceSetRepository.aggregate([match, group])

            const users = await Promise.all(result.map(async (user) => user._id));

            if (users && users.length > 0) {
                this.usersRepository.setInstanceKey(request.instancekey)
                const userResults = await this.usersRepository.find({ _id: { $in: users } }, { _id: 1, name: 1 })

                return {
                    response: userResults
                };
            } else {
                return {
                    response: []
                };
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getSoldData(request: GetSoldDataReq) {
        try {
            if (request.userId) {
                let condition = {
                    user: new ObjectId(request.userId),
                    accessMode: 'buy',
                    status: 'published'
                }
                let dateFilter = {}
                if (request.interval) {
                    dateFilter = {
                        $gte: ["$createdAt", new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))]
                    }
                }

                this.courseRepository.setInstanceKey(request.instancekey)
                let totalUserCourse = await this.courseRepository.countDocuments({
                    "user._id": new ObjectId(request.userId),
                    status: 'published'
                })

                this.testSeriesRepository.setInstanceKey(request.instancekey)
                let totalUserTestseries = await this.testSeriesRepository.countDocuments({
                    "user": new ObjectId(request.userId),
                    status: 'published'
                })

                var totalUserAssessment = await this.practiceSetRepository.countDocuments({
                    "user": new ObjectId(request.userId),
                    status: 'published'
                })

                let soldCourses: any = await this.courseRepository.aggregate([
                    {
                        "$match": {
                            "user._id": new ObjectId(request.userId), accessMode: 'buy',
                            status: 'published'
                        }
                    },
                    {
                        $lookup: {
                            from: 'userenrollments',
                            let: { uId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        accessMode: 'buy',
                                        $expr: {
                                            $and: [
                                                { $eq: ['$item', '$$uId'] },
                                                dateFilter
                                            ]
                                        }
                                    }
                                },
                                { $project: { status: 1, price: 1 } }
                            ],
                            as: 'userData'
                        }
                    },
                    { $project: { _id: 1, course: "$title", userData: "$userData" } },
                    { $unwind: "$userData" },
                    { $group: { _id: null, course: { $addToSet: "$_id" }, count: { $sum: 1 }, price: { $sum: "$userData.price" } } }
                ])

                let soldAssessment: any = await this.practiceSetRepository.aggregate([
                    {
                        "$match": condition
                    },
                    {
                        $lookup: {
                            from: 'userenrollments',
                            let: { uId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        accessMode: 'buy',
                                        $expr: {
                                            $and: [
                                                { $eq: ['$item', '$$uId'] },
                                                dateFilter
                                            ]
                                        }
                                    }
                                },
                                { $project: { status: 1, price: 1 } }
                            ],
                            as: 'userData'
                        }
                    },
                    { $project: { _id: 1, course: "$title", userData: "$userData" } },
                    { $unwind: "$userData" },
                    { $group: { _id: null, practiceIds: { $addToSet: "$_id" }, count: { $sum: 1 }, price: { $sum: "$userData.price" } } }
                ])

                let soldTestSeries: any = await this.testSeriesRepository.aggregate([
                    {
                        "$match": condition
                    },
                    {
                        $lookup: {
                            from: 'userenrollments',
                            let: { uId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        accessMode: 'buy',
                                        $expr: {
                                            $and: [
                                                { $eq: ['$item', '$$uId'] },
                                                dateFilter
                                            ]
                                        }
                                    }
                                },
                                { $project: { status: 1, price: 1 } }
                            ],
                            as: 'userData'
                        }
                    },
                    { $project: { _id: 1, course: "$title", userData: "$userData" } },
                    { $unwind: "$userData" },
                    { $group: { _id: null, testseriesIds: { $addToSet: "$_id" }, count: { $sum: 1 }, price: { $sum: "$userData.price" } } }
                ])

                let course = {
                    total: totalUserCourse,
                }

                if (soldCourses && soldCourses.length) {
                    course['sold'] = soldCourses[0].count || 0
                    course['revenue'] = soldCourses[0].price || 0
                } else {
                    course['sold'] = 0
                    course['revenue'] = 0
                }

                let testSeries = {
                    total: totalUserTestseries,
                }

                if (soldTestSeries && soldTestSeries.length) {
                    testSeries['sold'] = soldTestSeries[0].count || 0
                    testSeries['revenue'] = soldTestSeries[0].price || 0
                } else {
                    testSeries['sold'] = 0
                    testSeries['revenue'] = 0
                }

                let assessment = {
                    total: totalUserAssessment,
                }
                if (soldAssessment && soldAssessment.length) {
                    assessment['sold'] = soldAssessment[0].count || 0
                    assessment['revenue'] = soldAssessment[0].price || 0
                } else {
                    assessment['sold'] = 0
                    assessment['revenue'] = 0
                }

                return {
                    course: course,
                    testSeries: testSeries,
                    assessment: assessment
                }
            } else {
                return {
                    message: "No user found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getCourseSubjectDistribution(request: GetCourseSubjectDistributionReq) {
        try {
            if (request.userId) {
                this.courseRepository.setInstanceKey(request.instancekey)
                let course = await this.courseRepository.aggregate([
                    {
                        "$match": {
                            "user._id": new ObjectId(request.userId),
                        }
                    },
                    { $unwind: "$subjects" },
                    { $group: { _id: "$subjects._id", subject: { $first: "$subjects" }, count: { $sum: 1 } } }
                ])

                return {
                    response: course
                }
            } else {
                return {
                    message: "No user found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getTestseriesSubjectDistribution(request: GetTestseriesSubjectDistributionReq) {
        try {
            if (request.userId) {
                this.testSeriesRepository.setInstanceKey(request.instancekey)
                let testSeries = await this.testSeriesRepository.aggregate([
                    {
                        "$match": {
                            "user": new ObjectId(request.userId),
                        }
                    },
                    { $unwind: "$subjects" },
                    { $group: { _id: "$subjects._id", subject: { $first: "$subjects" }, count: { $sum: 1 } } }
                ])

                return {
                    response: testSeries
                }
            } else {
                return {
                    message: "No user found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAssessmetSubjectDistribution(request: GetAssessmetSubjectDistributionReq) {
        try {
            if (request.userId) {
                this.practiceSetRepository.setInstanceKey(request.instancekey)
                let tests = await this.practiceSetRepository.aggregate([
                    {
                        "$match": {
                            "user": new ObjectId(request.userId),
                        }
                    },
                    { $unwind: "$subjects" },
                    { $group: { _id: "$subjects._id", subject: { $first: "$subjects" }, count: { $sum: 1 } } }
                ])

                return {
                    response: tests
                }
            } else {
                return {
                    message: "No user found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getQuestionSubjectDistribution(request: GetQuestionSubjectDistributionReq) {
        try {
            if (request.userId) {
                this.questionRepository.setInstanceKey(request.instancekey)
                let question = await this.questionRepository.aggregate([
                    {
                        "$match": {
                            "user": new ObjectId(request.userId),
                        }
                    },
                    { $group: { _id: "$subjects._id", subject: { $first: "$subjects" }, count: { $sum: 1 } } }
                ])

                return {
                    response: question
                }
            } else {
                return {
                    message: "No user found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async testSeriesTrend(request: TestSeriesTrendReq) {
        try {
            if (request.userId) {
                let dateFilter = new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
                if (request.dateFilter) {
                    if (request.dateFilter == 'monthly') {
                        dateFilter = new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                    }
                }

                this.testSeriesRepository.setInstanceKey(request.instancekey)
                let testSeries = await this.testSeriesRepository.aggregate([
                    {
                        "$match": {
                            "user": new ObjectId(request.userId)
                        }
                    },
                    {
                        $lookup: {
                            from: 'userenrollments',
                            let: { uId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        accessMode: 'buy',
                                        // below expr give empty due to insufficient data in db
                                        $expr: {
                                            $and: [{ $eq: ['$item', '$$uId'] },
                                            { $gte: ["$createdAt", dateFilter] }
                                            ]
                                        }
                                    }
                                },
                                { $project: { status: 1, createdAt: 1 } }
                            ],
                            as: 'userData'
                        }
                    },
                    { $unwind: "$userData" },
                    { $project: { _id: 1, testseries: "$title", createdAt: "$userData.createdAt" } },
                    {
                        $group: {
                            _id: {
                                testseries: "$_id",
                                year: {
                                    $year: "$createdAt"
                                },
                                month: {
                                    $month: "$createdAt"
                                },
                                day: {
                                    $dayOfMonth: "$createdAt"
                                }
                            },
                            testseries: { $first: "$testseries" },
                            testseriesId: { $first: "$_id" },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { testseries: 1, "_id.month": 1, "_id.day": 1 } }
                ])

                return {
                    response: testSeries
                }
            } else {
                return {
                    message: "No user found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

    async courseTrend(request: CourseTrendReq) {
        try {
            if (request.userId) {
                let dateFilter = new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
                if (request.dateFilter) {
                    if (request.dateFilter == 'monthly') {
                        dateFilter = new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                    }
                }

                this.courseRepository.setInstanceKey(request.instancekey)
                let course = await this.courseRepository.aggregate([
                    {
                        "$match": {
                            "user._id": new ObjectId(request.userId)
                        }
                    },
                    {
                        $lookup: {
                            from: 'userenrollments',
                            let: { uId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        accessMode: 'buy',
                                        // below expr give empty due to insufficient data in db
                                        // $expr: {
                                        //     $and: [{ $eq: ['$item', '$$uId'] },
                                        //     { $gte: ["$createdAt", dateFilter] }
                                        //     ]
                                        // }
                                    }
                                },
                                { $project: { status: 1, createdAt: 1 } }
                            ],
                            as: 'userData'
                        }
                    },
                    { $unwind: "$userData" },
                    { $project: { _id: 1, course: "$title", createdAt: "$userData.createdAt" } },
                    {
                        $group: {
                            _id: {
                                practiceset: "$_id",
                                year: {
                                    $year: "$createdAt"
                                },
                                month: {
                                    $month: "$createdAt"
                                },
                                day: {
                                    $dayOfMonth: "$createdAt"
                                }
                            },
                            courseId: { $first: "$_id" },
                            course: { $first: "$course" },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.month": 1, "_id.day": 1 } }
                ])

                return {
                    response: course
                }
            } else {
                return {
                    message: "No user found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

    async asessmentTrend(request: AsessmentTrendReq) {
        try {
            if (request.userId) {
                let dateFilter = new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
                if (request.dateFilter) {
                    if (request.dateFilter == 'monthly') {
                        dateFilter = new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                    }
                }

                this.practiceSetRepository.setInstanceKey(request.instancekey)
                let assessment = await this.practiceSetRepository.aggregate([
                    {
                        "$match": {
                            "user": new ObjectId(request.userId)
                        }
                    },
                    {
                        $lookup: {
                            from: 'userenrollments',
                            let: { uId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        accessMode: 'buy',
                                        // below expr give empty due to insufficient data in db
                                        // $expr: {
                                        //     $and: [{ $eq: ['$item', '$$uId'] },
                                        //     { $gte: ["$createdAt", dateFilter] }
                                        //     ]
                                        // }
                                    }
                                },
                                { $project: { status: 1, createdAt: 1 } }
                            ],
                            as: 'userData'
                        }
                    },
                    { $unwind: "$userData" },
                    { $project: { _id: 1, practiceset: "$title", createdAt: "$userData.createdAt" } },
                    {
                        $group: {
                            _id: {
                                practiceset: "$_id",
                                year: {
                                    $year: "$createdAt"
                                },
                                month: {
                                    $month: "$createdAt"
                                },
                                day: {
                                    $dayOfMonth: "$createdAt"
                                }
                            },
                            testId: { $first: "$_id" },
                            practiceset: { $first: "$practiceset" },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { practiceset: 1, "_id.month": 1, "_id.day": 1 } }
                ])

                return {
                    response: assessment
                }
            } else {
                return {
                    message: "No user found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

    async getTransactionLogs(request: GetTransactionLogsReq) {
        try {
            if (request.userId) {
                let page = request.page || 1
                let limit = request.limit || 10
                let skip = (page - 1) * limit
                let condition = {
                    user: new ObjectId(request.userId),
                    accessMode: 'buy',
                    status: 'published'
                }

                this.testSeriesRepository.setInstanceKey(request.instancekey)
                let soldTestSeries: any = await this.testSeriesRepository.aggregate([
                    {
                        "$match": condition
                    },
                    {
                        $project: { _id: 1 }
                    }
                ])

                this.courseRepository.setInstanceKey(request.instancekey)
                let soldCourses: any = await this.courseRepository.aggregate([
                    {
                        "$match": {
                            "user._id": new ObjectId(request.userId), accessMode: 'buy',
                            status: 'published'
                        }
                    },
                    {
                        $project: { _id: 1 }
                    }
                ])

                this.practiceSetRepository.setInstanceKey(request.instancekey);
                let soldAssessment: any = await this.practiceSetRepository.aggregate([
                    {
                        "$match": condition
                    },
                    {
                        $project: { _id: 1 }
                    }
                ])

                let totalIds: any = soldTestSeries.concat(soldCourses)
                totalIds = totalIds.concat(soldAssessment)
                totalIds = shuffleArray(totalIds.map(t => (t._id)))

                if (request.course) {
                    totalIds = soldCourses.map(t => (t._id))
                }
                if (request.testseries) {
                    totalIds = soldTestSeries.map(t => (t._id))
                }
                if (request.practice) {
                    totalIds = soldAssessment.map(t => (t._id))
                }

                let searchFilter = {}

                if (request.title) {
                    let regexText = regexName(request.title)
                    searchFilter = {
                        '$or': [
                            {
                                "userData.name": regexText
                            },
                            {
                                "userData.userId": regexText
                            },
                        ]
                    }
                }

                if (request.count) {
                    this.userEnrollmentRepository.setInstanceKey(request.instancekey)
                    let totalTransactions = await this.userEnrollmentRepository.aggregate([
                        {
                            $match: { item: { $in: totalIds } }
                        },
                        {
                            $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userData" }

                        },
                        { $unwind: "$userData" },
                        {
                            $match: searchFilter
                        }, { $count: 'total' }
                    ])

                    return {
                        response: totalTransactions[0]
                    }
                }

                this.userEnrollmentRepository.setInstanceKey(request.instancekey)
                let transactions = await this.userEnrollmentRepository.aggregate([
                    {
                        $match: { item: { $in: totalIds } }
                    },
                    {
                        $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userData" }

                    },
                    { $unwind: "$userData" },
                    {
                        $match: searchFilter
                    },
                    { $project: { name: "$userData.name", avatar: "$userData.avatar", userId: "$userData.userId", createdAt: 1, type: 1, price: 1 } },
                    { $skip: skip },
                    { $limit: limit }
                ])

                return {
                    response: transactions
                }
            } else {
                return {
                    message: "No user found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }
}