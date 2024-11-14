import { Controller } from "@nestjs/common";
import { OperatorService } from "./operator.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufOperatorService } from "@app/common/grpc-clients/auth/operator";
import { GetQuestionDistributionBySubjectReq, OperatorQuestionAddedTrendReq } from "@app/common/dto/userManagement/operator.dto";

@Controller()
export class OperatorController {
    constructor(private readonly operatorService: OperatorService) {}

    @GrpcMethod(protobufOperatorService, 'OperatorQuestionAddedTrend')
    async operatorQuestionAddedTrend(request: OperatorQuestionAddedTrendReq) {
        console.log("operator microservice controller")
        return this.operatorService.operatorQuestionAddedTrend(request);
    }

    @GrpcMethod(protobufOperatorService, 'GetQuestionDistributionBySubject')
    async getQuestionDistributedBySubject(request: GetQuestionDistributionBySubjectReq) {
        return this.operatorService.getQuestionDistributedBySubject(request);
    }
}