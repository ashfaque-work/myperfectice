import { Controller, Param, Get, Post, Delete, UseGuards, Headers, Query, Req } from '@nestjs/common';
import { AuthenticationGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { NotifyService } from './notify.service';

@ApiTags('Notify')
@Controller('notification')
export class NotifyController {
    constructor(private notifyService: NotifyService) { }

    @Get('/')
    @ApiQuery({ name: 'isNew', required: false, type: Boolean })
    @ApiQuery({ name: 'notficationType', required: false, type: String })
    @ApiQuery({ name: 'notIn', required: false, type: String })
    @ApiQuery({ name: 'type', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'sort', required: false, type: String })
    @ApiQuery({ name: 'keyword', required: false, type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    index(
        @Req() req: any,
        @Headers('instancekey') instancekey: string,
        @Query('isNew') isNew: string,
        @Query('notficationType') notficationType: string,
        @Query('notIn') notIn: string,
        @Query('type') type: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('sort') sort: string,
        @Query('keyword') keyword: string
    ) {
        return this.notifyService.index({
            instancekey, user: req.user,
            query: {
                isNew: isNew === 'true', notficationType, notIn, type, page, limit, sort, keyword,
            }
        });
    }

    @Get('/countUnread')
    @ApiQuery({ name: 'isNew', required: false, type: Boolean })
    @ApiQuery({ name: 'notficationType', required: false, type: String })
    @ApiQuery({ name: 'notIn', required: false, type: String })
    @ApiQuery({ name: 'type', required: false, type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    countUnread(
        @Req() req: any,
        @Headers('instancekey') instancekey: string,
        @Query('isNew') isNew: string,
        @Query('notficationType') notficationType: string,
        @Query('notIn') notIn: string,
        @Query('type') type: string
    ) {
        return this.notifyService.countUnread({
            instancekey, user: req.user,
            query: { isNew: isNew === 'true', notficationType, notIn, type }
        });
    }

    @Get('/findOne/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    findOne(@Param('id') id: string, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.notifyService.findOne({ _id: id, instancekey, user: req.user });
    }

    @Post('/setReadMsg/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    setReadMsg(@Param('id') id: string, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.notifyService.setReadMsg({ _id: id, instancekey, user: req.user, token: req.headers['authtoken'] });
    }

    @Delete('/removeByUser/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    removeByUser(@Param('id') id: string, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.notifyService.removeByUser({ _id: id, instancekey, user: req.user });
    }

}
