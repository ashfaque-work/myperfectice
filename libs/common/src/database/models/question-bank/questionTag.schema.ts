import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../../abstract.schema';
import { Types } from 'mongoose';

@Schema()
export class QuestionTag extends AbstractDocument {
  @Prop({ required: true, trim: true })
  tag: string;

  @Prop({ trim: true })
  tagLower?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;

  wasNew?: boolean;

  // Pre-save hook
  // preSave(next: () => void) {
  //   this.wasNew = this.isNew;
  //   this.tagLower = this.tag.toLowerCase();

  //   if (!this.isNew) {
  //     this.updatedAt = new Date();
  //   }

  //   next();
  // }
}

export const QuestionTagSchema = SchemaFactory.createForClass(QuestionTag);
