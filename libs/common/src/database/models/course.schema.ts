import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';
import { Types } from 'mongoose';
import { getRandomCode } from '@app/common/helpers';
import { v4 as uuidv4 } from 'uuid';

interface User {
  _id: string;
  name: string;
}
interface Subject {
  _id: string;
  name: string;
}
interface BuyerSchema {
  item: Types.ObjectId;
  user: Types.ObjectId;
}

export interface Note {
  type: string;
  data: any;
}

interface Content {
  summary: string;
  title: string;
  type: string;
  source: Types.ObjectId;
  startDate: Date;
  note?: Note[];
  active?: boolean;
  optional?: boolean;
}

export interface Section {
  title: string;
  summary: string;
  name: string;
  status?: string;
  optional?: boolean;
  locked?: boolean;
  active?: boolean;
  isDemo?: boolean;
  contents: Content[];
}

@Schema({ timestamps: true, versionKey: false })
export class Course extends AbstractDocument {
  @Prop({ required: true })
  title: string;

  @Prop()
  startDate?: Date;

  @Prop()
  expiresOn?: Date;

  @Prop({ enum: ['tempt', 'draft', 'published', 'revoked', 'expired'], default: 'draft' })
  status?: string;

  @Prop({ enum: ['semester', 'other'], default: 'other' })
  type?: string;

  @Prop({ default: Date.now })
  statusChangedAt?: Date;

  @Prop({ default: true })
  certificate?: boolean;

  @Prop({ type: { providerId: { type: Types.ObjectId }, imageUrl: String, name: String, description: String } })
  offeredBy?: {
    providerId: string;
    imageUrl: string;
    name: string;
    description: string;
  };

  @Prop({ type: { _id: { type: Types.ObjectId, ref: 'User' }, name: String } })
  user?: User;

  @Prop([{ type: { _id: { type: Types.ObjectId, ref: 'User' }, name: String } }])
  instructors?: User[];

  @Prop([{ type: { _id: { type: Types.ObjectId, ref: 'Subject' }, name: String } }])
  subjects: Subject[];

  @Prop({ enum: ['public', 'invitation', 'buy'], default: 'public' })
  accessMode?: string;


  @Prop([{
    _id: false,
    code: { type: String, default: 'IN' },
    name: { type: String, default: 'India' },
    currency: { type: String, default: 'INR' },
    price: { type: Number, default: 0 },
    marketPlacePrice: { type: Number, default: 0 },
    discountValue: { type: Number, default: 0 },
  }])
  countries?: {
    code: string;
    name: string;
    currency: string;
    price: number;
    marketPlacePrice: number;
    discountValue: number;
  }[];

  @Prop()
  summary?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Classroom' })
  classrooms?: Types.ObjectId[];

  @Prop()
  duration?: string;

  @Prop()
  credits?: number;

  @Prop([{
    title: { type: String },
    summary: { type: String },
    name: { type: String },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    optional: { type: Boolean, default: false },
    locked: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: false },
    contents: [{
      summary: { type: String },
      title: { type: String },
      type: { type: String, enum: ['video', 'ebook', 'note', 'quiz', 'assessment', 'onlineSession'], default: 'ebook' },
      source: { type: Types.ObjectId },
      startDate: { type: Date },
      note: [{ type: { type: String, enum: ['text', 'code'], default: 'text' }, data: {} }],
      active: { type: Boolean, default: true },
      optional: { type: Boolean, default: false }
    }]
  }])
  sections?: Section[];

  @Prop({ enum: ['school', 'bachelors', 'masters', 'open'], default: 'open' })
  level?: string;

  @Prop({ default: '' })
  courseCode?: string;

  @Prop()
  colorCode?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: '' })
  requirements?: string;

  @Prop({ default: '' })
  includes?: string;

  @Prop({ default: '' })
  learningIncludes?: string;

  @Prop({ default: '' })
  notificationMsg?: string;

  @Prop({ default: true })
  active?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastModifiedBy?: Types.ObjectId;

  @Prop()
  rating?: number;

  @Prop()
  totalRatings?: number;

  @Prop()
  videoUrl?: string;

  @Prop([{ item: { type: Types.ObjectId }, user: { type: Types.ObjectId } }])
  buyers?: BuyerSchema[];

  @Prop()
  uid?: string;

  @Prop({ default: false })
  synced?: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Location' })
  locations?: Types.ObjectId[];

  @Prop({ default: true })
  enableOrdering?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner?: Types.ObjectId;

  @Prop({ enum: ['publisher', 'institute'], default: 'publisher' })
  origin?: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.pre('save', function (next) {
  // assign testCode if it is not set
  this.locations=this.locations.map(l => 
    (Types.ObjectId.isValid(l) && typeof l !== 'string') ? l : new Types.ObjectId(l)
  );
  this.classrooms=this.classrooms.map(l => 
    (Types.ObjectId.isValid(l) && typeof l !== 'string') ? l : new Types.ObjectId(l)
  );
  if (!this.courseCode) {
      this.courseCode = getRandomCode(6);
  }

  if (this.isNew) {
      if (!this.uid) {
          this.uid = uuidv4();
      }
  }

  next()
})