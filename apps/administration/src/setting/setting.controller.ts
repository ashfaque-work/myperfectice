import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SettingService } from './setting.service';
import { protobufSettingService } from '@app/common/grpc-clients/administration';
import {
  SettingRequest, DeleteSettingRequest,
  GetOneSettingRequest, UpdateSettingRequest,
  FindOneRequest,
  GetWhiteLabelReq,
  GetFindAllReq,
  GetCountryByIpReq,
  GetVideoStreamingReq,
  AddAdvertismentImageReq,
  DeleteAdvertismentImageReq,
  GetUpdateRequest,
  GetConvertCurrencyReq
} from '@app/common/dto/administration/setting.dto';

@Controller()
export class SettingController {
  constructor(private readonly settingService: SettingService) { }

  @GrpcMethod(protobufSettingService, 'CreateSetting')
  createSetting(request: SettingRequest) {
    // console.log(request);
    return this.settingService.createSetting(request);
  }

  @GrpcMethod(protobufSettingService, 'GetSetting')
  getSetting() {
    return this.settingService.getSetting();
  }

  @GrpcMethod(protobufSettingService, 'GetOneSetting')
  getOneSetting(request: GetOneSettingRequest) {
    return this.settingService.getOneSetting(request);
  }

  @GrpcMethod(protobufSettingService, 'UpdateSetting')
  updateSetting(request: UpdateSettingRequest) {
    return this.settingService.updateSetting(request);
  }

  @GrpcMethod(protobufSettingService, 'AddAdvertismentImage')
  addAdvertismentImage(request: AddAdvertismentImageReq) {
    return this.settingService.addAdvertismentImage(request);
  }

  @GrpcMethod(protobufSettingService, 'Update')
  update(request: GetUpdateRequest) {
    return this.settingService.update(request);
  }

  @GrpcMethod(protobufSettingService, 'DeleteAdvertismentImage')
  deleteAdvertismentImage(request: DeleteAdvertismentImageReq) {
    return this.settingService.deleteAdvertismentImage(request);
  }

  @GrpcMethod(protobufSettingService, 'DeleteSetting')
  deleteSetting(request: DeleteSettingRequest) {
    return this.settingService.deleteSetting(request);
  }

  @GrpcMethod(protobufSettingService, 'FindOne')
  findOne(request: FindOneRequest) {
    return this.settingService.findOne(request);
  }

  @GrpcMethod(protobufSettingService, 'GetCurrentDateTime')
  getCurrentDateTime(request: {}) {
    return this.settingService.getCurrentDateTime(request);
  }

  @GrpcMethod(protobufSettingService, 'GetCodeEngineAddress')
  getCodeEngineAddress(request: {}) {
    return this.settingService.getCodeEngineAddress(request);
  }

  @GrpcMethod(protobufSettingService, 'GetWhiteLabel')
  getWhiteLabel(request: GetWhiteLabelReq) {
    return this.settingService.getWhiteLabel(request);
  }

  @GrpcMethod(protobufSettingService, 'FindAll')
  findAll(request: GetFindAllReq) {
    return this.settingService.findAll(request);
  }

  @GrpcMethod(protobufSettingService, 'GetPaymentMethods')
  getPaymentMethods(request: any) {
    return this.settingService.getPaymentMethods(request);
  }

  @GrpcMethod(protobufSettingService, 'GetAllInstances')
  getAllInstances(request: {}) {
    return this.settingService.getAllInstances(request);
  }

  @GrpcMethod(protobufSettingService, 'GetWebConfig')
  getWebConfig(request: {}) {
    return this.settingService.getWebConfig(request);
  }

  @GrpcMethod(protobufSettingService, 'Show')
  show(request: {}) {
    return this.settingService.show(request);
  }

  @GrpcMethod(protobufSettingService, 'GetDeploymentStatus')
  getDeploymentStatus(request: {}) {
    return this.settingService.getDeploymentStatus(request);
  }

  @GrpcMethod(protobufSettingService, 'GetCountryByIp')
  getCountryByIp(request: GetCountryByIpReq) {
    return this.settingService.getCountryByIp(request);
  }

  @GrpcMethod(protobufSettingService, 'GetVideoStreaming')
  getVideoStreaming(request: GetVideoStreamingReq) {
    return this.settingService.getVideoStreaming(request);
  }

  @GrpcMethod(protobufSettingService, 'ConvertCurrency')
  convertCurrency(request: GetConvertCurrencyReq) {
    return this.settingService.convertCurrency(request);
  }
}
