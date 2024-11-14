import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';

class User {
    _id: string;
    userId: string;
    roles: string[];
}

export class FindOneCouponReq {
    code: string;
    user?: User;
    instancekey?: string;
}

export class Coupon {
    _id?: Types.ObjectId;
    name?: string;
    code?: string;
    price?: number;
    percent?: number;
    discountType?: string;
    itemIds?: Types.ObjectId[];
    usageLimit?: number;
    isReferral?: boolean;
    startDate?: Date;
    endDate?: Date;
    status?: boolean;
    lastModifiedBy?: Types.ObjectId;
    showMe?: boolean;
    statusCode?: number;
    error?: string;
}

export class GetAmbassadorCodeReq {
    user?: User;
    instancekey?: string;
}

export class FindByItemReq {
    _id: string;
    instancekey?: string;
}

class CouponList {
    _id?: string;
    name?: string;
    code?: string;
    price?: number;
    percent?: number;
    discountType?: string;
    itemIds?: string[];
    usageLimit?: string;
    isReferral?: boolean;
    startDate?: Date;
    endDate?: Date;
    status?: boolean;
    lastModifiedBy?: string;
    showMe?: boolean;
    totalUsed?: number;
}
export class FindByItemRes {
    _id?: string;
    couponList?: CouponList[];
    statusCode?: number;
}

class Query {
    @IsOptional()
    @IsNumber()
    skip?: number;

    @IsOptional()
    @IsNumber()
    limit?: number;

    @IsOptional()
    @IsString()
    items?: string;
}

export class FindAvailableCouponsReq {
    query?: Query;
    user?: User;
    instancekey?: string;
}

export class FindAvailableCouponsRes {
    couponList: CouponList[];
}
class CreateCouponBody {
    @ApiProperty()
    @IsOptional()
    @IsString()
    name?: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    code: string;
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    price?: number;
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    percent?: number;
    @ApiProperty()
    @IsOptional()
    @IsString()
    discountType?: string;
    @ApiProperty()
    @IsOptional()
    @IsArray()
    itemIds?: ObjectId[];
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    usageLimit: number;
    @ApiProperty()
    @IsBoolean()
    isReferral: boolean;
    @ApiProperty()
    @IsOptional()
    @IsDate()
    startDate?: Date;
    @ApiProperty()
    @IsOptional()
    @IsDate()
    endDate?: Date;
    @ApiProperty()
    @IsBoolean()
    status?: boolean;
    @ApiProperty()
    @IsBoolean()
    showMe?: boolean;
}
export class CreateCouponsReq {
    @ApiProperty({ type: CreateCouponBody })
    body?: CreateCouponBody;
    user?: User;
    instancekey?: string;
}

export class UpdateCouponsReq {
    _id: string;
    @ApiProperty({ type: CreateCouponBody })
    body?: CreateCouponBody;
    user?: User;
    instancekey?: string;
}