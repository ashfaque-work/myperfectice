import { AddFavoriteRequest, AddFavoriteResponse, DeleteByIdRequest, DeleteByIdResponse, GetBehaviorRequest, GetBehaviorResponse, GetCollegesRequest, GetCollegesResponse, GetGradeSummaryRequest, GetGradeSummaryResponse, GetMetadataRequest, GetMetadataResponse, GetRegionRequest, GetRegionResponse, GetSavedSearchRequest, GetSavedSearchResponse, GetSearchDetailRequest, GetSearchDetailResponse, GetTierRequest, GetTierResponse, RemoveFavoriteRequest, RemoveFavoriteResponse, SaveRequest, SaveResponse, SearchRequest, SearchResponse, ViewProfileRequest, ViewProfileResponse } from '@app/common/dto/administration';
import { RecruitmentGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RecruitmentService {
	constructor(private recruitmentGrpcServiceClientImpl: RecruitmentGrpcServiceClientImpl) { }

	async getRegion(request: GetRegionRequest): Promise<GetRegionResponse> {
		return await this.recruitmentGrpcServiceClientImpl.GetRegion(request);
	}
	
    async getTier(request: GetTierRequest): Promise<GetTierResponse> {
		return await this.recruitmentGrpcServiceClientImpl.GetTier(request);
	}
	
    async getBehavior(request: GetBehaviorRequest): Promise<GetBehaviorResponse> {
		return await this.recruitmentGrpcServiceClientImpl.GetBehavior(request);
	}
	
    async getMetadata(request: GetMetadataRequest): Promise<GetMetadataResponse> {
		return await this.recruitmentGrpcServiceClientImpl.GetMetadata(request);
	}
	
    async getColleges(request: GetCollegesRequest): Promise<GetCollegesResponse> {
		return await this.recruitmentGrpcServiceClientImpl.GetColleges(request);
	}
	
    async getSavedSearch(request: GetSavedSearchRequest): Promise<GetSavedSearchResponse> {
		return await this.recruitmentGrpcServiceClientImpl.GetSavedSearch(request);
	}
	
    async getSearchDetail(request: GetSearchDetailRequest): Promise<GetSearchDetailResponse> {
		return await this.recruitmentGrpcServiceClientImpl.GetSearchDetail(request);
	}

    async viewProfile(request: ViewProfileRequest): Promise<ViewProfileResponse> {
		return await this.recruitmentGrpcServiceClientImpl.ViewProfile(request);
	}
	
    async getGradeSummary(request: GetGradeSummaryRequest): Promise<GetGradeSummaryResponse> {
		return await this.recruitmentGrpcServiceClientImpl.GetGradeSummary(request);
	}
	
    async save(request: SaveRequest): Promise<SaveResponse> {
		return await this.recruitmentGrpcServiceClientImpl.Save(request);
	}
	
    async search(request: SearchRequest): Promise<SearchResponse> {
		return await this.recruitmentGrpcServiceClientImpl.Search(request);
	}

    async addFavorite(request: AddFavoriteRequest): Promise<AddFavoriteResponse> {
		return await this.recruitmentGrpcServiceClientImpl.AddFavorite(request);
	}

    async deleteById(request: DeleteByIdRequest): Promise<DeleteByIdResponse> {
		return await this.recruitmentGrpcServiceClientImpl.DeleteById(request);
	}

    async removeFavorite(request: RemoveFavoriteRequest): Promise<RemoveFavoriteResponse> {
		return await this.recruitmentGrpcServiceClientImpl.RemoveFavorite(request);
	}
}
