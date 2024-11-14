import { Body, Controller, Get, Headers, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CaptchaService } from "./captcha.service";
import { VerifyBodyReq } from "@app/common/dto/userManagement/captcha.dto";

@ApiTags('Captcha')
@Controller('captcha')
export class CaptchaController {
    constructor(private captchaService: CaptchaService) { }

    @Get('key')
    async getKey(@Headers('instancekey') instancekey: string) {
        return this.captchaService.getKey({ instancekey })
    }

    @Post('verify')
    async verify(@Headers('instancekey') instancekey: string, @Body() request: VerifyBodyReq, @Req() req: any) {
        const combinedData = { body: { ...request }, instancekey, ip: req.ip }
        return this.captchaService.verify(combinedData);
    }
}