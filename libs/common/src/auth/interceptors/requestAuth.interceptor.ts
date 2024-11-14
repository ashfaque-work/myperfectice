import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { RedisCaching } from '@app/common/services';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RequestAuthenticationGuard implements CanActivate {
    constructor(
        private readonly redisCache: RedisCaching,
        private readonly jwtService: JwtService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            const settings = await this.redisCache.getSetting(request.headers)

            var token = request.body.token || request.query.token || request.headers['x-access-token'];
            let secretKey = settings.ssoConfig.find(d => d.clientID == "12345").clientSecret;
            Logger.debug("app.get('SecretKey')", secretKey);
            if (token) {
                try {
                    let result = JSON.parse(token);
                    if (result) {
                        request.body.token = result;
                        return true;
                    } else {
                        Logger.error('Invalid token')
                        throw new BadRequestException({
                            success: false,
                            message: '' + 'Invalid token'
                        });
                    }
                } catch (ex) {
                    var decoded: any;
                    try {
                        decoded = this.jwtService.verify(token, { secret: secretKey })
                    } catch (ex) {
                        throw new BadRequestException({
                            success: false,
                            message: '' + ex
                        })
                    }
                    request.body.token = decoded;
                    return true;
                }
            } else {
                throw new UnauthorizedException({
                    success: false,
                    message: 'No token provided.'
                });
            }
        } catch (ex) {
            Logger.error(ex);
            if (ex instanceof BadRequestException) {
                throw new BadRequestException(ex.getResponse())
            }
            throw new UnauthorizedException({
                success: false,
                message: 'No token provided.'
            });
        }
    }
}
