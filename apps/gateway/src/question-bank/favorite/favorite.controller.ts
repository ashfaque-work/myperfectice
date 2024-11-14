import { Body, Controller, Delete, Get, Headers, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { ObjectIdPipe } from '@app/common';
import { FavoriteService } from './favorite.service';
import { CountByMeQuery, CreateFavoriteBody, FindAllPracticesQuery } from '@app/common/dto/question-bank.dto';
import { AuthenticationGuard } from '@app/common/auth';

@ApiTags('Favorite')
@Controller('favorite')
export class FavoriteController {
    constructor(private readonly favoriteService: FavoriteService) { }

    @Get('/practices')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    findAllPractices(@Headers('instancekey') instancekey: string, @Query() query: FindAllPracticesQuery, @Req() req: any) {
        return this.favoriteService.findAllPractices({ instancekey, query, user: req.user })
    }

    @Get('/findByPractice/:practice')
    @ApiParam({ name: 'practice' })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    findByPractice(@Headers('instancekey') instancekey: string, @Param('practice', ObjectIdPipe) practice: string, @Req() req: any) {
        return this.favoriteService.findByPractice({ instancekey, practice, user: req.user })
    }

    @Get('/count-practices')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    countByMe(@Headers('instancekey') instancekey: string, @Query() query: CountByMeQuery, @Req() req: any) {
        return this.favoriteService.countByMe({ instancekey, query, user: req.user })
    }

    @Post('/create')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    createFavorite(@Headers('instancekey') instancekey: string, @Body() body: CreateFavoriteBody, @Req() req: any) {
        return this.favoriteService.createFavorite({ instancekey, body, user: req.user })
    }

    @Delete('/deleteMe/:practiceSet')
    @ApiParam({ name: 'practiceSet' })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    destroyByUser(@Headers('instancekey') instancekey: string, @Param('practiceSet', ObjectIdPipe) practiceSet: string, @Req() req: any) {
        return this.favoriteService.destroyByUser({ instancekey, practiceSet, user: req.user })
    }
}