import { GetQuestionDistributionBySubjectReq, GetQuestionDistributionBySubjectRes, OperatorQuestionAddedTrendReq, OperatorQuestionAddedTrendRes } from "@app/common/dto/userManagement/operator.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufOperatorService = 'AuthGrpcService';

export interface OperatorGrpcInterface {
    OperatorQuestionAddedTrend(request: OperatorQuestionAddedTrendReq): Promise<OperatorQuestionAddedTrendRes>;
    GetQuestionDistributionBySubject(request: GetQuestionDistributionBySubjectReq): Promise<GetQuestionDistributionBySubjectRes>;
}

@Injectable()
export class OperatorGrpcServiceClientImpl implements OperatorGrpcInterface {
    private operatorGrpcServiceClient: OperatorGrpcInterface;
    private readonly logger = new Logger(OperatorGrpcServiceClientImpl.name);

    constructor(
        @Inject('authGrpcService') private operatorGrpcClient: ClientGrpc
    ) {}

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.operatorGrpcServiceClient = this.operatorGrpcClient.getService<OperatorGrpcInterface>(protobufOperatorService)
        this.logger.debug('gRPC client initialized');
    }

    async OperatorQuestionAddedTrend(request: OperatorQuestionAddedTrendReq): Promise<OperatorQuestionAddedTrendRes> {
        return await this.operatorGrpcServiceClient.OperatorQuestionAddedTrend(request);
    }

    async GetQuestionDistributionBySubject(request: GetQuestionDistributionBySubjectReq): Promise<GetQuestionDistributionBySubjectRes> {
        return await this.operatorGrpcServiceClient.GetQuestionDistributionBySubject(request)
    }
}