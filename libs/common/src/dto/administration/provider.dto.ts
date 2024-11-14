import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

class User {
    _id: string;
    roles: string[];
    name: string;
}

// export class HostRateBody {
//     @ApiProperty({ type: Number, description: 'Rating of the host' })
//     @IsNotEmpty({ message: 'Rating is required' })
//     @IsNumber({}, { message: 'Rating must be a number' })
//     rating: number;
//     @ApiProperty({ type: String, description: 'Comment about the host' })
//     @IsNotEmpty({ message: 'Comment is required' })
//     @IsString({ message: 'Comment must be a string' })
//     comment: string;
// }
// export class CreateHostRateReq {
//     @ApiProperty({ type: HostRateBody })
//     body: HostRateBody;
//     instancekey?: string;
//     user?: User;
// }

// export class ShareLinkBody {
//     @ApiProperty({ type: [String], required: false })
//     @IsOptional()
//     @IsArray()
//     @IsString({ each: true })
//     phones?: string[];
//     @ApiProperty({ type: [String], required: false })
//     @IsOptional()
//     @IsArray()
//     @IsEmail({}, { each: true })
//     emails?: string[];
// }
// export class ShareLinkReq {
//     body?: ShareLinkBody;
//     user: User;
//     instancekey: string;
// }

// export class FeedbackBody {
//     @ApiProperty({ type: String })
//     @IsNotEmpty({ message: 'Subject is required' })
//     @IsString({ message: 'Subject must be a string' })
//     @MaxLength(150, { message: 'Subject must be smaller than 150 characters.' })
//     subject: string;
//     @ApiProperty({ type: String })
//     @IsNotEmpty({ message: 'Message is required' })
//     @IsString({ message: 'Message must be a string' })
//     @MaxLength(4000, { message: 'Message must be smaller than 4000 characters.' })
//     message: string;
// }
// export class FeedbackReq {
//     body?: FeedbackBody;
//     user: User;
//     instancekey: string;
// }

export class UserAttemptDetailsReq {
    instancekey?: string;
}

// export class GetContactReq {
//     @ApiProperty({ type: String })
//     @IsNotEmpty({ message: 'Contact is required' })
//     @IsString({ message: 'Contact must be a string' })
//     contact: string;
//     instancekey?: string;
// }

// export class ImportGSTReq {
//     @ApiProperty({ type: 'string', format: 'binary' })
//     file?: Express.Multer.File;
//     countryCode?: string;
//     instancekey?: string;
// }