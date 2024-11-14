import { ChangeActiveInstituteReq, ChangeActiveInstituteRes, CheckAvailibilityReq, CheckAvailibilityRes, CreateInstituteReq, CreateInstituteRes, GetAllLocationsReq, GetAllLocationsRes, GetInstituteInviteesReq, GetInstituteInviteesRes, GetInstituteReq, GetInstituteRes, GetMyInstitutesReq, GetMyInstitutesRes, GetMyOwnInstituteReq, GetMyOwnInstituteRes, GetProfileProgramsReq, GetProfileProgramsRes, GetPublicProfileReq, GetPublicProfileRes, InviteToJoinReq, InviteToJoinRes, JoinInstituteReq, JoinInstituteRes, LeaveInstituteReq, LeaveInstituteRes, SetDefaultReq, SetDefaultRes, UpdateInstitutePreferncesReq, UpdateInstitutePreferncesRes, UpdateInstituteReq, UpdateInstituteRes } from "@app/common/dto/userManagement/institute.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufInstituteService = 'AuthGrpcService';

export interface InstituteGrpcInterface {
    GetMyInstitutes(request: GetMyInstitutesReq): Promise<GetMyInstitutesRes>;
    GetMyOwnInstitute(request: GetMyOwnInstituteReq): Promise<GetMyOwnInstituteRes>;
    GetAllLocations(request: GetAllLocationsReq): Promise<GetAllLocationsRes>;
    GetInstitute(request: GetInstituteReq): Promise<GetInstituteRes>;
    GetProfilePrograms(request: GetProfileProgramsReq): Promise<GetProfileProgramsRes>;
    CheckAvailibility(request: CheckAvailibilityReq): Promise<CheckAvailibilityRes>;
    GetPublicProfile(request: GetPublicProfileReq): Promise<GetPublicProfileRes>;
    GetInstituteInvitees(request: GetInstituteInviteesReq): Promise<GetInstituteInviteesRes>;
    CreateInstitute(request: CreateInstituteReq): Promise<CreateInstituteRes>;
    JoinInstitute(request: JoinInstituteReq): Promise<JoinInstituteRes>;
    LeaveInstitute(request: LeaveInstituteReq): Promise<LeaveInstituteRes>;
    SetDefault(request: SetDefaultReq): Promise<SetDefaultRes>;
    InviteToJoin(request: InviteToJoinReq): Promise<InviteToJoinRes>;
    ChangeActiveInstitute(request: ChangeActiveInstituteReq): Promise<ChangeActiveInstituteRes>;
    UpdateInstitute(request: UpdateInstituteReq): Promise<UpdateInstituteRes>;
    UpdateInstitutePrefernces(request: UpdateInstitutePreferncesReq): Promise<UpdateInstitutePreferncesRes>;
}

@Injectable()
export class InstituteGrpcServiceClientImpl implements InstituteGrpcInterface {
    private instituteGrpcServiceClient: InstituteGrpcInterface;
    private readonly logger = new Logger(InstituteGrpcServiceClientImpl.name);

    constructor(
        @Inject('authGrpcService') private instituteGrpcClient: ClientGrpc,
    ) {}

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.instituteGrpcServiceClient = this.instituteGrpcClient.getService<InstituteGrpcInterface>(protobufInstituteService)
        this.logger.debug('gRPC client initialized');
    }

    async GetMyInstitutes(request: GetMyInstitutesReq): Promise<GetMyInstitutesRes> {
        return await this.instituteGrpcServiceClient.GetMyInstitutes(request);
    }

    async GetMyOwnInstitute(request: GetMyOwnInstituteReq): Promise<GetMyOwnInstituteRes> {
        return await this.instituteGrpcServiceClient.GetMyOwnInstitute(request);
    }

    async GetAllLocations(request: GetAllLocationsReq): Promise<GetAllLocationsRes> {
        return await this.instituteGrpcServiceClient.GetAllLocations(request);
    }

    async GetInstitute(request: GetInstituteReq): Promise<GetInstituteRes> {
        return await this.instituteGrpcServiceClient.GetInstitute(request);
    }

    async GetProfilePrograms(request: GetProfileProgramsReq): Promise<GetProfileProgramsRes> {
        return await this.instituteGrpcServiceClient.GetProfilePrograms(request);
    }

    async CheckAvailibility(request: CheckAvailibilityReq): Promise<CheckAvailibilityRes> {
        return await this.instituteGrpcServiceClient.CheckAvailibility(request);
    }

    async GetPublicProfile(request: GetPublicProfileReq): Promise<GetPublicProfileRes> {
        return await this.instituteGrpcServiceClient.GetPublicProfile(request);
    }

    async GetInstituteInvitees(request: GetInstituteInviteesReq): Promise<GetInstituteInviteesRes> {
        return await this.instituteGrpcServiceClient.GetInstituteInvitees(request);
    }

    async CreateInstitute(request: CreateInstituteReq): Promise<CreateInstituteRes> {
        return await this.instituteGrpcServiceClient.CreateInstitute(request);
    }

    async JoinInstitute(request: JoinInstituteReq): Promise<JoinInstituteRes> {
        return await this.instituteGrpcServiceClient.JoinInstitute(request);
    }

    async LeaveInstitute(request: LeaveInstituteReq): Promise<LeaveInstituteRes> {
        return await this.instituteGrpcServiceClient.LeaveInstitute(request);
    }

    async SetDefault(request: SetDefaultReq): Promise<SetDefaultRes> {
        return await this.instituteGrpcServiceClient.SetDefault(request);
    }

    async InviteToJoin(request: InviteToJoinReq): Promise<InviteToJoinRes> {
        return await this.instituteGrpcServiceClient.InviteToJoin(request);
    }

    async ChangeActiveInstitute(request: ChangeActiveInstituteReq): Promise<ChangeActiveInstituteRes> {
        return await this.instituteGrpcServiceClient.ChangeActiveInstitute(request);
    }

    async UpdateInstitute(request: UpdateInstituteReq): Promise<UpdateInstituteRes> {
        return await this.instituteGrpcServiceClient.UpdateInstitute(request);
    }

    async UpdateInstitutePrefernces(request: UpdateInstitutePreferncesReq): Promise<UpdateInstitutePreferncesRes> {
        return await this.instituteGrpcServiceClient.UpdateInstitutePrefernces(request);
    }
}