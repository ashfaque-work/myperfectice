import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';

@Schema({ strict: true, minimize: false, timestamps: true })
export class Feedback extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId
    @Prop({ type: Types.ObjectId, ref: 'PracticeSet' })
    practiceSetId?: Types.ObjectId
    @Prop({ type: Types.ObjectId })
    attemptId?: Types.ObjectId
    @Prop({ type: Types.ObjectId, ref: 'Courses' })
    courseId?: Types.ObjectId
    @Prop()
    idOffline?: String
    @Prop({ type: Types.ObjectId, ref: 'User' })
    owner?: Types.ObjectId
    @Prop({ default: '' })
    comment: String
    @Prop({ default: 0 })
    rating: Number
    @Prop({ type: [{ name: String, value: Boolean }] })
    feedbacks?: {name: String, value: Boolean}[]
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback)