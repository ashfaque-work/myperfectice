import { Controller } from "@nestjs/common";
import { CaptchaService } from "./captcha.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufCaptchaService } from "@app/common/grpc-clients/auth/captcha";
import { GetKeyReq, VerifyReq } from "@app/common/dto/userManagement/captcha.dto";

@Controller()
export class CaptchaController {
    constructor(private readonly captchaService: CaptchaService) { }

    @GrpcMethod(protobufCaptchaService, 'GetKey')
    async getKey(request: GetKeyReq) {
        return await this.captchaService.getKey(request);
    }

    @GrpcMethod(protobufCaptchaService, 'Verify')
    async verify(request: VerifyReq) {
        return await this.captchaService.verify(request);
    }
}