import { Controller } from "@nestjs/common";
import { FeedbackService } from "./feedback.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufFeedbackService } from "@app/common/grpc-clients/question-bank";
import { CreateFeedbackRequest, CreateFeedbackResponse, CreateQuestionFeedbackRequest, CreateQuestionFeedbackResponse, FindAllByMeRequest, FindAllByMeResponse, FindAllByPracticeRequest, FindAllByPracticeResponse, GetQuestionFbRequest, GetQuestionFbResponse, GetTopFeedbacksRequest, GetTopFeedbacksResponse, RespondFeedbackRequest, RespondFeedbackResponse, SummaryByMeRequest, SummaryByMeResponse } from "@app/common/dto/question-bank.dto";

@Controller()
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @GrpcMethod(protobufFeedbackService, 'FindAllByPractice')
    findAllByPractice(request: FindAllByPracticeRequest): Promise<FindAllByPracticeResponse> {
        return this.feedbackService.findAllByPractice(request);
    }
    
    @GrpcMethod(protobufFeedbackService, 'SummaryByMe')
    summaryByMe(request: SummaryByMeRequest): Promise<SummaryByMeResponse> {
        return this.feedbackService.summaryByMe(request);
    }
    
    @GrpcMethod(protobufFeedbackService, 'FindAllByMe')
    findAllByMe(request: FindAllByMeRequest): Promise<FindAllByMeResponse> {
        return this.feedbackService.findAllByMe(request);
    }
    
    @GrpcMethod(protobufFeedbackService, 'GetQuestionFbPendingResponses')
    getQuestionFbPendingResponses(request: GetQuestionFbRequest): Promise<GetQuestionFbResponse> {
        return this.feedbackService.getQuestionFbPendingResponses(request);
    }
    
    @GrpcMethod(protobufFeedbackService, 'GetTopFeedbacks')
    getTopFeedbacks(request: GetTopFeedbacksRequest): Promise<GetTopFeedbacksResponse> {
        return this.feedbackService.getTopFeedbacks(request);
    }
    
    @GrpcMethod(protobufFeedbackService, 'CreateFeedback')
    createFeedback(request: CreateFeedbackRequest): Promise<CreateFeedbackResponse> {
        return this.feedbackService.createFeedback(request);
    }
    
    @GrpcMethod(protobufFeedbackService, 'CreateQuestionFeedback')
    createQuestionFeedback(request: CreateQuestionFeedbackRequest): Promise<CreateQuestionFeedbackResponse> {
        return this.feedbackService.createQuestionFeedback(request);
    }
    
    @GrpcMethod(protobufFeedbackService, 'RespondFeedback')
    respondFeedback(request: RespondFeedbackRequest): Promise<RespondFeedbackResponse> {
        return this.feedbackService.respondFeedback(request);
    }
    
}