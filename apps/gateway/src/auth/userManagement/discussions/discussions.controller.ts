import { Body, Controller, Delete, Get, Header, Headers, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiQuery, ApiTags } from "@nestjs/swagger";
import { DiscussionsService } from "./discussions.service";
import { Roles } from "@app/common/decorators";
import { AuthenticationGuard, RolesGuard } from "@app/common/auth";
import { CreateDiscussionReq, CreateDissRespondBody, PostCommentBody, PostUpdateBody } from "@app/common/dto/userManagement/discussions.dto";

@ApiTags('Discussions')
@Controller('discussions')
export class DiscussionsController {
    constructor(private discussionsService: DiscussionsService) { }

    @Get('/')
    @ApiHeader({ name: 'authtoken' })
    @ApiQuery({ name: 'feedType', required: false })
    @ApiQuery({ name: 'courseContent', required: false })
    @ApiQuery({ name: 'myQuestionsOnly', required: false })
    @ApiQuery({ name: 'flagged', required: false })
    @ApiQuery({ name: 'date', required: false })
    @ApiQuery({ name: 'classes', required: false })
    @ApiQuery({ name: 'publicDiscussion', required: false })
    @ApiQuery({ name: 'text', required: false })
    @ApiQuery({ name: 'tags', required: false })
    @ApiQuery({ name: 'count', required: false })
    @ApiQuery({ name: 'sort', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'skip', required: false })
    @UseGuards(AuthenticationGuard)
    async getDiscussion(@Query('feedType') feedType: string, @Query('courseContent') courseContent: string, @Query('myQuestionsOnly') myQuestionsOnly: string, @Query('flagged') flagged: string, @Query('date') date: string, @Query('classes') classes: string, @Query('publicDiscussion') publicDiscussion: string, @Query('text') text: string, @Query('tags') tags: string, @Query('count') count: boolean, @Query('sort') sort: string, @Query('limit') limit: number, @Query('page') page: number, @Query('skip') skip: number, @Headers('instancekey') instancekey: string, @Req() req: any, @Body() request: any) {
        const combinedData = {
            query: { feedType, courseContent, myQuestionsOnly, flagged, date, classes, publicDiscussion, text, tags, count, sort, limit, page, skip },
            instancekey,
            user: req.user,
            body: { ...request }
        }
        return this.discussionsService.getDiscussion(combinedData);
    }

    @Get('classroom/:id')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @ApiQuery({ name: 'feedType', required: false })
    @ApiQuery({ name: 'courseContent', required: false })
    @ApiQuery({ name: 'count', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'skip', required: false })
    @ApiQuery({ name: 'sort', required: false })
    @UseGuards(AuthenticationGuard)
    async getClassroomPosts(@Param('id') id: string, @Query('feedType') feedType: string, @Query('courseContent') courseContent: string, @Query('count') count: boolean, @Query('limit') limit: number, @Query('page') page: number, @Query('skip') skip: number, @Query('sort') sort: string) {
        const combinedData = {
            id,
            query: { feedType, courseContent, count, limit, page, skip, sort }
        }
        console.log(combinedData);
        return this.discussionsService.getClassroomPosts(combinedData);
    }

    @Get('your-post/:id')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @ApiQuery({ name: 'feedType', required: false })
    @ApiQuery({ name: 'courseContent', required: false })
    @ApiQuery({ name: 'count', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'skip', required: false })
    @ApiQuery({ name: 'sort', required: false })
    @UseGuards(AuthenticationGuard)
    async getYourPosts(@Param('id') id: string, @Query('feedType') feedType: string, @Query('courseContent') courseContent: string, @Query('count') count: boolean, @Query('limit') limit: number, @Query('page') page: number, @Query('skip') skip: number, @Query('sort') sort: string, @Req() req: any) {
        const combinedData = {
            id,
            query: { feedType, courseContent, count, limit, page, skip, sort },
            user: req.user
        }
        console.log(combinedData);
        return this.discussionsService.getYourPosts(combinedData);
    }

    @Get('saved-post/:id')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @ApiQuery({ name: 'feedType', required: false })
    @ApiQuery({ name: 'courseContent', required: false })
    @ApiQuery({ name: 'count', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'skip', required: false })
    @ApiQuery({ name: 'sort', required: false })
    @UseGuards(AuthenticationGuard)
    async getMySavedPosts(@Param('id') id: string, @Query('feedType') feedType: string, @Query('courseContent') courseContent: string, @Query('count') count: boolean, @Query('limit') limit: number, @Query('page') page: number, @Query('skip') skip: number, @Query('sort') sort: string, @Req() req: any) {
        const combinedData = {
            id,
            query: { feedType, courseContent, count, limit, page, skip, sort },
            user: req.user
        }
        console.log(combinedData);
        return this.discussionsService.getMySavedPosts(combinedData);
    }

    @Put('/flag/:id')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async flagDiscussion(@Param('id') id: string) {
        const combinedData = {
            id
        }
        return this.discussionsService.flagDiscussion(combinedData);
    }

    @Put('/unflag/:id')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async unflagDiscussion(@Param('id') id: string) {
        const combinedData = {
            id
        }
        return this.discussionsService.unflagDiscussion(combinedData);
    }

    @Get('/flaggedPosts')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @ApiQuery({ name: 'count', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'page', required: false })
    @Roles(['support', 'admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getFlaggedPost(
        @Query('count') count: boolean, @Query('limit') limit: number,
        @Query('page') page: number, @Req() req: any, @Headers('instancekey') instancekey: string,
    ) {
        return this.discussionsService.getFlaggedPost({ query: { count, limit, page }, user: req.user, instancekey });
    }

    @Get('flaggedPosts/:id')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async getOneFlaggedPost(@Param('id') id: string) {
        const combinedData = {
            id
        }
        return this.discussionsService.getOneFlaggedPost(combinedData)
    }

    @Get('course/:courseId')
    @ApiHeader({ name: 'authtoken' })
    @Roles(['admin', 'centerHead', 'teacher', 'director', 'support', 'operator'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getDiscussionsOfCourse(@Param('courseId') courseId: string, @Query('searchText') searchText: string, @Query('limit') limit: number, @Query('skip') skip: number, @Req() req: any, @Query('lastDays') lastDays: string, @Query('unanswered') unanswered: string, @Query('count') count: number) {
        const combinedData = {
            courseId,
            searchText,
            limit,
            skip,
            user: req.user,
            lastDays,
            unanswered,
            count
        }
        return this.discussionsService.getDiscussionOfCourse(combinedData);
    }

    @Get('/:id')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @ApiQuery({ name: 'loadComments', required: false })
    @UseGuards(AuthenticationGuard)
    async getOne(@Param('id') id: string, @Query('loadComments') loadComments: boolean) {
        const combinedData = {
            id,
            loadComments
        }
        return this.discussionsService.getOne(combinedData);
    }

    @Get('/:id/comments')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async getComments(@Param('id') id: string, @Query('page') page: number, @Req() req: any) {
        const combinedData = {
            id,
            page,
            user: req.user
        }
        return this.discussionsService.getComments(combinedData)
    }

    @Post('/')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async create(@Headers('instancekey') instancekey: string, @Body() request: CreateDiscussionReq, @Req() req: any) {
        return this.discussionsService.create({ body: { ...request }, user: req.user, instancekey });
    }

    @Post('/:id')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async comment(@Param('id') id: string, @Body() request: PostCommentBody, @Req() req: any) {
        const combinedData = {
            id,
            body: { ...request },
            user: req.user
        }
        return this.discussionsService.comment(combinedData);
    }

    @Put('/:id')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async updateDiscussion(@Param('id') id: string, @Body() request: PostUpdateBody, @Req() req: any) {
        const combinedData = {
            id,
            body: { ...request },
            user: req.user
        }
        // console.log("from updagte", combinedData)
        return this.discussionsService.updateDiscussion(combinedData);
    }

    @Put('/:id/vote')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async vote(@Param('id') id: string, @Req() req: any) {
        const combinedData = {
            id,
            user: req.user
        }
        return this.discussionsService.vote(combinedData);
    }

    @Put('/:id/unvote')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async unvote(@Param('id') id: string, @Req() req: any) {
        const combinedData = {
            id,
            user: req.user
        }
        return this.discussionsService.unvote(combinedData);
    }

    @Put('/:id/notvote')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async notvote(@Param('id') id: string, @Req() req: any) {
        const combinedData = {
            id,
            user: req.user
        }
        return this.discussionsService.notvote(combinedData);
    }

    @Put('/:id/undoNotvote')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async undonotvote(@Param('id') id: string, @Req() req: any) {
        const combinedData = {
            id,
            user: req.user
        }
        return this.discussionsService.undonotvote(combinedData);
    }

    @Delete('/:id')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async delete(@Param('id') id: string, @Req() req: any) {
        const combinedData = {
            id,
            user: req.user
        }
        return this.discussionsService.delete(combinedData);
    }

    @Put('savedPost/:id')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async savePost(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req: any) {
        const combinedData = {
            id,
            user: req.user
        }
        return this.discussionsService.savePost(combinedData);
    }

    @Put('unsavedPost/:id')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async unsavedPost(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req: any) {
        const combinedData = {
            id,
            user: req.user
        }
        return this.discussionsService.unsavedPost(combinedData);
    }

    @Post('createDiscussionRespond/:id')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async createDiscussionRespond(@Headers('instace_key') instancekey: string, @Param('id') id: string, @Req() req: any, @Body() request: CreateDissRespondBody) {
        const combinedData = {
            id,
            body: { ...request },
            user: req.user
        }
        return this.discussionsService.createDiscussionRespond(combinedData);
    }

}