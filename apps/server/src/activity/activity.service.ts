import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'

import { Prisma } from '../generated/prisma/client'
import { ActivityStatus } from '../generated/prisma/enums'
import { PrismaService } from '../prisma/prisma.service'

import { CreateActivityDto } from './dto/create-activity.dto'
import { QueryActivityDto } from './dto/query-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizerId: string, dto: CreateActivityDto) {
    return this.prisma.activity.create({
      data: {
        title: dto.title,
        description: dto.description,
        cover: dto.cover,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        quota: dto.quota,
        price: dto.price,
        organizerId,
        status: ActivityStatus.PUBLISHED,
      },
    })
  }

  async findAll(query: QueryActivityDto) {
    const { page = 1, pageSize = 10, status, keyword, isFree, timeRange } = query
    const skip = (page - 1) * pageSize

    const where: Prisma.ActivityWhereInput = {
      // 默认只查已发布的活动
      status: status || 'PUBLISHED',
    }

    // 关键词搜索
    if (keyword) {
      where.title = { contains: keyword }
    }

    // 免费筛选
    if (isFree === 'true') {
      where.price = 0
    }

    // 时间范围筛选
    if (timeRange === 'week') {
      // 自然周：本周一 00:00:00 到 本周日 23:59:59
      const now = new Date()
      const day = now.getDay() || 7 // 周日 getDay() 返回 0，转成 7 方便计算

      // 计算本周一
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - day + 1)
      startOfWeek.setHours(0, 0, 0, 0)

      // 计算本周日结束
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      where.startAt = { gte: startOfWeek, lte: endOfWeek }
    } else if (timeRange === 'month') {
      // 自然月：当月 1 号 00:00:00 到 当月最后一天 23:59:59
      const now = new Date()

      // 计算当月 1 号
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // 计算当月最后一天（下个月的第 0 天就是本月最后一天）
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      endOfMonth.setHours(23, 59, 59, 999)

      where.startAt = { gte: startOfMonth, lte: endOfMonth }
    }

    const [items, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { startAt: 'asc' },
        include: {
          organizer: {
            select: { id: true, nickname: true, avatar: true },
          },
        },
      }),
      this.prisma.activity.count({ where }),
    ])

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    })

    if (!activity) {
      throw new NotFoundException('Activity not found')
    }

    return activity
  }

  async update(id: string, userId: string, dto: UpdateActivityDto) {
    await this.checkOwnership(id, userId)

    return this.prisma.activity.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startAt && { startAt: new Date(dto.startAt) }),
        ...(dto.endAt && { endAt: new Date(dto.endAt) }),
      },
    })
  }

  async remove(id: string, userId: string) {
    await this.checkOwnership(id, userId)

    return this.prisma.activity.update({
      where: { id },
      data: { status: ActivityStatus.CANCELLED },
    })
  }

  private async checkOwnership(id: string, userId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      select: { organizerId: true },
    })

    if (!activity) {
      throw new NotFoundException('Activity not found')
    }

    if (activity.organizerId !== userId) {
      throw new ForbiddenException('Not the organizer')
    }
  }
}
