import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // Create a new NestJS application instance using the AppModule

  app.use(helmet()); // Apply the Helmet middleware to enhance security by setting various HTTP headers
  app.use(compression()); // Apply the Compression middleware to compress response bodies for all requests, improving performance

  app.enableCors(); // Enable Cross-Origin Resource Sharing (CORS) to allow requests from different origins

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      enableDebugMessages: true,
    }),
  ); // Apply global validation pipes to validate incoming requests and transform payloads

  const config = new DocumentBuilder()
    .setTitle('AI Trader API')
    .setDescription('Backend API for AI-powered Options Trading Platform')
    .setVersion('1.0 Alpha')
    .build(); // Configure Swagger documentation for the API

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
