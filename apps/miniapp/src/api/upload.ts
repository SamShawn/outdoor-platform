import Taro from '@tarojs/taro'

import { getToken } from '../utils/token'

const BASE_URL = process.env.TARO_APP_API_BASE || 'http://localhost:3000/api'

export async function uploadImage(filePath: string): Promise<string> {
  const token = getToken()
  const res = await Taro.uploadFile({
    url: `${BASE_URL}/upload/image`,
    filePath,
    name: 'file',
    header: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (res.statusCode !== 200 && res.statusCode !== 201) {
    throw new Error(`Upload failed: HTTP ${res.statusCode}`)
  }

  const data = JSON.parse(res.data) as { url: string }
  return data.url
}
