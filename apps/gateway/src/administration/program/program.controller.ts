import { Body, Controller, Param, Get, Post, Put, Delete, UseGuards, Req, Query, Headers } from '@nestjs/common';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { ProgramService } from './program.service';
import { ProgramRequest, UpdateProgramRequest, UpdateProgramStatusRequest } from '@app/common/dto/administration/program.dto';

@ApiTags('Program')
@Controller('programs')
export class ProgramController {
    constructor(private programService: ProgramService) { }

    @Post('create')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support', 'teacher', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    createProgram(@Body() request: ProgramRequest, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.programService.createProgram({ ...request, user: req.user, instancekey });
    }

    @Get('/')
    @ApiQuery({ name: 'includeDeactivated', required: false, description: 'Include deactivated programs', type: Boolean })
    @ApiQuery({ name: 'name', required: false, description: 'Search programs by name', type: String })
    @ApiQuery({ name: 'country', required: false, description: 'Filter programs by country code', type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getProgram(
        @Query('includeDeactivated') includeDeactivated: boolean,
        @Query('name') name: string,
        @Query('country') country: string,
        @Req() req: any,
        @Headers('instancekey') instancekey: string
    ) {
        const newRequest = { user: req.user, includeDeactivated, name, country, instancekey }
        return this.programService.getProgram(newRequest);
    }

    @Put('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support', 'teacher', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateProgram(@Param('id') id: string, @Body() request: UpdateProgramRequest, @Headers('instancekey') instancekey: string) {
        return this.programService.updateProgram(id, { ...request, instancekey });
    }

    @Put('updateStatus/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support', 'teacher', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateProgramStatus(@Param('id') id: string, @Body() request: UpdateProgramStatusRequest, @Headers('instancekey') instancekey: string) {
        return this.programService.updateProgramStatus(id, { ...request, instancekey });
    }

    @Delete('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support', 'teacher', 'director', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    deleteProgram(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.programService.deleteProgram({ _id: id, instancekey });
    }

    @Get('/institute')
    @ApiQuery({ name: 'includeDeactivated', required: false, description: 'Include deactivated programs', type: Boolean })
    @ApiQuery({ name: 'subject', required: false, description: 'Search programs by subject', type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getInstitutePrograms(
        @Query('includeDeactivated') includeDeactivated: boolean,
        @Query('subject') subject: string,
        @Req() req: any,
        @Headers('instancekey') instancekey: string
    ) {
        const newRequest = { user: req.user, includeDeactivated, subject, instancekey }
        return this.programService.getInstitutePrograms(newRequest);
    }

    @Get('/publisher')
    @ApiQuery({ name: 'includeDeactivated', required: false, description: 'Include deactivated programs', type: Boolean })
    @ApiQuery({ name: 'subject', required: false, description: 'Search programs by subject', type: String })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getPublisherPrograms(
        @Query('includeDeactivated') includeDeactivated: boolean,
        @Query('subject') subject: string,
        @Req() req: any,
        @Headers('instancekey') instancekey: string
    ) {
        const newRequest = { user: req.user, includeDeactivated, subject, instancekey }
        return this.programService.getPublisherPrograms(newRequest);
    }

    @Get('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getOneProgram(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.programService.getOneProgram({ _id: id, instancekey });
    }
}
