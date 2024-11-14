import { Body, Controller, Param, Get, Post, Put, Delete, UseGuards, Query, Headers, Req } from '@nestjs/common';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { TopicService } from './topic.service';
import { TopicRequest, UpdateTopicRequest, UpdateTopicStatusRequest } from '@app/common/dto/administration/topic.dto';

@ApiTags('Topic')
@Controller('topics')
export class TopicController {
    constructor(private topicService: TopicService) { }

    @Post('create')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support', 'teacher', 'director', 'operator', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    createTopic(@Body() request: TopicRequest, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.topicService.createTopic({ ...request, user: req.user, instancekey });
    }

    @Get('/')
    @ApiQuery({ name: 'id', required: false, description: 'Filter topic by id', type: String })
    @ApiQuery({ name: 'units', required: false, description: 'Filter topic by unit', type: String })
    @ApiQuery({ name: 'active', required: false, description: 'Filter topic by status', type: Boolean })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getTopic(
        @Query('id') id: string,
        @Query('units') units: string,
        @Query('active') active: boolean,
        @Headers('instancekey') instancekey: string
    ) {
        return this.topicService.getTopic({ id, units, active, instancekey });
    }


    @Put('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support', 'teacher', 'director', 'operator', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateTopic(@Param('id') id: string, @Body() request: UpdateTopicRequest, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.topicService.updateTopic({ ...request, _id: id, user: req.user, instancekey });
    }

    @Put('/updateStatus/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support', 'teacher', 'director', 'operator', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateTopicStatus(@Param('id') id: string, @Body() request: UpdateTopicStatusRequest, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.topicService.updateTopicStatus({ ...request, _id: id, user: req.user, instancekey });
    }

    @Delete('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support', 'teacher', 'director', 'operator', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    deleteTopic(@Param('id') id: string, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.topicService.deleteTopic({ _id: id, user: req.user, instancekey });
    }

    @Get('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getOneTopic(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.topicService.getOneTopic({ _id: id, instancekey });
    }

    @Get('/slugfly/:slug')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: 'unit', required: false, description: 'Filter topic by unit', type: String })
    getTopicBySlug(
        @Param('slug') slug: string,
        @Query('unit') unit: string,
        @Headers('instancekey') instancekey: string) {
        return this.topicService.getTopicBySlug({ slug, unit, instancekey });
    }

    @Get('/byUnit/:unitId')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'searchText', required: false })
    @UseGuards(AuthenticationGuard)
    getTopicByUnit(
        @Param('unitId') unitId: string,
        @Headers('instancekey') instancekey: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('searchText') searchText?: string
    ) {
        return this.topicService.getTopicByUnit({ unitId, instancekey, page, limit, searchText });
    }
}
