import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import {
	DatabaseModule, RedisModule, Payment, PaymentRepository, PaymentSchema, PaymentDetail, PaymentDetailSchema, PaymentDetailRepository,
	PracticeSet, PracticeSetSchema, PracticeSetRepository, CourseSchema, CourseRepository, Course, Service, ServiceSchema, ServiceRepository,
	User, UserSchema, UsersRepository, TestSeries, TestSeriesSchema, TestSeriesRepository, Setting, SettingSchema, SettingRepository,
	CcavUtil, UserEnrollment, UserEnrollmentSchema, UserEnrollmentRepository, Settings, Coupon, CouponSchema, CouponRepository, Question,
	QuestionSchema, QuestionRepository, Notification, NotificationSchema, NotificationRepository, Location, LocationSchema,
	LocationRepository, NotificationTemplate, NotificationTemplateSchema, NotificationTemplateRepository, BitlyService
} from '@app/common';
import { instanceKeys } from '@app/common/config';
import { HttpModule } from '@nestjs/axios';
import { MessageCenter } from '@app/common/components/messageCenter';

const paymentEntity = { name: Payment.name, schema: PaymentSchema };
const paymentDetailEntity = { name: PaymentDetail.name, schema: PaymentDetailSchema };
const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const courseEntity = { name: Course.name, schema: CourseSchema };
const serviceEntity = { name: Service.name, schema: ServiceSchema };
const testSeriesEntity = { name: TestSeries.name, schema: TestSeriesSchema };
const userEntity = { name: User.name, schema: UserSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };
const userEnrollmentEntity = { name: UserEnrollment.name, schema: UserEnrollmentSchema };
const couponEntity = { name: Coupon.name, schema: CouponSchema };
const questionEntity = { name: Question.name, schema: QuestionSchema };
const notificationEntity = { name: Notification.name, schema: NotificationSchema };
const locationEntity = { name: Location.name, schema: LocationSchema };
const notificationTemplateEntity = { name: NotificationTemplate.name, schema: NotificationTemplateSchema };

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DatabaseModule, RedisModule, HttpModule,
		...createDatabaseModules([
			paymentEntity, paymentDetailEntity, practiceSetEntity, courseEntity, serviceEntity,
			userEntity, testSeriesEntity, settingEntity, userEnrollmentEntity, couponEntity,
			questionEntity, notificationEntity, locationEntity, notificationTemplateEntity
		], instanceKeys),
	],
	controllers: [PaymentController],
	providers: [
		CcavUtil, Settings, MessageCenter, BitlyService,
		PaymentService, PaymentRepository, PaymentDetailRepository, PracticeSetRepository, CourseRepository,
		ServiceRepository, UsersRepository, TestSeriesRepository, SettingRepository, UserEnrollmentRepository,
		CouponRepository, QuestionRepository, NotificationRepository, LocationRepository, NotificationTemplateRepository
	],
})
export class PaymentModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
	return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
