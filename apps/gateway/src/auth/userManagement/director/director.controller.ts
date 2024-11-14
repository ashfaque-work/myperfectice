import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiQuery, ApiTags } from "@nestjs/swagger";
import { DirectorService } from "./director.service";
import { AuthenticationGuard } from "@app/common/auth";

@ApiTags('Director')
@Controller('director')
export class DirectorController {
    constructor(private directorService: DirectorService) {}

    @Get('summary/:id')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @ApiQuery({name: 'passingYear', required: false})
    @UseGuards(AuthenticationGuard)
    async getDashboardSummary(@Param('id') id: string, @Query('passingYear') passingYear: string) {
        const combinedData = {
            id,
            passingYear
        }
        return this.directorService.getDashboardSummary(combinedData)
    }

    @Get('logintrendbyclassroom/:id')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @ApiQuery({name: 'passingYear', required: false})
    @UseGuards(AuthenticationGuard)
    async getLoginTrendByClassroom(@Param('id') id: string, @Query('passingYear') passingYear: string) {
        const combinedData = {
            id,
            passingYear
        }
        return this.directorService.getLoginTrendByClassroom(combinedData)
    }

    @Get('postTrendByLocation/:id')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @ApiQuery({name: 'passingYear', required: false})
    @UseGuards(AuthenticationGuard)
    async getPostTrendByLocation(@Param('id') id: string, @Query('passingYear') passingYear: string) {
        const combinedData = {
            id,
            passingYear
        }
        return this.directorService.getPostTrendByLocation(combinedData);
    }

    @Get('mostattemptedstudent/:id')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @ApiQuery({name: 'passingYear', required: false})
    @UseGuards(AuthenticationGuard)
    async getMostAttemptedStudent(@Param('id') id: string, @Query('passingYear') passingYear: string) {
        const combinedData = {
            id,
            passingYear
        }
        return this.directorService.getMostAttemptedStudent(combinedData);
    }

    @Get('questionaddedtrend/:id')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @UseGuards(AuthenticationGuard)
    async getQuestionAddedTrend(@Param('id') id: string) {
        const combinedData = {
            id,
        }
        return this.directorService.getQuestionAddedTrend(combinedData);
    }

    @Get('attemptTrend/:locId')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @ApiQuery({name: 'days', required: false})
    @ApiQuery({name: 'passingYear', required: false})
    @UseGuards(AuthenticationGuard)
    async getAttemptTrend(@Param('locId') locId: string, @Query('days') days: string, @Query('passingYear') passingYear: string) {
        const combinedData = {
            locId,
            days,
            passingYear
        }
        return this.directorService.getAttemptTrend(combinedData);
    }

    @Get('abandonedTrend/:locId')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @ApiQuery({name: 'days', required: false})
    @ApiQuery({name: 'passingYear', required: false})
    @UseGuards(AuthenticationGuard)
    async getAbandonedAttemptTrend(@Param('locId') locId: string, @Query('days') days: string, @Query('passingYear') passingYear: string) {
        const combinedData = {
            locId,
            days,
            passingYear
        }
        return this.directorService.getAbandonedAttemptTrend(combinedData);
    }

    @Get('avgtimespentbycoursetrend/:id')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @ApiQuery({name: 'passingYear', required: false})
    @ApiQuery({name: 'subject', required: false})
    @UseGuards(AuthenticationGuard)
    async getAvgTimeSpendByCourse(@Param('id') id: string, @Query('passingYear') passingYear: string, @Query('subject') subject: string) {
        const combinedData = {
            id,
            passingYear,
            subject
        }
        return this.directorService.getAvgTimeSpendByCourse(combinedData)
    }

    @Get('/studentOnboardingDistribution/:id')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @ApiQuery({name: 'passingYear', required: false})
    @UseGuards(AuthenticationGuard)
    async getStudentOnboardingDistribution(@Param('id') id: string, @Query('passingYear') passingYear: string){
        const combinedData = {
            id,
            passingYear
        }
        return this.directorService.getStudentOnboardingDistribution(combinedData);
    }

    @Get('testseriesAttemptTrendBySubject/:locId')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @ApiQuery({name: 'subject', required: false})
    @ApiQuery({name: 'passingYear', required: false})
    @ApiQuery({name: 'days', required: false})
    @UseGuards(AuthenticationGuard)
    async getTestSeriesAttemptTrendBySubject(@Param('locId') locId: string, @Query('subject') subject: string, @Query('passingYear') passingYear: string, @Query('days') days: string) {
        const combinedData = {
            locId,
            subject,
            passingYear,
            days
        }
        return this.directorService.getTestSeriesAttemptTrendBySubject(combinedData);
    }
}