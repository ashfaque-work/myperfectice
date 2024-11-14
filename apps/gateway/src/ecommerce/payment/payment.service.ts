import {
    CancelCCARes, CountAllPaymentDetailRes, CreatePaymentReq, CreatePaymentRes, EnrollItemsReq, EnrollItemsRes,
    FindAllPaymentDetailRes, FindByMeReq, FindByMeRes, FindOneByMeReq, FindOneByMeRes, FindPaymentDetailsRes,
    FinishCCAReq, FinishCCARes, GetTransactionReq, GetTransactionRes, InitCCAReq, InitCCARes, LastRevenueRes,
    PaymentFinishReq, PaymentFinishRes, PaymentResultReq, PaymentResultRes, RevenueAllReq, RevenueAllRes,
} from '@app/common/dto/eCommerce';
import { PaymentGrpcServiceClientImpl } from '@app/common/grpc-clients/eCommerce';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
    constructor(private paymentGrpcServiceClientImpl: PaymentGrpcServiceClientImpl) { }

    async findByMe(request: FindByMeReq): Promise<FindByMeRes> {
        return await this.paymentGrpcServiceClientImpl.FindByMe(request);
    }

    async revenueAll(request: RevenueAllReq): Promise<RevenueAllRes> {
        return await this.paymentGrpcServiceClientImpl.RevenueAll(request);
    }

    async revenueThisMonth(request: RevenueAllReq): Promise<RevenueAllRes> {
        return await this.paymentGrpcServiceClientImpl.RevenueThisMonth(request);
    }

    async revenueToday(request: RevenueAllReq): Promise<RevenueAllRes> {
        return await this.paymentGrpcServiceClientImpl.RevenueToday(request);
    }

    async revenueWeek(request: RevenueAllReq): Promise<RevenueAllRes> {
        return await this.paymentGrpcServiceClientImpl.RevenueWeek(request);
    }

    async findAllPaymentDetail(request: FindByMeReq): Promise<FindAllPaymentDetailRes> {
        return await this.paymentGrpcServiceClientImpl.FindAllPaymentDetail(request);
    }

    async countAllPaymentDetail(request: FindByMeReq): Promise<CountAllPaymentDetailRes> {
        return await this.paymentGrpcServiceClientImpl.CountAllPaymentDetail(request);
    }

    async lastRevenue(request: RevenueAllReq): Promise<LastRevenueRes> {
        return await this.paymentGrpcServiceClientImpl.LastRevenue(request);
    }

    async findOneByMe(request: FindOneByMeReq): Promise<FindOneByMeRes> {
        return await this.paymentGrpcServiceClientImpl.FindOneByMe(request);
    }

    async findPaymentDetails(request: FindOneByMeReq): Promise<FindPaymentDetailsRes> {
        return await this.paymentGrpcServiceClientImpl.FindPaymentDetails(request);
    }

    async countByMe(request: FindByMeReq): Promise<CountAllPaymentDetailRes> {
        return await this.paymentGrpcServiceClientImpl.CountByMe(request);
    }

    async getTransaction(request: GetTransactionReq): Promise<GetTransactionRes> {
        return await this.paymentGrpcServiceClientImpl.GetTransaction(request);
    }

    async findOnePayment(request: GetTransactionReq): Promise<FindOneByMeRes> {
        return await this.paymentGrpcServiceClientImpl.FindOnePayment(request);
    }

    async initCCA(request: InitCCAReq): Promise<InitCCARes> {
        return await this.paymentGrpcServiceClientImpl.InitCCA(request);
    }

    async finishCCA(request: FinishCCAReq): Promise<FinishCCARes> {
        return await this.paymentGrpcServiceClientImpl.FinishCCA(request);
    }

    async cancelCCA(request: GetTransactionReq): Promise<CancelCCARes> {
        return await this.paymentGrpcServiceClientImpl.CancelCCA(request);
    }

    async enrollItems(request: EnrollItemsReq): Promise<EnrollItemsRes> {
        return await this.paymentGrpcServiceClientImpl.EnrollItems(request);
    }

    async createPayment(request: CreatePaymentReq): Promise<CreatePaymentRes> {
        return await this.paymentGrpcServiceClientImpl.CreatePayment(request);
    }

    async paymentResult(request: PaymentResultReq): Promise<PaymentResultRes> {
        return await this.paymentGrpcServiceClientImpl.PaymentResult(request);
    }

    async paymentFinish(request: PaymentFinishReq): Promise<PaymentFinishRes> {
        return await this.paymentGrpcServiceClientImpl.PaymentFinish(request);
    }

}
