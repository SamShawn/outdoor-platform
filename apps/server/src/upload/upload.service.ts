import { randomUUID } from 'crypto'
import { extname } from 'path'

import { Injectable, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OSS from 'ali-oss'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

@Injectable()
export class UploadService {
  private client: OSS

  constructor(private readonly config: ConfigService) {
    this.client = new OSS({
      region: config.getOrThrow<string>('OSS_REGION'),
      accessKeyId: config.getOrThrow<string>('OSS_ACCESS_KEY_ID'),
      accessKeySecret: config.getOrThrow<string>('OSS_ACCESS_KEY_SECRET'),
      bucket: config.getOrThrow<string>('OSS_BUCKET'),
      secure: true, // 强制 HTTPS
    })
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided')
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`)
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    }

    // 生成唯一文件名，避免覆盖
    const ext = extname(file.originalname) || '.jpg'
    const key = `activities/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${ext}`

    try {
      const result = await this.client.put(key, file.buffer, {
        headers: { 'Content-Type': file.mimetype },
      })

      const customDomain = this.config.get<string>('OSS_CUSTOM_DOMAIN')
      const url = customDomain ? `${customDomain}/${key}` : result.url

      return { url }
    } catch (err) {
      throw new BadRequestException(`OSS upload failed: ${(err as Error).message}`)
    }
  }
}
