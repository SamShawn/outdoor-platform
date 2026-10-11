import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get('health')
  getHealth(): { status: string; timestamp: number; uptime: number } {
    return {
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
    }
  }
}
