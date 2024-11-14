import {
	CreateServiceReq, FindServicesRes, GetServiceReq, EditServiceReq, Service, 
	FindServicesReq, RevokeServiceReq, CreateServiceRes,
	DeleteServiceReq,
	GetTaggingForStudentsReq,
	GetTaggingForStudentsRes,
	GetTaggingServicesForStudentRes,
	GetServiceMembersRes,
	GetServiceMembersReq
} from '@app/common/dto/administration';
import { ServiceGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ServiceService {
	constructor(private serviceGrpcServiceClientImpl: ServiceGrpcServiceClientImpl) { }

	async findServices(request: FindServicesReq): Promise<FindServicesRes> {
		return await this.serviceGrpcServiceClientImpl.FindServices(request);
	}

	async createService(request: CreateServiceReq): Promise<CreateServiceRes> {
		return await this.serviceGrpcServiceClientImpl.CreateService(request);
	}

	async getTaggingForStudents(request: GetTaggingForStudentsReq): Promise<GetTaggingForStudentsRes> {
		return await this.serviceGrpcServiceClientImpl.GetTaggingForStudents(request);
	}

	async revokeService(request: RevokeServiceReq): Promise<Service> {
		return await this.serviceGrpcServiceClientImpl.RevokeService(request);
	}

	async publishService(request: RevokeServiceReq): Promise<Service> {
		return await this.serviceGrpcServiceClientImpl.PublishService(request);
	}

	async editService(request: EditServiceReq): Promise<Service> {
		return await this.serviceGrpcServiceClientImpl.EditService(request);
	}

	async deleteService(request: DeleteServiceReq): Promise<Service> {
		return await this.serviceGrpcServiceClientImpl.DeleteService(request);
	}

	async findPublicServices(request: FindServicesReq): Promise<FindServicesRes> {
		return await this.serviceGrpcServiceClientImpl.FindPublicServices(request);
	}

	async getServiceMembers(request: GetServiceMembersReq): Promise<GetServiceMembersRes> {
		return await this.serviceGrpcServiceClientImpl.GetServiceMembers(request);
	}

	async getTaggingServicesForStudent(request: GetServiceReq): Promise<GetTaggingServicesForStudentRes> {
		return await this.serviceGrpcServiceClientImpl.GetTaggingServicesForStudent(request);
	}

	async getService(request: GetServiceReq): Promise<Service> {
		return await this.serviceGrpcServiceClientImpl.GetService(request);
	}


}
