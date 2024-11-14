import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import {
	DatabaseModule, RedisModule, Coupon, CouponRepository, CouponSchema,
	Payment, PaymentRepository, PaymentSchema,
} from '@app/common';
import { instanceKeys } from '@app/common/config';

const couponEntity = { name: Coupon.name, schema: CouponSchema };
const paymentEntity = { name: Payment.name, schema: PaymentSchema };

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DatabaseModule, RedisModule,
		...createDatabaseModules([couponEntity, paymentEntity], instanceKeys),
	],
	controllers: [CouponController],
	providers: [CouponService, CouponRepository, PaymentRepository],
})
export class CouponModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
	return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
