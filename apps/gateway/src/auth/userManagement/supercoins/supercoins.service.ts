import { CreateSupercoinsReq, GetMembersReq, IndexSupercoinsReq, RequestStudentsReq, UpdateStatusReq, UpdateSupercoinsReq } from "@app/common/dto/userManagement/supercoins.dto";
import { SupercoinsGrpcServiceClientImpl } from "@app/common/grpc-clients/auth/supercoins";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SupercoinsService {
    constructor(private supercoinGrpcServiceClientImpl: SupercoinsGrpcServiceClientImpl) {}

    async indexSupercoins(request: IndexSupercoinsReq) {
        return this.supercoinGrpcServiceClientImpl.IndexSupercoins(request);
    }

    async updateSupercoins(request: UpdateSupercoinsReq) {
        return this.supercoinGrpcServiceClientImpl.UpdateSupercoins(request);
    }

    async createSupercoins(request: CreateSupercoinsReq) {
        return this.supercoinGrpcServiceClientImpl.CreateSupercoins(request);
    }

    async requestStudents(request: RequestStudentsReq) {
        return this.supercoinGrpcServiceClientImpl.RequestStudents(request);
    }

    async updateStatus(request: UpdateStatusReq) {
        return this.supercoinGrpcServiceClientImpl.UpdateStatus(request);
    }

    async getMembers(request: GetMembersReq) {
        return this.supercoinGrpcServiceClientImpl.GetMembers(request);
    }
}