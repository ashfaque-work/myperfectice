import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';
import { Types, Date } from 'mongoose';


@Schema({ versionKey: false, timestamps: true })
export class WhiteboardLog extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: Date, default: Date.now })
    createdAt?: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt?: Date;

    @Prop()
    ip: string;

    @Prop({ type: Types.ObjectId, ref: 'Classroom' })
    classroom?: Types.ObjectId;

    @Prop()
    status?: string;
}

export const WhiteboardLogSchema = SchemaFactory.createForClass(WhiteboardLog);
