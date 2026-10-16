import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard, type JwtPayload } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { ActivityService } from './activity.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'
import { QueryActivityDto } from './dto/query-activity.dto'

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateActivityDto) {
    return this.activityService.create(user.sub, dto)
  }

  @Get()
  findAll(@Query() query: QueryActivityDto) {
    return this.activityService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() dto: UpdateActivityDto) {
    return this.activityService.update(id, user.sub, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.activityService.remove(id, user.sub)
  }
}
