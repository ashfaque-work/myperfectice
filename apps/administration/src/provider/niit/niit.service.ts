import { Injectable, Logger } from '@nestjs/common';
import { AttemptRepository } from '@app/common';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import { TestSendMailReq } from '@app/common/dto/administration';

@Injectable()
export class NiitService {
  constructor(private readonly attemptRepository: AttemptRepository) { }


  async niitUserAttemptDetails(request: TestSendMailReq): Promise<any> {
    try {
      this.attemptRepository.setInstanceKey(request.instancekey);
      const result = await this.attemptRepository.aggregate([
        {
          $project: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
            day: { $dayOfMonth: '$updatedAt' },
            _id: 1,
            practiceTestID: 1,
            createdAt: 1,
            totalQuestions: 1,
            totalTime: 1,
            totalMark: 1,
            totalCorrects: 1,
            totalErrors: 1,
            totalMissed: 1,
            practicesetId: 1,
            email: 1,
          },
        },
        {
          $project: {
            _id: 0,
            attemptID: '$_id',
            email: '$email',
            practiceTestID: '$practicesetId',
            attemptDateTime: '$createdAt',
            questionCount: '$totalQuestions',
            timeTaken: { $divide: ['$totalTime', 1000.0] },
            avgTime: { $divide: [{ $divide: ['$totalTime', '$totalQuestions'] }, 1000.0] },
            totalMarks: '$totalMark',
            correctCount: '$totalCorrects',
            incorrectCount: '$totalErrors',
            missedCount: '$totalMissed',
          },
        },
      ]);

      return { result };
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

}
