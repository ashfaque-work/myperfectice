import { PracticeSetRepository,  UsersRepository, ClassroomRepository, RedisCaching, regexName, SessionManagementRepository } from '@app/common';
import { CreateSessionRequest, FilterTestListsRequest, GetPracticesBySessionRequest, GetSessionByIdRequest, GetSessionDetailsRequest, GetSessionsRequest, GetStudentsByPracticeRequest, TestStatusRequest, UpdateSessionRequest, UpdateStudentStatusRequest } from '@app/common/dto/question-bank.dto';
import { BadRequestException, Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import timeHelper from '@app/common/helpers/time-helper';
import * as _ from 'lodash';

@Injectable()
export class SessionService {
    constructor(
        private readonly practiceSetRepository: PracticeSetRepository,
        private readonly usersRepository: UsersRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly sessionManagementRepository: SessionManagementRepository,
        private readonly redisCache: RedisCaching,
    ) { }

    // sort not used in old code code that's why not here also
    async filterTestLists(req: FilterTestListsRequest) {
        try {
            if (!req.query.selectedSubjects) {
                throw new BadRequestException();
            }
            var page = (req.query.page) ? req.query.page : 1
            var limit = (req.query.limit) ? req.query.limit : 20
            var sort: any = {
                pinTop: -1, // descending
                statusChangedAt: -1 // descending
            };

            if (req.query.sort) {
                const [sortField, sortOrder] = req.query.sort.split(',');
                sort = { pinTop: -1, [sortField]: sortOrder === 'descending' ? -1 : 1 };
            }

            var subjects = req.query.selectedSubjects.split(',').map(item => new ObjectId(item))
            var skip = req.query.skip ? req.query.skip : (page - 1) * limit

            var filter: any = {
                status: { $in: ['draft', 'published'] },
                testMode: 'proctored',
                accessMode: 'invitation',
                'subjects._id': { $in: subjects }
            }

            if (req.user.roles.includes('admin')) {
                filter.locations = new ObjectId(req.user.activeLocation)
            }

            if (req.query.tags) {
                var tags = []
                req.query.tags.split(',').forEach((t) => {
                    tags.push(t)
                    tags.push(t.toLowerCase())
                })

                filter.tags = {
                    $in: tags
                }
            }
            if (req.query.searchText) {
                var regexText = regexName(req.query.searchText)
                filter.title = regexText;
            }

            this.practiceSetRepository.setInstanceKey(req.instancekey);
            var testCount = await this.practiceSetRepository.countDocuments(filter)

            var tests = await this.practiceSetRepository.aggregate([{
                $match: filter
            },
            { $sort: { title: 1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    subjects: 1,
                    status: 1,
                    classRooms: 1,
                    totalQuestion: 1,
                    totalTime: 1,
                    units: 1, testMode: 1,
                    instructions: 1,
                    description: 1,
                    accessMode: 1,
                    startDate: 1,
                    expiresOn: 1,
                    questionsToDisplay: 1,
                    isAdaptive: 1, user: 1,
                    testType: 1

                }
            }
            ])

            return { tests: tests, count: testCount ? testCount : 0 }
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getSessions(req: GetSessionsRequest) {
        try {
            let selectedSlot = new Date(req.query.selectedSlot);
            // const start = selectedSlot.setHours(0, 0, 0, 0);
            // const end = selectedSlot.setHours(23, 59, 59, 999)

            let start = timeHelper.getStartOfDate(selectedSlot, req.timezoneoffset)
            let end = timeHelper.getEndOfDate(selectedSlot, req.timezoneoffset)

            let match: any = {
                $and: [
                    {
                        startDate: { $gte: start }
                    },
                    {
                        startDate: { $lt: end }
                    }
                ]
            }
            if (req.user.roles.includes('admin')) {
                match.location = new ObjectId(req.user.activeLocation)
            }

            if (req.query.selectedSlot) {
                this.sessionManagementRepository.setInstanceKey(req.instancekey);
                const aggregate = await this.sessionManagementRepository.aggregate([
                    {
                        $match: match
                    },

                    { $unwind: "$practiceIds" },
                    {
                        $lookup: {
                            from: "practicesets",
                            localField: "practiceIds",
                            foreignField: "_id",
                            as: "p"
                        }
                    },
                    { $unwind: "$p" },
                    {
                        $project: {
                            _id: 1,
                            title: "$title",
                            classRooms: "$p.classRooms",
                            practiceId: "$p._id",
                            loginAllowanceTime: 1,
                            startDate: 1,
                            totalTime: 1,
                            deactivateRemainingStudents: 1,
                            classroomCount: { $size: "$p.classRooms" }

                        }
                    },
                    { $unwind: "$classRooms" },
                    {
                        $lookup: {
                            from: "classrooms",
                            localField: "classRooms",
                            foreignField: "_id",
                            as: "c"
                        }
                    },
                    { $unwind: "$c" },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            loginAllowanceTime: 1,
                            deactivateRemainingStudents: 1,
                            startDate: 1,
                            totalTime: 1,
                            clsStud: { $size: "$c.students" },
                            classroomId: "$c._id",
                            practiceId: 1,
                            classroomCount: 1,
                            clsStudents: "$c.students",

                        }
                    },
                    { $unwind: "$clsStudents" },
                    {
                        $lookup: {
                            from: "users",
                            localField: "clsStudents.studentId",
                            foreignField: "_id",
                            as: "s"
                        }
                    },
                    { $unwind: "$s" },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            loginAllowanceTime: 1,
                            deactivateRemainingStudents: 1,
                            startDate: 1,
                            totalTime: 1,
                            clsStud: 1,
                            classroomId: 1,
                            practiceId: 1,
                            studentId: "$s._id",
                            studentStatus: "$s.isActive",
                            classroomCount: 1,

                        }
                    },
                    {
                        $group: {
                            _id: { classroomId: "$classroomId", practiceId: "$practiceId", sessionId: "$_id" },
                            sessionId: { $first: "$_id" },
                            clsStudents: { $first: "$clsStud" },
                            loginAllowanceTime: { $first: "$loginAllowanceTime" },
                            deactivateRemainingStudents: { $first: "$deactivateRemainingStudents" },
                            startDate: { $first: "$startDate" },
                            totalTime: { $first: "$totalTime" },
                            classroomCount: { $first: "$classroomCount" },
                            title: { $first: "$title" },
                            practiceId: { $first: "$practiceId" },
                            studentActive: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: ["$studentStatus", true]
                                        },
                                        1,
                                        0]
                                }
                            },
                            studentInactive: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: ["$studentStatus", false]
                                        },
                                        1,
                                        0]
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: { practiceId: "$practiceId", sessionId: "$sessionId" },
                            totalStudents: { $sum: "$clsStudents" },
                            classroomCount: { $first: "$classroomCount" },
                            title: { $first: "$title" },
                            sessionId: { $first: "$sessionId" },
                            studentActive: { $first: "$studentActive" },
                            studentInactive: { $first: "$studentInactive" },
                            deactivateRemainingStudents: { $first: "$deactivateRemainingStudents" },
                            loginAllowanceTime: { $first: "$loginAllowanceTime" },
                            startDate: { $first: "$startDate" },
                            totalTime: { $first: "$totalTime" },
                            practiceCount: { $sum: 1 },
                        }
                    },
                    {
                        $group: {
                            _id: { sessionId: "$sessionId" },
                            totalStudents: { $sum: "$totalStudents" },
                            classroomCount: { $sum: "$classroomCount" },
                            title: { $first: "$title" },
                            studentActive: { $sum: "$studentActive" },
                            studentInactive: { $sum: "$studentInactive" },
                            loginAllowanceTime: { $first: "$loginAllowanceTime" },
                            startDate: { $first: "$startDate" },
                            totalTime: { $first: "$totalTime" },
                            deactivateRemainingStudents: { $first: "$deactivateRemainingStudents" },
                            practiceCount: { $sum: 1 }
                        }
                    }
                ])


                return { response: aggregate };

            } else {
                throw new GrpcInternalException('Please select data and time to activate/deactivate session')
            }
        } catch (error) {
            Logger.error(error)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getSessionById(req: GetSessionByIdRequest) {
        try {
            if (req.session) {
                this.sessionManagementRepository.setInstanceKey(req.instancekey);
                var session = await this.sessionManagementRepository.findById(new ObjectId(req.session), null,
                    { populate: { path: 'practiceIds', select: ' _id title subjects status classRooms totalQuestion totalTime' }, lean: true })
                if (!session) {
                    throw new NotFoundException('No session Found');
                }

                return session;

            } else {
                throw new BadRequestException('No session Found');
            }
        } catch (error) {
            Logger.error(error)
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error.message);
            } else if (error instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(error.message);
            }

            throw new GrpcInternalException('Internal Server Error')
        }
    }

    async getSessionDetails(req: GetSessionDetailsRequest) {
        try {
            this.sessionManagementRepository.setInstanceKey(req.instancekey);
            var aggregate = await this.sessionManagementRepository.aggregate([
                {
                    $match: {
                        _id: new ObjectId(req.session)
                    }
                },

                { $unwind: "$practiceIds" },
                {
                    $lookup: {
                        from: "practicesets",
                        localField: "practiceIds",
                        foreignField: "_id",
                        as: "p"
                    }
                },
                { $unwind: "$p" },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        loginAllowanceTime: 1,
                        createdAt: 1,
                        classRooms: "$p.classRooms",
                        testStatus: "$p.status",
                        practiceId: "$p._id",
                        pQues: "$p.totalQuestion",
                        classroomCount: { $size: "$p.classRooms" }

                    }
                },
                { $unwind: "$classRooms" },
                {
                    $lookup: {
                        from: "classrooms",
                        localField: "classRooms",
                        foreignField: "_id",
                        as: "c"
                    }
                },
                { $unwind: "$c" },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        loginAllowanceTime: 1,
                        createdAt: 1,
                        clsStud: { $size: "$c.students" },
                        testStatus: 1,
                        practiceId: 1,
                        pQues: 1,
                        classroomCount: 1

                    }
                },
                {
                    $group: {
                        _id: { practiceId: "$practiceId" },
                        sessionId: { $first: "$_id" },
                        totalQuestion: { $first: "$pQues" },
                        totalStudents: { $sum: "$clsStud" },
                        classroomCount: { $first: "$classroomCount" },
                        title: { $first: "$title" },
                        createdAt: { $first: "$createdAt" },
                        loginAllowanceTime: { $first: "$loginAllowanceTime" },
                        published: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: ["$testStatus", 'published']
                                    },
                                    1,
                                    0]
                            }
                        },
                        draft: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: ["$testStatus", 'draft']
                                    },
                                    1,
                                    0]
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: { sessionId: "$sessionId" },
                        totalQuestion: { $sum: "$totalQuestion" },
                        totalStudents: { $sum: "$totalStudents" },
                        classroomCount: { $sum: "$classroomCount" },
                        title: { $first: "$title" },
                        createdAt: { $first: "$createdAt" },
                        loginAllowanceTime: { $first: "$loginAllowanceTime" },
                        published: {
                            $sum: "$published"
                        },
                        draft: {
                            $sum: "$draft"
                        }
                    }
                }
            ])

            return { response: aggregate };
        } catch (error) {
            Logger.error(error)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getPracticesBySession(req: GetPracticesBySessionRequest) {
        try {
            this.sessionManagementRepository.setInstanceKey(req.instancekey)
            var aggregate = await this.sessionManagementRepository.aggregate([
                {
                    $match: {
                        _id: new ObjectId(req.session)
                    }
                },

                { $unwind: "$practiceIds" },
                {
                    $lookup: {
                        from: "practicesets",
                        localField: "practiceIds",
                        foreignField: "_id",
                        as: "p"
                    }
                },
                { $unwind: "$p" },
                {
                    $project: {
                        _id: 1,
                        title: "$p.title",
                        classRooms: "$p.classRooms",
                        subjects: "$p.subjects",
                        testStatus: "$p.status",
                        practiceId: "$p._id",
                        pQues: "$p.totalQuestion",
                        status: "$p.status",
                        classroomCount: { $size: "$p.classRooms" }

                    }
                },
                { $unwind: "$classRooms" },
                {
                    $lookup: {
                        from: "classrooms",
                        localField: "classRooms",
                        foreignField: "_id",
                        as: "c"
                    }
                },
                { $unwind: "$c" },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        loginAllowanceTime: 1,
                        clsStud: { $size: "$c.students" },
                        classroomName: "$c.name",
                        classroomId: "$c._id",
                        classroomActive: "$c.active",
                        testStatus: 1,
                        practiceId: 1,
                        pQues: 1,
                        status: 1,
                        subjects: 1,
                        classroomCount: 1,
                        clsStudents: "$c.students",
                    }
                },
                { $unwind: "$clsStudents" },
                {
                    $lookup: {
                        from: "users",
                        localField: "clsStudents.studentId",
                        foreignField: "_id",
                        as: "s"
                    }
                },
                { $unwind: "$s" },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        loginAllowanceTime: 1,
                        clsStud: 1,
                        classroomName: 1,
                        classroomId: 1,
                        classroomActive: 1,
                        testStatus: 1,
                        practiceId: 1,
                        pQues: 1,
                        status: 1,
                        subjects: 1,
                        studentId: "$s._id",
                        "studentName": "$s.name",
                        studentStatus: "$s.isActive",
                        classroomCount: 1,
                    }
                },
                {
                    $group: {
                        _id: { classroomId: "$classroomId", practiceId: "$practiceId" },
                        sessionId: { $first: "$_id" },
                        totalQuestion: { $first: "$pQues" },
                        clsStudents: { $first: "$clsStud" },
                        classroomActive: { $first: "$classroomActive" },
                        status: { $first: "$status" },
                        subjects: { $first: "$subjects" },
                        classroomCount: { $first: "$classroomCount" },
                        title: { $first: "$title" },
                        practiceId: { $first: "$practiceId" },
                        classroomName: { $first: "$classroomName" },
                        studentActive: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: ["$studentStatus", true]
                                    },
                                    1,
                                    0]
                            }
                        },
                        studentInactive: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: ["$studentStatus", false]
                                    },
                                    1,
                                    0]
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: { practiceId: "$practiceId" },
                        totalQuestion: { $first: "$totalQuestion" },
                        totalStudents: { $sum: "$clsStudents" },
                        classroomCount: { $first: "$classroomCount" },
                        status: { $first: "$status" },
                        subjects: { $first: "$subjects" },
                        title: { $first: "$title" },
                        classroom: {
                            $push: {
                                classroomId: "$_id.classroomId", classroomName: "$classroomName", studentActive: "$studentActive",
                                studentInactive: "$studentInactive", classroomActive: "$classroomActive"
                            }
                        }
                    }
                },
            ])

            return { response: aggregate };
        } catch (error) {
            Logger.error(error)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getStudentsByPractice(req: GetStudentsByPracticeRequest) {
        try {
            if (req.query.practiceId) {
                const page = req.query.page || 1;
                const limit = req.query.limit || 20;

                this.sessionManagementRepository.setInstanceKey(req.instancekey);
                var aggregate = await this.sessionManagementRepository.aggregate([
                    {
                        $match: {
                            _id: new ObjectId(req.session)
                        }
                    },

                    { $unwind: "$practiceIds" },
                    {
                        $lookup: {
                            from: "practicesets",
                            localField: "practiceIds",
                            foreignField: "_id",
                            as: "p"
                        }
                    },
                    { $unwind: "$p" },
                    {
                        $project: {
                            _id: 1,
                            title: "$p.title",
                            classRooms: "$p.classRooms",
                            subjects: "$p.subjects",
                            testStatus: "$p.status",
                            practiceId: "$p._id",
                            pQues: "$p.totalQuestion",
                            status: "$p.status",
                            classroomCount: { $size: "$p.classRooms" }

                        }
                    },
                    { $unwind: "$classRooms" },
                    {
                        $lookup: {
                            from: "classrooms",
                            localField: "classRooms",
                            foreignField: "_id",
                            as: "c"
                        }
                    },
                    { $unwind: "$c" },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            loginAllowanceTime: 1,
                            clsStud: { $size: "$c.students" },
                            classroomName: "$c.name",
                            classroomId: "$c._id",
                            testStatus: 1,
                            practiceId: 1,
                            pQues: 1,
                            status: 1,
                            subjects: 1,
                            classroomCount: 1,
                            clsStudents: "$c.students",
                        }
                    },
                    { $unwind: "$clsStudents" },
                    {
                        $lookup: {
                            from: "users",
                            localField: "clsStudents.studentId",
                            foreignField: "_id",
                            as: "s"
                        }
                    },
                    { $unwind: "$s" },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            loginAllowanceTime: 1,
                            clsStud: 1,
                            classroomName: 1,
                            classroomId: 1,
                            testStatus: 1,
                            practiceId: 1,
                            pQues: 1,
                            status: 1,
                            subjects: 1,
                            studentId: "$s._id",
                            "studentName": "$s.name",
                            "studentUserId": "$s.userId",
                            "avatar": "$s.avatar",
                            studentStatus: "$s.isActive",
                            classroomCount: 1,
                        }
                    },
                    {
                        $group: {
                            _id: { studentId: "$studentId", classroomId: "$classroomId" },
                            sessionId: { $first: "$_id" },
                            studentId: { $first: "$studentId" },
                            clsStudents: { $first: "$clsStud" },
                            studentName: { $first: "$studentName" },
                            avatar: { $first: "$avatar" },
                            studentUserId: { $first: "$studentUserId" },
                            studentStatus: { $first: "$studentStatus" },
                            title: { $first: "$title" },
                            practiceId: { $first: "$practiceId" },
                            classroomName: { $first: "$classroomName" },
                            classroomId: { $first: "$classroomId" },
                        }
                    },
                    {
                        $match: {
                            practiceId: new ObjectId(req.query.practiceId)
                        }
                    },
                    { $sort: { studentName: -1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit }

                ])

                return { response: aggregate };
            } else {
                throw new NotFoundException('No Session Found');
            }

        } catch (error) {
            Logger.error(error)
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error.message);
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async updateStudentStatus(req: UpdateStudentStatusRequest) {
        try {
            if (req.body.classroom) {
                //Manage classroom
                this.classroomRepository.setInstanceKey(req.instancekey);
                await this.classroomRepository.updateOne({
                    _id: new ObjectId(req.body.classroom)
                }, {
                    $set: {
                        active: req.body.active
                    }
                })
                this.classroomRepository.setInstanceKey(req.instancekey);
                let userIds = await this.classroomRepository.distinct('students.studentId',
                    {
                        _id: { $in: new ObjectId(req.body.classroom) }
                    })

                //Manage User
                this.usersRepository.setInstanceKey(req.instancekey);
                let student = await this.usersRepository.updateMany({
                    role: 'student', _id: { $in: userIds }
                }, {
                    $set: {
                        isActive: req.body.active
                    }
                })

                return student
            } else if (req.body.student) {
                this.usersRepository.setInstanceKey(req.instancekey);
                let student = await this.usersRepository.updateOne({
                    role: 'student', _id: new ObjectId(req.body.student)
                }, {
                    $set: {
                        isActive: req.body.isActive
                    }
                })

                return student
            } else {
                throw new BadRequestException();
            }
        } catch (error) {
            Logger.error(error)
            if (error instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(error.message);
            }

            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async testStatus(req: TestStatusRequest) {
        try {
            if (req.practiceId && req.query.totalTime) {
                let start = new Date(new Date().getTime() - (Number(req.query.totalTime) * 60 * 1000))
                let end = new Date(new Date().getTime() + (Number(req.query.totalTime) * 60 * 1000))
                this.sessionManagementRepository.setInstanceKey(req.instancekey)
                var found = await this.sessionManagementRepository.find({ practiceIds: { $in: [new ObjectId(req.practiceId)] } }, { _id: 1, practiceIds: 1 });

                return { response: found };
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

    async createSession(req: CreateSessionRequest) {
        try {
            let data = _.assign(req.body, {
                user: new ObjectId(req.user._id)
            })

            let sessionQuery: any = { title: req.body.title }
            if (!req.user.roles.includes('admin')) {
                sessionQuery.location = new ObjectId(req.user.activeLocation)
            }
            this.sessionManagementRepository.setInstanceKey(req.instancekey);
            const sess = await this.sessionManagementRepository.findOne(sessionQuery, { _id: 1 }, { lean: true });

            if (sess) {
                throw new UnprocessableEntityException("This session name already exists.");
            }

            if (req.body.title) {
                req.body.title = req.body.title.replace(/ {1,}/g, " ");
            }

            const practiceSetUpdate = {
                startDate: new Date(data.startDate)
            }

            for (let p of data.practiceIds) {
                let testQuery: any = {
                    _id: p,
                    accessMode: "invitation",
                    testMode: "proctored"
                }

                if (req.user.roles.includes('director')) {
                    testQuery.locations = new ObjectId(req.user.activeLocation)
                }

                this.practiceSetRepository.setInstanceKey(req.instancekey);
                let test = await this.practiceSetRepository.findOneAndUpdate(testQuery, { $set: practiceSetUpdate }, { new: true });

                let classQuery: any = {
                    _id: { $in: test.classRooms }
                }

                if (req.user.roles.includes('director')) {
                    classQuery.location = new ObjectId(req.user.activeLocation)
                }
                this.classroomRepository.setInstanceKey(req.instancekey);
                let userIds = await this.classroomRepository.distinct('students.studentId', classQuery);

                let userQuery: any = { role: 'student', _id: { $nin: userIds } }

                if (req.user.roles.includes('director')) {
                    userQuery.locations = new ObjectId(req.user.activeLocation)
                }

                //Manage User
                this.usersRepository.setInstanceKey(req.instancekey);
                await this.usersRepository.updateMany(userQuery, {
                    $set: {
                        isActive: !data.deactivateRemainingStudents
                    }
                })
            }

            data.user = new ObjectId(req.user._id)
            if (!req.user.roles.includes('admin')) {
                data.location = new ObjectId(req.user.activeLocation)
            }

            this.sessionManagementRepository.setInstanceKey(req.instancekey);
            var session = await this.sessionManagementRepository.create(data, { lean: true });

            return session
        } catch (error) {
            Logger.error(error);
            if (error instanceof UnprocessableEntityException) {
                throw new GrpcInternalException(error.message);
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async updateSession(req: UpdateSessionRequest) {
        try {            
            if (req.body.title) {
                req.body.title = req.body.title.replace(/ {1,}/g, " ");
            }
            var filter = {
                _id: new ObjectId(req.id)
            }
            var data = req.body
            this.sessionManagementRepository.setInstanceKey(req.instancekey);
            const session = await this.sessionManagementRepository.findOne(filter)

            if (!session) {
                throw new NotFoundException();
            }

            const documents = await this.sessionManagementRepository.findOneAndUpdate({ _id: session._id },
                { $set: data }, { new: true })

            const practiceSetUpdate = {
                camera: data.camera,
                plusMark: data.plusMark,
                minusMark: data.minusMark,
                isMarksLevel: data.isMarksLevel,
                startTimeAllowance: data.startTimeAllowance,
                randomQuestions: data.randomQuestions,
                randomizeAnswerOptions: data.randomizeAnswerOptions,
                requireAttendance: data.requireAttendance,
                autoEvaluation: data.autoEvaluation,
                isShowAttempt: data.isShowAttempt,
                isShowResult: data.isShowResult,
                allowTeacher: data.allowTeacher,
                showFeedback: data.showFeedback,
                offscreenLimit: data.offscreenLimit,
                attemptAllowed: data.attemptAllowed,
                startDate: new Date(data.startDate),
                totalTime: data.totalTime || 0
            }

            for (let p of data.practiceIds) {
                let testQuery: any = {
                    _id: new ObjectId(p),
                    accessMode: "invitation",
                    testMode: "proctored"
                }

                if (req.user.roles.includes('director')) {
                    testQuery.locations = new ObjectId(req.user.activeLocation)
                }

                this.practiceSetRepository.setInstanceKey(req.instancekey);
                let test = await this.practiceSetRepository.findOneAndUpdate(testQuery, { $set: practiceSetUpdate }, { new: true })

                if (test.status == 'published') {
                    await this.redisCache.globalDelAsync(req.instancekey + test._id + ',key=findOneWithQuestionsAccessMode')
                    await this.redisCache.globalDelAsync(req.instancekey + test._id + ',key=findOneWithQuestionsAccessMode_meta')
                    await this.redisCache.globalDelAsync(req.instancekey + '_test_unit_count_' + test._id)
                    await this.redisCache.globalDelAsync(req.instancekey + '_summaryTopicPractice_' + test._id)
                }

                let classQuery: any = {
                    _id: { $in: test.classRooms }
                }

                if (req.user.roles.includes('director')) {
                    classQuery.location = new ObjectId(req.user.activeLocation)
                }

                this.classroomRepository.setInstanceKey(req.instancekey);
                let userIds = await this.classroomRepository.distinct('students.studentId', classQuery)

                let userQuery: any = { role: 'student', _id: { $nin: userIds } }

                if (req.user.roles.includes('director')) {
                    userQuery.locations = new ObjectId(req.user.activeLocation)
                }

                //Manage User
                this.usersRepository.setInstanceKey(req.instancekey);
                await this.usersRepository.updateMany(userQuery, {
                    $set: {
                        isActive: !data.deactivateRemainingStudents
                    }
                })
            }

            return documents;
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }
}