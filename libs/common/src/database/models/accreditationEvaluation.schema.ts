import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true, strict: true, minimize: false, autoIndex: false })
export class AccreditationEvaluations extends AbstractDocument {
    @Prop({ required: true, trim: true, default: '' })
    code: string;

    @Prop()
    type?: string;

    @Prop({ trim: true, default: '' })
    codeLower?: string;

    @Prop()
    category?: string;

    @Prop({ default: () => Date.now() })
    createdAt?: Date;

    @Prop()
    mode?: string;

    @Prop({ default: true })
    active?: boolean;

    @Prop({ default: 1 })
    questions?: number;

    @Prop({ default: () => Date.now() })
    updatedAt?: Date;

    @Prop()
    uid?: string;
}

export const AccreditationEvaluationsSchema = SchemaFactory.createForClass(AccreditationEvaluations)

AccreditationEvaluationsSchema.pre<AccreditationEvaluations>('save', function (next) {
    const document = this as any;

    document.codeLower = document.code.toLowerCase();

    if (!document.isNew) {
        document.updatedAt = new Date();
    } else {
        if (!document.uid) {
            document.uid = uuidv4();
        }
    }

    next();
});