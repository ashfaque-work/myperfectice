import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

@Schema({ toObject: { virtuals: true }, toJSON: { virtuals: true }, timestamps: true, strict: true, minimize: false, autoIndex: false })
export class Articles extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop()
    description?: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    summary: string;

    @Prop()
    link?: string;

    @Prop({ default: 0 })
    viewed?: number;

    @Prop([{ type: String }])
    tags?: string[];

    @Prop([{
        user: { type: Types.ObjectId, ref: 'User' },
        viewDate: { type: Date, default: Date.now }
    }])
    viewership?: Array<{ user: Types.ObjectId, viewDate: Date }>;

    @Prop([{
        user: { type: Types.ObjectId, ref: 'User' },
        rating: { type: Number, default: 0 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }])
    feedbacks?: Array<{
        user: Types.ObjectId,
        rating: number,
        comment: string,
        createdAt: Date,
        updatedAt: Date
    }>;

    @Prop({default: 0})
    avgRating?: number;

    @Prop()
    contentType?: string;

    @Prop([{ type: Types.ObjectId, ref: 'User' }])
    vote?: Types.ObjectId[];

    @Prop([{ type: Types.ObjectId, ref: 'User' }])
    notVote?: Types.ObjectId[];

    @Prop({ type: Date, default: Date.now })
    createdAt?: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt?: Date;

    @Prop({ default: true })
    approved?: boolean; 
    
    @Prop({ default: false })
    isTop?: boolean; 

    @Prop({ default: true })
    active?: boolean; 

    @Prop({ default: null })
    expiresOn?: Date;

    @Prop({ default: false })
    onlyVideo?: boolean; 
}

export const ArticlesSchema = SchemaFactory.createForClass(Articles);