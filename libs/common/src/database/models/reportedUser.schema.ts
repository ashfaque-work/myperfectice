import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { AbstractDocument } from '../abstract.schema';

@Schema({ timestamps: true })
export class ReportedUser extends AbstractDocument {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  reporter: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Schema.Types.ObjectId;

  @Prop()
  reason: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: true })
  active: boolean;
}

export const ReportedUserSchema = SchemaFactory.createForClass(ReportedUser);