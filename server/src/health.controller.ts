import { Controller, Get } from '@nestjs/common';

/**
 * Trivial, dependency-free health endpoint for the platform's health checker.
 * Deliberately does NOT touch the database, so the service is marked healthy
 * the moment the HTTP server is up (a DB-backed check can wrongly fail boot).
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
