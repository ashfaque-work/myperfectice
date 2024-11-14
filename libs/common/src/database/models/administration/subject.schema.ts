import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../../abstract.schema';
import { Types } from 'mongoose';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true, versionKey: false })
export class Subject extends AbstractDocument {
    @Prop()
    code?: string;

    @Prop({ required: true })
    name: string;

    @Prop({ default: Date.now })
    createdAt?: Date;

    @Prop({ default: Date.now })
    updatedAt?: Date;

    @Prop()
    slugfly?: string;

    @Prop({ type: Boolean, default: true })
    active?: boolean;

    @Prop({ type: [Types.ObjectId], ref: 'Program' })
    programs?: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'Unit' })
    units?: Types.ObjectId[];

    @Prop({ enum: ['global', 'self'], default: 'global' })
    isAllowReuse?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    lastModifiedBy?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy?: Types.ObjectId;

    @Prop()
    uid?: string;

    @Prop({ default: false })
    synced?: boolean;

    @Prop({ default: false })
    adaptive?: boolean;

    @Prop()
    tags?: string[];

    @Prop([{
        name: String,
        value: Number,
        quantity: { type: Number, default: 0 },
        quality: { type: Number, default: 0 }
    }])
    levels?: {
        // _id: Types.ObjectId;
        name: string;
        value: number;
        quantity: number;
        quality: number;
    }[];
    //save where this subject is created
    @Prop({ type: Types.ObjectId, ref: 'Location' })
    location?: Types.ObjectId;

    //Used in aggregation for display only
    unitCount?: number;
    topicCount?: number;
    questionCount?: number;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);

SubjectSchema
    .pre('save', function (next) {
        this.slugfly = slugify(this.name, { lower: true });;
        if (!this.isNew) {
            this.updatedAt = new Date()
        } else {
            if (!this.uid) {
                this.uid = uuidv4();
            }
        }
        next();
    })