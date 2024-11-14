import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { ObjectIdPipe } from '@app/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackBody, CreateQuestionFeedbackBody, FindAllByMeQuery, FindAllByPracticeQuery, GetQuestionFbQuery, RespondFeedbackBody } from '@app/common/dto/question-bank.dto';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @Get('/find-all-by-practice/:practiceSetId')
    @ApiParam({ name: 'practiceSetId' })
    findAllByPractice(@Headers('instancekey') instancekey: string, @Param('practiceSetId') practiceSetId: string, @Query() query: FindAllByPracticeQuery) {
        return this.feedbackService.findAllByPractice({ instancekey, practiceSetId, query })
    }

    @Get('/summaryByMe')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    summaryByMe(@Headers('instancekey') instancekey: string, @Req() req: any) {
        return this.feedbackService.summaryByMe({ instancekey, user: req.user })
    }

    @Get('/findAllByMe')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'mentor', 'publisher', 'admin', 'centerHead', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    findAllByMe(@Headers('instancekey') instancekey: string, @Query() query: FindAllByMeQuery, @Req() req: any) {
        return this.feedbackService.findAllByMe({ instancekey, query, user: req.user })
    }

    @Get('/question/pendingResponses')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getQuestionFbPendingResponses(@Headers('instancekey') instancekey: string, @Query() query: GetQuestionFbQuery, @Req() req: any) {
        return this.feedbackService.getQuestionFbPendingResponses({ instancekey, query, user: req.user })
    }

    @Get('/getTopFeedbacks/:id')
    @ApiParam({ name: 'id', description: 'Practice ID' })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getTopFeedbacks(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
        return this.feedbackService.getTopFeedbacks({ instancekey, id })
    }

    @Post('/create')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    createFeedback(@Headers('instancekey') instancekey: string, @Body() body: CreateFeedbackBody, @Req() req: any) {
        return this.feedbackService.createFeedback({ instancekey, body, user: req.user, token: req.headers['authtoken'] })
    }

    @Post('/questionFeedback')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    createQuestionFeedback(@Headers('instancekey') instancekey: string, @Body() body: CreateQuestionFeedbackBody, @Req() req: any) {
        return this.feedbackService.createQuestionFeedback({ instancekey, body, user: req.user })
    }

    @Post('/respondFeedback')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    respondFeedback(@Headers('instancekey') instancekey: string, @Body() body: RespondFeedbackBody, @Req() req: any) {
        return this.feedbackService.respondFeedback({ instancekey, body, user: req.user })
    }


}