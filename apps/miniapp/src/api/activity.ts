import { request } from './request'

export interface Activity {
  id: string
  title: string
  description: string | null
  cover: string | null
  startAt: string
  endAt: string
  location: string
  latitude: number | null
  longitude: number | null
  quota: number
  enrolled: number
  price: number
  status: 'DRAFT' | 'PUBLISHED' | 'FULL' | 'CANCELLED' | 'FINISHED'
  organizerId: string
  organizer: {
    id: string
    nickname: string | null
    avatar: string | null
  }
  createdAt: string
  updatedAt: string
}

export interface ActivityListResponse {
  items: Activity[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface QueryActivityParams {
  page?: number
  pageSize?: number
  status?: string
}

export function fetchActivities(params: QueryActivityParams = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.status) query.set('status', params.status)

  const qs = query.toString()
  return request<ActivityListResponse>({
    url: `/activities${qs ? `?${qs}` : ''}`,
  })
}

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
