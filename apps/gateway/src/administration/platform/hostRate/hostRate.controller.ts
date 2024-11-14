import { Body, Controller, Param, Get, Post, Put, Delete, UseGuards, Query, Headers, Req } from '@nestjs/common';
import { AuthenticationGuard } from '@app/common/auth';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { HostRateService } from './hostRate.service';
import { FeedbackBody, HostRateBody, ShareLinkBody } from '@app/common/dto/administration';

@ApiTags('HostRate')
@Controller('hostRate')
export class HostRateController {
	constructor(private hostRateService: HostRateService) { }

	@Post('/create')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	createHostRate(@Body() body: HostRateBody, @Req() req: any, @Headers('instancekey') instancekey: string) {
		return this.hostRateService.createHostRate({ body, user: req.user, instancekey });
	}

	@Post('/shareLink')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	shareLink(@Body() body: ShareLinkBody, @Req() req: any, @Headers('instancekey') instancekey: string) {
		return this.hostRateService.shareLink({ body, user: req.user, instancekey });
	}

	@Post('/feedback')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	feedback(@Body() body: FeedbackBody, @Req() req: any, @Headers('instancekey') instancekey: string) {
		return this.hostRateService.feedback({ body, user: req.user, instancekey });
	}

	@Get('/testSendMail')
	testSendMail(@Headers('instancekey') instancekey: string) {
		return this.hostRateService.testSendMail({ instancekey });
	}

	@Get('/test')
	test() {
		return this.hostRateService.test();
	}
}
