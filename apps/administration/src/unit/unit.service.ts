import { Injectable } from '@nestjs/common';
import { QuestionRepository, SubjectRepository, UnitRepository } from '@app/common';
import {
  UnitRequest, DeleteUnitRequest, GetUnitResponse, GetOneUnitRequest,
  UpdateUnitRequest, GetAllUnitRequest, UpdateUnitStatusRequest, GetUnitsBySubjectRequest,
} from '@app/common/dto/administration/unit.dto';
import { ObjectId } from 'mongodb';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import { Types } from 'mongoose';
import slugify from 'slugify';
import * as mainHelper from '@app/common/helpers/main-helper';
import * as roleHelper from '@app/common/helpers/role-helper';

@Injectable()
export class UnitService {
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly questionRepository: QuestionRepository
  ) { }

  async createUnit(request: UnitRequest) {
    try {
      const { name, subject, code, tags, instancekey } = request;
      let query: any = {};
      if (code) {
        query = { code: code };
      } else {
        query = {
          subject: new Types.ObjectId(subject),
          slugfly: slugify(name, { lower: true })
        };
      }
      // Check if a unit with the provided code exists
      this.unitRepository.setInstanceKey(instancekey);
      let unit = await this.unitRepository.findOne(query);

      if (unit) {
        throw ("Warning, A Unit with this name already exists. Please enter another name/code for your unit.");
      }

      let unitCode = '';
      if (code) {
        unitCode = code.toUpperCase();
      } else {
        const str = name;
        const matches = str.match(/\b(\w)/g);
        const strLength = matches.length;
        const acronym = matches.join('');
        let newCode = acronym.toUpperCase() + mainHelper.getRandomCode(10 - strLength);
        let found = await this.unitRepository.findOne({ code: newCode });

        while (found != null) {
          newCode = acronym + mainHelper.getRandomCode(10 - strLength);
          found = await this.unitRepository.findOne({ code: newCode });
        }
        unitCode = newCode;
      }

      const createdUnit = await this.unitRepository.create({
        name: name,
        subject: new ObjectId(subject),
        code: unitCode,
        slugfly: slugify(name, { lower: true }),
        isAllowReuse: roleHelper.canSeeGlobalContents(request.user.roles) ? 'global' : 'self',
        createdBy: new ObjectId(request.user.id),
        tags: tags ? tags : [],
      });

      // Update corresponding subject document
      this.subjectRepository.setInstanceKey(instancekey);
      await this.subjectRepository.findByIdAndUpdate(
        request.subject,
        { $addToSet: { "units": createdUnit._id }, $set: { lastModifiedBy: new ObjectId(request.user.id) } }
      );

      return createdUnit;
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getUnit(request: GetAllUnitRequest) {
    try {
      const instancekey = request.instancekey;
      const filter: any = {};
      if (request.id) {
        filter._id = { $in: request.id };
      }
      if (request.topics) {
        const topics = request.topics.split(',');
        const objectIdTopics = topics.map(topic => new Types.ObjectId(topic));
        filter.topics = { $in: objectIdTopics };
      }
      if (request.active && typeof request.active === 'string') {
        filter.active = (request.active as string).toLowerCase() === 'true';
      }

      this.unitRepository.setInstanceKey(instancekey);
      const units = await this.unitRepository.find(filter, {}, { sort: { name: 1 } });
      if (!units || units.length === 0) {
        throw ('No Units found!');
      }

      return { response: units };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getOneUnit(request: GetOneUnitRequest): Promise<GetUnitResponse> {
    try {
      const instancekey = request.instancekey;
      this.unitRepository.setInstanceKey(instancekey);
      const unit = await this.unitRepository.findOne({ _id: request._id });
      if (!unit) {
        throw ('Units not found!');
      }

      return { response: unit };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async updateUnit(request: UpdateUnitRequest) {
    try {
      const { _id, name, tags, instancekey } = request;
      const query = {
        slugfly: slugify(name, { lower: true }),
        _id: { $ne: _id }
      };
      this.unitRepository.setInstanceKey(instancekey);
      const existingUnit = await this.unitRepository.findOne(query);
      if (existingUnit) {
        throw ("Warning, A Unit with this name already exists. Please enter another name for your unit.");
      }

      // Update details
      const update = {
        name,
        slugfly: slugify(name, { lower: true }),
        updatedAt: new Date(),
        lastModifiedBy: new ObjectId(request.user.id),
        tags: tags || []
      };
      // Update the unit
      const updatedUnit = await this.unitRepository.findByIdAndUpdate(_id, update, { new: true });

      if (!updatedUnit) {
        throw ("Unit not found");
      }

      // Update corresponding questions if needed
      this.questionRepository.setInstanceKey(instancekey);
      await this.questionRepository.updateMany(
        { "unit._id": updatedUnit._id },
        { $set: { "unit.name": updatedUnit.name } }
      );

      return { response: updatedUnit };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async updateUnitStatus(request: UpdateUnitStatusRequest) {
    try {
      const { _id, active, instancekey } = request;
      // Update details
      const update = {
        active: active,
        updatedAt: new Date(),
        lastModifiedBy: new ObjectId(request.user.id),
      };
      // Update the unit
      this.unitRepository.setInstanceKey(instancekey);
      const updatedUnit = await this.unitRepository.findByIdAndUpdate(_id, update, { new: true });

      if (!updatedUnit) {
        throw ("Unit not found");
      }

      return { response: updatedUnit };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async deleteUnit(request: DeleteUnitRequest) {
    try {
      this.unitRepository.setInstanceKey(request.instancekey);
      const deletedUnit = await this.unitRepository.findOneAndDelete({ _id: request._id });
      if (deletedUnit) {
        return deletedUnit;
      } else {
        throw ('Unit not found');
      }
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getUnitsBySubject(request: GetUnitsBySubjectRequest) {
    try {
      const { subject, page, limit, searchText, instancekey } = request;
      let reqPage = (page) ? page : 1;
      let reqLimit = (limit) ? limit : 20;
      let skip = (reqPage - 1) * reqLimit;
      const filter: any = { subject: new ObjectId(subject), };

      if (searchText) {
        const regexText = new RegExp(searchText, 'i');
        filter.name = regexText;
      }
      this.unitRepository.setInstanceKey(instancekey);
      const units = await this.unitRepository.aggregate([
        { $match: filter },
        { $sort: { name: 1 } },
        { $skip: skip },
        { $limit: reqLimit },
        {
          $project: {
            unitName: '$name',
            updatedAt: 1,
            createdBy: 1,
            active: 1,
            topics: 1,
          },
        },
      ]);

      await Promise.all(
        units.map(async (unit) => {
          unit.topicsCount = unit.topics.length;
          this.questionRepository.setInstanceKey(instancekey);
          unit.questionCount = await this.questionRepository.countDocuments({
            'unit._id': unit._id,
          });
          delete unit.topics;
        }),
      );
      return { response: units };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }
}
