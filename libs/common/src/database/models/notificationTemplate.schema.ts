import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import mongoose, { Types } from "mongoose";

interface Schedule {
  active: boolean;
  repeatOn: {
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  };
  repeatEvery: 'day' | 'week' | 'month' | 'year';
  endDate: Date;
}

interface UploadedSourceUser {
  _id: mongoose.Schema.Types.ObjectId;
  email: string;
  phoneNumber: string;
  data: any;
}

interface UploadedSource {
  name: string;
  users: UploadedSourceUser[];
}

@Schema({ timestamps: true, versionKey: false, collection: 'notificationTemplates' })
export class NotificationTemplate extends AbstractDocument {
  @Prop({ required: true })
  key: string;

  @Prop()
  note: string;

  @Prop()
  subject: string;

  @Prop()
  preheader: string;

  @Prop()
  body: string;

  @Prop()
  sms: string;

  @Prop()
  pushNotification: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  dataSource: any;

  @Prop()
  dataView: string;

  @Prop([String])
  tags: string[];

  @Prop({ default: true })
  active: boolean;

  @Prop()
  nextRunDate: Date;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  lastRunResult: any;

  @Prop({ type: Object })
  schedule: Schedule;

  @Prop({ type: Object })
  uploadSource: UploadedSource
}

export const NotificationTemplateSchema = SchemaFactory.createForClass(NotificationTemplate);
