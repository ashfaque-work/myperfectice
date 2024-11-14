import {
  SettingRequest, Setting, GetSettingResponse, GetOneSettingRequest, GetOneSettingResponse,
  UpdateSettingRequest, UpdateSettingResponse, DeleteSettingRequest, DeleteSettingResponse,
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
import { SettingGrpcServiceClientImpl } from '@app/common/grpc-clients/administration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingService {
  constructor(private settingGrpcServiceClientImpl: SettingGrpcServiceClientImpl) { }

  async createSetting(request: SettingRequest): Promise<SettingResponse> {
      return await this.settingGrpcServiceClientImpl.CreateSetting(request);
  }

  async getSetting({}): Promise<GetSettingResponse> {
      return await this.settingGrpcServiceClientImpl.GetSetting({});
  }

  async getOneSetting(request: GetOneSettingRequest): Promise<GetOneSettingResponse> {
      return await this.settingGrpcServiceClientImpl.GetOneSetting(request);
  }

  async updateSetting(request: UpdateSettingRequest): Promise<UpdateSettingResponse> {
      return await this.settingGrpcServiceClientImpl.UpdateSetting(request);
  }

  async addAdvertismentImage(request: AddAdvertismentImageReq): Promise<AddAdvertismentImageRes> {
    return await this.settingGrpcServiceClientImpl.AddAdvertismentImage(request);
  }

  async update(request: GetUpdateRequest): Promise<GetUpdateResponse> {
    return await this.settingGrpcServiceClientImpl.Update(request);
  }

  async deleteAdvertismentImage(request: DeleteAdvertismentImageReq): Promise<DeleteAdvertismentImageRes> {
    return await this.settingGrpcServiceClientImpl.DeleteAdvertismentImage(request);
  }

  async deleteSetting(request: DeleteSettingRequest): Promise<DeleteSettingResponse> {
      return await this.settingGrpcServiceClientImpl.DeleteSetting(request);
  }

  async findOne(request: FindOneRequest): Promise<FindOneResponse> {
    return await this.settingGrpcServiceClientImpl.FindOne(request);
  }

  async getCurrentDateTime(request: {}): Promise<GetCurrentDateTimeRes> {
    return await this.settingGrpcServiceClientImpl.GetCurrentDateTime(request);
  }

  async getCodeEngineAddress(request: {}): Promise<GetCodeEngineAddressRes> {
    return await this.settingGrpcServiceClientImpl.GetCodeEngineAddress(request);
  }

  async getWhiteLabel(request: GetWhiteLabelReq): Promise<GetWhiteLabelRes> {
    console.log("inside the grpc setting");
    
    return await this.settingGrpcServiceClientImpl.GetWhiteLabel(request);
  }

  async findAll(request: GetFindAllReq): Promise<GetFindAllRes> {
    return await this.settingGrpcServiceClientImpl.FindAll(request);
  }

  async getPaymentMethods(request: GetPaymentMethodsReq) {
    console.log("from gateway services");
    return await this.settingGrpcServiceClientImpl.GetPaymentMethods(request)
  }

  async getAllInstances(request: {}): Promise<any> {
    return await this.settingGrpcServiceClientImpl.GetAllInstances({})
  }

  async getWebConfig(request: {}): Promise<any> {
    return await this.settingGrpcServiceClientImpl.GetWebConfig(request);
  }

  async show(request: {}): Promise<ShowRes> {
    return await this.settingGrpcServiceClientImpl.Show(request);
  }

  async getDeploymentStatus(request: {}): Promise<GetDeploymentStatusRes> {
    return await this.settingGrpcServiceClientImpl.GetDeploymentStatus(request);
  }

  async getCountryByIp(request: GetCountryByIpReq): Promise<GetCountryByIpRes> {
    // console.log("from gateway service", request);
    return await this.settingGrpcServiceClientImpl.GetCountryByIp(request);
  }

  async getVideoStreaming(request: GetVideoStreamingReq): Promise<GetVideoStreamingRes> {
    return await this.settingGrpcServiceClientImpl.GetVideoStreaming(request);
  }

  async convertCurrency(request: GetConvertCurrencyReq): Promise<GetConvertCurrencyRes> {
    return await this.settingGrpcServiceClientImpl.ConvertCurrency(request);
  }

  // async create(request: GetCreateReq): Promise<GetCreateRes> {
  //   return await this.settingGrpcServiceClientImpl.create(request);
  // }
}
