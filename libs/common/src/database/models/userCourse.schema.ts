import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AbstractDocument } from '../abstract.schema';

interface Contents {
    section?: Types.ObjectId;
    source?: Types.ObjectId;
    timeSpent: number;
    start?: Date;
    completed?: boolean;
    title?: string;
    type?: string;
    end?: Date;
    updatedAt?: Date;
    attempt?: Types.ObjectId;
}
interface Analytics {
    quiz: number;
    test: number;
    attempt: number;
    accuracy: number;
    mark?: number;
    maxMark?: number;
}
interface Sections {
    title: string;
    completed: boolean;
    analytics: Analytics[]

}
@Schema({ strict: true, minimize: true, autoIndex: false, timestamps: true })
export class UserCourse extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    course: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: String })
    userRole?: string;

    @Prop({ type: Number })
    price?: number;

    @Prop({ type: Date })
    expiresOn?: Date;

    @Prop([
        {
            title: String,
            completed: { type: Boolean, default: false },
            analytics: {
                quiz: Number,
                test: Number,
                attempt: Number,
                accuracy: Number,
                mark: Number,
                maxMark: Number,
            },
        },
    ])
    sections?: Sections[];

    @Prop([
        {
            section: Types.ObjectId,
            source: Types.ObjectId,
            timeSpent: { type: Number, default: 0 },
            start: Date,
            completed: { type: Boolean, default: false },
            title: String,
            type: { type: String },
            end: Date,
            updatedAt: Date,
            attempt: { type: Types.ObjectId, ref: 'Attempt' },
        }
    ])
    contents?: Contents[];

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy?: Types.ObjectId;

    @Prop({ type: Boolean, default: true })
    active?: boolean;

    @Prop({ type: Boolean, default: false })
    completed?: boolean;

    @Prop({ type: Boolean, default: false })
    issuedCertificate?: boolean

    @Prop({ type: Date })
    issuedCertificateDate?: Date;

    @Prop({ type: Types.ObjectId, ref: 'Location' })
    location?: Types.ObjectId;
}

export const UserCourseSchema = SchemaFactory.createForClass(UserCourse);
