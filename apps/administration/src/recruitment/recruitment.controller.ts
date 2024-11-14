import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RecruitmentService } from './recruitment.service';
import { protobufRecruitmentService } from '@app/common/grpc-clients/administration';
import { AddFavoriteRequest, DeleteByIdRequest, GetBehaviorRequest, GetCollegesRequest, GetGradeSummaryRequest, GetMetadataRequest, GetRegionRequest, GetSavedSearchRequest, GetSearchDetailRequest, GetTierRequest, RemoveFavoriteRequest, SaveRequest, SearchRequest, ViewProfileRequest } from '@app/common/dto/administration';


@Controller()
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) { }

  @GrpcMethod(protobufRecruitmentService, 'GetRegion')
  getRegion(request: GetRegionRequest) {
    return this.recruitmentService.getRegion(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'GetTier')
  getTier(request: GetTierRequest) {
    return this.recruitmentService.getTier(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'GetBehavior')
  getBehavior(request: GetBehaviorRequest) {
    return this.recruitmentService.getBehavior(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'GetMetadata')
  getMetadata(request: GetMetadataRequest) {
    return this.recruitmentService.getMetadata(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'GetColleges')
  getColleges(request: GetCollegesRequest) {
    return this.recruitmentService.getColleges(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'GetSavedSearch')
  getSavedSearch(request: GetSavedSearchRequest) {
    return this.recruitmentService.getSavedSearch(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'GetSearchDetail')
  getSearchDetail(request: GetSearchDetailRequest) {
    return this.recruitmentService.getSearchDetail(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'ViewProfile')
  viewProfile(request: ViewProfileRequest) {
    return this.recruitmentService.viewProfile(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'GetGradeSummary')
  getGradeSummary(request: GetGradeSummaryRequest) {
    return this.recruitmentService.getGradeSummary(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'Save')
  save(request: SaveRequest) {
    return this.recruitmentService.save(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'Search')
  search(request: SearchRequest) {
    return this.recruitmentService.search(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'AddFavorite')
  addFavorite(request: AddFavoriteRequest) {
    return this.recruitmentService.addFavorite(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'DeleteById')
  deleteById(request: DeleteByIdRequest) {
    return this.recruitmentService.deleteById(request);
  }
  
  @GrpcMethod(protobufRecruitmentService, 'RemoveFavorite')
  removeFavorite(request: RemoveFavoriteRequest) {
    return this.recruitmentService.removeFavorite(request);
  }

}
