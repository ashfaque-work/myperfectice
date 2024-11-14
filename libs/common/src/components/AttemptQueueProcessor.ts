import { Job } from 'bull';
import { AttemptSubmissionRepository } from '../database';
import { AttemptProcessor } from './AttemptProcessor';
import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

@Processor('attempt-submission')
export class AttemptQueueProcessor {
    constructor(
        private readonly attemptSubmissionRepository: AttemptSubmissionRepository,
        private readonly attemptProcessor: AttemptProcessor,
    ) { }
    @Process('attempt submission')
    async handleAttemptSubmission(job: Job) {
        Logger.log(`Processing job: ${job.id}, Data: ${JSON.stringify(job.data)}`);
        const { submission: submissionId, ik } = job.data;

        try {
            this.attemptSubmissionRepository.setInstanceKey(ik)
            const submission = await this.attemptSubmissionRepository.findOneAndUpdate(
                { _id: submissionId, status: 'draft' },
                { $set: { status: 'processing' } }
            );

            if (!submission) {
                return true;
            }

            if (!submission.attemptId) {
                await this.attemptSubmissionRepository.updateOne(
                    { _id: submission._id },
                    { $set: { status: 'processed', error: 'Missing attemptId' } }
                );
                return true;
            }

            // Process the submission
            await this.attemptProcessor.process(ik, submission.attemptId, submission.data);

            // Update the submission status
            await this.attemptSubmissionRepository.updateOne(
                { _id: submission._id },
                { $set: { status: 'processed', error: '' } }
            );

            return true;
        } catch (error) {
            Logger.error(`Error processing job: ${job.id}, Error: ${error.message}`);

            await this.attemptSubmissionRepository.updateOne(
                { _id: submissionId },
                { $set: { status: 'processed', error: `Error: ${error.message}` } }
            );

            return true;
        }
    }

    @OnQueueCompleted()
    async onComplete(job: Job) {
        Logger.log(`Job ${job.id} completed successfully.`);
    }

    @OnQueueFailed()
    async onFailed(job: Job, error: any) {
        Logger.error(`Job ${job.id} failed with error: ${error.message}`);
    }
}
