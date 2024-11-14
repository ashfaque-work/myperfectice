import { Injectable } from '@nestjs/common';
import { FileRepository } from '@app/common';
import { FileRequest } from '@app/common/dto/administration/file.dto';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import { S3Service } from '@app/common/components/aws/s3.service';
import { ObjectId } from 'mongodb';
import { environment } from '@app/common/config';

@Injectable()
export class FileService {
  constructor(
    private readonly fileRepository: FileRepository,
    private s3Service: S3Service
  ) { }

  async upload(request: FileRequest) {
    try {
      const { uploadType, user, file, instancekey } = request;
      const uploadPath = `${'assets/staging'}/uploads`;

      const randomString = Math.random().toString(36).slice(2);
      const userId = typeof user !== 'undefined' ? user._id.toString() : randomString;

      // Constructing the folder path
      let bucketKey = `${uploadPath}/${uploadType}/${userId}/${file.originalname}`;
      let finalBucketKey = bucketKey.replace('assets/', '')
      // Upload the file using S3 service or move locally
      let filePath;
      if (environment === 'local') {
        const localFilePath = `${uploadPath}/${userId}/${file.originalname}`;
        // await move(file.path, localFilePath);
        filePath = localFilePath;
      } else {
        filePath = await this.s3Service.userAssetUpload(file, finalBucketKey);
      }

      const fileToBeSaved = {
        type: uploadType,
        ownerId: new ObjectId(user._id),
        path: bucketKey,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        fileUrl: finalBucketKey
      };

      this.fileRepository.setInstanceKey(instancekey);
      const newFile = await this.fileRepository.create(fileToBeSaved);

      if (!newFile) {
        throw ('Files not Saved!');
      }

      return newFile;
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async uploadElearning(request: FileRequest) {
    try {
      const { user, file } = request;
      const uploadPath = `${'assets/staging'}`;

      const randomString = Math.random().toString(36).slice(2);
      const userId = typeof user !== 'undefined' ? user._id.toString() : randomString;
      const newFilename = `${randomString}-${file.originalname}`;

      // Constructing the folder path
      let bucketKey: any = `${uploadPath}/uploads/elearning/${userId}/${newFilename}`;
      
      bucketKey = bucketKey.replace('assets/', '')

      await this.s3Service.userAssetUpload(file, bucketKey);

      return { filePath: `/${userId}/${newFilename}` };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async uploadCertificate(request: FileRequest) {
    try {
      const { user, file } = request;
      const uploadPath = `${'assets/staging'}`;
      const randomString = Math.random().toString(36).slice(2);
      const userId = typeof user !== 'undefined' ? user._id.toString() : randomString;

      // Constructing the folder path
      let bucketKey  = `${uploadPath}/uploads/certificate/${userId}/${file.originalname}`;
      let fileUrl = bucketKey.replace(uploadPath, '')
      let finalBucketKey = bucketKey.replace('assets/', '')

      const filePath = await this.s3Service.userAssetUpload(file, finalBucketKey);

      const fileToBeSaved = {
        type: 'certificate',
        ownerId: new ObjectId(user._id),
        path: finalBucketKey,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        fileUrl: fileUrl
      };

      this.fileRepository.setInstanceKey(request.instancekey);
      const newFile = await this.fileRepository.create(fileToBeSaved);

      if (!newFile) {
        throw ('Files not Saved!');
      }

      return newFile;
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }


}
