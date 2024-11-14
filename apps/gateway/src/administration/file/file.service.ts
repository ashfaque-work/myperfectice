import {
	FileRequest, File
} from '@app/common/dto/administration/file.dto';
import { FileGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
	constructor(private fileGrpcServiceClientImpl: FileGrpcServiceClientImpl) { }

	async upload(request: FileRequest): Promise<File> {		
		return await this.fileGrpcServiceClientImpl.Upload(request);
	}

	async uploadElearning(request: FileRequest): Promise<File> {
		return await this.fileGrpcServiceClientImpl.UploadElearning(request);
	}

	async uploadCertificate(request: FileRequest): Promise<File> {
		return await this.fileGrpcServiceClientImpl.UploadCertificate(request);
	}
}