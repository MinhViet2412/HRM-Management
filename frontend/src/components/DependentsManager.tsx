import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import toast from 'react-hot-toast'

interface Dependent {
  id: string
  fullName: string
  dateOfBirth?: string
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other'
  citizenId?: string
  taxCode?: string
  address?: string
  phone?: string
  isActive: boolean
  deductionAmount?: number
  notes?: string
  employeeId: string
}

interface DependentsManagerProps {
  employeeId: string
  readOnly?: boolean
}

const DependentsManager = ({ employeeId, readOnly = false }: DependentsManagerProps) => {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null)
  const queryClient = useQueryClient()

  // Lấy giá trị giảm trừ mặc định từ config
  const { data: defaultDeductionAmount } = useQuery(
    'taxConfig.dependentDeduction',
    async () => {
      const res = await api.get('/tax-config/dependent-deduction')
      return res.data
    },
    {
      initialData: 4400000, // Fallback nếu API chưa sẵn sàng
    }
  )

  const [form, setForm] = useState<Partial<Dependent>>({
    fullName: '',
    dateOfBirth: '',
    relationship: 'child',
    citizenId: '',
    taxCode: '',
    address: '',
    phone: '',
    isActive: true,
    deductionAmount: defaultDeductionAmount || 4400000,
    notes: '',
  })

  // Cập nhật form khi defaultDeductionAmount thay đổi
  useEffect(() => {
    if (defaultDeductionAmount && !editingDependent) {
      setForm(prev => ({
        ...prev,
        deductionAmount: defaultDeductionAmount,
      }))
    }
  }, [defaultDeductionAmount, editingDependent])

  const { data: dependents, isLoading } = useQuery(
    ['dependents', employeeId],
    async () => {
      const res = await api.get(`/dependents/employee/${employeeId}`)
      return res.data
    },
    { enabled: !!employeeId }
  )

  const createMutation = useMutation(
    (payload: any) => api.post('/dependents', payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['dependents', employeeId])
        toast.success(t('dependents.createSuccess'))
        setIsModalOpen(false)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('dependents.createError'))
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, payload }: { id: string; payload: any }) => api.patch(`/dependents/${id}`, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['dependents', employeeId])
        toast.success(t('dependents.updateSuccess'))
        setIsModalOpen(false)
        setEditingDependent(null)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('dependents.updateError'))
      }
    }
  )

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/dependents/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['dependents', employeeId])
        toast.success(t('dependents.deleteSuccess'))
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('dependents.deleteError'))
      }
    }
  )

  const resetForm = () => {
    setForm({
      fullName: '',
      dateOfBirth: '',
      relationship: 'child',
      citizenId: '',
      taxCode: '',
      address: '',
      phone: '',
      isActive: true,
      deductionAmount: defaultDeductionAmount || 4400000,
      notes: '',
    })
  }

  const handleOpenModal = (dependent?: Dependent) => {
    if (dependent) {
      setEditingDependent(dependent)
      setForm({
        fullName: dependent.fullName,
        dateOfBirth: dependent.dateOfBirth ? dependent.dateOfBirth.split('T')[0] : '',
        relationship: dependent.relationship,
        citizenId: dependent.citizenId || '',
        taxCode: dependent.taxCode || '',
        address: dependent.address || '',
        phone: dependent.phone || '',
        isActive: dependent.isActive,
        deductionAmount: dependent.deductionAmount || defaultDeductionAmount || 4400000,
        notes: dependent.notes || '',
      })
    } else {
      setEditingDependent(null)
      resetForm()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingDependent(null)
    resetForm()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      employeeId,
      dateOfBirth: form.dateOfBirth || undefined,
    }

    if (editingDependent) {
      updateMutation.mutate({ id: editingDependent.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t('dependents.confirmDelete'))) {
      deleteMutation.mutate(id)
    }
  }

  const getRelationshipLabel = (relationship: string) => {
    const labels: Record<string, string> = {
      spouse: t('dependents.relationshipSpouse'),
      child: t('dependents.relationshipChild'),
      parent: t('dependents.relationshipParent'),
      sibling: t('dependents.relationshipSibling'),
      other: t('dependents.relationshipOther'),
    }
    return labels[relationship] || relationship
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('dependents.title')}
        </h2>
        {!readOnly && (
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('dependents.add')}
          </button>
        )}
      </div>

      {dependents && dependents.length > 0 ? (
        <div className="space-y-3">
          {dependents.map((dependent: Dependent) => (
            <div
              key={dependent.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">{dependent.fullName}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      dependent.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dependent.isActive ? t('dependents.activeStatus') : t('dependents.inactiveStatus')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{t('dependents.relationship')}:</span> {getRelationshipLabel(dependent.relationship)}
                    </div>
                    {dependent.dateOfBirth && (
                      <div>
                        <span className="font-medium">{t('dependents.dateOfBirth')}:</span>{' '}
                        {new Date(dependent.dateOfBirth).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                    {dependent.citizenId && (
                      <div>
                        <span className="font-medium">{t('dependents.citizenId')}:</span> {dependent.citizenId}
                      </div>
                    )}
                    {dependent.taxCode && (
                      <div>
                        <span className="font-medium">{t('dependents.taxCode')}:</span> {dependent.taxCode}
                      </div>
                    )}
                    {dependent.phone && (
                      <div>
                        <span className="font-medium">{t('dependents.phone')}:</span> {dependent.phone}
                      </div>
                    )}
                    {dependent.deductionAmount && (
                      <div>
                        <span className="font-medium">{t('dependents.deductionAmount')}:</span>{' '}
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(dependent.deductionAmount)}
                      </div>
                    )}
                    {dependent.address && (
                      <div className="col-span-2">
                        <span className="font-medium">{t('dependents.address')}:</span> {dependent.address}
                      </div>
                    )}
                    {dependent.notes && (
                      <div className="col-span-2">
                        <span className="font-medium">{t('dependents.notes')}:</span> {dependent.notes}
                      </div>
                    )}
                  </div>
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleOpenModal(dependent)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dependent.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {t('dependents.noDependents')}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingDependent ? t('dependents.edit') : t('dependents.add')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('dependents.fullName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input mt-1 w-full"
                    value={form.fullName || ''}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('dependents.relationship')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input mt-1 w-full"
                    value={form.relationship || 'child'}
                    onChange={(e) => setForm({ ...form, relationship: e.target.value as any })}
                    required
                  >
                    <option value="spouse">{t('dependents.relationshipSpouse')}</option>
                    <option value="child">{t('dependents.relationshipChild')}</option>
                    <option value="parent">{t('dependents.relationshipParent')}</option>
                    <option value="sibling">{t('dependents.relationshipSibling')}</option>
                    <option value="other">{t('dependents.relationshipOther')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('dependents.dateOfBirth')}
                  </label>
                  <input
                    type="date"
                    className="input mt-1 w-full"
                    value={form.dateOfBirth || ''}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('dependents.citizenId')}
                  </label>
                  <input
                    type="text"
                    className="input mt-1 w-full"
                    value={form.citizenId || ''}
                    onChange={(e) => setForm({ ...form, citizenId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('dependents.taxCode')}
                  </label>
                  <input
                    type="text"
                    className="input mt-1 w-full"
                    value={form.taxCode || ''}
                    onChange={(e) => setForm({ ...form, taxCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('dependents.phone')}
                  </label>
                  <input
                    type="tel"
                    className="input mt-1 w-full"
                    value={form.phone || ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('dependents.deductionAmount')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="input mt-1 w-full"
                    value={form.deductionAmount || 4400000}
                    onChange={(e) => setForm({ ...form, deductionAmount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="1000"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.deductionAmount ? new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(form.deductionAmount) : ''}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('dependents.address')}
                  </label>
                  <input
                    type="text"
                    className="input mt-1 w-full"
                    value={form.address || ''}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('dependents.notes')}
                  </label>
                  <textarea
                    className="input mt-1 w-full"
                    rows={3}
                    value={form.notes || ''}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={form.isActive ?? true}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {t('dependents.isActive')}
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {editingDependent ? t('common.saveChanges') : t('common.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DependentsManager

