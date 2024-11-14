import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ObjectIdPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    const { data: paramName } = metadata;
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ObjectId for parameter '${paramName}'`);
    }
    return value;
  }
}