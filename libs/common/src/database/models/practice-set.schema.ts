import { getRandomCode } from '@app/common/helpers';
import { AbstractDocument } from '../abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';

interface UserInfo {
  _id: Types.ObjectId,
  name: string
}

interface Unit {
  _id: Types.ObjectId,
  name: string
}

interface Subject {
  _id: Types.ObjectId,
  name: string
}

interface Country {
  code: string,
  name: string,
  currency: string,
  price: number,
  marketPlacePrice: number,
  discountValue: number,
}
interface Field {
  label: string,
  value: boolean
}

interface DemographicData {
  city: boolean,
  state: boolean,
  dob: boolean,
  gender: boolean,
  rollNumber: boolean,
  identificationNumber: boolean,
  passingYear: boolean,
  coreBranch: boolean,
  collegeName: boolean,
  identityVerification: boolean,
  field1: Field,
  field2: Field,
}

interface RandomTestDetail {
  topic: Types.ObjectId,
  questions: number,
  quesMarks: number
}

interface Question {
  question: Types.ObjectId,
  section: string,
  minusMark: number,
  plusMark: number,
  createdAt: Date,
  order: number
}

interface Section {
  name: string,
  time: number,
  showCalculator: boolean,
  optionalQuestions: number,
}
interface Buyer {
  item: Types.ObjectId,
  user: Types.ObjectId
}

@Schema({
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  strict: true,
  minimize: false,
  autoIndex: false,
})
export class PracticeSet extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastModifiedBy: Types.ObjectId;

  @Prop({ type: Date })
  lastModifiedDate: Date;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({type: Object,
    _id: { type: Types.ObjectId, ref: 'User' },
    name: { type: String },
  })
  userInfo: UserInfo;

  @Prop([
    {
      _id: { type: Types.ObjectId, ref: 'Unit' },
      name: { type: String },
    },
  ])
  units: Unit[];

  @Prop([
    {
      _id: { type: Types.ObjectId, ref: 'Subject' },
      name: { type: String },
    },
  ])
  subjects: Subject[];

  @Prop({ type: Number, default: 0 })
  level: number;

  @Prop({ type: String, enum: ['practice', 'proctored', 'learning'], default: 'practice' })
  testMode: string;

  @Prop({ type: String, enum: ['public', 'invitation', 'buy', 'internal'], default: 'public' })
  accessMode: string;

  @Prop([
    {
      _id: false,
      code: { type: String, default: 'IN' },
      name: { type: String, default: 'India' },
      currency: { type: String, default: 'INR' },
      price: { type: Number, default: 0 },
      marketPlacePrice: { type: Number, default: 0 },
      discountValue: { type: Number, default: 0 },
    },
  ])
  countries: Country[];

  @Prop({ type: String, default: '', required: true, trim: true })
  title: string;

  @Prop({ type: String, default: '', trim: true })
  titleLower: string;

  @Prop([{ type: Types.ObjectId, ref: 'Courses' }])
  courses: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'TestSeries' }])
  testseries: Types.ObjectId[];

  @Prop([{ type: String }])
  tags: string[];

  @Prop({
    type: Object,
    city: { type: Boolean, default: false },
    state: { type: Boolean, default: false },
    dob: { type: Boolean, default: false },
    gender: { type: Boolean, default: false },
    rollNumber: { type: Boolean, default: false },
    identificationNumber: { type: Boolean, default: false },
    passingYear: { type: Boolean, default: false },
    coreBranch: { type: Boolean, default: false },
    collegeName: { type: Boolean, default: false },
    identityVerification: { type: Boolean, default: false },
    field1: {
      label: { type: String },
      value: { type: Boolean },
    },
    field2: {
      label: { type: String },
      value: { type: Boolean },
    },
  })
  demographicData: DemographicData;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop([String])
  inviteeEmails: string[];

  @Prop([String])
  inviteePhones: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Classroom' })
  classRooms: Types.ObjectId[];

  @Prop([String])
  studentEmails: string[];

  @Prop({ type: String, default: '' })
  instructions: string;

  @Prop({ type: Boolean, default: true })
  isMarksLevel: boolean;

  @Prop({ type: Boolean, default: true })
  enableMarks: boolean;

  @Prop({ type: Boolean, default: true })
  randomQuestions: boolean;

  @Prop({ type: Boolean, default: true })
  randomizeAnswerOptions: boolean;

  @Prop({ type: Boolean, default: true })
  sectionJump: boolean;

  @Prop({ type: Boolean, default: false })
  sectionTimeLimit: boolean;

  @Prop({ type: Number, default: 0 })
  minusMark: number;

  @Prop({ type: Number, default: 1 })
  plusMark: number;

  @Prop({ type: String, default: '' })
  notes: string;

  @Prop({ type: Number, default: null })
  attemptAllowed: number;

  @Prop({
    type: String,
    enum: ['tempt', 'draft', 'published', 'revoked', 'expired'],
    default: 'draft',
  })
  status: string;

  @Prop({ type: Date, default: Date.now })
  statusChangedAt: Date;

  @Prop({ type: Date, default: null })
  expiresOn: Date;

  @Prop({ type: Date, default: null })
  startDate: Date;

  @Prop({ type: Number, default: 0 })
  startTimeAllowance: number;

  @Prop({ type: Boolean, default: false })
  requireAttendance: boolean;

  @Prop({ type: Number, default: 0 })
  totalJoinedStudent: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Number, default: 0 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  totalQuestion: number;

  @Prop({ type: Number })
  questionsToDisplay: number;

  @Prop({ type: Boolean, default: false })
  isPartnerExam: boolean;

  @Prop({ type: Number, default: 30 })
  totalTime: number;

  @Prop({ type: Number })
  questionsPerTopic: number;

  @Prop({ type: Number, default: 0 })
  totalAttempt: number;

  @Prop({ type: Boolean, default: true })
  isShowResult: boolean;

  @Prop({ type: Boolean, default: true })
  allowTeacher: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Location' })
  locations: Types.ObjectId[];

  @Prop({ type: Boolean, default: true })
  allowStudent: boolean;

  @Prop({ type: Boolean, default: true })
  isShowAttempt: boolean;

  @Prop({ type: String, default: '' })
  createMode: string;

  @Prop({ type: String, default: '' })
  testCode: string;

  @Prop({ type: String, default: '' })
  dirPath: string;

  @Prop({ type: Boolean, default: false })
  isAdaptive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'AdaptiveTest' })
  adaptiveTest: Types.ObjectId;

  @Prop([
    {
      topic: { type: Types.ObjectId, ref: 'Topic' },
      questions: { type: Number },
      quesMarks: { type: Number },
    },
  ])
  randomTestDetails: RandomTestDetail[];

  @Prop({ type: Boolean, default: false })
  showCalculator: boolean;

  @Prop({ type: Boolean, default: true })
  showFeedback: boolean;

  @Prop({ type: Boolean, default: false })
  peerVisibility: boolean;

  @Prop({
    type: String,
    enum: ['student', 'teacher'],
    default: 'teacher',
  })
  initiator: string;

  @Prop({
    type: String,
    enum: ['standard', 'adaptive', 'random', 'game'],
    default: 'standard',
  })
  testType: string;

  @Prop([
    {
      question: { type: Types.ObjectId, ref: 'Question' },
      section: { type: String },
      minusMark: { type: Number, default: 0 },
      plusMark: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      order: { type: Number },
    },
  ])
  questions: Question[];

  @Prop([
    {
      name: { type: String, default: false },
      time: { type: Number },
      showCalculator: { type: Boolean, default: false },
      optionalQuestions: { type: Number, default: 0 },
    },
  ])
  sections: Section[];

  @Prop([String])
  enabledCodeLang: string[];

  @Prop({ type: Boolean, default: false })
  enableSection: boolean;

  @Prop({ type: Boolean, default: false })
  camera: boolean;

  @Prop({ type: Boolean, default: true })
  fraudDetect: boolean;

  @Prop({ type: Boolean, default: false })
  pinTop: boolean;

  @Prop({ type: Boolean, default: true })
  autoEvaluation: boolean;

  @Prop({ type: Boolean, default: false })
  fullLength: boolean;

  @Prop({ type: String })
  imageUrl: string;

  @Prop({ type: Number, default: 0 })
  offscreenLimit: number;

  @Prop([
    {
      item: { type: Types.ObjectId },
      user: { type: Types.ObjectId },
    },
  ])
  buyers: Buyer[];

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  instructors: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  randomSection: boolean;

  @Prop({ type: String })
  uid: string;

  @Prop({ type: Boolean, default: false })
  synced: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['publisher', 'institute'],
  })
  origin: string;
}

export const PracticeSetSchema = SchemaFactory.createForClass(PracticeSet);

PracticeSetSchema
    .pre('save', function (next) {
      this.locations=this.locations.map(l => 
        (Types.ObjectId.isValid(l) && typeof l !== 'string') ? l : new Types.ObjectId(l)
      );
      this.classRooms=this.classRooms.map(c => 
        (Types.ObjectId.isValid(c) && typeof c !== 'string') ? c : new Types.ObjectId(c)
      );

        if (!this.isNew) {
            this.updatedAt = new Date()
        } else {
            if (!this.uid) {
                this.uid = uuidv4();
            }
        }
        // assign testCode if it is not set
        if (!this.testCode) {
            this.testCode = getRandomCode(6);
        }

        this.titleLower = this.title.toLowerCase()
        this.title = this.title.replace(/ {1,}/g, " ");
        next()
    })