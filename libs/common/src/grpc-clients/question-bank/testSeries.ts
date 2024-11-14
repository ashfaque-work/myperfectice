import { AddFavoriteRequest, AddFavoriteResponse, AddTestRequest, AddTestResponse, AssesmentWiseMarksTestSeriesRequest, AssesmentWiseMarksTestSeriesResponse, BoughtTestSeriesByOthersRequest, BoughtTestSeriesByOthersResponse, CountPackagesRequest, CountPackagesResponse, CreateTestseriesRequest, CreateTestseriesResponse, DeleteTestseriesRequest, DeleteTestseriesResponse, FindRequest, FindResponse, GetAttemptedTestsOfTestseriesRequest, GetAttemptedTestsOfTestseriesResponse, GetAuthorsRequest, GetAuthorsResponse, GetBestSellerRequest, GetBestSellerResponse, GetFavoriteTsRequest, GetFavoriteTsResponse, GetMyTestSeriesRequest, GetMyTestSeriesResponse, GetOngoingClassesRequest, GetOngoingClassesResponse, GetPackageAttemptCountRequest, GetPackageAttemptCountResponse, GetPublicListingRequest, GetPublicListingResponse, GetPublisherTestseriesRequest, GetPublisherTestseriesResponse, GetStudentRankRequest, GetStudentRankResponse, GetSubjectsRequest, GetSubjectsResponse, GetTeacherHighestPaidRequest, GetTeacherHighestPaidResponse, GetTeacherMostPopularRequest, GetTeacherMostPopularResponse, GetTestByPracticeRequest, GetTestByPracticeResponse, GetTestseriesPublicRequest, GetTestseriesPublicResponse, GetTotalStudentRequest, GetTotalStudentResponse, LevelStatusOfPackageRequest, LevelStatusOfPackageResponse, PackageHasLevelRequest, PackageHasLevelResponse, PercentAccuracyTestseriesRequest, PercentAccuracyTestseriesResponse, PercentCompleteTestseriesRequest, PercentCompleteTestseriesResponse, PracticeHoursTestSeriesRequest, PracticeHoursTestSeriesResponse, PublishRequest, PublishResponse, QuestionCategoryTestSeriesRequest, QuestionCategoryTestSeriesResponse, RecommendedTestSeriesRequest, RecommendedTestSeriesResponse, RemoveClassroomRequest, RemoveClassroomResponse, RemoveFavoriteRequest, RemoveFavoriteResponse, RemoveTestRequest, RemoveTestResponse, RevokeRequest, RevokeResponse, SearchForMarketPlaceRequest, SearchForMarketPlaceResponse, SubjectWiseMarksTestSeriesRequest, SubjectWiseMarksTestSeriesResponse, SummaryPackagesByStudentRequest, SummaryPackagesByStudentResponse, SummaryPackagesByTeacherRequest, SummaryPackagesByTeacherResponse, SummaryPackagesRequest, SummaryPackagesResponse, SummaryTestseriesRequest, SummaryTestseriesResponse, TeacherCountPackagesRequest, TeacherCountPackagesResponse, TeacherSummaryTestseriesRequest, TeacherSummaryTestseriesResponse, UpdateTestOrderRequest, UpdateTestOrderResponse, UpdateTestseriesRequest, UpdateTestseriesResponse } from '@app/common/dto/question-bank.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufTestSeriesService = 'QuestionBankGrpcService';
export interface TestSeriesGrpcInterface {
    Find(request: FindRequest): Promise<FindResponse>;
    GetPublicListing(request: GetPublicListingRequest): Promise<GetPublicListingResponse>;
    SummaryTestseries(request: SummaryTestseriesRequest): Promise<SummaryTestseriesResponse>;
    GetAttemptedTestsOfTestseries(request: GetAttemptedTestsOfTestseriesRequest): Promise<GetAttemptedTestsOfTestseriesResponse>;
    GetTestseriesPublic(request: GetTestseriesPublicRequest): Promise<GetTestseriesPublicResponse>;
    SummaryPackages(request: SummaryPackagesRequest): Promise<SummaryPackagesResponse>;
    CountPackages(request: CountPackagesRequest): Promise<CountPackagesResponse>;
    SummaryPackagesByStudent(request: SummaryPackagesByStudentRequest): Promise<SummaryPackagesByStudentResponse>;
    RecommendedTestSeries(request: RecommendedTestSeriesRequest): Promise<RecommendedTestSeriesResponse>;
    BoughtTestSeriesByOthers(request: BoughtTestSeriesByOthersRequest): Promise<BoughtTestSeriesByOthersResponse>;
    GetMyTestSeries(request: GetMyTestSeriesRequest): Promise<GetMyTestSeriesResponse>;
    GetAuthors(request: GetAuthorsRequest): Promise<GetAuthorsResponse>;
    GetSubjects(request: GetSubjectsRequest): Promise<GetSubjectsResponse>;
    GetTeacherMostPopular(request: GetTeacherMostPopularRequest): Promise<GetTeacherMostPopularResponse>;
    GetTeacherHighestPaid(request: GetTeacherHighestPaidRequest): Promise<GetTeacherHighestPaidResponse>;
    TeacherSummaryTestseries(request: TeacherSummaryTestseriesRequest): Promise<TeacherSummaryTestseriesResponse>;
    LevelStatusOfPackage(request: LevelStatusOfPackageRequest): Promise<LevelStatusOfPackageResponse>;
    PackageHasLevel(request: PackageHasLevelRequest): Promise<PackageHasLevelResponse>;
    GetOngoingClasses(request: GetOngoingClassesRequest): Promise<GetOngoingClassesResponse>;
    SummaryPackagesByTeacher(request: SummaryPackagesByTeacherRequest): Promise<SummaryPackagesByTeacherResponse>;
    TeacherCountPackages(request: TeacherCountPackagesRequest): Promise<TeacherCountPackagesResponse>;
    GetPackageAttemptCount(request: GetPackageAttemptCountRequest): Promise<GetPackageAttemptCountResponse>;
    GetTestByPractice(request: GetTestByPracticeRequest): Promise<GetTestByPracticeResponse>;
    GetTotalStudent(request: GetTotalStudentRequest): Promise<GetTotalStudentResponse>;
    GetFavoriteTs(request: GetFavoriteTsRequest): Promise<GetFavoriteTsResponse>;
    GetPublisherTestseries(request: GetPublisherTestseriesRequest): Promise<GetPublisherTestseriesResponse>;
    CreateTestseries(request: CreateTestseriesRequest): Promise<CreateTestseriesResponse>;
    AddFavorite(request: AddFavoriteRequest): Promise<AddFavoriteResponse>;
    Publish(request: PublishRequest): Promise<PublishResponse>;
    Revoke(request: RevokeRequest): Promise<RevokeResponse>;
    AddTest(request: AddTestRequest): Promise<AddTestResponse>;
    RemoveTest(request: RemoveTestRequest): Promise<RemoveTestResponse>;
    UpdateTestOrder(request: UpdateTestOrderRequest): Promise<UpdateTestOrderResponse>;
    RemoveClassroom(request: RemoveClassroomRequest): Promise<RemoveClassroomResponse>;
    UpdateTestseries(request: UpdateTestseriesRequest): Promise<UpdateTestseriesResponse>;
    RemoveFavorite(request: RemoveFavoriteRequest): Promise<RemoveFavoriteResponse>;
    DeleteTestseries(request: DeleteTestseriesRequest): Promise<DeleteTestseriesResponse>;
    GetStudentRank(request: GetStudentRankRequest): Promise<GetStudentRankResponse>;
    PercentCompleteTestseries(request: PercentCompleteTestseriesRequest): Promise<PercentCompleteTestseriesResponse>;
    PercentAccuracyTestseries(request: PercentAccuracyTestseriesRequest): Promise<PercentAccuracyTestseriesResponse>;
    PracticeHoursTestSeries(request: PracticeHoursTestSeriesRequest): Promise<PracticeHoursTestSeriesResponse>;
    AssesmentWiseMarksTestSeries(request: AssesmentWiseMarksTestSeriesRequest): Promise<AssesmentWiseMarksTestSeriesResponse>;
    QuestionCategoryTestSeries(request: QuestionCategoryTestSeriesRequest): Promise<QuestionCategoryTestSeriesResponse>;
    SubjectWiseMarksTestSeries(request: SubjectWiseMarksTestSeriesRequest): Promise<SubjectWiseMarksTestSeriesResponse>;
    SearchForMarketPlace(request: SearchForMarketPlaceRequest): Promise<SearchForMarketPlaceResponse>;
    GetBestSeller(request: GetBestSellerRequest): Promise<GetBestSellerResponse>;
}
@Injectable()
export class TestSeriesGrpcServiceClientImpl implements TestSeriesGrpcInterface {
    private testSeriesGrpcServiceClient: TestSeriesGrpcInterface;
    private readonly logger = new Logger(TestSeriesGrpcServiceClientImpl.name)
    constructor(
        @Inject('questionBankGrpcService') private testSeriesGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.testSeriesGrpcServiceClient = this.testSeriesGrpcClient.getService<TestSeriesGrpcInterface>(
            protobufTestSeriesService
        );
        this.logger.debug('gRPC client initalized.');
    }

    async Find(request: FindRequest): Promise<FindResponse> {
        return await this.testSeriesGrpcServiceClient.Find(request);
    }
    
    async GetPublicListing(request: GetPublicListingRequest): Promise<GetPublicListingResponse> {
        return await this.testSeriesGrpcServiceClient.GetPublicListing(request);
    }
    
    async SummaryTestseries(request: SummaryTestseriesRequest): Promise<SummaryTestseriesResponse> {
        return await this.testSeriesGrpcServiceClient.SummaryTestseries(request);
    }
    
    async GetAttemptedTestsOfTestseries(request: GetAttemptedTestsOfTestseriesRequest): Promise<GetAttemptedTestsOfTestseriesResponse> {
        return await this.testSeriesGrpcServiceClient.GetAttemptedTestsOfTestseries(request);
    }
    
    async GetTestseriesPublic(request: GetTestseriesPublicRequest): Promise<GetTestseriesPublicResponse> {
        return await this.testSeriesGrpcServiceClient.GetTestseriesPublic(request);
    }
    
    async SummaryPackages(request: SummaryPackagesRequest): Promise<SummaryPackagesResponse> {
        return await this.testSeriesGrpcServiceClient.SummaryPackages(request);
    }
    
    async CountPackages(request: CountPackagesRequest): Promise<CountPackagesResponse> {
        return await this.testSeriesGrpcServiceClient.CountPackages(request);
    }
    
    async SummaryPackagesByStudent(request: SummaryPackagesByStudentRequest): Promise<SummaryPackagesByStudentResponse> {
        return await this.testSeriesGrpcServiceClient.SummaryPackagesByStudent(request);
    }
    
    async RecommendedTestSeries(request: RecommendedTestSeriesRequest): Promise<RecommendedTestSeriesResponse> {
        return await this.testSeriesGrpcServiceClient.RecommendedTestSeries(request);
    }
    
    async BoughtTestSeriesByOthers(request: BoughtTestSeriesByOthersRequest): Promise<BoughtTestSeriesByOthersResponse> {
        return await this.testSeriesGrpcServiceClient.BoughtTestSeriesByOthers(request);
    }

    async GetMyTestSeries(request: GetMyTestSeriesRequest): Promise<GetMyTestSeriesResponse> {
        return await this.testSeriesGrpcServiceClient.GetMyTestSeries(request);
    }
    
    async GetAuthors(request: GetAuthorsRequest): Promise<GetAuthorsResponse> {
        return await this.testSeriesGrpcServiceClient.GetAuthors(request);
    }
    
    async GetSubjects(request: GetSubjectsRequest): Promise<GetSubjectsResponse> {
        return await this.testSeriesGrpcServiceClient.GetSubjects(request);
    }
    
    async GetTeacherMostPopular(request: GetTeacherMostPopularRequest): Promise<GetTeacherMostPopularResponse> {
        return await this.testSeriesGrpcServiceClient.GetTeacherMostPopular(request);
    }
    
    async GetTeacherHighestPaid(request: GetTeacherHighestPaidRequest): Promise<GetTeacherHighestPaidResponse> {
        return await this.testSeriesGrpcServiceClient.GetTeacherHighestPaid(request);
    }
    
    async TeacherSummaryTestseries(request: TeacherSummaryTestseriesRequest): Promise<TeacherSummaryTestseriesResponse> {
        return await this.testSeriesGrpcServiceClient.TeacherSummaryTestseries(request);
    }
    
    async LevelStatusOfPackage(request: LevelStatusOfPackageRequest): Promise<LevelStatusOfPackageResponse> {
        return await this.testSeriesGrpcServiceClient.LevelStatusOfPackage(request);
    }
    
    async PackageHasLevel(request: PackageHasLevelRequest): Promise<PackageHasLevelResponse> {
        return await this.testSeriesGrpcServiceClient.PackageHasLevel(request);
    }
    
    async GetOngoingClasses(request: GetOngoingClassesRequest): Promise<GetOngoingClassesResponse> {
        return await this.testSeriesGrpcServiceClient.GetOngoingClasses(request);
    }
    
    async SummaryPackagesByTeacher(request: SummaryPackagesByTeacherRequest): Promise<SummaryPackagesByTeacherResponse> {
        return await this.testSeriesGrpcServiceClient.SummaryPackagesByTeacher(request);
    }
    
    async TeacherCountPackages(request: TeacherCountPackagesRequest): Promise<TeacherCountPackagesResponse> {
        return await this.testSeriesGrpcServiceClient.TeacherCountPackages(request);
    }
    
    async GetPackageAttemptCount(request: GetPackageAttemptCountRequest): Promise<GetPackageAttemptCountResponse> {
        return await this.testSeriesGrpcServiceClient.GetPackageAttemptCount(request);
    }
    
    async GetTestByPractice(request: GetTestByPracticeRequest): Promise<GetTestByPracticeResponse> {
        return await this.testSeriesGrpcServiceClient.GetTestByPractice(request);
    }
    
    async GetTotalStudent(request: GetTotalStudentRequest): Promise<GetTotalStudentResponse> {
        return await this.testSeriesGrpcServiceClient.GetTotalStudent(request);
    }
    
    async GetFavoriteTs(request: GetFavoriteTsRequest): Promise<GetFavoriteTsResponse> {
        return await this.testSeriesGrpcServiceClient.GetFavoriteTs(request);
    }
    
    async GetPublisherTestseries(request: GetPublisherTestseriesRequest): Promise<GetPublisherTestseriesResponse> {
        return await this.testSeriesGrpcServiceClient.GetPublisherTestseries(request);
    }
    
    async CreateTestseries(request: CreateTestseriesRequest): Promise<CreateTestseriesResponse> {
        return await this.testSeriesGrpcServiceClient.CreateTestseries(request);
    }
    
    async AddFavorite(request: AddFavoriteRequest): Promise<AddFavoriteResponse> {
        return await this.testSeriesGrpcServiceClient.AddFavorite(request);
    }
    
    async Publish(request: PublishRequest): Promise<PublishResponse> {
        return await this.testSeriesGrpcServiceClient.Publish(request);
    }
    
    async Revoke(request: RevokeRequest): Promise<RevokeResponse> {
        return await this.testSeriesGrpcServiceClient.Revoke(request);
    }
    
    async AddTest(request: AddTestRequest): Promise<AddTestResponse> {
        return await this.testSeriesGrpcServiceClient.AddTest(request);
    }
    
    async RemoveTest(request: RemoveTestRequest): Promise<RemoveTestResponse> {
        return await this.testSeriesGrpcServiceClient.RemoveTest(request);
    }
    
    async UpdateTestOrder(request: UpdateTestOrderRequest): Promise<UpdateTestOrderResponse> {
        return await this.testSeriesGrpcServiceClient.UpdateTestOrder(request);
    }
    
    async RemoveClassroom(request: RemoveClassroomRequest): Promise<RemoveClassroomResponse> {
        return await this.testSeriesGrpcServiceClient.RemoveClassroom(request);
    }
    
    async UpdateTestseries(request: UpdateTestseriesRequest): Promise<UpdateTestseriesResponse> {
        return await this.testSeriesGrpcServiceClient.UpdateTestseries(request);
    }
    
    async RemoveFavorite(request: RemoveFavoriteRequest): Promise<RemoveFavoriteResponse> {
        return await this.testSeriesGrpcServiceClient.RemoveFavorite(request);
    }
    
    async DeleteTestseries(request: DeleteTestseriesRequest): Promise<DeleteTestseriesResponse> {
        return await this.testSeriesGrpcServiceClient.DeleteTestseries(request);
    }
    
    async GetStudentRank(request: GetStudentRankRequest): Promise<GetStudentRankResponse> {
        return await this.testSeriesGrpcServiceClient.GetStudentRank(request);
    }
    
    async PercentCompleteTestseries(request: PercentCompleteTestseriesRequest): Promise<PercentCompleteTestseriesResponse> {
        return await this.testSeriesGrpcServiceClient.PercentCompleteTestseries(request);
    }
    
    async PercentAccuracyTestseries(request: PercentAccuracyTestseriesRequest): Promise<PercentAccuracyTestseriesResponse> {
        return await this.testSeriesGrpcServiceClient.PercentAccuracyTestseries(request);
    }
    
    async PracticeHoursTestSeries(request: PracticeHoursTestSeriesRequest): Promise<PracticeHoursTestSeriesResponse> {
        return await this.testSeriesGrpcServiceClient.PracticeHoursTestSeries(request);
    }
    
    async AssesmentWiseMarksTestSeries(request: AssesmentWiseMarksTestSeriesRequest): Promise<AssesmentWiseMarksTestSeriesResponse> {
        return await this.testSeriesGrpcServiceClient.AssesmentWiseMarksTestSeries(request);
    }
    
    async QuestionCategoryTestSeries(request: QuestionCategoryTestSeriesRequest): Promise<QuestionCategoryTestSeriesResponse> {
        return await this.testSeriesGrpcServiceClient.QuestionCategoryTestSeries(request);
    }
    
    async SubjectWiseMarksTestSeries(request: SubjectWiseMarksTestSeriesRequest): Promise<SubjectWiseMarksTestSeriesResponse> {
        return await this.testSeriesGrpcServiceClient.SubjectWiseMarksTestSeries(request);
    }
    
    async SearchForMarketPlace(request: SearchForMarketPlaceRequest): Promise<SearchForMarketPlaceResponse> {
        return await this.testSeriesGrpcServiceClient.SearchForMarketPlace(request);
    }
    
    async GetBestSeller(request: GetBestSellerRequest): Promise<GetBestSellerResponse> {
        return await this.testSeriesGrpcServiceClient.GetBestSeller(request);
    }

}