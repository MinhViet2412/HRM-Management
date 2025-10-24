import { useMemo, useState, ChangeEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { approveOvertime, createOvertime, getAssignedOvertime, getMyOvertime, rejectOvertime } from '../services/overtime'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function Overtime() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const isEmployee = user?.role === 'employee'
  const isApprover = user && (user.role === 'manager' || user.role === 'admin' || user.role === 'hr')
  const qc = useQueryClient()

  const [date, setDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')

  const myQuery = useQuery({
    queryKey: ['ot', 'me'],
    queryFn: getMyOvertime,
    enabled: !!isEmployee,
  })

  const assignedQuery = useQuery({
    queryKey: ['ot', 'assigned'],
    queryFn: getAssignedOvertime,
    enabled: !!isApprover,
  })


  const createMut = useMutation({
    mutationFn: createOvertime,
    onSuccess: () => {
      toast.success(t('overtime.createSuccess'))
      qc.invalidateQueries({ queryKey: ['ot', 'me'] })
      setReason('')
      setStartTime('')
      setEndTime('')
      setDate('')
    },
  })

  const approveMut = useMutation({
    mutationFn: (id: string) => approveOvertime(id),
    onSuccess: () => {
      toast.success(t('overtime.approveSuccess'))
      qc.invalidateQueries({ queryKey: ['ot', 'assigned'] })
    },
  })

  const rejectMut = useMutation({
    mutationFn: (vars: { id: string; reason?: string }) => rejectOvertime(vars.id, vars.reason),
    onSuccess: () => {
      toast.success(t('overtime.rejectSuccess'))
      qc.invalidateQueries({ queryKey: ['ot', 'assigned'] })
    },
  })

  const computedHours = useMemo(() => {
    if (!startTime || !endTime) return 0
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const diff = (eh * 60 + em) - (sh * 60 + sm)
    return Math.max(0, Math.round((diff / 60) * 100) / 100)
  }, [startTime, endTime])

  const canSubmit = useMemo(() => {
    return Boolean(date && startTime && endTime && computedHours > 0)
  }, [date, startTime, endTime, computedHours])

  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      {isEmployee && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{t('overtime.title')}</h2>
            <button className="px-3 py-2 rounded bg-primary-600 hover:bg-primary-700 text-white" onClick={() => setOpen(true)}>{t('overtime.createRequest')}</button>
          </div>

          {/* Dialog */}
          {open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
              <div className="relative bg-white w-full max-w-3xl rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">{t('overtime.createRequest')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('overtime.date')}</label>
              <input type="date" className="w-full border rounded px-3 py-2"
                value={date} onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('overtime.startTime')}</label>
              <input type="time" className="w-full border rounded px-3 py-2"
                value={startTime} onChange={(e: ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('overtime.endTime')}</label>
              <input type="time" className="w-full border rounded px-3 py-2"
                value={endTime} onChange={(e: ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('overtime.reason')} ({t('common.optional')})</label>
              <input className="w-full border rounded px-3 py-2" placeholder="Ví dụ: Giao dự án"
                value={reason} onChange={(e: ChangeEvent<HTMLInputElement>) => setReason(e.target.value)} />
            </div>
                  
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setOpen(false)}>{t('common.cancel')}</button>
                  <button disabled={!canSubmit || createMut.isLoading}
                    onClick={() => createMut.mutate({ date, startTime, endTime, reason: reason || undefined })}
                    className={`px-4 py-2 rounded text-white ${(!canSubmit || createMut.isLoading) ? 'bg-gray-300' : 'bg-primary-600 hover:bg-primary-700'}`}>
                    {createMut.isLoading ? t('common.creating') : t('overtime.createRequest')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isEmployee && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="text-base font-semibold mb-4">{t('overtime.myRequests')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">{t('overtime.date')}</th>
                  <th className="py-2">{t('overtime.startTime')}</th>
                  <th className="py-2">{t('overtime.endTime')}</th>
                  <th className="py-2">{t('overtime.hours')}</th>
                  <th className="py-2">{t('overtime.status')}</th>
                  <th className="py-2">{t('overtime.reason')}</th>
                </tr>
              </thead>
              <tbody>
                {myQuery.data?.map((r: any) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-2">{r.startTime}</td>
                    <td className="py-2">{r.endTime}</td>
                    <td className="py-2">{r.hours}</td>
                    <td className="py-2 capitalize">{r.status}</td>
                    <td className="py-2">{r.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isApprover && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="text-base font-semibold mb-4">{t('overtime.assignedRequests')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">{t('overtime.date')}</th>
                  <th className="py-2">{t('overtime.hours')}</th>
                  <th className="py-2">{t('overtime.reason')}</th>
                  <th className="py-2">{t('overtime.status')}</th>
                  <th className="py-2">{t('overtime.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {assignedQuery.data?.map((r: any) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-2">{r.startTime} - {r.endTime} ({r.hours}h)</td>
                    <td className="py-2">{r.reason || '-'}</td>
                    <td className="py-2 capitalize">{r.status}</td>
                    <td className="py-2 space-x-2">
                      <button className="px-3 py-1 rounded bg-primary-600 hover:bg-primary-700 text-white"
                        disabled={approveMut.isLoading}
                        onClick={() => approveMut.mutate(r.id)}>
                        {t('overtime.approve')}
                      </button>
                      <button className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                        disabled={rejectMut.isLoading}
                        onClick={() => {
                          const reason = window.prompt(t('overtime.rejectionReason') + '?') || undefined
                          rejectMut.mutate({ id: r.id, reason })
                        }}>
                        {t('overtime.reject')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


