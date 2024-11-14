import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../../abstract.schema";
import { Types } from "mongoose";

@Schema({ timestamps: true, versionKey: false })
export class File extends AbstractDocument {
  @Prop({ required: true })
  type: string;

  @Prop()
  fileName?: string;

  @Prop()
  originalName?: string;

  @Prop()
  fileUrl?: string;

  @Prop({ required: true })
  path: string;

  @Prop({ type: Types.ObjectId, ref: "File" })
  parentId?: Types.ObjectId;

  @Prop({ default: 'full' })
  thumbType?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  size?: number;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  ownerId?: Types.ObjectId;

  @Prop({ default: false })
  isActive?: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
