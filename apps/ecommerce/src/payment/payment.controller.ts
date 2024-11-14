import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import {
  CreatePaymentReq, EnrollItemsReq, FindByMeReq, FindOneByMeReq, FinishCCAReq, GetTransactionReq, InitCCAReq,
  PaymentFinishReq, PaymentResultReq, RevenueAllReq
} from '@app/common/dto/eCommerce';
import { protobufPaymentService } from '@app/common/grpc-clients/eCommerce';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @GrpcMethod(protobufPaymentService, 'FindByMe')
  findByMe(request: FindByMeReq) {
    return this.paymentService.findByMe(request);
  }

  @GrpcMethod(protobufPaymentService, 'RevenueAll')
  revenueAll(request: RevenueAllReq) {
    return this.paymentService.revenueAll(request);
  }

  @GrpcMethod(protobufPaymentService, 'RevenueThisMonth')
  revenueThisMonth(request: RevenueAllReq) {
    return this.paymentService.revenueThisMonth(request);
  }

  @GrpcMethod(protobufPaymentService, 'RevenueToday')
  revenueToday(request: RevenueAllReq) {
    return this.paymentService.revenueToday(request);
  }

  @GrpcMethod(protobufPaymentService, 'RevenueWeek')
  revenueWeek(request: RevenueAllReq) {
    return this.paymentService.revenueWeek(request);
  }

  @GrpcMethod(protobufPaymentService, 'FindAllPaymentDetail')
  findAllPaymentDetail(request: FindByMeReq) {
    return this.paymentService.findAllPaymentDetail(request);
  }

  @GrpcMethod(protobufPaymentService, 'CountAllPaymentDetail')
  countAllPaymentDetail(request: FindByMeReq) {
    return this.paymentService.countAllPaymentDetail(request);
  }

  @GrpcMethod(protobufPaymentService, 'LastRevenue')
  lastRevenue(request: RevenueAllReq) {
    return this.paymentService.lastRevenue(request);
  }

  @GrpcMethod(protobufPaymentService, 'FindOneByMe')
  findOneByMe(request: FindOneByMeReq) {
    return this.paymentService.findOneByMe(request);
  }

  @GrpcMethod(protobufPaymentService, 'FindPaymentDetails')
  findPaymentDetails(request: FindOneByMeReq) {
    return this.paymentService.findPaymentDetails(request);
  }

  @GrpcMethod(protobufPaymentService, 'CountByMe')
  countByMe(request: FindByMeReq) {
    return this.paymentService.countByMe(request);
  }

  @GrpcMethod(protobufPaymentService, 'GetTransaction')
  getTransaction(request: GetTransactionReq) {
    return this.paymentService.getTransaction(request);
  }

  @GrpcMethod(protobufPaymentService, 'FindOnePayment')
  findOnePayment(request: GetTransactionReq) {
    return this.paymentService.findOnePayment(request);
  }

  @GrpcMethod(protobufPaymentService, 'InitCCA')
  initCCA(request: InitCCAReq) {
    return this.paymentService.initCCA(request);
  }

  @GrpcMethod(protobufPaymentService, 'FinishCCA')
  finishCCA(request: FinishCCAReq) {
    return this.paymentService.finishCCA(request);
  }

  @GrpcMethod(protobufPaymentService, 'CancelCCA')
  cancelCCA(request: GetTransactionReq) {
    return this.paymentService.cancelCCA(request);
  }

  @GrpcMethod(protobufPaymentService, 'EnrollItems')
  enrollItems(request: EnrollItemsReq) {
    return this.paymentService.enrollItems(request);
  }

  @GrpcMethod(protobufPaymentService, 'CreatePayment')
  createPayment(request: CreatePaymentReq) {
    return this.paymentService.createPayment(request);
  }

  @GrpcMethod(protobufPaymentService, 'PaymentResult')
  paymentResult(request: PaymentResultReq) {
    return this.paymentService.paymentResult(request);
  }

  @GrpcMethod(protobufPaymentService, 'PaymentFinish')
  paymentFinish(request: PaymentFinishReq) {
    return this.paymentService.paymentFinish(request);
  }

}
