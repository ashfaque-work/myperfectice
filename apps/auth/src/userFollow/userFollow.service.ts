import { UserFollowRepository, UsersRepository } from "@app/common";
import { AmIFollowReq, AmIFollowRes, FollowListReq, FollowReq } from "@app/common/dto/userFollow.dto";
import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { GrpcInternalException } from "nestjs-grpc-exceptions";

@Injectable()
export class UserFollowService {
    constructor(
        private readonly userFollowRepository: UserFollowRepository,
        private readonly usersRepository: UsersRepository
    ) {}

    async amIFollow(request: AmIFollowReq) {
        try {
            const result = await this.userFollowRepository.findOne({userId: new ObjectId(request.user._id), followingId: new ObjectId(request.params.userId), status: true})

            return {
                response: result
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async follow(request: FollowReq) {
        try {
            let params = request.body;
            if(!params) {
                throw Error('Params not found');
            }

            let userId = null;
            let followingId = null;

            if(!params.unfollowMe) {
                userId = new ObjectId(request.user._id)
                followingId = new ObjectId(params.userId)
            } else {
                userId = new ObjectId(params.userId)
                followingId = new ObjectId(request.user._id)
            }

            // if user tries to follow, check if he is blocked
            if(params.state) {
                let isBlocked = await this.usersRepository.findOne({
                    _id: followingId, blockedUsers: userId
                }, {_id: 1})

                if(!isBlocked) {
                    isBlocked = await this.usersRepository.findOne({
                        _id: userId, blockedUsers: followingId
                    }, {_id: 1})
                }

                if(isBlocked) {
                    throw new Error("Cannot follow blocked user");
                }
            }

            const result = await this.userFollowRepository.findOneAndUpdate(
                {userId, followingId},
                {$set: {
                    status: params.state
                }},
                {
                    new: true,
                    upsert: true,
                }
            )

            if(result){
                return {
                    response: "Ok"
                }
            } else {
                throw new Error("Not found the result")
            }

        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }


    async followList(request: FollowListReq) {
        try {
            console.log(request);
            
            const data = request.body;
            if(!data || !data.userId || !data.type){
                throw new Error('Not found')
            }

            let byID = "userId"
            let toID = "followingId"
            if(data.type === "followers") {
                byID = "followingId"
                toID = "userId"
            }

            const pipe = []
            pipe.push({ "$match": { [byID]: new ObjectId(data.userId), status: true } })
            pipe.push({ "$project": { [toID]: 1, _id: 0 } })
            pipe.push({
                "$lookup": {
                    from: "users",
                    localField: toID,
                    foreignField: "_id",
                    as: "match"
                }
            })
            pipe.push({ "$project": { [toID]: 1, "match.name": 1, "match.coreBranch": 1, "match.role": 1, "match.avatar": 1 } })
            pipe.push({ "$unwind": { path: "$match" } })

            const list = await this.userFollowRepository.aggregate(pipe)

            const arr = []
            const fIds = []
            for (let i = 0; i < list.length; i++) {
                // @ts-ignore
                arr.push({ ...list[i].match, id: list[i][toID] })
                fIds.push(list[i][toID])
            }

            let list1 = []
            if (data.id) {
                list1 = await this.userFollowRepository.find({
                    userId: data.id,
                    followingId: {$in: fIds},
                    status: true
                }, {
                    _id: 0,
                    followingId: 1
                })
            }

            const myFollowings = list1.map(item => item.followingId.toString());

            const finalArr = arr.map(item => {
                item.iFollow = myFollowings.includes(item.id.toString())
                return item
            })

            return {
                response: finalArr
            }

        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }
}