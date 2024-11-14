import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ArticleService } from "./article.service";
import { CreateArticle, CreateArticleReq, IndexReq, UpdateArticle, UpdateCountBody } from "@app/common/dto/userManagement/article.dto";
import { Roles } from "@app/common/decorators";
import { AuthenticationGuard, RolesGuard } from "@app/common/auth";

@ApiTags('Article')
@Controller('article')
export class ArticleController {
    constructor(private articleService: ArticleService) { }

    @Get('/')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @ApiQuery({name: 'page', required: false})
    @ApiQuery({name: 'limit', required: false})
    @ApiQuery({name: 'sort', required: false})
    @ApiQuery({name: 'contentTypes', required: false})
    @ApiQuery({name: 'searchText', required: false})
    @UseGuards(AuthenticationGuard)
    async index(@Query('page') page: string, @Query('limit') limit: string, @Query('sort') sort: string, @Query('contentTypes') contentTypes: string, @Query('searchText') searchText: string, @Req() req: any) {
        const combinedData: IndexReq = {
            query: {page, limit, sort, contentTypes, searchText},
            user: req.user
        }
        return await this.articleService.index(combinedData)
    }

    @Post('/')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @UseGuards(AuthenticationGuard)
    async create(@Body() request: CreateArticleReq, @Req() req: any) {
        const combinedData = {
            body: {...request.body},
            user: req.user
        }
        return await this.articleService.create(combinedData);
    }

    @Get('findOne/:id')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @UseGuards(AuthenticationGuard)
    async findOne(@Param('id') id: string) {
        const combinedData = {
            id
        }
        return await this.articleService.findOne(combinedData);
    }

    @Put('/:id/vote')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @Roles(['student', 'teacher', 'support', 'mentor', 'centerHead', 'director', 'admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async vote(@Param('id') id: string, @Req() req: any) {
        const combinedData = {
            id,
            user: req.user
        }
        return await this.articleService.vote(combinedData);
    }

    @Put('/:id/unvote')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @Roles(['student', 'teacher', 'support', 'mentor', 'centerHead', 'director', 'admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async unvote(@Param('id') id: string, @Req() req: any) {
        const combinedData = {
            id,
            user: req.user
        }
        return await this.articleService.unvote(combinedData)
    }

    @Put('/:id/notvote')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @Roles(['student', 'teacher', 'support', 'mentor', 'centerHead', 'director', 'admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async notvote(@Param('id') id: string, @Req() req: any) {
        const combinedData = {
            id,
            user: req.user
        }
        return await this.articleService.notvote(combinedData)
    }

    @Put('/:id/undoNotvote')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @Roles(['student', 'teacher', 'support', 'mentor', 'centerHead', 'director', 'admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async undoNotvote(@Param('id') id: string, @Req() req: any) {
        const combinedData = {
            id,
            user: req.user
        }
        return await this.articleService.undoNotvote(combinedData)
    }

    @Put('/:id')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @UseGuards(AuthenticationGuard)
    async update(@Param('id') id: string, @Body() request: UpdateArticle) {
        const combinedData = {
            id,
            body: {...request}
        }
        // console.log(combinedData);
        return await this.articleService.update(combinedData)
    }

    @Put('/updateCount/:id')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @UseGuards(AuthenticationGuard)
    async updateCount(@Param('id') id: string, @Req() req: any, @Body() request: UpdateCountBody) {
        const combinedData = {
            id,
            user: req.user,
            body: {...request}
        }
        return await this.articleService.updateCount(combinedData);
    }

    @Delete('/:id')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @Roles(['student', 'teacher', 'support', 'mentor', 'centerHead', 'director', 'admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async destroy(@Param('id') id: string) {
        const combinedData = {
            id
        }
        return await this.articleService.destroy(combinedData);
    }

}