import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';
import { Types, Date } from 'mongoose';

class Grade {
    @Prop({ type: Types.ObjectId, ref: 'Grade' })
    _id: Types.ObjectId;

    @Prop({ type: String })
    name: string;
}

class Subject {
    @Prop({ type: Types.ObjectId, ref: 'Subject' })
    _id: Types.ObjectId;

    @Prop({ type: String })
    name: string;
}

class Topic {
    @Prop({ type: Types.ObjectId, ref: 'Topic' })
    _id: Types.ObjectId;

    @Prop({ type: String })
    name: string;
}

class Attachment {
    @Prop({ type: String })
    title?: string;

    @Prop({ type: String, enum: ['document', 'link', 'image'] })
    type?: 'document' | 'link' | 'image';

    @Prop({ type: String })
    url?: string;

    @Prop({ type: String })
    imageUrl?: string;

    @Prop({ type: String })
    description?: string;
}

@Schema({ versionKey: false, timestamps: true })
export class Discussion extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course' })
    courseContent?: Types.ObjectId;

    @Prop({ type: Grade })
    grade?: Grade;

    @Prop({ type: Subject })
    subject?: Subject;

    @Prop({ type: Topic })
    topic?: Topic;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: [Types.ObjectId], ref: 'Classroom' })
    classRooms?: Types.ObjectId[];

    @Prop([{ type: Attachment }])
    attachments?: Attachment[];

    @Prop({ type: Number, default: 0 })
    viewed?: number;

    @Prop([{ type: Types.ObjectId, ref: 'User' }])
    vote?: Types.ObjectId[];

    @Prop([{ type: Types.ObjectId, ref: 'User' }])
    notVote?: Types.ObjectId[];

    @Prop({ type: Boolean, default: false })
    isComment?: boolean;

    @Prop({ type: Boolean, default: false })
    isReply?: boolean;

    @Prop({ type: Types.ObjectId, ref: 'Discussion' })
    parent?: Types.ObjectId;

    @Prop([{ type: Types.ObjectId, ref: 'Discussion' }])
    comments?: Types.ObjectId[];

    @Prop([{ type: Types.ObjectId, ref: 'User' }])
    savedBy?: Types.ObjectId[];

    @Prop({ type: String, default: '' })
    feedType?: string;

    @Prop({ type: Boolean, default: true })
    active?: boolean;

    @Prop({ type: Boolean, default: true })
    allowComment?: boolean;

    @Prop({ type: Boolean, default: false })
    pin?: boolean;

    @Prop({ type: Boolean, default: false })
    flagged?: boolean;

    @Prop({ type: Number, default: 0 })
    questionNumber?: number;

    @Prop({ type: Types.ObjectId, ref: 'Location' })
    location?: Types.ObjectId;
}

export const DiscussionSchema = SchemaFactory.createForClass(Discussion);
