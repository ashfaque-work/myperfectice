import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiTags } from "@nestjs/swagger";
import { UserFollowService } from "./userFollow.service";
import { AmIFollowParam, FollowList, FollowListReq, FollowReq } from "@app/common/dto/userFollow.dto";
import { AuthenticationGuard } from "@app/common/auth";

@ApiTags('UserFollow')
@Controller('userFollow')
export class UserFollowController {

    constructor(private userFollowService: UserFollowService) { }

    @Get('amIFollow/:userId')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async amIFollow(@Param() params: AmIFollowParam, @Req() req: any) {
        const combinedData = {
            params,
            user: req.user
        }
        return this.userFollowService.amIFollow(combinedData)
    }

    @Put('follow')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async follow(@Body() request: FollowReq, @Req() req: any) {
        const combinedData = {
            body: { ...request.body },
            user: req.user
        }
        return this.userFollowService.follow(combinedData)
    }

    @Post('followList')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @UseGuards(AuthenticationGuard)
    async followList(@Body() body: FollowList) {
        return this.userFollowService.followList({ body: body });
    }

}
