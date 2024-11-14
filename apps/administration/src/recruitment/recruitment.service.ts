import { AttemptRepository, globals, InstanceRepository, ProgramRepository, RedisCaching, regex, RegionRepository, SettingRepository, SubjectRepository, urlJoin, UserFavRepository, UserSearchRepository, UsersRepository } from '@app/common';
import { instanceKeys } from '@app/common/config';
import { AddFavoriteRequest, DeleteByIdRequest, GetBehaviorRequest, GetCollegesRequest, GetGradeSummaryRequest, GetMetadataRequest, GetRegionRequest, GetSavedSearchRequest, GetSearchDetailRequest, GetTierRequest, RemoveFavoriteRequest, SaveRequest, SearchRequest, ViewProfileRequest } from '@app/common/dto/administration';
import { status } from '@grpc/grpc-js';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { GrpcInternalException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';

@Injectable()
export class RecruitmentService {
    constructor(private readonly regionRepository: RegionRepository,
        private readonly instanceRepository: InstanceRepository,
        private readonly settingRepository: SettingRepository,
        private readonly programRepository: ProgramRepository,
        private readonly subjectRepository: SubjectRepository,
        private readonly userSearchRepository: UserSearchRepository,
        private readonly usersRepository: UsersRepository,
        private readonly userFavRepository: UserFavRepository,
        private readonly attemptRepository: AttemptRepository,
        private readonly redisCache: RedisCaching,
    ) { }

    async getRegion(req: GetRegionRequest) {
        try {
            this.regionRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW')
            const regionNames = await this.regionRepository.find({ active: true }, 'name', { lean: true })
            return { response: regionNames }
        }
        catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getTier(req: GetTierRequest) {
        var arr = [
            { key: 'Tier1', value: 1 },
            { key: 'Tier2', value: 2 },
            { key: 'Tier3', value: 3 },
            { key: 'Tier4', value: 4 },
            { key: 'Tier5', value: 5 }
        ]
        return { response: arr };
    }

    async getBehavior(req: GetBehaviorRequest) {
        var arr = [
            'Achievement',
            'Assertiveness',
            'Career motivation',
            'Commitment to work',
            'Competitiveness',
            'Cooperativeness',
            'Managerial',
            'Patience',
            'Responsibility',
            'Result orientation',
            'Self-confidence',
            'Sincerity',
            'Stress tolerance',
            'Teamwork'
        ]
        return { response: arr }
    }

    async getMetadata(req: GetMetadataRequest) {
        try {
            let data = await this.redisCache.globalGetAsync('greenT_meta');

            if (data) {
                return data;
            }

            this.regionRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            let regions = await this.regionRepository.find({ active: true }, 'name', { lean: true });

            let tiers: any = [
                { name: 'Tier 1', value: 1 },
                { name: 'Tier 2', value: 2 },
                { name: 'Tier 3', value: 3 },
                { name: 'Tier 4', value: 4 },
                { name: 'Tier 5', value: 5 }
            ]

            let behavior = [
                'Achievement',
                'Assertiveness',
                'Career motivation',
                'Commitment to work',
                'Competitiveness',
                'Cooperativeness',
                'Managerial',
                'Patience',
                'Responsibility',
                'Result orientation',
                'Self-confidence',
                'Sincerity',
                'Stress tolerance',
                'Teamwork'
            ]

            let colleges = []

            // Find one instance has valid region and tier to set default
            this.instanceRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            let ins = await this.instanceRepository.findOne({ active: true, 'region._id': { $in: regions.map(d => d._id) }, tier: { $in: tiers.map(t => t.value) } }, null, { lean: true })

            if (ins) {
                for (let i = 0; i < tiers.length; i++) {
                    if (tiers[i].value == ins.tier) {
                        tiers[i].default = true;
                        break;
                    }
                }

                for (let i = 0; i < regions.length; i++) {
                    if (regions[i]._id.equals(ins.region._id)) {
                        regions[i].default = true;
                        break;
                    }
                }

                // Get all colleges using default tier and region
                this.instanceRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
                colleges = await this.instanceRepository.find({ active: true, 'region._id': ins.region._id, tier: ins.tier }, { institute: 1 }, { lean: true })
            }

            // find Core domain
            this.settingRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            let masterData = await this.settingRepository.findOne({ slug: 'masterdata' }, null, { lean: true })

            // Find PRT grade
            this.programRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            let gradeFind = [
                this.programRepository.findOne({ slugfly: 'cognitive-skills' }, null, { lean: true }),
                this.programRepository.findOne({ slugfly: 'programming' }, null, { lean: true }),
                this.programRepository.findOne({ slugfly: 'mechanical-engineering' }, null, { lean: true }),
                this.programRepository.findOne({ slugfly: 'electrical-engineering' }, null, { lean: true }),
                this.programRepository.findOne({ slugfly: 'civil-engineering' }, null, { lean: true }),
                this.programRepository.findOne({ slugfly: 'electronics--communication-engineering' }, null, { lean: true }),
                this.programRepository.findOne({ slugfly: 'electronics--instrumentation-engineering' }, null, { lean: true }),
                this.programRepository.findOne({ slugfly: 'computer-science--engineering' }, null, { lean: true })
            ]

            let grades = await Promise.all(gradeFind)

            let cores = []
            let prtSubjects
            let prgSubjects

            for (let i = 0; i < grades.length; i++) {
                if (!grades[i]) {
                    continue
                }
                this.subjectRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
                let subjects = await this.subjectRepository.find({ grade: grades[i].o_id, instance: grades[i].instance }, { name: 1 }, { lean: true })
                if (grades[i].slugfly == 'cognitive-skills') {
                    prtSubjects = subjects
                } else if (grades[i].slugfly == 'programming') {
                    prgSubjects = subjects
                } else {
                    cores.push({
                        grade: grades[i].name,
                        subjects: subjects
                    })
                }
            }

            let result = {
                regions: regions,
                tiers: tiers,
                colleges: colleges,
                behavior: behavior,
                prt: prtSubjects,
                programming: prgSubjects,
                cores: cores,
                certs: masterData.certificateProvider ? masterData.certificateProvider.filter(c => c.active) : []
            }

            this.redisCache.globalSetex('greenT_meta', result, 60 * 60 * 24)

            return result;
        }
        catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getColleges(req: GetCollegesRequest) {
        try {
            var query: any = { active: true }
            if (req.query.regions) {
                var regions = req.query.regions.split(',')
                query['region._id'] = { $in: regions }
            }
            if (req.query.tiers) {
                var tiers = req.query.tiers.split(',')
                query.tier = { $in: tiers }
            }
            this.instanceRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            const colleges = await this.instanceRepository.find(query, { institute: 1 }, { lean: true })

            return { response: colleges };
        }
        catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getSavedSearch(req: GetSavedSearchRequest) {
        var query: any = {
            active: true,
            user: new ObjectId(req.user._id)
        }
        if (req.query.name) {
            query.name = { $regex: regex(req.query.name, 'i') }
        }
        this.userSearchRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
        const res = await this.userSearchRepository.find(query, { name: 1 }, { lean: true })

        return { response: res };
    }

    async getSearchDetail(req: GetSearchDetailRequest) {
        try {
            this.userSearchRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            const res = await this.userSearchRepository.findOne({
                active: true,
                user: new ObjectId(req.user._id),
                name: req.name
            }, null, { lean: true })
            if (!res) {
                throw new NotFoundException();
            }
            return { ...res };
        }
        catch (error) {
            Logger.error(error);
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error.message);
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async viewProfile(req: ViewProfileRequest) {
        if (!Types.ObjectId.isValid(req.id)) {
            throw new BadRequestException();
        }

        this.usersRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
        const users = await this.usersRepository.aggregate([
            { $match: { _id: new ObjectId(req.id) } },
            {
                $lookup: {
                    from: 'instances',
                    let: { ins: "$instance" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                    { $eq: ["$_id", "$$ins"] }
                            }
                        },
                        { $project: { name: 1, tier: 1, region: 1, baseUrl: 1 } }
                    ],
                    as: 'institute'
                }
            },
            {
                $unwind: "$institute"
            },
            {
                $lookup: {
                    from: 'psychoresults',
                    let: { o_id: "$o_id", ins: '$instance' },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and: [
                                        { $eq: ["$user", "$$o_id"] },
                                        { $eq: ["$instance", "$$ins"] },
                                    ]
                                }
                            }
                        },
                        { $project: { eppAttributes: 1 } }
                    ],
                    as: 'psycho'
                }
            },
            {
                $unwind: { path: "$psycho", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'competencies',
                    let: { o_id: "$o_id", ins: '$instance' },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and: [
                                        { $eq: ["$userId", "$$o_id"] },
                                        { $eq: ["$instance", "$$ins"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'competencies'
                }
            }
        ]);
        let user
        if (users[0]) {
            user = users[0]
            this.userFavRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            let fav = await this.userFavRepository.findOne({ user: req.user._id, studentId: req.id }, null, { lean: true })
            if (fav) {
                user.bookmark = true
            }

            if (user.industryCertificates) {
                user.industryCertificates.forEach(c => {
                    if (c.url && c.url.startsWith('uploads/certificate')) {
                        c.url = urlJoin(user.institute.baseUrl, c.url)
                    }
                })
            }
        }

        return { response: user };
    }

    async getGradeSummary(req: GetGradeSummaryRequest) {
        try {
            if (!Types.ObjectId.isValid(req.user) || !Types.ObjectId.isValid(req.query.grade)) {
                throw new BadRequestException();
            }
            this.usersRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            let user = await this.usersRepository.findById(new ObjectId(req.user), null, { lean: true });

            this.instanceRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            let ins = await this.instanceRepository.findById(user.instance, null, { lean: true })

            let key: string;
            let agg = [];
            if (ins) {
                key = ins.instanceKey

                if (!instanceKeys.includes(key)) {
                    Logger.debug('recruitment api, invalid instancekey: ' + key)
                    throw new BadRequestException();
                }

                let match: any = { user: user.o_id, isEvaluated: true, isAbandoned: false, 'practiceSetInfo.grades._id': new ObjectId(req.query.grade) }

                //COGNITE GAME
                // if (req.query.package) {
                //     let pac = await global.dbInsts[key].Package.findOne({ name: req.query.package }, null, { lean: true })
                //     if (!pac) {
                //         throw new BadRequestException();
                //     }

                //     match.practicesetId = { $in: pac.practiceIds }
                // }

                agg.push({ $match: match })

                let facet = {
                    accTrend: [],
                    summary: []
                }

                facet.summary.push(globals.lookup)
                facet.summary.push(globals.unw)
                facet.summary.push(globals.add)
                facet.summary.push(globals.pro)
                facet.summary.push({ $unwind: '$QA' })
                facet.summary.push({
                    $group: {
                        _id: "$QA.subject._id",
                        subName: { $first: '$QA.subject.name' },
                        tests: { $addToSet: '$practicesetId' },
                        attempts: { $addToSet: '$_id' },
                        totalMarks: {
                            $sum: "$QA.actualMarks"
                        },
                        obtainMark: {
                            "$sum": "$QA.obtainMarks"
                        },
                        doQuestion: {
                            "$sum": {
                                "$cond": [{ "$eq": ["$QA.status", 3] }, 0, 1]
                            }
                        },
                        timeEslapse: {
                            $sum: "$QA.timeEslapse"
                        }
                    }
                })

                facet.summary.push({
                    $project: {
                        _id: 1,
                        subName: 1,
                        totalTests: { $size: '$tests' },
                        totalAttempts: { $size: '$attempts' },
                        speed: {
                            $cond: [{
                                $eq: ["$doQuestion", 0]
                            }, 0, {
                                "$divide": ["$timeEslapse", "$doQuestion"]
                            }]
                        },
                        acc: {
                            $cond: [{
                                $eq: ["$totalMarks", 0]
                            }, 0, {
                                "$divide": ["$obtainMark", "$totalMarks"]
                            }]
                        }
                    }
                })

                // Calculate acc trend on weekly basis
                facet.accTrend.push({
                    $project: {
                        year: {
                            $year: "$createdAt"
                        },
                        month: {
                            $month: "$createdAt"
                        },
                        day: {
                            $dayOfMonth: "$createdAt"
                        },
                        subjects: 1
                    }
                })

                facet.accTrend.push({ $unwind: '$subjects' })

                facet.accTrend.push({
                    $group: {
                        "_id": { subject: '$subjects._id', year: "$year", month: '$month', day: '$day' },
                        'subName': { $first: '$subjects.name' },
                        "mark": { $sum: "$subjects.mark" },
                        "maxMarks": { $sum: "$subjects.maxMarks" }
                    }
                })

                facet.accTrend.push({
                    $project: {
                        _id: 0,
                        subId: '$_id.subject',
                        subName: 1,
                        day: '$_id.day',
                        month: '$_id.month',
                        year: '$_id.year',
                        acc: {
                            $cond: [{
                                $eq: ["$maxMarks", 0]
                            }, 0, {
                                "$divide": ["$mark", "$maxMarks"]
                            }]
                        }
                    }
                })

                facet.accTrend.push({
                    $sort: {
                        year: 1,
                        month: 1,
                        day: 1,
                        subName: 1
                    }
                })

                agg.push({
                    $facet: facet
                })
            } else {
                throw new NotFoundException('Instance key not found in DB!')
            }
            // 
            this.attemptRepository.setInstanceKey(key);
            const results = await this.attemptRepository.aggregate(agg)
            return results[0];
        } catch (error) {
            Logger.error(error);
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error.message);
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async save(req: SaveRequest) {
        try {
            var data = {
                name: req.body.name,
                user: new ObjectId(req.user._id),
                instanceKey: req.instancekey,
                regions: req.body.regions.map((r) => new ObjectId(r)),
                notes: req.body.notes,

                score10th: req.body.score10th,
                score12th: req.body.score12th,
                scoreGrad: req.body.scoreGrad,

                cgpa10th: req.body.cgpa10th,
                cgpa12th: req.body.cgpa12th,
                cgpaGrad: req.body.cgpaGrad,

                tiers: req.body.tiers,
                institutes: req.body.institutes.map((i) => new ObjectId(i)),
                cognitive: req.body.cognitive,
                behavioral: req.body.behavioral,
                programming: req.body.programming,
                cores: req.body.cores,
                certifications: req.body.certifications,
                active: true
            }
            // this.userSearchRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            this.userSearchRepository.setInstanceKey('staging');
            const res = await this.userSearchRepository.findOneAndUpdate({ name: data.name }, data, { upsert: true, lean: true, new: true });
            return { ...res };
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async search(req: SearchRequest) {
        try {
            let limit = 10
            let page = 1
            if (req.body.limit) {
                limit = req.body.limit
            }
            if (req.body.page) {
                page = req.body.page
            }
            let skip = limit * (page - 1)

            let agg = []

            let instanceIds = req.body.institutes.map(c => new ObjectId(c))

            let match = {
                // _id: mongoose.Types.ObjectId('5cf52a4d94cb33aa4d61e693'),
                instance: { $in: instanceIds }
            }

            if (req.body.certifications && req.body.certifications[0]) {
                match['industryCertificates.name'] = { $in: req.body.certifications }
            }

            let eduQuery = []

            // Score 10th
            if (req.body.score10th && req.body.cgpa10th) {
                eduQuery.push({
                    $elemMatch: {
                        educationType: '10th',
                        $or: [
                            {
                                marksType: 'marks',
                                marks: { $gte: req.body.score10th }
                            },
                            {
                                marksType: 'cgpa',
                                marks: { $gte: req.body.cgpa10th }
                            }
                        ]
                    }
                })
            } else if (req.body.score10th) {
                eduQuery.push({
                    $elemMatch: {
                        educationType: '10th',
                        marksType: 'marks',
                        marks: { $gte: req.body.score10th }
                    }
                })
            } else if (req.body.cgpa10th) {
                eduQuery.push({
                    $elemMatch: {
                        educationType: '10th',
                        marksType: 'cgpa',
                        marks: { $gte: req.body.cgpa10th }
                    }
                })
            }

            // Score 12th
            if (req.body.score12th && req.body.cgpa12th) {
                eduQuery.push({
                    $elemMatch: {
                        educationType: '12th',
                        $or: [
                            {
                                marksType: 'marks',
                                marks: { $gte: req.body.score12th }
                            },
                            {
                                marksType: 'cgpa',
                                marks: { $gte: req.body.cgpa12th }
                            }
                        ]
                    }
                })
            } else if (req.body.score12th) {
                eduQuery.push({
                    $elemMatch: {
                        educationType: '12th',
                        marksType: 'marks',
                        marks: { $gte: req.body.score12th }
                    }
                })
            } else if (req.body.cgpa12th) {
                eduQuery.push({
                    $elemMatch: {
                        educationType: '12th',
                        marksType: 'cgpa',
                        marks: { $gte: req.body.cgpa12th }
                    }
                })
            }

            // Score other
            if (req.body.scoreGrad && req.body.cgpaGrad) {
                eduQuery.push({
                    $elemMatch: {
                        educationType: 'B.Tech/B.E',
                        $or: [
                            {
                                marksType: 'marks',
                                marks: { $gte: req.body.scoreGrad }
                            },
                            {
                                marksType: 'cgpa',
                                marks: { $gte: req.body.cgpaGrad }
                            }
                        ]
                    }
                })
            } else if (req.body.scoreGrad) {
                eduQuery.push({
                    $elemMatch: {
                        educationType: 'B.Tech/B.E',
                        marksType: 'marks',
                        marks: { $gte: req.body.scoreGrad }
                    }
                })
            } else if (req.body.cgpaGrad) {
                eduQuery.push({
                    $elemMatch: {
                        educationType: 'B.Tech/B.E',
                        marksType: 'cgpa',
                        marks: { $gte: req.body.cgpaGrad }
                    }
                })
            }

            if (eduQuery.length) {
                match['educationDetails'] = {
                    $all: eduQuery
                }
            }

            agg.push({
                $match: match
            })

            agg.push({
                $lookup: {
                    from: 'instances',
                    localField: 'instance',
                    foreignField: '_id',
                    as: 'institute'
                }
            })

            agg.push({
                $unwind: "$institute"
            })

            if (req.body.behavioral && req.body.behavioral[0]) {
                agg.push({
                    $lookup: {
                        from: 'psychoresults',
                        let: { o_id: "$o_id", ins: '$instance' },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and: [
                                            { $eq: ["$user", "$$o_id"] },
                                            { $eq: ["$instance", "$$ins"] },
                                        ]
                                    }
                                }
                            },
                            { $project: { eppAttributes: 1 } }
                        ],
                        as: 'psycho'
                    }
                })

                agg.push({
                    $unwind: '$psycho'
                })

                let psychoQuery = []
                req.body.behavioral.forEach(function (b) {
                    let bq = {
                        'psycho.eppAttributes.name': b.subject
                    }
                    if (b.scale == 'Low') {
                        bq['psycho.eppAttributes.weight'] = { $lte: 0 }
                    } else if (b.scale == 'Medium') {
                        bq['psycho.eppAttributes.weight'] = { $lte: 10, $gt: 0 }
                    } else if (b.scale == 'High') {
                        bq['psycho.eppAttributes.weight'] = { $lte: 20, $gt: 10 }
                    } else if (b.scale == 'Excellent') {
                        bq['psycho.eppAttributes.weight'] = { $gt: 20 }
                    }
                    psychoQuery.push(bq)
                })

                agg.push({
                    $match: {
                        $and: psychoQuery
                    }
                })
            }

            let grades = {}
            let cogTests = []
            let cogGrades = []

            // Only consider attempts from 'COGNITE GAME' tests
            // let pacs = await global.greenTDB.Package.find({ instance: { $in: instanceIds }, name: 'COGNITE GAME' }).lean().exec()
            // pacs.forEach(p => cogTests = cogTests.concat(p.practiceIds))

            // let grds = await global.greenTDB.Grade.find({ instance: { $in: instanceIds }, slugfly: 'cognitive-skills' }).lean().exec()
            // grds.forEach(g => cogGrades.push(g._id))

            //Placement Readiness Tests
            if (req.body.cognitive && req.body.cognitive[0]) {
                grades['Placement Readiness Tests'] = req.body.cognitive
            }

            //Placement Readiness Tests
            if (req.body.cognitive && req.body.cognitive[0]) {
                grades['Placement Readiness Tests'] = req.body.cognitive
            }

            //mechanical-engineering
            //electrical-engineering
            //civil-engineering
            //electronics--communication-engineering
            //electronics--instrumentation-engineering
            //computer-science--engineering
            if (req.body.cores && req.body.cores[0]) {
                for (let i = 0; i < req.body.cores.length; i++) {
                    let item = req.body.cores[i]
                    if (!grades[item.grade]) {
                        grades[item.grade] = []
                    }
                    grades[item.grade].push(item)
                }
            }

            //Programming
            if (req.body.programming && req.body.programming[0]) {
                grades['Programming'] = req.body.programming
            }

            let studentFacet = []

            // If we have filter by grade accuracy
            if (Object.keys(grades)[0]) {
                // lookup attempts to calculate accuracy
                agg.push({
                    $lookup: {
                        from: 'attempts',
                        let: { o_id: "$o_id", ins: '$instance' },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and: [
                                            { $eq: ["$user", "$$o_id"] },
                                            { $eq: ["$instance", "$$ins"] },
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'att'
                    }
                })

                agg.push({
                    $unwind: '$att'
                })

                let attOr = []

                if (cogGrades.length) {
                    attOr.push(
                        { 'att.practiceSetInfo.grades._id': { $nin: cogGrades } }
                    )
                }

                if (cogTests.length) {
                    attOr.push({
                        'att.practicesetId': { $in: cogTests }
                    })
                }

                if (attOr.length) {
                    agg.push({
                        $match: {
                            $or: attOr
                        }
                    })
                }

                agg.push({
                    $unwind: '$att.subjects'
                })

                agg.push({
                    $group: {
                        _id: { user: '$_id', grade: '$att.practiceSetInfo.grades._id', sub: '$att.subjects._id' },
                        gradeName: { $first: '$att.practiceSetInfo.grades.name' },
                        subName: { $first: '$att.subjects.name' },
                        mark: { $sum: '$att.subjects.mark' },
                        maxMark: { $sum: '$att.subjects.maxMarks' },
                        name: { $first: '$name' },
                        coreBranch: { $first: '$coreBranch' },
                        placementStatus: { $first: '$placementStatus' },
                        institute: { $first: '$institute' },
                        videoResume: { $first: '$videoResume' },
                        educationDetails: { $first: '$educationDetails' }
                    }
                })

                agg.push({
                    $project: {
                        _id: '$_id.user',
                        gradeName: 1,
                        subName: 1,
                        mark: 1,
                        maxMark: 1,
                        acc: { $cond: [{ $eq: ["$maxMark", 0] }, 0, { "$divide": ["$mark", "$maxMark"] }] },
                        name: 1,
                        coreBranch: 1,
                        placementStatus: 1,
                        institute: 1,
                        videoResume: 1,
                        educationDetails: 1
                    }
                })

                agg.push({
                    $group: {
                        _id: { user: '$_id', grade: '$gradeName' },
                        subjects: {
                            $addToSet: { name: '$subName', acc: '$acc' }
                        },
                        mark: { $sum: '$mark' },
                        maxMark: { $sum: '$maxMark' },
                        name: { $first: '$name' },
                        coreBranch: { $first: '$coreBranch' },
                        placementStatus: { $first: '$placementStatus' },
                        institute: { $first: '$institute' },
                        videoResume: { $first: '$videoResume' },
                        educationDetails: { $first: '$educationDetails' }
                    }
                })

                agg.push({
                    $project: {
                        _id: 1,
                        gradeName: '$_id.grade',
                        acc: { $cond: [{ $eq: ["$maxMark", 0] }, 0, { "$divide": ["$mark", "$maxMark"] }] },
                        subjects: 1,
                        name: 1,
                        coreBranch: 1,
                        placementStatus: 1,
                        institute: '$institute.name',
                        tier: '$institute.tier',
                        region: '$institute.region.name',
                        videoResume: 1,
                        educationDetails: 1
                    }
                })

                agg.push({
                    $group: {
                        _id: '$_id.user',
                        grades: {
                            $addToSet: {
                                name: '$gradeName',
                                acc: '$acc',
                                subjects: '$subjects'
                            }
                        },
                        name: { $first: '$name' },
                        coreBranch: { $first: '$coreBranch' },
                        placementStatus: { $first: '$placementStatus' },
                        institute: { $first: '$institute' },
                        tier: { $first: '$tier' },
                        region: { $first: '$region' },
                        videoResume: { $first: '$videoResume' },
                        educationDetails: { $first: '$educationDetails' }
                    }
                })

                let gand = []
                let coreQuery = []

                for (let g in grades) {
                    let sand = []
                    grades[g].forEach(s => {
                        let accquery
                        if (s.scale == 'Low') {
                            accquery = { $lte: 0.25 }
                        } else if (s.scale == 'Medium') {
                            accquery = { $lte: 0.5, $gt: 0.25 }
                        } else if (s.scale == 'High') {
                            accquery = { $lte: 0.75, $gt: 0.5 }
                        } else if (s.scale == 'Excellent') {
                            accquery = { $gt: 0.75 }
                        }
                        sand.push({
                            $elemMatch: {
                                name: s.subject,
                                acc: accquery
                            }
                        })
                    })
                    let sub = {
                        grades: {
                            $elemMatch: {
                                name: g,
                                subjects: {
                                    $all: sand
                                }
                            }
                        }
                    }
                    if (g == 'Placement Readiness Tests' || g == 'Programming') {
                        gand.push(sub)
                    } else {
                        // Or condition between core grades
                        coreQuery.push(sub)
                    }
                }

                let allCoreQuery = {
                    '$or': coreQuery
                }

                if (allCoreQuery['$or'][0]) {
                    gand.push(allCoreQuery)
                }

                agg.push({
                    $match: {
                        $and: gand
                    }
                })

                studentFacet.push({
                    $skip: skip
                })

                studentFacet.push(
                    {
                        $limit: limit
                    })
            } else {
                studentFacet.push({
                    $skip: skip
                })

                studentFacet.push(
                    {
                        $limit: limit
                    })

                let attOr = []

                if (cogGrades.length) {
                    attOr.push(
                        { 'practiceSetInfo.grades._id': { $nin: cogGrades } }
                    )
                }

                if (cogTests.length) {
                    attOr.push({
                        'practicesetId': { $in: cogTests }
                    })
                }

                let attLookup: any = [
                    {
                        $match:
                        {
                            $expr:
                            {
                                $and: [
                                    { $eq: ["$user", "$$o_id"] },
                                    { $eq: ["$instance", "$$ins"] },
                                ]
                            }
                        }
                    }
                ]

                if (attOr.length) {
                    attLookup.push({
                        $match: {
                            $or: attOr
                        }
                    })
                }

                // lookup attempts to calculate accuracy
                studentFacet.push({
                    $lookup: {
                        from: 'attempts',
                        let: { o_id: "$o_id", ins: '$instance' },
                        pipeline: attLookup,
                        as: 'att'
                    }
                })

                studentFacet.push({
                    $unwind: {
                        "path": '$att',
                        "preserveNullAndEmptyArrays": true
                    }
                })

                studentFacet.push({
                    $group: {
                        _id: { user: '$_id', grade: '$att.practiceSetInfo.grades.name' },
                        mark: { $sum: '$att.totalMark' },
                        maxMark: { $sum: '$att.maximumMarks' },
                        name: { $first: '$name' },
                        coreBranch: { $first: '$coreBranch' },
                        placementStatus: { $first: '$placementStatus' },
                        institute: { $first: '$institute' },
                        videoResume: { $first: '$videoResume' },
                        educationDetails: { $first: '$educationDetails' }
                    }
                })

                studentFacet.push({
                    $project: {
                        _id: 1,
                        gradeName: '$_id.grade',
                        acc: { $cond: [{ $eq: ["$maxMark", 0] }, 0, { "$divide": ["$mark", "$maxMark"] }] },
                        name: 1,
                        coreBranch: 1,
                        placementStatus: 1,
                        institute: '$institute.name',
                        tier: '$institute.tier',
                        region: '$institute.region.name',
                        videoResume: 1,
                        educationDetails: 1
                    }
                })

                studentFacet.push({
                    $group: {
                        _id: '$_id.user',
                        grades: {
                            $addToSet: {
                                name: '$gradeName',
                                acc: '$acc'
                            }
                        },
                        name: { $first: '$name' },
                        coreBranch: { $first: '$coreBranch' },
                        placementStatus: { $first: '$placementStatus' },
                        institute: { $first: '$institute' },
                        tier: { $first: '$tier' },
                        region: { $first: '$region' },
                        videoResume: { $first: '$videoResume' },

                        educationDetails: { $first: '$educationDetails' }
                    }
                })
            }

            let facet: any = {
                students: studentFacet
            }
            if (req.body.includeCount) {
                facet.total = [
                    { $count: 'all' }
                ]
            }

            agg.push({
                $facet: facet
            })

            Logger.debug(JSON.stringify(agg))
            this.usersRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            const results: any = await this.usersRepository.aggregate(agg, { allowDiskUse: true })
            const result = results[0]
            let users = result.students

            for (let u = 0; u < users.length; u++) {
                this.userFavRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
                let fav = await this.userFavRepository.findOne({ user: new ObjectId(req.user._id), studentId: users[u]._id }, null, { lean: true });
                if (fav) {
                    users[u].bookmark = true
                }
            }

            if (result.total) {
                result.total = result.total[0] ? result.total[0].all : 0
                return { total: result.total, users: users };
            } else {
                return { users: users };
            }
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async addFavorite(req: AddFavoriteRequest) {
        try {
            this.userFavRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            await this.userFavRepository.create({
                user: new ObjectId(req.user._id),
                studentId: new ObjectId(req.body.studentId),
                notes: req.body.notes
            })
            return { status: 'OK' };
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async deleteById(req: DeleteByIdRequest) {
        try {
            this.userSearchRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            const res = await this.userSearchRepository.updateOne(
                { _id: new ObjectId(req.id) },
                {
                    $set: {
                        active: false
                    }
                }
            )
            return { status: 'OK' };
        }
        catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async removeFavorite(req: RemoveFavoriteRequest) {
        try {
            this.userFavRepository.setInstanceKey('a2)2-GreenT-lonYuqcGTat!ADN$7VzANEW');
            await this.userFavRepository.findOneAndDelete({ user: new ObjectId(req.user._id), studentId: new ObjectId(req.studentId)})
            
            return { status: 'OK' };
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

}