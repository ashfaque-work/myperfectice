import { BackpackReq, Backpack, DeleteBackpackReq, GetBackpackRes, UpdateBackpackReq } from '@app/common/dto/administration';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufBackpackService = 'AdministrationGrpcService';

export interface BackpackGrpcInterface {
    GetBackpack(request: BackpackReq): Promise<GetBackpackRes>;
    UpdateBackpack(request: UpdateBackpackReq): Promise<Backpack>;
    DeleteBackpack(request: DeleteBackpackReq): Promise<Backpack>;
    CreateBackpack(request: BackpackReq): Promise<Backpack>;
}

@Injectable()
export class BackpackGrpcServiceClientImpl implements BackpackGrpcInterface {
    private backpackGrpcServiceClient: BackpackGrpcInterface;
    private readonly logger = new Logger(BackpackGrpcServiceClientImpl.name);

    constructor(@Inject('administrationGrpcService') private backpackGrpcClient: ClientGrpc) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.backpackGrpcServiceClient =
            this.backpackGrpcClient.getService<BackpackGrpcInterface>(
                protobufBackpackService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async GetBackpack(request: BackpackReq): Promise<GetBackpackRes> {
        return await this.backpackGrpcServiceClient.GetBackpack(request);
    }

    async UpdateBackpack(request: UpdateBackpackReq): Promise<Backpack> {
        return await this.backpackGrpcServiceClient.UpdateBackpack(request);
    }

    async DeleteBackpack(request: DeleteBackpackReq): Promise<Backpack> {
        return await this.backpackGrpcServiceClient.DeleteBackpack(request);
    }

    async CreateBackpack(request: BackpackReq): Promise<Backpack> {
        return await this.backpackGrpcServiceClient.CreateBackpack(request);
    }
}
