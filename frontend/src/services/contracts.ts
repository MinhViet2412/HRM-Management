import api from './api'

export type Contract = {
  id: string
  contractCode: string
  employeeId: string
  typeId?: string | null
  startDate: string
  endDate?: string | null
  status: 'active' | 'expired' | 'terminated' | 'pending'
  baseSalary: number
  allowance?: number
  bonus?: number
  benefits?: Record<string, unknown>
  notes?: string
  createdAt: string
  updatedAt: string
}

export type ContractType = {
  id: string
  name: string
  description?: string
  standardTermMonths?: number
  probationMonths?: number
}

export type ContractTemplate = {
  id: string
  name: string
  content: string
  typeId?: string | null
}

export const ContractsAPI = {
  // Contracts
  list: async (): Promise<Contract[]> => {
    const { data } = await api.get('/contracts')
    return data
  },
  get: async (id: string): Promise<Contract> => {
    const { data } = await api.get(`/contracts/${id}`)
    return data
  },
  create: async (payload: Partial<Contract>): Promise<Contract> => {
    const { data } = await api.post('/contracts', payload)
    return data
  },
  update: async (id: string, payload: Partial<Contract>): Promise<Contract> => {
    const { data } = await api.patch(`/contracts/${id}`, payload)
    return data
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/contracts/${id}`)
  },
  approve: async (id: string): Promise<Contract> => {
    const { data } = await api.post(`/contracts/${id}/approve`)
    return data
  },
  reject: async (id: string, reason?: string): Promise<Contract> => {
    const { data } = await api.post(`/contracts/${id}/reject`, { reason })
    return data
  },

  // Types
  listTypes: async (): Promise<ContractType[]> => {
    const { data } = await api.get('/contract-types')
    return data
  },
  createType: async (payload: Partial<ContractType>): Promise<ContractType> => {
    const { data } = await api.post('/contracts/types', payload)
    return data
  },
  updateType: async (id: string, payload: Partial<ContractType>): Promise<ContractType> => {
    const { data } = await api.patch(`/contracts/types/${id}`, payload)
    return data
  },
  removeType: async (id: string): Promise<void> => {
    await api.delete(`/contracts/types/${id}`)
  },

  // Templates
  listTemplates: async (): Promise<ContractTemplate[]> => {
    const { data } = await api.get('/contracts/templates')
    return data
  },
  createTemplate: async (payload: Partial<ContractTemplate>): Promise<ContractTemplate> => {
    const { data } = await api.post('/contracts/templates', payload)
    return data
  },
  updateTemplate: async (id: string, payload: Partial<ContractTemplate>): Promise<ContractTemplate> => {
    const { data } = await api.patch(`/contracts/templates/${id}`, payload)
    return data
  },
  removeTemplate: async (id: string): Promise<void> => {
    await api.delete(`/contracts/templates/${id}`)
  },
}



