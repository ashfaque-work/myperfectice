import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../../abstract.schema";
import { Types } from "mongoose";

@Schema({ timestamps: true, versionKey: false })
export class Content extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user?: Types.ObjectId;

  @Prop({ required: true })
  title?: string;

  @Prop({ default: "" })
  summary?: string;

  @Prop({ default: "" })
  url?: string;

  @Prop({ default: "" })
  imageUrl?: string;

  @Prop()
  filePath?: string;

  @Prop({ default: 0 })
  viewed?: number;

  @Prop()
  code?: string;

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: "User" },
        viewDate: { type: Date, default: Date.now },
      },
    ],
  })
  viewership?: { user: string; viewDate: Date }[];

  @Prop({ default: 0 })
  avgRating?: number;

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: "User" },
        rating: { type: Number, default: 0 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  })
  feedbacks?: {
    user: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
  }[];

  @Prop({ enum: ["video", "ebook"], default: "video" })
  contentType?: string;

  @Prop()
  provider?: string;

  @Prop()
  uid?: string;

  @Prop([String])
  tags?: string[];

  @Prop({ type: Types.ObjectId, ref: "Location" })
  location?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;

  //used in updateCount API
  totalRating?: number;
  userCount?: number;
}

export const ContentSchema = SchemaFactory.createForClass(Content);