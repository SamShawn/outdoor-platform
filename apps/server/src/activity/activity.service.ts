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

  async findMyActivities(organizerId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize

    const [items, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: { organizerId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }, // 我发起的活动按创建时间倒序
      }),
      this.prisma.activity.count({ where: { organizerId } }),
    ])

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
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
      // 1. 获取当前 UTC 时间戳，并 +8 小时，得到“东八区时间”
      const nowInCST = new Date(Date.now() + 8 * 60 * 60 * 1000)

      // 2. 算东八区的周一 00:00:00
      const day = nowInCST.getUTCDay() || 7 // 周日转 7
      const startOfWeekCST = new Date(nowInCST)
      startOfWeekCST.setUTCDate(nowInCST.getUTCDate() - day + 1)
      startOfWeekCST.setUTCHours(0, 0, 0, 0)

      // 3. 算东八区的周日 23:59:59
      const endOfWeekCST = new Date(startOfWeekCST)
      endOfWeekCST.setUTCDate(startOfWeekCST.getUTCDate() + 6)
      endOfWeekCST.setUTCHours(23, 59, 59, 999)

      // 4. 把边界转回真正的 UTC 时间去查数据库（-8 小时）
      const utcStart = new Date(startOfWeekCST.getTime() - 8 * 60 * 60 * 1000)
      const utcEnd = new Date(endOfWeekCST.getTime() - 8 * 60 * 60 * 1000)

      where.startAt = { gte: utcStart, lte: utcEnd }
    } else if (timeRange === 'month') {
      // 1. 获取东八区时间
      const nowInCST = new Date(Date.now() + 8 * 60 * 60 * 1000)

      // 2. 算东八区的当月 1 号 00:00:00
      const startOfMonthCST = new Date(
        Date.UTC(nowInCST.getUTCFullYear(), nowInCST.getUTCMonth(), 1),
      )

      // 3. 算东八区的月末 23:59:59
      const endOfMonthCST = new Date(
        Date.UTC(nowInCST.getUTCFullYear(), nowInCST.getUTCMonth() + 1, 0),
      )
      endOfMonthCST.setUTCHours(23, 59, 59, 999)

      // 4. 转回 UTC
      const utcStart = new Date(startOfMonthCST.getTime() - 8 * 60 * 60 * 1000)
      const utcEnd = new Date(endOfMonthCST.getTime() - 8 * 60 * 60 * 1000)

      where.startAt = { gte: utcStart, lte: utcEnd }
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
