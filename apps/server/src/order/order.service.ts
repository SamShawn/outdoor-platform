import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common'

import { Prisma } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

import { CreateOrderDto } from './dto/create-order.dto'

interface ActivityRow {
  id: string
  price: number
  quota: number
  enrolled: number
  status: string
}

interface RawOrder {
  id: string
  userId: string
  activityId: string
  status: string
}

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const { activityId } = dto

    // ==========================================
    // 1. 前置校验阶段（不加锁，并发量高时性能好）
    // ==========================================

    // (1) 检查活动是否存在及状态
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    })

    if (!activity) {
      throw new NotFoundException('活动不存在')
    }

    if (activity.status !== 'PUBLISHED') {
      throw new BadRequestException('活动当前状态不可报名')
    }

    // (2) 检查是否已报名
    const existingOrder = await this.prisma.order.findUnique({
      where: {
        userId_activityId: { userId, activityId },
      },
    })
    if (existingOrder) {
      throw new ConflictException('您已报名该活动，请勿重复提交')
    }

    // (3) 检查名额是否已满
    if (activity.enrolled >= activity.quota) {
      throw new BadRequestException('活动名额已满')
    }

    // (4) 检查是否在报名时间内（假设活动开始前 2 小时停止报名）
    const now = new Date()
    const deadline = new Date(activity.startAt.getTime() - 2 * 60 * 60 * 1000) // 开始前 2 小时截止

    if (now >= deadline) {
      throw new BadRequestException('报名已截止')
    }

    // ==========================================
    // 2. 核心事务阶段（加锁，保证绝对不超卖）
    // ==========================================
    return this.prisma.$transaction(async (tx) => {
      // 使用行锁再次锁定活动记录，防止并发冲突
      const activities = await tx.$queryRaw<ActivityRow[]>`
        SELECT id, price, quota, enrolled, status
        FROM activities
        WHERE id = ${activityId}
        FOR UPDATE
      `

      if (!activities || activities.length === 0) {
        throw new NotFoundException('活动不存在')
      }

      const lockedActivity = activities[0]

      // 二次确认（防止在进入事务的几毫秒内被其他请求抢占）
      if (lockedActivity.status !== 'PUBLISHED') {
        throw new BadRequestException('活动当前不可报名')
      }
      if (lockedActivity.enrolled >= lockedActivity.quota) {
        throw new BadRequestException('活动名额已满')
      }

      // 扣减名额
      await tx.activity.update({
        where: { id: activityId },
        data: { enrolled: { increment: 1 } },
      })

      // 生成订单号
      const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`

      try {
        // 创建订单
        return await tx.order.create({
          data: {
            orderNo,
            userId,
            activityId,
            amount: lockedActivity.price,
            status: 'PENDING',
          },
        })
      } catch (error) {
        // 兜底捕获并发唯一约束冲突
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictException('您已报名该活动')
        }
        throw error
      }
    })
  }

  /**
   * 取消报名
   */
  async cancel(orderId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. 锁定订单记录 (行锁)
      const orders = await tx.$queryRaw<RawOrder[]>`
        SELECT id, userId, activityId, status
        FROM orders
        WHERE id = ${orderId}
        FOR UPDATE
      `

      if (!orders || orders.length === 0) {
        throw new NotFoundException('订单不存在')
      }

      const order = orders[0]

      // 2. 校验权限：只能取消自己的订单
      if (order.userId !== userId) {
        throw new ForbiddenException('无权操作此订单')
      }

      // 3. 校验状态：只有待支付的订单可以取消
      if (order.status !== 'PENDING') {
        throw new BadRequestException('只有待支付的订单可以取消')
      }

      // 4. 更新订单状态为 CANCELLED
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      })

      // 5. 释放活动名额 (确保 enrolled 不会减成负数)
      await tx.activity.update({
        where: { id: order.activityId },
        data: {
          enrolled: { decrement: 1 },
        },
      })

      return { message: '取消报名成功' }
    })
  }

  async findMyOrders(userId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          activity: {
            select: {
              id: true,
              title: true,
              cover: true,
              startAt: true,
              location: true,
              price: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ])

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }
}
