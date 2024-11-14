import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

@Schema({ strict: true, minimize: true, timestamps: true })
export class Certificate extends AbstractDocument {
    @Prop({ type: String })
    title: string;
    @Prop({ type: String })
    description: string;
    @Prop({ type: String })
    imageUrl: string;
    @Prop({ type: Types.ObjectId, ref: 'Courses', required: true })
    course: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    issuedBy: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    issuedTo: Types.ObjectId;
}
export const CertificateSchema = SchemaFactory.createForClass(Certificate)