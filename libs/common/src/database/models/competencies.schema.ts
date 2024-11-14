import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument } from '../abstract.schema';

@Schema({ timestamps: true })
export class Competencies extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject' })
  subjectId: Types.ObjectId;

  @Prop()
  certCode: string;

  @Prop({ type: String })
  subjectName: string;

  @Prop({ type: Number })
  maxLevel: number;

  @Prop({ type: Number })
  level: number;

  @Prop({ default: Date.now })
  updatedDate: Date;

  @Prop({ type: Number })
  attemptedQuestion: number;

  @Prop({ type: Number })
  accuracy: number;

  @Prop({ type: Number })
  totalQuestion: number;

  @Prop({ type: Number })
  correctQuestion: number;
}

export const CompetenciesSchema = SchemaFactory.createForClass(Competencies);

// CompetenciesSchema.pre('save', function(next) {
//     this.wasNew = this.isNew;

//     if(!this.isNew) {
//         this.updatedAt = new Date()
//     }

//     next();
// })
