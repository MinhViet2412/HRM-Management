import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import api from '../services/api'

const Departments = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [form, setForm] = useState<any>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [filterName, setFilterName] = useState<string>('')

  const { data: departments, isLoading } = useQuery('departments', async () => {
    const res = await api.get('/departments')
    return res.data
  })

  // Filter departments based on selected name
  const filteredDepartments = departments?.filter((dept: any) => {
    const nameMatch = !filterName || dept.name === filterName
    return nameMatch
  }) || []

  // const fetchById = async (id: string) => {
  //   const res = await api.get(`/departments/${id}`)
  //   return res.data
  // }

  const createMutation = useMutation((payload: any) => api.post('/departments', payload), {
    onSuccess: () => {
      setForm({})
      setIsCreateOpen(false)
      queryClient.invalidateQueries('departments')
    },
  })

  const updateMutation = useMutation(({ id, payload }: any) => api.patch(`/departments/${id}`, payload), {
    onSuccess: () => {
      setEditingId(null)
      setIsEditOpen(false)
      setForm({})
      queryClient.invalidateQueries('departments')
    },
  })

  const deleteMutation = useMutation((id: string) => api.delete(`/departments/${id}`), {
    onSuccess: () => {
      toast.success('Department deleted')
      queryClient.invalidateQueries('departments')
    },
  })

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { code: form.code, name: form.name }
    createMutation.mutate(payload)
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('departments.pageTitle')}</h1>
      </div>

      {/* Combined Filter and Create/Edit Section */}
      <div className="card p-6">
        {/* Filter Section */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo tên phòng ban</label>
              <select 
                className="input w-full" 
                value={filterName} 
                onChange={(e) => setFilterName(e.target.value)}
              >
                <option value="">Tất cả phòng ban</option>
                <option value="Operations">Operations</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Research & Development">Research & Development</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setForm({}); setIsCreateOpen(true) }}
                className="btn btn-primary order-1 md:order-2"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Departments List */}
      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>{t('common.code')}</th>
                <th>{t('common.name')}</th>
                <th>{t('common.description')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepartments?.map((d:any)=> (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="font-medium">{d.code}</td>
                  <td>{d.name}</td>
                  <td>{d.description || '-'}</td>
                  <td className="space-x-2">
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      title="Edit"
                      aria-label="Edit department"
                      onClick={() => {
                        setEditingId(d.id)
                        setForm({ code: d.code, name: d.name })
                        setIsEditOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600" title="Delete" aria-label="Delete department" onClick={()=>{
                      if (confirm('Delete this department?')) deleteMutation.mutate(d.id)
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDepartments?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {filterName ? `Không tìm thấy phòng ban phù hợp` : 'Không có phòng ban nào'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Department Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="text-lg font-semibold">Tạo phòng ban</h3>
            </div>
            <form onSubmit={onCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã phòng ban</label>
                <input
                  className="input w-full"
                  required
                  value={form.code || ''}
                  onChange={(e)=>setForm((f:any)=>({...f, code:e.target.value}))}
                  placeholder="Nhập mã phòng ban..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng ban</label>
                <input
                  className="input w-full"
                  required
                  value={form.name || ''}
                  onChange={(e)=>setForm((f:any)=>({...f, name:e.target.value}))}
                  placeholder="Nhập tên phòng ban..."
                />
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

      {/* Edit Department Modal */}
      {isEditOpen && editingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="text-lg font-semibold">Sửa phòng ban</h3>
            </div>
            <form onSubmit={(e)=>{e.preventDefault(); updateMutation.mutate({ id: editingId, payload: { code: form.code, name: form.name } })}} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã phòng ban</label>
                <input
                  className="input w-full"
                  required
                  value={form.code || ''}
                  onChange={(e)=>setForm((f:any)=>({...f, code:e.target.value}))}
                  placeholder="Nhập mã phòng ban..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng ban</label>
                <input
                  className="input w-full"
                  required
                  value={form.name || ''}
                  onChange={(e)=>setForm((f:any)=>({...f, name:e.target.value}))}
                  placeholder="Nhập tên phòng ban..."
                />
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

export default Departments


