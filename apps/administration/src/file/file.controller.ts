import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { FileService } from './file.service';
import { protobufFileService } from '@app/common/grpc-clients/administration';
import { FileRequest } from '@app/common/dto/administration/file.dto';

@Controller()
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @GrpcMethod(protobufFileService, 'Upload')
  upload(request: FileRequest) {
    return this.fileService.upload(request);
  }

  @GrpcMethod(protobufFileService, 'UploadElearning')
  uploadElearning(request: FileRequest) {
    return this.fileService.uploadElearning(request);
  }

  @GrpcMethod(protobufFileService, 'UploadCertificate')
  uploadCertificate(request: FileRequest) {
    return this.fileService.uploadCertificate(request);
  }
}
