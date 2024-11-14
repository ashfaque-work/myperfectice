import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { AbstractDocument } from '../../abstract.schema';

@Schema({ strict: true, minimize: false, autoIndex: false, timestamps: true })
export class PaymentDetail extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'Payment', required: true })
  payment: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  byUser: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PracticeSet' })
  practice?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TestSeries' })
  testseries?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  course?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service' })
  service?: Types.ObjectId;

  @Prop({ type: String })
  itemName?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  forUser?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  discountValue?: number;

  @Prop({ type: Array })
  couponData?: any[];

  @Prop({ type: Boolean, default: false })
  isMembershipEligible?: boolean;

  @Prop({ type: Number, default: 0 })
  expirationValue?: number;

  @Prop({ type: String, default: 'practice' })
  model?: string;

  @Prop({ type: Number, default: 0 })
  price?: number;

  @Prop({ type: Number, default: 0 })
  amount?: number;

  @Prop({ type: Number, default: 0 })
  totalPayment?: number;

  @Prop({ type: String })
  currency?: string;

  @Prop({ type: String, default: 'pending', lowercase: true })
  status?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  note?: any;
}

export const PaymentDetailSchema = SchemaFactory.createForClass(PaymentDetail);