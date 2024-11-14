import {
    AddToFavoriteRequest,
    AddToFavoriteResponse,
    CourseRequest, CourseResponse, DeleteCourseRequest, DeleteCourseResponse, GetAvgRatingByCourseRequest, GetAvgRatingByCourseResponse, GetCourseResponse,
    GetCourseByIdRequest, GetCourseByIdResponse, RemoveFavoriteRequest, RemoveFavoriteResponse, UpdateCourseRequest, UpdateCourseResponse,
    GetCourseByClassroomRequest, GetCourseByClassroomResponse,
    AddClassToCourseRequest, AddClassToCourseResponse,
    RemoveClassFromCourseRequest, RemoveClassFromCourseResponse,
    AddFeedbackRequest,
    AddFeedbackResponse,
    GetRatingCountByCourseRequest,
    GetRatingCountByCourseResponse,
    AddSectionRequest,
    AddSectionResponse,
    UpdateSectionsOrderRequest,
    UpdateSectionsOrderResponse,
    UpdateCourseContentRequest,
    UpdateCourseContentResponse,
    DeleteContentRequest,
    DeleteContentResponse,
    DeleteSectionRequest,
    DeleteSectionResponse,
    AddContentFavoriteRequest,
    AddContentFavoriteResponse,
    RemoveContentFavoriteRequest,
    RemoveContentFavoriteResponse,
    GetFavoriteCourseRequest,
    GetFavoriteCourseResponse,
    GetOngoingClassesRequest,
    GetOngoingClassesResponse,
    GetCourseProgressRequest,
    GetCourseProgressResponse,
    GetUserCourseRequest,
    GetUserCourseResponse,
    FetchTeacherAssessmentRequest,
    FetchTeacherAssessmentResponse,
    GetClassesTimeSpentRequest,
    GetClassesTimeSpentResponse,
    GetCourseSectionsReportRequest,
    GetCourseSectionsReportResponse,
    GetStudentCourseOverviewRequest,
    GetStudentCourseOverviewResponse,
    GetCourseSectionByStatusRequest,
    GetCourseSectionByStatusResponse,
    VerifyCourseUserProgressRequest,
    VerifyCourseUserProgressResponse,
    PublicEnrolledCourseRequest,
    PublicEnrolledCourseResponse,
    GetCourseContentAnalyticsRequest,
    GetCourseContentAnalyticsResponse,
    GetCourseSubjectRequest,
    GetCourseSubjectResponse,
    GetStudentCoursesRequest,
    GetStudentCoursesResponse,
    GetTeacherHighestPaidCoursesRequest,
    GetTeacherHighestPaidCoursesResponse,
    GetTopCategoriesCourseRequest,
    GetTopCategoriesCourseResponse,
    GetPublisherCourseRequest,
    GetPublisherCourseResponse,
    UserWithoutEnrollRequest,
    UserWithoutEnrollResponse,
    GetCourseMembersRequest,
    GetCourseMembersResponse,
    GetTeacherCourseRequest,
    GetTeacherCourseResponse,
    GetOngoingCourseRequest,
    GetOngoingCourseResponse,
    EditContentInSectionRequest,
    EditContentInSectionResponse,
    GetAllMyCourseProgressRequest,
    GetAllMyCourseProgressResponse,
    GetCoursePublicReq,
    GetCoursePublicRes,
    GetTeacherCourseDetailRequest,
    GetTeacherCourseDetailResponse,
    UpdateContentTimeSpentRequest,
    UpdateContentTimeSpentResponse,
    CompleteContentRequest,
    CompleteContentResponse,
    StartContentRequest,
    StartContentResponse,
    GetCoursesRequest,
    GetCoursesResponse,
    GetTeacherArchivedCoursesRequest,
    GetTeacherArchivedCoursesResponse,
    GetTeacherMostPopularCoursesRequest,
    GetTeacherMostPopularCoursesResponse,
    GetAllTeacherCoursesRequest,
    GetAllTeacherCoursesResponse,
    GetPublicListingRequest,
    GetPublicListingResponse,
    GetBestSellerCourseRequest,
    GetBestSellerCourseResponse,
    GetPopularCourseRequest,
    GetPopularCourseResponse,
    GetArchiveCoursesRequest,
    GetArchiveCoursesResponse,
    GetQuestionDistributionAnalyticsRequest,
    GetQuestionDistributionAnalyticsResponse,
    GetRankingAnalyticsRequest,
    GetRankingAnalyticsResponse,
    GetCourseContentAttemptByStudentRequest,
    GetCourseContentAttemptByStudentResponse,
    GetPracticeTimeAnalyticsRequest,
    GetPracticeTimeAnalyticsResponse,
    GetLearningTimeAnalyticsRequest,
    GetLearningTimeAnalyticsResponse,
    GetCompletionAnalyticsRequest,
    GetCompletionAnalyticsResponse,
    GetAccuracyAnalyticsRequest,
    GetAccuracyAnalyticsResponse,
    GetMyFavoriteRequest,
    GetMyFavoriteResponse,
    GetFavoriteSubjectsRequest,
    GetFavoriteSubjectsResponse,
    CountRequest,
    CountResponse,
    NotifyStudentsAfterWithdrawalRequest,
    NotifyStudentsAfterWithdrawalResponse,
    FindRequest,
    FindResponse,
    GetCourseRequest,
    GetOngoingCourseContentReq,
    Empty,
    GetAuthorsReq,
    GetRatingByCourseReq,
    GetCoursesPublicReq,
    PublishSectionReq,
} from '@app/common/dto/course.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufCoursePackage = 'course';
export const protobufCourseService = 'CourseGrpcService';

export interface CourseGrpcInterface {
    CreateCourse(request: CourseRequest): Promise<CourseResponse>;
    GetCourse(request: GetCourseRequest): Promise<GetCourseResponse>;
    GetCourseById(request: GetCourseByIdRequest): Promise<GetCourseByIdResponse>;
    UpdateCourse(request: UpdateCourseRequest): Promise<UpdateCourseResponse>;
    DeleteCourse(request: DeleteCourseRequest): Promise<DeleteCourseResponse>;
    GetCourseByClassroom(request: GetCourseByClassroomRequest): Promise<GetCourseByClassroomResponse>;
    AddClassToCourse(request: AddClassToCourseRequest): Promise<AddClassToCourseResponse>;
    RemoveClassFromCourse(request: RemoveClassFromCourseRequest): Promise<RemoveClassFromCourseResponse>;
    GetAvgRatingByCourse(request: GetAvgRatingByCourseRequest): Promise<GetAvgRatingByCourseResponse>;
    GetRatingByCourse(request: GetRatingByCourseReq): Promise<Empty>;
    AddFavorite(request: AddToFavoriteRequest): Promise<AddToFavoriteResponse>;
    RemoveFavorite(request: RemoveFavoriteRequest): Promise<RemoveFavoriteResponse>;
    AddFeedback(request: AddFeedbackRequest): Promise<AddFeedbackResponse>;
    GetRatingCountByCourse(request: GetRatingCountByCourseRequest): Promise<GetRatingCountByCourseResponse>;
    AddSection(request: AddSectionRequest): Promise<AddSectionResponse>;
    UpdateSectionsOrder(request: UpdateSectionsOrderRequest): Promise<UpdateSectionsOrderResponse>;
    UpdateCourseContent(request: UpdateCourseContentRequest): Promise<UpdateCourseContentResponse>;
    DeleteContent(request: DeleteContentRequest): Promise<DeleteContentResponse>;
    DeleteSection(request: DeleteSectionRequest): Promise<DeleteSectionResponse>;
    AddContentFavorite(request: AddContentFavoriteRequest): Promise<AddContentFavoriteResponse>
    RemoveContentFavorite(request: RemoveContentFavoriteRequest): Promise<RemoveContentFavoriteResponse>
    GetFavoriteCourse(request: GetFavoriteCourseRequest): Promise<GetFavoriteCourseResponse>;
    GetOngoingClasses(request: GetOngoingClassesRequest): Promise<GetOngoingClassesResponse>;
    GetCourseProgress(request: GetCourseProgressRequest): Promise<GetCourseProgressResponse>;
    GetUserCourse(request: GetUserCourseRequest): Promise<GetUserCourseResponse>;
    FetchTeacherAssessment(request: FetchTeacherAssessmentRequest): Promise<FetchTeacherAssessmentResponse>;
    GetClassesTimeSpent(request: GetClassesTimeSpentRequest): Promise<GetClassesTimeSpentResponse>;
    GetAuthors(request: GetAuthorsReq): Promise<Empty>;
    GetCourseSectionsReport(request: GetCourseSectionsReportRequest): Promise<GetCourseSectionsReportResponse>;
    GetStudentCourseOverview(request: GetStudentCourseOverviewRequest): Promise<GetStudentCourseOverviewResponse>;
    GetCourseSectionByStatus(request: GetCourseSectionByStatusRequest): Promise<GetCourseSectionByStatusResponse>;
    VerifyCourseUserProgress(request: VerifyCourseUserProgressRequest): Promise<VerifyCourseUserProgressResponse>;
    PublicEnrolledCourse(request: PublicEnrolledCourseRequest): Promise<PublicEnrolledCourseResponse>;
    GetCourseContentAnalytics(request: GetCourseContentAnalyticsRequest): Promise<GetCourseContentAnalyticsResponse>;
    GetCourseSubject(request: GetCourseSubjectRequest): Promise<GetCourseSubjectResponse>;
    GetStudentCourses(request: GetStudentCoursesRequest): Promise<GetStudentCoursesResponse>;
    GetTeacherHighestPaidCourses(request: GetTeacherHighestPaidCoursesRequest): Promise<GetTeacherHighestPaidCoursesResponse>;
    GetTopCategoriesCourse(request: GetTopCategoriesCourseRequest): Promise<GetTopCategoriesCourseResponse>;
    GetPublisherCourse(request: GetPublisherCourseRequest): Promise<GetPublisherCourseResponse>;
    UserWithoutEnroll(request: UserWithoutEnrollRequest): Promise<UserWithoutEnrollResponse>;
    GetCourseMembers(request: GetCourseMembersRequest): Promise<GetCourseMembersResponse>
    GetTeacherCourse(request: GetTeacherCourseRequest): Promise<GetTeacherCourseResponse>;
    GetOngoingCourse(request: GetOngoingCourseRequest): Promise<GetOngoingCourseResponse>;
    GetOngoingCourseContent(request: GetOngoingCourseContentReq): Promise<Empty>;
    EditContentInSection(request: EditContentInSectionRequest): Promise<EditContentInSectionResponse>;
    GetAllMyCourseProgress(request: GetAllMyCourseProgressRequest): Promise<GetAllMyCourseProgressResponse>;
    GetCoursePublic(request: GetCoursePublicReq): Promise<GetCoursePublicRes>;
    GetTeacherCourseDetail(request: GetTeacherCourseDetailRequest): Promise<GetTeacherCourseDetailResponse>;
    UpdateContentTimeSpent(request: UpdateContentTimeSpentRequest): Promise<UpdateContentTimeSpentResponse>;
    CompleteContent(request: CompleteContentRequest): Promise<CompleteContentResponse>;
    StartContent(request: StartContentRequest): Promise<StartContentResponse>;
    GetCoursesPublic(request: GetCoursesPublicReq): Promise<Empty>;
    GetCourses(request: GetCoursesRequest): Promise<GetCoursesResponse>;
    GetTeacherArchivedCourses(request: GetTeacherArchivedCoursesRequest): Promise<GetTeacherArchivedCoursesResponse>;
    GetTeacherMostPopularCourses(request: GetTeacherMostPopularCoursesRequest): Promise<GetTeacherMostPopularCoursesResponse>;
    GetAllTeacherCourses(request: GetAllTeacherCoursesRequest): Promise<GetAllTeacherCoursesResponse>;
    GetPublicListing(request: GetPublicListingRequest): Promise<GetPublicListingResponse>;
    GetBestSellerCourse(request: GetBestSellerCourseRequest): Promise<GetBestSellerCourseResponse>
    GetPopularCourse(request: GetPopularCourseRequest): Promise<GetPopularCourseResponse>;
    GetArchiveCourses(request: GetArchiveCoursesRequest): Promise<GetArchiveCoursesResponse>;
    GetQuestionDistributionAnalytics(request: GetQuestionDistributionAnalyticsRequest): Promise<GetQuestionDistributionAnalyticsResponse>;
    GetRankingAnalytics(request: GetRankingAnalyticsRequest): Promise<GetRankingAnalyticsResponse>
    GetCourseContentAttemptByStudent(request: GetCourseContentAttemptByStudentRequest): Promise<GetCourseContentAttemptByStudentResponse>;
    GetPracticeTimeAnalytics(request: GetPracticeTimeAnalyticsRequest): Promise<GetPracticeTimeAnalyticsResponse>;
    GetLearningTimeAnalytics(request: GetLearningTimeAnalyticsRequest): Promise<GetLearningTimeAnalyticsResponse>;
    GetCompletionAnalytics(request: GetCompletionAnalyticsRequest): Promise<GetCompletionAnalyticsResponse>;
    GetAccuracyAnalytics(request: GetAccuracyAnalyticsRequest): Promise<GetAccuracyAnalyticsResponse>;
    GetMyFavorite(request: GetMyFavoriteRequest): Promise<GetMyFavoriteResponse>;
    GetFavoriteSubjects(GetFavoriteSubjectsRequest: any): Promise<GetFavoriteSubjectsResponse>;
    Count(CountRequest: any): Promise<CountResponse>;
    NotifyStudentsAfterWithdrawal(request: NotifyStudentsAfterWithdrawalRequest): Promise<NotifyStudentsAfterWithdrawalResponse>
    Find(request: FindRequest): Promise<FindResponse>;
    PublishSection(request: PublishSectionReq): Promise<Empty>;
}

@Injectable()
export class CourseGrpcServiceClientImpl implements CourseGrpcInterface {
    private courseGrpcServiceClient: CourseGrpcInterface;
    private readonly logger = new Logger(CourseGrpcServiceClientImpl.name);

    constructor(
        @Inject('courseGrpcService') private courseGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing course gRPC client...');
        this.courseGrpcServiceClient =
            this.courseGrpcClient.getService<CourseGrpcInterface>(
                protobufCourseService,
            );
        this.logger.debug('gRPC course client initialized.');
    }
    async CreateCourse(request: CourseRequest): Promise<CourseResponse> {
        return await this.courseGrpcServiceClient.CreateCourse(request);
    }

    async GetCourse(request: GetCourseRequest): Promise<GetCourseResponse> {
        return await this.courseGrpcServiceClient.GetCourse(request);
    }

    async GetCourseById(request: GetCourseByIdRequest): Promise<GetCourseByIdResponse> {
        return await this.courseGrpcServiceClient.GetCourseById(request);
    }

    async UpdateCourse(request: UpdateCourseRequest): Promise<UpdateCourseResponse> {
        return await this.courseGrpcServiceClient.UpdateCourse(request);
    }

    async DeleteCourse(request: DeleteCourseRequest): Promise<DeleteCourseResponse> {
        return await this.courseGrpcServiceClient.DeleteCourse(request);
    }

    async GetCourseByClassroom(request: GetCourseByClassroomRequest): Promise<GetCourseByClassroomResponse> {
        return await this.courseGrpcServiceClient.GetCourseByClassroom(request);
    }

    async AddClassToCourse(request: AddClassToCourseRequest): Promise<AddClassToCourseResponse> {
        return await this.courseGrpcServiceClient.AddClassToCourse(request);
    }
    async RemoveClassFromCourse(request: RemoveClassFromCourseRequest): Promise<RemoveClassFromCourseResponse> {
        return await this.courseGrpcServiceClient.RemoveClassFromCourse(request);
    }
    async AddFavorite(request: AddToFavoriteRequest): Promise<AddToFavoriteResponse> {
        return await this.courseGrpcServiceClient.AddFavorite(request);
    }
    async RemoveFavorite(request: RemoveFavoriteRequest): Promise<RemoveFavoriteResponse> {
        return await this.courseGrpcServiceClient.RemoveFavorite(request);
    }
    async GetAvgRatingByCourse(request: GetAvgRatingByCourseRequest): Promise<GetAvgRatingByCourseResponse> {
        return await this.courseGrpcServiceClient.GetAvgRatingByCourse(request)
    }
    async GetRatingByCourse(request: GetRatingByCourseReq): Promise<Empty> {
        return await this.courseGrpcServiceClient.GetRatingByCourse(request)
    }
    async AddFeedback(request: AddFeedbackRequest): Promise<AddFeedbackResponse> {
        return await this.courseGrpcServiceClient.AddFeedback(request)
    }
    async GetRatingCountByCourse(request: GetRatingCountByCourseRequest): Promise<GetRatingCountByCourseResponse> {
        return await this.courseGrpcServiceClient.GetRatingCountByCourse(request);
    }
    async AddSection(request: AddSectionRequest): Promise<AddSectionResponse> {
        return await this.courseGrpcServiceClient.AddSection(request);
    }
    async UpdateSectionsOrder(request: UpdateSectionsOrderRequest): Promise<UpdateSectionsOrderResponse> {
        return await this.courseGrpcServiceClient.UpdateSectionsOrder(request)
    }
    async UpdateCourseContent(request: UpdateCourseContentRequest): Promise<UpdateCourseContentResponse> {
        return await this.courseGrpcServiceClient.UpdateCourseContent(request);
    }
    async DeleteContent(request: DeleteContentRequest): Promise<DeleteContentResponse> {
        return await this.courseGrpcServiceClient.DeleteContent(request);
    }
    async DeleteSection(request: DeleteSectionRequest): Promise<DeleteSectionResponse> {
        return await this.courseGrpcServiceClient.DeleteSection(request)
    }
    async AddContentFavorite(request: AddContentFavoriteRequest): Promise<AddContentFavoriteResponse> {
        return await this.courseGrpcServiceClient.AddContentFavorite(request)
    }
    async RemoveContentFavorite(request: RemoveContentFavoriteRequest): Promise<RemoveContentFavoriteResponse> {
        return await this.courseGrpcServiceClient.RemoveContentFavorite(request)
    }
    async GetFavoriteCourse(request: GetFavoriteCourseRequest): Promise<GetFavoriteCourseResponse> {
        return await this.courseGrpcServiceClient.GetFavoriteCourse(request)
    }
    async GetOngoingClasses(request: GetOngoingClassesRequest): Promise<GetOngoingClassesResponse> {
        return await this.courseGrpcServiceClient.GetOngoingClasses(request);
    }
    async GetCourseProgress(request: GetCourseProgressRequest): Promise<GetCourseProgressResponse> {
        return await this.courseGrpcServiceClient.GetCourseProgress(request)
    }
    async GetUserCourse(request: GetUserCourseRequest): Promise<GetUserCourseResponse> {
        return await this.courseGrpcServiceClient.GetUserCourse(request)
    }
    async FetchTeacherAssessment(request: FetchTeacherAssessmentRequest): Promise<FetchTeacherAssessmentResponse> {
        return await this.courseGrpcServiceClient.FetchTeacherAssessment(request)
    }
    async GetClassesTimeSpent(request: GetClassesTimeSpentRequest): Promise<GetClassesTimeSpentResponse> {
        return await this.courseGrpcServiceClient.GetClassesTimeSpent(request)
    }
    async GetAuthors(request: GetAuthorsReq): Promise<Empty> {
        return await this.courseGrpcServiceClient.GetAuthors(request)
    }
    async GetCourseSectionsReport(request: GetCourseSectionsReportRequest): Promise<GetCourseSectionsReportResponse> {
        return await this.courseGrpcServiceClient.GetCourseSectionsReport(request)
    }
    async GetStudentCourseOverview(request: GetStudentCourseOverviewRequest): Promise<GetStudentCourseOverviewResponse> {
        return await this.courseGrpcServiceClient.GetStudentCourseOverview(request);
    }
    async GetCourseSectionByStatus(request: GetCourseSectionByStatusRequest): Promise<GetCourseSectionByStatusResponse> {
        return await this.courseGrpcServiceClient.GetCourseSectionByStatus(request);
    }
    async VerifyCourseUserProgress(request: VerifyCourseUserProgressRequest): Promise<VerifyCourseUserProgressResponse> {
        return await this.courseGrpcServiceClient.VerifyCourseUserProgress(request);
    }
    async PublicEnrolledCourse(request: PublicEnrolledCourseRequest): Promise<PublicEnrolledCourseResponse> {
        return await this.courseGrpcServiceClient.PublicEnrolledCourse(request)
    }
    async GetCourseContentAnalytics(request: GetCourseContentAnalyticsRequest): Promise<GetCourseContentAnalyticsResponse> {
        return await this.courseGrpcServiceClient.GetCourseContentAnalytics(request)
    }
    async GetCourseSubject(request: GetCourseSubjectRequest): Promise<GetCourseSubjectResponse> {
        return await this.courseGrpcServiceClient.GetCourseSubject(request)
    }
    async GetStudentCourses(request: GetStudentCoursesRequest): Promise<GetStudentCoursesResponse> {
        return await this.courseGrpcServiceClient.GetStudentCourses(request)
    }
    async GetTeacherHighestPaidCourses(request: GetTeacherHighestPaidCoursesRequest): Promise<GetTeacherHighestPaidCoursesResponse> {
        return await this.courseGrpcServiceClient.GetTeacherHighestPaidCourses(request)
    }
    async GetTopCategoriesCourse(request: GetTopCategoriesCourseRequest): Promise<GetTopCategoriesCourseResponse> {
        return await this.courseGrpcServiceClient.GetTopCategoriesCourse(request)
    }
    async GetPublisherCourse(request: GetPublisherCourseRequest): Promise<GetPublisherCourseResponse> {
        return await this.courseGrpcServiceClient.GetPublisherCourse(request)
    }
    async UserWithoutEnroll(request: UserWithoutEnrollRequest): Promise<UserWithoutEnrollResponse> {
        return await this.courseGrpcServiceClient.UserWithoutEnroll(request)
    }
    async GetCourseMembers(request: GetCourseMembersRequest): Promise<GetCourseMembersResponse> {
        return await this.courseGrpcServiceClient.GetCourseMembers(request)
    }
    async GetTeacherCourse(request: GetTeacherCourseRequest): Promise<GetTeacherCourseResponse> {
        return await this.courseGrpcServiceClient.GetTeacherCourse(request)
    }
    async GetOngoingCourse(request: GetOngoingCourseRequest): Promise<GetOngoingCourseResponse> {
        return await this.courseGrpcServiceClient.GetOngoingCourse(request)
    }
    async GetOngoingCourseContent(request: GetOngoingCourseContentReq): Promise<Empty> {
        return await this.courseGrpcServiceClient.GetOngoingCourseContent(request)
    }
    async EditContentInSection(request: EditContentInSectionRequest): Promise<EditContentInSectionResponse> {
        return await this.courseGrpcServiceClient.EditContentInSection(request)
    }
    async GetAllMyCourseProgress(request: GetAllMyCourseProgressRequest): Promise<GetAllMyCourseProgressResponse> {
        return await this.courseGrpcServiceClient.GetAllMyCourseProgress(request)
    }
    async GetCoursePublic(request: GetCoursePublicReq): Promise<GetCoursePublicRes> {
        return await this.courseGrpcServiceClient.GetCoursePublic(request)
    }
    async GetTeacherCourseDetail(request: GetTeacherCourseDetailRequest): Promise<GetTeacherCourseDetailResponse> {
        return await this.courseGrpcServiceClient.GetTeacherCourseDetail(request);
    }
    async UpdateContentTimeSpent(request: UpdateContentTimeSpentRequest): Promise<UpdateContentTimeSpentResponse> {
        return await this.courseGrpcServiceClient.UpdateContentTimeSpent(request)
    }
    async CompleteContent(request: CompleteContentRequest): Promise<CompleteContentResponse> {
        return await this.courseGrpcServiceClient.CompleteContent(request)
    }
    async StartContent(request: StartContentRequest): Promise<StartContentResponse> {
        return await this.courseGrpcServiceClient.StartContent(request);
    }
    async GetCoursesPublic(request: GetCoursesPublicReq): Promise<Empty> {
        return await this.courseGrpcServiceClient.GetCoursesPublic(request)
    }
    async GetCourses(request: GetCoursesRequest): Promise<GetCoursesResponse> {
        return await this.courseGrpcServiceClient.GetCourses(request)
    }
    async GetTeacherArchivedCourses(request: GetTeacherArchivedCoursesRequest): Promise<GetTeacherArchivedCoursesResponse> {
        return await this.courseGrpcServiceClient.GetTeacherArchivedCourses(request)
    }
    async GetTeacherMostPopularCourses(request: GetTeacherMostPopularCoursesRequest): Promise<GetTeacherMostPopularCoursesResponse> {
        return await this.courseGrpcServiceClient.GetTeacherMostPopularCourses(request)
    }
    async GetAllTeacherCourses(request: GetAllTeacherCoursesRequest): Promise<GetAllTeacherCoursesResponse> {
        return await this.courseGrpcServiceClient.GetAllTeacherCourses(request)
    }
    async GetPublicListing(request: GetPublicListingRequest): Promise<GetPublicListingResponse> {
        return await this.courseGrpcServiceClient.GetPublicListing(request)
    }
    async GetBestSellerCourse(request: GetBestSellerCourseRequest): Promise<GetBestSellerCourseResponse> {
        return await this.courseGrpcServiceClient.GetBestSellerCourse(request)
    }
    async GetPopularCourse(request: GetPopularCourseRequest): Promise<GetPopularCourseResponse> {
        return await this.courseGrpcServiceClient.GetPopularCourse(request)
    }
    async GetArchiveCourses(request: GetArchiveCoursesRequest): Promise<GetArchiveCoursesResponse> {
        return await this.courseGrpcServiceClient.GetArchiveCourses(request)
    }
    async GetQuestionDistributionAnalytics(request: GetQuestionDistributionAnalyticsRequest): Promise<GetQuestionDistributionAnalyticsResponse> {
        return await this.courseGrpcServiceClient.GetQuestionDistributionAnalytics(request)
    }
    async GetRankingAnalytics(request: GetRankingAnalyticsRequest): Promise<GetRankingAnalyticsResponse> {
        return await this.courseGrpcServiceClient.GetRankingAnalytics(request)
    }
    async GetCourseContentAttemptByStudent(request: GetCourseContentAttemptByStudentRequest): Promise<GetCourseContentAttemptByStudentResponse> {
        return await this.courseGrpcServiceClient.GetCourseContentAttemptByStudent(request)
    }
    async GetPracticeTimeAnalytics(request: GetPracticeTimeAnalyticsRequest): Promise<GetPracticeTimeAnalyticsResponse> {
        return await this.courseGrpcServiceClient.GetPracticeTimeAnalytics(request)
    }
    async GetLearningTimeAnalytics(request: GetLearningTimeAnalyticsRequest): Promise<GetLearningTimeAnalyticsResponse> {
        return await this.courseGrpcServiceClient.GetLearningTimeAnalytics(request)
    }
    async GetCompletionAnalytics(request: GetCompletionAnalyticsRequest): Promise<GetCompletionAnalyticsResponse> {
        return await this.courseGrpcServiceClient.GetCompletionAnalytics(request)
    }
    async GetAccuracyAnalytics(request: GetAccuracyAnalyticsRequest): Promise<GetAccuracyAnalyticsResponse> {
        return await this.courseGrpcServiceClient.GetAccuracyAnalytics(request)
    }

    async GetMyFavorite(request: GetMyFavoriteRequest): Promise<GetMyFavoriteResponse> {
        return await this.courseGrpcServiceClient.GetMyFavorite(request)
    }
    async GetFavoriteSubjects(request: GetFavoriteSubjectsRequest):
        Promise<GetFavoriteSubjectsResponse> {
        return await this.courseGrpcServiceClient.GetFavoriteSubjects(request)
    }

    async Count(request: CountRequest): Promise<CountResponse> {
        return await this.courseGrpcServiceClient.Count(request)
    }

    async NotifyStudentsAfterWithdrawal(request: NotifyStudentsAfterWithdrawalRequest): Promise<NotifyStudentsAfterWithdrawalResponse> {
        return await this.courseGrpcServiceClient.NotifyStudentsAfterWithdrawal(request)
    }

    async Find(request: FindRequest): Promise<FindResponse> {
        return await this.courseGrpcServiceClient.Find(request)
    }

    async PublishSection(request: PublishSectionReq): Promise<Empty> {
        return await this.courseGrpcServiceClient.PublishSection(request)
    }
}
