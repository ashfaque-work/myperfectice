import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

@Schema({ collection: "KhanAcademy", strict: true, minimize: true, autoIndex: false })
export class KhanAcademy extends AbstractDocument {
    @Prop({ type: String })
    id: string;
    @Prop({ type: String })
    ka_url: string;
    @Prop({ type: String })
    description: string;
    @Prop({ type: String })
    title: string;
    @Prop({ type: String })
    kind: string;
    @Prop({ type: Boolean })
    collapsed: boolean;
    @Prop({
        type: [{
            _id: { type: Types.ObjectId, ref: 'User' },
            id: String,
            children: [],
            ka_url: String,
            description: String,
            kind: String,
            youtube_id: String,
            collapsed: Boolean
        }]
    })
    Children: [
        _id: Types.ObjectId,
        id: string,
        children: [],
        ka_url: string,
        description: string,
        kind: string,
        youtube_id: string,
        collapsed: boolean
    ]
    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;
    @Prop({ type: Date, default: Date.now })
    createdAt: Date
}

export const KhanAcademySchema = SchemaFactory.createForClass(KhanAcademy)