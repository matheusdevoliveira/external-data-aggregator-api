import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // 1. Proteção de cabeçalhos HTTP via Helmet (OWASP)
  app.use(helmet());

  // 2. Configuração estrita de CORS
  app.enableCors({
    origin: configService.get<string>('ALLOWED_ORIGINS')?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração do Swagger OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('External Data Aggregator API')
    .setDescription(
      'API agregadora de dados externos (Ações B3, Moedas e CEP) com Criptografia, Cache Redis, Rate Limit e Resiliência.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Insira o token JWT gerado no login',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  logger.log(`🚀 Aplicação rodando na porta ${port}`);
  logger.log(`📚 Documentação Swagger disponível em: http://localhost:${port}/api/docs`);
}
bootstrap();