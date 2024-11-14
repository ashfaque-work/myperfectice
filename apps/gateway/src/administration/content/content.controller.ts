import { Controller, Param, Get, Headers, Post, UseGuards, Body, Req, UseInterceptors, UploadedFile, Put, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiHeader, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { ContentRequest, UpdateContentCountReq, UpdateContentRequest } from '@app/common/dto/administration/content.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Content')
@Controller('content')
export class ContentController {
	constructor(private contentService: ContentService) { }

	@Get('/')
	@ApiQuery({ name: 'title', required: false, description: 'Filter content by title', type: String })
	@ApiQuery({ name: 'type', required: false, description: 'Filter content by topic', type: String })
	@ApiQuery({ name: 'page', required: false })
	@ApiQuery({ name: 'limit', required: false })
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	getAllContents(
		@Req() req: any,
		@Headers('instancekey') instancekey: string,
		@Query('title') title: string,
		@Query('type') type: string,
		@Query('page') page?: number,
		@Query('limit') limit?: number,
	) {
		return this.contentService.getAllContents({ user: req.user, instancekey, title, type, page, limit });
	}

	@Get('/count')
	@ApiQuery({ name: 'title', required: false, description: 'Filter content by title', type: String })
	@ApiQuery({ name: 'type', required: false, description: 'Filter content by topic', type: String })
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	countContent(
		@Req() req: any,
		@Headers('instancekey') instancekey: string,
		@Query('title') title: string,
		@Query('type') type: string
	) {
		return this.contentService.countContent({ user: req.user, instancekey, title, type });
	}

	@Post('/')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: { type: 'string', format: 'binary' },
				title: { type: 'string' },
				url: { type: 'string' },
				summary: { type: 'string' },
				contentType: { type: 'enum', enum: ['video', 'ebook'], default: 'video' },
				filePath: { type: 'string' },
				imageUrl: { type: 'string' },
				tags: { type: 'array', items: { type: 'string' } }
			},
		},
	})
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	@UseInterceptors(FileInterceptor('file'))
	async createContent(
		@UploadedFile() file: Express.Multer.File,
		@Body() request: ContentRequest,
		@Req() req: any,
		@Headers('instancekey') instancekey: string
	) {
		const tags = Array.isArray(request.tags) ? request.tags : [request.tags];
		const mergedRequest: ContentRequest = {
			...request,
			tags,
			user: req.user,
			instancekey,
			file
		};

		return this.contentService.createContent(mergedRequest);
	}

	@Get('/remoteContent/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	getRemoteContent(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
		return this.contentService.getRemoteContent({ _id: id, instancekey });
	}

	@Get('/findByCode/:code')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	contentfindByCode(@Param('code') code: string, @Req() req: any, @Headers('instancekey') instancekey: string) {
		return this.contentService.contentfindByCode({ code, user: req.user, instancekey });
	}

	@Get('/exportViewer/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	exportViewer(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
		return this.contentService.exportViewer({ _id: id, instancekey });
	}

	@Get('/taggedWithTopic/:topicId')
	@ApiHeader({ name: 'authtoken', required: true })
	@ApiQuery({ name: 'contentType', required: false, description: 'Filter content by contentType', type: String })
	@ApiQuery({ name: 'includeCount', required: false, description: 'Filter content by includeCount', type: Boolean })
	@ApiQuery({ name: 'page', required: false })
	@ApiQuery({ name: 'limit', required: false })
	@UseGuards(AuthenticationGuard)
	getContentsTaggedWithTopic(
		@Param('topicId') topicId: string,
		@Headers('instancekey') instancekey: string,
		@Req() req: any,
		@Query('contentType') contentType: string,
		@Query('includeCount') includeCount: boolean,
		@Query('page') page?: number,
		@Query('limit') limit?: number,
	) {
		return this.contentService.getContentsTaggedWithTopic(
			{ topicId, instancekey, user: req.user, contentType, includeCount, page, limit, }
		);
	}

	@Get('/getSubjectUnitAndTopicsByMe')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	@ApiQuery({ name: 'accreditationEnabled', required: false, description: 'Filter content by accreditationEnabled', type: Boolean })
	findSubjectUnitAndTopics(
		@Headers('instancekey') instancekey: string,
		@Req() req: any,
		@Query('accreditationEnabled') accreditationEnabled: string
	) {
		return this.contentService.findSubjectUnitAndTopics(
			{ instancekey, user: req.user, accreditationEnabled: accreditationEnabled === 'true', }
		);
	}

	@Get('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	getContentById(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
		return this.contentService.getContentById({ _id: id, instancekey });
	}

	@Put('/updateCount/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	updateContentCount(
		@Param('id') id: string,
		@Req() req: any,
		@Body() request: UpdateContentCountReq,
		@Headers('instancekey') instancekey: string
	) {
		return this.contentService.updateContentCount({ ...request, _id: id, user: req.user, instancekey });
	}

	@Put('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	updateContent(
		@Param('id') id: string,
		@Body() request: UpdateContentRequest,
		@Headers('instancekey') instancekey: string
	) {
		return this.contentService.updateContent({ ...request, _id: id, instancekey });
	}

	@Delete('/:id')
	@ApiHeader({ name: 'authtoken', required: true })
	@Roles(['teacher', 'operator', 'mentor', 'admin', 'centerHead', 'director'])
	@UseGuards(AuthenticationGuard, RolesGuard)
	deleteContent(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
		return this.contentService.deleteContent({ _id: id, instancekey });
	}
}
