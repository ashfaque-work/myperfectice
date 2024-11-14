import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';
import { Types } from 'mongoose';

interface UserInfo {
  user: Types.ObjectId,
  name: string,
}

interface Note {
  version: number,
  comment: string,
  type: string,
  updatedAt: Date,
  userInfo: UserInfo,
}

interface Feedback {
  comment: string,
  type: string,
  updatedAt: Date,
  userInfo: UserInfo,
}

interface MentorInfo {
  user: Types.ObjectId,
  name: string,
}

@Schema({ versionKey: false, timestamps: true })
export class User extends AbstractDocument {
  @Prop({ lowercase: true })
  email?: string;

  // @Prop()
  // password: string;

  @Prop({ type: Array, enum: ['admin', 'student', 'teacher'] })
  roles: string[];

  @Prop()
  name?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop({ type: [{ type: Types.ObjectId }] })
  grade?: Types.ObjectId[];

  @Prop()
  emailVerifyExpired?: Date;

  @Prop({ type: Date })
  expiredDate?: Date;

  @Prop({ enum: ['yes', 'no'] })
  backlog?: string;

  @Prop({
    type: {
      status: {
        type: String,
        enum: ['draft', 'approved', 'pending', 'rejected'],
        default: 'draft'
      },
      statusChangedAt: {
        type: Date,
        default: Date.now,
      },
      notes: [
        {
          version: { type: Number },
          comment: { type: String },
          updatedAt: { type: Date, default: Date.now },
          userInfo: {
            user: { type: Types.ObjectId, ref: 'User' },
            name: String,
          },
        },
      ],
      feedback: [
        {
          comment: { type: String },
          updatedAt: { type: Date, default: Date.now },
          type: { type: String },
          userInfo: {
            user: { type: Types.ObjectId, ref: 'User' },
            name: String,
          },
        },
      ],
    },
  })
  dossier?: {
    status: string,
    statusChangedAt: Date,
    notes: Note[],
    feedback: Feedback[]
  }

  @Prop()
  salt?: string;

  @Prop({ type: Boolean, default: false })
  managerPractice?: boolean;

  @Prop({
    type: {
      mimeType: { type: String },
      size: { type: Number },
      fileUrl: { type: String },
      fileName: { type: String },
      path: { type: String }
    }
  })
  avatar?: {
    mimeType: string,
    size: number,
    fileUrl: string,
    fileName: string,
    path: string
  };

  @Prop({
    type: Object,
    _id: { type: Types.ObjectId, auto: true },
    mimeType: { type: String },
    size: { type: Number },
    fileUrl: { type: String },
    fileName: { type: String },
    path: { type: String }
  })
  avatarSM?: {
    _id: Types.ObjectId,
    mimeType: string;
    size: number;
    fileUrl: string;
    fileName: string;
    path: string;
  };

  @Prop({
    type: Object,
    _id: Types.ObjectId,
    mimeType: { type: String },
    size: { type: Number },
    fileUrl: { type: String },
    fileName: { type: String },
    path: { type: String }
  })
  avatarMD?: {
    _id: Types.ObjectId,
    mimeType: string;
    size: number;
    fileUrl: string;
    fileName: string;
    path: string;
  };

  //profile virtual
  // get profile() {
  //   const profile: { [key: string]: string | string[] } = {
  //     'name': this.name,
  //     'role': this.roles,
  //     '_id': this._id.toString(),
  //   };

  //   profile.avatarUrl = this.avatar ? this.avatar.fileUrl : '';
  //   profile.avatarUrlSM = this.avatarSM ? this.avatarSM.fileUrl : '';
  //   profile.avatarUrlMD = this.avatarMD ? this.avatarMD.fileUrl : '';

  //   return profile;
  // }

  // @Prop()
  // avatarSM?: FileSchema;

  // @Prop()
  // avatarMD?: FileSchema;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'PracticeSet' }] })
  practiceViews?: Types.ObjectId[];

  @Prop({ lowercase: true })
  userId?: string;

  @Prop()
  emailStudents?: string[];

  @Prop({ default: '' })
  state?: string;

  @Prop()
  passingYear?: string;

  @Prop({ type: Date, default: null })
  lastLogin?: Date;

  @Prop({ type: Date })
  lastAttempt?: Date;

  @Prop()
  theme?: string;

  @Prop()
  designation?: string;

  @Prop({ type: Boolean, default: false })
  onboarding?: Boolean;

  @Prop({ type: Date })
  passwordResetExpired?: Date;

  @Prop({ type: Date })
  birthdate?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ref?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Subject' }] })
  subjects?: Types.ObjectId[];

  @Prop({
    type: Object,
    name: { type: String },
    code: { type: String },
    confirmed: { type: Boolean, default: false },
    callingCodes: [{ type: String }],
    currency: { type: String }
  })
  country?: {
    name?: string;
    code?: string;
    confirmed?: boolean;
    callingCodes?: string[];
    currency?: string;
  };

  @Prop()
  city?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'PracticeSet' }] })
  practiceAttempted?: Types.ObjectId[];

  @Prop()
  followings?: string[];

  @Prop()
  hashedPassword?: string;

  @Prop()
  __v?: number;

  @Prop()
  about?: string;

  @Prop({ type: Boolean, default: false })
  managerStudent?: boolean;

  @Prop()
  street?: string;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  followers?: string[];

  @Prop({ default: false })
  isPublic?: boolean;

  @Prop({ trim: true })
  rollNumber?: string;

  @Prop()
  loginCount?: number;

  @Prop()
  emailVerifyToken?: string;

  @Prop()
  gender?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Location' }] })
  locations?: Types.ObjectId[];

  @Prop()
  phoneNumber?: string;

  @Prop()
  phoneNumberFull?: string;

  @Prop()
  trainingProfileCompleted?: number;

  @Prop()
  provider?: string;

  @Prop()
  instituteUrl?: string;

  @Prop({ default: true })
  status?: boolean;

  @Prop({ enum: ["placed", "optedOut", "locked", "placementReady", "unqualified"] })
  placementStatus?: string;

  @Prop()
  videoResume?: string;

  @Prop()
  seqCode?: string;

  @Prop({ type: Boolean, default: false })
  emailVerified?: boolean;

  @Prop({ default: false })
  allowOnlineClass?: boolean;

  @Prop({ default: 5 })
  profileCompleted?: number;

  @Prop({ default: '' })
  district?: string;

  @Prop({ default: '' })
  interest?: string;

  @Prop({ default: '' })
  knowAboutUs?: string;

  @Prop()
  coreBranch?: string;

  @Prop([{ name: String, rating: { type: Number, default: 0 }, description: String }])
  programmingLang?: { name: string; rating: number; description: string }[];

  @Prop()
  interestedSubject?: string[];

  @Prop([{
    educationType: { type: String, required: true },
    board: { type: String, required: true },
    marksType: { enum: ['cgpa', 'marks'] },
    marks: Number,
    passingYear: Number,
    stream: String
  }])
  educationDetails?: {
    educationType: string;
    board: string;
    marksType: string
    marks: number;
    passingYear: number;
    stream: string;
  }[];

  @Prop([{
    year: String,
    rank: Number,
    name: String
  }])
  entranceExam?: {
    year: string;
    rank: number;
    name: string;
  }[];

  @Prop([{
    name: String,
    groupSize: String,
    description: String,
    startDate: Date,
    endDate: Date,
    document: String,
    url: String,
    sysgen: { type: Boolean, default: false }
  }])
  academicProjects?: {
    name: string;
    groupSize: string;
    description: string;
    startDate: Date;
    endDate: Date;
    document: string;
    url: string;
    sysgen: boolean;
  }[];

  @Prop([{
    type: {
      type: String,
      provider: String,
      city: String,
      state: String,
      startDate: Date,
      endDate: Date,
      expiredDate: Date,
      certificate: String,
      url: String,
      description: String,
      sysgen: { type: Boolean, default: false }
    }
  }])
  trainingCertifications?: {
    type: String;
    provider: String;
    city: String;
    state: String;
    startDate: Date;
    endDate: Date;
    expiredDate: Date;
    certificate?: String;
    url?: String;
    description: String;
    sysgen: boolean;
  }[];

  @Prop([{
    name: String,
    provider: String,
    certificateDate: Date,
    expiredDate: Date,
    certificate: String,
    url: String,
    sysgen: { type: Boolean, default: false }
  }])
  industryCertificates?: {
    name: string;
    provider: string;
    certificateDate: Date;
    expiredDate: Date;
    certificate: string;
    url?: string;
    sysgen: boolean;
  }[];

  @Prop([{
    name: String,
    mostRecentScore: Number,
    yearOfAssessment: Number,
    maximumScore: Number
  }])
  externalAssessment?: {
    name: string;
    mostRecentScore: number;
    yearOfAssessment: number;
    maximumScore: number;
  }[];

  @Prop([{
    awardDetails: String,
    date: Date
  }])
  awardsAndRecognition?: {
    awardDetails: string;
    date: Date;
  }[];

  @Prop([{
    activityDetails: String,
    startDate: Date,
    endDate: Date
  }])
  extraCurricularActivities?: {
    activityDetails: string;
    startDate: Date;
    endDate: Date;
  }[];

  @Prop([{
    package: { type: Types.ObjectId, ref: 'Package' },
    code: String
  }])
  packageSchedules?: {
    package: Types.ObjectId;
    code: string;
  }[];

  @Prop()
  collegeName?: string;

  @Prop()
  codingExperience?: string;

  @Prop({
    type: Object,
    imageUrl: { type: String },
    fileUrl: { type: String },
    matchedPercentage: { type: Number, default: 0 }
  })
  identityInfo?: {
    imageUrl: string;
    fileUrl: string;
    matchedPercentage: number;
  };

  @Prop()
  coverImageUrl?: string;

  @Prop([String])
  specialization?: string[];

  @Prop([{
    title: String,
    employmentType: String,
    company: String,
    location: String,
    currentlyWorking: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
    description: String
  }])
  experiences?: {
    title: string;
    employmentType: string;
    company: string;
    location: string;
    currentlyWorking: boolean;
    startDate: Date;
    endDate: Date;
    description: string;
  }[];

  @Prop({
    type: Object,
    publicProfile: { type: Boolean, default: true },
    myWatchList: { type: Boolean, default: false },
    leastPracticeDaily: { type: Boolean, default: false },
    resumesRequests: { type: Boolean, default: true },
    mentoringRequests: { type: Boolean, default: true },
    addingStudents: { type: Boolean, default: true },
    createAndPublishTest: { type: Boolean, default: false },
    viewExistingAssessment: { type: Boolean, default: false }
  })
  preferences?: {
    publicProfile: boolean;
    myWatchList: boolean;
    leastPracticeDaily: boolean;
    resumesRequests: boolean;
    mentoringRequests: boolean;
    addingStudents: boolean;
    createAndPublishTest: boolean;
    viewExistingAssessment: boolean;
  };

  @Prop({ default: false })
  whiteboard?: boolean;

  @Prop({ default: false })
  liveboard?: boolean;

  @Prop({ default: false })
  isVerified?: boolean;

  @Prop({ default: false })
  isMentor?: boolean;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  blockedUsers?: string[];

  @Prop()
  optoutEmail?: boolean;

  @Prop({ type: Date || null, default: null })
  optoutDate?: Date;

  @Prop()
  optoutReason?: string;

  @Prop({ default: false })
  ambassador?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastModifiedBy?: Types.ObjectId;

  @Prop([{
    subjectId: { type: Types.ObjectId, ref: 'Subject' },
    level: Number,
    updateDate: Date
  }])
  levelHistory?: {
    subjectId: Types.ObjectId;
    level: number;
    updateDate: Date;
  }[];

  @Prop()
  forcePasswordReset?: boolean;

  @Prop({ default: '' })
  streamUrl?: string;

  @Prop()
  institute?: string;

  @Prop()
  pin?: number;

  @Prop()
  openAI?: string;

  @Prop()
  studentExclusive?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  activeLocation?: Types.ObjectId;

  @Prop()
  registrationNo?: string;

  @Prop()
  expertise?: string;

  //for dynmic demographic fields
  @Prop({
    type: {
      label: { type: String },
      value: { type: String },
    }
  })
  field1?: {
    label: string,
    value: string
  };

  @Prop({
    type: {
      label: { type: String },
      value: { type: String },
    }
  })
  field2?: {
    label: string,
    value: string
  }

  @Prop()
  canCreateMultiLocations?: boolean;

  @Prop({ type: Object })
  google?: object;

  @Prop({ type: Object })
  instagram?: object;

  @Prop({ type: Object })
  facebook?: object;

  @Prop({ type: Object })
  youtube?: object;

  @Prop({ type: Object })
  linkedin?: object;

  @Prop()
  web?: string;

  @Prop()
  shortTermGoal?: string;

  @Prop()
  longTermGoal?: string;

  @Prop()
  identificationNumber?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  avatarUrlSM?: string;

  @Prop({
    type: {
      mentorInfo: {
        user: { type: Types.ObjectId, ref: 'User' },
        name: String,
      }
    }
  })
  mentorInfo?: MentorInfo;

  @Prop({ type: Types.ObjectId })
  instance?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  o_id?: Types.ObjectId;
}

const userSchemaMethods = {
  authenticate: function (plainText: string, cb: (err: any, result: boolean) => void) {
    this.encryptPassword(plainText, (err: any, key: string) => {
      if (err) {
        return cb(err, false);
      }
      cb(null, key === this.hashedPassword);
    });
  },

  makeSalt: function (cb: (err: any, salt: string) => void) {
    // crypto.randomBytes(16, (err, buf) => {
    //   if (err) {
    //     return cb(err, '');
    //   }
    //   cb(null, buf.toString('hex'));
    // });
  },

  encryptPassword: function (password: string, cb: (err: any, key: string) => void) {
    if (!password || !this.salt) {
      return cb(null, '');
    }
    const salt = Buffer.from(this.salt, 'hex');
    // crypto.pbkdf2(password, salt, 10000, 64, 'sha1', (err, key) => {
    //   if (err) {
    //     return cb(err, '');
    //   }
    //   cb(null, key.toString('hex'));
    // });
  },

  setPassword: function (password: string) {
    return new Promise<boolean>((resolve, reject) => {
      this._password = password;
      this.makeSalt((err, salt) => {
        if (err) {
          return reject(err);
        }
        this.salt = salt;
        this.encryptPassword(password, (err, pass) => {
          if (err) {
            return reject(err);
          }
          this.hashedPassword = pass;
          resolve(true);
        });
      });
    });
  }
};

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  this.markModified('practiceViews');
  this.markModified('practiceAttempted');
  this.markModified('subjects');
  this.markModified('emailStudents');
  this.markModified('country');

  if (!this.userId) {
    this.userId = this.email ? this.email : this.phoneNumber;
  }

  if (this.name) {
    this.name = this.name.replace(/[^A-Za-z'&\s]/g, " ").trim();
    if (this.name === '') {
      this.name = 'invalidName';
    }
  }

  //this.wasNew = this.isNew
  if (this.provider !== 'local') {
    this.emailVerified = true;
    this.isVerified = true;
  }

  // fill in levelHistory
  // if (this.roles.includes('student')) {
  // try {
  //     var redisCache = rootRequire('redis/redisCaching');

  //     var req = Utils.getReqInstanceByModel(this);
  //     let settings = await redisCache.getSettingAsync(req.headers.instancekey)
  //     if (settings.features.studentLevel) {
  //         if (!this.levelHistory) {
  //             this.levelHistory = []
  //         }
  //         for (let sub of this.subjects) {
  //             if (!this.levelHistory.find(l => l.subjectId && l.subjectId.equals(sub))) {
  //                 this.levelHistory.push({
  //                     subjectId: sub._id,
  //                     level: 1,
  //                     updateDate: Date.now()
  //                 })
  //             }
  //         }

  //     }
  // } catch (ex) {
  //     Logger.error("fail to update user level history")
  //     Logger.error(ex)
  // }
  // }

  if (this.isNew) {
    this.roles?.forEach(role => {
      switch (role) {
        case 'admin':
          this.managerStudent = true
          this.managerPractice = true
          break
        case 'director':
          this.managerStudent = true
          this.managerPractice = true
          break
        case 'centerHead':
          this.managerStudent = true
          this.managerPractice = true
          break
        case 'operator':
          this.managerStudent = true
          this.managerPractice = true
          break
        case 'teacher':
          this.managerStudent = true
          this.managerPractice = true
          break
        case 'support':
          this.managerPractice = true
          this.managerStudent = true
          break
        case 'mentor':
          this.managerStudent = true
          this.managerPractice = true
          break
        case 'publisher':
          this.managerPractice = true
          break
      }
    });

    // if (!this.emailVerified && !this.emailVerifyToken) {
    //     // create email verify token
    //     this.emailVerifyToken = getRandomDigit(6)
    // };

    if (this.isNew && this.roles?.includes('student') && !this.rollNumber) {
      let newRoll = await generateUniqueRollNumber(this.constructor);
      if (!newRoll) {
        next(new Error('Failed to generate unique roll number after multiple attempts'));
      }
      this.rollNumber = newRoll;
      next();
    } else {
      next();
    }
  } else {
    this.roles?.forEach(role => {
      switch (role) {
        case 'admin':
          this.managerStudent = true
          this.managerPractice = true
          break
        case 'director':
          this.managerStudent = true
          this.managerPractice = true
          break
        case 'centerHead':
          this.managerStudent = true
          this.managerPractice = true
          break
        case 'operator':
          this.managerStudent = true
          this.managerPractice = true
          break
        case 'teacher':
          this.managerStudent = true
          this.managerPractice = true
          break
        case 'support':
          this.managerPractice = true
          this.managerStudent = true
          break
        case 'mentor':
          this.managerStudent = true
          this.managerPractice = true
          break
        case 'publisher':
          if (typeof this.managerPractice == 'undefined') {
            this.managerPractice = true
          }
          break
      }
    });

    return next()
  }
});

Object.assign(UserSchema.statics, userSchemaMethods);

async function generateUniqueRollNumber(model) {
  const MAX_ATTEMPTS = 10;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const newRoll = 'P' + getRandomCode(9);
    const existingUser = await model.findOne({ rollNumber: newRoll });
    if (!existingUser) {
      return newRoll;
    }
    return;
  }
}

function getRandomCode(digitLength) {
  const chars = "ABCD45EFGHJKM0123NPQRSTU67VWXY89Z";
  let code = '';
  for (let i = 0; i < digitLength; i++) {
    const rnum = Math.floor(Math.random() * chars.length);
    code += chars.substring(rnum, rnum + 1);
  }
  return code.toUpperCase();
}

/**
 * Virtuals
 */

// Public profile information
UserSchema
  .virtual('profile')
  .get(function () {
    return {
      'name': this.name,
      'roles': this.roles,
      'avatar': this.avatar,
      '_id': this._id,
      avatarUrl: this.avatar ? this.avatar.fileUrl : '',
      avatarUrlSM: this.avatarSM ? this.avatarSM.fileUrl : '',
      avatarUrlMD: this.avatarMD ? this.avatarMD.fileUrl : ''
    }
  })
UserSchema
  .virtual('publicProfile')
  .get(function () {
    return {
      'name': this.name,
      'roles': this.roles,
      'avatar': this.avatar,
      avatarUrl: this.avatar ? this.avatar.fileUrl : '',
      avatarUrlSM: this.avatarSM ? this.avatarSM.fileUrl : '',
      avatarUrlMD: this.avatarMD ? this.avatarMD.fileUrl : '',
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  })

// Non-sensitive info we'll be putting in the token
UserSchema.virtual('token').get(function () {
  return {
    '_id': this._id,
    'roles': this.roles
  }
})
// Ensure virtual fields are serialised
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });