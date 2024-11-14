import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

@Schema({strict: true, minimize: false, timestamps: true})
export class UserSuperCoins extends AbstractDocument {
    @Prop({type: Types.ObjectId, ref: 'SuperCoins'})
    activityId?: Types.ObjectId

    @Prop({type: Types.ObjectId, ref: 'User'})
    user?: Types.ObjectId;

    @Prop({enum: ['earned', 'inprocess', 'redeemed', 'rejected']})
    activityType?: string;

    @Prop({default: 0})
    count?: number;

    @Prop()
    coins?: number;

    @Prop()
    studentMsg?: string;

    @Prop()
    teacherMsg?: string;

    @Prop()
    justification?: string;

    @Prop({type: Types.ObjectId, ref: 'User'})
    byAdmin?: Types.ObjectId;

    @Prop({default: true})
    status?: boolean
}

export const UserSuperCoinsSchema = SchemaFactory.createForClass(UserSuperCoins);