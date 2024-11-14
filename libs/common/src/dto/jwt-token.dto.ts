export class TokenReqDto {
  jwt: string;
}

export class DecodedTokenResDto {
  _id: string;
  email: string;
  roles?: string[];
}
