import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Building, Briefcase, Play, Square } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import api, { API_BASE_URL } from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import DependentsManager from '../components/DependentsManager'

const EmployeeProfile = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { user } = useAuth()

  const { data: employee, isLoading } = useQuery(
    ['employee', id],
    async () => {
      const response = await api.get(`/employees/${id}`)
      return response.data
    },
    { enabled: !!id }
  )
  const { data: workLocations } = useQuery('work-locations', async () => {
    const res = await api.get('/work-locations')
    return res.data
  })
  const { data: shifts } = useQuery('shifts', async () => {
    const res = await api.get('/shifts')
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
  const [form, setForm] = useState<any>({})

  // Initialize form with employee data when it loads
  const queryClient = useQueryClient()
  
  useEffect(() => {
    if (employee) {
      setForm({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || '',
        dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
        gender: employee.gender || '',
        citizenId: employee.citizenId || '',
        nationalId: employee.nationalId || '',
        taxId: employee.taxId || '',
        ethnicity: employee.ethnicity || '',
        religion: employee.religion || '',
        permanentAddress: employee.permanentAddress || '',
        currentAddress: employee.currentAddress || '',
        workLocationId: employee.workLocation?.id || '',
        shiftId: employee.shift?.id || '',
        departmentId: employee.department?.id || '',
        positionId: employee.position?.id || '',
      })
    }
  }, [employee])
  const isEmployee = user?.role === 'employee'
  const isOwnProfile = user?.employee?.id === id
  const readOnly = isEmployee && isOwnProfile
  const updateMutation = useMutation(
    async (payload: any) => {
      return api.patch(`/employees/${id}`, payload)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['employee', id])
        toast.success(t('employees.updateSuccess'))
      },
      onError: () => {
        toast.error(t('employees.updateError'))
      }
    }
  )

  const statusChangeMutation = useMutation(
    ({ status }: { status: string }) => 
      api.patch(`/employees/${id}`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['employee', id])
        toast.success(t('employees.statusChanged'))
      },
      onError: (error: any) => {
        console.error('Status change error:', error)
        toast.error(error.response?.data?.message || t('employees.statusChangeError'))
      }
    }
  )

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    // Build payload, handling workLocationId and shiftId carefully
    const payload: any = {}
    
    // Add form fields that have changed
    if (form.firstName && form.firstName !== employee.firstName) payload.firstName = form.firstName
    if (form.lastName && form.lastName !== employee.lastName) payload.lastName = form.lastName
    if (form.email && form.email !== employee.email) payload.email = form.email
    if (form.phone !== undefined && form.phone !== employee.phone) payload.phone = form.phone || ''
    if (form.dateOfBirth && form.dateOfBirth !== employee.dateOfBirth?.split('T')[0]) payload.dateOfBirth = form.dateOfBirth
    if (form.gender && form.gender !== employee.gender) payload.gender = form.gender
    if (form.citizenId !== undefined && form.citizenId !== employee.citizenId) payload.citizenId = form.citizenId || ''
    if (form.nationalId !== undefined && form.nationalId !== employee.nationalId) payload.nationalId = form.nationalId || ''
    if (form.taxId !== undefined && form.taxId !== employee.taxId) payload.taxId = form.taxId || ''
    if (form.ethnicity !== undefined && form.ethnicity !== employee.ethnicity) payload.ethnicity = form.ethnicity || ''
    if (form.religion !== undefined && form.religion !== employee.religion) payload.religion = form.religion || ''
    if (form.permanentAddress !== undefined && form.permanentAddress !== employee.permanentAddress) payload.permanentAddress = form.permanentAddress || ''
    if (form.currentAddress !== undefined && form.currentAddress !== employee.currentAddress) payload.currentAddress = form.currentAddress || ''
    if (form.password) payload.password = form.password
    
    // Handle workLocationId - compare current value
    const currentWorkLocationId = employee.workLocation?.id || ''
    if (form.workLocationId !== currentWorkLocationId) {
      // If empty string, explicitly set to null to remove relationship
      // Otherwise use the selected UUID
      payload.workLocationId = form.workLocationId === '' ? null : form.workLocationId
    }
    
    // Handle shiftId - compare current value  
    const currentShiftId = employee.shift?.id || ''
    if (form.shiftId !== currentShiftId) {
      // If empty string, explicitly set to null to remove relationship
      // Otherwise use the selected UUID
      payload.shiftId = form.shiftId === '' ? null : form.shiftId
    }
    
    // Handle departmentId - compare current value
    const currentDepartmentId = employee.department?.id || ''
    if (form.departmentId !== currentDepartmentId) {
      payload.departmentId = form.departmentId === '' ? null : form.departmentId
    }
    
    // Handle positionId - compare current value
    const currentPositionId = employee.position?.id || ''
    if (form.positionId !== currentPositionId) {
      payload.positionId = form.positionId === '' ? null : form.positionId
    }
    
    // Only submit if there are changes
    if (Object.keys(payload).length === 0) {
      toast.info(t('employees.noChanges') || 'No changes to save')
      return
    }
    
    updateMutation.mutate(payload)
  }

  const handleStatusChange = (newStatus: string) => {
    const confirmMessage = t('employees.confirmStatusChange')
    
    if (confirm(confirmMessage)) {
      statusChangeMutation.mutate({ status: newStatus })
    }
  }

  const uploadMutation = useMutation(
    async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.post(`/employees/upload-avatar/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['employee', id])
        toast.success(t('employees.avatarUploaded'))
      },
      onError: () => {
        toast.error(t('employees.avatarUploadError'))
      }
    }
  )

  // Attendance actions (HR/Manager/Admin can act on behalf by passing employeeId)
  const checkInMutation = useMutation(
    async (payload: { checkInTime?: string; notes?: string }) => {
      // Get location from browser
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const locationPayload = {
                employeeId: id,
                ...payload,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              api.post('/attendance/check-in', locationPayload)
                .then(resolve)
                .catch(reject);
            },
            (error) => {
              toast.error('Please enable location access to check in');
              reject(error);
            }
          );
        } else {
          toast.error('Geolocation is not supported by your browser');
          reject(new Error('Geolocation not supported'));
        }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['employee', id])
        toast.success(t('employees.checkInSuccess') || 'Checked in successfully')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('employees.checkInError') || 'Check-in failed')
      },
    }
  )

  const checkOutMutation = useMutation(
    async (payload: { checkOutTime?: string; notes?: string }) => {
      // Get location from browser
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const locationPayload = {
                employeeId: id,
                ...payload,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              api.post('/attendance/check-out', locationPayload)
                .then(resolve)
                .catch(reject);
            },
            (error) => {
              toast.error('Please enable location access to check out');
              reject(error);
            }
          );
        } else {
          toast.error('Geolocation is not supported by your browser');
          reject(new Error('Geolocation not supported'));
        }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['employee', id])
        toast.success(t('employees.checkOutSuccess') || 'Checked out successfully')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('employees.checkOutError') || 'Check-out failed')
      },
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t('employees.noEmployees')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/employees"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('common.back')}</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          {!(isEmployee && isOwnProfile) ? (
            <select
              value={employee.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-3 py-2 text-sm font-medium rounded-lg border-0 focus:ring-2 focus:ring-primary-500 ${
                employee.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : employee.status === 'inactive'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}
              disabled={statusChangeMutation.isLoading}
            >
              <option value="active">{t('employees.active')}</option>
              <option value="inactive">{t('employees.inactive')}</option>
              <option value="terminated">{t('employees.terminated')}</option>
            </select>
          ) : (
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              employee.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : employee.status === 'inactive'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {employee.status === 'active' ? t('employees.active') : 
               employee.status === 'inactive' ? t('employees.inactive') : 
               t('employees.terminated')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="text-center">
              {employee.avatar ? (
                <img 
                  src={`${API_BASE_URL}${employee.avatar}`} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" 
                  onError={(e) => {
                    console.error('Avatar load error for:', `${API_BASE_URL}${employee.avatar}`);
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center ${employee.avatar ? 'hidden' : ''}`}
                style={{ display: employee.avatar ? 'none' : 'flex' }}
              >
                <span className="text-2xl font-semibold text-gray-600">
                  {employee.firstName[0]}{employee.lastName[0]}
                </span>
              </div>
              {!readOnly && (
              <div className="mt-2">
                <label className="btn btn-secondary cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadMutation.mutate(file)
                    }}
                  />
                  {t('employees.uploadAvatar')}
                </label>
              </div>
              )}
              <h1 className="text-xl font-semibold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-gray-600">{employee.employeeCode}</p>
              <div className="mt-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  employee.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : employee.status === 'inactive'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.status === 'active' ? t('employees.active') : 
                   employee.status === 'inactive' ? t('employees.inactive') : 
                   t('employees.terminated')}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{employee.phone}</span>
                </div>
              )}
              {employee.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{employee.address}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{employee.department?.name || t('employees.noDepartment')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{employee.position?.title || t('employees.noPosition')}</span>
              </div>
              {employee.hireDate && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {t('employees.hired')}: {new Date(employee.hireDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('employees.attendance')}</h2>
            <div className="flex items-center gap-3">
              <button
                className="btn btn-primary inline-flex items-center gap-2"
                onClick={() => checkInMutation.mutate({})}
                disabled={checkInMutation.isLoading}
              >
                <Play className="h-4 w-4" />
                {t('employees.checkIn')}
              </button>
              <button
                className="btn btn-secondary inline-flex items-center gap-2"
                onClick={() => checkOutMutation.mutate({})}
                disabled={checkOutMutation.isLoading}
              >
                <Square className="h-4 w-4" />
                {t('employees.checkOut')}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('employees.personalInformation')}</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('employees.firstName')}</label>
                  <input className="input mt-1" value={form.firstName || ''} onChange={(e)=>setForm((f:any)=>({...f, firstName:e.target.value}))} disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('employees.lastName')}</label>
                  <input className="input mt-1" value={form.lastName || ''} onChange={(e)=>setForm((f:any)=>({...f, lastName:e.target.value}))} disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.email')}</label>
                  <input type="email" className="input mt-1" value={form.email || ''} onChange={(e)=>setForm((f:any)=>({...f, email:e.target.value}))} disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.phone')}</label>
                  <input className="input mt-1" value={form.phone || ''} onChange={(e)=>setForm((f:any)=>({...f, phone:e.target.value}))} disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('employees.dateOfBirth')}</label>
                  <input type="date" className="input mt-1" value={form.dateOfBirth || ''} onChange={(e)=>setForm((f:any)=>({...f, dateOfBirth:e.target.value}))} disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('employees.gender')}</label>
                  <select className="input mt-1" value={form.gender || ''} onChange={(e)=>setForm((f:any)=>({...f, gender:e.target.value}))} disabled={readOnly}>
                    <option value="">{t('employees.select')}</option>
                    <option value="male">{t('employees.male')}</option>
                    <option value="female">{t('employees.female')}</option>
                    <option value="other">{t('employees.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('employees.citizenId')}</label>
                  <input className="input mt-1" value={form.citizenId || ''} onChange={(e)=>setForm((f:any)=>({...f, citizenId:e.target.value}))} disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('employees.nationalId')}</label>
                  <input className="input mt-1" value={form.nationalId || ''} onChange={(e)=>setForm((f:any)=>({...f, nationalId:e.target.value}))} disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('employees.taxId')}</label>
                  <input className="input mt-1" value={form.taxId || ''} onChange={(e)=>setForm((f:any)=>({...f, taxId:e.target.value}))} disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('employees.ethnicity')}</label>
                  <input className="input mt-1" value={form.ethnicity || ''} onChange={(e)=>setForm((f:any)=>({...f, ethnicity:e.target.value}))} disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('employees.religion')}</label>
                  <input className="input mt-1" value={form.religion || ''} onChange={(e)=>setForm((f:any)=>({...f, religion:e.target.value}))} disabled={readOnly} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">{t('employees.permanentAddress')}</label>
                  <input className="input mt-1" value={form.permanentAddress || ''} onChange={(e)=>setForm((f:any)=>({...f, permanentAddress:e.target.value}))} disabled={readOnly} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">{t('employees.currentAddress')}</label>
                  <input className="input mt-1" value={form.currentAddress || ''} onChange={(e)=>setForm((f:any)=>({...f, currentAddress:e.target.value}))} disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.departments')}</label>
                  <select 
                    className="input mt-1" 
                    value={form.departmentId || ''} 
                    onChange={(e)=>setForm((f:any)=>({...f, departmentId:e.target.value}))} 
                    disabled={readOnly}
                  >
                    <option value="">{t('employees.select')}</option>
                    {departments?.map((d:any)=> (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {employee.department && (
                    <p className="text-xs text-gray-500 mt-1">{employee.department.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.positions')}</label>
                  <select 
                    className="input mt-1" 
                    value={form.positionId || ''} 
                    onChange={(e)=>setForm((f:any)=>({...f, positionId:e.target.value}))} 
                    disabled={readOnly}
                  >
                    <option value="">{t('employees.select')}</option>
                    {positions?.map((p:any)=> (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                  {employee.position && (
                    <p className="text-xs text-gray-500 mt-1">{employee.position.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('employees.workLocation')}</label>
                  <select 
                    className="input mt-1" 
                    value={form.workLocationId || ''} 
                    onChange={(e)=>setForm((f:any)=>({...f, workLocationId:e.target.value}))} 
                    disabled={readOnly}
                  >
                    <option value="">{t('employees.select')}</option>
                    {workLocations?.map((w:any)=> (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                  {employee.workLocation && (
                    <p className="text-xs text-gray-500 mt-1">{employee.workLocation.name} • {employee.workLocation.address || ''}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('employees.shift')}</label>
                  <select 
                    className="input mt-1" 
                    value={form.shiftId || ''} 
                    onChange={(e)=>setForm((f:any)=>({...f, shiftId:e.target.value}))} 
                    disabled={readOnly}
                  >
                    <option value="">{t('employees.select')}</option>
                    {shifts?.map((s:any)=> (
                      <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>
                    ))}
                  </select>
                  {employee.shift && (
                    <p className="text-xs text-gray-500 mt-1">{employee.shift.name} • {employee.shift.startTime}-{employee.shift.endTime}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password ({t('employees.optional')})</label>
                  <input type="password" className="input mt-1" placeholder={t('employees.leaveBlankToKeepCurrent')} onChange={(e)=>setForm((f:any)=>({...f, password:e.target.value}))} disabled={readOnly} />
                </div>
              </div>
              {!readOnly && (
                <div>
                  <button type="submit" className="btn btn-primary" disabled={updateMutation.isLoading}>{t('common.saveChanges')}</button>
                </div>
              )}
            </form>
          </div>

          {/* Dependents Section */}
          <DependentsManager employeeId={id || ''} readOnly={readOnly} />

        </div>
      </div>
    </div>
  )
}

export default EmployeeProfile
