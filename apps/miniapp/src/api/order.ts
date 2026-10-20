import { request } from './request'

export interface CreateOrderParams {
  activityId: string
}

export interface OrderInfo {
  id: string
  orderNo: string
  userId: string
  activityId: string
  amount: number
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
  createdAt: string
  activity?: {
    id: string
    title: string
    cover: string | null
    startAt: string
  }
}

export interface OrderListResponse {
  items: OrderInfo[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function fetchMyOrders(params: { page?: number; pageSize?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  const qs = query.toString()
  return request<OrderListResponse>({
    url: `/orders/my${qs ? `?${qs}` : ''}`,
  })
}

export function createOrder(data: CreateOrderParams) {
  return request<OrderInfo>({
    url: '/orders',
    method: 'POST',
    data,
  })
}

export function cancelOrder(orderId: string) {
  return request<{ message: string }>({
    url: `/orders/${orderId}`,
    method: 'DELETE',
  })
}
