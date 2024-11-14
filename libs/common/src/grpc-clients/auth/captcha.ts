import { GetKeyReq, GetKeyRes, VerifyReq, VerifyRes } from "@app/common/dto/userManagement/captcha.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufCaptchaService = 'AuthGrpcService';

export interface CaptchaGrpcInterface {
    GetKey(request: GetKeyReq): Promise<GetKeyRes>;
    Verify(request: VerifyReq): Promise<VerifyRes>;
}

@Injectable()
export class CaptchaGrpcServiceClientImpl implements CaptchaGrpcInterface {
    private captchaGrpcServiceClient: CaptchaGrpcInterface;
    private readonly logger = new Logger(CaptchaGrpcServiceClientImpl.name);

    constructor(
        @Inject('authGrpcService') private captchaGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.captchaGrpcServiceClient = this.captchaGrpcClient.getService<CaptchaGrpcInterface>(protobufCaptchaService)
        this.logger.debug('gRPC client initialized');
    }

    async GetKey(request: GetKeyReq): Promise<GetKeyRes> {
        return await this.captchaGrpcServiceClient.GetKey(request);
    }

    async Verify(request: VerifyReq): Promise<VerifyRes> {
        return await this.captchaGrpcServiceClient.Verify(request);
    }
}