import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';
import { Types } from 'mongoose';

@Schema({
  strict: true,
  minimize: false,
  autoIndex: false,
  timestamps: true,  // This will automatically add createdAt and updatedAt fields
})
export class Device extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  platform: string;

  @Prop()
  deviceUUID?: string;

  @Prop({ required: true })
  deviceToken: string;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

// DeviceSchema.pre<Device>('save', function (next) {
//   this.wasNew = this.isNew;

//   if (!this.isNew) {
//     this.updatedAt = new Date();
//   }

//   next();
// });
