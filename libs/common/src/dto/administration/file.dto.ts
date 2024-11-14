import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

class User {
    _id: string;
    roles: string[];
    activeLocation: Types.ObjectId;
}

export class FileRequest {
    @ApiProperty({ type: 'string', format: 'binary' })
    file?: Express.Multer.File;
    uploadType?: string;
    user?: User;
    instancekey?: string;
}

export class File {
    _id: Types.ObjectId;
    type: string;
    ownerId: string;
    path: string;
    fileName: string;
    mimeType: string;
    size: number;
    fileUrl: string;
}