import { Injectable, Logger } from "@nestjs/common";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AbstractRepository } from "../../abstract.repository";
import { Coupon } from "../../models";

@Injectable()
export class CouponRepository extends AbstractRepository<Coupon> {
  protected readonly logger = new Logger(CouponRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Coupon.name, CouponRepository.conn[0] ? CouponRepository.conn[0] : 'staging') conn0: Model<Coupon>,
    @InjectModel(Coupon.name, CouponRepository.conn[1] ? CouponRepository.conn[1] : 'staging') conn1: Model<Coupon>,
    @InjectModel(Coupon.name, CouponRepository.conn[2] ? CouponRepository.conn[2] : 'staging') conn2: Model<Coupon>,
    @InjectModel(Coupon.name, CouponRepository.conn[3] ? CouponRepository.conn[3] : 'staging') conn3: Model<Coupon>,
    @InjectModel(Coupon.name, CouponRepository.conn[4] ? CouponRepository.conn[4] : 'staging') conn4: Model<Coupon>,
    @InjectModel(Coupon.name, CouponRepository.conn[5] ? CouponRepository.conn[5] : 'staging') conn5: Model<Coupon>,
    @InjectModel(Coupon.name, CouponRepository.conn[6] ? CouponRepository.conn[6] : 'staging') conn6: Model<Coupon>,
    @InjectModel(Coupon.name, CouponRepository.conn[7] ? CouponRepository.conn[7] : 'staging') conn7: Model<Coupon>,
    @InjectModel(Coupon.name, CouponRepository.conn[8] ? CouponRepository.conn[8] : 'staging') conn8: Model<Coupon>,
    @InjectModel(Coupon.name, CouponRepository.conn[9] ? CouponRepository.conn[9] : 'staging') conn9: Model<Coupon>,
  ) {
    super({
      [CouponRepository.conn.at(0)]: conn0,
      [CouponRepository.conn.at(1)]: conn1,
      [CouponRepository.conn.at(2)]: conn2,
      [CouponRepository.conn.at(3)]: conn3,
      [CouponRepository.conn.at(4)]: conn4,
      [CouponRepository.conn.at(5)]: conn5,
      [CouponRepository.conn.at(6)]: conn6,
      [CouponRepository.conn.at(7)]: conn7,
      [CouponRepository.conn.at(8)]: conn8,
      [CouponRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}