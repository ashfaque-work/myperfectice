import { AllFirstQuestionsDetailReq, Empty, GetTimeWastedReq, PeakTimeAndDurationReq } from "@app/common/dto/analysis.dto";
import { AnalysisGrpcServiceClientImpl } from "@app/common/grpc-clients/attempt";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AnalysisService {
    constructor(private analysisGrpcServiceClientImpl: AnalysisGrpcServiceClientImpl) { }

    async peakTimeAndDuration(request: PeakTimeAndDurationReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.PeakTimeAndDuration(request)
    }

    async allFirstQuestionsDetail(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.AllFirstQuestionsDetail(request)
    }

    async averagePeakTimeAndDuration(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.AveragePeakTimeAndDuration(request)
    }

    async questionsExceedAvgTime(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.QuestionsExceedAvgTime(request)
    }

    async firstQuestionDetail(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.FirstQuestionDetail(request)
    }

    async questionsWithExceedTimeFlag(request: PeakTimeAndDurationReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.QuestionsWithExceedTimeFlag(request)
    }

    async topicsUserExceedAvgTime(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.TopicsUserExceedAvgTime(request)
    }

    async unitUserExceedAvgTime(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.UnitUserExceedAvgTime(request)
    }

    async avoidUnitsOfUser(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.AvoidUnitsOfUser(request)
    }

    async avoidTopicsOfUser(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.AvoidTopicsOfUser(request)
    }

    async missedQuesAndPossibleMarks(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.MissedQuesAndPossibleMarks(request)
    }

    async getTimeWasted(request: GetTimeWastedReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.GetTimeWasted(request)
    }

    async getStrengthAndWeekness(request: GetTimeWastedReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.GetStrengthAndWeekness(request)
    }

    async getTopStrengthAndWeakness(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.GetTopStrengthAndWeakness(request)
    }

    async getCourseProgress(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.GetCourseProgress(request)
    }

    async getTestseriesProgress(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.GetTestseriesProgress(request)
    }

    async getPracticeEffort(request: AllFirstQuestionsDetailReq): Promise<Empty> {
        return await this.analysisGrpcServiceClientImpl.GetPracticeEffort(request)
    }


}