import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../../abstract.schema';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Service extends AbstractDocument {
    @Prop({ required: true })
    title: string;

    @Prop()
    description?: string;

    @Prop()
    shortDescription?: string;

    @Prop()
    imageUrl?: string;

    @Prop()
    duration?: number;

    @Prop({ enum: ['year', 'month', 'week', 'day'] })
    durationUnit?: string;

    @Prop({ enum: ['support', 'membership'] })
    type?: string;

    @Prop({
        type: [{
            name: String,
            code: String,
            currency: String,
            price: Number,
            marketPlacePrice: Number,
            discountValue: Number
        }]
    })
    countries?: {
        name: string;
        code: string;
        currency: string;
        price: number;
        marketPlacePrice: number;
        discountValue: number;
    }[];

    @Prop({ type: Types.ObjectId, ref: 'User' })
    user?: Types.ObjectId;

    @Prop([String])
    highlights?: string[];

    @Prop([String])
    tags?: string[];

    @Prop({ type: [Types.ObjectId], ref: 'User' })
    buyers?: Types.ObjectId[];
    
    @Prop({ enum: ['draft', 'published', 'revoked'], default: 'draft' })
    status?: string;
    
    @Prop({ type: Date, default: Date.now })
    statusChangedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    lastModifiedBy?: Types.ObjectId;

    @Prop({ default: true })
    active?: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
