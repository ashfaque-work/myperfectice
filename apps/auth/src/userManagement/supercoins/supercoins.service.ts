import { RedisCaching, SuperCoinsRepository, UserSuperCoinsRepository } from "@app/common";
import { CreateSupercoinsReq, GetMembersReq, IndexSupercoinsReq, RequestStudentsReq, UpdateStatusReq, UpdateSupercoinsReq } from "@app/common/dto/userManagement/supercoins.dto";
import { Injectable } from "@nestjs/common";
import { response } from "express";
import { ObjectId } from "mongodb";
import { GrpcInternalException } from "nestjs-grpc-exceptions";
import * as moment from 'moment';
import { MessageCenter } from "@app/common/components/messageCenter";

@Injectable()
export class SupercoinsService {

    constructor(
        private readonly supercoinsRepository: SuperCoinsRepository,
        private readonly userSupercoinsRepository: UserSuperCoinsRepository,
        private readonly redist: RedisCaching,
        private readonly messageCenter: MessageCenter
    ) {}

    async indexSupercoins(request: IndexSupercoinsReq) {
        try {
            if(request.type) {
                let condition = { type: request.type }
                if(request.searchText) {
                    condition['title'] = {
                        "$regex": request.searchText,
                        "$options": "i"
                    }
                }

                this.supercoinsRepository.setInstanceKey(request.instancekey)
                const result = await this.supercoinsRepository.find(condition);

                if(result) {
                    return {
                        response: result
                    }
                }

                return {
                    response: []
                }
            } else {
                return {
                    message: "No data found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);            
        }
    }

    async updateSupercoins(request: UpdateSupercoinsReq) {
        try {
            if(request.id){
                let filter = {_id: request.id}
                this.supercoinsRepository.setInstanceKey(request.instancekey)
                const coins = await this.supercoinsRepository.findOne(filter);

                if(!coins) {
                    throw new Error("Not found");
                }

                if(request.body.full) {
                    const status = await this.supercoinsRepository.updateOne(filter, {
                        title: request.body.title,
                        summary: request.body.summary,
                        value: request.body.value,
                        lastModifiedBy: new ObjectId(request.user._id)
                    })

                    return {
                        response: status
                    }
                } else {
                    coins.status = request.body.status
                    const status = await this.supercoinsRepository.updateOne(filter, {
                        status: request.body.status, lastModifiedBy: new ObjectId(request.user._id)
                    })

                    return {
                        response: status
                    }
                }
            } else {
                return {
                    message: "No data found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async createSupercoins(request: CreateSupercoinsReq) {
        try {
            if(request.body.title) {
                request.body.title = request.body.title.replace(/ {1,}/g, " ");
            }

            if(!request.user.email) {
                throw new Error('Please add you email in your account before creation of course')
            }

            let supercoin = {
                title: request.body.title,
                summary: request.body.summary,
                status: true,
                value: request.body.value,
                type: request.body.type,
                createdBy: new ObjectId(request.user._id)
            }

            this.supercoinsRepository.setInstanceKey(request.instancekey);
            const coinsToSave = await this.supercoinsRepository.create(supercoin);

            return {
                ...coinsToSave
            }
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

    async requestStudents(request: RequestStudentsReq) {
        try {
            if(request.activityType) {
                let pipe: any = [
                    {
                        $match: {
                            $or: [{ activityType: 'inprocess' }
                            ]
                        }
                    },
                    {
                        $unwind: '$user'
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "user",
                            foreignField: "_id",
                            as: "userInfo"
                        }
                    },
                    { $unwind: '$userInfo' },
                    {
                        $project: {
                            _id: 1,
                            activityType: 1,
                            studentId: '$userInfo._id',
                            name: '$userInfo.name',
                            userId: '$userInfo.email',
                            avatar: '$userInfo.avatar',
                            studentMsg: '$studentMsg'
                        }
                    }
                ]

                if(request.searchText) {
                    pipe.push({
                        $match: {
                            $or: [{
                                name: {
                                    $regex: request.searchText,
                                    $options: "i"
                                }
                            }, {
                                userId: request.searchText
                            }]
                        }
                    })
                }

                this.userSupercoinsRepository.setInstanceKey(request.instancekey)
                let users = await this.userSupercoinsRepository.aggregate(pipe)

                if(users) {
                    return {
                        response: users
                    }
                }

                return {
                    response: []
                }
            } else {
                return {
                    message: "No data found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async updateStatus(request: UpdateStatusReq) {
        try {
            if(request.id && request.body.activityType) {
                let filter = {_id: request.id}
                this.userSupercoinsRepository.setInstanceKey(request.instancekey)
                const coins = await this.userSupercoinsRepository.findOne(filter);

                if(!coins) {
                    throw new Error('Not found');
                }

                const status = await this.userSupercoinsRepository.updateOne(filter, {
                    teacherMsg: request.body.teacherMsg,
                    activityType: request.body.activityType,
                    lastModifiedBy: new ObjectId(request.user._id)
                })

                const user = {
                    _id: request.body.studentId,
                    email: request.body.email
                }

                // this.sendConfirmation(request, user, request.body.activityType, () => {})

                return {
                    ...status
                }
            } else {
                return {
                    message: "No data found"
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getMembers(request: GetMembersReq) {
        try {
            if(request.name) {
                const pipe = []
                pipe.push(
                    {
                        "$match": {
                            status: true
                        }
                    },
                    {
                        $project: {
                            activityType: 1,
                            coins: 1,
                            count: 1,
                            user: 1
                        }
                    },
                    {
                        $project: {
                            earned: {
                                "$sum": {
                                    "$cond": [{ "$eq": ["$activityType", 'earned'] }, "$coins", 0]
                                }
                            },
                            inprocess: {
                                "$sum": {
                                    "$cond": [{ "$eq": ["$activityType", 'inprocess'] }, "$coins", 0]
                                }
                            },
                            redeem: {
                                "$sum": {
                                    "$cond": [{ "$eq": ["$activityType", 'redeemed'] }, "$coins", 0]
                                }
                            },
                            user: 1
                        }
                    },
                    {
                        $group:
                        {
                            _id: { user: "$user" },
                            earned: { "$sum": "$earned" },
                            redeem: { "$sum": "$redeem" },
                            inprocess: { "$sum": "$inprocess" }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id.user",
                            foreignField: "_id",
                            as: "userInfo"
                        }
                    },
                    { $unwind: '$userInfo' },
                    {
                        $project: {
                            studentId: '$userInfo._id',
                            _id: 1,
                            name: '$userInfo.name',
                            email: '$userInfo.email',
                            avatar: '$userInfo.avatar',
                            earned: 1,
                            redeem: 1,
                            inprocess: 1
                        }
                    },
                    {
                        "$match": {
                            $or: [{
                                name: {
                                    $regex: request.name,
                                    $options: "i"
                                }
                            }, {
                                email: request.name
                            }],
                        }
                    }
                )

                this.userSupercoinsRepository.setInstanceKey(request.instancekey)
                const activities = await this.userSupercoinsRepository.aggregate(pipe)

                return {
                    response: activities
                }
            } else {
                return {
                    response: []
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async sendConfirmation(req, user, status, next) {
        const settings = await this.redist.getSetting(req);
        let product = ''

        let template = 'educoin-status'
        let subject = 'Approved Successfully'
        if (status == 'rejected') {
            subject = 'Rejected educoin redemption'
        }

        let opt = {
            date: moment().format('MMM DD, YYYY'),
            baseUrl: settings.baseUrl,
            websiteName: settings.baseUrl,
            logo: settings.baseUrl,
            productName: product,
            subject: subject,
            status: status,
            reason: req.body.teacherMsg,
        }

        let dataMsgCenter = {
            to: user.email,
            isScheduled: true,
            isEmail: true,
            modelId: 'educoin-status',
            receiver: user._id
        };

        this.messageCenter.sendWithTemplate(req, template, opt, dataMsgCenter, function(err) {
            return next && next(err)
        })
    }
}