import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CodesnippetRepository, escapeRegex, getRandomCode } from '@app/common';
import {
  ChangePairCodingReq, CreateCodesnippetReq, DeleteCodesnippetReq, FindCodesnippetReq,
  GetCodeByUIDReq, UpdateCodesnippetReq,
} from '@app/common/dto/administration/codesnippet.dto';
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { Types } from 'mongoose';

@Injectable()
export class CodesnippetService {
  constructor(private readonly codesnippetRepository: CodesnippetRepository) { }

  async findCodesnippet(request: FindCodesnippetReq) {
    try {
      const limit = Number(request.query.limit || 10);
      const skip = Number(request.query.skip || 0);

      const query: any = { active: true, user: new Types.ObjectId(request.user._id) };

      if (request.query.language) {
        query.language = request.query.language;
      }

      if (request.query.search) {
        query.$or = [
          { title: new RegExp(escapeRegex(request.query.search), 'i') },
          { tags: { $in: request.query.search.split(' ') } },
        ];
      }

      const options: any = {
        sort: { updatedAt: -1 }, skip: skip, limit: limit, lean: true
      };
      this.codesnippetRepository.setInstanceKey(request.instancekey);
      const snippets = await this.codesnippetRepository.find(query, undefined, options);

      if (request.query.count) {
        const count = await this.codesnippetRepository.countDocuments(query);
        return { snippets, count };
      } else {
        return { snippets };
      }
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getCodeByUID(request: GetCodeByUIDReq) {
    try {
      this.codesnippetRepository.setInstanceKey(request.instancekey);
      const snippet = await this.codesnippetRepository.findOne(
        { uid: request.uid }, undefined, { populate: [{ path: "user", select: "name", options: { lean: true } }], lean: true, new: true }
      );

      if (!snippet) {
        throw new NotFoundException('Codesnippet Not Found');
      }

      return { ...snippet, user: snippet.user._id, userName: snippet.user.name };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async updateCodesnippet(request: UpdateCodesnippetReq) {
    try {
      this.codesnippetRepository.setInstanceKey(request.instancekey);
      await this.codesnippetRepository.updateOne(
        { _id: request._id },
        { $set: { code: request.code, updatedAt: new Date() } }
      );

      return { message: 'ok' };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async changePairCoding(request: ChangePairCodingReq) {
    try {
      if (request.pairCoding == undefined) {
        throw new BadRequestException('pairCoding value not passed.');
      }
      this.codesnippetRepository.setInstanceKey(request.instancekey);
      await this.codesnippetRepository.updateOne(
        { _id: request._id },
        { $set: { pairCoding: request.pairCoding } }
      );

      return { message: 'ok' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }

  private async getUniqueUID(ik) {
    const uid = getRandomCode(8);
    const found = await this.codesnippetRepository.findOne({ uid: uid });

    if (found) {
      // Duplicate UID, generate a new one
      return await this.getUniqueUID(ik);
    } else {
      return uid;
    }
  }

  async createCodesnippet(request: CreateCodesnippetReq) {
    try {
      const newCodeData = {
        ...request.body,
        user: new Types.ObjectId(request.user._id),
        uid: await this.getUniqueUID(request.instancekey)
      };

      this.codesnippetRepository.setInstanceKey(request.instancekey);
      const newCode = await this.codesnippetRepository.create(newCodeData);

      return newCode;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async deleteCodesnippet(request: DeleteCodesnippetReq) {
    try {
      this.codesnippetRepository.setInstanceKey(request.instancekey);
      await this.codesnippetRepository.updateOne(
        { _id: request._id }, { $set: { active: false } }
      );

      return { message: 'ok' };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }
}
