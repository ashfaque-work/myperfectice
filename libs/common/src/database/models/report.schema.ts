import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { AbstractDocument } from '../abstract.schema';

@Schema({ timestamps: true })
export class Report extends AbstractDocument {
  @Prop({ type: String, default: "", required: [true, 'Name is required'], trim: true })
  name: string;

  @Prop({ type: String, default: "", trim: true })
  description: string;

  @Prop({ type: String, enum: ['general', 'testseries', 'assessment', 'course', 'proctor'] })
  module: string;

  @Prop({ type: String })
  reportAPI: string;

  @Prop({
    type: {
      subject: {
        mandatory: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
        active: { type: Boolean, default: false }
      },
      testseries: {
        mandatory: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
        active: { type: Boolean, default: false }
      },
      test: {
        mandatory: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
        active: { type: Boolean, default: false }
      },
      mentor: {
        mandatory: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
        active: { type: Boolean, default: false }
      },
      passingYear: {
        mandatory: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
        active: { type: Boolean, default: false }
      },
      center: {
        mandatory: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
        active: { type: Boolean, default: false }
      },
      classroom: {
        mandatory: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
        active: { type: Boolean, default: false }
      },
      personality: {
        mandatory: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
        active: { type: Boolean, default: false }
      }
    }
  })
  params: any;

  @Prop([{ type: String }])
  roles: string[];

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Boolean, default: true })
  canView: boolean;

  @Prop({ type: Boolean, default: false })
  canDownload: boolean;
}

export const ReportSchema = SchemaFactory.createForClass(Report);