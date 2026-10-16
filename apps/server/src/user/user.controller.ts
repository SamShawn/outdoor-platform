import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'

import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard, type JwtPayload } from '../auth/guards/jwt-auth.guard'

import { UpdateProfileDto } from './dto/update-profile.dto'
import { UserService } from './user.service'

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.getProfile(user.sub)
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.sub, dto)
  }
}
