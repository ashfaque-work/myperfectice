import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true, versionKey: false, collection: 'accreditationprogramoutcomes' })
export class ProgramOutcome extends AbstractDocument {
  @Prop({ required: true, trim: true, default: '' })
  code: string;

  @Prop({ type: Types.ObjectId })
  grade?: Types.ObjectId;

  @Prop({ trim: true, default: '' })
  codeLower?: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  active?: boolean;

  @Prop({ default: () => Date.now() })
  createdAt?: Date;

  @Prop({ default: () => Date.now() })
  updatedAt?: Date;

  @Prop()
  uid?: string;
}

export const ProgramOutcomeSchema = SchemaFactory.createForClass(ProgramOutcome);

ProgramOutcomeSchema.pre('save', function (next) {
  const document = this as any;

  document.codeLower = document.code.toLowerCase();

  if (!document.isNew) {
    document.updatedAt = new Date();
  } else {
    if (!document.uid) {
      document.uid = uuidv4();
    }
  }

  next();
});