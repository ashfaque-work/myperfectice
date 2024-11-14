import {
    CreateServiceReq, Service, FindServicesRes,
    GetServiceReq, EditServiceReq, FindServicesReq, RevokeServiceReq,
    DeleteServiceReq,
    GetTaggingForStudentsReq,
    GetTaggingForStudentsRes,
    GetTaggingServicesForStudentRes,
    GetServiceMembersReq,
    GetServiceMembersRes
} from '@app/common/dto/administration';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufServiceService = 'AdministrationGrpcService';

export interface ServiceGrpcInterface {
    CreateService(request: CreateServiceReq): Promise<Service>;
    GetTaggingForStudents(request: GetTaggingForStudentsReq): Promise<GetTaggingForStudentsRes>;
    RevokeService(request: RevokeServiceReq): Promise<Service>;
    PublishService(request: RevokeServiceReq): Promise<Service>;
    EditService(request: EditServiceReq): Promise<Service>;
    DeleteService(request: DeleteServiceReq): Promise<Service>;
    FindServices(request: FindServicesReq): Promise<FindServicesRes>;
    FindPublicServices(request: FindServicesReq): Promise<FindServicesRes>;
    GetServiceMembers(request: GetServiceMembersReq): Promise<GetServiceMembersRes>;
    GetTaggingServicesForStudent(request: GetServiceReq): Promise<GetTaggingServicesForStudentRes>;
    GetService(request: GetServiceReq): Promise<Service>;
}

@Injectable()
export class ServiceGrpcServiceClientImpl implements ServiceGrpcInterface {
    private serviceGrpcServiceClient: ServiceGrpcInterface;
    private readonly logger = new Logger(ServiceGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private serviceGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.serviceGrpcServiceClient =
            this.serviceGrpcClient.getService<ServiceGrpcInterface>(
                protobufServiceService
            );
        this.logger.debug('gRPC client initialized.');
    }
    
    async CreateService(request: CreateServiceReq): Promise<Service> {
        return await this.serviceGrpcServiceClient.CreateService(request);
    }

    async GetTaggingForStudents(request: GetTaggingForStudentsReq): Promise<GetTaggingForStudentsRes> {
        return await this.serviceGrpcServiceClient.GetTaggingForStudents(request);
    }

    async RevokeService(request: RevokeServiceReq): Promise<Service> {
        return await this.serviceGrpcServiceClient.RevokeService(request);
    }

    async PublishService(request: RevokeServiceReq): Promise<Service> {
        return await this.serviceGrpcServiceClient.PublishService(request);
    }

    async EditService(request: EditServiceReq): Promise<Service> {
        return await this.serviceGrpcServiceClient.EditService(request);
    }
    
    async DeleteService(request: DeleteServiceReq): Promise<Service> {
        return await this.serviceGrpcServiceClient.DeleteService(request);
    }

    async FindServices(request: FindServicesReq): Promise<FindServicesRes> {
        return await this.serviceGrpcServiceClient.FindServices(request);
    }

    async FindPublicServices(request: FindServicesReq): Promise<FindServicesRes> {
        return await this.serviceGrpcServiceClient.FindPublicServices(request);
    }

    async GetServiceMembers(request: GetServiceMembersReq): Promise<GetServiceMembersRes> {
        return await this.serviceGrpcServiceClient.GetServiceMembers(request);
    }

    async GetTaggingServicesForStudent(request: GetServiceReq): Promise<GetTaggingServicesForStudentRes> {
        return await this.serviceGrpcServiceClient.GetTaggingServicesForStudent(request);
    }

    async GetService(request: GetServiceReq): Promise<Service> {
        return await this.serviceGrpcServiceClient.GetService(request);
    }

    
}
