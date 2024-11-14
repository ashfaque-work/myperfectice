import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import mongoose, { Types } from "mongoose";

@Schema({ strict: true, minimize: true, timestamps: true })
export class ChatUser extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    user?: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.Mixed })
    sockets?: Map<string, any>;

    @Prop({ type: mongoose.Schema.Types.Mixed })
    rooms?: Map<string, any>;

    @Prop({ type: mongoose.Schema.Types.Mixed })
    read?: Map<string, any>;

    @Prop({ type: Date, default: Date.now })
    updatedAt?: Date;
}
export const ChatUserSchema = SchemaFactory.createForClass(ChatUser)