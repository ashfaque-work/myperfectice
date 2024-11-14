import { Injectable } from '@nestjs/common';
import { AttemptDetailRepository, QuestionRepository, TopicRepository, UnitRepository } from '@app/common';
import {
  TopicRequest, DeleteTopicRequest, GetTopicResponse, GetOneTopicRequest, UpdateTopicRequest,
  GetAllTopicRequest, UpdateTopicStatusRequest, GetTopicBySlugRequest, GetTopicByUnitRequest
} from '@app/common/dto/administration/topic.dto';
import { ObjectId } from 'mongodb';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import { Types } from 'mongoose';
import slugify from 'slugify';
import * as roleHelper from '@app/common/helpers/role-helper';

@Injectable()
export class TopicService {
  constructor(private readonly topicRepository: TopicRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly attemptDetailsRepository: AttemptDetailRepository,
    private readonly unitRepository: UnitRepository
  ) { }

  async createTopic(request: TopicRequest) {
    try {
      const { name, unit, tags, instancekey } = request;
      let query = {
        slugfly: slugify(name, { lower: true }),
        unit: new Types.ObjectId(unit)
      };

      // Check if a unit with the provided code exists
      this.topicRepository.setInstanceKey(instancekey);
      let existingTopic = await this.topicRepository.findOne(query);

      if (existingTopic) {
        throw ("Warning, A Topic with this name already exists. Please enter another name for your topic.");
      }

      const createdTopic = await this.topicRepository.create({
        name: name,
        unit: new ObjectId(unit),
        slugfly: slugify(name, { lower: true }),
        isAllowReuse: roleHelper.canSeeGlobalContents(request.user.roles) ? 'global' : 'self',
        createdBy: new ObjectId(request.user.id),
        tags: tags ? tags : [],
      });

      // Update corresponding unit document
      this.unitRepository.setInstanceKey(instancekey);
      await this.unitRepository.findByIdAndUpdate(
        request.unit,
        {
          $addToSet: { "topics": createdTopic._id },
          $set: { lastModifiedBy: new ObjectId(request.user.id) }
        }
      );

      return createdTopic;
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getTopic(request: GetAllTopicRequest) {
    try {
      const instancekey = request.instancekey;
      const filter: any = {};
      if (request.id) {
        filter._id = { $in: request.id };
      }
      if (request.units) {
        const units = request.units.split(',');
        const objectIdUnits = units.map(unit => new Types.ObjectId(unit));
        filter.units = { $in: objectIdUnits };
      }
      if (request.active && typeof request.active === 'string') {
        filter.active = (request.active as string).toLowerCase() === 'true';
      }

      this.topicRepository.setInstanceKey(instancekey);
      const topics = await this.topicRepository.find(filter, {}, { sort: { name: 1 } });
      if (!topics || topics.length === 0) {
        throw ('No Topics found!');
      }

      return { response: topics };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getOneTopic(request: GetOneTopicRequest): Promise<GetTopicResponse> {
    try {
      const instancekey = request.instancekey;
      this.topicRepository.setInstanceKey(instancekey);
      const topic = await this.topicRepository.findOne({ _id: request._id });
      if (!topic) {
        throw ('Topics not found!');
      }

      return { response: topic };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async updateTopic(request: UpdateTopicRequest) {
    try {
      const { _id, name, tags, instancekey } = request;
      const query = {
        slugfly: slugify(name, { lower: true }),
        _id: { $ne: _id }
      };
      this.topicRepository.setInstanceKey(instancekey);
      const existingTopic = await this.topicRepository.findOne(query);
      if (existingTopic) {
        throw ("Warning, A Topic with this name already exists. Please enter another name for your topic.");
      }

      // Update details
      const update = {
        name,
        slugfly: slugify(name, { lower: true }),
        updatedAt: new Date(),
        lastModifiedBy: new ObjectId(request.user.id),
        tags: tags || []
      };
      // Update the topic
      const updatedTopic = await this.topicRepository.findByIdAndUpdate(_id, update, { new: true });

      if (!updatedTopic) {
        throw ("Topic not found");
      }

      // Update corresponding questions if needed
      this.questionRepository.setInstanceKey(instancekey);
      await this.questionRepository.updateMany(
        { "unit._id": updatedTopic._id },
        { $set: { "unit.name": updatedTopic.name } }
      );

      // Invoke function to update attempted questions
      await this.updateAttemptedQuestionTopic(request);

      return { response: updatedTopic };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async updateAttemptedQuestionTopic(request: UpdateTopicRequest) {
    this.attemptDetailsRepository.setInstanceKey(request.instancekey);
    await this.attemptDetailsRepository.updateMany(
      { "QA.topic._id": new Types.ObjectId(request._id) },
      { $set: { "QA.$.topic.name": request.name } }
    );
  }

  async updateTopicStatus(request: UpdateTopicStatusRequest) {
    try {
      const { _id, active, instancekey } = request;
      // Update details
      const update = {
        active: active,
        updatedAt: new Date(),
        lastModifiedBy: new ObjectId(request.user.id),
      };
      // Update the topic
      this.topicRepository.setInstanceKey(instancekey);
      const updatedTopic = await this.topicRepository.findByIdAndUpdate(_id, update, { new: true });

      if (!updatedTopic) {
        throw ("Topic not found");
      }

      return { response: updatedTopic };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async deleteTopic(request: DeleteTopicRequest) {
    try {
      const { _id, user, instancekey } = request;
      this.topicRepository.setInstanceKey(instancekey);
      this.unitRepository.setInstanceKey(instancekey);
      const updatedTopic = await this.topicRepository.findByIdAndUpdate(
        _id,
        {
          active: false,
          lastModifiedBy: new ObjectId(user.id),
        }
      );
      if (!updatedTopic) {
        throw ('Topic not found');
      }
      await this.unitRepository.updateMany(
        { topics: updatedTopic._id },
        {
          $pull: { topics: updatedTopic._id },
          $set: { lastModifiedBy: new ObjectId(user.id) },
        }
      );

      return updatedTopic;
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getTopicBySlug(request: GetTopicBySlugRequest): Promise<GetTopicResponse> {
    try {
      let query = {
        slugfly: slugify(request.slug, { lower: true }),
        unit: new ObjectId(request.unit)
      };
      const instancekey = request.instancekey;
      this.topicRepository.setInstanceKey(instancekey);
      const topic = await this.topicRepository.findOne(query);
      if (!topic) {
        throw ('Topics not found!');
      }

      return { response: topic };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getTopicByUnit(request: GetTopicByUnitRequest) {
    try {
      const { unitId, page, limit, searchText, instancekey } = request;
      let reqPage = (page) ? page : 1;
      let reqLimit = (limit) ? limit : 20;
      let skip = (reqPage - 1) * reqLimit;
      const filter: any = { unit: new ObjectId(unitId), };

      if (searchText) {
        const regexText = new RegExp(searchText, 'i');
        filter.name = regexText;
      }
      this.topicRepository.setInstanceKey(instancekey);
      const topics = await this.topicRepository.aggregate([
        { $match: filter },
        { $sort: { name: 1 } },
        { $skip: skip },
        { $limit: reqLimit },
        {
          $project: {
            topicName: '$name',
            updatedAt: 1,
            createdBy: 1,
            active: 1,
          },
        },
      ]);

      await Promise.all(
        topics.map(async (topic) => {
          this.questionRepository.setInstanceKey(instancekey);
          topic.questionCount = await this.questionRepository.countDocuments({
            'topic._id': topic._id,
          });
        }),
      );
      return { response: topics };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

}
