import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../../abstract.schema';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false, strict: true, minimize: false })
export class Backpack extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user?: Types.ObjectId;

    @Prop()
    folderName?: string;

    @Prop({
        type: [{
            itemId: { type: Types.ObjectId },
            type: { type: String, required: true },
            title: { type: String },
            comment: { type: String },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        }],
        default: []
    })
    items?: {
        itemId?: Types.ObjectId;
        type?: string;
        title?: string;
        comment?: string;
        createdAt?: Date;
        updatedAt?: Date;
    }[];

    @Prop({ default: true })
    active?: boolean;
}

export const BackpackSchema = SchemaFactory.createForClass(Backpack);
