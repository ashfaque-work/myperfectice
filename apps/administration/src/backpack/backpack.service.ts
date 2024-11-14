import { Injectable } from '@nestjs/common';
import { BackpackReq, DeleteBackpackReq, UpdateBackpackReq } from '@app/common/dto/administration';
import { ObjectId } from 'mongodb';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import { Types } from 'mongoose';
import { BackpackRepository } from '@app/common';

@Injectable()
export class BackpackService {
  constructor(
    private readonly backpackRepository: BackpackRepository
  ) { }

  async getBackpack(request: BackpackReq) {
    try {
      const active = {
        $or: [{ active: { $exists: false } }, { active: true }],
      };
      this.backpackRepository.setInstanceKey(request.instancekey);
      const result = await this.backpackRepository.find(
        { user: new Types.ObjectId(request.user._id), ...active }
      );

      return { response: result };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async updateBackpack(request: UpdateBackpackReq) {
    try {
      const { _id, folderName, items } = request;

      this.backpackRepository.setInstanceKey(request.instancekey);
      const active = {
        $or: [
          { "active": { $exists: false } },
          { "active": true }
        ]
      };

      const existingBackpack = await this.backpackRepository.findOne({
        folderName: folderName, ...active
      });

      if (existingBackpack) {
        return { message: 'Folder Name already exists' };
      }

      const updateResult = await this.backpackRepository.findOneAndUpdate(
        { _id: _id },
        {
          folderName: folderName,
          $set: { items: items },
          updatedAt: new Date()
        },
        { new: true },
      );

      if (!updateResult) {
        return { message: 'Failed to update backpack' };
      }

      return updateResult;
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async deleteBackpack(request: DeleteBackpackReq) {
    try {
      this.backpackRepository.setInstanceKey(request.instancekey);
      const result = await this.backpackRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(request._id) }, { active: false }, { new: true }
      );
      
      if (!result) {
        throw ('Failed to delete backpack');
      }
      return result;
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async createBackpack(request: BackpackReq) {
    try {
      this.backpackRepository.setInstanceKey(request.instancekey);
      const result = await this.backpackRepository.create({
        user: new ObjectId(request.user._id),
      });
      if (!result) {
        throw ('Failed to create backpack');
      }
      return result;
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

}
