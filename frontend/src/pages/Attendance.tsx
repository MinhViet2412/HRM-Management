import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Clock, CheckCircle, XCircle, Calendar, Filter, Users, Edit3, Plus } from 'lucide-react'
import api from '../services/api'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

const Attendance = () => {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0])
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDepartment, setSelectedDepartment] = useState('')
  // Employee self view filters
  const [empStartDate, setEmpStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [empEndDate, setEmpEndDate] = useState(new Date().toISOString().split('T')[0])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [editingAttendance, setEditingAttendance] = useState<any>(null)
  const [openManualModal, setOpenManualModal] = useState(false)
  const [manualForm, setManualForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    notes: ''
  })
  const [adjustForm, setAdjustForm] = useState({
    checkIn: '',
    checkOut: '',
    status: '',
    reason: '',
    notes: ''
  })
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Check if user is Admin/HR/Manager
  const isAdmin = ['admin', 'hr', 'manager'].includes(user?.role || '')

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Get departments for filter
  const { data: departments } = useQuery('departments', async () => {
    if (!isAdmin) return []
    const res = await api.get('/departments')
    return res.data
  }, { enabled: isAdmin })

  const { data: myAttendance, isLoading: myAttendanceLoading } = useQuery(
    ['my-attendance', selectedDate],
    async () => {
      const response = await api.get(`/attendance/my-attendance?startDate=${selectedDate}&endDate=${selectedDate}`)
      return response.data[0] || null
    },
    { enabled: !isAdmin }
  )

  // Load employees for manual add (only when modal open and admin)
  const { data: employees } = useQuery(
    ['employees-for-manual'],
    async () => {
      if (!isAdmin || !openManualModal) return []
      const res = await api.get('/employees')
      return res.data
    },
    { enabled: isAdmin && openManualModal }
  )

  // Admin view: Get all attendance with filters
  const { data: allAttendance, isLoading: allAttendanceLoading } = useQuery(
    ['all-attendance', startDate, endDate, selectedDepartment],
    async () => {
      let url = `/attendance?startDate=${startDate}&endDate=${endDate}`
      if (selectedDepartment) {
        url += `&departmentId=${selectedDepartment}`
      }
      const response = await api.get(url)
      return response.data
    },
    { enabled: isAdmin }
  )

  // Regular user view: Get today's attendance
  const { data: todayAttendance, isLoading: todayAttendanceLoading } = useQuery(
    ['today-attendance', selectedDate],
    async () => {
      const response = await api.get(`/attendance/my-attendance?startDate=${selectedDate}&endDate=${selectedDate}`)
      return response.data
    },
    { enabled: !isAdmin }
  )

  // Regular user view: list within range (table)
  const { data: myRangeAttendance } = useQuery(
    ['my-attendance-range', empStartDate, empEndDate],
    async () => {
      const res = await api.get(`/attendance/my-attendance?startDate=${empStartDate}&endDate=${empEndDate}`)
      return res.data
    },
    { enabled: !isAdmin }
  )

  const checkInMutation = useMutation(
    async () => {
      // capture geolocation if available
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      }).catch(() => null)

      const checkInData: any = {
        latitude: position?.coords.latitude,
        longitude: position?.coords.longitude,
      }

      return api.post('/attendance/check-in', checkInData)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['my-attendance', selectedDate])
        toast.success(t('attendance.checkInSuccess'))
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('attendance.checkInError'))
      }
    }
  )

  const checkOutMutation = useMutation(
    async () => {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      }).catch(() => null)

      const checkOutData: any = {
        latitude: position?.coords.latitude,
        longitude: position?.coords.longitude,
      }

      return api.post('/attendance/check-out', checkOutData)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['my-attendance', selectedDate])
        toast.success(t('attendance.checkOutSuccess'))
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('attendance.checkOutError'))
      }
    }
  )

  const handleCheckIn = () => {
    checkInMutation.mutate()
  }

  const handleCheckOut = () => {
    checkOutMutation.mutate()
  }

  const adjustAttendanceMutation = useMutation(
    async ({ attendanceId, adjustData }: { attendanceId: string, adjustData: any }) => {
      console.log('Sending adjust request:', { attendanceId, adjustData })
      const response = await api.patch(`/attendance/adjust/${attendanceId}`, adjustData)
      console.log('Adjust response:', response.data)
      return response.data
    },
    {
      onSuccess: (data) => {
        console.log('Adjust attendance success:', data)
        queryClient.invalidateQueries(['all-attendance', startDate, endDate, selectedDepartment])
        queryClient.invalidateQueries(['today-attendance', selectedDate])
        toast.success('Đã điều chỉnh giờ chấm công thành công')
        setEditingAttendance(null)
        setAdjustForm({
          checkIn: '',
          checkOut: '',
          status: '',
          reason: '',
          notes: ''
        })
      },
      onError: (error: any) => {
        console.error('Adjust attendance error:', error)
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Không thể điều chỉnh giờ chấm công'
        toast.error(errorMessage)
      }
    }
  )

  const manualAddMutation = useMutation(
    async () => {
      const payload: any = {
        employeeId: manualForm.employeeId || undefined,
        date: manualForm.date,
        notes: manualForm.notes.trim() || undefined
      }
      if (manualForm.checkIn) payload.checkIn = new Date(manualForm.checkIn).toISOString()
      if (manualForm.checkOut) payload.checkOut = new Date(manualForm.checkOut).toISOString()
      const res = await api.post('/attendance/manual', payload)
      return res.data
    },
    {
      onSuccess: () => {
        toast.success('Đã bổ sung công')
        setOpenManualModal(false)
        queryClient.invalidateQueries(['all-attendance', startDate, endDate, selectedDepartment])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Không thể bổ sung công')
      }
    }
  )

  const handleAdjustAttendance = () => {
    if (!editingAttendance) return
    
    const adjustData: any = {}
    
    // Only include fields that have been modified
    if (adjustForm.checkIn) {
      adjustData.checkIn = new Date(adjustForm.checkIn).toISOString()
    }
    if (adjustForm.checkOut) {
      adjustData.checkOut = new Date(adjustForm.checkOut).toISOString()
    }
    if (adjustForm.status) {
      adjustData.status = adjustForm.status
    }
    if (adjustForm.reason.trim()) {
      adjustData.reason = adjustForm.reason.trim()
    }
    if (adjustForm.notes.trim()) {
      adjustData.notes = adjustForm.notes.trim()
    }
    
    adjustAttendanceMutation.mutate({
      attendanceId: editingAttendance.id,
      adjustData
    })
  }

  const openAdjustModal = (attendance: any) => {
    setEditingAttendance(attendance)
    setAdjustForm({
      checkIn: attendance.checkIn ? new Date(attendance.checkIn).toISOString().slice(0, 16) : '',
      checkOut: attendance.checkOut ? new Date(attendance.checkOut).toISOString().slice(0, 16) : '',
      status: attendance.status || '',
      reason: '',
      notes: '' // Xóa nội dung ghi chú cũ
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'early_leave':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'missing_checkout':
        return <Clock className="h-4 w-4 text-purple-500" />
      case 'half_day':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
      case 'early_leave':
        return 'bg-orange-100 text-orange-800'
      case 'missing_checkout':
        return 'bg-purple-100 text-purple-800'
      case 'half_day':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (myAttendanceLoading || todayAttendanceLoading || allAttendanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('attendance.title')}</h1>
            <p className="text-gray-600">{t('attendance.subtitle')}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Thời gian hiện tại</div>
            <div className="text-lg font-mono font-semibold text-gray-900">
              {currentTime.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
            </div>
            <div className="text-sm text-gray-500">
              {currentTime.toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Statistics - Moved to top */}
      {isAdmin && (
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Thống kê</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {allAttendance?.length || 0}
              </div>
              <div className="text-sm text-blue-600">Tổng số chấm công</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {allAttendance?.filter((a: any) => a.status === 'present').length || 0}
              </div>
              <div className="text-sm text-green-600">Có mặt</div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {allAttendance?.filter((a: any) => a.status === 'absent').length || 0}
              </div>
              <div className="text-sm text-red-600">Vắng mặt</div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {allAttendance?.filter((a: any) => a.status === 'late').length || 0}
              </div>
              <div className="text-sm text-yellow-600">Đi muộn</div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Filters */}
      {isAdmin && (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Bộ lọc chấm công</h3>
              </div>
              {isAdmin && (
                <button
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-white shadow-sm text-sm bg-primary-600 hover:bg-primary-700"
                  onClick={() => setOpenManualModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Thêm công</span>
                </button>
              )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
              <input
                type="date"
                className="input w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
              <input
                type="date"
                className="input w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ban</label>
              <select
                className="input w-full"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">Tất cả phòng ban</option>
                {departments?.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate(new Date().toISOString().split('T')[0])
                  setEndDate(new Date().toISOString().split('T')[0])
                  setSelectedDepartment('')
                }}
                className="btn btn-secondary w-full"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : ''} gap-6`}>
        {/* Regular User: Today's Status */}
        {!isAdmin && (
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">{t('attendance.todaysStatus')}</h2>
                {myAttendance && (
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(myAttendance.status)}`}>
                    {myAttendance.status}
                  </span>
                )}
              </div>

              {myAttendance ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check In</div>
                    <div className="mt-1 text-gray-900 font-mono text-lg">
                      {new Date(myAttendance.checkIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check Out</div>
                    <div className="mt-1 text-gray-900 font-mono text-lg">
                      {myAttendance.checkOut ? new Date(myAttendance.checkOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '--:--:--'}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-xs font-medium text-green-700 uppercase tracking-wide">Giờ làm việc</div>
                    <div className="mt-1 text-green-900 font-mono text-lg">
                      {Math.floor(Number(myAttendance.workingHours || 0))}h {Math.round((Number(myAttendance.workingHours || 0) % 1) * 60)}m
                    </div>
                    <div className="text-xs text-green-700">({Number(myAttendance.workingHours || 0).toFixed(2)} giờ)</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="text-xs font-medium text-orange-700 uppercase tracking-wide">Giờ làm thêm</div>
                    <div className="mt-1 text-orange-900 font-mono text-lg">
                      {Math.floor(Number(myAttendance.overtimeHours || 0))}h {Math.round((Number(myAttendance.overtimeHours || 0) % 1) * 60)}m
                    </div>
                    <div className="text-xs text-orange-700">({Number(myAttendance.overtimeHours || 0).toFixed(2)} giờ)</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">{t('attendance.noToday')}</p>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {!myAttendance?.checkIn && (
                  <button onClick={handleCheckIn} disabled={checkInMutation.isLoading} className="btn btn-primary w-full">
                    {checkInMutation.isLoading ? t('attendance.checkingIn') : t('attendance.checkIn')}
                  </button>
                )}
                {myAttendance?.checkIn && !myAttendance?.checkOut && (
                  <button onClick={handleCheckOut} disabled={checkOutMutation.isLoading} className="btn btn-secondary w-full">
                    {checkOutMutation.isLoading ? t('attendance.checkingOut') : t('attendance.checkOut')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin list OR employee range table */}
        {isAdmin ? (
        <div className={`lg:col-span-3`}>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {isAdmin ? 'Danh sách chấm công' : t('attendance.todayTable')}
              </h2>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {isAdmin ? `${startDate} - ${endDate}` : new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead className="bg-gray-50">
                  <tr>
                    <th>{t('attendance.employee')}</th>
                    {isAdmin && <th>Phòng ban</th>}
                    <th>{t('attendance.status')}</th>
                    <th>{t('attendance.checkIn')}</th>
                    <th>{t('attendance.checkOut')}</th>
                    <th>{t('attendance.hours')}</th>
                    {isAdmin && <th>Thao tác</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(isAdmin ? allAttendance : todayAttendance)?.map((attendance: any) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {attendance.employee?.firstName} {attendance.employee?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attendance.employee?.employeeCode}
                          </div>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="text-sm text-gray-900">
                          {attendance.employee?.department?.name || '-'}
                        </td>
                      )}
                      <td>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(attendance.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(attendance.status)}`}>
                            {attendance.status}
                          </span>
                        </div>
                      </td>
                      <td className="text-sm text-gray-900">
                        {attendance.checkIn ? (
                          <div>
                            <div className="font-mono">
                              {new Date(attendance.checkIn).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(attendance.checkIn).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="text-sm text-gray-900">
                        {attendance.checkOut ? (
                          <div>
                            <div className="font-mono">
                              {new Date(attendance.checkOut).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(attendance.checkOut).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="text-sm text-gray-900">
                        {Number(attendance.workingHours || 0) > 0 ? (
                          <div>
                            <div className="font-mono">
                              {Math.floor(Number(attendance.workingHours || 0))}h {Math.round((Number(attendance.workingHours || 0) % 1) * 60)}m
                            </div>
                            <div className="text-xs text-gray-500">
                              ({Number(attendance.workingHours || 0).toFixed(2)}h)
                            </div>
                          </div>
                        ) : '-'}
                      </td>
                      {isAdmin && (
                        <td className="text-sm text-gray-900">
                          <button
                            onClick={() => openAdjustModal(attendance)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded"
                            title="Điều chỉnh giờ chấm công"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(isAdmin ? allAttendance : todayAttendance)?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {isAdmin ? 'Không có dữ liệu chấm công trong khoảng thời gian này' : t('attendance.noToday')}
                </p>
              </div>
            )}
          </div>
        </div>
        ) : (
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Bảng chấm công của tôi</h2>
                <div className="flex items-center gap-2">
                  <input type="date" className="input" value={empStartDate} onChange={(e)=>setEmpStartDate(e.target.value)} />
                  <span className="text-gray-500">—</span>
                  <input type="date" className="input" value={empEndDate} onChange={(e)=>setEmpEndDate(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th>Ngày</th>
                      <th>{t('attendance.checkIn')}</th>
                      <th>{t('attendance.checkOut')}</th>
                      <th>{t('attendance.hours')}</th>
                      <th>{t('attendance.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myRangeAttendance?.map((a:any)=> (
                      <tr key={a.id}>
                        <td className="text-sm text-gray-900">{new Date(a.date).toLocaleDateString('vi-VN')}</td>
                        <td className="text-sm text-gray-900">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false}) : '-'}</td>
                        <td className="text-sm text-gray-900">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false}) : '-'}</td>
                        <td className="text-sm text-gray-900">{Number(a.workingHours||0) > 0 ? `${Math.floor(Number(a.workingHours))}h ${Math.round((Number(a.workingHours)%1)*60)}m` : '-'}</td>
                        <td>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(a.status)}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                    {(!myRangeAttendance || myRangeAttendance.length === 0) && (
                      <tr>
                        <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>{t('attendance.noToday')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Attendance Modal */}
      {editingAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Điều chỉnh giờ chấm công</h3>
                <button
                  onClick={() => setEditingAttendance(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Nhân viên
                </label>
                <p className="text-lg font-semibold text-blue-900">
                  {editingAttendance.employee?.firstName} {editingAttendance.employee?.lastName}
                </p>
              </div>

              {/* Current Attendance Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📊 Giờ công hiện tại
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600 font-medium">Giờ vào:</span>
                      <p className="font-semibold text-gray-900 mt-1">
                        {editingAttendance.checkIn 
                          ? new Date(editingAttendance.checkIn).toLocaleString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Chưa chấm công'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Giờ ra:</span>
                      <p className="font-semibold text-gray-900 mt-1">
                        {editingAttendance.checkOut 
                          ? new Date(editingAttendance.checkOut).toLocaleString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Chưa chấm công'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600 font-medium">Tổng giờ làm:</span>
                      <p className="font-semibold text-gray-900 mt-1">
                        {editingAttendance.workingHours 
                          ? `${Math.floor(Number(editingAttendance.workingHours))}h ${Math.round((Number(editingAttendance.workingHours) % 1) * 60)}m`
                          : '0h 0m'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Trạng thái:</span>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(editingAttendance.status)}`}>
                          {editingAttendance.status === 'present' && 'Có mặt'}
                          {editingAttendance.status === 'late' && 'Đi muộn'}
                          {editingAttendance.status === 'early_leave' && 'Về sớm'}
                          {editingAttendance.status === 'missing_checkout' && 'Thiếu công'}
                          {editingAttendance.status === 'absent' && 'Vắng mặt'}
                          {editingAttendance.status === 'half_day' && 'Nửa ngày'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Times Section */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <label className="block text-sm font-medium text-green-900 mb-3">
                  ✏️ Điều chỉnh giờ mới
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ vào mới
                    </label>
                    <input
                      type="datetime-local"
                      className="input w-full border-green-300 focus:border-green-500 focus:ring-green-500"
                      value={adjustForm.checkIn}
                      onChange={(e) => setAdjustForm(prev => ({ ...prev, checkIn: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ ra mới
                    </label>
                    <input
                      type="datetime-local"
                      className="input w-full border-green-300 focus:border-green-500 focus:ring-green-500"
                      value={adjustForm.checkOut}
                      onChange={(e) => setAdjustForm(prev => ({ ...prev, checkOut: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  className="input w-full"
                  value={adjustForm.status}
                  onChange={(e) => setAdjustForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">Giữ nguyên</option>
                  <option value="present">Có mặt</option>
                  <option value="late">Đi muộn</option>
                  <option value="early_leave">Về sớm</option>
                  <option value="missing_checkout">Thiếu công</option>
                  <option value="absent">Vắng mặt</option>
                  <option value="half_day">Nửa ngày</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do điều chỉnh
                </label>
                <textarea
                  className="input w-full"
                  rows={3}
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Nhập lý do điều chỉnh..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  className="input w-full"
                  rows={2}
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setEditingAttendance(null)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAdjustAttendance}
                  disabled={adjustAttendanceMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {adjustAttendanceMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Attendance Modal */}
      {openManualModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Bổ sung công thủ công</h3>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setOpenManualModal(false)}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
                  <select
                    className="input w-full"
                    value={manualForm.employeeId}
                    onChange={(e)=>setManualForm(prev=>({...prev, employeeId: e.target.value }))}
                  >
                    <option value="">Chọn nhân viên</option>
                    {employees?.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employeeCode} - {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={manualForm.date}
                    onChange={(e)=>setManualForm(prev=>({...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ vào</label>
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={manualForm.checkIn}
                    onChange={(e)=>setManualForm(prev=>({...prev, checkIn: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ ra</label>
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={manualForm.checkOut}
                    onChange={(e)=>setManualForm(prev=>({...prev, checkOut: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    className="input w-full"
                    rows={2}
                    value={manualForm.notes}
                    onChange={(e)=>setManualForm(prev=>({...prev, notes: e.target.value }))}
                    placeholder="Nhập ghi chú..."
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={()=>setOpenManualModal(false)}>Hủy</button>
              <button
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-white shadow-sm text-sm ${manualAddMutation.isLoading ? 'bg-primary-400 cursor-wait' : 'bg-primary-600 hover:bg-primary-700'}`}
                onClick={()=>manualAddMutation.mutate()}
                disabled={manualAddMutation.isLoading || !manualForm.employeeId || !manualForm.date}
              >
                {manualAddMutation.isLoading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance