import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types, Document, PopulateOptions, MergeType, AnyObject, Model } from 'mongoose';

@Schema()
export class AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  /** Boolean flag specifying if the document is new. */
  // isNew?: boolean;

  // /** Populates document references. */
  // async populate?<Paths = any>(path: string | PopulateOptions | (string | PopulateOptions)[]): Promise<this>;
  // async populate?<Paths = any>(
  //   path: string,
  //   select?: string | any,
  //   model?: Model<any>,
  //   match?: any,
  //   options?: PopulateOptions
  // ): Promise<this> {
  //   return this;
  // }
}
