import { RedisCaching } from "@app/common";
import { GetKeyReq, VerifyReq } from "@app/common/dto/userManagement/captcha.dto";
import { Injectable, Logger } from "@nestjs/common";
import { GrpcInternalException } from "nestjs-grpc-exceptions";
import * as simple_recaptcha from "simple-recaptcha-new";

@Injectable()
export class CaptchaService {
    constructor(
        private readonly redist: RedisCaching
    ) {}

    async getKey(request: GetKeyReq) {
        try {
            const settings = await this.redist.getSetting(request);
            if(settings.recaptcha){
                return {
                    response: settings.recaptcha.publicKey
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async verify(request: VerifyReq) {
        try {
            let userResponse = request.body.response;
            const settings = await this.redist.getSetting(request);
            if(!settings.recaptcha){
                Logger.warn('recaptcha not found in setting!');
                throw new Error('recaptcha not found');
            }

            simple_recaptcha(settings.recaptcha.privateKey, request.ip, userResponse, function(err) {
                if(err) {
                    throw new Error(err.message)
                }
                return {
                    response: "Ok"
                }
            })
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }
}