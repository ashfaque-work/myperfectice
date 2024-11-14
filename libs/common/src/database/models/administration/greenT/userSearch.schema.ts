import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserSearch extends AbstractDocument {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ type: Types.ObjectId, required: true })
    user: Types.ObjectId;

    @Prop()
    instanceKey: string;

    @Prop({ default: Date.now })
    createdAt?: Date;

    @Prop({ default: Date.now })
    updatedAt?: Date;

    @Prop({ default: true })
    active: boolean;

    @Prop({ type: [Types.ObjectId], required: true })
    regions: Types.ObjectId[];

    @Prop()
    notes: string;

    @Prop()
    score10th: number;

    @Prop()
    score12th: number;

    @Prop()
    scoreGrad: number;

    @Prop()
    cgpa10th: number;

    @Prop()
    cgpa12th: number;

    @Prop()
    cgpaGrad: number;

    @Prop()
    engg?: number;

    @Prop({ type: [Number] })
    tiers: number[];

    @Prop({ type: [Types.ObjectId], ref: 'Instance' })
    institutes: Types.ObjectId[];

    @Prop({
        type: [
            {
                subject: String,
                scale: String,
            },
        ],
    })
    cognitive: {
        subject: string,
        scale: string,
    }[];

    @Prop({
        type: [
            {
                subject: String,
                scale: String,
            },
        ],
    })
    behavioral: {
        subject: string,
        scale: string,
    }[];

    @Prop({
        type: [
            {
                subject: String,
                scale: String,
            },
        ],
    })
    programming: {
        subject: string,
        scale: string,
    }[];

    @Prop({
        type: [
            {
                grade: String,
                subject: String,
                scale: String,
            },
        ],
    })
    cores: {
        grade: string,
        subject: string,
        scale: string,
    }[];

    @Prop({ type: [String] })
    certifications: string[];
}

export const UserSearchSchema = SchemaFactory.createForClass(UserSearch);

// Add the pre-save hook
// UserSearchSchema.pre<UserSearch>('save', function (next: Function) {
    /*
    * * isNew is not available in Abstract Document, it is from Document of Mongoose
     */
    // if (!this.isNew) {
    //     this.updatedAt = new Date();
    // }
//     next();
// });
