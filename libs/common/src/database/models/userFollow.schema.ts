import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

// [1] is following [2]
@Schema({strict: true, timestamps: true})
export class UserFollow extends AbstractDocument {
    @Prop({type: Types.ObjectId, ref: 'User'})
    userId: Types.ObjectId;                   // [1] who follow i.e., follower

    @Prop({type: Types.ObjectId, ref: 'User'})
    followingId: Types.ObjectId;              // [2] who being followed

    @Prop({default: true})
    status: boolean
}

export const UserFollowSchema = SchemaFactory.createForClass(UserFollow);