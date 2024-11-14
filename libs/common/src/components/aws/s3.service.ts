import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import * as aws from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { config } from '@app/common/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as stream from 'stream';
import { promisify } from 'util';
import * as fs from 'fs';

const pipeline = promisify(stream.pipeline);
import { Attribute, CompareFacesCommand, CompareFacesCommandInput, DetectFacesCommand, RekognitionClient } from '@aws-sdk/client-rekognition';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';

@Injectable()
export class S3Service {
  private logger = new Logger(S3Service.name);
  private region: string;
  private s3: S3Client;
  private s3UserAssets: S3Client;
  private s3FaceReg: S3Client;
  private rekognition: RekognitionClient;

  constructor(private configService: ConfigService) {
    this.region = configService.get<string>('S3_REGION') || 'ap-south-1';
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: config.aws.s3.userAssets.accessKeyId,
        secretAccessKey: config.aws.s3.userAssets.secretAccessKey,
      }
    });

    this.s3UserAssets = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: config.aws.s3.userAssets.accessKeyId,
        secretAccessKey: config.aws.s3.userAssets.secretAccessKey,
      },
    });


    this.s3FaceReg = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: config.aws.s3.faceReg.accessKeyId,
        secretAccessKey: config.aws.s3.faceReg.secretAccessKey,
      },
    });

    this.rekognition = new RekognitionClient({
      region: this.region,
      credentials: {
        accessKeyId: config.aws.rekognition.accessKeyId,
        secretAccessKey: config.aws.rekognition.secretAccessKey,
      },
    });
  }

  async userAssetUpload(file: Express.Multer.File, key: string): Promise<string> {
    const bucket = this.configService.get<string>('S3_BUCKET') || 'skillifyai-user-assets';
    const finalKey = `${'skillify'}${key}`;

    const input: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: bucket,
      Key: key,
      ContentType: file.mimetype,
    };
    console.log('input', input);

    try {
      const response: PutObjectCommandOutput = await this.s3.send(
        new PutObjectCommand(input),
      );
      console.log('res>>>>>>>>>>', response);

      if (response.$metadata.httpStatusCode === 200) {
        return `${key}`;
        // return `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
      }
      throw new Error('Image not saved in s3!');
    } catch (err) {
      this.logger.error('Cannot save file to s3,', err);
      throw err;
    }
  }

  async faceRegSignedUrl(filePath) {
    try {
      const params: PutObjectCommandInput = {
        Bucket: config.aws.s3.faceReg.bucket,
        Key: filePath,
        ContentType: 'image/jpg',
        ACL: 'public-read'
      };
      let expiresIn = 15 * 60;
      const command = new PutObjectCommand(params);
      console.log(this.s3FaceReg);

      let url = await getSignedUrl(this.s3FaceReg, command, { expiresIn })
      return {
        filePath: `${config.aws.s3.faceReg.baseFilePath}/${filePath}`,
        url: url
      }
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async userAssetSignedUrl(filePath, contentType) {
    try {
      const params = {
        Bucket: config.aws.s3.userAssets.bucket,
        Key: filePath,
        ContentType: contentType
      };
      let expiresIn = 15 * 60;
      const command = new PutObjectCommand(params);

      let url = await getSignedUrl(this.s3UserAssets, command, { expiresIn })
      return url
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async getSignedUrl(filePath, contentType) {
    try {
      const params = {
        Bucket: config.aws.s3.userAssets.bucket,
        Key: filePath,
        ContentType: contentType
      };
      let expiresIn = 15 * 60;
      const command = new PutObjectCommand(params);

      let url = await getSignedUrl(this.s3UserAssets, command, { expiresIn })
      return {
        filePath: `${config.aws.s3.userAssets.baseFilePath}/${filePath}`,
        url: url
      }
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async adaptive(method, payload) {
    const lambda = new aws.Lambda({
      accessKeyId: config.aws.lambda.accessKeyId,
      secretAccessKey: config.aws.lambda.secretAccessKey,
      region: config.aws.lambda.region
    });
    payload.method = method;
    const params = {
      FunctionName: config.aws.lambda.functions.adaptive,
      Payload: JSON.stringify(payload)
    };

    return new Promise((resolve, reject) => {
      lambda.invoke(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          return resolve(data);
        }
      });
    });
  }

  async downloadUserAsset(fileKey: string, fileDestination: string): Promise<void> {
    const params = {
      Bucket: config.aws.s3.userAssets.bucket,
      Key: fileKey,
    };

    const command = new GetObjectCommand(params);

    try {
      const response = await this.s3UserAssets.send(command);
      const bodyStream = response.Body as stream.Readable;
      const writeStream = fs.createWriteStream(fileDestination);

      await pipeline(bodyStream, writeStream);

      this.logger.debug('File downloaded successfully!');
    } catch (error) {
      this.logger.error('Failed to download file from S3:', error);
      throw error;
    }
  }

  async recognito(mode, database, userId, attemptId) {
    const lambda = new aws.Lambda({
      accessKeyId: config.aws.lambda.accessKeyId,
      secretAccessKey: config.aws.lambda.secretAccessKey
    });

    const params = {
      FunctionName: config.aws.lambda.functions.faceRec,
      Payload: JSON.stringify({
        db: database,
        student: userId,
        attempt: attemptId,
        mode: mode
      })
    };

    return new Promise((resolve, reject) => {
      lambda.invoke(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          return resolve(data);
        }
      });
    });
  }

  async faceCompare(sourceImage: string, targetImage: string) {
    // Check for multiple faces
    const faceDetails = await this.faceDetect(sourceImage);
    if (faceDetails.length !== 1) {
      throw new GrpcInternalException(`Expected one face in the source image, but found ${faceDetails.length}`);
    }

    const params: CompareFacesCommandInput = {
      SimilarityThreshold: 0,
      SourceImage: {
        S3Object: {
          Bucket: config.aws.s3.userAssets.bucket,
          Name: sourceImage
        },
      },
      TargetImage: {
        S3Object: {
          Bucket: config.aws.s3.userAssets.bucket,
          Name: targetImage
        },
      },
    };
    
    try {
      const data = await this.rekognition.send(new CompareFacesCommand(params));
      return data.FaceMatches.map(f => f.Similarity);
    } catch (err) {
      this.logger.error('Error comparing faces', err);
      // throw new Error('Error comparing faces: ' + err.message);
      throw new GrpcInternalException(err.message)
    }
  }

  async faceRegCompare(sourceImage: string, targetImage: string) {
    const params: CompareFacesCommandInput = {
      SimilarityThreshold: 0,
      SourceImage: {
        S3Object: {
          Bucket: config.aws.s3.userAssets.bucket,
          Name: sourceImage
        },
      },
      TargetImage: {
        S3Object: {
          Bucket: config.aws.s3.faceReg.bucket,
          Name: targetImage
        },
      },
    };
    
    try {
      const data = await this.rekognition.send(new CompareFacesCommand(params));
      return data.FaceMatches.map(f => f.Similarity);
    } catch (err) {
      this.logger.error('Error comparing faces', err);
      // throw new Error('Error comparing faces: ' + err.message);
      throw new GrpcInternalException(err.message)
    }
  }

  async faceDetect(sourceImage: string) {
    const params = {
        Attributes: [Attribute.DEFAULT],
        Image: {
            S3Object: {
                Bucket: config.aws.s3.userAssets.bucket,
                Name: sourceImage
            }
        }
    };
    
    try {
        const data = await this.rekognition.send(new DetectFacesCommand(params));
        
        return data.FaceDetails;
    } catch (err) {
        console.error('Error detecting faces', err.name, err.message);
        if (err.name === 'InvalidS3ObjectException') {
            console.error(`Bucket: ${config.aws.s3.userAssets.bucket}, Key: ${sourceImage}`);
        }
        throw err;
    }
  }
}