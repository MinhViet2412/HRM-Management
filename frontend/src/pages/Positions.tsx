import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import api from '../services/api'

const Positions = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [form, setForm] = useState<any>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [filterTitle, setFilterTitle] = useState<string>('')
  const { data: departments } = useQuery('departments', async () => {
    const res = await api.get('/departments')
    return res.data
  })

  const { data: positions, isLoading } = useQuery('positions', async () => {
    const res = await api.get('/positions')
    return res.data
  })

  // Filter positions based on selected title
  const filteredPositions = positions?.filter((pos: any) => {
    if (!filterTitle) return true
    return pos.title === filterTitle
  }) || []

  // const fetchById = async (id: string) => {
  //   const res = await api.get(`/positions/${id}`)
  //   return res.data
  // }

  const createMutation = useMutation((payload: any) => api.post('/positions', payload), {
    onSuccess: () => {
      setForm({})
      setIsCreateOpen(false)
      queryClient.invalidateQueries('positions')
    },
  })

  const updateMutation = useMutation(({ id, payload }: any) => api.patch(`/positions/${id}`, payload), {
    onSuccess: () => {
      setEditingId(null)
      setIsEditOpen(false)
      setForm({})
      queryClient.invalidateQueries('positions')
      toast.success('Cập nhật vị trí thành công')
    },
    onError: () => { toast.error('Cập nhật vị trí thất bại') }
  })

  const deleteMutation = useMutation((id: string) => api.delete(`/positions/${id}`), {
    onSuccess: () => {
      toast.success('Position deleted')
      queryClient.invalidateQueries('positions')
    },
  })

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = { code: form.code, title: form.title }
    if (form.departmentId) payload.departmentId = form.departmentId
    createMutation.mutate(payload)
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('positions.pageTitle')}</h1>
      </div>

      <div className="card p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo chức danh</label>
              <select 
                className="input w-full" 
                value={filterTitle} 
                onChange={(e) => setFilterTitle(e.target.value)}
              >
                <option value="">Tất cả chức danh</option>
                <option value="Software Developer">Software Developer</option>
                <option value="Senior Software Developer">Senior Software Developer</option>
                <option value="Manager">Manager</option>
                <option value="HR Specialist">HR Specialist</option>
                <option value="Accountant">Accountant</option>
                <option value="Marketing Specialist">Marketing Specialist</option>
                <option value="Sales Representative">Sales Representative</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Business Analyst">Business Analyst</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => { setForm({}); setIsCreateOpen(true) }}
              className="btn btn-primary"
            >
              Tạo
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>{t('common.code')}</th>
                <th>{t('common.title')}</th>
                <th>{t('employees.department')}</th>
                <th>{t('employees.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPositions?.map((p:any)=> (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="font-medium">{p.code}</td>
                  <td>{p.title}</td>
                  <td>{departments?.find((d:any)=> d.id === p.departmentId)?.name || '-'}</td>
                  <td className="space-x-2">
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      title="Edit"
                      aria-label="Edit position"
                      onClick={() => {
                        setEditingId(p.id)
                        setForm({ code: p.code, title: p.title, departmentId: p.departmentId })
                        setIsEditOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600" title="Delete" aria-label="Delete position" onClick={()=>{
                      if (confirm('Delete this position?')) deleteMutation.mutate(p.id)
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPositions?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {filterTitle ? `Không tìm thấy vị trí "${filterTitle}"` : 'Không có vị trí nào'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Position Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="text-lg font-semibold">Tạo vị trí công việc</h3>
            </div>
            <form onSubmit={onCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã vị trí</label>
                <input
                  className="input w-full"
                  required
                  value={form.code || ''}
                  onChange={(e)=>setForm((f:any)=>({...f, code:e.target.value}))}
                  placeholder="Nhập mã vị trí..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                <select
                  className="input w-full"
                  value={form.departmentId || ''}
                  onChange={(e)=>setForm((f:any)=>({...f, departmentId: e.target.value }))}
                >
                  <option value="">Chọn phòng ban</option>
                  {departments?.map((d:any)=> (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chức danh</label>
                <select
                  className="input w-full"
                  required
                  value={form.title || ''}
                  onChange={(e)=>setForm((f:any)=>({...f, title:e.target.value}))}
                >
                  <option value="">Chọn chức danh</option>
                  <option value="Software Developer">Software Developer</option>
                  <option value="Senior Software Developer">Senior Software Developer</option>
                  <option value="Manager">Manager</option>
                  <option value="HR Specialist">HR Specialist</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Marketing Specialist">Marketing Specialist</option>
                  <option value="Sales Representative">Sales Representative</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Business Analyst">Business Analyst</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" className="btn btn-secondary" onClick={()=>{ setIsCreateOpen(false); setForm({}) }}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? 'Đang tạo...' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Position Modal */}
      {isEditOpen && editingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="text-lg font-semibold">Sửa vị trí công việc</h3>
            </div>
            <form
              onSubmit={(e)=>{
                e.preventDefault()
                const payload: any = { code: form.code, title: form.title }
                if (form.departmentId) payload.departmentId = form.departmentId
                updateMutation.mutate({ id: editingId, payload })
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã vị trí</label>
                <input
                  className="input w-full"
                  required
                  value={form.code || ''}
                  onChange={(e)=>setForm((f:any)=>({...f, code:e.target.value}))}
                  placeholder="Nhập mã vị trí..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                <select
                  className="input w-full"
                  value={form.departmentId || ''}
                  onChange={(e)=>setForm((f:any)=>({...f, departmentId: e.target.value }))}
                >
                  <option value="">Chọn phòng ban</option>
                  {departments?.map((d:any)=> (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chức danh</label>
                <select
                  className="input w-full"
                  required
                  value={form.title || ''}
                  onChange={(e)=>setForm((f:any)=>({...f, title:e.target.value}))}
                >
                  <option value="">Chọn chức danh</option>
                  <option value="Software Developer">Software Developer</option>
                  <option value="Senior Software Developer">Senior Software Developer</option>
                  <option value="Manager">Manager</option>
                  <option value="HR Specialist">HR Specialist</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Marketing Specialist">Marketing Specialist</option>
                  <option value="Sales Representative">Sales Representative</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Business Analyst">Business Analyst</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" className="btn btn-secondary" onClick={()=>{ setIsEditOpen(false); setForm({}); setEditingId(null) }}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={updateMutation.isLoading}>
                  {updateMutation.isLoading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Positions


