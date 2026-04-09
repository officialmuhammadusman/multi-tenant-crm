import { NestFactory } from '@nestjs/core';
import { VersioningType, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { validateEnv } from './common/env.validation';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // ✅ Validate environment variables FIRST (at runtime, not build time)
  validateEnv(process.env);

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Security headers
  app.use(helmet());

  // Cookie parser for refresh token
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-Active-Org'],
  });

  // API versioning: /api/v1/...
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger docs (non-production only)
  if (process.env['NODE_ENV'] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('CRM API')
      .setDescription('Multi-Tenant CRM System — Production Grade')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth')
      .addTag('Organizations')
      .addTag('Users')
      .addTag('Customers')
      .addTag('Notes')
      .addTag('Activity')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      jsonDocumentUrl: 'api/docs-json',
    });

    logger.log('📚 Swagger UI: http://localhost:3001/api/docs');
  }

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);
  logger.log(`🚀 API running on http://localhost:${port}/api/v1`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});