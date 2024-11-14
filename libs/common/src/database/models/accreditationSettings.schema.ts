import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true, strict: true, minimize: false, autoIndex: false })
export class AccreditationSettings extends AbstractDocument {
    @Prop({ default: 0 })
    targetLevel: number;

    @Prop({ default: 0 })
    directFactor: number;

    @Prop({ default: 0 })
    indirectFactor: number;

    @Prop({ default: 0 })
    minStudentMarks: number;

    @Prop({ default: () => Date.now() })
    createdAt: Date;

    @Prop({ default: true })
    active: boolean;

    @Prop({ default: () => Date.now() })
    updatedAt: Date;

    @Prop()
    uid: string;
}

export const AccreditationSettingsSchema = SchemaFactory.createForClass(AccreditationSettings)

AccreditationSettingsSchema.pre<AccreditationSettings>('save', function (next) {
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