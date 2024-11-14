import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdaptiveTestService } from './adaptiveTest.service';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { CheckQuestionCountInAdaptiveTestBody, GenerateAdaptiveLearningTestBody, GenerateAdaptiveTestBody, GetFirstQuestionQuery, GetNextQuestionBody } from '@app/common/dto/question-bank.dto';
import { ObjectIdPipe } from '@app/common';
import { AuthenticationGuard } from '@app/common/auth';

@ApiTags('Adaptive Test')
@Controller('adaptiveTest')
export class AdaptiveTestController {
    constructor(private readonly adaptiveTestService: AdaptiveTestService) { }

    @Post('/generateAdaptiveTest')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    generateAdaptiveTest(@Headers('instancekey') instancekey: string, @Body() body: GenerateAdaptiveTestBody, @Req() req: any) {
        return this.adaptiveTestService.generateAdaptiveTest({ instancekey, body, user: req.user })
    }

    @Post('/checkAdaptiveTestQuestionCount')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    checkQuestionCountInAdaptiveTest(@Headers('instancekey') instancekey: string, @Body() body: CheckQuestionCountInAdaptiveTestBody, @Req() req: any) {
        return this.adaptiveTestService.checkQuestionCountInAdaptiveTest({ instancekey, body, user: req.user })
    }

    @Post('/generateAdaptiveLearningTest')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    generateAdaptiveLearningTest(@Headers('instancekey') instancekey: string, @Body() body: GenerateAdaptiveLearningTestBody, @Req() req: any) {
        return this.adaptiveTestService.generateAdaptiveLearningTest({ instancekey, body, user: req.user })
    }

    @Get('/getFirstQuestion')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getFirstQuestion(@Headers('instancekey') instancekey: string, @Query() query: GetFirstQuestionQuery, @Req() req: any) {
        return this.adaptiveTestService.getFirstQuestion({ instancekey, query, user: req.user })
    }

    @Post('/getNextQuestion')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getNextQuestion(@Headers('instancekey') instancekey: string, @Body() body: GetNextQuestionBody, @Req() req: any) {
        return this.adaptiveTestService.getNextQuestion({ instancekey, body, user: req.user })
    }

    @Get('/getAdaptiveTest/:id')
    @ApiParam({ name: 'id', description: 'Practice ID' })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getAdaptiveTest(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
        return this.adaptiveTestService.getAdaptiveTest({ instancekey, id })
    }
}