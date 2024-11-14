import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";

@Schema({ timestamps: true, strict: true, minimize: false, autoIndex: false })
export class AccreditationAttainments extends AbstractDocument {
    @Prop({ default: "", trim: true })
    course: string;

    @Prop({ default: true })
    status: boolean;

    @Prop({ default: true })
    active: boolean;

    @Prop({ type: [Object], default: [] })
    courseOutcomes: any[];

    @Prop({ type: [Object], default: [] })
    programOutcomes: any[];

    @Prop({ default: () => Date.now() })
    createdAt: Date;

    @Prop({ default: () => Date.now() })
    updatedAt: Date;
}

export const AccreditationAttainmentsSchema = SchemaFactory.createForClass(AccreditationAttainments)

AccreditationAttainmentsSchema.pre<AccreditationAttainments>('save', function (next) {
    const document = this as any;

    document.codeLower = document.code.toLowerCase();

    if (!document.isNew) {
        document.updatedAt = new Date();
    }

    next();
});