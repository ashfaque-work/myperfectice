import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true, strict: true, minimize: false, autoIndex: false })
export class AccreditationCourses extends AbstractDocument {
    @Prop({ type: Types.ObjectId })
    subject?: Types.ObjectId;

    @Prop({ type: Types.ObjectId })
    grade?: Types.ObjectId;

    @Prop({ type: String, enum: ['draft', 'published', 'archived'], default: 'draft' })
    status?: string;

    @Prop({ required: true, trim: true, default: '' })
    code: string;

    @Prop({ trim: true, default: '' })
    codeLower?: string;

    @Prop()
    feedback?: string;

    @Prop()
    name?: string;

    @Prop()
    definition?: string;

    @Prop({ default: () => Date.now() })
    createdAt?: Date;

    @Prop({ default: () => Date.now() })
    updatedAt?: Date;

    @Prop([{
        code: String,
        description: String,
        programs: [{
            code: String,
            weightage: { type: Number, default: 0 }
        }]
    }])
    outcomes?: Array<{
        code?: string,
        description?: string,
        programs?: Array<{
            code?: string,
            weightage?: number
        }>
    }>;

    @Prop([{
        evaluationCode: String,
        dataSource: String,
        fileName: String,
        mode: String,
        marks: Number,
        outcomes: [{
            questionWeights: [{
                weight: { type: Number, default: 0 },
                question: String
            }],
            weightage: { type: Number, default: 0 },
            code: String
        }]
    }])
    evaluations?: Array<{
        evaluationCode?: string,
        dataSource?: string,
        fileName?: string,
        mode?: string,
        marks?: number,
        outcomes?: Array<{
            questionWeights?: Array<{
                weight?: number,
                question?: string
            }>,
            weightage?: number,
            code?: string
        }>
    }>;

    @Prop({ default: true })
    active?: boolean;

    @Prop()
    uid?: string;
}

export const AccreditationCoursesSchema = SchemaFactory.createForClass(AccreditationCourses)

AccreditationCoursesSchema.pre<AccreditationCourses>('save', function (next) {
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