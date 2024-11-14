import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NiitService } from './niit.service';

@ApiTags('Niit')
@Controller('niit')
export class NiitController {
	constructor(private niitService: NiitService) { }

	@Get('/userattemptdetails')
	niitUserAttemptDetails(@Headers('instancekey') instancekey: string) {
		return this.niitService.niitUserAttemptDetails({ instancekey });
	}
}
