import { GetQuestionDistributionBySubjectReq, OperatorQuestionAddedTrendReq } from "@app/common/dto/userManagement/operator.dto";
import { OperatorGrpcServiceClientImpl } from "@app/common/grpc-clients/auth/operator";
import { Injectable } from "@nestjs/common";

@Injectable()
export class OperatorService {
    constructor(private operatorGrpcServiceClientImpl: OperatorGrpcServiceClientImpl) {}

    async operatorQuestionAddedTrend(request: OperatorQuestionAddedTrendReq) {
        console.log("operator gw service")
        return this.operatorGrpcServiceClientImpl.OperatorQuestionAddedTrend(request);
    }

    async getQuestionDistributionBySubject(request: GetQuestionDistributionBySubjectReq) {
        return this.operatorGrpcServiceClientImpl.GetQuestionDistributionBySubject(request);
    }
}