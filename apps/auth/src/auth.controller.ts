import { AUTH_SERVICE_NAME, ConfirmEmailReq, ConfirmPasswordResetTokenRequest, LoginReqDto, RecoverPasswordReq, RefreshTokenReq, ResetPasswordReq, ValidateUserPictureRequest, VoiceServiceRequest } from '@app/common';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @GrpcMethod(AUTH_SERVICE_NAME, 'login')
  async login(request: LoginReqDto) {
    return await this.authService.login(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ConfirmEmail')
  async confirmEmail(request: ConfirmEmailReq) {
    return await this.authService.confirmEmail(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'RecoverPassword')
  async recoverPassword(request: RecoverPasswordReq) {
    return await this.authService.recoverPassword(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ResetPassword')
  async resetPassword(request: ResetPasswordReq) {
    return await this.authService.resetPassword(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ConfirmPasswordResetToken')
  async confirmPasswordResetToken(request: ConfirmPasswordResetTokenRequest) {
    return await this.authService.confirmPasswordResetToken(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'VoiceService')
  async voiceService(request: VoiceServiceRequest) {
    return await this.authService.voiceService(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'RefreshToken')
  async refreshToken(request: RefreshTokenReq) {
    return await this.authService.refreshToken(request);
  }
}
