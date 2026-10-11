import { request } from './request'

export interface HealthResponse {
  status: string
  timestamp: number
  uptime: number
}

export function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>({ url: '/health' })
}
