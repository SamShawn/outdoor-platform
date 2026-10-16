import { request } from './request'

export interface CreateActivityParams {
  title: string
  description?: string
  cover?: string
  startAt: string
  endAt: string
  location: string
  latitude?: number
  longitude?: number
  quota: number
  price: number
}

export function createActivity(data: CreateActivityParams) {
  return request({ url: '/activities', method: 'POST', data })
}
