import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import mongoose, { Types } from "mongoose";

@Schema({ strict: true, minimize: true, timestamps: true })
export class ChatRoom extends AbstractDocument {
    @Prop({ type: String, required: true, unique: true })
    uid?: string;

    @Prop({ type: [mongoose.Schema.Types.Mixed] })
    messages?: Types.DocumentArray<any>;

    @Prop({ type: Boolean, default: false })
    disabled?: boolean;

    @Prop({ type: Boolean, default: false })
    hidden?: boolean;
}
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom)