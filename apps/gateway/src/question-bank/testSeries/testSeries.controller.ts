import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { TestSeriesService } from './testSeries.service';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { Controller, Headers, Get, UseGuards, Query, Req, Ip, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { AddTestBody, BoughtTestSeriesByOthersQuery, CountPackagesQuery, CreateTestseriesBody, FindQuery, GetBestSellerQuery, GetFavoriteTsQuery, GetMyTestSeriesQuery, GetPackageAttemptCountQuery, GetPublicListingQuery, GetPublisherTestseriesQuery, GetSubjectsQuery, GetTeacherHighestPaidQuery, GetTeacherMostPopularQuery, LevelStatusOfPackageQuery, PercentAccuracyTestseriesQuery, PercentCompleteTestseriesQuery, PracticeHoursTestSeriesQuery, RecommendedTestSeriesQuery, RemoveClassroomBody, RemoveTestBody, SearchForMarketPlaceQuery, SummaryPackagesByStudentQuery, SummaryPackagesByTeacherQuery, SummaryPackagesQuery, TeacherCountPackagesQuery, UpdateTestOrderBody, UpdateTestseriesBody } from '@app/common/dto/question-bank.dto';
import { ObjectIdPipe } from '@app/common';

@ApiTags('TestSeries')
@Controller('testSeries')
export class TestSeriesController {
    constructor(private readonly testSeriesService: TestSeriesService) { }

    @Get('/find')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'mentor', 'admin', 'support', 'centerHead', 'director', 'operator', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    find(@Headers('instancekey') instancekey: string, @Query() query: FindQuery, @Req() req: any, @Ip() ip: string) {
        return this.testSeriesService.find({ instancekey, query, user: req.user, ip });
    }

    @Get('/public')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getPublicListing(@Headers('instancekey') instancekey: string, @Query() query: GetPublicListingQuery, @Ip() ip: string) {
        return this.testSeriesService.getPublicListing({ instancekey, query, ip });
    }

    @Get('/summary/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    summaryTestseries(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any, @Ip() ip: string) {
        return this.testSeriesService.summaryTestseries({ instancekey, id, ip, user: req.user });
    }

    @Get('/attemptedTests/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getAttemptedTestsOfTestseries(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
        return this.testSeriesService.getAttemptedTestsOfTestseries({ instancekey, id, user: req.user });
    }

    @Get('/public/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getTestseriesPublic(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any, @Ip() ip: string) {
        return this.testSeriesService.getTestseriesPublic({ instancekey, id, user: req.user, ip });
    }

    @Get('/summaryPackages')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    summaryPackages(@Headers('instancekey') instancekey: string, @Query() query: SummaryPackagesQuery, @Req() req: any, @Ip() ip: string) {
        return this.testSeriesService.summaryPackages({ instancekey, query, user: req.user, ip });
    }

    @Get('/countPackages')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    countPackages(@Headers('instancekey') instancekey: string, @Query() query: CountPackagesQuery, @Req() req: any) {
        return this.testSeriesService.countPackages({ instancekey, query, user: req.user });
    }

    @Get('/student/countPackages')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    studentCountPackages(@Headers('instancekey') instancekey: string, @Query() query: CountPackagesQuery, @Req() req: any) {
        return this.testSeriesService.countPackages({ instancekey, query, user: req.user });
    }

    @Get('/summaryPackagesByStudent')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    summaryPackagesByStudent(@Headers('instancekey') instancekey: string, @Query() query: SummaryPackagesByStudentQuery, @Req() req: any, @Ip() ip: string) {
        return this.testSeriesService.summaryPackagesByStudent({ instancekey, query, user: req.user, ip });
    }

    @Get('/recommendedTestSeries')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    recommendedTestSeries(@Headers('instancekey') instancekey: string, @Query() query: RecommendedTestSeriesQuery, @Req() req: any, @Ip() ip: string) {
        return this.testSeriesService.recommendedTestSeries({ instancekey, query, user: req.user, ip });
    }

    @Get('/boughtTestSeriesByOthers')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    boughtTestSeriesByOthers(@Headers('instancekey') instancekey: string, @Query() query: BoughtTestSeriesByOthersQuery, @Req() req: any, @Ip() ip: string) {
        return this.testSeriesService.boughtTestSeriesByOthers({ instancekey, query, user: req.user, ip });
    }

    @Get('/boughtTestSeriesByMe')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getMyTestSeries(@Headers('instancekey') instancekey: string, @Query() query: GetMyTestSeriesQuery, @Req() req: any) {
        return this.testSeriesService.getMyTestSeries({ instancekey, query, user: req.user });
    }

    @Get('/authors')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getAuthors(@Headers('instancekey') instancekey: string, @Req() req: any) {
        return this.testSeriesService.getAuthors({ instancekey, user: req.user });
    }

    @Get('/subjects')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getSubjects(@Headers('instancekey') instancekey: string, @Query() query: GetSubjectsQuery, @Req() req: any) {
        return this.testSeriesService.getSubjects({ instancekey, query, user: req.user });
    }

    @Get('/teacher/mostPopular')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'support', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getTeacherMostPopular(@Headers('instancekey') instancekey: string, @Query() query: GetTeacherMostPopularQuery, @Req() req: any, @Ip() ip: string) {
        return this.testSeriesService.getTeacherMostPopular({ instancekey, query, user: req.user, ip });
    }

    @Get('/teacher/highestPaid')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'support', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getTeacherHighestPaid(@Headers('instancekey') instancekey: string, @Query() query: GetTeacherHighestPaidQuery, @Req() req: any, @Ip() ip: string) {
        return this.testSeriesService.getTeacherHighestPaid({ instancekey, query, user: req.user, ip });
    }

    @Get('/teacher/summary/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'support', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    teacherSummaryTestseries(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any, @Ip() ip: string) {
        return this.testSeriesService.teacherSummaryTestseries({ instancekey, id, user: req.user, ip });
    }

    @Get('/levelStatusOfPackage/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    levelStatusOfPackage(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: LevelStatusOfPackageQuery, @Req() req: any) {
        return this.testSeriesService.levelStatusOfPackage({ instancekey, id, query, user: req.user });
    }

    @Get('/packageHasLevel/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    packageHasLevel(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
        return this.testSeriesService.packageHasLevel({ instancekey, id });
    }

    @Get('/ongoingClasses/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getOngoingClasses(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
        return this.testSeriesService.getOngoingClasses({ instancekey, id, user: req.user });
    }

    @Get('/summaryPackagesByTeacher')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    summaryPackagesByTeacher(@Headers('instancekey') instancekey: string, @Query() query: SummaryPackagesByTeacherQuery, @Req() req: any) {
        return this.testSeriesService.summaryPackagesByTeacher({ instancekey, query, user: req.user });
    }

    @Get('/teacher/countPackages')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    teacherCountPackages(@Headers('instancekey') instancekey: string, @Query() query: TeacherCountPackagesQuery, @Req() req: any) {
        return this.testSeriesService.teacherCountPackages({ instancekey, query, user: req.user });
    }

    @Get('/getPackageAttemptCount')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getPackageAttemptCount(@Headers('instancekey') instancekey: string, @Query() query: GetPackageAttemptCountQuery, @Req() req: any) {
        return this.testSeriesService.getPackageAttemptCount({ instancekey, query, user: req.user });
    }

    @Get('/getByPractice/:practice')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getTestByPractice(@Headers('instancekey') instancekey: string, @Param('practice', ObjectIdPipe) practice: string) {
        return this.testSeriesService.getTestByPractice({ instancekey, practice });
    }

    @Get('/getTotalStudent/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getTotalStudent(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
        return this.testSeriesService.getTotalStudent({ instancekey, id });
    }

    @Get('/favorites')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getFavoriteTs(@Headers('instancekey') instancekey: string, @Query() query: GetFavoriteTsQuery, @Req() req: any, @Ip() ip: string) {
        return this.testSeriesService.getFavoriteTs({ instancekey, query, user: req.user, ip });
    }

    @Get('/getPublisherTestseries')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'teacher', 'director', 'publisher', 'student', 'operator'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getPublisherTestseries(@Headers('instancekey') instancekey: string, @Query() query: GetPublisherTestseriesQuery, @Req() req: any) {
        return this.testSeriesService.getPublisherTestseries({ instancekey, query, user: req.user });
    }

    @Post('/')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'support', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    createTestseries(@Headers('instancekey') instancekey: string, @Body() body: CreateTestseriesBody, @Req() req: any) {
        return this.testSeriesService.createTestseries({ instancekey, body, user: req.user });
    }

    @Put('/addfavorite/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    addFavorite(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
        return this.testSeriesService.addFavorite({ instancekey, id, user: req.user });
    }

    @Put('/publish/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'support', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    publish(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
        return this.testSeriesService.publish({ instancekey, id, user: req.user });
    }

    @Put('/revoke/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'support', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    revoke(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
        return this.testSeriesService.revoke({ instancekey, id, user: req.user });
    }

    @Put('/:id/addTest')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'support', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    addTest(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Body() body: AddTestBody, @Req() req: any) {
        return this.testSeriesService.addTest({ instancekey, id, user: req.user, body });
    }

    @Put('/:id/removeTest')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'support', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    removeTest(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Body() body: RemoveTestBody, @Req() req: any) {
        return this.testSeriesService.removeTest({ instancekey, id, user: req.user, body });
    }

    @Put('/:id/testOrder')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['support', 'teacher', 'operator', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateTestOrder(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Body() body: UpdateTestOrderBody) {
        return this.testSeriesService.updateTestOrder({ instancekey, id, body });
    }

    @Put('/:id/removeClassroom')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['support', 'teacher', 'operator', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    removeClassroom(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Body() body: RemoveClassroomBody) {
        return this.testSeriesService.removeClassroom({ instancekey, id, body });
    }

    @Put('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['support', 'teacher', 'operator', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateTestseries(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Body() body: UpdateTestseriesBody, @Req() req: any) {
        return this.testSeriesService.updateTestseries({ instancekey, id, body, user: req.user });
    }

    @Delete('/removefavorite/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    removeFavorite(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
        return this.testSeriesService.removeFavorite({ instancekey, id, user: req.user });
    }

    @Delete('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'admin', 'support', 'centerHead', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    deleteTestseries(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
        return this.testSeriesService.deleteTestseries({ instancekey, id, user: req.user });
    }

    // analaytics
    @Get('/getStudentRank/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getStudentRank(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
        return this.testSeriesService.getStudentRank({ instancekey, id });
    }
        
    @Get('/percentCompleteTestseries/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    percentCompleteTestseries(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: PercentCompleteTestseriesQuery, @Req() req: any) {
        return this.testSeriesService.percentCompleteTestseries({ instancekey, query, id, user: req.user });
    }
        
    @Get('/percentAccuracyTestseries/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    percentAccuracyTestseries(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: PercentAccuracyTestseriesQuery, @Req() req: any) {
        return this.testSeriesService.percentAccuracyTestseries({ instancekey, query, id, user: req.user });
    }
        
    @Get('/practiceHoursTestSeries/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    practiceHoursTestSeries(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: PracticeHoursTestSeriesQuery, @Req() req: any) {
        return this.testSeriesService.practiceHoursTestSeries({ instancekey, query, id, user: req.user });
    }
        
    @Get('/assesmentWiseMarksTestSeries/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    assesmentWiseMarksTestSeries(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
        return this.testSeriesService.assesmentWiseMarksTestSeries({ instancekey, id, user: req.user });
    }
        
    @Get('/questionCategoryTestSeries/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    questionCategoryTestSeries(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
        return this.testSeriesService.questionCategoryTestSeries({ instancekey, id, user: req.user });
    }
        
    @Get('/subjectWiseMarksTestSeries/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    subjectWiseMarksTestSeries(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Req() req: any) {
        return this.testSeriesService.subjectWiseMarksTestSeries({ instancekey, id, user: req.user });
    }
        
    @Get('/searchForMarketPlace')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    searchForMarketPlace(@Headers('instancekey') instancekey: string, @Query() query: SearchForMarketPlaceQuery) {
        return this.testSeriesService.searchForMarketPlace({ instancekey, query});
    }
    
    @Get('/bestSeller')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getBestSeller(@Headers('instancekey') instancekey: string, @Query() query: GetBestSellerQuery, @Req() req: any, @Ip() ip: string) {
        return this.testSeriesService.getBestSeller({ instancekey, query, user: req.user, ip});
    }

}