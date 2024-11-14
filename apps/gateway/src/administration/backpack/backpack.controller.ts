import { Body, Controller, Param, Get, Post, Put, Delete, Headers, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { BackpackService } from './backpack.service';
import { UpdateBackpackReq } from '@app/common/dto/administration';
import { AuthenticationGuard } from '@app/common/auth';

@ApiTags('Backpack')
@Controller('backpacks')
export class BackpackController {
	constructor(private backpackService: BackpackService) { }

	@Get('/')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	getBackpack(@Headers('instancekey') instancekey: string, @Req() req: any) {
		return this.backpackService.getBackpack({ user: req.user, instancekey });
	}

	@Put('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	updateBackpack(@Param('id') id: string, @Body() request: UpdateBackpackReq, @Headers('instancekey') instancekey: string) {
		return this.backpackService.updateBackpack({ ...request, _id: id, instancekey });
	}

	@Delete('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	deleteBackpack(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
		return this.backpackService.deleteBackpack({ _id: id, instancekey });
	}

	@Post('create')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	createBackpack(@Req() req: any, @Headers('instancekey') instancekey: string) {
		return this.backpackService.createBackpack({ user: req.user, instancekey });
	}
}
