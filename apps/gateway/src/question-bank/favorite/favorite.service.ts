import { CountByMeRequest, CreateFavoriteRequest, DestroyByUserRequest, FindAllPracticesRequest, FindByPracticeRequest } from '@app/common/dto/question-bank.dto';
import { FavoriteGrpcServiceClientImpl } from '@app/common/grpc-clients/question-bank';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FavoriteService {
    constructor(private favoriteGrpcServiceClientImpl: FavoriteGrpcServiceClientImpl ) {}
    
    async findAllPractices(request: FindAllPracticesRequest) {
        return this.favoriteGrpcServiceClientImpl.FindAllPractices(request);
    }
    
    async findByPractice(request: FindByPracticeRequest) {
        return this.favoriteGrpcServiceClientImpl.FindByPractice(request);
    }
    
    async countByMe(request: CountByMeRequest) {
        return this.favoriteGrpcServiceClientImpl.CountByMe(request);
    }
    
    async createFavorite(request: CreateFavoriteRequest) {
        return this.favoriteGrpcServiceClientImpl.CreateFavorite(request);
    }
    
    async destroyByUser(request: DestroyByUserRequest) {
        return this.favoriteGrpcServiceClientImpl.DestroyByUser(request);
    }
    
    
}