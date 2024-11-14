import { BitlyService, ConfirmEmailReq, ConfirmPasswordResetTokenRequest, LoginReqDto, NotificationRepository, RecoverPasswordReq, RedisCaching, RefreshTokenReq, ResetPasswordReq, Setting, SettingRepository, User, UserLogRepository, UsersRepository, VoiceServiceRequest } from '@app/common';
import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { TokenPayload } from './interfaces/token-payload.interface';
import { UsersService } from './users/users.service';
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcPermissionDeniedException, GrpcUnauthenticatedException } from 'nestjs-grpc-exceptions';
import { NotifyGrpcClientService } from '@app/common/grpc-clients/notify';
import { ObjectId } from 'mongodb';
import * as uaparser from 'ua-parser-js';
import * as geoip from 'geoip-lite';
import * as _ from 'lodash';
import { MessageCenter } from '@app/common/components/messageCenter';
import { config } from '@app/common/config';
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly settingRepository: SettingRepository,
    private readonly userLogRepository: UserLogRepository,
    private readonly usersRepository: UsersRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly redisCache: RedisCaching,
    private readonly bitly: BitlyService,
    private readonly messageCenter: MessageCenter,
    private notifyGrpcClientService: NotifyGrpcClientService,
  ) { }

  async login(request: LoginReqDto) {
    try {
      const user: User = await this.userService.verifyUser(request.headers.instancekey, request.userId, request.password);

      await this.userService.updateUserData(user, request);
      const token = await this.signToken(request, request.headers.instancekey, user._id, user.roles, false)
      // const token = await this.generateJwtToken(user, request.instancekey);
      const jwtTTL = parseInt(this.configService.get('JWT_EXPIRATION'));
      const currentUnixTimestamp = Math.floor(Date.now() / 1000);
      const expiresAt = currentUnixTimestamp + jwtTTL;
      return { token: token };

    } catch (error) {
      console.log('Error occured while login', error);
      if (error instanceof TypeError) {
        throw new GrpcInvalidArgumentException('Some error occured!. Possible solution: Check with your Instance Key.');
      }
      throw new GrpcInternalException(error);
    }
  }

  async confirmEmail(request: ConfirmEmailReq) {
    try {
      const user = await this.userService.getUser({ instancekey: request.instancekey, _id: request.userid });

      if (!user) {
        throw new InternalServerErrorException('User not found');
      }

      if (user.emailVerified) {
        return { response: 'OK' };
      }

      if (request.token) {
        if (request.token !== user.emailVerifyToken || user.emailVerifyExpired > new Date()) {
          throw new InternalServerErrorException('Invalid confirmation token');
        }

        const result = await this.userService.markUserEmailVerified(user._id);

        if (!result) {
          throw new InternalServerErrorException('Failed to verify email');
        }
        return { response: 'Email verified successfully' };
      } else {
        throw new BadRequestException('Confirmation token required');
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw new GrpcInternalException(error.getResponse());
      } else if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.getResponse());
      }
      throw new GrpcInternalException(error);
    }
  }

  private async sendSMSForRecovery(req, baseUrl, phoneNumber, resetToken) {
    var resetLink = baseUrl + 'set-password?token=' + resetToken
    if (!phoneNumber || typeof phoneNumber === 'undefined') {
      Logger.log('phoneNumber is undefined');
      return
    }

    try {
      resetLink = await this.bitly.shorten(resetLink);
    } catch (error) {
      Logger.error('bitly error %j', error)
    }

    this.notificationRepository.setInstanceKey(req.instancekey);
    await this.notificationRepository.create({
      modelId: 'recoverPass',
      isScheduled: true,
      isEmail: false,
      to: phoneNumber,
      sms: 'Please use "' + resetToken + '" as password reset code or follow this link ' + resetLink
    })

    return;
  }

  async recoverPassword(request: RecoverPasswordReq) {
    try {
      const settings = await this.redisCache.getSetting(request);

      var baseUrl = settings.baseUrl
      var product = settings.productName

      if (!settings) {
        throw 'Failed to get settings';
      }

      if (request.phone) {
        var phone = request.phone;
      }

      let requestIs = 'email';
      const condition = [];

      if (request.email) {
        condition.push({ email: request.email.toLowerCase() });
        condition.push({ userId: request.email.toLowerCase() });
      } else if (request.phone) {
        requestIs = 'phone';
        const str = request.phone;

        const phoneNumberMatch = str.match(/\d{10}$/);

        const phoneNumber = phoneNumberMatch ? phoneNumberMatch[0] : '';

        if (phoneNumber) {
          condition.push({ userId: phoneNumber });
          condition.push({ phoneNumber: phoneNumber });
        }
      }

      if (!condition.length) {
        throw new UnprocessableEntityException("This account doesn't exist.");
      }

      this.usersRepository.setInstanceKey(request.instancekey);
      const user = await this.usersRepository.findOne({
        $or: condition
      });

      if (!user) {
        throw new UnprocessableEntityException("This account doesn't exist.");
      }

      const now = new Date();
      const nowCopy = new Date(now);
      nowCopy.setDate(nowCopy.getDate() + 1);
      let dataUpdate = {};
      let resetToken = await this.userService.getRandomDigit(6);
      //@ts-ignore
      dataUpdate.passwordResetToken = resetToken;
      //@ts-ignore
      dataUpdate.passwordResetExpired = nowCopy;

      await this.usersRepository.updateOne({ _id: user._id }, dataUpdate)


      let msg = 'An email has been sent to your email';
      if (requestIs === 'phone') {
        msg = `An sms has been sent to your phone ${resetToken}`;
        await this.sendSMSForRecovery(request, baseUrl, request.phone, resetToken)
      } else if (requestIs === 'email') {
        let options = {
          user: user,
          websiteName: settings.baseUrl,
          forgotLink: settings.baseUrl + 'set-password?token=' + resetToken,
          subject: 'Password change request',
          token: resetToken,
          productName: settings.productName
        };

        let dataMsgCenter = {
          to: user.email,
          modelId: 'recoverPass',
          isScheduled: true
        };

        this.messageCenter.send_with_template(request.instancekey, 'recover-password', options, dataMsgCenter)
      }
      return { response: msg };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async resetPassword(request: ResetPasswordReq) {
    const now = new Date();
    const user = await this.userService.getOneUser({
      passwordResetToken: request.token,
      passwordResetExpired: {
        $gte: now
      }
    });

    if (!user) {
      throw 'Your code is invalid or has expired.';
    }

    return { status: true, user: user }
  }

  async validateJwtToken(jwt: string) {
    try {
      const validToken = this.jwtService.verify(jwt, {
        secret: this.configService.get('JWT_SECRET'),
      });
      console.log(`valid Token:::${JSON.stringify(validToken)}`);
      const tokenPayload = this.jwtService.decode(jwt);
      console.log(`token after decoding: ${JSON.stringify(tokenPayload)}`);
      return tokenPayload;
    } catch (error) {
      console.log(error);
      throw new RpcException(error);
    }
  }

  async generateJwtToken(user: User, ik?: string) {
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
      ik: ik,
    };

    const token = this.jwtService.sign(tokenPayload);
    return token;
  }

  async refreshJwtToken(refreshToken: string) {
    const validToken = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('JWT_SECRET'),
    });

    const tokenPayload = this.jwtService.decode(refreshToken);
  }

  async signToken(req, ik, id, roles, remember) {
    let expiresIn = 60 * 60 * 24;
    if (remember) {
      expiresIn = 60 * 60 * 24 * 365;
    }

    let token = this.jwtService.sign({
      userId: id,
      roles: roles,
      ik: ik,
    })

    this.userLogRepository.setInstanceKey(ik)
    let newLog = await this.userLogRepository.create({
      user: new ObjectId(id),
      role: roles,
      token: token,
      ip: req.ip
    })

    await this.updateLastLoginDate(ik, id);
    const conInfo = await this.lookupConnectionInfo(req, newLog);

    await this.userLogRepository.findByIdAndUpdate(newLog._id, {
      $set: {
        connectionInfo: conInfo
      }
    })

    return token;
  }

  async lookupConnectionInfo(req, userLog) {
    // Although we can get it from user-agent
    try {
      let userAgent = uaparser(req.headers.userAgent)
      delete userAgent.ua

      // set conInfo to more detail object
      let conInfo = userAgent

      // use ip to lookup location
      let geo = geoip.lookup(req.ip)

      Logger.debug(JSON.stringify(geo))
      let location = _.pick(geo, 'country', 'region', 'city', 'metro', 'zip', 'll')

      location.ip = req.ip
      conInfo.locs = [location]
      userLog.connectionInfo = conInfo;

      return conInfo;

    } catch (error) {
      console.log(error)
      Logger.log(error);
    }
  }

  async updateLastLoginDate(ik: string, id: string) {
    try {
      this.usersRepository.setInstanceKey(ik)
      const fuser = await this.usersRepository.updateOne({
        _id: id
      }, {
        $set: {
          lastLogin: new Date()
        }
      })
    } catch (error) {
      Logger.error(error);
    }
  }

  async confirmPasswordResetToken(req: ConfirmPasswordResetTokenRequest) {
    try {
      var now = new Date()
      this.usersRepository.setInstanceKey(req.instancekey);
      const user = await this.usersRepository.findOne({
        passwordResetToken: req.token,
        passwordResetExpired: {
          $gte: now
        }
      }, null, { lean: true });


      // account does not exist
      if (!user) {
        throw new NotFoundException('Your code is invalid or has expired.');
      }

      Logger.log('Confirm request %s', req.token);

      return {
        status: true,
        user: user
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Internal Server Error")
    }
    // Only reset this token when user change password
    // user.passwordResetToken = null
    // // reset token and send auth token to user
    // global.dbInsts[req.headers.instancekey].User.updateOne({
    //     _id: user.id
    // }, {
    //     passwordResetToken: null
    // }, function(err) {
    //     if (err) {
    //         return res.status(422).json(err)
    //     }
    //     res.json({
    //         status: true,
    //         user: user
    //     })
    // })
  }

  async voiceService(req: VoiceServiceRequest) {
    try {
      for (var i = 0; i < config.dbs.length; i++) {
        // Connect to db on start up        
        this.usersRepository.setInstanceKey(config.dbs[i].instancekey);
        let user = await this.usersRepository.findOne({
          userId: req.email, isActive: true
        }, null, { lean: true })

        if (user) {
          var token = await this.signToken(req, config.dbs[i].instancekey, user._id, user.roles, false)
          return {
            token: token,
            instancekey: config.dbs[i].instancekey
          }
        }
      }

      throw new NotFoundException();
    } catch (err) {
      Logger.error(err)
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async requestAuthenticated(req) {
    const settings = await this.redisCache.getSetting(req)
    try {
      // allow access_token to be passed through query parameter as well
      var token = req.body.token || req.query.token || req.headers['x-access-token'];
      let secretKey = settings.ssoConfig.find(d => d.clientID == req.body.provider).clientSecret;
      Logger.debug("app.get('SecretKey')", secretKey);
      if (token) {
        try {
          let result = JSON.parse(token);
          if (result) {
            req.body = result;
            return true;
          } else {
            Logger.error('Invalid token')
            throw new BadRequestException({
              success: false,
              message: '' + 'Invalid token'
            });
          }
        } catch (ex) {
          const decoded = this.jwtService.verify(token, { secret: secretKey })
          if (!decoded) {
            throw new BadRequestException({
              success: false,
              message: ''
            })
          } else {
            req.body = decoded;
            return true;
          }
        }
      } else {
        throw new UnauthorizedException({
          success: false,
          message: 'No token provided.'
        });
      }
    } catch (ex) {
      throw new UnauthorizedException({
        success: false,
        message: 'No token provided.'
      });
    }
  }

  async refreshToken(request: RefreshTokenReq) {
    try {
      const oldToken = request.accesstoken || request.authtoken;
      const decodedUser = this.jwtService.decode(oldToken) as any;
      if (!decodedUser) {
        throw new ForbiddenException();
      }

      const expiresIn = request.remember ? 60 * 60 * 24 * 365 : 60 * 60 * 24;
      const payload = { _id: decodedUser.userId, roles: decodedUser.roles, ik: request.instancekey };
      const secret = this.configService.get<string>('JWT_SECRET');

      const newToken = this.jwtService.sign(payload, { secret, expiresIn });
      console.log('token', );
      
      this.userLogRepository.setInstanceKey(request.instancekey);
      this.userLogRepository.updateOne({ token: oldToken }, { $set: { token: newToken } })

      console.debug(`***Instance key ${request.instancekey}`);
      console.debug(`***Refresh token for ${decodedUser.roles} ${decodedUser.userId}`);
      return { token: newToken };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new GrpcPermissionDeniedException(error);
      }
      throw new GrpcInternalException(error.message);
    }
  }

} 