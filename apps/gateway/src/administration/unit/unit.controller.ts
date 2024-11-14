import { Body, Controller, Param, Get, Post, Put, Delete, UseGuards, Query, Headers, Req } from '@nestjs/common';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { UnitService } from './unit.service';
import { UnitRequest, UpdateUnitRequest, UpdateUnitStatusRequest } from '@app/common/dto/administration/unit.dto';

@ApiTags('Unit')
@Controller('units')
export class UnitController {
	constructor(private unitService: UnitService) { }

	@Post('create')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['admin', 'support', 'teacher', 'director', 'operator', 'publisher'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	createUnit(@Body() request: UnitRequest, @Req() req: any, @Headers('instancekey') instancekey: string) {
		return this.unitService.createUnit({ ...request, user: req.user, instancekey });
	}

	@Get('/')
	@ApiQuery({ name: 'id', required: false, description: 'Filter unit by id', type: String })
	@ApiQuery({ name: 'topics', required: false, description: 'Filter unit by topic', type: String })
	@ApiQuery({ name: 'active', required: false, description: 'Filter unit by status', type: Boolean })
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	getUnit(
		@Query('id') id: string,
		@Query('topics') topics: string,
		@Query('active') active: boolean,
		@Headers('instancekey') instancekey: string
	) {
		const newRequest = { id, topics, active, instancekey };
		return this.unitService.getUnit(newRequest);
	}

	@Put('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['admin', 'support', 'teacher', 'director', 'operator', 'publisher'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	updateUnit(@Param('id') id: string, @Body() request: UpdateUnitRequest, @Req() req: any, @Headers('instancekey') instancekey: string) {
		return this.unitService.updateUnit(id, { ...request, user: req.user, instancekey });
	}

	@Put('/updateStatus/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['admin', 'support', 'teacher', 'director', 'operator', 'publisher'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	updateUnitStatus(@Param('id') id: string, @Body() request: UpdateUnitStatusRequest, @Req() req: any, @Headers('instancekey') instancekey: string) {
		return this.unitService.updateUnitStatus(id, { ...request, user: req.user, instancekey });
	}

	@Delete('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['admin', 'support', 'teacher', 'director', 'operator', 'publisher'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	deleteUnit(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
		return this.unitService.deleteUnit({ _id: id, instancekey });
	}

	@Get('/bySubject/:subject')
	@ApiHeader({ name: 'authtoken', required: true })
	@ApiQuery({ name: 'page', required: false })
	@ApiQuery({ name: 'limit', required: false })
	@ApiQuery({ name: 'searchText', required: false })
	@UseGuards(AuthenticationGuard)
	getUnitsBySubject(
		@Param('subject') subject: string,
		@Headers('instancekey') instancekey: string,
		@Query('page') page?: number,
		@Query('limit') limit?: number,
		@Query('searchText') searchText?: string
	) {
		return this.unitService.getUnitsBySubject({ subject, page, limit, searchText, instancekey });
	}

	@Get('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	getOneUnit(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
		return this.unitService.getOneUnit({ _id: id, instancekey });
	}
}
