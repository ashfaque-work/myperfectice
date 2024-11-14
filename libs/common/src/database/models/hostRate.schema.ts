import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { Types } from "mongoose";

@Schema({ collection: "hostrates", timestamps: true, strict: true, minimize: false, autoIndex: false })
export class HostRate extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user?: Types.ObjectId;

    @Prop({ type: String, default: '' })
    comment?: string;

    @Prop({ type: Number, default: 0 })
    rating?: number;

    @Prop({ type: Date, default: Date.now })
    createdAt?: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt?: Date;

    wasNew?: boolean;
}

export const HostRateSchema = SchemaFactory.createForClass(HostRate)

HostRateSchema.pre<HostRate>('save', function (next) {
    const document = this as any;

    document.wasNew = document.isNew;
    if (!document.isNew) {
        document.updatedAt = new Date();
    }
    next();
});

// HostRateSchema.post<HostRate>('save', function (doc) {
//     const document = this as any;

//     if (document.wasNew) {
//         const req = getReqInstanceByModel(doc);
//         EventBus.emit('HostRates.Inserted', {
//             req: req,
//             hostrate: {
//                 user: doc.user,
//             },
//         });
//     }
// });