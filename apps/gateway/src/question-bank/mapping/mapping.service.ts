import { VideoForPracticeSetRequest } from '@app/common/dto/question-bank.dto';
import { MappingGrpcServiceClientImpl } from '@app/common/grpc-clients/question-bank';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MappingService {
    constructor(private mappingGrpcServiceClientImpl: MappingGrpcServiceClientImpl) { }

    async videoForPracticeSet(request: VideoForPracticeSetRequest) {
        return this.mappingGrpcServiceClientImpl.VideoForPracticeSet(request);
    }
}