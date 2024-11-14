import { ApiProperty } from "@nestjs/swagger";

export class GetKeyReq {
    instancekey: string
}

export class GetKeyRes {
    response: string;
}

export class VerifyBodyReq {
    @ApiProperty()
    response: string;
}

export class VerifyReq {
    @ApiProperty()
    body: VerifyBodyReq;
    instancekey: string;
    ip: string;
}

export class VerifyRes {
    response: string;
}