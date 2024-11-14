import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';

@Schema({ strict: true, minimize: false, autoIndex: false, timestamps: true })
export class wbTeacherInfo extends AbstractDocument {
    @Prop()
    subject: string;
    @Prop()
    teacher: string;
    @Prop()
    sessionId: string;
}

export const wbTeacherInfoSchema = SchemaFactory.createForClass(wbTeacherInfo);
