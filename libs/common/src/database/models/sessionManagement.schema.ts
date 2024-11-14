import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument } from '../abstract.schema';

@Schema({ strict: true, minimize: false, timestamps: true })
export class SessionManagement extends AbstractDocument {
  @Prop({ type: String })
  title: string;

  @Prop({ type: Types.ObjectId })
  user: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'PracticeSet' })
  practiceIds: Types.ObjectId[];

  @Prop({ type: Date, default: null })
  startDate: Date;

  @Prop({ type: Boolean, default: true })
  isMarksLevel: boolean;

  @Prop({ type: Number, default: 0 })
  loginAllowanceTime: number;

  @Prop({ type: Boolean, default: false })
  deactivateRemainingStudents: boolean;

  @Prop({ type: Number, default: 0 })
  minusMark: number;

  @Prop({ type: Number, default: 1 })
  plusMark: number;

  @Prop({ type: Number, default: 0 })
  startTimeAllowance: number;

  @Prop({ type: Number, default: 30 })
  totalTime: number;

  @Prop({ type: Boolean, default: true })
  randomQuestions: boolean;

  @Prop({ type: Boolean, default: true })
  randomizeAnswerOptions: boolean;

  @Prop({ type: Boolean, default: false })
  requireAttendance: boolean;

  @Prop({ type: Boolean, default: true })
  autoEvaluation: boolean;

  @Prop({ type: Boolean, default: false })
  camera: boolean;

  @Prop({ type: Boolean, default: true })
  isShowAttempt: boolean;

  @Prop({ type: Boolean, default: true })
  allowTeacher: boolean;

  @Prop({ type: Boolean, default: true })
  isShowResult: boolean;

  @Prop({ type: Boolean, default: false })
  showFeedback: boolean;

  @Prop({ type: Number, default: 0 })
  offscreenLimit: number;

  @Prop({ type: Number, default: null })
  attemptAllowed: number;

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  location: Types.ObjectId;
}

export const SessionManagementSchema = SchemaFactory.createForClass(SessionManagement);
