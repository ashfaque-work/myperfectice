import { CreateFeedbackRequest, CreateQuestionFeedbackRequest, FindAllByMeRequest, FindAllByPracticeRequest, GetQuestionFbRequest, GetTopFeedbacksRequest, RespondFeedbackRequest, SummaryByMeRequest } from '@app/common/dto/question-bank.dto';
import { FeedbackGrpcServiceClientImpl } from '@app/common/grpc-clients/question-bank';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedbackService {
    constructor(private feedbackGrpcServiceClientImpl: FeedbackGrpcServiceClientImpl ) {}
    
    async findAllByPractice(request: FindAllByPracticeRequest) {
        return this.feedbackGrpcServiceClientImpl.FindAllByPractice(request);
    }
    
    async summaryByMe(request: SummaryByMeRequest) {
        return this.feedbackGrpcServiceClientImpl.SummaryByMe(request);
    }
    
    async findAllByMe(request: FindAllByMeRequest) {
        return this.feedbackGrpcServiceClientImpl.FindAllByMe(request);
    }
    
    async getQuestionFbPendingResponses(request: GetQuestionFbRequest) {
        return this.feedbackGrpcServiceClientImpl.GetQuestionFbPendingResponses(request);
    }
    
    async getTopFeedbacks(request: GetTopFeedbacksRequest) {
        return this.feedbackGrpcServiceClientImpl.GetTopFeedbacks(request);
    }
    
    async createFeedback(request: CreateFeedbackRequest) {
        return this.feedbackGrpcServiceClientImpl.CreateFeedback(request);
    }
    
    async createQuestionFeedback(request: CreateQuestionFeedbackRequest) {
        return this.feedbackGrpcServiceClientImpl.CreateQuestionFeedback(request);
    }
    
    async respondFeedback(request: RespondFeedbackRequest) {
        return this.feedbackGrpcServiceClientImpl.RespondFeedback(request);
    }
    
}