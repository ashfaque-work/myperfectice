import { AddFavoriteRequest, AddFavoriteResponse, DeleteByIdRequest, DeleteByIdResponse, GetBehaviorRequest, GetBehaviorResponse, GetCollegesRequest, GetCollegesResponse, GetGradeSummaryRequest, GetGradeSummaryResponse, GetMetadataRequest, GetMetadataResponse, GetRegionRequest, GetRegionResponse, GetSavedSearchRequest, GetSavedSearchResponse, GetSearchDetailRequest, GetSearchDetailResponse, GetTierRequest, GetTierResponse, RemoveFavoriteRequest, RemoveFavoriteResponse, SaveRequest, SaveResponse, SearchRequest, SearchResponse, ViewProfileRequest, ViewProfileResponse } from '@app/common/dto/administration';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufRecruitmentService = 'AdministrationGrpcService';

export interface RecruitmentGrpcInterface {
    GetRegion(request: GetRegionRequest): Promise<GetRegionResponse>;
    GetTier(request: GetTierRequest): Promise<GetTierResponse>;
    GetBehavior(request: GetBehaviorRequest): Promise<GetBehaviorResponse>;
    GetMetadata(request: GetMetadataRequest): Promise<GetMetadataResponse>;
    GetColleges(request: GetCollegesRequest): Promise<GetCollegesResponse>;
    GetSavedSearch(request: GetSavedSearchRequest): Promise<GetSavedSearchResponse>;
    GetSearchDetail(request: GetSearchDetailRequest): Promise<GetSearchDetailResponse>;
    ViewProfile(request: ViewProfileRequest): Promise<ViewProfileResponse>;
    GetGradeSummary(request: GetGradeSummaryRequest): Promise<GetGradeSummaryResponse>;
    Save(request: SaveRequest): Promise<SaveResponse>;
    Search(request: SearchRequest): Promise<SearchResponse>;
    AddFavorite(request: AddFavoriteRequest): Promise<AddFavoriteResponse>;
    DeleteById(request: DeleteByIdRequest): Promise<DeleteByIdResponse>;
    RemoveFavorite(request: RemoveFavoriteRequest): Promise<RemoveFavoriteResponse>;
}

@Injectable()
export class RecruitmentGrpcServiceClientImpl implements RecruitmentGrpcInterface {
    private recruitmentGrpcServiceClient: RecruitmentGrpcInterface;
    private readonly logger = new Logger(RecruitmentGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private recruitmentGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.recruitmentGrpcServiceClient =
            this.recruitmentGrpcClient.getService<RecruitmentGrpcInterface>(
                protobufRecruitmentService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async GetRegion(request: GetRegionRequest): Promise<GetRegionResponse> {
        return await this.recruitmentGrpcServiceClient.GetRegion(request);
    }   
    
    async GetTier(request: GetTierRequest): Promise<GetTierResponse> {
        return await this.recruitmentGrpcServiceClient.GetTier(request);
    }   
    
    async GetBehavior(request: GetBehaviorRequest): Promise<GetBehaviorResponse> {
        return await this.recruitmentGrpcServiceClient.GetBehavior(request);
    }   
    
    async GetMetadata(request: GetMetadataRequest): Promise<GetMetadataResponse> {
        return await this.recruitmentGrpcServiceClient.GetMetadata(request);
    }   
    
    async GetColleges(request: GetCollegesRequest): Promise<GetCollegesResponse> {
        return await this.recruitmentGrpcServiceClient.GetColleges(request);
    }   
    
    async GetSavedSearch(request: GetSavedSearchRequest): Promise<GetSavedSearchResponse> {
        return await this.recruitmentGrpcServiceClient.GetSavedSearch(request);
    }   
    
    async GetSearchDetail(request: GetSearchDetailRequest): Promise<GetSearchDetailResponse> {
        return await this.recruitmentGrpcServiceClient.GetSearchDetail(request);
    }   
    
    async ViewProfile(request: ViewProfileRequest): Promise<ViewProfileResponse> {
        return await this.recruitmentGrpcServiceClient.ViewProfile(request);
    }   
    
    async GetGradeSummary(request: GetGradeSummaryRequest): Promise<GetGradeSummaryResponse> {
        return await this.recruitmentGrpcServiceClient.GetGradeSummary(request);
    }   
    
    async Save(request: SaveRequest): Promise<SaveResponse> {
        return await this.recruitmentGrpcServiceClient.Save(request);
    }   
    
    async Search(request: SearchRequest): Promise<SearchResponse> {
        return await this.recruitmentGrpcServiceClient.Search(request);
    }   
    
    async AddFavorite(request: AddFavoriteRequest): Promise<AddFavoriteResponse> {
        return await this.recruitmentGrpcServiceClient.AddFavorite(request);
    }   

    async DeleteById(request: DeleteByIdRequest): Promise<DeleteByIdResponse> {
        return await this.recruitmentGrpcServiceClient.DeleteById(request);
    }   

    async RemoveFavorite(request: RemoveFavoriteRequest): Promise<RemoveFavoriteResponse> {
        return await this.recruitmentGrpcServiceClient.RemoveFavorite(request);
    }   
}
