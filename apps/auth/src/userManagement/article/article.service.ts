import { ArticlesRepository } from "@app/common";
import { CreateArticleReq, DestroyArticleReq, FindOneReq, IndexReq, NotvoteReq, UndoNotvoteReq, UnvoteReq, UpdateArticleReq, UpdateCountReq, VoteReq } from "@app/common/dto/userManagement/article.dto";
import { Injectable } from "@nestjs/common";
import { response } from "express";
import { ObjectId } from "mongodb";
import { GrpcInternalException } from "nestjs-grpc-exceptions";
import * as slug from 'slug';

@Injectable()
export class ArticleService {
    constructor(
        private readonly articlesRepository: ArticlesRepository,
    ) { }

    async index(request: IndexReq) {
        let articleLists = [];
        let page = (request.query.page) ? request.query.page : 1
        let items = (request.query.limit) ? request.query.limit : 20
        let limit = Number(items)
        let skip = (Number(page) - 1) * limit
        let sort = {
            'isTop': -1,
            'createdAt': -1
        }
        let expiresOnFilter = {
            $gt: new Date()
        }

        let condition: any = {
            active: true
        }

        condition.$or = [{
            expiresOn: expiresOnFilter
        }, {
            expiresOn: null
        }, {
            expiresOn: ''
        }]

        if (request.query.sort) {
            let dataSort = request.query.sort.split(',')
            let temp = `{"${dataSort[0]}":${dataSort[1]} }`;
            let jsonArray = JSON.parse(temp)
            sort = jsonArray
        }

        let projection = {
            createdAt: 1,
            updatedAt: 1,
            contentType: 1,
            link: 1,
            user: 1,
            description: 1,
            viewed: 1,
            summery: 1,
            title: 1,
            avgRating: 1,
            feedbacks: 1,
            isTop: 1,
            status: 1,
            tags: 1,
            active: 1,
            approved: 1,
            slugfly: 1,
            expiresOn: 1,
            onlyVideo: 1,
            vote: 1,
            notVote: 1
        }

        if (request.query.contentTypes) {
            let temp = request.query.contentTypes.split(",")
            condition.contentType = { $in: temp }
        }

        if (request.query.searchText && request.query.searchText != 'undefined') {
            condition['title'] = {
                "regex": request.query.searchText,
                "$options": "i"
            }
        }

        const articles = await this.articlesRepository.find(condition, projection, { sort: sort, skip: skip, limit: limit })

        for (let i = 0; i < articles.length; i++) {
            if (articles[i].feedbacks) {
                if (articles[i].feedbacks.length > 0) {
                    for (var j = 0; j < articles[i].feedbacks.length; j++) {
                        if (String(articles[i].feedbacks[j].user) === String(request.user._id)) {
                            articles[i].rating = articles[i].feedbacks[j].rating;
                            articles[i].lastUpdated = articles[i].feedbacks[j].updatedAt;
                        }
                    }
                } else {
                    articles[i].rating = 0;
                }
            }

            articles[i].feedbacks = []
        }

        articleLists = articles;

        const totalCount = await this.articlesRepository.countDocuments(condition)

        return {
            count: totalCount,
            articles: articleLists
        }
    }

    async create(request: CreateArticleReq) {
        try {
            let art = request.body;
            let article: any = {
                link: art.link,
                description: art.description,
                summary: art.summary,
                tags: art.tags,
                title: art.title,
                contentType: art.contentType,
                user: new ObjectId(request.user._id),
                isTop: art.isTop,
                expiresOn: art.expiresOn,
                onlyVideo: art.onlyVideo
            }

            if (request.user.roles.includes('student') === false) {
                article.approved = true;
            }

            let filter: any = {
                title: art.title,
                summary: art.summary
            }

            if (art.link && art.description) {
                filter.$or = [{
                    link: art.link
                }, {
                    description: new RegExp(["^", art.description, "$"].join(""), "i")
                }]
            } else {
                if (art.link) {
                    filter.link = art.link
                } else if (art.description) {
                    filter.description = new RegExp(["^", art.description, "$"].join(""), "i");
                }
            }

            const result = await this.articlesRepository.find(filter);
            if (result && result.length > 0) {
                throw new Error("Warning, an article with this name or url already exists. Please provide another title and url.")
            }
            // await this.articlesRepository.findByIdAndUpdate(article._id, article);

            const newArticle = await this.articlesRepository.create(article)
            return {
                response: "Ok"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async findOne(request: FindOneReq) {
        try {
            let condition: any = {}
            if (request.id) {
                condition._id = request.id
                const article = await this.articlesRepository.findById(condition);
                (article as any).slugfly = slug(article.title, {
                    lower: true
                })
                return {
                    response: article
                }
            } else {
                throw new Error("Id is required")
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async vote(request: VoteReq) {
        try {
            const article = await this.articlesRepository.findById(request.id);
            if (!article) {
                throw new Error("Cannot find this article")
            }

            if (article.vote.indexOf(new ObjectId(request.user._id)) > -1) {
                throw new Error("Cannot vote");
            }

            article.vote.push(new ObjectId(request.user._id));
            let articleDB = await this.articlesRepository.create(article);
            return {
                response: "ok"
            }
        } catch (error) {

        }
    }

    async unvote(request: UnvoteReq) {
        try {
            const article = await this.articlesRepository.findById(request.id);

            if (!article) {
                throw new Error("Cannot find this article");
            }

            let idx = article.vote.findIndex(vote => vote.toString() === request.user._id.toString());
            if (idx === -1) {
                return {
                    response: "Ok"
                }
            }

            article.vote.splice(idx, 1);
            let articleDB = await this.articlesRepository.create(article);
            return {
                response: "Ok"
            }

        } catch (error) {

        }
    }

    async notvote(request: NotvoteReq) {
        try {
            let article = await this.articlesRepository.findById(request.id);

            if (!article) {
                throw new Error("Not found this article");
            }

            if (!article.notVote) {
                article.notVote = []
            }

            if (article.notVote.indexOf(new ObjectId(request.user._id)) > -1) {
                return {
                    response: "Ok"
                }
            }

            article.notVote.push(new ObjectId(request.user._id));
            let articleDB = await this.articlesRepository.create(article);
            return {
                response: "Ok"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async undoNotvote(request: UndoNotvoteReq) {
        try {
            let article = await this.articlesRepository.findById(request.id);
            if (!article) {
                throw new Error('Cannot find this article')
            }

            let idx = article.notVote.findIndex(vote => vote.toString() === request.user._id.toString());

            if (idx === -1) {
                return {
                    response: "Okk"
                }
            }

            article.notVote.splice(idx, 1);
            let articleDB = await this.articlesRepository.create(article);

            return {
                response: "Okk"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async update(request: UpdateArticleReq) {
        try {
            let article = request.body;
            let orCondition = [];
            if (typeof article.link === 'string') {
                orCondition.push({
                    link: article.link
                })
            }
            if (article.description) {
                orCondition.push({
                    description: article.description
                })
            }

            const articleToSave = {
                description: request.body.description,
                title: request.body.title,
                summary: request.body.summary,
                tags: request.body.tags,
                approved: request.body.approved,
                contentType: request.body.contentType,
                expiresOn: request.body.expiresOn,
                onlyVideo: request.body.onlyVideo,
                isTop: request.body.isTop,
            }

            if (typeof request.body.link === 'string') {
                (articleToSave as any).link = request.body.link
            }

            const updatedArticle = await this.articlesRepository.findByIdAndUpdate(request.id, articleToSave, { new: true })
            return {
                response: updatedArticle
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async updateCount(request: UpdateCountReq) {
        try {
            let avgRating = 0;
            if (request.body.feedback) {
                const article = await this.articlesRepository.findOne({
                    _id: new ObjectId(request.id),
                    'feedbacks.user': new ObjectId(request.user._id)
                })

                if (article) {
                    await this.articlesRepository.updateOne({
                        _id: new ObjectId(request.id),
                        'feedbacks.user': new ObjectId(request.user._id)
                    }, {
                        $set: {
                            "feedbacks.$.rating": request.body.rating,
                            "feedbacks.$.updatedAt": new Date()
                        }
                    })
                } else {
                    const feedback = {
                        user: request.user._id,
                        updatedAt: Date.now(),
                        rating: request.body.rating
                    }
                    await this.articlesRepository.updateOne({
                        _id: new ObjectId(request.id)
                    }, {
                        "$addToSet": {
                            feedbacks: feedback
                        }
                    })
                }

                const content = await this.articlesRepository.aggregate([{
                    $match: {
                        _id: new ObjectId(request.id)
                    }
                }, {
                    $unwind: "$feedbacks"
                }, {
                    $group: {
                        _id: "$_id",
                        totalRating: {
                            "$sum": "$feedbacks.rating"
                        },
                        userCount: {
                            "$sum": 1
                        }
                    }
                }])

                if (content.length > 0) {
                    const result: any = content[0]
                    avgRating = result.totalRating / result.userCount;
                    const contentResult = await this.articlesRepository.updateOne({
                        _id: new ObjectId(request.id)
                    }, {
                        "$set": {
                            avgRating: avgRating
                        }
                    })
                    return {
                        response: contentResult
                    }
                }
            } else {
                let viewer = {
                    user: new ObjectId(request.user._id),
                    viewDate: new Date()
                }
                const updatedContent = await this.articlesRepository.updateOne({
                    _id: new ObjectId(request.id)
                }, {
                    "$set": {
                        viewed: request.body.viewCount
                    },
                    $addToSet: {
                        viewership: viewer
                    }
                })
                return {
                    response: updatedContent
                }
            }
        } catch (error) {
            throw new GrpcInternalException("error.message")
        }
    }

    async destroy(request: DestroyArticleReq) {
        try {
            let id = request.id
            let query = {
                _id: id
            }

            const article = await this.articlesRepository.updateOne(query, {
                $set: {
                    active: false
                }
            })

            return {
                response: article
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }
}