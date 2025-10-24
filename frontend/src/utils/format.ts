export const formatCurrencyVN = (value: number | string, suffix = ' VNĐ'): string => {
  const num = Number(value || 0)
  return num.toLocaleString('vi-VN') + suffix
}

export const formatNumberVN = (value: number | string): string => {
  const num = Number(value || 0)
  return num.toLocaleString('vi-VN')
}





