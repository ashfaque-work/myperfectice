import { QuestionRepository, UsersRepository } from "@app/common";
import { GetQuestionDistributionBySubjectReq, OperatorQuestionAddedTrendReq } from "@app/common/dto/userManagement/operator.dto";
import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { GrpcInternalException } from "nestjs-grpc-exceptions";

@Injectable()
export class OperatorService {
    constructor(
        private readonly questionRepository: QuestionRepository,
        private readonly usersRepository: UsersRepository
    ) {}

    async operatorQuestionAddedTrend(request: OperatorQuestionAddedTrendReq) {
        try {            
            let filter: any = {};
            filter.user = new ObjectId(request.user._id)
            const trend = await this.questionRepository.aggregate([
                {
                    "$match": filter
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
                }, {
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
                { $group: { _id: null, data: { $push: "$count" }, labels: { $push: "$createdAt.date" } } }
                ]
            )

            return trend[0]
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getQuestionDistributedBySubject(request: GetQuestionDistributionBySubjectReq) {
        try {
            let teachers = await this.usersRepository.distinct('_id', {roles: {$in: ['director', 'teacher', 'operator']}, locations: new ObjectId(request.user.activeLocation)})

            let result: any = await this.questionRepository.aggregate([{ $match: {'subject._id': new ObjectId(request.subject), user: {$in: teachers}}},
                { $group: { _id: { "category": "$category", "unit": "$unit.name" }, count: { $sum: 1 } } }
                , { $group: { _id: "$_id.unit", data: { $push: { category: "$_id.category", count: "$count" } } } }
            ])

            let tempResult = {
                labels: [],
                mcq: {
                    name: 'MCQ',
                    data: []
                },
                fib: {
                    name: 'FIB',
                    data: []
                },
                code: {
                    name: 'Code',
                    data: []
                },
                descriptive: {
                    name: 'Descriptive',
                    data: []
                },
                mixmatch: {
                    name: 'Mixmatch',
                    data: []
                }
            }

            if(result.length > 0) {
                result.forEach((d, i) => {
                    if(d._id) {
                        if(tempResult.labels.indexOf(d._id) === -1) {
                            tempResult.labels.push(d._id)
                        }
                        if (d.data.length > 0) {
                            tempResult.mcq.data.push(0);
                            tempResult.fib.data.push(0);
                            tempResult.descriptive.data.push(0);
                            tempResult.code.data.push(0);
                            tempResult.mixmatch.data.push(0);
    
                            d.data.forEach(c => {
    
                                switch (c.category) {
                                    case 'mcq':
    
                                        tempResult.mcq.data[i] = c.count;
                                        break;
                                    case 'fib':
    
                                        tempResult.fib.data[i] = c.count
                                        break;
    
                                    case 'code':
    
                                        tempResult.code.data[i] = c.count
                                        break;
                                    case 'descriptive':
    
                                        tempResult.descriptive.data[i] = c.count
    
                                        break;
                                    case 'mixmatch':
                                        tempResult.mixmatch.data[i] = c.count
    
    
                                    default:
                                        break;
                                }
    
                            })
                        }
                    }
                })
            }

            return tempResult
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }
}