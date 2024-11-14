import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../../abstract.schema';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Location extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user?: Types.ObjectId;

    @Prop({ required: true })
    name?: string;

    @Prop({ required: true })
    slugfly?: string;

    @Prop()
    description?: string;

    @Prop({ default: true })
    active?: boolean;

    @Prop({ default: false })
    isDefault?: boolean;

    @Prop()
    code?: string;

    @Prop({ type: [Types.ObjectId], ref: "Program" })
    programs?: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: "Subject" })
    subjects?: Types.ObjectId[];

    @Prop()
    specialization?: any[];

    @Prop()
    logo?: string;

    @Prop()
    imageUrl?: string;

    @Prop({ type: [Types.ObjectId], ref: "User" })
    teachers?: Types.ObjectId[];

    @Prop({
        type: {
            assessment: {
                isShow: Boolean,
                allowToCreate: Boolean,
                adaptive: Boolean,
                proctor: Boolean,
                liveBoard: Boolean,
                evaluation: Boolean,
            },
            testSeries: {
                isShow: Boolean,
                allowToCreate: Boolean,
            },
            course: {
                isShow: Boolean,
                allowToCreate: Boolean,
            },
            roles: {
                mentor: Boolean,
                teacher: Boolean,
                operator: Boolean,
            },
            questionBank: Boolean,
            reports: Boolean,
            codeEditor: Boolean,
            classroom: {
                isShow: Boolean,
                assignment: Boolean,
                folder: Boolean,
            },
            general: {
                editProfileSubject: Boolean,
                resume: Boolean,
                chat: Boolean,
                notification: Boolean,
                signup: Boolean,
                sessionMangement: Boolean,
            },
            certificate: {
                name: String,
                template: String,
            },
        },
        default: () => ({}),
    })
    preferences?: Record<string, any>;

    @Prop()
    coverImageUrl?: string;

    @Prop()
    linkedIn?: string;

    @Prop()
    youtube?: string;

    @Prop()
    instagram?: string;

    @Prop()
    facebook?: string;

    @Prop()
    twitter?: string;

    @Prop()
    google?: string;

    @Prop([{
        email: { type: String },
        joined: { type: Boolean, default: false },
        invitationAt: { type: Date },
        joinedAt: { type: Date }
    }])
    invitees?: {
        email: string;
        joined: boolean;
        invitationAt: Date;
        joinedAt: Date;
    }[];

    @Prop({ type: Types.ObjectId, ref: 'User' })
    lastModifiedBy?: Types.ObjectId;

    @Prop({ enum: ['publisher', 'institute'], default: 'institute' })
    type?: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
