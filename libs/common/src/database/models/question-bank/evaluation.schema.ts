import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AbstractDocument } from '../../abstract.schema';

@Schema({ strict: true, minimize: false, timestamps: true })
export class Evaluation extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacher: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  QAId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'AttemptDetail' })
  attemptDetail?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Question' })
  question: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  student: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PracticeSet' })
  practicesetId: Types.ObjectId;

  @Prop()
  practicesetTitle: string;

  @Prop({ type: Types.ObjectId, ref: 'Attempt' })
  attemptId: Types.ObjectId;

  @Prop({ type: Date })
  evaluationDate?: Date;

  @Prop({ type: Boolean, default: false })
  evaluated?: boolean;

  @Prop({ type: Number, default: 0 })
  timeSpent?: number;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: String, enum: ['system', 'admin', 'director'], default: 'system' })
  createdBy: string;

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  location?: Types.ObjectId;
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);
