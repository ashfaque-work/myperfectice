import { Body, Controller, Get, Headers, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiQuery, ApiTags } from "@nestjs/swagger";
import { InstituteService } from "./institute.service";
import { Roles } from "@app/common/decorators";
import { AuthenticationGuard, RolesGuard } from "@app/common/auth";
import { ChangeActiveInstituteBody, CreateInstituteBody, InviteToJoinBody, JoinInstituteBody, LeaveInstituteBody, UpdateInstituteBody, UpdateInstitutePreferencesBody, UpdateInstitutePreferncesReq } from "@app/common/dto/userManagement/institute.dto";

@ApiTags('Institute')
@Controller('institute')
export class InstituteController {
    constructor(private instituteService: InstituteService) { }

    @Get('mine')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async getMyInstitutes(@Headers('instancekey') instancekey: string, @Req() req: any) {
        return this.instituteService.getMyInstitutes({ user: req.user, instancekey });
    }

    @Get('myOwn')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async getMyOwnInstitute(@Headers('instancekey') instancekey: string, @Req() req: any) {
        const combinedData = {
            user: req.user
        }
        return this.instituteService.getMyOwnInstitute(combinedData);
    }

    @Get('getAllLocations')
    @ApiHeader({ name: 'authtoken' })
    @Roles(['publisher', 'teacher', 'director', 'admin', 'operator', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getAllLocations(@Headers('instancekey') instancekey: string, @Req() req: any) {
        const combinedData = {
            user: req.user
        }
        return this.instituteService.getAllLocations(combinedData);
    }

    @Get('/:id')
    @ApiHeader({ name: 'authtoken' })
    @ApiQuery({ name: 'programs', required: false, type: Boolean })
    @ApiQuery({ name: 'subjects', required: false, type: Boolean })
    @ApiQuery({ name: 'teachers', required: false, type: Boolean })
    @ApiQuery({ name: 'preferencesOnly', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    async getInstitute(
        @Headers('instancekey') instancekey: string, @Param('id') id: string,
        @Query('programs') programs: string, @Query('subjects') subjects: string,
        @Query('teachers') teachers: string, @Query('preferencesOnly') preferencesOnly: string
    ) {
        return this.instituteService.getInstitute(
            {
                instancekey, id,
                query: {
                    programs: programs === 'true', subjects: subjects === 'true',
                    teachers: teachers === 'true', preferencesOnly: preferencesOnly === 'true'
                }
            }
        );
    }

    @Get('/:id/profilePrograms')
    @ApiHeader({ name: 'authtoken' })
    @ApiQuery({ name: 'name', required: false })
    @ApiQuery({ name: 'country', required: false })
    @Roles(['director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    async getProfilePrograms(@Headers('instancekey') instancekey: string, @Req() req: any, @Query('country') country: string, @Query('name') name: string, @Param('id') id: string) {
        const combinedData = {
            id,
            user: req.user,
            query: { country, name }
        }
        return this.instituteService.getProfilePrograms(combinedData);
    }

    @Get('checkAvailability/:code')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async checkAvailibility(@Headers('instancekey') instancekey: string, @Req() req: any, @Param('code') code: string) {
        const combinedData = {
            user: req.user,
            code
        }
        return this.instituteService.checkAvailibility(combinedData);
    }

    @Get('publicProfile/:id')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async getPublicProfile(@Headers('instancekey') instancekey: string, @Req() req: any, @Param('id') id: string) {
        const combinedData = {
            id,
            user: req.user
        }
        return this.instituteService.getPublicProfile(combinedData);
    }

    @Get('getInstituteInvitees/:id')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async getInstituteInvitees(@Headers('instancekey') instancekey: string, @Req() req: any, @Param('id') id: string) {
        const combinedData = {
            id,
            user: req.user
        }
        return this.instituteService.getInstituteInvitees(combinedData);
    }

    @Post('/')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async createInstitute(@Body() request: CreateInstituteBody, @Req() req: any, @Headers('instacne_key') instancekey: string) {
        const combinedData = {
            body: { ...request },
            user: req.user,
            instancekey, token: req.headers['authtoken']
        }
        return this.instituteService.createInstitute(combinedData);
    }

    @Post('/join')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async joinInstitute(@Body() request: JoinInstituteBody, @Req() req: any, @Headers('instancekey') instancekey: string) {
        const combinedData = {
            body: { ...request },
            user: req.user,
            instancekey, token: req.headers['authtoken']
        }
        return this.instituteService.joinInstitute(combinedData);
    }

    @Post('/leave')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async leaveInstitute(@Body() request: LeaveInstituteBody, @Req() req: any, @Headers('instancekey') instancekey: string) {
        const combinedData = {
            body: { ...request },
            user: req.user,
            instancekey, token: req.headers['authtoken']
        }
        return this.instituteService.leaveInstitute(combinedData);
    }

    @Post('/setDefault')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async setDefault(@Headers('instancekey') instancekey: string, @Req() req: any) {
        return this.instituteService.setDefault({ user: req.user, instancekey, token: req.headers['authtoken'] });
    }

    @Post('/inviteToJoin/:id')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async inviteToJoin(@Body() request: InviteToJoinBody, @Req() req: any, @Param('id') id: string, @Headers('instancekey') instancekey: string) {
        const combinedData = {
            id,
            body: { ...request },
            user: req.user,
            instancekey
        }
        return this.instituteService.inviteToJoin(combinedData);
    }

    @Put('/changeActiveInstitute')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async changeActiveInstitute(@Body() request: ChangeActiveInstituteBody, @Req() req: any, @Headers('instancekey') instancekey: string) {
        const combinedData = {
            body: { ...request },
            user: req.user,
            instancekey, token: req.headers['authtoken']
        }
        return this.instituteService.changeActiveInstitute(combinedData);
    }

    @Put('/:id')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async updateInstitute(@Body() request: UpdateInstituteBody, @Req() req: any, @Headers('instancekey') instancekey: string, @Param('id') id: string) {
        const combinedData = {
            body: { ...request },
            user: req.user,
            instancekey,
            id
        }
        return this.instituteService.updateInstitute(combinedData);
    }

    @Put('updateInstitutePrefernces/:id')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    async updateInstitutePrefernces(@Body() request: UpdateInstitutePreferencesBody, @Param('id') id: string, @Headers('instancekey') instancekey: string, @Req() req: any) {
        const combinedData = {
            body: { ...request },
            id,
            instancekey,
            user: req.user, token: req.headers['authtoken']
        }
        return this.instituteService.updateInstitutePrefernces(combinedData);
    }
}