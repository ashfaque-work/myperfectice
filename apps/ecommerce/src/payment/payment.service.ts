import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import { Types } from 'mongoose';
import {
  CountAllPaymentDetailRes, CreatePaymentReq, EnrollItemsReq, FindByMeReq, FindByMeRes, FindOneByMeReq, FindOneByMeRes, FinishCCAReq,
  GetTransactionReq, GetTransactionRes, InitCCAReq, LastRevenueRes, PaymentFinishReq, PaymentResultReq, RevenueAllReq, RevenueAllRes
} from '@app/common/dto/eCommerce';
import {
  BitlyService, CcavUtil, CouponRepository, CourseRepository, isEmail, LocationRepository, NotificationRepository,
  PaymentDetailRepository, PaymentRepository, PracticeSetRepository, QuestionRepository, RedisCaching, ServiceRepository,
  SettingRepository, Settings, TestSeriesRepository, UserEnrollmentRepository, UsersRepository
} from '@app/common';
import * as moment from 'moment';
import { config } from '@app/common/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { MessageCenter } from '@app/common/components/messageCenter';
import * as Numeral from 'numeral';
import * as Currencies from 'currencies';
import * as _ from 'lodash';
import Razorpay from 'razorpay';


@Injectable()
export class PaymentService {
  constructor(
    private readonly redisCache: RedisCaching,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentDetailRepository: PaymentDetailRepository,
    private readonly settingRepository: SettingRepository,
    private readonly usersRepository: UsersRepository,
    private readonly courseRepository: CourseRepository,
    private readonly testSeriesRepository: TestSeriesRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly practiceSetRepository: PracticeSetRepository,
    private readonly userEnrollmentRepository: UserEnrollmentRepository,
    private readonly couponRepository: CouponRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly locationRepository: LocationRepository,
    private readonly httpService: HttpService,
    private readonly ccavUtil: CcavUtil,
    private readonly settings: Settings,
    private readonly messageCenter: MessageCenter,
    private readonly bitly: BitlyService,
  ) { }

  //Internal Functions - Start
  private async revenueByDate(request: any, matchDate: any): Promise<any> {
    const { user, instancekey } = request;

    const settings = await this.redisCache.getSetting(request);
    const condition: any = { status: 'success' };

    if (!settings.isWhiteLabelled) {
      condition.forUser = new Types.ObjectId(user._id);
    }

    const match = { $match: condition };
    const group = {
      $group: {
        _id: null,
        totalPayment: { $sum: "$totalPayment" },
        currency: { $first: "$currency" }
      }
    };
    const project = {
      $project: {
        _id: "$_id",
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $month: "$createdAt" }, // Corrected to $day
        updatedAt: "$updatedAt",
        totalPayment: "$totalPayment",
        currency: "$currency"
      }
    };

    if (!matchDate) {
      matchDate = {
        $project: {
          _id: "$_id",
          totalPayment: "$totalPayment",
          currency: "$currency",
          year: "$year",
          day: '$day',
          updatedAt: "$updatedAt",
          month: "$month"
        }
      };
    }

    const results = await this.paymentRepository.aggregate([match, project, matchDate, group]);
    if (results && results.length > 0) {
      return results[0];
    } else {
      return [];
    }
  }

  private async handleCCAInit(req: any): Promise<any> {
    try {
      const payment = await this.setItemPayment(req);
      const userCountry = await this.getUserCountryData(req);

      let couponIds = payment.couponIds || [];
      let discountValue = payment.discountValue || 0;
      let discountData = payment.discountData || [];

      let newPayment: any = {
        billing_name: req.payment.billingName,
        billing_address: req.payment.billingAddress,
        billing_city: req.payment.billingCity,
        billing_state: req.payment.billingState,
        billing_zip: req.payment.billingZip,
        billing_country: '',
        amount: req.payment.amount,
        user: new Types.ObjectId(req.user._id),
        status: 'pending',
        currency: userCountry.currency,
        hasDiscount: false,
        discountData: discountData,
        couponIds: couponIds,
        discountValue: discountValue,
        totalPayment: req.payment.amount - discountValue,
      };

      if (req.user.email) {
        newPayment.billing_email = req.user.email;
      }
      if (req.user.phoneNumber) {
        newPayment.billing_tel = req.user.phoneNumber;
      }
      if (req.payment.billingCountryCode) {
        newPayment.billing_country = req.payment.billingCountryCode.name;
      }
      if (discountData.length > 0) {
        newPayment.hasDiscount = true;
      }
      if (newPayment.totalPayment < 0) {
        newPayment.totalPayment = req.payment.amount;
      }
      if (newPayment.totalPayment === 0) {
        newPayment.status = 'success';
      }

      this.paymentRepository.setInstanceKey(req.instancekey);
      this.paymentDetailRepository.setInstanceKey(req.instancekey);
      const savedPayment = await this.paymentRepository.create(newPayment);

      const paymentDetailIds = [];
      for (const item of req.orderDetail) {
        if (!item.user) {
          throw new InternalServerErrorException ('That package is deleted. It is not available for purchase');
        }

        const paymentDetailObject = {
          payment: new Types.ObjectId(savedPayment._id),
          byUser: savedPayment.user,
          forUser: new Types.ObjectId(item.user._id) || new Types.ObjectId(item.user),
          price: item.price,
          practiceIds: item.practiceIds,
          isMembershipEligible: item.isMembershipEligible,
          expirationValue: item.expirationValue,
          discountValue: item.discountValue,
          totalPayment: item.totalPayment || item.price,
          status: savedPayment.status,
          currency: userCountry.currency,
          couponData: item.couponData || null,
          course: item.typeItem === 'course' ? item._id : null,
          testseries: item.typeItem === 'testseries' ? item._id : null,
          service: item.typeItem === 'service' ? item._id : null,
          practice: item.typeItem !== 'course' && item.typeItem !== 'testseries' && item.typeItem !== 'service' ? item._id : null,
          model: item.typeItem || 'practice',
        };

        const savedPaymentDetail = await this.paymentDetailRepository.create(paymentDetailObject);
        paymentDetailIds.push(savedPaymentDetail._id);
      }

      const updatedpayment = await this.paymentRepository.updateOne(
        { _id: new Types.ObjectId(savedPayment._id) }, { paymentDetails: paymentDetailIds }
      );

      return updatedpayment;
    } catch (err) {
      Logger.error('Error initializing CCA', err);
      throw new GrpcInternalException('Error initializing CCA');
    }
  }

  private async setItemPayment(req: any): Promise<any> {
    const orderDetail = req.orderDetail;
    const realOrderDetail = [];
    const payment = req.payment;
    let discountAmount = 0;
    const purchaseIds = [];

    for (const item of orderDetail) {
      let orgItem;

      if (item.typeItem === 'course') {
        this.courseRepository.setInstanceKey(req.instancekey);
        orgItem = await this.courseRepository.findById(item._id);
      } else if (item.typeItem === 'testseries') {
        this.testSeriesRepository.setInstanceKey(req.instancekey);
        orgItem = await this.testSeriesRepository.findById(item._id);
      } else if (item.typeItem === 'service') {
        this.serviceRepository.setInstanceKey(req.instancekey);
        orgItem = await this.serviceRepository.findById(item._id);
        item.expirationValue = moment().add(orgItem.duration, orgItem.durationUnit).toDate();
      } else {
        this.practiceSetRepository.setInstanceKey(req.instancekey);
        orgItem = await this.practiceSetRepository.findById(item._id);
      }

      await this.validateItemPrice(req, item, orgItem);
      await this.populateDiscountEachItem(req, payment, item);
      discountAmount += item.discountCoupon;
      realOrderDetail.push(item);
    }

    payment.discountValue = discountAmount;

    if (realOrderDetail.length === 0) {
      throw new InternalServerErrorException ('No item found. Please check your order.');
    }

    let totalAmount = 0;
    for (const item of realOrderDetail) {
      purchaseIds.push(item._id.toString());
      totalAmount += item.price;
    }

    payment.amount = totalAmount;

    this.userEnrollmentRepository.setInstanceKey(req.instancekey);
    const alreadyPurchases = await this.userEnrollmentRepository.find({
      user: req.user._id,
      item: { $in: purchaseIds },
      location: new Types.ObjectId(req.user.activeLocation),
    });

    if (alreadyPurchases.length > 0) {
      throw new InternalServerErrorException ('You already have purchased this item, It cannot be purchased again!!');
    }

    return payment;
  }

  private async getUserCountryData(req) {
    // get user currency
    const settings: any = await this.redisCache.getSettingAsync(req.instancekey);
    let userCountry = settings.countries.find(c => c.code == req.user.country.code)
    return userCountry
  }

  private async paymentSuccess(req: any, payment: any): Promise<void> {
    try {
      this.usersRepository.setInstanceKey(req.instancekey);
      const user = await this.usersRepository.findOne({ _id: new Types.ObjectId(payment.user) });

      await this.updateCoupon(req, payment);
      if (!user.roles.includes('student')) {
        await this.saveAsItem(req, user, payment);
      } else {
        await this.updateItemLocation(req, user, payment);
      }

      await this.updateAllPaymentDetails(req, user, payment);
    } catch (ex) {
      Logger.error('Error processing after payment success', ex);
      throw new GrpcInternalException('Error processing after payment success');
    }
  }

  private async validateItemPrice(req: any, item: any, orgItem: any): Promise<void> {
    await this.settings.setPriceByUserCountry(req, orgItem);

    if (item.currency && item.currency !== orgItem.currency) {
      Logger.warn(`User ${req.user._id} tried to change item currency!`);
    }

    if (req.user.role !== 'student') {
      if (item.price !== orgItem.marketPlacePrice) {
        Logger.warn(`User ${req.user._id} tried to change item price!`);
        item.price = orgItem.marketPlacePrice;
      }

      if (orgItem.discountValue) {
        item.price = orgItem.marketPlacePrice - (orgItem.discountValue / 100) * orgItem.marketPlacePrice;
      }
    } else {
      if (item.price !== orgItem.price && item.currency === orgItem.currency) {
        Logger.warn(`User ${req.user._id} tried to change item price!`);
        item.price = orgItem.price;
      }

      if (orgItem.discountValue) {
        item.price = orgItem.price - (orgItem.discountValue / 100) * orgItem.price;
      }
    }

    if (item.currency === 'INR') {
      item.price = Math.round(item.price);
    }
  }

  private async populateDiscountEachItem(req: any, payment: any, item: any): Promise<void> {
    if (payment.couponIds && payment.couponIds.length > 0) {
      this.couponRepository.setInstanceKey(req.instancekey);
      const results = await this.couponRepository.find({
        _id: { $in: payment.couponIds },
        status: true,
        $and: [
          {
            $or: [{ startDate: { $lte: new Date() } }, { startDate: null }]
          },
          {
            $or: [{ endDate: { $gte: new Date() } }, { endDate: null }]
          }
        ]
      });

      const couponIds = [];
      const discountData = [];
      for (const coupon of results) {
        couponIds.push(coupon._id);
        discountData.push(coupon);
        this.calculateItem(item, coupon);
      }

      payment.couponIds = couponIds;
      payment.discountData = discountData;
    } else {
      payment.couponIds = [];
      payment.discountData = [];
    }
  }

  private calculateItem(item: any, coupon: any): any {
    let discountAmount = 0;
    const basePrice = item.price;

    if (coupon.itemIds && coupon.itemIds.length > 0) {
      if (coupon.itemIds.find(i => i.equals(item._id))) {
        discountAmount = this.calculateDiscount(coupon, basePrice);
      }
    } else {
      discountAmount = this.calculateDiscount(coupon, basePrice);
    }

    if (basePrice < discountAmount) {
      discountAmount = basePrice;
    }

    let totalPayment = basePrice;
    if (discountAmount > 0) {
      if (item.currency === 'INR') {
        discountAmount = Math.round(discountAmount);
      }
      totalPayment = basePrice - discountAmount;
      if (!item.couponData) {
        item.couponData = [];
      }
      item.couponData.push(coupon);
    }

    item.discountCoupon = discountAmount;
    item.totalPayment = totalPayment;
    return item;
  }

  private calculateDiscount(discount: any, itemPrice: number): number {
    let discountAmount = 0;
    if (discount.discountType === 'percent') {
      discountAmount = Number((itemPrice * discount.percent) / 100);
    } else if (discount.discountType === 'price') {
      discountAmount = discount.price;
    }
    return discountAmount;
  }

  private async updateCoupon(req: any, payment: any): Promise<void> {
    if (payment.couponIds && payment.couponIds.length > 0) {
      this.paymentRepository.setInstanceKey(req.instancekey);
      this.couponRepository.setInstanceKey(req.instancekey);
      const couponUsedCount = await this.paymentRepository.countDocuments({
        couponIds: { $in: payment.couponIds }
      });

      const coupon = await this.couponRepository.findOne({
        _id: { $in: payment.couponIds }
      });

      let usersLimit = 0;
      let isReferral = false;

      if (coupon) {
        usersLimit = coupon.usageLimit;
        isReferral = coupon.isReferral;
      }

      if (couponUsedCount >= usersLimit && !isReferral) {
        await this.couponRepository.updateMany(
          { _id: { $in: payment.couponIds } },
          { $set: { status: false } }
        );
      }
    }
  }

  private async saveAsItem(req: any, user: any, payment: any): Promise<void> {
    this.paymentDetailRepository.setInstanceKey(req.instancekey);
    this.testSeriesRepository.setInstanceKey(req.instancekey);
    this.practiceSetRepository.setInstanceKey(req.instancekey);
    this.questionRepository.setInstanceKey(req.instancekey);
    this.courseRepository.setInstanceKey(req.instancekey);

    const paymentDetails = await this.paymentDetailRepository.find({
      payment: new Types.ObjectId(payment._id)
    });

    await Promise.all(paymentDetails.map(async (item) => {
      if (item.model === 'testseries') {
        if (!item.testseries) {
          return;
        }
        const testseriesData: any = await this.testSeriesRepository.findById(item.testseries);
        if (!testseriesData) {
          return;
        }
        const tempTestseries = { ...testseriesData };
        delete tempTestseries._id;
        tempTestseries.status = 'draft';
        tempTestseries.title = `${testseriesData.title} ${user.name}`;
        tempTestseries.instuctors = [];
        tempTestseries.statusChangedAt = new Date();
        tempTestseries.updatedAt = new Date();
        tempTestseries.createdAt = new Date();
        tempTestseries.rating = 0;
        tempTestseries.user = user._id;
        tempTestseries.owner = testseriesData.user;
        tempTestseries.accessMode = 'invitation';
        tempTestseries.origin = 'institute';
        tempTestseries.locations = [new Types.ObjectId(user.activeLocation)];
        tempTestseries.classrooms = [];
        tempTestseries.testseriesCode = "";

        const ts = await this.testSeriesRepository.create(tempTestseries);

        const usrBuy = {
          item: ts._id,
          user: user._id,
        };
        await this.testSeriesRepository.updateOne({ _id: item.testseries }, { $push: { buyers: usrBuy } });

        const tests = await this.practiceSetRepository.find({ _id: { $in: ts.practiceIds } });

        for (const test of tests) {
          await this.practiceSetRepository.updateOne({ _id: test._id }, { $addToSet: { locations: new Types.ObjectId(user.activeLocation) } });
          await this.questionRepository.updateMany({ _id: { $in: test.questions.map((q: any) => q.question) } }, { $addToSet: { locations: new Types.ObjectId(user.activeLocation) } });
        }
      } else if (item.model === 'course') {
        const courseData: any = await this.courseRepository.findById(item.course);
        if (!courseData) {
          return;
        }
        const tempCourse = { ...courseData };
        delete tempCourse._id;
        tempCourse.status = 'draft';
        tempCourse.title = `${courseData.title} ${user.name}`;
        tempCourse.instuctors = [];
        tempCourse.statusChangedAt = new Date();
        tempCourse.updatedAt = new Date();
        tempCourse.createdAt = new Date();
        tempCourse.rating = 0;
        tempCourse.totalRatings = 0;
        tempCourse.user = { _id: user._id, name: user.name };
        tempCourse.owner = courseData.user._id;
        tempCourse.accessMode = 'invitation';
        tempCourse.courseCode = "";
        tempCourse.locations = [new Types.ObjectId(user.activeLocation)];
        tempCourse.classrooms = [];
        tempCourse.origin = 'institute';

        const crs = await this.courseRepository.create(tempCourse);
        const usrBuy = { item: crs._id, user: user._id };
        await this.courseRepository.updateOne({ _id: item.course }, { $push: { buyers: usrBuy } });

        const testIds = [];
        for (const section of crs.sections) {
          for (const content of section.contents) {
            if ((content.type === 'quiz' || content.type === 'assessment') && content.source) {
              testIds.push(content.source);
            }
          }
        }
        const tests = await this.practiceSetRepository.find({ _id: { $in: testIds } });

        for (const test of tests) {
          await this.practiceSetRepository.updateOne({ _id: test._id }, { $addToSet: { locations: new Types.ObjectId(user.activeLocation) } });
          await this.questionRepository.updateMany({ _id: { $in: test.questions.map((q: any) => q.question) } }, { $addToSet: { locations: new Types.ObjectId(user.activeLocation) } });
        }
      } else if (item.model === 'practice') {
        const practiceData: any = await this.practiceSetRepository.findById(item.practice);
        if (!practiceData) {
          return;
        }
        const tempTest = { ...practiceData };
        delete tempTest._id;
        tempTest.status = 'draft';
        tempTest.title = `${practiceData.title} ${user.name}`;
        tempTest.statusChangedAt = new Date();
        tempTest.updatedAt = new Date();
        tempTest.createdAt = new Date();
        tempTest.totalAttempt = 0;
        tempTest.rating = 0;
        tempTest.user = user._id;
        tempTest.userInfo = {
          _id: user._id,
          name: user.name
        };
        tempTest.totalJoinedStudent = 0;
        tempTest.owner = practiceData.user._id;
        tempTest.accessMode = 'invitation';
        tempTest.testCode = "";
        tempTest.instuctors = [];
        tempTest.locations = [new Types.ObjectId(user.activeLocation)];
        tempTest.classrooms = [];
        tempTest.origin = 'institute';

        const test = await this.practiceSetRepository.create(tempTest);

        const usrBuy = {
          item: test._id,
          user: user._id,
        };
        await this.practiceSetRepository.updateOne({ _id: item.practice }, { $push: { buyers: usrBuy } });

        await this.questionRepository.updateMany({ _id: { $in: test.questions.map((q: any) => q.question) } }, { $addToSet: { locations: new Types.ObjectId(user.activeLocation) } });
      }
    }));
  }

  private async updateItemLocation(req: any, user: any, payment: any): Promise<void> {
    this.paymentDetailRepository.setInstanceKey(req.instancekey);
    this.usersRepository.setInstanceKey(req.instancekey);
    this.testSeriesRepository.setInstanceKey(req.instancekey);
    this.courseRepository.setInstanceKey(req.instancekey);
    this.practiceSetRepository.setInstanceKey(req.instancekey);

    const paymentDetails = await this.paymentDetailRepository.find({
      payment: new Types.ObjectId(payment._id)
    });

    await Promise.all(paymentDetails.map(async (item) => {
      // if user is enrolling this location using public link, add user to the location
      if (item.note && item.note.enrollingLocation) {
        await this.usersRepository.updateOne(
          { _id: user._id }, { $addToSet: { locations: item.note.enrollingLocation }, $set: { activeLocation: item.note.enrollingLocation } }
        );
      } else {
        if (item.model === 'testseries') {
          await this.testSeriesRepository.updateOne(
            { _id: item.testseries }, { $addToSet: { locations: new Types.ObjectId(user.activeLocation) } }
          );
        } else if (item.model === 'course') {
          await this.courseRepository.updateOne(
            { _id: item.course }, { $addToSet: { locations: new Types.ObjectId(user.activeLocation) } }
          );
        } else if (item.model === 'practice') {
          await this.practiceSetRepository.updateOne(
            { _id: item.practice }, { $addToSet: { locations: new Types.ObjectId(user.activeLocation) } }
          );
        }
      }
    }));
  }

  private async updateAllPaymentDetails(req: any, user: any, payment: any): Promise<void> {
    try {
      this.paymentRepository.setInstanceKey(req.instancekey);
      this.paymentDetailRepository.setInstanceKey(req.instancekey);
      const result = await this.paymentRepository.findById(payment._id);
      if (!result) {
        return;
      }

      const paymentDetails = await this.paymentDetailRepository.find({
        payment: payment._id
      });

      const emailOptions = [];

      await Promise.all(paymentDetails.map(async (item) => {
        const emailOpt = await this.updatePaymentDetail(req, user, payment, item);
        if (emailOpt) {
          emailOptions.push(emailOpt);
        }
      }));

      if (emailOptions.length === 0) {
        return;
      }

      await this.sendEmailAlertPayment(req, user, payment, emailOptions);
    }
    catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private async updatePaymentDetail(req: any, user: any, payment: any, paymentDetail: any): Promise<any> {
    const item = paymentDetail;
    // If paymentDetail is success and payment is success 
    if (item.status === 'success' && payment.status === 'success') {
      return await this.createUserEnrollment(req, user, payment, item);
    } else {
      if (payment.status !== 'pending') {
        this.paymentDetailRepository.setInstanceKey(req.instancekey);
        await this.paymentDetailRepository.updateOne({ _id: item._id }, { $set: { status: payment.status } });

        if (payment.status === 'success') {
          return await this.createUserEnrollment(req, user, payment, item);
        }
      }
    }
  }

  private async sendEmailAlertPayment(req: any, user: any, payment: any, emailOptions: any[]): Promise<void> {
    const settings = await this.redisCache.getSetting(req);

    if (!emailOptions || (emailOptions && emailOptions.length === 0)) {
      return;
    }

    let sharingLink = `${settings.baseUrl}result-payment/${payment._id}`;
    const options = {
      websiteName: settings.baseUrl,
      logo: `${settings.baseUrl}images/logo2.png`,
      senderName: user.name,
      subject: 'Payment success',
      payments: emailOptions,
      sharingLink: sharingLink,
    };
    const sendData = {
      receiver: user._id,
      itemId: user._id,
      modelId: 'payment',
    };

    await Promise.all([
      async () => {
        let emailReceive = user.email;
        if (!emailReceive && payment.billing_email) {
          emailReceive = payment.billing_email;
        }

        if (emailReceive) {
          sendData['to'] = emailReceive;
          sendData['isScheduled'] = true;
          await this.messageCenter.sendWithTemplate(req, 'thank-purchase', options, sendData);
        }
      },
      async () => {
        if (!user.userId) {
          Logger.debug('not found userId');
          return;
        }
        if (isEmail(user.userId)) {
          Logger.debug('current user Id is email');
          return;
        }
        if (!user.phoneNumber) {
          Logger.debug('current user not have phoneNumber');
          return;
        }

        try {
          const response: any = await this.bitly.shorten(sharingLink);
          sharingLink = response.link;

          this.notificationRepository.setInstanceKey(req.instancekey);
          await this.notificationRepository.create({
            to: user.phoneNumber,
            sms: `Thank you for purchase. Please find your purchase details. Please click link ${sharingLink} to view your receipt.`,
            isScheduled: true,
            isEmail: false,
            modelId: 'smsPayment',
          });
        } catch (error) {
          Logger.error('bitly error %j', error);
        }
      },
    ]);

    return;
  }

  private async createUserEnrollment(req: any, user: any, payment: any, paymentDetail: any): Promise<any> {
    if (paymentDetail.model === 'course') {
      this.courseRepository.setInstanceKey(req.instancekey);
      this.userEnrollmentRepository.setInstanceKey(req.instancekey);
      this.testSeriesRepository.setInstanceKey(req.instancekey);
      this.practiceSetRepository.setInstanceKey(req.instancekey);
      this.serviceRepository.setInstanceKey(req.instancekey);

      const course = await this.courseRepository.findById(paymentDetail.course);
      if (course) {
        const userCrse = await this.userEnrollmentRepository.findOne({
          item: paymentDetail.course,
          user: payment.user
        });

        if (!userCrse) {
          await this.userEnrollmentRepository.create({
            item: new Types.ObjectId(paymentDetail.course),
            user: payment.user,
            accessMode: course.accessMode,
            expiresOn: course.expiresOn,
            price: paymentDetail.totalPayment,
            currency: payment.currency,
            type: 'course',
            location: user.activeLocation
          });
          const paymentDetailAmount = paymentDetail.totalPayment > 0 ? Numeral(paymentDetail.totalPayment).format('0,0.00') : 0;
          const symbol = Currencies.get(payment.currency).symbol;

          const emailOptions: any = {
            description: course.title,
            amount: `${symbol} ${paymentDetailAmount}`,
            paymentMode: payment.paymentMeThod,
            updatedAt: moment(paymentDetail.updatedAt).format('MMM DD, YYYY'),
            transaction: payment.transaction,
            expiration: 'Lifetime'
          };

          if (paymentDetail.couponData && paymentDetail.couponData.length > 0) {
            emailOptions.couponCode = paymentDetail.couponData[0].code;
          }
          if (payment.reponse) {
            emailOptions.paymentMode = payment.reponse.payment_mode;
            emailOptions.transaction = payment.reponse.tracking_id;
          }

          await this.updateUserSubjects(req, user, course.subjects.map(s => s._id));

          return emailOptions;
        }
      }
    } else if (paymentDetail.model === 'testseries') {
      const testseries = await this.testSeriesRepository.findById(paymentDetail.testseries);
      if (testseries) {
        const userCrse = await this.userEnrollmentRepository.findOne({
          item: paymentDetail.testseries,
          user: payment.user
        });

        if (!userCrse) {
          await this.userEnrollmentRepository.create({
            item: paymentDetail.testseries,
            accessMode: testseries.accessMode,
            user: payment.user,
            expiresOn: testseries.expiresOn,
            price: paymentDetail.totalPayment,
            currency: payment.currency,
            type: 'testseries',
            location: user.activeLocation
          });

          const paymentDetailAmount = paymentDetail.totalPayment > 0 ? Numeral(paymentDetail.totalPayment).format('0,0.00') : 0;
          const symbol = Currencies.get(payment.currency).symbol;

          const emailOptions: any = {
            description: testseries.title,
            amount: `${symbol} ${paymentDetailAmount}`,
            paymentMode: payment.paymentMeThod,
            updatedAt: moment(paymentDetail.updatedAt).format('MMM DD, YYYY'),
            transaction: payment.transaction,
            expiration: 'Lifetime'
          };

          if (paymentDetail.couponData && paymentDetail.couponData.length > 0) {
            emailOptions.couponCode = paymentDetail.couponData[0].code;
          }
          if (payment.reponse) {
            emailOptions.paymentMode = payment.reponse.payment_mode;
            emailOptions.transaction = payment.reponse.tracking_id;
          }

          await this.updateUserSubjects(req, user, testseries.subjects.map(s => s._id));

          await this.testSeriesRepository.updateOne({ _id: testseries._id }, {
            $inc: { totalEnrollUsers: 1 }
          });

          return emailOptions;
        }
      }
    } else if (paymentDetail.model === 'practice') {
      const practice = await this.practiceSetRepository.findById(paymentDetail.practice);
      if (practice) {
        const userCrse = await this.userEnrollmentRepository.findOne({
          item: paymentDetail.practice,
          user: payment.user
        });

        if (!userCrse) {
          await this.userEnrollmentRepository.create({
            item: paymentDetail.practice,
            user: payment.user,
            accessMode: practice.accessMode,
            expiresOn: practice.expiresOn,
            price: paymentDetail.totalPayment,
            currency: payment.currency,
            type: 'practice',
            location: user.activeLocation
          });

          const paymentDetailAmount = paymentDetail.totalPayment > 0 ? Numeral(paymentDetail.totalPayment).format('0,0.00') : 0;
          const symbol = Currencies.get(payment.currency).symbol;

          const emailOptions: any = {
            description: practice.title,
            amount: `${symbol} ${paymentDetailAmount}`,
            paymentMode: payment.paymentMeThod,
            updatedAt: moment(paymentDetail.updatedAt).format('MMM DD, YYYY'),
            transaction: payment.transaction,
            expiration: 'Lifetime'
          };

          if (paymentDetail.couponData && paymentDetail.couponData.length > 0) {
            emailOptions.couponCode = paymentDetail.couponData[0].code;
          }
          if (payment.reponse) {
            emailOptions.paymentMode = payment.reponse.payment_mode;
            emailOptions.transaction = payment.reponse.tracking_id;
          }

          await this.updateUserSubjects(req, user, practice.subjects.map(s => s._id));

          return emailOptions;
        }
      }
    } else if (paymentDetail.model === 'service') {
      const service = await this.serviceRepository.findById(paymentDetail.service);
      if (service) {
        const now = new Date();
        const userCrse = await this.userEnrollmentRepository.findOne({
          item: paymentDetail.service,
          user: payment.user,
          expiresOn: { $gt: now }
        });

        if (!userCrse) {
          const userPayment = await this.userEnrollmentRepository.create({
            item: paymentDetail.service,
            user: payment.user,
            accessMode: 'buy',
            expiresOn: moment().add(service.duration, service.durationUnit as moment.unitOfTime.DurationConstructor).toDate(),
            price: paymentDetail.totalPayment,
            currency: payment.currency,
            type: 'service',
            location: user.activeLocation
          });

          const paymentDetailAmount = paymentDetail.totalPayment > 0 ? Numeral(paymentDetail.totalPayment).format('0,0.00') : 0;
          const symbol = Currencies.get(payment.currency).symbol;

          const emailOptions: any = {
            description: service.title,
            amount: `${symbol} ${paymentDetailAmount}`,
            paymentMode: payment.paymentMeThod,
            updatedAt: moment(paymentDetail.updatedAt).format('MMM DD, YYYY'),
            transaction: payment.transaction,
            expiration: moment(userPayment.expiresOn).format('MMM DD, YYYY')
          };

          if (paymentDetail.couponData && paymentDetail.couponData.length > 0) {
            emailOptions.couponCode = paymentDetail.couponData[0].code;
          }
          if (payment.reponse) {
            emailOptions.paymentMode = payment.reponse.payment_mode;
            emailOptions.transaction = payment.reponse.tracking_id;
          }

          return emailOptions;
        }
      }
    }
  }

  private async updateUserSubjects(req: any, user: any, subjects: any[]): Promise<void> {
    this.usersRepository.setInstanceKey(req.instancekey);
    await this.usersRepository.updateOne(
      { _id: user._id },
      { $addToSet: { subjects: { $each: subjects } } }
    );

    if (user.activeLocation) {
      this.locationRepository.setInstanceKey(req.instancekey);
      await this.locationRepository.updateOne(
        { _id: user.activeLocation },
        { $addToSet: { subjects: { $each: subjects } } }
      );
    }
  }

  private async generateRequestPayment(providerSetting, results, req): Promise<string> {
    const post = req.payment;
    const merchantId = providerSetting.config.merchantId;
    const redirectUrl = providerSetting.config.redirectUrl + '/' + results._id;
    const cancelUrl = providerSetting.config.redirectUrl + '/' + results._id;
    const currency = results.currency;
    let body = '';
    const str = [];
    const queryVar = _.omit(post, 'couponIds', 'discountData', 'paymentDetails', 'amount', 'merchant_id');
    const billing_country = queryVar.billingCountryCode.name;
    str.push('merchant_id=' + merchantId);
    str.push('billing_country=' + billing_country);
    if (req.user.email) {
      str.push('billing_email=' + req.user.email);
    }
    if (req.user.phoneNumber) {
      str.push('billing_tel=' + req.user.phoneNumber);
    }
    str.push('amount=' + results.totalPayment);
    delete queryVar.billingCountryCode;

    for (const [k, v] of Object.entries(queryVar)) {
      if (v !== '' && v !== undefined) {
        str.push(`${k}=${encodeURIComponent(String(v))}`);
      }
    }
    if (queryVar.card_name) {
      str.push('payment_option=OPT' + queryVar.card_name);
    } else {
      delete queryVar.card_name;
    }
    str.push('currency=' + currency);
    str.push('cancel_url=' + cancelUrl);
    str.push('redirect_url=' + redirectUrl);
    str.push('order_id=' + results._id);
    str.push('language=EN');

    body += str.join('&');

    return body;
  }
  //Internal Functions - End


  async findByMe(request: FindByMeReq): Promise<FindByMeRes> {
    try {
      const { query, user, instancekey } = request;

      this.paymentRepository.setInstanceKey(instancekey);
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;
      let sort: any = { 'createdAt': -1 };

      if (query.sort) {
        const [sortField, sortOrder] = query.sort.split(',');
        sort = sortOrder === 'descending' ? { [sortField]: -1 } : { [sortField]: 1 };
      }

      const filter: any = {};
      const skip = (page - 1) * limit;

      if (query.isReferral) {
        filter.status = { $nin: ['pending', 'aborted'] };
        filter['referralData.userId'] = user.userId;

        const payments = await this.paymentRepository.find(
          filter,
          {
            paymentDetails: 1,
            totalPayment: 1,
            status: 1,
            amount: 1,
            referralData: 1,
            discountValue: 1
          },
          { sort: [sort], skip, limit },
          [
            { path: 'paymentDetails', select: 'expiredOn package practice' },
            { path: 'user', select: 'name' }
          ]
        );

        return { payments: payments };
      } else {
        const settings = await this.redisCache.getSetting(request);

        if (user.roles.includes('student')) {
          filter.user = new Types.ObjectId(user._id);
        } else if (!settings.isWhiteLabelled) {
          filter.user = new Types.ObjectId(user._id);
        }

        if (query.id) {
          filter._id = query.id;
        }

        const payments = await this.paymentRepository.find(
          filter,
          {
            billing_address: 0,
            billing_city: 0,
            billing_country: 0,
            billing_email: 0,
            billing_state: 0,
            billing_tel: 0,
            billing_zip: 0
          },
          { sort, skip, limit },
          [{ path: 'paymentDetails', select: 'expiredOn package practice forUser' }]
        );
        return { payments: payments };
      }
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async revenueAll(request: RevenueAllReq): Promise<RevenueAllRes> {
    try {
      const matchDate = null;
      const result = await this.revenueByDate(request, matchDate);

      return { result: result };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async revenueThisMonth(request: RevenueAllReq): Promise<RevenueAllRes> {
    try {
      const now = new Date();
      const matchDate = {
        $match: { year: now.getFullYear(), month: now.getMonth() + 1 }
      };
      const result = await this.revenueByDate(request, matchDate);

      return { result: result };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async revenueToday(request: RevenueAllReq): Promise<RevenueAllRes> {
    try {
      const now = new Date();
      const begin = moment(now).startOf('day').toDate();
      const end = moment(now).endOf('day').toDate();
      const matchDate = {
        $match: { updatedAt: { $gte: begin, $lte: end } }
      };
      const result = await this.revenueByDate(request, matchDate);

      return { result: result };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async revenueWeek(request: RevenueAllReq): Promise<RevenueAllRes> {
    try {
      const now = new Date();
      const begin = moment(now).startOf('week');
      const end = moment(now).endOf('week');
      const matchDate = {
        $match: { updatedAt: { $gte: begin, $lte: end } }
      };
      const result = await this.revenueByDate(request, matchDate);

      return { result: result };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async findAllPaymentDetail(request: FindByMeReq): Promise<any> {
    try {
      const { query, user, instancekey } = request;
      const settings = await this.redisCache.getSetting(request);

      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;
      let sort: any = { 'createdAt': -1 };

      if (query.sort) {
        const [sortField, sortOrder] = query.sort.split(',');
        sort = sortOrder === 'descending' ? { [sortField]: -1 } : { [sortField]: 1 };
      }

      const filter: any = { status: 'success' };
      const skip = (page - 1) * limit;
      let key: any = '';

      if (query.keyword) {
        key = { $regex: new RegExp(query.keyword, 'i') };
      }

      if (!settings.isWhiteLabelled) {
        filter.forUser = new Types.ObjectId(user._id);
      }

      const pipe: any[] = [
        { $match: filter },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'payments',
            localField: 'payment',
            foreignField: '_id',
            as: 'payment'
          }
        },
        { $unwind: '$payment' },
        {
          $lookup: {
            from: 'users',
            localField: 'forUser',
            foreignField: '_id',
            as: 'forUser'
          }
        },
        { $unwind: '$forUser' },
        {
          $lookup: {
            from: 'packages',
            localField: 'package',
            foreignField: '_id',
            as: 'package'
          }
        },
        { $unwind: '$package' },
        {
          $lookup: {
            from: 'practicesets',
            localField: 'practice',
            foreignField: '_id',
            as: 'practice'
          }
        }
      ];

      if (query.keyword) {
        pipe.push({ $match: { 'package.name': key } });
      }

      this.paymentDetailRepository.setInstanceKey(instancekey);
      const result = await this.paymentDetailRepository.aggregate(pipe);

      if (result.length === 0) {
        return { paymentDetails: [] };
      }

      return { paymentDetails: result };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async countAllPaymentDetail(request: FindByMeReq): Promise<CountAllPaymentDetailRes> {
    try {
      const { query, user, instancekey } = request;
      const settings = await this.redisCache.getSetting(request);

      const filter: any = { status: 'success' };
      if (query.keyword) {
        filter.itemName = { $regex: new RegExp(query.keyword, 'i') };
      }
      if (!settings.isWhiteLabelled) {
        filter.forUser = new Types.ObjectId(user._id);
      }

      this.paymentDetailRepository.setInstanceKey(instancekey);
      const result = await this.paymentDetailRepository.countDocuments(filter);

      return { statusCode: 200, count: result };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async lastRevenue(request: RevenueAllReq): Promise<LastRevenueRes> {
    try {
      const { user, instancekey } = request;
      const settings = await this.redisCache.getSetting(request);
      const filter: any = {};

      if (!settings.isWhiteLabelled) {
        filter.forUser = new Types.ObjectId(user._id);
      }

      this.paymentRepository.setInstanceKey(instancekey);
      const payment = await this.paymentRepository.findOne(
        filter, null, { sort: { updatedAt: -1 } }
      );
      if (!payment) {
        return { statusCode: 404, payment: {} };
      }

      return { statusCode: 200, payment: payment };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async findOneByMe(request: FindOneByMeReq): Promise<FindOneByMeRes> {
    try {
      const { _id, user, instancekey } = request;
      const settings = await this.redisCache.getSetting(request);
      const filter: any = { _id: new Types.ObjectId(_id) };

      if (!settings.isWhiteLabelled) {
        filter.forUser = new Types.ObjectId(user._id);
      }

      this.paymentRepository.setInstanceKey(instancekey);
      const payment = await this.paymentRepository.findOne(filter, null,
        { lean: true, populate: { path: 'paymentDetails', options: { lean: true } } }
      );

      if (!payment) {
        return { statusCode: 404, payment: {} };
      }

      return { statusCode: 200, payment: payment };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async findPaymentDetails(request: FindOneByMeReq): Promise<any> {
    try {
      const { _id, user, instancekey } = request;
      const settings = await this.redisCache.getSetting(request);
      const filter: any = { payment: new Types.ObjectId(_id) };

      if (!settings.isWhiteLabelled) {
        filter.byUser = new Types.ObjectId(user._id);
      }

      this.paymentRepository.setInstanceKey(instancekey);
      const paymentDetails = await this.paymentDetailRepository.find(filter, null, null, [
        { path: 'practice', select: '_id title description accessMode type subjects model buyers imageUrl testMode' },
        { path: 'testseries', select: '_id title description accessMode type subjects model buyers imageUrl' },
        { path: 'course', select: '_id title summary accessMode type subject model buyers imageUrl' },
        { path: 'service' },
        { path: 'forUser', select: 'name -_id' },
      ],
      );

      return { statusCode: 200, response: paymentDetails };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async countByMe(request: FindByMeReq): Promise<CountAllPaymentDetailRes> {
    try {
      const { query, user, instancekey } = request;
      const settings = await this.redisCache.getSetting(request);

      const filter: any = {};
      if (query.isReferral) {
        filter.status = { $nin: ['pending', 'aborted'] };
        filter['referralData.userId'] = user.userId;
      } else {
        filter.status = 'success';
        if (user.roles.includes('student') || !settings.isWhiteLabelled) {
          filter.user = new Types.ObjectId(user._id);
        }

        if (query.id) {
          filter._id = new Types.ObjectId(query.id);
        }
      }

      this.paymentRepository.setInstanceKey(instancekey);
      const count = await this.paymentRepository.countDocuments(filter);

      return { statusCode: 200, count: count };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getTransaction(request: GetTransactionReq): Promise<GetTransactionRes> {
    try {
      const { _id, instancekey } = request;

      this.paymentRepository.setInstanceKey(instancekey);
      const payment = await this.paymentRepository.findOne(
        { _id: new Types.ObjectId(_id) },
        { status: 1, transaction: 1, customData: 1 },
        { lean: true }
      );

      if (!payment) {
        return { statusCode: 404, message: 'Payment not found' };
      }

      const toReturn = {
        status: payment.status,
        transaction: payment.transaction,
        redirectUrl: '',
        courseid: payment.customData?.courseid || null,
        sessionid: payment.customData?.sessionid || null,
        studentid: payment.customData?.studentid || null,
      };

      if (payment.customData) {
        toReturn.redirectUrl = payment.customData.redirectUrl;
      }

      return { statusCode: 200, response: toReturn };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async findOnePayment(request: GetTransactionReq): Promise<FindOneByMeRes> {
    try {
      const { _id, instancekey } = request;

      const filter: any = { _id: new Types.ObjectId(_id) };

      this.paymentRepository.setInstanceKey(instancekey);
      const payment = await this.paymentRepository.findOne(
        filter, null, { lean: true, populate: { path: 'paymentDetails', options: { lean: true } } }
      );

      if (!payment) {
        return { statusCode: 404, message: 'Payment not found' };
      }

      return { statusCode: 200, payment: payment };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async initCCA(request: InitCCAReq): Promise<any> {
    try {
      this.settingRepository.setInstanceKey(request.instancekey);
      const settings = await this.settingRepository.findOne({ slug: 'paymentProviders' });
      const ccA = settings.providers.find(p => p.name === 'ccavenue');

      const payment = await this.handleCCAInit(request);

      if (payment.status === 'success') {
        await this.paymentSuccess(request, payment);
        return payment;
      }

      const url = `${config.ccavenueHandlerUrl}GetRSA`;
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: {
          access_code: ccA.config.accessCode,
          order_id: payment._id.toString(),
        },
      };

      const response: any = await firstValueFrom(
        this.httpService.post(url, options).pipe(
          catchError((error) => {
            Logger.error(`Request failed with status code ${error.response?.status}`);
            Logger.error(`Error data: ${JSON.stringify(error.response?.data)}`);
            throw new Error(`Failed to fetch data from report API: ${JSON.stringify(error.response?.data)}`);
          })
        )
      );

      const toEncrypt = `amount=${payment.totalPayment}&currency=INR`;
      const rsaKey = `-----BEGIN PUBLIC KEY-----\n${response.data}\n-----END PUBLIC KEY-----`;
      const encRequest = this.ccavUtil.encryptWithRsaPublicKey(toEncrypt, rsaKey);
      return {
        statusCode: 200,
        data: {
          encRequest,
          orderId: payment._id,
          accessCode: ccA.config.accessCode,
          merchantId: ccA.config.merchantId,
          redirectUrl: ccA.config.redirectUrl,
          cancelUrl: ccA.config.cancelUrl,
        },
      };
    } catch (error) {
      Logger.error(error.message);
      throw new GrpcInternalException(error.message);
    }
  }

  async finishCCA(request: FinishCCAReq): Promise<any> {
    try {
      this.settingRepository.setInstanceKey(request.instancekey);
      const settings = await this.settingRepository.findOne({ slug: 'paymentProviders' });
      if (!settings) {
        throw new InternalServerErrorException ('Payment providers settings not found');
      }

      const ccA = settings.providers.find(p => p.name === 'ccavenue');
      if (!ccA) {
        throw new InternalServerErrorException ('CCAvenue provider not found');
      }

      const workingKey = ccA.config.workingKey;
      const ccavPOST = request.encResp;
      const ccavResponse = this.ccavUtil.decrypt(ccavPOST, workingKey);
      const params = new URLSearchParams(ccavResponse);
      const dataArray: { [key: string]: string } = {};
      params.forEach((value, key) => {
        dataArray[key] = value;
      });

      this.paymentRepository.setInstanceKey(request.instancekey);
      const payment = await this.paymentRepository.findOne({ _id: request._id });

      if (!payment) {
        return { statusCode: 422, params: 'payment', msg: 'Cannot found data payment' };
      }

      const updateData = {
        ..._.omit(dataArray, ['amount']),
        status: dataArray.order_status,
        reponse: dataArray,
      };
      const updatedPayment = await this.paymentRepository.updateOne({ _id: payment._id }, { $set: updateData });

      await this.paymentSuccess(request, updatedPayment);

      return { statusCode: 302, redirectUrl: `http://localhost/student/paymentStatus/${payment._id}` };
    } catch (error) {
      Logger.error(error.message);
      throw new GrpcInternalException(error.message);
    }
  }

  async cancelCCA(request: GetTransactionReq): Promise<any> {
    try {
      this.paymentRepository.setInstanceKey(request.instancekey);
      const payment = await this.paymentRepository.findOneAndUpdate(
        { _id: request._id },
        { $set: { status: 'aborted' } },
        { new: true }
      );

      if (!payment) {
        throw new InternalServerErrorException ('Cannot find payment');
      }

      return { statusCode: 302, redirectUrl: `http://localhost/student/paymentStatus/${payment._id}` };
    } catch (error) {
      Logger.error(error.message);
      throw new GrpcInternalException(error.message);
    }
  }

  async enrollItems(request: EnrollItemsReq): Promise<any> {
    try {
      let itemId = null;
      let item = null;
      let subjects = [];

      if (request.type === 'testseries') {
        itemId = request.testseries;
        this.testSeriesRepository.setInstanceKey(request.instancekey);
        item = await this.testSeriesRepository.findById(itemId);
        if (!item) {
          return { statusCode: 404, message: 'Item not found' };
        }

        if (item.accessMode == 'buy') {
          return { statusCode: 422, message: 'You need to buy this test series first' };
        }

        subjects = item.subjects.map(s => s._id);
      } else if (request.type === 'practice') {
        itemId = request.practice;
        this.practiceSetRepository.setInstanceKey(request.instancekey);
        item = await this.practiceSetRepository.findById(itemId);
        if (!item) {
          return { statusCode: 404, message: 'Item not found' };
        }

        if (item.accessMode == 'buy') {
          return { statusCode: 422, message: 'You need to buy this test first' };
        }

        subjects = item.subjects.map(s => s._id);
      } else if (request.type === 'course') {
        itemId = request.course;
        this.courseRepository.setInstanceKey(request.instancekey);
        item = await this.courseRepository.findById(itemId);
        if (!item) {
          return { statusCode: 404, message: 'Item not found' };
        }

        if (item.accessMode == 'buy') {
          return { statusCode: 404, message: 'You need to buy this test first' };
        }

        subjects = item.subjects.map(s => s._id);
      } else if (request.type === 'service') {
        itemId = request.service;
        this.serviceRepository.setInstanceKey(request.instancekey);
        item = await this.serviceRepository.findById(itemId);
        if (!item) {
          return { statusCode: 404, message: 'Item not found' };
        }

        item.accessMode = 'buy';
        item.expiresOn = moment().add(item.duration, item.durationUnit).toDate();
      } else {
        return { statusCode: 400, message: 'Invalid request type' };
      }

      this.userEnrollmentRepository.setInstanceKey(request.instancekey);
      const enrolled = await this.userEnrollmentRepository.findOne({
        item: item._id,
        user: request.user._id
      });

      if (!enrolled) {
        await this.userEnrollmentRepository.create({
          item: item._id,
          user: new Types.ObjectId(request.user._id),
          accessMode: item.accessMode,
          expiresOn: item.expiresOn,
          type: request.type,
          location: new Types.ObjectId(request.enrollingLocation) || new Types.ObjectId(request.user.activeLocation)
        });


        if (request.enrollingLocation) {
          this.usersRepository.setInstanceKey(request.instancekey);
          await this.usersRepository.updateOne(
            { _id: request.user._id },
            {
              $addToSet: { locations: request.enrollingLocation },
              $set: { activeLocation: request.enrollingLocation }
            }
          );
        }

        await this.updateUserSubjects(request, request.user, subjects);

        if (request.type == 'testseries') {
          this.testSeriesRepository.setInstanceKey(request.instancekey);
          await this.testSeriesRepository.updateOne(
            { _id: request.testseries }, { $inc: { totalEnrollUsers: 1 } }
          );
        }
      }

      return { statusCode: 200, message: 'Subjects Added' };
    } catch (error) {
      Logger.error(error.message);
      throw new GrpcInternalException(error.message);
    }
  }

  async createPayment(request: CreatePaymentReq): Promise<any> {
    try {
      const data: any = request.payment;
      data.user = request.user._id;

      const payment = await this.setItemPayment(request);

      this.settingRepository.setInstanceKey(request.instancekey);
      const paymentProviders = await this.settingRepository.findOne({ slug: 'paymentProviders' });
      const providerSetting = paymentProviders.providers.find(p => p.active && p.name === request.paymentMethod);
      if (!providerSetting) {
        return { statusCode: 400, message: 'Payment provider not found' };
      }

      const userCountry = await this.getUserCountryData(request);

      let couponIds = [];
      let discountValue = 0;
      let discountData = [];
      const isReferral = payment.referralData && payment.referralData.userId;

      const newPaymentData: any = {
        billing_name: data.billing_name,
        billing_address: data.billing_address,
        billing_city: data.billing_city,
        billing_state: data.billing_state,
        billing_zip: data.billing_zip,
        billing_country: '',
        amount: data.amount,
        user: new Types.ObjectId(request.user._id),
        status: 'pending',
        currency: userCountry.currency,
        hasDiscount: false,
        referralData: payment.referralData,
        paymentMethod: request.paymentMethod,
        discountData: discountData,
        couponIds: couponIds,
        discountValue: discountValue,
        totalPayment: data.amount < discountValue ? data.amount : data.amount - discountValue,
      };

      if (request.user.email) {
        newPaymentData.billing_email = request.user.email;
      }
      if (request.user.phoneNumber) {
        newPaymentData.billing_tel = request.user.phoneNumber;
      }
      if (data.billingCountryCode) {
        newPaymentData.billing_country = data.billingCountryCode.name;
      }
      if (payment.discountData) {
        discountData = payment.discountData;
      }
      if (payment.couponIds) {
        couponIds = payment.couponIds;
      }
      if (payment.discountValue) {
        discountValue = payment.discountValue;
      }
      if (discountData && discountData.length > 0) {
        newPaymentData.hasDiscount = true;
      }

      if (newPaymentData.totalPayment === 0) {
        newPaymentData.status = 'success';
      }

      if (isReferral) {
        const referredUser = await this.usersRepository.findOne(
          { userId: payment.referralData.userId }, { name: 1 }
        );

        newPaymentData.referralData.name = referredUser.name;
        newPaymentData.referralData.user = new Types.ObjectId(referredUser._id);
      }

      let savedPayment = await this.paymentRepository.create(newPaymentData);

      const paymentDetailIds = [];
      for (let item of request.orderDetail) {
        let forUser = item.user;
        if (!item.user) {
          return { statusCode: 400, message: 'That item is deleted. It is not available for purchase' };
        }
        const paymentDetailObject = {
          payment: new Types.ObjectId(savedPayment._id),
          byUser: new Types.ObjectId(savedPayment.user),
          forUser: new Types.ObjectId(forUser),
          price: item.price,
          practiceIds: item.practiceIds.map(id => new Types.ObjectId(id)),
          isMembershipEligible: item.isMembershipEligible,
          expirationValue: item.expirationValue,
          discountValue: item.discountValue,
          totalPayment: item.price,
          status: newPaymentData.status,
          currency: userCountry.currency,
          note: item.note,
          couponData: item.couponData,
          course: item.typeItem === 'course' ? new Types.ObjectId(item._id) : undefined,
          testseries: item.typeItem === 'testseries' ? new Types.ObjectId(item._id) : undefined,
          service: item.typeItem === 'service' ? new Types.ObjectId(item._id) : undefined,
          practice: item.typeItem !== 'course' && item.typeItem !== 'testseries' && item.typeItem !== 'service' ? new Types.ObjectId(item._id) : undefined,
          model: item.typeItem || 'practice',
        };
        if (isReferral) {
          if (paymentDetailObject.model === 'practice' || paymentDetailObject.model === 'course') {
            newPaymentData.nameItem = item.title;
          } else {
            newPaymentData.nameItem = item.name;
          }
        }
        else {
          newPaymentData.nameItem = item.title;
        }

        const newPaymentDetail = await this.paymentDetailRepository.create(paymentDetailObject);
        paymentDetailIds.push(newPaymentDetail._id);
      }

      await this.paymentRepository.updateOne({ _id: savedPayment._id }, { $set: { paymentDetails: paymentDetailIds } });

      if (savedPayment.status !== 'success') {
        // For Paypal
        if (request.paymentMethod === 'paypal') {
          return { statusCode: 200, payment: savedPayment };
        }
        // For CCAvenue
        if (request.paymentMethod === 'ccavenue') {
          const body = await this.generateRequestPayment(providerSetting, savedPayment, request);

          const encRequest = this.ccavUtil.encrypt(body, providerSetting.config.workingKey);
          return {
            statusCode: 200,
            encRequest,
            accessCode: providerSetting.config.accessCode,
          };
        }
        // For Razorpay
        if (request.paymentMethod === 'razorpay') {
          const instance = new Razorpay({ key_id: providerSetting.config.keyId, key_secret: providerSetting.config.keySecret });

          const options = {
            amount: savedPayment.totalPayment * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: savedPayment._id.toString(),
          };
          instance.orders.create(options, function (err, order) {
            if (err) {
              Logger.error(err);
              return { statusCode: 400, message: 'Failed to create order' };
            }
            return {
              statusCode: 200,
              orderId: order.id,
              amount: savedPayment.totalPayment,
            };
          });
        }

        throw new InternalServerErrorException ('Payment method not supported');
      } else {
        await this.paymentSuccess(request, savedPayment);

        return { statusCode: 20, payment: savedPayment };
      }
    } catch (error) {
      Logger.error(error.message);
      throw new GrpcInternalException(error.message);
    }
  }

  async paymentResult(request: PaymentResultReq): Promise<any> {
    try {
      this.settingRepository.setInstanceKey(request.instancekey);
      const settings = await this.settingRepository.findOne({ slug: 'paymentProviders' });
      const ccA = settings.providers.find(p => p.name === 'ccavenue');

      const workingKey = ccA.config.workingKey;
      const ccavPOST = request.encResp;
      const ccavResponse = this.ccavUtil.decrypt(ccavPOST, workingKey);
      const params = new URLSearchParams(ccavResponse);
      const dataArray: { [key: string]: string } = {};
      params.forEach((value, key) => {
        dataArray[key] = value;
      });

      this.paymentRepository.setInstanceKey(request.instancekey);
      const payment = await this.paymentRepository.findOne({ _id: request._id });

      if (!payment) {
        return { statusCode: 422, params: 'payment', msg: 'Cannot found data payment' };
      }

      const updateData = {
        ..._.omit(dataArray, ['amount']),
        status: dataArray.order_status,
        reponse: dataArray,
      };
      const updatedPayment = await this.paymentRepository.updateOne({ _id: payment._id }, { $set: updateData });

      await this.paymentSuccess(request, updatedPayment);

      if (payment.customData && payment.customData.isDemo) {
        return {
          statusCode: 200,
          payment: payment._id,
          status: payment.status,
          transaction: payment.transaction,
          isDemo: true,
          redirectUrl: payment.customData.redirectUrl,
          courseid: payment.customData.courseid,
          sessionid: payment.customData.sessionid,
          studentid: payment.customData.studentid
        };
      } else {
        return { statusCode: 200, payment: payment._id };
      }
    } catch (error) {
      Logger.error(error.message);
      throw new GrpcInternalException(error.message);
    }
  }

  async paymentFinish(request: PaymentFinishReq): Promise<any> {
    try {
      const updateData: any = {
        status: 'success',
      };

      if (request.customData && Object.keys(request.customData).length) {
        updateData.customData = request.customData;
      }

      this.paymentRepository.setInstanceKey(request.instancekey);
      const result = await this.paymentRepository.updateOne(
        { _id: request._id },
        { $set: updateData },
      );

      if (!result) {
        return { statusCode: 422, params: 'payment', msg: 'Cannot find data payment' };
      }

      await this.paymentSuccess(request, result);

      return { statusCode: 302, payment: result._id };
    } catch (error) {
      Logger.error(error.message);
      throw new GrpcInternalException(error.message);
    }
  }

}
