import { Body, Controller, Param, Get, Post, Put, Delete, UseGuards, Query, Headers, Req } from '@nestjs/common';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceReq, EditServiceReq, GetTaggingForStudentsReq, RevokeServiceReq } from '@app/common/dto/administration';

@ApiTags('Service')
@Controller('services')
export class ServiceController {
	constructor(private serviceService: ServiceService) { }

	@Post('/')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	createService(@Body() request: CreateServiceReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
		return this.serviceService.createService({ ...request, user: req.user, instancekey });
	}

	@Post('/getTaggingForStudents')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	getTaggingForStudents(@Body() request: GetTaggingForStudentsReq, @Headers('instancekey') instancekey: string) {
		return this.serviceService.getTaggingForStudents({ ...request, instancekey });
	}

	@Put('/:id/revoke')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	revokeService(
		@Param('id') id: string,
		@Req() req: any,
		@Headers('instancekey') instancekey: string
	) {
		return this.serviceService.revokeService({ _id: id, user: req.user, instancekey });
	}

	@Put('/:id/publish')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	publishService(
		@Param('id') id: string,
		@Req() req: any,
		@Headers('instancekey') instancekey: string
	) {
		return this.serviceService.publishService({ _id: id, user: req.user, instancekey });
	}

	@Put('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	editService(
		@Param('id') id: string,
		@Body() request: EditServiceReq,
		@Req() req: any,
		@Headers('instancekey') instancekey: string
	) {
		return this.serviceService.editService({ ...request, _id: id, user: req.user, instancekey });
	}

	@Delete('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['teacher', 'operator', 'admin', 'centerHead', 'director', 'publisher'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	deleteService(@Param('id') id: string, @Req() req: any, @Headers('instancekey') instancekey: string) {
		return this.serviceService.deleteService({ _id: id, user: req.user, instancekey });
	}

	@Get('/')
	@ApiHeader({ name: 'authtoken', required: true })
	@ApiQuery({ name: 'limit', required: false })
	@ApiQuery({ name: 'skip', required: false })
	@ApiQuery({ name: 'searchText', required: false, description: 'Filter Services by title.', type: String })
	@ApiQuery({ name: 'count', required: false, description: 'Do you want to include service count?', type: Boolean })
	@UseGuards(AuthenticationGuard)
	findServices(
		@Headers('instancekey') instancekey: string,
		@Req() req: any,
		@Query('limit') limit?: number,
		@Query('skip') skip?: number,
		@Query('searchText') searchText?: string,
		@Query('count') count?: boolean
	) {
		return this.serviceService.findServices({ limit, skip, searchText, count, instancekey, user: req.user });
	}

	@Get('/public')
	@ApiHeader({ name: 'authtoken', required: true })
	@ApiQuery({ name: 'limit', required: false })
	@ApiQuery({ name: 'skip', required: false })
	@ApiQuery({ name: 'searchText', required: false, description: 'Filter Services by title.', type: String })
	@ApiQuery({ name: 'count', required: false, description: 'Do you want to include service count?', type: Boolean })
	@UseGuards(AuthenticationGuard)
	findPublicServices(
		@Headers('instancekey') instancekey: string,
		@Query('limit') limit?: number,
		@Query('skip') skip?: number,
		@Query('searchText') searchText?: string,
		@Query('count') count?: boolean
	) {
		return this.serviceService.findPublicServices({ limit, skip, searchText, count, instancekey });
	}

	@Get('/:id/members')
	@ApiHeader({ name: 'authtoken', required: true })
	@ApiQuery({ name: 'limit', required: false })
	@ApiQuery({ name: 'skip', required: false })
	@ApiQuery({ name: 'searchText', required: false, description: 'Filter Services by title.', type: String })
	@ApiQuery({ name: 'count', required: false, description: 'Do you want to include service count?', type: Boolean })
	@UseGuards(AuthenticationGuard)
	getServiceMembers(
		@Param('id') id: string,
		@Headers('instancekey') instancekey: string,
		@Query('limit') limit?: number,
		@Query('skip') skip?: number,
		@Query('searchText') searchText?: string,
		@Query('count') count?: boolean
	) {
		return this.serviceService.getServiceMembers({ _id: id, limit, skip, searchText, count, instancekey });
	}

	@Get('/tagging/:studentId')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	getTaggingServicesForStudent(@Param('studentId') studentId: string, @Headers('instancekey') instancekey: string) {
		return this.serviceService.getTaggingServicesForStudent({ _id: studentId, instancekey });
	}
	
	@Get('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	getService(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
		return this.serviceService.getService({ _id: id, instancekey });
	}
}
