import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ClassroomRepository, ContentRepository, regexName,
  shuffleArray, SubjectRepository, TopicRepository, UsersRepository
} from '@app/common';
import {
  GetContentByIdResponse, GetContentByIdRequest, ContentRequest, UpdateContentRequest,
  GetAllContentReq, GetContentByCodeReq, ExportViewerRes, getContentsTaggedWithTopicReq,
  GetAllContentRes, FindSubjectUnitAndTopicsReq, UpdateContentCountReq
} from '@app/common/dto/administration/content.dto';
import { GrpcInternalException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { S3Service } from '@app/common/components/aws/s3.service';
import { ObjectId } from 'mongodb';
import { getAssets } from '@app/common/config';
import { Types } from 'mongoose';

@Injectable()
export class ContentService {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly classroomRepository: ClassroomRepository,
    private readonly usersRepository: UsersRepository,
    private readonly topicRepository: TopicRepository,
    private readonly subjectRepository: SubjectRepository,
    private s3Service: S3Service
  ) { }

  async getAllContents(request: GetAllContentReq) {
    try {
      const { title, type, page, limit, user, instancekey } = request;
      let filter = {}
      if (title) {
        let regexText = regexName(title)
        filter['$or'] = [{ title: regexText }, { tags: regexText }];
      }
      if (type) {
        filter['contentType'] = type;
      }

      if (!user.roles.includes('admin')) {
        filter['location'] = new ObjectId(user.activeLocation)
      }

      let reqPage: any = (page) ? page : 1;
      let reqLimit: any = (limit) ? limit : 20;
      let skip = (reqPage - 1) * reqLimit;

      this.contentRepository.setInstanceKey(instancekey);
      let result = await this.contentRepository.find(
        filter, null,
        { skip, limit: reqLimit, sort: { createdAt: -1 } },
        [{ path: 'user', select: '_id name' }]
      );
      if (result.length === 0) {
        throw new NotFoundException('No content found.');
      }

      return { response: result };
    } catch (error) {
      if(error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException(error);
    }
  }

  async countContent(request: GetAllContentReq) {
    try {
      const { title, type, user, instancekey } = request;
      let filter = {}
      if (title) {
        let regexText = regexName(title)
        filter['$or'] = [{ title: regexText }, { tags: regexText }];
      }
      if (type) {
        filter['contentType'] = type;
      }

      if (!user.roles.includes('admin')) {
        filter['location'] = user.activeLocation
      }

      this.contentRepository.setInstanceKey(instancekey);
      const count = await this.contentRepository.countDocuments(filter);

      return { count: count };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async createContent(request: ContentRequest) {
    try {
      const { url, title, summary, contentType, filePath, tags, imageUrl, instancekey, user, file } = request;
      const uploadPath = getAssets(instancekey);

      if (file) {
        const randomString = Math.random().toString(36).slice(2);
        const userId = typeof user !== 'undefined' ? user._id.toString() : randomString;
        const newFilename = `${randomString}-${file.originalname}`;
        let bucketKey: any = `${uploadPath}/uploads/elearning/${userId}/${newFilename}`;
        bucketKey = bucketKey.replace('assets/', '')

        await this.s3Service.userAssetUpload(file, bucketKey);

        return { message: 'File uploaded successfully!', filePath: `/${userId}/${newFilename}` };
      }
      else {
        const contentToBeSaved = {
          url: url,
          title: title,
          summary: summary,
          contentType: contentType,
          user: new ObjectId(user._id),
          filePath: filePath ? filePath : undefined,
          tags: tags,
          imageUrl: imageUrl ? imageUrl : '',
          location: new ObjectId(user.activeLocation)
        };

        // Define filter object
        let filter = {};
        if (contentToBeSaved.url && contentToBeSaved.title) {
          const regexText = regexName(contentToBeSaved.title);
          filter = {
            $or: [
              { url: contentToBeSaved.url },
              { title: regexText }
            ]
          };
        } else {
          const regexText = regexName(contentToBeSaved.title);
          if (contentToBeSaved.url) {
            filter['url'] = contentToBeSaved.url;
          } else if (contentToBeSaved.title) {
            filter['title'] = regexText;
          }
        }

        this.contentRepository.setInstanceKey(instancekey);
        const newContent = await this.contentRepository.create(contentToBeSaved);

        if (!newContent) {
          throw ('Contents not Created!');
        }

        return newContent;
      }
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getContentById(request: GetContentByIdRequest): Promise<GetContentByIdResponse> {
    try {
      const instancekey = request.instancekey;
      this.contentRepository.setInstanceKey(instancekey);
      const content = await this.contentRepository.findOne({ _id: request._id }, { url: 1, filePath: 1, contentType: 1 });
      if (!content) {
        throw ('Contents not found!');
      }

      return { response: content };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async updateContent(request: UpdateContentRequest) {
    try {
      const { _id, title, summary, tags, instancekey } = request;

      // Update details
      const update = {
        title: title,
        summary: summary,
        tags: tags || []
      };

      this.contentRepository.setInstanceKey(instancekey);
      const content = await this.contentRepository.findByIdAndUpdate(_id, update, { new: true });
      if (!content) {
        throw ('Contents not found!');
      }

      return content;
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getRemoteContent(request: GetContentByIdRequest): Promise<GetContentByIdResponse> {
    try {
      this.contentRepository.setInstanceKey(request.instancekey);
      const content = await this.contentRepository.findOne({ _id: request._id });

      // We only handle cross site here so if filePath exists mean the file is in our server => will not handle
      if (!content || content.filePath) {
        throw ('Contents not found!');
      }

      return { response: content };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async contentfindByCode(request: GetContentByCodeReq): Promise<GetContentByIdResponse> {
    try {
      const { code, user, instancekey } = request;

      let condition = {
        code,
        location: user.activeLocation
      };
      if (!user.roles.includes('student')) {
        condition['subject'] = { $in: user.subjects };
        this.classroomRepository.setInstanceKey(instancekey);
        let classrooms = await this.classroomRepository.distinct('_id', {
          'students.studentUserId': user.userId,
          active: true,
          $or: [
            { slugfly: { '$ne': 'my-mentees' } },
            { 'students.status': true }
          ],
          location: user.activeLocation
        });

        if (classrooms.length > 0) {
          condition['$or'] = [
            { 'accessMode': 'public' },
            { 'accessMode': 'buy' },
            { 'classRooms': { $in: classrooms }, accessMode: 'invitation' }
          ];
        } else {
          condition['$or'] = [
            { 'accessMode': 'public' },
            { 'accessMode': 'buy' }
          ];
        }
      }
      this.contentRepository.setInstanceKey(instancekey);
      const content = await this.contentRepository.findOne(condition);

      if (!content) {
        throw ('Contents not found!');
      }

      return { response: content };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async exportViewer(request: GetContentByIdRequest): Promise<ExportViewerRes> {
    try {
      const { _id, instancekey } = request;
      this.contentRepository.setInstanceKey(instancekey);
      const content = await this.contentRepository.findOne({ _id: _id }, { viewership: 1 });

      if (!content) {
        throw ('Contents not found!');
      }

      const uniqueUser = {};
      const userIds = [];
      for (const viewer of content.viewership) {
        userIds.push(viewer.user);
        if (uniqueUser[String(viewer.user)]) {
          uniqueUser[String(viewer.user)].viewCount++;
        } else {
          uniqueUser[String(viewer.user)] = { viewDate: viewer.viewDate, viewCount: 1 };
        }
      }
      this.usersRepository.setInstanceKey(instancekey);
      const users = await this.usersRepository.find({ _id: { $in: userIds } }, { name: 1, userId: 1 });

      for (const user of users) {
        this.classroomRepository.setInstanceKey(instancekey);
        const classroom = await this.classroomRepository.findOne({
          'students.studentId': user._id,
          $and: [
            { slugfly: { $ne: 'group-study' } },
            { slugfly: { $ne: 'my-mentees' } }
          ]
        }, { name: 1 });

        user.viewCount = uniqueUser[String(user._id)].viewCount;
        user.classroom = classroom ? classroom.name : '';
      }
      return { response: users };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getContentsTaggedWithTopic(request: getContentsTaggedWithTopicReq): Promise<GetAllContentRes> {
    try {
      const { topicId, contentType, includeCount, page, limit, user, instancekey } = request;
      this.topicRepository.setInstanceKey(instancekey);
      const topic = await this.topicRepository.findById(topicId);

      if (!topic) {
        throw ('topic not found!');
      }

      let reqPage: any = (page) ? page : 1;
      let reqLimit: any = (limit) ? limit : 20;
      let skip = (reqPage - 1) * reqLimit;

      let query: any = { location: new ObjectId(user.activeLocation), tags: { $in: topic.tags } };

      if (contentType) {
        query.contentType = contentType;
      }

      this.contentRepository.setInstanceKey(instancekey);
      const contentQuery = await this.contentRepository.find(query, null, { skip, limit: reqLimit });

      const toReturn = [];
      for await (const content of contentQuery) {
        toReturn.push(content);
      }

      if (toReturn.length === 0) {
        throw ('No content found');
      }

      if (typeof includeCount === 'string' && includeCount === 'true') {
        const totalCount = await this.contentRepository.countDocuments(query);
        return { contents: shuffleArray(toReturn), count: totalCount };
      } else {
        return { contents: shuffleArray(toReturn) };
      }
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async findSubjectUnitAndTopics(request: FindSubjectUnitAndTopicsReq) {
    try {     
      var filter: any = {}
      filter['_id'] = { $in: request.user.subjects.map(s => new Types.ObjectId(s)) };

      if (request.accreditationEnabled) {
        filter.accreditationEnabled = true;
      }

      const sort = { name: 1 };
      const matchSubject = { $or: [{ 'active': { $exists: false } }, { 'active': true }] };
      
      this.subjectRepository.setInstanceKey(request.instancekey);
      const subjects = await this.subjectRepository.find(
        filter, { name: 1, units: 1, adaptive: 1 }, { sort },
        [{ path: 'units', select: 'name topics', match: matchSubject, options: { lean: true } }]
      );

      if (!subjects) {
        throw ('Subjects not found');
      }
      
      this.contentRepository.setInstanceKey(request.instancekey);
      const populatedSubjects = await this.topicRepository.populate(subjects, {
        path: 'units.topics',
        select: 'name',
        options: { lean: true }
      });
      console.log(populatedSubjects);
      
      return { response: populatedSubjects };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async deleteContent(request: GetContentByIdRequest) {
    try {
      const { _id, instancekey } = request;
      this.contentRepository.setInstanceKey(instancekey);
      const content = await this.contentRepository.findByIdAndDelete(_id);
      if (!content) {
        throw ('Pass the correct id.. ');
      }

      return { response: content };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async updateContentCount(request: UpdateContentCountReq) {
    try {
      const { _id, feedback, rating, viewCount, user, instancekey } = request;

      this.contentRepository.setInstanceKey(instancekey);
      if (!Types.ObjectId.isValid(_id)) {
        throw ('Invalid Content ID');
      }

      if (feedback) {
        const existingFeedback = await this.contentRepository.findOne({
          _id,
          'feedbacks.user': user._id,
        });

        if (existingFeedback) {
          await this.contentRepository.updateOne(
            { _id, 'feedbacks.user': user._id },
            {
              $set: {
                'feedbacks.$.rating': rating,
                'feedbacks.$.updatedAt': new Date(),
              },
            },
          );
        } else {
          const feedbackData = {
            user: user._id,
            updatedAt: new Date(),
            rating,
          };
          await this.contentRepository.updateOne(
            { _id },
            { $addToSet: { feedbacks: feedbackData } },
          );
        }

        const aggregatedContent = await this.contentRepository.aggregate([
          { $match: { _id: new Types.ObjectId(_id) } },
          { $unwind: '$feedbacks' },
          {
            $group: {
              _id: '$_id',
              totalRating: { $sum: '$feedbacks.rating' },
              userCount: { $sum: 1 },
            },
          },
        ]);

        if (aggregatedContent.length > 0) {
          const { totalRating, userCount } = aggregatedContent[0];
          const avgRating = totalRating / userCount;
          const updatedContent = await this.contentRepository.updateOne(
            { _id },
            { $set: { avgRating } },
          );

          return { ...updatedContent, avgRating };
        }
      } else {
        const viewer = {
          user: new Types.ObjectId(user._id),
          viewDate: new Date(),
        };
        const updatedContent = await this.contentRepository.updateOne(
          { _id },
          {
            $set: { viewed: viewCount },
            $addToSet: { viewership: viewer },
          },
        );

        return updatedContent;
      }
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }
}
