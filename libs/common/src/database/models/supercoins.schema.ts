import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

@Schema({strict: true, minimize: false, timestamps: true})
export class SuperCoins extends AbstractDocument {
    @Prop()
    title?: string;

    @Prop({default: true})
    status?: boolean;

    @Prop()
    summary?: string;

    @Prop()
    value?: number;

    @Prop({enum: ['rule', 'offer']})
    type?: string;

    @Prop({enum: ['course', 'testseries', 'practice'] })
    tags?: string;

    @Prop({enum: ['assessment', 'course', 'testseries', 'comment', 'like', 'question']})
    mode?: string;

    @Prop({type: Types.ObjectId, ref: 'User'})
    lastModifiedBy?: Types.ObjectId;

    @Prop({type: Types.ObjectId, ref: 'User'})
    createdBy?: Types.ObjectId;
}

export const SuperCoinsSchema = SchemaFactory.createForClass(SuperCoins);