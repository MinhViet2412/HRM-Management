import api from './api'

export type OvertimeStatus = 'pending' | 'approved' | 'rejected'

export interface OvertimeRequestDto {
  id: string
  employeeId: string
  date: string
  startTime: string
  endTime: string
  hours: number
  reason?: string
  status: OvertimeStatus
  approverId?: string
  approvedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface CreateOvertimePayload {
  date: string
  startTime: string
  endTime: string
  reason?: string
  approverId?: string
}

export const createOvertime = async (payload: CreateOvertimePayload) => {
  const { data } = await api.post<OvertimeRequestDto>('/overtime', payload)
  return data
}

export const getMyOvertime = async () => {
  const { data } = await api.get<OvertimeRequestDto[]>('/overtime/me')
  return data
}

export const getAssignedOvertime = async () => {
  const { data } = await api.get<OvertimeRequestDto[]>('/overtime/assigned')
  return data
}

export const approveOvertime = async (id: string, note?: string) => {
  const { data } = await api.post<OvertimeRequestDto>(`/overtime/${id}/approve`, { note })
  return data
}

export const rejectOvertime = async (id: string, reason?: string) => {
  const { data } = await api.post<OvertimeRequestDto>(`/overtime/${id}/reject`, { reason })
  return data
}


