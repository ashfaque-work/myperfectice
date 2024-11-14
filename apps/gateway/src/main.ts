import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from '@app/common/filters/global-exception.filter';
import { RedisIoAdapter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('My Perfectice')
    .setDescription('My Perfectice API management')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(HttpAdapterHost)));
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));

  // Uncomment these lines to use the Redis adapter:
  // const redisIoAdapter = new RedisIoAdapter(app);
  // await redisIoAdapter.connectToRedis();
  // app.useWebSocketAdapter(redisIoAdapter);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps, curl requests)
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('https://localhost') ||
        /\.skillifyai\.in$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(configService.getOrThrow('APIGATEWAY_PORT'));
}
bootstrap();
