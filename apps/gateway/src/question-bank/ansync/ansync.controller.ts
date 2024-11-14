import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { AnsyncService } from './ansync.service';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { AnsyncAllBody } from '@app/common/dto/question-bank.dto';
import { AuthenticationGuard } from '@app/common/auth';

@ApiTags('Ansync')
@Controller('ansync')
export class AnsyncController {
    constructor(private readonly ansyncService: AnsyncService) { }

    @Post('/attempt-ansync-all')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    ansyncAll(@Headers('instancekey') instancekey: string, @Body() body: AnsyncAllBody, @Req() req: any) {
        return this.ansyncService.ansyncAll({ instancekey, body, user: req.user })
    }

}