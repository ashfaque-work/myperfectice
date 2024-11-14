import { FindAllStatesReq, FindSupportRes, GetInfoReq, GetInfoRes, GetStateReq, GetStateRes } from '@app/common/dto/administration';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufCountryService = 'AdministrationGrpcService';

export interface CountryGrpcInterface {
    FindSupport({}): Promise<FindSupportRes>;
    FindAllStates(request: FindAllStatesReq): Promise<GetStateRes>;
    GetInfo(request: GetInfoReq): Promise<GetInfoRes>;
    GetState(request: GetStateReq): Promise<GetStateRes>;
}

@Injectable()
export class CountryGrpcServiceClientImpl implements CountryGrpcInterface {
    private countryGrpcServiceClient: CountryGrpcInterface;
    private readonly logger = new Logger(CountryGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private countryGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.countryGrpcServiceClient =
            this.countryGrpcClient.getService<CountryGrpcInterface>(
                protobufCountryService
            );
        this.logger.debug('gRPC client initialized.');
    }


    async FindSupport({}): Promise<FindSupportRes> {        
        return await this.countryGrpcServiceClient.FindSupport({});
    }
    async FindAllStates(request: FindAllStatesReq): Promise<GetStateRes> {
        return await this.countryGrpcServiceClient.FindAllStates(request);
    }

    async GetInfo(request: GetInfoReq): Promise<GetInfoRes> {
        return await this.countryGrpcServiceClient.GetInfo(request);
    }

    async GetState(request: GetStateReq): Promise<GetStateRes> {
        return await this.countryGrpcServiceClient.GetState(request);
    }
}
