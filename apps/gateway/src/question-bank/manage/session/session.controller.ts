import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { ObjectIdPipe } from '@app/common';
import { SessionService } from './session.service';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { CreateSessionBody, FilterTestListsQuery, GetSessionsQuery, GetStudentsByPracticeQuery, TestStatusQuery, UpdateSessionBody, UpdateStudentStatusBody } from '@app/common/dto/question-bank.dto';

@ApiTags('Session')
@Controller('session')
export class SessionController {
    constructor(private readonly sessionService: SessionService) { }

    @Get('/filterTestLists')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
    @UseGuards(RolesGuard)
    @UseGuards(AuthenticationGuard)
    filterTestLists(@Headers('instancekey') instancekey: string, @Query() query: FilterTestListsQuery, @Req() req: any) {
        return this.sessionService.filterTestLists({ instancekey, query, user: req.user });
    }

    @Get('/getSessions')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiHeader({ name: 'timezoneoffset', required: true })
    @UseGuards(AuthenticationGuard)
    getSessions(@Headers('instancekey') instancekey: string, @Headers('timezoneoffset') timezoneoffset: string, @Query() query: GetSessionsQuery, @Req() req: any) {
        return this.sessionService.getSessions({ instancekey, timezoneoffset, query, user: req.user });
    }

    @Get('/getSessionById/:session')
    @ApiParam({ name: 'session' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
    @UseGuards(RolesGuard)
    @UseGuards(AuthenticationGuard)
    getSessionById(@Headers('instancekey') instancekey: string, @Param('session', ObjectIdPipe) session: string) {
        return this.sessionService.getSessionById({ instancekey, session });
    }

    @Get('/getSessionDetails/:session')
    @ApiParam({ name: 'session' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
    @UseGuards(RolesGuard)
    @UseGuards(AuthenticationGuard)
    getSessionDetails(@Headers('instancekey') instancekey: string, @Param('session', ObjectIdPipe) session: string) {
        return this.sessionService.getSessionDetails({ instancekey, session });
    }

    @Get('/getPracticesBySession/:session')
    @ApiParam({ name: 'session' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
    @UseGuards(RolesGuard)
    @UseGuards(AuthenticationGuard)
    getPracticesBySession(@Headers('instancekey') instancekey: string, @Param('session', ObjectIdPipe) session: string) {
        return this.sessionService.getPracticesBySession({ instancekey, session });
    }

    @Get('/getStudentsByPractice/:session')
    @ApiParam({ name: 'session' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
    @UseGuards(RolesGuard)
    @UseGuards(AuthenticationGuard)
    getStudentsByPractice(@Headers('instancekey') instancekey: string, @Param('session', ObjectIdPipe) session: string, @Query() query: GetStudentsByPracticeQuery) {
        return this.sessionService.getStudentsByPractice({ instancekey, session, query });
    }

    @Put('/updateStudentStatus/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
    @UseGuards(RolesGuard)
    @UseGuards(AuthenticationGuard)
    updateStudentStatus(@Headers('instancekey') instancekey: string, @Body() body: UpdateStudentStatusBody) {
        return this.sessionService.updateStudentStatus({ instancekey, body });
    }

    @Get('/testStatus/:practiceId')
    @ApiParam({ name: 'practiceId' })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    testStatus(@Headers('instancekey') instancekey: string, @Param('practiceId', ObjectIdPipe) practiceId: string, @Query() query: TestStatusQuery) {
        return this.sessionService.testStatus({ instancekey, practiceId, query });
    }

    @Post('/')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
    @UseGuards(RolesGuard)
    @UseGuards(AuthenticationGuard)
    createSession(@Headers('instancekey') instancekey: string, @Body() body: CreateSessionBody, @Req() req: any) {
        return this.sessionService.createSession({ instancekey, body, user: req.user });
    }
    
    @Put('/:id')
    @ApiParam({ name: 'id' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'mentor', 'publisher', 'admin', 'operator', 'centerHead', 'director', 'support'])
    @UseGuards(RolesGuard)
    @UseGuards(AuthenticationGuard)
    updateSession(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Body() body: UpdateSessionBody, @Req() req: any) {
        return this.sessionService.updateSession({ instancekey, id, body, user: req.user });
    }
}