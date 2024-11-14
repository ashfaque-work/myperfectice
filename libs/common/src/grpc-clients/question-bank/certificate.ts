import { CreateCertificateRequest, CreateCertificateResponse, GetPublicProfileCertificatesRequest, GetPublicProfileCertificatesResponse, IndexRequest, IndexResponse } from '@app/common/dto/question-bank.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufCertificateService = 'QuestionBankGrpcService';
export interface CertificateGrpcInterface {
    Index(request: IndexRequest): Promise<IndexResponse>;
    Create(request: CreateCertificateRequest): Promise<CreateCertificateResponse>;
    GetPublicProfileCertificates(request: GetPublicProfileCertificatesRequest): Promise<GetPublicProfileCertificatesResponse>;
}
@Injectable()
export class CertificateGrpcServiceClientImpl implements CertificateGrpcInterface {
    private certificateGrpcServiceClient: CertificateGrpcInterface;
    private readonly logger = new Logger(CertificateGrpcServiceClientImpl.name)
    constructor(
        @Inject('questionBankGrpcService') private certificateGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.certificateGrpcServiceClient = this.certificateGrpcClient.getService<CertificateGrpcInterface>(
            protobufCertificateService
        );
        this.logger.debug('gRPC client initalized.');
    }

    async Index(request: IndexRequest): Promise<IndexResponse> {
        return await this.certificateGrpcServiceClient.Index(request);
    }
    
    async Create(request: CreateCertificateRequest): Promise<CreateCertificateResponse> {
        return await this.certificateGrpcServiceClient.Create(request);
    }    
    
    async GetPublicProfileCertificates(request: GetPublicProfileCertificatesRequest): Promise<GetPublicProfileCertificatesResponse> {
        return await this.certificateGrpcServiceClient.GetPublicProfileCertificates(request);
    }    
    
}