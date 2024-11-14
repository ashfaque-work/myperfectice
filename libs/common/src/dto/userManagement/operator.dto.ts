import { ReqUser } from "../user.dto";

export class OperatorQuestionAddedTrendReq {
    id: string;
    user: ReqUser
}

export class OperatorQuestionAddedTrendRes {
    id: string;
    data: number[];
    labels: string[];
}

export class GetQuestionDistributionBySubjectReq {
    id: string;
    user: ReqUser;
    subject: string;
}

class DataGroup {
    name: string;
    data: number[];
}

export class GetQuestionDistributionBySubjectRes {
    labels: string[];
    mcq: DataGroup;
    fib: DataGroup
    code: DataGroup
    descriptive: DataGroup
    mixmatch: DataGroup
}