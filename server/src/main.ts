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

  // Bind to 0.0.0.0 (all interfaces) — required by Render/most hosts so the
  // platform's health checker can reach the app. Defaulting to localhost makes
  // the service unreachable externally and it never passes health checks.
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Jiaranest API listening on port ${port} (/api)`);
}
bootstrap();
