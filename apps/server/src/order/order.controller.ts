import { Controller, Post, Body, UseGuards } from '@nestjs/common'

import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard, type JwtPayload } from '../auth/guards/jwt-auth.guard'

import { CreateOrderDto } from './dto/create-order.dto'
import { OrderService } from './order.service'

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.orderService.create(user.sub, dto)
  }
}
