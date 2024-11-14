import { BadRequestException, Injectable } from '@nestjs/common';
import { ServiceRepository, RedisCaching, escapeRegex, UserEnrollmentRepository, Settings } from '@app/common';
import {
  CreateServiceReq, DeleteServiceReq, EditServiceReq, FindServicesReq,
  GetServiceMembersReq,
  GetServiceReq,
  GetTaggingForStudentsReq,
  RevokeServiceReq
} from '@app/common/dto/administration';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class ServiceService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly userEnrollmentRepository: UserEnrollmentRepository,
    private readonly redisCache: RedisCaching,
    private readonly settings: Settings
  ) { }

  async createService(request: CreateServiceReq) {
    try {
      const { title, description, shortDescription, type, imageUrl, duration, durationUnit, highlights, tags, countries, instancekey, user } = request;

      // Validate service name
      this.serviceRepository.setInstanceKey(instancekey);
      const existingService = await this.serviceRepository.findOne({ title });
      if (existingService) {
        throw ('Service name is already in use');
      }

      const newService = {
        title,
        description,
        shortDescription,
        type,
        imageUrl,
        duration,
        durationUnit,
        highlights: highlights || [],
        tags: tags || [],
        active: true,
        user: new Types.ObjectId(user._id),
        lastModifiedBy: new Types.ObjectId(user._id),
        countries: []
      }

      if (countries && countries[0]) {
        newService.countries = countries;
      } else {
        let settings: any = await this.redisCache.getSettingAsync(instancekey)

        let defaultC = settings.countries.find(c => c.default);
        if (!defaultC) {
          defaultC = settings.countries[0];
        }

        newService.countries = [{
          name: defaultC.name,
          code: defaultC.code,
          currency: defaultC.currency,
          price: 0,
          marketPlacePrice: 0,
          discountValue: 0,
        }];
      }

      const createdService = await this.serviceRepository.create(newService);

      return { _id: createdService._id };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getTaggingForStudents(request: GetTaggingForStudentsReq) {
    const { students, instancekey } = request;
    
    if (!students.length || !ObjectId.isValid(students[0])) {
      throw new BadRequestException('Invalid student IDs');
    }

    try {
      let settings: any = await this.redisCache.getSettingAsync(instancekey);
      if (!settings.features.services) {
        return { response: [] };
      }

      this.userEnrollmentRepository.setInstanceKey(instancekey);
      const activeServices = await this.userEnrollmentRepository.aggregate([
        {
          $match: {
            user: { $in: students.map(s => new ObjectId(s)) },
            type: 'service',
            expiresOn: { $gt: new Date() }
          }
        },
        {
          $lookup: {
            from: 'services',
            foreignField: '_id',
            localField: 'item',
            as: 'service'
          }
        },
        { $unwind: '$service' },
        {
          $group: {
            _id: '$user',
            services: {
              $push: {
                _id: '$service._id',
                title: '$service.title',
                type: '$service.type',
                duration: '$service.duration',
                durationUnit: '$service.durationUnit'
              }
            }
          }
        }
      ]);

      return { response: activeServices };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async revokeService(request: RevokeServiceReq) {
    try {
      const { _id, instancekey, user } = request;

      this.serviceRepository.setInstanceKey(instancekey);
      const service = await this.serviceRepository.findById(_id);
      if (!service) {
        return { statusCode: 404, message: 'Service not found' };
      }

      if (service.status !== 'published') {
        return { statusCode: 400, message: 'You can only revoke published service.' };
      }

      if (!user.roles.includes('admin') && !service.user.equals(new Types.ObjectId(user._id))) {
        return { statusCode: 401, message: 'Unauthorized' };
      }

      await this.serviceRepository.updateOne(
        { _id: service._id },
        {
          $set: {
            status: 'revoked',
            statusChangedAt: new Date(),
            lastModifiedBy: new Types.ObjectId(user._id)
          }
        }
      );

      return { statusCode: 200, message: 'Service updated successfully' };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async publishService(request: RevokeServiceReq) {
    try {
      const { _id, instancekey, user } = request;

      this.serviceRepository.setInstanceKey(instancekey);
      const service = await this.serviceRepository.findById(_id);
      if (!service) {
        return { statusCode: 404, message: 'Service not found' };
      }

      if (!user.roles.includes('admin') && !service.user.equals(new Types.ObjectId(user._id))) {
        return { statusCode: 401, message: 'Unauthorized' };
      }

      await this.serviceRepository.updateOne(
        { _id: service._id },
        {
          $set: {
            status: 'published',
            statusChangedAt: new Date(),
            lastModifiedBy: new Types.ObjectId(user._id)
          }
        }
      );

      return { statusCode: 200, message: 'Service updated successfully' };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async editService(request: EditServiceReq) {
    try {
      const { _id, title, description, shortDescription, type, imageUrl, duration, durationUnit, highlights, tags, countries, instancekey, user, status } = request;

      this.serviceRepository.setInstanceKey(instancekey);
      const svc = await this.serviceRepository.findById(_id);

      if (!svc) {
        return { statusCode: 404, message: 'Service not found' };
      }

      const updateData: any = {
        title,
        description,
        shortDescription,
        imageUrl,
        type,
        status,
        duration,
        durationUnit,
        highlights,
        tags,
        countries,
        lastModifiedBy: new Types.ObjectId(user._id),
      };

      if (svc.status !== status) {
        updateData.statusChangedAt = new Date();
      }

      await this.serviceRepository.findByIdAndUpdate(_id, updateData);

      return { statusCode: 200, message: 'Service updated successfully' };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async deleteService(request: DeleteServiceReq) {
    try {
      const { _id, instancekey, user } = request;

      this.serviceRepository.setInstanceKey(instancekey);
      const service = await this.serviceRepository.findOne({ _id: _id });

      if (!service) {
        return { statusCode: 404, message: 'Service not found' };
      }

      if (service.status !== 'draft') {
        return { statusCode: 400, message: 'You can only delete draft service.' };
      }

      if (!user.roles.includes('admin') && !service.user.equals(new Types.ObjectId(user._id))) {
        return { statusCode: 401, message: 'Unauthorized' };
      }

      await this.serviceRepository.findByIdAndDelete(_id);

      return { statusCode: 200, message: 'Service deleted successfully' };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async findServices(request: FindServicesReq) {
    try {
      const { count, skip, limit, searchText, instancekey, user } = request;

      let settings: any = await this.redisCache.getSettingAsync(instancekey);
      if (!settings.features.services) {
        return { response: [] };
      }

      let reqLimit = Number(limit || 10)
      let reqSkip = Number(skip || 0)
      let query: any = {};

      if (!user.roles.includes('admin')) {
        query.status = 'published'
      }

      if (searchText) {
        query.title = new RegExp(escapeRegex(searchText), 'i')
      }

      this.serviceRepository.setInstanceKey(instancekey);
      const services = await this.serviceRepository.find(
        query, null, { limit: reqLimit, skip: reqSkip, sort: { createdAt: -1 } },
        [{ path: 'user', select: 'name roles avatar provider google facebook', options: { lean: true } }]
      );

      for (let s of services) {
        await this.settings.setPriceByUserCountry(request, s)
      }

      if (typeof count === 'string' && count === 'true') {
        const count = await this.serviceRepository.countDocuments(query);
        return { services: services, count };
      }
      return { services: services };

    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async findPublicServices(request: FindServicesReq) {
    try {
      const { count, skip, limit, searchText, instancekey, user } = request;

      let settings: any = await this.redisCache.getSettingAsync(instancekey);
      if (!settings.features.services) {
        return { response: [] };
      }

      let reqLimit = Number(limit || 10)
      let reqSkip = Number(skip || 0)
      let query: any = {};

      query.status = 'published'
      
      if (searchText) {
        query.title = new RegExp(escapeRegex(searchText), 'i')
      }

      this.serviceRepository.setInstanceKey(instancekey);
      const services = await this.serviceRepository.find(
        query, null, { limit: reqLimit, skip: reqSkip, sort: { createdAt: -1 } },
        [{ path: 'user', select: 'name roles avatar provider google facebook', options: { lean: true } }]
      );

      for (let s of services) {
        await this.settings.setPriceByUserCountry(request, s)
      }

      if (typeof count === 'string' && count === 'true') {
        const count = await this.serviceRepository.countDocuments(query);
        return { response: services, count };
      }
      return { response: services };

    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getServiceMembers(request: GetServiceMembersReq) {
    try {
      const { _id, count, skip, limit, searchText, instancekey } = request;

      let reqLimit = Number(limit || 10)
      let reqSkip = Number(skip || 0)

      const matchStage: any = {
        type: 'service',
        item: new ObjectId(_id),
        expiresOn: { $gt: new Date() },
      };

      const pipeline: any[] = [
        { $match: matchStage },
        {
          $lookup: {
            from: 'users',
            let: { uid: '$user' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$uid'] } } },
              { $project: { name: 1, userId: 1, email: 1, avatar: 1, country: 1 } },
            ],
            as: 'userInfo',
          },
        },
        { $unwind: '$userInfo' },
      ];

      if (searchText) {
        pipeline.push({
          $match: {
            $or: [
              { 'userInfo.name': { $regex: escapeRegex(searchText), $options: 'i' } },
              { 'userInfo.userId': { $regex: escapeRegex(searchText), $options: 'i' } },
            ],
          },
        });
      }

      const facet: any = {
        users: [{ $skip: reqSkip }, { $limit: reqLimit }],
      };

      if (typeof count === 'string' && count === 'true') {
        facet.count = [{ $count: 'total' }];
      }

      pipeline.push({ $facet: facet });

      this.userEnrollmentRepository.setInstanceKey(instancekey);
      const results = await this.userEnrollmentRepository.aggregate(pipeline);
      const result = results[0];
      
      if (result.count) {
        result.count = result.count[0] ? result.count[0].total : 0;
      }

      return {users: result.users, count: result.count};
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getTaggingServicesForStudent(request: GetServiceReq) {
    try {
      const { _id, instancekey } = request;

      let settings: any = await this.redisCache.getSettingAsync(instancekey);
      if (!settings.features.services) {
        return { response: [] };
      }

      this.userEnrollmentRepository.setInstanceKey(instancekey);
      const activeServices = await this.userEnrollmentRepository.aggregate([
        {
          $match: {
            user: new ObjectId(_id), 
            type: 'service', 
            expiresOn: { $gt: new Date() }
          }
        },
        {
          $lookup: {
            from: 'services',
            foreignField: '_id',
            localField: 'item',
            as: 'service'
          }
        },
        { $unwind: '$service' },
        {
          $project: {
            _id: '$service._id',
            title: '$service.title',
            type: '$service.type',
            duration: '$service.duration',
            durationUnit: '$service.durationUnit'
          }
        }
      ]);

      if (!activeServices.length) {
        throw ('No services found.')
      }

      return { response: activeServices };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getService(request: GetServiceReq) {
    try {
      const { _id, instancekey } = request;

      this.serviceRepository.setInstanceKey(instancekey);
      const service = await this.serviceRepository.findById(_id);

      if (!service) {
        return { statusCode: 404, message: 'Service not found' };
      }

      return service;
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }
}
