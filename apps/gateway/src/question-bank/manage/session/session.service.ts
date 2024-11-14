import { CreateSessionRequest, FilterTestListsRequest, GetPracticesBySessionRequest, GetSessionByIdRequest, GetSessionDetailsRequest, GetSessionsRequest, GetStudentsByPracticeRequest, TestStatusRequest, UpdateSessionRequest, UpdateStudentStatusRequest } from '@app/common/dto/question-bank.dto';
import { SessionGrpcServiceClientImpl } from '@app/common/grpc-clients/question-bank';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionService {
    constructor(private sessionGrpcServiceClientImpl: SessionGrpcServiceClientImpl ) {}
    
    async filterTestLists(request: FilterTestListsRequest) {
        return this.sessionGrpcServiceClientImpl.FilterTestLists(request);
    }
    
    async getSessions(request: GetSessionsRequest) {
        return this.sessionGrpcServiceClientImpl.GetSessions(request);
    }
    
    async getSessionById(request: GetSessionByIdRequest) {
        return this.sessionGrpcServiceClientImpl.GetSessionById(request);
    }
    
    async getSessionDetails(request: GetSessionDetailsRequest) {
        return this.sessionGrpcServiceClientImpl.GetSessionDetails(request);
    }
    
    async getPracticesBySession(request: GetPracticesBySessionRequest) {
        return this.sessionGrpcServiceClientImpl.GetPracticesBySession(request);
    }
    
    async getStudentsByPractice(request: GetStudentsByPracticeRequest) {
        return this.sessionGrpcServiceClientImpl.GetStudentsByPractice(request);
    }
    
    async updateStudentStatus(request: UpdateStudentStatusRequest) {
        return this.sessionGrpcServiceClientImpl.UpdateStudentStatus(request);
    }
    
    async testStatus(request: TestStatusRequest) {
        return this.sessionGrpcServiceClientImpl.TestStatus(request);
    }
    
    async createSession(request: CreateSessionRequest) {
        return this.sessionGrpcServiceClientImpl.CreateSession(request);
    }
    
    async updateSession(request: UpdateSessionRequest) {
        return this.sessionGrpcServiceClientImpl.UpdateSession(request);
    }
}