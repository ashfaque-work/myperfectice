import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export interface Empty { }

class User {
    _id: string;
    roles: string[];
}

class Query {
    @IsOptional()
    @IsNumber()
    page?: number;
    @IsOptional()
    @IsNumber()
    limit?: number;
    @IsOptional()
    @IsNumber()
    skip?: number;
    @IsOptional()
    @IsBoolean()
    count?: boolean;
    @IsOptional()
    @IsString()
    search?: string;
    @IsOptional()
    @IsString()
    language?: string;
}
export class FindCodesnippetReq {
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    user?: User;
    instancekey?: string;
}
export class GetCodeByUIDReq {
    uid?: string;
    instancekey?: string;
}

export class UpdateCodesnippetReq {
    @ApiProperty()
    code?: string;
    _id?: string;
    instancekey?: string;
}

export class ChangePairCodingReq {
    @ApiProperty()
    pairCoding: boolean;
    _id?: string;
    instancekey?: string;
}
class CodesnippetBody{
    @ApiProperty({ type: String })
    @IsNotEmpty()
    title: string;
    @ApiProperty({ type: String })
    @IsOptional()
    description?: string;
    @ApiProperty({ type: String })
    @IsOptional()
    language?: string;
    @ApiProperty({ type: String })
    @IsOptional()
    code?: string;
    @ApiProperty({ type: [String] })
    @IsOptional()
    @IsArray()
    tags?: string[];
    @ApiProperty({ type: Boolean, default: false })
    @IsOptional()
    pairCoding?: boolean;
    @ApiProperty({ type: Boolean, default: true })
    @IsOptional()
    active?: boolean;
}
export class CreateCodesnippetReq {
    @ApiProperty({ type: CodesnippetBody })
    body?: CodesnippetBody;
    instancekey?: string;
    user?: User;
}
export class DeleteCodesnippetReq {
    _id?: string;
    instancekey?: string;
}