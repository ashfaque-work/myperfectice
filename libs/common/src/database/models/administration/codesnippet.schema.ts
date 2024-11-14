import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../../abstract.schema";
import { Types } from "mongoose";

@Schema({ strict: true, timestamps: true })
export class Codesnippet extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user?: Types.ObjectId;

    @Prop({ type: String, required: true })
    title?: string;

    @Prop()
    description?: string;

    @Prop()
    language?: string;

    @Prop({ required: true })
    uid?: string;

    @Prop()
    tags?: string[];

    @Prop()
    code?: string;

    @Prop({ default: false })
    pairCoding?: boolean;

    @Prop({ default: true })
    active?: boolean;
}
export const CodesnippetSchema = SchemaFactory.createForClass(Codesnippet)