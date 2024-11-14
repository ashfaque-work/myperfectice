import { Controller } from "@nestjs/common";
import { SupercoinsService } from "./supercoins.service";
import { protobufSupercoinsService } from "@app/common/grpc-clients/auth/supercoins";
import { GrpcMethod } from "@nestjs/microservices";
import { CreateSupercoinsReq, GetMembersReq, IndexSupercoinsReq, RequestStudentsReq, UpdateStatusReq, UpdateSupercoinsReq } from "@app/common/dto/userManagement/supercoins.dto";

@Controller()
export class SupercoinsController {
    constructor(private readonly supercoinsService: SupercoinsService) {}

    @GrpcMethod(protobufSupercoinsService, 'IndexSupercoins')
    async indexSupercoins(request: IndexSupercoinsReq) {
        return this.supercoinsService.indexSupercoins(request);
    }

    @GrpcMethod(protobufSupercoinsService, 'UpdateSupercoins')
    async updateSupercoins(request: UpdateSupercoinsReq) {
        return this.supercoinsService.updateSupercoins(request);
    }

    @GrpcMethod(protobufSupercoinsService, 'CreateSupercoins')
    async createSupercoins(request: CreateSupercoinsReq) {
        return this.supercoinsService.createSupercoins(request);
    }

    @GrpcMethod(protobufSupercoinsService, 'RequestStudents')
    async requestStudents(request: RequestStudentsReq) {
        return this.supercoinsService.requestStudents(request);
    }

    @GrpcMethod(protobufSupercoinsService, 'UpdateStatus')
    async updateStatus(request: UpdateStatusReq) {
        return this.supercoinsService.updateStatus(request);
    }

    @GrpcMethod(protobufSupercoinsService, 'GetMembers')
    async getMembers(request: GetMembersReq) {
        return this.supercoinsService.getMembers(request);
    }
}