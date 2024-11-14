import { Body, Controller, Get, Headers, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiQuery, ApiTags } from "@nestjs/swagger";
import { SupercoinsService } from "./supercoins.service";
import { CreateSupercoinsBody, UpdateStatusBody, UpdateSupercoinsBody } from "@app/common/dto/userManagement/supercoins.dto";
import { AuthenticationGuard } from "@app/common/auth";

@ApiTags('Supercoins')
@Controller('supercoins')
export class SupercoinsController {
    constructor(private supercoinsService: SupercoinsService) {}

    @Get('/')
    @ApiHeader({name: 'authtoken'})
    @ApiQuery({name: 'type', required: false})
    @ApiQuery({name: 'searchText', required: false})
    @UseGuards(AuthenticationGuard)
    async indexSupercoins(@Headers('instancekey') instancekey: string, @Query('type') type: string, @Query('searchText') searchText: string) {
        const combinedData = {
            instancekey,
            type,
            searchText
        }
        return this.supercoinsService.indexSupercoins(combinedData)
    }

    @Put('/:id')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async updateSupercoins(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Body() request: UpdateSupercoinsBody, @Req() req: any) {
        const combinedData = {
            instancekey,
            id,
            body: {...request},
            user: req.user
        }
        return this.supercoinsService.updateSupercoins(combinedData)
    }

    @Post('/')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async createSupercoins(@Headers('instancekey') instancekey: string, @Body() request: CreateSupercoinsBody, @Req() req: any) {
        const combinedData = {
            instancekey,
            body: {...request},
            user: req.user
        }
        return this.supercoinsService.createSupercoins(combinedData)
    }

    @Get('requests')
    @ApiHeader({name: 'authtoken'})
    @ApiQuery({name: 'activityType', required: false})
    @ApiQuery({name: 'searchText', required: false})
    @UseGuards(AuthenticationGuard)
    async requestStudents(@Headers('instancekey') instancekey: string, @Query('activityType') activityType: string, @Query('searchText') searchText) {
        const combinedData = {
            instancekey,
            activityType,
            searchText
        }
        return this.supercoinsService.requestStudents(combinedData)
    }

    @Put('updateStatus/:id')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async updateStatus(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Body() request: UpdateStatusBody, @Req() req: any) {
        const combinedData = {
            instancekey,
            id,
            body: {...request},
            user: req.user
        }
        return this.supercoinsService.updateStatus(combinedData)
    }

    @Get('getMembers')
    @ApiHeader({name: 'authtoken'})
    @ApiQuery({name: 'name', required: false})
    @UseGuards(AuthenticationGuard)
    async getMembers(@Headers('instancekey') instancekey: string, @Query('name') name: string) {
        const combinedData = {
            instancekey,
            name
        }
        return this.supercoinsService.getMembers(combinedData)
    }
}