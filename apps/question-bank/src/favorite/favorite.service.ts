import { FavoriteRepository, PracticeSetRepository } from '@app/common';
import { CountByMeRequest, CreateFavoriteRequest, DestroyByUserRequest, FindAllPracticesRequest, FindByPracticeRequest } from '@app/common/dto/question-bank.dto';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { GrpcInternalException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';

@Injectable()
export class FavoriteService {
    constructor(private readonly favoriteRepository: FavoriteRepository,
        private readonly practiceSetRepository: PracticeSetRepository,
    ) { }

    private getFilterFaviorite(req: any) {
        var filter: any = {};
        //	filter.status = 'published';
        //	filter.expiresOn = {$gt: new Date()};
        if (req.query.title) {
            filter.title = { $regex: new RegExp(req.query.title, 'i') };
        }
        if (req.query.publiser) {
            var $users = req.query.publiser.split(',');
            filter.push({ 'user': { $in: $users } });
        }
        if (req.query.subject) {
            var subjects = req.query.subject.split(',');
            filter["subject._id"] = { $in: subjects };
        }
        if (req.query.grades) {
            var grades = req.query.grades.split(',');
            filter['grades._id'] = { $in: grades };
        }
        else if (req.user.grade) {
            filter['grades._id'] = { $in: req.user.grade.map(g => new ObjectId(g)) };
        }

        return filter;
    };

    async findAllPractices(req: FindAllPracticesRequest) {
        try {
            var page = (req.query.page) ? req.query.page : 1;
            var limit = (req.query.limit) ? req.query.limit : 20;
            var sort: any = { statusChangedAt: -1 };
            var skip = (page - 1) * limit;
            if (req.query.sort) {
                const [sortField, sortOrder] = req.query.sort.split(',');
                sort = sortOrder === 'descending' ? { [sortField]: -1 } : { [sortField]: 1 };
            }
            var filter = this.getFilterFaviorite(req);
            this.favoriteRepository.setInstanceKey(req.instancekey);
            const favs = await this.favoriteRepository.find({ user: new ObjectId('5f646d33ec6d2f3ffeb01f35') }, { practiceSet: 1, _id: 0 })

            const practices = favs.map(fav => fav.practiceSet);
            filter._id = { $in: practices };
            this.practiceSetRepository.setInstanceKey(req.instancekey);
            const practiceSets = await this.practiceSetRepository.find(filter, null,
                {
                    sort: sort,
                    skip: skip,
                    limit: limit,
                    populate: { path: 'user', select: '-salt -hashedPassword' },
                    lean: true
                })

            return { response: practiceSets };
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    };

    async findByPractice(req: FindByPracticeRequest) {
        try {
            if (!req.practice) {
                throw new BadRequestException({ message: 'Practice id required' });
            }
            var params = {
                user: new ObjectId(req.user._id),
                practiceSet: new ObjectId(req.practice)
            };
            const practice = await this.favoriteRepository.findOne(params, null, { lean: true })

            return practice;
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async countByMe(req: CountByMeRequest) {
        try {
            var filter = this.getFilterFaviorite(req);
            this.favoriteRepository.setInstanceKey(req.instancekey);
            const practiceSets = await this.favoriteRepository.find({ user: new ObjectId(req.user._id) }, { practiceSet: 1, _id: 0 })

            var practice = practiceSets.map(practiceset => new ObjectId(practiceset.practiceSet));

            filter._id = { $in: practice };
            this.practiceSetRepository.setInstanceKey(req.instancekey);
            const result = await this.practiceSetRepository.countDocuments({ _id: { $in: practice } })

            return { count: result };
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async createFavorite(req: CreateFavoriteRequest) {
        if (!req.body.practiceSetId) {
            throw new BadRequestException();
        }

        let data = {
            user: new ObjectId(req.user._id),
            practiceSet: new ObjectId(req.body.practiceSetId)
        }

        this.favoriteRepository.setInstanceKey(req.instancekey);
        await this.favoriteRepository.create(data);

        return { status: "ok" };

    }

    async destroyByUser(req: DestroyByUserRequest) {
        try {
            this.favoriteRepository.setInstanceKey(req.instancekey);
            const favorite = await this.favoriteRepository.findOne({ user: new ObjectId(req.user._id), practiceSet: new ObjectId(req.practiceSet) })

            if (favorite) {
                await this.favoriteRepository.findByIdAndDelete(favorite._id)
                return { status: "ok" };

            } else{
                throw new NotFoundException();
            }
        } catch (error) {
            Logger.error(error);
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error.message);
              }
            throw new GrpcInternalException("Internal Server Error");
        }
    }
}