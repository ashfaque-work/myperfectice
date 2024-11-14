import { ChangeActiveInstituteReq, CheckAvailibilityReq, CreateInstituteReq, GetAllLocationsReq, GetInstituteInviteesReq, GetInstituteReq, GetMyInstitutesReq, GetMyOwnInstituteReq, GetProfileProgramsReq, GetPublicProfileReq, InviteToJoinReq, JoinInstituteReq, LeaveInstituteReq, SetDefaultReq, UpdateInstitutePreferncesReq, UpdateInstituteReq } from "@app/common/dto/userManagement/institute.dto";
import { protobufInstituteService } from "@app/common/grpc-clients/auth/institute";
import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { InstituteService } from "./institute.service";

@Controller()
export class InstituteController {
    constructor(private readonly instituteService: InstituteService) {}

    @GrpcMethod(protobufInstituteService, 'GetMyInstitutes')
    async getMyInstitutes(request: GetMyInstitutesReq) {
        return this.instituteService.getMyInstitutes(request);
    }

    @GrpcMethod(protobufInstituteService, 'GetMyOwnInstitute')
    async getMyOwnInstitute(request: GetMyOwnInstituteReq) {
        return this.instituteService.getMyOwnInstitute(request);
    }

    @GrpcMethod(protobufInstituteService, 'GetAllLocations')
    async getAllLocations(request: GetAllLocationsReq) {
        return this.instituteService.getAllLocations(request);
    }

    @GrpcMethod(protobufInstituteService, 'GetInstitute')
    async getInstitute(request: GetInstituteReq) {
        return this.instituteService.getInstitute(request);
    }

    @GrpcMethod(protobufInstituteService, 'GetProfilePrograms')
    async getProfilePrograms(request: GetProfileProgramsReq) {
        return this.instituteService.getProfilePrograms(request);
    }

    @GrpcMethod(protobufInstituteService, 'CheckAvailibility')
    async checkAvailibility(request: CheckAvailibilityReq) {
        return this.instituteService.checkAvailibility(request);
    }

    @GrpcMethod(protobufInstituteService, 'GetPublicProfile')
    async getPublicProfile(request: GetPublicProfileReq) {
        return this.instituteService.getPublicProfile(request);
    }

    @GrpcMethod(protobufInstituteService, 'GetInstituteInvitees')
    async getInstituteInvitees(request: GetInstituteInviteesReq) {
        return this.instituteService.getInstituteInvitees(request);
    }

    @GrpcMethod(protobufInstituteService, 'CreateInstitute')
    async createInstitute(request: CreateInstituteReq) {
        return this.instituteService.createInstitute(request);
    }

    @GrpcMethod(protobufInstituteService, 'JoinInstitute')
    async joinInstitute(request: JoinInstituteReq) {
        return this.instituteService.joinInstitute(request);
    }

    @GrpcMethod(protobufInstituteService, 'LeaveInstitute')
    async leaveInstitute(request: LeaveInstituteReq) {
        return this.instituteService.leaveInstitute(request);
    }

    @GrpcMethod(protobufInstituteService, 'SetDefault')
    async setDefault(request: SetDefaultReq) {
        return this.instituteService.setDefault(request);
    }

    @GrpcMethod(protobufInstituteService, 'InviteToJoin')
    async inviteToJoin(request: InviteToJoinReq) {
        return this.instituteService.inviteToJoin(request);
    }

    @GrpcMethod(protobufInstituteService, 'ChangeActiveInstitute')
    async changeActiveInstitute(request: ChangeActiveInstituteReq) {
        return this.instituteService.changeActiveInstitute(request);
    }

    @GrpcMethod(protobufInstituteService, 'UpdateInstitute')
    async updateInstitute(request: UpdateInstituteReq) {
        return this.instituteService.updateInstitute(request);
    }

    @GrpcMethod(protobufInstituteService, 'UpdateInstitutePrefernces')
    async updateInstitutePrefernces(request: UpdateInstitutePreferncesReq) {
        return this.instituteService.updateInstitutePrefernces(request);
    }
}