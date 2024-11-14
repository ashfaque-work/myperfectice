import { Injectable, Logger } from '@nestjs/common';
import { AttemptRepository, PracticeSetRepository, RedisCaching, UserLogRepository, UsersRepository } from '@app/common';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import { TestSendMailReq } from '@app/common/dto/administration';

@Injectable()
export class PlatformByNumbersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userLogRepository: UserLogRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly practiceSetRepository: PracticeSetRepository,
    private readonly redisCaching: RedisCaching,
  ) { }

  async countStudent(request: any): Promise<number> {
    try {
      this.usersRepository.setInstanceKey(request.instancekey);
      return await this.usersRepository.countDocuments({ roles: { $in: ['student'] } });
    } catch (err) {
      Logger.warn('dberror %j', err);
      return 0;
    }
  }

  async countTeacher(request: any): Promise<number> {
    try {
      this.usersRepository.setInstanceKey(request.instancekey);
      return await this.usersRepository.countDocuments({ roles: { $in: ['teacher'] } });
    } catch (err) {
      Logger.warn('dberror %j', err);
      return 0;
    }
  }

  async countAttempt(request: any): Promise<number> {
    try {
      this.attemptRepository.setInstanceKey(request.instancekey);
      return await this.attemptRepository.countDocuments({ isAbandoned: false });
    } catch (err) {
      Logger.warn('dberror %j', err);
      return 0;
    }
  }

  async countPracticeQuestion(request: any): Promise<{ totalPracticeSet: number; totalQuestion: number }> {
    try {
      this.practiceSetRepository.setInstanceKey(request.instancekey);
      const data: any = await this.practiceSetRepository.aggregate([
        { $match: { status: 'published' } },
        { $project: { _id: 1, questionCount: { $size: { $ifNull: ['$questions', []] } } } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalQuestions: { $sum: '$questionCount' },
          },
        },
      ]);
      if (data.length > 0) {
        return { totalPracticeSet: data[0].count, totalQuestion: data[0].totalQuestions };
      } else {
        return { totalPracticeSet: 0, totalQuestion: 0 };
      }
    } catch (err) {
      Logger.warn('dberror %j', err);
      return { totalPracticeSet: 0, totalQuestion: 0 };
    }
  }

  async getTotalSpentTime(request: any): Promise<number> {
    try {
      this.userLogRepository.setInstanceKey(request.instancekey);
      const result: any = await this.userLogRepository.aggregate([
        { $match: { roles: { $in: ['student'] } } },
        {
          $group: {
            _id: '',
            spentTime: { $sum: '$timeActive' },
          },
        },
        {
          $project: {
            _id: 0,
            spentTime: '$spentTime',
          },
        },
      ]);
      return result.length > 0 ? result[0].spentTime : 0;
    } catch (err) {
      Logger.warn('dberror %j', err);
      return 0;
    }
  }

  async getplatformByNumbers(request: TestSendMailReq): Promise<any> {
    try {
      const cachedSummary = await new Promise<any>((resolve) => {
        this.redisCaching.get({ instancekey: request.instancekey }, 'platformByNumbers', (result) => {
          resolve(result);
        });
      });
      if (cachedSummary) {
        Logger.debug('Summary data from cached ');
        return cachedSummary;
      }
      const summary: any = {
        studentCount: await this.countStudent(request),
        teacherCount: await this.countTeacher(request),
        attemptCount: await this.countAttempt(request),
        publishedTestCount: await this.countPracticeQuestion(request),
        hoursSpent: await this.getTotalSpentTime(request),
      };

      // Cache the result for 5 minutes (300 seconds)
      await this.redisCaching.set(request, 'platformByNumbers', summary, 300);

      return summary;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

}
