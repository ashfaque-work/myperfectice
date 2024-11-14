import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { LearningTestService } from './learningTest.service';
import { AuthenticationGuard } from '@app/common/auth';
import { GetNextQuestionLearningTestBody, GetPracticeSetQuery } from '@app/common/dto/question-bank.dto';

@ApiTags('LearningTest')
@Controller('learningTest')
export class LearningTestController {
    constructor(private readonly learningTestService: LearningTestService) { }

    @Get('/getPracticeSet/:id')
    @ApiParam({ name: 'id', description: 'PracticeSet ID' })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getPracticeSet(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Query() query: GetPracticeSetQuery, @Req() req: any) {
        return this.learningTestService.getPracticeSet({ instancekey, id, query, user: req.user });
    }

    @Post('/getQuestion')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getNextQuestionLearningTest(@Headers('instancekey') instancekey: string, @Body() body: GetNextQuestionLearningTestBody, @Req() req: any) {
        return this.learningTestService.getNextQuestionLearningTest({ instancekey, body, user: req.user });
    }
}