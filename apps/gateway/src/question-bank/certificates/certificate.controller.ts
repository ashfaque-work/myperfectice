import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { ObjectIdPipe } from '@app/common';
import { CreateCertificateBody, IndexQuery } from '@app/common/dto/question-bank.dto';
import { AuthenticationGuard } from '@app/common/auth';

@ApiTags('Certificate')
@Controller('certificate')
export class CertificateController {
    constructor(private readonly certificateService: CertificateService) { }

    @Get('/:id')
    @ApiParam({ name: 'id', description: "User ID" })
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    index(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string, @Query() query: IndexQuery) {
        return this.certificateService.index({ instancekey, id, query })
    }

    @Post('/')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    create(@Headers('instancekey') instancekey: string, @Body() body: CreateCertificateBody, @Req() req: any) {
        return this.certificateService.create({ instancekey, body, user: req.user })
    }

    @Get('/getPublicProfileCertificates/:id')
    @ApiParam({ name: 'id', description: "User ID" })
    getPublicProfileCertificates(@Headers('instancekey') instancekey: string, @Param('id', ObjectIdPipe) id: string) {
        return this.certificateService.getPublicProfileCertificates({ instancekey, id })
    }
}