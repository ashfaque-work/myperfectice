import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';
import mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'marketingUtm' })
export class MarketingUtm extends AbstractDocument {
  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  medium: string;

  @Prop({ required: true })
  campaign: string;

  @Prop([{ 
    url: { type: String }, 
    date: { type: Date },
  }])
  visitUrls?: Array<{ url: string; date: Date }>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user?: mongoose.Schema.Types.ObjectId;

  @Prop()
  userId?: string;

  @Prop()
  signupDate?: Date;

  @Prop()
  ip?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  location?: any;
}

export const MarketingUtmSchema = SchemaFactory.createForClass(MarketingUtm);
