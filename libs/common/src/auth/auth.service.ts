import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { GetUserRequest } from '../dto';
import { AuthGrpcService } from '../grpc-clients';

@Injectable()
export class AuthCommonService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private authGrpcService: AuthGrpcService,
  ) {}

  async getUser(request: GetUserRequest) {
    return await this.authGrpcService.GetUser(request);
  }

  async validateJwtToken(jwt: string) {
    try {
      const validToken = this.jwtService.verify(jwt, {
        secret: this.configService.get('JWT_SECRET'),
      });
      const tokenPayload = this.jwtService.decode(jwt);
      return tokenPayload;
    } catch (error) {
      Logger.error(error);
      throw new UnauthorizedException('JWT EXPIRED / WRONG JWT')
    }
  }
}
