import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

export interface JwtPayload {
  sub: string
  openid: string
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const token = this.extractToken(request)

    if (!token) {
      throw new UnauthorizedException('Missing token')
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token)
      request.user = payload
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  private extractToken(request: Request): string | undefined {
    const auth = request.headers.authorization
    if (!auth) return undefined

    const [type, token] = auth.split(' ')
    return type === 'Bearer' ? token : undefined
  }
}
