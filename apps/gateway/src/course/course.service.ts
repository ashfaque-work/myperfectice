import {
    CourseRequest, CourseResponse, GetCourseResponse, GetCourseByIdRequest, GetCourseByIdResponse, UpdateCourseRequest,
    UpdateCourseResponse, DeleteCourseRequest, DeleteCourseResponse, GetCourseByClassroomRequest, GetCourseByClassroomResponse,
    AddClassToCourseRequest, AddClassToCourseResponse, RemoveClassFromCourseRequest, RemoveClassFromCourseResponse,
    AddFeedbackRequest, RemoveFavoriteRequest, AddToFavoriteRequest, GetRatingCountByCourseRequest, GetAvgRatingByCourseRequest,
    GetAvgRatingByCourseResponse, RemoveFavoriteResponse, AddFeedbackResponse, GetRatingCountByCourseResponse,
    AddSectionRequest, AddSectionResponse, UpdateSectionsOrderRequest, UpdateSectionsOrderResponse, UpdateCourseContentRequest,
    UpdateCourseContentResponse, DeleteContentRequest, DeleteContentResponse, DeleteSectionRequest, DeleteSectionResponse,
    AddContentFavoriteRequest, AddContentFavoriteResponse, RemoveContentFavoriteRequest, RemoveContentFavoriteResponse,
    GetFavoriteCourseRequest, GetFavoriteCourseResponse, GetOngoingClassesRequest, GetOngoingClassesResponse, GetCourseProgressRequest,
    GetCourseProgressResponse, GetUserCourseRequest, FetchTeacherAssessmentRequest, FetchTeacherAssessmentResponse,
    GetUserCourseResponse, GetClassesTimeSpentRequest, GetClassesTimeSpentResponse, GetCourseSectionsReportRequest,
    GetCourseSectionsReportResponse, GetStudentCourseOverviewRequest, GetCourseSectionByStatusRequest, GetCourseSectionByStatusResponse,
    GetStudentCourseOverviewResponse, VerifyCourseUserProgressRequest, VerifyCourseUserProgressResponse, PublicEnrolledCourseRequest,
    PublicEnrolledCourseResponse, GetCourseContentAnalyticsRequest, GetCourseContentAnalyticsResponse, GetCourseSubjectRequest,
    GetCourseSubjectResponse, GetStudentCoursesRequest, GetStudentCoursesResponse, GetTeacherHighestPaidCoursesRequest,
    GetTeacherHighestPaidCoursesResponse, GetTopCategoriesCourseRequest, GetTopCategoriesCourseResponse, GetPublisherCourseRequest,
    GetPublisherCourseResponse, UserWithoutEnrollRequest, UserWithoutEnrollResponse, GetCourseMembersRequest, GetCourseMembersResponse,
    GetTeacherCourseRequest, GetTeacherCourseResponse, GetOngoingCourseRequest, GetOngoingCourseResponse, EditContentInSectionRequest,
    EditContentInSectionResponse, GetAllMyCourseProgressRequest, GetAllMyCourseProgressResponse, GetCoursePublicReq,
    GetCoursePublicRes, GetTeacherCourseDetailRequest, GetTeacherCourseDetailResponse, UpdateContentTimeSpentRequest,
    UpdateContentTimeSpentResponse, CompleteContentRequest, CompleteContentResponse, StartContentRequest, StartContentResponse,
    GetCoursesRequest, GetCoursesResponse, GetTeacherArchivedCoursesRequest, GetTeacherArchivedCoursesResponse,
    GetTeacherMostPopularCoursesRequest, GetTeacherMostPopularCoursesResponse, GetAllTeacherCoursesRequest, GetAllTeacherCoursesResponse,
    GetPublicListingRequest, GetPublicListingResponse, GetBestSellerCourseRequest, GetBestSellerCourseResponse,
    GetPopularCourseRequest, GetArchiveCoursesRequest, GetQuestionDistributionAnalyticsRequest, GetRankingAnalyticsRequest,
    GetRankingAnalyticsResponse, GetCourseContentAttemptByStudentRequest, GetCourseContentAttemptByStudentResponse,
    GetPracticeTimeAnalyticsRequest, GetPracticeTimeAnalyticsResponse, GetLearningTimeAnalyticsRequest,
    GetLearningTimeAnalyticsResponse, GetCompletionAnalyticsRequest, GetCompletionAnalyticsResponse, GetAccuracyAnalyticsRequest,
    GetAccuracyAnalyticsResponse, GetMyFavoriteResponse, GetMyFavoriteRequest, GetFavoriteSubjectsRequest, GetFavoriteSubjectsResponse,
    CountRequest, CountResponse, NotifyStudentsAfterWithdrawalRequest, NotifyStudentsAfterWithdrawalResponse,
    FindRequest, FindResponse, GetCourseRequest, GetOngoingCourseContentReq, Empty, GetAuthorsReq,
    GetRatingByCourseReq, GetCoursesPublicReq, PublishSectionReq,
} from '@app/common/dto/course.dto';
import { CourseGrpcServiceClientImpl } from '@app/common/grpc-clients/course';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CourseService {
    constructor(private courseGrpcServiceClientImpl: CourseGrpcServiceClientImpl) { }

    async createCourse(request: CourseRequest): Promise<CourseResponse> {
        return await this.courseGrpcServiceClientImpl.CreateCourse(request);
    }

    async getCourse(request: GetCourseRequest): Promise<GetCourseResponse> {
        return await this.courseGrpcServiceClientImpl.GetCourse(request);
    }

    async getCourseById(request: GetCourseByIdRequest): Promise<GetCourseByIdResponse> {
        return await this.courseGrpcServiceClientImpl.GetCourseById(request);
    }

    async updateCourse(request: UpdateCourseRequest): Promise<UpdateCourseResponse> {
        return await this.courseGrpcServiceClientImpl.UpdateCourse(request);
    }

    async deleteCourse(request: DeleteCourseRequest): Promise<DeleteCourseResponse> {
        return await this.courseGrpcServiceClientImpl.DeleteCourse(request);
    }

    async getCourseByClassroom(request: GetCourseByClassroomRequest): Promise<GetCourseByClassroomResponse> {
        return await this.courseGrpcServiceClientImpl.GetCourseByClassroom(request);
    }

    async addClassToCourse(request: AddClassToCourseRequest): Promise<AddClassToCourseResponse> {
        console.log(request);

        return await this.courseGrpcServiceClientImpl.AddClassToCourse(request);
    }

    async removeClassFromCourse(request: RemoveClassFromCourseRequest): Promise<RemoveClassFromCourseResponse> {
        return await this.courseGrpcServiceClientImpl.RemoveClassFromCourse(request);
    }
    async getAvgRatingByCourse(request: GetAvgRatingByCourseRequest): Promise<GetAvgRatingByCourseResponse> {
        return await this.courseGrpcServiceClientImpl.GetAvgRatingByCourse(request)
    }
    async getRatingByCourse(request: GetRatingByCourseReq): Promise<Empty> {
        return await this.courseGrpcServiceClientImpl.GetRatingByCourse(request)
    }
    async addFavorite(request: AddToFavoriteRequest) {
        return await this.courseGrpcServiceClientImpl.AddFavorite(request)
    }
    async removeFavorite(request: RemoveFavoriteRequest): Promise<RemoveFavoriteResponse> {
        return await this.courseGrpcServiceClientImpl.RemoveFavorite(request)
    }
    async addFeedback(request: AddFeedbackRequest): Promise<AddFeedbackResponse> {
        return await this.courseGrpcServiceClientImpl.AddFeedback(request)
    }
    async getRatingCountByCourse(request: GetRatingCountByCourseRequest): Promise<GetRatingCountByCourseResponse> {
        return await this.courseGrpcServiceClientImpl.GetRatingCountByCourse(request)
    }
    async addSection(request: AddSectionRequest): Promise<AddSectionResponse> {
        return await this.courseGrpcServiceClientImpl.AddSection(request);
    }
    async updateSectionsOrder(request: UpdateSectionsOrderRequest): Promise<UpdateSectionsOrderResponse> {
        return await this.courseGrpcServiceClientImpl.UpdateSectionsOrder(request);
    }
    async updateCourseContent(request: UpdateCourseContentRequest): Promise<UpdateCourseContentResponse> {
        return await this.courseGrpcServiceClientImpl.UpdateCourseContent(request)
    }
    async deleteContent(request: DeleteContentRequest): Promise<DeleteContentResponse> {
        return await this.courseGrpcServiceClientImpl.DeleteContent(request)
    }
    async deleteSection(request: DeleteSectionRequest): Promise<DeleteSectionResponse> {
        return await this.courseGrpcServiceClientImpl.DeleteSection(request)
    }
    async addContentFavorite(request: AddContentFavoriteRequest): Promise<AddContentFavoriteResponse> {
        return await this.courseGrpcServiceClientImpl.AddContentFavorite(request)
    }
    async removeContentFavorite(request: RemoveContentFavoriteRequest): Promise<RemoveContentFavoriteResponse> {
        return await this.courseGrpcServiceClientImpl.RemoveContentFavorite(request)
    }
    async getFavoriteCourse(request: GetFavoriteCourseRequest): Promise<GetFavoriteCourseResponse> {
        return await this.courseGrpcServiceClientImpl.GetFavoriteCourse(request);
    }
    async getOngoingClasses(request: GetOngoingClassesRequest): Promise<GetOngoingClassesResponse> {
        return await this.courseGrpcServiceClientImpl.GetOngoingClasses(request)
    }
    async getCourseProgress(request: GetCourseProgressRequest): Promise<GetCourseProgressResponse> {
        return await this.courseGrpcServiceClientImpl.GetCourseProgress(request)
    }
    async getUserCourse(request: GetUserCourseRequest): Promise<GetUserCourseResponse> {
        return await this.courseGrpcServiceClientImpl.GetUserCourse(request)
    }
    async fetchTeacherAssessment(request: FetchTeacherAssessmentRequest): Promise<FetchTeacherAssessmentResponse> {
        return await this.courseGrpcServiceClientImpl.FetchTeacherAssessment(request);
    }
    async getClassesTimeSpent(request: GetClassesTimeSpentRequest): Promise<GetClassesTimeSpentResponse> {
        return await this.courseGrpcServiceClientImpl.GetClassesTimeSpent(request)
    }
    async getAuthors(request: GetAuthorsReq): Promise<Empty> {
        return await this.courseGrpcServiceClientImpl.GetAuthors(request)
    }
    async getCourseSectionsReport(request: GetCourseSectionsReportRequest): Promise<GetCourseSectionsReportResponse> {
        return await this.courseGrpcServiceClientImpl.GetCourseSectionsReport(request)
    }
    async getStudentCourseOverview(request: GetStudentCourseOverviewRequest): Promise<GetStudentCourseOverviewResponse> {
        return await this.courseGrpcServiceClientImpl.GetStudentCourseOverview(request)
    }
    async getCourseSectionByStatus(request: GetCourseSectionByStatusRequest): Promise<GetCourseSectionByStatusResponse> {
        return await this.courseGrpcServiceClientImpl.GetCourseSectionByStatus(request)
    }
    async verifyCourseUserProgress(request: VerifyCourseUserProgressRequest): Promise<VerifyCourseUserProgressResponse> {
        return await this.courseGrpcServiceClientImpl.VerifyCourseUserProgress(request);
    }
    async publicEnrolledCourse(request: PublicEnrolledCourseRequest): Promise<PublicEnrolledCourseResponse> {
        return await this.courseGrpcServiceClientImpl.PublicEnrolledCourse(request)
    }
    async getCourseContentAnalytics(request: GetCourseContentAnalyticsRequest): Promise<GetCourseContentAnalyticsResponse> {
        return await this.courseGrpcServiceClientImpl.GetCourseContentAnalytics(request)
    }
    async getCourseSubject(request: GetCourseSubjectRequest): Promise<GetCourseSubjectResponse> {
        return await this.courseGrpcServiceClientImpl.GetCourseSubject(request)
    }
    async getStudentCourses(request: GetStudentCoursesRequest): Promise<GetStudentCoursesResponse> {
        return await this.courseGrpcServiceClientImpl.GetStudentCourses(request)
    }
    async getTeacherHighestPaidCourses(request: GetTeacherHighestPaidCoursesRequest): Promise<GetTeacherHighestPaidCoursesResponse> {
        return await this.courseGrpcServiceClientImpl.GetTeacherHighestPaidCourses(request)
    }
    async getTopCategoriesCourse(request: GetTopCategoriesCourseRequest): Promise<GetTopCategoriesCourseResponse> {
        return await this.courseGrpcServiceClientImpl.GetTopCategoriesCourse(request)
    }
    async getPublisherCourse(request: GetPublisherCourseRequest): Promise<GetPublisherCourseResponse> {
        return await this.courseGrpcServiceClientImpl.GetPublisherCourse(request)
    }
    async userWithoutEnroll(request: UserWithoutEnrollRequest): Promise<UserWithoutEnrollResponse> {
        return await this.courseGrpcServiceClientImpl.UserWithoutEnroll(request)
    }
    async getCourseMembers(request: GetCourseMembersRequest): Promise<GetCourseMembersResponse> {
        return await this.courseGrpcServiceClientImpl.GetCourseMembers(request)
    }
    async getTeacherCourse(request: GetTeacherCourseRequest): Promise<GetTeacherCourseResponse> {
        return await this.courseGrpcServiceClientImpl.GetTeacherCourse(request)
    }
    async getOngoingCourse(request: GetOngoingCourseRequest): Promise<GetOngoingCourseResponse> {
        return await this.courseGrpcServiceClientImpl.GetOngoingCourse(request)
    }
    async getOngoingCourseContent(request: GetOngoingCourseContentReq): Promise<Empty> {
        return await this.courseGrpcServiceClientImpl.GetOngoingCourseContent(request)
    }
    async editContentInSection(request: EditContentInSectionRequest): Promise<EditContentInSectionResponse> {
        return await this.courseGrpcServiceClientImpl.EditContentInSection(request)
    }
    async getAllMyCourseProgress(request: GetAllMyCourseProgressRequest): Promise<GetAllMyCourseProgressResponse> {
        return await this.courseGrpcServiceClientImpl.GetAllMyCourseProgress(request)
    }
    async getCoursePublic(request: GetCoursePublicReq): Promise<GetCoursePublicRes> {
        return await this.courseGrpcServiceClientImpl.GetCoursePublic(request)
    }
    async getTeacherCourseDetail(request: GetTeacherCourseDetailRequest): Promise<GetTeacherCourseDetailResponse> {
        return await this.courseGrpcServiceClientImpl.GetTeacherCourseDetail(request)
    }
    async updateContentTimeSpent(request: UpdateContentTimeSpentRequest): Promise<UpdateContentTimeSpentResponse> {
        return await this.courseGrpcServiceClientImpl.UpdateContentTimeSpent(request)
    }
    async completeContent(request: CompleteContentRequest): Promise<CompleteContentResponse> {
        return await this.courseGrpcServiceClientImpl.CompleteContent(request)
    }
    async startContent(request: StartContentRequest): Promise<StartContentResponse> {
        return await this.courseGrpcServiceClientImpl.StartContent(request)
    }
    async getCoursesPublic(request: GetCoursesPublicReq): Promise<Empty> {
        return await this.courseGrpcServiceClientImpl.GetCoursesPublic(request)
    }
    async getCourses(request: GetCoursesRequest): Promise<GetCoursesResponse> {
        return await this.courseGrpcServiceClientImpl.GetCourses(request)
    }
    async getTeacherArchivedCourses(request: GetTeacherArchivedCoursesRequest): Promise<GetTeacherArchivedCoursesResponse> {
        return await this.courseGrpcServiceClientImpl.GetTeacherArchivedCourses(request)
    }
    async getTeacherMostPopularCourses(request: GetTeacherMostPopularCoursesRequest): Promise<GetTeacherMostPopularCoursesResponse> {
        return await this.courseGrpcServiceClientImpl.GetTeacherMostPopularCourses(request)
    }
    async getAllTeacherCourses(request: GetAllTeacherCoursesRequest): Promise<GetAllTeacherCoursesResponse> {
        return await this.courseGrpcServiceClientImpl.GetAllTeacherCourses(request)
    }
    async getPublicListing(request: GetPublicListingRequest): Promise<GetPublicListingResponse> {
        return await this.courseGrpcServiceClientImpl.GetPublicListing(request);
    }
    async getBestSellerCourse(request: GetBestSellerCourseRequest): Promise<GetBestSellerCourseResponse> {
        return await this.courseGrpcServiceClientImpl.GetBestSellerCourse(request)
    }
    async getPopularCourse(request: GetPopularCourseRequest) {
        return await this.courseGrpcServiceClientImpl.GetPopularCourse(request)
    }
    async getArchiveCourses(request: GetArchiveCoursesRequest) {
        return await this.courseGrpcServiceClientImpl.GetArchiveCourses(request)
    }
    async getQuestionDistributionAnalytics(request: GetQuestionDistributionAnalyticsRequest) {
        return await this.courseGrpcServiceClientImpl.GetQuestionDistributionAnalytics(request)
    }
    async getRankingAnalytics(request: GetRankingAnalyticsRequest): Promise<GetRankingAnalyticsResponse> {
        return await this.courseGrpcServiceClientImpl.GetRankingAnalytics(request)
    }
    async getCourseContentAttemptByStudent(request: GetCourseContentAttemptByStudentRequest): Promise<GetCourseContentAttemptByStudentResponse> {
        return await this.courseGrpcServiceClientImpl.GetCourseContentAttemptByStudent(request)
    }
    async getPracticeTimeAnalytics(request: GetPracticeTimeAnalyticsRequest): Promise<GetPracticeTimeAnalyticsResponse> {
        return await this.courseGrpcServiceClientImpl.GetPracticeTimeAnalytics(request)
    }
    async getLearningTimeAnalytics(request: GetLearningTimeAnalyticsRequest): Promise<GetLearningTimeAnalyticsResponse> {
        return await this.courseGrpcServiceClientImpl.GetLearningTimeAnalytics(request)
    }
    async getCompletionAnalytics(request: GetCompletionAnalyticsRequest): Promise<GetCompletionAnalyticsResponse> {
        return await this.courseGrpcServiceClientImpl.GetCompletionAnalytics(request)
    }
    async getAccuracyAnalytics(request: GetAccuracyAnalyticsRequest): Promise<GetAccuracyAnalyticsResponse> {
        return await this.courseGrpcServiceClientImpl.GetAccuracyAnalytics(request)
    }

    async getMyFavorite(request: GetMyFavoriteRequest): Promise<GetMyFavoriteResponse> {
        return await this.courseGrpcServiceClientImpl.GetMyFavorite(request)
    }

    async getFavoriteSubjects(request: GetFavoriteSubjectsRequest): Promise<GetFavoriteSubjectsResponse> {
        return await this.courseGrpcServiceClientImpl.GetFavoriteSubjects(request)
    }

    async count(request: CountRequest): Promise<CountResponse> {
        return await this.courseGrpcServiceClientImpl.Count(request)
    }

    async notifyStudentsAfterWithdrawal(request: NotifyStudentsAfterWithdrawalRequest): Promise<NotifyStudentsAfterWithdrawalResponse> {
        return await this.courseGrpcServiceClientImpl.NotifyStudentsAfterWithdrawal(request)
    }

    async Find(request: FindRequest): Promise<FindResponse> {
        return await this.courseGrpcServiceClientImpl.Find(request)
    }

    async publishSection(request: PublishSectionReq): Promise<FindResponse> {
        return await this.courseGrpcServiceClientImpl.PublishSection(request)
    }
}
