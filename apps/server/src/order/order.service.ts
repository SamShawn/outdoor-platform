import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'

import { Prisma } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

import { CreateOrderDto } from './dto/create-order.dto'

interface RawActivity {
  id: string
  price: number
  quota: number
  enrolled: number
  status: string
}

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const { activityId } = dto

    // 使用交互式事务
    return this.prisma.$transaction(async (tx) => {
      // 1. 使用行锁锁定活动记录 (SELECT ... FOR UPDATE)
      const activities = await tx.$queryRaw<RawActivity[]>`
        SELECT id, title, price, quota, enrolled, status
        FROM activities
        WHERE id = ${activityId}
        FOR UPDATE
      `

      if (!activities || activities.length === 0) {
        throw new NotFoundException('活动不存在')
      }

      const activity = activities[0]

      // 2. 校验活动状态
      if (activity.status !== 'PUBLISHED') {
        throw new BadRequestException('活动当前不可报名')
      }

      // 3. 校验名额
      if (activity.enrolled >= activity.quota) {
        throw new BadRequestException('活动名额已满')
      }

      // 4. 检查用户是否已经报过名（利用 Unique 约束之前先查一下，提供更友好的报错）
      const existingOrder = await tx.order.findUnique({
        where: {
          userId_activityId: { userId, activityId },
        },
      })
      if (existingOrder) {
        throw new ConflictException('您已报名该活动')
      }

      // 5. 更新已报名人数 (+1)
      await tx.activity.update({
        where: { id: activityId },
        data: { enrolled: { increment: 1 } },
      })

      // 6. 生成订单号 (简单实现：时间戳 + 随机数)
      const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`

      // 7. 创建订单
      try {
        const order = await tx.order.create({
          data: {
            orderNo,
            userId,
            activityId,
            amount: activity.price,
            status: 'PENDING',
          },
        })
        return order
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictException('您已报名该活动')
        }
        throw error
      }
    })
  }
}
