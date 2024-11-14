import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../../abstract.schema';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Topic extends AbstractDocument {
    @Prop({ required: true })
    name: string;
  
    @Prop()
    slugfly: string;
  
    @Prop({ type: Types.ObjectId, ref: 'Unit', required: true })
    unit?: Types.ObjectId;
  
    @Prop({ default: true })
    active?: boolean;
  
    @Prop()
    uid?: string;
  
    @Prop({ default: false })
    synced?: boolean;
  
    @Prop({ enum: ['global', 'self'] })
    isAllowReuse?: string;
  
    @Prop({ type: Types.ObjectId, ref: 'User' })
    lastModifiedBy?: Types.ObjectId;
  
    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy?: Types.ObjectId;
  
    @Prop([String])
    tags?: string[];

    questionCount?: number;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
