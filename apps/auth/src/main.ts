import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../../../proto/auth.proto'),
      url: configService.getOrThrow('AUTH_GRPC_URL'),
    },
  });
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  await app.startAllMicroservices();
  console.log('Microservice connected');
}
bootstrap();
