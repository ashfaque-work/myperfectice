import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { FavoriteService } from "./favorite.service";
import { protobufFavoriteService } from "@app/common/grpc-clients/question-bank";
import { CountByMeRequest, CreateFavoriteRequest, DestroyByUserRequest, FindAllPracticesRequest, FindByPracticeRequest } from "@app/common/dto/question-bank.dto";

@Controller()
export class FavoriteController {
    constructor(private readonly favoriteService: FavoriteService) { }

    @GrpcMethod(protobufFavoriteService, 'FindAllPractices')
    findAllPractices(request: FindAllPracticesRequest) {
        return this.favoriteService.findAllPractices(request);
    }
    
    @GrpcMethod(protobufFavoriteService, 'FindByPractice')
    findByPractice(request: FindByPracticeRequest) {
        return this.favoriteService.findByPractice(request);
    }
    
    @GrpcMethod(protobufFavoriteService, 'CountByMe')
    countByMe(request: CountByMeRequest) {
        return this.favoriteService.countByMe(request);
    }
    
    @GrpcMethod(protobufFavoriteService, 'CreateFavorite')
    createFavorite(request: CreateFavoriteRequest) {
        return this.favoriteService.createFavorite(request);
    }
    
    @GrpcMethod(protobufFavoriteService, 'DestroyByUser')
    destroyByUser(request: DestroyByUserRequest) {
        return this.favoriteService.destroyByUser(request);
    }
    

}