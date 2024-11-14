import {
    FindCodesnippetReq, Empty, GetCodeByUIDReq, UpdateCodesnippetReq, ChangePairCodingReq,
    CreateCodesnippetReq, DeleteCodesnippetReq
} from '@app/common/dto/administration';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufCodesnippetService = 'AdministrationGrpcService';

export interface CodesnippetGrpcInterface {
    FindCodesnippet(request: FindCodesnippetReq): Promise<Empty>;
    GetCodeByUID(request: GetCodeByUIDReq): Promise<Empty>;
    UpdateCodesnippet(request: UpdateCodesnippetReq): Promise<Empty>;
    ChangePairCoding(request: ChangePairCodingReq): Promise<Empty>;
    CreateCodesnippet(request: CreateCodesnippetReq): Promise<Empty>;
    DeleteCodesnippet(request: DeleteCodesnippetReq): Promise<Empty>;
}

@Injectable()
export class CodesnippetGrpcServiceClientImpl implements CodesnippetGrpcInterface {
    private codesnippetGrpcServiceClient: CodesnippetGrpcInterface;
    private readonly logger = new Logger(CodesnippetGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private codesnippetGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.codesnippetGrpcServiceClient =
            this.codesnippetGrpcClient.getService<CodesnippetGrpcInterface>(
                protobufCodesnippetService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async FindCodesnippet(request: FindCodesnippetReq): Promise<Empty> {
        return await this.codesnippetGrpcServiceClient.FindCodesnippet(request);
    }

    async GetCodeByUID(request: GetCodeByUIDReq): Promise<Empty> {
        return await this.codesnippetGrpcServiceClient.GetCodeByUID(request);
    }

    async UpdateCodesnippet(request: UpdateCodesnippetReq): Promise<Empty> {
        return await this.codesnippetGrpcServiceClient.UpdateCodesnippet(request);
    }

    async ChangePairCoding(request: ChangePairCodingReq): Promise<Empty> {
        return await this.codesnippetGrpcServiceClient.ChangePairCoding(request);
    }

    async CreateCodesnippet(request: CreateCodesnippetReq): Promise<Empty> {
        return await this.codesnippetGrpcServiceClient.CreateCodesnippet(request);
    }

    async DeleteCodesnippet(request: DeleteCodesnippetReq): Promise<Empty> {
        return await this.codesnippetGrpcServiceClient.DeleteCodesnippet(request);
    }
}
