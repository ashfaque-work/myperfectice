import { AddFavoriteRequest, AddTestRequest, AssesmentWiseMarksTestSeriesRequest, BoughtTestSeriesByOthersRequest, CountPackagesRequest, CreateTestseriesRequest, DeleteTestseriesRequest, FindRequest, GetAttemptedTestsOfTestseriesRequest, GetAuthorsRequest, GetBestSellerRequest, GetFavoriteTsRequest, GetMyTestSeriesRequest, GetOngoingClassesRequest, GetPackageAttemptCountRequest, GetPublicListingRequest, GetPublisherTestseriesRequest, GetStudentRankRequest, GetSubjectsRequest, GetTeacherHighestPaidRequest, GetTeacherMostPopularRequest, GetTestByPracticeRequest, GetTestseriesPublicRequest, GetTotalStudentRequest, LevelStatusOfPackageRequest, PackageHasLevelRequest, PercentAccuracyTestseriesRequest, PercentCompleteTestseriesRequest, PracticeHoursTestSeriesRequest, PublishRequest, QuestionCategoryTestSeriesRequest, RecommendedTestSeriesRequest, RemoveClassroomRequest, RemoveFavoriteRequest, RemoveTestRequest, RevokeRequest, SearchForMarketPlaceRequest, SubjectWiseMarksTestSeriesRequest, SummaryPackagesByStudentRequest, SummaryPackagesByTeacherRequest, SummaryPackagesRequest, SummaryTestseriesRequest, TeacherCountPackagesRequest, TeacherSummaryTestseriesRequest, UpdateTestOrderRequest, UpdateTestseriesRequest} from '@app/common/dto/question-bank.dto';
import { TestSeriesGrpcServiceClientImpl } from '@app/common/grpc-clients/question-bank';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestSeriesService {
    constructor(private testSeriesGrpcServiceClientImpl: TestSeriesGrpcServiceClientImpl) { }

    async find(request: FindRequest) {
        return this.testSeriesGrpcServiceClientImpl.Find(request);
    }
    
    async getPublicListing(request: GetPublicListingRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetPublicListing(request);
    }
    
    async summaryTestseries(request: SummaryTestseriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.SummaryTestseries(request);
    }
    
    async getAttemptedTestsOfTestseries(request: GetAttemptedTestsOfTestseriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetAttemptedTestsOfTestseries(request);
    }
    
    async getTestseriesPublic(request: GetTestseriesPublicRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetTestseriesPublic(request);
    }
    
    async summaryPackages(request: SummaryPackagesRequest) {
        return this.testSeriesGrpcServiceClientImpl.SummaryPackages(request);
    }
    
    async countPackages(request: CountPackagesRequest) {
        return this.testSeriesGrpcServiceClientImpl.CountPackages(request);
    }
    
    async summaryPackagesByStudent(request: SummaryPackagesByStudentRequest) {
        return this.testSeriesGrpcServiceClientImpl.SummaryPackagesByStudent(request);
    }
    
    async recommendedTestSeries(request: RecommendedTestSeriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.RecommendedTestSeries(request);
    }
    
    async boughtTestSeriesByOthers(request: BoughtTestSeriesByOthersRequest) {
        return this.testSeriesGrpcServiceClientImpl.BoughtTestSeriesByOthers(request);
    }
    
    async getMyTestSeries(request: GetMyTestSeriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetMyTestSeries(request);
    }

    async getAuthors(request: GetAuthorsRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetAuthors(request);
    }
    
    async getSubjects(request: GetSubjectsRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetSubjects(request);
    }
    
    async getTeacherMostPopular(request: GetTeacherMostPopularRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetTeacherMostPopular(request);
    }
    
    async getTeacherHighestPaid(request: GetTeacherHighestPaidRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetTeacherHighestPaid(request);
    }
    
    async teacherSummaryTestseries(request: TeacherSummaryTestseriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.TeacherSummaryTestseries(request);
    }
    
    async levelStatusOfPackage(request: LevelStatusOfPackageRequest) {
        return this.testSeriesGrpcServiceClientImpl.LevelStatusOfPackage(request);
    }
    
    async packageHasLevel(request: PackageHasLevelRequest) {
        return this.testSeriesGrpcServiceClientImpl.PackageHasLevel(request);
    }
    
    async getOngoingClasses(request: GetOngoingClassesRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetOngoingClasses(request);
    }
    
    async summaryPackagesByTeacher(request: SummaryPackagesByTeacherRequest) {
        return this.testSeriesGrpcServiceClientImpl.SummaryPackagesByTeacher(request);
    }
    
    async teacherCountPackages(request: TeacherCountPackagesRequest) {
        return this.testSeriesGrpcServiceClientImpl.TeacherCountPackages(request);
    }
    
    async getPackageAttemptCount(request: GetPackageAttemptCountRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetPackageAttemptCount(request);
    }
    
    async getTestByPractice(request: GetTestByPracticeRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetTestByPractice(request);
    }
    
    async getTotalStudent(request: GetTotalStudentRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetTotalStudent(request);
    }
    
    async getFavoriteTs(request: GetFavoriteTsRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetFavoriteTs(request);
    }
    
    async getPublisherTestseries(request: GetPublisherTestseriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetPublisherTestseries(request);
    }
    
    async createTestseries(request: CreateTestseriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.CreateTestseries(request);
    }
    
    async addFavorite(request: AddFavoriteRequest) {
        return this.testSeriesGrpcServiceClientImpl.AddFavorite(request);
    }
    
    async publish(request: PublishRequest) {
        return this.testSeriesGrpcServiceClientImpl.Publish(request);
    }
    
    async revoke(request: RevokeRequest) {
        return this.testSeriesGrpcServiceClientImpl.Revoke(request);
    }
    
    async addTest(request: AddTestRequest) {
        return this.testSeriesGrpcServiceClientImpl.AddTest(request);
    }
    
    async removeTest(request: RemoveTestRequest) {
        return this.testSeriesGrpcServiceClientImpl.RemoveTest(request);
    }
    
    async updateTestOrder(request: UpdateTestOrderRequest) {
        return this.testSeriesGrpcServiceClientImpl.UpdateTestOrder(request);
    }
    
    async removeClassroom(request: RemoveClassroomRequest) {
        return this.testSeriesGrpcServiceClientImpl.RemoveClassroom(request);
    }
    
    async updateTestseries(request: UpdateTestseriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.UpdateTestseries(request);
    }
    
    async removeFavorite(request: RemoveFavoriteRequest) {
        return this.testSeriesGrpcServiceClientImpl.RemoveFavorite(request);
    }
    
    async deleteTestseries(request: DeleteTestseriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.DeleteTestseries(request);
    }
    
    async getStudentRank(request: GetStudentRankRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetStudentRank(request);
    }
    
    async percentCompleteTestseries(request: PercentCompleteTestseriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.PercentCompleteTestseries(request);
    }
    
    async percentAccuracyTestseries(request: PercentAccuracyTestseriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.PercentAccuracyTestseries(request);
    }
    
    async practiceHoursTestSeries(request: PracticeHoursTestSeriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.PracticeHoursTestSeries(request);
    }
    
    async assesmentWiseMarksTestSeries(request: AssesmentWiseMarksTestSeriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.AssesmentWiseMarksTestSeries(request);
    }
    
    async questionCategoryTestSeries(request: QuestionCategoryTestSeriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.QuestionCategoryTestSeries(request);
    }
    
    async subjectWiseMarksTestSeries(request: SubjectWiseMarksTestSeriesRequest) {
        return this.testSeriesGrpcServiceClientImpl.SubjectWiseMarksTestSeries(request);
    }
    
    async searchForMarketPlace(request: SearchForMarketPlaceRequest) {
        return this.testSeriesGrpcServiceClientImpl.SearchForMarketPlace(request);
    }
    
    async getBestSeller(request: GetBestSellerRequest) {
        return this.testSeriesGrpcServiceClientImpl.GetBestSeller(request);
    }
}