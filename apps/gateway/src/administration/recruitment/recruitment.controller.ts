import { Body, Controller, Param, Get, Post, Put, Delete, UseGuards, Query, Headers, Req } from '@nestjs/common';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';
import { AddFavoriteBody, GetCollegesQuery, GetGradeSummaryQuery, GetSavedSearchQuery, SaveBody, SearchBody } from '@app/common/dto/administration';

@ApiTags('Recruitment')
@Controller('recruitment')
export class RecruitmentController {
	constructor(private recruitmentService: RecruitmentService) { }

	@Get('/region')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	getRegion() {
		return this.recruitmentService.getRegion({});
	}

	@Get('/tier')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	getTier() {
		return this.recruitmentService.getTier({});
	}

	@Get('/behavior')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	getBehavior() {
		return this.recruitmentService.getBehavior({});
	}

	@Get('/metadata')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	getMetadata() {
		return this.recruitmentService.getMetadata({});
	}

	@Get('/college')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	getColleges(@Query() query: GetCollegesQuery) {
		return this.recruitmentService.getColleges({ query });
	}

	@Get('/savedSearch')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	getSavedSearch(@Query() query: GetSavedSearchQuery, @Req() req: any) {
		return this.recruitmentService.getSavedSearch({ query, user: req.user });
	}

	@Get('/searchDetail/:name')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	getSearchDetail(@Param('name') name: string, @Req() req: any) {
		return this.recruitmentService.getSearchDetail({ name, user: req.user });
	}

	@Get('/profile/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	viewProfile(@Param('id') id: string, @Req() req: any) {
		return this.recruitmentService.viewProfile({ id, user: req.user });
	}

	@Get('/gradeSummary/:user')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	getGradeSummary(@Param('user') user: string, @Query() query: GetGradeSummaryQuery) {
		return this.recruitmentService.getGradeSummary({ user, query });
	}

	@Post('/save')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	save(@Headers('instancekey') instancekey: string, @Body() body: SaveBody, @Req() req: any) {
		return this.recruitmentService.save({ instancekey, body, user: req.user });
	}

	@Post('/search')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	search(@Body() body: SearchBody, @Req() req: any) {
		return this.recruitmentService.search({ body, user: req.user });
	}

	@Post('/addFavorite')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	addFavorite(@Body() body: AddFavoriteBody, @Req() req: any) {
		return this.recruitmentService.addFavorite({ body, user: req.user });
	}
	
	@Put('/delete/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	deleteById(@Param('id') id: string) {
		return this.recruitmentService.deleteById({ id });
	}
	
	@Put('/removeFavorite/:studentId')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['support', 'teacher', 'admin', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	removeFavorite(@Param('studentId') studentId: string, @Req() req: any) {
		return this.recruitmentService.removeFavorite({ studentId, user: req.user });
	}
}
