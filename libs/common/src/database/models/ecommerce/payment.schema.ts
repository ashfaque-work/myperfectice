import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { AbstractDocument } from '../../abstract.schema';

export type PaymentDocument = Payment & Document;

@Schema({ strict: true, minimize: false, autoIndex: false, timestamps: true })
export class Payment extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  amount?: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  forUser?: Types.ObjectId;

  @Prop({ type: String })
  transaction?: string;

  @Prop({ type: String })
  billing_name?: string;

  @Prop({ type: String })
  billing_tel?: string;

  @Prop({ type: String })
  billing_email?: string;

  @Prop({ type: String })
  billing_city?: string;

  @Prop({ type: String })
  billing_zip?: string;

  @Prop({ type: String })
  billing_state?: string;

  @Prop({ type: String })
  billing_address?: string;

  @Prop({ type: String })
  billing_country?: string;

  @Prop({ type: Number, default: 0 })
  discountValue?: number;

  @Prop({ type: Array })
  discountData?: any[];

  @Prop({ type: [Types.ObjectId], ref: 'Coupon' })
  couponIds?: Types.ObjectId[];

  @Prop({ type: String })
  promoCode?: string;

  @Prop({ type: String })
  currency?: string;

  @Prop({ type: Boolean, default: false })
  hasDiscount?: boolean;

  @Prop({ type: Number, default: 0 })
  totalPayment?: number;

  @Prop({ type: Object })
  reponse?: any;

  @Prop({ type: String, default: 'pending', lowercase: true })
  status?: string;

  @Prop({ type: String })
  paymentMeThod?: string;

  @Prop({ type: [Types.ObjectId], ref: 'PaymentDetail' })
  paymentDetails?: Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;

  @Prop({
    type: {
      amount: { type: Number, default: 0 },
      settlementDate: { type: Date, default: Date.now },
      userId: { type: String },
      status: { type: String, default: 'success' },
      name: { type: String },
      user: { type: Types.ObjectId, ref: 'User' }
    }
  })
  referralData?: {
    amount?: number;
    settlementDate?: Date;
    userId?: string;
    status?: string;
    name?: string;
    user?: Types.ObjectId;
  };

  @Prop({ type: mongoose.Schema.Types.Mixed })
  customData?: any;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.pre<PaymentDocument>('save', function (next) {
  const now = new Date();
  const utcTimestamp = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  );
  
  if (!this.isNew) {
    this.updatedAt = new Date();
  } else {
    const str = utcTimestamp.toString();
    this.transaction = 'P' + str.substring(0, 11);
  }
  next();
});