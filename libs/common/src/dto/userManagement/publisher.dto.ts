import { ReqUser } from "../user.dto";

export class IndexPublisherReq {
    user: ReqUser;
    instancekey: string;
}

class PublisherRes {
    _id: string;
    name: string;
}

export class IndexPublisherRes {
    response: PublisherRes
}

export class GetSoldDataReq {
    userId: string;
    interval: string;
    instancekey: string;
}

class SoldData {
    total: number;
    sold: number;
    revenue: number;
}

export class GetSoldDataRes {
    course: SoldData;
    testSeries: SoldData;
    assessment: SoldData;
    message: string;
}

export class GetCourseSubjectDistributionReq {
    userId: string;
    instancekey: string;
}

class SubjectData {
    _id: string;
    name: string;
}

class CourseSubject {
    _id: string;
    subject: SubjectData;
    count: number;
}

export class GetCourseSubjectDistributionRes {
    response: CourseSubject[];
    message: string;
}

export class GetTestseriesSubjectDistributionReq {
    userId: string;
    instancekey: string;
}

export class GetTestseriesSubjectDistributionRes {
    response: CourseSubject[];
    message: string;
}

export class GetAssessmetSubjectDistributionReq {
    userId: string;
    instancekey: string;
}

export class GetAssessmetSubjectDistributionRes {
    response: CourseSubject[];
    message: string;
}

export class GetQuestionSubjectDistributionReq {
    userId: string;
    instancekey: string;
}

export class GetQuestionSubjectDistributionRes {
    response: CourseSubject[];
    message: string;
}

export class TestSeriesTrendReq {
    userId: string;
    instancekey: string;
    dateFilter: string;
}

class TestSeriesId {
    testSeries: string;
    year: number;
    month: number;
    day: number;
}

class TestSeries {
    _id: TestSeriesId;
    testSeries: string;
    testSeriesId: string;
    count: number;
}

export class TestSeriesTrendRes {
    response: TestSeries[];
}

export class CourseTrendReq {
    userId: string;
    instancekey: string;
    dateFilter: string;
}

class CourseId {
    practiceset: string;
    year: number;
    month: number;
    day: number;
}

class Course {
    _id: CourseId;
    courseId: string;
    course: string;
    count: number;
}

export class CourseTrendRes {
    response: Course[];
}

export class AsessmentTrendReq {
    userId: string;
    instancekey: string;
    dateFilter: string;
}

class AsessmentId {
    practiceset: string;
    year: number;
    month: number;
    day: number;
}

class Asessment {
    _id: AsessmentId;
    testId: string;
    practiceset: string;
    count: number;
}

export class AsessmentTrendRes {
    response: Asessment[];
}

export class GetTransactionLogsReq {
    instancekey: string;
    userId: string;
    page: number;
    limit: number;
    course: string;
    testseries: string;
    practice: string;
    title: string;
    count: number
}

class MemberAvatar {
    mimeType: string;
    size: number;
    fileUrl: string;
    fileName: string;
    path: string;
    _id: string;    
}

class TransactionLog {
    name: string;
    avatar: MemberAvatar;
    userId: string;
    createdAt: string;
    type: string;
    price: number;
}

export class GetTransactionLogsRes {
    response: TransactionLog;
    message: string;
}

