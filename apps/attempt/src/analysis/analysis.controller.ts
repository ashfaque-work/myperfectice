import { Controller } from "@nestjs/common";
import { AnalysisService } from "./analysis.service";
import { GrpcMethod } from "@nestjs/microservices";
import { protobufAnalysisService } from "@app/common/grpc-clients/attempt";
import { AllFirstQuestionsDetailReq, GetTimeWastedReq, PeakTimeAndDurationReq } from "@app/common/dto/analysis.dto";

@Controller()
export class AnalysisController {
    constructor(private readonly analysisService: AnalysisService) { }

    @GrpcMethod(protobufAnalysisService, 'PeakTimeAndDuration')
    peakTimeAndDuration(request: PeakTimeAndDurationReq) {
        return this.analysisService.peakTimeAndDuration(request)
    }

    @GrpcMethod(protobufAnalysisService, 'AllFirstQuestionsDetail')
    allFirstQuestionsDetail(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.allFirstQuestionsDetail(request)
    }

    @GrpcMethod(protobufAnalysisService, 'AveragePeakTimeAndDuration')
    averagePeakTimeAndDuration(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.averagePeakTimeAndDuration(request)
    }

    @GrpcMethod(protobufAnalysisService, 'QuestionsExceedAvgTime')
    questionsExceedAvgTime(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.questionsExceedAvgTime(request)
    }

    @GrpcMethod(protobufAnalysisService, 'FirstQuestionDetail')
    firstQuestionDetail(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.firstQuestionDetail(request)
    }

    @GrpcMethod(protobufAnalysisService, 'QuestionsWithExceedTimeFlag')
    questionsWithExceedTimeFlag(request: PeakTimeAndDurationReq) {
        return this.analysisService.questionsWithExceedTimeFlag(request)
    }

    @GrpcMethod(protobufAnalysisService, 'TopicsUserExceedAvgTime')
    topicsUserExceedAvgTime(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.topicsUserExceedAvgTime(request)
    }

    @GrpcMethod(protobufAnalysisService, 'UnitUserExceedAvgTime')
    unitUserExceedAvgTime(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.unitUserExceedAvgTime(request)
    }

    @GrpcMethod(protobufAnalysisService, 'AvoidUnitsOfUser')
    avoidUnitsOfUser(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.avoidUnitsOfUser(request)
    }

    @GrpcMethod(protobufAnalysisService, 'AvoidTopicsOfUser')
    avoidTopicsOfUser(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.avoidTopicsOfUser(request)
    }

    @GrpcMethod(protobufAnalysisService, 'MissedQuesAndPossibleMarks')
    missedQuesAndPossibleMarks(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.missedQuesAndPossibleMarks(request)
    }

    @GrpcMethod(protobufAnalysisService, 'GetTimeWasted')
    getTimeWasted(request: GetTimeWastedReq) {
        return this.analysisService.getTimeWasted(request)
    }

    @GrpcMethod(protobufAnalysisService, 'GetStrengthAndWeekness')
    getStrengthAndWeekness(request: GetTimeWastedReq) {
        return this.analysisService.getStrengthAndWeekness(request)
    }

    @GrpcMethod(protobufAnalysisService, 'GetTopStrengthAndWeakness')
    getTopStrengthAndWeakness(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.getTopStrengthAndWeakness(request)
    }

    @GrpcMethod(protobufAnalysisService, 'GetCourseProgress')
    getCourseProgress(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.getCourseProgress(request)
    }

    @GrpcMethod(protobufAnalysisService, 'GetTestseriesProgress')
    getTestseriesProgress(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.getTestseriesProgress(request)
    }

    @GrpcMethod(protobufAnalysisService, 'GetPracticeEffort')
    getPracticeEffort(request: AllFirstQuestionsDetailReq) {
        return this.analysisService.getPracticeEffort(request)
    }


}