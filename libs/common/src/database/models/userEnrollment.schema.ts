import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

export interface MyUser {
    _id: string;
    name?: string;
    userInfo?: string;
}

@Schema({ strict: true, minimize: false, autoIndex: false, timestamps: true })
export class UserEnrollment extends AbstractDocument {
    @Prop({ typse: Types.ObjectId })
    item?: Types.ObjectId
    @Prop({ type: Types.ObjectId, ref: 'User' })
    user?: Types.ObjectId;
    @Prop({ type: String, enum: ['public', 'invitation', 'buy'] })
    accessMode?: string
    @Prop({ type: Date })
    expiresOn?: Date
    @Prop({ type: String, enum: ['course', 'testseries', 'practice', 'service'] })
    type?: string
    @Prop({ type: String })
    currency?: string;
    @Prop({ type: Number })
    price?: number
    @Prop({ type: Types.ObjectId, ref: 'Location' })
    location?: Types.ObjectId;

    count?: number
    users?: MyUser[]
}

export const UserEnrollmentSchema = SchemaFactory.createForClass(UserEnrollment)