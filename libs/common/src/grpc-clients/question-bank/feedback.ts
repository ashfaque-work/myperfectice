import { CreateFeedbackRequest, CreateFeedbackResponse, CreateQuestionFeedbackRequest, CreateQuestionFeedbackResponse, FindAllByMeRequest, FindAllByMeResponse, FindAllByPracticeRequest, FindAllByPracticeResponse, GetQuestionFbRequest, GetQuestionFbResponse, GetTopFeedbacksRequest, GetTopFeedbacksResponse, RespondFeedbackRequest, RespondFeedbackResponse, SummaryByMeRequest, SummaryByMeResponse } from '@app/common/dto/question-bank.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufFeedbackService = 'QuestionBankGrpcService';
export interface FeedbackGrpcInterface {
    FindAllByPractice(request: FindAllByPracticeRequest): Promise<FindAllByPracticeResponse>;
    SummaryByMe(request: SummaryByMeRequest): Promise<SummaryByMeResponse>;
    FindAllByMe(request: FindAllByMeRequest): Promise<FindAllByMeResponse>;
    GetQuestionFbPendingResponses(request: GetQuestionFbRequest): Promise<GetQuestionFbResponse>;
    GetTopFeedbacks(request: GetTopFeedbacksRequest): Promise<GetTopFeedbacksResponse>;
    CreateFeedback(request: CreateFeedbackRequest): Promise<CreateFeedbackResponse>;
    CreateQuestionFeedback(request: CreateQuestionFeedbackRequest): Promise<CreateQuestionFeedbackResponse>;
    RespondFeedback(request: RespondFeedbackRequest): Promise<RespondFeedbackResponse>;
}
@Injectable()
export class FeedbackGrpcServiceClientImpl implements FeedbackGrpcInterface {
    private feedbackGrpcServiceClient: FeedbackGrpcInterface;
    private readonly logger = new Logger(FeedbackGrpcServiceClientImpl.name)
    constructor(
        @Inject('questionBankGrpcService') private feedbackGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.feedbackGrpcServiceClient = this.feedbackGrpcClient.getService<FeedbackGrpcInterface>(
            protobufFeedbackService
        );
        this.logger.debug('gRPC client initalized.');
    }

    async FindAllByPractice(request: FindAllByPracticeRequest): Promise<FindAllByPracticeResponse> {
        return await this.feedbackGrpcServiceClient.FindAllByPractice(request);
    }
    
    async SummaryByMe(request: SummaryByMeRequest): Promise<SummaryByMeResponse> {
        return await this.feedbackGrpcServiceClient.SummaryByMe(request);
    }
    
    async FindAllByMe(request: FindAllByMeRequest): Promise<FindAllByMeResponse> {
        return await this.feedbackGrpcServiceClient.FindAllByMe(request);
    }
    
    async GetQuestionFbPendingResponses(request: GetQuestionFbRequest): Promise<GetQuestionFbResponse> {
        return await this.feedbackGrpcServiceClient.GetQuestionFbPendingResponses(request);
    }
    
    async GetTopFeedbacks(request: GetTopFeedbacksRequest): Promise<GetTopFeedbacksResponse> {
        return await this.feedbackGrpcServiceClient.GetTopFeedbacks(request);
    }
    
    async CreateFeedback(request: CreateFeedbackRequest): Promise<CreateFeedbackResponse> {
        return await this.feedbackGrpcServiceClient.CreateFeedback(request);
    }
    
    async CreateQuestionFeedback(request: CreateQuestionFeedbackRequest): Promise<CreateQuestionFeedbackResponse> {
        return await this.feedbackGrpcServiceClient.CreateQuestionFeedback(request);
    }
    
    async RespondFeedback(request: RespondFeedbackRequest): Promise<RespondFeedbackResponse> {
        return await this.feedbackGrpcServiceClient.RespondFeedback(request);
    }
}