import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

@Schema({ timestamps: true, strict: true, minimize: false, autoIndex: false })
export class Attendance extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'PracticeSet' })
    practicesetId?: Types.ObjectId
    @Prop({ type: Types.ObjectId, ref: 'User' })
    teacherId?: Types.ObjectId
    @Prop({ type: String })
    className?: string
    @Prop({ type: Types.ObjectId, ref: 'Classroom' })
    classId?: Types.ObjectId
    @Prop({ type: Types.ObjectId, ref: 'User' })
    studentId: Types.ObjectId
    @Prop({ type: String })
    name: string
    @Prop({ type: String })
    studentUserId: string
    @Prop({ type: String, enum: ["absent", 'present', 'ready', 'started', 'finished', 'abandoned', 'terminated'], default: 'absent' })
    status?: string
    @Prop({ type: Boolean, default: false })
    admitted?: boolean
    @Prop({ type: Boolean, default: true })
    active?: boolean
    @Prop({ type: Date, default: Date.now() })
    createdAt?: Date
    @Prop({ type: Date, default: Date.now() })
    updatedAt?: Date
    @Prop({ type: String, enum: ['test', 'classroom'], default: 'test' })
    type?: string
    @Prop({ type: Number, default: 0 })
    attemptLimit?: number
    @Prop({ type: Number, default: 0 })
    offscreenLimit?: number
    @Prop([{
        name: String,
        user: { type: Types.ObjectId, ref: 'User' },
        remark: String,
        createdAt: { type: Date, default: Date.now }
    }])
    notes?: {
        name: String,
        user: Types.ObjectId,
        remark: String,
        createdAt: Date
    }[]
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance)