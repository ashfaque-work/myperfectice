import {
    SettingRequest, Setting, DeleteSettingRequest, DeleteSettingResponse, GetSettingResponse,
    GetOneSettingRequest, GetOneSettingResponse, UpdateSettingRequest, UpdateSettingResponse,
    FindOneRequest,
    FindOneResponse,
    GetCurrentDateTimeRes,
    GetCodeEngineAddressRes,
    GetWhiteLabelReq,
    GetWhiteLabelRes,
    ShowRes,
    GetDeploymentStatusRes,
    GetCountryByIpRes,
    GetCountryByIpReq,
    GetPaymentMethodsReq,
    GetPaymentMethodsRes,
    GetVideoStreamingReq,
    GetVideoStreamingRes,
    AddAdvertismentImageReq,
    AddAdvertismentImageRes,
    DeleteAdvertismentImageReq,
    DeleteAdvertismentImageRes,
    GetUpdateRequest,
    GetUpdateResponse,
    GetFindAllReq,
    GetFindAllRes,
    GetConvertCurrencyReq,
    GetConvertCurrencyRes,
    SettingResponse,
} from '@app/common/dto/administration/setting.dto';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufSettingService = 'AdministrationGrpcService';

export interface SettingGrpcInterface {
    CreateSetting(request: SettingRequest): Promise<SettingResponse>;
    GetSetting(request: {}): Promise<GetSettingResponse>;
    GetOneSetting(request: GetOneSettingRequest): Promise<GetOneSettingResponse>;
    UpdateSetting(request: UpdateSettingRequest): Promise<UpdateSettingResponse>;
    AddAdvertismentImage(request: AddAdvertismentImageReq): Promise<AddAdvertismentImageRes>;
    Update(request: GetUpdateRequest): Promise<GetUpdateResponse>;
    DeleteAdvertismentImage(request: DeleteAdvertismentImageReq): Promise<DeleteAdvertismentImageRes>;
    DeleteSetting(request: DeleteSettingRequest): Promise<DeleteSettingResponse>;
    FindOne(request: FindOneRequest): Promise<FindOneResponse>;
    GetCurrentDateTime(request: {}): Promise<GetCurrentDateTimeRes>;
    GetCodeEngineAddress(request: {}): Promise<GetCodeEngineAddressRes>;
    GetWhiteLabel(request: GetWhiteLabelReq): Promise<GetWhiteLabelRes>;
    FindAll(request: GetFindAllReq): Promise<GetFindAllRes>;
    GetPaymentMethods(request: GetPaymentMethodsReq): Promise<GetPaymentMethodsRes>;
    GetAllInstances(request: {}): Promise<any>;
    GetWebConfig(request: {}): Promise<any>;
    Show(request: {}): Promise<ShowRes>;
    GetDeploymentStatus(request: {}): Promise<GetDeploymentStatusRes>;
    GetCountryByIp(request: GetCountryByIpReq): Promise<GetCountryByIpRes>;
    GetVideoStreaming(request: GetVideoStreamingReq): Promise<GetVideoStreamingRes>;
    ConvertCurrency(request: GetConvertCurrencyReq): Promise<GetConvertCurrencyRes>;
}

@Injectable()
export class SettingGrpcServiceClientImpl implements SettingGrpcInterface {
    private settingGrpcServiceClient: SettingGrpcInterface;
    private readonly logger = new Logger(SettingGrpcServiceClientImpl.name);

    constructor(
        @Inject('administrationGrpcService') private settingGrpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.settingGrpcServiceClient =
            this.settingGrpcClient.getService<SettingGrpcInterface>(
                protobufSettingService
            );
        this.logger.debug('gRPC client initialized.');
    }

    async CreateSetting(request: SettingRequest): Promise<SettingResponse> {
        this.logger.debug('Calling CreateSetting function...');
        return await this.settingGrpcServiceClient.CreateSetting(request);
    }

    async GetSetting({ }): Promise<GetSettingResponse> {
        return await this.settingGrpcServiceClient.GetSetting({});
    }

    async GetOneSetting(request: GetOneSettingRequest): Promise<GetOneSettingResponse> {
        return await this.settingGrpcServiceClient.GetOneSetting(request);
    }

    async UpdateSetting(request: UpdateSettingRequest): Promise<UpdateSettingResponse> {
        return await this.settingGrpcServiceClient.UpdateSetting(request);
    }

    async AddAdvertismentImage(request: AddAdvertismentImageReq): Promise<AddAdvertismentImageRes> {
        return await this.settingGrpcServiceClient.AddAdvertismentImage(request);
    }

    async Update(request: GetUpdateRequest): Promise<GetUpdateResponse> {
        return await this.settingGrpcServiceClient.Update(request)
    }

    async DeleteAdvertismentImage(request: DeleteAdvertismentImageReq): Promise<DeleteAdvertismentImageRes> {
        return await this.settingGrpcServiceClient.DeleteAdvertismentImage(request);
    }

    async DeleteSetting(request: DeleteSettingRequest): Promise<DeleteSettingResponse> {
        return await this.settingGrpcServiceClient.DeleteSetting(request);
    }

    async FindOne(request: FindOneRequest): Promise<FindOneResponse> {
        return await this.settingGrpcServiceClient.FindOne(request);
    }

    async GetCurrentDateTime(request: {}): Promise<GetCurrentDateTimeRes> {
        return await this.settingGrpcServiceClient.GetCurrentDateTime(request);
    }

    async GetCodeEngineAddress(request: {}): Promise<GetCodeEngineAddressRes> {
        return await this.settingGrpcServiceClient.GetCodeEngineAddress(request);
    }

    async GetWhiteLabel(request: GetWhiteLabelReq): Promise<GetWhiteLabelRes> {
        return await this.settingGrpcServiceClient.GetWhiteLabel(request);
    }

    async FindAll(request: GetFindAllReq): Promise<GetFindAllRes> {
        return await this.settingGrpcServiceClient.FindAll(request);
    }

    async GetPaymentMethods(request: GetPaymentMethodsReq): Promise<GetPaymentMethodsRes> {
        return await this.settingGrpcServiceClient.GetPaymentMethods(request)
    }

    async GetAllInstances(request: {}): Promise<any> {
        return await this.settingGrpcServiceClient.GetAllInstances(request);
    }

    async GetWebConfig(request: {}): Promise<any> {
        return await this.settingGrpcServiceClient.GetWebConfig(request);
    }

    async Show(request: {}): Promise<ShowRes> {
        return await this.settingGrpcServiceClient.Show(request);
    }

    async GetDeploymentStatus(request: {}): Promise<GetDeploymentStatusRes> {
        return await this.settingGrpcServiceClient.GetDeploymentStatus(request);
    }

    async GetCountryByIp(request: GetCountryByIpReq): Promise<GetCountryByIpRes> {
        console.log("from grpc-client", request)
        return await this.settingGrpcServiceClient.GetCountryByIp(request);
    }

    async GetVideoStreaming(request: GetVideoStreamingReq): Promise<GetVideoStreamingRes> {
        return await this.settingGrpcServiceClient.GetVideoStreaming(request);
    }

    async ConvertCurrency(request: GetConvertCurrencyReq): Promise<GetConvertCurrencyRes> {
        return await this.settingGrpcServiceClient.ConvertCurrency(request);
    }
}
