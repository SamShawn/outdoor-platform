import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard, type JwtPayload } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('user')
export class UserController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload) {
    return { id: user.sub, openid: user.openid }
  }
}
