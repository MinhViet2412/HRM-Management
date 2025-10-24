import api from './api'

export type ContractType = {
  id: string
  name: string
  description?: string
  standardTermMonths?: number
  probationMonths?: number
  createdAt: string
  updatedAt: string
}

export const ContractTypesAPI = {
  list: async (): Promise<ContractType[]> => {
    const { data } = await api.get('/contract-types')
    return data
  },
  get: async (id: string): Promise<ContractType> => {
    const { data } = await api.get(`/contract-types/${id}`)
    return data
  },
  create: async (payload: Partial<ContractType>): Promise<ContractType> => {
    const { data } = await api.post('/contract-types', payload)
    return data
  },
  update: async (id: string, payload: Partial<ContractType>): Promise<ContractType> => {
    const { data } = await api.patch(`/contract-types/${id}`, payload)
    return data
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/contract-types/${id}`)
  },
}
