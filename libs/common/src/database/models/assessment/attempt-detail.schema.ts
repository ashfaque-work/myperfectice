import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../../abstract.schema';
import { Types } from 'mongoose';

@Schema({ timestamps: true, strict: true, minimize: false, autoIndex: false })
export class AttemptDetail extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'PracticeSet', required: true })
    practicesetId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Attempt' })
    attempt?: Types.ObjectId;

    @Prop({ type: Boolean, default: true })
    isAbandoned: boolean;

    @Prop()
    archiveQA?: any[];

    @Prop({
        type: [{
            question: { type: Types.ObjectId, ref: 'Question' },
            timeEslapse: { type: Number },
            timeLeft: { type: Number, default: 0 },
            stdTime: { type: Number, default: 0 },
            index: { type: Number, default: 0 },
            answerChanged: { type: Number },
            status: { type: Number },
            category: { type: String },
            offscreen: { type: [Number] },
            feedback: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
            isMissed: { type: Boolean, default: false },
            hasMarked: { type: Boolean, default: false },
            actualMarks: { type: Number, default: 0 },
            obtainMarks: { type: Number, default: 0 },
            topic: { _id: { type: Types.ObjectId, ref: 'Topic' }, name: String },
            unit: { _id: { type: Types.ObjectId, ref: 'Unit' }, name: String },
            subject: { _id: { type: Types.ObjectId, ref: 'Subject' }, name: String },
            answers: [{
                answerId: { type: Types.ObjectId },
                answerText: { type: String },
                userText: { type: String },
                codeLanguage: { type: String },
                code: { type: String },
                testcases: [{
                    args: { type: String, default: '' },
                    input: { type: String },
                    output: { type: String },
                    status: { type: Boolean, default: false },
                    runTime: { type: Number },
                    error: { type: String }
                }],
                userArgs: { type: String },
                userInput: { type: String },
                output: { type: String },
                compileMessage: { type: String },
                compileTime: { type: Number },
                mathData: { type: String },
                timeElapse: { type: Number },
                attachments: [{type: { url: String, name: String, type: String }}]
            }],
            teacherComment: { type: String },
            reviewTimes: { type: Number },
            reviewTimeSpent: { type: Number },
            tComplexity: { type: Number },
            answerOrder: { type: [Types.ObjectId] },
            scratchPad: { type: [String]} ,
            evaluatorAssigned: { type: Boolean }
        }],
        default: []
    })
    QA: Array<{
        question: Types.ObjectId,
        timeEslapse: number,
        timeLeft?: number,
        stdTime?: number,
        index?: number,
        answerChanged?: number,
        status?: number,
        category?: string,
        offscreen?: number[],
        feedback?: boolean,
        createdAt?: Date,
        isMissed?: boolean,
        hasMarked?: boolean,
        actualMarks?: number,
        obtainMarks?: number,
        topic?: {
            _id: Types.ObjectId,
            name: string
        },
        unit?: {
            _id: Types.ObjectId,
            name: string
        },
        subject?: {
            _id: Types.ObjectId,
            name: string
        },
        answers?: Array<{
            answerId: Types.ObjectId,
            answerText: string,
            userText: string,
            codeLanguage: string,
            code: string,
            testcases: Array<{
                args: string,
                input: string,
                output: string,
                status: boolean,
                runTime: number,
                error: string
            }>,
            userArgs: string,
            userInput: string,
            output: string,
            compileMessage: string,
            compileTime: number,
            mathData: string,
            timeElapse: number,
            attachments: Array<{
                url: string,
                name: string,
                type: string
            }>
        }>,
        teacherComment?: string,
        reviewTimes?: number,
        reviewTimeSpent?: number,
        tComplexity?: number,
        answerOrder?: Types.ObjectId[],
        scratchPad?: string[],
        evaluatorAssigned?: boolean
    }>;


}

export const AttemptDetailSchema = SchemaFactory.createForClass(AttemptDetail);
