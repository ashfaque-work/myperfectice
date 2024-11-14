import { CreateSessionRequest, CreateSessionResponse, FilterTestListsRequest, FilterTestListsResponse, GetPracticesBySessionRequest, GetPracticesBySessionResponse, GetSessionByIdRequest, GetSessionByIdResponse, GetSessionDetailsRequest, GetSessionDetailsResponse, GetSessionsRequest, GetSessionsResponse, GetStudentsByPracticeRequest, GetStudentsByPracticeResponse, TestStatusRequest, TestStatusResponse, UpdateSessionRequest, UpdateSessionResponse, UpdateStudentStatusRequest, UpdateStudentStatusResponse } from '@app/common/dto/question-bank.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufSessionService = 'QuestionBankGrpcService';
export interface SessionGrpcInterface {
    FilterTestLists(request: FilterTestListsRequest): Promise<FilterTestListsResponse>;
    GetSessions(request: GetSessionsRequest): Promise<GetSessionsResponse>;
    GetSessionById(request: GetSessionByIdRequest): Promise<GetSessionByIdResponse>;
    GetSessionDetails(request: GetSessionDetailsRequest): Promise<GetSessionDetailsResponse>;
    GetPracticesBySession(request: GetPracticesBySessionRequest): Promise<GetPracticesBySessionResponse>;
    GetStudentsByPractice(request: GetStudentsByPracticeRequest): Promise<GetStudentsByPracticeResponse>;
    UpdateStudentStatus(request: UpdateStudentStatusRequest): Promise<UpdateStudentStatusResponse>;
    TestStatus(request: TestStatusRequest): Promise<TestStatusResponse>;
    CreateSession(request: CreateSessionRequest): Promise<CreateSessionResponse>;
    UpdateSession(request: UpdateSessionRequest): Promise<UpdateSessionResponse>;
}
@Injectable()
export class SessionGrpcServiceClientImpl implements SessionGrpcInterface {
    private sessionGrpcServiceClient: SessionGrpcInterface;
    private readonly logger = new Logger(SessionGrpcServiceClientImpl.name)
    constructor(
        @Inject('questionBankGrpcService') private sessionGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.sessionGrpcServiceClient = this.sessionGrpcClient.getService<SessionGrpcInterface>(
            protobufSessionService
        );
        this.logger.debug('gRPC client initalized.');
    }

    async FilterTestLists(request: FilterTestListsRequest): Promise<FilterTestListsResponse> {
        return await this.sessionGrpcServiceClient.FilterTestLists(request);
    }
    
    async GetSessions(request: GetSessionsRequest): Promise<GetSessionsResponse> {
        return await this.sessionGrpcServiceClient.GetSessions(request);
    }
    
    async GetSessionById(request: GetSessionByIdRequest): Promise<GetSessionByIdResponse> {
        return await this.sessionGrpcServiceClient.GetSessionById(request);
    }
    
    async GetSessionDetails(request: GetSessionDetailsRequest): Promise<GetSessionDetailsResponse> {
        return await this.sessionGrpcServiceClient.GetSessionDetails(request);
    }
    
    async GetPracticesBySession(request: GetPracticesBySessionRequest): Promise<GetPracticesBySessionResponse> {
        return await this.sessionGrpcServiceClient.GetPracticesBySession(request);
    }
   
    async GetStudentsByPractice(request: GetStudentsByPracticeRequest): Promise<GetStudentsByPracticeResponse> {
        return await this.sessionGrpcServiceClient.GetStudentsByPractice(request);
    }
   
    async UpdateStudentStatus(request: UpdateStudentStatusRequest): Promise<UpdateStudentStatusResponse> {
        return await this.sessionGrpcServiceClient.UpdateStudentStatus(request);
    }
    
    async TestStatus(request: TestStatusRequest): Promise<TestStatusResponse> {
        return await this.sessionGrpcServiceClient.TestStatus(request);
    }
    
    async CreateSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
        return await this.sessionGrpcServiceClient.CreateSession(request);
    }

    async UpdateSession(request: UpdateSessionRequest): Promise<UpdateSessionResponse> {
        return await this.sessionGrpcServiceClient.UpdateSession(request);
    }
    
}