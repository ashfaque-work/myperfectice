import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { CouponGrpcServiceClientImpl, protobufEcommercePackage } from './coupon';
import { PaymentGrpcServiceClientImpl } from './payment';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'eCommerceGrpcService',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: protobufEcommercePackage,
                        protoPath: join(__dirname, '../../../proto/eCommerce.proto'),
                        url: configService.getOrThrow('ECOMMERCE_GRPC_URL'),
                        loader: {
                            arrays: true,
                            keepCase: true,
                        },
                    },
                }),
                inject: [ConfigService],
            }
        ])
    ],
    controllers: [],
    providers: [CouponGrpcServiceClientImpl, PaymentGrpcServiceClientImpl],
    exports: [CouponGrpcServiceClientImpl,PaymentGrpcServiceClientImpl]
})
export class EcommerceClientModule { }