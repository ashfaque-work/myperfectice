import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

@Schema({ strict: true, minimize: false, collection: 'mapping' })
export class Mapping extends AbstractDocument {
    @Prop({ type: String })
    provider: string
    @Prop({ type: Types.ObjectId, required: true })
    providerId: Types.ObjectId
    @Prop({ type: String })
    nameFromProvider: string
    @Prop({ type: Types.ObjectId, ref: 'Topic', required: true })
    perfecticeId: Types.ObjectId
    @Prop({ type: Date, default: Date.now })
    createdAt: Date
    @Prop({ type: Date, default: Date.now })
    updatedAt: Date
}

export const MappingSchema = SchemaFactory.createForClass(Mapping)