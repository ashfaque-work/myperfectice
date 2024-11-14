import { AttemptRepository, globals } from "@app/common";
import { GetStudentLevelTestReq } from "@app/common/dto/sqlAnalysis.dto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions";

@Injectable()

export class SqlAnalysisService {
    constructor(private readonly attemptRepository: AttemptRepository) { }

    async getStudentLevelTest(request: GetStudentLevelTestReq): Promise<any> {
        try {
            if (!request.query.practice) {
                return { message: "Pass practiceSet id in query parameters." };
            }
            if (request.query.practice.length != 24) {
                return { message: "PracticeSet id is not of proper format." };
            }

            const practiceset = new Types.ObjectId(request.query.practice);
            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { practicesetId: practiceset, isAbandoned: false } },
                globals.lookup, globals.unw, globals.add, globals.pro,
                { $project: { user: 1, percent: { $multiply: [{ $divide: ["$totalMark", "$maximumMarks"] }, 100] }, _id: 0 } },
                {
                    $project: {
                        user: 1,
                        percent: 1,
                        level: {
                            $cond: [{ $gt: ["$percent", 90] }, 5, {
                                $cond: [{ $and: [{ $gt: ["$percent", 70] }, { $lte: ["$percent", 90] }] }, 4,
                                {
                                    $cond: [{ $and: [{ $gt: ["$percent", 50] }, { $lte: ["$percent", 70] }] }, 3,
                                    { $cond: [{ $and: [{ $gt: ["$percent", 30] }, { $lte: ["$percent", 50] }] }, 2, 1] }
                                    ]
                                }
                                ]
                            }]
                        }
                    }
                },
                { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userD" } },
                { $unwind: "$userD" },
                { $project: { "user.userId": "$userD.userId", "user.userName": "$userD.name", level: 1, _id: 0 } },
                { $group: { _id: "$level", users: { $push: "$user" } } },
                { $project: { level: "$_id", users: 1, _id: 0 } },
                { $sort: { level: 1 } }
            ]);

            if (!result) {
                throw new NotFoundException();
            }

            return { result };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getSubjectPerformersTest(request: GetStudentLevelTestReq): Promise<any> {
        try {
            if (!request.query.practice) {
                return { message: "Pass practiceSet id in query parameters." };
            }
            if (request.query.practice.length != 24) {
                return { message: "PracticeSet id is not of proper format." };
            }

            const practiceset = new Types.ObjectId(request.query.practice);
            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { practicesetId: practiceset, isAbandoned: false } },
                globals.lookup, globals.unw, globals.add, globals.pro,
                { $unwind: "$QA" },
                { $project: { user: 1, actualMarks: "$QA.actualMarks", obtainMarks: "$QA.obtainMarks", status: "$QA.status", "subject._id": "$QA.subject._id", "subject.name": "$QA.subject.name", _id: 0 } },
                { $group: { _id: { user: "$user", subject: "$subject" }, totalMarks: { $sum: "$obtainMarks" }, maxMarks: { $sum: "$actualMarks" } } },
                { $project: { user: "$_id.user", subject: "$_id.subject", percent: { $divide: ["$totalMarks", { $sum: ["$maxMarks", 1] }] }, _id: 0 } },
                { $match: { percent: { $gt: 0.8 } } },
                { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userD" } },
                { $unwind: "$userD" },
                { $project: { userId: "$userD.userId", userName: "$userD.name", percent: { $multiply: ["$percent", 100] }, subject: "$subject.name" } },
                { $sort: { subject: 1, percent: -1 } }
            ]);

            if (!result) {
                throw new NotFoundException();
            }

            return { result };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getSubjectNonPerformersTest(request: GetStudentLevelTestReq): Promise<any> {
        try {
            if (!request.query.practice) {
                return { message: "Pass practiceSet id in query parameters." };
            }
            if (request.query.practice.length != 24) {
                return { message: "PracticeSet id is not of proper format." };
            }

            const practiceset = new Types.ObjectId(request.query.practice);
            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { practicesetId: practiceset, isAbandoned: false } },
                globals.lookup, globals.unw, globals.add, globals.pro,
                { $unwind: "$QA" },
                { $project: { user: 1, actualMarks: "$QA.actualMarks", obtainMarks: "$QA.obtainMarks", status: "$QA.status", "subject._id": "$QA.subject._id", "subject.name": "$QA.subject.name", _id: 0 } },
                { $group: { _id: { user: "$user", subject: "$subject" }, totalMarks: { $sum: "$obtainMarks" }, maxMarks: { $sum: "$actualMarks" } } },
                { $project: { user: "$_id.user", subject: "$_id.subject", percent: { $multiply: [{ $divide: ["$totalMarks", { $sum: ["$maxMarks", 1] }] }, 100] }, _id: 0 } },
                { $match: { percent: { $lte: 30.0 } } },
                { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userD" } },
                { $unwind: "$userD" },
                { $project: { userId: "$userD.userId", userName: "$userD.name", percent: 1, subject: "$subject.name" } },
                { $sort: { subject: 1, percent: 1 } }
            ]);

            if (!result) {
                throw new NotFoundException();
            }

            return { result };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getPoorTopicsTest(request: GetStudentLevelTestReq): Promise<any> {
        try {
            if (!request.query.practice) {
                return { message: "Pass practiceSet id in query parameters." };
            }
            if (request.query.practice.length != 24) {
                return { message: "PracticeSet id is not of proper format." };
            }

            const practiceset = new Types.ObjectId(request.query.practice);
            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { practicesetId: practiceset, isAbandoned: false } },
                globals.lookup, globals.unw, globals.add, globals.pro,
                { $unwind: "$QA" },
                { $project: { actualMarks: "$QA.actualMarks", obtainMarks: "$QA.obtainMarks", status: "$QA.status", "subject._id": "$QA.subject._id", "subject.name": "$QA.subject.name", "topic._id": "$QA.topic._id", "topic.name": "$QA.topic.name", _id: 0 } },
                { $group: { _id: { subject: "$subject", topic: "$topic" }, totalMarks: { $sum: "$obtainMarks" }, maxMarks: { $sum: "$actualMarks" } } },
                { $project: { subject: "$_id.subject.name", topic: "$_id.topic.name", percent: { $multiply: [{ $divide: ["$totalMarks", "$maxMarks"] }, 100] }, _id: 0 } },
                { $match: { percent: { $lte: 30.0 } } },
                { $sort: { percent: 1 } }
            ]);

            if (!result) {
                throw new NotFoundException();
            }

            return { result };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getAbsenteeListTest(): Promise<any> {
        return { message: "Yet to be completed.." };
    }

    async getPercentAbsentTest(): Promise<any> {
        return { message: "Yet to be completed.." };
    }

    async getAbandoned1stTest(request: GetStudentLevelTestReq): Promise<any> {
        try {
            if (!request.query.practice) {
                return { message: "Pass practiceSet id in query parameters." };
            }
            if (request.query.practice.length != 24) {
                return { message: "PracticeSet id is not of proper format." };
            }

            const practiceset = new Types.ObjectId(request.query.practice);
            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { practicesetId: practiceset } },
                { $project: { user: 1, isAbandoned: 1, createdAt: 1, _id: 0 } },
                { $sort: { createdAt: 1 } },
                { $group: { _id: "$user", first: { $first: "$isAbandoned" } } },
                { $match: { first: true } },
                { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userD" } },
                { $unwind: "$userD" },
                { $project: { userId: "$userD.userId", userName: "$userD.name", _id: 0 } }
            ]);

            if (!result) {
                throw new NotFoundException();
            }

            return { result };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getPercentAbandonedTest(request: GetStudentLevelTestReq): Promise<any> {
        try {
            if (!request.query.practice) {
                return { message: "Pass practiceSet id in query parameters." };
            }
            if (request.query.practice.length != 24) {
                return { message: "PracticeSet id is not of proper format." };
            }

            const practiceset = new Types.ObjectId(request.query.practice);
            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { practicesetId: practiceset } },
                { $project: { user: 1, isAbandoned: 1, _id: 0 } },
                { $group: { _id: null, abandoned: { $addToSet: { $cond: [{ $eq: ["$isAbandoned", true] }, "$user", null] } }, notAbandoned: { $addToSet: "$user" } } },
                { $project: { percentage: { $trunc: { $multiply: [{ $divide: [{ $size: "$abandoned" }, { $size: "$notAbandoned" }] }, 100] } }, _id: 0 } }
            ]);

            if (!result) {
                throw new NotFoundException();
            }

            return { result };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getStudentLevelGrade(request: GetStudentLevelTestReq): Promise<any> {
        try {
            if (!request.query.subject) {
                return { message: "Pass subject id in query parameters." };
            }
            if (request.query.subject.length != 24) {
                return { message: "Subject id is not of proper format." };
            }

            const subjectId = new Types.ObjectId(request.query.subject);
            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { "practiceSetInfo.subjects._id": subjectId, isAbandoned: false } },
                globals.lookup, globals.unw, globals.add, globals.pro,
                { $project: { user: 1, percent: { $multiply: [{ $divide: ["$totalMark", "$maximumMarks"] }, 100] }, _id: 0 } },
                {
                    $project: {
                        user: 1,
                        percent: 1,
                        level: {
                            $cond: [{ $gt: ["$percent", 90] }, 5, {
                                $cond: [{ $and: [{ $gt: ["$percent", 70] }, { $lte: ["$percent", 90] }] }, 4,
                                {
                                    $cond: [{ $and: [{ $gt: ["$percent", 50] }, { $lte: ["$percent", 70] }] }, 3,
                                    { $cond: [{ $and: [{ $gt: ["$percent", 30] }, { $lte: ["$percent", 50] }] }, 2, 1] }
                                    ]
                                }
                                ]
                            }]
                        }
                    }
                },
                { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userD" } },
                { $unwind: "$userD" },
                { $project: { "user.userId": "$userD.userId", "user.userName": "$userD.name", level: 1, _id: 0 } },
                { $group: { _id: "$level", users: { $push: "$user" } } },
                { $project: { level: "$_id", users: 1, _id: 0 } },
                { $sort: { level: 1 } }
            ]);

            if (!result) {
                throw new NotFoundException();
            }

            return { result };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getSubjectPerformersGrade(request: GetStudentLevelTestReq): Promise<any> {
        try {
            if (!request.query.subject) {
                return { message: "Pass subject id in query parameters." };
            }
            if (request.query.subject.length != 24) {
                return { message: "Subject id is not of proper format." };
            }

            const subjectId = new Types.ObjectId(request.query.subject);
            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { "practiceSetInfo.subjects._id": subjectId, isAbandoned: false } },
                globals.lookup, globals.unw, globals.add, globals.pro,
                { $unwind: "$QA" },
                { $project: { user: 1, actualMarks: "$QA.actualMarks", obtainMarks: "$QA.obtainMarks", status: "$QA.status", "subject._id": "$QA.subject._id", "subject.name": "$QA.subject.name", _id: 0 } },
                { $group: { _id: { user: "$user", subject: "$subject" }, totalMarks: { $sum: "$obtainMarks" }, maxMarks: { $sum: "$actualMarks" } } },
                { $project: { user: "$_id.user", subject: "$_id.subject", percent: { $divide: ["$totalMarks", { $sum: ["$maxMarks", 1] }] }, _id: 0 } },
                { $match: { percent: { $gt: 0.8 } } },
                { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userD" } },
                { $unwind: "$userD" },
                { $project: { userId: "$userD.userId", userName: "$userD.name", percent: { $multiply: ["$percent", 100] }, subject: "$subject.name" } },
                { $sort: { subject: 1, percent: -1 } }
            ]);

            if (!result) {
                throw new NotFoundException();
            }

            return { result };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getSubjectNonPerformersGrade(request: GetStudentLevelTestReq): Promise<any> {
        try {
            if (!request.query.subject) {
                return { message: "Pass subject id in query parameters." };
            }
            if (request.query.subject.length != 24) {
                return { message: "Subject id is not of proper format." };
            }

            const subjectId = new Types.ObjectId(request.query.subject);
            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { "practiceSetInfo.subjects._id": subjectId, isAbandoned: false } },
                globals.lookup, globals.unw, globals.add, globals.pro,
                { $unwind: "$QA" },
                { $project: { user: 1, actualMarks: "$QA.actualMarks", obtainMarks: "$QA.obtainMarks", status: "$QA.status", "subject._id": "$QA.subject._id", "subject.name": "$QA.subject.name", _id: 0 } },
                { $group: { _id: { user: "$user", subject: "$subject" }, totalMarks: { $sum: "$obtainMarks" }, maxMarks: { $sum: "$actualMarks" } } },
                { $project: { user: "$_id.user", subject: "$_id.subject", percent: { $multiply: [{ $divide: ["$totalMarks", { $sum: ["$maxMarks", 1] }] }, 100] }, _id: 0 } },
                { $match: { percent: { $lte: 30.0 } } },
                { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userD" } },
                { $unwind: "$userD" },
                { $project: { userId: "$userD.userId", userName: "$userD.name", percent: 1, subject: "$subject.name" } },
                { $sort: { subject: 1, percent: 1 } }
            ]);

            if (!result) {
                throw new NotFoundException();
            }

            return { result };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getPoorTopicsGrade(request: GetStudentLevelTestReq): Promise<any> {
        try {
            if (!request.query.subject) {
                return { message: "Pass subject id in query parameters." };
            }
            if (request.query.subject.length != 24) {
                return { message: "Subject id is not of proper format." };
            }

            const subjectId = new Types.ObjectId(request.query.subject);
            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { "practiceSetInfo.subjects._id": subjectId, isAbandoned: false } },
                globals.lookup, globals.unw, globals.add, globals.pro,
                { $unwind: "$QA" },
                { $project: { actualMarks: "$QA.actualMarks", obtainMarks: "$QA.obtainMarks", status: "$QA.status", "subject._id": "$QA.subject._id", "subject.name": "$QA.subject.name", "topic._id": "$QA.topic._id", "topic.name": "$QA.topic.name", _id: 0 } },
                { $group: { _id: { subject: "$subject", topic: "$topic" }, totalMarks: { $sum: "$obtainMarks" }, maxMarks: { $sum: "$actualMarks" } } },
                { $project: { subject: "$_id.subject.name", topic: "$_id.topic.name", percent: { $multiply: [{ $divide: ["$totalMarks", "$maxMarks"] }, 100] }, _id: 0 } },
                { $match: { percent: { $lte: 30.0 } } },
                { $sort: { percent: 1 } }
            ]);

            if (!result) {
                throw new NotFoundException();
            }

            return { result };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getMarksSummaryGrade(request: GetStudentLevelTestReq): Promise<any> {
        try {
            if (!request.query.subject) {
                return { message: "Pass subject id in query parameters." };
            }
            if (request.query.subject.length != 24) {
                return { message: "Subject id is not of proper format." };
            }

            const subjectId = new Types.ObjectId(request.query.subject);
            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { "practiceSetInfo.subjects._id": subjectId, isAbandoned: false } },
                globals.lookup, globals.unw, globals.add, globals.pro,
                { $unwind: "$QA" },
                { $project: { actualMarks: "$QA.actualMarks", obtainMarks: "$QA.obtainMarks", status: "$QA.status", "subject._id": "$QA.subject._id", "subject.name": "$QA.subject.name", _id: 0 } },
                { $group: { _id: { subject: "$subject" }, totalMarks: { $sum: "$obtainMarks" }, maxMarks: { $sum: "$actualMarks" } } },
                { $project: { subject: "$_id.subject.name", percent: { $multiply: [{ $divide: ["$totalMarks", { $sum: ["$maxMarks", 1] }] }, 100] }, _id: 0 } },
                { $sort: { subject: 1 } }
            ]);

            if (!result) {
                throw new NotFoundException();
            }

            return { result };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getStudentLevelSummaryGrade(request: GetStudentLevelTestReq): Promise<any> {
        try {
            if (!request.query.subject) {
                return { message: "Pass subject id in query parameters." };
            }
            if (request.query.subject.length != 24) {
                return { message: "Subject id is not of proper format." };
            }

            const subjectId = new Types.ObjectId(request.query.subject);
            this.attemptRepository.setInstanceKey(request.instancekey)
            const result = await this.attemptRepository.aggregate([
                { $match: { "practiceSetInfo.subjects._id": subjectId, isAbandoned: false } },
                { $project: { user: 1, "practiceset._id": "$practicesetId", "practiceset.title": "$practiceSetInfo.title", percent: { $multiply: [{ $divide: ["$totalMark", { $sum: ["$maximumMarks", 1] }] }, 100] }, _id: 0 } },
                {
                    $project: {
                        user: 1,
                        percent: 1,
                        practiceset: 1,
                        level: {
                            $cond: [{ $gt: ["$percent", 90] }, 5, {
                                $cond: [{ $and: [{ $gt: ["$percent", 70] }, { $lte: ["$percent", 90] }] }, 4,
                                {
                                    $cond: [{ $and: [{ $gt: ["$percent", 50] }, { $lte: ["$percent", 70] }] }, 3,
                                    { $cond: [{ $and: [{ $gt: ["$percent", 30] }, { $lte: ["$percent", 50] }] }, 2, 1] }
                                    ]
                                }
                                ]
                            }]
                        }
                    }
                },
                {
                    $group: {
                        _id: { practiceset: "$practiceset" },
                        doubleAccel: { $sum: { $cond: [{ $eq: ["$level", 5] }, 1, 0] } },
                        accelerated: { $sum: { $cond: [{ $eq: ["$level", 4] }, 1, 0] } },
                        advance: { $sum: { $cond: [{ $eq: ["$level", 3] }, 1, 0] } },
                        onlevel: { $sum: { $cond: [{ $eq: ["$level", 2] }, 1, 0] } },
                        belowAvg: { $sum: { $cond: [{ $eq: ["$level", 1] }, 1, 0] } }
                    }
                },
                { $project: { testName: "$_id.practiceset.title", doubleAccel: 1, accelerated: 1, advance: 1, onlevel: 1, belowAvg: 1, _id: 0 } },
                { $sort: { testName: 1 } }
            ]);

            if (!result) {
                throw new NotFoundException();
            }

            return { result };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getStudentByComplexityGrade(): Promise<any> {
        return { message: "Yet to be completed.." };
    }
}
