import { AttemptRepository, canOnlySeeHisOwnContents, canOnlySeeLocationContents, ClassroomRepository, CourseRepository, escapeRegex, FavoriteRepository, LocationRepository, PaymentDetailRepository, PracticeSetRepository, QuestionRepository, RedisCaching, regexName, Settings, SubjectRepository, TestSeriesRepository, UserEnrollmentRepository, UsersRepository } from '@app/common';
import { AddFavoriteRequest, AddTestRequest, AssesmentWiseMarksTestSeriesRequest, BoughtTestSeriesByOthersRequest, CountPackagesRequest, CreateTestseriesRequest, DeleteTestseriesRequest, FindRequest, GetAttemptedTestsOfTestseriesRequest, GetAuthorsRequest, GetBestSellerRequest, GetFavoriteTsRequest, GetMyTestSeriesRequest, GetOngoingClassesRequest, GetPackageAttemptCountRequest, GetPublicListingRequest, GetPublisherTestseriesRequest, GetStudentRankRequest, GetSubjectsRequest, GetTeacherHighestPaidRequest, GetTeacherMostPopularRequest, GetTestByPracticeRequest, GetTestseriesPublicRequest, GetTotalStudentRequest, LevelStatusOfPackageRequest, PackageHasLevelRequest, PercentAccuracyTestseriesRequest, PercentCompleteTestseriesRequest, PracticeHoursTestSeriesRequest, PublishRequest, QuestionCategoryTestSeriesRequest, RecommendedTestSeriesRequest, RemoveClassroomRequest, RemoveFavoriteRequest, RemoveTestRequest, RevokeRequest, SearchForMarketPlaceRequest, SubjectWiseMarksTestSeriesRequest, SummaryPackagesByStudentRequest, SummaryPackagesByTeacherRequest, SummaryPackagesRequest, SummaryTestseriesRequest, TeacherCountPackagesRequest, TeacherSummaryTestseriesRequest, UpdateTestOrderRequest, UpdateTestseriesRequest } from '@app/common/dto/question-bank.dto';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import * as util from '@app/common/Utils';
import { config } from '@app/common/config';
import * as _ from 'lodash';

@Injectable()
export class TestSeriesService {
    constructor(private readonly settings: Settings,
        private readonly locationRepository: LocationRepository,
        private readonly testSeriesRepository: TestSeriesRepository,
        private readonly practiceSetRepository: PracticeSetRepository,
        private readonly attemptRepository: AttemptRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly userEnrollmentRepository: UserEnrollmentRepository,
        private readonly favoriteRepository: FavoriteRepository,
        private readonly usersRepository: UsersRepository,
        private readonly subjectRepository: SubjectRepository,
        private readonly paymentDetailRepository: PaymentDetailRepository,
        private readonly questionRepository: QuestionRepository,
        private readonly courseRepository: CourseRepository,
        private readonly redisCache: RedisCaching,
    ) { }

    private async escapeRegExp(str: string) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
    }

    private async regexName(name: string) {
        const newString = await this.escapeRegExp(name);
        return {
            $regex: new RegExp([newString.replace(/\s+/g, ' ').trim()].join(''), 'i')
        }
    }

    async find(req: FindRequest) {
        let page = req.query.page || 1;
        let limit = req.query.limit || 20;
        let skip = (page - 1) * limit;

        let condition: any = {
            active: true,
            'subjects._id': { $in: (req.user.subjects).map((a) => new ObjectId(a)) }
        }
        if (canOnlySeeLocationContents(req.user.roles)) {
            condition.locations = new ObjectId(req.user.activeLocation);
        }

        if (req.query.subject) {
            if (req.user.subjects.find(s => s === req.query.subject)) {
                condition["subjects._id"] = new ObjectId(req.query.subject)
            } else {
                return {
                    series: [],
                    count: 0
                }
            }
        }

        if (req.query.accessMode) {
            condition.accessMode = req.query.accessMode
        }

        if (req.query.level) {
            condition.level = req.query.level
        }

        if (req.query.author) {
            condition.user = new ObjectId(req.query.author)
        }

        if (req.query.price) {
            let pRange = req.query.price.split('-');
            if (pRange.length == 2) {
                condition.price = {
                    $gte: pRange[0],
                    $lte: pRange[1]
                }
            } else {
                if (req.query.price.indexOf('>') === -1) {
                    condition.price = { $lte: pRange[0] }
                } else {
                    pRange[0] = req.query.price.replace(">", "")
                    condition.price = { $gte: pRange[0] }
                }
            }
        }

        if (req.query.status) {
            condition.status = req.query.status
        }

        if (req.query.title) {
            condition.$or = [{
                title: {
                    "$regex": escapeRegex(req.query.title),
                    "$options": "i"
                }
            },
            {
                status: {
                    "$regex": escapeRegex(req.query.title),
                    "$options": "i"
                }
            },
            {
                "subjects.name": {
                    "$regex": escapeRegex(req.query.title),
                    "$options": "i"
                }
            }]
        }

        let pipe: any = [{
            $match: condition
        }]

        if (req.user.roles.includes('director')) {
            pipe.push(
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
                },
                { $unwind: "$userInfo" },
                {
                    $match: {
                        $expr: {
                            $cond: [{ $eq: ["$userInfo.role", "publisher"] },
                            { $ne: ["$status", "draft"] }, {}]
                        }
                    }
                }
            )
        } else if (req.user.roles.includes('publisher')) {
            if (req.user.activeLocation) {
                this.locationRepository.setInstanceKey(req.instancekey);
                let ownLocation = await this.locationRepository.findOne({ _id: new ObjectId(req.user.activeLocation), user: new ObjectId(req.user._id) }, { user: 1 }, { lean: true })
                req.user.ownLocation = !!ownLocation
                if (req.user.ownLocation) {
                    pipe.push({
                        $match: {
                            $or: [{
                                user: new ObjectId(req.user._id)
                            }, {
                                locations: new ObjectId(req.user.activeLocation)
                            }]
                        }
                    })
                } else {
                    pipe.push({
                        $match: {
                            $or: [{
                                user: new ObjectId(req.user._id)
                            }, {
                                instructors: new ObjectId(req.user._id)
                            }]
                        }
                    })
                }
            }
        }

        if (canOnlySeeHisOwnContents(req.user.roles)) {
            pipe.push({
                $match: {
                    $or: [{
                        user: new ObjectId(req.user._id)
                    }, {
                        instructors: new ObjectId(req.user._id)
                    }]
                }
            })
        }

        let facet: any = {
            series: [
                {
                    $sort: { updatedAt: -1 }
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "u"
                    }
                },
                {
                    $unwind: '$u'
                },
                {
                    $project: {
                        title: 1,
                        description: 1,
                        subjects: 1,
                        status: 1,
                        countries: 1,
                        accessMode: 1,
                        imageUrl: 1,
                        colorCode: 1,
                        user: {
                            _id: '$u._id',
                            name: '$u.name'
                        },
                        instructors: 1,
                        rating: 1,
                        practiceIds: 1,
                        classrooms: 1,
                        expiresOn: 1,
                        startDate: 1,
                        totalTests: { $size: '$practiceIds' }
                    }
                }
            ]
        }

        if (req.query.includeCount) {
            facet.count = [{ $count: 'total' }]
        }

        pipe.push({
            $facet: facet
        })

        this.testSeriesRepository.setInstanceKey(req.instancekey);
        const results: any = await this.testSeriesRepository.aggregate(pipe)

        if (!results[0]) {
            return { count: 0, series: [] }
        }

        let result = results[0]
        if (result.count) {
            result.count = result.count[0] ? result.count[0].total : 0
        }

        try {
            for (let s of result.series) {
                if (req.query.countStudent) {
                    this.attemptRepository.setInstanceKey(req.instancekey);
                    s.students = (await this.attemptRepository.distinct('user', { referenceId: s._id, 'practicesetId': { $in: s.practiceIds }, location: new ObjectId(req.user.activeLocation) })).length;
                }
                if (req.query.countQuestion) {
                    this.practiceSetRepository.setInstanceKey(req.instancekey);
                    s.questions = (await this.practiceSetRepository.find({ _id: { $in: s.practiceIds }, locations: new ObjectId(req.user.activeLocation) }, { totalQuestion: 1 }, { lean: true })).reduce((p, c) => p + c.totalQuestion, 0)
                }

                await this.settings.setPriceByUserCountry(req, s)
            }

        } catch (ex) {
            Logger.error(ex)
        }

        return result;
    }

    async getPublicListing(req: GetPublicListingRequest) {
        try {
            var page = (req.query.page) ? req.query.page : 1;
            var limit = (req.query.limit) ? req.query.limit : 4;
            var skip = (page - 1) * limit;
            if (req.query.skip) {
                skip = Number(req.query.skip)
            }
            let condition: any = {
                accessMode: { $in: ['public', 'buy'] },
                status: 'published',
                $and: [
                    {
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
                ]
            }

            this.locationRepository.setInstanceKey(req.instancekey);
            let defaultLoc = await this.locationRepository.findOne({ active: true, isDefault: true }, { _id: 1 }, { lean: true })
            let locationFilter = {
                $or: [
                    { locations: [] }
                ]
            }
            if (defaultLoc) {
                locationFilter.$or.push({ locations: defaultLoc._id })
            }

            condition.$and.push(locationFilter)

            let projection = { title: 1, level: 1, countries: 1, accessMode: 1, subjects: 1, user: 1, statusChangedAt: 1, status: 1, expiresOn: 1, imageUrl: 1, colorCode: 1 }

            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let testseries = await this.testSeriesRepository.find(condition, projection,
                {
                    sort: { totalEnrollUsers: -1, updatedAt: -1 },
                    skip: skip,
                    limit: limit,
                    populate: { path: 'user', select: 'name' },
                    lean: true
                })

            for (let ts of testseries) {
                await this.settings.setPriceByUserCountry(req, ts);
            }

            if (req.query.count) {
                let total = await this.testSeriesRepository.countDocuments(condition);
                return {
                    testseries: testseries,
                    count: total
                };
            } else {
                return {
                    testseries: testseries
                };
            }
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async summaryTestseries(req: SummaryTestseriesRequest) {
        try {
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let series = await this.testSeriesRepository.findOne({ _id: new ObjectId(req.id) }, null,
                {
                    populate: {
                        path: 'user',
                        select: 'name',
                        options: { lean: true }
                    },
                    lean: true
                })

            if (!series) {
                throw new NotFoundException();
            }

            // validate student access
            if (req.user.roles.includes('student')) {
                if (series.origin == 'institute') {
                    if (!series.locations.find(loc => loc.equals(req.user.activeLocation))) {
                        throw new NotFoundException();
                    }

                    if (series.accessMode == 'invitation') {
                        this.classroomRepository.setInstanceKey(req.instancekey)
                        let cls = await this.classroomRepository.findOne({ _id: { $in: series.classrooms }, 'students.studentId': new ObjectId(req.user._id) })
                        if (!cls) {
                            throw new NotFoundException();
                        }
                    }
                }
            }

            series.totalTests = 0;
            series.totalTimes = 0;
            series.totalQuestions = 0;

            this.attemptRepository.setInstanceKey(req.instancekey);
            let pIds = await this.attemptRepository.distinct("practicesetId", {
                isAbandoned: false,
                practicesetId: {
                    $in: series.practiceIds
                },
                user: new ObjectId(req.user._id)
            });

            series.attempttestIds = pIds;

            this.practiceSetRepository.setInstanceKey(req.instancekey);
            let results: any = await this.practiceSetRepository.aggregate([{
                $match: {
                    _id: {
                        $in: series.practiceIds
                    },
                    status: 'published'
                }
            }, {
                $group: {
                    _id: null,
                    totalTests: {
                        $sum: 1
                    },
                    totalTimes: {
                        $sum: '$totalTime'
                    },
                    totalQuestions: {
                        $sum: "$totalQuestion"
                    }
                }
            }])

            if (results && results.length > 0) {
                var inexResult = results[0];
                series.totalTests = inexResult.totalTests;
                series.totalTimes = inexResult.totalTimes;
                series.totalHours = Math.round(inexResult.totalTimes / 60);
                series.totalQuestions = inexResult.totalQuestions;
            }

            await this.settings.setPriceByUserCountry(req, series)

            this.userEnrollmentRepository.setInstanceKey(req.instancekey)
            let uc = await this.userEnrollmentRepository.findOne({ type: 'testseries', item: series._id, user: new ObjectId(req.user._id) }, { _id: 1 }, { lean: true })

            this.favoriteRepository.setInstanceKey(req.instancekey);
            let fav = await this.favoriteRepository.findOne({ type: 'testseries', itemId: series._id, user: new ObjectId(req.user._id) }, { _id: 1 }, { lean: true })
            series.enrolled = !!uc;
            series.favorite = !!fav

            series.enrolledCount = await this.userEnrollmentRepository.countDocuments({ type: 'testseries', item: series._id })

            return series;
        } catch (ex) {
            Logger.error(ex);
            if (ex instanceof NotFoundException) {
                throw new GrpcNotFoundException(ex.message);
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getAttemptedTestsOfTestseries(req: GetAttemptedTestsOfTestseriesRequest) {
        try {
            this.testSeriesRepository.setInstanceKey(req.instancekey)
            let series = await this.testSeriesRepository.findById(new ObjectId(req.id), 'practiceIds', { lean: true })

            var cond = {
                isAbandoned: false,
                practicesetId: {
                    $in: series.practiceIds.map(t => t._id)
                },
                user: new ObjectId(req.user._id)
            }

            this.attemptRepository.setInstanceKey(req.instancekey)
            let pIds = await this.attemptRepository.distinct("practicesetId", cond)

            return { attemptedTestIds: pIds }
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    private async groupPracticePackage(req, practiceIds) {
        try {
            let match = {
                $match: {
                    _id: {
                        $in: practiceIds
                    },
                    status: 'published'
                }
            };

            let group = {
                $group: {
                    _id: null,
                    totalTests: {
                        $sum: 1
                    },
                    totalTimes: {
                        $sum: {
                            $multiply: ["$totalTime", 60]
                        }
                    },
                    totalQuestions: {
                        $sum: "$totalQuestion"
                    }
                },
            };
            this.practiceSetRepository.setInstanceKey(req.instancekey);
            const result: any = await this.practiceSetRepository.aggregate([match, group])


            return result;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async getTestseriesPublic(req: GetTestseriesPublicRequest) {
        this.testSeriesRepository.setInstanceKey(req.instancekey);
        const series = await this.testSeriesRepository.findOne({ _id: new ObjectId(req.id), status: 'published' }, null,
            {
                populate: [{
                    path: 'user',
                    select: 'name',
                    options: { lean: true }
                }, {
                    path: 'practiceIds',
                    select: '_id title testMode accessMode demographicData camera attemptAllowed status totalQuestion totalTime subjects imageUrl colorCode discountValue',
                    options: { lean: true }
                }
                ],
                lean: true
            });

        if (!series) {
            throw new NotFoundException();
        }

        series.totalTests = 0;
        series.totalTimes = 0;
        series.totalQuestions = 0;

        series.enrolled = false
        if (req.user && req.user._id) {
            series.enrolled = !!await this.userEnrollmentRepository.findOne({ type: 'testseries', item: new ObjectId(req.id), user: new ObjectId(req.user._id) })
        }

        await this.settings.setPriceByUserCountry(req, series)

        const results = await this.groupPracticePackage(req, series.practiceIds.map(t => t._id))


        if (results && results.length > 0) {
            var inexResult = results[0];
            series.totalTests = inexResult.totalTests;
            series.totalTimes = inexResult.totalTimes;
            series.totalHours = Number((inexResult.totalTimes / 60 / 60).toFixed(0));
            series.totalQuestions = inexResult.totalQuestions;
        }


        return series;
    };

    private async summaryPackagev2(req: any, packageObj) {
        try {
            packageObj.totalTests = 0;
            packageObj.totalTimes = 0;
            packageObj.totalQuestions = 0;
            packageObj.totalHours = 0;
            if (!packageObj.practiceIds || !packageObj.practiceIds.length) {
                return packageObj;
            }

            const results = await this.groupPracticePackage(req, packageObj.practiceIds)

            if (results.length) {
                var inexResult = results[0];
                packageObj.totalTests = inexResult.totalTests;
                packageObj.totalTimes = inexResult.totalTimes;
                packageObj.totalHours = Number((inexResult.totalTimes / 60 / 60).toFixed(0));
                packageObj.totalQuestions = inexResult.totalQuestions;

            }
            return packageObj;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    private async packagesSummary(req: any, condition, filter, sort, limit, skip) {
        try {
            if (req.query.count) {
                this.testSeriesRepository.setInstanceKey(req.instancekey)
                condition.$and = filter;

                let ts = await this.testSeriesRepository.find(condition, null, { lean: true });

                if (req.query.enrolled) {
                    await Promise.all(ts.map(async pac => {
                        this.userEnrollmentRepository.setInstanceKey(req.instancekey)
                        let enrolled = await this.userEnrollmentRepository.findOne({ item: pac._id, user: new ObjectId(req.user._id) }, { _id: 1 }, { lean: true })
                        pac.enrolled = !!enrolled
                    }))

                    ts = ts.filter(e => e.enrolled)
                }

                return [{ total: ts.length }];
            } else {
                this.testSeriesRepository.setInstanceKey(req.instancekey);
                condition.$and = filter;

                let packs = await this.testSeriesRepository.find(condition, null, { sort: sort, skip: skip, limit: limit, populate: [{ path: 'subjects' }, { path: 'user', select: 'name' }], lean: true })

                await Promise.all(packs.map(async pac => {
                    this.userEnrollmentRepository.setInstanceKey(req.instancekey);
                    let enrolled = await this.userEnrollmentRepository.findOne({ item: pac._id, user: new ObjectId(req.user._id) }, { _id: 1 }, { lean: true })
                    pac.enrolled = !!enrolled

                    await this.settings.setPriceByUserCountry(req, pac)
                }))

                if (req.query.enrolled) {
                    packs = packs.filter(e => e.enrolled)
                }

                if (req.query.home) {
                    return packs;
                }

                const results = await Promise.all(packs.map(async (packageObj) => {
                    try {
                        await this.summaryPackagev2(req, packageObj);
                        return { test: packageObj };
                    } catch (err) {
                        throw err;
                    }
                }));
                return results;
            }
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    private async summaryPackagesHelper(filter, req: any) {
        try {
            var page = req.query.page ? Number(req.query.page) : 1;
            var limit = req.query.limit ? Number(req.query.limit) : 20;
            var sort = { updatedAt: -1 };
            var skip = (page - 1) * limit;
            var condition: any = {};
            if (req.user && req.user.activeLocation) {
                condition.locations = new ObjectId(req.user.activeLocation)
            }
            if (req.query.accessMode) {
                condition.accessMode = req.query.accessMode
            }
            if (req.query.keywords) {
                let regexName = {
                    $regex: util.regex(req.query.keywords, 'i')
                };
                condition.title = regexName
            }

            if (req.query.level) {
                condition.level = req.query.level
            }

            if (req.query.price) {
                let pRange = req.query.price.split('-');
                if (pRange.length > 1) {
                    condition.price = {
                        $gte: pRange[0],
                        $lte: pRange[1]
                    }
                } else {
                    condition.price = pRange[0]
                }
            }

            if (req.query.author) {
                condition.user = new ObjectId(req.query.author)
            }

            filter.status = 'published';
            if (req.query.name && req.query.name != null) {
                let regexName = {
                    $regex: util.regex(req.query.name, 'i')
                };
                filter.title = regexName;
            }

            if (req.query.subject) {
                filter['subjects._id'] = {
                    $in: new ObjectId(req.query.subject)
                };
            }

            return await this.packagesSummary(req, condition, filter, sort, limit, skip);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async summaryPackages(req: SummaryPackagesRequest) {
        try {
            var filter = {};
            const res = await this.summaryPackagesHelper(filter, req);
            if (res.total) {
                return res;
            }
            return { response: res };
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    private async studentBaseFilter(req: any, filter) {
        try {
            if (req.user) {
                if (!req.query.cart) {
                    filter.locations = new ObjectId(req.user.activeLocation)
                }

                this.classroomRepository.setInstanceKey(req.instancekey);
                const results = await this.classroomRepository.distinct('_id', {
                    "students.studentUserId": req.user.userId,
                    active: true
                })
                if (results.length) {
                    filter.$or = [{
                        accessMode: 'public'
                    }, {
                        accessMode: 'buy'
                    }, {
                        accessMode: 'invitation',
                        classrooms: {
                            $in: results
                        }
                    }];

                } else {
                    filter.$or = [{
                        accessMode: 'public'
                    }, {
                        accessMode: 'buy'
                    }];
                }

                return filter
            } else {
                filter.$or = [{
                    accessMode: 'public'
                }, {
                    accessMode: 'buy'
                }];
                return filter
            }
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async countPackages(req: CountPackagesRequest) {
        try {
            var condition: any = {};
            if (req.query.accessMode) {
                condition["accessMode"] = req.query.accessMode
            }
            if (req.query.keywords) {
                let regexText = await this.regexName(req.query.keywords)
                condition.title = regexText
            }

            if (req.query.level) {
                condition.level = req.query.level

            }
            if (req.query.price) {
                let pRange = req.query.price.split('-');
                if (pRange.length > 1) {
                    condition.price = {
                        $gte: pRange[0],
                        $lte: pRange[1]
                    }
                } else {
                    condition.price = pRange[0]
                }
            }

            if (req.query.author) {
                condition['user'] = new ObjectId(req.query.author)
            }

            var subjectsFilter = [];
            condition.status = 'published';

            if (req.query.name && req.query.name != null) {
                var regexName = {
                    $regex: util.regex(req.query.name, 'i')
                };
                condition.title = regexName;
            }

            if (req.query.subject) {
                var subjects = req.query.subject.split(',');
                subjectsFilter = subjectsFilter.concat(subjects);
            } else {
                if (req.user && req.user.subjects) {
                    subjectsFilter = subjectsFilter.concat(req.user.subjects.map(s => new ObjectId(s)));
                }
            }

            if (subjectsFilter.length > 0) {
                condition['subjects._id'] = {
                    $in: subjectsFilter
                };
            }

            const filter = await this.studentBaseFilter(req, condition)
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let count = await this.testSeriesRepository.countDocuments(filter)
            count = count ? count : 0;
            return {
                count: count
            }
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }

    }

    async summaryPackagesByStudent(req: SummaryPackagesByStudentRequest) {
        try {
            var filter = {};
            filter = await this.studentBaseFilter(req, filter)
            const res = await this.summaryPackagesHelper(filter, req);

            return { response: res, total: res[0]?.total };
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async recommendedTestSeries(req: RecommendedTestSeriesRequest) {
        try {
            var page = (req.query.page) ? req.query.page : 1
            var limit = (req.query.limit) ? req.query.limit : 5
            var condition = {};
            var subjectsFilter = []
            const filter = await this.studentBaseFilter(req, condition)
            if (req.query.subjects) {
                var subjects = req.query.subjects.split(',');
                subjectsFilter = subjectsFilter.concat(subjects);
            }

            if (subjectsFilter.length > 0) {
                filter['subjects._id'] = {
                    $in: subjectsFilter
                };
            }
            filter.status = 'published'
            filter.accessMode = 'buy'
            this.usersRepository.setInstanceKey(req.instancekey);
            let publishers = await this.usersRepository.find({ roles: { $in: ['publisher'] }, isVerified: true }, { _id: 1 }, { lean: true })
            condition['user'] = { $in: publishers }

            if (req.query.searchText) {
                var regexText = await this.regexName(req.query.searchText)
                filter.title = regexText;
            }
            this.userEnrollmentRepository.setInstanceKey(req.instancekey);
            const alreadyBoughtTestSeries = await this.userEnrollmentRepository
                .distinct('item', { accessMode: 'buy', type: 'testseries', user: new ObjectId(req.user._id) })

            var sort = { statusChangedAt: -1 }
            var skip = (page - 1) * limit
            if (alreadyBoughtTestSeries.length > 0) {
                filter._id = { $nin: alreadyBoughtTestSeries }
            }

            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let tests = await this.testSeriesRepository.find(filter,
                { title: 1, subjects: 1, accessMode: 1, countries: 1, status: 1, colorCode: 1, imageUrl: 1, practiceIds: 1, ratings: 1, totalRatings: 1, duration: 1 },
                { sort: sort, skip: skip, limit: limit, populate: { path: 'user', select: "name" }, lean: true });

            for (let test of tests) {
                await this.settings.setPriceByUserCountry(req, test)
            }

            return { response: tests }
        } catch (error) {
            Logger.error(error)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async boughtTestSeriesByOthers(req: BoughtTestSeriesByOthersRequest) {
        try {
            var limit = Number(req.query.limit ? req.query.limit : 5)

            this.userEnrollmentRepository.setInstanceKey(req.instancekey)
            const boughtTestSeriesByOthers = await this.userEnrollmentRepository
                .distinct('item', { accessMode: 'buy', type: 'testseries', user: { $ne: new ObjectId(req.user._id) }, location: new ObjectId(req.user.activeLocation) })

            if (boughtTestSeriesByOthers.length) {
                this.testSeriesRepository.setInstanceKey(req.instancekey);
                const ts = await this.testSeriesRepository
                    .find({ _id: { $in: boughtTestSeriesByOthers }, accessMode: 'buy', locations: new ObjectId(req.user.activeLocation) },
                        { title: 1, subjects: 1, imageUrl: 1, colorCode: 1, countries: 1, accessMode: 1 },
                        { limit: limit, populate: { path: 'user', select: 'name' }, lean: true });


                for (let s of ts) {
                    await this.settings.setPriceByUserCountry(req, s)
                }

                return { response: ts }
            } else {
                return { response: [] };
            }

        } catch (error) {
            Logger.error(error)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getMyTestSeries(req: GetMyTestSeriesRequest) {
        try {
            let filter: any = { user: req.query.user ? new ObjectId(req.query.user) : new ObjectId(req.user._id) }
            if (!req.user.roles.includes('mentor')) {
                filter.location = new ObjectId(req.user.activeLocation)
            }
            this.userEnrollmentRepository.setInstanceKey(req.instancekey);
            const boughtTestSeries = await this.userEnrollmentRepository
                .distinct('item', { type: 'testseries', ...filter })

            if (boughtTestSeries.length) {
                this.testSeriesRepository.setInstanceKey(req.instancekey)
                const ts = await this.testSeriesRepository
                    .find({ _id: { $in: boughtTestSeries } }, { title: 1, subjects: 1, colorCode: 1, imageUrl: 1, accessMode: 1, practiceIds: 1 },
                        { populate: { path: 'user', select: 'name' }, lean: true })

                if (req.query.attemptCount == 'true') {
                    await Promise.all(ts.map(async series => {
                        this.attemptRepository.setInstanceKey(req.instancekey)
                        let countAttempt: any = await this.attemptRepository.aggregate([
                            {
                                $match:
                                {
                                    isAbandoned: false,
                                    practicesetId: {
                                        $in: series.practiceIds
                                    },
                                    user: req.query.user ? new ObjectId(req.query.user) : new ObjectId(req.user._id)
                                }
                            }, {
                                $group: {
                                    _id: '$practicesetId'
                                }
                            },
                            {
                                $count: 'total'
                            }
                        ]);

                        series.attemptCount = countAttempt[0] ? countAttempt[0].total : 0
                    }))
                }

                return { response: ts }
            } else {
                return { response: [] };
            }
        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getAuthors(req: GetAuthorsRequest) {
        try {
            const userLocations = req.user.locations.map(location => new ObjectId(location));
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let authors = await this.testSeriesRepository.aggregate([
                {
                    $match: {
                        locations: userLocations
                    }
                },
                {
                    $group: {
                        _id: '$user'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $project: {
                        name: '$user.name'
                    }
                }
            ])

            return { response: authors };
        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getSubjects(req: GetSubjectsRequest) {
        try {
            const userLocations = req.user.locations.map(location => new ObjectId(location));
            let query: any = { locations: userLocations }
            if (req.user.roles.includes('student')) {
                query.status = 'published'
            } else if (req.user.roles.includes('teacher')) {
                query.user = new ObjectId(req.user._id)
            }
            if (req.query.title) {
                query.title = await this.regexName(req.query.title)
            }
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let subjects = await this.testSeriesRepository.distinct('subjects', query)


            return { response: subjects }
        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getTeacherMostPopular(req: GetTeacherMostPopularRequest) {
        try {
            var page = (req.query.page) ? req.query.page : 1;
            var limit = (req.query.limit) ? req.query.limit : 15;
            var skip = (page - 1) * limit;
            var condition: any = {
                locations: new ObjectId(req.user.activeLocation),
                'subjects._id': { $in: req.user.subjects.map(s => new ObjectId(s)) },
                active: true,
                status: 'published'
            }
            if (req.query.mode) {
                condition.accessMode = req.query.mode
            }
            if (req.query.title) {
                let regexText = await this.regexName(req.query.title)
                condition['title'] = regexText
            }
            if (req.user.roles.includes('publisher') || req.user.roles.includes('teacher') || req.user.roles.includes('mentor')) {
                condition['user'] = new ObjectId(req.user._id)
            }
            this.userEnrollmentRepository.setInstanceKey(req.instancekey);
            let enrolledTestSeries = await this.userEnrollmentRepository.distinct('item', {
                location: new ObjectId(req.user.activeLocation),
                user: new ObjectId(req.user._id),
                type: 'testseries'
            })
            condition._id = { $nin: enrolledTestSeries }
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let testseries = await this.testSeriesRepository
                .find(condition,
                    { title: 1, rating: 1, countries: 1, subjects: 1, accessMode: 1, user: 1, imageUrl: 1, colorCode: 1 },
                    { sort: { rating: -1 }, limit: limit, skip: skip, populate: { path: 'user', select: 'name _id', options: { lean: true } }, lean: true }
                )


            for (let ts of testseries) {
                await this.settings.setPriceByUserCountry(req, ts)
            }

            return { response: testseries }
        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getTeacherHighestPaid(req: GetTeacherHighestPaidRequest) {
        try {
            let limit = (req.query.limit) ? req.query.limit : 15;
            var condition: any = {
                locations: new ObjectId(req.user.activeLocation),
                "subjects.0": { $exists: true },
                subjects: {
                    $not: {
                        $elemMatch: {
                            _id: { $nin: req.user.subjects.map(s => new ObjectId(s)) }
                        }
                    }
                },
                status: 'published',
                accessMode: 'buy',
                active: true
            }
            if (req.user.roles.includes('publisher')) {
                condition['user'] = new ObjectId(req.user._id)
            }
            this.userEnrollmentRepository.setInstanceKey(req.instancekey)
            let enrolledTestseries = await this.userEnrollmentRepository.distinct('item', {
                user: new ObjectId(req.user._id),
                type: 'tetseries',
                location: new ObjectId(req.user.activeLocation)
            })
            condition._id = { $nin: enrolledTestseries }
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let testseries = await this.testSeriesRepository.aggregate([
                {
                    $match: condition
                },
                {
                    $lookup: {
                        from: "userenrollments",
                        let: { cid: "$_id" },
                        pipeline: [
                            {
                                $match: { accessMode: 'buy', $expr: { $eq: ["$item", "$$cid"] } }
                            },
                            {
                                $group: { _id: "$item", price: { $sum: "$price" } }
                            }
                        ],
                        as: "purchaseHistory"
                    }
                },
                { $unwind: "$purchaseHistory" },
                { $project: { title: 1, user: 1, status: 1, type: 1, rating: 1, subjects: 1, accessMode: 1, countries: 1, imageUrl: 1, colorCode: 1, price: "$purchaseHistory.price" } },
                { $sort: { price: -1 } },
                { $limit: limit },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "userInfo"
                    }
                },
                { $unwind: "$userInfo" },
                { $project: { title: 1, status: 1, type: 1, rating: 1, subjects: 1, accessMode: 1, price: 1, countries: 1, imageUrl: 1, colorCode: 1, user: { _id: '$userInfo._id', name: '$userInfo.name' } } }
            ]);

            for (let ts of testseries) {
                await this.settings.setPriceByUserCountry(req, ts)
            }

            return { response: testseries }
        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    private async getRoleFilter(req, testseries) {
        if (req.user.roles.includes('teacher')) {
            var roleFilter = {
                $or: [{
                    'user._id': new ObjectId(req.user._id)
                }, {
                    'instructors._id': new ObjectId(req.user._id)
                }],
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
            var tests = {
                "_id": new ObjectId(testseries)
            }
            var filter = {
                $and: [roleFilter, expire, tests]
            };
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            var ts = await this.testSeriesRepository.find(filter, { _id: 1 })
            if (!ts.length) {
                return false
            }
        }
        return true;
    }

    private async getTestseriesStatistic(req, series) {
        this.practiceSetRepository.setInstanceKey(req.instancekey);
        let summary: any = await this.practiceSetRepository.aggregate([
            {
                $match: { _id: { $in: series.practiceIds } }
            },
            {
                $project: {
                    _id: 1,
                    totalQuestions: { $size: '$questions' }
                }
            },
            {
                $group: {
                    _id: null,
                    tests: { $sum: 1 },
                    questions: { $sum: '$totalQuestions' }
                }
            }
        ])

        this.attemptRepository.setInstanceKey(req.instancekey);
        let users = await this.attemptRepository.distinct('user', { practicesetId: { $in: series.practiceIds } })

        return {
            totalTests: summary[0] ? summary[0].tests : 0,
            totalQuestions: summary[0] ? summary[0].questions : 0,
            totalStudents: users.length
        }
    }

    async teacherSummaryTestseries(req: TeacherSummaryTestseriesRequest) {
        try {
            await this.getRoleFilter(req, req.id)

            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let series = await this.testSeriesRepository.findOne({ _id: new ObjectId(req.id) },
                {
                    title: 1, summary: 1, description: 1, user: 1, status: 1, accessMode: 1,
                    level: 1, classrooms: 1, startDate: 1, expiresOn: 1, countries: 1, practiceIds: 1,
                    subjects: 1, videoUrl: 1, imageUrl: 1, colorCode: 1, attemptAllowed: 1,
                    enabledCodeLang: 1, enableOrdering: 1, includes: 1, duration: 1,
                    testseriesCode: 1, instructors: 1, owner: 1, createdAt: 1, updatedAt: 1
                },
                {
                    populate: [
                        { path: 'user', select: 'name avatar userId', options: { lean: true } },
                        { path: 'instructors', select: 'name avatar userId', options: { lean: true } },
                        { path: 'locations', select: '_id name' },
                        { path: 'lastModifiedBy', select: '_id name' }],
                    lean: true
                })

            if (!series) {
                throw new NotFoundException();
            }

            let summary = {
                totalTests: 0,
                totalQuestions: 0,
                totalStudents: 0
            }
            if (series.practiceIds.length) {
                summary = await this.getTestseriesStatistic(req, series)
            }

            series.totalTests = summary.totalTests;
            series.totalQuestions = summary.totalQuestions;
            series.totalStudents = summary.totalStudents;

            await this.settings.setPriceByUserCountry(req, series)

            return series;
        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async levelStatusOfPackage(req: LevelStatusOfPackageRequest) {
        try {
            var packageinfo: any = [];
            var currnetLevel = req.query.currnetLevel ? parseInt(req.query.currnetLevel) : 0;

            this.testSeriesRepository.setInstanceKey(req.instancekey);
            var temp = await this.testSeriesRepository.aggregate([{ $match: { _id: new ObjectId(req.id) } },
            { $project: { "pIds": "$practiceIds", practiceIds: 1, gradeIds: 1 } },
            { $unwind: "$practiceIds" },
            { $lookup: { from: "practicesets", localField: "practiceIds", foreignField: "_id", as: "practiceIds" } },
            { $unwind: "$practiceIds" },
            // { $match: { "practiceIds.grades.level": currnetLevel } },
            { $group: { _id: "$_id", pIds: { $first: "$pIds" }, grades: { $first: "$gradeIds" }, totalQuestion: { $sum: "$practiceIds.totalQuestion" } } }]);

            if (temp.length > 0) {
                packageinfo = temp[0]
            } else {
                throw new NotFoundException("No question Found");
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            const result: any = await this.attemptRepository.aggregate([{ "$project": { user: 1, practiceSetInfo: 1, "practicesetId": 1, "totalQuestions": 1 } },
            { "$match": { "practicesetId": { $in: packageinfo.pIds }, "user": new ObjectId(req.user._id), "practiceSetInfo.grades.level": currnetLevel } },
            { "$group": { _id: { "practicesetId": "$practicesetId", user: "$user" }, "totalQuestions": { "$first": "$totalQuestions" } } },
            { "$group": { _id: null, count: { $sum: "$totalQuestions" } } }]);

            var currentLevelSolvedPercent = 0;
            if (result.length > 0) {
                currentLevelSolvedPercent = (result[0].count / packageinfo.totalQuestion) * 100
            }

            return { percentage: currentLevelSolvedPercent };
        } catch (error) {
            Logger.error(error);
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error.message);
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async packageHasLevel(req: PackageHasLevelRequest) {
        try {
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            var packageInfo = await this.testSeriesRepository.findOne({ _id: new ObjectId(req.id) }, { gradeIds: 1 })

            if (packageInfo.gradeIds && packageInfo.gradeIds.length > 0) {
                this.subjectRepository.setInstanceKey(req.instancekey);
                const level = await this.subjectRepository.findOne({
                    "grade": { $in: packageInfo.gradeIds },
                    "levels": {
                        "$exists": true
                    }
                })
                if (level) {
                    return { levelExist: true };
                }

            } else {
                return { levelExist: false };;
            }
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getOngoingClasses(req: GetOngoingClassesRequest) {
        try {
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let series = await this.testSeriesRepository.findOne({ _id: new ObjectId(req.id), accessMode: 'invitation' },
                { _id: 1, classrooms: 1 }, { lean: true })

            if (!series) {
                return []
            }
            let condition = { _id: { $in: series.classrooms } }
            if (!req.user.roles.includes('publisher')) {
                condition["location"] = new ObjectId(req.user.activeLocation)
            }

            this.classroomRepository.setInstanceKey(req.instancekey);
            let classes = await this.classroomRepository.find(condition,
                { name: 1, students: 1, imageUrl: 1, colorCode: 1, seqCode: 1 }, { lean: true })

            classes.forEach(c => c.students = c.students.length)

            return { response: classes };

        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    private async getTotalStudentHelper(req, condition) {
        this.testSeriesRepository.setInstanceKey(req.instancekey);
        let res: any;
        const pacakgeobj = await this.testSeriesRepository.findOne({
            _id: condition.subject
        }, {
            accessMode: 1,
            classrooms: 1
        }, {
            lean: true
        })

        if (pacakgeobj) {
            if (pacakgeobj.accessMode == 'buy') {
                var group = {};
                var match = {};
                condition.status = "success";
                match = {
                    $match: condition
                };
                group = {
                    $group: {
                        _id: "$byUser",
                        id: {
                            $first: "$id"
                        }
                    }
                };
                var groupAgian = {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1
                        }
                    }
                };
                this.paymentDetailRepository.setInstanceKey(req.instancekey);
                const result: any = await this.paymentDetailRepository.aggregate([match, group, groupAgian]);
                var totalStudent = 0;
                if (result && result.length > 0) {
                    totalStudent = result[0].count;
                }
                res = { count: totalStudent }

            } else if (pacakgeobj.accessMode == 'invitation') {
                var cond: any = {};
                if (pacakgeobj.classrooms) {
                    if (pacakgeobj.classrooms.length > 0) {
                        cond._id = {
                            $in: pacakgeobj.classrooms
                        }

                    } else {
                        return { count: 0 };
                    }
                }
                var pipe = [{
                    $match: cond
                },
                {
                    $unwind: "$students"
                },
                {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1
                        }
                    }
                }]

                this.classroomRepository.setInstanceKey(req.instancekey);
                const studentCount: any = await this.classroomRepository.aggregate(pipe)
                if (studentCount) {
                    var count = {
                        students: 0
                    }
                    if (studentCount.length > 0) {
                        count.students = studentCount[0].count
                    }
                    res = { count: count.students };

                } else {
                    res = { count: 0 };
                }
            } else if (pacakgeobj.accessMode == 'public') {
                this.testSeriesRepository.setInstanceKey(req.instancekey);
                const practiceIds = await this.testSeriesRepository.distinct('practiceIds', { _id: condition.subject });
                this.attemptRepository.setInstanceKey(req.instancekey);
                const studentCount = await this.attemptRepository.distinct('user', { practicesetId: { $in: practiceIds }, isAbandoned: false })
                res = { count: studentCount ? studentCount.length : 0 }
            } else {
                res = { count: 0 }
            }
        } else {
            return { count: 0 }
        }

        return res;
    }

    async summaryPackagesByTeacher(req: SummaryPackagesByTeacherRequest) {
        const settings = await this.redisCache.getSetting({ instancekey: req.instancekey }, function (settings: any) {
            return settings;
        })

        var filter: any = { locations: new ObjectId(req.user.activeLocation) };
        var sort: any = { 'nameLower': 1 };
        var gradesFilter = [];
        var packageStatus = [];
        if (req.query.multiStatus && req.query.multiStatus.length > 0) {
            var multiStatus = req.query.multiStatus.split(',');
            if (multiStatus && multiStatus.length > 0) {
                for (var i in multiStatus) {
                    packageStatus.push(multiStatus[i])
                }
                filter.status = {
                    $in: packageStatus
                }
            }
        }

        if (req.query.name && req.query.name != null) {
            var regexName = {
                $regex: util.regex(req.query.name, 'i')
            };
            filter.name = regexName;
        }
        var limit = (req.query.limit) ? req.query.limit : 20;
        if (req.query.grades) {
            var grades = req.query.grades.split(',');
            gradesFilter = gradesFilter.concat(grades);
        } else {
            if (req.user && req.user.grade) {
                gradesFilter = gradesFilter.concat(req.user.grade);
            }
        }

        if (req.user.roles.includes(config.roles.publisher)) {
            filter.user = new ObjectId(req.user._id);
        }

        let teacherIds = [];

        if (req.user.locations.length > 0) {
            this.usersRepository.setInstanceKey(req.instancekey);
            teacherIds = await this.usersRepository.distinct('_id', {
                locations: {
                    $in: req.user.locations.map(l => new ObjectId(l))
                },
                roles: {
                    $nin: ["student"]
                }
            })
        }

        if (req.user.roles.includes(config.roles.centerHead)) {
            filter.$or = [{
                user: { $in: teacherIds }

            }, {
                user: new ObjectId(req.user._id)
            }];
        }
        if (req.user.roles.includes(config.roles.teacher)) {
            filter.$or = [{
                $and: [{ peerVisibility: true }, { user: { $in: teacherIds } }]

            }, {
                user: new ObjectId(req.user._id)
            }];
        }

        var page = (req.query.page) ? req.query.page : 1;
        var skip = (page - 1) * limit;
        if (req.query.sort) {
            const [sortField, sortOrder] = req.query.sort.split(',');
            sort = sortOrder === 'asc' ? { [sortField]: 1 } : { [sortField]: -1 };
        }

        this.testSeriesRepository.setInstanceKey(req.instancekey);
        const packs = await this.testSeriesRepository.find(filter, null, {
            sort: sort, skip: skip, limit: limit,
            populate: { path: 'user', select: 'name role avatar avatarSM avatarMD' }, lean: { virtuals: true }
        })

        const packages = await Promise.all(packs.map(async (packageObj) => {
            await this.summaryPackagev2(req, packageObj);
            const condition = { package: new ObjectId(packageObj._id) };
            const result = await this.getTotalStudentHelper(req, condition);
            packageObj.totalStudents = result.count;
            return packageObj;
        }));
        return { response: packages };
    }

    async teacherCountPackages(req: TeacherCountPackagesRequest) {
        const settings = await this.redisCache.getSetting({ instancekey: req.instancekey }, function (settings: any) {
            return settings;
        })
        var filter: any = { locations: new ObjectId(req.user.activeLocation) };
        var packageStatus = [];
        if (req.query.multiStatus && req.query.multiStatus.length > 0) {
            var multiStatus = req.query.multiStatus.split(',');
            if (multiStatus && multiStatus.length > 0) {
                for (var i in multiStatus) {
                    packageStatus.push(multiStatus[i])
                }
                filter.status = {
                    $in: packageStatus
                }
            }

        }
        var gradesFilter = [];
        if (req.query.grades) {
            var grades = req.query.grades.split(',');
            gradesFilter = gradesFilter.concat(grades);
        } else {
            if (req.user && req.user.grade) {
                gradesFilter = gradesFilter.concat(req.user.grade.map(g => new ObjectId(g)));
            }
        }

        if (gradesFilter.length > 0) {
            filter['grades._id'] = {
                $in: gradesFilter
            };
        }
        if (req.query.name) {
            var regexName = {
                $regex: util.regex(req.query.name, 'i')
            };
            filter.name = regexName;
        }

        if (req.user.roles.includes(config.roles.publisher)) {
            filter.user = new ObjectId(req.user._id);
        }
        let teacherIds = [];

        if (req.user.locations.length > 0) {
            this.usersRepository.setInstanceKey(req.instancekey);
            teacherIds = await this.usersRepository.distinct('_id', {
                locations: {
                    $in: req.user.locations.map(l => new ObjectId(l))
                },
                roles: {
                    $nin: ["student"]
                }
            });
        }

        if (req.user.roles.includes(config.roles.centerHead)) {
            filter.$or = [{
                user: { $in: teacherIds }

            }, {
                user: new ObjectId(req.user._id)
            }];
        }
        if (req.user.roles.includes(config.roles.teacher)) {
            filter.$or = [{
                $and: [{ peerVisibility: true }, { user: { $in: teacherIds } }]

            }, {
                user: new ObjectId(req.user._id)
            }];
        }

        this.testSeriesRepository.setInstanceKey(req.instancekey);
        var count = await this.testSeriesRepository.countDocuments(filter);

        count = count ? count : 0;
        return { count: count };
    }

    async getPackageAttemptCount(req: GetPackageAttemptCountRequest) {
        var cond = {};
        if (req.query.practice) {
            cond["practiceIds"] = new ObjectId(req.query.practice);
        }
        if (req.query.testSeries) {
            cond["_id"] = new ObjectId(req.query.testSeries);
        }

        this.testSeriesRepository.setInstanceKey(req.instancekey);
        const pack = await this.testSeriesRepository.findOne(cond, { practiceIds: 1, attemptAllowed: 1 })

        if (pack) {
            if (pack.attemptAllowed === 0) {
                return { 'attemptAllowed': true, 'attemptAllowedCount': 0 };

            } else {
                this.attemptRepository.setInstanceKey(req.instancekey);
                const result: any = await this.attemptRepository.aggregate(
                    [{
                        $match: {
                            practicesetId: { $in: pack.practiceIds },
                            isAbandoned: false,
                            user: new ObjectId(req.user._id)
                        }
                    },
                    {
                        "$project": {
                            "year": { "$year": "$createdAt" },
                            "month": { "$month": "$createdAt" },
                            "day": { "$dayOfMonth": "$createdAt" },
                            user: 1,
                            practicesetId: 1,
                            isAbandoned: 1,
                        }
                    }, {
                        "$match": {
                            "year": new Date().getFullYear(),
                            "month": new Date().getMonth() + 1, //because January starts with 0
                            "day": new Date().getDate()
                        }
                    }, { $group: { _id: { practicesetId: "$practicesetId", user: "$user" } } }, { $group: { _id: null, count: { $sum: 1 } } }])

                var count = 0;
                let response = false;
                if (result.length > 0) {
                    count = result[0].count;
                }
                if (count < pack.attemptAllowed || count === 0) {
                    response = true;
                }
                return { 'attemptAllowed': response, 'attemptAllowedCount': pack.attemptAllowed };

            }
        } else {
            return { 'attemptAllowed': true, 'attemptAllowedCount': 0 };
        }
    }

    /**
     * update grade profile
     */
    async getTestByPractice(req: GetTestByPracticeRequest) {
        var practiceIds = [];

        practiceIds.push(new ObjectId(req.practice));
        this.testSeriesRepository.setInstanceKey(req.instancekey);
        const result = await this.testSeriesRepository.findOne({
            practiceIds: {
                $in: practiceIds
            }
        }, null, { lean: true });

        return { ...result };
    }

    async getTotalStudent(req: GetTotalStudentRequest) {
        try {
            var condition = {};
            condition['package'] = new ObjectId(req.id);

            const result = await this.getTotalStudentHelper(req, condition)

            return result;
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getFavoriteTs(req: GetFavoriteTsRequest) {
        try {
            let page = req.query.page || 1;
            let limit = req.query.limit || 20;
            let skip = (page - 1) * limit;
            this.favoriteRepository.setInstanceKey(req.instancekey);
            let ts = await this.favoriteRepository.aggregate([
                {
                    $match: {
                        user: new ObjectId(req.user._id),
                        type: 'testseries',
                        location: new ObjectId(req.user.activeLocation)
                    }
                },
                {
                    $project: {
                        _id: 1,
                        subjects: 1,
                        itemId: 1
                    }
                },
                {
                    $lookup:
                    {
                        from: "testseries",
                        localField: "itemId",
                        foreignField: "_id",
                        as: "ts"
                    }
                },
                { $unwind: "$ts" },
                {
                    $project: {
                        _id: 1,
                        itemId: 1,
                        title: '$ts.title',
                        countries: '$ts.countries',
                        accessMode: '$ts.accessMode',
                        userId: '$ts.user',
                        subjects: 1,
                        colorCode: "$ts.colorCode",
                        imageUrl: "$ts.imageUrl"
                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "u"
                    }
                },
                { $unwind: "$u" },
                {
                    $project: {
                        _id: 1,
                        itemId: 1,
                        title: 1,
                        countries: 1,
                        accessMode: 1,
                        authorName: '$u.name',
                        subjects: 1,
                        colorCode: 1,
                        imageUrl: 1
                    }
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ])

            await this.settings.setPriceByUserCountry(req, ts)

            return { response: ts }
        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getPublisherTestseries(req: GetPublisherTestseriesRequest) {
        try {
            var limit = Number(req.query.limit || 4);
            var page = Number(req.query.page || 1);
            var skip = (page - 1) * limit;
            if (req.query.skip) {
                skip = Number(req.query.skip)
            }
            let pipeline = []
            pipeline.push({
                $match: {
                    origin: 'publisher',
                    accessMode: 'buy',
                    status: 'published',
                    $and: [
                        {
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
                    ]
                }
            })

            if (req.query.title) {
                pipeline[0].$match.title = {
                    "$regex": escapeRegex(req.query.title),
                    "$options": "i"
                }
            }

            if (req.query.count) {
                pipeline.push({ $count: "total" })
                this.testSeriesRepository.setInstanceKey(req.instancekey);
                let testseriesCount = await this.testSeriesRepository.aggregate(pipeline)

                return testseriesCount[0];
            }

            pipeline.push({ $skip: skip }, { $limit: limit })

            pipeline.push({
                $lookup:
                {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            }, { $unwind: "$user" })

            pipeline.push({ $project: { title: 1, colorCode: 1, imageUrl: 1, totalRatings: 1, rating: 1, level: 1, duration: 1, countries: 1, accessMode: 1, subjects: 1, instructors: 1, userName: "$user.name", user: "$user._id", statusChangedAt: 1, type: 1, status: 1, startDate: 1, expiresOn: 1, contentCount: { $size: "$practiceIds" } } })

            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let testseries: any = await this.testSeriesRepository.aggregate(pipeline)

            for (let test of testseries) {
                this.userEnrollmentRepository.setInstanceKey(req.instancekey);
                let enrolled = await this.userEnrollmentRepository.findOne({ item: test._id, user: new ObjectId(req.user._id), location: new ObjectId(req.user.activeLocation) }, { _id: 1 }, { lean: true });
                test.enrolled = !!enrolled
                await this.settings.setPriceByUserCountry(req, test)
            }

            return { response: testseries }
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    /**
     * Creates a new package
     */
    async createTestseries(req: CreateTestseriesRequest) {
        if (!req.body.title || !req.body.subjects || !req.body.subjects.length) {
            throw new BadRequestException();
        }

        try {

            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let result = await this.testSeriesRepository.findOne({
                title: req.body.title,
                user: new ObjectId(req.user._id)
            }, null, { lean: true });

            if (result) {
                throw new BadRequestException({ msg: 'A test series with this name already exists in your list..' });
            }

            let testseries = await this.testSeriesRepository.create({
                title: req.body.title,
                summary: req.body.summary,
                subjects: req.body.subjects,
                user: new ObjectId(req.user._id),
                imageUrl: req.body.imageUrl || '',
                countries: [{
                    code: req.user.country.code,
                    name: req.user.country.name,
                    currency: req.user.country.currency,
                    price: 0,
                    marketPlacePrice: 0,
                    discountValue: 0
                }],
                lastModifiedBy: new ObjectId(req.user._id),
                locations: [],
                origin: 'institute'
            });

            if (req.user.roles.includes('publisher')) {
                testseries.origin = 'publisher'
            } else if (req.user.activeLocation) {
                this.locationRepository.setInstanceKey(req.instancekey);
                let loc = await this.locationRepository.findOne({ _id: new ObjectId(req.user.activeLocation) }, null, { lean: true });
                if (loc.type == 'publisher') {
                    testseries.origin = 'publisher'
                }
            }

            if (req.user.activeLocation) {
                testseries.locations.push(new ObjectId(req.user.activeLocation))
            }


            return { _id: testseries._id };
        } catch (ex) {
            Logger.error(ex);
            if (ex instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(ex.getResponse());
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async addFavorite(req: AddFavoriteRequest) {
        try {
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let ts = await this.testSeriesRepository.findOne({ _id: new ObjectId(req.id) }, null, { lean: true });
            if (!ts) {
                throw new NotFoundException();
            }
            this.favoriteRepository.setInstanceKey(req.instancekey);
            let favorite = await this.favoriteRepository.findOneAndUpdate({
                user: new ObjectId(req.user._id),
                itemId: ts._id,
                title: ts.title,
                type: 'testseries',
                location: new ObjectId(req.user.activeLocation)
            }, {
                subjects: ts.subjects
            }, { upsert: true, new: true })
            return { _id: favorite._id };
        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async publish(req: PublishRequest) {
        try {
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let seri = await this.testSeriesRepository.findById(req.id);

            if (!seri) {
                throw new NotFoundException('Testseries not found!');
            }

            // unverified user cannot publish public/buy mode test
            if (seri.accessMode != 'invitation' && (req.user.roles.includes('teacher') || req.user.roles.includes('mentor')) && !req.user.isVerified) {
                throw new BadRequestException('You are not allowed to publish this test series. Please contact admin to verify your account');
            }

            // validate testseries before publish
            this.practiceSetRepository.setInstanceKey(req.instancekey);
            let testCount = await this.practiceSetRepository.countDocuments({
                _id: {
                    $in: seri.practiceIds
                },
                status: 'published'
            })

            if (testCount < 2) {
                throw new BadRequestException("Testseries must have at least two published tests before it can be published.");
            }

            seri.status = 'published'
            seri.statusChangedAt = new Date();
            seri.lastModifiedBy = new ObjectId(req.user._id)

            await this.testSeriesRepository.findByIdAndUpdate(seri._id, seri);

            return ({
                status: seri.status,
                statusChangedAt: seri.statusChangedAt
            })
        } catch (e) {
            Logger.error(e)
            if (e instanceof NotFoundException) {
                throw new GrpcNotFoundException(e.message);
            }
            if (e instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(e.message);
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async revoke(req: RevokeRequest) {
        try {
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let seri = await this.testSeriesRepository.findById(req.id)

            if (!seri) {
                throw new NotFoundException('Testseries not found!');
            }

            seri.status = 'revoked'
            seri.statusChangedAt = new Date();
            seri.lastModifiedBy = new ObjectId(req.user._id)

            await this.testSeriesRepository.findByIdAndUpdate(seri._id, seri);

            return {
                status: seri.status,
                statusChangedAt: seri.statusChangedAt
            }
        } catch (e) {
            Logger.error(e)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async addTest(req: AddTestRequest) {
        try {
            if (!req.body.testId || !ObjectId.isValid(req.body.testId)) {
                throw new BadRequestException();
            }

            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let series = await this.testSeriesRepository.findById(new ObjectId(req.id))

            if (!series) {
                throw new NotFoundException();
            }

            if (series.practiceIds.findIndex(t => t.equals(req.body.testId)) > -1) {
                throw new BadRequestException('Test already added.');
            }

            let info = {
                practicesetId: new ObjectId(req.body.testId),
                order: series.practiceIds.length + 1,
                createdAt: new Date()
            }

            series.practiceIds.push(info.practicesetId)
            series.praticeinfo.push(info)
            series.lastModifiedBy = new ObjectId(req.user._id)

            //add test series ref in practice set
            this.practiceSetRepository.setInstanceKey(req.instancekey);
            await this.practiceSetRepository
                .updateOne({ _id: new ObjectId(req.body.testId) }, { $addToSet: { testseries: series._id } });

            await this.testSeriesRepository.findByIdAndUpdate(series._id, series);

            // return series statistic
            let summary = await this.getTestseriesStatistic(req, series)

            return summary

        } catch (ex) {
            Logger.error(ex);
            if (ex instanceof NotFoundException) {
                throw new GrpcNotFoundException(ex.message);
            } else if (ex instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(ex.message);
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async removeTest(req: RemoveTestRequest) {
        try {
            if (!req.body.testId || !ObjectId.isValid(req.body.testId)) {
                throw new BadRequestException();
            }

            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let series = await this.testSeriesRepository.findById(new ObjectId(req.id))

            if (!series) {
                throw new NotFoundException();
            }

            let testIdx = series.practiceIds.findIndex(t => t.equals(new ObjectId(req.body.testId)))
            if (testIdx == -1) {
                return { result: 'done' };
            }

            series.practiceIds.splice(testIdx, 1)
            series.lastModifiedBy = new ObjectId(req.user._id)
            testIdx = series.praticeinfo.findIndex(t => t.practicesetId.equals(req.body.testId));

            if (testIdx > -1) {
                series.praticeinfo.splice(testIdx, 1)
            }
            //remove test series ref in practice set
            this.practiceSetRepository.setInstanceKey(req.instancekey);
            await this.practiceSetRepository
                .updateOne({ _id: new ObjectId(req.body.testId) }, { $pull: { testseries: series._id } });

            await this.testSeriesRepository.findByIdAndUpdate(series._id, series);

            // return series statistic
            let summary = await this.getTestseriesStatistic(req, series)

            return summary;
        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async updateTestOrder(req: UpdateTestOrderRequest) {
        try {
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let seri = await this.testSeriesRepository.findById(req.id)

            if (!seri) {
                throw new NotFoundException('Testseries not found!');
            }

            if (seri.praticeinfo.length === 0) {
                return { status: 'ok' };
            }
            // init order field, start with 1
            if (!seri.praticeinfo[0].order) {
                seri.praticeinfo.forEach((q, qIdx) => {
                    q.order = qIdx + 1
                })
            }

            if (!req.body.test || !req.body.order) {
                return { status: 'ok' };
            }

            if (req.body.order < 1 || req.body.order > seri.praticeinfo.length) {
                throw new ForbiddenException();
            }

            // Find the test need to re order
            let q1Idx = _.findIndex(seri.praticeinfo, (q) => q.practicesetId.toString() === req.body.test)

            if (q1Idx === -1) {
                throw new NotFoundException();
            }

            if (seri.praticeinfo[q1Idx].order == req.body.order) {
                return { status: 'ok' };
            }

            // if go up
            if (seri.praticeinfo[q1Idx].order > req.body.order) {
                // increase the order number of all tests between new location and old location
                seri.praticeinfo.forEach((p) => {
                    if (p.practicesetId.toString() !== req.body.test && p.order >= req.body.order && p.order < seri.praticeinfo[q1Idx].order) {
                        p.order++
                    }
                })
            } else { // if go down
                // decrease the order number of all tests between new location and old location
                seri.praticeinfo.forEach((p) => {
                    if (p.practicesetId.toString() !== req.body.test && p.order <= req.body.order && p.order > seri.praticeinfo[q1Idx].order) {
                        p.order--
                    }
                })
            }

            seri.praticeinfo[q1Idx].order = req.body.order

            await this.testSeriesRepository.findByIdAndUpdate(seri._id, seri);

            let toReturn = {}
            seri.praticeinfo.forEach(p => toReturn[p.practicesetId.toString()] = p.order)

            return { response: toReturn }
        } catch (e) {
            Logger.error(e)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async removeClassroom(req: RemoveClassroomRequest) {
        if (!req.body.classroom || !ObjectId.isValid(req.body.classroom)) {
            throw new BadRequestException();
        }

        try {
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            await this.testSeriesRepository.updateOne({ _id: new ObjectId(req.id) }, { $pull: { 'classrooms': new ObjectId(req.body.classroom) } })
            return { status: 'ok' };
        } catch (e) {
            Logger.error(e)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async updateTestseries(req: UpdateTestseriesRequest) {
        try {            
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let currentSeries = await this.testSeriesRepository.findById(new ObjectId(req.id))

            if (!currentSeries) {
                throw new NotFoundException('Testseries not found!')
            }

            var series: any = req.body;

            // validate enable code languages settings
            if (series.enabledCodeLang) {
                let toCheckCode = []

                if (currentSeries.enabledCodeLang) {
                    // only check if enabledCodeLang has changed
                    for (let lang of series.enabledCodeLang) {
                        if (currentSeries.enabledCodeLang.indexOf(lang) == -1) {
                            toCheckCode.push(lang)
                        }
                    }
                } else {
                    toCheckCode = series.enabledCodeLang
                }

                if (toCheckCode.length) {
                    
                    for (let i = 0; i < series.practiceIds?.length; i++) {
                        // Check each test
                        this.practiceSetRepository.setInstanceKey(req.instancekey);
                        let t = await this.practiceSetRepository.findById(new ObjectId(series.practiceIds[i]), { title: 1, enabledCodeLang: 1, questions: 1 }, { lean: true });

                        this.questionRepository.setInstanceKey(req.instancekey);
                        let questions = await this.questionRepository.find({ _id: { $in: t.questions.map(q => q.question) }, category: 'code' },
                            { coding: 1 }, { lean: true });
                        
                        if (questions.length > 0) {
                            let hasInvalidQuestion = questions.some(q => {
                                return q.coding.every(c => toCheckCode.indexOf(c.language) == -1)
                            })

                            if (hasInvalidQuestion) {
                                throw new BadRequestException({
                                    params: 'enabledCodeLangs',
                                    message: 'Please check `Enabled code languages` settings! There are coding questions of `' + t.title + '` having no enabled language.'
                                });
                            }
                        }
                    }
                }
            }

            // user is publishing the series
            if (currentSeries.status == 'draft' && series.status == 'published') {
                // validate testseries before publish
                this.practiceSetRepository.setInstanceKey(req.instancekey);
                let testCount = await this.practiceSetRepository.countDocuments({
                    _id: {
                        $in: series.practiceIds.map((pId: string) => new ObjectId(pId))
                    },
                    status: 'published'
                });

                // unverified user cannot publish public/buy mode test
                if (series.accessMode && series.accessMode != 'invitation' && (req.user.roles.includes('teacher') || req.user.roles.includes('mentor')) && !req.user.isVerified) {
                    throw new BadRequestException('You are not allowed to publish this test series. Please contact admin to verify your account');
                }

                if (testCount < 2) {
                    throw new BadRequestException("Testseries must have at least two tests before it can be published.");
                }

                series.statusChangedAt = new Date();
            }
            series.lastModifiedBy = new ObjectId(req.user._id)

            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let updatedSeries = await this.testSeriesRepository.findByIdAndUpdate(new ObjectId(req.id), series, { new: true });

            try {                
                // update instructors subjects
                if (updatedSeries && updatedSeries.instructors.length) {
                    this.usersRepository.setInstanceKey(req.instancekey);
                    await this.usersRepository.updateMany({ _id: { $in: updatedSeries.instructors } }, { $addToSet: { subjects: { $each: updatedSeries.subjects.map(s => s._id) } } })
                }

                if (req.body.accessMode === 'invitation') {
                    this.practiceSetRepository.setInstanceKey(req.instancekey);
                    await this.practiceSetRepository.updateMany({ _id: { $in: req.body.practiceIds.map((pId: string) => new ObjectId(pId)) } }, {
                        $set: { classRooms: req.body.classrooms.map((cId) => new ObjectId(cId)) }
                    })

                    // add teacher to classroom's instructors
                    if (updatedSeries.instructors.length) {
                        this.classroomRepository.setInstanceKey(req.instancekey);
                        await this.classroomRepository.updateMany({ _id: { $in: updatedSeries.classrooms } }, { $addToSet: { owners: { $each: updatedSeries.instructors } } })
                    }
                }
            } catch (err) {
                Logger.error(err)
            }

            return updatedSeries;
        } catch (e) {
            Logger.error(e);            
            if (e instanceof NotFoundException) {
                throw new GrpcNotFoundException(e.message);
            } else if (e instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(e.getResponse());
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async removeFavorite(req: RemoveFavoriteRequest) {
        try {
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let ts = await this.testSeriesRepository.findOne({ _id: new ObjectId(req.id) }, null, { lean: true });
            if (!ts) {
                throw new NotFoundException();
            }

            this.favoriteRepository.setInstanceKey(req.instancekey);
            await this.favoriteRepository.findOneAndDelete({ user: new ObjectId(req.user._id), itemId: new ObjectId(req.id), type: 'testseries' })
            return { status: 'ok' };
        } catch (ex) {
            Logger.error(ex);
            if (ex instanceof NotFoundException) {
                throw new GrpcNotFoundException(ex.message);
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async deleteTestseries(req: DeleteTestseriesRequest) {
        try {
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            const ts = await this.testSeriesRepository.findById(new ObjectId(req.id))
            if (!ts) {
                throw new NotFoundException();
            }

            const deleted = await this.testSeriesRepository.updateOne({
                '_id': new ObjectId(req.id)
            }, {
                $set: {
                    "active": false,
                    "lastModifiedBy": new ObjectId(req.user._id)
                }
            })

            if (deleted) {
                return deleted;
            }
            return;
        } catch (e) {
            Logger.error(e);
            if (e instanceof NotFoundException) {
                throw new GrpcNotFoundException(e.message);
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    };

    // analytics 
    async getStudentRank(req: GetStudentRankRequest) {
        try {
            let cachedResult = await this.redisCache.getAsync(req.instancekey, `getStudentRank_${req.id.toString()}`)
            if (cachedResult) {
                return { response: cachedResult }
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            let students = await this.attemptRepository.aggregate([
                {
                    $match: {
                        referenceId: new ObjectId(req.id),
                        isShowAttempt: true,
                        isEvaluated: true,
                        isAbandoned: false
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        attemptId: { $push: "$_id" },
                        marks: { $sum: "$totalMark" },
                        name: { $first: "$studentName" },
                        email: { $first: "$email" },
                        subjectName: { $first: "$subjects.name" },
                        unitName: { $first: "$subjects.units.name" },
                        maxMarks: { $sum: "$maximumMarks" }
                    }
                },
                {
                    $sort: {
                        'marks': -1
                    }
                },
                { $limit: 20 },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "userInfo"
                    }
                },
                { $unwind: "$userInfo" },
                {
                    $project: {
                        _id: 1,
                        marks: 1,
                        email: 1,
                        name: 1,
                        subjectName: 1,
                        unitName: 1,
                        maxMarks: 1,
                        attemptId: 1,
                        avatar: "$userInfo.avatar"
                    }
                }
            ])

            if (students.length == 20) {
                await this.redisCache.set({ instancekey: req.instancekey }, `getStudentRank_${req.id.toString()}`, students, 60 * 15)
            }

            return { response: students }
        } catch (e) {
            Logger.error(e)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async percentCompleteTestseries(req: PercentCompleteTestseriesRequest) {
        try {
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let ts = await this.testSeriesRepository.findById(new ObjectId(req.id), { practiceIds: 1 }, { lean: true });
            if (!ts || !ts.practiceIds.length) {
                throw new NotFoundException();
            }

            var filter: any = {
                isShowAttempt: true,
                isEvaluated: true,
                isAbandoned: false
            }
            if (req.query.limit) {
                filter['createdAt'] = {
                    $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                }
            }

            let cachedResult: any = await this.redisCache.getAsync(req.instancekey, `percentCompleteTestseries_${req.id.toString()}`)

            if (cachedResult) {
                filter.user = new ObjectId(req.user._id)
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            let completion: any = await this.attemptRepository.aggregate([
                {
                    $match: filter
                },
                {
                    $group: {
                        _id: { user: '$user', test: '$practicesetId' }
                    }
                },
                {
                    $group: {
                        _id: '$_id.user',
                        tests: { $sum: 1 }
                    }
                },
                {
                    $facet: {
                        user: [
                            {
                                $match: { _id: new ObjectId(req.user._id) }
                            }
                        ],
                        others: [
                            {
                                $group: {
                                    _id: null,
                                    avgTests: { $avg: '$tests' },
                                    topTests: { $max: '$tests' },
                                    total: { $sum: 1 }
                                }
                            },
                        ]
                    }
                }
            ], { allowDiskUse: true });

            let toReturn = { user: { percentComplete: 0 }, average: { percentComplete: 0 }, topper: { percentComplete: 0 } }
            if (completion.length) {
                if (completion[0].user.length) {
                    toReturn.user.percentComplete = completion[0].user[0].tests / ts.practiceIds.length * 100
                    if (toReturn.user.percentComplete > 100) {
                        toReturn.user.percentComplete = 100
                    }
                }
                if (cachedResult) {
                    toReturn.average = cachedResult.average
                    toReturn.topper = cachedResult.topper
                    if (toReturn.user.percentComplete > toReturn.topper.percentComplete) {
                        toReturn.topper.percentComplete = toReturn.user.percentComplete
                    }
                } else {
                    if (completion[0].others.length) {
                        toReturn.average.percentComplete = completion[0].others[0].avgTests / ts.practiceIds.length * 100
                        if (toReturn.average.percentComplete > 100) {
                            toReturn.average.percentComplete = 100
                        }
                        toReturn.topper.percentComplete = completion[0].others[0].topTests / ts.practiceIds.length * 100
                        if (toReturn.topper.percentComplete > 100) {
                            toReturn.topper.percentComplete = 100
                        }

                        if (completion[0].others[0].total > 50) {
                            // cache this result 15 mins
                            this.redisCache.set({ instancekey: req.instancekey }, `percentCompleteTestseries_${req.id.toString()}`, toReturn, 60 * 15)
                        }
                    }
                }
            }

            return toReturn
        } catch (e) {
            Logger.error(e)
            if (e instanceof NotFoundException) {
                throw new GrpcNotFoundException(e.message);
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async percentAccuracyTestseries(req: PercentAccuracyTestseriesRequest) {
        try {
            let filter: any = {
                referenceId: new ObjectId(req.id),
                isShowAttempt: true,
                isEvaluated: true,
                isAbandoned: false
            }
            if (req.query.daysLimit) {
                filter.createdAt = {
                    $gte: new Date((new Date().getTime() - (Number(req.query.daysLimit) * 24 * 60 * 60 * 1000)))
                }
            }

            let cachedResult: any = await this.redisCache.getAsync(req.instancekey, `percentAccuracyTestseries_${req.id.toString()}`)

            if (req.query.userOnly || cachedResult) {
                filter.user = new ObjectId(req.user._id)
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            let userAccuracy: any = await this.attemptRepository.aggregate([
                {
                    $match: filter
                },
                {
                    $group: {
                        _id: {
                            user: '$user',
                            practicesetId: '$practicesetId'
                        },
                        subjects: { $first: '$subjects' }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        accuracy: { $avg: '$subjects.accuracy' }
                    }
                },
                {
                    $group: {
                        _id: '$_id.user',
                        accuracy: { $avg: '$accuracy' }
                    }
                },
                {
                    $facet: {
                        user: [
                            {
                                $match: { _id: new ObjectId(req.user._id) }
                            }
                        ],
                        others: [
                            {
                                $group: {
                                    _id: null,
                                    avg: { $avg: '$accuracy' },
                                    top: { $max: '$accuracy' },
                                    total: { $sum: 1 }
                                }
                            }
                        ]
                    }
                }
            ], { allowDiskUse: true });

            let toReturn = { user: { accuracy: 0 }, average: { accuracy: 0 }, topper: { accuracy: 0 } }
            if (userAccuracy.length) {
                if (userAccuracy[0].user.length) {
                    toReturn.user.accuracy = userAccuracy[0].user[0].accuracy * 100
                }
                if (cachedResult) {
                    toReturn.average = cachedResult.average
                    toReturn.topper = cachedResult.topper
                    if (toReturn.user.accuracy > toReturn.topper.accuracy) {
                        toReturn.topper.accuracy = toReturn.user.accuracy
                    }
                } else {
                    if (userAccuracy[0].others.length) {
                        toReturn.average.accuracy = userAccuracy[0].others[0].avg * 100
                        toReturn.topper.accuracy = userAccuracy[0].others[0].top * 100

                        if (userAccuracy[0].others[0].total > 50) {
                            // cache this result 15 mins
                            this.redisCache.set(req, `percentAccuracyTestseries_${req.id.toString()}`, toReturn, 60 * 15)
                        }
                    }
                }
            }

            return toReturn

        } catch (e) {
            Logger.error(e)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async practiceHoursTestSeries(req: PracticeHoursTestSeriesRequest) {
        try {
            var filter: any = {
                referenceId: new ObjectId(req.id),
                isShowAttempt: true,
                isEvaluated: true,
                isAbandoned: false
            }
            if (req.query.limit) {
                filter['createdAt'] = {
                    $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000)))
                }
            }

            let cachedResult: any = await this.redisCache.getAsync(req.instancekey, `practiceHoursTestSeries_${req.id.toString()}`)

            if (req.query.userOnly || cachedResult) {
                filter.user = new ObjectId(req.user._id)
            }

            this.attemptRepository.setInstanceKey(req.instancekey)
            let hours: any = await this.attemptRepository.aggregate([
                {
                    $match: filter
                },
                {
                    $group: {
                        _id: '$user',
                        totalTime: { $sum: '$totalTime' }
                    }
                },
                {
                    $facet: {
                        user: [
                            {
                                $match: { _id: new ObjectId(req.user._id) }
                            }
                        ],
                        others: [
                            {
                                $group: {
                                    _id: null,
                                    avgTotalTime: { $avg: '$totalTime' },
                                    topTotalTime: { $max: '$totalTime' },
                                    total: { $sum: 1 }
                                }
                            },
                        ]
                    }
                }
            ], { allowDiskUse: true });

            let toReturn = { user: { totalTime: 0 }, average: { totalTime: 0 }, topper: { totalTime: 0 } }
            if (hours.length) {
                if (hours[0].user.length) {
                    toReturn.user.totalTime = hours[0].user[0].totalTime / 360000
                }
                if (cachedResult) {
                    toReturn.average = cachedResult.average
                    toReturn.topper = cachedResult.topper
                    if (toReturn.user.totalTime > toReturn.topper.totalTime) {
                        toReturn.topper.totalTime = toReturn.user.totalTime
                    }
                } else {
                    if (hours[0].others.length) {
                        toReturn.average.totalTime = hours[0].others[0].avgTotalTime / 360000
                        toReturn.topper.totalTime = hours[0].others[0].topTotalTime / 360000

                        if (hours[0].others[0].total > 50) {
                            // cache this result 15 mins
                            this.redisCache.set({ instancekey: req.instancekey }, `practiceHoursTestSeries_${req.id.toString()}`, toReturn, 60 * 15)
                        }
                    }
                }
            }

            return toReturn;

        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async assesmentWiseMarksTestSeries(req: AssesmentWiseMarksTestSeriesRequest) {
        try {
            var filter: any = {
                referenceId: new ObjectId(req.id),
                isShowAttempt: true,
                isEvaluated: true,
                isAbandoned: false
            }

            let cachedResult: any = await this.redisCache.getAsync(req.instancekey, `assesmentWiseMarksTestSeries_${req.id.toString()}`)

            if (cachedResult) {
                filter.user = new ObjectId(req.user._id)
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            let marks: any = await this.attemptRepository.aggregate([
                {
                    $match: filter
                },
                {
                    $facet: {
                        user: [
                            {
                                $match: { user: new ObjectId(req.user._id) }
                            },
                            {
                                $sort: {
                                    totalMark: -1
                                }
                            },
                            {
                                $group: {
                                    _id: '$practicesetId',
                                    subjects: { $first: '$subjects' },
                                    practiceSetInfo: { $first: '$practiceSetInfo' }
                                }
                            },
                            { $unwind: "$subjects" },
                            {
                                $group: {
                                    _id: { practice: "$_id", subject: "$subjects._id" },
                                    subjectName: { $first: "$subjects.name" },
                                    testName: { $first: "$practiceSetInfo.title" },
                                    marks: { $first: "$subjects.mark" }
                                }
                            },
                            {
                                $project: {
                                    testId: '$_id.practice',
                                    subjectId: '$_id.subject',
                                    testName: 1,
                                    subjectName: 1,
                                    marks: 1
                                }
                            }
                        ],
                        others: [
                            { $unwind: "$subjects" },
                            {
                                $group: {
                                    _id: { practice: "$practicesetId", subject: "$subjects._id" },
                                    subjectName: { $first: "$subjects.name" },
                                    testName: { $first: "$practiceSetInfo.title" },
                                    avgMarks: { $avg: "$subjects.mark" },
                                    topMarks: { $max: "$subjects.mark" }
                                }
                            },
                            {
                                $project: {
                                    testId: '$_id.practice',
                                    subjectId: '$_id.subject',
                                    testName: 1,
                                    subjectName: 1,
                                    avgMarks: 1,
                                    topMarks: 1
                                }
                            }
                        ],
                        count: [
                            {
                                $count: 'total'
                            }
                        ]
                    }
                }
            ], { allowDiskUse: true })

            let toReturn: any = { user: [], average: [], topper: [] }
            if (marks.length) {
                if (marks[0].user.length) {
                    toReturn.user = marks[0].user
                }

                if (cachedResult) {
                    toReturn.average = cachedResult.average
                    toReturn.topper = cachedResult.topper
                    for (let topper of toReturn.topper) {
                        let userMark = toReturn.user.find(i => i.testId.toString() == topper.testId.toString() && i.subjectId.toString() == topper.subjectId.toString())
                        if (userMark && userMark.marks > topper.marks) {
                            topper.marks = userMark.marks
                        }
                    }
                } else {
                    if (marks[0].others.length) {
                        toReturn.average = marks[0].others.map(u => {
                            return {
                                testId: u.testId,
                                subjectId: u.subjectId,
                                testName: u.testName,
                                subjectName: u.subjectName,
                                marks: u.avgMarks,
                            }
                        })
                        toReturn.topper = marks[0].others.map(u => {
                            return {
                                testId: u.testId,
                                subjectId: u.subjectId,
                                testName: u.testName,
                                subjectName: u.subjectName,
                                marks: u.topMarks,
                            }
                        })

                        if (marks[0].count[0].total > 50) {
                            this.redisCache.set({ instancekey: req.instancekey }, `assesmentWiseMarksTestSeries_${req.id.toString()}`, toReturn, 60 * 20)
                        }
                    }
                }
            }

            return toReturn
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async questionCategoryTestSeries(req: QuestionCategoryTestSeriesRequest) {
        try {
            this.attemptRepository.setInstanceKey(req.instancekey);
            let questions = await this.attemptRepository.aggregate([
                {
                    $match: {
                        user: new ObjectId(req.user._id),
                        referenceId: new ObjectId(req.id),
                        isShowAttempt: true,
                        isEvaluated: true,
                        isAbandoned: false
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
                    $unwind: '$QA'
                },
                {
                    $group: {
                        _id: {
                            subject: "$QA.subject._id",
                            category: "$QA.category"
                        },
                        subjectName: { $first: "$QA.subject.name" },
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
                    }
                },
                {
                    $project: {
                        subjectId: "$_id.subject",
                        category: "$_id.category",
                        subjectName: 1,
                        partial: 1,
                        missed: 1,
                        correct: 1,
                        incorrect: 1,
                        skipped: 1,
                        totaAttempt: 1,
                    }
                },
            ], { allowDiskUse: true })

            return { response: questions };
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async subjectWiseMarksTestSeries(req: SubjectWiseMarksTestSeriesRequest) {
        try {
            var filter: any = {
                referenceId: new ObjectId(req.id),
                isShowAttempt: true,
                isEvaluated: true,
                isAbandoned: false
            }

            let cachedResult: any = await this.redisCache.getAsync(req.instancekey, `subjectWiseMarksTestSeries_${req.id.toString()}`)

            if (cachedResult) {
                filter.user = new ObjectId(req.user._id)
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            let marks: any = await this.attemptRepository.aggregate([
                {
                    $match: filter
                },
                {
                    $sort: {
                        totalMark: -1
                    }
                },
                {
                    $group: {
                        _id: { user: '$user', test: '$practicesetId' },
                        subjects: { $first: '$subjects' },
                        practiceSetInfo: { $first: '$practiceSetInfo' }
                    }
                },
                { $unwind: "$subjects" },
                { $unwind: "$subjects.units" },
                {
                    $facet: {
                        user: [
                            {
                                $group: {
                                    _id: { subject: "$subjects._id", unit: "$subjects.units._id" },
                                    subjectName: { $first: "$subjects.name" },
                                    unitName: { $first: "$subjects.units.name" },
                                    marks: { $first: "$subjects.units.mark" }
                                }
                            },
                            {
                                $project: {
                                    subjectId: '$_id.subject',
                                    unitId: '$_id.unit',
                                    subjectName: 1,
                                    unitName: 1,
                                    marks: 1
                                }
                            }
                        ],
                        others: [
                            {
                                $group: {
                                    _id: { subject: "$subjects._id", unit: "$subjects.units._id" },
                                    subjectName: { $first: "$subjects.name" },
                                    unitName: { $first: "$subjects.units.name" },
                                    avgMarks: { $avg: "$subjects.units.mark" },
                                    topMarks: { $max: "$subjects.units.mark" }
                                }
                            },
                            {
                                $project: {
                                    subjectId: '$_id.subject',
                                    unitId: '$_id.unit',
                                    subjectName: 1,
                                    unitName: 1,
                                    avgMarks: 1,
                                    topMarks: 1
                                }
                            }
                        ],
                        count: [
                            {
                                $count: 'total'
                            }
                        ]
                    }
                }
            ], { allowDiskUse: true })

            let toReturn: any = { user: [], average: [], topper: [] }
            if (marks.length) {
                if (marks[0].user.length) {
                    toReturn.user = marks[0].user
                }
                if (cachedResult) {
                    toReturn.average = cachedResult.average
                    toReturn.topper = cachedResult.topper
                    for (let topper of toReturn.topper) {
                        let userMark = toReturn.user.find(i => i.subjectId.toString() == topper.subjectId.toString() && i.unitId.toString() == topper.unitId.toString())
                        if (userMark && userMark.marks > topper.marks) {
                            topper.marks = userMark.marks
                        }
                    }
                } else {
                    if (marks[0].others.length) {
                        toReturn.average = marks[0].others.map(u => {
                            return {
                                subjectId: u.subjectId,
                                unitId: u.unitId,
                                subjectName: u.subjectName,
                                unitName: u.unitName,
                                marks: u.avgMarks,
                            }
                        })

                        toReturn.topper = marks[0].others.map(u => {
                            return {
                                subjectId: u.subjectId,
                                unitId: u.unitId,
                                subjectName: u.subjectName,
                                unitName: u.unitName,
                                marks: u.topMarks,
                            }
                        })

                        if (marks[0].count[0].total > 50) {
                            this.redisCache.set({ instancekey: req.instancekey }, `subjectWiseMarksTestSeries_${req.id.toString()}`, toReturn, 60 * 20)
                        }
                    }
                }
            }

            return toReturn
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async searchForMarketPlace(req: SearchForMarketPlaceRequest) {
        try {
            let page = (req.query.page) ? req.query.page : 1;
            let limit = (req.query.limit) ? req.query.limit : 25;
            let skip = (page - 1) * limit;
            var condition = {
                origin: 'publisher',
                accessMode: 'buy',
                status: 'published',
                $or: [{
                    expiresOn: {
                        $gt: new Date()
                    }
                }, {
                    expiresOn: null
                }, {
                    expiresOn: ''
                }],
            }
            if (req.query.title) {
                let regexText = regexName(req.query.title)
                condition['title'] = regexText
            }
            this.testSeriesRepository.setInstanceKey(req.instancekey);
            let testseries: any = await this.testSeriesRepository.aggregate([
                { $match: condition },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "u"
                    }
                },
                {
                    $unwind: '$u'
                },
                { $project: { title: 1, rating: 1, countries: 1, subjects: 1, accessMode: 1, userName: "$u.name", imageUrl: 1, colorCode: 1, price: 1, marketPlacePrice: 1, type: 'testseries', user: "$u._id", duration: 1, totalRatings: 1, contentCount: { $size: "$practiceIds" } } },
                { $skip: skip },
                { $limit: limit }
            ])

            this.courseRepository.setInstanceKey(req.instancekey)
            let courses = await this.courseRepository.aggregate([
                { $match: condition },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "user._id",
                        foreignField: "_id",
                        as: "u"
                    }
                },
                {
                    $unwind: '$u'
                },
                {
                    $project: {
                        title: 1, rating: 1, countries: 1, subjects: 1, accessMode: 1, userName: "$user.name",
                        totalRatings: 1, sections: 1, duration: 1,
                        user: "$u._id", imageUrl: 1, colorCode: 1, price: 1, marketPlacePrice: 1, type: 'course'
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ])

            this.practiceSetRepository.setInstanceKey(req.instancekey);
            let assessments = await this.practiceSetRepository.aggregate([
                { $match: condition },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "u"
                    }
                },
                {
                    $unwind: '$u'
                },
                {
                    $project: {
                        title: 1, rating: 1, countries: 1, subjects: 1, accessMode: 1, userName: "$u.name", imageUrl: 1, colorCode: 1, price: 1,
                        marketPlacePrice: 1, type: 'assessment', testMode: 1, user: "$u._id"
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ])


            let data: any = testseries.concat(courses)
            data = data.concat(assessments)

            return { response: data }
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getBestSeller(req: GetBestSellerRequest) {
        try {
            this.userEnrollmentRepository.setInstanceKey(req.instancekey);
            let testSeries = await this.userEnrollmentRepository.aggregate([
                { $match: { accessMode: 'buy', type: 'testseries', location: { $in: req.user.locations.map(l => new ObjectId(l)) } } },
                { $group: { _id: "$item", count: { $sum: 1 }, user: { $first: "$user" }, updatedAt: { $last: "$updatedAt" } } },
                { $sort: { count: -1, updatedAt: -1 } },
                { $limit: 50 }
            ]);

            if (!testSeries.length) {
                return { response: [] }
            }

            var page = (req.query.page) ? req.query.page : 1;
            var limit = (req.query.limit) ? req.query.limit : 20;
            var skip = (page - 1) * limit;
            let condition: any = {
                _id: { $in: testSeries },
                accessMode: 'buy',
                status: 'published',
                "subjects.0": { $exists: true },
                subjects: {
                    $not: {
                        $elemMatch: {
                            _id: { $nin: req.user.subjects.map(s => new ObjectId(s)) }
                        }
                    }
                },
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
            if (req.query.title) {
                let regexText = regexName(req.query.title)
                condition['title'] = regexText
            }

            if (req.user.roles.includes('student')) {
                let myTestseries = [];
                let mostBoughtTestseries = []

                if (testSeries.length) {
                    testSeries.forEach(d => {
                        if (d.user.equals(new ObjectId(req.user._id))) {
                            myTestseries.push(d._id)
                        } else {
                            mostBoughtTestseries.push(d._id)
                        }
                    })

                    if (mostBoughtTestseries.length) {
                        condition["_id"] = { $in: mostBoughtTestseries }
                    }
                    // else if (myCourse.length) {
                    //     condition["_id"] = { $nin: myTestseries }
                    // }
                }

                this.testSeriesRepository.setInstanceKey(req.instancekey);
                let testseries = await this.testSeriesRepository.find(condition, null, { limit: limit, skip: skip, lean: true }, [{ path: 'user', select: 'name _id}' }]);

                for (let ts of testseries) {
                    await this.settings.setPriceByUserCountry(req, ts)
                }
                return { response: testseries }
            } else {
                let projection = { title: 1, level: 1, countries: 1, accessMode: 1, subjects: 1, user: 1, statusChangedAt: 1, status: 1, expiresOn: 1, imageUrl: 1, colorCode: 1 }

                condition.user = new ObjectId(req.user._id);
                condition.status = 'published'

                let testseries = await this.testSeriesRepository.find(condition, projection, { sort: { updatedAt: -1 }, limit: limit, skip: skip, lean: true }, [{ path: 'user', select: 'name _id}' }])
                for (let ts of testseries) {
                    await this.settings.setPriceByUserCountry(req, ts)
                }

                return { response: testseries }
            }

        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException(ex.message);
        }
    }
}