import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlatformByNumbersService } from './platformByNumbers.service';

@ApiTags('PlatformByNumbers')
@Controller('platformByNumbers')
export class PlatformByNumbersController {
	constructor(private platformByNumbersService: PlatformByNumbersService) { }

	@Get('/')
	getplatformByNumbers(@Headers('instancekey') instancekey: string) {
		return this.platformByNumbersService.getplatformByNumbers({ instancekey });
	}
}
