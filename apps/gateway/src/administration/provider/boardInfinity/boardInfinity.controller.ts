import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BoardInfinityService } from './boardInfinity.service';

@ApiTags('BoardInfinity')
@Controller('boardInfinity')
export class BoardInfinityController {
	constructor(private boardInfinityService: BoardInfinityService) { }

	@Get('/userattemptdetails')
	ininityUserAttemptDetails(@Headers('instancekey') instancekey: string) {
		return this.boardInfinityService.ininityUserAttemptDetails({ instancekey });
	}
}
