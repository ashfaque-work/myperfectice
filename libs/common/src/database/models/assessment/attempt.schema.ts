import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';
import { AbstractDocument } from '../../abstract.schema';

@Schema({
    timestamps: true,
    minimize: false,
    autoIndex: false,
    strict: true,
    //   usePushEach: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Attempt extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'PracticeSet', required: true })
    practicesetId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: String })
    studentName: string;

    @Prop({ type: String, lowercase: true })
    email: string;

    @Prop({ type: String, lowercase: true })
    userId: string;

    @Prop({ type: Number, default: 0 })
    lastIndex: number;

    @Prop({ type: Types.ObjectId, ref: 'AttemptDetail' })
    attemptdetails: Types.ObjectId;

    @Prop({ type: String })
    idOffline: string;

    @Prop({ type: Number })
    totalQuestions: number;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;

    @Prop({ type: Boolean, default: true })
    isEvaluated: boolean;

    @Prop({ type: Number, default: 0 })
    partial: number;

    @Prop({ type: Boolean, default: false })
    partiallyAttempted: boolean;

    @Prop({ type: Boolean, default: false })
    isLevelReset: boolean;

    @Prop({ type: Number, default: 0 })
    pending: number;

    @Prop({ type: Number, default: 0 })
    maximumMarks: number;

    @Prop({ type: Boolean, default: true })
    isShowAttempt: boolean;

    @Prop({ type: Boolean, default: false })
    isFraudulent: boolean;

    @Prop({ type: Boolean, default: false })
    markedSuspicious: boolean;

    @Prop({ type: Boolean, default: false })
    isAnsync: boolean;

    @Prop({ type: Boolean, default: false })
    isCratedOffline: boolean;

    @Prop({ type: Number, default: 0 })
    totalMark: number;

    @Prop({ type: Number, default: 0 })
    plusMark: number;

    @Prop({ type: Number, default: 0 })
    minusMark: number;

    @Prop({ type: Number, default: 0 })
    totalMissed: number;

    @Prop({ type: Number, default: 0 })
    totalErrors: number;

    @Prop({ type: Number, default: 0 })
    totalTime: number;

    @Prop({ type: Number, default: 0 })
    totalCorrects: number;

    @Prop({ type: Boolean, default: true })
    isAbandoned: boolean;

    @Prop({ type: Number, default: 0 })
    totalMarkeds: number;

    @Prop({ type: { user: { type: Types.ObjectId, ref: 'User' }, name: String } })
    createdBy: { user: Types.ObjectId, name: string };

    @Prop({ type: String })
    attemptType: string;

    @Prop({
        type: [{
            _id: { type: Types.ObjectId, ref: 'Subject' },
            name: { type: String },
            correct: { type: Number, default: 0 },
            missed: { type: Number, default: 0 },
            incorrect: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
            partial: { type: Number, default: 0 },
            mark: { type: Number, default: 0 },
            speed: { type: Number, default: 0 },
            accuracy: { type: Number, default: 0 },
            maxMarks: { type: Number, default: 0 },
            offscreenTime: { type: Number, default: 0 },
            units: [{
                _id: { type: Types.ObjectId, ref: 'Unit' },
                name: { type: String },
                speed: { type: Number, default: 0 },
                accuracy: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
                pending: { type: Number, default: 0 },
                partial: { type: Number, default: 0 },
                missed: { type: Number, default: 0 },
                incorrect: { type: Number, default: 0 },
                mark: { type: Number, default: 0 },
                maxMarks: { type: Number, default: 0 },
                topics: [{
                    _id: { type: Types.ObjectId, ref: 'Topic' },
                    name: { type: String },
                    speed: { type: Number, default: 0 },
                    accuracy: { type: Number, default: 0 },
                    correct: { type: Number, default: 0 },
                    pending: { type: Number, default: 0 },
                    partial: { type: Number, default: 0 },
                    missed: { type: Number, default: 0 },
                    incorrect: { type: Number, default: 0 },
                    mark: { type: Number, default: 0 },
                    maxMarks: { type: Number, default: 0 },
                }]
            }],
        }],
    })
    subjects: {
        _id: { type: Types.ObjectId, ref: 'Subject' },
        name: { type: String },
        correct: { type: Number, default: 0 },
        missed: { type: Number, default: 0 },
        incorrect: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
        partial: { type: Number, default: 0 },
        mark: { type: Number, default: 0 },
        speed: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        maxMarks: { type: Number, default: 0 },
        offscreenTime: { type: Number, default: 0 },
        units: [{
            _id: { type: Types.ObjectId, ref: 'Unit' },
            name: { type: String },
            speed: { type: Number, default: 0 },
            accuracy: { type: Number, default: 0 },
            correct: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
            partial: { type: Number, default: 0 },
            missed: { type: Number, default: 0 },
            incorrect: { type: Number, default: 0 },
            mark: { type: Number, default: 0 },
            maxMarks: { type: Number, default: 0 },
            topics: [{
                _id: { type: Types.ObjectId, ref: 'Topic' },
                name: { type: String },
                speed: { type: Number, default: 0 },
                accuracy: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
                pending: { type: Number, default: 0 },
                partial: { type: Number, default: 0 },
                missed: { type: Number, default: 0 },
                incorrect: { type: Number, default: 0 },
                mark: { type: Number, default: 0 },
                maxMarks: { type: Number, default: 0 },
            }]
        }]
    };

    @Prop({
        type: {
            title: { type: String },
            titleLower: { type: String, lowercase: true },
            units: [{ _id: { type: Types.ObjectId, ref: 'Unit' }, name: String }],
            subjects: [{ _id: { type: Types.ObjectId, ref: 'Subject' }, name: String }],
            createdBy: { type: Types.ObjectId, ref: 'User' }, // not used
            accessMode: { type: String, enum: ['public', 'invitation', 'buy', 'internal'], default: 'public' },
            classRooms: [{ type: Types.ObjectId, ref: 'ClassRoom' }],
            isAdaptive: { type: Boolean },
            adaptiveTest: { type: Types.ObjectId, ref: 'AdaptiveTest' },
            level: { type: Number, default: 0 },
            grades: [{ _id: { type: Types.ObjectId }, name: String }],
        }
    })
    practiceSetInfo: {
        title: { type: String },
        titleLower: { type: String, lowercase: true },
        units: [{ _id: { type: Types.ObjectId, ref: 'Unit' }, name: String }],
        subjects: [{ _id: { type: Types.ObjectId, ref: 'Subject' }, name: String }],
        createdBy: { type: Types.ObjectId, ref: 'User' }, // not used
        accessMode: { type: String, enum: ['public', 'invitation', 'buy', 'internal'], default: 'public' },
        classRooms: [{ type: Types.ObjectId, ref: 'ClassRoom' }],
        isAdaptive: { type: Boolean },
        adaptiveTest: { type: Types.ObjectId, ref: 'AdaptiveTest' },
        level: { type: Number, default: 0 },
        grades: [{ _id: { type: Types.ObjectId }, name: String }],
    };

    @Prop({ type: Number, default: 0 })
    offscreenTime: number;

    @Prop({ type: [Date] })
    fraudDetected: Date[];

    @Prop({ type: Boolean, default: false })
    terminated: boolean;

    @Prop({ type: Number, default: 0 })
    resumeCount: number;

    @Prop({ type: Number, default: 0 })
    timeLimitExhaustedCount: number;

    @Prop({ type: Boolean, default: false })
    ongoing: boolean;

    @Prop({
        type: {
            frames: [{
                captured: { type: Date },
                headCount: { type: Number },
                candidate: { type: Boolean },
                image: { type: String },
            }],
            fraud: { type: Boolean },
        }
    })
    face_detection: { frames: Array<{ captured: Date, headCount: number, candidate: boolean, image: string }>, fraud: boolean };

    @Prop({
        type: [{
            captured: { type: Date },
            video: { type: String },
        }],
        default: []
    })
    screen_recordings: Array<{ captured: Date, video: string }>;

    @Prop({
        type: [{
            date: { type: Date },
            answerSheet: { type: String },
        }],
        default: []
    })
    answerSheets: Array<{ date: Date, answerSheet: string }>;

    @Prop({
        type: {
            imageUrl: { type: String },
            fileUrl: { type: String },
            matchedPercentage: { type: Number },
        }
    })
    identityInfo: { imageUrl: string, fileUrl: string, matchedPercentage: number };

    @Prop({ type: Types.ObjectId })
    referenceId: Types.ObjectId;

    @Prop({ type: String, enum: ['course', 'testseries'] })
    referenceType: string;

    @Prop({ type: MongooseSchema.Types.Mixed })
    referenceData: any;

    @Prop({ type: Types.ObjectId, ref: 'Location' })
    location: Types.ObjectId;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);

AttemptSchema.virtual('speed')
    .get(function () {
        var totalDoQuestions = this.totalCorrects + this.totalErrors + this.pending + this.partial
        return (totalDoQuestions > 0 ? this.totalTime / totalDoQuestions : 0)
    })