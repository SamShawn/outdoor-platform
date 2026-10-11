import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 全局前缀，所有接口以 /api 开头
  app.setGlobalPrefix('api')

  // 本地开发允许跨域，生产环境需收紧
  app.enableCors()

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`Server running at <http://localhost:${port}/api/health>`)
}

bootstrap()
