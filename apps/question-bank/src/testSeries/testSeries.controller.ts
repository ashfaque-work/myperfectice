import { Controller } from "@nestjs/common";
import { TestSeriesService } from "./testSeries.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufTestSeriesService } from "@app/common/grpc-clients/question-bank";
import { AddFavoriteRequest, AddFavoriteResponse, AddTestRequest, AddTestResponse, AssesmentWiseMarksTestSeriesRequest, AssesmentWiseMarksTestSeriesResponse, BoughtTestSeriesByOthersRequest, BoughtTestSeriesByOthersResponse, CountPackagesRequest, CountPackagesResponse, CreateTestseriesRequest, CreateTestseriesResponse, DeleteTestseriesRequest, DeleteTestseriesResponse, FindRequest, FindResponse, GetAttemptedTestsOfTestseriesRequest, GetAttemptedTestsOfTestseriesResponse, GetAuthorsRequest, GetAuthorsResponse, GetBestSellerRequest, GetBestSellerResponse, GetFavoriteTsRequest, GetFavoriteTsResponse, GetMyTestSeriesRequest, GetMyTestSeriesResponse, GetOngoingClassesRequest, GetOngoingClassesResponse, GetPackageAttemptCountRequest, GetPackageAttemptCountResponse, GetPublicListingRequest, GetPublicListingResponse, GetPublisherTestseriesRequest, GetPublisherTestseriesResponse, GetStudentRankRequest, GetStudentRankResponse, GetSubjectsRequest, GetSubjectsResponse, GetTeacherHighestPaidRequest, GetTeacherHighestPaidResponse, GetTeacherMostPopularRequest, GetTeacherMostPopularResponse, GetTestByPracticeRequest, GetTestByPracticeResponse, GetTestseriesPublicRequest, GetTestseriesPublicResponse, GetTotalStudentRequest, GetTotalStudentResponse, LevelStatusOfPackageRequest, LevelStatusOfPackageResponse, PackageHasLevelRequest, PackageHasLevelResponse, PercentAccuracyTestseriesRequest, PercentAccuracyTestseriesResponse, PercentCompleteTestseriesRequest, PercentCompleteTestseriesResponse, PracticeHoursTestSeriesRequest, PracticeHoursTestSeriesResponse, PublishRequest, PublishResponse, QuestionCategoryTestSeriesRequest, QuestionCategoryTestSeriesResponse, RecommendedTestSeriesRequest, RecommendedTestSeriesResponse, RemoveClassroomRequest, RemoveClassroomResponse, RemoveFavoriteRequest, RemoveFavoriteResponse, RemoveTestRequest, RemoveTestResponse, RevokeRequest, RevokeResponse, SearchForMarketPlaceRequest, SearchForMarketPlaceResponse, SubjectWiseMarksTestSeriesRequest, SubjectWiseMarksTestSeriesResponse, SummaryPackagesByStudentRequest, SummaryPackagesByStudentResponse, SummaryPackagesByTeacherRequest, SummaryPackagesByTeacherResponse, SummaryPackagesRequest, SummaryPackagesResponse, SummaryTestseriesRequest, SummaryTestseriesResponse, TeacherCountPackagesRequest, TeacherCountPackagesResponse, TeacherSummaryTestseriesRequest, TeacherSummaryTestseriesResponse, UpdateTestOrderRequest, UpdateTestOrderResponse, UpdateTestseriesRequest, UpdateTestseriesResponse } from "@app/common/dto/question-bank.dto";

@Controller()
export class TestSeriesController {
    constructor(private readonly testSeriesService: TestSeriesService) { }

    @GrpcMethod(protobufTestSeriesService, 'Find')
    find(request: FindRequest): Promise<FindResponse> {
        return this.testSeriesService.find(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'GetPublicListing')
    getPublicListing(request: GetPublicListingRequest): Promise<GetPublicListingResponse> {
        return this.testSeriesService.getPublicListing(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'SummaryTestseries')
    summaryTestseries(request: SummaryTestseriesRequest): Promise<SummaryTestseriesResponse> {
        return this.testSeriesService.summaryTestseries(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'GetAttemptedTestsOfTestseries')
    getAttemptedTestsOfTestseries(request: GetAttemptedTestsOfTestseriesRequest): Promise<GetAttemptedTestsOfTestseriesResponse> {
        return this.testSeriesService.getAttemptedTestsOfTestseries(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'GetTestseriesPublic')
    getTestseriesPublic(request: GetTestseriesPublicRequest): Promise<GetTestseriesPublicResponse> {
        return this.testSeriesService.getTestseriesPublic(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'SummaryPackages')
    summaryPackages(request: SummaryPackagesRequest): Promise<SummaryPackagesResponse> {
        return this.testSeriesService.summaryPackages(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'CountPackages')
    countPackages(request: CountPackagesRequest): Promise<CountPackagesResponse> {
        return this.testSeriesService.countPackages(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'SummaryPackagesByStudent')
    summaryPackagesByStudent(request: SummaryPackagesByStudentRequest): Promise<SummaryPackagesByStudentResponse> {
        return this.testSeriesService.summaryPackagesByStudent(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'RecommendedTestSeries')
    recommendedTestSeries(request: RecommendedTestSeriesRequest): Promise<RecommendedTestSeriesResponse> {
        return this.testSeriesService.recommendedTestSeries(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'BoughtTestSeriesByOthers')
    boughtTestSeriesByOthers(request: BoughtTestSeriesByOthersRequest): Promise<BoughtTestSeriesByOthersResponse> {
        return this.testSeriesService.boughtTestSeriesByOthers(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'GetMyTestSeries')
    getMyTestSeries(request: GetMyTestSeriesRequest): Promise<GetMyTestSeriesResponse> {
        return this.testSeriesService.getMyTestSeries(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'GetAuthors')
    getAuthors(request: GetAuthorsRequest): Promise<GetAuthorsResponse> {
        return this.testSeriesService.getAuthors(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'GetSubjects')
    getSubjects(request: GetSubjectsRequest): Promise<GetSubjectsResponse> {
        return this.testSeriesService.getSubjects(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'GetTeacherMostPopular')
    getTeacherMostPopular(request: GetTeacherMostPopularRequest): Promise<GetTeacherMostPopularResponse> {
        return this.testSeriesService.getTeacherMostPopular(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'GetTeacherHighestPaid')
    getTeacherHighestPaid(request: GetTeacherHighestPaidRequest): Promise<GetTeacherHighestPaidResponse> {
        return this.testSeriesService.getTeacherHighestPaid(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'TeacherSummaryTestseries')
    teacherSummaryTestseries(request: TeacherSummaryTestseriesRequest): Promise<TeacherSummaryTestseriesResponse> {
        return this.testSeriesService.teacherSummaryTestseries(request);
    }

    @GrpcMethod(protobufTestSeriesService, 'LevelStatusOfPackage')
    levelStatusOfPackage(request: LevelStatusOfPackageRequest): Promise<LevelStatusOfPackageResponse> {
        return this.testSeriesService.levelStatusOfPackage(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'PackageHasLevel')
    packageHasLevel(request: PackageHasLevelRequest): Promise<PackageHasLevelResponse> {
        return this.testSeriesService.packageHasLevel(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'GetOngoingClasses')
    getOngoingClasses(request: GetOngoingClassesRequest): Promise<GetOngoingClassesResponse> {
        return this.testSeriesService.getOngoingClasses(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'SummaryPackagesByTeacher')
    summaryPackagesByTeacher(request: SummaryPackagesByTeacherRequest): Promise<SummaryPackagesByTeacherResponse> {
        return this.testSeriesService.summaryPackagesByTeacher(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'GetPackageAttemptCount')
    getPackageAttemptCount(request: GetPackageAttemptCountRequest): Promise<GetPackageAttemptCountResponse> {
        return this.testSeriesService.getPackageAttemptCount(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'GetTestByPractice')
    getTestByPractice(request: GetTestByPracticeRequest): Promise<GetTestByPracticeResponse> {
        return this.testSeriesService.getTestByPractice(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'GetTotalStudent')
    getTotalStudent(request: GetTotalStudentRequest): Promise<GetTotalStudentResponse> {
        return this.testSeriesService.getTotalStudent(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'GetFavoriteTs')
    getFavoriteTs(request: GetFavoriteTsRequest): Promise<GetFavoriteTsResponse> {
        return this.testSeriesService.getFavoriteTs(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'GetPublisherTestseries')
    getPublisherTestseries(request: GetPublisherTestseriesRequest): Promise<GetPublisherTestseriesResponse> {
        return this.testSeriesService.getPublisherTestseries(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'CreateTestseries')
    createTestseries(request: CreateTestseriesRequest): Promise<CreateTestseriesResponse> {
        return this.testSeriesService.createTestseries(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'AddFavorite')
    addFavorite(request: AddFavoriteRequest): Promise<AddFavoriteResponse> {
        return this.testSeriesService.addFavorite(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'Publish')
    publish(request: PublishRequest): Promise<PublishResponse> {
        return this.testSeriesService.publish(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'Revoke')
    revoke(request: RevokeRequest): Promise<RevokeResponse> {
        return this.testSeriesService.revoke(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'AddTest')
    addTest(request: AddTestRequest): Promise<AddTestResponse> {
        return this.testSeriesService.addTest(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'RemoveTest')
    removeTest(request: RemoveTestRequest): Promise<RemoveTestResponse> {
        return this.testSeriesService.removeTest(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'UpdateTestOrder')
    updateTestOrder(request: UpdateTestOrderRequest): Promise<UpdateTestOrderResponse> {
        return this.testSeriesService.updateTestOrder(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'RemoveClassroom')
    removeClassroom(request: RemoveClassroomRequest): Promise<RemoveClassroomResponse> {
        return this.testSeriesService.removeClassroom(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'UpdateTestseries')
    updateTestseries(request: UpdateTestseriesRequest): Promise<UpdateTestseriesResponse> {
        return this.testSeriesService.updateTestseries(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'RemoveFavorite')
    removeFavorite(request: RemoveFavoriteRequest): Promise<RemoveFavoriteResponse> {
        return this.testSeriesService.removeFavorite(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'DeleteTestseries')
    deleteTestseries(request: DeleteTestseriesRequest): Promise<DeleteTestseriesResponse> {
        return this.testSeriesService.deleteTestseries(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'GetStudentRank')
    getStudentRank(request: GetStudentRankRequest): Promise<GetStudentRankResponse> {
        return this.testSeriesService.getStudentRank(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'PercentCompleteTestseries')
    percentCompleteTestseries(request: PercentCompleteTestseriesRequest): Promise<PercentCompleteTestseriesResponse> {
        return this.testSeriesService.percentCompleteTestseries(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'PercentAccuracyTestseries')
    percentAccuracyTestseries(request: PercentAccuracyTestseriesRequest): Promise<PercentAccuracyTestseriesResponse> {
        return this.testSeriesService.percentAccuracyTestseries(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'PracticeHoursTestSeries')
    practiceHoursTestSeries(request: PracticeHoursTestSeriesRequest): Promise<PracticeHoursTestSeriesResponse> {
        return this.testSeriesService.practiceHoursTestSeries(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'AssesmentWiseMarksTestSeries')
    assesmentWiseMarksTestSeries(request: AssesmentWiseMarksTestSeriesRequest): Promise<AssesmentWiseMarksTestSeriesResponse> {
        return this.testSeriesService.assesmentWiseMarksTestSeries(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'QuestionCategoryTestSeries')
    questionCategoryTestSeries(request: QuestionCategoryTestSeriesRequest): Promise<QuestionCategoryTestSeriesResponse> {
        return this.testSeriesService.questionCategoryTestSeries(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'SubjectWiseMarksTestSeries')
    subjectWiseMarksTestSeries(request: SubjectWiseMarksTestSeriesRequest): Promise<SubjectWiseMarksTestSeriesResponse> {
        return this.testSeriesService.subjectWiseMarksTestSeries(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'SearchForMarketPlace')
    searchForMarketPlace(request: SearchForMarketPlaceRequest): Promise<SearchForMarketPlaceResponse> {
        return this.testSeriesService.searchForMarketPlace(request);
    }
    
    @GrpcMethod(protobufTestSeriesService, 'GetBestSeller')
    getBestSeller(request: GetBestSellerRequest): Promise<GetBestSellerResponse> {
        return this.testSeriesService.getBestSeller(request);
    }

}