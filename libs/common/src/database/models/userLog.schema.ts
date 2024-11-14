import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import mongoose, { Types } from "mongoose";

@Schema({strict: false, timestamps: true})
export class UserLog extends AbstractDocument {
    @Prop()
    token?: string;

    @Prop({type: Types.ObjectId, ref: 'User', required: true})
    user: Types.ObjectId;

    @Prop({default: 0})
    timeActive?: number;

    @Prop({type: [String]})
    role?: string[];
    // role may be empty string '' when user login using social service, define enum will raise validation error and cannot save log
    // enum: ['student', 'teacher', 'mentor', 'publisher', 'admin']

    @Prop({type: Types.ObjectId, ref: 'PracticeSet'})
    takingPracticeSet?: Types.ObjectId;

    @Prop()
    ip?: string;

    @Prop({type: Types.ObjectId, ref: 'Attempt'})
    attempts?: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.Mixed })
    connectionInfo?: any; /// For mix db type, need to manually mark modified to get it updated: log.markModified('connectionInfo');

    @Prop({ type: mongoose.Schema.Types.Mixed })
    attemptInspect?: any;

    @Prop()
    mobileVersion?: string;

    @Prop({ type: mongoose.Schema.Types.Mixed })
    updateTests?: any;
    // the time user start to use the app.
    // Use this to calculate active time

    @Prop({default: Date.now})
    startTime?: Date;

    @Prop({default: true})
    active?: boolean;

    @Prop({default: false})
    online?: boolean;
}

export const UserLogSchema = SchemaFactory.createForClass(UserLog);