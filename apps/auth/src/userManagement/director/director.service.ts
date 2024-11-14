import { AttemptRepository, CourseRepository, DiscussionRepository, PracticeSetRepository, QuestionRepository, TestSeriesRepository, UsersRepository } from "@app/common";
import { GetAbandonedAttemptTrendReq, GetAttemptTrendReq, GetAvgTimeSpendByCourseReq, GetDashboardSummaryReq, GetLoginTrendByClassroomReq, GetMostAttemptedStudentReq, GetPostTrendByLocationReq, GetQuestionAddedTrendReq, GetStudentOnboardingDistributionReq, GetTestSeriesAttemptTrendBySubjectReq } from "@app/common/dto/userManagement/director.dto";
import timeHelper from "@app/common/helpers/time-helper";
import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { GrpcInternalException } from "nestjs-grpc-exceptions";

@Injectable()
export class DirectorService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly attemptRepository: AttemptRepository,
        private readonly courseRepository: CourseRepository,
        private readonly practiceSetRepository: PracticeSetRepository,
        private readonly discussionRepository: DiscussionRepository,
        private readonly questionRepository: QuestionRepository,
        private readonly testseriesRepository: TestSeriesRepository
    ) { }

    async getDashboardSummary(request: GetDashboardSummaryReq) {
        try {
            let summary = {
                student: {
                    count: 0,
                    diff: 0
                },
                teacher: {
                    count: 0,
                    diff: 0
                },
                course: {
                    count: 0,
                    diff: 0
                },
                attempt: {
                    count: 0,
                    diff: 0
                },
                test: {
                    count: 0,
                    diff: 0
                }
            }

            let date = new Date();
            date.setDate(date.getDate() - 15)

            let cIds = await this.usersRepository.distinct('_id', {
                "isActive": true, locations: new ObjectId(request.id), passingYear: request.passingYear
            })

            let LastFifteenDaysCount = await this.usersRepository.countDocuments({
                roles: 'student',
                locations: new ObjectId(request.id), isActive: true,
                createdAt: { $gte: date }, passingYear: request.passingYear
            })

            let fifteenDaysLessCount = await this.usersRepository.countDocuments({
                roles: 'student',
                locations: new ObjectId(request.id), isActive: true,
                passingYear: request.passingYear
            })

            summary.student.count = fifteenDaysLessCount;
            summary.student.diff = LastFifteenDaysCount;

            LastFifteenDaysCount = await this.usersRepository.countDocuments({
                roles: 'teacher',
                locations: new ObjectId(request.id), isActive: true, createdAt: { $gte: date }
            })

            fifteenDaysLessCount = await this.usersRepository.countDocuments({
                roles: 'teacher', locations: new ObjectId(request.id), isActive: true
            })

            summary.teacher.count = fifteenDaysLessCount;
            summary.teacher.diff = LastFifteenDaysCount;

            (LastFifteenDaysCount as any) = await this.usersRepository.aggregate([
                {
                    $match: {
                        "isActive": true, "locations": new ObjectId(request.id), passingYear: request.passingYear
                    }
                },
                {
                    $lookup: {
                        from: "attempts",
                        let: { u: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    isAbandoned: false,
                                    "location": new ObjectId(request.id),
                                    $expr: { $eq: ["$user", "$$u"] }
                                }
                            },
                            { $group: { _id: "$user", count: { $sum: 1 } } }
                        ],
                        as: "attempts"
                    }
                }, { $unwind: "$attempts" },
                { $group: { _id: "$_id", name: { $first: "$name" }, attemptCount: { $sum: "$attempts.count" } } },
                { $group: { _id: null, data: { $sum: "$attemptCount" } } }
            ])

            fifteenDaysLessCount = await this.attemptRepository.countDocuments({
                'user': { $in: cIds }, "location": new ObjectId(request.id), isAbandoned: false, createdAt: { $gte: date }
            })

            summary.attempt.count = LastFifteenDaysCount[0] ? LastFifteenDaysCount[0].data : 0;
            summary.attempt.diff = fifteenDaysLessCount;

            LastFifteenDaysCount = await this.courseRepository.countDocuments({
                locations: new ObjectId(request.id),
                createdAt: { $gte: date }
            })

            fifteenDaysLessCount = await this.courseRepository.countDocuments({
                locations: new ObjectId(request.id)
            })

            summary.course.count = fifteenDaysLessCount;
            summary.course.diff = LastFifteenDaysCount;

            LastFifteenDaysCount = await this.practiceSetRepository.countDocuments({
                locations: new ObjectId(request.id),
                createdAt: { $gte: date }
            })

            fifteenDaysLessCount = await this.practiceSetRepository.countDocuments({
                locations: new ObjectId(request.id)
            })

            LastFifteenDaysCount = await this.practiceSetRepository.countDocuments({
                "locations": new ObjectId(request.id),
                'course.0': { $exists: false },
                'testseries.0': { $exists: false }, status: "published", createdAt: { $gte: date }
            })

            fifteenDaysLessCount = await this.practiceSetRepository.countDocuments({
                "locations": new ObjectId(request.id),
                'course.0': { $exists: false },
                'testseries.0': { $exists: false }, status: "published"
            })

            summary.test.count = fifteenDaysLessCount;
            summary.test.diff = LastFifteenDaysCount;

            return {
                ...summary
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getLoginTrendByClassroom(request: GetLoginTrendByClassroomReq) {
        try {
            let date = new Date();
            date.setDate(date.getDate() - 7);

            let result = await this.usersRepository.aggregate([
                {
                    $match: {
                        isActive: true,
                        locations: new ObjectId(request.id),
                        roles: "student",
                        passingYear: request.passingYear
                    }
                },
                {
                    $lookup: {
                        from: "userlogs",
                        let: { u: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$user", "$$u"] }, "createdAt": {
                                        "$gte": date
                                    }
                                }
                            },
                            { $group: { _id: "$user" } }
                        ],
                        as: "userlogs"
                    }
                }, { $unwind: "$userlogs" },
                { $group: { _id: "$_id", count: { $sum: 1 }, name: { $first: "$name" } } },
                { $group: { _id: null, data: { $push: "$count" }, labels: { $push: "$name" } } }
            ])

            return {
                ...result[0]
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getPostTrendByLocation(request: GetPostTrendByLocationReq) {
        try {
            //Get last server days Posts
            //Params
            //Location
            let date = new Date()
            date.setDate(date.getDate() - 30);
            let sIds = await this.usersRepository.distinct('_id', {
                "isActive": true, locations: new ObjectId(request.id), passingYear: request.passingYear
            })
            let result = await this.discussionRepository.aggregate([
                {
                    "$match": {
                        user: { $in: sIds },
                        createdAt: { $gte: date },
                        "location": new ObjectId(request.id)
                    }
                },
                {
                    "$project": {
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
                        },
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
                        }
                    }
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
                },
                { $group: { _id: null, data: { $push: "$count" }, labels: { $push: "$createdAt" } } }
            ])

            return {
                ...result[0]
            }
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

    async getMostAttemptedStudent(request: GetMostAttemptedStudentReq) {
        try {
            let result = []
            let date = new Date();
            date.setDate(date.getDate() - 30)

            let sIds = await this.usersRepository.distinct('_id', { "isActive": true, locations: new ObjectId(request.id), passingYear: request.passingYear, roles: "student" })

            let results = await this.attemptRepository.aggregate([
                {
                    "$match": { user: { $in: sIds }, "location": new ObjectId(request.id), isAbandoned: false, createdAt: { $gte: date } }
                },
                {
                    "$project": {
                        "practicesetId": 1,
                        "studentName": 1,
                        "user": 1
                    }
                },
                {
                    "$group": {
                        "_id": { practicesetId: "$practicesetId", user: "$user" },
                        "count": {
                            "$sum": 1
                        },
                        name: { $first: "$studentName" }
                    }
                },
                {
                    "$group": {
                        "_id": "$_id.practicesetId",
                        "attempts": {
                            "$sum": "$count"
                        },
                        tests: { $sum: 1 },
                        name: { $first: "$name" }
                    }
                },
                {
                    "$sort": {
                        "attempts": -1,
                        "tests": -1,
                        "name": 1
                    }
                },
                {
                    "$limit": 5
                }
            ])

            return {
                response: results
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getQuestionAddedTrend(request: GetQuestionAddedTrendReq) {
        try {
            let cond = {
                roles: { $in: ['director', 'teacher', 'operator'] },
                locations: new ObjectId(request.id),
                isActive: true
            }

            let teacherList = await this.usersRepository.distinct('_id', cond);

            if (teacherList.length) {
                let trend = await this.questionRepository.aggregate([
                    {
                        "$match": {
                            user: { $in: teacherList },
                            "locations": new ObjectId(request.id)
                        }
                    },
                    {
                        "$project": {
                            "createdAt": {
                                "$let": {
                                    "vars": {
                                        "field": "$createdAt"
                                    },
                                    "in": {
                                        "date": {
                                            "$dateToString": {
                                                "format": "%Y-%m",
                                                "date": "$$field"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        "$group": {
                            "_id": "$createdAt",
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
                    { $group: { _id: null, data: { $push: "$count" }, labels: { $push: "$_id" } } }
                ])

                return { response: trend[0] }
            } else {
                return { response: [] }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAttemptTrend(request: GetAttemptTrendReq) {
        try {
            let attemptFilter = {
                $expr: { $eq: ["$user", "$$u"] },
                isAbandoned: false,
                location: new ObjectId(request.locId)
            }

            if (request.days) {
                (attemptFilter as any).createdAt = { $gt: timeHelper.lastDays(Number(request.days)) }
            }

            let result = await this.usersRepository.aggregate([
                {
                    "$match": {
                        isActive: true,
                        locations: new ObjectId(request.locId),
                        roles: "student",
                        passingYear: request.passingYear
                    }
                },
                {
                    $lookup: {
                        from: "attempts",
                        let: { u: "$_id" },
                        pipeline: [
                            {
                                $match: attemptFilter
                            },
                            { $group: { _id: "$user", count: { $sum: 1 } } }
                        ],
                        as: "attempts"
                    }
                }, { $unwind: "$attempts" },
                { $group: { _id: "$_id", name: { $first: "$name" }, attemptCount: { $sum: "$attempts.count" } } },
                { $group: { _id: null, data: { $push: "$attemptCount" }, labels: { $push: "$name" } } }
            ])

            return {
                ...result[0]
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAbandonedAttemptTrend(request: GetAbandonedAttemptTrendReq) {
        try {
            let attemptFilter = {
                isAbandoned: true,
                location: new ObjectId(request.locId),
                $expr: { $eq: ["$user", "$$u"] }
            }
            if (request.days) {
                (attemptFilter as any).createdAt = { $gt: timeHelper.lastDays(Number(request.days)) }
            }

            let result = await this.usersRepository.aggregate([
                {
                    "$match": {
                        isActive: true,
                        locations: new ObjectId(request.locId),
                        passingYear: request.passingYear,
                        roles: "student"
                    }
                },
                {
                    $lookup: {
                        from: "attempts",
                        let: { u: "$_id" },
                        pipeline: [
                            {
                                $match: attemptFilter
                            },
                            { $group: { _id: "$user", count: { $sum: 1 } } }
                        ],
                        as: "attempts"

                    }
                },
                { $unwind: "$attempts" },

                { $group: { _id: "$_id", name: { $first: "$name" }, attemptCount: { $sum: "$attempts.count" } } },
                { $group: { _id: null, data: { $push: "$attemptCount" }, labels: { $push: "$name" } } }
            ])

            return {
                response: result[0]
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAvgTimeSpendByCourse(request: GetAvgTimeSpendByCourseReq) {
        try {
            let result = []

            let sIds = await this.usersRepository.distinct('_id', {
                "isActive": true, locations: new ObjectId(request.id), passingYear: request.passingYear
            })
            result = await this.courseRepository.aggregate([
                {
                    $match: {
                        'subjects._id': new ObjectId(request.subject),
                        "locations": new ObjectId(request.id),
                    }
                },
                {
                    $lookup: {
                        from: "usercourses",
                        let: { cid: "$_id" },
                        pipeline: [
                            {
                                $match: { user: { $in: sIds }, "location": new ObjectId(request.id), $expr: { $eq: ["$course", "$$cid"] } }
                            },
                            { $project: { contents: 1, user: 1, course: 1 } },
                            { $unwind: "$contents" },
                            { $group: { _id: "$course", timeSpent: { $sum: "$contents.timeSpent" } } }

                        ],
                        as: "userCourse"
                    }
                }, { $unwind: "$userCourse" },
                {
                    $project: {
                        timeSpent: "$userCourse.timeSpent", title: 1
                    }
                },
                { $group: { _id: null, data: { $push: "$timeSpent" }, labels: { $push: "$title" } } }
            ])

            return {
                ...result[0]
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getStudentOnboardingDistribution(request: GetStudentOnboardingDistributionReq) {
        try {
            let date = new Date();
            date.setDate(date.getDate() - 15);
            let result = await this.usersRepository.aggregate([
                {
                    "$match": {
                        role: "student",
                        passingYear: request.passingYear,
                        "locations": new ObjectId(request.id),
                        "createdAt": {
                            "$gte": date
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        attempt: { $sum: { $cond: [{ $anyElementTrue: ["$practiceAttempted"] }, 1, 0] } },
                        login: { $sum: { $cond: [{ $gte: ["$lastLogin", date] }, 1, 0] } },
                        neverLogin: { $sum: { $cond: [{ $lte: ["$lastLogin", date] }, 1, 0] } }
                    }
                },
                { $group: { _id: "$_id", loginCount: { $sum: "$login" }, attemptCount: { $sum: "$login" }, neverLoginCount: { $sum: "$neverLogin" } } }
            ])

            return {
                response: 'Ok'
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getTestSeriesAttemptTrendBySubject(request: GetTestSeriesAttemptTrendBySubjectReq) {
        try {
            if (!request.subject || !ObjectId.isValid(request.subject) || !request.passingYear) {
                throw new Error("Not found")
            }

            let sIds = await this.usersRepository.distinct('_id', {
                roles: "student",
                isActive: true,
                locations: new ObjectId(request.locId),
                passingYear: request.passingYear
            })

            let attemptFilter = {
                $expr: { $eq: ["$practicesetId", "$$pid"] },
                user: { $in: sIds },
                isAbandoned: false,
                location: new ObjectId(request.locId)
            }

            if (request.days) {
                (attemptFilter as any).createdAt = { $gt: timeHelper.lastDays(Number(request.days)) }
            }

            let result = await this.testseriesRepository.aggregate([
                {
                    $match: {
                        "subjects._id": new ObjectId(request.subject),
                        status: "published",
                        locations: new ObjectId(request.locId),
                    }
                },
                { $unwind: "$practiceIds" },
                {
                    $lookup: {
                        from: "attempts",
                        let: { pid: "$practiceIds" },
                        pipeline: [
                            {
                                $match: attemptFilter
                            },
                            { $project: { totalTime: 1, user: 1, practicesetId: 1 } },
                            { $group: { _id: { user: "$user", practice: "$practicesetId" }, timeSpent: { $sum: "$totalTime" } } },
                            { $group: { _id: "$_id.practice", students: { $sum: 1 }, timeSpent: { $sum: "$timeSpent" } } },
                        ],
                        as: "attempts"
                    }
                },
                { $unwind: "$attempts" },
                {
                    $project: {
                        timeSpent: "$attempts.timeSpent", title: 1, students: "$attempts.students"
                    }
                }, {
                    $group: { _id: "$_id", students: { $sum: "$students" }, timeSpent: { $sum: "$timeSpent" }, title: { $first: "$title" } }
                },
                { $project: { title: 1, students: 1, avgSpentTime: { $cond: [{ $eq: ["$students", 0] }, 0, { $divide: ["$timeSpent", "$students"] }] } } },
                { $group: { _id: null, students: { $push: "$students" }, avgTimes: { $push: "$avgSpentTime" }, labels: { $push: "$title" } } }
            ])

            return {
                ...result[0]
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }
}