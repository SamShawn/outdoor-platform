import { Type } from 'class-transformer'
import { IsOptional, IsInt, IsEnum, Min, Max, IsString, IsBooleanString } from 'class-validator'

import { ActivityStatus } from '../../generated/prisma/enums'

export class QueryActivityDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  pageSize?: number = 10

  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus

  @IsOptional()
  @IsString()
  keyword?: string // 新增：标题模糊搜索

  @IsOptional()
  @IsBooleanString()
  isFree?: string // 新增：是否免费

  @IsOptional()
  @IsString()
  timeRange?: 'week' | 'month' // 新增：时间范围
}
