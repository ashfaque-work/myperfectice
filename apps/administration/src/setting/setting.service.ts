import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CouponRepository, SettingRepository, Settings } from '@app/common';
import {
  SettingRequest, DeleteSettingRequest,
  GetSettingResponse, GetOneSettingRequest, UpdateSettingRequest,
  FindOneRequest,
  GetWhiteLabelReq,
  GetFindAllReq,
  GetCountryByIpReq,
  GetVideoStreamingReq,
  AddAdvertismentImageReq,
  DeleteAdvertismentImageReq,
  GetUpdateRequest,
  GetConvertCurrencyReq,
  GetPaymentMethodsReq
} from '@app/common/dto/administration/setting.dto';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { RedisCaching } from '@app/common/services/redisCaching.service';
import * as _ from 'lodash';
import * as geoip from 'geoip-lite';
import { ConfigService } from '@nestjs/config';
import * as dbconfig from '@app/common/config/local'
import { NotificationTemplateRepository } from '@app/common/database/repositories/notificationTemplate.repository';
import async from 'async'
import { config } from '@app/common/config';

@Injectable()
export class SettingService {
  constructor(private readonly settingRepository: SettingRepository,
    private readonly redist: RedisCaching,
    private readonly configService: ConfigService,
    private readonly notificationTemplateRepository: NotificationTemplateRepository,
    private readonly couponRepository: CouponRepository,
    private readonly settings: Settings
  ) { }

  private createModel = function (body) {
    var model = {
      urls: {
        facebookUrl: body.facebookUrl,
        googleUrl: body.googleUrl,
        twitterUrl: body.twitterUrl,
        linkedinUrl: body.linkedinUrl,
        blog: body.blog,
        forum: body.forum
      },
      contact: {
        phoneNumber: body.phoneNumber,
        email: body.email,
        address: body.address
      },
      signupType: {
        google: body.googleSignup,
        facebook: body.facebookSignup
      },
      eCommerce: body.eCommerce,
      themeColor: body.themeColor
    };
    return model;
  };

  private updateModel = function (body) {
    var model = {
      features: {
        // feature tabs 
        chat: body.features.chat,
        hideCodeQuestionOutput: body.features.hideCodeQuestionOutput,
        examschedules: body.features.examschedules,
        triviaGame: body.features.triviaGame,
        classAttendance: body.features.classAttendance,
        editProfile: body.features.editProfile,
        liveBoardForTeacher: body.features.liveBoardForTeacher,
        classroomProctoring: body.features.classroomProctoring,
        evaluation: body.features.evaluation,
        partialCodingMark: body.features.partialCodingMark,

        // role Tab
        parent: body.features.parent,
        students: body.features.students,
        teacher: body.features.teacher,
        operators: body.features.operators,
        support: body.features.support,
        director: body.features.director,

        //modules tabs
        liveboard: body.features.liveboard,
        course: body.features.course,
        testseries: body.features.testseries,
        classroom: body.features.classroom,
        dashboard: body.features.dashboard,
        resume: body.features.resume,
        mentors: body.features.mentors,
        marketplace: body.features.marketplace,
        adaptive: body.features.adaptive,

        //exam & proctor
        faceDetect: body.features.faceDetect,
        fraudDetect: body.features.fraudDetect,
        universityExam: body.features.universityExam,
        whiteboard: body.features.whiteboard,

        captureAdditionalInfo: body.features.captureAdditionalInfo,
        courseReminder: body.features.courseReminder,
        services: body.features.services,
        //show banner
        showBanner: body.features.showBanner,

        // my effort
        myEffort: body.features.myEffort,

        //myOutcome
        myOutcome: body.features.myOutcome,

        //myProfile
        myProfile: body.features.myProfile,

        // my educoins
        myEducoins: body.features.myEducoins,

        //codeEditor
        codeEditor: body.features.codeEditor,

        ambassadorProgram: body.features.ambassadorProgram,

        accountVerification: body.features.accountVerification,

        studentLevel: body.features.studentLevel,

        // weekly repot 
        studentWeeklyReport: body.features.studentWeeklyReport,
        newInstitute: body.features.newInstitute,
        joinInstitute: body.features.joinInstitute
      },
      identityInfo: {
        identityVerification: body.identityInfo.identityVerification,
        collegeName: body.identityInfo.collegeName,
        coreBranch: body.identityInfo.coreBranch,
        passingYear: body.identityInfo.passingYear,
        identificationNumber: body.identityInfo.identificationNumber,
        rollNumber: body.identityInfo.rollNumber,
        gender: body.identityInfo.gender,
        dob: body.identityInfo.dob,
        state: body.identityInfo.state,
        city: body.identityInfo.city,
      },
      roles: {
        teacher: body.roles.teacher,
        student: body.roles.student,
        director: body.roles.director,
        support: body.roles.support,
        operator: body.roles.operator,
        publisher: body.roles.publisher,
        mentor: body.roles.mentor
      },
      // sigup message
      signupMsg: body.signupMsg,

      //Instructions for assessments
      assessmentInstructions: body.assessmentInstructions,

      //pageLogo
      pageLogo: body.pageLogo,

      detectFraud: body.detectFraud,
      allowMarksChange: body.allowMarksChange,
      IdentityMatchThreshold: body.IdentityMatchThreshold,


      signupType: {
        google: body.signupType.google,
        facebook: body.signupType.facebook,
        local: body.signupType.local
      },

      ambassadorDiscount: body.ambassadorDiscount
    };
    return model
  };

  async createSetting(request: SettingRequest) {
    try {
      const instancekey = request.instacneKey;
      delete request.instacneKey
      const body = request;
      // const settingModel = this.createModel(body);
      const settingModelInstance = await this.settingRepository.create(body, { new: true });
      // const setting = await settingModelInstance.save();
      return {
        response: settingModelInstance
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async getSetting() {
    try {
      const settings = await this.settingRepository.find({});
      if (!settings) {
        throw new GrpcNotFoundException('No Settings found!');
      }

      return {
        response: settings,
      };
    } catch (error) {
      // throw new Error('Failed to get all setting');
      throw error;
    }
  }

  async getOneSetting(request: GetOneSettingRequest): Promise<GetSettingResponse> {
    try {
      const setting = await this.settingRepository.findOne(request);
      if (!setting) {
        throw new GrpcNotFoundException('Settings not found!');
      }

      return {
        response: setting,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateSetting(request: UpdateSettingRequest) {
    try {
      const mongooseId = new ObjectId(request._id);
      delete request._id;
      const updatedSetting = await this.settingRepository.findOneAndUpdate(mongooseId, request);
      if (updatedSetting) {
        return {
          response: updatedSetting
        };
      } else {
        throw new Error('Setting not found');
      }
    } catch (error) {
      throw new Error('Failed to update setting');
    }
  }

  async addAdvertismentImage(request: AddAdvertismentImageReq) {
    try {
      if (request.url && request.title) {
        let data = {
          title: request.title,
          url: request.url,
          type: 'testseries'
        }
        let foundBanner = await this.settingRepository.findOne({ slug: 'whiteLabel' });
        let result = await this.settingRepository.updateOne({ slug: 'whiteLabel' }, {
          $push: { bannerImages: { ...data } }
        })
        // foundBanner.bannerImages.push(data);
        // console.log(foundBanner.bannerImages);
        return {
          response: foundBanner
        }
      } else {
        return {
          response: 'invalid'
        }
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async update(request: GetUpdateRequest) {
    try {
      let body = request;

      if (body.notificationTemplates) {
        let notificationTemplates = body.notificationTemplates
        delete body.notificationTemplates

        // update notificationTemplates
        for (let template of notificationTemplates) {
          await this.notificationTemplateRepository.updateOne({ _id: template._id }, { $set: { active: template.active } })
        }
      }

      let oldSetting = await this.settingRepository.findOne({ slug: 'whiteLabel' });
      let settingModel = this.updateModel(body);

      let setting = await this.settingRepository.findOneAndUpdate({ slug: 'whiteLabel' }, { $set: settingModel }, { returnOriginal: false })
      let req = request;
      this.redist.del(req, 'whiteLabel');

      if (settingModel.ambassadorDiscount != undefined && oldSetting.ambassadorDiscount != settingModel.ambassadorDiscount) {
        // update all referal
        await this.couponRepository.updateMany({ isReferral: true }, { $set: { percent: settingModel.ambassadorDiscount } })
      }

      return {
        isSuccess: true,
        id: setting
      }

    } catch (error) {
      Logger.error(error);

    }
  }

  async deleteAdvertismentImage(request: DeleteAdvertismentImageReq) {
    try {
      if (request._id) {
        let result = await this.settingRepository.updateOne({ slug: 'whiteLabel' }, { $pull: { bannerImages: { _id: request._id } } })
        return {
          response: result
        }
      } else {
        throw new BadRequestException("Invalid ID")
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message)
      }
      throw new GrpcInternalException(error);
    }
  }

  async deleteSetting(request: DeleteSettingRequest) {
    try {
      const deletedSetting = await this.settingRepository.findOneAndDelete(request);
      if (deletedSetting) {
        return deletedSetting;
      } else {
        throw new Error('Setting not found');
      }
    } catch (error) {
      throw new Error('Failed to delete setting');
    }
  }

  async findOne(request: FindOneRequest) {
    try {
      let filter: any = {}
      if (request.slug) {
        filter.slug = request.slug;
      }
      let result = await this.settingRepository.findOne(filter, '-_id -mail -mailer -plivo -__v -slug -payment -powerBI -mail_sms -recaptcha -whiteboard', { lean: true })

      if (!result) {
        throw new Error('Setting not found!')
      }

      return {
        response: result, ...result
      }
    } catch (error) {
      throw new Error('Failed to find one setting!')
    }
  }

  async getCurrentDateTime(request: {}) {
    let currentDate = new Date();
    return {
      response: currentDate
    }
  }

  async getCodeEngineAddress(request: {}) {
    // console.log(config.codeRunnerUrl)
    return {
      url: config.codeRunnerUrl
    }
  }

  async getWhiteLabel(request: GetWhiteLabelReq) {
    let result = await this.redist.getSetting(request, function (doc) {
      // Exclude these fields before sending settings to client
      var toReturn = _.omit(doc, '_id', 'facebookAuth', 'googleAuth', 'mail', 'mailer', 'plivo', '__v', 'slug', 'payment', 'powerBI', 'mail_sms', 'recaptcha', 'whiteboard');
      if (toReturn.recaptcha) {
        delete toReturn.recaptcha.privateKey
      }
      // console.log("in cache result");
      return toReturn
    })

    // console.log("the result for cache is:- ", result);

    return {
      response: result
    }
  }

  async findAll(request: GetFindAllReq) {
    try {

      let project: any = { _id: 0 };
      if (request.slugs) {
        let slugs = request.slugs.split(',');
        for (var i in slugs) {
          project[slugs[i]] = 1;
        }
      } else {
        project = { currencyUsEx: 1, pageLogo: 1, pageLogoSocial: 1, pageTitle: 1, _id: 0 };
      }

      const foundSetting = await this.settingRepository.findOne({ slug: 'whiteLabel' }, project);
      if (!foundSetting) {
        return {
          response: {}
        }
      }
      return {
        response: foundSetting
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async getPaymentMethods(request: GetPaymentMethodsReq) {
    try {
      this.settingRepository.setInstanceKey(request.instancekey);
      const foundSetting = await this.settingRepository.findOne({ slug: 'paymentProviders' }, { providers: 1 });
      if (!foundSetting) {
        throw new NotFoundException('Setting Not found!');
      } else {
        const settings = await this.redist.getSetting(request)
        let countryCode = request.country ? request.country.code : settings.countries.findOne(c => c.default).code

        let activeProviders = []
        for (let provider of foundSetting.providers) {
          if (!provider.active || provider.countries.indexOf(countryCode) == -1) {
            continue;
          }
          if (provider.name == 'ccavenue') {
            // ccA is handled in server so we only need to tell client that it is enabled, don't need to send any setting 
            activeProviders.push({
              name: "ccavenue"
            })
          } else if (provider.name == 'paypal') {
            // paypal is handle automactically in client, we need to give it the clientId
            activeProviders.push({
              name: "paypal",
              isSandbox: this.configService.get('DEBUG_MODE'),
              id: this.configService.get('DEBUG_MODE') ? provider.config.sandboxId : provider.config.clientId
            })
          } else if (provider.name == 'razorpay') {
            // paypal is handle automactically in client, we need to give it the clientId
            activeProviders.push({
              name: "razorpay",
              keyId: provider.config.keyId
            })
          }
        }

        return {
          methods: activeProviders,
          currency: settings.countries.find(c => c.code == countryCode).currency
        }
      }
    } catch (error) {
      throw new GrpcInternalException(error.message)
    }
  }

  async getAllInstances(request: {}) {
    let response = config.dbs.filter(db => db.active).map(db => {
      return {
        name: db.name || "Perfectice",
        origin: db.origin,
        instancekey: db.instancekey,
        domain: db.domain,
        assests: db.assets
      }
    })
    return {
      response
    }
  }

  async getWebConfig(request: {}) {
    let sites = config.dbs.map(db => {
      return {
        name: db.name || "Perfectice",
        origin: db.origin,
        instancekey: db.instancekey,
        domain: db.domain,
        assets: db.assets
      }
    })
    return {
      aws: {
        region: config.aws.region,
        s3: config.aws.s3
      },
      sites
    }
  }

  async show(request: {}) {
    try {
      const foundData = await this.settingRepository.find({ slug: 'whiteLabel' }, null, { lean: true })
      if (!foundData) {
        throw new Error("Setting not found!!");
      } else {
        let toReturn = _.omit(foundData[0], '_id', 'facebookAuth', 'googleAuth', 'mail', 'mailer', 'plivo', '__v', 'slug', 'payment', 'powerBI', 'recaptcha', 'whiteboard');
        if (toReturn.recaptcha) {
          delete toReturn.recaptcha.privateKey
        }
        toReturn.mailSms = toReturn.mail_sms
        return {
          ...toReturn
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async getDeploymentStatus(request: {}) {
    let data = await this.redist.globalGetAsync('deploymentstatus', false)
    return { status: data };
  }

  async getCountryByIp(request: GetCountryByIpReq) {
    try {
      let settings: any = await this.redist.getSettingAsync(request.instancekey)
      let geo = geoip.lookup(request.ip)

      if (geo && geo.country && settings.countries.find(c => c.code == geo.country)) {
        return {
          code: geo.country,
          name: settings.countries.find(c => c.code == geo.country).name
        }
      } else {
        // if it cannot detect country, get default from settings
        let defaultCountry = settings.countries.find(c => c.default)
        if (!defaultCountry) {
          defaultCountry = settings.countries[0]
        }
        return {
          code: defaultCountry.code,
          name: defaultCountry.name
        }
      }
    } catch (error) {
      Logger.log(error)
      throw new GrpcInternalException('Internal Server Error')
    }
  }

  async getVideoStreaming(request: GetVideoStreamingReq) {
    try {
      let config = await this.redist.getAsync(request.instancekey, 'videoStreaming');
      if (!config) {
        config = await this.settingRepository.findOne({ slug: 'videoStreaming' })
        await this.redist.set(request, 'videoStreaming', config, 60 * 120)
        const val = await this.redist.getAsync(request.instancekey, 'videoStreaming')
      }
      return {
        response: config
      }
    } catch (error) {
      Logger.error(error)
    }
  }

  async convertCurrency(request: GetConvertCurrencyReq) {
    try {
      if (!request.to) {
        throw new BadRequestException();
      }

      let from;
      if (!request.from) {
        let settings: any = await this.redist.getSettingAsync(request.instancekey);
        let country = settings.countries.find(c => c.default);
        if (request.user.country && request.user.country.code) {
          country = settings.countries.find(c => c.code == request.user.country.code)
        }
        if (!country) {
          throw new BadRequestException();
        }

        from = country.currency
      } else {
        from = request.from
      }
      let result = await this.settings.internalConvertCurrency(request, from, request.to)

      return result;
    } catch (error) {
      Logger.error(error);
      if (error instanceof BadRequestException) {
        throw new GrpcNotFoundException(error.getResponse);
      }
      throw new GrpcInternalException("Internal Server Error");
    }
  }
}