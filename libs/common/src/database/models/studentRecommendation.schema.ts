import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

@Schema({ strict: true, minimize: false, autoIndex: false, collection: 'StudentRecommendations' })
export class StudentRecommendation extends AbstractDocument{
    @Prop({ type: String })
    name: string;
    @Prop({ type: String, lowercase: true })
    email: string;
    @Prop({ type: String })
    phoneNumber: string;
    @Prop({ type: String, enum: ['male', 'female'] })
    gender: string;
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    user: Types.ObjectId
    @Prop({ type: Types.ObjectId, ref: 'Attempt', required: true })
    attempt: Types.ObjectId
    @Prop({ type: String, default: '' })
    interest: string;
    @Prop({ type: String })
    city: string;
    @Prop({ type: String })
    district: string;
    @Prop({ type: String, default:'' })
    state: string
    @Prop({ type: Date })
    birthdate: Date
    @Prop({ type: []})
    recommendation: []
    @Prop({ type: String, default: '' })
    knowAboutUs: string;
    @Prop({ type: Date, default: Date.now })
    createdAt: Date
    @Prop({ type: Date, default: Date.now })
    updatedAt: Date
}

export const StudentRecommendationSchema = SchemaFactory.createForClass(StudentRecommendation)