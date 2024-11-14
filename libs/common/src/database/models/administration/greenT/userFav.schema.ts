import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserFav extends AbstractDocument {
    @Prop({ type: Types.ObjectId, required: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true })
    studentId: Types.ObjectId;

    @Prop({ default: Date.now })
    createdAt?: Date;

    @Prop()
    notes: string;
}

export const UserFavSchema = SchemaFactory.createForClass(UserFav);
