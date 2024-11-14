import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';

@Schema({ timestamps: true, autoIndex: false, minimize: false })
export class ExamSchedule extends AbstractDocument {
    @Prop({ type: Date })
    examDate: Date;

    @Prop({ type: String })
    slotTime: string;

    @Prop({ type: String })
    course: string;

    @Prop({ enum: ['static', 'dynamic', 'adaptive'], default: 'dynamic' })
    testType: string;

    @Prop({ default: 0 })
    allowedAttempt: number;

    @Prop({ type: [String] })
    tags: string[];

    @Prop({ type: [String] })
    classrooms: string[];

    @Prop({
        type: {
            testMode: { type: String, enum: ['practice', 'proctored', 'learning'], default: 'practice' },
            accessMode: { type: String, enum: ['public', 'invitation', 'buy'], default: 'public' },
            isMarksLevel: { type: Boolean, default: true },
            minusMark: { type: Number, default: 0 },
            plusMark: { type: Number, default: 1 },
            totalTime: Number,
            startTimeAllowance: { type: Number, default: 0 },
            totalQuestion: Number,
            offscreenLimit: { type: Number, default: 0 },
            camera: { type: Boolean, default: false },
            randomQuestions: { type: Boolean, default: true },
            randomizeAnswerOptions: { type: Boolean, default: true },
            questionsdistribution: [{
                marks: Number,
                count: Number,
                topic: String,
            }],
        }
    })
    settings: {
        testMode: string;
        accessMode: string;
        isMarksLevel: boolean;
        minusMark: number;
        plusMark: number;
        totalTime: number;
        startTimeAllowance: number;
        totalQuestion: number;
        offscreenLimit: number;
        camera: boolean;
        randomQuestions: boolean;
        randomizeAnswerOptions: boolean;
        questionsdistribution: {
            marks: number;
            count: number;
            topic: string;
        }[];
    };

    @Prop({ default: true })
    active: boolean;

    createdAt: Date;

    updatedAt: Date;
}

export const ExamScheduleSchema = SchemaFactory.createForClass(ExamSchedule);
