import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { DollarSign, Download, Eye, Loader2, Plus } from 'lucide-react'
import api from '../services/api'
import { formatNumberVN } from '../utils/format'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const Payroll = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  )
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [detail, setDetail] = useState<any | null>(null)

  const isEmployee = user?.role === 'employee'
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [onlyMine, setOnlyMine] = useState(isEmployee)

  const formatVND = (value: number | undefined | null) => `${formatNumberVN(Number(value || 0))} ₫`
  const statusBadge = (status: string) => (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
        status === 'approved'
          ? 'bg-green-100 text-green-800'
          : status === 'generated'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      {status === 'approved' ? 'Đã duyệt' : status === 'generated' ? 'Đã tạo' : status}
    </span>
  )

  const { data: payrolls, isLoading } = useQuery(
    ['payrolls', selectedPeriod, isEmployee, user?.employee?.id],
    async () => {
      if (isEmployee && user?.employee?.id) {
        const response = await api.get(`/payroll/employee/${user.employee.id}`, { params: { period: selectedPeriod } })
        return response.data
      }
      const response = await api.get(`/payroll/period/${selectedPeriod}`)
      return response.data
    },
    { enabled: !!selectedPeriod && (!isEmployee || Boolean(user?.employee?.id)) }
  )

  const standard = useMemo(() => {
    // Compute locally to avoid role restrictions on API
    if (!selectedPeriod) return undefined
    const [yearStr, monthStr] = selectedPeriod.split('-')
    const year = Number(yearStr)
    const month = Number(monthStr) - 1
    const date = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    let workingDays = 0
    for (let d = new Date(date); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay()
      if (day !== 0 && day !== 6) workingDays++
    }
    return { standardWorkingDays: workingDays, standardWorkingHours: workingDays * 8 }
  }, [selectedPeriod])


  const generateMutation = useMutation(
    async (employeeId?: string) => {
      // Bypass axios completely to eliminate any hidden JSON parsing
      const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '/api')
      const url = `${baseUrl}/payroll/generate/${selectedPeriod}${employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : ''}`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
      })
      const text = await res.text()
      const trimmed = text.trim()
      const looksJson = trimmed.startsWith('{') || trimmed.startsWith('[')

      if (!res.ok) {
        let message = 'Tạo bảng lương thất bại'
        if (looksJson) {
          try { const j = JSON.parse(trimmed); message = j.message || j.error || message } catch {}
        } else if (trimmed) {
          message = trimmed
        }
        throw new Error(message)
      }

      if (looksJson) {
        try { return JSON.parse(trimmed) } catch { /* fallthrough */ }
      }
      return text
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['payrolls', selectedPeriod])
      },
      onError: (e: any) => {
        const msg = e?.message || 'Tạo bảng lương thất bại'
        console.error('Generate payroll error:', e)
        toast.error(msg)
      }
    }
  )

  const { data: myPayrolls } = useQuery(
    ['my-payrolls', user?.employee?.id],
    async () => {
      if (!user?.employee?.id) return []
      const response = await api.get(`/payroll/employee/${user.employee.id}`)
      return response.data
    },
    { enabled: Boolean(user?.employee?.id) }
  )

  const displayedPayrolls = useMemo(() => {
    let list = payrolls || []
    // Optional: include my payroll rows from history if same period not present
    if (!isEmployee && myPayrolls && Array.isArray(myPayrolls)) {
      const samePeriodMine = myPayrolls.filter((p: any) => p.period === selectedPeriod)
      // merge unique by id
      const existingIds = new Set(list.map((p: any) => p.id))
      for (const p of samePeriodMine) {
        if (!existingIds.has(p.id)) list = [...list, p]
      }
    }

    return list.filter((p: any) => {
      const name = `${p.employee?.firstName || ''} ${p.employee?.lastName || ''}`.toLowerCase()
      const code = (p.employee?.employeeCode || '').toLowerCase()
      const matchesSearch = !search || name.includes(search.toLowerCase()) || code.includes(search.toLowerCase())
      const matchesStatus = !statusFilter || p.status === statusFilter
      const myEmpId = user?.employee?.id
      const matchesMine = isEmployee
        ? Boolean(myEmpId && p.employeeId === myEmpId)
        : (!onlyMine || Boolean(myEmpId && p.employeeId === myEmpId))
      return matchesSearch && matchesStatus && matchesMine
    })
  }, [payrolls, myPayrolls, search, statusFilter, onlyMine, selectedPeriod, user, isEmployee])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const totalGross = payrolls?.reduce((sum: number, payroll: any) => sum + Number(payroll?.grossSalary || 0), 0) || 0
  const totalNet = payrolls?.reduce((sum: number, payroll: any) => sum + Number(payroll?.netSalary || 0), 0) || 0
  const totalDeductions = payrolls?.reduce((sum: number, payroll: any) => sum + Number(payroll?.totalDeductions || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('payroll.title')}</h1>
          <p className="text-gray-600">{t('payroll.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="month"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input"
          />
          {user?.role !== 'employee' && (
            <button
              title={t('payroll.generate') as any}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-white shadow-sm transition-colors text-sm ${
                generateMutation.isLoading
                  ? 'bg-primary-400 cursor-wait'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
              onClick={() => generateMutation.mutate(undefined)}
              disabled={generateMutation.isLoading}
            >
              {generateMutation.isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              <span className="leading-none">{generateMutation.isLoading ? t('common.saving') : t('payroll.generate')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('payroll.totalGross')}</p>
              <p className="text-2xl font-semibold text-gray-900">{formatVND(totalGross)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('payroll.totalNet')}</p>
              <p className="text-2xl font-semibold text-gray-900">{formatVND(totalNet)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('payroll.totalDeductions')}</p>
              <p className="text-2xl font-semibold text-gray-900">{formatVND(totalDeductions)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Standard hours card */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Giờ công chuẩn tháng {selectedPeriod}</span>
          <div className="text-sm font-medium text-gray-900">
            {standard ? `${standard.standardWorkingDays} ngày · ${standard.standardWorkingHours} giờ` : '--'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="card p-6">
          {/* Filters */}
          {!isEmployee && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                className="input md:col-span-2"
                placeholder={t('common.search') as any}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                <option value="approved">Đã duyệt</option>
                <option value="generated">Đã tạo</option>
              </select>
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
                <span>Chỉ của tôi</span>
              </label>
            </div>
          )}

          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('payroll.summary', { period: selectedPeriod })}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('payroll.employee')}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('payroll.gross')}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('payroll.deductions')}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('payroll.net')}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('payroll.status')}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('payroll.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedPayrolls?.map((payroll: any) => (
                  <tr key={payroll.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payroll.employee?.firstName} {payroll.employee?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 italic">
                          {payroll.employee?.employeeCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-gray-900">{formatVND(payroll?.grossSalary)}</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-900">{formatVND(payroll?.totalDeductions)}</td>
                    <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900">{formatVND(payroll?.netSalary)}</td>
                    <td className="px-4 py-2">{statusBadge(payroll.status)}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-gray-400 hover:text-gray-600" title="Xem chi tiết" onClick={() => setDetail(payroll)}>
                          <Eye className="h-4 w-4" />
                        </button>
                        <a
                          className="text-gray-400 hover:text-gray-600"
                          title="Tải phiếu lương"
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/payroll/${payroll.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {displayedPayrolls?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('payroll.noRecords')}</p>
            </div>
          )}
        </div>
      </div>
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-2xl bg-white rounded-lg shadow" onClick={(e)=>e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chi tiết bảng lương</h3>
                <p className="text-sm text-gray-600">{detail.employee?.firstName} {detail.employee?.lastName} • {detail.period}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded p-4">
                <div className="font-medium text-gray-700 mb-2">Thu nhập</div>
                <div className="flex justify-between py-1"><span>Lương hợp đồng</span><span className="font-medium">{formatVND(detail?.basicSalary)}</span></div>
                <div className="flex justify-between py-1"><span>Phụ cấp</span><span className="font-medium">{formatVND(detail?.allowance)}</span></div>
                <div className="flex justify-between py-1"><span>Tăng ca</span><span className="font-medium">{formatVND(detail?.overtimePay)}</span></div>
                <div className="flex justify-between py-1"><span>Thưởng</span><span className="font-medium">{formatVND(detail?.bonus)}</span></div>
                <div className="border-t mt-2 pt-2 flex justify-between"><span className="font-medium">Tổng thu nhập (gross)</span><span className="font-semibold">{formatVND(detail?.grossSalary)}</span></div>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <div className="font-medium text-gray-700 mb-2">Khấu trừ</div>
                <div className="flex justify-between py-1"><span>BHXH (8%)</span><span className="font-medium">{formatVND(detail?.socialInsurance)}</span></div>
                <div className="flex justify-between py-1"><span>BHYT (1.5%)</span><span className="font-medium">{formatVND(detail?.healthInsurance)}</span></div>
                <div className="flex justify-between py-1"><span>BHTN (1%)</span><span className="font-medium">{formatVND(detail?.unemploymentInsurance)}</span></div>
                <div className="flex justify-between py-1"><span>Thuế TNCN</span><span className="font-medium">{formatVND(detail?.tax)}</span></div>
                <div className="border-t mt-2 pt-2 flex justify-between"><span className="font-medium">Tổng khấu trừ</span><span className="font-semibold">{formatVND(detail?.totalDeductions)}</span></div>
              </div>
              <div className="md:col-span-2 bg-green-50 rounded p-4">
                <div className="flex justify-between text-base">
                  <span className="font-medium text-green-800">Lương thực nhận (NET)</span>
                  <span className="font-semibold text-green-900">{formatVND(detail?.netSalary)}</span>
                </div>
                <div className="mt-2 text-xs text-gray-600">Công chuẩn: {formatNumberVN(Number(detail?.workingDays || 0))} ngày ({formatNumberVN(Number(detail?.workingDays || 0)*8)} giờ) • Công thực tế: {formatNumberVN(Number(detail?.actualWorkingDays || 0))} ngày</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Payroll
