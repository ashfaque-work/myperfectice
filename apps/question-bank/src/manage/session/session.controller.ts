import { Controller } from "@nestjs/common";
import { SessionService } from "./session.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufSessionService } from "@app/common/grpc-clients/question-bank";
import { CreateSessionRequest, CreateSessionResponse, FilterTestListsRequest, FilterTestListsResponse, GetPracticesBySessionRequest, GetPracticesBySessionResponse, GetSessionByIdRequest, GetSessionByIdResponse, GetSessionDetailsRequest, GetSessionDetailsResponse, GetSessionsRequest, GetSessionsResponse, GetStudentsByPracticeRequest, GetStudentsByPracticeResponse, TestStatusRequest, TestStatusResponse, UpdateSessionRequest, UpdateSessionResponse, UpdateStudentStatusRequest, UpdateStudentStatusResponse } from "@app/common/dto/question-bank.dto";

@Controller()
export class SessionController {
    constructor(private readonly sessionService: SessionService) { }

    @GrpcMethod(protobufSessionService, 'FilterTestLists')
    filterTestLists(request: FilterTestListsRequest): Promise<FilterTestListsResponse> {
        return this.sessionService.filterTestLists(request);
    }
    
    @GrpcMethod(protobufSessionService, 'GetSessions')
    getSessions(request: GetSessionsRequest): Promise<GetSessionsResponse> {
        return this.sessionService.getSessions(request);
    }
    
    @GrpcMethod(protobufSessionService, 'GetSessionById')
    getSessionById(request: GetSessionByIdRequest): Promise<GetSessionByIdResponse> {
        return this.sessionService.getSessionById(request);
    }
    
    @GrpcMethod(protobufSessionService, 'GetSessionDetails')
    getSessionDetails(request: GetSessionDetailsRequest): Promise<GetSessionDetailsResponse> {
        return this.sessionService.getSessionDetails(request);
    }
    
    @GrpcMethod(protobufSessionService, 'GetPracticesBySession')
    getPracticesBySession(request: GetPracticesBySessionRequest): Promise<GetPracticesBySessionResponse> {
        return this.sessionService.getPracticesBySession(request);
    }
    
    @GrpcMethod(protobufSessionService, 'GetStudentsByPractice')
    getStudentsByPractice(request: GetStudentsByPracticeRequest): Promise<GetStudentsByPracticeResponse> {
        return this.sessionService.getStudentsByPractice(request);
    }
    
    @GrpcMethod(protobufSessionService, 'UpdateStudentStatus')
    updateStudentStatus(request: UpdateStudentStatusRequest): Promise<UpdateStudentStatusResponse> {
        return this.sessionService.updateStudentStatus(request);
    }
    
    @GrpcMethod(protobufSessionService, 'TestStatus')
    testStatus(request: TestStatusRequest): Promise<TestStatusResponse> {
        return this.sessionService.testStatus(request);
    }
    
    @GrpcMethod(protobufSessionService, 'CreateSession')
    createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
        return this.sessionService.createSession(request);
    }
    
    @GrpcMethod(protobufSessionService, 'UpdateSession')
    updateSession(request: UpdateSessionRequest): Promise<UpdateSessionResponse> {
        return this.sessionService.updateSession(request);
    }    
}