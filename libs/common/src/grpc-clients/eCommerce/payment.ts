import {
    CancelCCARes, CountAllPaymentDetailRes, CreatePaymentReq, CreatePaymentRes, EnrollItemsReq, EnrollItemsRes,
    FindAllPaymentDetailRes, FindByMeReq, FindByMeRes, FindOneByMeReq, FindOneByMeRes, FindPaymentDetailsRes, FinishCCAReq,
    FinishCCARes, GetTransactionReq, GetTransactionRes, InitCCAReq, InitCCARes, LastRevenueRes, PaymentFinishReq, PaymentFinishRes,
    PaymentResultReq, PaymentResultRes, RevenueAllReq, RevenueAllRes
} from '@app/common/dto/eCommerce';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

export const protobufPaymentService = 'EcommerceGrpcService';

export interface PaymentGrpcInterface {
    FindByMe(request: FindByMeReq): Promise<FindByMeRes>;
    RevenueAll(request: RevenueAllReq): Promise<RevenueAllRes>;
    RevenueThisMonth(request: RevenueAllReq): Promise<RevenueAllRes>;
    RevenueToday(request: RevenueAllReq): Promise<RevenueAllRes>;
    RevenueWeek(request: RevenueAllReq): Promise<RevenueAllRes>;
    FindAllPaymentDetail(request: FindByMeReq): Promise<FindAllPaymentDetailRes>;
    CountAllPaymentDetail(request: FindByMeReq): Promise<CountAllPaymentDetailRes>;
    LastRevenue(request: RevenueAllReq): Promise<LastRevenueRes>;
    FindOneByMe(request: FindOneByMeReq): Promise<FindOneByMeRes>;
    FindPaymentDetails(request: FindOneByMeReq): Promise<FindPaymentDetailsRes>;
    CountByMe(request: FindByMeReq): Promise<CountAllPaymentDetailRes>;
    GetTransaction(request: GetTransactionReq): Promise<GetTransactionRes>;
    FindOnePayment(request: GetTransactionReq): Promise<FindOneByMeRes>;
    InitCCA(request: InitCCAReq): Promise<InitCCARes>;
    FinishCCA(request: FinishCCAReq): Promise<FinishCCARes>;
    CancelCCA(request: GetTransactionReq): Promise<CancelCCARes>;
    EnrollItems(request: EnrollItemsReq): Promise<EnrollItemsRes>;
    CreatePayment(request: CreatePaymentReq): Promise<CreatePaymentRes>;
    PaymentResult(request: PaymentResultReq): Promise<PaymentResultRes>;
    PaymentFinish(request: PaymentFinishReq): Promise<PaymentFinishRes>;
}

@Injectable()
export class PaymentGrpcServiceClientImpl implements PaymentGrpcInterface {
    private paymentGrpcServiceClient: PaymentGrpcInterface;
    private readonly logger = new Logger(PaymentGrpcServiceClientImpl.name);

    constructor(@Inject('eCommerceGrpcService') private paymentGrpcClient: ClientGrpc) { }

    onModuleInit() {
        this.logger.debug('Initializing gRPC client...');
        this.paymentGrpcServiceClient =
            this.paymentGrpcClient.getService<PaymentGrpcInterface>(
                protobufPaymentService,
            );
        this.logger.debug('gRPC client initialized.');
    }

    async FindByMe(request: FindByMeReq): Promise<FindByMeRes> {
        return await this.paymentGrpcServiceClient.FindByMe(request);
    }

    async RevenueAll(request: RevenueAllReq): Promise<RevenueAllRes> {
        return await this.paymentGrpcServiceClient.RevenueAll(request);
    }

    async RevenueThisMonth(request: RevenueAllReq): Promise<RevenueAllRes> {
        return await this.paymentGrpcServiceClient.RevenueThisMonth(request);
    }

    async RevenueToday(request: RevenueAllReq): Promise<RevenueAllRes> {
        return await this.paymentGrpcServiceClient.RevenueToday(request);
    }

    async RevenueWeek(request: RevenueAllReq): Promise<RevenueAllRes> {
        return await this.paymentGrpcServiceClient.RevenueWeek(request);
    }

    async FindAllPaymentDetail(request: FindByMeReq): Promise<FindAllPaymentDetailRes> {
        return await this.paymentGrpcServiceClient.FindAllPaymentDetail(request);
    }

    async CountAllPaymentDetail(request: FindByMeReq): Promise<CountAllPaymentDetailRes> {
        return await this.paymentGrpcServiceClient.CountAllPaymentDetail(request);
    }

    async LastRevenue(request: RevenueAllReq): Promise<LastRevenueRes> {
        return await this.paymentGrpcServiceClient.LastRevenue(request);
    }

    async FindOneByMe(request: FindOneByMeReq): Promise<FindOneByMeRes> {
        return await this.paymentGrpcServiceClient.FindOneByMe(request);
    }

    async FindPaymentDetails(request: FindOneByMeReq): Promise<FindPaymentDetailsRes> {
        return await this.paymentGrpcServiceClient.FindPaymentDetails(request);
    }

    async CountByMe(request: FindByMeReq): Promise<CountAllPaymentDetailRes> {
        return await this.paymentGrpcServiceClient.CountByMe(request);
    }

    async GetTransaction(request: GetTransactionReq): Promise<GetTransactionRes> {
        return await this.paymentGrpcServiceClient.GetTransaction(request);
    }

    async FindOnePayment(request: GetTransactionReq): Promise<FindOneByMeRes> {
        return await this.paymentGrpcServiceClient.FindOnePayment(request);
    }

    async InitCCA(request: InitCCAReq): Promise<InitCCARes> {
        return await this.paymentGrpcServiceClient.InitCCA(request);
    }

    async FinishCCA(request: FinishCCAReq): Promise<FinishCCARes> {
        return await this.paymentGrpcServiceClient.FinishCCA(request);
    }

    async CancelCCA(request: GetTransactionReq): Promise<CancelCCARes> {
        return await this.paymentGrpcServiceClient.CancelCCA(request);
    }

    async EnrollItems(request: EnrollItemsReq): Promise<EnrollItemsRes> {
        return await this.paymentGrpcServiceClient.EnrollItems(request);
    }

    async CreatePayment(request: CreatePaymentReq): Promise<CreatePaymentRes> {
        return await this.paymentGrpcServiceClient.CreatePayment(request);
    }

    async PaymentResult(request: PaymentResultReq): Promise<PaymentResultRes> {
        return await this.paymentGrpcServiceClient.PaymentResult(request);
    }

    async PaymentFinish(request: PaymentFinishReq): Promise<PaymentFinishRes> {
        return await this.paymentGrpcServiceClient.PaymentFinish(request);
    }
}
