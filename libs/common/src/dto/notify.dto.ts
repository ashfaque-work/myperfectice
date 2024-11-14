import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ReqUser } from './user.dto';

export interface Empty {}

export interface NotifyEmailMessage {
  email: string;
  text: string;
}

class Query{
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;
  @IsOptional()
  @IsString()
  notficationType?: string;
  @IsOptional()
  @IsString()
  notIn?: string;
  @IsOptional()
  @IsString()
  type?: string;
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
  @IsString()
  keyword?: string;
}

export class GetNotificationsReq {
  instancekey: string;
  user: ReqUser;
  query: Query;
}

export class FindOneReq {
  instancekey: string;
  token?: string;
  user: ReqUser;
  _id: string;
}