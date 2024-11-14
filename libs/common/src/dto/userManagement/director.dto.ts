import { StepIndex } from "aws-sdk/clients/databrew";

export class GetDashboardSummaryReq {
    id: string;
    passingYear: string;
}

class Summary {
    count: number;
    diff: number;
}

export class GetDashboardSummaryRes {
    student: Summary;
    teacher: Summary;
    course: Summary;
    attempt: Summary;
    test: Summary;
}

export class GetLoginTrendByClassroomReq {
    id: string;
    passingYear: string;
}

export class GetLoginTrendByClassroomRes {
    _id: string;
    data: number[];
    labels: string[];
}

export class GetPostTrendByLocationReq extends GetDashboardSummaryReq {

}

class Label {
    date: string;
}

export class GetPostTrendByLocationRes {
    _id: string;
    data: number[];
    labels: Label[]
}

export class GetMostAttemptedStudentReq {
    id: string;
    passingYear: string;
}

class MostAttempt {
    _id: string;
    attempts: number;
    tests: number;
    name: string;
}

export class GetMostAttemptedStudentRes {
    response: MostAttempt[];
}

export class GetQuestionAddedTrendReq {
    id: string;
}

export class GetQuestionAddedTrendRes {
    response: string;
}

export class GetAttemptTrendReq {
    locId: string;
    days: string;
    passingYear: string;
}

export class GetAttemptTrendRes {
    response: string;
}

export class GetAbandonedAttemptTrendReq {
    locId: string;
    days: string;
    passingYear: string;
}

export class GetAbandonedAttemptTrendRes {
    response: string;
}

export class GetAvgTimeSpendByCourseReq {
    id: string;
    passingYear: string;
    subject: string;
}

export class GetAvgTimeSpendByCourseRes {
    repsonse: string;
}

export class GetStudentOnboardingDistributionReq {
    id: string;
    passingYear: string;
}

class StudentOnboard {
    _id: string;
    loginCount: number;
    attemptCount: number;
    neverLoginCount: number;
}

export class GetStudentOnboardingDistributionRes {
    response: StudentOnboard[]
}

export class GetTestSeriesAttemptTrendBySubjectReq {
    locId: string;
    subject: string;
    passingYear: string;
    days: string;
}

export class GetTestSeriesAttemptTrendBySubjectRes {
    _id: string;
    students: string[];
    avgTimes: number[];
    labels: string[];
}