import { useState, useEffect } from 'react'
import { User, Bell, Shield, Database, Receipt, ShieldCheck, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api, { API_BASE_URL } from '../services/api'
import toast from 'react-hot-toast'

// Tax Config Tab Component
const TaxConfigTab = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [deductionAmount, setDeductionAmount] = useState<number>(4400000)

  const { data: currentAmount, isLoading } = useQuery(
    'taxConfig.dependentDeduction',
    async () => {
      const res = await api.get('/tax-config/dependent-deduction')
      return res.data
    }
  )

  useEffect(() => {
    if (currentAmount !== undefined) {
      setDeductionAmount(currentAmount)
    }
  }, [currentAmount])

  const updateMutation = useMutation(
    async (amount: number) => {
      return api.patch('/tax-config/dependent-deduction', { amount })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('taxConfig.dependentDeduction')
        toast.success(t('settings.taxConfigUpdateSuccess') || 'Đã cập nhật giá trị giảm trừ thành công')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('settings.taxConfigUpdateError') || 'Không thể cập nhật giá trị giảm trừ')
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(deductionAmount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {t('settings.taxConfig') || 'Cấu hình thuế'}
        </h3>
        <p className="text-sm text-gray-600">
          {t('settings.taxConfigSubtitle') || 'Cấu hình giá trị giảm trừ thuế cho người phụ thuộc'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 bg-blue-50 border border-blue-200">
          <h4 className="text-md font-medium text-gray-900 mb-2">
            {t('settings.dependentDeductionAmount') || 'Giá trị giảm trừ người phụ thuộc'}
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            {t('settings.dependentDeductionDescription') || 
              'Giá trị này sẽ được sử dụng làm mặc định khi thêm người phụ thuộc mới. Bạn có thể thay đổi giá trị cho từng người phụ thuộc cụ thể.'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.deductionAmount') || 'Giá trị giảm trừ (VNĐ)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="input w-full"
                value={deductionAmount}
                onChange={(e) => setDeductionAmount(parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(deductionAmount)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                {t('settings.currentValue') || 'Giá trị hiện tại'}
              </h5>
              <p className="text-2xl font-bold text-primary-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(currentAmount || 4400000)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading
                ? t('common.saving') || 'Đang lưu...'
                : t('common.saveChanges') || 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// Insurance Config Tab Component
const InsuranceConfigTab = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<any>(null)
  const [form, setForm] = useState<any>({
    type: 'social',
    insuranceRate: '',
    salaryType: 'contract_total_income',
    isActive: true,
  })

  const { data: configs, isLoading } = useQuery(
    'insuranceConfigs',
    async () => {
      const res = await api.get('/insurance-config')
      return res.data
    }
  )

  const createMutation = useMutation(
    (payload: any) => api.post('/insurance-config', payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('insuranceConfigs')
        toast.success(t('settings.insuranceCreateSuccess'))
        setIsModalOpen(false)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('settings.insuranceCreateError'))
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, payload }: { id: string; payload: any }) => api.patch(`/insurance-config/${id}`, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('insuranceConfigs')
        toast.success(t('settings.insuranceUpdateSuccess'))
        setIsModalOpen(false)
        setEditingConfig(null)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('settings.insuranceUpdateError'))
      }
    }
  )

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/insurance-config/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('insuranceConfigs')
        toast.success(t('settings.insuranceDeleteSuccess'))
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('settings.insuranceDeleteError'))
      }
    }
  )

  const resetForm = () => {
    setForm({
      type: 'social',
      insuranceRate: '',
      salaryType: 'contract_total_income',
      isActive: true,
    })
  }

  const handleOpenModal = (config?: any) => {
    if (config) {
      setEditingConfig(config)
      setForm({
        type: config.type,
        insuranceRate: config.insuranceRate || config.employeeRate || '',
        salaryType: config.salaryType || 'contract_total_income',
        isActive: config.isActive,
      })
    } else {
      setEditingConfig(null)
      resetForm()
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      insuranceRate: parseFloat(form.insuranceRate) || 0,
    }

    if (editingConfig) {
      updateMutation.mutate({ id: editingConfig.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t('settings.insuranceConfirmDelete'))) {
      deleteMutation.mutate(id)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      social: 'Bảo hiểm xã hội (BHXH)',
      health: 'Bảo hiểm y tế (BHYT)',
      unemployment: 'Bảo hiểm thất nghiệp (BHTN)',
    }
    return labels[type] || type
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {t('settings.insuranceConfig')}
          </h3>
          <p className="text-sm text-gray-600">
            {t('settings.insuranceConfigSubtitle')}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          {t('settings.addInsurance')}
        </button>
      </div>

      {configs && configs.length > 0 ? (
        <div className="space-y-4">
          {configs.map((config: any) => (
            <div
              key={config.id}
              className="card p-6 border-l-4 border-l-primary-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-lg font-medium text-gray-900">
                      {getTypeLabel(config.type)}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      config.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {config.isActive ? 'Đang áp dụng' : 'Không áp dụng'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Giá trị đóng bảo hiểm</p>
                      <p className="text-xl font-bold text-blue-600">
                        {config.insuranceRate || config.employeeRate || 0}%
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Tính trên loại lương</p>
                      <p className="text-lg font-semibold text-green-600">
                        {config.salaryType === 'contract_total_income' 
                          ? 'Tổng thu nhập trong hợp đồng'
                          : config.salaryType === 'basic_salary'
                          ? 'Lương cơ bản'
                          : config.salaryType || 'Tổng thu nhập trong hợp đồng'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(config)}
                    className="btn btn-secondary text-sm"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="btn btn-danger text-sm"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>{t('settings.noInsuranceConfigs')}</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingConfig
                ? t('settings.editInsurance')
                : t('settings.addInsurance')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('settings.insuranceType')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input mt-1 w-full"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                    disabled={!!editingConfig}
                  >
                    <option value="social">Bảo hiểm xã hội (BHXH)</option>
                    <option value="health">Bảo hiểm y tế (BHYT)</option>
                    <option value="unemployment">Bảo hiểm thất nghiệp (BHTN)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('settings.insuranceRate') || 'Giá trị đóng bảo hiểm (%)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="input mt-1 w-full"
                    value={form.insuranceRate}
                    onChange={(e) => setForm({ ...form, insuranceRate: e.target.value === '' ? '' : parseFloat(e.target.value) || '' })}
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('settings.salaryType') || 'Tính trên'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input mt-1 w-full"
                    value={form.salaryType}
                    onChange={(e) => setForm({ ...form, salaryType: e.target.value })}
                    required
                  >
                    <option value="contract_total_income">Tổng thu nhập trong hợp đồng</option>
                    <option value="basic_salary">Lương cơ bản</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {t('settings.isActive')}
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingConfig(null)
                    resetForm()
                  }}
                  className="btn btn-secondary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {editingConfig ? t('common.saveChanges') : t('common.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Standard Working Hours Tab Component
const StandardWorkingHoursTab = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<any>(null)
  const [form, setForm] = useState<any>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    standardHours: 0,
    standardDays: 0,
    description: '',
  })

  const { data: configs, isLoading } = useQuery(
    'standardWorkingHours',
    async () => {
      const res = await api.get('/standard-working-hours')
      return res.data
    }
  )

  const createMutation = useMutation(
    (payload: any) => api.post('/standard-working-hours', payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('standardWorkingHours')
        toast.success(t('settings.workingHoursCreateSuccess') || 'Đã tạo cấu hình giờ công chuẩn thành công')
        setIsModalOpen(false)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('settings.workingHoursCreateError') || 'Không thể tạo cấu hình giờ công chuẩn')
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, payload }: { id: string; payload: any }) => api.patch(`/standard-working-hours/${id}`, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('standardWorkingHours')
        toast.success(t('settings.workingHoursUpdateSuccess') || 'Đã cập nhật cấu hình giờ công chuẩn thành công')
        setIsModalOpen(false)
        setEditingConfig(null)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('settings.workingHoursUpdateError') || 'Không thể cập nhật cấu hình giờ công chuẩn')
      }
    }
  )

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/standard-working-hours/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('standardWorkingHours')
        toast.success(t('settings.workingHoursDeleteSuccess') || 'Đã xóa cấu hình giờ công chuẩn thành công')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('settings.workingHoursDeleteError') || 'Không thể xóa cấu hình giờ công chuẩn')
      }
    }
  )

  const calculateMutation = useMutation(
    ({ year, month }: { year: number; month: number }) => api.get(`/standard-working-hours/calculate/${year}/${month}`),
    {
      onSuccess: (data) => {
        setForm((prev: any) => ({
          ...prev,
          standardHours: data.data.hours,
          standardDays: data.data.days,
        }))
        toast.success(t('settings.workingHoursCalculateSuccess') || 'Đã tính toán giờ công chuẩn tự động')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('settings.workingHoursCalculateError') || 'Không thể tính toán giờ công chuẩn')
      }
    }
  )

  const resetForm = () => {
    setForm({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      standardHours: 0,
      standardDays: 0,
      description: '',
    })
  }

  const handleOpenModal = (config?: any) => {
    if (config) {
      setEditingConfig(config)
      setForm({
        year: config.year,
        month: config.month,
        standardHours: config.standardHours,
        standardDays: config.standardDays,
        description: config.description || '',
      })
    } else {
      setEditingConfig(null)
      resetForm()
    }
    setIsModalOpen(true)
  }

  const handleCalculate = () => {
    calculateMutation.mutate({ year: form.year, month: form.month })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
    }

    if (editingConfig) {
      updateMutation.mutate({ id: editingConfig.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t('settings.workingHoursConfirmDelete') || 'Bạn có chắc chắn muốn xóa cấu hình giờ công chuẩn này?')) {
      deleteMutation.mutate(id)
    }
  }

  const getMonthName = (month: number) => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ]
    return months[month - 1] || `Tháng ${month}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {t('settings.standardWorkingHours') || 'Giờ công chuẩn trong tháng'}
          </h3>
          <p className="text-sm text-gray-600">
            {t('settings.standardWorkingHoursDescription') || 'Quản lý số giờ công chuẩn cho từng tháng'}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          {t('settings.addWorkingHours') || 'Thêm cấu hình'}
        </button>
      </div>

      {configs && configs.length > 0 ? (
        <div className="space-y-4">
          {configs.map((config: any) => (
            <div
              key={config.id}
              className="card p-6 border-l-4 border-l-blue-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-lg font-medium text-gray-900">
                      {getMonthName(config.month)}/{config.year}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Số giờ công chuẩn</p>
                      <p className="text-xl font-bold text-blue-600">{config.standardHours} giờ</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Số ngày công chuẩn</p>
                      <p className="text-xl font-bold text-green-600">{config.standardDays} ngày</p>
                    </div>
                  </div>

                  {config.description && (
                    <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(config)}
                    className="btn btn-secondary text-sm"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="btn btn-danger text-sm"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>{t('settings.noWorkingHoursConfigs') || 'Chưa có cấu hình giờ công chuẩn nào'}</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingConfig
                ? t('settings.editWorkingHours') || 'Chỉnh sửa giờ công chuẩn'
                : t('settings.addWorkingHours') || 'Thêm giờ công chuẩn'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('settings.year') || 'Năm'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="input mt-1 w-full"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    min="2000"
                    max="2100"
                    required
                    disabled={!!editingConfig}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('settings.month') || 'Tháng'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input mt-1 w-full"
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                    required
                    disabled={!!editingConfig}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {getMonthName(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('settings.standardHours') || 'Số giờ công chuẩn'} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="input mt-1 w-full"
                      value={form.standardHours}
                      onChange={(e) => setForm({ ...form, standardHours: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleCalculate}
                      className="btn btn-secondary mt-1"
                      disabled={calculateMutation.isLoading}
                    >
                      {t('settings.calculate') || 'Tính tự động'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('settings.standardDays') || 'Số ngày công chuẩn'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="input mt-1 w-full"
                    value={form.standardDays}
                    onChange={(e) => setForm({ ...form, standardDays: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('settings.description') || 'Mô tả'}
                  </label>
                  <textarea
                    className="input mt-1 w-full"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder={t('settings.workingHoursDescriptionPlaceholder') || 'Ví dụ: Tháng 12 có nhiều ngày nghỉ lễ'}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingConfig(null)
                    resetForm()
                  }}
                  className="btn btn-secondary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {editingConfig ? t('common.saveChanges') : t('common.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState<any>({})
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Get current user data
  const { data: currentUser, isLoading } = useQuery(
    'currentUser',
    async () => {
      const response = await api.get('/auth/me')
      return response.data
    },
    { enabled: !!user }
  )

  // Avatar upload mutation
  const uploadMutation = useMutation(
    async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.post(`/employees/upload-avatar/${user?.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('currentUser')
        toast.success('Avatar updated successfully!')
      },
      onError: () => {
        toast.error('Failed to update avatar')
      }
    }
  )

  // Get work locations and shifts
  const { data: workLocations } = useQuery('work-locations', async () => {
    const res = await api.get('/work-locations')
    return res.data
  })

  const { data: shifts } = useQuery('shifts', async () => {
    const res = await api.get('/shifts')
    return res.data
  })

  // Profile update mutation
  const updateProfileMutation = useMutation(
    async (payload: any) => {
      return api.patch(`/employees/${currentUser?.employee?.id}`, payload)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('currentUser')
        toast.success('Profile updated successfully!')
      },
      onError: () => {
        toast.error('Failed to update profile')
      }
    }
  )

  const tabs = [
    { id: 'profile', name: t('settings.profileInfo'), icon: User },
    { id: 'notifications', name: t('settings.notifications'), icon: Bell },
    { id: 'security', name: t('settings.security'), icon: Shield },
    { id: 'tax', name: t('settings.taxConfig') || 'Cấu hình thuế', icon: Receipt },
    { id: 'insurance', name: t('settings.insuranceConfig') || 'Cấu hình bảo hiểm', icon: ShieldCheck },
    { id: 'working-hours', name: t('settings.standardWorkingHours') || 'Giờ công chuẩn', icon: Clock },
    { id: 'system', name: t('settings.system'), icon: Database },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{t('settings.profileInfo')}</h3>
              <p className="text-sm text-gray-600">{t('settings.updatePersonal')}</p>
            </div>
            
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                {currentUser?.avatar ? (
                  <img 
                    src={`${API_BASE_URL}${currentUser.avatar}`} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full object-cover" 
                    onError={(e) => {
                      console.error('Avatar load error for:', `${API_BASE_URL}${currentUser.avatar}`);
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center ${currentUser?.avatar ? 'hidden' : ''}`}
                  style={{ display: currentUser?.avatar ? 'none' : 'flex' }}
                >
                  <span className="text-lg font-semibold text-gray-600">
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                  </span>
                </div>
              </div>
              <div>
                <label className="btn btn-secondary cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadMutation.mutate(file)
                    }}
                    disabled={uploadMutation.isLoading}
                  />
                  {uploadMutation.isLoading ? 'Uploading...' : 'Upload Avatar'}
                </label>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const payload = {
                firstName: form.firstName || currentUser?.firstName,
                lastName: form.lastName || currentUser?.lastName,
                phone: form.phone || currentUser?.phone,
                workLocationId: form.workLocationId !== undefined ? form.workLocationId : currentUser?.employee?.workLocationId,
                shiftId: form.shiftId !== undefined ? form.shiftId : currentUser?.employee?.shiftId,
                password: form.password || undefined
              }
              updateProfileMutation.mutate(payload)
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('settings.firstName')}</label>
                  <input 
                    type="text" 
                    className="input mt-1" 
                    defaultValue={currentUser?.firstName || ''} 
                    onChange={(e) => setForm((f: any) => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('settings.lastName')}</label>
                  <input 
                    type="text" 
                    className="input mt-1" 
                    defaultValue={currentUser?.lastName || ''} 
                    onChange={(e) => setForm((f: any) => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" className="input mt-1" defaultValue={currentUser?.email || ''} disabled />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('settings.phone')}</label>
                  <input 
                    type="tel" 
                    className="input mt-1" 
                    defaultValue={currentUser?.phone || ''} 
                    onChange={(e) => setForm((f: any) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Work Location</label>
                  <select 
                    className="input mt-1" 
                    value={form.workLocationId !== undefined ? form.workLocationId : (currentUser?.employee?.workLocationId || '')} 
                    onChange={(e) => setForm((f: any) => ({ ...f, workLocationId: e.target.value }))}
                  >
                    <option value="">Select Work Location</option>
                    {workLocations?.map((wl: any) => (
                      <option key={wl.id} value={wl.id}>{wl.name}</option>
                    ))}
                  </select>
                  {currentUser?.employee?.workLocation && (
                    <p className="text-xs text-gray-500 mt-1">
                      {currentUser.employee.workLocation.name} • {currentUser.employee.workLocation.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shift</label>
                  <select 
                    className="input mt-1" 
                    value={form.shiftId !== undefined ? form.shiftId : (currentUser?.employee?.shiftId || '')} 
                    onChange={(e) => setForm((f: any) => ({ ...f, shiftId: e.target.value }))}
                  >
                    <option value="">Select</option>
                    {shifts?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>
                    ))}
                  </select>
                  {currentUser?.employee?.shift && (
                    <p className="text-xs text-gray-500 mt-1">
                      {currentUser.employee.shift.name} • {currentUser.employee.shift.startTime}-{currentUser.employee.shift.endTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password (optional)</label>
                  <input 
                    type="password" 
                    className="input mt-1" 
                    placeholder="Leave blank to keep current" 
                    onChange={(e) => setForm((f: any) => ({ ...f, password: e.target.value }))}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={updateProfileMutation.isLoading}
              >
                {updateProfileMutation.isLoading ? 'Saving...' : t('settings.saveChanges')}
              </button>
            </form>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{t('settings.notifications')}</h3>
              <p className="text-sm text-gray-600">{t('settings.notificationsSubtitle')}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Leave Request Notifications</h4>
                  <p className="text-sm text-gray-600">Get notified about leave requests</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Payroll Notifications</h4>
                  <p className="text-sm text-gray-600">Get notified about payroll updates</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </div>
            </div>
            <button className="btn btn-primary">Save Preferences</button>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{t('settings.security')}</h3>
              <p className="text-sm text-gray-600">{t('settings.securitySubtitle')}</p>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{t('settings.changePassword')}</h4>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('settings.currentPassword')}</label>
                    <input type="password" className="input mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('settings.newPassword')}</label>
                    <input type="password" className="input mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('settings.confirmNewPassword')}</label>
                    <input type="password" className="input mt-1" />
                  </div>
                </div>
                <button className="btn btn-primary mt-4">{t('settings.updatePassword')}</button>
              </div>
            </div>
          </div>
        )

      case 'tax':
        return <TaxConfigTab />
      case 'insurance':
        return <InsuranceConfigTab />
      case 'working-hours':
        return <StandardWorkingHoursTab />
      case 'system':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{t('settings.system')}</h3>
              <p className="text-sm text-gray-600">{t('settings.systemSubtitle')}</p>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{t('settings.dbBackup')}</h4>
                <p className="text-sm text-gray-600">{t('settings.systemSubtitle')}</p>
                <button className="btn btn-secondary mt-2">{t('settings.createBackup')}</button>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{t('settings.systemLogs')}</h4>
                <p className="text-sm text-gray-600">{t('settings.systemSubtitle')}</p>
                <button className="btn btn-secondary mt-2">{t('settings.viewLogs')}</button>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{t('settings.cacheManagement')}</h4>
                <p className="text-sm text-gray-600">{t('settings.systemSubtitle')}</p>
                <button className="btn btn-secondary mt-2">{t('settings.clearCache')}</button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-600">{t('settings.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="card p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div className="card p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
