import { Controller, Headers, Post, Body, Req, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ApiTags, ApiHeader, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileService } from './file.service';
import { FileRequest } from '@app/common/dto/administration/file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticationGuard } from '@app/common/auth';

@ApiTags('File')
@Controller('file')
export class FileController {
	constructor(private fileService: FileService) { }

	@Post('upload')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: { type: 'string', format: 'binary' },
				uploadType: { type: 'string' },
			},
		},
	})
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	@UseInterceptors(FileInterceptor('file'))
	async upload(
		@UploadedFile() file: Express.Multer.File,
		@Body() request: FileRequest,
		@Req() req: any,
		@Headers('instancekey') instancekey: string
	) {
		const mergedRequest: FileRequest = {
			...request,
			user: req.user,
			instancekey,
			file
		};

		return this.fileService.upload(mergedRequest);
	}

	@Post('uploadElearning')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: { type: 'string', format: 'binary' }
			},
		},
	})
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	@UseInterceptors(FileInterceptor('file'))
	async uploadElearning(
		@UploadedFile() file: Express.Multer.File,
		@Body() request: FileRequest,
		@Req() req: any,
		@Headers('instancekey') instancekey: string
	) {
		const mergedRequest: FileRequest = {
			...request,
			user: req.user,
			instancekey,
			file
		};

		return this.fileService.uploadElearning(mergedRequest);
	}

	@Post('uploadCertificate')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: { type: 'string', format: 'binary' }
			},
		},
	})
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	@UseInterceptors(FileInterceptor('file'))
	async uploadCertificate(
		@UploadedFile() file: Express.Multer.File,
		@Body() request: FileRequest,
		@Req() req: any,
		@Headers('instancekey') instancekey: string
	) {
		const mergedRequest: FileRequest = {
			...request,
			user: req.user,
			instancekey,
			file
		};

		return this.fileService.uploadCertificate(mergedRequest);
	}

}
