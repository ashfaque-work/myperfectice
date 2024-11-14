import { File, FileRequest } from '@app/common/dto/administration/file.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufFileService = 'AdministrationGrpcService';

export interface FileGrpcInterface {
    Upload(request: FileRequest): Promise<File>;
    UploadElearning(request: FileRequest): Promise<File>;
    UploadCertificate(request: FileRequest): Promise<File>;
}

@Injectable()
export class FileGrpcServiceClientImpl implements FileGrpcInterface {
    private fileGrpcServiceClient: FileGrpcInterface;
    private readonly logger = new Logger(FileGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private fileGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.fileGrpcServiceClient =
            this.fileGrpcClient.getService<FileGrpcInterface>(
                protobufFileService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async Upload(request: FileRequest): Promise<File> {        
        return await this.fileGrpcServiceClient.Upload(request);
    }

    async UploadElearning(request: FileRequest): Promise<File> {
        return await this.fileGrpcServiceClient.UploadElearning(request);
    }

    async UploadCertificate(request: FileRequest): Promise<File> {
        return await this.fileGrpcServiceClient.UploadCertificate(request);
    }
}
