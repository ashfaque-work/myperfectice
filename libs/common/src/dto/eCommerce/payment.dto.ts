import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

class User {
    _id: string;
    userId: string;
    roles: string[];
    country?: Country[];
    activeLocation: Types.ObjectId;
    email?: string;
    phoneNumber?: string;
}
class Country {
    code: string;
    name: string;
}
class Query {
    @IsOptional()
    @IsNumber()
    page?: number;
    @IsOptional()
    @IsNumber()
    limit?: number;
    @IsOptional()
    @IsString()
    sort?: string;
    @IsOptional()
    @IsBoolean()
    isReferral?: boolean;
    @IsOptional()
    @IsString()
    id?: string;
    @IsOptional()
    @IsString()
    keyword?: string;
}

export class ReferralDataDto {
    @IsNumber()
    @ApiProperty({ example: 0 })
    amount?: number;
    @IsDate()
    @ApiProperty({ example: new Date() })
    settlementDate: Date;
    @IsString()
    @ApiProperty({ example: 'user123' })
    userId?: string;
    @IsString()
    @ApiProperty({ example: 'success' })
    status?: string;
    @IsString()
    @ApiProperty({ example: 'Referral Name' })
    name?: string;
    @IsString()
    @ApiProperty({ example: '60d...e0a' })
    user?: Types.ObjectId;
}
export class Payment {
    @IsString()
    @ApiProperty({ example: '60d...e0a' })
    user?: Types.ObjectId;
    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 0 })
    amount?: number;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: '60d...e0b', required: false })
    forUser?: Types.ObjectId;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'P1234567890' })
    transaction?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'John Doe' })
    billing_name?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: '1234567890' })
    billing_tel?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'john.doe@example.com' })
    billing_email?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'New York' })
    billing_city?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: '10001' })
    billing_zip?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'NY' })
    billing_state?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: '123 Main St' })
    billing_address?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'USA' })
    billing_country?: string;
    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 0 })
    discountValue?: number;
    @IsArray()
    @IsOptional()
    @ApiProperty({ type: [String], example: ['DISCOUNT1', 'DISCOUNT2'] })
    discountData?: any[];
    @IsArray()
    @IsOptional()
    @ApiProperty({ type: [String], example: ['60d...e0a', '60d...e0b'] })
    couponIds?: Types.ObjectId[];
    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'PROMO123' })
    promoCode?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'USD' })
    currency?: string;
    @IsBoolean()
    @IsOptional()
    @ApiProperty({ example: false })
    hasDiscount?: boolean;
    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 0 })
    totalPayment?: number;
    @IsObject()
    @IsOptional()
    @ApiProperty({ example: {} })
    reponse?: any;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'pending' })
    status?: string;
    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'credit_card' })
    paymentMeThod?: string;
    @IsArray()
    @IsOptional()
    @ApiProperty({ type: [String], example: ['60d...e0a', '60d...e0b'] })
    paymentDetails?: Types.ObjectId[];
    @IsDate()
    @IsOptional()
    @ApiProperty({ example: new Date() })
    createdAt?: Date;
    @IsDate()
    @IsOptional()
    @ApiProperty({ example: new Date() })
    updatedAt?: Date;
    @ValidateNested()
    @Type(() => ReferralDataDto)
    @IsOptional()
    @ApiProperty({ type: ReferralDataDto })
    referralData?: ReferralDataDto;
    @IsObject()
    @IsOptional()
    @ApiProperty({ example: {} })
    customData?: any;
    statusCode?: number;
    error?: string;
}

export class FindByMeReq {
    query?: Query;
    user: User;
    instancekey: string;
}
export class FindByMeRes {
    @ApiProperty({ type: () => [Payment] })
    payments: Payment[];
}

export class RevenueAllReq {
    user: User;
    instancekey: string;
}
class Revenue {
    @ApiProperty({ example: 1000 })
    totalPayment: number;
    @ApiProperty({ example: 'USD' })
    currency: string;
    @ApiProperty({ example: 2023 })
    year: number;
    @ApiProperty({ example: 12 })
    month: number;
    @ApiProperty({ example: 31 })
    day: number;
    @ApiProperty({ example: new Date() })
    updatedAt: Date;
}
export class RevenueAllRes {
    result: Revenue[];
}

export class PaymentDetail {
    _id: string;
    packageName: string;
    practiceSetName: string;
    userName: string;
}
export class FindAllPaymentDetailRes {
    @ApiProperty({ type: () => [PaymentDetail] })
    paymentDetails: PaymentDetail[];
}

export class CountAllPaymentDetailRes {
    statusCode?: number;
    count?: number;
}

export class LastRevenueRes {
    statusCode?: number;
    payment: Payment;
}

export class FindOneByMeReq {
    _id: string;
    user: User;
    instancekey: string;
}
export class FindOneByMeRes {
    statusCode?: number;
    payment?: Payment;
    message?: string;
}

export class FindPaymentDetailsRes {
    statusCode?: number;
    response: PaymentDetail[];
}

export class GetTransactionReq {
    _id: string;
    instancekey: string;
}
class Transaction {
    status?: string;
    transaction?: string;
    redirectUrl?: string;
    courseid?: string;
    sessionid?: string;
    studentid?: string;
}
export class GetTransactionRes {
    statusCode?: number;
    message?: string;
    response?: Transaction;
}

class PaymentDetailDto {
    @ApiProperty({ description: 'Billing name of the user' })
    @IsString()
    @IsNotEmpty()
    billing_name: string;

    @ApiProperty({ description: 'Billing address of the user' })
    @IsString()
    @IsNotEmpty()
    billing_address: string;

    @ApiProperty({ description: 'Billing city of the user' })
    @IsString()
    @IsNotEmpty()
    billing_city: string;

    @ApiProperty({ description: 'Billing state of the user' })
    @IsString()
    @IsNotEmpty()
    billing_state: string;

    @ApiProperty({ description: 'Billing zip code of the user' })
    @IsString()
    @IsNotEmpty()
    billing_zip: string;

    @ApiProperty({ description: 'Billing country of the user', required: false })
    @IsString()
    @IsOptional()
    billing_country?: string;

    @ApiProperty({ description: 'Amount of the payment' })
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({ description: 'Billing email of the user', required: false })
    @IsOptional()
    @IsString()
    billing_email?: string;

    @ApiProperty({ description: 'Billing telephone number of the user', required: false })
    @IsOptional()
    @IsString()
    billing_tel?: string;

    @ApiProperty({ description: 'Billing country code', required: false })
    @IsOptional()
    @IsString()
    billingCountryCode?: string;
}

class OrderDetailDto {
    @ApiProperty({ description: 'User ID associated with the order' })
    @IsString()
    @IsNotEmpty()
    user: string;

    @ApiProperty({ description: 'Type of item being ordered' })
    @IsString()
    @IsNotEmpty()
    typeItem: string;

    @ApiProperty({ description: 'ID of the item being ordered', required: false })
    @IsOptional()
    @IsString()
    _id?: string;

    @ApiProperty({ description: 'Price of the item being ordered' })
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty({ description: 'Coupon data for the item', required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    couponData?: string[];

    @ApiProperty({ description: 'Expiration value of the item', required: false })
    @IsOptional()
    @IsNumber()
    expirationValue?: number;

    @ApiProperty({ description: 'Practice IDs associated with the item', required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    practiceIds?: string[];

    @ApiProperty({ description: 'Membership eligibility status of the item', required: false })
    @IsOptional()
    @IsBoolean()
    isMembershipEligible?: boolean;
}


export class InitCCAReq {
    @ApiProperty({ description: 'Payment details', type: PaymentDetailDto })
    @ValidateNested()
    @Type(() => PaymentDetailDto)
    @IsNotEmpty()
    payment: PaymentDetailDto;

    @ApiProperty({ description: 'Amount', type: Number })
    amount: number;

    @ApiProperty({ description: 'Order details', type: [OrderDetailDto] })
    @ValidateNested({ each: true })
    @Type(() => OrderDetailDto)
    @IsNotEmpty()
    orderDetail: OrderDetailDto[];

    user: User;
    instancekey: string;
}

export class InitCCARes {
    statusCode?: number;
    message?: string;
}


export class FinishCCAReq {
    @ApiProperty({ description: 'encResp', type: String })
    encResp: string;
    _id: string;
    user: User;
    instancekey: string;
}

export class FinishCCARes {
    statusCode?: number;
    message?: string;
    params?: string;
    msg?: string;
    redirectUrl?: string;
}

export class CancelCCARes {
    statusCode?: number;
    redirectUrl?: string;
}

export class EnrollItemsReq {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    type: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    testseries?: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    practice?: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    course?: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    service?: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    enrollingLocation?: string;
    user: User;
    instancekey: string;
}
export class EnrollItemsRes {
    statusCode?: number;
    message?: string;
}

class CountryCodeDto {
    @ApiProperty({ description: 'Name of the country' })
    @IsNotEmpty() @IsString() name: string;
}

class PaymentDataDto {
    @ApiProperty({ description: 'Billing name' })
    @IsNotEmpty() @IsString() billing_name: string;
    @ApiProperty({ description: 'Billing address' })
    @IsNotEmpty() @IsString() billing_address: string;
    @ApiProperty({ description: 'Billing city' })
    @IsNotEmpty() @IsString() billing_city: string;
    @ApiProperty({ description: 'Billing state' })
    @IsNotEmpty() @IsString() billing_state: string;
    @ApiProperty({ description: 'Billing zip code' })
    @IsNotEmpty() @IsString() billing_zip: string;
    @ApiProperty({ description: 'Billing country', required: false })
    @IsOptional() @IsString() billing_country?: string;
    @ApiProperty({ description: 'Payment amount' })
    @IsNotEmpty() @IsNumber() amount: number;
    @ApiProperty({ description: 'Billing country code' })
    @ValidateNested() @Type(() => CountryCodeDto) billingCountryCode: CountryCodeDto;
}

class OrderDataDto {
    @ApiProperty({ description: 'User ID' })
    @IsNotEmpty() @IsString() user: string;
    @ApiProperty({ description: 'Price of the order' })
    @IsNotEmpty() @IsNumber() price: number;
    @ApiProperty({ description: 'Practice IDs', required: false })
    @IsOptional() practiceIds: string[];
    @ApiProperty({ description: 'Is membership eligible', required: false })
    @IsOptional() @IsBoolean() isMembershipEligible: boolean;
    @ApiProperty({ description: 'Expiration value', required: false })
    @IsOptional() @IsNumber() expirationValue: number;
    @ApiProperty({ description: 'Discount value', required: false })
    @IsOptional() @IsNumber() discountValue: number;
    @ApiProperty({ description: 'Total payment', required: false })
    @IsOptional() @IsNumber() totalPayment: number;
    @ApiProperty({ description: 'Additional notes', required: false })
    @IsOptional() @IsString() note: string;
    @ApiProperty({ description: 'Coupon data', type: [String], required: false })
    @IsOptional() @IsArray() @IsString({ each: true }) couponData: string[];
    @ApiProperty({ description: 'Item ID', required: false })
    @IsNotEmpty() @IsString() _id: string;
    @ApiProperty({ description: 'Type of item', required: false })
    @IsNotEmpty() @IsString() typeItem: string;
    @ApiProperty({ description: 'Title of the item', required: false })
    @IsOptional() @IsString() title: string;
    @ApiProperty({ description: 'Name of the item', required: false })
    @IsOptional() @IsString() name: string;
}

export class CreatePaymentReq {
    @ApiProperty({ description: 'Payment method' })
    @IsNotEmpty() @IsString() paymentMethod: string;
    @ApiProperty({ description: 'Payment data' })
    @ValidateNested() @Type(() => PaymentDataDto) payment: PaymentDataDto;
    @ApiProperty({ description: 'Order details', type: [OrderDataDto] })
    @ValidateNested() @Type(() => OrderDataDto) orderDetail: OrderDataDto[];
    user: User;
    instancekey: string;
}
export class CreatePaymentRes {
    statusCode?: number;
    message?: string;
    payment?: Payment;
}

export class PaymentResultReq {
    @ApiProperty({ description: 'Encrypted response from CCAvenue', type: String })
    encResp: string;
    _id: string;
    user: User;
    instancekey: string;
}
export class PaymentResultRes {
    statusCode?: number;
    message?: string;
    payment: string;
    status?: string;
    transaction?: string;
    isDemo?: boolean;
    redirectUrl?: string;
    courseid?: string;
    sessionid?: string;
    studentid?: string;
}

export class PaymentFinishReq {
    @ApiProperty({ description: 'Custom data', required: false })
    @IsOptional() @IsObject() customData?: object;
    _id: string;
    user: User;
    instancekey: string;
}
export class PaymentFinishRes {
    statusCode?: number;
    params?: string;
    msg?: string;
    payment?: string;
}