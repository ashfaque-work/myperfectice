import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PublisherService } from "./publisher.service";
import { AuthenticationGuard } from "@app/common/auth";

@ApiTags('Publisher')
@Controller('publisher')
export class PublisherController {
    constructor(private publisherService: PublisherService) {}

    @Post('/')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async indexPublisher(@Headers('instancekey') instancekey: string, @Req() req: any) {
        const combinedData = {
            user: req.user,
            instancekey
        }
        return this.publisherService.indexPublisher(combinedData);
    }

    @Get('/getSoldData/:userId')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    @ApiQuery({name: 'interval', required: false})
    async getSoldData(@Param('userId') userId: string, @Query('interval') interval: string, @Headers('instancekey') instancekey: string) {
        const combinedData = {
            userId,
            interval,
            instancekey
        }
        return this.publisherService.getSoldData(combinedData)
    }

    @Get('getCourseSubjectDistribution/:userId')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async getCourseSubjectDistribution(@Headers('instancekey') instancekey: string, @Param('userId') userId: string) {
        const combinedData = {
            userId,
            instancekey
        }
        return this.publisherService.getCourseSubjectDistribution(combinedData)
    }

    @Get('getTestseriesSubjectDistribution/:userId')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async getTestseriesSubjectDistribution(@Headers('instancekey') instancekey: string, @Param('userId') userId: string) {
        const combinedData = {
            userId,
            instancekey
        }
        return this.publisherService.getTestseriesSubjectDistribution(combinedData)
    }

    @Get('getAssessmetSubjectDistribution/:userId')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async getAssessmetSubjectDistribution(@Headers('instancekey') instancekey: string, @Param('userId') userId: string) {
        const combinedData = {
            userId,
            instancekey
        }
        return this.publisherService.getAssessmetSubjectDistribution(combinedData)
    }

    @Get('getQuestionSubjectDistribution/:userId')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async getQuestionSubjectDistribution(@Headers('instancekey') instancekey: string, @Param('userId') userId: string) {
        const combinedData = {
            userId,
            instancekey
        }
        return this.publisherService.getQuestionSubjectDistribution(combinedData)
    }

    @Get('testseriesTrend/:userId')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async testSeriesTrend(@Headers('instancekey') instancekey: string, @Param('userId') userId: string, @Query('dateFilter') dateFilter: string) {
        const combinedData = {
            userId,
            instancekey,
            dateFilter
        }
        return this.publisherService.testSeriesTrend(combinedData)
    }

    @Get('courseTrend/:userId')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async courseTrend(@Headers('instancekey') instancekey: string, @Param('userId') userId: string, @Query('dateFilter') dateFilter: string) {
        const combinedData = {
            userId,
            instancekey,
            dateFilter
        }
        return this.publisherService.courseTrend(combinedData)
    }

    @Get('asessmentTrend/:userId')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async asessmentTrend(@Headers('instancekey') instancekey: string, @Param('userId') userId: string, @Query('dateFilter') dateFilter: string) {
        const combinedData = {
            userId,
            instancekey,
            dateFilter
        }
        return this.publisherService.asessmentTrend(combinedData)
    }

    @Get('getTransactionLogs/:userId')
    @ApiHeader({name: 'authtoken'})
    @ApiQuery({name: 'page', required: false})
    @ApiQuery({name: 'limit', required: false})
    @ApiQuery({name: 'course', required: false})
    @ApiQuery({name: 'testseries', required: false})
    @ApiQuery({name: 'practice', required: false})
    @ApiQuery({name: 'title', required: false})
    @ApiQuery({name: 'count', required: false})
    @UseGuards(AuthenticationGuard)
    async getTransactionLogs(@Headers('instancekey') instancekey: string, @Param('userId') userId: string, @Query('page') page: number, @Query('limit') limit: number, @Query('course') course: string, @Query('testseries') testseries: string, @Query('practice') practice: string, @Query('title') title: string, @Query('count') count: number) {
        const combinedData = {
            instancekey,
            userId,
            page,
            limit,
            course,
            testseries,
            practice,
            title,
            count
        }
        return this.publisherService.getTransactionLogs(combinedData);
    }
}