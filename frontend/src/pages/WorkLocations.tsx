import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../services/api'
import { Plus, Edit, Trash2 } from 'lucide-react'

const WorkLocations = () => {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({})

  const { data: locations = [], isLoading } = useQuery('work-locations', async () => {
    const res = await api.get('/work-locations')
    return res.data
  })

  const saveMutation = useMutation(
    async (payload: any) => {
      if (editing) {
        return api.patch(`/work-locations/${editing.id}`, payload)
      }
      return api.post('/work-locations', payload)
    },
    {
      onSuccess: () => {
        setIsOpen(false)
        setEditing(null)
        setForm({})
        queryClient.invalidateQueries('work-locations')
      },
    }
  )

  const deleteMutation = useMutation(
    async (id: string) => api.delete(`/work-locations/${id}`),
    { onSuccess: () => queryClient.invalidateQueries('work-locations') }
  )

  const openCreate = () => {
    setEditing(null)
    setForm({ radius: 100 })
    setIsOpen(true)
  }

  const openEdit = async (loc: any) => {
    setEditing(loc)
    setForm({ ...loc })
    setIsOpen(true)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 rounded-full border-b-2 border-primary-600"/></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vị trí làm việc</h1>
          <p className="text-gray-600">Khai báo toạ độ và bán kính cho chấm công</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Thêm vị trí
        </button>
      </div>

      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>Tên</th>
                <th>Địa chỉ</th>
                <th>Lat</th>
                <th>Lng</th>
                <th>Radius (m)</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((loc: any) => (
                <tr key={loc.id} className="hover:bg-gray-50">
                  <td className="font-medium">{loc.name}</td>
                  <td>{loc.address || '-'}</td>
                  <td>{Number(loc.latitude).toFixed(6)}</td>
                  <td>{Number(loc.longitude).toFixed(6)}</td>
                  <td>{loc.radius}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-600" onClick={() => openEdit(loc)}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600" onClick={() => deleteMutation.mutate(loc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="card p-6 w-full max-w-lg bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? 'Cập nhật' : 'Thêm vị trí'}</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const payload = {
                  name: form.name,
                  address: form.address || undefined,
                  latitude: form.latitude ? Number(form.latitude) : undefined,
                  longitude: form.longitude ? Number(form.longitude) : undefined,
                  radius: form.radius ? Number(form.radius) : 100,
                }
                saveMutation.mutate(payload)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên</label>
                <input className="input mt-1" required defaultValue={form.name} onChange={(e)=>setForm((f:any)=>({...f, name:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                <input className="input mt-1" defaultValue={form.address || ''} onChange={(e)=>setForm((f:any)=>({...f, address:e.target.value}))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input className="input mt-1" required defaultValue={form.latitude} onChange={(e)=>setForm((f:any)=>({...f, latitude:e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input className="input mt-1" required defaultValue={form.longitude} onChange={(e)=>setForm((f:any)=>({...f, longitude:e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Radius (m)</label>
                  <input type="number" min={10} className="input mt-1" defaultValue={form.radius || 100} onChange={(e)=>setForm((f:any)=>({...f, radius:e.target.value}))} />
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

export default WorkLocations


