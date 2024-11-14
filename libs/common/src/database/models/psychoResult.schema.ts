import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { SchemaType, SchemaTypes, Types } from "mongoose";

@Schema({ timestamps: true, strict: true, minimize: false, autoIndex: false })
export class PsychoResult extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'PracticeSet', required: true })
    practiceset: Types.ObjectId;
    @Prop({ type: Date, default: Date.now })
    createdAt: Date;
    @Prop([{ domain: String }, { facet: Number }, { score: Number }])
    answers: { domain: string, facet: number, score: number }[]
    @Prop({ type: SchemaTypes.Mixed })
    analysis: any
    @Prop({ type: Types.ObjectId, ref: 'ClassRoom' })
    classrooms: Types.ObjectId
}

export const PsychoResultSchema = SchemaFactory.createForClass(PsychoResult)