import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument } from '../../abstract.schema';

@Schema({ timestamps: true })
export class QuestionFeedback extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  teacherId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Question' })
  questionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PracticeSet' })
  practicesetId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Attempt' })
  attemptId: Types.ObjectId;

  @Prop([String])
  feedbacks: string[];

  @Prop({ default: false })
  responded: boolean;

  @Prop()
  comment: string;

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  location: Types.ObjectId;
}

export const QuestionFeedbackSchema = SchemaFactory.createForClass(QuestionFeedback);
