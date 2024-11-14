import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../../abstract.schema';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface Country {
    code: string;
    name: string;
}

@Schema({ timestamps: true, versionKey: false })
export class Program extends AbstractDocument {
    @Prop({ required: true })
    name?: string;

    @Prop()
    slugfly?: string;

    @Prop({ default: true })
    active?: boolean;

    @Prop({ type: [Types.ObjectId], ref: 'Subject' })
    subjects?: Types.ObjectId[];
    
    @Prop({ enum: ['global', 'self'], default: 'global' })
    isAllowReuse?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    lastModifiedBy?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy?: Types.ObjectId;

    @Prop()
    uid?: string;

    @Prop({ _id: false, type: [{ type: Object }] })
    countries?: Country[];

    @Prop({ type: Types.ObjectId, ref: 'Location' })
    location?: Types.ObjectId;
}

export const ProgramSchema = SchemaFactory.createForClass(Program);

ProgramSchema.pre('save', function (next) {
    if (this.isNew) {
        if (!this.uid) {
            this.uid = uuidv4();
        }
    } 
    next();
})