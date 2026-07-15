import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // provides JwtAuthGuard + JwtModule for token verification
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
