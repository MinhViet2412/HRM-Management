import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Users, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import MultiSelect from '../components/MultiSelect'
import api, { API_BASE_URL } from '../services/api'
import toast from 'react-hot-toast'
import SetUserRoleModal from '../components/SetUserRoleModal'

interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  status: string
  department?: {
    id: string
    name: string
  }
  position?: {
    id: string
    title: string
  }
  workLocation?: {
    id: string
    name: string
  }
  shift?: {
    id: string
    name: string
  }
}

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedPositions, setSelectedPositions] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [roleModal, setRoleModal] = useState<{ userId: string; currentRole?: string } | null>(null)
  const [openAfterCreate, setOpenAfterCreate] = useState(false)
  const [form, setForm] = useState<any>({})
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { data: employees, isLoading } = useQuery('employees', async () => {
    const res = await api.get('/employees')
    return res.data
  })

  const { data: departments } = useQuery('departments', async () => {
    const res = await api.get('/departments')
    return res.data
  })

  const { data: positions } = useQuery('positions', async () => {
    const res = await api.get('/positions')
    return res.data
  })

  const { data: workLocations } = useQuery('work-locations', async () => {
    const res = await api.get('/work-locations')
    return res.data
  })

  const { data: shifts } = useQuery('shifts', async () => {
    const res = await api.get('/shifts')
    return res.data
  })

  const createMutation = useMutation((payload: any) => api.post('/employees', payload), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('employees')
      toast.success(t('employees.createSuccess'))
      setForm({})
      setIsCreateOpen(false)
      if (openAfterCreate) {
        navigate(`/employees/${data.data.id}`)
      }
    },
    onError: () => {
      toast.error(t('employees.createError'))
    }
  })

  const deleteMutation = useMutation((id: string) => api.delete(`/employees/${id}`), {
    onSuccess: () => {
      queryClient.invalidateQueries('employees')
      toast.success(t('employees.deleteSuccess'))
    },
    onError: (error: any) => {
      console.error('Delete error:', error)
      toast.error(error.response?.data?.message || t('employees.deleteError'))
    }
  })

  const statusChangeMutation = useMutation(
    ({ id, status }: { id: string; status: string }) => 
      api.patch(`/employees/${id}`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees')
        toast.success(t('employees.statusChanged'))
      },
      onError: (error: any) => {
        console.error('Status change error:', error)
        toast.error(error.response?.data?.message || t('employees.statusChangeError'))
      }
    }
  )

  const filteredEmployees = employees?.filter((employee: Employee) => {
    const matchesSearch = !searchTerm || 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartments = selectedDepartments.length === 0 || 
      selectedDepartments.includes(employee.department?.id || '')

    const matchesPositions = selectedPositions.length === 0 || 
      selectedPositions.includes(employee.position?.id || '')

    const matchesStatus = !selectedStatus || employee.status === selectedStatus

    return matchesSearch && matchesDepartments && matchesPositions && matchesStatus
  }) || []

  const handleEdit = (id: string) => {
    navigate(`/employees/${id}`)
  }

  const handleDelete = (id: string, status: string) => {
    if (status === 'active') {
      toast.error('Không thể xóa nhân viên đang hoạt động. Vui lòng chuyển trạng thái thành "Không hoạt động" hoặc "Nghỉ việc" trước.')
      return
    }
    
    if (confirm(t('employees.confirmDelete'))) {
      console.log('Attempting to delete employee:', id)
      deleteMutation.mutate(id)
    }
  }

  const handleStatusChange = (id: string, currentStatus: string, newStatus?: string) => {
    const targetStatus = newStatus || (currentStatus === 'active' ? 'inactive' : 'active')
    const confirmMessage = t('employees.confirmStatusChange')
    
    if (confirm(confirmMessage)) {
      statusChangeMutation.mutate({ id, status: targetStatus })
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(form)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('employees.title')}</h1>
          <p className="text-gray-600">{t('employees.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{t('employees.addEmployee')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              {t('common.search')}
            </label>
              <input
                type="text"
              className="input w-full"
              placeholder={t('employees.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('employees.department')}
            </label>
            <MultiSelect
              options={departments?.map((d: any) => ({ value: d.id, label: d.name })) || []}
              value={selectedDepartments}
              onChange={setSelectedDepartments}
              placeholder={t('employees.selectDepartment')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('employees.position')}
            </label>
          <MultiSelect
              options={positions?.map((p: any) => ({ value: p.id, label: p.title })) || []}
              value={selectedPositions}
              onChange={setSelectedPositions}
              placeholder={t('employees.selectPosition')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('employees.status')}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{t('employees.selectStatus')}</option>
              <option value="active">{t('employees.active')}</option>
              <option value="inactive">{t('employees.inactive')}</option>
              <option value="terminated">{t('employees.terminated')}</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end">
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedDepartments([])
              setSelectedPositions([])
              setSelectedStatus('')
            }}
            className="btn btn-secondary btn-sm"
          >
            {t('employees.resetFilters')}
          </button>
          </div>
        </div>

      {/* Responsive Table Section */}
      <div className="flex-1 overflow-hidden">
        <div className="card p-0 h-full flex flex-col">
          {/* Desktop Table */}
          <div className="hidden xl:block flex-1 overflow-auto">
            <table className="w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-5">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                    {t('employees.employee')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[160px]">
                    {t('common.name')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                    {t('common.email')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                    {t('common.phone')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                    {t('employees.department')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                    {t('employees.position')}
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                    {t('employees.status')}
                  </th>
                         <th className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                           {t('employees.actions')}
                         </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee: Employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      {employee.avatar ? (
                          <img 
                            src={`${API_BASE_URL}${employee.avatar}`} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0" 
                            onError={(e) => {
                              console.error('Avatar load error for:', `${API_BASE_URL}${employee.avatar}`);
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0 ${employee.avatar ? 'hidden' : ''}`}
                          style={{ display: employee.avatar ? 'none' : 'flex' }}
                        >
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {employee.employeeCode}
                          </div>
                        </div>
                    </div>
                  </td>
                    <td className="px-4 py-4">
                    <Link
                      to={`/employees/${employee.id}`}
                        className="text-sm text-primary-600 hover:text-primary-800 hover:underline truncate block"
                    >
                      {employee.firstName} {employee.lastName}
                    </Link>
                  </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 truncate">
                        {employee.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 truncate">
                        {employee.phone || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 truncate">
                        {employee.department?.name || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 truncate">
                        {employee.position?.title || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center w-[120px]">
                      <select
                        value={employee.status}
                        onChange={(e) => handleStatusChange(employee.id, employee.status, e.target.value)}
                        className={`w-full text-xs px-2 py-1 rounded border-0 focus:ring-2 focus:ring-primary-500 ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : employee.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="active">{t('employees.active')}</option>
                        <option value="inactive">{t('employees.inactive')}</option>
                        <option value="terminated">{t('employees.terminated')}</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(employee.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                          title={t('common.edit')}
                        >
                        <Edit className="h-4 w-4" />
                      </button>
                        {/* Set Role button */}
                        <button
                          onClick={() => setRoleModal({ userId: (employee as any).user?.id || (employee as any).userId, currentRole: (employee as any).user?.role?.name })}
                          className="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded"
                          title="Thiết lập quyền"
                        >
                          <Shield className="h-4 w-4" />
                      </button>
                      <button
                          onClick={() => handleDelete(employee.id, employee.status)}
                          className={`transition-colors p-1 rounded ${
                            employee.status === 'active'
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-800'
                          }`}
                          title={employee.status === 'active' ? 'Không thể xóa nhân viên đang hoạt động' : 'Xóa nhân viên'}
                          disabled={employee.status === 'active'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {/* Tablet Table */}
          <div className="hidden lg:block xl:hidden flex-1 overflow-auto">
            <table className="w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-5">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                    {t('employees.employee')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                    {t('common.name')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px]">
                    {t('common.email')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                    {t('employees.department')}
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                    {t('employees.status')}
                  </th>
                         <th className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[60px]">
                           {t('employees.actions')}
                         </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee: Employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        {employee.avatar ? (
                          <img 
                            src={`${API_BASE_URL}${employee.avatar}`} 
                            alt="Avatar" 
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0" 
                            onError={(e) => {
                              console.error('Avatar load error for:', `${API_BASE_URL}${employee.avatar}`);
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0 ${employee.avatar ? 'hidden' : ''}`}
                          style={{ display: employee.avatar ? 'none' : 'flex' }}
                        >
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {employee.employeeCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/employees/${employee.id}`}
                        className="text-xs text-primary-600 hover:text-primary-800 hover:underline truncate block"
                      >
                        {employee.firstName} {employee.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-900 truncate">
                        {employee.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-900 truncate">
                        {employee.department?.name || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center w-[100px]">
                      <select
                        value={employee.status}
                        onChange={(e) => handleStatusChange(employee.id, employee.status, e.target.value)}
                        className={`w-full text-xs px-1 py-1 rounded border-0 focus:ring-2 focus:ring-primary-500 ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : employee.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="active">{t('employees.active')}</option>
                        <option value="inactive">{t('employees.inactive')}</option>
                        <option value="terminated">{t('employees.terminated')}</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleEdit(employee.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                           title={t('common.edit')}
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id, employee.status)}
                          className={`transition-colors p-1 rounded ${
                            employee.status === 'active'
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-800'
                          }`}
                           title={employee.status === 'active' ? 'Không thể xóa nhân viên đang hoạt động' : 'Xóa nhân viên'}
                          disabled={employee.status === 'active'}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
          </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      </div>

          {/* Mobile Cards */}
          <div className="lg:hidden flex-1 overflow-auto">
            <div className="space-y-3 p-4">
              {filteredEmployees.map((employee: Employee) => (
                <div key={employee.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {employee.avatar ? (
                        <img 
                          src={`${API_BASE_URL}${employee.avatar}`} 
                          alt="Avatar" 
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0" 
                          onError={(e) => {
                            console.error('Avatar load error for:', `${API_BASE_URL}${employee.avatar}`);
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0 ${employee.avatar ? 'hidden' : ''}`}
                        style={{ display: employee.avatar ? 'none' : 'flex' }}
                      >
                        {employee.firstName[0]}{employee.lastName[0]}
                </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/employees/${employee.id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline block truncate"
                        >
                          {employee.firstName} {employee.lastName}
                        </Link>
                        <p className="text-xs text-gray-500 truncate">{employee.employeeCode}</p>
                        <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <select
                            value={employee.status}
                            onChange={(e) => handleStatusChange(employee.id, employee.status, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border-0 focus:ring-2 focus:ring-primary-500 ${
                              employee.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : employee.status === 'inactive'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <option value="active">{t('employees.active')}</option>
                            <option value="inactive">{t('employees.inactive')}</option>
                            <option value="terminated">{t('employees.terminated')}</option>
                          </select>
                          <span className="text-xs text-gray-500">
                            {employee.department?.name || '-'}
                          </span>
                </div>
                </div>
                </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={() => handleEdit(employee.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                           title={t('common.edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id, employee.status)}
                        className={`transition-colors p-1 rounded ${
                          employee.status === 'active'
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800'
                        }`}
                           title={employee.status === 'active' ? 'Không thể xóa nhân viên đang hoạt động' : 'Xóa nhân viên'}
                        disabled={employee.status === 'active'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                </div>
                </div>
                </div>
              ))}
                </div>
                </div>

          {filteredEmployees.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedDepartments.length > 0 || selectedPositions.length > 0 || selectedStatus
                    ? t('employees.noResults')
                    : t('employees.noEmployees')
                  }
                </h3>
                <p className="text-gray-500">
                  {searchTerm || selectedDepartments.length > 0 || selectedPositions.length > 0 || selectedStatus
                    ? t('employees.tryDifferentFilters')
                    : t('employees.getStarted')
                  }
                </p>
                </div>
                </div>
          )}
                </div>
                </div>

      {/* Create Employee Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{t('employees.createEmployee')}</h2>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                     <label className="block text-sm font-medium text-gray-700">{t('employees.firstName')}</label>
                    <input
                      className="input mt-1"
                      required
                      value={form.firstName || ''}
                      onChange={(e) => setForm((f: any) => ({ ...f, firstName: e.target.value }))}
                    />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700">{t('employees.lastName')}</label>
                    <input
                      className="input mt-1"
                      required
                      value={form.lastName || ''}
                      onChange={(e) => setForm((f: any) => ({ ...f, lastName: e.target.value }))}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('common.email')}</label>
                    <input
                      type="email"
                      className="input mt-1"
                      required
                      value={form.email || ''}
                      onChange={(e) => setForm((f: any) => ({ ...f, email: e.target.value }))}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('common.phone')}</label>
                    <input
                      type="tel"
                      className="input mt-1"
                      value={form.phone || ''}
                      onChange={(e) => setForm((f: any) => ({ ...f, phone: e.target.value }))}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('employees.department')}</label>
                    <select
                      className="input mt-1"
                      required
                      value={form.departmentId || ''}
                      onChange={(e) => setForm((f: any) => ({ ...f, departmentId: e.target.value }))}
                    >
                      <option value="">{t('employees.selectDepartment')}</option>
                      {departments?.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('employees.position')}</label>
                    <select
                      className="input mt-1"
                      required
                      value={form.positionId || ''}
                      onChange={(e) => setForm((f: any) => ({ ...f, positionId: e.target.value }))}
                    >
                      <option value="">{t('employees.selectPosition')}</option>
                      {positions?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('employees.workLocation')}</label>
                    <select
                      className="input mt-1"
                      value={form.workLocationId || ''}
                      onChange={(e) => setForm((f: any) => ({ ...f, workLocationId: e.target.value }))}
                    >
                      <option value="">{t('employees.selectWorkLocation')}</option>
                      {workLocations?.map((wl: any) => (
                        <option key={wl.id} value={wl.id}>{wl.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700">{t('employees.shift')}</label>
                    <select
                      className="input mt-1"
                      value={form.shiftId || ''}
                      onChange={(e) => setForm((f: any) => ({ ...f, shiftId: e.target.value }))}
                    >
                       <option value="">{t('employees.selectShift')}</option>
                      {shifts?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between sticky bottom-0 bg-white pt-4 border-t mt-2">
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" checked={openAfterCreate} onChange={(e) => setOpenAfterCreate(e.target.checked)} />
                         <span>{t('employees.openAfterCreate')}</span>
                </label>
                <div className="flex items-center space-x-3">
                    <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>{t('common.cancel')}</button>
                  <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading}>{t('common.create')}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
        </div>
      )}
      {roleModal && (
        <SetUserRoleModal
          userId={roleModal.userId}
          currentRole={roleModal.currentRole as any}
          onClose={() => setRoleModal(null)}
          onSuccess={() => queryClient.invalidateQueries('employees')}
        />
      )}
    </div>
  )
}

export default Employees