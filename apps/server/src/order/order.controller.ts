import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'

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

  @Delete(':id')
  cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.orderService.cancel(id, user.sub)
  }

  /**
   * 获取我报名的活动列表
   */
  @Get('my')
  findMyOrders(
    @CurrentUser() user: JwtPayload,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    return this.orderService.findMyOrders(user.sub, Number(page), Number(pageSize))
  }

  /**
   * 检查当前用户是否已报名某个活动
   */
  @Get('check')
  checkEnrollment(@CurrentUser() user: JwtPayload, @Query('activityId') activityId: string) {
    if (!activityId) {
      return { enrolled: false }
    }
    return this.orderService.checkEnrollment(user.sub, activityId)
  }
}
