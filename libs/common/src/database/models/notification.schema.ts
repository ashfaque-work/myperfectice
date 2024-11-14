import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

@Schema({ strict: true, minimize: false, autoIndex: false })
export class Notification extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    sender?: Types.ObjectId
    @Prop({ type: Types.ObjectId, ref: "User" })
    receiver?: Types.ObjectId
    @Prop({ type: String })
    to?: string;
    @Prop({ type: String })
    replyto?: string;
    @Prop({ type: String })
    subject?: string;
    @Prop({ type: String })
    message?: string;
    @Prop({ type: String })
    sms?: string;
    @Prop({ type: Types.ObjectId })
    itemId?: Types.ObjectId;
    @Prop({ type: String })
    modelId?: string;
    @Prop({ type: String })
    key?: string;
    @Prop({ type: Boolean, default: false })
    isRead?: boolean;
    @Prop({ type: Date, default: Date.now })
    createdAt?: Date;
    @Prop({ type: Date, default: Date.now })
    updateAt?: Date;
    @Prop({ type: String, enum: ['notification', 'message'], default: 'message' })
    type?: string;
    @Prop({ type: Boolean, default: true })
    isEmail?: boolean;
    @Prop({ type: Boolean, default: false })
    isScheduled?: boolean;
    @Prop({ type: Boolean, default: false })
    isSent?: boolean
    @Prop()
    websiteName?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)