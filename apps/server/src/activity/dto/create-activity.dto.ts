import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  cover?: string

  @IsDateString()
  startAt: string

  @IsDateString()
  endAt: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string

  @IsOptional()
  @IsNumber()
  latitude?: number

  @IsOptional()
  @IsNumber()
  longitude?: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quota: number

  @IsInt()
  @Min(0)
  @Type(() => Number)
  price: number
}
