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

export function fetchMyOrders() {
  return request<OrderInfo[]>({ url: '/orders/my' })
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
