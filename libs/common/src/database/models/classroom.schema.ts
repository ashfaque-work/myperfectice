import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';
import { Types, Date } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Classroom extends AbstractDocument {
    @Prop()
    name: string;

    @Prop({ default: '', trim: true })
    nameLower?: string;

    @Prop()
    slugfly?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ default: false })
    isDefault?: boolean;

    @Prop({ default: false })
    joinByCode?: boolean;

    @Prop({ default: false })
    sysGen?: boolean;

    @Prop()
    userRole?: string;

    @Prop({ type: Types.ObjectId, ref: 'Location' })
    location?: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: 'User' })
    owners?: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'File' })
    folder?: Types.ObjectId[];

    @Prop()
    seqCode?: string;

    @Prop({ default: true })
    active: boolean;

    @Prop({ default: true })
    showAnalysis?: boolean;

    @Prop({ default: true })
    allowDelete?: boolean;

    @Prop({ default: false })
    stream?: boolean;

    @Prop()
    imageUrl?: string;

    @Prop([{
        studentId: { type: Types.ObjectId, ref: 'User' },
        status: { type: Boolean, default: false },
        autoAdd: { type: Boolean, default: true },
        studentUserId: { type: String },
        registeredAt: { type: Date },
        createdAt: { type: Date, default: Date.now },
        iRequested: { type: Boolean, default: true },
        isWatchList: { type: Boolean, default: false },
        dailyGoal: { type: Number },
        tasks: [{
            assignDate: { type: Date },
            practiceId: { type: Types.ObjectId, ref: 'PracticeSet' }
        }],
        assignments: [{
            assignment: { type: Types.ObjectId },
            title: { type: String },
            ansTitle: { type: String },
            answerText: { type: String },
            submittedOn: { type: Date, default: Date.now },
            attachments: [{
                url: { type: String },
                name: { type: String },
                type: { type: String }
            }],
            evaluated: { type: Boolean, default: false },
            maximumMarks: { type: Number },
            dueDate: { type: Date },
            totalMark: { type: Number },
            feedback: {
                user: { type: Types.ObjectId, ref: 'User' },
                text: { type: String }
            },
        }]
    }])
    students?: {
        studentId?: Types.ObjectId,
        status?: boolean,
        autoAdd?: boolean,
        studentUserId?: string,
        registeredAt?: Date,
        createdAt?: Date,
        iRequested?: boolean,
        isWatchList?: boolean,
        dailyGoal?: number,
        tasks?: {
            assignDate?: Date,
            practiceId?: Types.ObjectId
        }[],
        assignments?: {
            assignment?: Types.ObjectId,
            title?: string,
            ansTitle?: string,
            answerText?: string,
            submittedOn?: Date,
            attachments?: {
                url?: string,
                name?: string,
                type?: string
            }[],
            evaluated?: boolean,
            maximumMarks?: number,
            dueDate?: Date,
            totalMark?: number,
            feedback?: {
                user?: Types.ObjectId,
                text?: string
            },
        }[]
    }[];

    @Prop({ type: Date, default: Date.now })
    createdAt?: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt?: Date;

    @Prop()
    colorCode?: string;

    @Prop([{
        _id: { type: Types.ObjectId },
        title: { type: String },
        ansTitle: { type: String },
        answerText: { type: String },
        description: { type: String },
        status: { type: String, enum: ['draft', 'published', 'revoked'], default: 'draft' },
        createdAt: { type: Date, default: Date.now },
        attachments: [{ url: { type: String }, name: { type: String }, type: { type: String } }],
        maximumMarks: { type: Number },
        dueDate: { type: Date },
        totalMark: { type: Number },
        user: { type: Types.ObjectId, ref: 'User' }
    }])
    assignments?: Array<{
        _id?: Types.ObjectId,
        title?: string,
        ansTitle?: string,
        answerText?: string,
        description?: string;
        status?: 'draft' | 'published' | 'revoked';
        createdAt?: Date;
        attachments?: Array<{ url?: string; name?: string; type?: string; }>;
        maximumMarks?: number,
        dueDate?: Date,
        totalMark?: number,
        user?: Types.ObjectId;
    }>;

    //for mentor
    @Prop({ type: [Types.ObjectId], ref: 'PracticeSet' })
    practiceIds?: Types.ObjectId[];
}

export const ClassroomSchema = SchemaFactory.createForClass(Classroom);
