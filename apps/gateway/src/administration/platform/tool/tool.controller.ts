import { Body, Controller, Headers, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ToolService } from './tool.service';
import { GetContactReq } from '@app/common/dto/administration';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Tool')
@Controller('tool')
export class ToolController {
	constructor(private toolService: ToolService) { }

	@Post('/importGST/:countryCode')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: { type: 'string', format: 'binary' }
			},
		},
	})
	@UseInterceptors(FileInterceptor('file'))
	importGST(@Param('countryCode') countryCode: string, @UploadedFile() file: Express.Multer.File, @Headers('instancekey') instancekey: string) {
		return this.toolService.importGST({ countryCode, file, instancekey });
	}

	@Post('/contact')
	getContact(@Body() request: GetContactReq, @Headers('instancekey') instancekey: string) {
		return this.toolService.getContact({ ...request, instancekey });
	}
}
