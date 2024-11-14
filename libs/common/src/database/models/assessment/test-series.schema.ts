import { getRandomCode } from '@app/common/helpers';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AbstractDocument } from '../../abstract.schema';

@Schema({ timestamps: true, collection: 'testseries' })
export class TestSeries extends AbstractDocument {
    @Prop({ type: String })
    title: string;

    @Prop([{ _id: { type: Types.ObjectId, ref: 'Subject' }, name: String }])
    subjects: { _id: Types.ObjectId; name: string }[];

    @Prop([{ practicesetId: { type: Types.ObjectId, ref: 'PracticeSet' }, order: Number, createdAt: { type: Date, default: Date.now } }])
    praticeinfo?: { practicesetId: Types.ObjectId; order: number; createdAt: Date }[];

    @Prop({ type: [Types.ObjectId], ref: 'PracticeSet' })
    practiceIds?: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'ClassRoom' })
    classrooms?: Types.ObjectId[];

    @Prop([{
        _id: false,
        code: { type: String, default: 'IN' },
        name: { type: String, default: 'India' },
        currency: { type: String, default: 'INR' },
        price: { type: Number, default: 0 },
        marketPlacePrice: { type: Number, default: 0 },
        discountValue: { type: Number, default: 0 },
    }])
    countries: { code: string; name: string; currency: string; price: number; marketPlacePrice: number; discountValue: number }[];

    @Prop({ type: Types.ObjectId, ref: 'User' })
    user: Types.ObjectId;

    @Prop({ type: Date, default: Date.now })
    statusChangedAt?: Date;

    @Prop({ type: Boolean, default: true })
    enableOrdering?: boolean;

    @Prop({ type: String, enum: ['draft', 'published', 'revoked', 'expired'], default: 'draft' })
    status?: string;

    @Prop({ type: Date, default: null })
    startDate?: Date;

    @Prop({ type: Date, default: null })
    expiresOn?: Date;

    @Prop({ type: String, default: '' })
    description?: string;

    @Prop({ type: String, default: '' })
    includes?: string;

    @Prop({ type: String, enum: ['public', 'invitation', 'buy'], default: 'public' })
    accessMode?: string;

    @Prop({ type: Boolean, default: false })
    favorite?: boolean;

    @Prop({ type: String, enum: ['school', 'bachelors', 'masters', 'open'] })
    level?: string;

    @Prop({ type: Number })
    rating?: number;

    @Prop({ type: String, default: 0, min: 0 })
    attemptAllowed?: number;

    @Prop({ type: String })
    videoUrl?: string;

    @Prop({ type: [String] })
    enabledCodeLang?: string[];

    @Prop({ type: String })
    colorCode?: string;

    @Prop({ type: String })
    imageUrl: string;

    @Prop({ type: String })
    summary: string;

    @Prop({ type: Boolean, default: true })
    active?: boolean;

    @Prop([{ item: Types.ObjectId, user: Types.ObjectId }])
    buyers?: { item: Types.ObjectId; user: Types.ObjectId }[];

    @Prop({ type: Number })
    duration?: number;

    @Prop({ type: String, default: '' })
    testseriesCode?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    lastModifiedBy: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: 'User' })
    instructors?: Types.ObjectId[];

    @Prop({ type: Number })
    totalEnrollUsers?: number;

    @Prop({ type: String })
    uid?: string;

    @Prop({ type: Boolean, default: false })
    synced?: boolean;

    @Prop({ type: [Types.ObjectId], ref: 'Location' })
    locations: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'User' })
    owner?: Types.ObjectId;

    @Prop({ enum: ['publisher', 'institute'] })
    origin: string;
}

export const TestSeriesSchema = SchemaFactory.createForClass(TestSeries);

TestSeriesSchema.pre('save', function (next) {
    if (!this.testseriesCode) {
        this.testseriesCode = getRandomCode(6);
    }

    if (this.isNew) {
        if (!this.uid) {
            this.uid = uuidv4();
        }
    }
    next();
});
