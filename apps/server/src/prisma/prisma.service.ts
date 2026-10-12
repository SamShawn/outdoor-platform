import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const url = new URL(process.env.DATABASE_URL!)
    console.log('url: ', url)

    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    })
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
