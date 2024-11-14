import { FindAllStatesReq, GetInfoReq, GetInfoRes, GetStateReq } from '@app/common/dto/administration';
import { Injectable } from '@nestjs/common';
import { info, states } from 'countryjs';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';

@Injectable()
export class CountryService {
  constructor() { }

  async findSupport({ }) {
    try {
      const countries = [
        { code: "IN", name: "India" },
        { code: "US", name: "United States" }
      ];

      return { response: countries };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async findAllStates(request: FindAllStatesReq) {
    try {
      const response = states(request.countryCode);

      return { response };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getInfo(request: GetInfoReq) {
    try {
      const { code, iso } = request;
      let finalIso: any = 'ISO2';
      if (iso) {
        finalIso = iso;
      }
      const response = info(code, finalIso);

      return { ...response };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async getState(request: GetStateReq) {
    try {
      const response = states(request.code);

      return { response };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }
}
