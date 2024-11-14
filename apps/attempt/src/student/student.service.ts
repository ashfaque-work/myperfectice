import {
    AttemptRepository, AttemptSubmissionRepository, AttendanceRepository, ClassroomRepository, Constants,
    DiscussionRepository, EventBus, FavoriteRepository, KhanAcademyRepository, MappingRepository, PracticeSetRepository,
    PsychoResultRepository, RedisCaching, Settings, SocketClientService, TestSeriesRepository, UserCourseRepository,
    UserEnrollmentRepository, UsersRepository, escapeRegex, fetchVideos, globals, isEmail, objectIndexOf,
    regexName
} from "@app/common";
import {
    AddMentorReq, AverageAttemptRequest, CountAttemptsRequest, CountStudentAttemptsRequest, ExportProfileReq,
    GetAccuracyAndSpeedByTopicRequest, GetAccuracyAndSpeedRequest, GetAttemptRequest, GetAttemptsRequest,
    GetAverageTimeOnPlatformRequest, GetAwsFaceRegSignedUrlRequest, GetBestAttemptRequest, GetClassroomsReq,
    GetEffortTrendAttemptCountRequest, GetEffortTrendAttemptTotalTimeRequest, GetEffortTrendCourseTimeSpentRequest,
    GetGroupParticipationRequest, GetLastStudentAttemptRequest, GetLearningEffortsDistributionRequest, GetMarkRankingReq,
    GetMentorsReq, GetPersistanceDataRequest, GetRecommendedTestsRequest, GetRecommendedVideosReq, GetResultPracticeRequest,
    GetStudentAttemptsRequest, GetSubjectQuestionComplexityRequest, GetSubjectwiseRankingReq, GetSummaryByNumberRequest,
    GetTextualAnalysisRequest, GetTopperSummaryByNumberRequest, GetTotalQuestionSolvedRequest, RemoveMentorReq,
    GetUniqueQuestionsCountRequest, GetUserAssetsSignedUrlRequest, QuestionCategoryDistributionRequest,
    SendInvitationReq, SummaryAttemptedPracticeRequest, SummaryAttemptedTestSeriesReq, SummaryOnePracticeSetRequest,
    SummaryPsychoPracticeRequest, GetStudentAttemptRequest, GetSubjectWiseSpeedAndAccuracyRequest, FindAllRequest,
    GetRecordingsSignedUrlRequest,
    GetQrUploadSignedUrlRequest,
} from "@app/common/dto/student.dto";
import {
    ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnprocessableEntityException
} from "@nestjs/common";
import { Types } from "mongoose";
import { _ } from 'lodash'
import { config } from "@app/common/config";
import { S3Service } from "@app/common/components/aws/s3.service";
import { GrpcInternalException, GrpcNotFoundException, GrpcUnauthenticatedException } from "nestjs-grpc-exceptions";
import { WhiteboardService } from "@app/common/components/whiteboard/whiteboard.service";
import { MessageCenter } from "@app/common/components/messageCenter";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom } from "rxjs";
import { AxiosError, AxiosResponse } from "axios";
import slugify from "slugify";
import { ObjectId } from "mongodb";

var checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$')
@Injectable()

export class StudentService {
    constructor(
        private readonly attemptRepository: AttemptRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly practicesetRespository: PracticeSetRepository,
        private readonly attendanceRepository: AttendanceRepository,
        private readonly favoriteRepository: FavoriteRepository,
        private readonly userRepository: UsersRepository,
        private readonly userCourseRepository: UserCourseRepository,
        private readonly discussionRepository: DiscussionRepository,
        private readonly redisCaching: RedisCaching,
        private readonly psychoResultRepository: PsychoResultRepository,
        private readonly attemptSubmissionRepository: AttemptSubmissionRepository,
        private readonly userEnrollmentRepository: UserEnrollmentRepository,
        private readonly testSeriesRepository: TestSeriesRepository,
        private readonly mappingRepository: MappingRepository,
        private readonly khanAcademyRepository: KhanAcademyRepository,
        private readonly practiceSetRepository: PracticeSetRepository,
        private readonly s3Service: S3Service,
        private readonly socketClientService: SocketClientService,
        private readonly whiteboardService: WhiteboardService,
        private readonly messageCenter: MessageCenter,
        private readonly httpService: HttpService,
        private readonly eventBus: EventBus,
        private readonly settings: Settings
    ) { }

    //Internal Fucntions - End
    async checkMentee(req: any, studentId: string) {
        this.userRepository.setInstanceKey(req.instancekey)
        let student = await this.userRepository.findOne({
            _id: new Types.ObjectId(studentId)
        })
        return student
    }

    async findOneAttempt(req: any, filter?: any, sortQ?: any) {
        try {
            this.attemptRepository.setInstanceKey(req.instancekey);
            var attempt = await this.attemptRepository.findOne(filter, null, { sort: sortQ ? sortQ : {} })

            attempt = await this.attemptRepository.populate(attempt, [
                {
                    path: 'attemptdetails',
                    select: '-_id QA',
                    options: { lean: true }
                }, {
                    path: 'user',
                    select: 'name role avatar',
                    options: { lean: true }
                }
            ],
            )
            if (!attempt) {
                return attempt;
            }
            attempt = this.removeAttemptDetails(attempt);
            this.practicesetRespository.setInstanceKey(req.instancekey)
            let practiceSetObj: any = await this.practicesetRespository.findById(attempt.practicesetId)

            attempt.practiceSetInfo.enableMarks = practiceSetObj.enableMarks
            attempt.practiceSetInfo.isShowResult = practiceSetObj.isShowResult
            attempt.practiceSetInfo.isShowAttempt = practiceSetObj.isShowAttempt
            attempt.practiceSetInfo.testMode = practiceSetObj.testMode

            attempt.practiceSetInfo.totalQuestion = practiceSetObj.totalQuestion
            attempt.practiceSetInfo.totalTime = practiceSetObj.totalTime
            attempt.practiceSetInfo.attemptAllowed = practiceSetObj.attemptAllowed
            attempt.practiceSetInfo.sectionTimeLimit = practiceSetObj.sectionTimeLimit

            attempt.practiceSetInfo.user = practiceSetObj.userInfo
            attempt.practiceSetInfo._id = practiceSetObj._id
            attempt.practiceSetInfo.questions = practiceSetObj.questions
            attempt.practiceSetInfo.sections = practiceSetObj.sections
            attempt.practiceSetInfo.status = practiceSetObj.status
            attempt.practiceSetInfo.expiresOn = practiceSetObj.expiresOn
            attempt.practiceSetInfo.fullLength = practiceSetObj.fullLength
            attempt.practiceSetInfo.enableSection = practiceSetObj.enableSection

            if (practiceSetObj.course) {
                attempt.practiceSetInfo.course = practiceSetObj.course
            }
            if (practiceSetObj.testseries) {
                attempt.practiceSetInfo.testseries = practiceSetObj.testseries
            }


            if (!attempt.isEvaluated) {
                // check in attempt submission
                this.attemptSubmissionRepository.setInstanceKey(req.instancekey)
                let submission = await await this.attemptSubmissionRepository.findOne({ attemptId: attempt._id, status: { $ne: 'processed' } })
                if (submission && submission.data) {
                    attempt.totalQuestions = practiceSetObj.totalQuestion
                    attempt.totalMissed = attempt.QA.filter(q => q.status == Constants.MISSED).length
                    attempt.totalTime = attempt.QA.reduce((val, qa) => val + qa.timeEslapse, 0)
                }
            }

            if (req.user && req.user.roles.includes('student')) {
                if (!practiceSetObj.isShowAttempt || !attempt.isEvaluated || !practiceSetObj.isShowResult) {
                    attempt.practiceSetInfo.questions = []
                    attempt.QA = []
                    return attempt
                }
            }

            this.attendanceRepository.setInstanceKey(req.instancekey)
            let att = await this.attendanceRepository.findOne({ practicesetId: attempt.practicesetId, studentId: attempt.user?._id })
            
            if (att) {
                attempt.practiceSetInfo.attendance = {
                    attemptLimit: att.attemptLimit,
                    offscreenLimit: att.offscreenLimit
                }
            }

            return attempt
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw new GrpcUnauthenticatedException(error.message);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    getAttemptFilter(req, user) {
        var filter: any = [{
            ongoing: { $ne: true }
        }]
        var lastDate: any = new Date()

        if (req.query.lastDay) {
            lastDate = lastDate.setTime(req.query.lastDay)
            filter.push({
                createdAt: {
                    $gte: new Date(lastDate)
                }
            })
        }
        if (req.query.onlyDay) {
            var onlyDay: any = new Date()
            onlyDay = lastDate.setTime(req.query.onlyDay)
            filter.push({
                createdAt: {
                    $lte: new Date(onlyDay)
                }
            })
        }

        if (req.query.keyword) {
            var regexText = {
                $regex: new RegExp(escapeRegex(req.query.keyword), 'i')
            }
            filter.push({
                $or: [{
                    'practiceSetInfo.title': regexText
                }, {
                    'createdBy.name': regexText
                }]
            })
        }
        if (req.query.publiser) {
            var publiser = _.compact(req.query.publiser.split(','))
            publiser = publiser.map(id => new Types.ObjectId(id))
            filter.push({
                'createdBy.user': {
                    $in: publiser
                }
            })
        }
        if (req.query.subjects) {
            var subjects = _.compact(req.query.subjects.split(','))
            subjects = subjects.map(id => new Types.ObjectId(id))
            filter.push({
                'practiceSetInfo.subjects._id': {
                    $in: subjects
                }
            })
        } else if (user && user.subjects) {
            let subjects = user.subjects.map(id => new Types.ObjectId(id))
            filter.push({
                'practiceSetInfo.subjects._id': {
                    $in: subjects
                }
            })
        }

        if (req.query.unit) {
            var unit = _.compact(req.query.unit.split(','))
            unit = unit.map(id => new Types.ObjectId(id))
            filter.push({
                'practiceSetInfo.unit._id': {
                    $in: unit
                }
            })
        }
        if (req.query.practice) {
            filter.push({
                practicesetId: new Types.ObjectId(req.query.practice)
            })
        }

        return filter
    }

    removeAD(doc) {
        if (doc?.attemptdetails)
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

    removeAttemptDetails(docs: any) {
        if (Array.isArray(docs)) {
            for (var i = 0; i < docs.length; i++) {
                docs[i] = this.removeAD(docs[i])
            }
        } else {
            docs = this.removeAD(docs)
        }

        return docs
    }

    private calculatePercentile(attempt: any, allAttempts: any[]): any {
        var listPercentMax = {};
        var belowNumber = 0;
        var sameNumber = 0;
        var total = 0;

        allAttempts.forEach(item => {
            if (!item.isAbandoned && item._id != attempt._id) {
                if (!listPercentMax[item.user]) {
                    listPercentMax[item.user] = item.pecentCorrects;
                } else if (listPercentMax[item.user] <= item.pecentCorrects) {
                    listPercentMax[item.user] = item.pecentCorrects;
                }
            }
        })

        let percentiteList: any = Object.values(listPercentMax)

        percentiteList.push(attempt.pecentCorrects)

        percentiteList.sort(function (a: any, b: any) {
            return (a - b)
        });

        var accuracys = [...percentiteList];
        var temp = percentiteList;
        var fixed = percentiteList.map((item) => item.toFixed(2));
        var current = attempt.accuracyPercent;

        for (var j in percentiteList) {
            if (attempt.pecentCorrects > percentiteList[j]) {
                belowNumber = belowNumber + 1;
            }
            if (attempt.pecentCorrects == percentiteList[j]) {
                sameNumber = sameNumber + 1;
            }
            total++;
        }

        if (total == 0) {
            total = 1;
            sameNumber = 1;
        }
        var percentlite = Number((((belowNumber + (0.5 * sameNumber)) / total) * 100).toFixed(2));

        return {
            percentlite,
            accuracys,
            temp,
            current,
            fixed
        };
    }

    private createMatch(obj: any): any {
        var keys = Object.keys(obj)
        var newObject = {}
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].indexOf('QA') + 1) {
                newObject[keys[i]] = obj[keys[i]]
                delete obj[keys[i]]
            }
        }
        return newObject
    }

    conditionSummary(req: any, withOutSubjectCondition?) {
        var condition: any = {};
        if (req.query.lastDay) {
            var lastDate: Date = new Date();
            lastDate = new Date(lastDate.setTime(req.query.lastDay));
            condition.createdAt = {
                $gte: new Date(lastDate)
            }
        }

        if (req.query.subjects) {
            var subjects = req.subjects.split(",");
            var Objectsubjects = subjects.map((id) => new Types.ObjectId(id))
            condition["QA.subject._id"] = {
                $in: Objectsubjects,
            }
        }
        condition.isAbandoned = false;
        return condition
    }

    async baseFilter(req: any) {
        var accessMode: any = {
            $or: [{
                accessMode: 'public'
            }, {
                accessMode: 'buy'
            }]
        }

        var expire = {
            $or: [{
                expiresOn: {
                    $gt: new Date()
                }
            }, {
                expiresOn: null
            }, {
                expiresOn: ''
            }]
        }

        var basicFilter: any = {
            $and: [accessMode, expire]
        }

        if (!req.user || !req.user.userId) {
            return basicFilter
        }
        this.classroomRepository.setInstanceKey(req.instancekey)
        let classIds = await this.classroomRepository.distinct('_id', {
            'students.studentUserId': req.user.userId,
            active: true
        })
        if (!classIds.length) {
            basicFilter.$and.push({ locations: new Types.ObjectId(req.user.activeLocation) })
            return basicFilter;
        }
        this.attendanceRepository.setInstanceKey(req.instancekey)
        let testIds = await this.attendanceRepository.distinct('practicesetId', {
            studendId: new Types.ObjectId(req.user._id),
            active: true,
            admitted: true,
            classId: {
                $in: classIds
            }
        })

        var invitationFilter = {
            $and: [{
                accessMode: 'invitation'
            },
            {
                classRooms: {
                    $in: classIds
                }
            }, {
                $or: [
                    {
                        requireAttendance: {
                            $exists: false
                        }
                    },
                    {
                        requireAttendance: false
                    },
                    {
                        $and: [
                            {
                                $or: [
                                    {
                                        startDate: null
                                    }, {
                                        startDate: {
                                            $gt: new Date()
                                        }
                                    }
                                ]
                            },
                            {
                                _id: {
                                    $in: testIds
                                }
                            }
                        ]
                    }
                ]
            }
            ]
        }
        accessMode.$or.push(invitationFilter)

        var locFilter = { locations: new Types.ObjectId(req.user.activeLocation) }

        return {
            $and: [accessMode, locFilter, expire]
        }
    }

    async getPracticeset(req: GetRecommendedTestsRequest, condition, sort, skip, limit) {
        try {
            if (condition['subjects'] && condition['subjects'] != null && condition['subjects'].$in.length <= 0) {
                delete condition['subjects']
            }
            condition.status = 'published';
            condition.accessMode = {
                $ne: 'buy'
            }


            var projection = {}

            if (req.query.home) {
                projection = {
                    'totalTime': 1,
                    'totalQuestion': 1,
                    'questionsToDisplay': 1,
                    'subjects': 1,
                    'testCode': 1,
                    'title': 1,
                    'accessMode': 1,
                    'testMode': 1,
                    'colorCode': 1,
                    'imageUrl': 1,
                    'countries': 1
                }
            } else {
                projection = {
                    'totalTime': 1,
                    'user': 1,
                    'totalQuestion': 1,
                    'questionsToDisplay': 1,
                    'rating': 1,
                    'updatedAt': 1,
                    'createdAt': 1,
                    'totalJoinedStudent': 1,
                    'expiresOn': 1,
                    'statusChangedAt': 1,
                    'status': 1,
                    'attemptAllowed': 1,
                    'notes': 1,
                    'plusMark': 1,
                    'minusMark': 1,
                    'enableMarks': 1,
                    'isMarksLevel': 1,
                    'instructions': 1,
                    'studentEmails': 1,
                    'classRooms': 1,
                    'inviteeEmails': 1,
                    'description': 1,
                    'titleLower': 1,
                    'title': 1,
                    'accessMode': 1,
                    'subjects': 1,
                    'units': 1,
                    'userInfo': 1,
                    'isShowResult': 1,
                    'testCode': 1,
                    'inviteePhones': 1,
                    'isShowAttempt': 1,
                    'totalAttempt': 1,
                    'questions': 1,
                    'testMode': 1,
                    'colorCode': 1,
                    'imageUrl': 1,
                    'countries': 1
                }
            }
            if (req.query.sort) {
                const [sortField, sortOrder] = req.query.sort.split(',');
                sort = sortOrder === 'descending' ? { [sortField]: -1 } : { [sortField]: 1 };

            } else {
                sort = { 'statusChangedAt': -1 }
            }

            var subjects = req.user.subjects.map(id => new Types.ObjectId(id))
            condition['subjects._id'] = {
                $in: subjects
            }

            let andFilter: any = await this.baseFilter(req);

            condition.$and = andFilter.$and
            this.practicesetRespository.setInstanceKey(req.instancekey)
            let practicesets = await this.practicesetRespository.aggregate([
                {
                    $match: condition
                },
                {
                    $project: projection
                },
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ])

            if (req.query.testOnly) {
                return practicesets
            }

            practicesets = await Promise.all(practicesets.map(async (practiceset) => {
                const oPractice: any = practiceset;

                if (!req.user) {
                    oPractice.isFavorite = false;
                    return oPractice;
                }
                this.favoriteRepository.setInstanceKey(req.instancekey)
                const favorite = await this.favoriteRepository.findOne({
                    user: new ObjectId(req.user._id),
                    practiceSet: oPractice._id
                })

                oPractice.isFavorite = favorite !== null;
                return oPractice;
            }))

            return practicesets

        } catch (err) {
            console.log(err);
            throw "Internal Server error"
        }
    }

    private async getTestUnAttempted(req: any, filter: any): Promise<string[]> {
        try {
            this.attemptRepository.setInstanceKey(req.instancekey)
            const attempts = await this.attemptRepository.find({
                user: new ObjectId(req.user._id),
                isAbandoned: false
            });
            if (attempts && attempts.length > 0) {
                const unattemptedTests = attempts.map(attempt => attempt.practicesetId);
                return unattemptedTests;
            } else {
                return [];
            }
        } catch (err) {
            throw new InternalServerErrorException();
        }
    }

    private async getTestPurchase(req: any, filter: any) {
        try {
            const ids = await this.getPracticesInTestseriesAndCourses(req, 'buy');
            var practiceBuy = []
            if (ids && ids.length) {
                practiceBuy = ids
            }
            return practiceBuy;
        } catch (err) {
            throw new InternalServerErrorException();
        }
    }

    private async getPracticesInTestseriesAndCourses(req: any, accessMode: string) {
        var query: any = {
            user: new ObjectId(req.user._id),
            type: { $in: ['testseries', 'course'] },
            $or: [{
                expiresOn: {
                    $gt: new Date()
                }
            }, {
                expiresOn: null
            }],
            location: new ObjectId(req.user.activeLocation)
        }

        if (accessMode) {
            query.accessMode = accessMode
        }

        this.userEnrollmentRepository.setInstanceKey(req.instancekey);
        const details: any = await this.userEnrollmentRepository.aggregate([
            {
                $match: query
            }, {
                $lookup: {
                    from: 'courses',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'course'
                }
            }, {
                $unwind: { path: '$course', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'testseries',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'testseries'
                }
            },
            {
                $unwind: { path: '$testseries', preserveNullAndEmptyArrays: true }
            }
        ]);
        let ids = []
        for (let dt of details) {
            if (dt.testseries) {
                ids = ids.concat(dt.testseries.practiceIds)
            } else if (dt.course) {
                for (let sec of dt.course.sections) {
                    ids = ids.concat(sec.contents.filter(c => c.type == 'assessment').map(c => c.source))
                }
            }
        }

        if (ids.length > 0) {
            return ids;
        } else {
            return;
        }
    }

    private async getTestAttempted(req: any, filter: any) {
        try {
            this.attemptRepository.setInstanceKey(req.instancekey)
            var attempts = await this.attemptRepository.find({
                user: new Types.ObjectId(req.user._id),
                isAbandoned: false
            });

            attempts = await this.attemptRepository.populate(attempts, {
                path: 'attemptdetails',
                select: '-_id QA'
            });

            const practiceTest = [];
            const uniq = {};

            if (attempts && attempts.length > 0) {
                for (const attempt of attempts) {
                    if (!uniq[attempt.practicesetId]) {
                        uniq[attempt.practicesetId] = true;
                        practiceTest.push(new Types.ObjectId(attempt.practicesetId));
                    }
                }
                return practiceTest;
            } else {
                return filter;
            }

        } catch (err) {
            throw new InternalServerErrorException();
        }
    }

    private async getMyFavorite(req: any) {
        this.favoriteRepository.setInstanceKey(req.instancekey)
        const practiceSets = await this.favoriteRepository.find({
            user: new Types.ObjectId(req.user._id),
            location: new Types.ObjectId(req.user.activeLocation)
        }, {
            practiceSet: 1,
            _id: 0
        })
        return practiceSets.map(t => t.practiceSet)
    }

    private async gradeHistoryFilter(req: any): Promise<any> {
        const filter: any = {};
        const conditionOr: any = { $or: [] };

        try {
            if (req.query.attempted && req.query.multi) {
                const testAttempted = await this.getTestAttempted(req, filter);
                const filterAttempted = {
                    _id: { $in: _.uniq(testAttempted) },
                };
                conditionOr.$or.push(filterAttempted);
            }

            if (req.query.multi && req.query.unattempted) {
                const testUnAttempted = await this.getTestUnAttempted(req, filter);
                const filterUnAttempted = {
                    _id: { $nin: _.uniq(testUnAttempted) },
                };
                conditionOr.$or.push(filterUnAttempted);
            }

            if (req.query.purchase && req.query.multi) {
                const testPurchase = await this.getTestPurchase(req, filter);
                const filterBuy = {
                    _id: { $in: testPurchase },
                };
                conditionOr.$or.push(filterBuy);
            }

            if (req.query.showFavoriteOnly && req.query.multi) {
                const favoritesTest = await this.getMyFavorite(req);
                const filterFavorite = {
                    _id: { $in: favoritesTest },
                };
                conditionOr.$or.push(filterFavorite);
            }

            if (req.user.roles.includes('student')) {
                filter.status = 'published';
            }

            if (req.query.publiser) {
                const users = req.query.publiser.split(',').map(u => new Types.ObjectId(u));
                if (users.length > 0) {
                    filter.user = { $in: users };
                }
            }

            if (req.query.new) {
                const filterByNew = {
                    _id: { $nin: req.user.practiceViews.map(pv => new ObjectId(pv)) },
                };
                if (req.query.multi) {
                    conditionOr.$or.push(filterByNew);
                }
            }

            if (req.query.multi && req.query.invitation) {
                conditionOr.$or.push({ accessMode: 'invitation' });
            }

            if (req.query.multi && req.query.nonPaid) {
                conditionOr.$or.push({ accessMode: 'public' });
            }

            if (req.query.multi && req.query.buy) {
                conditionOr.$or.push({ accessMode: 'buy' });
            }

            if (req.query.units) {
                const units = req.query.units.split(',').map(s => new Types.ObjectId(s));
                if (units.length > 0) {
                    filter['units._id'] = { $in: units };
                }
            }

            if (req.query.subjects) {
                const subjects = req.query.subjects.split(',').map(s => new Types.ObjectId(s));
                filter['subjects._id'] = { $in: subjects };
            }

            if (req.query.rejectBuy) {
                filter.accessMode = { $ne: 'buy' };
            }

            let finalFilter = filter;

            if (conditionOr.$or.length > 0) {
                finalFilter = {
                    $and: [filter, conditionOr],
                };
            }

            if (req.query.title) {
                const search: any = {};
                const regexText = {
                    $regex: new RegExp(escapeRegex(req.query.title), 'i'),
                };

                search.$or = [
                    { title: regexText },
                    { 'subjects.name': regexText },
                    { 'units.name': regexText },
                    { testMode: regexText },
                ];

                if (finalFilter.$and) {
                    finalFilter.$and.push(search);
                } else {
                    finalFilter = {
                        $and: [filter, search],
                    };
                }
            }

            return finalFilter;
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    private async filterForGuest(req: any): Promise<{ filterAnd: any[], filterGroup: any }> {
        const filterAnd = [];
        const filterGroup: any = {};
        const filterOr = [];
        const expiresOnFilter = {
            $gt: new Date(),
        };
        const filterExpires = {
            $or: [
                { expiresOn: expiresOnFilter },
                { expiresOn: null },
                { expiresOn: '' },
            ],
        };

        filterGroup.$and = [];
        filterAnd.push({
            accessMode: { $ne: 'invitation' },
        });

        if (req.query.attempted && !req.query.unattempted) {
            if (req.query.multi) {
                filterOr.push({ _id: { $in: [] } });
            }
        }

        if (req.query.purchase && ((!req.query.invitation && !req.query.nonPaid && !req.query.buy) || req.query.multi)) {
            if (!req.query.multi) {
                filterAnd.push({ _id: { $in: [] } });
                filterAnd.push({ accessMode: 'buy' });
            } else {
                filterOr.push({ _id: { $in: [] } });
            }
        }

        if (req.query.buy && ((!req.query.invitation && !req.query.nonPaid && !req.query.purchase) || req.query.multi)) {
            if (!req.query.multi) {
                filterAnd.push({ accessMode: 'buy' });
            } else {
                filterOr.push({ accessMode: 'buy' });
            }
        }

        if (req.query.invitation && req.query.multi) {
            filterOr.push({ _id: { $in: [] } });
        }

        if (req.query.showFavoriteOnly) {
            if (!req.query.multi) {
                filterAnd.push({ _id: { $in: [] } });
            } else {
                filterOr.push({ _id: { $in: [] } });
            }
        }

        if (req.query.new) {
            filterOr.push({ user: { $ne: null } });
            filterGroup.$and.push({ user: { $ne: null } });
        }

        filterAnd.push({ status: 'published' });

        if (req.query.nonPaid) {
            const nonPass = {
                accessMode: { $nin: ['buy', 'invitation'] },
            };
            if (!req.query.multi && (!req.query.invitation && !req.query.buy)) {
                filterAnd.push(nonPass);
            } else {
                filterOr.push(nonPass);
            }
        }

        if (req.query.publiser) {
            const $users = req.query.publiser.split(',');
            filterAnd.push({ 'user': { $in: $users } });
            filterGroup.$and.push({ 'user': { $in: $users } });
        }

        filterAnd.push(filterExpires);
        filterGroup.$and.push(filterExpires);

        if (req.query.title) {
            const regexText = regexName(req.query.title);
            const filterTitle = {
                $or: [{ title: regexText }],
            };
            filterAnd.push(filterTitle);
            filterGroup.$and.push(filterTitle);
        }

        if (req.query.unit) {
            const filterByUnit = {
                'units._id': { $in: req.query.unit.split(',') },
            };
            filterAnd.push(filterByUnit);
            filterGroup.$and.push(filterByUnit);
        }

        if (req.query.subjects) {
            const filterBySubjects = {
                'subjects._id': { $in: req.query.subjects.split(',') },
            };
            filterAnd.push(filterBySubjects);
            filterGroup.$and.push(filterBySubjects);
        }

        if (req.query.rejectBuy) {
            const filterRejectBuy = {
                accessMode: { $ne: 'buy' },
            };
            filterAnd.push(filterRejectBuy);
            filterGroup.$and.push(filterRejectBuy);
        }

        if (req.query.multi && filterOr.length > 0) {
            filterAnd.push({ $or: filterOr });
        }

        return { filterAnd, filterGroup };
    }

    private async getAvaiableTestFilter(req: any): Promise<{ filter: any; filterGroup: any }> {
        try {
            const filters: { filter: any; filterGroup: any } = req.user
                ? await this.gradeHistoryFilter(req)
                : await this.filterForGuest(req);
            return filters;
        } catch (error) {
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    private async getPracticeSetTests(getStrData: any, sort: any, skip: number, limit: number, page: number, request: any, filter: any) {
        try {
            const settings = await this.redisCaching.getSetting({ instancekey: request.instancekey }, function (settings: any) {
                return settings;
            })

            let project: any = {};
            if (request.query.home) {
                project = {
                    $project: {
                        colorCode: 1,
                        totalQuestion: 1,
                        imageUrl: 1,
                        status: 1,
                        title: 1,
                        accessMode: 1,
                        subjects: 1,
                        testCode: 1,
                        totalTime: 1,
                        testMode: 1,
                        pinTop: 1,
                        statusChangedAt: 1,
                        titleLower: 1,
                        countries: 1,
                    },
                };
            } else {
                project = {
                    $project: {
                        user: 1,
                        totalQuestion: 1,
                        rating: 1,
                        updatedAt: 1,
                        createdAt: 1,
                        totalJoinedStudent: 1,
                        expiresOn: 1,
                        statusChangedAt: 1,
                        status: 1,
                        attemptAllowed: 1,
                        notes: 1,
                        plusMark: 1,
                        minusMark: 1,
                        enableMarks: 1,
                        isMarksLevel: 1,
                        instructions: 1,
                        studentEmails: 1,
                        classRooms: 1,
                        inviteeEmails: 1,
                        description: 1,
                        titleLower: 1,
                        title: 1,
                        accessMode: 1,
                        subjects: 1,
                        units: 1,
                        userInfo: 1,
                        totalTime: 1,
                        isShowResult: 1,
                        testCode: 1,
                        inviteePhones: 1,
                        isShowAttempt: 1,
                        totalAttempt: 1,
                        questions: 1,
                        countries: 1,
                        requireAttendance: 1,
                        isAdaptive: 1,
                        questionsToDisplay: 1,
                        slugfly: 1,
                        testType: 1,
                        testMode: 1,
                        pinTop: 1,
                        autoEvaluation: 1,
                        allowStudent: 1,
                        colorCode: 1,
                        imageUrl: 1,
                        partiallyAttempted: 1,
                    },
                };
            }

            getStrData.$or = [{ initiator: 'teacher' }, { $and: [{ initiator: 'student' }, { user: new Types.ObjectId(request.user._id as string) }] }];
            let condition: any = { $match: {} };
            if (request.user.roles.includes('student')) {
                condition = { $match: getStrData };
            }

            const testFilter = { $match: filter };

            if (request.query.sort) {
                const sortQuery = request.query.sort.split(',');
                sort = { pinTop: -1 };
                sort[sortQuery[0]] = sortQuery[1] === '-1' || sortQuery[1] === 'desc' ? -1 : 1;
            } else {
                sort = { pinTop: -1, statusChangedAt: -1 };
            }

            const sortData = { $sort: sort };
            const skipData = { $skip: skip };
            const limitData = { $limit: limit };

            this.practicesetRespository.setInstanceKey(request.instancekey);
            const practiceSets = await this.practicesetRespository.aggregate([condition, testFilter, project, sortData, skipData, limitData]);

            const results = await Promise.all(
                practiceSets.map(async (practiceSet) => {
                    let oPractice: any = practiceSet;

                    if (settings.features.universityExam && oPractice.testMode === 'proctored') {
                        oPractice.slugfly = slugify((oPractice.subjects[0].name + ' - Proctor Exam').replace(/\s+/g, "-"), {
                            lower: true
                        });
                        oPractice.title = oPractice.subjects[0].name + ' - Proctor Exam';
                        if (!request.query.home) {
                            oPractice.titleLower = (oPractice.subjects[0].name + ' - Proctor Exam').toLowerCase();
                        }
                    } else {
                        if (!request.query.home) {
                            oPractice.slugfly = slugify(oPractice.titleLower, {
                                lower: true
                            })
                        }
                    }

                    if (oPractice.accessMode === 'buy') {
                        this.testSeriesRepository.setInstanceKey(request.instancekey);
                        const packageObject = await this.testSeriesRepository.findOne({ practiceIds: { $in: [oPractice._id] } }, null, { lean: true });
                        if (!request.query.home) {
                            oPractice.package = packageObject;
                        }
                    }

                    if (request.user) {
                        this.favoriteRepository.setInstanceKey(request.instancekey);
                        const favorite = await this.favoriteRepository.findOne({ user: new Types.ObjectId(request.user._id as string), practiceSet: oPractice._id }, { lean: true });
                        oPractice.isFavorite = !!favorite;
                    } else {
                        oPractice.isFavorite = false;
                    }

                    oPractice.totalAttempt = await this.countAttemptPractice(request, oPractice);

                    if (request.query.includeLastAttempt) {
                        this.attemptRepository.setInstanceKey(request.instancekey)
                        // Get last attempt
                        const lastAttempt = await this.attemptRepository.findOne({
                            practicesetId: oPractice._id,
                            user: new ObjectId(request.user._id),
                            isLevelReset: false,
                            // , ongoing: { $ne: true }
                        }, {
                            isAbandoned: 1,
                            ongoing: 1,
                        }, { sort: { createdAt: -1 }, lean: true });
                        if (lastAttempt && !request.query.home) {
                            oPractice.lastAttempt = lastAttempt;
                        }
                    }

                    if (oPractice.testType === 'psychometry') {
                        this.psychoResultRepository.setInstanceKey(request.instancekey)
                        const psychoResult = await this.psychoResultRepository.findOne({
                            user: new Types.ObjectId(request.user._id as string),
                            practiceset: oPractice._id,
                        }, null, { sort: { createdAt: -1 }, lean: true });
                        oPractice.psychoAttempted = psychoResult;
                    }

                    return oPractice;
                }),
            );

            this.practicesetRespository.setInstanceKey(request.instancekey);
            const countResult: any = await this.practicesetRespository.aggregate([condition, testFilter, { $count: 'count' }]);
            const count = countResult && countResult[0] ? countResult[0].count : 0;

            await Promise.all(results.map(async (practiceSet) => {
                await this.settings.setPriceByUserCountry(request, practiceSet);
            }));

            return { results: results, count };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    private async countAttemptPractice(req: any, oPractice: any): Promise<number> {
        try {
            var condition: any = {
                practicesetId: oPractice._id,
                isAbandoned: false
            }
            if (req.user && !(req.user.roles.includes('publisher'))) {
                condition.location = new Types.ObjectId(req.user.activeLocation as string)
                this.attemptRepository.setInstanceKey(req.instancekey);
                let result: any = await this.attemptRepository.aggregate([
                    { $match: condition },
                    { $group: { _id: '$user' } },
                    { $count: 'total' }
                ])
                if (result && result.length) {
                    oPractice.totalJoinedStudent = result[0].total
                } else {
                    oPractice.totalJoinedStudent = 0
                }
            }
            this.attemptRepository.setInstanceKey(req.instancekey);
            let count = await this.attemptRepository.countDocuments(condition)

            return count;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
    //Internal Fucntions - End



    async getRecommendedTests(request: GetRecommendedTestsRequest) {
        try {
            var page = (request.query.page) ? request.query.page : 1
            var limit = (request.query.limit) ? request.query.limit : 20

            this.attemptRepository.setInstanceKey(request.instancekey)
            let alreadyAttempt = await this.attemptRepository.distinct('practicesetId', {
                user: new Types.ObjectId(request.user._id)
            })
            let recommended = null

            if (request.query.recommended && request.query.recommended !== "undefined") {
                recommended = _.compact(request.query.recommended.split(',')).map(e => new Types.ObjectId(e))
            }

            var sort: any = { "statusChangedAt": -1 };
            if (request.query.sort) {
                const [sortField, sortOrder] = request.query.sort.split(',');
                sort = sortOrder === 'descending' ? { [sortField]: -1 } : { [sortField]: 1 };
            }

            var skip = (page - 1) * limit;

            var condition: any = {
                testseried: {
                    "$exists": false
                },
                course: {
                    "$exists": false
                }
            }

            if (recommended != null) {
                condition['subjects._id'] = {
                    $in: recommended
                }
            }

            if (alreadyAttempt.length) {
                condition._id = {
                    $nin: alreadyAttempt
                }
            }

            let results = await this.getPracticeset(request, condition, sort, skip, limit)

            return { results }

        } catch (err) {
            console.log(err);
            throw "Internal Server Error"
        }
    }

    async getTakeTestsAgain(request) {
        try {
            var page = (request.query.page) ? request.query.page : 1
            var limit = (request.query.limit) ? request.query.limit : 15

            this.attemptRepository.setInstanceKey(request.instancekey);
            let docs = await this.attemptRepository.find({
                user: new Types.ObjectId(request.user._id)
            }, {
                practicesetId: 1
            })

            var alreadyAttempt = docs.map(d => d.practicesetId)

            var recommended = null;
            if (request.query.recomended && request.query.recomended !== 'undefined') {
                recommended = _.compact(request.query.recomended.split(',')).map(e => new Types.ObjectId(e))
            }

            if (!recommended && !alreadyAttempt.length) {
                return []
            }

            var sort: any = { 'statusChangedAt': -1 }
            if (request.query.sort) {
                const [sortField, sortOrder] = request.query.sort.split(',');
                sort = sortOrder === 'descending' ? { [sortField]: -1 } : { [sortField]: 1 };
            }
            var skip = (page - 1) * limit

            var condition: any = {
                testseries: {
                    "$exists": false
                },
                course: {
                    "$exists": false
                }
            }

            if (alreadyAttempt.length > 0) {
                condition._id = {
                    $in: alreadyAttempt
                }
            }

            if (recommended != null) {
                condition['subjects._id'] = {
                    $in: recommended
                }
            }

            let results = await this.getPracticeset(request, condition, sort, skip, limit)
            return { results }
        } catch (err) {
            console.log(err);
            throw "Internal Server error"
        }
    }

    async getRecommendedVideos(request: GetRecommendedVideosReq): Promise<any> {
        try {
            this.khanAcademyRepository.setInstanceKey(request.instancekey)
            this.mappingRepository.setInstanceKey(request.instancekey)
            let vlist: any = await this.redisCaching.getAsync(request.instancekey, 'khan');

            if (!vlist || vlist.length === 0) {
                vlist = await this.khanAcademyRepository.find({});
                await this.redisCaching.set(request, 'khan', vlist, 60 * 60 * 24)
            }

            const topicList = request.query.topics.split(',');
            const toLoadTopics = [];
            let videos = [];
            const topicVideos = {};

            for (const t of topicList) {
                const khanTopic: any = await this.redisCaching.getAsync(request.instancekey, `khan_topic_${t}`);

                if (khanTopic) {
                    videos = videos.concat(khanTopic.videos);
                } else {
                    topicVideos[t] = {
                        videos: [],
                        mappings: []
                    };
                    toLoadTopics.push(t);
                }
            }

            if (toLoadTopics.length > 0) {
                const mappingsdata = await this.mappingRepository.find({ perfecticeId: { $in: toLoadTopics } });

                for (const mapping of mappingsdata) {
                    const fetchedVideos = fetchVideos(vlist, mapping.providerId, mapping.perfecticeId);
                    topicVideos[mapping.perfecticeId.toString()].videos.push(fetchedVideos);
                    topicVideos[mapping.perfecticeId.toString()].mappings.push(mapping);
                    videos.push(fetchedVideos);
                }

                // Save topicVideo to redis
                for (const t in topicVideos) {
                    await this.redisCaching.set(request.instancekey, `khan_topic_${t}`, topicVideos[t], 60 * 60 * 24);
                }
            }

            return { videos: videos };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAttemptSummary(request: GetTextualAnalysisRequest): Promise<any> {
        try {
            this.khanAcademyRepository.setInstanceKey(request.instancekey)
            this.mappingRepository.setInstanceKey(request.instancekey)
            const page = request.query.page ? request.query.page : 1;
            const limit = request.query.limit ? request.query.limit : 20;
            let sort: any = { 'createdAt': -1 };
            if (request.query.sort) {
                const [sortField, sortOrder] = request.query.sort.split(',');
                sort = sortOrder === 'descending' ? { [sortField]: -1 } : { [sortField]: 1 };
            }

            const skip = (page - 1) * limit;
            const filter = this.getAttemptFilter(request, request.user);

            filter.push({
                $or: [
                    { isShowAttempt: { $exists: false } },
                    { isShowAttempt: null },
                    { isShowAttempt: true },
                ],
            });
            filter.push({ user: new Types.ObjectId(request.user._id) });
            filter.push({ isAbandoned: false });
            filter.push({ isEvaluated: true });

            const attempts = await this.attemptRepository.find(
                { $and: filter }, null,
                { sort, skip, limit },
                [{ path: 'attemptdetails', select: '-_id QA', options: { lean: true } }]
            );

            const docs = this.removeAttemptDetails(attempts);

            return { docs: docs }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    //User: 62962ec9e855ce85473fac84
    async getTextualAnalysis(req: GetTextualAnalysisRequest) {
        try {
            let condition = this.conditionSummary(req, true)
            condition.isShowAttempt = true
            condition.isEvaluated = true
            if (req.query.user) {
                condition.user = new Types.ObjectId(req.query.user)
            } else {
                condition.user = new Types.ObjectId(req.user._id)
            }

            if (req.query.limit) {
                condition.createdAt = { $gte: new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)) }
            }

            var match = {
                $match: condition
            }

            let pipeline = [];
            pipeline.push(
                match,
                globals.lookup,
                globals.unw,
                globals.add,
                globals.pro,
            )
            if (req.query.subjects) {
                pipeline.push(
                    {
                        $match: {
                            "QA.subject._id": new Types.ObjectId(req.query.subjects)
                        }
                    }
                )
            }
            pipeline.push(
                {
                    $unwind: "$QA",
                },
                {
                    $group: {
                        _id: '$QA.topic._id',
                        subjectId: {
                            '$first': '$QA.subject._id'
                        },
                        subjectName: {
                            '$first': '$QA.subject.name'
                        },
                        total: {
                            $sum: 1
                        },
                        name: {
                            '$first': '$QA.topic.name'
                        }
                    }
                }
            )

            this.attemptRepository.setInstanceKey(req.instancekey);
            let results: any = await this.attemptRepository.aggregate(pipeline);
            let subjects = []
            results = await Promise.all(results.map(topicItem => {
                var subExists = subjects.find((s) => {
                    return String(s._id) == String(topicItem.subjectId)
                })
                if (!subExists) {
                    var oSubject: any = {
                        _id: topicItem.subjectId,
                        name: topicItem.subjectName
                    }
                    oSubject.total = topicItem.total
                    subjects.push(oSubject)
                } else {
                    subExists.total += topicItem.total
                }
                return {
                    _id: topicItem._id,
                    name: topicItem.name,
                    total: topicItem.total,
                    subject: topicItem.subjectId
                }
            }))

            return { subjects: subjects }

        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getSummaryByNumber(req: GetSummaryByNumberRequest) {
        try {
            var condition: any = {}
            condition = this.conditionSummary(req)
            delete condition.isAbandoned
            if (req.query.studentId) {
                condition.user = new Types.ObjectId(req.query.studentId)
            } else {
                condition.user = new Types.ObjectId(req.user._id)
            }

            if (req.query.limit) {
                condition.createdAt = {
                    $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                }
            }

            condition.isShowAttempt = true;
            condition.isEvaluated = true

            var condition2 = this.createMatch(condition)

            var match2 = {
                $match: condition2
            }
            var pipeline = [
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
                },
                {
                    $group: {
                        _id: {
                            _id: '$_id'
                        },
                        totalQuestion: {
                            $sum: 1
                        },
                        doQuestion: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$QA.status", 3] }, 0, 1]
                            }
                        },
                        totalMissed: {
                            $first: '$totalMissed'
                        },
                        totalCorrects: {
                            $first: '$totalCorrects'
                        },
                        totalTimeTaken: {
                            $sum: '$QA.timeEslapse'
                        },
                        totalMark: {
                            $first: '$totalMark'
                        },
                        totalTestMark: {
                            $sum: '$QA.actualMarks'
                        },
                        practicesetId: {
                            $first: '$practicesetId'
                        },
                        user: {
                            $first: '$user'
                        },
                        isAbandoned: {
                            $first: '$isAbandoned'
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            'user': '$user',
                            'test': '$practicesetId',
                            'isAbandoned': '$isAbandoned'
                        },
                        totalQuestion: {
                            $sum: '$totalQuestion'
                        },
                        doQuestion: {
                            $sum: '$doQuestion'
                        },
                        totalMissed: {
                            $sum: '$totalMissed'
                        },
                        totalCorrects: {
                            $sum: '$totalCorrects'
                        },
                        totalTimeTaken: {
                            $sum: '$totalTimeTaken'
                        },
                        totalAttempts: {
                            $sum: 1
                        },
                        totalMark: {
                            $sum: '$totalMark'
                        },
                        totalTestMark: {
                            $sum: '$totalTestMark'
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            'user': '$_id.user',
                            'isAbandoned': '$_id.isAbandoned'
                        },
                        totalQuestion: {
                            $sum: '$totalQuestion'
                        },
                        doQuestion: {
                            $sum: '$doQuestion'
                        },
                        totalMissed: {
                            $sum: '$totalMissed'
                        },
                        totalCorrect: {
                            $sum: '$totalCorrects'
                        },
                        totalTimeTaken: {
                            $sum: '$totalTimeTaken'
                        },
                        totalAttempt: {
                            $sum: '$totalAttempts'
                        },
                        totalMark: {
                            $sum: '$totalMark'
                        },
                        totalTestMark: {
                            $sum: '$totalTestMark'
                        },
                        totalTest: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id': 1
                    }
                }
            ]
            this.attemptRepository.setInstanceKey(req.instancekey)
            let results = await this.attemptRepository.aggregate(pipeline)
            return { results }

        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getTopperSummaryByNumber(req: GetTopperSummaryByNumberRequest) {
        try {
            let condition: any = {}
            let user: any = {}
            condition = this.conditionSummary(req)

            if (req.query.studentId) {
                condition.user = new Types.ObjectId(req.query.studentId)
                user = await this.userRepository.find({ _id: new Types.ObjectId(req.query.studentId) }, {
                    createdAt: 1, _id: 1
                })
            } else {
                condition.user = new Types.ObjectId(req.user._id)
            }


            if (req.query.limit && !req.query.studentId) {
                if ((new Date(req.user.createdAt).getTime()) > ((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))) {
                    condition.createdAt = {
                        $gte: new Date(req.user.createdAt).toISOString()
                    }
                } else {
                    condition.createdAt = {
                        $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                    }
                }
            } else if (req.query.limit && req.query.studentId) {
                if (user[0].createdAt.getTime() > (new Date(new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))) {
                    condition.createdAt = {
                        $gte: new Date(user[0].createdAt.getTime())
                    }

                } else {
                    condition.createdAt = {
                        $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                    }
                }
            } else {
                if (req.query.studentId) {
                    condition.createdAt = {
                        $gte: new Date(user[0].createdAt.getTime())
                    }

                } else {
                    condition.createdAt = {
                        $gte: new Date(new Date(new Date(req.user.createdAt).toISOString()).getTime())
                    }

                }
            }
            condition.isShowAttempt = true
            condition.isEvaluated = true
            condition.isAbandoned = false
            var condition2 = this.createMatch(condition)

            var match2 = {
                $match: condition2
            }

            var pipline = [{
                $match: condition
            },
            globals.lookup, globals.unw, globals.add, globals.pro, match2,
            {
                $unwind: '$QA'
            },
            {
                $group: {
                    _id: {
                        _id: '$_id'
                    },
                    totalQuestion: {
                        $sum: 1
                    },
                    doQuestion: {
                        "$sum": {
                            "$cond": [{ "$eq": ["$QA.status", 3] }, 0, 1]
                        }
                    },
                    totalMissed: {
                        $first: '$totalMissed'
                    },
                    totalCorrects: {
                        $first: '$totalCorrects'
                    },
                    totalTimeTaken: {
                        $sum: '$QA.timeEslapse'
                    },
                    totalMark: {
                        $first: '$totalMark'
                    },
                    totalTestMark: {
                        $sum: '$QA.actualMarks'
                    },
                    practicesetId: {
                        $first: '$practicesetId'
                    },
                    user: {
                        $first: '$user'
                    },
                    isAbandoned: {
                        $first: '$isAbandoned'
                    }
                }
            },
            {
                $group: {
                    _id: {
                        'user': '$user',
                        'test': '$practicesetId',
                    },
                    totalQuestion: {
                        $sum: '$totalQuestion'
                    },
                    doQuestion: {
                        $sum: '$doQuestion'
                    },
                    totalMissed: {
                        $sum: '$totalMissed'
                    },
                    totalCorrects: {
                        $sum: '$totalCorrects'
                    },
                    totalTimeTaken: {
                        $sum: '$totalTimeTaken'
                    },
                    totalAttempts: {
                        $sum: 1
                    },
                    totalMark: {
                        $sum: '$totalMark'
                    },
                    totalTestMark: {
                        $sum: '$totalTestMark'
                    }
                }
            },
            {
                $group: {
                    _id: {
                        'user': '$_id.user',
                    },
                    totalQuestion: {
                        $sum: '$totalQuestion'
                    },
                    doQuestion: {
                        $sum: '$doQuestion'
                    },
                    totalMissed: {
                        $sum: '$totalMissed'
                    },
                    totalCorrect: {
                        $sum: '$totalCorrects'
                    },
                    totalTimeTaken: {
                        $sum: '$totalTimeTaken'
                    },
                    totalAttempt: {
                        $sum: '$totalAttempts'
                    },
                    totalMark: {
                        $sum: '$totalMark'
                    },
                    totalTestMark: {
                        $sum: '$totalTestMark'
                    },
                    totalTest: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    '_id': 1
                }
            }
            ]

            this.attemptRepository.setInstanceKey(req.instancekey)
            let result: any = await this.attemptRepository.aggregate(pipline)

            var data: any = {}

            if (result && result.length > 1) {
                const topperMark = result.sort((a, b) => (a.totalMark > b.totalMark) ? -1 : ((b.totalMark > a.totalMark) ? 1 : 0))[0].totalMark
                const topperAttempt = result.sort((a, b) => (a.totalAttempt > b.totalAttempt) ? -1 : ((b.totalAttempt > a.totalAttempt) ? 1 : 0))[0].totalAttempt
                const topperQuestion = result.sort((a, b) => (a.doQuestion > b.doQuestion) ? -1 : ((b.doQuestion > a.doQuestion) ? 1 : 0))[0].doQuestion
                const topperTest = result.sort((a, b) => (a.totalTest > b.totalTest) ? -1 : ((b.totalTest > a.totalTest) ? 1 : 0))[0].totalTest

                var averageMark = 0;
                var averageAttempt = 0
                var averageQuestion = 0
                var averageTest = 0
                var totalStudents = result.length;
                result.forEach(function (r) {
                    averageMark = averageMark + r.totalMark
                    averageAttempt = averageAttempt + r.totalAttempt
                    averageQuestion = averageQuestion + r.doQuestion
                    averageTest = averageTest + r.totalTest

                });
                const topper = {
                    totalMark: topperMark,
                    totalAttempt: topperAttempt,
                    totalQuestion: topperQuestion,
                    totalTest: topperTest
                }
                const average = {
                    totalMark: averageMark / totalStudents,
                    totalAttempt: averageAttempt / totalStudents,
                    totalQuestion: averageQuestion / totalStudents,
                    totalTest: averageTest / totalStudents
                }
                data = {
                    topper: topper,
                    average: average
                }
            }
            if (result && result.length === 1) {
                const topper = {
                    totalMark: result[0].totalMark,
                    totalAttempt: result[0].totalAttempt,
                    totalQuestion: result[0].doQuestion,
                    totalTest: result[0].totalTest
                }
                const average = {
                    totalMark: result[0].totalMark,
                    totalAttempt: result[0].totalAttempt,
                    totalQuestion: result[0].doQuestion,
                    totalTest: result[0].totalTest
                }
                data = {
                    topper: topper,
                    average: average
                }
            }

            return { topper: data.topper, average: data.average }

        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }
    async getAverageTimeOnPlatform(request: GetAverageTimeOnPlatformRequest) {
        try {
            var topper = 0;
            var average = 0;
            var condition: any = {}
            if (request.query.studentId) {
                condition.user = new Types.ObjectId(request.query.studentId)
            } else {
                condition.user = new Types.ObjectId(request.user._id)
            }

            this.userCourseRepository.setInstanceKey(request.instancekey)
            let userCourseTimeSpent: any = await this.userCourseRepository.aggregate([
                {
                    $match: condition
                },
                { $unwind: "$contents" },
                {
                    $project: {
                        createdAt: 1,
                        _id: 1,
                        user: 1,
                        timeSpent: "$contents.timeSpent",
                        start: "$contents.start",
                        contentsId: "$contents._id"
                    }
                },
                {
                    $match: {
                        start: {
                            $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                        },
                    }

                },
                {
                    $group: {
                        _id: "$user",
                        timeSpent: { $sum: "$timeSpent" },
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalSpentTime: { $divide: ["$timeSpent", 60000] } // convert to min
                    }
                }
            ])

            condition.createdAt = {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }


            var userAttemptTimeSpent: any[] = await this.attemptRepository.aggregate([{
                $match: condition
            },
            {
                $project: {
                    createdAt: 1,
                    _id: 1,
                    user: 1,
                    totalTime: 1
                }
            },
            {
                $group: {
                    _id: "$user",
                    totalAttemptTime: { $sum: "$totalTime" }
                }
            },
            {
                $project: {
                    _id: 1,
                    totalAttemptTime: { $divide: ["$totalAttemptTime", 60000] } // to convert into min
                }
            }])

            if (userCourseTimeSpent.length > 0 && userAttemptTimeSpent.length > 0) {
                var currentUser = userCourseTimeSpent[0].totalSpentTime + userAttemptTimeSpent[0].totalAttemptTime
            }
            if (userCourseTimeSpent.length > 0 && !(userAttemptTimeSpent.length > 0)) {
                var currentUser = userCourseTimeSpent[0].totalSpentTime
            }
            if (userAttemptTimeSpent.length > 0 && !(userCourseTimeSpent.length > 0)) {

                var currentUser = userAttemptTimeSpent[0].totalAttemptTime
            }
            var user = {}
            let userDate = null
            if (request.query.studentId) {
                condition.user = new Types.ObjectId(request.query.studentId)
                user = await this.userRepository.find({ _id: new Types.ObjectId(request.query.studentId) }, { createdAt: 1, _id: 1 })
                userDate = new Date(user[0].createdAt).getTime()

            } else {
                userDate = new Date(request.user.createdAt).getTime()
            }

            if (userDate > new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))) {
                var filter: any = userDate
            } else {
                var filter: any = new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))

            }
            var CourseTimeSpent: any = await this.userCourseRepository.aggregate([
                { $unwind: "$contents" },
                {
                    $project: {
                        createdAt: 1,
                        _id: 1,
                        user: 1,
                        timeSpent: "$contents.timeSpent",
                        start: "$contents.start",
                        contentsId: "$contents._id"

                    }
                },
                {
                    $match: {
                        start: {
                            $gte: new Date(filter)
                        },
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        timeSpent: { $sum: "$timeSpent" },
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalSpentTime: { $divide: ["$timeSpent", 60000] } //convert to min
                    }
                }
            ]);
            var attemptTimeSpent: any = await this.attemptRepository.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(filter)
                        },
                    }
                },
                {
                    $project: {
                        createdAt: 1,
                        _id: 1,
                        user: 1,
                        totalTime: 1
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        totalAttemptTime: { $sum: "$totalTime" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalAttemptTime: { $divide: ["$totalAttemptTime", 60000] } // convet to min
                    }
                }
            ])
            if (CourseTimeSpent[0] && attemptTimeSpent[0]) {
                var topperCourseTimeSpent = CourseTimeSpent.sort((a, b) => (a.totalSpentTime > b.totalSpentTime) ? -1 : ((b.totalSpentTime > a.totalSpentTime) ? 1 : 0))[0].totalSpentTime
                var topperAttemptTime = attemptTimeSpent.sort((a, b) => (a.totalAttemptTime > b.totalAttemptTime) ? -1 : ((b.totalAttemptTime > a.totalAttemptTime) ? 1 : 0))[0].totalAttemptTime
                topper = topperAttemptTime + topperCourseTimeSpent;

                //average

                var courseTotalStudents = CourseTimeSpent.length
                var attemptTotalStudents = attemptTimeSpent.length
                var averageCourseTime = 0;
                var averageAttemptTime = 0;
                CourseTimeSpent.forEach(function (c) {
                    averageCourseTime = averageCourseTime + c.totalSpentTime;
                })
                averageCourseTime = averageCourseTime / courseTotalStudents;
                attemptTimeSpent.forEach(function (c) {
                    averageAttemptTime = averageAttemptTime + c.totalAttemptTime;
                })
                averageAttemptTime = averageAttemptTime / attemptTotalStudents;
                average = averageAttemptTime + averageCourseTime;

            }
            if (!CourseTimeSpent[0] && attemptTimeSpent[0]) {
                var topperAttemptTime = attemptTimeSpent.sort((a, b) => (a.totalAttemptTime > b.totalAttemptTime) ? -1 : ((b.totalAttemptTime > a.totalAttemptTime) ? 1 : 0))[0].totalAttemptTime
                topper = topperAttemptTime;
                //average

                var attemptTotalStudents = attemptTimeSpent.length
                var averageCourseTime = 0;
                var averageAttemptTime = 0;

                attemptTimeSpent.forEach(function (c) {
                    averageAttemptTime = averageAttemptTime + c.totalAttemptTime;
                })
                averageAttemptTime = averageAttemptTime / attemptTotalStudents;
                average = averageAttemptTime;

            }
            if (CourseTimeSpent[0] && !attemptTimeSpent[0]) {
                var topperCourseTimeSpent = CourseTimeSpent.sort((a, b) => (a.totalSpentTime > b.totalSpentTime) ? -1 : ((b.totalSpentTime > a.totalSpentTime) ? 1 : 0))[0].totalSpentTime
                topper = topperCourseTimeSpent;

                //average

                var courseTotalStudents = CourseTimeSpent.length
                var averageCourseTime = 0;
                var averageAttemptTime = 0;
                CourseTimeSpent.forEach(function (c) {
                    averageCourseTime = averageCourseTime + c.totalSpentTime;
                })
                averageCourseTime = averageCourseTime / courseTotalStudents;
                average = averageCourseTime;
            }

            return { user: currentUser, topper: topper, average: average }
        } catch (err) {
            console.log(err);
            throw "internal server error"
        }
    }

    async getEffortTrendAttemptCount(request: GetEffortTrendAttemptCountRequest) {
        try {
            var condition = {}
            if (request.query.studentId) {
                condition = {
                    user: new Types.ObjectId(request.query.studentId),
                    isShowAttempt: true,
                    isEvaluated: true,
                    isAbandoned: false,
                    createdAt: {
                        $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                    }
                }
            } else {
                condition = {
                    user: new Types.ObjectId(request.user._id),
                    isShowAttempt: true,
                    isEvaluated: true,
                    isAbandoned: false,
                    createdAt: {
                        $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                    }
                }
            }

            this.attemptRepository.setInstanceKey(request.instancekey)
            var attemptCount = await this.attemptRepository.aggregate([
                {
                    $match: condition
                }, {
                    $project: {
                        createdAt: 1,
                        _id: 1,

                    }
                },
                {
                    $group: {
                        _id: {
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
                        attemptCount: { $sum: 1 }
                    }
                },
                { $sort: { "_id.month": 1, "_id.day": 1 } }
            ])

            var averageAttemptCount = await this.attemptRepository.aggregate([
                {
                    $match: {
                        isShowAttempt: true,
                        isEvaluated: true,
                        isAbandoned: false,
                        createdAt: {
                            $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                        }
                    }
                }, {
                    $project: {
                        createdAt: 1,
                        _id: 1,
                        user: 1

                    }
                },
                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$createdAt"
                            },
                            month: {
                                $month: "$createdAt"
                            },
                            day: {
                                $dayOfMonth: "$createdAt"
                            },
                            user: "$user"
                        },
                        attemptId: { $addToSet: "$_id" },
                        students: { $addToSet: "$user" },
                        totalStudents: { $sum: 1 },
                        attemptCount: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        day: "$_id.day",
                        year: "$_id.year",
                        month: "$_id.month",
                        students: { $size: "$students" },
                        attemptsCount: { $size: "$attemptId" }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        },
                        totalStudents: { $sum: "$students" },
                        attemptCount: { $sum: "$attemptsCount" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        averageAttemptCount: { $divide: ["$attemptCount", "$totalStudents"] }
                    }
                },
                { $sort: { "_id.month": 1, "_id.day": 1 } }
            ])
            var topperCount = await this.attemptRepository.aggregate([
                {
                    $match: {
                        isShowAttempt: true,
                        isEvaluated: true,
                        isAbandoned: false,
                        createdAt: {
                            $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                        }
                    }
                }, {
                    $project: {
                        createdAt: 1,
                        _id: 1,
                        user: 1

                    }
                },
                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$createdAt"
                            },
                            month: {
                                $month: "$createdAt"
                            },
                            day: {
                                $dayOfMonth: "$createdAt"
                            },
                            user: "$user"
                        },
                        attemptId: { $addToSet: "$_id" },
                        students: { $addToSet: "$user" },
                        totalStudents: { $sum: 1 },
                        attemptCount: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        day: "$_id.day",
                        year: "$_id.year",
                        month: "$_id.month",
                        students: "$students",
                        attemptsCount: { $size: "$attemptId" }
                    }
                },
                { $sort: { "attemptsCount": -1 } },
                {
                    $group: {
                        _id: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        },
                        user: { $first: "$students" },
                        topperAttemptCount: { $first: "$attemptsCount" }
                    }
                },
                { $sort: { "_id.month": 1, "_id.day": 1 } }
            ])

            return { user: attemptCount, average: averageAttemptCount, topper: topperCount }
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getLearningEffortDistribution(request: GetLearningEffortsDistributionRequest) {
        try {
            var condition: any = {}
            if (request.query.studentId) {
                condition.user = new Types.ObjectId(request.query.studentId)
            } else {
                condition.user = new Types.ObjectId(request.user._id)
            }

            if (request.query.limit) {
                condition.createdAt = { $gte: new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)) }
            }

            this.userCourseRepository.setInstanceKey(request.instancekey)
            var learningCount = await this.userCourseRepository.aggregate([
                {
                    $match: condition
                },
                { $unwind: "$contents" },
                {
                    $match:
                        { $or: [{ "contents.type": 'video' }, { "contents.type": 'note' }, { "contents.type": 'ebook' }] },

                },
                {
                    $lookup: {
                        from: "courses",
                        localField: "course",
                        foreignField: "_id",
                        as: "someField"
                    }
                },
                {
                    $unwind: "$someField"
                },
                {
                    $addFields: {
                        subject: "$someField.subjects"
                    }
                },
                {
                    $project: {
                        someField: 0,
                    }
                },
                { $unwind: "$subject" },
                {
                    $group: {
                        _id: {
                            subjectId: '$subject._id',
                        },
                        subjectName: { $first: "$subject.name" },
                        timeSpent: { $sum: "$contents.timeSpent" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        subjectName: 1,
                        timeSpent: { $divide: ["$timeSpent", 60000] }
                    }
                }
            ])

            return { learningCount }
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getSubjectQuestionComplexity(request: GetSubjectQuestionComplexityRequest) {
        try {
            var condition: any = {}
            if (request.query.studentId) {
                condition = {
                    user: new Types.ObjectId(request.query.studentId),
                    isShowAttempt: true,
                    isEvaluated: true,
                    isAbandoned: false
                }
            } else {
                condition = {
                    user: new Types.ObjectId(request.user._id),
                    isShowAttempt: true,
                    isEvaluated: true,
                    isAbandoned: false
                }
            }
            this.attemptRepository.setInstanceKey(request.instancekey);
            var subComplexity = await this.attemptRepository.aggregate([
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
                    $unwind: '$QA'
                },
                {
                    $lookup: {
                        from: "questions",
                        localField: "QA.question",
                        foreignField: "_id",
                        as: "ques"
                    }
                },
                {
                    $unwind: '$ques'
                },
                {
                    $group: {
                        _id: {
                            subject: "$ques.subject._id",
                            complexity: "$ques.complexity"
                        },
                        partial: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$QA.status", 5] }, 1, 0]
                            }
                        },
                        missed: {
                            "$sum": {
                                "$cond": [{ $and: [{ "$eq": ["$QA.status", 3] }, { $eq: ["$QA.timeEslapse", 0] }] }, 1, 0]
                            }
                        },
                        correct: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$QA.status", 1] }, 1, 0]
                            }
                        },
                        incorrect: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$QA.status", 2] }, 1, 0]
                            }
                        },
                        skipped: {
                            "$sum": {
                                "$cond": [{ $and: [{ "$eq": ["$QA.status", 3] }, { $gt: ["$QA.timeEslapse", 0] }] }, 1, 0]
                            }
                        },
                        subjectName: { $first: "$ques.subject.name" },
                        totaAttempt: { $sum: 1 }

                    }
                },
            ])
            return { subComplexity }

        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async questionCategoryDistribution(request: QuestionCategoryDistributionRequest) {
        try {
            var condition = {}
            if (request.query.studentId) {
                condition = {
                    user: new Types.ObjectId(request.query.studentId),
                    isShowAttempt: true,
                    isEvaluated: true,
                    isAbandoned: false
                }
            } else {
                condition = {
                    user: new Types.ObjectId(request.user._id),
                    isShowAttempt: true,
                    isEvaluated: true,
                    isAbandoned: false
                }
            }
            this.attemptRepository.setInstanceKey(request.instancekey)
            var quesDistribution = await this.attemptRepository.aggregate([
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
                    $unwind: '$QA'
                },
                {
                    $group: {
                        _id: {
                            //                _id: '$_id',
                            subject: "$QA.subject._id",
                            category: "$QA.category"
                        },
                        partial: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$QA.status", 5] }, 1, 0]
                            }
                        },
                        missed: {
                            "$sum": {
                                "$cond": [{ $and: [{ "$eq": ["$QA.status", 3] }, { $eq: ["$QA.timeEslapse", 0] }] }, 1, 0]
                            }
                        },
                        correct: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$QA.status", 1] }, 1, 0]
                            }
                        },
                        incorrect: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$QA.status", 2] }, 1, 0]
                            }
                        },
                        skipped: {
                            "$sum": {
                                "$cond": [{ $and: [{ "$eq": ["$QA.status", 3] }, { $gt: ["$QA.timeEslapse", 0] }] }, 1, 0]
                            }
                        },
                        totaAttempt: { $sum: 1 },
                        subjectName: { $first: "$QA.subject.name" },

                    }
                },
            ])
            return { quesDistribution }
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getGroupParticipation(request: GetGroupParticipationRequest) {
        try {
            var condition: any = {}
            if (request.query.limit) {
                condition.createdAt = {
                    $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                }
            }
            if (request.query.studentId) {
                condition.user = new Types.ObjectId(request.query.studentId);
            } else {
                condition.user = new Types.ObjectId(request.user._id)
            }
            this.discussionRepository.setInstanceKey(request.instancekey)
            var response = await this.discussionRepository.aggregate([
                {
                    $match: condition
                },
                {
                    $group: {
                        _id: {
                            user: new ObjectId(request.user._id)
                        },
                        comments: {
                            "$sum": {
                                "$cond": {
                                    if: "$parent", then: 1,
                                    else: 0
                                }
                            }
                        },
                        posts: {
                            "$sum": {
                                "$cond": {
                                    if: "$parent", then: 0,
                                    else: 1
                                }
                            }
                        },
                        totaAttempt: { $sum: 1 }

                    }
                },
            ])

            return { response }

        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getPersistanceData(request: GetPersistanceDataRequest) {
        try {
            var condition: any = {
                isEvaluated: true,
                isShowAttempt: true,
            }

            if (request.query.studentId) {
                condition.user = new Types.ObjectId(request.query.studentId)
            } else {
                condition.user = new Types.ObjectId(request.user._id)
            }

            this.attemptRepository.setInstanceKey(request.instancekey)
            var persist = await this.attemptRepository.aggregate([
                {
                    $match: condition
                },
                {
                    $group: {
                        _id: {
                            user: condition.user
                        },
                        abandoned: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$isAbandoned", true] }, 1, 0]
                            }
                        },
                        success: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$isAbandoned", false] }, 1, 0]
                            }
                        },
                        totalAttempt: { $sum: 1 }

                    }
                },
            ])
            return { persist }
        } catch (err) {
            console.log(err);
            throw "Internal Server error"
        }
    }

    async getEffortTrendAttemptTotalTime(request: GetEffortTrendAttemptTotalTimeRequest) {
        try {
            var condition = {}
            if (request.query.studentId) {
                condition = {
                    isShowAttempt: true,
                    isAbandoned: false,
                    isEvaluated: true,
                    user: new Types.ObjectId(request.query.studentId),
                    createdAt: {
                        $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                    }
                }
            } else {
                condition = {
                    isShowAttempt: true,
                    isEvaluated: true,
                    isAbandoned: false,
                    user: new Types.ObjectId(request.user._id),
                    createdAt: {
                        $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                    }
                }
            }
            this.attemptRepository.setInstanceKey(request.instancekey)
            var userAttemptTotalTime = await this.attemptRepository.aggregate([
                {
                    $match: condition
                }, {
                    $project: {
                        createdAt: 1,
                        _id: 1,
                        user: 1,
                        totalTime: 1
                    }
                },
                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$createdAt"
                            },
                            month: {
                                $month: "$createdAt"
                            },
                            day: {
                                $dayOfMonth: "$createdAt"
                            },
                            //                        user: "$user"
                        },
                        attemptId: { $addToSet: "$_id" },
                        students: { $addToSet: "$user" },
                        totalTime: { $sum: "$totalTime" }

                    }
                },
                {
                    $project: {
                        _id: 1,
                        students: "$students",
                        timeSpent: { $divide: ["$totalTime", 3600000] }
                    }
                },
                { $sort: { "_id.month": 1, "_id.day": 1 } }
            ])

            var averageAttemptTotalTime = await this.attemptRepository.aggregate([
                {
                    $match: {
                        isShowAttempt: true,
                        isEvaluated: true,
                        isAbandoned: false,
                        createdAt: {
                            $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                        }
                    }
                }, {
                    $project: {
                        createdAt: 1,
                        _id: 1,
                        user: 1,
                        totalTime: 1
                    }
                },
                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$createdAt"
                            },
                            month: {
                                $month: "$createdAt"
                            },
                            day: {
                                $dayOfMonth: "$createdAt"
                            },
                            user: "$user"
                        },
                        user: { $first: "$user" },
                        attemptId: { $addToSet: "$_id" },
                        //                    students: { $addToSet: "$user" },
                        totalTime: { $sum: "$totalTime" }

                    }
                },
                {
                    $group: {
                        _id: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        },
                        userArr: { $addToSet: "$user" },
                        totalStudents: { $sum: 1 },
                        totalTime: { $sum: "$totalTime" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalStudents: { $size: "$userArr" },
                        attemptsTotalTime: { $divide: ["$totalTime", 3600000] }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        averageTimeSpent: { $divide: ["$attemptsTotalTime", "$totalStudents"] }
                    }
                },
                { $sort: { "_id.month": 1, "_id.day": 1 } }
            ]);

            var topperAttemptTotalTime = await this.attemptRepository.aggregate([
                {
                    $match: {
                        isShowAttempt: true,
                        isEvaluated: true,
                        isAbandoned: false,
                        createdAt: {
                            $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                        }
                    }
                }, {
                    $project: {
                        createdAt: 1,
                        _id: 1,
                        user: 1,
                        totalTime: 1
                    }
                },
                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$createdAt"
                            },
                            month: {
                                $month: "$createdAt"
                            },
                            day: {
                                $dayOfMonth: "$createdAt"
                            },
                            user: "$user"
                        },
                        user: { $first: "$user" },
                        attemptId: { $addToSet: "$_id" },
                        //                    students: { $addToSet: "$user" },
                        totalTime: { $sum: "$totalTime" }

                    }
                },
                { $sort: { "totalTime": -1 } },
                {
                    $group: {
                        _id: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        },
                        userArr: { $first: "$user" },
                        attemptId: { $first: "$attemptId" },
                        //                    totalStudents: { $sum: 1 },
                        totalTime: { $first: "$totalTime" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        user: "$userArr",
                        topperTimeSpent: { $divide: ["$totalTime", 3600000] }
                    }
                },
                { $sort: { "_id.month": 1, "_id.day": 1 } }
            ])

            return { user: userAttemptTotalTime, average: averageAttemptTotalTime, topper: topperAttemptTotalTime }

        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getEffortTrendCourseTimeSpent(request: GetEffortTrendCourseTimeSpentRequest) {
        try {
            var condition: any = {}
            if (request.query.studentId) {
                condition.user = new Types.ObjectId(request.query.studentId);
            } else {
                condition.user = new Types.ObjectId(request.user._id)
            }
            this.userCourseRepository.setInstanceKey(request.instancekey)
            var usercourseTimeSpent = await this.userCourseRepository.aggregate([
                {
                    $match: condition
                },
                { $unwind: "$contents" },
                {
                    $project: {
                        createdAt: 1,
                        _id: 1,
                        timeSpent: "$contents.timeSpent",
                        start: "$contents.start",
                        contentsId: "$contents._id"

                    }
                },
                {
                    $match: {
                        start: {
                            $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$start"
                            },
                            month: {
                                $month: "$start"
                            },
                            day: {
                                $dayOfMonth: "$start"
                            }
                        },
                        contentId: { $addToSet: "$contentsId" },
                        totalTimeSpent: { $sum: "$timeSpent" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        // contentId: 1,
                        totalTimeSpent: { $divide: ["$totalTimeSpent", 3600000] }

                    }
                },
                { $sort: { "_id.month": 1, "_id.day": 1 } }
            ])

            var averagecourseTimeSpent = await this.userCourseRepository.aggregate([
                { $unwind: "$contents" },
                {
                    $project: {
                        createdAt: 1,
                        _id: 1,
                        timeSpent: "$contents.timeSpent",
                        start: "$contents.start",
                        contentId: "$contents._id",
                        user: 1

                    }
                },
                {
                    $match: {
                        start: {
                            $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$start"
                            },
                            month: {
                                $month: "$start"
                            },
                            day: {
                                $dayOfMonth: "$start"
                            },
                            user: "$user",
                            //                        contentId:"$contentId"
                        },
                        user: { $first: "$user" },
                        contentId: { $addToSet: "$contentId" },
                        contentCount: { $sum: 1 },
                        timeSpent: { $sum: "$timeSpent" }
                    }
                },
                {
                    $project: {
                        day: "$_id.day",
                        year: "$_id.year",
                        month: "$_id.month",
                        contentId: 1,
                        user: 1,
                        timeSpent: 1
                        //                    students: { $size: "$students" },
                        //                    attemptsCount: { $size: "$attemptId" }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        },
                        userArr: { $addToSet: "$user" },
                        totalStudents: { $sum: 1 },
                        totalSpentTime: { $sum: "$timeSpent" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalStudents: { $size: "$userArr" },
                        totalSpentTime: { $divide: ["$totalSpentTime", 3600000] },
                    }

                },
                {
                    $project: {
                        _id: 1,
                        averageTimeSpent: { $divide: ["$totalSpentTime", "$totalStudents"] }
                    }
                },
                { $sort: { "_id.month": 1, "_id.day": 1 } }
            ])

            var toppercourseTimeSpent = await this.userCourseRepository.aggregate([
                { $unwind: "$contents" },
                {
                    $project: {
                        createdAt: 1,
                        _id: 1,
                        timeSpent: "$contents.timeSpent",
                        start: "$contents.start",
                        contentId: "$contents._id",
                        user: 1

                    }
                },
                {
                    $match: {
                        start: {
                            $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$start"
                            },
                            month: {
                                $month: "$start"
                            },
                            day: {
                                $dayOfMonth: "$start"
                            },
                            user: "$user",
                            //                        contentId:"$contentId"
                        },
                        user: { $first: "$user" },
                        contentId: { $addToSet: "$contentId" },
                        contentCount: { $sum: 1 },
                        timeSpent: { $sum: "$timeSpent" }
                    }
                },
                { $sort: { "timeSpent": -1 } },
                {
                    $group: {
                        _id: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        },
                        userArr: { $first: "$user" },
                        totalStudents: { $sum: 1 },
                        totalSpentTime: { $first: "$timeSpent" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        user: "$userArr",
                        // totalStudents:1,
                        topperTimeSpent: { $divide: ["$totalSpentTime", 3600000] },
                    }

                },
                { $sort: { "_id.month": 1, "_id.day": 1 } }
            ])

            return { user: usercourseTimeSpent, average: averagecourseTimeSpent, topper: toppercourseTimeSpent }

        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getUniqueQuestionsCount(request: GetUniqueQuestionsCountRequest) {
        try {
            var condition: any = {
                isShowAttempt: true,
                isAbandoned: false,
                isEvaluated: true,
            }

            let userCond: any = {}

            if (request.query.studentId) {
                this.userRepository.setInstanceKey(request.instancekey)
                userCond = await this.userRepository.findOne({ _id: new Types.ObjectId(request.query.studentId) },
                    { createdAt: 1, _id: 1 })
            }
            if (request.query.limit && !request.query.studentId) {
                if (new Date(request.user.createdAt).getTime() > (Date.now() - (15 * 24 * 60 * 60 * 1000))) {
                    condition.createdAt = {
                        $gte: new Date(request.user.createdAt)
                    };
                } else {
                    condition.createdAt = {
                        $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                    }
                }
            } else if (request.query.limit && request.query.studentId) {
                if (userCond.createdAt.getTime() > (new Date(new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))) {
                    condition.createdAt = {
                        $gte: new Date(userCond.createdAt).getTime()
                    }
                } else {
                    condition.createdAt = {
                        $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                    }
                }
            } else {
                if (request.query.studentId) {
                    condition.createdAt = {
                        $gte: new Date(userCond.createdAt.getTime())
                    }
                } else {
                    condition.createdAt = {
                        $gte: new Date(new Date(request.user.createdAt).getTime())
                    }
                }
            }

            this.attemptRepository.setInstanceKey(request.instancekey)
            let data: any = await this.attemptRepository.aggregate([{
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
                $unwind: '$QA'
            },
            {
                $group: {
                    _id: {
                        question: "$QA.question", user: "$user",
                    },
                    quesStatus: {
                        $first: "$QA.status"
                    },
                    practicesetId: {
                        $push: '$practicesetId'
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.user",
                    doQuestion: {
                        "$sum": {
                            "$cond": [{ "$eq": ["$quesStatus", 3] }, 0, 1]
                        }
                    },
                    practicesetId: {
                        $addToSet: '$practicesetId'
                    },
                    user: {
                        $first: '$user'
                    }
                }
            },
            {
                $facet: {
                    topper: [
                        { $sort: { doQuestion: -1 } },
                        { $limit: 1 }
                    ],
                    average: [
                        {
                            $group: {
                                _id: null,
                                doQuestion: {
                                    $sum: "$doQuestion"
                                },
                                practicesetId: {
                                    $addToSet: '$practicesetId'
                                },
                                user: {
                                    $push: '$user'
                                },
                            }
                        },
                        {
                            $project: {
                                doQuestion: 1,
                                totalStudents: { $size: "$user" }
                            }
                        },
                        {
                            $project: {
                                average: { $divide: ["$doQuestion", "$totalStudents"] }
                            }
                        }
                    ],
                    user: [
                        {
                            $match: { '_id': request.query.studentId ? new Types.ObjectId(request.query.studentId) : new Types.ObjectId(request.user._id) }
                        }
                    ]
                }
            }])
            return { data: data[0] }

        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getAccuracyAndSpeed(request: GetAccuracyAndSpeedRequest) {
        try {
            var condition: any = this.conditionSummary(request, true);
            condition.isShowAttempt = true;

            if (request.query.user) {
                condition.user = new Types.ObjectId(request.query.user);
            } else {
                condition.user = new Types.ObjectId(request.user._id)
            }

            condition.isEvaluated = true

            if (request.query.subjects) {
                let subjects = request.query.subjects.split(",")
                let Objectsubjects = subjects.map(id => new Types.ObjectId(id))
                condition["subjects._id"] = { $in: Objectsubjects }

            } else if (request.query.user) {
                this.userRepository.setInstanceKey(request.instancekey)
                const sub = await this.userRepository.find({ _id: new Types.ObjectId(request.user._id) }, {
                    subjects: 1
                })

                let Objectsubjects = sub[0].subjects.map(id => new Types.ObjectId(id))
                condition["subjects._id"] = { $in: Objectsubjects }
            } else {
                let Objectsubjects = request.user.subjects.map(id => new Types.ObjectId(id))
                condition["subjects._id"] = { $in: Objectsubjects }
            }

            var condition2 = this.createMatch(condition);
            var match2 = {
                $match: condition2
            }

            this.attemptRepository.setInstanceKey(request.instancekey);
            let subjects: any = await this.attemptRepository.aggregate([
                {
                    $match: condition
                },
                globals.lookup,
                globals.unw,
                globals.add,
                globals.pro,
                match2,
                {
                    $unwind: '$QA'
                },
                {
                    $project: {
                        'subject._id': '$QA.subject._id',
                        'subject.name': '$QA.subject.name',
                        QA: 1
                    }
                },
                {
                    $group: {
                        _id: '$subject',
                        questionCount: {
                            '$sum': 1
                        },
                        timeEslapse: {
                            $sum: '$QA.timeEslapse'
                        },
                        doQuestion: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$QA.status", 3] }, 0, 1]
                            }
                        },
                        marks: {
                            '$sum': '$QA.actualMarks'
                        },
                        obtainMarks: {
                            '$sum': '$QA.obtainMarks'
                        }
                    }
                },
                {
                    $project: {
                        '_id': '$_id._id',
                        'name': '$_id.name',
                        'doQuestion': '$doQuestion',
                        timeEslapse: 1,
                        totalMark: '$marks',
                        obtainMarks: 1
                    }
                }, {
                    $project: {
                        'accuracy': {
                            $multiply: [{
                                $cond: [{
                                    $eq: ['$totalMark', 0]
                                }, 0, {
                                    '$divide': ['$obtainMarks', '$totalMark']
                                }]
                            }, 100]
                        },
                        'speed': {
                            $divide: [{
                                $cond: [{
                                    $eq: ['$doQuestion', 0]
                                }, 0, {
                                    '$divide': ['$timeEslapse', '$doQuestion']
                                }]
                            }, 1000]
                        },
                        '_id': 1,
                        'name': 1
                    }
                },
                {
                    $sort: {
                        name: 1
                    }
                }
            ])

            if (subjects.length > 0) {
                for (var i = 0; i > subjects.length; i++) {
                    subjects[i].accuracy = Number((subjects[i].accuracy).toFixed(0))
                    subjects[i].speed = Number((subjects[i].speed).toFixed(0))
                }
            }

            return { subjects }
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getAccuracyAndSpeedByTopic(request: GetAccuracyAndSpeedByTopicRequest) {
        try {
            var condition: any = this.conditionSummary(request, false)
            if (request.query.user) {
                condition.user = new Types.ObjectId(request.query.user);
            } else {
                condition.user = new Types.ObjectId(request.user._id)
            }

            condition.isEvaluated = true;
            if (request.query.subjects) {
                let subjects = request.query.subjects.split(",");
                let objSubjects = subjects.map(id => new Types.ObjectId(id));
                condition["subjects._id"] = { $in: objSubjects }
            } else {
                let subjects = request.user.subjects;
                let objSubjects = subjects.map(id => new Types.ObjectId(id));
                condition["subjects._id"] = { $in: objSubjects }
            }

            var condition2 = this.createMatch(condition)
            var match2 = {
                $match: condition2
            }

            this.attemptRepository.setInstanceKey(request.instancekey)
            let topics: any = await this.attemptRepository.aggregate([
                {
                    $match: condition
                },
                globals.lookup, globals.unw, globals.add, globals.pro,
                {
                    $unwind: '$QA'
                },
                match2,
                {
                    $project: {
                        'topic._id': '$QA.topic._id',
                        'topic.name': '$QA.topic.name',
                        QA: 1
                    }
                },
                {
                    $group: {
                        _id: '$topic',
                        questionCount: {
                            '$sum': 1
                        },
                        timeEslapse: {
                            $sum: '$QA.timeEslapse'
                        },
                        doQuestion: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$QA.status", 3] }, 0, 1]
                            }
                        },
                        marks: {
                            '$sum': '$QA.actualMarks'
                        },
                        obtainMarks: {
                            '$sum': '$QA.obtainMarks'
                        }
                    }
                },
                {
                    $project: {
                        '_id': '$_id._id',
                        'name': '$_id.name',
                        'doQuestion': '$doQuestion',
                        timeEslapse: 1,
                        'totalMark': '$marks',
                        obtainMarks: 1
                    }
                }, {
                    $project: {
                        'accuracy': {
                            $multiply: [{
                                $cond: [{
                                    $eq: ['$totalMark', 0]
                                }, 0, {
                                    '$divide': ['$obtainMarks', '$totalMark']
                                }]
                            }, 100]
                        },
                        'speed': {
                            $divide: [{
                                $cond: [{
                                    $eq: ['$doQuestion', 0]
                                }, 0, {
                                    '$divide': ['$timeEslapse', '$doQuestion']
                                }]
                            }, 1000]
                        },
                        '_id': 1,
                        'name': 1
                    }
                }, {
                    $sort: {
                        name: 1
                    }
                }
            ])
            if (topics.length > 0) {
                for (var i = 0; i < topics.length; i++) {
                    topics[i].accuracy = Number((topics[i].accuracy).toFixed(0))
                    topics[i].speed = Number((topics[i].speed).toFixed(0))
                }
            }

            return { topics }
        } catch (err) {
            console.log(err);
            throw "Internal Server error"
        }
    }

    async summaryAttemptedPractice(req: SummaryAttemptedPracticeRequest) {
        try {
            if (!req.user || req.user.roles.includes('student')) {
                // method call from test detail page, we should cache this as many students may access the same page at a time
                var savedSummary = await this.redisCaching.getAsync(req.instancekey, 'summary_attempts_' + req.practicesetId)
                if (savedSummary) {
                    return savedSummary
                }
            }

            this.practiceSetRepository.setInstanceKey(req.instancekey)
            let test = await this.practiceSetRepository.findById(new ObjectId(req.practicesetId))

            if (!test) {
                throw new NotFoundException()
            }

            var condition: any = {
                practicesetId: test._id,
                ongoing: { $ne: true }
            }

            if (req.query.classroom) {
                condition['practiceSetInfo.classRooms'] = { $in: req.query.classroom.split(',').map(c => new ObjectId(c)) }
            } else if (req.user) {
                condition.location = new ObjectId(req.user.activeLocation)
                if (test.accessMode == 'invitation') {
                    if (req.user.roles.includes(config.roles.teacher)) {
                        this.classroomRepository.setInstanceKey(req.instancekey);
                        let classes = await this.classroomRepository.distinct('_id', {
                            $or: [{
                                user: new ObjectId(req.user._id)
                            }, {
                                owners: new ObjectId(req.user._id)
                            }]
                        })
                        condition['practiceSetInfo.classRooms'] = { $in: classes }
                    } else if (req.user.roles.includes(config.roles.centerHead)) {
                        this.classroomRepository.setInstanceKey(req.instancekey);
                        let classes = await this.classroomRepository.distinct('_id', { location: { $in: req.user.locations.map(l => new ObjectId(l)) } })
                        condition['practiceSetInfo.classRooms'] = { $in: classes }
                    }
                }
            }

            var pipline: any = [{ $match: condition }, globals.lookup, globals.unw, globals.add, globals.pro, { $unwind: '$QA' }]

            pipline.push({
                $project: {
                    'subject._id': '$QA.subject._id',
                    'subject.name': '$QA.subject.name',
                    'subject.attempt_id': '$_id',
                    QA: 1,
                    studentName: 1,
                    totalQuestions: 1,
                    totalCorrects: 1,
                    isEvaluated: 1,
                    isAbandoned: 1,
                    totalMissed: 1,
                    totalErrors: 1,
                    totalPartial: "$partial",
                    totalMark: 1,
                    practiceSetInfo: 1,
                    totalTime: 1,
                    user: 1,
                    createdBy: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    offscreenTime: 1,
                    fraudDetected: 1,
                    screenSwitched: {
                        "$cond": [{
                            "$not": ["$QA.offscreen"]
                        }, 0, {
                            "$size": "$QA.offscreen"
                        }]
                    },
                    fraudPenalty: 1,
                    face_detection: 1
                }
            })

            pipline.push({
                $group: {
                    _id: '$subject',
                    attempt_id: {
                        $first: '$_id'
                    },
                    totalQuestion: {
                        $first: '$totalQuestions'
                    },
                    isEvaluated: {
                        $first: '$isEvaluated'
                    },
                    studentName: {
                        $first: '$studentName'
                    },
                    isAbandoned: {
                        $first: "$isAbandoned"
                    },
                    totalCorrects: {
                        $first: '$totalCorrects'
                    },
                    totalMissed: {
                        $first: '$totalMissed'
                    },
                    totalPartial: {
                        $first: '$totalPartial'
                    },
                    totalErrors: {
                        $first: '$totalErrors'
                    },
                    totalMark: {
                        $first: '$totalMark'
                    },
                    accessMode: {
                        $first: '$practiceSetInfo.accessMode'
                    },
                    practiceSetInfo: {
                        $first: '$practiceSetInfo'
                    },
                    totalTimeTaken: {
                        $first: '$totalTime'
                    },
                    user: {
                        $first: '$user'
                    },
                    questionPractice: {
                        $sum: 1
                    },
                    doQuestion: {
                        $sum: {
                            $cond: [{ $eq: ["$QA.status", 3] }, 0, 1]
                        }
                    },
                    createdBy: {
                        $first: '$createdBy'
                    },
                    createdAt: {
                        $first: '$createdAt'
                    },
                    updatedAt: {
                        $first: '$updatedAt'
                    },
                    obtainMarks: {
                        $sum: '$QA.obtainMarks'
                    },
                    totalTestMark: {
                        $sum: '$QA.actualMarks'
                    },
                    offscreenTime: {
                        $first: "$offscreenTime"
                    },
                    fraudDetected: {
                        $first: "$fraudDetected"
                    },
                    screenSwitched: {
                        $sum: '$screenSwitched'
                    },
                    fraudPenalty: {
                        $first: "$fraudPenalty"
                    },
                    face_detection: {
                        $first: "$face_detection"
                    }
                }
            })

            pipline.push({
                $group: {
                    _id: '$attempt_id',
                    subjectMarks: {
                        $push: {
                            'name': '$_id.name',
                            'marks': '$obtainMarks'
                        }
                    },
                    totalQuestion: {
                        $first: '$totalQuestions'
                    },
                    studentName: {
                        $first: '$studentName'
                    },
                    isEvaluated: {
                        $first: '$isEvaluated'
                    },
                    isAbandoned: {
                        $first: "$isAbandoned"
                    },
                    totalCorrects: {
                        $first: '$totalCorrects'
                    },
                    totalMissed: {
                        $first: '$totalMissed'
                    },
                    totalErrors: {
                        $first: '$totalErrors'
                    },
                    totalPartial: {
                        $first: '$totalPartial'
                    },
                    totalMark: {
                        $first: '$totalMark'
                    },
                    accessMode: {
                        $first: '$practiceSetInfo.accessMode'
                    },
                    practiceSetInfo: {
                        $first: '$practiceSetInfo'
                    },
                    totalTimeTaken: {
                        $first: '$totalTimeTaken'
                    },
                    user: {
                        $first: '$user'
                    },
                    questionPractice: {
                        $sum: '$questionPractice'
                    },
                    doQuestion: {
                        $sum: '$doQuestion'
                    },
                    createdBy: {
                        $first: '$createdBy'
                    },
                    createdAt: {
                        $first: '$createdAt'
                    },
                    updatedAt: {
                        $first: '$updatedAt'
                    },
                    totalTestMark: {
                        $sum: '$totalTestMark'
                    },
                    offscreenTime: {
                        $first: "$offscreenTime"
                    },
                    fraudDetected: {
                        $first: "$fraudDetected"
                    },
                    screenSwitched: {
                        $sum: '$screenSwitched'
                    },
                    fraudPenalty: {
                        $first: "$fraudPenalty"
                    },
                    face_detection: {
                        $first: "$face_detection"
                    }
                }
            })

            if (req.query.searchText) {
                // Get userInfo data for searching
                pipline.push({
                    $lookup: {
                        from: 'users',
                        let: { uid: "$user" },
                        pipeline: [{
                            $match: {
                                $expr: { $eq: ["$_id", "$$uid"] }
                            }
                        },
                        { $project: { name: 1, firstName: 1, lastName: 1, userId: 1, identificationNumber: 1, rollNumber: 1, gender: 1, birthdate: 1, state: 1, city: 1, coreBranch: 1, collegeName: 1, passingYear: 1, 'avatarSM': 1, 'avatar': 1, } }
                        ],
                        as: 'userInfo'
                    }
                })

                pipline.push({
                    $unwind: '$userInfo'
                })

                pipline.push({
                    $match: {
                        $or: [{
                            'userInfo.name': {
                                "$regex": req.query.searchText,
                                "$options": "i"
                            }
                        }, {
                            'userInfo.firstName': {
                                "$regex": req.query.searchText,
                                "$options": "i"
                            }
                        }, {
                            'userInfo.lastName': {
                                "$regex": req.query.searchText,
                                "$options": "i"
                            }
                        }, {
                            'userInfo.userId': req.query.searchText
                        }, {
                            'userInfo.rollNumber': {
                                "$regex": req.query.searchText,
                                "$options": "i"
                            }
                        }]
                    }
                })
            }

            let facet: any = {
                attempts: []
            }

            let attemptProject: any = {
                _id: '$_id',
                totalMissed: 1,
                totalCorrects: 1,
                totalPartial: 1,
                isEvaluated: 1,
                isAbandoned: 1,
                studentName: 1,
                totalTimeTaken: 1,
                questionPractice: 1,
                createdBy: 1,
                createdAt: 1,
                updatedAt: 1,
                totalTimeTakenMi: {
                    $cond: [{
                        $eq: ['$totalTimeTaken', 0]
                    }, 0, {
                        '$divide': ['$totalTimeTaken', 60000]
                    }]
                },
                totalErrors: 1,
                totalQuestion: {
                    $ifNull: ['$totalQuestion', '$questionPractice']
                },
                avgTime: {
                    $cond: [{
                        $eq: ['$doQuestion', 0]
                    }, 0, {
                        '$divide': ['$totalTimeTaken', '$doQuestion']
                    }]
                },
                practiceSetInfo: 1,

                accessMode: '$practiceSetInfo.accessMode',
                classroom: '$practiceSetInfo.classRooms',
                pecentCorrects: {
                    $multiply: [{
                        $cond: [{
                            $eq: ['$totalTestMark', 0]
                        }, 0, {
                            '$divide': ['$totalMark', '$totalTestMark']
                        }]
                    },
                        100
                    ]
                },
                createdAtFormat: {
                    $substr: ['$createdAt', 0, 10]
                },
                updatedAtFormat: {
                    $substr: ['$updatedAt', 0, 10]
                },
                user: 1,
                totalMark: 1,
                totalTestMark: 1,
                subjectMarks: 1,
                offscreenTime: 1,
                screenSwitched: 1,
                fraudPenalty: 1,
                face_detection: 1,
                fraud: { $cond: [{ $eq: ["$fraudDetected", null] }, 0, { "$size": "$fraudDetected" }] }
            }

            if (req.query.searchText) {
                attemptProject.userInfo = 1
            }

            facet.attempts.push({
                $project: attemptProject
            })

            var sort: any = {
                $sort: {
                    totalTimeTaken: 1
                }
            }

            if (req.query.sort) {
                var dataSort = req.query.sort.split(',')
                var temp = '{"' + dataSort[0] + '":' + dataSort[1] + ' }'
                var jsonArray = JSON.parse(temp)
                sort = {
                    $sort: jsonArray
                }
            } else if (req.query.topPerformers) {
                sort = {
                    $sort: {
                        pecentCorrects: 1
                    }
                }
            }

            if (req.query.topPerformers) {
                facet.attempts.push({
                    $group: {
                        _id: '$user',
                        pecentCorrects: { $first: '$pecentCorrects' },
                        totalMark: { $first: '$totalMark' },
                        avgTime: { $first: '$avgTime' },
                        user: { $first: '$user' }
                    }
                })
            }

            // For optimization: if there is searchText, userInfo is already filled for searching,
            // Otherwise it does exists yet => fetch it.
            if (!req.query.searchText) {
                facet.attempts.push({
                    $lookup: {
                        from: 'users',
                        let: { uid: "$user" },
                        pipeline: [{
                            $match: {
                                $expr: { $eq: ["$_id", "$$uid"] }
                            }
                        },
                        { $project: { name: 1, userId: 1, identificationNumber: 1, rollNumber: 1, gender: 1, birthdate: 1, state: 1, city: 1, coreBranch: 1, collegeName: 1, passingYear: 1, 'avatarSM': 1, 'avatar': 1, } }
                        ],
                        as: 'userInfo'
                    }
                })

                facet.attempts.push({
                    $unwind: '$userInfo'
                })
            }

            if (req.query.topPerformers) {
                facet.attempts.push({
                    $addFields: {
                        studentName: '$userInfo.name',
                        avatarUrl: { $cond: [{ $ne: ['$userInfo.avatarSM', null] }, '$userInfo.avatarSM.fileUrl', '$userInfo.avatar.fileUrl'] }
                    }
                })
            } else {
                facet.attempts.push({
                    $addFields: {
                        studentName: '$userInfo.name',
                        fullName: { $concat: ['$userInfo.firstName', " ", '$userInfo.lastName'] },
                        userId: '$userInfo.userId',
                        identificationNumber: '$userInfo.identificationNumber',
                        rollNumber: '$userInfo.rollNumber',
                        gender: '$userInfo.gender',
                        birthdate: '$userInfo.birthdate',
                        state: '$userInfo.state',
                        city: '$userInfo.city',
                        coreBranch: "$userInfo.coreBranch",
                        collegeName: "$userInfo.collegeName",
                        passingYear: '$userInfo.passingYear',
                        avatarUrl: { $cond: [{ $ne: ['$userInfo.avatarSM', null] }, '$userInfo.avatarSM', '$userInfo.avatar'] }
                    }
                })
                if (req.query.classroom) {
                    facet.attempts.push({
                        $lookup: {
                            from: 'classrooms',
                            let: { uid: "$classroom" },
                            pipeline: [{
                                $match: {
                                    $expr: { $in: ["$_id", "$$uid"] }
                                }
                            },
                            { $project: { name: 1 } }],
                            as: 'classInfo'
                        }
                    })
                }

                facet.attempts.push({
                    $project: {
                        totalMissed: 1,
                        isEvaluated: 1,
                        totalCorrects: 1,
                        isAbandoned: 1,
                        totalPartial: 1,
                        totalTimeTakenMi: 1,
                        totalTimeTaken: 1,
                        totalErrors: 1,
                        totalQuestions: '$totalQuestion',
                        avgTime: 1,
                        practiceSetInfo: '$practiceSetInfo.title',
                        accessMode: 1,
                        pecentCorrects: 1,
                        totalMark: 1,
                        _id: 1,
                        classroom: 1,
                        createdBy: '$createdBy.name',
                        createdAt: '$createdAtFormat',
                        startTime: '$createdAt',
                        owner: '$createdBy.user',
                        updatedAt: '$updatedAtFormat',
                        endTime: '$updatedAt',
                        user: 1,
                        totalTestMark: 1,
                        subjectMarks: 1,
                        offscreenTime: 1,
                        fraud: 1,
                        screenSwitched: 1,
                        fraudPenalty: 1,
                        face_detection: 1,
                        classInfo: 1,
                        studentName: 1,
                        fullName: 1,
                        userId: 1,
                        identificationNumber: 1,
                        rollNumber: 1,
                        gender: 1,
                        birthdate: 1,
                        state: 1,
                        city: 1,
                        coreBranch: 1,
                        collegeName: 1,
                        passingYear: 1,
                        avatar: "$avatarUrl"
                    }
                })

                facet.attempts.push(sort)
            }
            if (req.query.page || req.query.limit) {
                var page = req.query.page ? req.query.page : 1
                var limit = req.query.limit ? req.query.limit : 20

                facet.attempts.push({
                    $skip: (page - 1) * limit
                })

                facet.attempts.push({
                    $limit: limit
                })
            }
            if (req.query.includeCount) {
                facet.count = [{ $count: 'total' }]
            }

            pipline.push({
                $facet: facet
            })

            this.attemptRepository.setInstanceKey(req.instancekey);
            const results = await this.attemptRepository.aggregate(pipline, { allowDiskUse: true })

            if (!results[0]) {
                return { count: 0, attempts: [] }
            }

            let result: any = results[0]

            if (result.count) {
                result.count = result.count[0] ? result.count[0].total : 0
            }

            if (result.attempts) {
                result.attempts.forEach((at, aI) => {
                    if (at.classInfo && at.classInfo.length) {
                        at.classInfo.forEach((cls, cI) => {
                            if (cI === 0) {
                                result.attempts[aI].classroomName = cls.name
                            } else {
                                result.attempts[aI].classroomName = result.attempts[aI].classroomName + "," + cls.name
                            }
                        })
                        delete at.classInfo;
                    } else {
                        result.attempts[aI].classroomName = ''
                    }

                    // Add transformation logic for face_detection to faceDetection here
                    if (at.face_detection) {
                        at.faceDetection = at.face_detection;
                        delete at.face_detection;
                    }
                })

                let totalCount = result.attempts.length;
                if (req.query.topPerformers) {
                    let limit = result.attempts.length > 5 ? 5 : result.attempts.length;
                    let toReturn = []
                    for (let i = 0; i < limit; i++) {
                        this.calculatePercentile(result.attempts[i], result.attempts)
                        toReturn.push(result.attempts[i])
                    }
                    result.attempts = toReturn
                }
                if (totalCount > 10) {
                    // cache result for 15 minutes if there are more than 10 students
                    this.redisCaching.set(req, 'summary_attempts_' + req.practicesetId, result, 60 * 15)
                }
            }

            return { ...result }
        } catch (err) {
            Logger.error(err);
            throw "Internal server Error"
        }
    }

    async summaryAttemptedTestSeries(request: SummaryAttemptedTestSeriesReq) {
        try {
            // Immediate return for a quick response
            if (request.query.topPerformers) {
                const savedSummary = await this.redisCaching.getAsync(
                    request.instancekey,
                    'summary_attempts_testSeries' + request._id
                );

                if (savedSummary) {
                    return savedSummary;
                }
            }

            this.testSeriesRepository.setInstanceKey(request.instancekey)
            this.practicesetRespository.setInstanceKey(request.instancekey)
            const testSeries = await this.testSeriesRepository.findById(request._id);

            const tests = await this.practicesetRespository.find({ _id: { $in: testSeries.practiceIds } });
            let totalResults = [];

            for (let test of tests) {
                let condition = {
                    practicesetId: test._id,
                    ongoing: { $ne: true }
                };

                if (request.query.classroom) {
                    condition['practiceSetInfo.classRooms'] = {
                        $in: request.query.classroom.split(',').map(c => new Types.ObjectId(c))
                    };
                } else if (request.user) {
                    const userRole = request.user.roles;
                    if (test.accessMode === 'invitation') {
                        if (userRole.includes(config.roles.teacher)) {
                            const classes = await this.classroomRepository.distinct('_id', {
                                $or: [
                                    { user: new ObjectId(request.user._id) },
                                    { owners: new ObjectId(request.user._id) }
                                ]
                            });
                            condition['practiceSetInfo.classRooms'] = { $in: classes };
                        } else if (userRole.includes(config.roles.centerHead)) {
                            const classes = await this.classroomRepository.distinct('_id', {
                                location: { $in: request.user.locations.map(l => new ObjectId(l)) }
                            });
                            condition['practiceSetInfo.classRooms'] = { $in: classes };
                        }
                    } else {
                        if (userRole.includes(config.roles.teacher)) {
                            const classes = await this.classroomRepository.find({
                                $or: [
                                    { user: new ObjectId(request.user._id) },
                                    { owners: new ObjectId(request.user._id) }
                                ]
                            }, { students: 1 });

                            let students = [];
                            classes.forEach(cl => {
                                students = students.concat(cl.students.map(s => s.studentId));
                            });

                        } else if (userRole.includes(config.roles.centerHead)) {
                            const classes = await this.classroomRepository.find({
                                location: { $in: request.user.locations.map(l => new ObjectId(l)) }
                            });

                            let students = [];
                            classes.forEach(cl => {
                                students = students.concat(cl.students.map(s => s.studentId));
                            });

                            condition['user'] = { $in: students };
                        }
                    }
                }

                let pipeline: any = [
                    { $match: condition },
                    globals.lookup,
                    globals.unw,
                    globals.add,
                    globals.pro,
                    { $unwind: '$QA' },
                    {
                        $project: {
                            'subject._id': '$QA.subject._id',
                            'subject.name': '$QA.subject.name',
                            'subject.attempt_id': '$_id',
                            QA: 1,
                            studentName: 1,
                            totalQuestions: 1,
                            totalCorrects: 1,
                            isEvaluated: 1,
                            isAbandoned: 1,
                            totalMissed: 1,
                            totalErrors: 1,
                            totalMark: 1,
                            practiceSetInfo: 1,
                            totalTime: 1,
                            user: 1,
                            createdBy: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            offscreenTime: 1,
                            fraudDetected: 1,
                            screenSwitched: {
                                "$cond": [{
                                    "$not": ["$QA.offscreen"]
                                }, 0, {
                                    "$size": "$QA.offscreen"
                                }]
                            },
                            fraudPenalty: 1,
                            face_detection: 1
                        }
                    },
                    {
                        $group: {
                            _id: '$subject',
                            attempt_id: { $first: '$_id' },
                            totalQuestion: { $first: '$totalQuestions' },
                            isEvaluated: { $first: '$isEvaluated' },
                            studentName: { $first: '$studentName' },
                            isAbandoned: { $first: "$isAbandoned" },
                            totalCorrects: { $first: '$totalCorrects' },
                            totalMissed: { $first: '$totalMissed' },
                            totalErrors: { $first: '$totalErrors' },
                            totalMark: { $first: '$totalMark' },
                            accessMode: { $first: '$practiceSetInfo.accessMode' },
                            practiceSetInfo: { $first: '$practiceSetInfo' },
                            totalTimeTaken: { $first: '$totalTime' },
                            user: { $first: '$user' },
                            questionPractice: { $sum: 1 },
                            doQuestion: {
                                $sum: {
                                    $cond: [{ $eq: ["$QA.status", 3] }, 0, 1]
                                }
                            },
                            createdBy: { $first: '$createdBy' },
                            createdAt: { $first: '$createdAt' },
                            updatedAt: { $first: '$updatedAt' },
                            obtainMarks: { $sum: '$QA.obtainMarks' },
                            totalTestMark: { $sum: '$QA.actualMarks' },
                            offscreenTime: { $first: "$offscreenTime" },
                            fraudDetected: { $first: "$fraudDetected" },
                            screenSwitched: { $sum: '$screenSwitched' },
                            fraudPenalty: { $first: "$fraudPenalty" },
                            face_detection: { $first: "$face_detection" }
                        }
                    },
                    {
                        $group: {
                            _id: '$attempt_id',
                            subjectMarks: {
                                $push: {
                                    'name': '$_id.name',
                                    'marks': '$obtainMarks'
                                }
                            },
                            totalQuestion: { $first: '$totalQuestions' },
                            studentName: { $first: '$studentName' },
                            isEvaluated: { $first: '$isEvaluated' },
                            isAbandoned: { $first: "$isAbandoned" },
                            totalCorrects: { $first: '$totalCorrects' },
                            totalMissed: { $first: '$totalMissed' },
                            totalErrors: { $first: '$totalErrors' },
                            totalMark: { $first: '$totalMark' },
                            accessMode: { $first: '$practiceSetInfo.accessMode' },
                            practiceSetInfo: { $first: '$practiceSetInfo' },
                            totalTimeTaken: { $first: '$totalTimeTaken' },
                            user: { $first: '$user' },
                            questionPractice: { $sum: '$questionPractice' },
                            doQuestion: { $sum: '$doQuestion' },
                            createdBy: { $first: '$createdBy' },
                            createdAt: { $first: '$createdAt' },
                            updatedAt: { $first: '$updatedAt' },
                            totalTestMark: { $sum: '$totalTestMark' },
                            offscreenTime: { $first: "$offscreenTime" },
                            fraudDetected: { $first: "$fraudDetected" },
                            screenSwitched: { $sum: '$screenSwitched' },
                            fraudPenalty: { $first: "$fraudPenalty" },
                            face_detection: { $first: "$face_detection" }
                        }
                    }
                ];

                if (request.query.searchText) {
                    pipeline.push(
                        {
                            $lookup: {
                                from: 'users',
                                let: { uid: "$user" },
                                pipeline: [
                                    { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
                                    {
                                        $project: {
                                            name: 1, firstName: 1, lastName: 1, userId: 1, identificationNumber: 1, rollNumber: 1, gender: 1, birthdate: 1, state: 1, city: 1, coreBranch: 1, collegeName: 1, passingYear: 1, 'avatarSM.fileUrl': 1, 'avatar.fileUrl': 1,
                                        }
                                    }
                                ],
                                as: 'userInfo'
                            }
                        },
                        { $unwind: '$userInfo' },
                        {
                            $match: {
                                $or: [
                                    { 'userInfo.name': { "$regex": request.query.searchText, "$options": "i" } },
                                    { 'userInfo.firstName': { "$regex": request.query.searchText, "$options": "i" } },
                                    { 'userInfo.lastName': { "$regex": request.query.searchText, "$options": "i" } },
                                    { 'userInfo.userId': request.query.searchText },
                                    { 'userInfo.rollNumber': { "$regex": request.query.searchText, "$options": "i" } }
                                ]
                            }
                        }
                    );
                }

                let facet: any = { attempts: [] };

                let attemptProject: any = {
                    _id: '$_id',
                    totalMissed: 1,
                    totalCorrects: 1,
                    isEvaluated: 1,
                    isAbandoned: 1,
                    studentName: 1,
                    totalTimeTaken: 1,
                    questionPractice: 1,
                    createdBy: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    totalTimeTakenMi: {
                        $cond: [{ $eq: ['$totalTimeTaken', 0] }, 0, { '$divide': ['$totalTimeTaken', 60000] }]
                    },
                    totalErrors: 1,
                    totalQuestion: { $ifNull: ['$totalQuestion', '$questionPractice'] },
                    avgTime: { $cond: [{ $eq: ['$doQuestion', 0] }, 0, { '$divide': ['$totalTimeTaken', '$doQuestion'] }] },
                    practiceSetInfo: 1,
                    accessMode: '$practiceSetInfo.accessMode',
                    classroom: '$practiceSetInfo.classRooms',
                    pecentCorrects: { $multiply: [{ $cond: [{ $eq: ['$totalTestMark', 0] }, 0, { '$divide': ['$totalMark', '$totalTestMark'] }] }, 100] },
                    createdAtFormat: { $substr: ['$createdAt', 0, 10] },
                    updatedAtFormat: { $substr: ['$updatedAt', 0, 10] },
                    user: 1,
                    totalMark: 1,
                    totalTestMark: 1,
                    subjectMarks: 1,
                    offscreenTime: 1,
                    screenSwitched: 1,
                    fraudPenalty: 1,
                    face_detection: 1,
                    fraud: { $cond: [{ $eq: ["$fraudDetected", null] }, 0, { "$size": "$fraudDetected" }] }
                };

                if (request.query.searchText) {
                    attemptProject['userInfo'] = 1;
                }

                facet.attempts.push({ $project: attemptProject });

                let sort: any = { $sort: { totalTimeTaken: 1 } };

                if (request.query.sort) {
                    const [field, order] = request.query.sort.split(',');
                    sort = { $sort: { [field]: parseInt(order) } };
                } else if (request.query.topPerformers) {
                    sort = { $sort: { pecentCorrects: 1 } };
                }

                if (request.query.topPerformers) {
                    facet.attempts.push({
                        $group: {
                            _id: '$user',
                            pecentCorrects: { $first: '$pecentCorrects' },
                            totalMark: { $first: '$totalMark' },
                            avgTime: { $first: '$avgTime' },
                            user: { $first: '$user' }
                        }
                    });
                }

                if (!request.query.searchText) {
                    facet.attempts.push(
                        {
                            $lookup: {
                                from: 'users',
                                let: { uid: "$user" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$_id", "$$uid"] }
                                        }
                                    },
                                    {
                                        $project: {
                                            name: 1, userId: 1, identificationNumber: 1, rollNumber: 1, gender: 1, birthdate: 1, state: 1, city: 1, coreBranch: 1, collegeName: 1, passingYear: 1, 'avatarSM.fileUrl': 1, 'avatar.fileUrl': 1,
                                        }
                                    }
                                ],
                                as: 'userInfo'
                            }
                        },
                        { $unwind: '$userInfo' }
                    );
                }

                if (request.query.topPerformers) {
                    facet.attempts.push({
                        $addFields: {
                            studentName: '$userInfo.name',
                            avatarUrl: { $cond: [{ $ne: ['$userInfo.avatarSM', null] }, '$userInfo.avatarSM.fileUrl', '$userInfo.avatar.fileUrl'] }
                        }
                    });
                } else {
                    facet.attempts.push({
                        $addFields: {
                            studentName: '$userInfo.name',
                            fullName: { $concat: ['$userInfo.firstName', " ", '$userInfo.lastName'] },
                            userId: '$userInfo.userId',
                            identificationNumber: '$userInfo.identificationNumber',
                            rollNumber: '$userInfo.rollNumber',
                            gender: '$userInfo.gender',
                            birthdate: '$userInfo.birthdate',
                            state: '$userInfo.state',
                            city: '$userInfo.city',
                            coreBranch: "$userInfo.coreBranch",
                            collegeName: "$userInfo.collegeName",
                            passingYear: '$userInfo.passingYear',
                            avatarUrl: { $cond: [{ $ne: ['$userInfo.avatarSM', null] }, '$userInfo.avatarSM.fileUrl', '$userInfo.avatar.fileUrl'] }
                        }
                    });

                    if (request.query.classroom) {
                        facet.attempts.push({
                            $lookup: {
                                from: 'classrooms',
                                let: { uid: "$classroom" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $in: ["$_id", "$$uid"] }
                                        }
                                    },
                                    { $project: { name: 1 } }
                                ],
                                as: 'classInfo'
                            }
                        });
                    }

                    facet.attempts.push({
                        $project: {
                            totalMissed: 1,
                            isEvaluated: 1,
                            totalCorrects: 1,
                            isAbandoned: 1,
                            totalTimeTakenMi: 1,
                            totalTimeTaken: 1,
                            totalErrors: 1,
                            totalQuestions: '$totalQuestion',
                            avgTime: 1,
                            practiceSetInfo: '$practiceSetInfo.title',
                            accessMode: 1,
                            pecentCorrects: 1,
                            totalMark: 1,
                            _id: 1,
                            classroom: 1,
                            createdBy: '$createdBy.name',
                            createdAt: '$createdAtFormat',
                            startTime: '$createdAt',
                            owner: '$createdBy.user',
                            updatedAt: '$updatedAtFormat',
                            endTime: '$updatedAt',
                            user: 1,
                            totalTestMark: 1,
                            subjectMarks: 1,
                            offscreenTime: 1,
                            fraud: 1,
                            screenSwitched: 1,
                            fraudPenalty: 1,
                            face_detection: 1,
                            classInfo: 1,
                            studentName: 1,
                            fullName: 1,
                            userId: 1,
                            identificationNumber: 1,
                            rollNumber: 1,
                            gender: 1,
                            birthdate: 1,
                            state: 1,
                            city: 1,
                            coreBranch: 1,
                            collegeName: 1,
                            passingYear: 1,
                            avatarUrl: 1
                        }
                    });

                    facet.attempts.push(sort);
                }

                if (request.query.page || request.query.limit) {
                    const page = request.query.page ? request.query.page : 1;
                    const limit = request.query.limit ? request.query.limit : 20;

                    facet.attempts.push({ $skip: (page - 1) * limit });
                    facet.attempts.push({ $limit: limit });
                }

                if (request.query.includeCount) {
                    facet.count = [{ $count: 'total' }];
                }

                pipeline.push({ $facet: facet });

                const results: any = await this.attemptRepository.aggregate(pipeline, { allowDiskUse: true });

                if (!results[0]) {
                    return { count: 0, attempts: [] };
                }

                let result = results[0];
                if (result.count) {
                    result.count = result.count[0] ? result.count[0].total : 0;
                }

                if (result.attempts && result.attempts.length > 0) {
                    result.attempts.forEach((at, aI) => {
                        if (at.classInfo && at.classInfo.length) {
                            at.classInfo.forEach((cls, cI) => {
                                if (cI === 0) {
                                    result.attempts[aI].classroomName = cls.name;
                                } else {
                                    result.attempts[aI].classroomName = result.attempts[aI].classroomName + "," + cls.name;
                                }
                            });
                            delete at.classInfo;
                        } else {
                            result.attempts[aI].classroomName = '';
                        }
                    });
                }
                totalResults.push(result);
            }

            return { response: totalResults };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async summaryPsychoPractice(request: SummaryPsychoPracticeRequest) {
        try {
            var condition: any = {
                practiceset: new Types.ObjectId(request.practicesetId)
            }

            if (request.query.classroom) {
                condition.classrooms = { $in: request.query.classroom.split(',').map(c => new Types.ObjectId(c)) }
            } else if (request.user.role == config.roles.teacher) {
                this.classroomRepository.setInstanceKey(request.instancekey)
                let classes = await this.classroomRepository.distinct("_id", {
                    $or: [
                        {
                            user: new Types.ObjectId(request.user._id)
                        }, {
                            owners: new Types.ObjectId(request.user._id)
                        }
                    ]
                })

                condition.classrooms = { $in: classes }
            } else if (request.user.role == config.roles.centerHead) {
                this.classroomRepository.setInstanceKey(request.instancekey)
                let classes = await this.classroomRepository.distinct("_id", {
                    location: {
                        $in: request.user.locations.map(id => new Types.ObjectId(id))
                    }
                })
            }

            let pipe: any = [{ $match: condition }]

            pipe.push({
                $lookup: {
                    from: 'users',
                    let: { uid: "$user" },
                    pipeline: [{
                        $match: {
                            $expr: { $eq: ["$_id", "$$uid"] }
                        }
                    },
                    { $project: { name: 1, userId: 1, rollNumber: 1 } }
                    ],
                    as: 'userData'
                }
            })

            pipe.push({
                $unwind: '$userData'
            })

            if (request.query.searchText) {
                pipe.push({
                    $match: {
                        $or: [{
                            'userData.name': {
                                "$regex": request.query.searchText,
                                "$options": "i"
                            }
                        }, {
                            'userData.userId': {
                                "$regex": request.query.searchText,
                                "$options": "i"
                            }
                        }, {
                            'userData.email': request.query.searchText
                        }]
                    }
                })
            }

            var page = request.query.page ? request.query.page : 1
            var limitData = request.query.limit ? request.query.limit : 20

            let facet: any = {
                attempts: [{
                    $skip: (page - 1) * limitData
                },
                {
                    $limit: parseInt(limitData.toString())
                },
                {
                    $project: {
                        user: '$userData',
                        createdAt: '$createdAt',
                        neuroticism: '$analysis.Neuroticism.score',
                        extraversion: '$analysis.Extraversion.score',
                        openness: '$analysis.Openness To Experience.score',
                        agreeableness: '$analysis.Agreeableness.score',
                        conscientiousness: '$analysis.Conscientiousness.score',
                    }
                }
                ]
            }

            if (request.query.includeCount) {
                facet.total = [
                    { $count: 'all' }
                ]
            }

            pipe.push({
                $facet: facet
            })

            this.psychoResultRepository.setInstanceKey(request.instancekey);

            let result: any = await this.psychoResultRepository.aggregate(pipe)

            result = result[0]
            if (result.total) {
                result.total = result.total[0] ? result.total[0].all : 0
            } else {
                result.total = 0
            }
            return { result }

        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async summaryOnePracticeSet(request: SummaryOnePracticeSetRequest) {
        try {
            var condition: any = {}
            var group = {}
            var match = {}
            var lastDate = null
            if (request.query.lastDay) {
                lastDate = new Date()
                lastDate = lastDate.setTime(request.query.lastDay)
            }

            if (request.query.lastMonth) {
                lastDate = new Date()
                lastDate = lastDate.setTime(request.query.lastMonth)
            }

            if (lastDate != null) {
                condition['createdAt'] = {
                    $gte: new Date(lastDate)
                }
            }

            this.practicesetRespository.setInstanceKey(request.instancekey)

            let test = await this.practicesetRespository.findById(new Types.ObjectId(request.practicesetId))

            if (test.testType == "psychometry") {
                condition['practiceset'] = new Types.ObjectId(request.practicesetId)
            } else {
                condition.isAbandoned = false;
                condition['practicesetId'] = new Types.ObjectId(request.practicesetId)
            }

            match = {
                $match: condition
            }
            group = {
                $group: {
                    _id: {
                        year: {
                            $year: '$createdAt'
                        },
                        month: {
                            $month: '$createdAt'
                        },
                        day: {
                            $dayOfMonth: '$createdAt'
                        }
                    },
                    created: {
                        '$first': '$createdAt'
                    },
                    number: {
                        $sum: 1
                    }
                }
            }
            var project = {
                $project: {
                    _id: '$created',
                    day: '$_id',
                    number: '$number'
                }
            }
            var sort = {
                $sort: {
                    'created': 1
                }
            }

            if (test.testType == "psychometry") {
                this.psychoResultRepository.setInstanceKey(request.instancekey)
                let result = await this.practicesetRespository.aggregate([match, group, sort, project])

                return { result }
            } else {
                this.attemptRepository.setInstanceKey(request.instancekey)
                let results = await this.attemptRepository.aggregate([match, group, sort, project])

                return { results }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getResultPractice(request: GetResultPracticeRequest) {
        try {
            var condition: any = {
                practicesetId: new Types.ObjectId(request.practicesetId)
            }
            if (request.query.attemptId) {
                condition._id = new Types.ObjectId(request.query.attemptId)
            }

            this.attemptRepository.setInstanceKey(request.instancekey)
            let attempt = await this.attemptRepository.findOne(condition);
            attempt = await this.attemptRepository.populate(attempt, {
                path: 'attemptdetails',
                select: '-_id QA',
                populate: {
                    path: 'QA.question'
                }
            })

            attempt = this.removeAttemptDetails(attempt)
            return { attempt }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAvailableTests(request: FindAllRequest) {
        try {
            const page = request.query.page ? (request.query.page, 10) : 1;
            const limit = request.query.limit ? (request.query.limit, 10) : 20;
            let sort: any = { pinTop: -1, statusChangedAt: -1 };

            if (request.query.sort) {
                const [sortField, sortOrder] = request.query.sort.split(',');
                sort = sortOrder === 'desc' ? { pinTop: -1, [sortField]: -1 } : { pinTop: -1, [sortField]: 1 };
            }

            const skip = request.query.skip ? request.query.skip : (page - 1) * limit;

            const basicFilter = await this.baseFilter(request);
            if (request.query.tags) {
                basicFilter.tags = request.query.tags;
            }
            if (request.query.upcoming) {
                basicFilter.startDate = { $gte: new Date() };
            }
            basicFilter.isAdaptive = request.query.adaptive ?? false;

            const filter = await this.getAvaiableTestFilter(request);

            if (request.user) {
                const response = await this.getPracticeSetTests(basicFilter, sort, skip, limit, page, request, filter);

                return response

            } else {
                basicFilter.allowStudent = true;
                this.practicesetRespository.setInstanceKey(request.instancekey);
                var practiceSets = await this.practicesetRespository
                    .find({ ...basicFilter, ...filter },
                        'title countries pinTop autoEvaluation questionsToDisplay totalQuestion price totalTime testCode testMode totalJoinedStudent accessMode rating status statusChangedAt units subjects userInfo slugfly allowStudent', // Projection
                        {
                            sort,
                            skip,
                            limit,
                            lean: true
                        });

                for (var practiceSet of practiceSets) {
                    practiceSet.isFavorite = false;

                    practiceSet.totalAttempt = await this.countAttemptPractice(request, practiceSet);
                }
                return { results: practiceSets };
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAttempts(request: GetAttemptsRequest) {
        try {
            var page = (request.query.page) ? request.query.page : 1;
            var limit = (request.query.limit) ? request.query.limit : 20;
            var sort: any = { "createdAt": -1 };

            if (request.query.sort) {
                if (request.query.sort.split(',')[0] === 'createdBy.name')
                    sort = { 'createdBy.name': -1 }
            }

            var skip = (page - 1) * limit
            var filter: any = this.getAttemptFilter(request, request.user)

            filter.push({
                user: new Types.ObjectId(request.user._id)
            })

            let project: any = {}

            if (request.query.home) {
                project = {
                    isShowAttempt: 1,
                    isEvaluated: 1,
                    _id: 1,
                    createdAt: 1,
                    isAbandoned: 1,
                    ongoing: 1,
                    totalMark: 1,
                    maximumMarks: 1,
                    totalQuestions: 1,
                    totalMissed: 1,
                    totalTime: 1,
                    totalCorrects: 1,
                    attemptdetails: 1,
                    partiallyAttempted: 1

                }
            }

            this.attemptRepository.setInstanceKey(request.instancekey);

            let attempts: any = await this.attemptRepository.find({
                $and: filter
            }, project, {
                sort: sort,
                skip: skip,
                limit: limit
            })

            attempts = await this.attemptRepository.populate(attempts, {
                path: 'attemptdetails',
                select: '-_id QA',
            })

            for (let attempt of attempts) {
                attempt = this.removeAttemptDetails(attempt)
                attempt.averageTime = 0;
                if (attempt.QA) {
                    var totalViewedQuestion = 0
                    var totalTimeTaken = 0

                    for (var i in attempt.QA) {
                        if (attempt.QA[i].timeEslapse) {
                            totalViewedQuestion = totalViewedQuestion + 1
                            totalTimeTaken = totalTimeTaken + attempt.QA[i].timeEslapse
                        }
                    }
                    if (totalTimeTaken > 0) {
                        attempt.averageTime = ((totalTimeTaken / 1000) / (totalViewedQuestion)).toFixed(0)
                    }
                }
                delete attempt.QA
            }
            return { attempts }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async countAttempts(request: CountAttemptsRequest) {
        try {
            var filter: any = this.getAttemptFilter(request, request.user)
            filter.push({
                user: new Types.ObjectId(request.user._id)
            })
            filter.push({
                $or: [{
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
            })
            filter.push({
                isAbandoned: false
            })
            filter.push({
                isEvaluated: true
            })

            this.attemptRepository.setInstanceKey(request.instancekey);
            let count = await this.attemptRepository.countDocuments({ $and: filter })

            count = count ? count : 0;
            return { count }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAttempt(request: GetAttemptRequest) {
        try {
            var condition = {}
            if (request.attemptId.length === 24 && checkForHexRegExp.test(request.attemptId)) {
                condition['_id'] = new Types.ObjectId(request.attemptId)
            } else {
                condition['idOffline'] = new Types.ObjectId(request.attemptId)
            }
            let attempt = await this.findOneAttempt(request, condition)
            return { ...attempt }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAwsFaceRegSignedUrl(request: GetAwsFaceRegSignedUrlRequest) {
        let idx = config.dbs.findIndex(db => db.instancekey == request.instancekey)

        if (idx == -1) {
            throw "Bad Request"
        }
        try {
            let database = config.dbs[idx].url.substr(config.dbs[idx].url.indexOf('/') + 1)

            let fileName = (request.query.fileName ? request.query.fileName : (new Date()).toISOString().split('.')[0]) + '.jpg'
            let filePath = `faceReg/${database}/attempts/${request.attemptId}/${fileName}`

            if (request.query.baseImage) {
                fileName = request.user._id.toString() + '.jpg'
                filePath = `faceReg/${database}/students/${fileName}`
            }
            let signedObj = await this.s3Service.faceRegSignedUrl(filePath)

            return { signedObj }

        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getUserAssetsSignedUrl(request: GetUserAssetsSignedUrlRequest) {
        if (!request.query.fileName) {
            throw "FileName is missing"
        }
        try {
            let idx = config.dbs.findIndex(db => db.instancekey == request.instancekey)

            if (idx == -1) {
                throw "Bad request"
            }

            let rootFolder = config.dbs[idx].assets

            let fileName = request.query.fileName
            let generalFilePath = `/uploads/attempts/${request.attemptId}/${fileName}`
            let filePath = `${rootFolder}/uploads/attempts/${request.attemptId}/${fileName}`

            let data = await this.s3Service.userAssetSignedUrl(filePath, 'binary/octet-stream')

            return {
                signedUrl: data,
                fileUrl: generalFilePath
            }
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getRecordingsSignedUrl(request: GetRecordingsSignedUrlRequest) {
        if (!request.query.fileName) {
            throw "FileName is missing"
        }
        try {
            let idx = config.dbs.findIndex(db => db.instancekey == request.instanceKey)

            if (idx == -1) {
                throw "Bad request"
            }

            let rootFolder = config.dbs[idx].assets

            let fileName = request.query.fileName
            let generalFilePath = `/uploads/recordings/${request.attemptId}/${fileName}`
            let filePath = `${rootFolder}/uploads/recordings/${request.attemptId}/${fileName}`

            let data = await this.s3Service.getSignedUrl(filePath, 'video/webm');

            return data;
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getQrUploadSignedUrl(request: GetQrUploadSignedUrlRequest) {
        if (!request.query.fileName) {
            throw "FileName is missing"
        }
        try {
            let idx = config.dbs.findIndex(db => db.instancekey == request.instanceKey)

            if (idx == -1) {
                throw "Bad request"
            }

            let rootFolder = config.dbs[idx].assets

            let fileName = request.query.fileName
            let generalFilePath = `/uploads/answersheets/${request.attemptId}/${fileName}`
            let filePath = `${rootFolder}/uploads/answersheets/${request.attemptId}/${fileName}`

            let data = await this.s3Service.getSignedUrl(filePath, 'application/pdf');

            return data;
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getBestAttempt(request: GetBestAttemptRequest) {
        try {
            var condition: any = {
                isAbandoned: false
            }

            if (request.practicesetId.length === 24 && checkForHexRegExp.test(request.practicesetId)) {
                condition["practicesetId"] = new Types.ObjectId(request.practicesetId);
            } else {
                condition["idOffline"] = new Types.ObjectId(request.practicesetId)
            }

            let attempt = await this.findOneAttempt(request, condition, { totalMark: -1 })
            return { attempt }
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getAverageAttempt(request: AverageAttemptRequest) {
        try {
            var condition = {
                practicesetId: new Types.ObjectId(request.practicesetId),
                isAbandoned: false
            }
            this.attemptRepository.setInstanceKey(request.instancekey)
            let totalAttempt = await this.attemptRepository.countDocuments(condition);

            let subjects = await this.attemptRepository.aggregate([
                { $match: condition },
                {
                    $lookup: {
                        "from": "attemptdetails",
                        "localField": "attemptdetails",
                        "foreignField": "_id",
                        "as": "a"
                    }
                },
                {
                    $unwind: "$a"
                },
                {
                    $unwind: "$a.QA"
                },
                {
                    $project: {
                        'subject._id': '$a.QA.subject._id',
                        'subject.name': '$a.QA.subject.name',
                        'unit._id': '$a.QA.unit._id',
                        'unit.name': '$a.QA.unit.name',
                        QA: "$a.QA",
                        totalTime: 1,
                        subjects: 1
                    }
                },
                {
                    $group: {
                        _id: '$unit',
                        questionCount: {
                            '$sum': 1
                        },
                        timeEslapse: {
                            $sum: '$QA.timeEslapse'
                        },
                        doQuestion: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$QA.status", 3] }, 0, 1]
                            }
                        },
                        marks: {
                            '$sum': '$QA.actualMarks'
                        },
                        obtainMarks: {
                            '$sum': '$QA.obtainMarks'
                        },
                        totalTime: { "$first": "$totalTime" }
                    }
                },
                {
                    $project: {
                        _id: '$_id._id',
                        name: '$_id.name',
                        doQuestion: '$doQuestion',
                        timeEslapse: 1,
                        totalMark: '$marks',
                        obtainMarks: 1,
                        totalTime: 1
                    }
                },
                {
                    $project: {
                        accuracy: {
                            $multiply: [{
                                $cond: [{
                                    $eq: ['$totalMark', 0]
                                }, 0, {
                                    '$divide': ['$obtainMarks', '$totalMark']
                                }]
                            }, 100]
                        },
                        speed: {
                            $divide: [{
                                $cond: [{
                                    $eq: ['$doQuestion', 0]
                                }, 0, {
                                    '$divide': ['$timeEslapse', '$doQuestion']
                                }]
                            }, 1000]
                        },
                        _id: 1,
                        name: 1
                    }
                },
                { $sort: { name: 1 } }
            ])

            subjects[0]['accuracy'] = subjects[0]['accuracy'] / totalAttempt
            subjects[0]['speed'] = subjects[0]['speed'] / totalAttempt
            return { subjects }
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getSubjectWiseSpeedAndAccuracy(request: GetSubjectWiseSpeedAndAccuracyRequest) {
        try {
            this.attemptRepository.setInstanceKey(request.instancekey)
            let data = await this.attemptRepository.aggregate([
                {
                    $match: {
                        user: new Types.ObjectId(request.user._id)
                    }
                },
                { $unwind: "$subjects" },
                {
                    $match: {
                        "subjects._id": {
                            $in: request.user.subjects.map(id => new Types.ObjectId(id))
                        }
                    }
                },
                {
                    $group: {
                        _id: "$subjects._id",
                        name: { "$first": "$subjects.name" },
                        totalSpeed: { "$sum": "$subjects.speed" },
                        totalAccuracy: { "$sum": "$subjects.accuracy" },
                        totalCount: { "$sum": 1 }
                    }
                },
                {
                    $project: {
                        subject: "$name",
                        averageSpeed: { "$divide": [{ "$divide": ["$totalSpeed", "$totalCount"] }, 1000] },
                        averageAccuracy: { "$multiply": [{ "$divide": ["$totalAccuracy", "$totalCount"] }, 100] },

                    }
                }
            ])
            return { data }
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getTotalQuestionSolved(request: GetTotalQuestionSolvedRequest) {
        try {
            var condition = this.conditionSummary(request, true);
            if (request.query.user) {
                condition.user = new Types.ObjectId(request.query.user);
            } else {
                condition.user = new Types.ObjectId(request.user._id)
            }
            delete condition.isAbandoned;
            condition.isEvaluated = true;
            condition.isShowAttempt = true;

            if (request.query.subjects) {
                condition["subjects._id"] = { $in: request.query.subjects.split(',').map(id => new Types.ObjectId(id)) }
            } else if (request.query.user) {

                this.userRepository.setInstanceKey(request.instancekey)
                const sub = await this.userRepository.find({ _id: new Types.ObjectId(request.query.user) }, {
                    subjects: 1
                })

                var Objectsubjects = sub[0].subjects.map(id => new Types.ObjectId(id))

                condition["subjects._id"] = { $in: Objectsubjects }
            } else {
                condition["subjects._id"] = {
                    $in: request.user.subjects.map(id => new Types.ObjectId(id))
                }
            }

            var condition2 = this.createMatch(condition);

            var match2 = {
                $match: condition2
            }

            this.attemptRepository.setInstanceKey(request.instancekey)

            var pipeline: any = [];

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
                },
                {
                    $project: {
                        'subject._id': '$QA.subject._id',
                        'subject.name': '$QA.subject.name',
                        QA: 1
                    }
                },
                {
                    $group: {
                        _id: '$subject',
                        questionCount: {
                            '$sum': 1
                        },
                        timeEslapse: {
                            $sum: '$QA.timeEslapse'
                        },
                        doQuestion: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$QA.status", 3] }, 0, 1]
                            }
                        },
                        marks: {
                            '$sum': '$QA.actualMarks'
                        },
                        obtainMarks: {
                            '$sum': '$QA.obtainMarks'
                        }
                    }
                },
                {
                    $project: {
                        '_id': '$_id._id',
                        'name': '$_id.name',
                        'doQuestion': '$doQuestion',
                    }
                },
                {
                    $sort: {
                        name: 1
                    }
                }
            )
            let subjects = await this.attemptRepository.aggregate(pipeline)

            return { subjects }

        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getStudentAttempts(request: GetStudentAttemptsRequest) {
        try {
            let student = await this.checkMentee(request, request.userId)

            var page = (request.query.page) ? request.query.page : 1;
            var limit = (request.query.limit) ? request.query.limit : 10;
            var sort = ["createdAt", "descending"]
            if (request.query.sort) {
                sort = request.query.sort.split(',')
                if (sort[0] === 'createdBy.name') {
                    sort[0] = 'createdBy.name'
                }
            }
            let key = sort[0];
            let value = sort[1] == "descending" ? -1 : 0;
            var skip = (page - 1) * limit;
            var filter = this.getAttemptFilter(request, student);
            filter.push({
                $or: [{
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
            })

            filter.push({
                user: new Types.ObjectId(request.userId)
            })
            filter.push({
                isAbandoned: false
            })

            let attempts = await this.attemptRepository.find({
                $and: filter
            },
                null,
                {
                    sort: sort ? { key: value } : { "createdAt": -1 },
                    skip: skip,
                    limit: limit
                }
            )
            attempts = await this.attemptRepository.populate(attempts, {
                path: 'attemptdetails',
                select: '-_id QA',
                options: { lean: true }
            })
            let attempt = await Promise.all(attempts.map(async (attempt) => {
                attempt = this.removeAttemptDetails(attempt);
                attempt.averageTime = 0;

                if (attempt.QA) {
                    let totalViewedQuestion = 0;
                    let totalTimeTaken = 0;

                    for (const qa of attempt.QA) {
                        if (qa.timeEslapse) {
                            totalViewedQuestion += 1;
                            totalTimeTaken += qa.timeEslapse;
                        }
                    }

                    if (totalTimeTaken > 0) {
                        attempt.averageTime = ((totalTimeTaken / 1000) / totalViewedQuestion).toFixed(0);
                    }
                }
                delete attempt.QA;
                return attempt;
            }))

            return { attempt }
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async countStudentAttempts(request: CountStudentAttemptsRequest) {
        try {
            let mentor = await this.checkMentee(request, request.userId);
            var filter = this.getAttemptFilter(request, mentor)
            filter.push({
                user: new Types.ObjectId(request.userId)
            })

            filter.push({
                $or: [{
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
            })

            filter.push({
                isAbandoned: false
            })
            this.attemptRepository.setInstanceKey(request.instancekey)
            let count = await this.attemptRepository.countDocuments({
                $and: filter
            })

            return { count }
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async getLastAttempt(request: GetMentorsReq) {
        try {
            var condition = {};
            condition = {
                user: new Types.ObjectId(request.user._id),
                isAbandoned: false
            }
            if (request.query.practice) {
                condition['practicesetId'] = request.query.practice;
            }

            let attempt = await this.findOneAttempt(request, condition, { createdAt: -1 });
            return { attempt }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getLastStudentAttempt(request: GetLastStudentAttemptRequest) {
        try {
            var condition = {};
            condition = {
                user: new Types.ObjectId(request.studentId),
                isAbandoned: false
            }
            if (!request.query.isMentee) {
                condition['practiceSetInfo.createdBy'] = new Types.ObjectId(request.user._id)
            }

            let attempt = await this.findOneAttempt(request, condition);
            return { attempt }

        } catch (err) {
            console.log(err);
            throw "Internals server error"
        }
    }

    async getStudentAttempt(request: GetStudentAttemptRequest) {
        try {
            const condition = { _id: new Types.ObjectId(request.attemptId) }
            const attempt = await this.findOneAttempt(request, condition);
            return { attempt }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getClassrooms(request: GetClassroomsReq): Promise<any> {
        try {
            const filterQuery = {
                active: true,
                location: new Types.ObjectId(request.user.activeLocation),
                $or: [
                    {
                        $and: [
                            { "students.studentId": new Types.ObjectId(request.user._id) },
                            { slugfly: { $ne: "my-mentees" } },
                            { slugfly: { $ne: "group-study" } },
                        ],
                    },
                    { user: new ObjectId(request.user._id) },
                ],
            };

            const projection = {
                name: 1,
                colorCode: 1,
                imageUrl: 1,
                updatedAt: 1,
            };

            const options = { sort: { updatedAt: -1 } };
            const populate = [
                {
                    path: 'user',
                    select: '_id name',
                    options: { lean: true },
                },
            ];
            this.classroomRepository.setInstanceKey(request.instancekey)
            const classrooms = await this.classroomRepository.find(filterQuery, projection, options, populate);

            return { classrooms: classrooms };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getMentors(request: GetMentorsReq): Promise<any> {
        try {
            this.classroomRepository.setInstanceKey(request.instancekey)
            this.userRepository.setInstanceKey(request.instancekey)
            const projection = {
                name: 1,
                userId: 1,
                roles: 1,
                subjects: 1,
                isActive: 1,
                status: 1,
                avatarMD: 1,
                avatarSM: 1,
                avatar: 1,
                birthdate: 1,
                about: 1,
                expertise: 1,
                designation: 1,
                isPublic: 1,
                emailVerified: 1,
                knowAboutUs: 1,
            };

            const page = Number(request.query.page || 1);
            const limit = Number(request.query.limit || 30);
            let sort: any = { createdAt: -1 };
            if (request.query.sort) {
                const [field, order] = request.query.sort.split(',');
                sort = { [field]: order === 'ascending' ? 1 : -1 };
            }

            const skip = (page - 1) * limit;
            const filter: any[] = [{ isActive: true }];

            if (request.query.keyword) {
                const regexText = { $regex: new RegExp(request.query.keyword, 'i') };
                filter.push({
                    $or: [
                        { name: regexText },
                        { email: regexText },
                        { userId: regexText },
                        { phoneNumber: regexText },
                    ],
                });
            }

            let cond: any;
            if (request.query.myMentor) {
                cond = {
                    $or: [
                        { slugfly: 'my-mentees' },
                        { name: 'My Mentees' },
                        { nameLower: 'my mentees' },
                    ],
                    'students.studentId': new ObjectId(request.user._id),
                    'students.iRequested': false,
                };
            } else if (request.query.pendingRequest) {
                cond = {
                    $and: [
                        {
                            $or: [
                                { slugfly: 'my-mentees' },
                                { name: 'My Mentees' },
                                { nameLower: 'my mentees' },
                            ],
                            'students.studentId': new ObjectId(request.user._id),
                            'students.iRequested': true,
                        },
                    ],
                };
            } else {
                cond = {
                    $and: [
                        {
                            $or: [
                                { slugfly: 'my-mentees' },
                                { name: 'My Mentees' },
                                { nameLower: 'my mentees' },
                            ],
                            'students.studentId': new ObjectId(request.user._id),
                        },
                    ],
                };
            }

            let mentorIds = await this.classroomRepository.find(cond, { user: 1 }, { lean: true });

            if (!mentorIds.length) {
                if (request.query.pendingRequest || request.query.myMentor) {
                    return { mentors: [], total: 0 };
                } else {
                    filter.push({
                        _id: { $nin: mentorIds.map(m => m.user) },
                        $or: [
                            { isPublic: true, roles: 'mentor' },
                            { isMentor: true, isPublic: true, roles: 'teacher' },
                        ],
                        'preferences.mentoringRequests': true,
                    });
                }
            } else {
                if (request.query.pendingRequest || request.query.myMentor) {
                    filter.push({
                        _id: { $in: mentorIds.map(m => m.user) },
                    });
                } else {
                    filter.push({
                        _id: { $nin: mentorIds.map(m => m.user) },
                        $or: [
                            { isPublic: true, roles: 'mentor' },
                            { isMentor: true, isPublic: true, roles: 'teacher' },
                        ],
                        'preferences.mentoringRequests': true,
                    });
                }
            }

            const mentors = await this.userRepository.find(
                { $and: filter }, projection, { sort: [sort], skip, limit, lean: true }
            );

            // Fetch settings and all meetings if required
            const settings: any = await this.redisCaching.getSettingAsync(request.instancekey);
            let allMeetings = {};
            if (settings.features.whiteboard && request.query.checkSession) {
                allMeetings = await this.whiteboardService.getMeetings(request.instancekey);
            }

            // Additional logic to check mentor details
            const newFilter = {
                'students.studentId': new ObjectId(request.user._id),
                $or: [
                    { slugfly: 'my-mentees' },
                    { nameLower: 'my mentees' },
                ],
            };

            for (const oneMentor of mentors) {
                newFilter['user'] = oneMentor._id;

                // Check if mentor is online
                if (request.query.chatSupport) {
                    await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
                    oneMentor.isOnline = await this.socketClientService.isOnline(request.instancekey, oneMentor._id);
                }

                const mymenteesclassroom = await this.classroomRepository.findOne(newFilter);

                if (mymenteesclassroom) {
                    const mentees: any = {};
                    // const studentIndex = mymenteesclassroom.students.findIndex(student => student.studentId.toString() === request.userId);
                    const studentIndex = objectIndexOf(mymenteesclassroom.students, "studentId", request.user._id);
                    if (studentIndex !== -1) {
                        mentees.autoAdd = mymenteesclassroom.students[studentIndex].autoAdd;
                        mentees.status = mymenteesclassroom.students[studentIndex].status;
                        mentees.createdAt = mymenteesclassroom.students[studentIndex].createdAt;
                        mentees.iRequested = mymenteesclassroom.students[studentIndex].iRequested;
                        mentees.Id = mymenteesclassroom.students[studentIndex]._id;
                    }

                    mentees.classId = mymenteesclassroom._id;
                    mentees.studentEmail = request.user.email;
                    mentees.studentId = new ObjectId(request.user._id);
                    oneMentor.myMentees = mentees;

                    if (allMeetings[mymenteesclassroom._id.toString()]) {
                        oneMentor.sessionStarted = allMeetings[mymenteesclassroom._id.toString()].running;
                        if (oneMentor.sessionStarted) {
                            for (const attendee of allMeetings[mymenteesclassroom._id.toString()].attendees) {
                                if (attendee === request.user._id.toString()) {
                                    oneMentor.sessionJoined = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            const count = await this.userRepository.countDocuments({ $and: filter });

            return { mentors, total: count };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async findOneMentor(request: GetMentorsReq): Promise<any> {
        try {
            const filter = request.query.mentorId ? {
                $or: [
                    { userId: request.query.mentorId },
                    { phoneNumber: request.query.mentorId },
                    { email: request.query.mentorId }
                ]
            } : {};

            this.userRepository.setInstanceKey(request.instancekey)
            const mentor = await this.userRepository.findOne(filter);
            if (!mentor) {
                throw new NotFoundException();
            }

            if (mentor.roles.includes(config.roles.mentor) || mentor.roles.includes(config.roles.teacher)) {
                this.classroomRepository.setInstanceKey(request.instancekey)
                const classroom = await this.classroomRepository.findOne({
                    'nameLower': 'my mentees',
                    'user': mentor._id,
                    'students.studentId': new Types.ObjectId(request.user._id)
                });

                return { mentor, classroom };
            } else {
                return { error: 'This user is not registered as a Teacher/Mentor' };
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error.message);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async sendInvitation(request: SendInvitationReq): Promise<any> {
        try {
            const settings = await this.redisCaching.getSetting(request);

            const options = {
                websiteName: settings.baseUrl,
                logo: settings.baseUrl + settings.emailLogo,
                senderName: request.user.name,
                hiddenLink: settings.baseUrl,
                sharingLink: settings.baseUrl,
                subject: 'Start mentoring now',
                productName: settings.productName
            };

            const dataMsgCenter = {
                sender: new ObjectId(request.user._id),
                modelId: 'mentor',
                to: request.userId,
                isEmail: true,
                isScheduled: true,
                isSent: false
            };

            if (!isEmail(request.userId)) {
                dataMsgCenter.to = request.user.country.callingCodes[0] + request.userId;
                dataMsgCenter.isEmail = false;
                dataMsgCenter['sms'] = `${request.user.name} wanted to add you as a mentor. Please visit ${settings.baseUrl} to register and start monitoring performance of your student.`;
            }

            await this.messageCenter.sendWithTemplate(request, 'mentor-email', options, dataMsgCenter);

            return { message: 'OK' };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async exportProfile(request: ExportProfileReq): Promise<any> {
        try {
            let url = `${config.reportApi}exportResumePDF?userId=${request._id}`;

            const response: AxiosResponse<any> = await firstValueFrom(
                this.httpService.get(url, {
                    headers: {
                        'instancekey': request.instancekey
                    }
                }).pipe(
                    catchError((error: AxiosError) => {
                        Logger.error(`Error data: ${JSON.stringify(error.response?.data)}`);
                        throw new Error(`Failed to fetch data from report API: ${JSON.stringify(error.response?.data, null, 2)}`);
                    })
                )
            );

            const downloadLink = `${config.reportApi}/exports/${response.data.data}`;
            return { downloadLink };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getSatScore(request: ExportProfileReq): Promise<any> {
        try {
            let url = `${config.reportApi}getStudentSATScore?attempId=${request._id}`;

            const response: AxiosResponse<any> = await firstValueFrom(
                this.httpService.get(url, {
                    headers: {
                        'instancekey': request.instancekey
                    }
                }).pipe(
                    catchError((error: AxiosError) => {
                        Logger.error(`Error data: ${JSON.stringify(error.response?.data)}`);
                        throw new Error(`Failed to fetch data from report API: ${JSON.stringify(error.response?.data, null, 2)}`);
                    })
                )
            );

            if (response.status !== 200) {
                if (response.data.message) {
                    return { data: [], msg: response.data.message };
                }
                return { data: [] };
            }

            return response.data;
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getSubjectwiseRanking(request: GetSubjectwiseRankingReq): Promise<any> {
        try {
            let user: any = request.user;
            if (request.query.user) {
                this.userRepository.setInstanceKey(request.instancekey)
                user = await this.userRepository.findById(request.query.user, { createdAt: 1 }, { lean: true });
            }
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const createdAt = new Date(user.createdAt).toISOString();

            this.attemptRepository.setInstanceKey(request.instancekey)
            const top: any = await this.attemptRepository.aggregate([
                {
                    $match: {
                        isAbandoned: false,
                        createdAt: { $gte: new Date(createdAt) },
                        'subjects._id': new Types.ObjectId(request.subjectId)
                    }
                },
                {
                    $unwind: '$subjects'
                },
                {
                    $match: {
                        'subjects._id': new Types.ObjectId(request.subjectId)
                    }
                },
                {
                    $group: {
                        _id: '$user',
                        score: { $sum: '$subjects.mark' },
                        speed: { $avg: '$subjects.speed' }
                    }
                },
                {
                    $sort: {
                        score: -1,
                        speed: 1
                    }
                },
                {
                    $facet: {
                        top: [
                            { $limit: 8 },
                            {
                                $lookup: {
                                    from: 'users',
                                    let: { uid: "$_id" },
                                    pipeline: [{
                                        $match: {
                                            $expr: { $eq: ["$_id", "$$uid"] }
                                        }
                                    },
                                    { $project: { name: 1, userId: 1, 'avatar.fileUrl': 1, 'provider': 1, 'google.imageUrl': 1, 'facebook.avatar': 1 } }
                                    ],
                                    as: 'userInfo'
                                }
                            },
                            {
                                $unwind: '$userInfo'
                            },
                            {
                                $project: {
                                    _id: 1,
                                    studentName: '$userInfo.name',
                                    userId: '$userInfo.userId',
                                    score: 1,
                                    speed: 1,
                                    provider: '$userInfo.provider',
                                    'avatar.fileUrl': '$userInfo.avatar.fileUrl',
                                    'google.imageUrl': '$userInfo.google.imageUrl',
                                    'facebook.avatar': '$userInfo.facebook.avatar'
                                }
                            }
                        ],
                        me: [
                            {
                                $group: {
                                    _id: null,
                                    all: {
                                        $push: {
                                            _id: '$_id',
                                            studentName: '$studentName',
                                            userId: '$userId',
                                            score: '$score',
                                            speed: '$speed'
                                        }
                                    }
                                }
                            },
                            {
                                $addFields: {
                                    ranking: {
                                        $indexOfArray: [
                                            "$all._id",
                                            user._id
                                        ]
                                    }
                                }
                            },
                            { $unwind: '$all' },
                            { $match: { 'all._id': user._id } },
                            {
                                $lookup: {
                                    from: 'users',
                                    let: { uid: "$_id" },
                                    pipeline: [{
                                        $match: {
                                            $expr: { $eq: ["$_id", "$$uid"] }
                                        }
                                    },
                                    { $project: { name: 1, userId: 1, 'avatar.fileUrl': 1, 'provider': 1, 'google.imageUrl': 1, 'facebook.avatar': 1 } }
                                    ],
                                    as: 'userInfo'
                                }
                            },
                            {
                                $unwind: '$userInfo'
                            },
                            {
                                $project: {
                                    _id: 1,
                                    studentName: '$userInfo.name',
                                    userId: '$userInfo.userId',
                                    score: 1,
                                    speed: 1,
                                    provider: '$userInfo.provider',
                                    'avatar.fileUrl': '$userInfo.avatar.fileUrl',
                                    'google.imageUrl': '$userInfo.google.imageUrl',
                                    'facebook.avatar': '$userInfo.facebook.avatar'
                                }
                            }
                        ]
                    }
                }
            ]);

            return {
                top: top[0].top,
                me: top[0].me[0] || {}
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error.message);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getMarkRanking(request: GetMarkRankingReq): Promise<any> {
        try {
            let user: any = request.user;
            if (request.query.user) {
                this.userRepository.setInstanceKey(request.instancekey)
                user = await this.userRepository.findById(request.query.user, { subjects: 1, createdAt: 1 }, { lean: true });
            }
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const createdAt = new Date(user.createdAt).toISOString();
            const subjectIds = user.subjects.map(subject => new Types.ObjectId(subject));

            this.attemptRepository.setInstanceKey(request.instancekey)
            const data: any = await this.attemptRepository.aggregate([
                {
                    $match: {
                        isAbandoned: false,
                        "subjects._id": { $in: subjectIds },
                        createdAt: { $gte: new Date(createdAt) },
                    },
                },
                {
                    $unwind: "$subjects",
                },
                {
                    $match: {
                        "subjects._id": { $in: subjectIds },
                    },
                },
                {
                    $group: {
                        _id: { user: "$user", subject: "$subjects._id" },
                        subject: { $first: "$subjects.name" },
                        score: { $sum: "$subjects.mark" },
                    },
                },
                {
                    $facet: {
                        subjects: [
                            {
                                $group: {
                                    _id: "$_id.subject",
                                    subject: { $first: "$subject" },
                                    top: { $max: "$score" },
                                    avg: { $avg: "$score" },
                                },
                            },
                        ],
                        student: [
                            {
                                $match: {
                                    "_id.user": new Types.ObjectId(user._id),
                                },
                            },
                            {
                                $project: {
                                    _id: "$_id.subject",
                                    subject: "$subject",
                                    score: "$score",
                                },
                            },
                        ],
                    },
                },
            ]);

            return {
                subjects: data[0].subjects,
                student: data[0].student,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error.message);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async addMentor(request: AddMentorReq): Promise<any> {
        try {
            this.userRepository.setInstanceKey(request.instancekey)
            this.classroomRepository.setInstanceKey(request.instancekey)
            const data = {
                user: new Types.ObjectId(request.user._id),
                email: request.email,
                mentorId: request.mentorId,
                name: request.name
            };

            const condition = [
                { email: data.mentorId },
                { userId: data.mentorId },
                { phoneNumber: data.mentorId }
            ];

            const mentor = await this.userRepository.findOne({ $or: condition });
            if (!mentor) {
                throw new NotFoundException('Mentor not found');
            }

            const classroom = await this.classroomRepository.findOne({
                $or: [
                    { slugfly: 'my-mentees' },
                    { nameLower: 'my mentees' }
                ],
                user: new Types.ObjectId(mentor._id)
            });
            if (!mentor) {
                throw new UnprocessableEntityException('Classroom not found');
            }

            const student = {
                studentId: new Types.ObjectId(request.user._id),
                status: false,
                autoAdd: true,
                studentUserId: request.user.userId,
                registeredAt: new Date(request.user.createdAt),
                iRequested: true
            };

            if (!classroom) {
                const newClassroom = {
                    name: 'My Mentees',
                    user: new Types.ObjectId(mentor._id),
                    allowDelete: false,
                    active: true,
                    students: [student]
                } as any;

                await this.classroomRepository.create(newClassroom);
            } else {
                await this.classroomRepository.updateOne(
                    {
                        $or: [
                            { slugfly: 'my-mentees' },
                            { nameLower: 'my mentees' }
                        ],
                        user: new Types.ObjectId(mentor._id)
                    },
                    {
                        $addToSet: { students: student }
                    }
                );
            }

            return { status: 'Successfully Added' };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error.message);
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async removeMentor(request: RemoveMentorReq): Promise<any> {
        try {
            this.classroomRepository.setInstanceKey(request.instancekey)
            const settings = await this.redisCaching.getSetting(request);
            if (settings.isWhiteLabelled) {
                throw new ForbiddenException('Action not allowed');
            }

            await this.classroomRepository.updateOne(
                {
                    nameLower: 'my mentees',
                    user: request.mentorId,
                    'students.studentId': new Types.ObjectId(request.user._id),
                },
                {
                    $pull: {
                        students: {
                            studentId: new Types.ObjectId(request.user._id),
                        },
                    },
                }
            );

            this.eventBus.emit('Mentor.DeletedBy', {
                req: request,
                mentorId: request.mentorId,
                user: {
                    _id: request.user._id,
                    name: request.user.name,
                },
                by: 'student',
            });

            const classroom = await this.classroomRepository.findOne({
                user: new Types.ObjectId(request.mentorId),
                'students.studentId': new Types.ObjectId(request.user._id),
            });

            if (!classroom) {
                await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
                this.socketClientService.disableChat(request.instancekey, request.user._id, request.mentorId);
            }

            return { status: 'Successfully Removed' };
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw new GrpcUnauthenticatedException(error.message);
            }
            throw new GrpcInternalException(error.message);
        }
    }

}
