import { Controller } from "@nestjs/common";
import { MappingService } from "./mapping.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufMappingService } from "@app/common/grpc-clients/question-bank";
import { VideoForPracticeSetRequest, VideoForPracticeSetResponse } from "@app/common/dto/question-bank.dto";

@Controller()
export class MappingController {
    constructor(private readonly mappingService: MappingService) { }

    @GrpcMethod(protobufMappingService, 'VideoForPracticeSet')
    videoForPracticeSet(request: VideoForPracticeSetRequest): Promise<VideoForPracticeSetResponse> {
        return this.mappingService.videoForPracticeSet(request);
    }
      
}