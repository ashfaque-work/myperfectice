// authentication.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthCommonService } from '../auth.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private authService: AuthCommonService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      console.log(
        `call the url:: ${request.url} with request header:::${JSON.stringify(
          request.headers.authtoken,
        )}`,
      );
      request.instancekey = request.headers.instancekey;
      const token = request.headers.authtoken;
      if (request.url.indexOf('auth/login') >= 0 ||
        (request.method === 'POST' && request.url.indexOf('auth/users') >= 0) ||
        request.url.indexOf('auth/recoverPassword') >= 0) {
        return true;
      }

      if (!token) {
        // Handle case where token is missing
        throw new UnauthorizedException('authtoken is missing');
      }

      // Validate and decode the JWT token
      const decodedTokenPayload = await this.authService.validateJwtToken(token);

      console.log(`decodedTokenPayload token ik:: ${decodedTokenPayload.ik}`);

      // Attach the decoded user to the request for downstream use
      const user = await this.authService.getUser({
        instancekey: request.instancekey ? request.instancekey : decodedTokenPayload.ik,
        _id: decodedTokenPayload.userId,
      });

      request.body = { ...request.body, userid: user._id, roles: user.roles };
      request.user = user;
      return true;
    } catch (error) {
      console.log(error)
      throw new UnauthorizedException(error.message)
    }
  }
}
