import { Type } from 'class-transformer'
import { IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator'

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
  @IsInt()
  @Type(() => Number)
  organizerId?: number
}
