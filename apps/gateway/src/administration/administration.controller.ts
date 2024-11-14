import { Body, Controller, Param, Get, Post, Put, Delete, UseGuards, Req, Headers, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AdministrationService } from './administration.service';
import { LocationRequest, UpdateLocationRequest, UpdateLocationStatusRequest } from '@app/common/dto/administration/location.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Locations')
@Controller('locations')
export class AdministrationController {
    constructor(private administrationService: AdministrationService) { }

    @Post('create')
    @ApiHeader({ name: 'authtoken' })
    @Roles(['admin', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    createLocation(
        @Req() req: any,
        @Body() request: LocationRequest,
        @Headers('instancekey') instancekey: string) {
        const newRequest = { ...request, user: req.user, instancekey }
        return this.administrationService.createLocation(newRequest);
    }

    @Get('/')
    @ApiHeader({ name: 'authtoken' })
    @Roles(['admin', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getLocation(@Headers('instancekey') instancekey: string) {
        return this.administrationService.getLocation({ instancekey });
    }

    @Put('/:id')
    @ApiHeader({ name: 'authtoken' })
    @Roles(['admin', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateLocation(@Param('id') id: string, @Body() request: UpdateLocationRequest, @Headers('instancekey') instancekey: string) {
        return this.administrationService.updateLocation(id, { ...request, instancekey });
    }

    @Put('/updateStatus/:id')
    @ApiHeader({ name: 'authtoken' })
    @Roles(['admin', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateStatus(@Param('id') id: string, @Body() request: UpdateLocationStatusRequest, @Headers('instancekey') instancekey: string) {
        return this.administrationService.updateStatus(id, { ...request, instancekey });
    }

    @Delete('/:id')
    @ApiHeader({ name: 'authtoken' })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    deleteLocation(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.administrationService.deleteLocation({ _id: id, instancekey });
    }

    @Get('/getUserLocation')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    getUserLocation(@Req() request, @Headers('instancekey') instancekey: string) {
        return this.administrationService.getUserLocation({ ...request.body, instancekey });
    }

    @Get('/:id')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    getOneLocation(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.administrationService.getOneLocation({ _id: id, instancekey });
    }

    @Post('/import')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' }
            },
        },
    })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    @UseInterceptors(FileInterceptor('file'))
    async importLocation(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
        @Headers('instancekey') instancekey: string
    ) {
        return this.administrationService.importLocation({ file, instancekey, user: req.user, });
    }
}
