import { ClassroomRepository, CourseRepository, DiscussionRepository, NotificationRepository, PushService, QuestionFeedbackRepository, RedisCaching, RedisClient, UsersRepository } from "@app/common";
import { GetClassroomPostsReq, GetCommentsReq, GetCreateReq, GetDeleteReq, GetDiscussionOfCourseReq, GetDiscussionReq, GetFlagDiscussionReq, GetFlaggedPostReq, GetMySavedPostsReq, GetNotvoteReq, GetOneFlaggedPostReq, GetOneReq, GetUndonotvoteReq, GetUnflagDiscussionReq, GetUnvoteReq, GetVoteReq, GetYourPostsReq, PostCommentReq, PostUpdateReq, SavePostReq, UnsavedPostReq, createDiscussionRespondReq } from "@app/common/dto/userManagement/discussions.dto";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { response } from "express";
import { ObjectId } from "mongodb";
import { GrpcInternalException, GrpcInvalidArgumentException } from "nestjs-grpc-exceptions";
import * as stripjs from 'strip-js';
import * as config from '@app/common/config';
import * as _ from 'lodash';
import * as util from '@app/common/Utils'
import { Types } from "mongoose";

@Injectable()
export class DiscussionsService {
    constructor(
        private readonly discussionsRepository: DiscussionRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly usersRepository: UsersRepository,
        private readonly notificationRepository: NotificationRepository,
        private readonly questionFeedbackRepository: QuestionFeedbackRepository,
        private readonly courseRepository: CourseRepository,
        private readonly redist: RedisCaching,
        private readonly pushService: PushService
    ) { }

    private async sendNotification(req, discussion, parentDiscussion?) {

        // JIRA MOBILE-181: We should send notifications to students on the mobile only:
        // a. private discussion (in a classroom)
        // b. public and private if posted by admin/centerHead/director/teacher/support

        const settings = await this.redist.getSetting(req);

        if (discussion.classRooms.length === 0 && req.user.roles.includes(config.config.roles.student)) {
            return;
        }

        let filter: any = { _id: { $ne: new ObjectId(req.user._id) } };

        filter.$or = [{ "active": { $exists: false } }, { "active": true }];

        // Build filter
        if (discussion.classRooms.length > 0) {
            const classes = await this.classroomRepository.find({ _id: { $in: discussion.classRooms } })
            let userIds = [];
            for (let i = 0; i < classes.length; i++) {
                for (let j = 0; j < classes[i].students.length; j++) {
                    userIds.push(classes[i].students[j].studentId);
                }
            }

            // Send notification to discussion owner also
            if (discussion.isComment && parentDiscussion) {
                userIds.push(parentDiscussion.user);
            }

            _.remove(userIds, function (u) {
                return !u || u.toString() === req.user._id.toString();
            });

            filter._id = { $in: userIds };
        }

        // Count number of users to send notification
        const count = await this.usersRepository.countDocuments(filter);

        // Send Notification
        const limit = 50;
        let skip = 0;

        let message = 'New discussion is on board';
        let mobileStateTogo = {
            // state to go on mobile
            name: 'discussion',
            params: {
                id: discussion._id.toString()
            }
        };

        if (discussion.isComment) {
            message = 'New comment is posted';
            mobileStateTogo.params = {
                id: parentDiscussion._id.toString()
            };
        }

        while (skip < count) {
            const users = await this.usersRepository.find(filter, {}, { skip: skip, limit: limit });
            skip += limit;

            if (!users || !users.length) {
                continue;
            }

            const userIds = users.map(user => user._id);

            // Create notifications for web
            await Promise.all(users.map(async (user) => {

                const notification = await this.notificationRepository.create({
                    sender: req.user._id,
                    receiver: user._id,
                    websiteName: settings.baseUrl,
                    subject: message,
                    message: message,
                    itemId: discussion._id,
                    modelId: 'discussion',
                    type: 'notification'
                })
            }));

            // Push notifications
            Logger.log('find devices to push, for a number of user %d', userIds.length);
            try {
                const result = await this.pushService.pushToUsers('instancekey', userIds, message, 'New discussion arrived', { custom: { state: mobileStateTogo } });
            } catch (err) {
                Logger.error('push notification fail %j', err);
            }

            // Delay for a while to prevent too many events raised (when notification is created)
            await new Promise(resolve => setTimeout(resolve, 500));
        }

    }

    async getDiscussion(request: GetDiscussionReq) {
        if (request.query.feedType == 'courseContent' && !request.query.courseContent) {
            throw new GrpcInvalidArgumentException('Bad Request')
        }
        try {
            // Allow search in all post
            let filter: any = {
                isComment: false,
                active: true,
                user: { $nin: request.user.blockedUsers || [] },
                location: new Types.ObjectId(request.user.activeLocation)
            };

            filter["$and"] = []

            // for method overwrite thing
            if (request.body) {
                request.query = _.merge(request.query, request.body)
            }

            if (request.query.feedType) {
                filter.feedType = request.query.feedType
                if (request.query.feedType == 'courseContent' && request.query.courseContent) {
                    filter.courseContent = request.query.courseContent;
                }
            } else {
                filter.feedType = "discussion"
            }

            if (request.query.myQuestionsOnly) {
                filter.user = new Types.ObjectId(request.user._id);
            }

            let teacherIds = [];

            if (!request.user.roles.includes(config.config.roles.admin) && !request.user.roles.includes(config.config.roles.director)) {
                if (request.user.locations.length > 0) {
                    teacherIds = await this.usersRepository.distinct('_id', {
                        locations: {
                            $in: request.user.locations.map(l => new ObjectId(l))
                        }
                    })
                }

                filter["$and"].push({
                    $or: [{
                        user: { $in: teacherIds }
                    }, {
                        user: new Types.ObjectId(request.user._id)
                    }]
                })
            }

            if (request.query.flagged) {
                filter.flagged = true
            }

            if (request.query.date) {
                if (!_.includes(request.query.date, 'all')) {
                    let filterDate = new Date();
                    if (_.includes(request.query.date, '90')) {
                        filterDate.setDate(filterDate.getDate() - 90);
                        filter.createdAt = {
                            $gte: filterDate
                        };

                    } else if (_.includes(request.query.date, '30')) {
                        filterDate.setDate(filterDate.getDate() - 30);
                        filter.createdAt = {
                            $gte: filterDate
                        };
                    }
                }
            }

            let myCircleIds = [];

            if (request.user.roles.includes(config.config.roles.student)) {
                let classes = await this.classroomRepository.find({
                    user: new ObjectId(request.user._id),
                    active: true,
                    $or: [{ slugfly: 'group-study' }, { nameLower: 'group study' }]
                }, { '_id': 1 })

                if (classes && classes.length > 0) {
                    myCircleIds = classes.map(c => c._id)
                }
            } else if (request.user.roles.includes(config.config.roles.mentor)) {
                if (!request.query.classes) {
                    throw new Error('missing classes');
                }

                // mentor should see student public post
                let classroom = await this.classroomRepository.findOne({
                    user: new ObjectId(request.user._id),
                    allowDelete: false
                })

                let users = []
                if (classroom && classroom.students.length > 0) {
                    users = classroom.students.map(s => s.studentId)
                }
                users.push(new ObjectId(request.user._id))

                filter.user = {
                    $in: users
                }
            }

            if (request.user.roles.includes(config.config.roles.mentor)) {
                var classCond = []
                var classIds = request.query.classes.split(',')
                classCond.push({
                    classRooms: {
                        $in: classIds.map(c => new ObjectId(c))
                    }
                });
                classCond.push({ classRooms: [] });

                filter["$and"].push({ $or: classCond })
            } else if (request.query.classes || request.query.publicDiscussion) {
                let classCond = [];
                if (request.query.classes) {
                    let classIds = request.query.classes.split(',')
                    classIds = classIds.concat(myCircleIds);
                    classIds = _.uniq(classIds)
                    classCond.push({
                        classRooms: {
                            $in: classIds.map(c => new ObjectId(c))
                        }
                    });
                }

                if (request.query.publicDiscussion) {
                    classCond.push({ classRooms: [] });
                }

                // filter.$or = classCond;
                filter["$and"].push({ $or: classCond })
            } else {
                let classes = []
                if (request.user.roles.includes(config.config.roles.student)) {
                    classes = await this.classroomRepository.find({
                        $and: [
                            { 'students.studentId': new ObjectId(request.user._id) },
                            { $or: [{ "active": { $exists: false } }, { "active": true }] }
                        ]
                    }, { '_id': 1 })
                } else {
                    let cfilter: any = { active: true, allowDelete: true };
                    if (request.user.roles.includes(config.config.roles.teacher) || request.user.roles.includes(config.config.roles.mentor)) {
                        cfilter.user = new ObjectId(request.user._id);
                    } else if (request.user.roles.includes(config.config.roles.centerHead)) {
                        cfilter.location = { $in: request.user.locations.map(l => new ObjectId(l)) };
                    }

                    classes = await this.classroomRepository.find(cfilter, { '_id': 1 })
                }

                let classCond = [{ classRooms: [] }];
                if (classes && classes.length > 0) {
                    let classIds = classes.map(c => c._id)
                    classIds = classIds.concat(myCircleIds);
                    classIds = _.uniq(classIds)
                    classCond.push({
                        classRooms: {
                            // @ts-ignore
                            $in: classIds
                        }
                    });
                } else {
                    classCond.push({
                        classRooms: {
                            // @ts-ignore
                            $in: myCircleIds
                        }
                    });
                }
                filter["$and"].push({ $or: classCond })
            }

            if (request.query.text || request.query.tags) {
                let agg: { [key: string]: any }[] = [{
                    $match: filter
                }]
                agg.push({ $unwind: { path: '$comments', preserveNullAndEmptyArrays: true } })
                agg.push({ $lookup: { from: 'discussions', foreignField: '_id', localField: "comments", as: 'commentData' } }),
                    agg.push({ $unwind: { path: '$commentData', preserveNullAndEmptyArrays: true } })
                let orCond = [
                    { $and: [] },
                    { $and: [] }
                ]

                if (request.query.text) {
                    orCond[0].$and.push({
                        description: { $regex: util.regex(request.query.text, 'i') }
                    })
                    orCond[1].$and.push({
                        'commentData.description': { $regex: util.regex(request.query.text, 'i') }
                    })
                }

                if (request.query.tags) {
                    let items = request.query.tags.split('|').map(i => util.regexEscape(i));
                    let regexText = {
                        $regex: new RegExp(items.join('|'), 'i')
                    };

                    orCond[0].$and.push({
                        description: regexText
                    })
                    orCond[1].$and.push({
                        'commentData.description': regexText
                    })
                }

                agg.push({ $match: { $or: orCond } })

                if (request.query.count) {
                    agg.push({
                        $group: {
                            _id: '$_id'
                        }
                    })
                    agg.push({ '$count': 'total' })
                } else {
                    agg.push({
                        $lookup: {
                            from: 'users',
                            let: { uId: '$user' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$_id', '$$uId'] } } },
                                { $project: { name: 1, role: 1, avatar: 1, avatarSM: 1, avatarMD: 1, provider: 1, google: 1, facebook: 1, } }
                            ],
                            as: 'userData'
                        }
                    })
                    agg.push({ $unwind: '$userData' })

                    agg.push({
                        $lookup: {
                            from: 'users',
                            let: { uId: '$commentData.user' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$_id', '$$uId'] } } },
                                { $project: { name: 1, role: 1, avatar: 1, avatarSM: 1, avatarMD: 1, provider: 1, google: 1, facebook: 1, } }
                            ],
                            as: 'commentUserData'
                        }
                    })
                    agg.push({ $unwind: { path: '$commentUserData', preserveNullAndEmptyArrays: true } })

                    agg.push({
                        $group: {
                            _id: '$_id',
                            user: { $first: '$userData' },
                            subject: { $first: '$subject' },
                            topic: { $first: '$topic' },
                            description: { $first: '$description' },
                            createdAt: { $first: '$createdAt' },
                            updatedAt: { $first: '$updatedAt' },
                            viewed: { $first: '$viewed' },
                            vote: { $first: '$vote' },
                            notVote: { $first: '$notVote' },
                            isComment: { $first: '$isComment' },
                            isReply: { $first: '$isReply' },
                            attachments: { $first: "$attachments" },
                            parent: { $first: '$parent' },
                            feedType: { $first: '$feedType' },
                            allowComment: { $first: '$allowComment' },
                            classRooms: { $first: '$classRooms' },
                            comments: {
                                $push: {
                                    _id: '$commentData._id',
                                    parent: '$commentData.parent',
                                    user: '$commentUserData',
                                    description: '$commentData.description',
                                    createdAt: '$commentData.createdAt',
                                    updatedAt: '$commentData.updatedAt',
                                    viewed: '$commentData.viewed',
                                    vote: '$commentData.vote',
                                    notVote: '$commentData.notVote',
                                    isComment: '$commentData.isComment',
                                    isReply: '$commentData.isReply',
                                    feedType: '$commentData.feedType',
                                    attachments: "$commentData.attachments"
                                }
                            }
                        }
                    })

                    agg.push({ $unwind: { path: '$classRooms', preserveNullAndEmptyArrays: true } })
                    agg.push({ $lookup: { from: 'classrooms', localField: 'classRooms', foreignField: '_id', as: 'classInfo' } })
                    agg.push({ $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } })

                    agg.push({
                        $group: {
                            _id: '$_id',
                            user: { $first: '$user' },
                            subject: { $first: '$subject' },
                            topic: { $first: '$topic' },
                            description: { $first: '$description' },
                            createdAt: { $first: '$createdAt' },
                            updatedAt: { $first: '$updatedAt' },
                            viewed: { $first: '$viewed' },
                            vote: { $first: '$vote' },
                            notVote: { $first: '$notVote' },
                            isComment: { $first: '$isComment' },
                            isReply: { $first: '$isReply' },
                            parent: { $first: '$parent' },
                            feedType: { $first: '$feedType' },
                            allowComment: { $first: '$allowComment' },
                            comments: { $first: '$comments' },
                            attachments: { $first: "$attachments" },
                            classRooms: {
                                $push: {
                                    name: '$classInfo.name'
                                }
                            }
                        }
                    })

                    agg.push({
                        $project: {
                            _id: 1,
                            user: 1,
                            subject: 1,
                            topic: 1,
                            description: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            viewed: 1,
                            vote: 1,
                            notVote: 1,
                            isComment: 1,
                            isReply: 1,
                            parent: 1,
                            feedType: 1,
                            allowComment: 1,
                            attachments: 1,
                            comments: {
                                $cond: [
                                    { $not: [{ $arrayElemAt: ['$comments.description', 0] }] },
                                    [],
                                    '$comments'
                                ]
                            },
                            classRooms: {
                                $cond: [
                                    { $not: [{ $arrayElemAt: ['$classRooms.name', 0] }] },
                                    [],
                                    '$classRooms'
                                ]
                            }
                        }
                    })

                    let sort: any = { pin: -1, 'createdAt': -1 };
                    if (request.query.sort) {
                        let sortQuery = request.query.sort.split(',');
                        sort = { pin: -1 }
                        sort[sortQuery[0]] = sortQuery[1] == '-1' || sortQuery[1] == 'desc' ? -1 : 1
                    }

                    agg.push({ $sort: sort })

                    let limit = (request.query.limit) ? request.query.limit : 10;
                    let page = (request.query.page) ? request.query.page : 1;
                    let skip = (page - 1) * limit;
                    if (request.query.skip) {
                        skip = request.query.skip
                    }

                    agg.push({ $skip: skip })
                    agg.push({ $limit: limit })
                }

                let data = await this.discussionsRepository.aggregate(agg);

                if (request.query.count) {
                    return { response: (data), total: (data[0] ? (data[0] as any).total : 0) }
                } else {
                    return { response: (data) }
                }
            } else {
                if (request.query.count) {
                    let count = await this.discussionsRepository.countDocuments(filter);
                    return { count }
                } else {
                    let limit = (request.query.limit) ? request.query.limit : 10;
                    let page = (request.query.page) ? request.query.page : 1;
                    let skip = (page - 1) * limit;

                    if (request.query.skip) {
                        skip = request.query.skip
                    }

                    let sort: any = { pin: -1, 'updatedAt': -1 };

                    if (request.query.sort) {
                        let sortQuery = request.query.sort.split(',');
                        sort = { pin: -1 }
                        sort[sortQuery[0]] = sortQuery[1] == '-1' || sortQuery[1] == 'desc' ? -1 : 1
                    }

                    let posts = await this.discussionsRepository.find(filter, {}, {
                        sort: sort, skip: skip, limit: limit, populate: [
                            { path: 'user', select: 'name roles avatar avatarSM avatarMD provider google facebook' },
                            { path: 'classRooms', select: 'name _id' }
                        ]
                    });

                    for (let p of posts) {
                        p.totalComments = p.comments.length
                        if (p.classRooms && p.classRooms.length) {
                            p.classRooms = p.classRooms.filter((elem, index, self) => self.findIndex((t) => { return (t._id === elem._id) }) === index)
                        }

                        p.commentPage = 1;
                        p.comments = await this.discussionsRepository.find({ _id: { $in: p.comments }, active: true }, {}, { sort: { updatedAt: -1 }, skip: 0, limit: 2, populate: { path: 'user', select: 'name role avatar avatarSM avatarMD provider google facebook' } })
                    }

                    return { response: posts }
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getClassroomPosts(request: GetClassroomPostsReq) {
        try {
            let filter: any = {
                isComment: false,
                active: true,
                classRooms: new ObjectId(request.id)
            };

            if (request.query.feedType) {
                filter.feedType = request.query.feedType
                if (request.query.feedType == 'courseContent' && request.query.courseContent) {
                    filter.courseContent = request.query.courseContent;
                }
            } else {
                filter.feedType = "discussion"
            }

            if (request.query.count) {
                const count = await this.discussionsRepository.countDocuments(filter);
                return { count: count }
            } else {
                let limit = (request.query.limit) ? request.query.limit : 10;
                let page = (request.query.page) ? request.query.page : 1;
                let skip = (page - 1) * limit;

                let sort: any = { pin: -1, 'createdAt': -1 };

                if (request.query.sort) {
                    let sortQuery = request.query.sort.split(',');
                    sort = { pin: -1 }
                    sort[sortQuery[0]] = sortQuery[1] == '-1' || sortQuery[1] == 'desc' ? -1 : 1
                }

                const posts = await this.discussionsRepository.find(filter, {}, { sort: sort, skip: skip, limit: limit }, [{ path: 'user', select: 'name role avatar, avatarSM avatarMD provider google facebook' }, { path: 'classRooms', select: 'name' }])

                for (let p of posts) {
                    p.totalComments = p.comments.length
                    p.commentPage = 1;
                    p.comments = await this.discussionsRepository.find({ _id: { $in: p.comments }, active: true }, {}, { skip: 0, limit: 2 })
                }

                return {
                    response: posts
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getYourPosts(request: GetYourPostsReq) {
        try {
            let filter: any = {
                user: new ObjectId(request.user._id),
                isComment: false,
                active: true,
                location: new ObjectId(request.user.activeLocation)
            }

            if (request.query.feedType) {
                filter.feedType = request.query.feedType
                if (request.query.feedType == 'courseContent' && request.query.courseContent) {
                    filter.courseContent = request.query.courseContent
                }
            } else {
                filter.feedType = "discussion"
            }

            if (request.query.count) {
                const count = await this.discussionsRepository.countDocuments(filter)
                return {
                    count: count
                }
            } else {
                let limit = (request.query.limit) ? request.query.limit : 10;
                let page = (request.query.page) ? request.query.page : 1;
                let skip = (page - 1) * limit;

                let sort: any = { 'pin': -1, 'createdAt': -1 };

                if (request.query.sort) {
                    let sortQuery = request.query.sort.split(',');
                    sort = { pin: -1 }
                    sort[sortQuery[0]] = sortQuery[1] == '-1' || sortQuery[1] == 'desc' ? -1 : 1
                }
                const posts = await this.discussionsRepository.find(filter, {}, { sort: sort, skip: skip, limit: limit, populate: { path: 'user', select: 'name role avatar avatarSM avatarMD provider google facebook' }, lean: true })

                for (let p of posts) {
                    p.totalComments = p.comments.length
                    p.commentPage = 1;
                    p.comments = await this.discussionsRepository.find({ _id: { $in: p.comments }, active: true }, {}, { skip: 0, limit: 2, lean: true })
                }

                return {
                    response: posts
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getMySavedPosts(request: GetMySavedPostsReq) {
        // Allow search in all posts
        try {
            let filter: any = {
                savedBy: new ObjectId(request.user._id),
                isComment: false,
                active: true,
                location: new ObjectId(request.user.activeLocation)
            };

            if (request.query.feedType) {
                filter.feedType = request.query.feedType
                if (request.query.feedType == 'courseContent' && request.query.courseContent) {
                    filter.courseContent = request.query.courseContent;
                }
            } else {
                filter.feedType = "discussion"
            }

            if (request.query.count) {
                const count = await this.discussionsRepository.countDocuments(filter)
                return {
                    response: count
                }
            } else {
                let limit = (request.query.limit) ? request.query.limit : 10;
                let page = (request.query.page) ? request.query.page : 1;
                let skip = (page - 1) * limit;

                let sort: any = { pin: -1, 'updatedAt': -1 };

                if (request.query.sort) {
                    let sortQuery = request.query.sort.split(',');
                    sort = { pin: -1 }
                    sort[sortQuery[0]] = sortQuery[1] == '-1' || sortQuery[1] == 'desc' ? -1 : 1
                }
                const posts = await this.discussionsRepository.find(filter, {}, { sort: sort, skip: skip, limit: limit, populate: [{ path: 'user', select: 'name role avatar avatarSM avatarMD provider google facebook' }, { path: 'classRooms', select: 'name' }] })

                posts.forEach(function (p) {
                    p.totalComments = p.comments.length;
                    p.commentPage = 1;
                })

                // Show last 2 comments first
                const comm = await this.discussionsRepository.populate(posts, {
                    path: 'comments', options: {
                        sort: { updatedAt: -1 }, limit: 2, lean: true
                    }, populate: { path: 'user', select: 'name role avatar avatarSM avatarMD provider google facebook', options: { lean: true } }
                })

                return {
                    response: comm
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async flagDiscussion(request: GetFlagDiscussionReq) {
        try {
            await this.discussionsRepository.updateOne({ _id: new ObjectId(request.id) }, { $set: { flagged: true } })

            return {
                response: "Ok"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async unflagDiscussion(request: GetUnflagDiscussionReq) {
        try {
            await this.discussionsRepository.updateOne({ _id: new ObjectId(request.id) }, {
                $set: {
                    flagged: false
                }
            })

            return {
                response: "Ok"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getFlaggedPost(request: GetFlaggedPostReq) {
        try {
            let page = request.query.page || 1;
            let limit = request.query.limit || 10;
            let skip = (page - 1) * limit;

            const filterQuery: any = { active: true, flagged: true };

            if (!request.user.roles.includes('admin')) {
                filterQuery.location = new Types.ObjectId(request.user.activeLocation)
            }

            this.discussionsRepository.setInstanceKey(request.instancekey);
            // let cursor = await this.discussionsRepository.find(
            //     query, {},
            //     {
            //         sort: { updatedAt: -1 }, skip: skip, limit: limit,
            //         populate: { path: 'user', select: 'name roles avatar provider google facebook' }
            //     }
            // )

            const options = { sort: { updatedAt: -1 }, skip: skip, limit: limit };

            const populate = [{ path: 'user', select: 'name roles avatar provider google facebook' }];

            const posts = await this.discussionsRepository.find(filterQuery, null, options, populate);

            let count = null;
            if (request.query.count) {
                count = await this.discussionsRepository.countDocuments(filterQuery);
            }

            return request.query.count ? { posts, count } : { posts };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getOneFlaggedPost(request: GetOneFlaggedPostReq) {
        try {
            let post = await this.discussionsRepository.findOne({ _id: new ObjectId(request.id), active: true, flagged: true })

            if (!post) {
                throw new Error('Cannot find this post');
            }

            if (post.isComment) {
                // load parent post
                post = await this.discussionsRepository.findById(post.parent, {}, { populate: [{ path: 'user', select: 'name role avatar avatarSM avatarMD provider google facebook' }, { path: 'classRooms', select: 'name', options: { lean: true } }] })
            } else {
                post = await this.discussionsRepository.findById(new ObjectId(request.id), {}, {
                    populate: [
                        { path: 'user', select: 'name role avatar avatarSM avatarMD provider google facebook', options: { lean: true } },
                        { path: 'classRooms', select: 'name' },
                        { path: 'comments', options: { lean: true, sort: { 'updatedAt': -1 } } },
                        { path: 'user', select: 'name role avatar avatarSM avatarMD provider google facebook', options: { lean: true } }
                    ]
                })
            }

            return {
                response: post
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getDiscussionOfCourse(request: GetDiscussionOfCourseReq) {
        try {
            let course = await this.courseRepository.findById(request.courseId);

            if (!course) {
                throw new Error('Not found course')
            }

            // user can search discussions using course content title

            let contentIds = []
            let searchText = request.searchText ? request.searchText.toLowerCase() : ''
            for (let sec of course.sections) {
                contentIds = contentIds.concat(sec.contents.filter(c => !searchText || c.title.toLowerCase().indexOf(searchText) > -1).map(c => (c as any)._id))
            }

            let limit = Number(request.limit || 20)
            let skip = Number(request.skip || 0)

            let query = { feedType: 'courseContent', courseContent: { $in: contentIds }, isComment: false, location: new ObjectId(request.user.activeLocation) }

            if (request.lastDays == '90') {
                (query as any).createdAt = {
                    $gte: new Date((new Date).getDate() - 90)
                }
            }

            if (request.unanswered) {
                (query as any).user = { $ne: new ObjectId(request.user._id) },
                    query['comments.0'] = { $exists: false }
            }

            let agg: any = [
                {
                    $match: query
                },
                {
                    $facet: {}
                }
            ]

            if (request.count) {
                agg[1].$facet.count = [{ $count: 'total' }]
            }

            agg[1].$facet.posts = [
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { uId: '$user' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$uId'] } } },
                            { $project: { name: 1, role: 1, avatar: 1, avatarSM: 1, avatarMD: 1, provider: 1, google: 1, facebook: 1, } }
                        ],
                        as: 'userData'
                    }
                }, {
                    $unwind: '$userData'
                },
                {
                    $project: {
                        user: '$userData',
                        courseContent: '$courseContent',
                        subject: '$subject',
                        topic: '$topic',
                        description: '$description',
                        classRooms: '$classRooms',
                        attachments: '$attachments',
                        createdAt: '$createdAt',
                        updatedAt: '$updatedAt',
                        viewed: '$viewed',
                        vote: '$vote',
                        notVote: '$notVote',
                        isComment: '$isReply',
                        parent: '$parent',
                        comments: '$comments',
                        savedBy: '$savedBy',
                        feedType: '$feedType',
                        active: '$active',
                        allowComment: '$allowComment',
                        pin: '$pin',
                        flagged: '$flagged',
                        questionNumber: '$questionNumber'
                    }
                }
            ]

            let results = await this.discussionsRepository.aggregate(agg)

            if (!results[0]) {
                return {
                    count: 0, posts: []
                }
            }

            let result: any = results[0]
            if (result.count) {
                result.count = result.count[0] ? result.count[0].total : 0
            }

            if (result.posts) {
                for (let post of result.posts) {
                    post.commentPage = 1
                    post.totalComments = post.comments.length
                    // load first 2 comments
                    post.comments = await this.discussionsRepository.find({ _id: { $in: post.comments }, active: true }, {}, { sort: { createdAt: -1 }, skip: 0, limit: 2, populate: { path: 'user', select: 'name role avatar avatarSM avatarMD provider google facebook' } })

                    // set course section and content title for this post
                    for (let sec of course.sections) {
                        for (let content of sec.contents) {
                            if ((content as any)._id.equals(post.courseContent)) {
                                post.sectionTitle = sec.title;
                                post.contentTitle = content.title;
                                break;
                            }
                            if (post.contentTitle) {
                                break;
                            }
                        }
                    }
                }
            }

            return {
                response: result
            }

        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getOne(request: GetOneReq) {
        try {
            const post = await this.discussionsRepository.findById(request.id, {}, {
                populate: [
                    { path: 'user', select: 'name role avatar avatarSM avatarMD provider google facebook' },
                    { path: 'classRooms', select: 'name' }
                ]
            })

            if (!post) {
                throw new Error('Cannot find this post')
            }

            if (request.loadComments) {
                const postWithComments = await this.discussionsRepository.populate(post, { path: 'comments', options: { sort: { 'createdAt': 1 } }, populate: { path: 'user', select: 'name role avatar avatarSM avatarMD provider google facebook' } })

                return {
                    response: postWithComments
                }
            } else {
                return {
                    response: post
                }
            }


        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getComments(request: GetCommentsReq) {
        try {
            const post = await this.discussionsRepository.findById(request.id)

            if (!post) {
                throw new Error('Cannot find this post')
            }

            let query = await this.discussionsRepository.find({ _id: { $in: post.comments }, active: true, user: { $nin: request.user.blockedUsers } }, {}, { sort: ['updatedAt', -1] })

            let page = request.page;
            let skip;
            if (page) {
                // query = query.skip((page - 1) * 2)
                skip = (page - 1) * 2;
            }

            const posts = await this.discussionsRepository.find({ _id: post._id }, {}, { skip: skip, limit: 2, populate: { path: 'user', select: 'name role avatar avatarSM avatarMD provider google facebook' } })

            return {
                response: posts
            }

        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async create(request: GetCreateReq) {
        try {
            let newDis = request.body

            if ((!newDis.description || !newDis.description.trim()) && (!newDis.attachments || !newDis.attachments.length)) {
                throw new BadRequestException('Cannot create empty discussion.')
            }

            newDis.description = stripjs(request.body.description)

            const postData: any = {
                user: new Types.ObjectId(request.user._id),
                feedType: newDis.feedType || 'discussion',
                location: new Types.ObjectId(request.user.activeLocation),
                courseContent: newDis.courseContent ? new Types.ObjectId(newDis.courseContent) : undefined,
                grade: newDis.grade,
                subject: newDis.subject,
                topic: newDis.topic,
                description: newDis.description,
                classRooms: newDis.classRooms ? newDis.classRooms.map(id => new Types.ObjectId(id)) : undefined,
                attachments: newDis.attachments,
                viewed: newDis.viewed,
                vote: newDis.vote,
                notVote: newDis.notVote,
                isComment: newDis.isComment,
                isReply: newDis.isReply,
                parent: newDis.parent ? new Types.ObjectId(newDis.parent) : undefined,
                comments: newDis.comments,
                savedBy: newDis.savedBy,
                active: newDis.active,
                allowComment: newDis.allowComment,
                pin: newDis.pin,
                flagged: newDis.flagged,
                questionNumber: newDis.questionNumber
            };

            const post = await this.discussionsRepository.create(postData);

            this.sendNotification(request, post)

            if (request.body.classRooms && request.body.classRooms.length > 0) {
                try {
                    await this.classroomRepository.updateMany(
                        { _id: { $in: request.body.classRooms } },
                        { $set: { updatedAt: new Date() } }
                    )
                } catch (e) {
                    Logger.error(e)
                }
            }

            return post;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(error.message)
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async comment(request: PostCommentReq) {
        try {
            const post = await this.discussionsRepository.findById(new ObjectId(request.id), {}, { populate: { path: 'user', select: '-salt -hashedPassword' } })

            if (!post) {
                throw new Error('Cannot find this post');
            }

            if (!post.allowComment) {
                throw new Error('This post does not allow comment');
            }

            if ((!request.body.description || !request.body.description.trim()) && (!request.body.attachments || !request.body.attachments.length)) {
                throw new Error('Cannot create empty comment.')
            }

            let comment: any = request.body;
            comment.user = request.user;
            comment.isComment = true;
            comment.feedType = post.feedType;
            comment.parent = post._id;
            comment.classRooms = post.classRooms;
            comment.location = post.location;
            if (post.courseContent) {
                comment.courseContent = post.courseContent
            }

            const newcomment = await this.discussionsRepository.create(comment);

            await this.discussionsRepository.findByIdAndUpdate(post._id, {
                $push: {
                    comments: newcomment._id
                }, $inc: { viewed: 1 }
            }, { new: true })

            return {
                response: newcomment
            }
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

    async update(request: PostUpdateReq) {
        try {
            const post = await this.discussionsRepository.findById(new ObjectId(request.id));

            if (!post) {
                throw new Error('Cannot find this post');
            }

            if (request.body.newViewed) {
                let newPin = request.body.pin;
                let nViewed = post.viewed + request.body.newViewed;
                await this.discussionsRepository.findByIdAndUpdate(post._id, {
                    $set: {
                        pin: newPin,
                        viewed: nViewed
                    }
                })
            } else if (request.body.description || request.body.attachments.length) {
                // Edit content, only an owner can edit it

                if (post.user.toString() !== request.user._id.toString() && request.user.roles.includes(config.config.roles.director) == false && request.user.roles.includes(config.config.roles.admin)) {
                    throw new Error('You are not allowed to edit this post');
                }

                if (request.body.attachments) {
                    post.attachments = request.body.attachments
                }

                post.description = request.body.description ? stripjs(request.body.description.trim()) : ''

                if ((!post.description || !post.description.trim()) && (!post.attachments || !post.attachments.length)) {
                    throw new Error('Cannot create empty content');
                }

                post.pin = request.body.pin || false

                await this.discussionsRepository.updateOne({ _id: post._id }, post)

                return {
                    response: "Ok"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

    async vote(request: GetVoteReq) {
        try {
            const post = await this.discussionsRepository.findById(new ObjectId(request.id))

            if (!post) {
                throw new Error('Cannot find this post');
            }

            if (post.vote.indexOf(new ObjectId(request.user._id)) > -1) {
                return {
                    response: "Ok"
                }
            }

            post.vote.push(new ObjectId(request.user._id))

            let postDB = await this.discussionsRepository.create(post)
            return {
                response: "Ok"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async unvote(request: GetUnvoteReq) {
        try {
            const post = await this.discussionsRepository.findById(new ObjectId(request.id));

            if (!post) {
                throw new Error("Cannot find this post")
            }

            let idx = post.vote.indexOf(new ObjectId(request.user._id))
            if (idx === -1) {
                return {
                    response: "Ok"
                }
            }
            post.vote.splice(idx, 1);
            let postDB = await this.discussionsRepository.create(post);

            return {
                response: "Ok"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async notvote(request: GetNotvoteReq) {
        try {
            const post = await this.discussionsRepository.findById(new ObjectId(request.id))

            if (!post) {
                throw new Error("Cannot find this post")
            }

            if (!post.notVote) {
                post.notVote = []
            }

            if (post.notVote.indexOf(new ObjectId(request.user._id)) > -1) {
                return {
                    response: "Ok"
                }
            }

            post.notVote.push(new ObjectId(request.user._id));

            let postDB = await this.discussionsRepository.create(post);

            return {
                response: "Ok"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async undonotvote(request: GetUndonotvoteReq) {
        try {
            const post = await this.discussionsRepository.findById(new ObjectId(request.id))

            if (!post) {
                throw new Error("Cannot find this post");
            }

            let idx = post.notVote.indexOf(new ObjectId(request.user._id))
            if (idx === -1) {
                return {
                    response: "Ok"
                }
            }

            post.notVote.splice(idx, 1);

            let postDB = await this.discussionsRepository.create(post);

            return {
                response: "Ok"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async delete(request: GetDeleteReq) {
        try {
            const post = await this.discussionsRepository.findOne({ _id: new ObjectId(request.id) });

            if (!post) {
                throw new Error("Cannot find this post");
            }

            // Only director/admin/support can delete other user posts
            // For discussion in course, teacher can remove student discussion
            if (request.user.roles.includes('director') || request.user.roles.includes('admin') || request.user.roles.includes('support')) {
                if ((post.feedType !== 'courseContent' || request.user.roles.includes('student')) && !post.user.equals(request.user._id)) {
                    throw new Error("You are not allowed to delete this post")
                }
            }

            if (post.isComment) {
                const removeComment = await this.discussionsRepository.findByIdAndUpdate(post._id, {
                    $set: {
                        active: false
                    }
                })

                // remove the comment from its parent
                const data = await this.discussionsRepository.findOneAndUpdate({ _id: removeComment.parent, comments: removeComment._id }, {
                    $pull: {
                        comments: removeComment._id
                    },
                    $inc: { viewed: -1 }
                })

                return {
                    response: "Ok"
                }
            } else {
                // de active the post with all its comment
                let toDelete = post.comments;
                toDelete.push(new ObjectId(request.id));

                await this.discussionsRepository.updateMany({ _id: { $in: toDelete } }, { $set: { active: false } })

                return {
                    response: "Ok"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

    async savePost(request: SavePostReq) {
        try {
            const post = await this.discussionsRepository.findById(new ObjectId(request.id));

            if (!post) {
                throw new Error('cannot find this post');
            }

            if (!post.savedBy) {
                post.savedBy = []
            }

            if (post.savedBy.indexOf(new ObjectId(request.user._id)) > -1) {
                return {
                    response: "ok"
                }
            }

            post.savedBy.push(new ObjectId(request.user._id))

            let postDB = await this.discussionsRepository.create(post);
            return {
                response: "ok"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async unsavedPost(request: UnsavedPostReq) {
        try {
            const post = await this.discussionsRepository.findById(new ObjectId(request.id));

            if (!post) {
                throw new Error('Cannot find this post');
            }

            let idx = post.savedBy.indexOf(new ObjectId(request.user._id));

            if (idx === -1) {
                return {
                    response: "ok"
                }
            }

            post.savedBy.splice(idx, 1);

            let postDB = await this.discussionsRepository.create(post);

            return {
                response: "ok"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async createDiscussionRespond(request: createDiscussionRespondReq) {
        try {
            let discussQues = {
                description: stripjs(request.body.comment),
                feedType: request.body.feedType,
                classRooms: request.body.classRooms,
                location: new ObjectId(request.user.activeLocation)
            }

            let studentQ = request.body.studentQ;
            let teacherR = request.body.teacherR;

            if (teacherR.comment) {
                let post: any = discussQues;
                post.user = new ObjectId(request.user._id);
                post.allowComment = true;
                if (!post.feedType) {
                    post.feedType = 'discussion';
                }

                const newPost = await this.discussionsRepository.create(post);

                if (studentQ && studentQ.length === 1) {
                    const post = await this.discussionsRepository.findById(newPost._id, {}, { populate: { path: 'user', select: '-salt -hashedPassword' } })

                    if (!post) {
                        throw new Error('Cannot find this post');
                    }

                    if (!post.allowComment) {
                        throw new Error('This post does not allow comment');
                    }

                    let comment = {
                        description: studentQ[0].comment,
                        user: new ObjectId(studentQ[0].studentId),
                        location: new ObjectId(request.user.activeLocation),
                        isComment: true,
                        feedType: post.feedType,
                        // parent is only used for tracing in case comment is deleted and removed from comments array of a post
                        parent: post._id,
                        classRooms: post.classRooms,
                    }

                    let newComment = await this.discussionsRepository.create(comment);

                    let result = await this.discussionsRepository.findByIdAndUpdate(post._id, { $push: { comments: newComment._id }, $inc: { viewed: 1 } }, { new: true });

                    await this.questionFeedbackRepository.updateOne({ _id: new ObjectId(studentQ[0].feedbackId) }, {
                        $set: {
                            responded: true
                        }
                    })

                    let tcomment = {
                        description: teacherR.comment,
                        user: new ObjectId(request.user._id),
                        location: new ObjectId(request.user.activeLocation),
                        isComment: true,
                        feedType: post.feedType,
                        parent: post._id,
                        classRooms: post.classRooms,
                    }

                    newComment = await this.discussionsRepository.create(tcomment)

                    result = await this.discussionsRepository.findByIdAndUpdate(post._id, {
                        $push: {
                            comments: newComment._id
                        }, $inc: { viewed: 1 }
                    }, { new: true })

                    this.sendNotification(request, newComment, post)

                    return {
                        response: 'updated'
                    }
                } else if (studentQ && studentQ.length > 1) {
                    const post = await this.discussionsRepository.findById(newPost._id, {}, {
                        populate: { path: 'user', select: '-salt -hashedPassword' }
                    })

                    if (!post) {
                        throw new Error('Cannot find this post');
                    }

                    if (!post.allowComment) {
                        throw new Error('This post does not allow comment');
                    }

                    for (let i = 0; i < studentQ.length; i++) {
                        let comment = {
                            description: studentQ[i].comment,
                            user: new ObjectId(studentQ[i].studentId),
                            location: new ObjectId(request.user.activeLocation),
                            isComment: true,
                            feedType: post.feedType,
                            // parent is only used for tracing in case comment is deleted and removed from comments array of a post
                            parent: post._id,
                            classRooms: post.classRooms,
                        }

                        let newComment = await this.discussionsRepository.create(comment);

                        let result = await this.discussionsRepository.findByIdAndUpdate(post._id, { $push: { comments: newComment._id }, $inc: { viewed: 1 } }, { new: true });

                        await this.questionFeedbackRepository.updateOne({ _id: new ObjectId(studentQ[i].feedbackId) }, {
                            $set: {
                                responded: true
                            }
                        })

                        let tcomment = {
                            description: teacherR.comment,
                            user: new ObjectId(request.user._id),
                            location: new ObjectId(request.user.activeLocation),
                            isComment: true,
                            feedType: post.feedType,
                            parent: post._id,
                            classRooms: post.classRooms,
                        }

                        newComment = await this.discussionsRepository.create(tcomment)

                        result = await this.discussionsRepository.findByIdAndUpdate(post._id, {
                            $push: {
                                comments: newComment._id
                            }, $inc: { viewed: 1 }
                        }, { new: true })

                        this.sendNotification(request, newComment, post);

                        return {
                            response: 'updated'
                        }
                    }
                }
            } else {
                throw new Error("Add response first")
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }
}