import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

interface EventSchedule {
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

@Schema({ autoIndex: false, timestamps: true, strict: true, minimize: false })
export class Events extends AbstractDocument {
    @Prop()
    startDate?: Date;

    @Prop()
    endDate?: Date;

    @Prop()
    title?: string;

    @Prop({ default: false })
    allDays?: boolean;

    @Prop({ default: false })
    allStudents?: boolean;

    @Prop({ default: 'event', enum: ['holiday', 'exam', 'event'] })
    type?: string;

    @Prop({ type: Types.ObjectId, ref: 'Classroom' })
    classroom?: Types.ObjectId;

    @Prop()
    students?: string;

    @Prop({ default: true })
    active?: boolean;

    @Prop()
    summary?: string;

    @Prop({type: Object})
    schedule?: EventSchedule;

    @Prop({default: Date.now})
    createdAt?: Date;

    @Prop({default: Date.now})
    updatedAt?: Date;

    @Prop({type: Types.ObjectId, ref: 'Location'})
    location?: Types.ObjectId
}

export const EventsSchema = SchemaFactory.createForClass(Events);