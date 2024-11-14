import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Region extends AbstractDocument {
  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  active: boolean;
}

export const RegionSchema = SchemaFactory.createForClass(Region);
