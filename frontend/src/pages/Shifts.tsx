import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../services/api'
import { Plus, Edit, Trash2 } from 'lucide-react'

const Shifts = () => {
  const qc = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({})

  const { data: shifts = [], isLoading } = useQuery('shifts', async () => {
    const res = await api.get('/shifts')
    return res.data
  })

  const saveMutation = useMutation(
    async (payload: any) => {
      if (editing) return api.patch(`/shifts/${editing.id}`, payload)
      return api.post('/shifts', payload)
    },
    { onSuccess: () => { setIsOpen(false); setEditing(null); setForm({}); qc.invalidateQueries('shifts') } }
  )

  const deleteMutation = useMutation(
    async (id: string) => api.delete(`/shifts/${id}`),
    { onSuccess: () => qc.invalidateQueries('shifts') }
  )

  const openCreate = () => { setEditing(null); setForm({ startTime: '08:00', endTime: '17:00', lunchBreakStart: '12:00', lunchBreakEnd: '13:00' }); setIsOpen(true) }
  const openEdit = (s: any) => { setEditing(s); setForm({ ...s }); setIsOpen(true) }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 rounded-full border-b-2 border-primary-600"/></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ca chấm công</h1>
          <p className="text-gray-600">Quản lý tên ca và giờ bắt đầu/kết thúc</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={openCreate}><Plus className="h-4 w-4"/> Thêm ca</button>
      </div>

      <div className="card p-6">
        <table className="table">
          <thead className="bg-gray-50">
            <tr>
              <th>Tên ca</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Nghỉ trưa</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shifts.map((s:any)=> (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="font-medium">{s.name}</td>
                <td>{s.startTime}</td>
                <td>{s.endTime}</td>
                <td>
                  {s.lunchBreakStart && s.lunchBreakEnd ? (
                    <span className="text-sm text-gray-600">
                      {s.lunchBreakStart} - {s.lunchBreakEnd}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Không có</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-gray-600" onClick={()=>openEdit(s)}><Edit className="h-4 w-4"/></button>
                    <button className="text-gray-400 hover:text-red-600" onClick={()=>deleteMutation.mutate(s.id)}><Trash2 className="h-4 w-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="card p-6 w-full max-w-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? 'Cập nhật ca' : 'Thêm ca'}</h2>
              <button onClick={()=>setIsOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={(e)=>{ e.preventDefault(); saveMutation.mutate(form) }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên ca</label>
                <input className="input mt-1" required defaultValue={form.name} onChange={(e)=>setForm((f:any)=>({...f, name:e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bắt đầu</label>
                  <input type="time" className="input mt-1" required defaultValue={form.startTime} onChange={(e)=>setForm((f:any)=>({...f, startTime:e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kết thúc</label>
                  <input type="time" className="input mt-1" required defaultValue={form.endTime} onChange={(e)=>setForm((f:any)=>({...f, endTime:e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bắt đầu nghỉ trưa</label>
                  <input type="time" className="input mt-1" defaultValue={form.lunchBreakStart} onChange={(e)=>setForm((f:any)=>({...f, lunchBreakStart:e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kết thúc nghỉ trưa</label>
                  <input type="time" className="input mt-1" defaultValue={form.lunchBreakEnd} onChange={(e)=>setForm((f:any)=>({...f, lunchBreakEnd:e.target.value}))} />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" className="btn btn-secondary" onClick={()=>setIsOpen(false)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saveMutation.isLoading}>{editing ? 'Lưu' : 'Tạo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shifts


