import { Controller } from "@nestjs/common";
import { CertificateService } from "./certificate.service";
import { protobufCertificateService } from "@app/common/grpc-clients/question-bank";
import { GrpcMethod } from "@nestjs/microservices";
import { CreateCertificateRequest, GetPublicProfileCertificatesRequest, IndexRequest, IndexResponse } from "@app/common/dto/question-bank.dto";

@Controller()
export class CertificateController {
    constructor(private readonly certificateService: CertificateService) { }

    @GrpcMethod(protobufCertificateService, 'Index')
    index(request: IndexRequest) {
        return this.certificateService.index(request);
    }
    
    @GrpcMethod(protobufCertificateService, 'Create')
    create(request: CreateCertificateRequest) {
        return this.certificateService.create(request);
    }
    
    @GrpcMethod(protobufCertificateService, 'GetPublicProfileCertificates')
    getPublicProfileCertificates(request: GetPublicProfileCertificatesRequest) {
        return this.certificateService.getPublicProfileCertificates(request);
    }

}