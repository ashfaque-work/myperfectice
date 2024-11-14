import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CountryService } from './country.service';
import { protobufCountryService } from '@app/common/grpc-clients/administration';
import { FindAllStatesReq, GetInfoReq, GetStateReq } from '@app/common/dto/administration';

@Controller()
export class CountryController {
  constructor(private readonly countryService: CountryService) { }

  @GrpcMethod(protobufCountryService, 'FindSupport')
  findSupport({}) {
    return this.countryService.findSupport({});
  }

  @GrpcMethod(protobufCountryService, 'FindAllStates')
  findAllStates(request: FindAllStatesReq) {
    return this.countryService.findAllStates(request);
  }

  @GrpcMethod(protobufCountryService, 'GetInfo')
  getInfo(request: GetInfoReq) {
    return this.countryService.getInfo(request);
  }

  @GrpcMethod(protobufCountryService, 'GetState')
  getState(request: GetStateReq) {
    return this.countryService.getState(request);
  }

}
