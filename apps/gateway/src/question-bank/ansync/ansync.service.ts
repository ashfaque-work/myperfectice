import { AnsyncAllRequest } from '@app/common/dto/question-bank.dto';
import { AnsyncGrpcServiceClientImpl } from '@app/common/grpc-clients/question-bank';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnsyncService {
    constructor(private ansyncGrpcServiceClientImpl: AnsyncGrpcServiceClientImpl ) {}
    
    async ansyncAll(request: AnsyncAllRequest) {
        return this.ansyncGrpcServiceClientImpl.AnsyncAll(request);
    }
    
    
}