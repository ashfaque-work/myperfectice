import { AttemptRepository, ClassroomRepository, PracticeSetRepository, UsersRepository } from '@app/common';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as _ from 'lodash';
import { AttemptProcessor } from '@app/common/components/AttemptProcessor';
import * as feedbackValidator from '@app/common/validators/feedback'
import { FeedbackBus } from '@app/common/bus/feedback.bus';
import { GrpcCancelledException, GrpcInvalidArgumentException } from 'nestjs-grpc-exceptions';
import { AnsyncAllRequest } from '@app/common/dto/question-bank.dto';

@Injectable()
export class AnsyncService {
    constructor(private readonly attemptRepository: AttemptRepository,
        private readonly practiceSetRepository: PracticeSetRepository,
        private readonly usersRepository: UsersRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly attemptProcessor: AttemptProcessor,
        private readonly busFeedback: FeedbackBus,
    ) { }

    async ansyncAll(req: AnsyncAllRequest) {
        try {
            const attemptNotAsync: any[] = [];
            const attemptAsync: any[] = [];
            const feedbackNotAsync: any[] = [];
            const feedbackAsync: any[] = [];
            var body = req.body;
            let attemptAsyncObj: any = {};

            // Process attempts asynchronously
            if (body.attempts && body.attempts.length > 0) {
                await Promise.all(
                    body.attempts.map(async (attempt: any) => {
                        const res = await this.createAttemptOffline(req, attempt);
                        if (!res) {
                            attemptNotAsync.push(attempt);
                        } else {
                            attemptAsync.push(attempt);
                        }
                    })
                );
            }

            // Process feedbacks asynchronously
            if (body.feedbacks && Object.keys(body.feedbacks).length > 0) {
                var arr = _.values(body.feedbacks);
                if (arr.length > 0) {


                }
                await Promise.all(
                    arr.map(async (value: any) => {
                        try {
                            value.user = new ObjectId(req.user._id);
                            const fb = await this.feedbackAttempt(req, value);
                            feedbackAsync.push(value);

                            const shareLinks = req.body.shareLinks;
                            if (shareLinks && shareLinks[`shareData_${value.idOffline}`]) {
                                await this.busFeedback.sharePractice(req, shareLinks[`shareData_${value.idOffline}`]);
                            }
                        } catch (err) {
                            feedbackNotAsync.push(value);
                            throw err;
                        }
                    })
                );
            }

            attemptAsyncObj = {
                attemptNotAsync,
                attemptAsync,
                feedbackNotAsync,
                feedbackAsync,
            };

            return attemptAsyncObj;
        } catch (error) {
            console.log(error);
            if (error instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(error.getResponse());
            }

            throw new GrpcCancelledException(error.message)
        }
    }

    private async createAttemptOffline(req: AnsyncAllRequest, data: any): Promise<any> {
        try {
            data.user = new ObjectId(req.user._id as string);
            data.studentName = req.user.name;
            data.isAnsync = true;
            data.isCratedOffline = true;

            if (!data.practicesetId) {
                throw new BadRequestException({ params: 'practiceId', status: 422, message: 'Practice id required' });
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            const record = await this.attemptRepository.findOne({ user: new ObjectId(req.user._id), idOffline: data.idOffline, isAnsync: true });
            if (record) {
                return record;
            }
            var totalAttempts = 0;
            var practice: any = {};
            const result = await this.getPracticeAndCountAttempt(req, data, totalAttempts, practice);
            totalAttempts = result.totalAttempts;
            practice = result.practice;


            if (!practice) {
                throw new BadRequestException({ message: 'Cannot find any practice related to this attempt' });
            }

            // Update user's viewPractices
            this.usersRepository.setInstanceKey(req.instancekey)
            await this.usersRepository.updateOne({ _id: new ObjectId(req.user._id) }, { $addToSet: { practiceViews: data.practicesetId } })

            if (practice.attemptAllowed > 0 && practice.attemptAllowed < totalAttempts) {
                throw new ForbiddenException('You have reached maximum number of permitted attempts on this test.');
            }

            const hasAttempt = await this.attemptRepository.findOne({ user: new ObjectId(req.user._id), practicesetId: data.practicesetId }, null, { lean: true });
            if (hasAttempt) {
                Logger.debug('Student is attempt this practice');
            }

            if (!hasAttempt) {
                const practiceSaved = await this.practiceSetRepository.findOneAndUpdate({
                    _id: data.practicesetId
                }, { $inc: { totalJoinedStudent: 1 } }, { 'new': true });
                if (practiceSaved) {
                    practice = practiceSaved;
                }
            }

            if (!practice) {
                return;
            }

            const attempt = await this.populateAttemptAndSave(req, data, practice);

            var feedbacks = req.body.feedbacks;
            var shareLinks = req.body.shareLinks;
            if (!feedbacks) {
                return attempt;
            }
            var feedbackData = feedbacks['fb_' + attempt.idOffline] ? feedbacks['fb_' + attempt.idOffline] : feedbacks['fb_' + attempt._id]

            if (typeof feedbackData == 'undefined') {

                return attempt;
            } else {

                feedbackData.attemptId = attempt.idOffline;
                await this.feedbackAttempt(req, feedbacks['fb_' + attempt.idOffline])

                if (!shareLinks || (shareLinks && !shareLinks['shareData_' + attempt.idOffline])) {
                    return attempt;
                }

                await this.busFeedback.sharePractice(req, shareLinks['shareData_' + attempt.idOffline])
                return attempt;
            }

        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    private async getPracticeAndCountAttempt(req: AnsyncAllRequest, data: any, totalAttempts: number, practice: any): Promise<any> {
        this.attemptRepository.setInstanceKey(req.instancekey);
        this.practiceSetRepository.setInstanceKey(req.instancekey);

        [totalAttempts, practice] = await Promise.all([
            await this.attemptRepository.countDocuments({ user: new ObjectId(req.user._id as string), practicesetId: data.practicesetId }),
            await this.practiceSetRepository.findById(data.practicesetId, null, null, [{ path: 'user' }])
        ]);

        return { totalAttempts, practice };
    }

    private async populateAttemptAndSave(req: AnsyncAllRequest, data: any, practice: any) {
        try {
            var attemptData = _.pick(data,
                'user', 'studentName', 'isEvaluated', 'QA', 'plusMark', 'minusMark', 'totalQuestions',
                'totalTime', 'totalCorrects', 'totalErrors', 'pending',
                'practicesetId', 'totalMissed', 'totalMarkeds', 'isAbandoned', 'isCratedOffline', 'isAnsync', 'idOffline', 'attemptId', 'attemptDetailId');
            var practiceInfo = practice.toObject();
            attemptData.subjects = practiceInfo.subject;
            if (!attemptData.totalQuestions) {
                attemptData.totalQuestions = attemptData.totalMissed + attemptData.totalCorrects + attemptData.totalErrors;
            }
            attemptData.isAnsync = true;

            this.classroomRepository.setInstanceKey(req.instancekey);
            let classes = await this.classroomRepository.find({ 'students.studentId': new ObjectId(req.user._id) }, { _id: 1 }, { lean: true })

            // get common classrooms of user and test
            let attClasses = []
            classes.forEach(uc => {
                if (practiceInfo.classRooms.findIndex(c => c.equals(uc._id)) > -1) {
                    attClasses.push(uc._id)
                }
            })
            attemptData.practiceSetInfo = {
                "title": practiceInfo.title,
                "subject": practiceInfo.subject,
                "classRooms": attClasses,
                "grades": practiceInfo.grades,
                "titleLower": practiceInfo.titleLower,
                "accessMode": practiceInfo.accessMode
            }
            if (practiceInfo.user) {
                attemptData.practiceSetInfo.createdBy = practiceInfo.user._id;
            }

            attemptData.createdBy = { user: practiceInfo.user._id, name: practiceInfo.user.name };
            var maxMarks = 0;
            for (var i = 0; i < data.QA.length; i++) {
                maxMarks += data.QA[i].actualMarks;
            }

            attemptData.maximumMarks = maxMarks;

            let savedAttempt = await this.attemptProcessor.createAttemptAndAttemptDetails(req.instancekey, attemptData)
            return savedAttempt;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    private async feedbackAttempt(req: AnsyncAllRequest, reqFeedback: any) {
        try {
            const { errors, result } = feedbackValidator.validateCreateOffline(req, reqFeedback)
            if (errors) {
                // throw new BadRequestException(errors)
            }
            const fb = await this.busFeedback.createOffline(req, result)
            return fb;
        } catch (error) {
            console.log(error);
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.getResponse());
            }
            throw new InternalServerErrorException(error.message);
        }
    }
}