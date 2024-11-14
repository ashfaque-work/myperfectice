import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

@Schema({ strict: true, minimize: false, autoIndex: false })
export class News extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ default: '' })
    description: string;

    @Prop({ default: '' })
    link: string;

    @Prop({ default: '' })
    imageUrl: string;

    @Prop({ default: true })
    active: boolean;
}

export const NewsSchema = SchemaFactory.createForClass(News)