import { Body, Controller, Param, Get, Post, Put, Delete, UseGuards, Req, Query, Headers } from '@nestjs/common';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { CourseService } from './course.service';
import {
    AddClassToCourseRequest, AddFeedbackRequest, AddSectionBody, AddSectionRequest, CompleteContentRequest, CountRequest, CourseRequest,
    CourseSection,
    EditContentInSectionRequest, FindRequest, GetAccuracyAnalyticsRequest, GetAllTeacherCoursesRequest,
    GetCompletionAnalyticsRequest, GetLearningTimeAnalyticsRequest, GetMyFavoriteRequest, GetPracticeTimeAnalyticsRequest,
    NotifyStudentsAfterWithdrawalRequest, PublishSectionReq, StartContentRequest, UpdateContentTimeSpentRequest,
    UpdateCourseContentRequest, UpdateCourseRequest, UpdateSectionsOrderRequest
} from '@app/common/dto/course.dto';

@ApiTags('Course')
@Controller('courses')
export class CourseController {
    constructor(private courseService: CourseService) { }

    @Put('/addfavorite/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    addFavorite(@Headers('instancekey') instancekey: string, @Req() req, @Param('id') id: string) {
        return this.courseService.addFavorite({ userId: req.user._id, instancekey, _id: id, activeLocation: req.user.activeLocation });
    }
    @Post('create')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    createCourse(@Headers('instancekey') instancekey: string, @Body() request: CourseRequest) {
        request.instancekey = instancekey
        return this.courseService.createCourse(request);
    }

    @Put('/publishSection/:courseId')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    publishSection(
        @Headers('instancekey') instancekey: string, @Param('courseId') courseId: string, @Body() request: PublishSectionReq) {
        return this.courseService.publishSection({ ...request, courseId, instancekey })
    }

    @Delete('/removefavorite/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    removeFavorite(@Headers('instancekey') instancekey: string, @Req() req, @Param('id') id: string) {
        return this.courseService.removeFavorite({ userId: req.user._id, instancekey, _id: id });
    }
    @Delete('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    deleteCourse(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req) {
        return this.courseService.deleteCourse({ _id: id, instancekey });
    }

    @Get('/byClassroom/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard, RolesGuard)
    getCourseByClassroom(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req) {
        return this.courseService.getCourseByClassroom({ _id: id, instancekey });
    }

    @Put('addClassroom/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    addClassToCourse(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Body() request: AddClassToCourseRequest) {
        request.instancekey = instancekey
        request._id = id
        return this.courseService.addClassToCourse(request);
    }

    @Delete('/removeClassroom/:id/:itemId')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    removeClassFromCourse(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Param('itemId') itemId: string, @Req() req) {
        return this.courseService.removeClassFromCourse({ _id: id, itemId, instancekey });
    }
    @Get('/avg-rating/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getAvgRatingByCourse(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req) {
        return this.courseService.getAvgRatingByCourse({ _id: id, instancekey })
    }

    @Get('/ratings/:id')
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'rating', required: false, type: Number })
    @ApiQuery({ name: 'keywords', required: false, type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getRatingByCourse(
        @Headers('instancekey') instancekey: string, @Param('id') id: string,
        @Query('page') page: number, @Query('limit') limit: number,
        @Query('rating') rating: number, @Query('keywords') keywords: string,
    ) {
        return this.courseService.getRatingByCourse({ _id: id, instancekey, query: { page, limit, rating, keywords } })
    }

    @Put('/:id/feedback')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    addFeedback(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Body() request: AddFeedbackRequest, @Req() req) {
        request.user = req.user._id;
        request.courseId = id;
        request.instancekey = instancekey
        return this.courseService.addFeedback(request)
    }

    @Get('/public')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'skip', required: false })
    @ApiQuery({ name: 'count', required: false })
    getPublicListing(@Headers('instancekey') instancekey: string, @Query('limit') limit: number, @Query('count') count: boolean, @Query('page') page: number, @Query('skip') skip: number) {
        return this.courseService.getPublicListing({ instancekey, limit, page, skip, count });
    }

    @Get('/public/avg-rating/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getAvgRatingByCoursePublic(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req) {
        return this.courseService.getAvgRatingByCourse({ _id: id, instancekey })
    }

    @Get('/public/ratings/:id')
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'rating', required: false, type: Number })
    @ApiQuery({ name: 'keywords', required: false, type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getRatingByCoursePublic(
        @Headers('instancekey') instancekey: string, @Param('id') id: string,
        @Query('page') page: number, @Query('limit') limit: number,
        @Query('rating') rating: number, @Query('keywords') keywords: string,
    ) {
        return this.courseService.getRatingByCourse({ _id: id, instancekey, query: { page, limit, rating, keywords } })
    }

    @Get('/public/ratings-count/:id')
    @ApiQuery({ name: 'keywords', required: false })
    @ApiQuery({ name: 'rating', required: false })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getRatingCountByCourse(@Headers('instancekey') instancekey: string, @Param('id') id: string,
        @Query('keywords') keywords: string,
        @Query('rating') rating: number,
        @Req() req
    ) {
        return this.courseService.getRatingCountByCourse({ id, keywords: keywords, rating, instancekey });
    }

    @Get('/public/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getCoursePublic(@Headers('instancekey') instancekey: string, @Param('id') courseId: string, @Req() req) {
        return this.courseService.getCoursePublic({ instancekey, courseId, userId: req.user._id })
    }


    @Get('/categories/top')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getTopCategoriesCourse(@Headers('instancekey') instancekey: string, @Query('page') page: number, @Query('limit') limit: number, @Req() req) {
        return this.courseService.getTopCategoriesCourse({ instancekey, page, limit, activeLocation: req.user.activeLocation })
    }

    @Post('/addSection/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    addSection(@Headers('instancekey') instancekey: string, @Param('id') _id: string, @Body() body: AddSectionBody, @Req() req) {
        return this.courseService.addSection({body, userId: req.user._id, _id, instancekey});
    }
    @Put('/updateSectionsOrder/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateSectionsOrder(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Body() request: UpdateSectionsOrderRequest, @Req() req) {
        request._id = id;
        request.userId = req.user._id;
        request.instancekey = instancekey;
        return this.courseService.updateSectionsOrder(request)
    }
    @Put('/updateCourseContent/:courseId')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    updateCourseContent(@Headers('instancekey') instancekey: string, @Param("courseId") courseId: string, @Body() request: UpdateCourseContentRequest) {
        request.courseId = courseId
        request.instancekey = instancekey
        return this.courseService.updateCourseContent(request)
    }
    @Delete('/deleteContent/:courseId/:contentId')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    deleteContent(@Headers('instancekey') instancekey: string, @Param('courseId') courseId: string, @Param('contentId') contentId: string) {
        return this.courseService.deleteContent({ instancekey, courseId, contentId })
    }
    @Delete('/deleteSection/:courseId/:sectionId')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    deleteSection(@Headers('instancekey') instancekey: string, @Param('courseId') courseId: string, @Param('sectionId') sectionId: string, @Req() req) {
        const userId = req.user._id;
        return this.courseService.deleteSection({ instancekey, courseId, sectionId, userId })
    }
    @Put('/:id/favorite/:contentId')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    addContentFavorite(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Param('contentId') contentId: string, @Req() req) {
        const userId = req.user._id
        return this.courseService.addContentFavorite({ id, contentId, userId, instancekey, activeLocation: req.user.activeLocation })
    }
    @Delete('/:id/favorite/:contentId')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    removeContentFavorite(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Param("contentId") contentId: string, @Req() req) {
        const userId = req.user._id
        return this.courseService.removeContentFavorite({ instancekey, id, contentId, userId });
    }
    @Get('/favorite/course')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getFavoriteCourse(@Headers('instancekey') instancekey: string, @Req() req) {
        return this.courseService.getFavoriteCourse({ instancekey, userId: req.user._id, activeLocation: req.user.activeLocation })
    }
    @Get('/getOngoingClasses/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getOngoingClasses(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req) {
        const data = {
            courseId: id,
            userId: req.user._id,
            role: req.user.roles,
            instancekey: instancekey,
            activeLocation: req.user.activeLocation
        }
        return this.courseService.getOngoingClasses(data)
    }
    @Get('/progress/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getCourseProgress(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req) {
        return this.courseService.getCourseProgress({ instancekey, courseId: id, userId: req.user._id })
    }
    @Get('/:id/userCourse')
    @ApiQuery({ name: 'demoSection', required: false })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getUserCourse(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req, @Query('demoSection') demoSection: string) {
        return this.courseService.getUserCourse({ instancekey, id, userId: req.user._id, demoSection, userRole: req.user.role, activeLocation: req.user.activeLocation })
    }
    @Get('/fetchTeacherAssessment/:id')
    @ApiQuery({ name: 'status' })
    @ApiQuery({ name: 'testMode' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    fetchTeacherAssessments(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Query('status') status: string, @Query('testMode') testMode: string) {
        return this.courseService.fetchTeacherAssessment({ id, status, testMode, instancekey })
    }
    @Get('/getClassesTimeSpent/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getClassesTimeSpent(@Headers('instancekey') instancekey: string, @Param('id') id: string) {
        return this.courseService.getClassesTimeSpent({ id, instancekey })
    }
    @Get('authors')
    getAuthors(@Headers('instancekey') instancekey: string) {
        return this.courseService.getAuthors({ instancekey })
    }
    @Get('/section/:id/report/:studentId')
    @ApiQuery({ name: 'section' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getCourseSectionsReport(@Headers('instancekey') instancekey: string, @Param('id') courseId: string, @Param('studentId') studentId: string, @Query('section') section: string) {
        return this.courseService.getCourseSectionsReport({ courseId, studentId, section, instancekey })
    }
    @Get('/overview/:id/student/:studentId')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'admin', 'operator', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getStudentCourseOverview(@Headers('instancekey') instancekey: string, @Param('id') courseId: string, @Param('studentId') studentId: string) {
        return this.courseService.getStudentCourseOverview({ courseId, studentId, instancekey });
    }
    @Get('/section/:id/status/:studentId')
    @ApiQuery({ name: 'status', required: false })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getCourseSectionByStatus(@Headers('instancekey') instancekey: string, @Query('status') status: string, @Param('id') courseId: string, @Param('studentId') studentId: string) {
        return this.courseService.getCourseSectionByStatus({ instancekey, courseId, studentId, status })
    }
    @Get('/verifyCourseUserProgress/:course')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['student'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    verifyCourseUserProgress(@Headers('instancekey') instancekey: string, @Param('course') courseId: string, @Req() req) {
        const userId = req.user._id
        console.log(userId);
        return this.courseService.verifyCourseUserProgress({ instancekey, courseId, userId })
    }
    @Get('/publicEnrolledCourses/:studentId')
    publicEnrolledCourse(@Headers('instancekey') instancekey: string, @Param('studentId') studentId: string) {
        return this.courseService.publicEnrolledCourse({ instancekey, studentId })
    }
    @Get('/analytics/content/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getCourseContentAnalytics(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req) {
        return this.courseService.getCourseContentAnalytics({ instancekey, id, userId: req.user._id })
    }
    @Get('/subjects/me')
    @ApiQuery({ name: 'excludeEnrolled', required: false })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getCourseSubject(@Headers('instancekey') instancekey: string, @Req() req, @Query('excludeEnrolled') excludeEnrolled: boolean) {
        return this.courseService.getCourseSubject({ instancekey, userId: req.user._id, activeLocation: req.user.activeLocation, userRole: req.user.roles, excludeEnrolled })
    }
    @Get('/student/my-courses/:id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Roles(['student'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiHeader({ name: 'authtoken', required: true })
    getStudentCourses(@Headers('instancekey') instancekey: string, @Query('page') page: number, @Query('limit') limit: number, @Param('id') id: string, @Req() req) {
        return this.courseService.getStudentCourses({ instancekey, userId: req.user._id, userRole: req.user.role, page, limit, id })
    }
    @Get('/teacher/highest-paid-courses')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'title', required: false })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'admin', 'operator', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getTeacherHighestPaidCourses(@Headers('instancekey') instancekey: string, @Req() req, @Query('page') page: number, @Query('limit') limit: number, @Query('title') title: string) {
        return this.courseService.getTeacherHighestPaidCourses({ instancekey, userId: req.user._id, userRole: req.user.roles[0], page, limit, title, activeLocation: req.user.activeLocation })
    }
    @Get('/getPublisherCourse')
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'count', required: false })
    @ApiQuery({ name: 'skip', required: false })
    @ApiQuery({ name: 'title', required: false })
    @Roles(['teacher', 'publisher', 'director', 'student', 'operator'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiHeader({ name: 'authtoken', required: true })
    getPublisherCourse(@Headers('instancekey') instancekey: string, @Query('limit') limit: number,
        @Query('page') page: number, @Query('count') count: number, @Query('title') title: string, @Query('skip') skip: number, @Req() req) {
        return this.courseService.getPublisherCourse({ instancekey, limit, page, count, title, userId: req.user._id, activeLocation: req.user.activeLocation, skip })
    }
    @Get('/userWithoutEnroll/:userId')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['student'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    userWithoutEnroll(@Headers('instancekey') instancekey: string, @Param('userId') userId: string, @Req() req) {
        return this.courseService.userWithoutEnroll({ instancekey, userId })
    }
    @Get('/getCourseMembers/:id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'searchText', required: false })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiHeader({ name: 'authtoken', required: true })
    getCourseMember(@Headers('instancekey') instancekey: string, @Param('id') courseId: string,
        @Query('page') page: number, @Query('limit') limit: number, @Query('searchText') searchText: string) {
        return this.courseService.getCourseMembers({ instancekey, courseId, page, limit, searchText })
    }
    @Get('/teacherCourse/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getTeacherCourse(@Headers('instancekey') instancekey: string, @Param('id') courseId: string) {
        return this.courseService.getTeacherCourse({ instancekey, courseId });
    }
    @Get('/ongoingCourse/me')
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'home', required: false })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getOngoingCourse(@Headers('instancekey') instancekey: string, @Query('limit') limit: number, @Query('home') home: boolean, @Req() req) {
        return this.courseService.getOngoingCourse({ instancekey, limit, home, userId: req.user._id, activeLocation: req.user.activeLocation})
    }

    @Get('/ongoingCourseContent/:courseId')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getOngoingCourseContent(
        @Param('courseId') courseId: string, @Headers('instancekey') instancekey: string, @Req() req) {
        return this.courseService.getOngoingCourseContent({ courseId, instancekey, userId: req.user._id })
    }

    @Post('/editContentInSection/:id/:sectionId')
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiHeader({ name: 'authtoken', required: true })
    editContentInSection(@Headers('instancekey') instancekey: string, @Param('id') courseId: string, @Param('sectionId') sectionId: string, @Body() request: EditContentInSectionRequest, @Req() req) {
        request.instancekey = instancekey;
        request.sectionId = sectionId;
        request.courseId = courseId;
        request.userId = req.user._id
        return this.courseService.editContentInSection(request);
    }
    @Get('/getAllMyCourseProgress/:id')
    @ApiQuery({ name: 'status', required: false })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getAllMyCourseProgress(@Headers('instancekey') instancekey: string, @Param('id') userId: string, @Req() req, @Query('status') status: string) {
        return this.courseService.getAllMyCourseProgress({ instancekey, userId, userRole: req.user.role, status, activeLocation: req.user.activeLocation });
    }

    @Get('/getTeacherCourseDetails/:id')
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiHeader({ name: 'authtoken', required: true })
    getTeacherCourseDetail(@Headers('instancekey') instancekey: string, @Param('id') courseId: string) {
        return this.courseService.getTeacherCourseDetail({ instancekey, courseId })
    }
    @Put('/:id/updateContentTimeSpent')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    updateContentTimeSpent(@Headers('instancekey') instancekey: string, @Param('id') courseId: string, @Body() request: UpdateContentTimeSpentRequest, @Req() req) {
        request.instancekey = instancekey;
        request.courseId = courseId;
        request.userId = req.user._id;
        return this.courseService.updateContentTimeSpent(request)
    }

    @Put('/:id/completeContent')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    completeContent(@Headers('instancekey') instancekey: string, @Param('id') courseId: string, @Body() request: CompleteContentRequest, @Req() req) {
        request.instancekey = instancekey;
        request.courseId = courseId;
        request.userId = req.user._id;
        return this.courseService.completeContent(request)
    }

    @Put('/:id/startContent')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    startContent(@Headers('instancekey') instancekey: string, @Param('id') courseId: string, @Body() request: StartContentRequest, @Req() req: any) {
        request.instancekey = instancekey;
        request.courseId = courseId;
        request.user = req.user;
        return this.courseService.startContent(request)
    }

    @Get('/teacher/my-courses-public/:userId')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getCoursesPublic(
        @Param('userId') userId: string, @Headers('instancekey') instancekey: string,
        @Query('page') page: number, @Query('limit') limit: number
    ) {
        return this.courseService.getCoursesPublic({ userId, instancekey, query: { page, limit } })
    }

    @Get('/teacher/my-courses')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'keyword', required: false })
    @ApiQuery({ name: 'accessMode', required: false })
    @ApiQuery({ name: 'type', required: false })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher', 'student'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getCourses(@Headers('instancekey') instancekey: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('keyword') keyword: string,
        @Query('accessMode') accessMode: string,
        @Query('type') type: string, @Req() req) {
        return this.courseService.getCourses({ instancekey, page, ownLocation: req.user.ownLocation, limit, keyword, accessMode, type, userId: req.user._id, userRole: req.user.roles, userData:req.user })
    }

    @Get('/teacher/my-archived')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getTeacherArchivedCourses(@Headers('instancekey') instancekey: string, @Query('page') page: number, @Query('limit') limit: number, @Req() req) {
        return this.courseService.getTeacherArchivedCourses({ instancekey, page, limit, userId: req.user._id, userRole: req.user.roles, ownLocation: req.user.ownLocation, activeLocation: req.user.activeLocation })
    }

    @Get('/teacher/most-popular-courses')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'title', required: false })
    @ApiQuery({ name: 'accessMode', required: false })
    getTeacherMostPopularCourses(@Headers('instancekey') instancekey: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('title') title: string,
        @Query('accessMode') accessMode: string,
        @Req() req) {
        return this.courseService.getTeacherMostPopularCourses({ page, limit, title, accessMode, instancekey, userRole: req.user.roles, activeLocation: req.user.activeLocation , userId: req.user._id })
    }

    @Get('/bestseller/me')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getBestSellerCourse(@Headers('instancekey') instancekey: string,
        @Query('page') page: number,
        @Query('limit') limit: number, @Req() req) {
        return this.courseService.getBestSellerCourse({ instancekey, page, limit, userId: req.user._id, userRole: req.user.role, activeLocation: req.user.activeLocation })
    }

    @Get('/popular/me')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getPopularCourse(@Headers('instancekey') instancekey: string, @Query('page') page: number, @Query('limit') limit: number, @Req() req) {
        return this.courseService.getPopularCourse({ page, limit, userId: req.user._id, instancekey, userLocation: req.user.location, activeLocation: req.user.activeLocation })
    }

    @Get('/analytics/questionDistribution/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getQuestionDistributionAnalytics(@Headers('instancekey') instancekey: string, @Param('id') referenceId: string, @Req() req) {
        return this.courseService.getQuestionDistributionAnalytics({ instancekey, createdAt: req.user.createdAt, referenceId })
    }

    @Get('/analytics/ranking/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getRankingAnalytics(@Headers('instancekey') instancekey: string, @Param('id') referenceId: string, @Req() req) {
        return this.courseService.getRankingAnalytics({ instancekey, referenceId, userId: req.user._id, createdAt: req.user.createdAt })
    }

    @Get('/getAllTeacherCourses')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getAllTeacherCourses(@Headers('instancekey') instancekey: string, @Query() query: GetAllTeacherCoursesRequest, @Req() req) {
        return this.courseService.getAllTeacherCourses({ instancekey, ...query, user: req.user })
    }

    @Get('/archive')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getArchiveCourses(@Headers('instancekey') instancekey: string, page: number, limit: number, @Req() req) {
        console.log(req.user);

        return this.courseService.getArchiveCourses({ instancekey, page, limit, userId: req.user._id, activeLocation: req.user.activeLocation })
    }

    @Get('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard, RolesGuard)
    getCourseById(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req) {
        return this.courseService.getCourseById({ _id: id, instancekey });
    }

    @Get('/analytics/practiceTime/:id')
    @Roles(['student'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiHeader({ name: 'authtoken', required: true })
    getPracticeTimeAnalytics(@Headers('instancekey') instancekey: string, @Headers('timezoneOffset') timezoneOffset: string, @Param('id') courseId: string, @Query() query: GetPracticeTimeAnalyticsRequest, @Req() req) {
        return this.courseService.getPracticeTimeAnalytics({ instancekey, courseId, timezoneOffset, createdAt: req.user.createdAt, userId: req.user._id, ...query })
    }

    @Get('/analytics/learningTime/:id')
    @Roles(['student'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiHeader({ name: 'authtoken', required: true })
    getLearningTimeAnalytics(@Headers('instancekey') instancekey: string, @Headers('timezoneOffset') timezoneOffset: number, @Query() query: GetLearningTimeAnalyticsRequest, @Param('id') courseId: string, @Req() req) {
        return this.courseService.getLearningTimeAnalytics({ instancekey, timezoneOffset, courseId, ...query, userId: req.user._id })
    }

    @Get('/analytics/completion/:id')
    @Roles(['student'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiHeader({ name: 'authtoken', required: true })
    getCompletionAnalytics(@Headers('instancekey') instancekey: string, @Headers('timezoneOffset') timezoneOffset: number, @Query() query: GetCompletionAnalyticsRequest, @Param('id') courseId: string, @Req() req) {
        return this.courseService.getCompletionAnalytics({ instancekey, timezoneOffset, courseId, ...query, userId: req.user._id })
    }
    @Get('/analytics/accuracy/:id')
    @Roles(['student'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiHeader({ name: 'authtoken', required: true })
    getAccuracyAnalytics(@Headers('instancekey') instancekey: string, @Headers('timezoneOffset') timezoneOffset: number, @Query() query: GetAccuracyAnalyticsRequest, @Param('id') referenceId: string, @Req() req) {
        console.log(referenceId);
        return this.courseService.getAccuracyAnalytics({ instancekey, referenceId, timezoneOffset, userId: req.user._id, activeLocation: req.user.activeLocation, createdAt: req.user.createdAt, ...query });
    }

    @Get('/favorite/me')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getMyFavorite(@Headers('instancekey') instancekey: string, @Query() query: GetMyFavoriteRequest, @Req() req) {
        return this.courseService.getMyFavorite({ instancekey, userId: req.user._id, activeLocation: req.user.activeLocation, ...query })
    }
    @Get('/favorite/subject')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getFavoriteSubjects(@Headers('instancekey') instancekey: string, @Req() req) {
        return this.courseService.getFavoriteSubjects({ instancekey, userId: req.user._id, activeLocation: req.user.activeLocation })
    }

    @Get('/count/me')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    count(@Headers('instancekey') instancekey: string, @Query() query: CountRequest, @Req() req) {
        return this.courseService.count({ instancekey, userId: req.user._id, userRole: req.user.roles, activeLocation: req.user.activeLocation, ...query })
    }

    @Put('/notifyStudentsAfterWithdrawal/:courseId')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'publisher', 'teacher', 'operator', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    notifyStudentsAfterWithdrawal(@Headers('instancekey') instancekey: string, @Param('courseId') courseId: string, @Body() body: NotifyStudentsAfterWithdrawalRequest) {
        return this.courseService.notifyStudentsAfterWithdrawal({ instancekey, courseId, ...body })
    }
    @Get('/attempt/:id/student/:studentId')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getCourseContentAttemptByStudent(@Headers('instancekey') instancekey: string, @Param('id') practiceSetId: string, @Param('studentId') userId: string, @Req() req) {
        return this.courseService.getCourseContentAttemptByStudent({ instancekey, practiceSetId, userId, userRole: req.user.role })
    }
    @Get("/")
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    find(@Headers('instancekey') instancekey: string, @Query() query: FindRequest, @Req() req) {
        return this.courseService.Find({ ...query, instancekey, userId: req.user._id, userRole: req.user.roles, activeLocation: req.user.activeLocation })
    }

    @Put('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateCourse(@Headers('instancekey') instancekey: string, @Body() request: UpdateCourseRequest, @Param('id') id: string, @Req() req) {
        request._id = id;
        request.instancekey = instancekey

        return this.courseService.updateCourse(request);
    }

}
