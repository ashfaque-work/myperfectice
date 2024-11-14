import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument } from '../../abstract.schema';

@Schema({ timestamps: true, strict: true, minimize: false })
export class Coupon extends AbstractDocument {
  @Prop({ default: 'Discount' })
  name?: string;

  @Prop()
  code: string;

  @Prop({ default: 0 })
  price?: number;

  @Prop({ default: 0 })
  percent?: number;

  @Prop({ default: 'price' })
  discountType?: string;

  @Prop([{ type: Types.ObjectId }])
  itemIds?: Types.ObjectId[];

  @Prop({ default: 0 })
  usageLimit?: number;

  @Prop({ default: false })
  isReferral?: boolean;

  @Prop({ default: Date.now })
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: true })
  status?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastModifiedBy?: Types.ObjectId;

  @Prop({ default: true })
  showMe?: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
