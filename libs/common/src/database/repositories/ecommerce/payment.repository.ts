import { Injectable, Logger } from "@nestjs/common";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Payment } from "../../models";
import { AbstractRepository } from "../../abstract.repository";

@Injectable()
export class PaymentRepository extends AbstractRepository<Payment> {
  protected readonly logger = new Logger(PaymentRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Payment.name, PaymentRepository.conn[0] ? PaymentRepository.conn[0] : 'staging') conn0: Model<Payment>,
    @InjectModel(Payment.name, PaymentRepository.conn[1] ? PaymentRepository.conn[1] : 'staging') conn1: Model<Payment>,
    @InjectModel(Payment.name, PaymentRepository.conn[2] ? PaymentRepository.conn[2] : 'staging') conn2: Model<Payment>,
    @InjectModel(Payment.name, PaymentRepository.conn[3] ? PaymentRepository.conn[3] : 'staging') conn3: Model<Payment>,
    @InjectModel(Payment.name, PaymentRepository.conn[4] ? PaymentRepository.conn[4] : 'staging') conn4: Model<Payment>,
    @InjectModel(Payment.name, PaymentRepository.conn[5] ? PaymentRepository.conn[5] : 'staging') conn5: Model<Payment>,
    @InjectModel(Payment.name, PaymentRepository.conn[6] ? PaymentRepository.conn[6] : 'staging') conn6: Model<Payment>,
    @InjectModel(Payment.name, PaymentRepository.conn[7] ? PaymentRepository.conn[7] : 'staging') conn7: Model<Payment>,
    @InjectModel(Payment.name, PaymentRepository.conn[8] ? PaymentRepository.conn[8] : 'staging') conn8: Model<Payment>,
    @InjectModel(Payment.name, PaymentRepository.conn[9] ? PaymentRepository.conn[9] : 'staging') conn9: Model<Payment>,
  ) {
    super({
      [PaymentRepository.conn.at(0)]: conn0,
      [PaymentRepository.conn.at(1)]: conn1,
      [PaymentRepository.conn.at(2)]: conn2,
      [PaymentRepository.conn.at(3)]: conn3,
      [PaymentRepository.conn.at(4)]: conn4,
      [PaymentRepository.conn.at(5)]: conn5,
      [PaymentRepository.conn.at(6)]: conn6,
      [PaymentRepository.conn.at(7)]: conn7,
      [PaymentRepository.conn.at(8)]: conn8,
      [PaymentRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}