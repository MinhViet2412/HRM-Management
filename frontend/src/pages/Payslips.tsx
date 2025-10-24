import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api, { API_BASE_URL } from '../services/api'
import { Loader2, Plus, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

const Payslips = () => {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [detail, setDetail] = useState<any | null>(null)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: payslips, isLoading } = useQuery(['payslips', period, user?.role], async () => {
    const url = (user?.role === 'employee') ? '/payslips/me' : '/payslips'
    const res = await api.get(url, { params: { period } })
    return res.data
  })

  const bulkCreate = useMutation(async (employeeIds?: string[]) => {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${API_BASE_URL}/payslips/bulk-create/${period}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employeeIds }),
      })
      const ct = res.headers.get('content-type') || ''
      const data = ct.includes('application/json') ? await res.json() : await res.text()
      if (!res.ok) throw new Error((data as any)?.message || String(data))
      return data
    }, {
      onSuccess: () => {
        toast.success('Đã tạo phiếu lương')
        queryClient.invalidateQueries(['payslips', period])
      },
      onError: (e: any) => { toast.error(e.message || 'Tạo phiếu lương thất bại') },
    }
  )

  const canManage = user?.role === 'admin' || user?.role === 'hr'
  const isEmployee = user?.role === 'employee'

  const statusColors = (status: string) => {
    if (status === 'paid') return 'bg-green-100 text-green-800 border-green-200'
    if (status === 'issued') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (status === 'cancelled') return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const updateStatusMutation = useMutation(async ({ id, status }: { id: string, status: string }) => {
    const res = await api.patch(`/payslips/${id}/status`, { status })
    return res.data
  }, {
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái')
      queryClient.invalidateQueries(['payslips', period])
    },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Cập nhật trạng thái thất bại') }
  })

  const deleteMutation = useMutation(async (id: string) => {
    await api.delete(`/payslips/${id}`)
  }, {
    onSuccess: () => {
      toast.success('Đã xoá phiếu lương')
      queryClient.invalidateQueries(['payslips', period])
    },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Xoá phiếu lương thất bại') }
  })

  const displayed = (payslips || [])
    .filter((p: any) => (isEmployee && user?.employee?.id ? p.employeeId === user.employee.id : true))
    .filter((p: any) => {
    const name = `${p.employee?.firstName || ''} ${p.employee?.lastName || ''}`.toLowerCase()
    const code = (p.employee?.employeeCode || '').toLowerCase()
    const matchesText = !search || name.includes(search.toLowerCase()) || code.includes(search.toLowerCase())
      const matchesStatusFilter = !statusFilter || p.status === statusFilter
      const employeeOnlyPaid = isEmployee ? p.status === 'paid' : true
      return matchesText && matchesStatusFilter && employeeOnlyPaid
  })

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phiếu lương</h1>
          <p className="text-gray-600">Tạo và quản lý phiếu lương theo tháng</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="month" className="input" value={period} onChange={(e)=>setPeriod(e.target.value)} />
          {canManage && (
            <button
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-white shadow-sm text-sm ${bulkCreate.isLoading ? 'bg-primary-400 cursor-wait' : 'bg-primary-600 hover:bg-primary-700'}`}
              onClick={() => bulkCreate.mutate(undefined)}
              disabled={bulkCreate.isLoading}
            >
              {bulkCreate.isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Plus className="h-3.5 w-3.5"/>}
              <span>{bulkCreate.isLoading ? 'Đang tạo' : 'Tạo phiếu lương từ bảng lương'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            className="input"
            placeholder="Tìm theo tên hoặc mã NV"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />
          {!isEmployee && (
            <select className="input" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="issued">Đã phát hành</option>
              <option value="paid">Đã chi trả</option>
              <option value="cancelled">Đã huỷ</option>
            </select>
          )}
          <button
            className="btn btn-secondary"
            onClick={()=>{ setSearch(''); setStatusFilter('') }}
          >
            Reset
          </button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng ban</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức vụ</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tháng</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Khấu trừ</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Công chuẩn/TT</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  {!isEmployee && (
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayed.map((p: any) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{p.employee?.firstName} {p.employee?.lastName}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.employee?.department?.name || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.employee?.position?.title || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.period}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">{Number(p?.payroll?.grossSalary || 0).toLocaleString('vi-VN')} ₫</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">{Number(p?.payroll?.totalDeductions || 0).toLocaleString('vi-VN')} ₫</td>
                    <td className="px-4 py-2 text-sm text-right font-semibold text-gray-900">{Number(p?.payroll?.netSalary || p.amount || 0).toLocaleString('vi-VN')} ₫</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">{Number(((p as any)?._summary?.daysWorked ?? p?.payroll?.actualWorkingDays) || 0)} / {Number(p?.payroll?.workingDays || 0)}<span className="text-xs text-gray-500"> ({Number(p?.payroll?.workingDays || 0)*8}h)</span><div className="text-xs text-gray-500">Nghỉ: {Number(((p as any)?._summary?.daysAbsent ?? 0) || 0)} ngày</div></td>
                    <td className="px-4 py-2 text-sm">
                      {canManage ? (
                        <select
                          className={`py-1 px-2 text-sm rounded-md border ${statusColors(p.status)}`}
                          value={p.status}
                          onChange={(e)=>updateStatusMutation.mutate({ id: p.id, status: e.target.value })}
                        >
                          <option value="issued">Đã phát hành</option>
                          <option value="paid">Đã chi trả</option>
                          <option value="cancelled">Đã huỷ</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors(p.status)}`}>
                          {p.status === 'paid' ? 'Đã chi trả' : p.status === 'issued' ? 'Đã phát hành' : p.status === 'cancelled' ? 'Đã huỷ' : p.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        className="inline-flex items-center text-gray-600 hover:text-gray-800"
                        title="Xem chi tiết"
                        onClick={() => setDetail(p)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {!isEmployee && canManage && (
                        <button
                          className="inline-flex items-center text-red-600 hover:text-red-800 ml-3"
                          title="Xoá phiếu lương"
                          onClick={() => deleteMutation.mutate(p.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(displayed.length === 0) && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>Không có phiếu lương</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    {detail && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={()=>setDetail(null)}>
        <div className="w-full max-w-3xl bg-white rounded-lg shadow" onClick={(e)=>e.stopPropagation()}>
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết bảng lương</h3>
              <p className="text-sm text-gray-600">{detail.employee?.firstName} {detail.employee?.lastName} • {detail.period}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600" onClick={()=>setDetail(null)}>✕</button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded p-4">
              <div className="font-medium text-gray-700 mb-2">Thu nhập</div>
              <div className="flex justify-between py-1"><span>Lương hợp đồng</span><span className="font-medium">{Number(detail?.payroll?.basicSalary || detail?.basicSalary || 0).toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between py-1"><span>Phụ cấp</span><span className="font-medium">{Number(detail?.payroll?.allowance || detail?.allowance || 0).toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between py-1"><span>Tăng ca</span><span className="font-medium">{Number(detail?.payroll?.overtimePay || detail?.overtimePay || 0).toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between py-1"><span>Thưởng</span><span className="font-medium">{Number(detail?.payroll?.bonus || detail?.bonus || 0).toLocaleString('vi-VN')} ₫</span></div>
              <div className="border-t mt-2 pt-2 flex justify-between"><span className="font-medium">Tổng thu nhập (gross)</span><span className="font-semibold">{Number(detail?.payroll?.grossSalary || detail?.grossSalary || 0).toLocaleString('vi-VN')} ₫</span></div>
            </div>
            <div className="bg-gray-50 rounded p-4">
              <div className="font-medium text-gray-700 mb-2">Khấu trừ</div>
              <div className="flex justify-between py-1"><span>BHXH (8%)</span><span className="font-medium">{Number(detail?.payroll?.socialInsurance || detail?.socialInsurance || 0).toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between py-1"><span>BHYT (1.5%)</span><span className="font-medium">{Number(detail?.payroll?.healthInsurance || detail?.healthInsurance || 0).toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between py-1"><span>BHTN (1%)</span><span className="font-medium">{Number(detail?.payroll?.unemploymentInsurance || detail?.unemploymentInsurance || 0).toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between py-1"><span>Thuế TNCN</span><span className="font-medium">{Number(detail?.payroll?.tax || detail?.tax || 0).toLocaleString('vi-VN')} ₫</span></div>
              <div className="border-t mt-2 pt-2 flex justify-between"><span className="font-medium">Tổng khấu trừ</span><span className="font-semibold">{Number(detail?.payroll?.totalDeductions || detail?.totalDeductions || 0).toLocaleString('vi-VN')} ₫</span></div>
            </div>
            <div className="md:col-span-2 bg-green-50 rounded p-4">
              <div className="flex justify-between text-base">
                <span className="font-medium text-green-800">Lương thực nhận (NET)</span>
                <span className="font-semibold text-green-900">{Number(detail?.payroll?.netSalary || detail?.netSalary || 0).toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="mt-2 text-xs text-gray-600">Công chuẩn: {Number(detail?.payroll?.workingDays || 0)} ngày ({Number(detail?.payroll?.workingDays || 0)*8} giờ) • Công thực tế: {Number(detail?.payroll?.actualWorkingDays || 0)} ngày</div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default Payslips


