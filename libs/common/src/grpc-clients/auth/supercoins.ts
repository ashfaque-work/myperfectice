import { CreateSupercoinsReq, CreateSupercoinsRes, GetMembersReq, GetMembersRes, IndexSupercoinsReq, IndexSupercoinsRes, RequestStudentsReq, RequestStudentsRes, UpdateStatusReq, UpdateStatusRes, UpdateSupercoinsReq, UpdateSupercoinsRes } from "@app/common/dto/userManagement/supercoins.dto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";

export const protobufSupercoinsService = 'AuthGrpcService';

export interface SupercoinsGrpcInterface {
    IndexSupercoins(request: IndexSupercoinsReq): Promise<IndexSupercoinsRes>;
    UpdateSupercoins(request: UpdateSupercoinsReq): Promise<UpdateSupercoinsRes>;
    CreateSupercoins(request: CreateSupercoinsReq): Promise<CreateSupercoinsRes>;
    RequestStudents(request: RequestStudentsReq): Promise<RequestStudentsRes>;
    UpdateStatus(request: UpdateStatusReq): Promise<UpdateStatusRes>;
    GetMembers(request: GetMembersReq): Promise<GetMembersRes>;
}

@Injectable()
export class SupercoinsGrpcServiceClientImpl implements SupercoinsGrpcInterface {
    private supercoinsGrpcServiceClient: SupercoinsGrpcInterface;
    private readonly logger = new Logger(SupercoinsGrpcServiceClientImpl.name)

    constructor(
        @Inject('authGrpcService') private supercoinsGrpcClient: ClientGrpc 
    ) {}

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.supercoinsGrpcServiceClient = this.supercoinsGrpcClient.getService<SupercoinsGrpcInterface>(protobufSupercoinsService)
        this.logger.debug('gRPC client initialized');
    }

    async IndexSupercoins(request: IndexSupercoinsReq): Promise<IndexSupercoinsRes> {
        return await this.supercoinsGrpcServiceClient.IndexSupercoins(request);
    }

    async UpdateSupercoins(request: UpdateSupercoinsReq): Promise<UpdateSupercoinsRes> {
        return await this.supercoinsGrpcServiceClient.UpdateSupercoins(request);
    }

    async CreateSupercoins(request: CreateSupercoinsReq): Promise<CreateSupercoinsRes> {
        return await this.supercoinsGrpcServiceClient.CreateSupercoins(request);
    }

    async RequestStudents(request: RequestStudentsReq): Promise<RequestStudentsRes> {
        return await this.supercoinsGrpcServiceClient.RequestStudents(request);
    }

    async UpdateStatus(request: UpdateStatusReq): Promise<UpdateStatusRes> {
        return await this.supercoinsGrpcServiceClient.UpdateStatus(request);
    }

    async GetMembers(request: GetMembersReq): Promise<GetMembersRes> {
        return await this.supercoinsGrpcServiceClient.GetMembers(request);
    }
}