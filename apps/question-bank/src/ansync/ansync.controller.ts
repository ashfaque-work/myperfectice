import { Controller } from "@nestjs/common";
import { AnsyncService } from "./ansync.service";
import { protobufAnsyncService } from "@app/common/grpc-clients/question-bank";
import { GrpcMethod } from "@nestjs/microservices";
import { AnsyncAllRequest, AnsyncAllResponse } from "@app/common/dto/question-bank.dto";

@Controller()
export class AnsyncController {
    constructor(private readonly ansyncService: AnsyncService) { }

    @GrpcMethod(protobufAnsyncService, 'AnsyncAll')
    ansyncAll(request: AnsyncAllRequest): Promise<AnsyncAllResponse> {
        return this.ansyncService.ansyncAll(request);
    }

}