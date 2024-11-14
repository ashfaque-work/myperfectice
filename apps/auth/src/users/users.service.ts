import { AddEventsReq, AddExperienceReq, AddLocationReq, AddStudentInClassroomReq, AddSubjectsReq, AddUtmVisitorReq, AttemptDetailRepository, AttemptRepository, AttendanceRepository, BlockuserReq, ChangeNewPasswordReq, ChangePasswordReq, ClassroomRepository, CloseUserAccountReq, CompetenciesRepository, CountTotalUsersReq, CouponRepository, CourseRepository, CreateUserDto, CreateUserResponse, DeleteEventReq, DossierStatusUpdateReqDto, EditLocationReq, EducoinsReq, EmployabilityIndexReq, EventBus, EventsRepository, ExportUsersReq, FindOnlineUsersRequest, FindRequest, GetCertificationReq, GetEventsRequest, GetLiveBoardClassroomsReq, GetMeReq, GetPracticeSummaryReq, GetStudentEventsRequest, GetSuperCoinsActivitiesReq, GetTotalCoinsReq, GetTurnAuthReq, GetTurnConfigReq, GetUpdateLocationStatusReq, GetUserLevelInfoReq, GetUserPublicProfileReq, GetUserRequest, GetUserSuperCoinActivitiesReq, InviteUsersReq, JoinOneOnOneWbSessionRequest, LinkPreviewReq, LocationRepository, LoginAfterOauthReq, LoginReqDto, ManageSessionReq, MarketingUtmRepository, NotificationRepository, NotificationTemplateRepository, PartnerUserReq, PracticeSetRepository, PsychoIndexReq, RecoverPasswordReq, RedeemCoinsReq, RemoveAdditionalInfoReq, ReportUserReq, ReportedUserRepository, RequestEmailCodeReq, SendForReviewDossierReq, Setting, SettingRepository, SocialLoginReq, SocketClientService, StartOneOnOneWbSessionRequest, SubjectRepository, TempConfirmationCodeReq, TempSignupReq, UnblockUserReq, UnsubscribeReq, UpdateAdditionalDataRequest, UpdateAmbassadorReq, UpdateConnectionInfoReq, UpdateDossierCommentsReqDto, UpdateEventReq, UpdateExperienceReq, UpdateIdentityImageReq, UpdateMentorPreferencesReq, UpdateOptionsDataRequest, UpdateRequest, UpdateRoleRequest, UpdateSubjectsReq, UpdateTempUserRequest, UpdateUserCountryReq, UpdateUserDto, UpdateUserStatusReq, UpdateUtmStatusReq, User, UserCourseRepository, UserLiveBoardRequest, UserRecentActivityReq, UserSuperCoinsRepository, UsersRepository, ValidateUserPictureRequest, VerifiedCodeReq, canOnlySeeHisOwnContents, canOnlySeeLocationContents, getRandomCode, isEmail } from "@app/common";
import { NotifyGrpcClientService } from "@app/common/grpc-clients/notify";
import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException, GrpcPermissionDeniedException } from 'nestjs-grpc-exceptions';
import { ObjectId } from 'mongodb';
import * as geoip from 'geoip-lite';
import { callingCodes } from 'countryjs';
import { AuthService } from '../auth.service';
import * as config from '@app/common/config';
import * as crypto from "node:crypto"
import * as urlMetadata from 'url-metadata';
import { UserLogRepository } from '@app/common/database/repositories/userLog.repository';
import { SuperCoinsRepository } from '@app/common/database/repositories/supercoins.repository';
import timeHelper from '@app/common/helpers/time-helper';
import { RedisCaching } from '@app/common/services/redisCaching.service';
import mongoose from 'mongoose';
import * as _ from 'lodash';
import country from 'countryjs';
import { MessageCenter } from '@app/common/components/messageCenter';
import axios from 'axios';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import * as uaparser from 'ua-parser-js';
import * as moment from 'moment';
import { WhiteboardService } from '@app/common/components/whiteboard/whiteboard.service';
import { BlockEmail } from '@app/common/components/blockEmail';
import slugify from "slugify";
import { getAssets } from "@app/common/config";
import { S3Service } from "@app/common/components/aws/s3.service";


@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authservice: AuthService,
    private readonly usersRepository: UsersRepository,
    private notifyGrpcClientService: NotifyGrpcClientService,
    private readonly locationRepository: LocationRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly classroomRepository: ClassroomRepository,
    private readonly settingRepository: SettingRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly userLogRepository: UserLogRepository,
    private readonly eventsRepository: EventsRepository,
    private readonly supercoinsRepository: SuperCoinsRepository,
    private readonly userSuperCoinsRepository: UserSuperCoinsRepository,
    private readonly couponRepository: CouponRepository,
    private readonly competenciesRepository: CompetenciesRepository,
    private readonly practiceSetRepository: PracticeSetRepository,
    private readonly attemptDetailRepository: AttemptDetailRepository,
    private readonly reportedUserRepository: ReportedUserRepository,
    private readonly marketingUtmRepository: MarketingUtmRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly userCourseRepository: UserCourseRepository,
    private readonly courseRepository: CourseRepository,
    private readonly redisCaching: RedisCaching,
    private readonly messageCenter: MessageCenter,
    private readonly whiteboardService: WhiteboardService,
    private readonly eventBus: EventBus,
    private readonly socketClientService: SocketClientService,
    private readonly s3Service: S3Service
  ) { }

  async create(request: CreateUserDto) {
    try {
      console.log(request);

      let newUser = { ...request }
      delete newUser.user;
      delete newUser.password;
      newUser.roles = request.userRoles;
      //check if email or phone nmber already exists or not
      await this.validateCreateUserDto(request);

      this.settingRepository.setInstanceKey(request.instancekey);
      const settings = await this.settingRepository.findOne({ 'slug': 'whiteLabel' });

      await this.setDefaultDataForUser(request, newUser, settings);

      if (!newUser.country) {
        throw 'Missing default country';
      }

      if (newUser.roles.includes('teacher')) {
        newUser.isMentor = true;
      } else if (newUser.roles.includes('student') && !newUser.passingYear) {
        this.settingRepository.setInstanceKey(request.instancekey);
        let masterData = await this.settingRepository.findOne({ slug: 'masterdata' }, { passingYear: 1 });
        if (masterData && masterData.passingYear.find(y => y.active && y.default)) {
          newUser.passingYear = masterData.passingYear.find(y => y.active && y.default).name;
        }
      }

      if (!request.password) {
        throw "Password is required";
      }

      const salt = await crypto.randomBytes(16).toString('hex');
      const hashedPassword = await this.generatedHashedPassword(request.password, salt);

      newUser.provider = request.provider || 'local';
      if (newUser.phoneNumber && newUser.country.callingCodes) {
        newUser.phoneNumberFull = newUser.country.callingCodes[0] + newUser.phoneNumber;
      }

      if (request.tempPassword) {
        newUser.emailVerifyToken = null;
        newUser.emailVerifyExpired = null;
        newUser.emailVerified = true;
        newUser.forcePasswordReset = true;
      } else {
        newUser.emailVerifyToken = await this.getVerificationCode(request);
        const now = new Date();
        newUser.emailVerifyExpired = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);
      }

      if (request.user) {
        newUser.createdBy = new ObjectId(request.userid);
        if (request.user.activeLocation) {
          newUser.activeLocation = request.user.activeLocation
          newUser.locations = [request.user.activeLocation]
          newUser.onboarding = true
        }
      } else if (request.joiningInstitute && request.instituteId) {
        this.locationRepository.setInstanceKey(request.instancekey);
        let institute = await this.locationRepository.findOne({ _id: request.instituteId });
        if (institute) {
          newUser.activeLocation = institute._id;
          newUser.locations = [institute._id];
          newUser.onboarding = true;
          newUser.subjects = institute.subjects;
        }
      }

      if (request.tempPassword) {
        newUser.tempPassword = request.tempPassword;
      }
      this.usersRepository.setInstanceKey(request.instancekey);
      console.log(newUser.birthdate);

      // if(newUser.birthdate == ""){

      // }
      const user = await this.usersRepository.create({ ...newUser });

      await this.usersRepository.findByIdAndUpdate(user._id, {
        hashedPassword,
        salt
      })

      if (!user) {
        throw 'Failed to add user';
      }

      let emailText = 'User is created successfully.'
      if (newUser.emailVerifyToken) {
        emailText = `Your email verification code: ${newUser.emailVerifyToken}`
      }

      this.notifyGrpcClientService.notifyEmail({
        email: user.email,
        text: emailText
      }).catch(error => console.error('Error sending notification email:', error.message));


      //sendConfirmationLinkAndCode(req, newUser, function (err, result)

      if (newUser.roles.includes('student') && request.seqCode) {
        await this.addUserInClassroom(request, newUser, request.seqCode);
      }

      if (newUser.roles.includes('teacher')) {
        let instituteId = null;
        if (request.joiningInstitute && request.instituteId) {
          instituteId = request.instituteId
        } else if (request.user && request.user.activeLocation) {
          instituteId = request.user.activeLocation
        }
        // add user to institute and remove invitees
        if (instituteId) {
          this.locationRepository.setInstanceKey(request.instancekey);
          await this.locationRepository.findOneAndUpdate({ _id: instituteId },
            {
              $set: {
                "invitees.$[inner].joined": true,
                "invitees.$[inner].joinedAt": new Date()
              },
              $addToSet: { teachers: user._id }
            },
            {
              arrayFilters: [{
                "inner.email": { "$eq": newUser.email }
              }]
            })
        }
      }
      return { response: 'OK' };
    } catch (err) {
      console.log(err);
      throw new GrpcInternalException(err);
    }
  }

  private async validateCreateUserDto(request: CreateUserDto) {
    this.usersRepository.setInstanceKey(request.instancekey);
    if (request.email) {
      const existingUser = await this.usersRepository.findOne({ email: request.email });
      if (existingUser) {
        throw 'Email already in use';
      }
    } else if (request.phoneNumber) {
      const existingUser = await this.usersRepository.findOne({ phoneNumber: request.phoneNumber });
      if (existingUser) {
        throw 'Phone NUmber already in use';
      }
    }
  }

  //update user date when login
  async updateUserData(user: User, request: LoginReqDto) {
    let updateUser: any = { $inc: { loginCount: 1 } };

    if (request.instituteId && user.roles.some(role => ['student', 'teacher', 'mentor'].includes(role))) {
      const institute = await this.locationRepository.findOne({ _id: request.instituteId });
      if (institute) {
        updateUser.$set = {
          activeLocation: institute._id,
          onboarding: true
        };
        updateUser.$addToSet = {
          locations: institute._id
        };

        if (!user.roles.includes('student')) {
          updateUser.$addToSet.subjects = { $each: institute.subjects };
        }

      }
    }
    this.usersRepository.setInstanceKey(request.headers.instancekey);
    await this.usersRepository.findOneAndUpdate({ _id: user._id }, updateUser);
  }

  private generatedHashedPassword(password, salt): Promise<string> {
    console.log("??????????", password);

    return new Promise((resolve, reject) => {
      let newSalt = Buffer.from(salt, "hex");
      crypto.pbkdf2(password, newSalt, 10000, 64, 'sha1', (err, key) => {
        if (err) {
          reject(err);
        } else {
          resolve(key.toString('hex'));
        }
      });
    });
  }

  async verifyUser(instancekey: string, identifier: string, password: string) {
    try {
      const isEmail = this.validateEmail(identifier);
      const isPhoneNumber = this.validatePhoneNumber(identifier);

      let user;
      if (isEmail) {
        this.usersRepository.setInstanceKey(instancekey);
        user = await this.usersRepository.findOne({ email: identifier });
      } else if (isPhoneNumber) {
        this.usersRepository.setInstanceKey(instancekey);
        user = await this.usersRepository.findOne({ phoneNumber: identifier });
      } else {
        throw 'Please provide a valid email or phone number';
      }

      if (user) {
        let generatedPass = await this.generatedHashedPassword(password, user.salt);

        const storedHash = user.hashedPassword;
        if (generatedPass !== storedHash) {
          throw 'Credentials are not valid';
        }
      } else {
        throw 'Credentials are not valid';
      }

      return user;
    } catch (error) {
      console.log(error);
      throw error;
      throw error;
    }
  }

  async getUser(request: GetUserRequest) {
    try {
      this.usersRepository.setInstanceKey(request.instancekey)
      const res = await this.usersRepository.findOne({ _id: request._id });
      if (!res) {
        throw new NotFoundException("User document not found");
      }
      return res;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message)
      }
      else if (error instanceof TypeError) {
        console.log(error);
        throw new GrpcInvalidArgumentException('Some error occured!. Possible solution: Check with your Instance Key.');
      }
      else {
        console.log("Token Error", error);
        throw new GrpcInternalException("Internal Server Error");
      }
    }
  }

  async getOneUser(req) {
    const res = await this.usersRepository.findOne(req);
    return res;
  }

  private async userUpdateMail(req, user, template, sms) {
    const settings = await this.redisCaching.getSetting(req)
    if (isEmail(user.userId)) {
      let dataMsgCenter = {
        to: user.userId,
        modelId: 'adminUpdateUser',
        isScheduled: true
      };

      let options = {
        user: user,
        baseUrl: settings.baseUrl,
        websiteName: settings.baseUrl,
        logo: settings.baseUrl,
        subject: 'Admin has changed your account details'
      }

      this.messageCenter.sendWithTemplate(req, template, options, dataMsgCenter);
    } else {
      if (!user.phoneNumber || user.country.callingCodes.length == 0) {
        return;
      }
      this.notificationRepository.setInstanceKey(req.instancekey);
      await Promise.all(user.country.callingCodes.map(async (callingCode) => {
        const phoneNumber = callingCode + user.phoneNumber;
        await this.notificationRepository.create({
          to: phoneNumber,
          sms: sms,
          modelId: 'adminUpdateUser',
          isEmail: false,
          isScheduled: true
        });
      }));
    }
  }

  async updateUser(request: UpdateUserDto) {
    try {
      console.log(request);

      var userParams = _.omit(request.body, '_id', 'createdAt', 'emailVerified', 'hashedPassword', 'passwordResetToken', 'salt', 'gradeObject', 'status', '__v')
      var toRemoveSubjects = []

      if (request.body.subjects && request.body.subjects.length) {
        this.subjectRepository.setInstanceKey(request.instancekey);
        const subjectExists = await this.subjectRepository.countDocuments({
          active: true,
          _id: { $in: userParams.subjects }
        });

        if (!subjectExists) {
          throw new BadRequestException('Please provide valid subjects');
        }
      }

      let updatedUserResult;
      let user: User = null;

      if (request.body.newUserId) {
        this.usersRepository.setInstanceKey(request.instancekey)
        user = await this.usersRepository.findOne({ userId: request.body.newUserId }, null, { lean: true });

        if (user) {
          throw new BadRequestException('The specified user ID is already in use');
        }

        user = await this.usersRepository.findOne({ _id: request._id });

        user.name = userParams.name
        user.roles = userParams.roles;
        const updatedSubjectIds = new Set(userParams.subjects.map(ps => ps.toString()));
        toRemoveSubjects = user.subjects.filter(s => !updatedSubjectIds.has(s.toString()));
        // toRemoveSubjects = user.subjects.filter(s => !userParams.subjects.find(ps => s.equals(ps)))
        user.subjects = userParams.subjects.map((sub) => new ObjectId(sub));
        user.forcePasswordReset = userParams.forcePasswordReset;

        if (userParams.passingYear) {
          user.passingYear = userParams.passingYear
        }

        user.locations = userParams.locations;
        user.userId = userParams.newUserId;
        user.placementStatus = userParams.placementStatus;

        if (!isEmail(userParams.newUserId)) {
          user.phoneNumber = userParams.newUserId;
        } else {
          user.email = userParams.newUserId;
        }

        if (userParams.rollNumber) {
          user.rollNumber = userParams.rollNumber;
        }

        if (userParams.registrationNo) {
          user.registrationNo = userParams.registrationNo;
        }

        if (request.body.password) {
          user.emailVerifyToken = "";
          user.emailVerifyExpired = null;
          user.emailVerified = true;

          user.passwordResetToken = null;
          // user.password = await bcrypt.hash(request.password, 10);
          const salt = await crypto.randomBytes(16).toString('hex');
          const hashedPassword = await this.generatedHashedPassword(request.body.password, salt);
          user.salt = salt;
          user.hashedPassword = hashedPassword;
        }

        if (request.body.avatar) {
          user.avatar = request.body.avatar
        }
        if (request.body.avatarUrl) {
          user.avatarUrl = userParams.avatarUrl
        }
        if (request.body.avatarUrlSM) {
          user.avatarUrlSM = userParams.avatarUrlSM
        }
        if (request.body.birthdate) {
          user.birthdate = userParams.birthdate
        } else {
          user.birthdate = null
        }

        if (userParams.isVerified !== undefined) {
          user.isVerified = userParams.isVerified
        }
        if (userParams.whiteboard !== undefined) {
          user.whiteboard = userParams.whiteboard
        }
        if (userParams.liveboard !== undefined) {
          user.liveboard = userParams.liveboard
        }
        user.updatedAt = new Date()
        user.lastModifiedBy = new ObjectId(request.user._id)
        updatedUserResult = await this.usersRepository.findOneAndUpdate(user._id, user);

        if (!updatedUserResult) {
          throw 'Failed to update user details';
        }

        if (request.body.password) {
          var sms = 'Admin has reset your User ID to ' + user.userId + 'and password to ' + request.body.password + '. It is recommended to change password on Profile page after login  for SMS ';
          var template = "admin-change-password-userId";
          this.userUpdateMail(request, user, template, sms)
          this.invalidateTokenAfterPasswordChanged(request, request.instancekey, user._id)
          this.eventBus.emit('User.changedPasssword', {
            instanceKey: request.instancekey,
            timezoneOffset: request.timezoneoffset,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email
            }
          });
        } else {
          var sms = 'Admin has reset your User ID to ' + user.userId + '. Your password remains the same. You may request a new password in case you forgot.';
          var template = "admin-change-userId";
          this.userUpdateMail(request, user, template, sms)
        }
      } else {
        this.usersRepository.setInstanceKey(request.instancekey);
        user = await this.usersRepository.findOne({ _id: request._id })

        if (!user) {
          throw ('User does not exists');
        }

        user.name = userParams.name;
        user.roles = userParams.roles;

        const updatedSubjectIds = new Set(request.body.subjects.map(ps => ps.toString()));
        toRemoveSubjects = user.subjects.filter(s => !updatedSubjectIds.has(s.toString()));

        user.subjects = request.body.subjects.map((sub) => new ObjectId(sub));
        user.placementStatus = request.body.placementStatus;
        user.forcePasswordReset = request.body.forcePasswordReset;
        user.locations = userParams.locations;
        if (userParams.passingYear) {
          user.passingYear = userParams.passingYear
        }

        if (userParams.rollNumber) {
          user.rollNumber = userParams.rollNumber;
        }

        if (userParams.registrationNo) {
          user.registrationNo = userParams.registrationNo;
        }
        if (request.body.password) {
          user.emailVerifyToken = "";
          user.emailVerifyExpired = null;
          user.passwordResetToken = null;
          user.emailVerified = true;
          const salt = await crypto.randomBytes(16).toString('hex');
          const hashedPassword = await this.generatedHashedPassword(request.body.password, salt);
          user.salt = salt;
          user.hashedPassword = hashedPassword;

        }
        if (request.body.avatar) {
          user.avatar = userParams.avatar
        }

        if (request.body.avatarUrl) {
          user.avatarUrl = userParams.avatarUrl
        }

        if (request.body.avatarUrlSM) {
          user.avatarUrlSM = userParams.avatarUrlSM
        }

        if (request.body.birthdate) {
          user.birthdate = userParams.birthdate
        } else {
          user.birthdate = null
        }

        if (userParams.isVerified !== undefined) {
          user.isVerified = userParams.isVerified
        }

        if (userParams.whiteboard !== undefined) {
          user.whiteboard = userParams.whiteboard
        }
        if (userParams.liveboard !== undefined) {
          user.liveboard = userParams.liveboard
        }
        user.lastModifiedBy = new ObjectId(request.user._id);
        user.updatedAt = new Date();

        updatedUserResult = await this.usersRepository.findByIdAndUpdate(
          user._id,
          user,
          { lean: true });

        if (!updatedUserResult) {
          throw 'Failed to update user details';
        }

        if (request.body.password) {
          var sms = 'Admin has reset your password to ' + request.body.password + '. Please login and change password on Profile page.'
          var template = "admin-change-password";
          this.userUpdateMail(request, user, template, sms);
          this.invalidateTokenAfterPasswordChanged(request, request.instancekey, user._id)
          this.eventBus.emit('User.changedPasssword', {
            instanceKey: request.instancekey,
            timezoneOffset: request.timezoneoffset,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email
            }
          });
        }
      }

      if (user && user.roles.includes('director') && user.activeLocation && user.subjects.length) {
        this.locationRepository.setInstanceKey(request.instancekey);
        await this.locationRepository.updateOne({ _id: user.activeLocation }, { $addToSet: { subjects: { $each: user.subjects } } })
        if (toRemoveSubjects.length) {
          // can only remove subject that is not created in this institute
          toRemoveSubjects = await this.subjectRepository.distinct('_id', { _id: { $in: toRemoveSubjects }, location: { $ne: user.activeLocation } })
          await this.locationRepository.updateOne({ _id: user.activeLocation }, { $pull: { subjects: { $in: toRemoveSubjects } } })
        }
      }
      return { status: 'OK' }
    } catch (error) {
      Logger.error(error);
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message)
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async updateUserCountry(request: UpdateUserCountryReq) {
    try {
      const userId = request._id;
      delete request._id;
      const updatedCounry = await this.usersRepository.findOneAndUpdate(
        { _id: userId },
        { $set: { country: request } },
        { new: true, lean: true }
      );

      if (!updatedCounry) {
        throw new GrpcNotFoundException('User not found');
      }

      return updatedCounry.country;
    } catch (error) {
      console.error('Error updating user country', error);
      throw new GrpcInternalException('Something went wrong while updating user country');
    }
  }

  async dossierStatusUpdate(request: DossierStatusUpdateReqDto): Promise<any> {
    try {
      const mongooseId = new ObjectId(request._id);
      //check if user exist
      const user = await this.usersRepository.findOne({ _id: mongooseId });

      if (!user) {
        throw new Error('User not found');
      }

      const updateQuery = {
        $set: {
          "dossier.mentorInfo": {
            user: request.mentorInfo.user,
            name: request.mentorInfo.name,
          },
          "dossier.status": request.dossier.status,
          "dossier.statusChangedAt": new Date(),
        },
        $push: {
          notes: { $each: request.dossier.notes }
        }
      }

      const updatedUser = await this.usersRepository.findOneAndUpdate(
        { _id: mongooseId },
        updateQuery,
        { new: true, lean: true }
      );

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return updatedUser;
    } catch (error) {
      throw new Error('Failed to update user dossier');
    }
  }

  async updateDossierComments(request: UpdateDossierCommentsReqDto) {
    try {
      const mongooseId = new ObjectId(request._id);
      //check if user exist
      const user = await this.usersRepository.findOne({ _id: mongooseId });

      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = await this.usersRepository.findOneAndUpdate(
        { _id: mongooseId },
        { $push: { 'dossier.feedbacc': request.feedback } }
      );

      if (!updatedUser) {
        throw new Error('Failed to update feedback');
      }

      return { response: updatedUser };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async updateUserStatus(request: UpdateUserStatusReq) {
    try {
      const mongooseId = new ObjectId(request._id);
      //check if user exist
      const user = await this.usersRepository.findOne({ _id: mongooseId });

      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = await this.usersRepository.findOneAndUpdate(
        { _id: mongooseId },
        {
          $set: { isActive: request.isActive }
        });

      if (!updatedUser) {
        throw new Error('Failed to update status');
      }

      if (!request.isActive) {
        //invalidate user token
      }

      return { response: 'Status updated' };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async sendForReviewDossier(request: SendForReviewDossierReq) {
    try {
      const mongooseId = new ObjectId(request._id);
      //check if user exist
      const user = await this.usersRepository.findOne({ _id: mongooseId });

      if (!user) {
        throw new Error('User not found');
      }

      let dossier = {};

      if (user.dossier) {
        dossier = { ...user.dossier }
        dossier['notes'].push(request.notes)
      }

      dossier['statusChangedAt'] = new Date();
      dossier['status'] = 'pending'

      let result = await this.usersRepository.findOneAndUpdate(
        { _id: mongooseId },
        { $set: { dossier: dossier } });

      await this.sendDossierSubmissionEmail(request)

      return { response: result };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async blockuser(request: BlockuserReq) {
    try {
      const usertoblock = new ObjectId(request.user);
      //check if user exist
      await this.usersRepository.findOneAndUpdate({ _id: request.userid },
        { $addToSet: { blockedUsers: usertoblock } });

      // logic to remove user from following list
      //...

      return { response: 'User blocked' }
    } catch (e) {
      throw new GrpcInternalException(e);
    }
  }

  async addLocation(request: AddLocationReq) {
    try {

      const existingLocation = await this.locationRepository.findOne({
        slugfly: this.generateSlug(request.name),
      });

      if (existingLocation) {
        throw ('A location with this name already exists. Please enter another name.')
      }

      const newLocation = await this.locationRepository.create({
        name: request.name,
        user: request.userid,
        slugfly: this.generateSlug(request.name)
      })

      await this.usersRepository.findOneAndUpdate(
        { _id: request.userid },
        { $push: { locations: newLocation._id } },
        { lean: true, new: true }
      );

      return { response: newLocation };
    } catch (error) {
      console.error('Error adding location:', error);
      throw new GrpcInternalException(error);
    }
  }

  async editLocation(request: EditLocationReq) {
    try {
      const existingLocation = await this.locationRepository.findOne({
        slugfly: this.generateSlug(request.name),
      });

      if (existingLocation) {
        throw ('A location with this name already exists. Please enter another name.')
      }

      const editLocation = await this.locationRepository.findOneAndUpdate(
        { _id: request._id },
        { $set: { name: request.name, slugfly: this.generateSlug(request.name) } },
        { lean: true, new: true }
      );

      return { response: editLocation };
    } catch (error) {
      console.error('Error adding location:', error);
      throw new GrpcInternalException(error);
    }
  }

  async addSubjects(request: AddSubjectsReq) {
    try {
      if (!request.subjects || !request.subjects.length) {
        throw ('Missing required subject IDs');
      }

      const foundSubjects = await this.subjectRepository.find({
        _id: { $in: request.subjects },
      }, { _id: 1, name: 1 });

      if (!foundSubjects.length) {
        throw ('No subjects found with provided IDs');
      }

      const subjectIds = foundSubjects.map(subject => subject._id);

      await this.usersRepository.findOneAndUpdate(
        { _id: request.userid },
        { $addToSet: { subjects: { $each: subjectIds } } }
      );

      return { response: 'Subjects added successfully' };
    } catch (error) {
      console.error('Error adding subjects:', error);
      throw new GrpcInternalException(error);
    }
  }

  async exportUsers(request: ExportUsersReq) {
    try {
      let condition: any = {};
      condition.isActive = true;
      let sort = [
        ['createdAt', 'descending']
      ];

      let projection = {
        name: 1,
        userId: 1,
        roles: 1,
        createdAt: 1,
        lastLogin: 1
      }

      if (request.searchText) {
        condition.$or = [{
          'name': {
            "$regex": request.searchText,
            "$options": "i"
          }
        }, {
          'userId': request.searchText
        }]
      }
      if (request.roles) {
        var roles = request.roles.split(',');
        condition.roles = {
          $in: roles
        }
      }

      const userList = await this.usersRepository.aggregate([{ $match: condition }, { $project: projection }, { $sort: { 'createdAt': -1 } }], { allowDiskUse: true });
      console.log("from the service microservice");
      if (userList.length > 0 && request.lastAttempt) {
        let attemptPromises = userList.map(async (u) => {
          if (u.roles !== config.config.userRoles) {
            return Promise.resolve()
          }
          let condition = {
            user: u._id,
            isAbandoned: false
          };
          let p = this.attemptRepository.findOne(condition, { createdAt: 1 }, { lean: true, sort });
          p.then(a => {
            if (a) {
              u.lastAttempt = a.createdAt
            }
          })

          return p;
        })

        await Promise.all(attemptPromises);
      }
      return {
        response: userList
      }

    } catch (error) {

    }
  }

  async exportLevelReport(request: {}) {
    try {
      let condition: any = {};
      condition.roles = 'student';
      condition.isActive = true;
      let sort = [
        ['createdAt', 'descending']
      ];
      let projection = {
        name: 1,
        userId: 1,
      }
      const levelReport = await this.usersRepository.aggregate([{
        $match: condition
      }, {
        $project: projection
      }])

      if (!levelReport) {
        throw new GrpcNotFoundException("Report not found!!")
      }

      return {
        response: levelReport
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async getCertification(request: GetCertificationReq) {
    try {
      console.log("request code", request)
      const com = await this.competenciesRepository.findOne({ certCode: request.code });
      // const com = await this.competenciesRepository.findOne({_id: new ObjectId('5f746360792dd5098956cef5')});
      if (!com) {
        console.log("error")
        throw new Error("Unable to fetch certification. Check your certCode!");
      }

      console.log(com);

      return {
        certPath: 'download/certificate/' + com.userId.toString() + '/' + request.code + '.pdf'
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getUserPublicProfile(request: GetUserPublicProfileReq) {
    try {
      let id = new ObjectId(request.userId)
      let user = await this.usersRepository.findById(id,
        {
          name: 1, userId: 1, avatar: 1, provider: 1, google: 1, facebook: 1, youtube: 1, whatsapp: 1,
          linkedIn: 1, instagram: 1, coverImageUrl: 1, institute: 1, coreBranch: 1,
          specialization: 1, knowAboutUs: 1, experiences: 1, createdAt: 1, roles: 1, blockedUsers: 1
        }
      )
      return {
        response: user
      }
    } catch (error) {
      console.error('Error getting user public profile:', error);
      throw new GrpcInternalException(error);
    }
  }

  async getNewRollNumber(request: {}) {
    let newRoll = 'P' + getRandomCode(9);
    try {
      let found = await this.usersRepository.findOne({ rollNumber: newRoll });
      while (found != null) {
        newRoll = 'P' + getRandomCode(9);
        found = await this.usersRepository.findOne({ rollNumber: newRoll });
      }

      return {
        response: newRoll
      }
    } catch (error) {
      console.error('Error getting new roll numbver:', error);
      throw new GrpcInternalException(error);
    }
  }

  async me(request: GetMeReq) {
    try {
      if (request.user) {
        let userId = request.user._id;
        if (request.isTempt) {
          return {
            response: request.user
          }
        }

        const userData = await this.usersRepository.findOne({ _id: userId }, '-salt -hashedPassword -__v');
        if (!userData) {
          return {
            response: {}
          }
        }

        if (userData.dossier && userData.dossier.feedback && userData.dossier.feedback.length > 0) {
          for (let fb of userData.dossier.feedback) {
            if (fb.userInfo && fb.userInfo.user) {
              let userResp = await this.usersRepository.findById(fb.userInfo.user);
              if (userResp && userResp.avatar) {
                fb.userInfo.avatar = userResp.avatar
              } else {
                fb.userInfo.avatar = ''
              }
            }
          }
        }

        if (userData.dossier && userData.dossier.notes && userData.dossier.notes.length > 0) {
          for (let fb of userData.dossier.notes) {
            if (fb.userInfo && fb.userInfo.user) {
              let userResp = await this.usersRepository.findById(fb.userInfo.user);
              if (userResp && userResp.avatar) {
                fb.userInfo.avatar = userResp.avatar
              } else {
                fb.userInfo.avatar = ''
              }
            }
          }
        }

        if (userData.activeLocation) {
          let instituteResp = await this.locationRepository.findById(userData.activeLocation)
          if (instituteResp) {
            userData.primaryInstitute = {
              name: instituteResp.name,
              preferences: instituteResp.preferences,
              logo: instituteResp.imageUrl,
              owned: instituteResp.user.equals(request.user._id)
            }
          }
        }


        if (!userData.userId) {
          this.eventBus.emit('User.autoUpdateUserId', {
            insKey: request.instancekey,
            user: {
              _id: userData._id,
              userId: userData.userId,
              email: userData.email,
              phoneNumber: userData.phoneNumber
            }
          });
        }

        return {
          response: userData
        }

      }
    } catch (error) {
      console.error('Error getting the user:', error);
      throw new GrpcInternalException(error);
    }
  }

  async updateLocationStatus(request: GetUpdateLocationStatusReq) {
    try {
      const updatedField = await this.locationRepository.updateOne({ '_id': request._id }, { $set: { "active": false } });
      return {
        response: updatedField
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  private async updateProfileComplete(req: any, isUpdate: boolean) {
    try {
      let profileCompleted = 0;
      let profileField = 12;
      let fieldWeightage = 0;
      let alreadyCompleted = 0;
      let totalWithWeight = 0;

      let currentUser = await this.usersRepository.findOne({ _id: req.user._id });
      let user = currentUser;
      alreadyCompleted = user.profileCompleted;
      this.redisCaching.getSetting(req, async (settings) => {
        if (settings.profileDistribution) {

          if (settings.profileDistribution.basicProfile) {
            fieldWeightage = settings.profileDistribution.basicProfile / profileField;
            totalWithWeight = profileField * fieldWeightage;

            if (user.name) {
              profileCompleted = profileCompleted + fieldWeightage;
            }

            if (user.country && user.country.name) {
              profileCompleted = profileCompleted + fieldWeightage;
            }

            if (user.email) {
              profileCompleted = profileCompleted + fieldWeightage;
            }
            if (user.phoneNumber) {
              profileCompleted = profileCompleted + fieldWeightage;
            }
            if (user.rollNumber) {
              profileCompleted = profileCompleted + fieldWeightage;
            }
            if (user.passingYear) {
              profileCompleted = profileCompleted + fieldWeightage;
            }

            if (user.avatar || user.avatarSM || user.avatarUrl || user.avatarUrlSM) {
              profileCompleted = profileCompleted + fieldWeightage;
            }
            if (user.coverImageUrl) {
              profileCompleted = profileCompleted + fieldWeightage;
            }
            if (user.specialization && user.specialization.length > 0) {
              profileCompleted = profileCompleted + fieldWeightage;
            }
            if (user.institute) {
              profileCompleted = profileCompleted + fieldWeightage;
            }
            if (user.coreBranch) {
              profileCompleted = profileCompleted + fieldWeightage;
            }
            if (user.knowAboutUs) {
              profileCompleted = profileCompleted + fieldWeightage;
            }

            console.log(profileCompleted);
            console.log(settings.features);
          }

          if (settings.features && settings.features.resume && user.roles.includes('student')) {
            console.log("^^^^ inside setting feature ^^^^")
            if (settings.profileDistribution.academicProjects) {
              if (user.academicProjects && user.academicProjects.length > 0) {
                profileCompleted = profileCompleted + settings.profileDistribution.academicProjects
              }
              totalWithWeight = totalWithWeight + settings.profileDistribution.academicProjects
            }

            if (settings.profileDistribution.awardsAndRecognition) {
              if (user.awardsAndRecognition && user.awardsAndRecognition.length > 0) {
                profileCompleted = profileCompleted + settings.profileDistribution.awardsAndRecognition
              }
              totalWithWeight = totalWithWeight + settings.profileDistribution.awardsAndRecognition
            }

            if (settings.profileDistribution.extraCurricularActivities) {
              if (user.extraCurricularActivities && user.extraCurricularActivities.length > 0) {
                profileCompleted = profileCompleted + settings.profileDistribution.extraCurricularActivities
              }
              totalWithWeight = totalWithWeight + settings.profileDistribution.extraCurricularActivities
            }

            if (settings.profileDistribution.trainingCertifications) {
              if (user.trainingCertifications && user.trainingCertifications.length > 0) {
                profileCompleted = profileCompleted + settings.profileDistribution.trainingCertifications
              }
              totalWithWeight = totalWithWeight + settings.profileDistribution.trainingCertifications
            }

            if (settings.profileDistribution.educationDetails) {
              if (user.educationDetails && user.educationDetails.length > 0) {
                profileCompleted = profileCompleted + settings.profileDistribution.educationDetails
              }
              totalWithWeight = totalWithWeight + settings.profileDistribution.educationDetails
            }

            if (settings.profileDistribution.entranceExam) {
              if (user.entranceExam && user.entranceExam.length > 0) {
                profileCompleted = profileCompleted + settings.profileDistribution.entranceExam
              }
              totalWithWeight = totalWithWeight + settings.profileDistribution.entranceExam
            }

            if (settings.profileDistribution.interestedSubject) {
              if (user.interestedSubject && user.interestedSubject.length > 0) {
                profileCompleted = profileCompleted + settings.profileDistribution.interestedSubject
              }
              totalWithWeight = totalWithWeight + settings.profileDistribution.interestedSubject
            }

            if (settings.profileDistribution.programmingLang) {
              if (user.programmingLang && user.programmingLang.length > 0) {
                profileCompleted = profileCompleted + settings.profileDistribution.programmingLang
              }
              totalWithWeight = totalWithWeight + settings.profileDistribution.programmingLang
            }

            if (settings.profileDistribution.externalAssessment) {
              if (user.externalAssessment && user.externalAssessment.length > 0) {
                profileCompleted = profileCompleted + settings.profileDistribution.externalAssessment
              }
              totalWithWeight = totalWithWeight + settings.profileDistribution.externalAssessment
            }

            if (settings.profileDistribution.industryCertificates) {
              if (user.industryCertificates && user.industryCertificates.length > 0) {
                profileCompleted = profileCompleted + settings.profileDistribution.industryCertificates
              }
              totalWithWeight = totalWithWeight + settings.profileDistribution.industryCertificates
            }
          }

          profileCompleted = (profileCompleted / totalWithWeight) * 100
          if (alreadyCompleted != profileCompleted || isUpdate) {
            let result = await this.usersRepository.updateOne({ _id: user._id }, {
              $set: {
                profileCompleted: profileCompleted
              }
            })
            console.log("from profile updation", result);
          }

        }
      })

    } catch (error) {
      throw new Error(error.message);
    }
  }

  async removeAdditionalInfo(request: RemoveAdditionalInfoReq) {
    try {
      let res: string;
      switch (request.updatedField) {

        case 'awardsAndRecognition':
          const result1 = await this.usersRepository.updateOne({
            "awardsAndRecognition._id": new ObjectId(request._id)
          }, {
            $pull: {
              awardsAndRecognition: {
                _id: new ObjectId(request._id)
              }
            }
          })

          if (!result1) {
            throw new Error("Not found awardsAndRecognition");
          }

          await this.updateProfileComplete(request, true);

          res = "OK"
          break;

        case 'extraCurricularActivities':
          const result2 = await this.usersRepository.updateOne({
            "extraCurricularActivities._id": new ObjectId(request._id)
          }, {
            $pull: {
              extraCurricularActivities: {
                _id: new ObjectId(request._id)
              }
            }
          })

          if (!result2) {
            throw new Error("Not found extraCurricularActivities");
          }

          await this.updateProfileComplete(request, true);

          res = "OK"
          break;

        case 'educationDetails':
          const result3 = await this.usersRepository.updateOne({
            "educationDetails._id": new ObjectId(request._id)
          }, {
            $pull: {
              educationDetails: {
                _id: new ObjectId(request._id)
              }
            }
          })

          if (!result3) {
            throw new Error("Not found educationDetails");
          }

          await this.updateProfileComplete(request, true);

          res = "OK"
          break;

        case 'entranceExam':
          const result4 = await this.usersRepository.updateOne({
            "entranceExam._id": new ObjectId(request._id)
          }, {
            $pull: {
              entranceExam: {
                _id: new ObjectId(request._id)
              }
            }
          })

          if (!result4) {
            throw new Error("Not found entranceExam");
          }

          await this.updateProfileComplete(request, true);

          res = "OK"
          break;

        case 'externalAssessment':
          const result5 = await this.usersRepository.updateOne({
            "externalAssessment._id": new ObjectId(request._id)
          }, {
            $pull: {
              externalAssessment: {
                _id: new ObjectId(request._id)
              }
            }
          })

          if (!result5) {
            throw new Error("Not found externalAssessment");
          }

          await this.updateProfileComplete(request, true);

          res = "OK"
          break;

        case 'programmingLang':
          const result6 = await this.usersRepository.updateOne({
            "programmingLang._id": new ObjectId(request._id)
          }, {
            $pull: {
              programmingLang: {
                _id: new ObjectId(request._id)
              }
            }
          })

          if (!result6) {
            throw new Error("Not found programmingLang");
          }

          await this.updateProfileComplete(request, true);

          res = "OK"
          break;

        case 'academicProjects':
          const result7 = await this.usersRepository.updateOne({
            "academicProjects._id": new ObjectId(request._id)
          }, {
            $pull: {
              academicProjects: {
                _id: new ObjectId(request._id)
              }
            }
          })

          if (!result7) {
            throw new Error("Not found academicProjects");
          }

          await this.updateProfileComplete(request, true);

          res = "OK"
          break;

        case 'trainingCertifications':
          const result8 = await this.usersRepository.updateOne({
            "trainingCertifications._id": new ObjectId(request._id)
          }, {
            $pull: {
              trainingCertifications: {
                _id: new ObjectId(request._id)
              }
            }
          })

          if (!result8) {
            throw new Error("Not found trainingCertifications");
          }

          await this.updateProfileComplete(request, true);

          res = "OK"
          break;

        case 'industryCertificates':
          const result9 = await this.usersRepository.updateOne({
            "industryCertificates._id": new ObjectId(request._id)
          }, {
            $pull: {
              industryCertificates: {
                _id: new ObjectId(request._id)
              }
            }
          })

          if (!result9) {
            throw new Error("Not found industryCertificates");
          }

          await this.updateProfileComplete(request, true);

          res = "OK"
          break;

        default:
          throw new Error('Something is wrong. Please try again after sometime.')
      }

      return {
        response: res
      }
    } catch (error) {
      throw new GrpcInternalException(error.message)
    }
  }

  async linkPreview(request: LinkPreviewReq) {
    try {
      // let urls = "https://replit.com/@kushal20/EachTechnoQueries#index.js"
      let urls = request.url
      let resp = await urlMetadata(urls);
      let result: any = {
        url: resp.url,
        description: resp.description,
        title: resp.title,
        image: resp.image,
        source: resp.source
      }
      if (resp['og:type']) {
        result.type = resp['og:type'].split('.')[0];
      }
      return {
        ...result
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getPracticeSummary(request: GetPracticeSummaryReq) {
    try {
      let condition = {
        user: new ObjectId(request.user._id)
      }
      let pipeline = [{
        $match: condition
      },
      {
        $unwind: { path: '$QA', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: {
            _id: '$_id'
          },
          totalQuestion: {
            $sum: 1
          },
          totalAnsweredQuestions: {
            "$sum": {
              "$cond": [{ "$eq": ["$QA.status", 3] }, 0, 1]
            }
          },

          totalTimeTaken: {
            $sum: '$QA.timeEslapse'
          },

          totalTestMark: {
            $sum: '$QA.actualMarks'
          },
          totalObtainMark: {
            $sum: '$QA.obtainMarks'

          },
          practicesetId: {
            $first: '$practicesetId'
          },
          user: {
            $first: '$user'
          }
        }
      },
      {
        $group: {
          _id: {
            'user': '$user',
            'test': '$practicesetId'
          },
          totalQuestion: {
            $sum: '$totalQuestion'
          },
          totalAnsweredQuestions: {
            $sum: '$totalAnsweredQuestions'
          },

          totalTimeTaken: {
            $sum: '$totalTimeTaken'
          },

          totalTestMark: {
            $sum: '$totalTestMark'
          },
          totalObtainMark: {
            $sum: '$totalObtainMark'
          }
        }
      },
      {
        $group: {
          _id: {
            'user': '$_id.user'
          },
          totalQuestion: {
            $sum: '$totalQuestion'
          },
          totalAnsweredQuestions: {
            $sum: '$totalAnsweredQuestions'
          },

          totalTimeTaken: {
            $sum: '$totalTimeTaken'
          },

          totalTestMark: {
            $sum: '$totalTestMark'
          },
          totalObtainMark: {
            $sum: '$totalObtainMark'
          },
          totalTest: {
            $sum: 1
          }
        }
      },
      {
        $project: {
          totalQuestion: 1,
          totalTest: 1,
          totalAnsweredQuestions: 1,
          overallAccuracy: {
            $multiply: [{
              $cond: [{
                $eq: ['$totalTestMark', 0]
              }, 0, {
                '$divide': ['$totalObtainMark', '$totalTestMark']
              }]
            },
              100
            ]
          },
          avgTime: {
            $cond: [{
              $eq: ['$totalAnsweredQuestions', 0]
            }, 0, {
              '$divide': ['$totalTimeTaken', '$totalAnsweredQuestions']
            }]
          },
        }
      }
      ]
      const result = await this.attemptDetailRepository.aggregate(pipeline);
      if (!result) {
        throw "Invalid pipeline"
      }
      let response = {};
      if (result.length > 0) {
        response = result[0];
      }

      console.log(response);
      return {
        ...response
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async userRecentActivity(request: UserRecentActivityReq) {
    try {
      let logs;
      let attempts;
      if (request.studentId) {
        logs = await this.userLogRepository.aggregate([
          {
            $match: {
              user: new ObjectId(request.studentId)
            }
          },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              _id: 1, studentName: 1, createdAt: 1, "practiceSetInfo.title": 1, connectionInfo: 1, ip: 1,
              totalTime: { $divide: ["$timeActive", 60000] }, totalQuestions: 1,
            }
          }
        ])

        attempts = await this.attemptRepository.aggregate([
          {
            $match: {
              user: new ObjectId(request.studentId)
            }
          },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              _id: 1, studentName: 1, createdAt: 1, "practiceSetInfo.title": 1, ongoing: 1, isAbandoned: 1,
              totalTime: { $divide: ["$totalTime", 60000] }, totalQuestions: 1,
              userQues: { $sum: ["$totalCorrects", "$totalErrors", "$totalMissed", "$pending"] }
            }
          }
        ])
      }

      // console.log(JSON.stringify(logs));

      return {
        logs,
        attempts
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async addExperience(request: AddExperienceReq) {
    try {
      let body = { startDate: request.startDate, endDate: request.endDate }
      if (body.startDate) {
        body.startDate = new Date(body.startDate);
      }
      if (body.endDate) {
        body.endDate = new Date(body.endDate);
      }

      const data = await this.usersRepository.updateOne({ _id: new ObjectId(request._id) }, {
        $push: { experiences: body }
      })
      console.log(data);
      return {
        response: data
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateExperience(request: UpdateExperienceReq) {
    try {
      const body = request.body;
      console.log("body from update experience", request);
      if (!body._id) {
        // its the id of a particular experience which need to be updated
        throw new Error("Not found");
      }

      if (body.startDate) {
        body.startDate = new Date(body.startDate);
      }
      if (body.endDate) {
        body.endDate = new Date(body.endDate);
      }

      const data = await this.usersRepository.findOneAndUpdate({ _id: new ObjectId(request._id) }, {
        $set: {
          "experiences.$[element].title": body.title,
          "experiences.$[element].description": body.description,
          "experiences.$[element].employmentType": body.employmentType,
          "experiences.$[element].company": body.company,
          "experiences.$[element].location": body.location,
          "experiences.$[element].currentlyWorking": body.currentlyWorking,
          "experiences.$[element].startDate": body.startDate,
          "experiences.$[element].endDate": body.endDate,
        }
      }, { arrayFilters: [{ "element._id": { "$eq": body._id } }], returnOriginal: true });

      return {
        response: data
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async updateMentorPreferences(request: UpdateMentorPreferencesReq) {
    try {
      const isUpdated = await this.usersRepository.updateOne({
        _id: new ObjectId(request._id)
      }, {
        $set: {
          isPublic: request.isPublic,
          preferences: request.preferences
        }
      })

      if (!isUpdated) {
        throw new Error("Not updated")
      }

      return {
        response: "OK"
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async addEvents(request: AddEventsReq) {
    try {
      if (!request.user.email) {
        return {
          response: { message: "Please add your Email in your account before creation of course" }
        }
      }

      const body = request.body

      if (!body.startDate || !body.endDate || !body.title) {
        return {
          response: { message: "Please provide the required details" }
        }
      }

      const data: any = { ...body, startDate: new Date(body.startDate), endDate: new Date(body.endDate), location: request.user.activeLocation };

      console.log(data);
      if (data.allDays) {
        data.startDate = new Date(data.startDate).setHours(0, 0, 0, 0);
        data.endDate = new Date(data.endDate).setHours(23, 59, 59, 999);
      }

      let event = await this.eventsRepository.create(data);
      // console.log(event);
      return {
        response: event
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async getSuperCoinsActivities(request: GetSuperCoinsActivitiesReq) {
    try {
      let filter: any = {
        status: true
      }
      if (request.tags) {
        filter.tags = request.tags.toString()
      }

      console.log("filter", filter);

      const activities = await this.supercoinsRepository.find(filter)

      // remoed progress for now
      // progress we will find out with assessment course and testseries
      // activites.forEach(e =>{
      //     e.progress = 0
      //     e.total = 3
      // })   

      console.log(activities);
      return {
        response: activities
      }
    } catch (error) {

    }
  }

  async getUserSuperCoinActivities(request: GetUserSuperCoinActivitiesReq) {
    try {
      let userId = ''
      if (request.userId) {
        userId = request.userId;
      } else {
        userId = request.user._id;
      }

      let start = timeHelper.getStartOfDate(new Date(request.startDate), request.timezoneoffset)
      let end = timeHelper.getEndOfDate(new Date(request.endDate), request.timezoneoffset)

      const pipe = []
      console.log(request.startDate, request.endDate)
      console.log("start", start)
      console.log("end", end)

      pipe.push({
        "$match": {
          user: new ObjectId(userId),
          status: true,
          createdAt: {
            $gte: start,
            $lt: end
          }
        }
      },
        {
          $lookup: {
            from: 'users',
            let: { uid: "$user" },
            pipeline: [{
              $match: {
                $expr: { $eq: ["$_id", "$$uid"] }
              }
            },
            { $project: { name: 1, userId: 1, email: 1, avatar: 1 } }
            ],
            as: 'userInfo'
          }
        },
        {
          "$lookup": {
            from: "supercoins",
            let: { cid: "$activityId" },
            pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$cid"] } }
              },
              { $project: { title: 1, summary: 1, value: 1, mode: 1 } },
            ],
            as: "supercoins"
          }
        },
        {
          $project: {
            supercoins: "$supercoins",
            coins: 1,
            count: 1,
            user: 1,
            activityType: 1,
            activityId: 1,
            createdAt: 1,
            userInfo: "$userInfo"
          }
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt"
              },
              month: {
                $month: "$createdAt"
              },
              day: {
                $dayOfMonth: "$createdAt"
              },
              activityId: "$activityId",
              activityType: "$activityType"
            },
            coins: { $sum: "$coins" },
            count: { $sum: "$count" },
            supercoins: { $first: "$supercoins" },
            createdAt: { $first: "$createdAt" },
            activityId: { $first: "$activityId" },
            activityType: { $first: "$activityType" },
            user: { $first: "$user" },
            userInfo: { $first: "$userInfo" }

          }
        }
      )

      const activities: any = await this.userSuperCoinsRepository.aggregate(pipe);

      console.log(activities)
      return {
        response: activities
      }

    } catch (error) {
      throw new Error(error);
    }
  }

  async getTotalCoins(request: GetTotalCoinsReq) {
    try {
      let pipe = []
      console.log(request.user._id)
      pipe.push({
        "$match": {
          user: new ObjectId(request.user._id),
          status: true
        }
      },
        {
          $project: {
            activityType: 1,
            coins: 1,
            count: 1,
            user: 1
          }
        },
        {
          $project: {
            earned: {
              "$sum": {
                "$cond": [{ "$eq": ["$activityType", 'earned'] }, "$coins", 0]
              }
            },
            inprocess: {
              "$sum": {
                "$cond": [{ "$eq": ["$activityType", 'inprocess'] }, "$coins", 0]
              }
            },
            redeem: {
              "$sum": {
                "$cond": [{ "$eq": ["$activityType", 'redeemed'] }, "$coins", 0]
              }
            },
            user: 1
          }
        },
        {
          $group:
          {
            _id: { user: "$user" },
            earned: { "$sum": "$earned" },
            redeem: { "$sum": "$redeem" },
            inprocess: { "$sum": "$inprocess" }
          }
        }
      )

      const activities = await this.userSuperCoinsRepository.aggregate(pipe);
      console.log(activities);
      return {
        response: activities
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async redeemCoins(request: RedeemCoinsReq) {
    try {
      if (request.userId && request.body.activityId) {
        const pipe = []
        pipe.push({
          "$match": {
            user: new ObjectId(request.user._id),
            status: true
          }
        },
          {
            $project: {
              activityType: 1,
              coins: 1,
              count: 1,
              user: 1
            }
          },
          {
            $project: {
              earned: {
                "$sum": {
                  "$cond": [{ "$eq": ["$activityType", 'earned'] }, "$coins", 0]
                }
              },
              inprocess: {
                "$sum": {
                  "$cond": [{ "$eq": ["$activityType", 'inprocess'] }, "$coins", 0]
                }
              },
              redeem: {
                "$sum": {
                  "$cond": [{ "$eq": ["$activityType", 'redeemed'] }, "$coins", 0]
                }
              },
              user: 1
            }
          },
          {
            $group:
            {
              _id: { user: "$user" },
              earned: { "$sum": "$earned" },
              redeem: { "$sum": "$redeem" },
              inprocess: { $sum: "$inprocess" }
            }
          }

        )

        const activities = await this.userSuperCoinsRepository.aggregate(pipe);
        console.log("activities -> ", activities);
        // @ts-ignore
        const have = Number(activities[0].earned - (activities[0].redeem + activities[0].inprocess + request.body.coins - 1));
        console.log("have -> ", have);
        if (have > 1) {
          console.log("have is greater than one")
          const data = {
            "studentMsg": request.body.studentMsg.toString(),
            "activityId": new ObjectId(request.body.activityId),
            "user": new ObjectId(request.userId),
            "activityType": 'inprocess',
            "coins": Number(request.body.coins),
            "count": 1,
            "status": Boolean(true),
          }
          console.log("data >>>> ", data);
          const deductCoins = await this.userSuperCoinsRepository.create(data);
          console.log("deductCoin -> ", deductCoins);
          this.sendRedeemConfirmation(request, request.user, request.body.coins, () => { })
          const allAdmins = await this.usersRepository.find({ roles: 'admin', isActive: true }, { _id: 1, name: 1, email: 1 })
          const offer = await this.supercoinsRepository.findOne({ _id: new ObjectId(request.body.activityId) }, { _id: 1, title: 1 })
          for (let i = 0; i < allAdmins.length; i++) {
            this.sendRedeemInfoToAllAdmin(request, allAdmins[i], request.user.name, request.body.coins, request.body.studentMsg, offer.title, () => { })
          }

          console.log(deductCoins);
          return {
            response: deductCoins
          }
        } else {
          throw new Error("You dont have enough coins to redeem this offer")
        }
      } else {
        throw new Error("Please add Activity Id")
      }
    } catch (error) {
      throw new GrpcInternalException(error.message)
    }
  }

  async sendRedeemInfoToAllAdmin(req, user, student, coins, studentMsg, offer, next) {
    this.redisCaching.getSetting(req, async (settings) => {
      let product = '';
      product = settings.productName;

      let template = 'educoinAdmin'

      let opt = {
        coin: coins,
        date: moment().format('MMM DD, YYYY'),
        baseUrl: settings.baseUrl,
        websiteName: settings.baseUrl,
        logo: settings.baseUrl,
        productName: product,
        student: student,
        studentMsg: studentMsg,
        offer: offer,
        subject: 'Student successfully redeemed educoins'
      }

      let dataMsgCenter = {
        to: user.email,
        isScheduled: true,
        isEmail: true,
        modelId: 'educoinAdmin',
        receiver: user._id
      };

      await this.messageCenter.sendWithTemplate(req, template, opt, dataMsgCenter, function (err) {
        return next && next(err);
      })
    })
  }

  async sendRedeemConfirmation(req, user, coins, next) {
    this.redisCaching.getSetting(req, async (settings) => {
      let product = ''
      product = settings.productName

      let template = 'educoin'

      let opt = {
        coin: coins,
        date: moment().format('MMM DD, YYYY'),
        baseUrl: settings.baseUrl,
        websiteName: settings.baseUrl,
        logo: settings.baseUrl,
        productName: product,
        subject: 'Successfully redeemed Educoins'
      }

      let dataMsgCenter = {
        to: user.email,
        isScheduled: true,
        isEmail: true,
        modelId: 'educoin',
        receiver: user._id
      };

      await this.messageCenter.sendWithTemplate(req, template, opt, dataMsgCenter, function (err) {
        return next && next(err)
      })
    })
  }

  async updateEvent(request: UpdateEventReq) {
    try {
      if (!request.user.email) {
        return {
          response: { message: "Please add email" }
        }
      }
      const body = request.body
      if (!body.startDate || !body.endDate || !body.title) {
        return {
          response: { message: "Please provide the required details" }
        }
      }

      const data = { ...body, startDate: new Date(body.startDate), endDate: new Date(body.endDate) }

      if (data.allDays) {
        // @ts-ignore
        data.startDate = new Date(data.startDate).setHours(0, 0, 0, 0);
        // @ts-ignore
        data.endDate = new Date(data.endDate).setHours(23, 59, 59, 999)
      }

      let event = await this.eventsRepository.updateOne({ _id: request.id }, {
        title: data.title,
        summary: data.summary,
        startDate: data.startDate,
        endDate: data.endDate,
        allDays: data.allDays,
        classroom: data.classroom,
        students: data.students,
        allStudents: data.allStudents,
        schedule: data.schedule,
        type: data.type
      })
      return {
        response: event
      }
    } catch (error) {

    }
  }

  async deleteEvent(request: DeleteEventReq) {
    try {
      if (!request.user.email) {
        return {
          response: { message: "Please add your email in your account before deleting any event" }
        }
      }

      let event = await this.eventsRepository.findByIdAndDelete(request.id)
      return {
        response: event
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async awardEducoins(request: EducoinsReq) {
    try {
      if (!request.body.reason && !request.body.educoins) {
        return;
      }

      let data = {
        justification: request.body.reason,
        user: new ObjectId(request.body.studentId),
        coins: request.body.educoins,
        count: 1,
        activityType: 'earned',
        byAdmin: new ObjectId(request.user._id)
      }

      const val = await this.userSuperCoinsRepository.create(data);
      return {
        response: val
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async deductEducoins(request: EducoinsReq) {
    try {
      if (!request.body.reason && !request.body.educoins) {
        return;
      }

      const pipe = [];
      pipe.push({
        "$match": {
          user: new ObjectId(request.user._id),
          status: true
        }
      },
        {
          $project: {
            activityType: 1,
            coins: 1,
            count: 1,
            user: 1
          }
        },
        {
          $project: {
            earned: {
              "$sum": {
                "$cond": [{ "$eq": ["$activityType", 'earned'] }, "$coins", 0]
              }
            },
            inprocess: {
              "$sum": {
                "$cond": [{ "$eq": ["$activityType", 'inprocess'] }, "$coins", 0]
              }
            },
            redeem: {
              "$sum": {
                "$cond": [{ "$eq": ["$activityType", 'redeemed'] }, "$coins", 0]
              }
            },
            user: 1
          }
        },
        {
          $group:
          {
            _id: { user: "$user" },
            earned: { "$sum": "$earned" },
            redeem: { "$sum": "$redeem" },
            inprocess: { $sum: "$inprocess" }
          }
        }
      )

      const activities = await this.userSuperCoinsRepository.aggregate(pipe);
      // @ts-ignore
      const have = Number(activities[0].earned - (activities[0].redeem + activities[0].inprocess + request.body.educoins - 1))

      console.log(have)

      if (have <= 0) {
        return {
          response: { message: "Student have not sufficient coins" }
        }
      }

      let data = {
        justification: request.body.reason,
        user: new ObjectId(request.body.studentId),
        coins: request.body.educoins,
        count: 1,
        activityType: 'redeemed',
        byAdmin: new ObjectId(request.user._id)
      }

      const val = await this.userSuperCoinsRepository.create(data);

      console.log(activities);

      return {
        response: val
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async countTotalUsers(request: CountTotalUsersReq) {
    try {
      let filter: any = { isActive: true, locations: { $in: [new ObjectId(request.user.activeLocation)] } }
      if (request.query.role) {
        filter.roles = { $in: [request.query.role] };
      }
      if (request.query.user) {
        filter.$or = [{
          name: {
            $regex: request.query.user,
            $options: "i"
          }
        },
        {
          userId: {
            $regex: request.query.user,
            $options: "i"
          }
        }, {
          rollNumber: {
            $regex: request.query.user,
            $options: "i"
          }
        }]
      }

      this.usersRepository.setInstanceKey(request.instancekey)
      const users = await this.usersRepository.countDocuments(filter)
      return {
        count: users
      }
    } catch (error) {
      Logger.error(error.message)
      throw new GrpcInternalException("Internal Server Error")
    }
  }

  async unsubscribe(request: UnsubscribeReq) {
    try {
      if (!request.reason) {
        return;
      }
      await this.usersRepository.updateOne({ _id: request.user._id }, {
        $set: {
          optoutEmail: true,
          optoutDate: new Date(),
          optoutReason: request.reason
        }
      })

      return {
        response: "OK"
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateAmbassador(request: UpdateAmbassadorReq) {
    try {
      if (request.isEnroll == undefined) {
        return;
      }

      await this.usersRepository.updateOne({ _id: request.user._id }, {
        $set: { ambassador: request.isEnroll }
      })

      if (request.isEnroll) {
        let settings: any = await this.redisCaching.getSettingAsync(request.instancekey)
        await this.couponRepository.updateOne({
          code: request.user.userId,
          isReferral: true
        }, {
          $set: {
            status: true,
            percent: settings.ambassadorDiscount == undefined ? 10 : settings.ambassadorDiscount,
            name: 'Discount',
            usageLimit: 0,
            discountType: 'percent',
            showMe: false
          }
        }, {
          upsert: true
        })
      } else {
        await this.couponRepository.updateOne({
          code: request.user.userId,
          isReferral: true
        }, {
          $set: {
            status: false
          }
        })
      }

      return {
        response: "ok"
      }
    } catch (error) {
      console.log("Error", error);
    }
  }

  async closeUserAccount(request: CloseUserAccountReq) {
    try {
      await this.usersRepository.updateOne({ _id: request.user._id }, {
        isActive: false
      })
      return {
        response: "OK"
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserLevelInfo(request: GetUserLevelInfoReq) {
    try {
      let condition = {
        'userId': new ObjectId(request.user._id)
      }
      if (request.id && mongoose.Types.ObjectId.isValid(request.id)) {
        let testGrade = await this.practiceSetRepository.distinct("grades._id", {
          _id: new ObjectId(request.id)
        })
        console.log("###################")
        console.log(testGrade)
        console.log("###################")
        condition['gradeId'] = { $in: testGrade };
      }

      this.competenciesRepository.setInstanceKey(request.instancekey);
      const level = await this.competenciesRepository.find(condition, {
        '_id': 0,
        "level": 1
      }, { sort: { "level": -1 }, limit: 1, lean: true });

      console.log(level);
      if (level.length > 0) {
        return {
          maxLevel: level[0].level
        };

      } else {
        return {
          maxLevel: 0
        };
      }
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException("Interna Server Error");
    }
  }

  async getLiveBoardClassrooms(request: GetLiveBoardClassroomsReq) {
    let startOfToday = timeHelper.getStartOfToday(request.timezoneoffset);
    let endOfToday = timeHelper.getEndOfToday(request.timezoneoffset);
    let now = new Date()

    Logger.debug(`startOfToday ${startOfToday}`);
    Logger.debug(`endOfToday ${endOfToday}`);
    Logger.debug(`now ${now}`);

    let condition: any = {
      active: true,
      location: new ObjectId(request.user.activeLocation),
      "students.0.studentId": {
        "$exists": true
      }
    }

    try {
      if (request.status === 'ongoing') {
        Logger.error(request.user.activeLocation);
        let clsIds = await this.practiceSetRepository.distinct('classRooms', {
          locations: new ObjectId(request.user.activeLocation),
          testMode: "proctored",
          status: "published",
          $where: "this.startDate && (new Date() >= this.startDate  && new Date() < new Date(this.startDate.getTime() + 1000 * 60 * this.totalTime))"
        })

        console.log(clsIds);

        condition['_id'] = { $in: clsIds }
      } else if (request.status === 'upcoming') {
        let clsIds = await this.practiceSetRepository.distinct('classRooms', {
          locations: new ObjectId(request.user.activeLocation),
          testMode: "proctored",
          status: 'published',
          startDate: { $lte: endOfToday, $gt: now }
        })

        condition['_id'] = { $in: clsIds }
      } else if (request.status === 'completed') {
        let clsIds = await this.practiceSetRepository.distinct('classRooms', {
          locations: new ObjectId(request.user.activeLocation),
          testMode: "proctored",
          startDate: { $gte: startOfToday },
          $where: "this.startDate && (new Date()).getTime() > (this.startDate.getTime() + 1000 * 60 * this.totalTime)"
        })

        condition['_id'] = { $in: clsIds }
      } else {
        let clsIds = await this.practiceSetRepository.distinct('classRooms', {
          locations: new ObjectId(request.user.activeLocation),
          testMode: "proctored",
          status: 'published',
          startDate: { $gte: startOfToday, $lt: endOfToday }
        })

        condition['_id'] = { $in: clsIds }

        if (request.keywords) {
          let cond = {
            role: 'student',
            isActive: true,
            locations: new ObjectId(request.user.activeLocation),
            $or: []
          }
          cond.$or.push({ userId: request.keywords, })
          cond.$or.push({ email: request.keywords, })
          cond.$or.push({ phoneNumber: request.keywords, })
          cond.$or.push({
            name: {
              "$regex": request.keywords,
              "$options": "i"
            }
          })
        }
      }

      if (request.user.roles.includes('teacher')) {
        condition.$or = [{
          user: new ObjectId(request.user._id)
        }, {
          owners: new ObjectId(request.user._id)
        }]
      }

      console.log(condition);

      let classrooms = await this.classroomRepository.find(condition, {
        imageUrl: 1,
        name: 1,
        students: 1,
        colorCode: 1
      })

      classrooms.forEach(d => {
        d.students = d.students.length
      })

      return {
        response: classrooms
      }

    } catch (error) {
      Logger.error(error);
    }
  }

  async getTurnAuth(request: GetTurnAuthReq) {
    if (!config.config.TURNserver) {
      return GrpcNotFoundException;
    }

    let unixTimeStamp = (Date.now() / 1000) + 24 * 3600 // this credential valid for 24 hours
    let tempUser = [unixTimeStamp, request.user._id.toString()].join(':');

    let hmac = crypto.createHmac('sha1', config.config.TURNserver.secret);
    hmac.setEncoding('base64');
    hmac.write(tempUser);
    hmac.end();

    let tempPassword = hmac.read();

    return {
      server: config.config.TURNserver.server,
      user: tempUser,
      pass: tempPassword
    }

  }

  async getTurnConfig(request: GetTurnConfigReq) {
    try {
      let config: any = await this.redisCaching.getAsync(request.instancekey, 'videoStreaming');
      if (!config) {
        console.log("not cached")
        config = await this.settingRepository.findOne({ slug: 'videoStreaming' })
        if (!config || !config.turns || !config.turns.length) {
          return;
        }
        this.redisCaching.set(request, 'videoStreaming', config, 60 * 120);
      }
      console.log("cached")
      // console.log(request.user);
      let unixTimeStamp = (Date.now() / 1000) + 24 * 3600;
      let tempUser = [unixTimeStamp, request.user._id.toString()].join(':');

      let servers = config.turns.filter(s => s.active).map(server => {
        let hmac = crypto.createHmac('sha1', server.secret);
        hmac.setEncoding('base64');
        hmac.write(tempUser);
        hmac.end();

        let tempPassword = hmac.read();

        return {
          urls: server.server,
          username: tempUser,
          credential: tempPassword,
        }
      })
      console.log(servers);

      return {
        response: servers
      }
    } catch (error) {
      console.log(error)
    }
  }

  async requestEmailCode(request: RequestEmailCodeReq) {
    try {
      let userId = request.id;
      let now = new Date();
      let condition = {};

      if (mongoose.Types.ObjectId.isValid(request.id)) {
        condition = {
          _id: userId
        };
      } else {
        condition = {
          $or: [{
            'email': userId
          }, {
            'phoneNumber': userId
          }, {
            'phoneNumberFull': userId
          }]
        };
      }

      const user = await this.usersRepository.findOne(condition)
      if (!user) {
        return GrpcNotFoundException;
      }

      user.emailVerifyExpired = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);

      user.emailVerifyToken = await this.getVerificationCode(request);

      console.log(user);

      this.sendResendCodeMail(request, user);


      return {
        response: "ok"
      }
    } catch (error) {

    }
  }

  async unblockUser(request: UnblockUserReq) {
    try {
      if (!request.userId || !mongoose.Types.ObjectId.isValid(request.userId)) {
        return GrpcNotFoundException
      }
      await this.usersRepository.updateOne({ _id: request.user._id }, {
        $pull: { blockedUsers: new ObjectId(request.userId) }
      })

      return {
        response: "Ok"
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async reportUser(request: ReportUserReq) {
    try {
      if (!request.userId || !mongoose.Types.ObjectId.isValid(request.userId) || !request.reason) {
        return GrpcNotFoundException;
      }

      await this.reportedUserRepository.updateOne({ reporter: request.user._id, user: request.userId }, {
        $set: { reason: request.reason, isRead: false }
      }, { upsert: true })

      return {
        response: "ok"
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async partnerUser(request: PartnerUserReq) {
    try {
      console.log(request);

      let practice;
      let testCode = request.body.examSeriesCode || request.body.testCode || '';

      let classcode = '';
      if (testCode.length == 12) {
        classcode = testCode.slice(testCode.length - 6, testCode.length)
        testCode = testCode.slice(0, testCode.length - 6)
      }

      console.log("classcode >>> ", classcode)
      console.log("testCode >>> ", testCode)

      let info: any = {
        name: request.body.name,
        country: 'IN',
        role: 'student',
        provider: request.body.clientId || "nopaperforms"
      };

      if (request.body.email) {
        info.email = request.body.email
      }

      if (request.body.phoneNumber) {
        info.phoneNumber = request.body.phoneNumber
      }

      if (request.body.clientCandidateID) {
        info.rollNumber = request.body.clientCandidateID
      }

      if (request.body.registrationNo) {
        info.registrationNo = request.body.clientAuthorizationID
      }

      if (!info.email && !info.phoneNumber) {
        throw new UnprocessableEntityException('Email/phoneNumber is missing')
      }

      if (!testCode) {
        throw new UnprocessableEntityException('Test Code is missing')
      }

      if (testCode) {
        this.practiceSetRepository.setInstanceKey(request.instancekey);
        practice = await this.practiceSetRepository.findOne({ testCode: testCode }, { title: 1, titleLower: 1 }, { lean: true })
      }

      if (!practice) {
        throw new UnprocessableEntityException('Your test code is not available')
      }

      this.usersRepository.setInstanceKey(request.instancekey);
      let user = await this.usersRepository.findOne({ $or: [{ userId: info.email.toLowerCase() }, { userId: info.phoneNumber }] });

      // console.log("user >>> ", user);

      if (!user) {
        let record = _.pick(info, 'role', 'name', 'email', 'phoneNumber', 'provider', 'rollNumber', 'registrationNo');

        let countryInfo = country.info(info.country, 'ISO2')
        if (countryInfo) {
          record.country = {
            name: countryInfo.name,
            code: info.country
          }
          record.country.callingCodes = country.callingCodes(info.country);
        }

        record.status = true;
        record.emailVerified = true;
        let newUser = await this.usersRepository.create(record);
        user = newUser;
      }

      let token = await this.authservice.signToken(request, request.instancekey, user._id, user.role, true);

      // Add student to classroom
      if (classcode) {
        this.addUserInClassroom(request, user, classcode)
      }

      if (practice) {
        practice.slugfly = slugify(practice.titleLower, {
          lower: true
        })
        return {
          token: token,
          practice: practice
        };
      } else {
        return {
          token: token,
          practice: null
        };
      }
    } catch (error) {
      Logger.error(error)
      if (error instanceof UnprocessableEntityException) {
        throw new GrpcInternalException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async updateUtmStatus(request: UpdateUtmStatusReq) {
    try {
      if (!request.utmId) {
        return GrpcInternalException
      }

      let data = await this.marketingUtmRepository.updateOne({
        _id: new ObjectId(request.utmId),
        user: { $eq: null }
      }, {
        $set: {
          user: request.user._id,
          userId: request.user.userId,
          signupDate: new Date()
        }
      })

      console.log("update utm", data);
      return {
        response: 'ok'
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async addUtmVisitor(request: AddUtmVisitorReq) {
    if (!request.body.medium || !request.body.source || !request.body.campaign) {
      return GrpcInternalException;
    }
    try {
      console.log("##############")
      if (request.body.savedUtm) {
        let futm = await this.marketingUtmRepository.findOneAndUpdate({
          _id: new ObjectId(request.body.savedUtm),
          'visitUrls.url': { $ne: request.body.url }
        }, { $push: { visitUrls: [{ url: request.body.url, date: new Date() }] } })

        console.log("inside the savedUtm")
        console.log("futm", futm);
        if (futm) {
          return {
            response: `${request.body.savedUtm}`
          }
        }
        console.log("inside the savedUtm")
      } else if (request.user) {
        let futm = await this.marketingUtmRepository.findOneAndUpdate({
          source: request.body.source,
          medium: request.body.medium,
          campaign: request.body.campaign,
          user: request.user._id,
          'visitUrls.url': { $ne: request.body.url }
        }, { $push: { visitUrls: { url: request.body.url, date: new Date() } } })

        if (futm) {
          console.log("from futm")
          return {
            response: futm._id
          }
        }
      }

      let newVisitor: any = {
        source: request.body.source,
        medium: request.body.medium,
        campaign: request.body.campaign,
        ip: request.ip,
        visitUrls: [{ url: request.body.url, date: new Date() }]
      }

      let geo = geoip.lookup(request.ip)
      Logger.debug(JSON.stringify(geo));
      newVisitor.location = _.pick(geo, 'country', 'region', 'city', 'metro', 'zip', 'll');

      // in private shared link user is already register
      if (request.user) {
        newVisitor.user = request.user._id
        newVisitor.userId = request.user.userId
        newVisitor.signupDate = request.user.createdAt
      }

      let data = await this.marketingUtmRepository.create(newVisitor);


      return {
        response: `${data._id}`
      }
    } catch (error) {
      console.log("gettint error", error)
    }
  }

  async manageSession(request: ManageSessionReq) {
    try {
      let classIds = [];
      let selectedSlot = new Date(request.body.session.selectedSlot);
      console.log("selected slot = ", selectedSlot)
      if (request.body.session.selectedSlot) {
        if (request.body.session.classrooms || request.body.session.users) {
          classIds = await this.practiceSetRepository.distinct('classrooms', {
            startDate: selectedSlot,
            "accessMode": "invitation",
            "testMode": "proctored"
          })
        }

        if (request.body.session.setting) {
          // manage practice set settings
          console.log("inside setting");
          let practiceSetupdate = request.body.practice;

          if (practiceSetupdate.classRooms) {
            Logger.warn('manageSession: classroom updating...%j', practiceSetupdate.classRooms)
          }

          await this.practiceSetRepository.updateMany({
            startDate: selectedSlot,
            "accessMode": "invitation",
            "testMode": "proctored"
          }, { $set: practiceSetupdate })
        }

        if (request.body.session.tests) {
          // manage practicesets
          console.log("inside tests")
          let practiceSetUpdate: any = {}

          if (request.body.isActive) {
            practiceSetUpdate.status = 'published'
          } else {
            practiceSetUpdate.status = 'revoked'
          }

          await this.practiceSetRepository.updateMany({
            startDate: selectedSlot,
            "accessMode": "invitation",
            "testMode": "proctored"
          }, { $set: practiceSetUpdate })

        }

        if (request.body.session.classrooms) {
          // manage classroom
          console.log("inside classrooms")
          await this.classroomRepository.updateMany({ _id: { $in: classIds } }, { $set: { active: request.body.isActive } });
        }

        if (request.body.session.users) {
          console.log("inside users")
          let UserIDs = await this.classroomRepository.distinct('student.studentId', {
            _id: { $in: classIds }
          })

          // manage user
          await this.usersRepository.updateMany({
            roles: 'student', '_id': { $in: UserIDs }
          }, {
            $set: {
              "isActive": request.body.isActive
            }
          })
        }
        return {
          response: "OK"
        }
      } else {
        throw new NotFoundException("Please select data and time to activate/deactivate session");
      }
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcNotFoundException("Not Found");
    }
  }

  async inviteUsers(request: InviteUsersReq) {
    try {
      if (!request.emails || !request.emails.length) {
        return GrpcInternalException;
      }
      // validate email
      for (let item of request.emails) {
        if (!this.validateEmail(item)) {
          return {
            message: 'Wrong email format: ' + item
          }
        }
      }

      let settings: any = await this.redisCaching.getSettingAsync(request.instancekey)

      let dataMsgCenter = {
        modelId: 'shareLink',
        to: request.emails.join(','),
        isScheduled: true,
        isEmail: true
      }

      const result = await this.messageCenter.sendWithTemplate(request, 'sharing-perfectice', {
        senderName: request.user.name,
        logo: settings.baseUrl + 'images/logo2.png',
        sharingLink: settings.baseUrl,
        subject: 'Perfectice invitation'
      }, dataMsgCenter, function (err) {
        if (err) {
          return;
        }
        return {
          response: "ok"
        }
      })

      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateSubjects(request: UpdateSubjectsReq) {
    try {
      if (!request.subjects || !request.subjects.length) {
        throw new Error("Not found subjects");
      }

      let foundSub = await this.subjectRepository.find({ _id: { $in: request.subjects } }, { _id: 1, name: 1 })

      if (!foundSub.length) {
        throw new Error("Not found subjects");
      }

      let updateQuery: any = {
        subjects: foundSub.map(s => s._id)
      }

      if (request.country && (!request.user.country || request.user.country.code != request.country)) {
        let settings: any = await this.redisCaching.getSettingAsync(request.instancekey);
        console.log(request.country);
        let fcountry = settings.countries.find(c => c.code == request.country);
        if (fcountry) {
          updateQuery.country = {
            name: fcountry.name,
            code: fcountry.code,
            currency: fcountry.currency,
            callingCodes: country.callingCodes(fcountry.code),
            confirmed: true
          }
        }
      }

      await this.usersRepository.updateOne({
        _id: request.user._id
      }, {
        $set: updateQuery
      })

      return {
        response: "ok"
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async addStudentInClassroom(request: AddStudentInClassroomReq) {
    if (!request.params.seqCode) {
      return new GrpcNotFoundException("Please pass valid seq code")
    }

    try {
      request.params.seqCode = request.params.seqCode.toUpperCase()
      let classcode = '';
      let querySubjects: Array<string>;
      if (request.params.seqCode.length == 12 || request.query.testCode) {
        querySubjects = request.query.subjects.split(',')

        if (request.params.seqCode.length == 12) {
          classcode = request.params.seqCode.slice(request.params.seqCode.length - 6, request.params.seqCode.length)
        }

        let result = await this.subjectRepository.find({
          active: true,
          _id: { $in: querySubjects }
        }, '_id name')

        console.log("result", result)

        if (!result) {
          return new GrpcNotFoundException("Subject is Invalid");
        }

        // mean this is new added subject
        let subjects = request.user.subjects
        result.forEach(s => {
          let exist = subjects.find(d => d.toString() == s._id.toString())
          if (!exist) {
            console.log("adding subject...")
            subjects.push(s._id)
          }
        })

        await this.usersRepository.updateOne({
          _id: new ObjectId(request.user._id)
        }, {
          $set: {
            subjects: subjects
          }
        })

        if (!classcode) {
          return {
            response: 'Subject added in your profile successfully'
          }
        }
      } else {
        classcode = request.params.seqCode
      }

      let classroom = await this.classroomRepository.findOne({ seqCode: this.regexCode(classcode) })

      if (!classroom) {
        return new GrpcNotFoundException('No classroom found')
      }

      if (!classroom.joinByCode) {
        return new GrpcNotFoundException('You cannot join this classroom using code')
      }

      if (classroom.location) {
        await this.usersRepository.updateOne({ _id: request.user._id }, {
          $addToSet: {
            locations: classroom.location
          },
          $set: {
            activeLocation: classroom.location,
            onboarding: true
          }
        })
      }

      if (!classroom.students.find(s => s.studentUserId == request.user.userId)) {
        await this.classroomRepository.findByIdAndUpdate(classroom._id, {
          $push: {
            students: {
              studentId: request.user._id,
              status: true,
              autoAdd: false,
              studentUserId: request.user.userId,
              registeredAt: request.user.createdAt,
              iRequested: false
            }
          }
        });
      }

      return {
        response: "User successfully added to the classroom"
      }

    } catch (error) {
      Logger.error(error);
      return GrpcInternalException;
    }

  }

  async employabilityIndex(request: EmployabilityIndexReq) {
    axios.get(config.config.reportApi + 'employbilityIndex', {
      params: {
        userId: request.user._id.toString()
      },
      headers: {
        'instancekey': request.instancekey
      }
    })
      .then(function (res) {
        console.log("res");
        console.log(res);
        if (res.data) {
          return {
            response: res.data
          }
        } else {
          return {
            response: []
          }
        }
      })
      .catch(function (error) {
        throw new GrpcInternalException(error);
      });
  }

  async psychoIndex(request: PsychoIndexReq) {
    axios.get(config.config.reportApi + 'psychoIndustryIndex', {
      params: {
        userId: request.user._id.toString()
      },
      headers: {
        'instancekey': request.instancekey
      }
    })
      .then(res => {
        if (res.data && res.data.data) {
          return {
            response: res.data.data
          }
        } else {
          Logger.warn('No psychoIndex found');
          return {
            response: []
          }
        }
      })
      .catch((error) => {
        throw new GrpcInternalException(error);
      });
  }

  async loginAfterOauth(request: LoginAfterOauthReq) {
    try {
      let userInfo = request.body
      console.log("from login try", request)
      if (!userInfo.email) {
        throw new NotFoundException("Email is required")
      }

      let user = await this.usersRepository.findOne({
        email: userInfo.email
      })

      // console.log("from login", user);

      if (!user) {
        let settings: any = await this.redisCaching.getSettingAsync(request.instancekey)

        await this.setDefaultDataForUser(request.body, userInfo, settings);
        console.log(userInfo);
        console.log("^^^^^^^^^^")
        if (userInfo.roles) {
          console.log("role is there");
          user = await this.usersRepository.create(userInfo)
          await this.usersRepository.findByIdAndUpdate(new ObjectId(user._id), { $set: { isVerified: true } });

          console.log("From default user")
          console.log(settings.features.classroom);
          if (settings.features.classroom) {
            await this.createMentorClassroom(request, user);
          }
        } else {
          user = await this.usersRepository.create(userInfo);
          await this.usersRepository.findByIdAndUpdate(new ObjectId(user._id), { $set: { isVerified: true } });

          // User will be saved to db after entering role info instead of after social login
          // We will save data to session temporarily
          //   req.session.user = user;

          Logger.debug('set social login user to redis');
          // keep in redis in 1 hour
          Logger.debug('save tempt user: ' + 'user_' + user._id)
          this.redisCaching.set(request, 'user_' + user._id, {
            user: user,
            isTempt: true
          }, 60 * 60)
        }
      }

      let token = await this.authservice.signToken(request, request.instancekey, user._id, user.roles, request.remember)

      return {
        response: token
      }
    } catch (error) {
      console.log(error)
      throw new GrpcInternalException(error)
    }
  }

  async verifiedCode(request: VerifiedCodeReq) {
    try {
      await this.redisCaching.get(request, request.params.token, function (data) {
        console.log("data from verified code ", data);
        if (data && data.user) {
          console.log("Data to hai aur user bhi hai")
          return {
            response: 'OK'
          }
        }

        throw new GrpcNotFoundException('Your Code is invalid or has expired');
      })
    } catch (error) {
      console.log(error)
      throw new GrpcInternalException(error);
    }
  }

  async tempConfirmationCode(request: TempConfirmationCodeReq) {
    try {
      let userId = request.id;
      let now = new Date();
      console.log("user id >>>>>>>>>>", request)
      this.redisCaching.get(request, 'user_' + userId, async (data) => {
        console.log(data);
        if (!data) {
          throw new Error('Sorry, we cannot find your information');
        }

        let user = data.user;
        console.log(user);
        user.emailVerifyExpired = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);
        user.emailVerifyToken = await this.getVerificationCode(request);

        this.redisCaching.set(request, user.emailVerifyToken, { user: user._id.toString() }, 60 * 60 * 24)
        this.redisCaching.del(request, 'user_' + user._id, async (data) => {
          this.redisCaching.set(request, 'user_' + user._id, {
            user: user,
            isTempt: true,
          }, 60 * 60 * 24 * 7);
          this.sendResendCodeMail(request, user);
          return {
            response: "OK"
          }
        })
      })
    } catch (error) {
      console.log(error);
    }
  }

  async tempSignup(request: TempSignupReq) {
    try {
      console.log(request);

      let data = _.pick(request.body, 'userId', 'phoneNumber', 'email', 'country', 'password')
      console.log(data);
      let user = await this.usersRepository.findOne({
        userId: data.userId
      })

      if (user) {
        throw new Error('Email or phone number is already registered.')
      }

      console.log(data);

      // user = await this.usersRepository.create(data);
      const emailVerify = await this.getVerificationCode(request);
      user = await this.usersRepository.findByIdAndUpdate(user._id, {
        $set: {
          emailVerifyToken: emailVerify
        }
      })

      // console.log(user);
      await this.redisCaching.set(request, user.emailVerifyToken, { user: user._id.toString() }, 60 * 60 * 24)

      let settings = await this.redisCaching.getSettingAsync(request.instancekey);

      await this.setDefaultDataForUser(request, user, settings);

      this.sendConfirmationLinkAndCode(request, user, async (err, result) => {
        if (err) {
          throw new Error("Validation Error" + err)
        }

        // User will be saved to db after entering role ,grade info 
        // We will save data to session temporarily
        //   req.session.user = user;
        Logger.debug('set signup user to redis');
        // keep in redis in 7 days
        Logger.debug('save tempt user: ' + 'user_' + user._id)
        console.log(this.redisCaching)
        this.redisCaching.set(request, 'user_' + user._id, {
          user: user,
          isTempt: true
        }, 60 * 60 * 24 * 7);
      })

      console.log("user before return", user);

      return {
        response: user
      }

    } catch (error) {
      console.log(error)
    }
  }

  async updateIdentityImage(request: UpdateIdentityImageReq) {
    try {
      const data = await this.usersRepository.updateOne({ _id: request.params.id }, {
        $set: {
          'identityInfo.imageUrl': request.body.fileUrl
        }
      })
      console.log(data);
      return {
        response: "OK"
      }
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async updateConnectionInfo(request: UpdateConnectionInfoReq) {
    try {
      let info = request.body;
      let token = request.headers.authToken;

      const log = await this.userLogRepository.findOne({
        user: new ObjectId(request.user._id),
        token: token
      })

      if (!log) {
        throw Error('No log found');
      }

      if (!log.connectionInfo) {
        // although we can get it from user-agent
        try {
          let userAgent = uaparser(request.headers.userAgent);
          delete userAgent.ua;
          log.connectionInfo = userAgent;
        } catch (error) {
          console.log(error)
          Logger.error(error)
          throw Error(error)
        }
      }

      if ((!log.connectionInfo.device || !log.connectionInfo.device.model) && info.device) {
        if (!log.connectionInfo.device) {
          log.connectionInfo.device = {}
        }
        log.connectionInfo.device.model = info.device
      }

      if ((!log.connectionInfo.os || !log.connectionInfo.os.name) && info.os) {
        if (!log.connectionInfo.os) {
          log.connectionInfo.os = {}
        }
        log.connectionInfo.os.name = info.os
      }

      if (!log.connectionInfo.locs) {
        log.connectionInfo.locs = []
      }

      // Check if it is already there
      var idx = _.findIndex(log.connectionInfo.locs, { ip: request.ip })
      if (idx == -1) {
        // use ip to lookup location
        let geo = geoip.lookup(request.ip)

        Logger.debug(JSON.stringify(geo))
        var location = _.pick(geo, 'country', 'region', 'city', 'metro', 'zip', 'll')
        location.ip = request.ip

        log.connectionInfo.locs.push(location)
      }
      if (info.isMobile) {
        log.connectionInfo.mobileApp = info.isMobile
      }
      if (info.version) {
        log.connectionInfo.version = info.version
      }



      console.log(log);

      await this.userLogRepository.findByIdAndUpdate(log._id, {
        $set: {
          connectionInfo: log.connectionInfo
        }
      })

      // For mobile user, login token only expired after 1 year, 
      // So lastLogin will not get updated unless mobile user logout and login again
      // We cannot use lastLogin to check user activity correctly. So, whenever user open mobile app, 
      // we will update connection info together with lastLogin
      if (info.isMobile) {
        await this.usersRepository.updateOne({ _id: request.user._id }, {
          $set: {
            lastLogin: new Date()
          }
        })
      }

      return {
        response: "OK"
      }

    } catch (error) {

    }
  }

  async sendConfirmationLinkAndCode(req, user, next) {
    await this.redisCaching.getSetting(req, async (settings) => {
      let defaultPath = getAssets(req.instancekey); + '/uploads';
      let uploadDir = path.join(defaultPath.toString(), 'image');
      let uploadAvatar = path.join(defaultPath.toString(), 'avatar');


      await fsExtra.mkdirp(defaultPath)
      await fsExtra.mkdirp(uploadDir)
      await fsExtra.mkdirp(uploadAvatar)

      uploadDir = path.join(uploadDir.toString(), user._id.toString());
      uploadAvatar = path.join(uploadAvatar.toString(), user._id.toString());

      let confirmUrl = settings.baseUrl + 'confirmRegister?token=' + user.emailVerifyToken;

      if (user.email) {
        this.sendConfirmEmail(req, user, confirmUrl, settings.baseUrl + 'confirmRegister', () => { });
      }

      if (user.phoneNumber && user.country.callingCodes.length) {
        let product = settings.productName;

        user.country.callingCodes.forEach(async callingCode => {
          let phoneNumber = callingCode + user.phoneNumber;
          let textMessage = '';
          if (user.tempPassword) {
            textMessage = 'Welcome!!! Your ' + product + ' account with user Id ' + user.userId + ' and password ' + user.tempPassword + ' is created. Change your password by visiting Profile page..'
          } else {
            textMessage = 'Please click the link to activate your account ' + confirmUrl + '. Your activation code is ' + user.emailVerifyToken
          }

          let smsNotification = await this.notificationRepository.create({
            modelId: 'activateAccount',
            isScheduled: true,
            isEmail: false,
            to: phoneNumber,
            sms: textMessage
          })

          console.log("Notificaiton", smsNotification);

        })
      }

      next()
    })
  }

  async createMentorClassroom(req, user) {
    try {
      if (user.roles.includes(config.config.roles.mentor) || user.roles.includes(config.config.roles.teacher) && user.isMentor) {
        const classroom = await this.classroomRepository.findOne({
          user: new ObjectId(user._id),
          allowDelete: false
        })

        if (!classroom) {
          let data = {
            "name": "My Mentees",
            "user": user._id,
            "students": [],
            "stream": false,
            "role": "user",
            "allowDelete": false,
            "nameLower": "my mentees",
            "slugfly": "my-mentees",
            active: true
          }

          // @ts-ignore
          await this.classroomRepository.create(data);
        }
      }
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(error.message)
    }
  }

  async socialLogin(request: SocialLoginReq) {
    const settings = await this.redisCaching.getSetting(request)
    // Check if the instance allow to create account using social login or not.
    console.log("from social logign", settings.signupType)
    switch (request.provider) {
      case 'google':
        if (settings.signupType.google) {
          const user = await this.loginWithGoogleMobile(request);
          if (user) {
            let token = await this.authservice.signToken(request, request.instancekey, user._id, user.roles, true);

            return {
              token: token
            }
          } else {
            throw new GrpcInternalException('Can not login')
          }
        } else {
          throw new GrpcPermissionDeniedException('You are not allowed to login/signup using Google account.');
        }
        break;
      case 'facebook':
        if (settings.signupType.facebook) {
          const user = await this.loginWithFaceMobile(request);
          if (user) {
            let token = await this.authservice.signToken(request, request.instancekey, user._id, user.roles, true);

            return {
              token: token
            }
          } else {
            throw new GrpcInternalException('Can not login')
          }
        } else {
          throw new GrpcPermissionDeniedException('You are not allowed to login/signup using Facebook account.');
        }
        break;
      default:
        throw new GrpcInternalException("Param provider required");
    }
  }

  async loginWithFaceMobile(req: SocialLoginReq) {
    try {
      let email = null;
      let profile: any = req.body.user;
      let condition: any = {
        $or: [{
          'facebook.id': profile.id
        }]
      };

      if (profile.email) {
        email = profile.email;
        condition.$or.push({
          email: email
        });
      }

      profile.avatar = "http://graph.facebook.com/" + profile.id + "/picture?type=large";
      this.usersRepository.setInstanceKey(req.instancekey);
      let user = await this.usersRepository.findOne(condition);
      if (!user) {
        user = await this.usersRepository.create({
          name: profile.name,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: email,
          // username: profile.username,
          provider: 'facebook',
          gender: profile.gender,
          facebook: profile,
          emailVerified: true,
          isVerified: true,
          roles: profile.roles
        });

        let settings = await this.redisCaching.getSettingAsync(req.instancekey)

        await this.setDefaultDataForUser(req, user, settings)

        return user;
      } else {
        return user;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async loginWithGoogleMobile(req: SocialLoginReq) {
    try {
      console.log("inside login google", req)
      let profile = req.body.user;
      let condition: any = {
        $or: [{
          'email': profile.email
        }]
      };

      let dataUser = profile;
      if (profile.userId) {
        dataUser.id = profile.userId;

        condition.$or.push({
          'google.id': profile.userId
        });
        condition.$or.push({
          'google.userId': profile.userId
        })
      }

      this.usersRepository.setInstanceKey(req.instancekey);
      let user = await this.usersRepository.findOne(condition);
      if (!user) {
        user = await this.usersRepository.create({
          name: profile.name,
          firstName: profile.givenName,
          lastName: profile.familyName,
          email: profile.email,
          gender: profile.gender,
          provider: 'google',
          google: dataUser,
          emailVerified: true,
          isVerified: true,
          roles: profile.roles
        })

        let settings = await this.redisCaching.getSettingAsync(req.instancekey);

        await this.setDefaultDataForUser(req, user, settings)

        return user;
      } else {
        return user;
      }
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async sendConfirmEmail(req, user, confirmUrl, confirmRegisterUrl, next) {
    const self = this;
    this.redisCaching.getSetting(req, function (settings) {
      let product = ''
      product = settings.productName;
      if (user.role == config.config.roles.centerHead) {
        user.role = "CenterHead";
      }

      let template = 'confirm-email'

      let opt: any = {
        user: user,
        baseUrl: settings.baseUrl,
        websiteName: settings.baseUrl,
        logo: settings.baseUrl,
        productName: product,
        subject: `Welcome to ` + product
      }
      if (user.tempPassword) {
        template = 'confirm-institute-user-email';
        opt.supportEmail = settings.supportEmail;
        opt.userId = user.userId;
        opt.tempPassword = user.tempPassword;
      } else {
        opt.confirmation = confirmUrl;
        opt.confiUrl = confirmRegisterUrl;
        opt.code = user.emailVerifyToken
      }

      let dataMsgCenter = {
        to: user.email,
        modelId: 'confirmEmail',
        isScheduled: true
      }

      self.messageCenter.sendWithTemplate(req, template, opt, dataMsgCenter, function (err) {
        return next && next(err);
      })
    })
  }

  async sendResendCodeMail(req, user) {
    if (user.emailVerified) {
      return;
    }

    console.log("inside resend code mail")
    let self = this;
    await this.redisCaching.getSetting(req, function (settings) {

      let confirmUrl = settings.baseUrl + 'confirmRegister?token=' + user.emailVerifyToken;
      if (user.email) {
        self.sendConfirmEmail(req, user, confirmUrl, settings.baseUrl + 'confirmRegister', function () {

        })
      }

      if (user.phoneNumber && user.country.callingCodes.length) {
        console.log("inside phone")
        let product = settings.productName;
        user.country.callingCodes.forEach(async (callingCode) => {
          let phoneNumber = callingCode + user.phoneNumber;

          // @ts-ignore
          let smsNotification = await self.notificationRepository.create({
            modelId: 'activateAccount',
            isScheduled: true,
            isEmail: false,
            to: phoneNumber,
            sms: 'Please click the link to activate your account ' + confirmUrl + '. Your activation code is ' + user.emailVerifyToken
          })

          console.log(smsNotification);
        })
      }
    })
  }

  async markUserEmailVerified(id: ObjectId) {
    const update = {
      emailVerifyToken: null,
      emailVerifyExpired: null,
      emailVerified: true
    }
    return await this.usersRepository.findOneAndUpdate({ _id: id }, update) ? true : false;
  }

  async update(request: UpdateRequest) {
    let settings = await this.redisCaching.getSetting(request);
    let data = _.omit(request, '_id', 'createdAt', 'emailVerified', 'hashedPassword', 'passwordResetToken', 'salt', 'gradeObject', 'status', '__v', 'user');

    type EmitUser = {
      _id: any;
      avatar?: any;
    };

    if (request.user.email) {
      data = _.omit(data, 'email');
    }

    // Not admin, then omit these fields
    if (!request.user.roles.includes('admin')) {
      data = _.omit(data, 'emailVerified', 'emailVerifyToken', 'isActive', 'role', 'managerStudent', 'isAdmin');
    }

    if (!request.user.roles.includes('mentor')) {
      data = _.omit(data, 'managerPractice');
    }

    let userToUpdate = await this.usersRepository.findById(request.user._id);
    // In case userId is already set, we not allow user to change it. 
    if (userToUpdate.userId && userToUpdate.userId != data.userId) {
      throw new GrpcPermissionDeniedException('There was error updating your profile. Please logout, then login and try again.')
    }

    // user channge country
    if (!userToUpdate.country || (userToUpdate.country.code != data.country.code)) {
      data.country.callingCodes = country.callingCodes(data.country.code);
    }

    var updated = _.merge(userToUpdate, data);

    if (data.subjects) {
      // updated.subjects = data.subjects.map(d => new ObjectId(d))

      updated.subjects = data.subjects.map(d => {
        if (typeof d === 'string' && /^[a-fA-F0-9]{24}$/.test(d)) {
          return new ObjectId(d);
        }
      });
    }

    if (data.specialization) {
      updated.specialization = [];
      updated.specialization = data.specialization
    }
    if (data.phoneNumber == "") {
      updated.phoneNumber = null;
    }
    updated.avatar = data.avatar

    if (data.rollNumber) {
      updated.rollNumber = data.rollNumber;
    }
    if (!request.user.birthdate && data.birthdate == null) {
      data = _.omit(updated, 'birthdate');
    }
    if (data.practiceViews) {
      updated.practiceViews = data.practiceViews;
    }
    if (data.practiceAttempted) {
      updated.practiceAttempted = data.practiceAttempted;
    }
    if (data.emailStudents) {
      updated.emailStudents = data.emailStudents;
    }
    if (data.programmingLang) {
      updated.programmingLang = []
      updated.programmingLang = data.programmingLang;
    }
    if (data.interestedSubject) {
      updated.interestedSubject = []
      updated.interestedSubject = data.interestedSubject;
    }
    if (!request.user.roles && request.roles) {
      request.user.roles = request.roles;
    }

    if (request['dossier.status']) {
      updated.dossier = {}
      updated.dossier['status'] = request['dossier.status'];

      updated.dossier['statusChangedAt'] = request['dossier.statusChangedAt'];
      if (userToUpdate['dossier.feedback']) {
        updated.dossier['feedback'] = userToUpdate['dossier.feedback'];
      }
    }

    if (request?.dossier?.status) {
      updated.dossier = {
        status: request.dossier.status,
        statusChangedAt: request.dossier.statusChangedAt
      };

      if (request?.dossier?.feedback) {
        updated.dossier['feedback'] = request.dossier.feedback;
      }
    }

    if (request.identityInfo && request.identityInfo.imageUrl && request.identityInfo.fileUrl && request.isRequiredIdentity) {
      let s1 = request.identityInfo.imageUrl;
      let s2 = request.identityInfo.fileUrl;
      let spliter = '/uploads';

      if (request.identityInfo.fileUrl) {
        let tempPaths = request.identityInfo.fileUrl.split(spliter)
        if (tempPaths.length > 0) {
          s2 = spliter + tempPaths[1];
        }
      }

      const db = config.dbConfig.find((db) => db.instancekey === request.instancekey);
      const instanceAsset = db ? db.assets : null;

      const path1 = path.join(instanceAsset, 's1').replace(/\\/g, '/');
      const path2 = path.join(instanceAsset, 's2').replace(/\\/g, '/');

      const faceCompareData = await this.s3Service.faceCompare(path1, path2);

      let faceMatchedScore = 0;
      if (faceCompareData.length > 0) {
        faceMatchedScore = faceCompareData.sort((a, b) => { return b - a })[0];
      }

      if (faceMatchedScore >= settings.IdentityMatchThreshold) {
        updated.identityInfo = {
          imageUrl: s1,
          fileUrl: s2,
          matchedPercentage: faceMatchedScore
        }

        try {
          const updatedUser = await this.usersRepository.updateOne({ _id: new ObjectId(request.id) }, updated);

          let emitUser: EmitUser = {
            _id: updated._id
          }
          if (updated.avatar) {
            emitUser.avatar = {
              _id: updated.avatar._id
            }
          }
          this.eventBus.emit('User.updatedAvatar', {
            insKey: request.instancekey,
            user: emitUser
          });

          // Update userinfo
          this.practiceSetRepository.updateMany({
            user: updatedUser._id
          }, {
            userInfo: {
              _id: updatedUser._id,
              name: updatedUser.name
            }
          });

          await this.updateProfileComplete(request, true);

          if (request.approval) {
            await this.sendDossierSubmissionEmail(request)
          }

          return { msg: "ok" };

        } catch (err) {
          // validationError(res, err);
          throw new GrpcInternalException(err.message);
        }
      } else {
        throw new GrpcInternalException("Identity verification failed. Make sure to re-take the picture with only you in the camera. You may also upload a different and most current identity verification document");
      }
    } else {
      try {
        let updatedUser = await this.usersRepository.findOneAndUpdate({ _id: new ObjectId(request.id) }, updated)

        let emitUser: EmitUser = {
          _id: updated._id
        }
        if (updated.avatar) {
          emitUser.avatar = {
            _id: updated.avatar._id
          }
        }
        this.eventBus.emit('User.updatedAvatar', {
          insKey: request.instancekey,
          user: emitUser
        });

        // Update userinfo
        await this.practiceSetRepository.updateMany({
          user: updatedUser._id
        }, {
          userInfo: {
            _id: updatedUser._id,
            name: updatedUser.name
          }
        });

        await this.updateProfileComplete(request, false);

        if (request.approval) {
          await this.sendDossierSubmissionEmail(request)
        }

        if (updatedUser.roles.includes('teacher') && updatedUser.isMentor) {
          // create detault classroom for mentor
          let classroom = await this.classroomRepository.findOne({
            user: updatedUser._id,
            allowDelete: false,
            slugfly: "my-mentees"
          });

          if (!classroom) {
            const data = {
              "name": "My Mentees",
              "user": updatedUser._id,
              "students": [],
              "stream": false,
              "role": "user",
              "allowDelete": false,
              "nameLower": "my mentees",
              "slugfly": "my-mentees",
              active: true
            };

            try {
              classroom.save(data);
            } catch (error) {
              console.error("Error creating classroom:", error);
            }
          }
          // update default reference for teacher
          this.userLogRepository.updateOne({ _id: updatedUser._id }, { $set: { 'preferences.createAndPublishTest': true, 'preferences.viewExistingAssessment': true } })
        }
        return { msg: "ok" }
      } catch (error) {
        throw new GrpcInternalException(error);
      }
    }

  }

  async validateUserPicture(request: ValidateUserPictureRequest) {
    try {
      if (!request.user.identityInfo || !request.user.identityInfo.imageUrl) {
        return { valid: false, reason: 'no-image' };
      }

      const imageUrl = path.join(request.instancekey, request.user.identityInfo.imageUrl).replace(/\\/g, '/');
      // const imageUrl = 'staging/uploads/file/6643ba49d72558adfc44e929/2person.jpg';
      let data = await this.s3Service.faceDetect(imageUrl);
      /*
       [
        {
          BoundingBox: [Object],
          Confidence: 99.99828338623047,
          Landmarks: [Array],
          Pose: [Object],
          Quality: [Object]
        }
       ]
      */
      let minConfidence = 80;
      if (!data.length || !data.find(f => f.Confidence > minConfidence)) {
        return { valid: false, reason: 'no-candidate' };
      }

      let validFaces = data.filter(f => f.Confidence > minConfidence)

      if (validFaces.length > 1) {
        return { valid: false, reason: 'more-than-one' };
      }

      return { valid: true, confidence: validFaces[0].Confidence };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  private generateSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
  }

  private async getVerificationCode(req) {
    let code = await this.getRandomDigit(6);
    let isCodeUnique = false;

    while (!isCodeUnique) {
      code = await this.getRandomDigit(6);
      const existingCode = await this.usersRepository.findOne({ emailVerifyToken: code }, { _id: 1 });
      isCodeUnique = !existingCode;
    }

    return code;
  }

  async getRandomDigit(digitLength) {
    var chars = '0123456789'
    var string_length = digitLength
    var code = ''
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length)
      code += chars.substring(rnum, rnum + 1)
    }
    return code
  }

  private async setDefaultDataForUser(request: any, newUser, settings) {
    if (!newUser.country || !newUser.country.currency) {
      let geo = geoip.lookup(request.ip);
      if (geo && geo.country && settings && settings.countries.find(c => c.code == geo.country)) {
        newUser.country = {
          code: geo.country,
          name: settings.countries.find(c => c.code == geo.country).name,
          currency: settings.countries.find(c => c.code == geo.country).currency
        }
      }
      else {
        // if it cannot detect country, get default from settings
        let defaultCountry = settings.countries.find(c => c.default)
        if (defaultCountry) {
          newUser.country = {
            code: defaultCountry.code,
            name: defaultCountry.name,
            currency: defaultCountry.currency
          }
        }
      }
    }

    if (newUser.country && newUser.country.code) {
      newUser.country.callingCodes = callingCodes(newUser.country.code);

      if (settings.countries.length == 1) {
        newUser.country.confirmed = true
      }
    }
  }

  private async addUserInClassroom(req: any, user, seqCode: string) {
    try {
      this.classroomRepository.setInstanceKey(req.instancekey);
      let classroom = await this.classroomRepository.findOne({
        seqCode: this.regexCode(seqCode)
      })

      if (classroom) {
        if (!classroom.students.find(s => s.studentUserId == user.userId)) {
          classroom.students.push({
            studentId: user._id,
            status: true,
            autoAdd: false,
            studentUserId: user.userId,
            registeredAt: user.createdAt,
            iRequested: false
          })

          await this.classroomRepository.findByIdAndUpdate(classroom._id, classroom);

          if (classroom.location) {
            this.usersRepository.setInstanceKey(req.instancekey);
            await this.usersRepository.findOneAndUpdate({ _id: user._id }, {
              $addToSet: {
                locations: classroom.location
              },
              $set: {
                activeLocation: classroom.location,
                onboarding: true
              }
            })
          }
        }
      } else {
        Logger.warn('Found no classroom with code ' + seqCode)
      }
    } catch (error) {
      Logger.error(error);

    }
  }

  private regexCode(testCode: string) {
    let pattern = '\\b' + this.escapeRegex(testCode) + '\\b'
    return new RegExp(pattern, 'i');
  }

  private escapeRegex = function (search: string) {
    return search ? search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''; // $& means the whole matched string
  }

  // testFilter(req, callback)
  // There is the same method in student.controller
  // Any fixed in here need to be applied in student.controller
  private async testFilter(req) {
    var accessMode: any = {
      $or: [{
        accessMode: 'public'
      }, {
        accessMode: 'buy'
      }]
    }

    var expire = {
      $or: [{
        expiresOn: {
          $gt: new Date()
        }
      }, {
        expiresOn: null
      }, {
        expiresOn: ''
      }]
    }
    var invitationFilter = {};
    var classIds = [];
    var basicFilter = {
      $and: [accessMode, expire]
    };

    if (!req.user || !req.user.userId) {
      return basicFilter;
    }

    this.classroomRepository.setInstanceKey(req.instancekey);
    const classes = await this.classroomRepository.find({
      'students.studentUserId': req.user.userId,
      active: true
    }, { _id: 1 }, { lean: true })

    if (!classes.length) {
      invitationFilter = {
        $and: [{
          accessMode: 'invitation'
        },
        {
          user: new ObjectId(req.user._id)
        }]
      }

      accessMode.$or.push(invitationFilter);

      var locationCond = { locations: new ObjectId(req.user.activeLocation) }

      return {
        $and: [locationCond, accessMode, expire]
      }

    } else {
      classIds = _.map(classes, '_id');

      this.attendanceRepository.setInstanceKey(req.instancekey)
      const attendances = await this.attendanceRepository.find({
        studentId: req.user._id,
        active: true,
        admitted: true,
        classId: {
          $in: classIds
        }
      }, null, { lean: true })


      var testIds = _.map(attendances, 'practicesetId');

      invitationFilter = {
        $and: [{
          accessMode: 'invitation'
        },
        {
          allowStudent: true
        },
        {
          $or: [{
            classRooms: {

              $in: classIds
            }
          }, {
            user: new ObjectId(req.user._id)
          }]

        },
        {
          $or: [{
            requireAttendance: {
              $exists: false
            }
          },
          {
            requireAttendance: false
          },
          {
            _id: {
              $in: testIds
            }
          }]
        }]
      }

      accessMode.$or.push(invitationFilter);

      var locationCond = { locations: new ObjectId(req.user.activeLocation) }

      return {
        $and: [locationCond, accessMode, expire]
      }
    }
  }

  private async monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  }

  private async diff_weeks(dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60 * 24 * 7);
    return Math.abs(Math.round(diff));
  }

  private async checkRepeatingEvent(ev) {
    let schEvents = []
    if (new Date(ev.schedule.endDate).getTime() >= new Date().getTime()) {
      if (ev.schedule.repeatEvery == 'day') {
        const date1 = new Date(ev.startDate);
        const date2 = new Date(ev.schedule.endDate);
        const diffTime: number = Math.abs(date2.getTime() - date1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        for (let i = 0; i < diffDays; i++) {
          let dName = moment(new Date(ev.startDate)).add(i + 1, 'd').format('dddd').toLowerCase();
          if (ev.schedule.repeatOn[dName]) {
            const nextStartRunDate = moment(new Date(ev.startDate)).add(i + 1, 'd').toDate()
            const nextEndRunDate = moment(new Date(ev.endDate)).add(i + 1, 'd').toDate()
            schEvents.push({ ...ev, startDate: nextStartRunDate, endDate: nextEndRunDate })
          }
        }
      } else if (ev.schedule.repeatEvery == 'week') {
        const weeks = await this.diff_weeks(ev.startDate, ev.schedule.endDate)
        for (let i = 0; i < weeks - 1; i++) {
          const nextStartRunDate = moment(new Date(ev.startDate)).add(i + 1, 'w').toDate()
          const nextEndRunDate = moment(new Date(ev.endDate)).add(i + 1, 'w').toDate()
          schEvents.push({ ...ev, startDate: nextStartRunDate, endDate: nextEndRunDate })
        }
      } else if (ev.schedule.repeatEvery == 'month') {
        const months = await this.monthDiff(ev.startDate, ev.schedule.endDate)
        for (let i = 0; i < months - 1; i++) {
          let startOfMonth = moment(new Date(ev.startDate)).add(i + 1, 'month').toDate()
          let endOfMonth = moment(new Date(ev.endDate)).add(i + 1, 'month').toDate()

          const nextStartRunDate = moment(startOfMonth).toDate()
          const nextEndRunDate = moment(endOfMonth).toDate()
          schEvents.push({ ...ev, startDate: nextStartRunDate, endDate: nextEndRunDate })
        }
      } else if (ev.schedule.repeatEvery == 'year') {
        const years = (await this.monthDiff(ev.startDate, ev.schedule.endDate)) / 12;
        for (let i = 0; i < years - 1; i++) {
          let startOfYear = moment(ev.startDate).add(i + 1, 'year').startOf('year').toDate()
          let endOfYear = moment(ev.endDate).add(i + 1, 'year').startOf('year').toDate()
          const nextStartRunDate = moment(startOfYear).toDate()
          const nextEndRunDate = moment(endOfYear).toDate()
          schEvents.push({ ...ev, startDate: nextStartRunDate, endDate: nextEndRunDate })
        }
      }
    }
    return schEvents;
  }

  private async courseFilter(req, includePublisher?) {
    return new Promise(async (resolve, reject) => {
      try {
        if (req.params && req.params.id) {
          this.userCourseRepository.setInstanceKey(req.instancekey);
          let isEnrolled = await this.userCourseRepository.findOne({ user: new ObjectId(req.user._id), course: new ObjectId(req.params.id) })
          if (isEnrolled) {
            return resolve({});
          }
        }
        let expire = {
          $or: [{
            expiresOn: {
              $gt: new Date()
            }
          }, {
            expiresOn: null
          }, {
            expiresOn: ''
          }]
        }

        let accessMode: any = {
          $or: [{
            accessMode: 'public'
          }, {
            accessMode: 'buy'
          }]
        }

        var basicFilter = {
          $and: [accessMode, expire]
        };

        if (!req.user || !req.user.userId) {
          return resolve(basicFilter)
        }

        var invitationFilter = {};
        var classIds = [];

        this.classroomRepository.setInstanceKey(req.instancekey);
        classIds = await this.classroomRepository.distinct('_id', {
          'students.studentUserId': req.user.userId, active: true
        })

        if (classIds.length) {
          invitationFilter = {
            $and: [{
              accessMode: 'invitation'
            },
            {
              classrooms: {
                $in: classIds
              }
            }]
          }

          accessMode.$or.push(invitationFilter);
        }

        var locationCond = {}
        if (includePublisher) {
          locationCond = {
            $or: [
              {
                locations: new ObjectId(req.user.activeLocation)
              },
              {
                origin: 'publisher'
              }
            ]
          }
        } else {
          locationCond = { locations: new ObjectId(req.user.activeLocation) }
        }

        return resolve({
          $and: [locationCond, accessMode, expire]
        })
      } catch (ex) {
        return reject(ex.message)
      }
    })
  }

  async getEvents(req: GetEventsRequest) {
    try {
      let start = timeHelper.getStartOfDate(new Date(req.query.startDate), req.headers.timezoneoffset)
      let end = timeHelper.getEndOfDate(new Date(req.query.endDate), req.headers.timezoneoffset)

      let eventFilter: any = { startDate: { $gte: start }, endDate: { $lt: end } }

      if (canOnlySeeLocationContents(req.user.roles)) {
        eventFilter.location = new ObjectId(req.user.activeLocation)
      }
      if (!req.user.roles.includes('student')) {
        if (req.query.excludeCourse) {
          let filter: any = {
            testMode: 'proctored',
            $and: [{ startDate: { $gte: start } }, { startDate: { $lt: end } }]
          }

          if (canOnlySeeLocationContents(req.user.roles)) {
            filter.locations = req.user.activeLocation
          }

          // testFilter will filter test by access mode and expire
          if (canOnlySeeHisOwnContents(req.user.roles)) {
            filter.$or = [{
              user: new ObjectId(req.user._id)
            }, {
              lastModifiedBy: new ObjectId(req.user._id)
            }]
          }

          this.eventsRepository.setInstanceKey(req.instancekey);
          this.practiceSetRepository.setInstanceKey(req.instancekey);
          let results = await Promise.all([
            this.eventsRepository.find(eventFilter, null, { lean: true }),
            this.practiceSetRepository.find(filter, { title: 1, description: 1, startDate: 1, totalTime: 1 }, { lean: true }),
          ])
          let scheduleEvent = []
          for (const fe of results[0]) {
            if (fe.schedule && fe.schedule.active) {
              scheduleEvent = scheduleEvent.concat(await this.checkRepeatingEvent(fe))
            }
          }

          let events = results[0].concat(scheduleEvent)
          let proctoredTests = results[1]

          let toReturn = proctoredTests.map(d => {
            let startDate = d.startDate;
            let endDate = null;
            if (startDate) {
              endDate = moment(startDate).add(d.totalTime, 'minutes')
            }
            return {
              title: d.title,
              summary: d.description,
              startDate: startDate,
              endDate: endDate,
              allDays: false,
              type: 'exam',
              id: d._id
            }
          })

          toReturn = toReturn.concat(events)

          return { response: toReturn };
        } else {
          let filter: any = {
            testMode: 'proctored',
            $and: []
          }

          if (canOnlySeeLocationContents(req.user.roles)) {
            filter.locations = new ObjectId(req.user.activeLocation)
          }

          if (canOnlySeeHisOwnContents(req.user.roles)) {
            filter.$or = [{
              user: new ObjectId(req.user._id)
            }, {
              lastModifiedBy: new ObjectId(req.user._id)
            }]
          }

          filter['$and'] = filter['$and'].concat([{ startDate: { $gte: start } }, { startDate: { $lt: end } }])

          let cFilter = await this.courseFilter(req)
          let contentTypes = ['assessment', 'onlineSession']

          cFilter['$and'] = cFilter['$and'].concat([{ 'sections.contents.type': { $in: contentTypes } }, { 'sections.contents.startDate': { $gte: start } }, { 'sections.contents.startDate': { $lt: end } }])

          this.eventsRepository.setInstanceKey(req.instancekey);
          this.practiceSetRepository.setInstanceKey(req.instancekey);
          this.courseRepository.setInstanceKey(req.instancekey);
          let results = await Promise.all([
            this.eventsRepository.find(eventFilter, null, { lean: true }),
            this.practiceSetRepository.find(filter, { title: 1, description: 1, startDate: 1, totalTime: 1 }, { lean: true }),
            this.courseRepository.find(cFilter, null, { lean: true })
          ])
          let scheduleEvent = []
          for (const fe of results[0]) {
            if (fe.schedule && fe.schedule.active) {
              scheduleEvent = scheduleEvent.concat(await this.checkRepeatingEvent(fe))
            }
          }

          let events = results[0].concat(scheduleEvent)
          let proctoredTests = results[1]
          let courses = results[2]

          let addedExams = {}

          let toReturn = proctoredTests.map(d => {
            let startDate = d.startDate;
            let endDate = null;
            if (startDate) {
              endDate = moment(startDate).add(d.totalTime, 'minutes')
            }
            addedExams[d._id.toString()] = true;
            return {
              title: d.title,
              summary: d.description,
              startDate: startDate,
              endDate: endDate,
              allDays: false,
              type: 'exam',
              id: d._id
            }
          })

          let courseEvents = []

          for (let course of courses) {
            course.sections = course.sections.filter(sec => sec.status == 'published')

            for (let section of course.sections) {
              for (let content of section.contents) {
                if (contentTypes.indexOf(content.type) > -1) {
                  if (content.type == 'assessment') {
                    if (addedExams[content.contentId.toString()]) {
                      continue;
                    }
                    if (!content.duration) {
                      this.practiceSetRepository.setInstanceKey(req.instancekey);
                      let as = await this.practiceSetRepository.findById(content.contentId, null, { lean: true })
                      content.duration = as.totalTime
                    }
                  }

                  let ctype = content.type == 'assessment' ? 'exam' : (content.type == 'onlineSession' ? 'onlineSession' : 'event')

                  courseEvents.push({
                    title: content.title,
                    summary: content.summary,
                    startDate: content.startDate,
                    endDate: moment(content.startDate).add((content.duration ? content.duration : 60), 'minutes'), //default 1 hours event
                    allDays: false,
                    type: ctype,
                    id: content.contentId,
                    courseID: course._id,
                    courseName: course.title,
                    contentID: content._id,
                    link: content.link
                  })
                }
              }
            }
          }

          toReturn = toReturn.concat(events).concat(courseEvents)

          return { response: toReturn };
        }
      } else {
        if (req.query.excludeCourse) {
          var filter: any = await this.testFilter(req)

          filter.testMode = 'proctored';
          filter['$and'] = filter['$and'].concat([{ startDate: { $gte: start } }, { startDate: { $lt: end } }])

          this.eventsRepository.setInstanceKey(req.instancekey);
          this.practiceSetRepository.setInstanceKey(req.instancekey);
          let results = await Promise.all([
            this.eventsRepository.find(eventFilter, null, { lean: true }),
            this.practiceSetRepository.find(filter, { title: 1, description: 1, startDate: 1, totalTime: 1 }, { lean: true }),
          ])
          let filterEv = [];
          let scheduleEvent = [];
          for (const result of results[0]) {
            if (result.allStudents) {
              filterEv.push(result)
            } else if (result.students && result.students.length > 0 && result.students.includes(req.user.userId)) {
              filterEv.push(result)
            } else if (result.classroom && result.classroom.length > 0) {
              const all = await Promise.all([this.classroomRepository.find({ _id: { $in: result.classroom } }, { students: 1, _id: 1 }, { lean: true })]);
              all[0].forEach(c => {
                c.students = c.students.map(f => f.studentId.toString())
                if (c.students.includes(req.user._id.toString())) {
                  filterEv.push(result)
                }
              })
            }
            if (result.schedule && result.schedule.active) {
              scheduleEvent = scheduleEvent.concat(await this.checkRepeatingEvent(result))
            }
          }
          let events = filterEv.concat(scheduleEvent)
          let proctoredTests = results[1]

          let toReturn = proctoredTests.map(d => {
            let startDate = d.startDate;
            let endDate = null;
            if (startDate) {
              endDate = moment(startDate).add(d.totalTime, 'minutes')
            }
            return {
              title: d.title,
              summary: d.description,
              startDate: startDate,
              endDate: endDate,
              allDays: false,
              type: 'exam',
              id: d._id
            }
          })

          toReturn = toReturn.concat(events)

          return { response: toReturn };
        } else {
          // testFilter will filter test by access mode and expire
          filter = await this.testFilter(req)

          filter.testMode = 'proctored';
          filter['$and'] = filter['$and'].concat([{ startDate: { $gte: start } }, { startDate: { $lt: end } }])

          let cFilter = await this.courseFilter(req)
          let contentTypes = ['assessment', 'onlineSession']

          cFilter['$and'] = cFilter['$and'].concat([{ 'sections.contents.type': { $in: contentTypes } }, { 'sections.contents.startDate': { $gte: start } }, { 'sections.contents.startDate': { $lt: end } }])

          this.eventsRepository.setInstanceKey(req.instancekey);
          this.practiceSetRepository.setInstanceKey(req.instancekey);
          this.courseRepository.setInstanceKey(req.instancekey);
          let results = await Promise.all([
            this.eventsRepository.find(eventFilter, null, { lean: true }),
            this.practiceSetRepository.find(filter, { title: 1, description: 1, startDate: 1, totalTime: 1, classrooms: 1, students: 1 }, { lean: true }),
            this.courseRepository.find(cFilter, null, { lean: true })
          ])
          let filterEv = [];
          let scheduleEvent = [];
          for (const result of results[0]) {
            if (result.allStudents) {
              filterEv.push(result)
            } else if (result.students && result.students.length > 0 && result.students.includes(req.user.userId)) {
              filterEv.push(result)
            } else if (result.classroom && result.classroom.length > 0) {
              this.classroomRepository.setInstanceKey(req.instancekey);
              const all = await Promise.all([this.classroomRepository.find({ _id: { $in: result.classroom } }, { students: 1, _id: 1 }, { lean: true })])
              all[0].forEach(c => {
                c.students = c.students.map(f => f.studentId.toString())
                if (c.students.includes(req.user._id.toString())) {
                  filterEv.push(result)
                }
              })
            }
          }
          for (const fe of filterEv) {
            if (fe.schedule && fe.schedule.active) {
              scheduleEvent = scheduleEvent.concat(await this.checkRepeatingEvent(fe))
            }
          }

          let events = filterEv.concat(scheduleEvent)
          let proctoredTests = results[1]
          let courses = results[2]
          let addedExams = {}

          let toReturn = proctoredTests.map(d => {
            let startDate = d.startDate;
            let endDate = null;
            if (startDate) {
              endDate = moment(startDate).add(d.totalTime, 'minutes')
            }
            addedExams[d._id.toString()] = true;
            return {
              title: d.title,
              summary: d.description,
              startDate: startDate,
              endDate: endDate,
              allDays: false,
              type: 'exam',
              id: d._id
            }
          })

          let courseEvents = []

          for (let course of courses) {
            course.sections = course.sections.filter(sec => sec.status == 'published')

            for (let section of course.sections) {
              for (let content of section.contents) {
                if (contentTypes.indexOf(content.type) > -1) {
                  if (content.type == 'assessment') {
                    if (content.contentId && addedExams[content.contentId.toString()]) {
                      continue;
                    }
                    if (!content.duration && content.contentId) {
                      this.practiceSetRepository.setInstanceKey(req.instancekey);
                      let as = await this.practiceSetRepository.findById(content.contentId, null, { lean: true })
                      content.duration = as.totalTime
                    }
                  }

                  let ctype = content.type == 'assessment' ? 'exam' : (content.type == 'onlineSession' ? 'onlineSession' : 'event')

                  courseEvents.push({
                    title: content.title,
                    summary: content.summary,
                    startDate: content.startDate,
                    endDate: moment(content.startDate).add((content.duration ? content.duration : 60), 'minutes'), //default 1 hours event
                    allDays: false,
                    type: ctype,
                    id: content.contentId,
                    courseID: course._id,
                    courseName: course.title,
                    contentID: content._id,
                    link: content.link
                  })
                }
              }
            }
          }

          toReturn = toReturn.concat(events).concat(courseEvents)

          return { response: toReturn };
        }
      }
    } catch (error) {
      console.log(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async getStudentEvents(req: GetStudentEventsRequest) {
    try {
      let start = timeHelper.getStartOfDate(new Date(req.query.startDate), req.headers.timezoneoffset)
      let end = timeHelper.getEndOfDate(new Date(req.query.endDate), req.headers.timezoneoffset)
      let mentorFilter: any = {}
      if (!req.user.roles.includes('mentor')) {
        mentorFilter.location = new ObjectId(req.user.activeLocation)
      }
      let mentorAssFilter = {}
      if (!req.user.roles.includes('mentor')) {
        mentorFilter.locations = new ObjectId(req.user.activeLocation)
      }
      // get student classrooms
      this.classroomRepository.setInstanceKey(req.instancekey);
      let classes = await this.classroomRepository.distinct('_id', { active: true, 'students.studentId': new ObjectId(req.studentId), ...mentorFilter })
      // location: req.user.activeLocation

      if (req.query.excludeCourse) {
        let filter = {
          testMode: 'proctored',
          $and: [
            { startDate: { $gte: start } },
            { startDate: { $lt: end } }
          ],
          $or: [
            { accessMode: "public" },
            { accessMode: "buy" },
            {
              $and: [
                { accessMode: "invitation" },
                { classRooms: { $in: classes } }
              ]
            }
          ],
          locations: new ObjectId(req.user.activeLocation)
        }

        let expireFilter = {
          $or: [{
            expiresOn: {
              $gt: new Date()
            }
          }, {
            expiresOn: null
          }, {
            expiresOn: ''
          }]
        }

        this.eventsRepository.setInstanceKey(req.instancekey);
        this.practiceSetRepository.setInstanceKey(req.instancekey);
        let results = await Promise.all([
          this.eventsRepository.find({
            startDate: { $gte: start },
            endDate: { $lt: end },
            location: new ObjectId(req.user.activeLocation)
          }, null, { lean: true }),
          this.practiceSetRepository.find({
            $and: [
              filter,
              expireFilter
            ]
          },
            { title: 1, description: 1, startDate: 1, totalTime: 1 },
            { lean: true }),
        ])

        let events = results[0]
        let proctoredTests = results[1]

        let toReturn = proctoredTests.map(d => {
          let startDate = d.startDate;
          let endDate = null;
          if (startDate) {
            endDate = moment(startDate).add(d.totalTime, 'minutes')
          }
          return {
            title: d.title,
            summary: d.description,
            startDate: startDate,
            endDate: endDate,
            allDays: false,
            type: 'exam',
            id: d._id
          }
        })

        toReturn = toReturn.concat(events)

        return { response: toReturn };
      } else {
        let filter = {
          testMode: 'proctored',
          $and: [
            { startDate: { $gte: start } },
            { startDate: { $lt: end } }
          ],
          $or: [
            { accessMode: "public" },
            { accessMode: "buy" },
            {
              $and: [
                { accessMode: "invitation" },
                { classRooms: { $in: classes } }
              ]
            }
          ],
          ...mentorAssFilter
          // locations: req.user.activeLocation
        }

        let expireFilter = {
          $or: [{
            expiresOn: {
              $gt: new Date()
            }
          }, {
            expiresOn: null
          }, {
            expiresOn: ''
          }]
        }

        let contentTypes = ['assessment', 'onlineSession']
        let cFilter = {
          locations: new ObjectId(req.user.activeLocation),
          'sections.contents.type': { $in: contentTypes },
          'sections.contents.startDate': { $gte: start, $lt: end },
        }

        let cAccessModeFilter = {
          $or: [
            {
              accessMode: 'public'
            },
            {
              accessMode: 'buy'
            },
            {
              accessMode: 'invitation',
              classrooms: {
                $in: classes
              }
            }
          ]
        }

        let results = await Promise.all([
          this.eventsRepository.find({
            startDate: { $gte: start },
            endDate: { $lt: end },
            ...mentorFilter
            // location: req.user.activeLocation
          }, null, { lean: true }),
          this.practiceSetRepository.find({
            $and: [
              filter,
              expireFilter
            ]
          },
            { title: 1, description: 1, startDate: 1, totalTime: 1 },
            { lean: true }),
          this.courseRepository.find({
            $and: [
              cFilter,
              expireFilter,
              cAccessModeFilter
            ]
          }, null, { lean: true })
        ])

        let events = results[0]
        let proctoredTests = results[1]
        let courses = results[2]

        let addedExams = {}

        let toReturn = proctoredTests.map(d => {
          let startDate = d.startDate;
          let endDate = null;
          if (startDate) {
            endDate = moment(startDate).add(d.totalTime, 'minutes')
          }
          addedExams[d._id.toString()] = true;
          return {
            title: d.title,
            summary: d.description,
            startDate: startDate,
            endDate: endDate,
            allDays: false,
            type: 'exam',
            id: d._id
          }
        })

        let courseEvents = []

        for (let course of courses) {
          course.sections = course.sections.filter(sec => sec.status == 'published')

          for (let section of course.sections) {
            for (let content of section.contents) {
              if (contentTypes.indexOf(content.type) > -1) {
                if (content.type == 'assessment') {
                  if (addedExams[content.source.toString()]) {
                    continue;
                  }
                  if (!content.duration) {
                    this.practiceSetRepository.setInstanceKey(req.instancekey);
                    let as = await this.practiceSetRepository.findById(content.source, null, { lean: true })
                    content.duration = as.totalTime
                  }
                }

                let ctype = content.type == 'assessment' ? 'exam' : (content.type == 'onlineSession' ? 'onlineSession' : 'event')

                courseEvents.push({
                  title: content.title,
                  summary: content.summary,
                  startDate: content.startDate,
                  endDate: moment(content.startDate).add((content.duration ? content.duration : 60), 'minutes'), //default 1 hours event
                  allDays: false,
                  type: ctype,
                  id: content.source,
                  courseID: course._id,
                  courseName: course.title,
                  contentID: content._id,
                  link: content.link
                })
              }
            }
          }
        }

        toReturn = toReturn.concat(events).concat(courseEvents)

        return { response: toReturn };
      }

    } catch (ex) {
      Logger.error(ex)
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async findOnlineUsers(req: FindOnlineUsersRequest) {
    var page = (req.query.page) ? req.query.page : 1
    var limit = (req.query.limit) ? req.query.limit : 20
    var onlineTeachers = [];
    var roles = [];
    var condition: any = {};

    var sort = { createdAt: -1 };
    condition.$or = [{
      "isActive": {
        $exists: false
      }
    }, {
      "isActive": true
    }];
    if (req.query.roles) {
      roles = req.query.roles.split(",");
    }

    await this.socketClientService.initializeSocketConnection(req.instancekey, req.token);
    let userIds = await this.socketClientService.getOnlineUsers(req.instancekey, roles)
    onlineTeachers = userIds;

    this.usersRepository.setInstanceKey(req.instancekey);
    const users = await this.usersRepository.find({ roles: { $in: ["teacher"] } },
      {
        name: 1,
        userId: 1,
        createdAt: 1,
        locations: 1
      },
      {
        sort: sort,
        limit: limit,
        page: page,
        lean: true
      });

    if (onlineTeachers.length > 0) {
      users.forEach((user, index) => {
        var isOnline = onlineTeachers.indexOf(String(user._id));
        if (isOnline !== -1) {
          user.isOnline = true;
        }
      })
    }

    return { response: users };
  }

  async startOneOnOneWbSession(req: StartOneOnOneWbSessionRequest) {
    try {
      let result: any = await this.whiteboardService.startOneOnOne(req, req.query.studentId)
      return result;
    } catch (error) {
      Logger.error(error);
      throw new GrpcInternalException(error.message);
    }
  }

  async joinOneOnOneWbSession(req: JoinOneOnOneWbSessionRequest) {
    let result = await this.whiteboardService.joinOneOnOne(req, req.query.meetingID)

    return result;
  }

  async updateOptionsData(req: UpdateOptionsDataRequest) {
    let data = _.omit(req.body, '_id', 'createdAt', 'email', 'emailVerified', 'hashedPassword', 'passwordResetToken', 'salt', 'gradeObject', 'status')
    var dataToUpdate = {
      practiceViews: data.practiceViews
    };
    var updated = _.merge(req.user, dataToUpdate);

    await this.updateProfileComplete(req, false);

    return;
  }

  async updateRole(req: UpdateRoleRequest) {
    if (!req.body.userRoles) {
      throw new BadRequestException();
    }
    if (req.user.roles) {
      return { status: 'ok' }
    }

    try {
      let settings: any = await this.redisCaching.getSettingAsync(req.instancekey)

      // create new user now
      if (req.user.isTempt) {
        req.user.roles = req.body.userRoles;
        if (req.user.roles.includes('teacher')) {
          req.user.isMentor = true;
        }

        await this.setDefaultDataForUser(req, req.user, settings)

        this.usersRepository.setInstanceKey(req.instancekey);
        let user = await this.usersRepository.create(req.user);

        // Remove tempt user
        Logger.debug('Remove tempt user from redis ' + 'user_' + req.user._id);
        this.redisCaching.del(req, 'user_' + req.user._id, function (count) {
          Logger.debug(count);
          return { status: "ok" };
        });

        // req.session.destroy(function (err) {
        // Remove tempt user data in session
        // });
        return { status: "ok" };
      } else {
        let updateQuery: any = { roles: req.body.userRoles }
        if (req.body.userRoles.includes('teacher')) {
          updateQuery.isMentor = true;
          req.user.isMentor = true
        }
        this.usersRepository.setInstanceKey(req.instancekey);
        const updated = await this.usersRepository.findByIdAndUpdate(new ObjectId(req.user._id), { $set: updateQuery })
      }

      if (settings.features.classroom) {
        await this.createMentorClassroom(req, req.user)
      }
      return { status: 'ok' };
    } catch (ex) {
      Logger.error(ex)
      throw new GrpcInternalException("Internal Server Error");
    }
  }


  /**
 * Generate new user in db using temp user
 */
  async updateTempUser(req: UpdateTempUserRequest) {
    try {
      // role validation
      const setting: any = await this.redisCaching.getSettingAsync(req.instancekey)
      if (!setting.allowRegistration && !req.user) {
        return Promise.reject('Sign up not allowed.')
      }

      var allowRoles = ['student']

      if (req.user) {
        if (req.user.roles == 'admin' || req.user.roles == 'support') {
          allowRoles = ['student', 'admin', 'support', 'operator', 'director', 'centerHead', 'mentor']
        } else if (req.user.roles == 'director') {
          allowRoles = ['student', 'support', 'operator', 'director', 'mentor']
        } else if (req.user.roles == 'publisher') {
          allowRoles = ['support', 'operator']
        }
      }

      if (setting.roles.teacher) {
        allowRoles.push('teacher')
      }
      if (setting.roles.mentor) {
        allowRoles.push('mentor')
      }
      if (setting.roles.publisher) {
        allowRoles.push('publisher')
      }

      if (!req.body.roles.every(role => allowRoles.includes(role))) {
        throw new ForbiddenException('You are not allow to use ' + req.body.roles + ' roles.')
      }

      // tempAuthenticated middleware code
      let data: any = await this.redisCaching.get(req, 'user_' + req.body.id, function (data: any) {
        return data;
      })
      if (data) {
        this.usersRepository.setInstanceKey(req.instancekey);
        req.user = this.usersRepository.create(data.user); // doubt
        req.user.isTempt = data.isTempt;
      } else {
        const user = await this.usersRepository.findById(req.body.id)
        if (!user) {
          throw new UnauthorizedException();
        }

        req.user = user;
      }
      // --tempAuth
      const settings = await this.redisCaching.getSetting(req)
      data = _.pick(req.body, 'name', 'rollNumber', 'registrationNo', 'avatar', 'avatarUrl', 'avatarUrlSM', 'passingYear', 'userId', 'phoneNumber', 'email', 'country', 'password', 'subjects', 'roles', 'ref', 'birthdate', 'gender', 'district', 'interest', 'knowAboutUs', 'city', 'state', 'isVerified', 'whiteboard', 'provider', 'liveboard')
      //check if the user has id in redis cache

      if (!config.config.disposableEmail && req.body.email) {
        if (!BlockEmail.validate(req.body.email)) {
          throw new InternalServerErrorException({
            errors: {
              email: {
                message: 'Disposable email address not allowed. Please enter valid email address'
              }
            }
          })
        }
      }
      this.usersRepository.setInstanceKey(req.instancekey);
      var newUser = await this.usersRepository.create(data);
      newUser.provider = 'local';
      if (newUser.roles.includes('teacher')) {
        newUser.isMentor = true
      }
      var now = new Date();

      newUser.emailVerifyToken = await this.getVerificationCode(req)
      newUser.emailVerifyExpired = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);

      await this.setDefaultDataForUser(req, newUser, settings)

      if (newUser.phoneNumber && newUser.country.callingCodes[0]) {
        newUser.phoneNumberFull = newUser.country.callingCodes[0] + newUser.phoneNumber;
      }

      const user = await this.usersRepository.findByIdAndUpdate(newUser._id, newUser);

      if (req.body.tempPassword) {
        // user.tempPassword = req.body.tempPassword;

      }
      if (settings.features.classroom) {
        this.createMentorClassroom(req, user)

      }
      if (req.body.seqCode) {
        this.addUserInClassroom(req, user, req.body.seqCode)
      }
      this.redisCaching.del(req, 'user_' + req.body.id, function (data) {
        return ("OK");
      });

      return { status: "OK" }
    } catch (error) {
      Logger.error(error);
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        throw new GrpcPermissionDeniedException(error.message)
      }
      if (error instanceof InternalServerErrorException) {
        throw new GrpcInternalException(error.getResponse());
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async updateAdditionalData(req: UpdateAdditionalDataRequest) {
    try {
      let data = req.body.toUpdateData
      this.usersRepository.setInstanceKey(req.instancekey)
      switch (req.body.updatedField) {
        case 'awardsAndRecognition':
          await this.usersRepository.findByIdAndUpdate(new ObjectId(req.user._id), {
            $addToSet: {
              awardsAndRecognition: data
            }
          })
          await this.updateProfileComplete(req, true);
          break;

        case 'extraCurricularActivities':
          await this.usersRepository.findByIdAndUpdate(new ObjectId(req.user._id), {
            $addToSet: {
              extraCurricularActivities: data
            }
          })
          await this.updateProfileComplete(req, true);

          break;

        case 'educationDetails':
          await this.usersRepository.findByIdAndUpdate(new ObjectId(req.user._id), {
            $addToSet: {
              educationDetails: data
            }
          })
          await this.updateProfileComplete(req, true);

          break;

        case 'entranceExam':
          await this.usersRepository.findByIdAndUpdate(new ObjectId(req.user._id), {
            $addToSet: {
              entranceExam: data
            }
          })
          await this.updateProfileComplete(req, true);

          break;

        case 'externalAssessment':
          await this.usersRepository.findByIdAndUpdate(new ObjectId(req.user._id), {
            $addToSet: {
              externalAssessment: data
            }
          })
          await this.updateProfileComplete(req, true);

          break;

        case 'industryCertificates':

          await this.usersRepository.findByIdAndUpdate(new ObjectId(req.user._id), {
            $addToSet: {
              industryCertificates: data
            }
          })
          await this.updateProfileComplete(req, true);

          break;

        case 'trainingCertifications':

          await this.usersRepository.findByIdAndUpdate(new ObjectId(req.user._id), {
            $addToSet: {
              trainingCertifications: data
            }
          })
          await this.updateProfileComplete(req, true);

          break;

        case 'academicProjects':

          await this.usersRepository.findByIdAndUpdate(new ObjectId(req.user._id), {
            $addToSet: {
              academicProjects: data
            }
          })
          await this.updateProfileComplete(req, true);

          break;
        case 'programmingLang':

          await this.usersRepository.findByIdAndUpdate(new ObjectId(req.user._id), {
            $addToSet: {
              programmingLang: data
            }
          })
          await this.updateProfileComplete(req, true);

          break;
      }
      return;
    } catch (error) {
      Logger.log(error);
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  private async authenticate(plainText: string, hashedPassword: string, salt: string) {
    try {
      const generatedHash = await this.generatedHashedPassword(plainText, salt)
      if (generatedHash === hashedPassword) {
        return true;
      }
      return false;
    } catch (error) {
      Logger.error(error)
      return false;
    }
  }

  private async invalidateTokenAfterPasswordChanged(req, instancekey, userId) {
    // invalidate user token
    this.userLogRepository.setInstanceKey(instancekey);
    const token = await this.userLogRepository.distinct('token', { user: userId })
    if (token && token[0]) {
      var tosave = {}
      token.forEach((t) => {
        tosave[t] = true
      })
      const test = await this.redisCaching.set(req, userId + '_revoked_token', tosave)
    }
    await this.socketClientService.initializeSocketConnection(req.instancekey, req.token);
    this.socketClientService.toUser(req.instanceKey, userId, 'account.deactivate', { reason: 'Password Changed' })
  }

  async changePassword(req: ChangePasswordReq) {
    try {
      var userId = req.user._id;
      var oldPass = req.body.oldPassword;
      var newPass = req.body.newPassword;

      this.usersRepository.setInstanceKey(req.instancekey);
      const user = await this.usersRepository.findById(userId);
      const isValid = await this.authenticate(oldPass, user.hashedPassword, user.salt);
      if (isValid) {
        const salt = await crypto.randomBytes(16).toString('hex');
        const hashedPassword = await this.generatedHashedPassword(newPass, salt);
        await this.usersRepository.findByIdAndUpdate(user._id, { salt: salt, hashedPassword: hashedPassword })

        this.invalidateTokenAfterPasswordChanged(req, req.instancekey, user._id)
        this.eventBus.emit('User.changedPasssword', {
          instanceKey: req.instancekey,
          timezoneOffset: req.timezoneoffset,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email
          }
        })
        return { status: 'ok' };
      } else {
        throw new ForbiddenException("Wrong Password");
      }
    } catch (error) {
      Logger.error(error);
      if (error instanceof ForbiddenException) {
        throw new GrpcPermissionDeniedException(error.message)
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async changeNewPassword(req: ChangeNewPasswordReq) {
    try {
      var userId = req.id;
      var newPass = req.body.newPassword;
      this.usersRepository.setInstanceKey(req.instancekey)
      var user = await this.usersRepository.findById(userId);
      let oldHashedPass = user.hashedPassword;

      const newHashedPass = await this.generatedHashedPassword(newPass, user.salt)
      if (oldHashedPass == newHashedPass) {
        throw new BadRequestException('New password must be different than old password.');
      }
      const salt = await crypto.randomBytes(16).toString('hex');
      const hashedPassword = await this.generatedHashedPassword(newPass, salt);
      user.passwordResetToken = null;
      user.emailVerified = true
      user.emailVerifyToken = null
      user.emailVerifyExpired = null
      user.forcePasswordReset = false;
      user.salt = salt;
      user.hashedPassword = hashedPassword;
      user = await this.usersRepository.findByIdAndUpdate(user._id, user)

      this.invalidateTokenAfterPasswordChanged(req, req.instancekey, user._id)
      this.eventBus.emit('User.changedPasssword', {
        instanceKey: req.instancekey,
        timezoneOffset: req.timezoneoffset,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      })
      if (req.body.refresh) {
        let userInfo: any = user;
        userInfo.token = await this.authservice.signToken(req, req.instancekey, user._id, user.roles, req.query.remember);
        return {
          status: 200,
          user: userInfo
        }
      } else {
        return {
          status: 200,
        };
      }
    } catch (error) {
      Logger.log(error);
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async userLiveBoard(req: UserLiveBoardRequest) {
    var start = new Date();
    start.setHours(0, 0, 0, 0);

    var end = new Date();
    end.setHours(23, 59, 59, 999);

    try {
      if (req.query.searchText || req.query._id) {
        let condition: any = {
          roles: { $in: ['teacher'] },
          isActive: true
        }

        if (req.query._id) {
          condition._id = new ObjectId(req.query._id)
        } else {
          condition.$or = [{
            'name': {
              "$regex": req.query.searchText,
              "$options": "i"
            }
          },
          {
            'userId': req.query.searchText
          }, {
            'rollNumber': req.query.searchText
          }]
        }

        //Search Students by name, emailid, 
        this.usersRepository.setInstanceKey(req.instancekey);
        let student = await this.usersRepository.findOne(condition, {
          name: 1, userId: 1, rollNumber: 1, lastLogin: 1,
          roles: 1, provider: 1, country: 1, avatar: 1, avatarSM: 1, avatarMD: 1
        }, { lean: true })
        console.log(student);

        if (!student) {
          throw new NotFoundException("No User found");
        }

        //find all classroom in which students are added.
        this.classroomRepository.setInstanceKey(req.instancekey);
        let classrooms = await this.classroomRepository.find({
          slugfly: { $nin: ["group-study", "my-mentees"] },
          active: true,
          "students.studentId": student._id
        }, { name: 1, students: 1 }, { lean: true });

        student.classrooms = [];
        let clsIds = [];
        for (let cls of classrooms) {
          clsIds.push(cls._id);
          student.classrooms.push({ _id: cls._id, name: cls.name, students: cls.students.length });
        }

        this.practiceSetRepository.setInstanceKey(req.instancekey)
        let tests = await this.practiceSetRepository
          .find({
            startDate: { $gte: start },
            "testMode": "proctored", "classRooms": { $in: clsIds }
          },
            { title: 1, startDate: 1, attemptAllowed: 1, totalTime: 1 },
            { sort: { "startDate": 1.0 }, lean: true });

        student.tests = tests;

        this.userLogRepository.setInstanceKey(req.instancekey);
        let userLogs: any = await this.userLogRepository
          .aggregate([{
            $match: {
              createdAt: { $gte: start, $lt: end },
              "user": student._id
            }
          },
          {
            $project: {
              "timeActive": { "$divide": ["$timeActive", 60000] },
              "browser": "$connectionInfo.browser",
              "os": "$connectionInfo.os",
              "device": "$connectionInfo.device",
              "ai": { $arrayElemAt: ["$connectionInfo.locs", 0] },
              "createdAt": "$createdAt",
              "updatedAt": "$updatedAt"
            }
          }, { $sort: { "updatedAt": -1.0 } }])

        if (userLogs.length > 0) {
          if (userLogs[0].browser) {
            student.browser = userLogs[0].browser
          }
          if (userLogs[0].ai) {
            student.lastCity = userLogs[0].ai.city
            student.lastCountry = userLogs[0].ai.country

            student.ip = userLogs[0].ai.ip
          }
        }
        student.userLogs = userLogs;

        return student;
      } else {
        throw new NotFoundException("No User found");
      }
    } catch (error) {
      Logger.log(error);
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }

  async sendDossierSubmissionEmail(req) {
    let file = 'dossier-submission';
    let customMessage = req.user.name + ' has submitted dossier for approval. Please review and provide your feedback.';
    let options = {
      customMessage: customMessage,
      subject: 'Submitted dossier for approval',
      senderName: req.user.name,
      name: req.user.name,
      userId: req.user.userId,
      rollNumber: req.user.rollNumber
    };

    const mentors = await this.classroomRepository.find({
      where: { students: { studentId: req.user._id }, slugfly: 'my-mentees' },
      relations: ['classRooms', 'user'],
      select: {
        classRooms: { name: true, country: true },
        user: { userId: true },
      },
    });

    await Promise.all(mentors.map(async (mentor) => {
      let dataMsgCenter: {
        modelId: string;
        isScheduled: boolean;
        receiver?: string;
        isEmail?: boolean;
        sms?: string;
      } = {
        modelId: 'classroom',
        isScheduled: true
      };

      if (this.validateEmail(mentor.user.userId)) {
        dataMsgCenter.receiver = mentor.user._id;
      } else {
        dataMsgCenter.receiver = mentor.user.country.callingCodes[0] + mentor.user.userId;
        dataMsgCenter.isEmail = false;
        dataMsgCenter.sms = customMessage;
      }

      this.notificationRepository.create({
        receiver: mentor.user._id,
        type: 'notification',
        modelId: 'classroom',
        isScheduled: false,
        isEmail: true,
        subject: 'Submitted dossier for approval'
      });

      await this.messageCenter.sendWithTemplate(req, 'location-upload-failed', options, dataMsgCenter);
      await this.messageCenter.sendWithTemplate(req, file, options, dataMsgCenter).catch((err) => {
        if (err) {
          Logger.error(err);
        }
      });
    }));
  }

  async find(req: FindRequest) {
    if (req.query.teacherOnly) {
      var sort = { 'createdAt': -1 };
      var condition: any = {
        isActive: true,
        roles: {
          $in: [config.config.roles.teacher]
        }
      };

      if (req.query.location) {
        let temp = req.query.location.split(',')
        condition.locations = { $in: temp.map(l => new ObjectId(l)) };
      } else if (req.userdata.activeLocation) {
        condition.locations = new ObjectId(req.userdata.activeLocation)
      }

      this.usersRepository.setInstanceKey(req.instancekey);
      const users = await this.usersRepository.find(condition, {
        name: 1,
        userId: 1,
        createdAt: 1,
        locations: 1
      }, {
        sort: sort,
        lean: true
      });
      return { users: users };
    } else {
      condition = { isActive: true };
      var page = (req.query.page) ? req.query.page : 1;
      var limit = (req.query.limit) ? req.query.limit : 25;
      sort = { 'createdAt': -1 };
      var skip = (page - 1) * limit;
      var projection = {
        name: 1,
        userId: 1,
        email: 1,
        phoneNumber: 1,
        locations: 1,
        isActive: 1,
        emailVerified: 1,
        roles: 1,
        createdAt: 1,
        lastLogin: 1,
        avatarMD: 1,
        avatarSM: 1,
        avatar: 1,
        emailVerifyToken: 1,
        passingYear: 1,
        placementStatus: 1,
        rollNumber: 1,
        birthdate: 1,
        country: 1,
        forcePasswordReset: 1,
        subjects: 1,
        registrationNo: 1,
        whiteboard: 1,
        liveboard: 1,
        isVerified: 1
      }

      if (req.userdata.activeLocation) {
        condition.locations = new ObjectId(req.userdata.activeLocation)
      }

      if (req.query.roles) {
        var roles = req.query.roles.split(',');
        condition.roles = {
          $in: roles
        }
      }

      if (req.query.searchText) {
        condition.$or = [{
          name: {
            $regex: req.query.searchText,
            $options: "i"
          }
        },
        {
          userId: {
            $regex: req.query.searchText,
            $options: "i"
          }
        }, {
          rollNumber: {
            $regex: req.query.searchText,
            $options: "i"
          }
        }]
      }

      this.usersRepository.setInstanceKey(req.instancekey)
      const userList = await this.usersRepository.find(condition, projection, { sort: sort, skip: skip, limit: limit, lean: true });

      if (userList.length > 0 && (req.query.lastAttempt || req.query.chatSupport)) {
        const attemptPromises = userList.map(async (u) => {
          if (u.role !== config.config.roles.student) {
            return;
          }

          if (req.query.lastAttempt) {
            const condition = {
              user: u._id,
              isAbandoned: false,
            };

            const attempt = await this.attemptRepository
              .findOne(condition, { createdAt: 1 }, { sort: { createdAt: -1 }, lean: true });

            if (attempt) {
              u.lastAttempt = attempt.createdAt;
            }

            if (req.query.chatSupport) {
              u.isOnline = await this.socketClientService.isOnline(req.instancekey, u._id);
            }
          } else if (req.query.chatSupport) {
            u.isOnline = await this.socketClientService.isOnline(req.instancekey, u._id);
          }
        });
        await Promise.all(attemptPromises);
      }

      if (req.query.count) {
        this.usersRepository.setInstanceKey(req.instancekey)
        const userCount = await this.usersRepository.countDocuments(condition);
        return {
          users: userList,
          count: userCount
        }

      } else {
        return { users: userList };
      }
    }
  }
}
