import { ChangeActiveInstituteReq, CheckAvailibilityReq, CreateInstituteReq, GetAllLocationsReq, GetInstituteInviteesReq, GetInstituteReq, GetMyInstitutesReq, GetMyOwnInstituteReq, GetProfileProgramsReq, GetPublicProfileReq, InviteToJoinReq, JoinInstituteReq, LeaveInstituteReq, SetDefaultReq, UpdateInstitutePreferncesReq, UpdateInstituteReq } from "@app/common/dto/userManagement/institute.dto";
import { InstituteGrpcServiceClientImpl } from "@app/common/grpc-clients/auth/institute";
import { Injectable } from "@nestjs/common";

@Injectable()
export class InstituteService {
    constructor(private instituteGrpcServiceClientImpl: InstituteGrpcServiceClientImpl) {}

    async getMyInstitutes(request: GetMyInstitutesReq) {
        return this.instituteGrpcServiceClientImpl.GetMyInstitutes(request);
    }

    async getMyOwnInstitute(request: GetMyOwnInstituteReq) {
        return this.instituteGrpcServiceClientImpl.GetMyOwnInstitute(request);
    }

    async getAllLocations(request: GetAllLocationsReq) {
        return this.instituteGrpcServiceClientImpl.GetAllLocations(request);
    }

    async getInstitute(request: GetInstituteReq) {
        return this.instituteGrpcServiceClientImpl.GetInstitute(request);
    }

    async getProfilePrograms(request: GetProfileProgramsReq) {
        return this.instituteGrpcServiceClientImpl.GetProfilePrograms(request);
    }

    async checkAvailibility(request: CheckAvailibilityReq) {
        return this.instituteGrpcServiceClientImpl.CheckAvailibility(request);
    }

    async getPublicProfile(request: GetPublicProfileReq) {
        return this.instituteGrpcServiceClientImpl.GetPublicProfile(request);
    }

    async getInstituteInvitees(request: GetInstituteInviteesReq) {
        return this.instituteGrpcServiceClientImpl.GetInstituteInvitees(request);
    }

    async createInstitute(request: CreateInstituteReq) {
        return this.instituteGrpcServiceClientImpl.CreateInstitute(request);
    }

    async joinInstitute(request: JoinInstituteReq) {
        return this.instituteGrpcServiceClientImpl.JoinInstitute(request);
    }

    async leaveInstitute(request: LeaveInstituteReq) {
        return this.instituteGrpcServiceClientImpl.LeaveInstitute(request);
    }

    async setDefault(request: SetDefaultReq) {
        return this.instituteGrpcServiceClientImpl.SetDefault(request);
    }

    async inviteToJoin(request: InviteToJoinReq) {
        return this.instituteGrpcServiceClientImpl.InviteToJoin(request);
    }

    async changeActiveInstitute(request: ChangeActiveInstituteReq) {
        return this.instituteGrpcServiceClientImpl.ChangeActiveInstitute(request);
    }

    async updateInstitute(request: UpdateInstituteReq) {
        return this.instituteGrpcServiceClientImpl.UpdateInstitute(request);
    }

    async updateInstitutePrefernces(request: UpdateInstitutePreferncesReq) {
        return this.instituteGrpcServiceClientImpl.UpdateInstitutePrefernces(request);
    }
}