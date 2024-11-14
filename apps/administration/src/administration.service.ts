import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  LocationRepository, UsersRepository, ClassroomRepository, getRandomCode, NotificationRepository, isEmail
} from '@app/common';
import {
  LocationRequest, LocationResponse, GetOneLocationRequest, GetOneLocationResponse, UpdateLocationRequest,
  DeleteLocationRequest, GetUserLocationRequest, GetUserLocationResponse, UpdateLocationStatusRequest, ImportLocationReq
} from '@app/common/dto/administration/location.dto';
import { ObjectId } from 'mongodb';
import slugify from 'slugify';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import * as path from 'path';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Types } from 'mongoose';
import { MessageCenter } from '@app/common/components/messageCenter';

@Injectable()
export class AdministrationService {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly userRepository: UsersRepository,
    private readonly classroomRepository: ClassroomRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly messageCenter: MessageCenter
  ) { }

  async createLocation(request: LocationRequest): Promise<LocationResponse> {
    try {
      const instancekey = request.instancekey;
      this.locationRepository.setInstanceKey(instancekey);
      const slugfly = slugify(request.name, { lower: true });
      const query = { slugfly };
      this.locationRepository.setInstanceKey(instancekey);
      const existingLocation = await this.locationRepository.findOne(query);

      if (existingLocation) {
        throw ('A Center with this name already exists. Please enter another name for your Center.');
      }

      this.locationRepository.setInstanceKey(instancekey);
      const location = await this.locationRepository.create({
        name: request.name,
        slugfly,
        isDefault: request.isDefault || false,
        user: new ObjectId(request.user._id)
      });
      return location;
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getLocation(request: LocationRequest) {
    try {
      const instancekey = request.instancekey;
      this.locationRepository.setInstanceKey(instancekey);
      const locations = await this.locationRepository.aggregate([
        {
          $lookup: {
            from: 'classrooms',
            localField: '_id',
            foreignField: 'location',
            as: 'cinfo'
          }
        },
        {
          $unwind: {
            path: '$cinfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            isDefault: 1,
            active: 1,
            classroomId: '$cinfo._id',
            classroomName: '$cinfo.name',
            updatedAt: 1,
            classroomActive: '$cinfo.active',
            studentCount: {
              $cond: [{ $isArray: '$cinfo.students' }, { $size: '$cinfo.students' }, 0]
            },
            teacherCount: {
              $cond: [{ $isArray: '$cinfo.owners' }, { $size: '$cinfo.owners' }, 0]
            }
          }
        },
        {
          $group: {
            _id: '$_id',
            locationName: { $first: '$name' },
            isDefault: { $first: '$isDefault' },
            active: { $first: '$active' },
            locationId: { $first: '$_id' },
            updatedAt: { $first: '$updatedAt' },
            cls: {
              $push: {
                $cond: [
                  '$classroomId',
                  {
                    _id: '$classroomId',
                    name: '$classroomName',
                    studentCount: '$studentCount',
                    teacherCount: '$teacherCount',
                    active: '$classroomActive'
                  },
                  []
                ]
              }
            },
            studentCount: { $sum: '$studentCount' },
            teacherCount: { $sum: '$teacherCount' }
          }
        }
      ]);
      return { response: locations };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getOneLocation(request: GetOneLocationRequest): Promise<GetOneLocationResponse> {
    try {
      const instancekey = request.instancekey;
      this.locationRepository.setInstanceKey(instancekey);
      const location = await this.locationRepository.findById(request._id);

      if (location) {
        return { response: location };
      } else {
        throw ('Location not found');
      }
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async updateLocation(request: UpdateLocationRequest) {
    try {
      const instancekey = request.instancekey;
      this.locationRepository.setInstanceKey(instancekey);
      const locationId = new ObjectId(request._id);
      const query = {
        slugfly: slugify(request.name, { lower: true }),
        _id: {
          $ne: locationId,
        },
      };

      const existingLocation = await this.locationRepository.findOne(query);
      if (existingLocation) {
        throw new InternalServerErrorException('A location with this name already exists. Please enter another name.');
      }

      // Fetch user details using the provided user ID
      this.userRepository.setInstanceKey(instancekey);
      const user = await this.userRepository.findOne({ _id: request.userid });
      if (!user) {
        throw new InternalServerErrorException('User Record Not Found.');
      }

      const update = {
        slugfly: slugify(request.name, { lower: true }),
        name: request.name,
        isDefault: request.isDefault ? request.isDefault : false,
        updatedAt: Date.now(),
        lastModifiedBy: user._id,
      };

      const updatedLocation = await this.locationRepository.findByIdAndUpdate(locationId, update, { new: true });
      if (updatedLocation) {
        return { response: updatedLocation };
      } else {
        throw new InternalServerErrorException('Location not found');
      }
    } catch (error) {
      throw new GrpcInternalException('Failed to update location');
    }
  }

  async updateStatus(request: UpdateLocationStatusRequest) {
    try {
      const instancekey = request.instancekey;
      this.userRepository.setInstanceKey(instancekey);
      this.locationRepository.setInstanceKey(instancekey);
      const locationId = new ObjectId(request._id);

      // Fetch user details using the provided user ID
      const user = await this.userRepository.findOne({ _id: request.userid });
      if (!user) {
        throw new InternalServerErrorException('User Record Not Found.');
      }

      const update = {
        active: request.active,
        updatedAt: Date.now(),
        lastModifiedBy: user._id
      };

      const updatedLocation = await this.locationRepository.findByIdAndUpdate(locationId, update, { new: true });
      if (!updatedLocation) {
        throw new InternalServerErrorException('Location not found');
      }

      // Update related ClassRoom
      this.classroomRepository.setInstanceKey(instancekey);
      await this.classroomRepository.findOneAndUpdate(
        { location: locationId },
        { $set: { active: request.active } },
        { new: true }
      );

      return { response: updatedLocation };

    } catch (error) {
      throw new GrpcInternalException('Failed to update location');
    }
  }

  async deleteLocation(request: DeleteLocationRequest) {
    try {
      const instancekey = request.instancekey;
      this.locationRepository.setInstanceKey(instancekey);
      const deletedLocation = await this.locationRepository.findOneAndDelete({ _id: request._id });
      if (deletedLocation) {
        return deletedLocation;
      } else {
        throw ('Location not found');
      }
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getUserLocation(request: GetUserLocationRequest): Promise<GetUserLocationResponse> {
    try {
      // Fetch user details using the provided user ID
      const instancekey = request.instancekey;
      this.userRepository.setInstanceKey(instancekey);
      this.locationRepository.setInstanceKey(instancekey);
      const user = await this.userRepository.findOne({ _id: request.userid });
      if (!user) {
        throw 'User Record Not Found.';
      }
      const locations = await this.locationRepository.find({ _id: { $in: user.locations } }, { name: 1 });
      const sortedLocations = locations.sort((a, b) => a.name.localeCompare(b.name));
      const locationNames = sortedLocations.map(location => ({ name: location.name }));

      return { response: locationNames };

    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async importLocation(request: ImportLocationReq): Promise<any> {
    const { file, user, instancekey } = request;
    try {
      if (!file) {
        return { code: -1, error: "No file passed" };
      }
      const ext = path.extname(file.originalname);
      if (ext !== '.xls' && ext !== '.xlsx') {
        return { code: -2, error: "Wrong extension type" };
      }

      this.locationRepository.setInstanceKey(instancekey);
      this.classroomRepository.setInstanceKey(instancekey);

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const excelToJson: any = xlsx.utils.sheet_to_json(worksheet);

      const invalidLocation = [];
      const invalidClassroom = [];
      let addedClassroomCount = 0;
      let errorCount = 0;
      const locations = [];
      for (let i = 0; i < excelToJson.length; i++) {
        excelToJson[i] = _.transform(excelToJson[i], (result, val, key) => {
          result[key.toLowerCase()] = val;
        });

        if (excelToJson[i].location && excelToJson[i].classroom) {
          locations.push({ location: excelToJson[i].location, classroom: excelToJson[i].classroom });
        } else {
          invalidLocation.push({ invalid: excelToJson[i].location ?? excelToJson[i].location });
        }
      }

      for (const loc of locations) {
        const query = { slugfly: slugify(loc.location) };
        const location = await this.locationRepository.findOne(query);
        if (location) {
          const locationId = location._id;
          const slugfly = slugify(loc.classroom);
          await this.locationRepository.updateOne(query, { lastModifiedBy: new Types.ObjectId(user._id) });
          const classroom = await this.classroomRepository.findOne({ slugfly, location: locationId });

          if (!classroom) {
            const classModel = {
              seqCode: getRandomCode(6),
              slugfly,
              name: loc.classroom,
              user: new Types.ObjectId(user._id),
              location: locationId,
              students: [],
              stream: false,
              allowDelete: true,
              tags: 'june',
              nameLower: loc.classroom.toLowerCase(),
              active: true,
            };
            await this.classroomRepository.create(classModel);

            addedClassroomCount++;
          } else {
            invalidClassroom.push(loc.classroom);
          }
        } else {
          invalidLocation.push(loc.location);
        }
      }
      errorCount = invalidClassroom.length;

      if (invalidLocation.length > 0) {
        const options = {
          user: user.email,
          invalidLocation,
          invalidClassroom,
          fileName: file.originalname,
          startDate: moment().format('MMM DD, YYYY HH:mm:ss'),
          subject: 'Location upload processing failed',
          addedClassroomCount,
          errorCount,
        };
        await this.sendUploadLocationErrorEmail(request, options);

        throw new InternalServerErrorException({ 'error': 'Due to wrong data in the file, Some Data is lost. Further Information check message center' });
      } else {
        return { message: 'OK' };
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw new GrpcInternalException(error.getResponse())
      }
      throw new GrpcInternalException({ code: 1, data: 'Corupted excel file' })
    }
  }

  private async sendUploadLocationErrorEmail(request: any, options: any) {
    this.notificationRepository.setInstanceKey(request.instancekey);
    await this.notificationRepository.create({
      receiver: new Types.ObjectId(request.user._id),
      type: "notification",
      modelId: "upload user",
      subject: "Location upload processing failed",
    });

    let dataMsgCenter: any = {
      receiver: request.user._id,
      modelId: "uploadUser",
    };

    if (isEmail(options.user)) {
      dataMsgCenter.to = options.user;
      dataMsgCenter.isScheduled = true;
    }

    this.messageCenter.sendWithTemplate(
      request, "location-upload-failed", options, dataMsgCenter
    );
  }
}
