import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All routes under /api (matches the Angular HttpCatalogService base URL).
  app.setGlobalPrefix('api');

  // Allow the Angular dev server (and any configured origins) to call the API.
  const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:4200')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({ origin: origins });

  // Validate + coerce query/body DTOs; strip unknown fields.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`Jiaranest API listening on http://localhost:${port}/api`);
}
bootstrap();
