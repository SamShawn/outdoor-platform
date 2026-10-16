import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { PrismaService } from '../prisma/prisma.service'

import { Code2SessionResponse } from './interfaces/wechat.interface'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(code: string) {
    const session = await this.code2Session(code)
    return this.findOrCreateUser(session.openid)
  }

  private async code2Session(code: string): Promise<Code2SessionResponse> {
    const url = new URL('https://api.weixin.qq.com/sns/jscode2session')
    url.searchParams.set('appid', process.env.WECHAT_APPID ?? '')
    url.searchParams.set('secret', process.env.WECHAT_SECRET ?? '')
    url.searchParams.set('js_code', code)
    url.searchParams.set('grant_type', 'authorization_code')

    const res = await fetch(url.toString())
    const data = (await res.json()) as Code2SessionResponse

    if (data.errcode) {
      throw new UnauthorizedException(`WeChat login failed: ${data.errmsg}`)
    }

    return data
  }

  private async findOrCreateUser(openid: string) {
    let user = await this.prisma.user.findUnique({ where: { openid } })

    if (!user) {
      user = await this.prisma.user.create({
        data: { openid },
      })
    }

    const payload = { sub: user.id, openid: user.openid }
    const accessToken = await this.jwtService.signAsync(payload)

    return {
      accessToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    }
  }
}
