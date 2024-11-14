import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, Types } from 'mongoose';
import { AbstractDocument } from '../../abstract.schema';
import { v4 as uuidv4 } from 'uuid';
import * as util from '@app/common';
import { EventBus } from '@app/common/components/eventBus';

interface AudioFile {
    url: string;
    name: string;
    duration: number;
}

interface Answers {
    answerText: string,
    answerTextArray: string[],
    isCorrectAnswer: boolean,
    input: string,
    marks?: number,
    score: number,
    userText: string,
    correctMatch: string,
    audioFiles?: AudioFile[],
}

interface TestCases {
    isSample: boolean,
    args: string,
    input: string,
    output: string
}

interface Coding {
    language: string,
    // time limit in seconds
    timeLimit: number,
    // memory limit in MB
    memLimit: number,
    template: string,
    solution: string
}

interface User {
    _id: Types.ObjectId,
    name: string
}

interface AlternativeExplanations {
    user: User,
    explanation: string,
    isApproved: boolean
}

@Schema({
    timestamps: true,
    versionKey: false,
    minimize: false,
    autoIndex: false,
    toObject: {
        virtuals: true
    }
})
export class Question extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user?: Types.ObjectId;

    @Prop({
        type: String,
        enum: ['student', 'support', 'teacher', 'mentor', 'publisher', 'admin', 'director', 'centerHead', 'operator']
    })
    userRole?: String;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'PracticeSet' }] })
    practiceSets: Types.ObjectId[];

    @Prop({
        type: {
            _id: { type: Types.ObjectId, ref: 'Subject', required: true },
            name: { type: String }
        }
    })
    subject: {
        _id: Types.ObjectId,
        name: string
    };

    @Prop({
        type: {
            _id: { type: Types.ObjectId, ref: 'Topic', required: true },
            name: { type: String }
        }
    })
    topic: {
        _id: Types.ObjectId;
        name: string;
    };

    @Prop({
        type: {
            _id: { type: Types.ObjectId, ref: 'Unit', required: true },
            name: { type: String }
        }
    })
    unit: {
        _id: Types.ObjectId,
        name: string
    };

    @Prop()
    tags: String[];

    @Prop({
        type: String,
        enum: ['easy', 'moderate', 'hard'],
        default: 'moderate'
    })
    complexity: String;

    @Prop({
        type: String,
        enum: ['single', 'multiple'],
        default: 'single'
    })
    questionType: String;

    @Prop({
        type: String,
        enum: ['global', 'self', 'none'],
        default: 'none'
    })
    isAllowReuse: String;

    @Prop({
        type: {
            moderatedBy: { type: Types.ObjectId, ref: 'User' },
            moderationDate: { type: Date }
        }
    })
    moderation: {
        moderatedBy: Types.ObjectId,
        moderationDate: Date
    };

    @Prop({
        type: String,
        enum: ['mcq', 'fib', 'code', 'descriptive', 'mixmatch'],
        default: 'mcq'
    })
    category: String;

    @Prop({ type: String, default: '' })
    questionText: String;

    @Prop({ type: [String], default: [] })
    questionTextArray: String[];

    @Prop([{
        _id: { type: Types.ObjectId, default: new Types.ObjectId() },
        url: { type: String, default: '' },
        name: { type: String, default: '' },
        duration: { type: Number, default: 0 }
    }])
    audioFiles: AudioFile[];

    @Prop({ type: [String], default: [] })
    answerExplainArr: String[];

    @Prop({ type: String, default: '' })
    answerExplain: String;

    @Prop([{
        _id: { type: Types.ObjectId, default: new Types.ObjectId() },
        url: { type: String, default: '' },
        name: { type: String, default: '' },
        duration: { type: Number, default: 0 }
    }])
    answerExplainAudioFiles: AudioFile[];

    @Prop({ type: [String], default: [] })
    prefferedLanguage: String[];

    @Prop({ type: String, default: '' })
    questionHeader: String;

    @Prop({ type: Number, default: 2 })
    answerNumber: Number;

    @Prop({ type: Number, default: 0 })
    minusMark?: Number;

    @Prop({ type: Number, default: 1 })
    plusMark?: Number;

    @Prop({ default: now() })
    createdAt?: Date;

    @Prop({ default: now() })
    updatedAt?: Date;

    @Prop({ type: Boolean, default: true })
    isActive: Boolean;

    @Prop({ type: Number, default: 1 })
    wordLimit: Number;

    @Prop({ type: Boolean, default: false })
    partialMark: Boolean;

    @Prop({ type: String })
    // Base data for Psychometric quetion
    domain: String;

    @Prop({ type: Number })
    facet: Number;

    @Prop([{
        _id: { type: Types.ObjectId, default: new Types.ObjectId() },
        answerText: { type: String, trim: true },
        answerTextArray: { type: [String], default: [] },
        isCorrectAnswer: { type: Boolean, default: false },
        input: { type: String },
        marks: { type: Number },
        score: { type: Number },
        userText: { type: String },
        correctMatch: { type: String },
        audioFiles: [{
            _id: { type: Types.ObjectId, default: new Types.ObjectId() },
            url: { type: String, default: '' },
            name: { type: String, default: '' },
            duration: { type: Number, default: 0 }
        }]
    }])
    answers: Answers[];

    @Prop({ type: String, default: '' })
    userInputDescription: String;

    @Prop({ type: Boolean, default: false })
    hasUserInput: Boolean;

    @Prop({ type: String, default: '' })
    argumentDescription: String;

    @Prop({ type: Boolean, default: true })
    hasArg: Boolean;

    @Prop({ type: Number })
    modelId: Number;

    @Prop({ type: Number })
    tComplexity: Number;

    @Prop([{
        _id: { type: Types.ObjectId, default: new Types.ObjectId() },
        isSample: { type: Boolean, default: false },
        args: { type: String, default: '' },
        input: { type: String, default: '' },
        output: { type: String, default: '' }
    }])
    testcases: TestCases[];

    @Prop([{
        _id: { type: Types.ObjectId, default: new Types.ObjectId() },
        language: { type: String, default: '' },
        // time limit in seconds
        timeLimit: { type: Number },
        // memory limit in MB
        memLimit: { type: Number },
        template: { type: String, default: '' },
        solution: { type: String, default: '' }
    }])
    coding: Coding[];
    // This is used for questions created by student
    // It shows if question is reviewd or not and is approved or rejected
    // So it can have these value:
    //*  '' : empty value for normal question
    //*  'pending': waiting for teacher to review
    //*  'approved': approved by teacher
    //*  'rejected': rejected by teacher

    @Prop({ type: String, default: '' })
    approveStatus: String;

    @Prop([{
        _id: { type: Types.ObjectId, default: new Types.ObjectId() },
        type: {
            user: {
                _id: { type: Types.ObjectId, ref: 'User' },
                name: { type: String }
            }
        },
        explanation: { type: String, default: '' },
        isApproved: { type: Boolean, default: false }
    }])
    alternativeExplanations: AlternativeExplanations[];

    @Prop({
        type: Types.ObjectId,
        ref: 'User'
    })
    lastModifiedBy: Types.ObjectId;
    // this uid is for content sync, it will have the same value across instances

    @Prop({ type: String })
    uid: String;

    @Prop({
        type: [Types.ObjectId],
        ref: 'Location'
    })
    locations?: Types.ObjectId[];

    private _mappings: any;
    private _videos: any;
    get mappings(): any {
        return this._mappings;
    }

    set mappings(value: any) {
        this._mappings = value;
    }

    get videos(): any {
        return this._videos;
    }

    set videos(value: any) {
        this._videos = value;
    }
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

QuestionSchema.virtual('topicInfo', {
    ref: 'Topic', // The model to use
    localField: 'topic._id', // Find people where `localField`
    foreignField: '_id' // is equal to `foreignField`
})

/**
 * Pre-save hook
 */
QuestionSchema.pre('save', function (next) {
    // this.wasNew = this.isNew

    this.markModified('subject')
    if (this.isNew) {
        if (!this.uid) {
            this.uid = uuidv4();
        }
    } else {
        this.updatedAt = new Date()
    }
    next()
})

// QuestionSchema.post('save', function (doc) {
//     var req = util.getReqInstanceByModel(doc);
//     EventBus.emit('Question.addTags', {
//         req: req,
//         tags: doc.tags
//     })
// })
