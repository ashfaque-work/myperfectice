import { CountByMeRequest, CountByMeResponse, CreateFavoriteRequest, CreateFavoriteResponse, DestroyByUserRequest, DestroyByUserResponse, FindAllPracticesRequest, FindAllPracticesResponse, FindByPracticeRequest, FindByPracticeResponse } from '@app/common/dto/question-bank.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufFavoriteService = 'QuestionBankGrpcService';
export interface FavoriteGrpcInterface {
    FindAllPractices(request: FindAllPracticesRequest): Promise<FindAllPracticesResponse>;
    FindByPractice(request: FindByPracticeRequest): Promise<FindByPracticeResponse>;
    CountByMe(request: CountByMeRequest): Promise<CountByMeResponse>;
    CreateFavorite(request: CreateFavoriteRequest): Promise<CreateFavoriteResponse>;
    DestroyByUser(request: DestroyByUserRequest): Promise<DestroyByUserResponse>;
}
@Injectable()
export class FavoriteGrpcServiceClientImpl implements FavoriteGrpcInterface {
    private favoriteGrpcServiceClient: FavoriteGrpcInterface;
    private readonly logger = new Logger(FavoriteGrpcServiceClientImpl.name)
    constructor(
        @Inject('questionBankGrpcService') private favoriteGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.favoriteGrpcServiceClient = this.favoriteGrpcClient.getService<FavoriteGrpcInterface>(
            protobufFavoriteService
        );
        this.logger.debug('gRPC client initalized.');
    }

    async FindAllPractices(request: FindAllPracticesRequest): Promise<FindAllPracticesResponse> {
        return await this.favoriteGrpcServiceClient.FindAllPractices(request);
    }
    
    async FindByPractice(request: FindByPracticeRequest): Promise<FindByPracticeResponse> {
        return await this.favoriteGrpcServiceClient.FindByPractice(request);
    }
    
    async CountByMe(request: CountByMeRequest): Promise<CountByMeResponse> {
        return await this.favoriteGrpcServiceClient.CountByMe(request);
    }
    
    async CreateFavorite(request: CreateFavoriteRequest): Promise<CreateFavoriteResponse> {
        return await this.favoriteGrpcServiceClient.CreateFavorite(request);
    }
    
    async DestroyByUser(request: DestroyByUserRequest): Promise<DestroyByUserResponse> {
        return await this.favoriteGrpcServiceClient.DestroyByUser(request);
    }
    
}