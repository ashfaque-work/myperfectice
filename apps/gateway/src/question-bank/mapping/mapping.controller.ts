import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { MappingService } from './mapping.service';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { Controller, Headers, Get, UseGuards } from '@nestjs/common';

@ApiTags('Mapping')
@Controller('mapping')
export class MappingController {
    constructor(private readonly mappingService: MappingService) { }

    @Get('/filterTestLists')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['student'])
    @UseGuards(RolesGuard)
    @UseGuards(AuthenticationGuard)
    videoForPracticeSet(@Headers('instancekey') instancekey: string) {
        return this.mappingService.videoForPracticeSet({ instancekey });
    }

}