import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";

@Schema({ strict: true, minimize: false, autoIndex: false })
export class AccreditationReports extends AbstractDocument {
    @Prop({ required: true, trim: true, default: '' })
    name: string;

    @Prop({ trim: true, default: '' })
    description: string;

    @Prop()
    reportAPI: string;

    @Prop({ default: () => Date.now() })
    createdAt: Date;

    @Prop({ type: String, enum: ['n', 'y', 'o'], default: 'n' })
    grade: string;

    @Prop([String])
    roles: string[];

    @Prop({ default: true })
    active: boolean;
}

export const AccreditationReportsSchema = SchemaFactory.createForClass(AccreditationReports)