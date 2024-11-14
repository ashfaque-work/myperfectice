import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../../abstract.schema';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Unit extends AbstractDocument {
    @Prop({ required: true })
    name: string;
  
    @Prop()
    slugfly?: string;

    @Prop({ default: true })
    active?: boolean;
  
    @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
    subject?: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: 'Topic', required: true })
    topics?: Types.ObjectId[];

    @Prop()
    code?: string;
    
    @Prop({ enum: ['global', 'self'] })
    isAllowReuse?: string;
    
    @Prop()
    uid?: string;
    
    @Prop({ type: Types.ObjectId, ref: 'User' })
    lastModifiedBy?: Types.ObjectId;
    
    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy?: Types.ObjectId;
    
    @Prop({ default: false })
    synced?: boolean;

    @Prop([String])
    tags?: string[];

    //Used in aggregation for display only
    topicsCount?: number;
    questionCount?: number;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);
