import { GetKeyReq, VerifyReq } from "@app/common/dto/userManagement/captcha.dto";
import { CaptchaGrpcServiceClientImpl } from "@app/common/grpc-clients/auth/captcha";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CaptchaService {
    constructor(private captchaGrpcServiceClientImpl: CaptchaGrpcServiceClientImpl) {}

    async getKey(request: GetKeyReq) {
        return await this.captchaGrpcServiceClientImpl.GetKey(request);
    }

    async verify(request: VerifyReq) {
        return await this.captchaGrpcServiceClientImpl.Verify(request);
    }
}