// apps/miniapp/src/utils/format.ts

/**
 * 格式化日期为：YYYY年MM月DD日 HH:mm
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}年${month}月${day}日 ${hours}:${minutes}`
}

/**
 * 格式化简短日期为：MM月DD日 HH:mm
 */
export function formatShortDateTime(iso: string): string {
  const d = new Date(iso)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}

/**
 * 格式化价格（分转元）
 * @param price 单位：分
 */
export function formatPrice(price: number): string {
  if (price === 0) return '免费'
  return `¥${(price / 100).toFixed(2)}`
}
