import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';
import { AbstractDocument } from '../../abstract.schema';

@Schema({
    timestamps: true,
    strict: true,
    minimize: false,
})
export class AttemptSubmission extends AbstractDocument {
    @Prop({
        type: String,
        enum: ["draft", "processing", "processed"],
        default: 'draft'
    })
    status: string;

    @Prop({ type: String })
    error: string;

    @Prop({ type: Types.ObjectId, ref: 'Attempt' })
    attemptId: Types.ObjectId;

    @Prop({ type: Boolean, default: false })
    processed: boolean;

    @Prop({ type: MongooseSchema.Types.Mixed })
    data: any;

    @Prop({ type: [{ type: MongooseSchema.Types.Mixed }] })
    userAnswers: any[];
}

export const AttemptSubmissionSchema = SchemaFactory.createForClass(AttemptSubmission);
