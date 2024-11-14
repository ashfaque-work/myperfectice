import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';

class User {
    _id: string;
    roles: string[];
}
class BackpacItem {
    @ApiProperty({ required: false })
    @IsOptional()
    itemId?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    type?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    title?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    comment?: string;
}
export class BackpackReq {
    user?: User;
    instancekey?: string;
}
export class Backpack {
    _id?: string;
    user?: string;
    folderName?: string;
    active: boolean;
}

export class GetBackpackRes {
    response: Backpack[];
}

export class UpdateBackpackReq {
    _id: string;
    @ApiProperty({ required: true })
    @IsString()
    folderName: string;
    @ApiProperty({ type: [BackpacItem], required: false })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => BackpacItem)
    items?: BackpacItem[];
    instancekey?: string;
}

export class DeleteBackpackReq {
    _id: string;
    instancekey?: string;
}