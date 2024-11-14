import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Instance extends AbstractDocument {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    dbName: string;

    @Prop({ required: true })
    institute: string;

    @Prop()
    logo: string;

    @Prop()
    address: string;

    @Prop([
        {
            type: {
                name: { type: String },
                phone: { type: String }
            }
        }
    ])
    tpoName: {
        name: string;
        phone: string;
    }[];

    @Prop({ default: true })
    active: boolean;

    @Prop({ required: true })
    tier: number;

    @Prop()
    url: string;

    @Prop({
        type: {
            _id: { type: Types.ObjectId, ref: 'User' },
            name: { type: String }
        }
    })
    region: {
        _id: Types.ObjectId;
        name: string;
    };

    @Prop()
    instanceKey: string;
}

export const InstanceSchema = SchemaFactory.createForClass(Instance);
