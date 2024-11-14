import { Empty, UserAttemptDetailsReq } from '@app/common/dto/administration';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufBoardInfinityService = 'AdministrationGrpcService';

export interface BoardInfinityGrpcInterface {
    InfinityUserAttemptDetails(request: UserAttemptDetailsReq): Promise<Empty>;
    
}

@Injectable()
export class BoardInfinityGrpcServiceClientImpl implements BoardInfinityGrpcInterface {
    private boardInfinityGrpcServiceClient: BoardInfinityGrpcInterface;
    private readonly logger = new Logger(BoardInfinityGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private boardInfinityGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.boardInfinityGrpcServiceClient =
            this.boardInfinityGrpcClient.getService<BoardInfinityGrpcInterface>(
                protobufBoardInfinityService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async InfinityUserAttemptDetails(request: UserAttemptDetailsReq): Promise<Empty> {
        return await this.boardInfinityGrpcServiceClient.InfinityUserAttemptDetails(request);
    }
}
