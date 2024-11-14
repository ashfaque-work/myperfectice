import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

@Schema({ strict: true, minimize: false, timestamps: true })
export class Favorite extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'PracticeSet' })
    practiceSet: Types.ObjectId
    @Prop({ type: Types.ObjectId })
    itemId?: Types.ObjectId
    @Prop({ type: String, enum: ['content', 'assessment', 'testseries', 'course'] })
    type?: String
    @Prop({ type: [{ _id: { type: Types.ObjectId, ref: 'Subject' }, name: String }] })
    subjects?: [{ _id: string, name: string }];
    @Prop({ type: { _id: { type: Types.ObjectId, ref: 'Courses' }, title: String } })
    course?: { _id: Types.ObjectId, title: string };
    @Prop()
    title?: String
    @Prop()
    description?: String
    @Prop({
        type: {
            type: Types.ObjectId,
            ref: 'Location'
        }
    })
    location?: Types.ObjectId
}
export const FavoriteSchema = SchemaFactory.createForClass(Favorite)