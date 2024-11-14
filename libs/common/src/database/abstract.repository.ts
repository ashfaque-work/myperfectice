import { ExecutionContext, Logger } from '@nestjs/common';
import { FilterQuery, Model, Types, UpdateQuery, UpdateWriteOpResult, QueryOptions, ProjectionType, AggregateOptions, PopulateOptions, InferId } from 'mongoose';
import { AbstractDocument } from '@app/common';
import { CreateIndexesOptions, DeleteOptions, DeleteResult, ObjectId, UpdateOptions } from 'mongodb';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;
  static instancekey: string = "staging";

  constructor(protected readonly model: any) { }

  async create(doc: Omit<TDocument, '_id'>, options?: QueryOptions<TDocument>): Promise<TDocument> {
    console.log(`Create ${this.constructor.name}>>`, AbstractRepository.instancekey);
    if (!AbstractRepository.instancekey) {
      throw { message: `Instance key not defined for ${this.constructor.name}` };
    }
    const _id = new Types.ObjectId();
    const createdDocument = new this.model[AbstractRepository.instancekey]({
      ...doc,
      _id: new Types.ObjectId(),
    });
    try {
      return (await createdDocument.save(options)).toJSON() as unknown as TDocument;
    } catch (error) {
      this.logger.error('Error creating document:', error);
      throw error;
    }
  }

  async findOne(
    filterQuery: FilterQuery<TDocument>,
    projection?: ProjectionType<TDocument>,
    options: QueryOptions<TDocument> = { lean: true, new: true }
  ): Promise<any> {
    try {
      console.log(`Find One ${this.constructor.name}>>`, AbstractRepository.instancekey);
      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      const document = await this.model[AbstractRepository.instancekey].findOne(filterQuery, projection, options);
      
      return document;
    } catch (error) {
      this.logger.error('Error finding document:', error);
      throw error;
    }
  }


  // async findOneAndUpdatea(filterQuery: FilterQuery<TDocument>, update: UpdateQuery<TDocument>, options?: QueryOptions<TDocument>)
  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options: QueryOptions<TDocument> = { lean: true, new: true }) {
    try {
      console.log(`FindOneUpdate ${this.constructor.name}>>`, AbstractRepository.instancekey);
      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }

      const document = await this.model[AbstractRepository.instancekey].findOneAndUpdate(filterQuery, update, options);
      return document;
    } catch (error) {
      this.logger.error('Error updating document:', error);
      throw error;
    }
  }

  async find(
    filterQuery: FilterQuery<TDocument>,
    projection?: ProjectionType<TDocument>,
    options?: QueryOptions<TDocument>,
    populate?: (string | PopulateOptions)[]
  ) {
    try {
      console.log(`Find ${this.constructor.name}>>`, AbstractRepository.instancekey);
      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }

      let query = this.model[AbstractRepository.instancekey].find(filterQuery, projection, options);

      if (populate) {
        query = query.populate(populate);
      }

      return query.lean();
    } catch (error) {
      this.logger.error('Error finding documents:', error);
      throw error;
    }
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
    options?: QueryOptions<TDocument>
  ): Promise<TDocument | null> {
    try {
      console.log(`FindOneAndDelete ${this.constructor.name}>>`, AbstractRepository.instancekey);

      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }

      return this.model[AbstractRepository.instancekey].findOneAndDelete(filterQuery, options);
    } catch (error) {
      this.logger.error('Error deleting document:', error);
      throw error;
    }
  }

  async createIndex(options: CreateIndexesOptions) {
    if (!AbstractRepository.instancekey) {
      throw { message: `Instance key not defined for ${this.constructor.name}` };
    }
    return this.model[AbstractRepository.instancekey].createIndexes(options as any);
  }

  async countDocuments(filterQuery: FilterQuery<TDocument>): Promise<number> {
    try {
      console.log(`CountDocuments ${this.constructor.name}>>`, AbstractRepository.instancekey);

      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      return await this.model[AbstractRepository.instancekey].countDocuments(filterQuery);
    } catch (error) {
      this.logger.error('Error counting documents:', error);
      throw error;
    }
  }

  async updateMany(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: (UpdateOptions & QueryOptions<TDocument>)
  ): Promise<UpdateWriteOpResult> {
    try {
      console.log(`UpdateMany ${this.constructor.name}>>`, AbstractRepository.instancekey);

      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      return await this.model[AbstractRepository.instancekey].updateMany(filterQuery, update, options);
    } catch (error) {
      this.logger.error('Error updating documents:', error);
      throw error;
    }
  }

  async deleteMany(
    filterQuery: FilterQuery<TDocument>,
    options?: (DeleteOptions & QueryOptions<TDocument>)
  ): Promise<DeleteResult> {
    try {
      console.log(`DeleteMany ${this.constructor.name}>>`, AbstractRepository.instancekey);

      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      return await this.model[AbstractRepository.instancekey].deleteMany(filterQuery, options);
    } catch (error) {
      this.logger.error('Error deleting documents:', error);
      throw error;
    }
  }

  async aggregate(pipeline: any[], options?: AggregateOptions): Promise<TDocument[]> {
    try {
      console.log(`Aggregate ${this.constructor.name}>>`, AbstractRepository.instancekey);

      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      return await this.model[AbstractRepository.instancekey].aggregate(pipeline, options);
    } catch (error) {
      this.logger.error('Error performing aggregation:', error);
      throw error;
    }
  }

  async distinct(field: string, filterQuery?: FilterQuery<TDocument>): Promise<any[]> {
    try {
      console.log(`Distinct ${this.constructor.name}>>`, AbstractRepository.instancekey);

      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      const result = await this.model[AbstractRepository.instancekey].distinct(field, filterQuery);
      return result;
    } catch (error) {
      this.logger.error('Error executing distinct operation: ' + error.message);
      throw error;
    }
  }

  async findByIdAndUpdate(
    id: string | ObjectId,
    update: UpdateQuery<TDocument>,
    options: QueryOptions<TDocument> = { lean: true, new: true }
  ): Promise<TDocument | null> {
    try {
      console.log(`findByIdAndUpdate ${this.constructor.name}>>`, AbstractRepository.instancekey);

      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      const document = await this.model[AbstractRepository.instancekey].findByIdAndUpdate(id, update, options);
      return document;
    } catch (error) {
      this.logger.error('Error updating document:', error);
      throw error;
    }
  }

  async updateOne(
    filter: any,
    update: UpdateQuery<TDocument>,
    options: QueryOptions<TDocument> = { lean: true, new: true }
  ): Promise<TDocument | null> {
    try {
      console.log(`updateOne ${this.constructor.name}>>`, AbstractRepository.instancekey);

      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      const document = await this.model[AbstractRepository.instancekey].findOneAndUpdate(filter, update, options);
      return document;
    } catch (error) {
      this.logger.error('Error updating document:', error);
      throw error;
    }
  }

  async findById(id: string | ObjectId, 
    projection?: ProjectionType<TDocument>, 
    options: QueryOptions<TDocument> = { lean: true, new: true },
    populate?: (string | PopulateOptions)[]): Promise<TDocument | null> {
    try {
      console.log(`findById ${this.constructor.name}>>`, AbstractRepository.instancekey);

      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      var document = await this.model[AbstractRepository.instancekey].findById(id, projection, options);
      if(populate){
        document.populate(populate);
      }
      return document;
    } catch (error) {
      this.logger.error('Error finding document by id:', error);
      throw error;
    }
  }

  async hydrate(document: TDocument): Promise<TDocument> {
    try {
      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      return this.model[AbstractRepository.instancekey].hydrate(document);
    } catch (error) {
      this.logger.error('Error hydrating document:', error);
      throw error;
    }
  }

  async populate(
    document: TDocument | TDocument[],
    populateOptions: PopulateOptions | Array<PopulateOptions> | string
  ): Promise<TDocument | TDocument[]> {
    try {
      console.log(`populate ${this.constructor.name}>>`, AbstractRepository.instancekey);

      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      return await this.model[AbstractRepository.instancekey].populate(document, populateOptions);
    } catch (error) {
      this.logger.error('Error populating document:', error);
      throw error;
    }
  }

  async exists(filterQuery: FilterQuery<TDocument>): Promise<boolean | { _id: InferId<TDocument> } | null> {
    try {
      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      return await this.model[AbstractRepository.instancekey].exists(filterQuery);
    } catch (error) {
      this.logger.error('Error checking document existence:', error);
      throw error;
    }
  }

  async findByIdAndDelete(id: string | ObjectId, options?: QueryOptions<TDocument>): Promise<TDocument | null> {
    try {
      console.log(`findByIdAndDelete ${this.constructor.name}>>`, AbstractRepository.instancekey);

      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      const filterQuery = { _id: id };
      return await this.model[AbstractRepository.instancekey].findByIdAndDelete(filterQuery, options);
    } catch (error) {
      this.logger.error('Error deleting document by ID:', error);
      throw error;
    }
  }


  async findOneAndReplace(
    filterQuery: FilterQuery<TDocument>,
    updateQuery: UpdateQuery<TDocument>,
    options?: QueryOptions<TDocument>
  ): Promise<TDocument | null> {
    try {
      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
      const replacedDocument = await this.model[AbstractRepository.instancekey].findOneAndUpdate(filterQuery, updateQuery, options);
      return replacedDocument;
    } catch (error) {
      this.logger.error('Error replacing document:', error);
      throw error;
    }
  }

  async insertMany(documents: TDocument[], options?: QueryOptions<TDocument>): Promise<TDocument[]> {
    try {
      if (!AbstractRepository.instancekey) {
        throw new Error(`Instance key not defined for ${this.constructor.name}`);
      }

      const insertedDocuments = await this.model[AbstractRepository.instancekey].insertMany(documents, options);

      return insertedDocuments;
    } catch (error) {
      this.logger.error('Error inserting documents:', error);
      throw new Error(`Error inserting documents: ${error.message}`);
    }
  }

  async saveDiscussion(discussion: any): Promise<any> {
    try {
      if (!AbstractRepository.instancekey) {
        throw `Instance key not defined for ${this.constructor.name}`;
      }
      const model = new this.model[AbstractRepository.instancekey].Discussion(discussion);
      const savedDiscussion = await model.save();
      return savedDiscussion;
    } catch (error) {
      this.logger.error('Error saving discussion:', error);
      throw error;
    }
  }
  async findByIdAndSave(
    id: string | ObjectId,
    update: UpdateQuery<TDocument>
  ): Promise<TDocument | null> {
    try {
      console.log(`findByIdAndSave ${this.constructor.name}>>`, AbstractRepository.instancekey);
  
      if (!AbstractRepository.instancekey) {
        throw { message: `Instance key not defined for ${this.constructor.name}` };
      }
  
      // Find the document by ID
      const document = await this.model[AbstractRepository.instancekey].findById(id);
      if (!document) {
        return null;  // Document not found
      }
        console.log(update)
      // Apply the updates directly on the document instance
      Object.assign(document, update);
  
      // Save the document to trigger the 'pre' save hooks
      await document.save();
      
      return document;
    } catch (error) {
      this.logger.error('Error saving document:', error);
      throw error;
    }
  }
  

}
