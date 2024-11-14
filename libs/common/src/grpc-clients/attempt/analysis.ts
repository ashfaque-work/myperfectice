import { AllFirstQuestionsDetailReq, Empty, GetTimeWastedReq, PeakTimeAndDurationReq } from "@app/common/dto/analysis.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufAnalysisService = 'AttemptGrpcService'

export interface AnalysisGrpcInterface {
    PeakTimeAndDuration(request: PeakTimeAndDurationReq): Promise<Empty>;
    AllFirstQuestionsDetail(request: AllFirstQuestionsDetailReq): Promise<Empty>;
    AveragePeakTimeAndDuration(request: AllFirstQuestionsDetailReq): Promise<Empty>;
    QuestionsExceedAvgTime(request: AllFirstQuestionsDetailReq): Promise<Empty>;
    FirstQuestionDetail(request: AllFirstQuestionsDetailReq): Promise<Empty>;
    QuestionsWithExceedTimeFlag(request: PeakTimeAndDurationReq): Promise<Empty>;
    TopicsUserExceedAvgTime(request: AllFirstQuestionsDetailReq): Promise<Empty>;
    UnitUserExceedAvgTime(request: AllFirstQuestionsDetailReq): Promise<Empty>;
    AvoidUnitsOfUser(request: AllFirstQuestionsDetailReq): Promise<Empty>;
    AvoidTopicsOfUser(request: AllFirstQuestionsDetailReq): Promise<Empty>;
    MissedQuesAndPossibleMarks(request: AllFirstQuestionsDetailReq): Promise<Empty>;
    GetTimeWasted(request: GetTimeWastedReq): Promise<Empty>;
    GetStrengthAndWeekness(request: GetTimeWastedReq): Promise<Empty>;
    GetTopStrengthAndWeakness(request: AllFirstQuestionsDetailReq): Promise<Empty>;
    GetCourseProgress(request: AllFirstQuestionsDetailReq): Promise<Empty>;
    GetTestseriesProgress(request: AllFirstQuestionsDetailReq): Promise<Empty>;
    GetPracticeEffort(request: AllFirstQuestionsDetailReq): Promise<Empty>;
}

@Injectable()
export class AnalysisGrpcServiceClientImpl implements AnalysisGrpcInterface {
    private analysisGrpcServiceClient: AnalysisGrpcInterface;
    private readonly logger = new Logger(AnalysisGrpcServiceClientImpl.name);

    constructor(
        @Inject('attemptGrpcService') private analysisGrpcClient: ClientGrpc
    ) { }
    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.analysisGrpcServiceClient =
            this.analysisGrpcClient.getService<AnalysisGrpcInterface>(
                protobufAnalysisService,
            );
        this.logger.debug('gRPC client initialized.');
    }

    async PeakTimeAndDuration(request: PeakTimeAndDurationReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.PeakTimeAndDuration(request)
    }

    async AllFirstQuestionsDetail(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.AllFirstQuestionsDetail(request)
    }

    async AveragePeakTimeAndDuration(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.AveragePeakTimeAndDuration(request)
    }

    async QuestionsExceedAvgTime(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.QuestionsExceedAvgTime(request)
    }

    async FirstQuestionDetail(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.FirstQuestionDetail(request)
    }

    async QuestionsWithExceedTimeFlag(request: PeakTimeAndDurationReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.QuestionsWithExceedTimeFlag(request)
    }

    async TopicsUserExceedAvgTime(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.TopicsUserExceedAvgTime(request)
    }

    async UnitUserExceedAvgTime(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.UnitUserExceedAvgTime(request)
    }

    async AvoidUnitsOfUser(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.AvoidUnitsOfUser(request)
    }

    async AvoidTopicsOfUser(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.AvoidTopicsOfUser(request)
    }

    async MissedQuesAndPossibleMarks(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.MissedQuesAndPossibleMarks(request)
    }

    async GetTimeWasted(request: GetTimeWastedReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.GetTimeWasted(request)
    }

    async GetStrengthAndWeekness(request: GetTimeWastedReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.GetStrengthAndWeekness(request)
    }

    async GetTopStrengthAndWeakness(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.GetTopStrengthAndWeakness(request)
    }

    async GetCourseProgress(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.GetCourseProgress(request)
    }

    async GetTestseriesProgress(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.GetTestseriesProgress(request)
    }

    async GetPracticeEffort(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClient.GetPracticeEffort(request)
    }


}