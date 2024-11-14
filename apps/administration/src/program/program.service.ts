import { Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { LocationRepository, ProgramRepository, SubjectRepository } from '@app/common';
import {
  ProgramRequest, DeleteProgramRequest, GetOneProgramRequest, UpdateProgramRequest,
  GetOneProgramResponse, UpdateProgramStatusRequest, GetAllProgramRequest, GetInstProgReq
} from '@app/common/dto/administration/program.dto';
import { ObjectId } from 'mongodb';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import * as roleHelper from '@app/common/helpers/role-helper';
import slugify from 'slugify';
import { Types } from 'mongoose';

@Injectable()
export class ProgramService {
  constructor(
    private readonly programRepository: ProgramRepository,
    private readonly locationRepository: LocationRepository,
    private readonly subjectRepository: SubjectRepository,
  ) { }

  async createProgram(request: ProgramRequest) {
    try {
      const instancekey = request.instancekey;
      const slugfly = slugify(request.name, { lower: true });
      this.programRepository.setInstanceKey(instancekey);
      const existingProgram = await this.programRepository.findOne({ slugfly });
      if (existingProgram) {
        throw new UnprocessableEntityException('A Program with this name already exists. Please enter another name for your Program.');
      }

      const subjectsIds: ObjectId[] = request.subjects.map(id => new ObjectId(id));
      const newProgramRequest: ProgramRequest = {
        name: request.name,
        subjects: subjectsIds,
        slugfly: slugfly,
        countries: request.countries,
        isAllowReuse: roleHelper.canSeeGlobalContents(request.user.roles) ? 'global' : 'self',
        createdBy: new ObjectId(request.user._id),
        location: roleHelper.canOnlySeeLocationContents(request.user.roles) ? new ObjectId(request.user.activeLocation) : undefined,
      };

      var newProgram: any = await this.programRepository.create(newProgramRequest);

      if (request.user.roles.includes('director') && request.user.activeLocation) {
        // add this program to location
        this.locationRepository.setInstanceKey(instancekey);
        await this.locationRepository.updateOne(
          { _id: new ObjectId(request.user.activeLocation) },
          { $addToSet: { programs: newProgram._id } }
        );
      }
      newProgram.subjects = []
      this.subjectRepository.setInstanceKey(instancekey);
      for (const subId of request.subjects) {
        let sub = await this.subjectRepository.findByIdAndUpdate(subId, { $addToSet: { programs: newProgram._id } });
        newProgram.subjects.push({ _id: sub._id, name: sub.name })
      }

      return newProgram;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getProgram(request: GetAllProgramRequest) {
    try {
      const instancekey = request.instancekey;
      let matchQuery: any = request.includeDeactivated ? {} : { active: true };
      if (!request.user.roles.includes('admin') && !request.user.roles.includes('support') && !request.user.roles.includes('publisher')) {
        matchQuery['subjects.0'] = { $exists: true };
      }

      if (request.name) {
        matchQuery.name = {
          $regex: request.name,
          $options: "i"
        };
      }

      let subjectFilter: any = { $expr: { $eq: ['$$sub', '$_id'] } };

      if (!request.includeDeactivated) {
        subjectFilter.active = true;
      }

      if (!request.user.roles.includes('publisher')) {
        let locId = new Types.ObjectId(request.user.activeLocation);

        if (locId) {
          this.locationRepository.setInstanceKey(instancekey);
          let inst = await this.locationRepository.findOne({ _id: locId }, { subjects: 1, programs: 1, isDefault: 1 });
          if (inst.isDefault) {
            matchQuery.isAllowReuse = 'global';
            subjectFilter.isAllowReuse = 'global';
          } else {
            // get only subjects selected by institute
            matchQuery.subjects = {
              $in: inst.subjects
            };
            subjectFilter._id = { $in: inst.subjects };
          }
        } else {
          matchQuery.isAllowReuse = 'global';
          subjectFilter.isAllowReuse = 'global';
        }

        if (!request.user.roles.includes('admin')) {
          let countryCode = request.country || (request.user.country.length > 0 ? request.user.country[0].code : undefined);
          matchQuery.$and = [{ $or: [{ 'countries.0': { $exists: false } }, { 'countries.code': countryCode }] }];
        }
      }
      this.programRepository.setInstanceKey(instancekey);
      let programs = await this.programRepository.aggregate([
        {
          $match: matchQuery
        },
        {
          $sort: { updatedAt: -1, name: 1 }
        },
        {
          $unwind: { path: '$subjects', preserveNullAndEmptyArrays: true }
        },
        {
          $lookup: {
            from: "subjects",
            let: { sub: "$subjects" },
            pipeline: [
              {
                $match: subjectFilter
              },
              {
                $project: {
                  name: 1
                }
              }
            ],
            as: "subInfo"
          }
        },
        {
          $unwind: '$subInfo'
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            active: { $first: '$active' },
            countries: { $first: '$countries' },
            updatedAt: { $first: '$updatedAt' },
            createdBy: { $first: '$createdBy' },
            lastModifiedBy: { $first: '$lastModifiedBy' },
            subjects: {
              $push: '$subInfo'
            }
          }
        },
        {
          $lookup: {
            from: "users",
            let: { uc: "$createdBy" },
            pipeline: [
              {
                $match: {
                  '$expr': {
                    '$eq': ['$_id', '$$uc']
                  }
                }
              },
              {
                $project: {
                  name: 1
                }
              }
            ],
            as: "createdBy"
          }
        },
        {
          $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true }
        },
        {
          $lookup: {
            from: "users",
            let: { ul: "$lastModifiedBy" },
            pipeline: [
              {
                $match: {
                  '$expr': {
                    '$eq': ['$_id', '$$ul']
                  }
                }
              },
              {
                $project: {
                  name: 1
                }
              }
            ],
            as: "lastModifiedBy"
          }
        },
        {
          $unwind: { path: '$lastModifiedBy', preserveNullAndEmptyArrays: true }
        }
      ]);

      return { response: programs };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getOneProgram(request: GetOneProgramRequest): Promise<GetOneProgramResponse> {
    try {
      const instancekey = request.instancekey;
      this.programRepository.setInstanceKey(instancekey);
      let program: any = await this.programRepository.findById(request._id);
      program = await this.programRepository.populate(program, { path: 'subjects', select: 'name _id' })

      if (!program) {
        throw new InternalServerErrorException ('Program not found');
      }

      return { response: program };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async updateProgram(request: UpdateProgramRequest) {
    try {
      const instancekey = request.instancekey;
      const programId = new ObjectId(request._id);
      const slugfly = slugify(request.name, { lower: true });
      const query = { slugfly: slugfly, _id: { $ne: programId } };
      this.programRepository.setInstanceKey(instancekey);
      const existingProgram = await this.programRepository.findOne(query);

      if (existingProgram) {
        throw new InternalServerErrorException ('Warning, A Program with this name already exists. Please enter another name for your Program.');
      }

      const getProgram = await this.programRepository.findById(programId);
      const subjectsIds: ObjectId[] = request.subjects.map(id => new ObjectId(id));
      let oldSubjects: ObjectId[] = [];

      if (getProgram) {
        oldSubjects = getProgram.subjects;
      } else {
        throw new InternalServerErrorException ('Program not found');
      }

      // Find the program and update it
      const updatedProg = await this.programRepository.findByIdAndUpdate(
        programId,
        {
          slugfly: slugfly,
          name: request.name,
          subjects: subjectsIds,
          countries: request.countries,
          updatedAt: Date.now(),
          lastModifiedBy: request.userid,
        },
        { new: true }
      );

      if (!updatedProg) {
        throw new InternalServerErrorException ('Program not found');
      }

      // const toRemove = oldSubjects.filter(i => !subjectsIds.find(j => i.toString() == j.toString()));
      const toRemove = oldSubjects.filter(i => !subjectsIds.find(j => i.toString() === j.toString()));

      this.subjectRepository.setInstanceKey(instancekey);
      if (toRemove.length) {
        await this.subjectRepository.updateMany(
          { _id: { $in: toRemove } },
          { $pull: { programs: programId } },
        );
      }

      await this.subjectRepository.updateMany(
        { _id: { $in: subjectsIds } },
        { $addToSet: { programs: programId }, $set: { lastModifiedBy: request.userid } },
      );

      return { response: updatedProg };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async updateProgramStatus(request: UpdateProgramStatusRequest) {
    try {
      const instancekey = request.instancekey;
      const programId = new ObjectId(request._id);
      const update = {
        active: request.active,
        updatedAt: Date.now(),
        lastModifiedBy: request.userid,
      };
      this.programRepository.setInstanceKey(instancekey);
      const updatedProgram = await this.programRepository.findByIdAndUpdate(
        programId,
        update,
        { new: true }
      );

      if (!updatedProgram) {
        throw new InternalServerErrorException ('Program not found');
      }

      return { response: updatedProgram };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async deleteProgram(request: DeleteProgramRequest) {
    try {
      const instancekey = request.instancekey;
      this.programRepository.setInstanceKey(instancekey);
      const deletedProgram = await this.programRepository.findOneAndDelete({ _id: request._id });
      if (deletedProgram) {
        return deletedProgram;
      } else {
        throw new InternalServerErrorException ('Program not found');
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getInstitutePrograms(request: GetInstProgReq) {
    try {
      const instancekey = request.instancekey;
      this.locationRepository.setInstanceKey(instancekey);
      this.programRepository.setInstanceKey(instancekey);
      const inst = await this.locationRepository.findOne({ _id: request.user.activeLocation });

      let query: any = {
        $or: [
          { subjects: { $in: inst.subjects } },
          { location: inst._id }
        ]
      };

      if (typeof request.includeDeactivated === 'string' && request.includeDeactivated === 'false') {
        query.active = true;
      }

      let programs: any = await this.programRepository.find(query, 'name countries active subjects location createdBy updatedAt lastModifiedBy');
      if (request.subject) {
        programs = await this.programRepository.populate(programs, { path: 'subjects', select: 'name _id', options: { lean: true } });
      }
      programs = await this.programRepository.populate(programs, { path: 'lastModifiedBy', select: 'name _id', options: { lean: true } });
      programs = await this.programRepository.populate(programs, { path: 'createdBy', select: 'name _id', options: { lean: true } });

      return { response: programs };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getPublisherPrograms(request: GetInstProgReq) {
    try {
      const instancekey = request.instancekey;
      this.programRepository.setInstanceKey(instancekey);

      const query: any = {
        $or: [
          { createdBy: new Types.ObjectId(request.user._id) },
          { subjects: { $in: request.user.subjects } }
        ]
      };

      if (typeof request.includeDeactivated === 'string' && request.includeDeactivated === 'false') {
        query.active = true;
      }

      let programs: any = await this.programRepository.find(query, 'name countries active subjects location createdBy updatedAt', { sort: { 'slugfly': 1 } });
      if (request.subject) {
        programs = await this.programRepository.populate(programs, { path: 'subjects', select: 'name _id', options: { lean: true } });
      }
      return { response: programs };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }
}
