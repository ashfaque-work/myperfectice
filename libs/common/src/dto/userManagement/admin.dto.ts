import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsNumberString, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { GetUserResponse, ReqUser } from "../user.dto";
import { Type } from "class-transformer";

export interface Empty { }

class Query {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    directDownload?: boolean;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    download?: boolean;
    @IsOptional()
    @IsString()
    subject?: string;
    @IsOptional()
    @IsString()
    classroom?: string;
    @IsOptional()
    @IsString()
    text?: string;
    @IsOptional()
    @IsString()
    period?: string;
    @IsOptional()
    @IsString()
    classrooms?: string;
    @IsOptional()
    @IsString()
    type?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    statistic?: boolean;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    active?: boolean;
    @IsOptional()
    @IsNumberString()
    limit?: number;
    @IsOptional()
    @IsNumberString()
    skip?: number;
    @IsOptional()
    @IsString()
    searchText?: string;
    @IsOptional()
    @IsString()
    deleteUrl?: string;
}

export class ExportExamDataWordTemplateReq {
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    instancekey: string;
    _id: string;
}

export class Report {
    name: string;
    statusCode: number;
}

export class GetReportDataReq {
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    instancekey: string;
    api: string;
}
export class GetReportDataRes {
    message: string;
}

export class GetReportsReq {
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    instancekey: string;
    user: ReqUser;
}
export class GetReportsRes {
    message: string;
}

export class GetReportReq {
    _id: string;
    instancekey: string;
}

export class GetPowerBIEmbedTokenReq {
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    _id: string;
    instancekey: string;
}
export class GetPowerBIEmbedTokenRes {
    message: string;
}

export class DownloadReportRes {
    message: string;
}

export class GetMailTemplatesReq {
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    instancekey: string;
}
export class GetMailTemplatesRes {
    message: string;
}

class Body {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    key: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    sms: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    body: string;
}
export class SendBulkMailReq {
    @ApiProperty({ type: Body })
    @IsOptional()
    body?: Body;
    instancekey: string;
}
export class SendBulkMailRes {
    message: string;
}

export class RunBulkMailDataSourceReq {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    body: string;
    query?: Query;
    instancekey: string;
    user: ReqUser;
}
export class RunBulkMailDataSourceRes {
    message: string;
}

export class UpdateBulkMailReq {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    subject?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    preheader?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    body?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    sms?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    dataSource?: any;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    tags?: string[];
    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    schedule?: any;
    _id: string;
    instancekey: string;
}
export class UpdateBulkMailRes {
    message: string;
    statusCode: number;
}

export class TestBulkMailReq {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    key: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    subject?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    preheader?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    body?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    sms?: string;
    instancekey: string;
    user: ReqUser;
}
export class TestBulkMailRes {
    message: string;
    statusCode: number;
}

export class TestMailByKeyReq {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    body?: any;
    _id: string;
    instancekey: string;
    user: ReqUser;
}
export class TestMailByKeyRes {
    message: string;
    statusCode: number;
}

export class GetProgramOutcomesReq {
    instancekey: string;
}
export class ProgramOutcomesRes {
    message: string;
    statusCode: number;
}

export class CreateProgramOutcomeReq {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    code?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;
    instancekey: string;
}
export class CreateProgramOutcomeRes {
    message: string;
    statusCode: number;
}

export class UpdateProgramOutcomeReq extends CreateProgramOutcomeReq {
    _id: string;
}

export class DeleteProgramOutcomeReq {
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    _id: string;
    instancekey: string;
}


export class GetCoursesRes {
    message: string;
    statusCode: number;
}
class QuestionWeight {
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    weight?: number;
    @ApiProperty()
    @IsOptional()
    @IsString()
    question?: string;
}
class EvalOutcome {
    @ApiProperty({ type: [QuestionWeight] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionWeight)
    questionWeights?: QuestionWeight[];
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    weightage?: number;
    @ApiProperty()
    @IsOptional()
    @IsString()
    code?: string;
}
class Evaluation {
    @ApiProperty()
    @IsOptional()
    @IsString()
    evaluationCode?: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    dataSource?: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    fileName?: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    mode?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    marks?: number;
    @ApiProperty({ type: [EvalOutcome] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EvalOutcome)
    outcomes?: EvalOutcome[];
}
class Program {
    @ApiProperty()
    @IsOptional()
    @IsString()
    code?: string;
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    weightage?: number;
}
class Outcome {
    @ApiProperty()
    @IsOptional()
    @IsString()
    code?: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;
    @ApiProperty({ type: [Program] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Program)
    programs?: Program[];
}

export class CreateCourseReq {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    subject: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    code: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    definition: string;
    @ApiProperty({ type: [Evaluation] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Evaluation)
    evaluations: Evaluation[];
    @ApiProperty({ type: [Outcome] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Outcome)
    outcomes: Outcome[];
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    fileName?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    feedback?: string;
    instancekey: string;
}
export class CourseRes {
    msg: string;
    statusCode: number;
}

export class UpdateCourseReq extends CreateCourseReq {
    _id: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    status?: string;
}

export class DeleteCourseReq {
    _id: string;
    instancekey: string;
}


export class GetEvaluationsRes {
    message: string;
    statusCode: number;
}

export class CreateEvaluationReq {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    code: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    type?: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    category?: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    mode?: string;
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    questions?: number;
    instancekey: string;
}

export class UpdateEvaluationReq extends CreateEvaluationReq {
    _id: string;
}

export class DeleteEvaluationReq {
    _id: string;
    instancekey: string;
    query: Query;
}
export class EvaluationRes {
    msg: string;
    statusCode: number;
}

export class GetAccreditationSettingsReq {
    instancekey: string;
}

export class GetAccSettingRes {
    message: string;
    statusCode: number;
}
export class UpdateAccSettingReq {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    targetLevel?: number;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    directFactor?: number;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    indirectFactor?: number;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    minStudentMarks?: number;
    _id: string;
    instancekey: string;
}
export class UpdateAccSettingRes {
    message: string;
    statusCode: number;
}

export class GetAccReportReq {
    instancekey: string;
    user: ReqUser;
}
export class GetAccReportRes {
    message: string;
    statusCode: number;
}
export class GetAccAttReq {
    code: string;
    instancekey: string;
}
export class GetAccAttRes {
    message: string;
    statusCode: number;
}

export class TeacherByExamRes {
    message: string;
    statusCode: number;
}

export class GetNewsReq {
    @ApiProperty({ type: Query })
    @IsOptional()
    query?: Query;
    instancekey: string;
    user: ReqUser;
}
export class GetNewsRes {
    message: string;
    statusCode: number;
}

export class CreateNewsReq {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    description: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    link: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    imageUrl: string;
    instancekey: string;
    user: ReqUser;
}
export class UpdateNewsReq extends CreateNewsReq {
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    active?: boolean;
    _id: string;
}
export class NewsRes {
    message: string;
    statusCode: number;
}

export class MapTestToClassroomReq {
    @ApiProperty({ type: 'string', format: 'binary' })
    file?: Express.Multer.File;
    instancekey?: string;
}

export class UploadCampaignMailSourceReq {
    @ApiProperty({ type: 'string', format: 'binary' })
    file?: Express.Multer.File;
    instancekey?: string;
    _id?: string;
}