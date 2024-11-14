import { CreateCertificateRequest, GetPublicProfileCertificatesRequest, IndexRequest } from '@app/common/dto/question-bank.dto';
import { CertificateGrpcServiceClientImpl } from '@app/common/grpc-clients/question-bank';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CertificateService {
    constructor(private certificateGrpcServiceClientImpl: CertificateGrpcServiceClientImpl ) {}
    
    async index(request: IndexRequest) {
        return this.certificateGrpcServiceClientImpl.Index(request);
    }
    
    async create(request: CreateCertificateRequest) {
        return this.certificateGrpcServiceClientImpl.Create(request);
    }
    
    async getPublicProfileCertificates(request: GetPublicProfileCertificatesRequest) {
        return this.certificateGrpcServiceClientImpl.GetPublicProfileCertificates(request);
    }
    
    
}