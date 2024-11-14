import { Empty, GetContactReq, ImportGSTReq, TestSendMailReq } from '@app/common/dto/administration';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufToolService = 'AdministrationGrpcService';

export interface ToolGrpcInterface {
    ImportGST(request: ImportGSTReq): Promise<Empty>;
    GetContact(request: GetContactReq): Promise<Empty>;
}

@Injectable()
export class ToolGrpcServiceClientImpl implements ToolGrpcInterface {
    private toolGrpcServiceClient: ToolGrpcInterface;
    private readonly logger = new Logger(ToolGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private toolGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.toolGrpcServiceClient =
            this.toolGrpcClient.getService<ToolGrpcInterface>(
                protobufToolService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async ImportGST(request: ImportGSTReq): Promise<Empty> {
        return await this.toolGrpcServiceClient.ImportGST(request);
    }

    async GetContact(request: GetContactReq): Promise<Empty> {
        return await this.toolGrpcServiceClient.GetContact(request);
    }
}
