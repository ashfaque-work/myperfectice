import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CourseService } from './course.service';
import { protobufCourseService } from '@app/common/grpc-clients/course';
import {
  CourseRequest, GetCourseByIdRequest, UpdateCourseRequest, DeleteCourseRequest, GetCourseByClassroomRequest, AddFeedbackRequest,
  AddClassToCourseRequest, RemoveClassFromCourseRequest, AddToFavoriteRequest, RemoveFavoriteRequest, AddSectionRequest,
  GetAvgRatingByCourseRequest, GetRatingCountByCourseRequest, UpdateSectionsOrderRequest, UpdateCourseContentRequest,
  DeleteContentRequest, DeleteSectionRequest, AddContentFavoriteRequest, RemoveContentFavoriteRequest, GetFavoriteCourseRequest,
  GetOngoingClassesRequest, GetCourseProgressRequest, GetUserCourseRequest, FetchTeacherAssessmentRequest, GetClassesTimeSpentRequest,
  GetCourseSectionsReportRequest, GetStudentCourseOverviewRequest, GetCourseSectionByStatusRequest, VerifyCourseUserProgressRequest,
  PublicEnrolledCourseRequest, GetCourseContentAnalyticsRequest, GetCourseSubjectRequest, GetStudentCoursesRequest,
  GetTeacherHighestPaidCoursesRequest, GetTopCategoriesCourseRequest, GetPublisherCourseRequest, UserWithoutEnrollRequest,
  GetCourseMembersRequest, GetTeacherCourseRequest, GetOngoingCourseRequest, EditContentInSectionRequest, GetAllMyCourseProgressRequest,
  GetCoursePublicReq, GetTeacherCourseDetailRequest, UpdateContentTimeSpentRequest, CompleteContentRequest, StartContentRequest,
  GetCoursesRequest, GetTeacherArchivedCoursesRequest, GetTeacherMostPopularCoursesRequest, GetAllTeacherCoursesRequest,
  GetPublicListingRequest, GetBestSellerCourseRequest, GetPopularCourseRequest, GetArchiveCoursesRequest,
  GetRankingAnalyticsRequest, GetCourseContentAttemptByStudentRequest, GetPracticeTimeAnalyticsRequest, GetLearningTimeAnalyticsRequest,
  GetCompletionAnalyticsRequest, GetAccuracyAnalyticsRequest, GetMyFavoriteRequest, GetFavoriteSubjectsRequest, CountRequest,
  NotifyStudentsAfterWithdrawalRequest, FindRequest, GetOngoingCourseContentReq, GetAuthorsReq,
  GetRatingByCourseReq, GetCoursesPublicReq, PublishSectionReq, GetQuestionDistributionAnalyticsRequest,
} from '@app/common/dto/course.dto';

@Controller()
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @GrpcMethod(protobufCourseService, 'CreateCourse')
  createCourse(request: CourseRequest) {
    return this.courseService.createCourse(request);
  }

  @GrpcMethod(protobufCourseService, 'GetCourseById')
  getCourseById(request: GetCourseByIdRequest) {
    return this.courseService.getCourseById(request);
  }

  @GrpcMethod(protobufCourseService, 'UpdateCourse')
  updateCourse(request: UpdateCourseRequest) {
    return this.courseService.updateCourse(request);
  }

  @GrpcMethod(protobufCourseService, 'DeleteCourse')
  deleteCourse(request: DeleteCourseRequest) {
    return this.courseService.deleteCourse(request);
  }

  @GrpcMethod(protobufCourseService, 'GetCourseByClassroom')
  getCourseByClassroom(request: GetCourseByClassroomRequest) {
    return this.courseService.getCourseByClassroom(request);
  }

  @GrpcMethod(protobufCourseService, 'AddClassToCourse')
  addClassToCourse(request: AddClassToCourseRequest) {
    console.log(request);

    return this.courseService.addClassToCourse(request);
  }

  @GrpcMethod(protobufCourseService, 'RemoveClassFromCourse')
  removeClassFromCourse(request: RemoveClassFromCourseRequest) {
    return this.courseService.removeClassFromCourse(request);
  }
  @GrpcMethod(protobufCourseService, 'GetAvgRatingByCourse')
  getAvgRatingByCourse(request: GetAvgRatingByCourseRequest) {
    return this.courseService.getAvgRatingByCourse(request)
  }
  @GrpcMethod(protobufCourseService, 'GetRatingByCourse')
  getRatingByCourse(request: GetRatingByCourseReq) {
    return this.courseService.getRatingByCourse(request)
  }
  @GrpcMethod(protobufCourseService, 'AddFavorite')
  addToFavorite(request: AddToFavoriteRequest) {
    return this.courseService.addToFavorite(request);
  }
  @GrpcMethod(protobufCourseService, 'RemoveFavorite')
  removeFavorite(request: RemoveFavoriteRequest) {
    return this.courseService.removeFavorite(request);
  }
  @GrpcMethod(protobufCourseService, 'AddFeedback')
  addFavorite(request: AddFeedbackRequest) {
    return this.courseService.addFeedback(request)
  }
  @GrpcMethod(protobufCourseService, 'GetRatingCountByCourse')
  getRatingCountByCourse(request: GetRatingCountByCourseRequest) {
    return this.courseService.getRatingCountByCourse(request)
  }
  @GrpcMethod(protobufCourseService, 'AddSection')
  addSection(request: AddSectionRequest) {
    return this.courseService.addSection(request);
  }
  @GrpcMethod(protobufCourseService, 'UpdateSectionsOrder')
  updateSectionsOrder(request: UpdateSectionsOrderRequest) {
    return this.courseService.updateSectionsOrder(request)
  }
  @GrpcMethod(protobufCourseService, 'UpdateCourseContent')
  updateCourseContent(request: UpdateCourseContentRequest) {
    return this.courseService.updateCourseContent(request)
  }
  @GrpcMethod(protobufCourseService, 'DeleteContent')
  deleteContent(request: DeleteContentRequest) {
    return this.courseService.deleteContent(request)
  }
  @GrpcMethod(protobufCourseService, 'DeleteSection')
  deleteSection(request: DeleteSectionRequest) {
    return this.courseService.deleteSection(request)
  }
  @GrpcMethod(protobufCourseService, 'AddContentFavorite')
  addContentFavorite(request: AddContentFavoriteRequest) {
    return this.courseService.addContentFavorite(request)
  }
  @GrpcMethod(protobufCourseService, 'RemoveContentFavorite')
  removeContentFavorite(request: RemoveContentFavoriteRequest) {
    return this.courseService.removeContentFavorite(request)
  }
  @GrpcMethod(protobufCourseService, 'GetFavoriteCourse')
  getFavoriteCourse(request: GetFavoriteCourseRequest) {
    return this.courseService.getFavoriteCourse(request);
  }
  @GrpcMethod(protobufCourseService, 'GetOngoingClasses')
  getOngoingClasses(request: GetOngoingClassesRequest) {
    return this.courseService.getOngoingClasses(request);
  }
  @GrpcMethod(protobufCourseService, 'GetCourseProgress')
  getCourseProgress(request: GetCourseProgressRequest) {
    return this.courseService.getCourseProgress(request)
  }
  @GrpcMethod(protobufCourseService, 'GetUserCourse')
  getUserCourse(request: GetUserCourseRequest) {
    return this.courseService.getUserCourse(request)
  }
  @GrpcMethod(protobufCourseService, 'FetchTeacherAssessment')
  fetchTeacherAssessment(request: FetchTeacherAssessmentRequest) {
    return this.courseService.fetchTeacherAssessment(request)
  }
  @GrpcMethod(protobufCourseService, 'GetClassesTimeSpent')
  getClassesTimeSpent(request: GetClassesTimeSpentRequest) {
    return this.courseService.getClassesTimeSpent(request);
  }
  @GrpcMethod(protobufCourseService, 'GetAuthors')
  getAuthors(request: GetAuthorsReq) {
    return this.courseService.getAuthors(request);
  }
  @GrpcMethod(protobufCourseService, 'GetCourseSectionsReport')
  getCourseSectionsReport(request: GetCourseSectionsReportRequest) {
    return this.courseService.getCourseSectionsReport(request)
  }
  @GrpcMethod(protobufCourseService, 'GetStudentCourseOverview')
  getStudentCourseOverview(request: GetStudentCourseOverviewRequest) {
    return this.courseService.getStudentCourseOverview(request)
  }
  @GrpcMethod(protobufCourseService, 'GetCourseSectionByStatus')
  getCourseSectionByStatus(request: GetCourseSectionByStatusRequest) {
    return this.courseService.getCourseSectionByStatus(request)
  }
  @GrpcMethod(protobufCourseService, 'VerifyCourseUserProgress')
  verifyCourseUserProgress(request: VerifyCourseUserProgressRequest) {
    return this.courseService.verifyCourseUserProgress(request)
  }
  @GrpcMethod(protobufCourseService, 'PublicEnrolledCourse')
  publicEnrolledCourse(request: PublicEnrolledCourseRequest) {
    return this.courseService.publicEnrolledCourse(request)
  }
  @GrpcMethod(protobufCourseService, 'GetCourseContentAnalytics')
  getCourseContentAnalytics(request: GetCourseContentAnalyticsRequest) {
    return this.courseService.getCourseContentAnalytics(request)
  }
  @GrpcMethod(protobufCourseService, 'GetCourseSubject')
  getCourseSubject(request: GetCourseSubjectRequest) {
    return this.courseService.getCourseSubject(request)
  }
  @GrpcMethod(protobufCourseService, 'GetStudentCourses')
  getStudentCourses(request: GetStudentCoursesRequest) {
    return this.courseService.getStudentCourses(request)
  }
  @GrpcMethod(protobufCourseService, 'GetTeacherHighestPaidCourses')
  getTeacherHighestPaidCourses(request: GetTeacherHighestPaidCoursesRequest) {
    return this.courseService.getTeacherHighestPaidCourses(request);
  }
  @GrpcMethod(protobufCourseService, 'GetTopCategoriesCourse')
  getTopCategoriesCourse(request: GetTopCategoriesCourseRequest) {
    return this.courseService.getTopCategoriesCourse(request)
  }
  @GrpcMethod(protobufCourseService, 'GetPublisherCourse')
  getPublisherCourse(request: GetPublisherCourseRequest) {
    return this.courseService.getPublisherCourse(request)
  }
  @GrpcMethod(protobufCourseService, 'UserWithoutEnroll')
  userWithoutEnroll(request: UserWithoutEnrollRequest) {
    return this.courseService.userWithoutEnroll(request)
  }
  @GrpcMethod(protobufCourseService, 'GetCourseMembers')
  getCourseMembers(request: GetCourseMembersRequest) {
    return this.courseService.getCourseMembers(request)
  }
  @GrpcMethod(protobufCourseService, 'GetTeacherCourse')
  getTeacherCourse(request: GetTeacherCourseRequest) {
    return this.courseService.getTeacherCourse(request)
  }
  @GrpcMethod(protobufCourseService, 'GetOngoingCourse')
  getOngoingCourse(request: GetOngoingCourseRequest) {
    return this.courseService.getOngoingCourse(request)
  }
  @GrpcMethod(protobufCourseService, 'GetOngoingCourseContent')
  getOngoingCourseContent(request: GetOngoingCourseContentReq) {
    return this.courseService.getOngoingCourseContent(request)
  }
  @GrpcMethod(protobufCourseService, 'EditContentInSection')
  editContentInSection(request: EditContentInSectionRequest) {
    return this.courseService.editContentInSection(request)
  }
  @GrpcMethod(protobufCourseService, 'GetAllMyCourseProgress')
  getAllMyCourseProgress(request: GetAllMyCourseProgressRequest) {
    return this.courseService.getAllMyCourseProgress(request)
  }
  @GrpcMethod(protobufCourseService, 'GetCoursePublic')
  getCoursePublic(request: GetCoursePublicReq) {
    return this.courseService.getCoursePublic(request)
  }
  @GrpcMethod(protobufCourseService, 'GetTeacherCourseDetail')
  getTeacherCourseDetail(request: GetTeacherCourseDetailRequest) {
    return this.courseService.getTeacherCourseDetail(request)
  }
  @GrpcMethod(protobufCourseService, 'UpdateContentTimeSpent')
  updateContentTimeSpent(request: UpdateContentTimeSpentRequest) {
    return this.courseService.updateContentTimeSpent(request)
  }
  @GrpcMethod(protobufCourseService, 'CompleteContent')
  completeContent(request: CompleteContentRequest) {
    return this.courseService.completeContent(request)
  }
  @GrpcMethod(protobufCourseService, 'StartContent')
  startContent(request: StartContentRequest) {
    return this.courseService.startContent(request)
  }
  @GrpcMethod(protobufCourseService, 'GetCoursesPublic')
  getCoursesPublic(request: GetCoursesPublicReq) {
    return this.courseService.getCoursesPublic(request)
  }
  @GrpcMethod(protobufCourseService, 'GetCourses')
  getCourses(request: GetCoursesRequest) {
    return this.courseService.getCourses(request)
  }
  @GrpcMethod(protobufCourseService, 'GetTeacherArchivedCourses')
  getTeacherArchivedCourses(request: GetTeacherArchivedCoursesRequest) {
    return this.courseService.getTeacherArchivedCourses(request)
  }
  @GrpcMethod(protobufCourseService, 'GetTeacherMostPopularCourses')
  getTeacherMostPopularCourses(request: GetTeacherMostPopularCoursesRequest) {
    return this.courseService.getTeacherMostPopularCourses(request)
  }
  @GrpcMethod(protobufCourseService, 'GetAllTeacherCourses')
  getAllTeacherCourses(request: GetAllTeacherCoursesRequest) {
    return this.courseService.getAllTeacherCourses(request)
  }
  @GrpcMethod(protobufCourseService, 'GetPublicListing')
  getPublicListing(request: GetPublicListingRequest) {
    return this.courseService.getPublicListing(request)
  }
  @GrpcMethod(protobufCourseService, 'GetBestSellerCourse')
  getBestSellerCourse(request: GetBestSellerCourseRequest) {
    return this.courseService.getBestSellerCourse(request)
  }
  @GrpcMethod(protobufCourseService, 'GetPopularCourse')
  getPopularCourse(request: GetPopularCourseRequest) {
    return this.courseService.getPopularCourse(request)
  }
  @GrpcMethod(protobufCourseService, 'GetArchiveCourses')
  getArchiveCourses(request: GetArchiveCoursesRequest) {
    return this.courseService.getArchiveCourses(request)
  }
  @GrpcMethod(protobufCourseService, 'GetQuestionDistributionAnalytics')
  getQuestionDistributionAnalytics(request: GetQuestionDistributionAnalyticsRequest) {
    return this.courseService.getQuestionDistributionAnalytics(request)
  }
  @GrpcMethod(protobufCourseService, 'GetRankingAnalytics')
  getRankingAnalytics(request: GetRankingAnalyticsRequest) {
    return this.courseService.getRankingAnalytics(request)
  }
  @GrpcMethod(protobufCourseService, 'GetCourseContentAttemptByStudent')
  getCourseContentAttemptByStudent(request: GetCourseContentAttemptByStudentRequest) {
    return this.courseService.getCourseContentAttemptByStudent(request)
  }
  @GrpcMethod(protobufCourseService, 'GetPracticeTimeAnalytics')
  getPracticeTimeAnalytics(request: GetPracticeTimeAnalyticsRequest) {
    return this.courseService.getPracticeTimeAnalytics(request)
  }
  @GrpcMethod(protobufCourseService, 'GetLearningTimeAnalytics')
  getLearningTimeAnalytics(request: GetLearningTimeAnalyticsRequest) {
    return this.courseService.getLearningTimeAnalytics(request)
  }
  @GrpcMethod(protobufCourseService, 'GetCompletionAnalytics')
  getCompletionAnalytics(request: GetCompletionAnalyticsRequest) {
    return this.courseService.getCompletionAnalytics(request)
  }
  @GrpcMethod(protobufCourseService, 'GetAccuracyAnalytics')
  getAccuracyAnalytics(request: GetAccuracyAnalyticsRequest) {
    return this.courseService.getAccuracyAnalytics(request)
  }
  @GrpcMethod(protobufCourseService, 'GetMyFavorite')
  getMyFavorite(request: GetMyFavoriteRequest) {
    return this.courseService.getMyFavorite(request)
  }
  @GrpcMethod(protobufCourseService, 'GetFavoriteSubjects')
  getFavoriteSubjects(request: GetFavoriteSubjectsRequest) {
    return this.courseService.getFavoriteSubjects(request)
  }

  @GrpcMethod(protobufCourseService, 'Count')
  count(request: CountRequest) {
    return this.courseService.count(request)
  }

  @GrpcMethod(protobufCourseService, 'NotifyStudentsAfterWithdrawal')
  notifyStudentsAfterWithdrawal(request: NotifyStudentsAfterWithdrawalRequest) {
    return this.courseService.notifyStudentsAfterWithdrawal(request)
  }

  @GrpcMethod(protobufCourseService, 'Find')
  find(request: FindRequest) {
    return this.courseService.find(request)
  }

  @GrpcMethod(protobufCourseService, 'PublishSection')
  publishSection(request: PublishSectionReq) {
    return this.courseService.publishSection(request)
  }
}
