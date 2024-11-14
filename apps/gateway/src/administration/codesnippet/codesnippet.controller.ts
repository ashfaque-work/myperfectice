import { Body, Controller, Param, Get, Post, Put, Delete, UseGuards, Query, Headers, Req } from '@nestjs/common';
import { AuthenticationGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { CodesnippetService } from './codesnippet.service';
import { ChangePairCodingReq, CreateCodesnippetReq, UpdateCodesnippetReq } from '@app/common/dto/administration';

@ApiTags('Codesnippet')
@Controller('codesnippet')
export class CodesnippetController {
	constructor(private codesnippetService: CodesnippetService) { }

	@Get('/')
	@ApiQuery({ name: 'limit', required: false })
	@ApiQuery({ name: 'skip', required: false })
	@ApiQuery({ name: 'language', required: false, description: 'Filter codesnippet by language.', type: String })
	@ApiQuery({ name: 'search', required: false, description: 'Filter codesnippet by search.', type: String })
	@ApiQuery({ name: 'count', required: false, description: 'Do you want to include codesnippet count?', type: Boolean })
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	findCodesnippet(
		@Headers('instancekey') instancekey: string, @Req() req,
		@Query('limit') limit?: number,
		@Query('skip') skip?: number,
		@Query('language') language?: string,
		@Query('search') search?: string,
		@Query('count') count?: string
	) {
		return this.codesnippetService.findCodesnippet({
			instancekey, user: req.user, query: { limit, skip, language, search, count: count === 'true' }
		});
	}

	@Get('/:uid')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	getCodeByUID(@Param('uid') uid: string, @Headers('instancekey') instancekey: string) {
		return this.codesnippetService.getCodeByUID({ uid, instancekey });
	}

	@Put('/:id/pairCoding')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	changePairCoding(@Param('id') id: string, @Body() request: ChangePairCodingReq, @Headers('instancekey') instancekey: string) {
		return this.codesnippetService.changePairCoding({ ...request, _id: id, instancekey });
	}

	@Put('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	updateCodesnippet(@Param('id') id: string, @Body() request: UpdateCodesnippetReq, @Headers('instancekey') instancekey: string) {
		return this.codesnippetService.updateCodesnippet({ ...request, _id: id, instancekey });
	}

	@Post('/')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	createCodesnippet(@Body() request: CreateCodesnippetReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
		return this.codesnippetService.createCodesnippet({ ...request, user: req.user, instancekey });
	}

	@Delete('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	deleteCodesnippet(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
		return this.codesnippetService.deleteCodesnippet({ _id: id, instancekey });
	}	
}
