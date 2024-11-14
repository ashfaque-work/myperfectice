import { Injectable, Logger } from "@nestjs/common";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PaymentDetail } from "../../models";
import { AbstractRepository } from "../../abstract.repository";

@Injectable()
export class PaymentDetailRepository extends AbstractRepository<PaymentDetail> {
  protected readonly logger = new Logger(PaymentDetailRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(PaymentDetail.name, PaymentDetailRepository.conn[0] ? PaymentDetailRepository.conn[0] : 'staging') conn0: Model<PaymentDetail>,
    @InjectModel(PaymentDetail.name, PaymentDetailRepository.conn[1] ? PaymentDetailRepository.conn[1] : 'staging') conn1: Model<PaymentDetail>,
    @InjectModel(PaymentDetail.name, PaymentDetailRepository.conn[2] ? PaymentDetailRepository.conn[2] : 'staging') conn2: Model<PaymentDetail>,
    @InjectModel(PaymentDetail.name, PaymentDetailRepository.conn[3] ? PaymentDetailRepository.conn[3] : 'staging') conn3: Model<PaymentDetail>,
    @InjectModel(PaymentDetail.name, PaymentDetailRepository.conn[4] ? PaymentDetailRepository.conn[4] : 'staging') conn4: Model<PaymentDetail>,
    @InjectModel(PaymentDetail.name, PaymentDetailRepository.conn[5] ? PaymentDetailRepository.conn[5] : 'staging') conn5: Model<PaymentDetail>,
    @InjectModel(PaymentDetail.name, PaymentDetailRepository.conn[6] ? PaymentDetailRepository.conn[6] : 'staging') conn6: Model<PaymentDetail>,
    @InjectModel(PaymentDetail.name, PaymentDetailRepository.conn[7] ? PaymentDetailRepository.conn[7] : 'staging') conn7: Model<PaymentDetail>,
    @InjectModel(PaymentDetail.name, PaymentDetailRepository.conn[8] ? PaymentDetailRepository.conn[8] : 'staging') conn8: Model<PaymentDetail>,
    @InjectModel(PaymentDetail.name, PaymentDetailRepository.conn[9] ? PaymentDetailRepository.conn[9] : 'staging') conn9: Model<PaymentDetail>,
  ) {
    super({
      [PaymentDetailRepository.conn.at(0)]: conn0,
      [PaymentDetailRepository.conn.at(1)]: conn1,
      [PaymentDetailRepository.conn.at(2)]: conn2,
      [PaymentDetailRepository.conn.at(3)]: conn3,
      [PaymentDetailRepository.conn.at(4)]: conn4,
      [PaymentDetailRepository.conn.at(5)]: conn5,
      [PaymentDetailRepository.conn.at(6)]: conn6,
      [PaymentDetailRepository.conn.at(7)]: conn7,
      [PaymentDetailRepository.conn.at(8)]: conn8,
      [PaymentDetailRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}