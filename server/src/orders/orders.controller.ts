import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/** All order routes require a logged-in user; orders belong to that user. */
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Req() req: Request & { userId: string }, @Body() dto: CreateOrderDto) {
    return this.orders.create(req.userId, dto);
  }

  @Get()
  list(@Req() req: Request & { userId: string }) {
    return this.orders.listForUser(req.userId);
  }

  @Get(':orderNumber')
  getOne(@Req() req: Request & { userId: string }, @Param('orderNumber') orderNumber: string) {
    return this.orders.getForUser(req.userId, orderNumber);
  }
}
